// The Situation Grammar: types matched against the world, answered through behaviour families.
// Every instance becomes an event with causes and evidence. Nothing here is a scene.

import { withAccounts } from './telling';
import { withCarry, carryAct } from './carry';
import { clamp, hash } from './rng';
import { FACET_BY_ID, VALUES } from './core';
import { ACTIVATION, type Feature } from './features';
import { BY_FAMILY, type Expression, type Family } from './families';
import { threadStep, openedUp } from './threads';
import {
  OFF,
  plasticity,
  type World,
  type Person,
  type Cause,
  type Event,
  type Evidence,
  age,
  P,
  facet,
  bond,
  remember,
  addEvent,
  broadcast,
  year,
} from './world';
import { jobSet } from './scale';
import {
  score,
  choose,
  reasons,
  honestWhy,
  truthView,
  witnessView,
  traitOnlyView,
  circOnlyView,
  curves,
  seenBy,
  type Option,
  type Consideration,
  type View,
} from './decide';
import { traitCause, stateCause, eventCause, ev, facetC, pubC, bondC, lastTime, learned, chanceOf } from './considerations';
import { strain } from './situations/strain';

export const VN = Object.fromEntries(VALUES.map(v => [v.id, v.name]));
export const TYPICAL_VARIABILITY = 0.7; // what a witness assumes about how erratic anyone is; the true value is hidden
export const self = (p: Person) => (p.sex === 'f' ? 'herself' : 'himself');

export interface Instance {
  type: string;
  actor: Person;
  target?: Person;
  others: Person[];
  thing: string; // filler, with @id tokens allowed
  features: Set<Feature>;
  families: Family[]; // allowed answers
  extra?: Consideration[]; // type-specific considerations added to every option
  familyExtra?: Partial<Record<Family, Consideration[]>>; // considerations for one family only
  cause?: number; // the event that produced this situation
  causeLabel?: string;
  place?: string;
  w?: number;
  maxIntensity?: number;
  minIntensity?: number;
  only?: Partial<Record<Family, string[]>>; // restrict a family to these expressions
  ownFirst?: boolean; // the situation's own considerations come before the trait wiring, so none of them is cut at five
  where?: string; // where it happened, said at the § in the act's words or at the end of the sentence
}

export function decide(w: World, p: Person, trigger: string, options: Option[]) {
  for (const o of options) for (const c of o.considerations) if (!c.who) c.who = p;
  withAccounts(w, p, options);
  const scored = score(options, truthView(w), p.variability);
  const chosen = choose(scored, chanceOf(w, p), { t: w.t, who: p.id, kind: trigger, nudge: () => w.rng.next() });
  const why = reasons(chosen, scored, truthView(w));
  const rec: any = { trigger, person: p.id, options: scored.map(o => ({ id: o.id, label: o.label, p: o.p, score: o.score })), chosen: chosen.id };
  const top = why.find(c => c.key && !c.key.startsWith('against:'))?.key;
  rec.honest = honestWhy(truthView(w), options, p.variability, chosen.id, top);
  recordStats(w, p, options, chosen.id, rec);
  return { chosen: chosen.id, why, rec };
}
function recordStats(w: World, p: Person, options: Option[], chosenId: string, rec: any) {
  if (w.t < w.startPresent) return;
  w.stats.decisions++;
  if (rec.honest != null) {
    w.stats.honestN++;
    if (rec.honest) w.stats.honest++;
  }
  if (w.witness != null && w.witness !== p.id) {
    // The in-engine witness: evidence-limited, like the scoreboard's. It cannot know how erratic a person is, so it uses the population's typical variability.
    const ws = score(seenBy(options), witnessView(w, w.witness), TYPICAL_VARIABILITY);
    rec.pWitness = ws.find(o => o.id === chosenId)!.p;
    rec.witnessGuess = ws.slice().sort((a, b) => b.p - a.p)[0].id;
    const hit = rec.witnessGuess === chosenId;
    w.stats.witnessN++;
    if (hit) w.stats.witnessRight++;
    const keys = new Set<string>();
    for (const o of options) for (const c of o.considerations) if (FACET_BY_ID[c.id]) keys.add(c.id);
    let have = 0;
    for (const k of keys) {
      const b = w.beliefs.get(w.witness)?.get(`${p.id}|${k}`);
      if (b && b.n > 0) have++;
    }
    rec.facetsRead = [...keys];
    rec.facetsKnown = have;
    rec.traitGuess = score(options, traitOnlyView(w), TYPICAL_VARIABILITY)
      .slice()
      .sort((a, b) => b.p - a.p)[0].id; // diagnostic: true general traits
    rec.circGuess = score(seenBy(options), circOnlyView(w), TYPICAL_VARIABILITY)
      .slice()
      .sort((a, b) => b.p - a.p)[0].id; // diagnostic: circumstances only
    const bm = w.beliefs.get(w.witness);
    let n = 0;
    if (bm) for (const [k, b] of bm) if (k.startsWith(p.id + '|') && b.n >= 2) n++;
    if (n >= 3) {
      w.stats.knownN++;
      if (hit) w.stats.knownRight++;
    }
  }
  {
    const trig = rec.trigger
      .replace(/:.*$/, '')
      .replace(/^a want.*/, 'want')
      .replace(/^whether to go on.*/, 'go on');
    const norms = (w.stats as any).norms ?? ((w.stats as any).norms = new Map<string, Map<string, number>>());
    const nm: Map<string, number> = norms.get(trig) ?? new Map();
    nm.set(chosenId, (nm.get(chosenId) ?? 0) + 1);
    norms.set(trig, nm);
  }
  w.hooks.predict?.(w, p, options, chosenId, rec);
}

// ---------- identity: which families confirm which self-stories ----------
const FAMILY_IDENTITY: Partial<Record<Family, { yes?: string[]; no?: string[] }>> = {
  honesty: { yes: ['honest'] },
  dishonesty: { no: ['honest'] },
  generosity: { yes: ['kind'] },
  refusal: { no: ['kind'] },
  warmth: { yes: ['kind'] },
  leniency: { yes: ['kind'] },
  courage: { yes: ['brave'] },
  caution: { no: ['brave'] },
  duty: { yes: ['reliable'] },
  lapse: { no: ['reliable'] },
  discretion: { yes: ['reliable', 'honest'] },
  pride: { yes: ['proud'] },
  humility: { no: ['proud'] },
  withdrawal: { yes: ['self-reliant'] },
  seeking: { no: ['self-reliant'] },
  openness: { yes: ['free'], no: ['rooted'] },
  reluctance: { yes: ['rooted'], no: ['free'] },
  anger: { no: ['steady'] },
  severity: { no: ['kind'] },
};
export function identityC(p: Person, fam: Family): Consideration | null {
  const m = FAMILY_IDENTITY[fam];
  if (!m || !p.selfStory.length || OFF.has('selfstory')) return null;
  // The strongest entry speaks, whichever way it points.
  const pick = () => {
    let best = 0,
      text = '';
    for (const s of p.selfStory) {
      if (m.yes?.includes(s.key) && s.weight > Math.abs(best)) {
        best = s.weight;
        text = s.text;
      }
      if (m.no?.includes(s.key) && s.weight > Math.abs(best)) {
        best = -s.weight;
        text = s.text;
      }
    }
    return { best, text };
  };
  const { best, text } = pick();
  if (!best) return null;
  const x = best > 0 ? 0.5 + best * 0.5 : 0.5 - Math.abs(best) * 0.45;
  return {
    id: 'identity',
    cause: () => ({
      kind: 'state',
      label: best > 0 ? `that is who @${p.id} is: ${text}` : `not who @${p.id} thinks ${p.sex === 'f' ? 'she' : 'he'} is: ${text}`,
      weight: 1,
      who: p.id,
    }),
    input: v => v.state(p, 'close', x, 0.5),
    curve: curves.rising(0.3, 1),
    neutral: 0.5,
    know: 'close',
    who: p,
  };
}

// ---------- wiring: considerations generated from features and family ----------
// Each family has a few facets that most decide it; the features add theirs. Capped at four per option.
export const FAMILY_FACETS: Record<Family, Partial<Record<string, number>>> = {
  anger: { patience: -1, forgiveness: -0.5 },
  withdrawal: { sociability: -0.8, dependence: -0.5 },
  seeking: { dependence: 1 },
  honesty: { fairness: 0.8, sincerity: 0.6 },
  dishonesty: { fairness: -1, sincerity: -0.6 },
  generosity: { altruism: 1 },
  refusal: { altruism: -1 },
  courage: { fearfulness: -0.8, socialBoldness: 0.6 },
  caution: { fearfulness: 0.8, prudence: 0.5 },
  pride: { modesty: -1, flexibility: -0.4 },
  humility: { modesty: 0.8, patience: 0.5, flexibility: 0.4 },
  duty: { organisation: 0.8 },
  lapse: { organisation: -0.8 },
  discretion: { sincerity: 0.6 },
  disclosure: { sociability: 0.7, sincerity: -0.5 },
  openness: { inquisitiveness: 0.8 },
  reluctance: { sentimentality: 0.8 },
  leniency: { altruism: 0.7, gentleness: 0.5 },
  severity: { gentleness: -1 },
  warmth: { gentleness: 0.6, altruism: 0.5 },
};
export function wiringC(p: Person, fam: Family, feats: Set<Feature>, toward?: number): Consideration[] {
  const weights: Record<string, number> = {};
  for (const k in FAMILY_FACETS[fam]) weights[k] = (weights[k] ?? 0) + FAMILY_FACETS[fam][k]!;
  // Features add the facets they activate, in the direction of "acting" (positive families act; their mirrors invert).
  const acting = [
    'anger',
    'seeking',
    'dishonesty',
    'generosity',
    'courage',
    'pride',
    'duty',
    'disclosure',
    'openness',
    'severity',
    'warmth',
  ].includes(fam)
    ? 1
    : -1;
  // The money feature describes taking (the greedy take); when the act is giving, it pulls the other way.
  const giving = fam === 'generosity' || fam === 'refusal';
  for (const f of feats) {
    const act = ACTIVATION[f];
    if (!act) continue;
    for (const k in act) {
      if (k === 'lovedOnes') continue;
      weights[k] = (weights[k] ?? 0) + act[k]! * acting * 0.5 * (giving && f === 'money' ? -1 : 1);
    }
  }
  return Object.entries(weights)
    .filter(([, v]) => Math.abs(v) >= 0.4)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([k, v]) => facetC(p, k, feats, v > 0 ? 1 : -1, 4 + 3 * Math.min(1, Math.abs(v)), 0.5, toward));
}

// ---------- choosing an expression within a family ----------
export function pickExpression(w: World, p: Person, fam: Family, inst: Instance, view?: View): Expression {
  const feats = inst.features;
  const cands = BY_FAMILY[fam]
    .filter(e => (inst.only?.[fam] ? inst.only[fam]!.includes(e.id) : !e.named))
    .filter(
      e =>
        (!e.needs || e.needs.every(f => feats.has(f))) &&
        (!e.bars || !e.bars.some(f => feats.has(f))) &&
        (inst.maxIntensity == null || e.intensity <= inst.maxIntensity) &&
        (inst.minIntensity == null || e.intensity >= inst.minIntensity) &&
        (!e.onlyIf || e.onlyIf(p)) &&
        (inst.target || !e.needsTarget),
    );
  const solo = BY_FAMILY[fam].filter(e => e.solo);
  const pool = cands.length ? cands : inst.target ? BY_FAMILY[fam] : solo.length ? solo : BY_FAMILY[fam];
  const read = view ? (k: string) => view.facet(p, k, inst.target?.id, feats) : (k: string) => facet(p, k, inst.target?.id, feats);
  // A person's style is theirs: the noise here is small, so the same person answers the same way, mostly.
  const scored = pool.map(e => {
    let s = 0;
    for (const k in e.prefers) s += e.prefers[k]! * read(k);
    return [e, s + (view ? 0 : w.rng.normal() * 0.45 * p.variability)] as const;
  });
  return scored.sort((a, b) => b[1] - a[1])[0][0];
}

// ---------- run an instance ----------
export interface Outcome {
  family: Family;
  expr: Expression;
  event: Event;
}
export function run(w: World, inst: Instance): Outcome | null {
  const p = inst.actor,
    t = inst.target,
    feats = inst.features;
  // The self-story speaks to some answers; every other answer of the situation weighs the strongest of it read the other way, so it
  // favours what it favours instead of only taxing it (every consideration is a factor of at most 1).
  const ids = new Map(inst.families.map(f => [f, identityC(p, f)] as const));
  const idRef = [...ids.values()]
    .filter((c): c is Consideration => !!c)
    .sort((a, b) => Math.abs(b.input(truthView(w)) - 0.5) - Math.abs(a.input(truthView(w)) - 0.5))[0];
  const options: Option[] = inst.families.map(fam => {
    const shared = (inst.extra ?? []).map(c => {
      if (!c.who) c.who = p; // the input reads the person through the original, so it is set there, before any reading the other way
      return !c.favours || c.favours.includes(fam) ? c : { ...c, curve: (x: number) => c.curve(1 - x) };
    });
    const own = [...(inst.familyExtra?.[fam] ?? []), ...shared];
    const cs: Consideration[] = inst.ownFirst
      ? [...own, ...wiringC(p, fam, feats, t?.id)]
      : [...wiringC(p, fam, feats, t?.id), ...shared, ...(inst.familyExtra?.[fam] ?? [])];
    const idc = ids.get(fam) ?? (idRef ? { ...idRef, curve: (x: number) => idRef.curve(1 - x) } : null);
    for (const c of cs) if (!c.who) c.who = p;
    if (idc && !idc.who) idc.who = p;
    // Who they take themselves to be is weighed every time, beside the five strongest considerations, never cut for want of room.
    const kept = idc ? [...cs.slice(0, 5), idc] : cs.slice(0, 5);
    if ((globalThis as any).WEIGH)
      WEIGH_LOG.push({
        type: inst.type,
        fam,
        own: own.length,
        ownCut: own.filter(c => !kept.includes(c)).length,
        id: !!idc,
        idCut: !!idc && !kept.includes(idc),
      });
    return { id: fam, label: fam, considerations: kept };
  });
  withAccounts(w, p, options);
  withCarry(w, inst.type, p, t, options);
  const scored = score(options, truthView(w), p.variability);
  const chosen = choose(scored, chanceOf(w, p), { t: w.t, who: p.id, kind: inst.type, nudge: () => w.rng.next() });
  if ((globalThis as any).WEIGH) {
    const tv = truthView(w);
    // Where the self-story speaks to an answer, whether or not it was kept (so both arms are counted alike): above 0.5 it favours it.
    const idFams = inst.families
      .map(f => ({ fam: f, c: identityC(p, f) }))
      .filter(x => x.c)
      .map(x => ({ fam: x.fam, x: x.c!.input(tv) }));
    const circ = (inst.extra ?? [])
      .filter(c => c.favours)
      .map(c => {
        const up = c.curve(1) > c.curve(0);
        return { id: c.id, x: c.input(tv), toward: up ? c.favours! : inst.families.filter(f => !c.favours!.includes(f)) };
      });
    WEIGH_DEC.push({ type: inst.type, families: inst.families, idFams, circ, chosen: chosen.id });
  }
  const why = reasons(chosen, scored, truthView(w));
  const fam = chosen.id as Family;
  const expr = pickExpression(w, p, fam, inst);
  const rec: any = {
    trigger: inst.type,
    person: p.id,
    options: scored.map(o => ({ id: o.id, label: o.label, p: o.p, score: o.score })),
    chosen: fam,
    expr: expr.id,
    situation: inst.causeLabel ?? '',
    target: t?.id,
  };
  if (w.t >= w.startPresent && w.witness != null && w.witness !== p.id) rec.exprGuess = pickExpression(w, p, fam, inst, witnessView(w, w.witness)).id;
  const top = why.find(c => c.key && !c.key.startsWith('against:'))?.key;
  rec.honest = honestWhy(truthView(w), options, p.variability, fam, top);
  recordStats(w, p, options, fam, rec);
  // Causes: the decision's reasons, then why this expression (its strongest preferred facet), then the situation's own cause.
  const exprWhy: Cause[] = Object.entries(expr.prefers)
    .map(([k, v]) => [k, v! * facet(p, k, t?.id, feats)] as const)
    .filter(([, s]) => s > 0.5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)
    .map(([k]) => traitCause(p, k, 0.3));
  const ifthen = p.ifThens.find(
    x => feats.has(x.feature) && (x.facet in expr.prefers || options.some(o => o.id === fam && o.considerations.some(c => c.id === x.facet))),
  );
  const seenC = new Set<string>();
  const causes: Cause[] = [
    ...(inst.cause != null ? [eventCause(w, inst.cause, 0.5)] : inst.causeLabel ? [stateCause(inst.causeLabel, 0.5)] : []),
    ...why.slice(0, 3),
    ...exprWhy,
    ...(ifthen ? [{ kind: 'trait', label: ifthen.words, weight: 0.4, key: ifthen.facet, who: p.id } as Cause] : []),
  ]
    .filter(c => {
      const k = c.label + '|' + (c.who ?? '');
      if (seenC.has(k)) return false;
      seenC.add(k);
      return true;
    })
    .slice(0, 5);
  const where =
    inst.where ??
    (feats.has('public') && inst.place && ['shout', 'sarcasm', 'dressdown', 'confront', 'walkout', 'speakup', 'rake'].includes(expr.id)
      ? ` in front of everyone at ${inst.place}`
      : '');
  let said = expr.text(`@${p.id}`, t ? `@${t.id}` : '', inst.thing, self(p), hash(w.seed, p.id, expr.id, w.t));
  // Not taking money is not a confession (round H25, words only).
  if (inst.type === 'temptation' && expr.id === 'ownup' && feats.has('money') && inst.thing)
    said = `@${p.id} kept ${inst.thing} straight, though nobody would have known§`;
  let text = (said.includes('§') ? said.replace('§', where) : said + where) + '.';
  // The same act toward the same person, years apart, is a pattern and the text says so; by the fourth time it is barely news.
  let repeat = 0,
    lastTime: number | undefined,
    earlier: number[] = [],
    since: number | undefined;
  const threaded =
    (['strain', 'request', 'confide', 'loss'].includes(inst.type) && ['withdrawal', 'anger', 'seeking'].includes(fam)) || inst.type.startsWith('row');
  if (t && !expr.solo && !expr.quiet && !threaded) {
    const rk = 'rep:' + expr.id + ':' + t.id;
    const prev = p.tried[rk];
    lastTime = prev?.t;
    repeat = (prev && w.t - prev.t <= 120 ? prev.n : 0) + 1;
    // The times before are kept (words only), so a repeat can name them (round H25).
    const before: number[] = repeat > 1 ? ((prev as any)?.ts ?? []) : [];
    const first = repeat > 1 ? ((prev as any)?.first ?? prev!.t) : w.t;
    p.tried[rk] = { t: w.t, ok: true, n: repeat, ts: [...before, w.t].slice(-3), first } as any;
    earlier = before;
    since = first;
  }
  // Said with the years, so a reader who was not there can see the history it rests on.
  const yrs = (ts: number[]) => [...new Set(ts.map(year))].filter(y => y !== year(w.t));
  if (repeat === 2)
    text += lastTime != null && year(lastTime) !== year(w.t) ? ` It had happened before, in ${year(lastTime)}.` : ' It was not the first time.';
  else if (repeat === 3) {
    const y = yrs(earlier);
    text +=
      y.length === 2
        ? ` It was the third time, after ${y[0]} and ${y[1]}.`
        : y.length === 1
          ? ` It was the third time since ${y[0]}.`
          : ' It was the third time this year.';
  } else if (repeat >= 4) {
    text +=
      since != null && year(since) !== year(w.t)
        ? ` Nobody was surprised any more: it had been happening since ${year(since)}.`
        : ' Nobody was surprised any more.';
  }
  const vis: Event['vis'] = expr.secret ? 'private' : feats.has('public') ? 'local' : 'private';
  // Circumstance discounts character: the more the visible situation explains the act, the less it says about the person.
  // An observer sees the act, not the person's true trait size, how far circumstance truly drove it, or an if-then at work (round F26):
  // the weight and the discount are the averages over a town (round H25's worlds, 9001–9020), and an if-then's evidence takes the act's
  // own direction.
  const circ = EV_CIRC;
  // How strongly the act was done says something about how strong the trait is: a very impatient person's snap is a bigger snap.
  // Diagnosticity: an act most people make in this kind of situation says little about the person. Everyone in a town knows that
  // people cheer a good song, so the weight of the evidence scales with how uncommon the chosen answer is here (an answer nine in ten
  // give carries a fifth of the weight). The rates are the town's own, once a kind of situation has been seen ten times.
  const trigK = inst.type.replace(/:.*$/, '');
  const nm: Map<string, number> | undefined = (w.stats as any).norms?.get(trigK);
  let seenN = 0;
  if (nm) for (const v of nm.values()) seenN += v;
  const common = nm && seenN >= 10 ? (nm.get(fam) ?? 0) / seenN : 0.5;
  const diagnostic = clamp(2 * (1 - common), 0.15, 1);
  const evidence: Evidence[] = Object.entries(expr.evidence).map(([k, v]) => {
    const z = EV_Z;
    return {
      ...ev(p.id, k, Math.sign(v!), Math.abs(v!) * (0.7 + 0.3 * Math.min(2, z)) * (1 - 0.6 * circ) * diagnostic, vis === 'private' ? 0.9 : 0.8),
      circ,
    };
  });
  // What passed between them says how the actor feels about the target.
  if (t && !expr.solo && expr.like !== 0)
    evidence.push(ev(p.id, 'bond:' + t.id, Math.sign(expr.like), Math.min(1.5, Math.abs(expr.like) * 2.5), 0.7));
  // Strain shows: anyone who saw the act can tell the person is under it.
  if (inst.type === 'strain') evidence.push(ev(p.id, 'state:low', 1, 0.6, 0.6));
  // An if-then that showed is learnable: "snaps the moment their work is questioned" is a thing people can know about you.
  const ifDir = !ifthen ? 0 : Math.sign(expr.evidence[ifthen.facet as keyof typeof expr.evidence] ?? 0);
  if (ifthen && ifDir !== 0)
    evidence.push(ev(p.id, `ifthen:${ifthen.feature}:${ifthen.facet}`, ifDir, Math.min(1.5, Math.abs(ifthen.shift) * 0.6), 0.7));
  const minor = expr.intensity < 0.45 && !['request-answer', 'discovery', 'standup', 'contest', 'judgement'].includes(inst.type);
  // Routine is not news: the same answer to the same kind of situation is logged only when it changes.
  const sameAsLast = p.tried['last:' + inst.type]?.ok === true && (p as any)['lastFam:' + inst.type] === fam;
  (p as any)['lastFam:' + inst.type] = fam;
  learned(w, p, 'last:' + inst.type, true);
  const again =
    (p.tried['seen:' + expr.id]?.t ?? -99) > w.t - 36 ||
    (sameAsLast && ['risk', 'deadline', 'chance'].includes(inst.type) && (p.tried['last:' + inst.type]?.n ?? 0) > 2);
  const logged = !expr.quiet && (again ? w.rng.chance(expr.intensity >= 0.6 ? 0.2 : 0.08) : !minor || w.rng.chance(0.5));
  const e = addEvent(w, {
    type: expr.id,
    who: t && !expr.solo ? [p.id, t.id, ...inst.others.map(o => o.id)] : [p.id, ...inst.others.map(o => o.id)],
    text,
    causes,
    vis,
    evidence,
    w: (inst.w ?? 0.3 + expr.intensity * 1.5) * (repeat >= 4 ? 0.6 : 1),
    decision: rec,
  });
  // Strain answered the same way again is a thread, not a new event: the thread decides what the chronicle shows.
  let keep = logged;
  // The same answer to pressure, whatever brought it on (strain, debt, a secret, a loss), is one developing thread, not many events.
  if (['strain', 'request', 'confide', 'loss'].includes(inst.type) && ['withdrawal', 'anger', 'seeking'].includes(fam) && !OFF.has('threads'))
    keep = threadStep(w, p, fam, expr, t, (inst.causeLabel ?? inst.type).replace(/^strain had been building: /, ''), e) && logged;
  else if (logged) learned(w, p, 'seen:' + expr.id, true);
  // Unlogged acts still happen: whoever was there still learns from them. They just don't make the story.
  if (!keep) {
    e.w = 0.2;
    unlist(w, e);
  }
  // The closest people see you pull away, even when nobody else does.
  if (expr.solo && expr.family === 'withdrawal') {
    if (p.partner != null) e.knownBy.set(p.partner, 'seen');
    for (const f of p.friends) if (w.rng.chance(0.5)) e.knownBy.set(f, 'seen');
  }
  broadcast(w, e);
  // Effects on the target and on watchers.
  if (t && !expr.solo) {
    const k = 0.5 + expr.intensity * 0.5;
    remember(w, t, p, e.id, expr.like * k, expr.respect * k, expr.trust * k, shortText(expr, p, t));
    if (expr.like < -0.25 && expr.intensity >= 0.45 && !inst.type.startsWith('row')) queueProvocation(w, t, p, e, feats.has('public')); // a row is answered inside the row
  }
  if (vis === 'local' && expr.like !== 0)
    for (const [id, how] of e.knownBy)
      if (how === 'seen' && id !== p.id && id !== t?.id) {
        const r = bond(w, id, p.id);
        r.like = clamp(r.like + expr.like * 0.25, -1, 1);
        r.respect = clamp(r.respect + expr.respect * 0.25, -1, 1);
      }
  if (expr.stressRelief) p.stress = clamp(p.stress - expr.stressRelief * (0.5 + expr.intensity * 0.5), 0, 1);
  if (expr.secret) p.secrets.push(e.id);
  if (expr.id === 'numb') {
    p.drinks = true;
    p.drinkSince = w.t;
  }
  if (inst.type === 'hometruth' && t) {
    if (expr.id === 'admit') openedUp(w, p, t, e.id);
  }
  if (expr.id === 'shutout') {
    for (const q of friendsOf(w, p)) {
      bond(w, p.id, q.id).fam *= 0.55;
      remember(w, q, p, e.id, -0.08, 0, -0.03, 'shut me out');
    }
    p.phase = { deltas: { sociability: -1.2, liveliness: -0.8 }, until: w.t + 8 + w.rng.int(0, 8), cause: e.id, label: 'a closed-off stretch' };
  }
  if (expr.id === 'walkout' || expr.id === 'quitpride') leaveJob(w, p, e);
  // Becoming more themselves: a chosen expression deepens the trait that chose it, a little.
  for (const k in expr.prefers) {
    const v = expr.prefers[k]!;
    if (Math.abs(v) >= 0.8 && Math.sign(p.facets[k]) === Math.sign(v)) p.facets[k] += Math.sign(v) * 0.01 * plasticity(w, p);
  }
  learned(w, p, 'fam:' + fam, expr.like >= 0 || !t);
  carryAct(w, p, expr.solo ? undefined : t, expr.id, e.id);
  return { family: fam, expr, event: e };
}
// What the target remembers of an act, in their own words ('told people what I had told her in confidence').
export function shortText(expr: Expression, p: Person, t: Person) {
  const A = '\u0001';
  const she = p.sex === 'f' ? 'she' : 'he',
    her = p.sex === 'f' ? 'her' : 'him',
    hers = p.sex === 'f' ? 'hers' : 'his';
  const th = expr.id === 'rake' || expr.id === 'letgo' ? 'the old business' : /song$/.test(expr.id) ? 'song' : 'it';
  return expr
    .text(A, 'me', th, self(p))
    .replace('§', '')
    .replace(new RegExp('^' + A + '\\s*'), '')
    .replace(new RegExp(A + "'s(?=\\W*$)"), hers)
    .replace(new RegExp(A + "'s", 'g'), her === 'her' ? 'her' : 'his')
    .replace(new RegExp('told ' + A, 'g'), 'told ' + her)
    .replace(new RegExp(A, 'g'), she)
    .replace(/\bme's\b/g, 'my')
    .replace(/\b(what|sure|that|if|how|when|until) me\b/g, '$1 I')
    .replace(/\bme (had|was|did|would)\b/g, 'I $1')
    .replace(/^gave me it\b/, 'gave it to me')
    .replace(/\s+/g, ' ')
    .trim();
}
export function friendsOf(w: World, p: Person) {
  return [...p.friends].map(id => P(w, id)).filter(q => q.status === 'in');
}
export function leaveJob(w: World, p: Person, e: Event) {
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (!pl) return;
  if (pl.lead === p.id) pl.lead = null;
  p.quitFrom = pl.id;
  jobSet(w, p, null);
  p.lead = false;
}

// ---------- queued situations (one event causing another) ----------
// Diagnostics only (set globalThis.WEIGH): what each option kept. Never read by the model.
// The average evidence weight from trait size (min(2, |z|)) and the average circumstance discount, over round H25's worlds (round F26).
const EV_Z = 0.933,
  EV_CIRC = 0.1875;
// An act that is not kept comes off each person's own list, wherever it is in the list, and nothing else does.
export function unlist(w: World, e: Event) {
  for (const id of new Set(e.who)) {
    const l = P(w, id).events;
    const i = l.lastIndexOf(e.id);
    if (i >= 0) l.splice(i, 1);
  }
}
export const WEIGH_LOG: any[] = [];
export const WEIGH_DEC: any[] = [];
// Marks a shared circumstance with the answers it is weighed for as written (round 24b); set on the consideration itself, never a copy.
export const favour = (c: Consideration, ...fams: Family[]) => ((c.favours = fams), c);
export function queueProvocation(w: World, t: Person, by: Person, e: Event, pub: boolean) {
  if (t.status !== 'in' || age(w, t) < 14) return;
  const feats = new Set<Feature>([pub ? 'public' : 'private', 'standing']);
  if (by.job && by.lead && t.job === by.job) feats.add('authority');
  if (['dressdown', 'sarcasm', 'blame'].includes(e.type)) feats.add('challenged');
  if (family(t, by) || t.partner === by.id) feats.add('family');
  else if (t.friends.has(by.id)) feats.add('friend');
  w.queue.push({
    type: 'provocation',
    actor: t,
    target: by,
    others: [],
    thing: '',
    features: feats,
    families: ['anger', 'humility', 'pride'],
    cause: e.id,
    place: by.job && t.job === by.job ? w.placeById.get(by.job)!.name : undefined,
    maxIntensity: e.w >= 2 ? 1 : 0.6,
    only: { humility: ['swallow'], pride: ['confront', 'sulk', 'quitpride'] },
    familyExtra: { anger: [bondC(w, t, by, 'like', -1)], pride: [bondC(w, t, by, 'respect', -1)], humility: [bondC(w, t, by, 'respect', 1)] },
  });
}
export function family(a: Person, b: Person) {
  return a.parents.includes(b.id) || b.parents.includes(a.id) || (a.parents.length > 0 && a.parents.some(x => b.parents.includes(x)));
}

// What goes round comes back (Gouldner 1960; Algoe 2012): when the hat goes round for someone, whether they put in for you when it was
// your turn weighs on what you put in for them, and so does having been fobbed off with the smallest coin. The latest such act decides,
// and the reason cites it. Both families carry the consideration, so it pushes one way and is given as the reason.
export function reciprocity(w: World, q: Person, x: Person): { generosity: Consideration; refusal: Consideration }[] {
  for (let i = q.events.length - 1; i >= 0; i--) {
    const e = w.events[q.events[i]];
    if (e.t < w.t - 240) break;
    if (e.who[0] !== x.id || e.who[1] !== q.id || !e.knownBy.has(q.id)) continue;
    const gave = e.type === 'chipin' || e.type === 'quietgive';
    if (!gave && e.type !== 'token' && e.type !== 'nowallet') continue;
    const label = gave ? `@${x.id} had put in for @${q.id} in ${year(e.t)}` : `@${x.id} had given next to nothing for @${q.id} in ${year(e.t)}`;
    const id = gave ? 'owed' : 'stung';
    return [{ generosity: pubC(id, label, 0.85, gave ? 1 : -1, 0.2, e.id), refusal: pubC(id, label, 0.85, gave ? -1 : 1, 0.2, e.id) }];
  }
  return [];
}
