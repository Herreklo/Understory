// Readers for the scoreboard. Each predicts a decision from what the witness could know; none reads hidden state.
// Pure: no reader touches the world's random stream, so switching the scoreboard on never changes a history.

import { score, witnessView, seenBy, type Option, type View } from '../decide';
import { peekBond, belief, type World, type Person } from '../world';
import { hash } from '../rng';
import { knows } from '../witness';

// The witness cannot see how erratic someone is; readers use the population's typical value.
const TYPICAL_VARIABILITY = 0.7;

// One kind of situation, whatever its particulars: "a want: to leave" and "a want: to sing" are both "a want".
export const triggerKey = (t: string) => t.replace(/@\d+/g, '@').replace(/:.*$/, '').trim();

// The base rate: how often each answer is chosen to each kind of situation, learned on other worlds.
export type BaseTable = Map<string, Map<string, number>>;
export function learnBase(table: BaseTable, trigger: string, chosen: string) {
  const k = triggerKey(trigger);
  const m = table.get(k) ?? new Map();
  m.set(chosen, (m.get(chosen) ?? 0) + 1);
  table.set(k, m);
}
function baseGuess(table: BaseTable, trigger: string, options: Option[]): string {
  const m = table.get(triggerKey(trigger));
  let best = options[0].id,
    bn = -1;
  for (const o of options) {
    const n = m?.get(o.id) ?? 0;
    if (n > bn) {
      bn = n;
      best = o.id;
    }
  }
  return best;
}
// Base-rate probabilities over the options on offer, smoothed so an unseen answer is unlikely, never impossible.
function baseProbs(table: BaseTable, trigger: string, options: Option[]): Map<string, number> {
  const m = table.get(triggerKey(trigger));
  const n = options.map(o => (m?.get(o.id) ?? 0) + 1);
  const tot = n.reduce((s, x) => s + x, 0);
  return new Map(options.map((o, i) => [o.id, n[i] / tot]));
}
// The calibrated witness: start from what people usually do here, then shift by how this person differs from an average one.
// posterior ∝ base rate × (what the witness's beliefs predict ÷ what an average person would do). Knowing nothing, it is the base rate.
function calibrated(base: Map<string, number>, wit: { id: string; p: number }[], sit: { id: string; p: number }[]): { id: string; p: number }[] {
  const sp = new Map(sit.map(o => [o.id, o.p]));
  const raw = wit.map(o => ({ id: o.id, p: (base.get(o.id)! * Math.max(1e-4, o.p)) / Math.max(1e-4, sp.get(o.id)!) }));
  const tot = raw.reduce((s, o) => s + o.p, 0);
  return raw.map(o => ({ id: o.id, p: o.p / tot }));
}
// Proper scoring rules, so a reader is judged on the whole probability it gives, not only on its best guess.
// Brier (multiclass): sum over options of (p - outcome)^2; 0 is perfect, a coin flip on two options scores 0.5. Log loss: -ln p(chosen).
export const brier = (ps: { id: string; p: number }[], chosen: string) => ps.reduce((s, o) => s + (o.p - (o.id === chosen ? 1 : 0)) ** 2, 0);
export const logloss = (ps: { id: string; p: number }[], chosen: string) => -Math.log(Math.max(1e-4, ps.find(o => o.id === chosen)?.p ?? 1e-4));

// Swapped beliefs: the witness's view, but every belief about this person is read from the beliefs it holds about a different known person.
// If predictions depend on person-specific knowledge, this reader falls to about the base rate.
function swappedView(w: World, holder: number, from: number): View {
  const v = witnessView(w, holder);
  const stand = w.byId.get(from)!;
  return {
    ...v,
    facet: (p, k, t, f) => (p.id === holder ? v.facet(p, k, t, f) : v.facet(stand, k, t, f)),
    value: (p, k) => (p.id === holder ? v.value(p, k) : v.value(stand, k)),
  };
}
// The null control (round M26): for each decision, another person the witness holds settled beliefs about, drawn afresh (hash-keyed).
function donorFor(w: World, holder: number, subject: number, key: string): number | undefined {
  const bm = w.beliefs.get(holder);
  if (!bm) return undefined;
  const ids = new Set<number>();
  for (const [k, b] of bm) {
    if (b.n < 2) continue;
    const sid = +k.split('|')[0];
    if (sid !== holder && sid !== subject && w.byId.get(sid)?.status === 'in') ids.add(sid);
  }
  const list = [...ids].sort((a, b) => a - b);
  return list.length ? list[hash(w.seed, w.t, subject, key) % list.length] : undefined;
}
// Someone else the witness knows about as well as this person: the known person with the nearest number of settled beliefs.
function standIn(w: World, holder: number, subject: number): number | undefined {
  const bm = w.beliefs.get(holder);
  if (!bm) return undefined;
  const counts = new Map<number, number>();
  for (const [k, b] of bm) {
    if (b.n < 2) continue;
    const sid = +k.split('|')[0];
    if (sid === holder) continue;
    counts.set(sid, (counts.get(sid) ?? 0) + 1);
  }
  const mine = counts.get(subject) ?? 0;
  let best: number | undefined,
    bd = Infinity;
  for (const [sid, n] of counts) {
    if (sid === subject || n < 3 || w.byId.get(sid)?.status !== 'in') continue;
    const d = Math.abs(n - mine) + (sid % 7) / 10;
    if (d < bd) {
      bd = d;
      best = sid;
    }
  }
  return best;
}

// The tendency learner: character-blind and person-aware. It counts how often this person gives each kind of answer (the family), across every
// kind of situation it has learned of, and predicts a new situation by base rate × (this person's rate of that answer ÷ the town's rate).
// It never looks at traits. It transfers across situations through the shared answer kinds, which the notebook cannot.
// Besides exact answer kinds, it generalises along two broad axes a layperson would use: does this person act or hold back, and do they
// put others or themselves first. Each answer kind maps to a position on each axis; the person's observed lean on an axis shifts every
// answer kind on it. This is the strongest character-blind learner we could think of that still uses only what the witness learned of.
const AXES: Record<string, [number, number]> = {
  // [assertive, prosocial]
  anger: [1, -1],
  withdrawal: [-1, 0],
  seeking: [0.5, 0],
  honesty: [0.5, 1],
  dishonesty: [0, -1],
  generosity: [0.5, 1],
  refusal: [0, -1],
  courage: [1, 0.5],
  caution: [-1, 0],
  pride: [1, -0.5],
  humility: [-1, 0.5],
  duty: [0.5, 1],
  lapse: [-0.5, -1],
  discretion: [-0.5, 0.5],
  disclosure: [0.5, -0.5],
  openness: [1, 0],
  reluctance: [-1, 0],
  leniency: [-0.5, 1],
  severity: [0.5, -1],
  warmth: [0.5, 1],
};
export class Tendencies {
  person = new Map<number, Map<string, number>>();
  town = new Map<string, number>();
  townN = 0;
  axis = new Map<number, { a: number; s: number; n: number }>();
  townAxis = { a: 0, s: 0, n: 0 };
  learn(subject: number, fam: string) {
    const m = this.person.get(subject) ?? new Map();
    m.set(fam, (m.get(fam) ?? 0) + 1);
    this.person.set(subject, m);
    this.town.set(fam, (this.town.get(fam) ?? 0) + 1);
    this.townN++;
    const ax = AXES[fam];
    if (ax) {
      const r = this.axis.get(subject) ?? { a: 0, s: 0, n: 0 };
      r.a += ax[0];
      r.s += ax[1];
      r.n++;
      this.axis.set(subject, r);
      this.townAxis.a += ax[0];
      this.townAxis.s += ax[1];
      this.townAxis.n++;
    }
  }
  known(subject: number, options: Option[]) {
    const m = this.person.get(subject);
    let n = 0;
    if (m) for (const o of options) n += m.get(o.id) ?? 0;
    return n;
  }
  predict(subject: number, base: Map<string, number>, options: Option[]): { id: string; p: number }[] {
    const m = this.person.get(subject);
    let n = 0;
    if (m) for (const v of m.values()) n += v;
    // The person's lean on each axis relative to the town, shrunk toward zero with three pseudo-observations.
    const r = this.axis.get(subject);
    const ta = this.townAxis.n ? this.townAxis.a / this.townAxis.n : 0,
      ts = this.townAxis.n ? this.townAxis.s / this.townAxis.n : 0;
    const leanA = r ? (r.a - ta * r.n) / (r.n + 3) : 0,
      leanS = r ? (r.s - ts * r.n) / (r.n + 3) : 0;
    const raw = options.map(o => {
      const townRate = ((this.town.get(o.id) ?? 0) + 1) / (this.townN + options.length);
      const mine = ((m?.get(o.id) ?? 0) + 2 * townRate) / (n + 2); // exact answer kind, shrunk toward the town
      const ax = AXES[o.id] ?? [0, 0];
      const axisShift = Math.exp(0.8 * (ax[0] * leanA + ax[1] * leanS)); // a person who leans assertive is likelier to give assertive answers
      return { id: o.id, p: base.get(o.id)! * (mine / townRate) * axisShift };
    });
    const tot = raw.reduce((s, o) => s + o.p, 0);
    return raw.map(o => ({ id: o.id, p: o.p / tot }));
  }
}

// The situation reader: sees circumstances and bonds as the witness does, and assumes everyone is average.
function situationView(w: World, holder: number): View {
  const v = witnessView(w, holder);
  return { ...v, facet: (p, k, t, f) => (p.id === holder ? v.facet(p, k, t, f) : 0), value: (p, k) => (p.id === holder ? v.value(p, k) : 0) };
}

function argmax(ps: { id: string; p: number }[]) {
  return ps.slice().sort((a, b) => b.p - a.p)[0].id;
}

// The notebook: the last time the witness saw this person answer this kind of situation.
function notebook(w: World, p: Person, trigger: string): string | undefined {
  const l = w.decIdx.get(p.id);
  if (!l || w.witness == null) return undefined;
  const k = triggerKey(trigger);
  for (let i = l.length - 1; i >= 0; i--) {
    const e = w.events[l[i]];
    if (e.t >= w.t) continue; // not this decision, nor one at the same moment the witness couldn't have heard of yet
    if (triggerKey(e.decision!.trigger) !== k) continue;
    if (e.knownBy.has(w.witness) || e.who.includes(w.witness)) return e.decision!.chosen;
  }
  return undefined;
}

// Probability each reader gave the chosen option, and its Brier score, so scoring rules can be reported beside accuracy.
export interface Probs {
  base: number;
  sit: number;
  wit: number;
  cal: number;
  text: number;
  comb: number;
  swap: number;
  tend: number;
  mind: number;
}
export const TEXT_HOLDER = -2; // a virtual observer: the witness's beliefs rebuilt from text-carrying evidence only (what a player reading the felt history could hold)
export interface TopP {
  base: number;
  cal: number;
  text: number;
}
export interface Guesses {
  top: TopP;
  trigger: string;
  chosen: string;
  n: number;
  base: string;
  sit: string;
  sitTop: number;
  note?: string;
  noteOrBase: string;
  wit: string;
  cal: string;
  text: string;
  comb: string;
  swap: string;
  donor: string;
  tend: string;
  oracle: string;
  mind: string;
  known: boolean;
  close: boolean;
  novel: boolean;
  contested: boolean;
  tendBlind: boolean;
  p: Probs;
  b: Probs;
  rec?: any;
  seen?: boolean;
}

export function makePredictor(table: BaseTable, sink: (w: World, g: Guesses) => void, tend: Tendencies = new Tendencies()) {
  return (w: World, p: Person, truth: Option[], chosenId: string, rec: any) => {
    if (w.witness == null || w.witness === p.id || truth.length < 2) return;
    const h = w.witness;
    const options = seenBy(truth);
    const base = baseGuess(table, rec.trigger, options);
    const sitScored = score(options, situationView(w, h), TYPICAL_VARIABILITY);
    const sit = argmax(sitScored);
    const sitTop = Math.max(...sitScored.map(o => o.p));
    const witScored = score(options, witnessView(w, h), TYPICAL_VARIABILITY);
    const wit = argmax(witScored);
    const bp = baseProbs(table, rec.trigger, options);
    const calP = calibrated(bp, witScored, sitScored);
    const cal = argmax(calP);
    const textP = calibrated(bp, score(options, witnessView(w, TEXT_HOLDER), TYPICAL_VARIABILITY), sitScored);
    const text = argmax(textP);
    const si = standIn(w, h, p.id);
    const swapP = si != null ? calibrated(bp, score(options, swappedView(w, h, si), TYPICAL_VARIABILITY), sitScored) : calP;
    const swap = argmax(swapP);
    const di = donorFor(w, h, p.id, rec.trigger);
    const donorP = di != null ? calibrated(bp, score(options, swappedView(w, h, di), TYPICAL_VARIABILITY), sitScored) : calP;
    const donor = argmax(donorP);
    const tendP = tend.predict(p.id, bp, options);
    const tendG = argmax(tendP);
    const baseP = options.map(o => ({ id: o.id, p: bp.get(o.id)! }));
    // Diagnostic only, never a player's reader: the witness's view, but with the person's true general traits and values.
    // The gap from the calibrated witness to here is what better coverage could win; the gap from here to the mind-reader is hidden circumstance, if-thens and chance.
    const ov = witnessView(w, h);
    const oracle = argmax(
      calibrated(
        bp,
        score(
          options,
          { ...ov, facet: (q, k, t, f) => (q.id === h ? ov.facet(q, k, t, f) : (q.facets[k] ?? 0)), value: (q, k) => q.values[k] ?? 0 },
          TYPICAL_VARIABILITY,
        ),
        sitScored,
      ),
    );
    const mind = argmax(rec.options);
    const note = notebook(w, p, rec.trigger);
    // The combined reader: character, plus what the witness last saw this person do in this exact kind of situation, taken as one more piece of evidence (likelihood ratio 2).
    const combRaw = calP.map(o => ({ id: o.id, p: o.p * (o.id === note ? 2 : 1) }));
    const ct = combRaw.reduce((s, o) => s + o.p, 0);
    const combP = combRaw.map(o => ({ id: o.id, p: o.p / ct }));
    const comb = argmax(combP);
    const fam = peekBond(w, h, p.id)?.fam ?? 0;
    const pc = (ps: { id: string; p: number }[]) => ps.find(o => o.id === chosenId)?.p ?? 0;
    const mindP = rec.options as { id: string; p: number }[];
    const topOf = (ps: { id: string; p: number }[]) => Math.max(...ps.map(o => o.p));
    sink(w, {
      top: { base: topOf(baseP), cal: topOf(calP), text: topOf(textP) },
      trigger: triggerKey(rec.trigger),
      chosen: chosenId,
      n: options.length,
      base,
      sit,
      sitTop,
      note,
      noteOrBase: note ?? base,
      wit,
      cal,
      text,
      comb,
      swap,
      donor,
      tend: tendG,
      oracle,
      mind,
      known: knows(w, p.id),
      close: fam > 0.4,
      novel: note === undefined,
      contested: sitTop < 0.65,
      tendBlind: tend.known(p.id, options) === 0,
      p: {
        base: pc(baseP),
        sit: pc(sitScored),
        wit: pc(witScored),
        cal: pc(calP),
        text: pc(textP),
        comb: pc(combP),
        swap: pc(swapP),
        tend: pc(tendP),
        mind: pc(mindP),
      },
      b: {
        base: brier(baseP, chosenId),
        sit: brier(sitScored, chosenId),
        wit: brier(witScored, chosenId),
        cal: brier(calP, chosenId),
        text: brier(textP, chosenId),
        comb: brier(combP, chosenId),
        swap: brier(swapP, chosenId),
        tend: brier(tendP, chosenId),
        mind: brier(mindP, chosenId),
      },
      rec,
    });
  };
}
