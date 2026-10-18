// The Situation Grammar: types matched against the world, answered through behaviour families.
// Every instance becomes an event with causes and evidence. Nothing here is a scene.

import { clamp, hash, stream } from './rng';
import { onStage, obstacle } from './steer';
import { resolveWants, wantLabel, giveUp as giveUpWant } from './time';
import { FACET_BY_ID, VALUES } from './core';
import { ACTIVATION, FEATURE_WORDS, type Feature } from './features';
import { BY_FAMILY, EXPR, type Expression, type Family } from './families';
import { SETTING } from './setting';
import { threadStep, openedUp } from './threads';
import { regard, regardWeight } from './regard';
import { projectLabel, placePlan } from './projects';
import {
  OFF,
  plasticity,
  type World,
  type Person,
  type Cause,
  type Event,
  type Evidence,
  age,
  live,
  P,
  facet,
  bond,
  peekBond,
  likeOf,
  remember,
  addEvent,
  broadcast,
  learnOf,
  addStress,
  topSources,
  addEmotion,
  year,
  logistic,
  peaks,
  recentEvents,
} from './world';
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
  z01,
  seenBy,
  type Option,
  type Consideration,
  type Know,
  type View,
} from './decide';

const VN = Object.fromEntries(VALUES.map(v => [v.id, v.name]));
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

// ---------- causes and evidence helpers ----------
// dir: the direction the act implies for this facet (+1 high, -1 low). A person whose trait runs the other way did it despite the trait, and the label says so.
// Pseudo-facets (a way of loving and fighting, love.ts) print like facets in reasons.
export const PSEUDO: Record<string, { name: string; high: string; low: string }> = {};
export const traitCause = (p: Person, key: string, w = 1, dir?: 1 | -1): Cause => {
  const f = FACET_BY_ID[key] ?? PSEUDO[key];
  const z = p.facets[key] ?? 0;
  const pole = f ? (z > 0.5 ? f.high : z < -0.5 ? f.low : '') : '';
  const against = dir != null && pole && Math.sign(z) !== dir;
  return {
    kind: 'trait',
    label: f ? (pole ? `${against ? 'despite ' : ''}${f.name.toLowerCase()}: ${pole}` : f.name.toLowerCase()) : key,
    weight: w,
    key,
    who: p.id,
    ...(f && !pole ? { mid: true } : {}),
  };
};
export const stateCause = (label: string, w = 1, ref?: number): Cause => ({ kind: 'state', label, weight: w, ref });
export const eventCause = (w: World, ref: number, weight = 1): Cause => ({ kind: 'event', label: w.events[ref].text, weight, ref });
export const ev = (subject: number, key: string, dir: number, strength = 1, reliability = 0.8): Evidence => ({
  subject,
  key,
  dir,
  strength,
  reliability,
});

// A consideration reading one facet, in the situation's features (so if-then signatures apply).
export function facetC(p: Person, key: string, feats: Set<Feature>, dir: 1 | -1, k = 5, mid = 0.5, toward?: number): Consideration {
  return {
    id: key,
    cause: () => traitCause(p, key),
    input: v => z01(v.facet(p, key, toward, feats)),
    curve: dir > 0 ? curves.sCurve(k, mid) : curves.sFalling(k, mid),
  };
}
export function valueC(p: Person, key: string, dir: 1 | -1 = 1, k = 5, mid = 0.5): Consideration {
  return {
    id: 'value:' + key,
    cause: () => ({ kind: 'value', label: `values ${VN[key].toLowerCase()}`, weight: 1, key, who: p.id }),
    input: v => z01(v.value(p, key)),
    curve: dir > 0 ? curves.sCurve(k, mid) : curves.sFalling(k, mid),
  };
}
// A circumstance. `know` says who could know it: 'public' (a storm), 'close' (debt, strain; the default), 'private' (how badly they want it).
export function stateC(
  id: string,
  label: string,
  x: number,
  dir: 1 | -1 = 1,
  lo = 0.2,
  ref?: number,
  know: Know = 'close',
  who?: Person,
): Consideration {
  const STATE_KEY: Record<string, string> = { worn: 'low', load: 'low', strain: 'low', money: 'broke', own: 'broke', need: 'broke', alone: 'alone' };
  const c: Consideration = {
    id,
    cause: () => stateCause(label, 1, ref),
    input: v => v.state(c.who, c.know ?? 'close', x, c.neutral ?? 0.5, STATE_KEY[id]),
    curve: dir > 0 ? curves.rising(lo, 1) : curves.falling(lo, 1),
    know,
    who,
    neutral: 0.5,
  };
  return c;
}
export const pubC = (id: string, label: string, x: number, dir: 1 | -1 = 1, lo = 0.2, ref?: number) => stateC(id, label, x, dir, lo, ref, 'public');
// A private circumstance: the observer's best guess is the base rate (how often it is true of people in general), never a coin flip.
export const privC = (id: string, label: string, x: number, dir: 1 | -1 = 1, lo = 0.2, ref?: number, base = 0.5) => {
  const c = stateC(id, label, x, dir, lo, ref, 'private');
  c.neutral = base;
  return c;
};
// A circumstance those close to the person would know; others guess the base rate.
export const closeC = (id: string, label: string, x: number, dir: 1 | -1 = 1, lo = 0.2, ref?: number, base = 0.5) => {
  const c = stateC(id, label, x, dir, lo, ref, 'close');
  c.neutral = base;
  return c;
};
export function bondC(w: World, p: Person, other: Person, axis: 'like' | 'respect' | 'trust', dir: 1 | -1 = 1, k = 4, mid = 0.5): Consideration {
  // Said as the feeling itself ("is fond of Ben", "has never trusted Ben"); a bond near neutral explains nothing and is not a reason.
  const o = `@${other.id}`;
  const say = (x: number): string | undefined =>
    axis === 'like'
      ? x > 0.6
        ? `thinks the world of ${o}`
        : x > 0.3
          ? `is fond of ${o}`
          : x > 0.1
            ? `likes ${o}`
            : x < -0.5
              ? `can't stand ${o}`
              : x < -0.25
                ? `does not like ${o}`
                : x < -0.1
                  ? `is not fond of ${o}`
                  : undefined
      : axis === 'trust'
        ? x > 0.4
          ? `trusts ${o}`
          : x > 0.15
            ? `mostly trusts ${o}`
            : x < -0.3
              ? `has never trusted ${o}`
              : x < -0.1
                ? `does not quite trust ${o}`
                : undefined
        : x > 0.4
          ? `thinks highly of ${o}`
          : x > 0.15
            ? `respects ${o}`
            : x < -0.3
              ? `has no respect for ${o}`
              : x < -0.1
                ? `does not think much of ${o}`
                : undefined;
  return {
    id: `bond:${axis}:${other.id}`,
    cause: v => {
      const m = peaks(w, p, other, 1)[0];
      const said = say(v.bond(p, other.id, axis));
      return {
        kind: 'bond',
        label: said ?? `${axis} toward ${o}`,
        weight: 1,
        who: p.id,
        key: 'bond:' + other.id,
        ...(said ? {} : { mid: true }),
        ...(m && m.ev >= 0 ? { ref: m.ev } : {}),
      };
    },
    input: v => (v.bond(p, other.id, axis) + 1) / 2,
    curve: dir > 0 ? curves.sCurve(k, mid) : curves.sFalling(k, mid),
  };
}
// Attachment to home, read as a pseudo-facet so beliefs and views work on it like any trait.
export function attachC(p: Person, dir: 1 | -1 = 1): Consideration {
  if (OFF.has('attach'))
    return { id: 'attach:home', cause: () => ({ kind: 'state', label: 'home', weight: 0 }), input: () => 0.5, curve: curves.flat(0.5) };
  return {
    id: 'attach:home',
    cause: v => {
      const z = v.facet(p, 'attach:home');
      return {
        kind: 'bond',
        label:
          z > 0.6 ? 'rooted here: the sea, the people, the house' : z < -0.4 ? 'nothing much holding them here' : 'neither here nor there about home',
        weight: 1,
        key: 'attach:home',
        who: p.id,
      };
    },
    input: v => z01(v.facet(p, 'attach:home')),
    curve: dir > 0 ? curves.sCurve(5, 0.5) : curves.sFalling(5, 0.5),
  };
}
export function lastTime(p: Person, key: string, label: string): Consideration {
  const h = p.tried[key];
  const x = h ? (h.ok ? 0.85 : 0.15) : 0.5;
  return {
    id: 'last:' + key,
    cause: () => stateCause(h ? (h.ok ? `${label} worked last time` : `${label} went badly last time`) : `has never tried ${label}`, 1),
    input: v => v.state(p, 'private', x, 0.5),
    curve: curves.rising(0.25, 1),
    neutral: 0.5,
    know: 'private',
    who: p,
  };
}
export function learned(w: World, p: Person, key: string, ok: boolean) {
  const h = p.tried[key] || (p.tried[key] = { t: w.t, ok, n: 0 });
  h.t = w.t;
  h.ok = ok;
  h.n++;
}

// A plain decision for choices that are not social behaviour (study, come home, start a pursuit).
// Records the same stats as a grammar run: honesty of the why, and what the witness would have predicted.
// A choice's chance is the chooser's own (round 25b): its draw comes from a stream keyed by the run, the month, the person and how many
// choices they have made this month, so one person's choices never shift the draws of anyone else's.
export function chanceOf(w: World, p: Person): () => number {
  if (OFF.has('ownchance')) return () => w.rng.next();
  const c: Map<number, { t: number; n: number }> = ((w as any).choiceN ??= new Map());
  const k = c.get(p.id);
  const n = k && k.t === w.t ? k.n + 1 : 0;
  c.set(p.id, { t: w.t, n });
  const s = w.t <= w.startPresent ? stream(w.seed, 'past', 'choice', p.id, w.t, n) : stream(w.seed, w.runSeed, 'run', 'choice', p.id, w.t, n);
  return () => s.next();
}
export function decide(w: World, p: Person, trigger: string, options: Option[]) {
  for (const o of options) for (const c of o.considerations) if (!c.who) c.who = p;
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
function identityC(p: Person, fam: Family): Consideration | null {
  const m = FAMILY_IDENTITY[fam];
  if (!m || !p.selfStory.length || OFF.has('selfstory')) return null;
  let best = 0,
    text = '';
  for (const s of p.selfStory) {
    if (m.yes?.includes(s.key) && s.weight > best) {
      best = s.weight;
      text = s.text;
    }
    if (m.no?.includes(s.key) && s.weight > best) {
      best = -s.weight;
      text = s.text;
    }
  }
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
const FAMILY_FACETS: Record<Family, Partial<Record<string, number>>> = {
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
function wiringC(p: Person, fam: Family, feats: Set<Feature>, toward?: number): Consideration[] {
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
function pickExpression(w: World, p: Person, fam: Family, inst: Instance, view?: View): Expression {
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
      return !c.favours || OFF.has('pushes') || c.favours.includes(fam) ? c : { ...c, curve: (x: number) => c.curve(1 - x) };
    });
    const own = [...(inst.familyExtra?.[fam] ?? []), ...shared];
    const cs: Consideration[] = inst.ownFirst
      ? [...own, ...wiringC(p, fam, feats, t?.id)]
      : [...wiringC(p, fam, feats, t?.id), ...shared, ...(inst.familyExtra?.[fam] ?? [])];
    const idc = ids.get(fam) ?? (idRef && !OFF.has('selfkept') ? { ...idRef, curve: (x: number) => idRef.curve(1 - x) } : null);
    for (const c of cs) if (!c.who) c.who = p;
    if (idc && !idc.who) idc.who = p;
    // Who they take themselves to be is weighed every time, beside the five strongest considerations, never cut for want of room.
    const kept = idc && !OFF.has('selfkept') ? [...cs.slice(0, 5), idc] : [...cs, ...(idc ? [idc] : [])].slice(0, 5);
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
  const forWhy = why.filter(c => !c.key?.startsWith('against:'));
  const circ = clamp(
    forWhy.filter(c => c.kind === 'state' || c.kind === 'event' || c.kind === 'want' || c.kind === 'bond').reduce((s, c) => s + c.weight, 0),
    0,
    1,
  );
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
  // When an if-then on this facet was at work, the act says less about the general trait: that part of the evidence goes to the if-then below.
  const evidence: Evidence[] = Object.entries(expr.evidence).map(([k, v]) => {
    const z = Math.abs(facet(p, k, t?.id, feats));
    const situational = ifthen && ifthen.facet === k ? 0.5 : 1;
    return {
      ...ev(
        p.id,
        k,
        Math.sign(v!),
        Math.abs(v!) * (0.7 + 0.3 * Math.min(2, z)) * (1 - 0.6 * circ) * situational * diagnostic,
        vis === 'private' ? 0.9 : 0.8,
      ),
      circ,
    };
  });
  // What passed between them says how the actor feels about the target.
  if (t && !expr.solo && expr.like !== 0)
    evidence.push(ev(p.id, 'bond:' + t.id, Math.sign(expr.like), Math.min(1.5, Math.abs(expr.like) * 2.5), 0.7));
  // Strain shows: anyone who saw the act can tell the person is under it.
  if (inst.type === 'strain') evidence.push(ev(p.id, 'state:low', 1, 0.6, 0.6));
  // An if-then that showed is learnable: "snaps the moment their work is questioned" is a thing people can know about you.
  if (ifthen)
    evidence.push(ev(p.id, `ifthen:${ifthen.feature}:${ifthen.facet}`, Math.sign(ifthen.shift), Math.min(1.5, Math.abs(ifthen.shift) * 0.6), 0.7));
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
    for (const id of e.who) P(w, id).events.pop();
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
  p.job = null;
  p.lead = false;
}

// ---------- queued situations (one event causing another) ----------
// Diagnostics only (set globalThis.WEIGH): what each option kept. Never read by the model.
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
function reciprocity(w: World, q: Person, x: Person): { generosity: Consideration; refusal: Consideration }[] {
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

// ---------- the matcher: situation types ----------
export interface SituationType {
  id: string;
  match(w: World): Instance[];
}

const TYPES: SituationType[] = [
  // Temptation: access to something that isn't yours, unobserved.
  {
    id: 'temptation',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (!p.job || age(w, p) < 18 || !w.rng.chance(0.012)) continue;
        const pl = w.placeById.get(p.job)!;
        const money = w.rng.chance(0.55);
        const thing = money ? SETTING.resources[pl.id] : 'a mistake at work';
        const feats = new Set<Feature>(['private', money ? 'money' : 'standing']);
        if (!money) feats.add('challenged');
        const lead = pl.lead != null && pl.lead !== p.id ? P(w, pl.lead) : null;
        const coworker = live(w).find(q => q.job === p.job && q !== p && q !== lead);
        out.push({
          type: 'temptation',
          actor: p,
          target: money ? undefined : coworker,
          others: [],
          thing,
          features: feats,
          families: money ? ['dishonesty', 'honesty'] : ['dishonesty', 'honesty'],
          place: pl.name,
          extra: [favour(stateC('money', p.savings < 0 ? 'in debt' : 'money is fine', p.savings < 0 ? 0.9 : 0.25), 'dishonesty')],
          familyExtra: lead ? { dishonesty: [bondC(w, p, lead, 'respect', -1)] } : undefined,
          maxIntensity: money ? 0.6 : 1,
          // Round H25: without money in it, taking a little is not one of the answers (skimming is the one act at 0.6).
          minIntensity: money ? 0.5 : OFF.has('skimfix') ? 0.6 : 0.65,
        });
      }
      return out;
    },
  },
  // Request: someone in need asks someone who can help.
  {
    id: 'request',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (age(w, p) < 18 || !(p.savings < -2 || (p.ill > 0 && p.partner == null)) || !w.rng.chance(0.15)) continue;
        if (w.t - (p.tried['fam:seeking']?.t ?? -99) < 5) continue;
        const need = p.savings < -2 ? 'money' : 'help';
        const pool = [
          ...friendsOf(w, p),
          ...p.circle.map(i => P(w, i)).filter(q => q.status === 'in'),
          ...(p.partner != null ? [P(w, p.partner)] : []),
        ].filter(q => q !== p && !(p.tried['ask:' + q.id] && (!p.tried['ask:' + q.id].ok || w.t - p.tried['ask:' + q.id].t < 24)));
        if (!pool.length) continue;
        const q = pool.sort((a, b) => regard(w, p.id, b.id) - regard(w, p.id, a.id))[0];
        const feats = new Set<Feature>(['private', 'need', need === 'money' ? 'money' : 'safety', family(p, q) ? 'family' : 'friend']);
        out.push({
          type: 'request',
          actor: p,
          target: q,
          others: [],
          thing: need === 'money' ? 'money' : 'help',
          features: feats,
          families: ['seeking', 'withdrawal'],
          only: { seeking: ['ask', 'hint'], withdrawal: ['work', 'skip'] },
          causeLabel: need === 'money' ? (p.savings < -8 ? 'badly in debt' : 'in debt') : 'ill, and alone',
          familyExtra: {
            seeking: [
              stateC('need', p.savings < -8 ? 'desperate' : 'struggling', p.savings < -8 ? 0.95 : 0.5),
              lastTime(p, 'ask', 'asking for help'),
            ],
          },
        });
      }
      return out;
    },
  },
  // Risk for gain: the fleet in a storm.
  {
    id: 'risk',
    match(w) {
      if (!w.rng.chance(0.03)) return [];
      return live(w)
        .filter(p => p.job === 'harbour')
        .map(p => ({
          type: 'risk',
          actor: p,
          others: [],
          thing: 'out into the storm',
          features: new Set<Feature>(['danger', 'money', 'public']),
          families: ['courage', 'caution'] as Family[],
          only: { courage: ['go'], caution: ['hangback'] },
          causeLabel: 'a storm came in',
          extra: [favour(stateC('money', p.savings < 3 ? 'needs the money' : 'can afford to wait', p.savings < 3 ? 0.9 : 0.3), 'courage')],
          w: 1,
        }));
    },
  },
  // Offer from outside: work in the city.
  {
    id: 'offer',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        const a = age(w, p);
        if (a < 19 || a > 50 || !w.rng.chance(0.012)) continue;
        const wants = p.wants.find(x => x.kind === 'escape' && !x.done);
        if (!wants && !(p.values.success > 0.8 && !p.lead) && !(p.job == null && !p.retired) && !((p.facets['attach:home'] ?? 0) < -0.7)) continue;
        const tied =
          p.partner != null ||
          p.kids.some(k => P(w, k).status === 'in' && age(w, P(w, k)) < 18) ||
          p.parents.some(k => P(w, k).status === 'in' && (P(w, k).ill > 0 || age(w, P(w, k)) > 74));
        const feats = new Set<Feature>(['private', 'freedom', 'money']);
        if (tied) feats.add('family');
        out.push({
          type: 'offer',
          actor: p,
          others: [],
          thing: 'a job in the city',
          features: feats,
          families: ['openness', 'reluctance'],
          only: { openness: ['take'], reluctance: ['decline'] },
          causeLabel: wants ? `had wanted out since ${year(wants.since)}` : p.job ? 'word came of work in the city' : 'no work here',
          extra: [favour(pubC('ties', tied ? 'people here depend on them' : 'nobody here depends on them', tied ? 0.9 : 0.1, -1, 0.15), 'openness')],
          familyExtra: {
            openness: [facetC(p, 'unconventionality', feats, 1, 3), valueC(p, wants ? wants.value : 'success'), attachC(p, -1)],
            reluctance: [attachC(p, 1)],
          },
          w: 2,
        });
      }
      return out;
    },
  },
  // A chance for a talent: the open night at the Anchor.
  {
    id: 'chance',
    match(w) {
      if (!w.rng.chance(0.08)) return [];
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (age(w, p) < 15) continue;
        // Round 25c: someone who has put their name down for it (a way to be heard) gets their turn soon, and plays what they practise.
        const staged = onStage(p);
        const sk = staged ? staged.target : SETTING.hobbies.find(h => p.skills[h] && p.skills[h].r > 1200 && p.skills[h].interest === 2);
        const seeking = p.wants.some(x => !x.done && x.kind === 'prove' && x.pursuit);
        if (
          !sk ||
          !w.rng.chance(staged ? 0.9 : seeking ? 0.6 : 0.3) ||
          (p.tried['chance']?.t ?? -99) > w.t - (staged ? 4 : (seeking ? 12 : 18) * (1 + Math.min(2, (p.tried['chance']?.n ?? 0) / 2)))
        )
          continue;
        learned(w, p, 'chance', true);
        out.push({
          type: 'chance',
          actor: p,
          others: [],
          thing: `a spot at the Anchor's open night`,
          features: new Set<Feature>(['public', 'watched', 'standing']),
          families: ['openness', 'reluctance'],
          only: { openness: ['seize'], reluctance: ['shyaway'] },
          causeLabel: `has been playing ${sk} for years`,
          place: 'the Anchor',
          w: 1.5,
          familyExtra: {
            openness: [
              facetC(p, 'aesthetic', new Set<Feature>(['public']), 1, 3),
              facetC(p, 'socialSelfEsteem', new Set<Feature>(['public', 'watched']), 1, 4),
            ],
            reluctance: [facetC(p, 'socialSelfEsteem', new Set<Feature>(['public', 'watched']), -1, 4)],
          },
          extra: [
            favour(
              stateC(
                'skill',
                `${sk} ${p.skills[sk].r > 1400 ? 'far better than anyone knows' : 'getting good'}`,
                clamp((p.skills[sk].r - 1150) / 400, 0, 1),
              ),
              'openness',
            ),
          ],
        });
      }
      return out;
    },
  },
  // Strain: pressure leaking out in small ways, and rarely breaking.
  {
    id: 'strain',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (age(w, p) < 14 || p.stress < 0.45) continue;
        const breaking = p.stress > 0.85 && w.t - p.lastBreak > 12 && w.rng.chance(0.08);
        if (!breaking && (w.t - (p.tried['strain']?.t ?? -99) < 5 || !w.rng.chance(0.2))) continue;
        learned(w, p, 'strain', true);
        if (breaking) p.lastBreak = w.t;
        const srcs = topSources(p, 3);
        const targets: Person[] = [];
        if (p.partner != null) targets.push(P(w, p.partner));
        if (p.job) for (const q of live(w)) if (q.job === p.job && q !== p) targets.push(q);
        for (const k of p.kids) {
          const c = P(w, k);
          if (c.status === 'in' && age(w, c) < 18) targets.push(c);
        }
        targets.push(...friendsOf(w, p));
        const t = targets.length ? w.rng.pick(targets) : undefined;
        const feats = new Set<Feature>(['tired', 'pressure']);
        if (t && t.job === p.job && p.job) feats.add('public');
        else feats.add('private');
        if (t && (family(p, t) || p.partner === t.id)) feats.add('family');
        else if (t && p.friends.has(t.id)) feats.add('friend');
        out.push({
          type: 'strain',
          actor: p,
          target: t,
          others: [],
          thing: 'help',
          features: feats,
          families: t ? ['anger', 'withdrawal', 'seeking'] : ['withdrawal'],
          causeLabel: `strain had been building: ${srcs.map(s => s.label).join(', ')}`,
          place: p.job && t?.job === p.job ? w.placeById.get(p.job)!.name : undefined,
          maxIntensity: breaking ? 1 : 0.5,
          familyExtra: {
            anger: t ? [bondC(w, p, t, 'like', -1)] : [],
            seeking: [t ? bondC(w, p, t, 'trust', 1) : stateC('alone', 'has nobody to turn to', 0.05)],
          },
          w: breaking ? 2 : undefined,
        });
      }
      return out;
    },
  },
  // Obligation: a promise comes due.
  {
    id: 'obligation',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (age(w, p) >= 16 && w.rng.chance(0.015) && p.promises.length < 1) {
          const pool = [
            ...friendsOf(w, p),
            ...(p.partner != null ? [P(w, p.partner)] : []),
            ...p.circle.map(i => P(w, i)).filter(q => q.status === 'in'),
          ];
          if (pool.length) {
            const to = w.rng.pick(pool);
            const due = w.t + 1 + w.rng.int(0, 3);
            // What is promised fits the one it is promised to: the kids only to someone with young children, a word put in only to a
            // friend outside the household. The same single draw either way, so the wording changes nothing else.
            const young = to.kids.some(k => w.byId.get(k)?.status === 'in' && age(w, w.byId.get(k)!) < 12);
            const home = to.id === p.partner;
            p.promises.push({
              to: to.id,
              due,
              what: w.rng.pick([
                'to help with the roof',
                'to be there on the day',
                home ? 'to sort out the bills by the end of the month' : 'to pay it back by the end of the month',
                young ? 'to look after the kids' : 'to help with the garden',
                home ? 'to be home early on Friday' : 'to put in a word for them',
              ]),
            });
          }
        }
        for (const pr of p.promises.slice()) {
          if (pr.due > w.t) continue;
          p.promises = p.promises.filter(x => x !== pr);
          const t = P(w, pr.to);
          if (t.status !== 'in') continue;
          out.push({
            type: 'obligation',
            actor: p,
            target: t,
            others: [],
            thing: pr.what,
            features: new Set<Feature>(['private', family(p, t) ? 'family' : 'friend', ...(p.stress > 0.5 ? ['tired' as Feature] : [])]),
            families: ['duty', 'lapse'],
            only: { duty: ['keep'], lapse: ['slip'] },
            familyExtra: {
              lapse: [
                stateC(
                  'strain',
                  p.stress > 0.5
                    ? `under strain (${topSources(p, 1)
                        .map(x => x.label)
                        .join('')})`
                    : 'nothing in the way',
                  p.stress > 0.5 ? 0.8 : 0.15,
                ),
              ],
            },
            w: 0.7,
          });
        }
        // A parent in need, with a child who could come.
        if (p.ill > 0)
          for (const k of p.kids) {
            const c = P(w, k);
            if (c.status === 'in' && age(w, c) >= 18 && (c.tried['dutyill:' + p.id]?.t ?? -99) < w.t - 12 && w.rng.chance(0.5)) {
              learned(w, c, 'dutyill:' + p.id, true);
              out.push({
                type: 'obligation',
                actor: c,
                target: p,
                others: [],
                thing: 'it',
                features: new Set<Feature>(['private', 'family', 'need']),
                families: ['duty', 'lapse'],
                only: { duty: ['show'], lapse: ['absent'] },
                causeLabel: `@${p.id} was ill`,
                familyExtra: { lapse: [stateC('own', c.stress > 0.5 ? 'had troubles of their own' : 'had the time', c.stress > 0.5 ? 0.7 : 0.2)] },
                w: 1.3,
              });
            }
          }
      }
      return out;
    },
  },
  // Discovery: someone holding a secret decides what to do with it; someone's secret may get out.
  {
    id: 'discovery',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (!p.secrets.length || !w.rng.chance(0.08)) continue;
        const sid = p.secrets[p.secrets.length - 1];
        const se = w.events[sid];
        const pool = [...friendsOf(w, p), ...(p.partner != null ? [P(w, p.partner)] : [])].filter(q => !se.knownBy.has(q.id));
        if (!pool.length) continue;
        const q = pool.sort((a, b) => regard(w, p.id, b.id) - regard(w, p.id, a.id))[0];
        out.push({
          type: 'confide',
          actor: p,
          target: q,
          others: [],
          thing: 'it',
          features: new Set<Feature>(['private', family(p, q) ? 'family' : 'friend']),
          families: ['seeking', 'withdrawal'],
          only: { seeking: ['confide'], withdrawal: ['work', 'skip'] },
          causeLabel: 'carrying something nobody knew',
          familyExtra: { seeking: [bondC(w, p, q, 'trust', 1, 6, 0.55)] },
        });
      }
      return out;
    },
  },
  // ----- round 2: situations that carry the features if-then signatures key off -----
  // Deadline: a rush job lands on a workplace. Pressure, in public, with the boss watching.
  {
    id: 'deadline',
    match(w) {
      const out: Instance[] = [];
      for (const pl of w.places) {
        if (!w.rng.chance(0.009)) continue;
        const staff = w.rng.shuffle(live(w).filter(p => p.job === pl.id && !p.lead)).slice(0, 3);
        const job = w.rng.pick(['the big order', 'the audit', 'the inspection', 'the end-of-year figures', 'the rush job']);
        for (const p of staff) {
          if ((p.tried['deadline']?.t ?? -99) > w.t - 10) continue;
          learned(w, p, 'deadline', true);
          const feats = new Set<Feature>([
            'pressure',
            'public',
            ...(pl.lead != null ? ['authority' as Feature] : []),
            ...(p.stress > 0.5 ? ['tired' as Feature] : []),
          ]);
          out.push({
            type: 'deadline',
            actor: p,
            others: [],
            thing: job,
            features: feats,
            families: ['duty', 'lapse'],
            only: { duty: ['deliver', 'allnighter', 'redo'], lapse: ['late', 'rough'] },
            causeLabel: `${job} landed on ${pl.name}`,
            place: pl.name,
            w: 1,
            familyExtra: { duty: [facetC(p, 'perfectionism', feats, 1, 4)] },
            extra: [favour(stateC('load', p.stress > 0.5 ? 'already stretched' : 'had room for it', p.stress, -1, 0.3), 'duty')],
          });
        }
      }
      return out;
    },
  },
  // Newcomer: someone new in town, and how people take to a stranger.
  {
    id: 'newcomer',
    match(w) {
      const out: Instance[] = [];
      const arrived = recentEvents(w, w.t - 1).filter(
        e => e.t === w.t - 1 && (e.type === 'arrived' || (e.type === 'home' && w.t - (P(w, e.who[0]).awaySince ?? w.t) > 60)),
      );
      for (const e of arrived) {
        const n = P(w, e.who[0]);
        if (n.status !== 'in') continue;
        const pool = live(w).filter(
          q => q !== n && age(w, q) >= 16 && (q.job === n.job || (q.job && w.placeById.get(q.job)!.people >= 0.8) || n.circle.includes(q.id)),
        );
        for (const q of w.rng.shuffle(pool).slice(0, 2))
          out.push({
            type: 'newcomer',
            actor: q,
            target: n,
            others: [],
            thing: '',
            features: new Set<Feature>(['stranger', 'public']),
            families: ['warmth', 'withdrawal'],
            only: { warmth: ['welcome'], withdrawal: ['coolto'] },
            cause: e.id,
            w: 0.9,
          });
      }
      return out;
    },
  },
  // Asked: the boss wants an honest opinion. Authority, in private.
  {
    id: 'asked',
    match(w) {
      const out: Instance[] = [];
      for (const pl of w.places) {
        if (pl.lead == null || !w.rng.chance(0.022)) continue;
        const lead = P(w, pl.lead);
        const staff = live(w).filter(p => p.job === pl.id && p !== lead);
        if (!staff.length) continue;
        const p = w.rng.pick(staff);
        if ((p.tried['asked']?.t ?? -99) > w.t - 12) continue;
        learned(w, p, 'asked', true);
        const plan = OFF.has('projects') ? undefined : (projectLabel(w, lead) ?? placePlan(w, pl)); // a real plan: the boss's own, or the workplace's
        out.push({
          type: 'asked',
          actor: p,
          target: lead,
          others: [],
          thing: plan ? plan.replace(/^(her|his) plan /, 'the plan ').replace(/^the plan (.*)$/, 'the plan $1') : 'the plan',
          features: new Set<Feature>(['authority', 'private', 'standing']),
          families: ['honesty', 'dishonesty'],
          only: { honesty: ['straighttalk'], dishonesty: ['flatter'] },
          causeLabel: `@${lead.id} asked what ${p.sex === 'f' ? 'she' : 'he'} really thought of ${plan ?? 'the plan'}`,
          w: 0.9,
          familyExtra: { dishonesty: [bondC(w, p, lead, 'trust', -1)], honesty: [bondC(w, p, lead, 'respect', 1)] },
        });
      }
      return out;
    },
  },
  // Danger: an accident at work, and who goes in.
  {
    id: 'danger',
    match(w) {
      const out: Instance[] = [];
      for (const pl of ['mill', 'garage', 'harbour']) {
        if (!w.rng.chance(0.0045)) continue;
        const staff = live(w).filter(p => p.job === pl);
        if (staff.length < 2) continue;
        const v = w.rng.pick(staff);
        const what = pl === 'mill' ? 'got caught in the saw' : pl === 'garage' ? 'was pinned under a car' : 'went over the side';
        v.ill = 2 + w.rng.int(0, 4);
        v.health = clamp(v.health - 0.2, 0.05, 1);
        const e = addEvent(w, {
          type: 'accident',
          who: [v.id],
          text: `@${v.id} ${what} at ${w.placeById.get(pl)!.name}.`,
          causes: [stateCause('an accident at work', 1)],
          vis: 'public',
          evidence: [],
          w: 2,
        });
        broadcast(w, e);
        addEmotion(w, v, 'ill', 'shaken', -0.15, v.ill, e.id);
        for (const p of staff)
          if (p !== v)
            out.push({
              type: 'danger',
              actor: p,
              target: v,
              others: [],
              thing: '',
              features: new Set<Feature>(['danger', 'public', 'need', ...(p.friends.has(v.id) ? ['friend' as Feature] : [])]),
              families: ['courage', 'caution'],
              only: { courage: ['rescue'], caution: ['froze'] },
              cause: e.id,
              place: w.placeById.get(pl)!.name,
              w: 1.8,
              familyExtra: { courage: [bondC(w, p, v, 'like', 1, 3)] },
            });
      }
      return out;
    },
  },
  // Home truths: someone close asks how things really are. Family, in private, and something to hide.
  {
    id: 'hometruth',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (age(w, p) < 16 || p.stress < 0.35 || !w.rng.chance(0.03) || (p.tried['hometruth']?.t ?? -99) > w.t - 12) continue;
        const close = [...(p.partner != null ? [P(w, p.partner)] : []), ...p.parents.map(k => P(w, k))].filter(q => q.status === 'in');
        if (!close.length) continue;
        const q = close[0];
        const src = topSources(p, 1)[0];
        if (!src) continue;
        learned(w, p, 'hometruth', true);
        // If this person looked away from the trouble a few months ago, asking now is a turn, and the text says so; in the first weeks after, nobody asks.
        const looked = q.tried['lookaway:' + p.id];
        if (looked && w.t - looked.t < 3) continue;
        const turn = looked && w.t - looked.t <= 18;
        out.push({
          type: 'hometruth',
          actor: p,
          target: q,
          others: [],
          thing: src.label,
          features: new Set<Feature>(['family', 'private', ...(p.stress > 0.6 ? ['tired' as Feature] : [])]),
          families: ['honesty', 'dishonesty'],
          only: { honesty: ['admit'], dishonesty: ['allfine'] },
          causeLabel: turn ? `@${q.id} had said nothing for months, then asked how things really were` : `@${q.id} asked how things really were`,
          w: 0.9,
          familyExtra: { honesty: [bondC(w, p, q, 'trust', 1)] },
        });
      }
      return out;
    },
  },
  // Criticised: a coworker questions their work in front of everyone.
  {
    id: 'criticised',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (!p.job || !w.rng.chance(0.005) || (p.tried['criticised']?.t ?? -99) > w.t - 18) continue;
        const others = live(w).filter(q => q.job === p.job && q !== p);
        if (!others.length) continue;
        const q = others.sort((a, b) => facet(a, 'gentleness') - facet(b, 'gentleness'))[0];
        if (facet(q, 'gentleness') > 0.5 && !w.rng.chance(0.3)) continue;
        learned(w, p, 'criticised', true);
        out.push({
          type: 'criticised',
          actor: p,
          target: q,
          others: [],
          thing: '',
          features: new Set<Feature>(['public', 'challenged', 'standing', ...(q.lead ? ['authority' as Feature] : [])]),
          families: ['anger', 'humility', 'pride'],
          only: { anger: ['snap', 'quietword', 'sarcasm', 'cold'], humility: ['swallow', 'giveway'], pride: ['confront', 'digin'] },
          causeLabel: `@${q.id} picked @${p.id}'s work apart in front of everyone`,
          place: w.placeById.get(p.job)!.name,
          w: 0.9,
          familyExtra: {
            humility: [
              pubC('fair', p.perf < -0.3 ? 'the criticism was fair' : 'the criticism was unfair', p.perf < -0.3 ? 0.8 : 0.25),
              facetC(p, 'socialSelfEsteem', new Set<Feature>(['public', 'challenged']), -1, 4),
            ],
            anger: [pubC('unfair', p.perf < -0.3 ? 'the criticism was fair' : 'the criticism was unfair', p.perf < -0.3 ? 0.2 : 0.75)],
          },
        });
      }
      return out;
    },
  },
  // The collection: the hat goes round at the Anchor for someone hit by illness or loss. Money and need, in the open.
  {
    id: 'collection',
    match(w) {
      const out: Instance[] = [];
      const bar = w.placeById.get('bar');
      const hit = recentEvents(w, w.t - 2).filter(
        e => e.t < w.t && (e.type === 'ill' || e.type === 'accident' || (e.type === 'death' && e.who.length > 1)),
      );
      for (const e0 of hit) {
        const x = e0.type === 'death' ? P(w, e0.who[1]) : P(w, e0.who[0]);
        if (!x || x.status !== 'in' || (x.tried['collection']?.t ?? -99) > w.t - 24 || !w.rng.chance(0.5)) continue;
        learned(w, x, 'collection', true);
        const pool = live(w).filter(
          q =>
            q !== x &&
            age(w, q) >= 18 &&
            !family(q, x) &&
            q.partner !== x.id &&
            (OFF.has('respond') || regard(w, q.id, x.id) > -0.2) &&
            ((q.job && q.job === x.job) || q.circle.includes(x.id) || x.circle.includes(q.id) || q.friends.has(x.id) || w.rng.chance(0.15)),
        );
        for (const q of w.rng.shuffle(pool).slice(0, 3 + w.rng.int(0, 2))) {
          const back = OFF.has('reciprocity') ? [] : reciprocity(w, q, x);
          out.push({
            type: 'collection',
            actor: q,
            target: x,
            others: [],
            thing: '',
            features: new Set<Feature>(['public', 'money', 'need', ...(q.friends.has(x.id) ? ['friend' as Feature] : [])]),
            families: ['generosity', 'refusal'],
            only: { generosity: ['chipin', 'quietgive'], refusal: ['token', 'nowallet'] },
            cause: e0.id,
            place: bar?.name,
            w: 0.9,
            extra: [
              favour(
                closeC('money', q.savings < 0 ? 'short of money' : 'money is fine', q.savings < 0 ? 0.85 : 0.25, -1, 0.3, undefined, 0.3),
                'generosity',
              ),
            ],
            familyExtra: { generosity: [...back.map(b => b.generosity), bondC(w, q, x, 'like', 1, 3)], refusal: back.map(b => b.refusal) },
          });
        }
      }
      return out;
    },
  },
  // The old wound: months after a slight, the two meet again where others can see. Forgiveness shows.
  {
    id: 'oldwound',
    match(w) {
      const out: Instance[] = [];
      for (const p of live(w)) {
        if (age(w, p) < 16 || !w.rng.chance(0.06)) continue;
        const cands: [Person, { t: number; ev: number; text: string }][] = [];
        for (const q of live(w)) {
          if (q === p || (p.tried['oldwound:' + q.id]?.t ?? -99) > w.t - 24) continue;
          const shared = (p.job && p.job === q.job) || p.circle.includes(q.id) || (p.group != null && p.group === q.group);
          if (!shared) continue;
          const r = peekBond(w, p.id, q.id);
          if (!r) continue;
          const m = r.mem
            .filter(m => m.like + m.trust < -0.15 && w.t - m.t >= 3 && w.t - m.t <= 24 && m.ev >= 0)
            .sort((a, b) => a.like + a.trust - (b.like + b.trust))[0];
          if (m) cands.push([q, m]);
        }
        if (!cands.length) continue;
        const [q, m] = w.rng.pick(cands);
        learned(w, p, 'oldwound:' + q.id, true);
        const pub = !!(p.job && p.job === q.job);
        out.push({
          type: 'oldwound',
          actor: p,
          target: q,
          others: [],
          thing: `what @${q.id} did ${w.t - m.t >= 9 ? 'last year' : 'a few months back'}`,
          features: new Set<Feature>([
            pub ? 'public' : 'private',
            'standing',
            ...(p.friends.has(q.id) ? ['friend' as Feature] : []),
            ...(family(p, q) ? ['family' as Feature] : []),
          ]),
          families: ['leniency', 'severity'],
          only: { leniency: ['letgo'], severity: ['rake'] },
          cause: m.ev,
          place: pub ? w.placeById.get(p.job!)!.name : undefined,
          w: 0.9,
          familyExtra: {
            leniency: [facetC(p, 'forgiveness', new Set<Feature>([pub ? 'public' : 'private']), 1, 6), bondC(w, p, q, 'like', 1, 3)],
            severity: [facetC(p, 'forgiveness', new Set<Feature>([pub ? 'public' : 'private']), -1, 6), bondC(w, p, q, 'like', -1, 3)],
          },
        });
      }
      return out;
    },
  },
  // The harbour day: once a year someone has to organise it. Who steps up, and whether the day runs, is public.
  {
    id: 'harbourday',
    match(w) {
      if (w.t % 12 !== 4 || w.t < w.startPresent - 120) return [];
      const bar = w.placeById.get('bar');
      const pool = w.rng.shuffle(live(w).filter(p => age(w, p) >= 20 && age(w, p) < 70 && !p.ill)).slice(0, 5);
      (w as any).harbourPool = pool.slice(1);
      (w as any).harbourOrganiser = undefined;
      return pool.slice(0, 1).map(p => harbourAsk(w, p));
    },
  },
];
function harbourAsk(w: World, p: Person): Instance {
  const bar = w.placeById.get('bar');
  return {
    type: 'harbourday',
    actor: p,
    others: [],
    thing: '',
    features: new Set<Feature>(['public', 'standing', 'pressure']),
    families: ['duty', 'lapse'] as Family[],
    only: { duty: ['stepup'], lapse: ['leaveit'] },
    causeLabel: 'the harbour day needed someone to run it',
    place: bar?.name,
    w: 0.8,
    extra: [favour(stateC('load', p.stress > 0.5 ? 'already stretched' : 'had room for it', p.stress, -1, 0.3), 'duty')],
  };
}
// The harbour day itself, a month after someone took it on: organisation and diligence, with everyone there.
function harbourDay(w: World) {
  const org = (w as any).harbourOrganiser as { id: number; t: number; ev: number } | undefined;
  if (!org) return;
  if (w.t - org.t < 1) return;
  (w as any).harbourOrganiser = undefined;
  const p = P(w, org.id);
  if (p.status !== 'in') return;
  const z = 0.7 * facet(p, 'organisation') + 0.4 * facet(p, 'diligence') - 0.3 * Math.max(0, p.stress - 0.5) + w.rng.normal() * 0.5 * p.variability;
  if (Math.abs(z) < 0.35) {
    const e = addEvent(w, {
      type: 'harbour:ok',
      who: [p.id],
      text: `The harbour day went off well enough, with @${p.id} running it.`,
      causes: [eventCause(w, org.ev, 0.6), traitCause(p, 'organisation', 0.4)],
      vis: 'public',
      evidence: [ev(p.id, 'organisation', Math.sign(z) || 1, 0.3, 0.6)],
      w: 0.8,
    });
    broadcast(w, e);
    return;
  }
  const good = z > 0;
  const e = addEvent(w, {
    type: good ? 'harbour:ran' : 'harbour:chaos',
    who: [p.id],
    text: good
      ? `The harbour day ran like clockwork; @${p.id} had a list for everything.`
      : `The harbour day was chaos: nobody knew where the tables were, and @${p.id} was nowhere to be found.`,
    causes: [eventCause(w, org.ev, 0.5), traitCause(p, 'organisation', 0.5, good ? 1 : -1), traitCause(p, 'diligence', 0.3, good ? 1 : -1)],
    vis: 'public',
    evidence: [ev(p.id, 'organisation', good ? 1 : -1, 1, 0.85), ev(p.id, 'diligence', good ? 1 : -1, 0.5, 0.6)],
    w: 1.4,
  });
  broadcast(w, e);
  for (const q of w.rng.shuffle(live(w).filter(q => q !== p && age(w, q) >= 16)).slice(0, 6))
    remember(w, q, p, e.id, good ? 0.08 : -0.06, good ? 0.2 : -0.2, good ? 0.05 : -0.05, good ? 'ran the harbour day' : 'the harbour day fiasco');
  if (good) addEmotion(w, p, 'harbour', 'proud of the day', 0.12, 6, e.id);
  else {
    addStress(p, 'harbour', 'the harbour day', 0.08, e.id);
    addEmotion(w, p, 'harbour', 'embarrassed about the day', -0.1, 6, e.id);
  }
}
// Spotlight: doing the job with everyone watching. Not a choice, a test of nerve, so the if-then for being watched gets its day.
export function spotlightTick(w: World) {
  for (const p of live(w)) {
    if (!p.job || p.lead || !w.rng.chance(0.006) || (p.tried['spotlight']?.t ?? -99) > w.t - 18) continue;
    learned(w, p, 'spotlight', true);
    const pl = w.placeById.get(p.job)!;
    const feats = new Set<Feature>(['watched', 'public', 'authority']);
    const occasion = w.rng.pick(['the inspection', 'the open day', 'the visit from head office', 'the day the council came round']);
    const nerves = facet(p, 'anxiety', undefined, feats) - 0.5 * facet(p, 'socialBoldness', undefined, feats) + w.rng.normal() * 0.6 * p.variability;
    if (Math.abs(nerves) < 0.5) continue;
    const it = p.ifThens.find(x => feats.has(x.feature) && (x.facet === 'anxiety' || x.facet === 'socialBoldness'));
    const e = addEvent(w, {
      type: nerves > 0 ? 'froze' : 'rose',
      who: [p.id],
      text:
        nerves > 0 ? `@${p.id} went to pieces during ${occasion} at ${pl.name}.` : `@${p.id} was the one who shone during ${occasion} at ${pl.name}.`,
      causes: [
        traitCause(p, 'anxiety', 0.6, nerves > 0 ? 1 : -1),
        traitCause(p, 'socialBoldness', 0.4, nerves > 0 ? -1 : 1),
        ...(it ? [{ kind: 'trait', label: it.words, weight: 0.4, key: it.facet, who: p.id } as Cause] : []),
      ],
      vis: 'local',
      evidence: [
        ...(nerves > 0
          ? [ev(p.id, 'anxiety', 1, 1, 0.85), ev(p.id, 'socialBoldness', -1, 0.6, 0.6)]
          : [ev(p.id, 'anxiety', -1, 0.8, 0.7), ev(p.id, 'socialBoldness', 1, 0.8, 0.7)]),
        ...(it ? [ev(p.id, `ifthen:${it.feature}:${it.facet}`, Math.sign(it.shift), Math.min(1.5, Math.abs(it.shift) * 0.6), 0.7)] : []),
      ],
      w: nerves > 0 ? 1 : 0.8,
    });
    broadcast(w, e);
    if (nerves > 0) addStress(p, 'froze', occasion, 0.06, e.id);
    else {
      const lead = pl.lead != null ? P(w, pl.lead) : null;
      if (lead) remember(w, lead, p, e.id, 0.1, 0.2, 0.05, 'shone when it counted');
    }
  }
}

// Hooks for world effects after specific expressions in specific types.
export function afterRun(w: World, inst: Instance, out: Outcome) {
  const p = inst.actor,
    e = out.event,
    x = out.expr;
  switch (inst.type) {
    case 'harbourday': {
      if (x.id === 'stepup') {
        if (!(w as any).harbourOrganiser) (w as any).harbourOrganiser = { id: p.id, t: w.t, ev: e.id };
        break;
      }
      const pool = ((w as any).harbourPool ?? []) as Person[];
      const next = pool.shift();
      if (next && next.status === 'in') w.queue.push(harbourAsk(w, next));
      break;
    }
    case 'temptation':
      if (x.family === 'dishonesty') {
        if (x.id === 'skim') p.savings += 2;
        if (w.rng.chance(0.3)) {
          const pl = w.placeById.get(p.job!)!;
          const lead = pl.lead != null && pl.lead !== p.id ? P(w, pl.lead) : null;
          const e2 = addEvent(w, {
            type: 'caught',
            who: [p.id, ...(lead ? [lead.id] : [])],
            text: `@${p.id} was found out: ${x.id === 'skim' ? `taking from ${inst.thing || 'what was not theirs'}` : x.id === 'blame' ? `@${inst.target!.id} had been blamed for @${p.id}'s mistake` : 'the cover-up came out'}.`,
            causes: [eventCause(w, e.id, 0.8), traitCause(p, 'organisation', 0.2, -1)],
            vis: 'local',
            evidence:
              x.id === 'skim'
                ? [ev(p.id, 'fairness', -1, 1, 0.95), ev(p.id, 'sincerity', -1, 0.4, 0.7)]
                : [ev(p.id, 'sincerity', -1, 1, 0.95), ev(p.id, 'fairness', -1, 0.4, 0.7)],
            w: 2,
          });
          broadcast(w, e2);
          learnOf(w, lead?.id ?? -1, e, 1);
          for (const q of live(w))
            if (q.job === p.job && q !== p)
              remember(w, q, p, e2.id, -0.25, -0.3, -0.5, `found out ${x.id === 'skim' ? 'taking from the till' : 'lying'}`);
          addStress(p, 'caught', 'being found out', 0.14, e2.id);
          addEmotion(w, p, 'shame', 'ashamed', -0.12 * z01(facet(p, 'fairness')), 4, e2.id);
          p.secrets = p.secrets.filter(s => s !== e.id);
        }
      }
      break;
    case 'risk':
      if (x.family === 'courage') {
        p.savings += 1.5;
        if (w.rng.chance(0.06)) {
          p.ill = 2 + w.rng.int(0, 3);
          p.health = clamp(p.health - 0.25, 0.05, 1);
          const e2 = addEvent(w, {
            type: 'ill',
            who: [p.id],
            text: `@${p.id} was badly hurt when the boat was caught by a wave.`,
            causes: [eventCause(w, e.id, 0.6), traitCause(p, 'fearfulness', 0.4, -1)],
            vis: 'public',
            evidence: [],
            w: 2,
          });
          broadcast(w, e2);
          addEmotion(w, p, 'ill', 'shaken', -0.15, p.ill, e2.id);
          if (facet(p, 'fearfulness') > -0.5 && !p.marks.some(m => m.key === 'sea')) {
            p.facets.fearfulness += 0.8 * plasticity(w, p);
            p.marks.push({ t: w.t, key: 'sea', delta: 0.8, cause: e2.id, text: 'has not been easy at sea since the wave' });
          }
        }
      }
      break;
    case 'offer':
      if (x.family === 'openness') {
        w.hooks.leaveTown(w, p, 'work', `@${p.id} left ${SETTING.name} for the city.`, [eventCause(w, e.id, 1)], undefined);
      } else {
        for (const x2 of p.wants) if (x2.kind === 'escape' && !x2.done) x2.urgency += 0.1;
      }
      break;
    case 'chance':
      if (x.family === 'openness') {
        const staged = onStage(p);
        const sk = staged ? staged.target : SETTING.hobbies.find(h => p.skills[h] && p.skills[h].r > 1200)!;
        const r = p.skills[sk].r;
        const nerves = facet(p, 'anxiety', undefined, inst.features) + w.rng.normal() * 0.6 * p.variability;
        const good = (r - 1150) / 250 - Math.max(0, nerves) * 0.6 + w.rng.normal() * 0.3 * p.variability;
        const e2 = addEvent(w, {
          type: 'performed',
          who: [p.id],
          text:
            good > 0.8
              ? `@${p.id} played the Anchor's open night and the room went quiet.`
              : good > 0.1
                ? `@${p.id} played the Anchor's open night and did well.`
                : `@${p.id} played the Anchor's open night and fell apart.`,
          causes: [
            eventCause(w, e.id, 0.3),
            stateCause(`${sk} ${r > 1400 ? 'far better than anyone knew' : 'good, not great'}`, 0.5),
            ...(nerves > 0.6 ? [traitCause(p, 'anxiety', 0.4, 1)] : []),
          ],
          vis: 'public',
          evidence: [
            ev(p.id, 'skill:' + sk, good > 0.1 ? 1 : -1, Math.min(1.5, Math.abs(good)), 0.85),
            ...(nerves > 0.6 ? [ev(p.id, 'anxiety', 1, 0.8, 0.7)] : []),
          ],
          w: good > 0.8 ? 2.5 : 1.2,
        });
        broadcast(w, e2);
        addEmotion(
          w,
          p,
          'perf',
          good > 0.1 ? 'still buzzing from the open night' : 'humiliated at the open night',
          good > 0.1 ? 0.15 : -0.15,
          6,
          e2.id,
        );
        if (good > 0.8)
          for (const q of live(w))
            if (q !== p && peekBond(w, q.id, p.id)) {
              const b = bond(w, q.id, p.id);
              b.respect = clamp(b.respect + 0.2, -1, 1);
            }
        if (staged) {
          if (good > 0.1) resolveWants(w, p, 'prove', staged.target, 'achieved', e2.id);
          else if (
            obstacle(
              w,
              p,
              staged,
              wantLabel(w, p, staged),
              'fell apart at the open night',
              e2.id,
              (w.t - staged.pursuit!.since) / 12,
              staged.pursuit!.progress,
            ) === 'giveup'
          )
            giveUpWant(w, p, staged, (staged as any).obstacleRec);
        }
      } else if (onStage(p)) {
        const staged = onStage(p)!;
        if (
          obstacle(
            w,
            p,
            staged,
            wantLabel(w, p, staged),
            'lost ' + (p.sex === 'f' ? 'her' : 'his') + ' nerve at the open night',
            e.id,
            (w.t - staged.pursuit!.since) / 12,
            staged.pursuit!.progress,
          ) === 'giveup'
        )
          giveUpWant(w, p, staged, (staged as any).obstacleRec);
      }
      break;
    case 'request':
      if (x.family === 'seeking' && inst.target && ['ask', 'hint', 'confide'].includes(x.id)) {
        const q = inst.target;
        const need = inst.thing;
        const times = q.tried['helped:' + p.id]?.n ?? 0;
        const feats = new Set<Feature>(['private', 'need', need === 'money' ? 'money' : 'safety', family(p, q) ? 'family' : 'friend']);
        const o2 = run(w, {
          type: 'request-answer',
          actor: q,
          target: p,
          others: [],
          thing: need === 'money' ? 'the money' : 'help',
          features: feats,
          families: ['generosity', 'refusal'],
          only: { generosity: ['give', 'grudging'], refusal: ['refuse', 'excuse'] },
          cause: e.id,
          familyExtra: {
            generosity: [
              bondC(w, q, p, 'like', 1),
              ...(need === 'money'
                ? [closeC('own', q.savings > 10 ? 'can spare it' : 'short themselves', clamp(q.savings / 15, 0, 1), 1, 0.2, undefined, 0.6)]
                : []),
              privC(
                'times',
                times ? `has already helped @${p.id} ${times} time${times > 1 ? 's' : ''}` : 'first time asked',
                clamp(times / 3, 0, 1),
                -1,
                0.15,
                undefined,
                0.15,
              ),
            ],
            refusal: [],
          },
          w: 1.2,
        });
        if (o2 && o2.family === 'generosity') {
          if (need === 'money') {
            const amt = Math.min(Math.max(2, q.savings * 0.3), -p.savings + 1);
            q.savings -= amt;
            p.savings += amt;
          }
          learned(w, p, 'ask', true);
          learned(w, p, 'ask:' + q.id, true);
          learned(w, q, 'helped:' + p.id, true);
          addEmotion(w, p, 'helped', 'grateful', 0.1, 6, o2.event.id);
        } else if (o2) {
          learned(w, p, 'ask', false);
          learned(w, p, 'ask:' + q.id, false);
          if (facet(p, 'forgiveness') < -1.2 && p.savings < -8) addException(p, q, 'forgiveness', o2.event.id, `never forgave @${q.id}`);
        }
      }
      break;
    case 'confide':
      if (x.family === 'seeking' && inst.target) {
        const q = inst.target;
        const sid = p.secrets[p.secrets.length - 1];
        const se = w.events[sid];
        p.secrets = p.secrets.filter(s => s !== sid);
        learnOf(w, q.id, se, 0.9);
        const o2 = run(w, {
          type: 'discovery',
          actor: q,
          target: p,
          others: [],
          thing: 'it',
          features: new Set<Feature>(['private', family(p, q) ? 'family' : 'friend']),
          families: ['discretion', 'disclosure'],
          only: { discretion: ['keepsecret'], disclosure: ['tell', 'confrontsecret'] },
          cause: e.id,
          familyExtra: { discretion: [bondC(w, q, p, 'like', 1)] },
          w: 1,
        });
        if (o2 && o2.expr.id === 'tell') {
          const hearers = [...friendsOf(w, q), ...q.circle.map(i => P(w, i)).filter(h => h.status === 'in')].filter(h => h !== p).slice(0, 3);
          for (const h of hearers) learnOf(w, h.id, se, 0.6);
          if (w.rng.chance(0.5)) {
            const e3 = addEvent(w, {
              type: 'betrayed',
              who: [p.id, q.id],
              text: `It got back to @${p.id} that @${q.id} had been talking.`,
              causes: [eventCause(w, o2.event.id, 1)],
              vis: 'local',
              evidence: [],
              w: 2,
            });
            broadcast(w, e3);
            remember(w, p, q, e3.id, -0.5, -0.3, -0.7, 'told everyone what I told them in confidence');
            p.friends.delete(q.id);
            q.friends.delete(p.id);
            if (facet(p, 'forgiveness') < -0.8) addException(p, q, 'forgiveness', e3.id, `never forgave @${q.id} for talking`);
          }
        } else if (o2 && o2.expr.id === 'confrontsecret') {
          /* handled by provocation queue */
        }
      }
      break;
    case 'strain':
      if (x.id === 'confide' && inst.target) {
        remember(w, p, inst.target, e.id, 0.15, 0, 0.25, 'was there when it mattered');
      }
      break;
    case 'deadline': {
      const pl = w.placeById.get(p.job!)!;
      const lead = pl.lead != null && pl.lead !== p.id ? P(w, pl.lead) : null;
      if (x.id === 'late') {
        p.perf -= 0.3;
        addStress(p, 'late', `missing the deadline on ${inst.thing}`, 0.08, e.id);
        if (lead) remember(w, lead, p, e.id, -0.15, -0.3, -0.2, `let us down on ${inst.thing}`);
        for (const q of live(w))
          if (q.job === p.job && q !== p && q !== lead) {
            const r = bond(w, q.id, p.id);
            r.respect = clamp(r.respect - 0.1, -1, 1);
          }
      } else {
        p.perf += 0.15;
        if (lead) remember(w, lead, p, e.id, 0.08, 0.2, 0.1, `came through on ${inst.thing}`);
        if (x.id === 'allnighter') addStress(p, 'allnighter', 'the all-nighter', 0.04, e.id);
      }
      break;
    }
    case 'newcomer': {
      const n = inst.target!;
      const r = bond(w, n.id, p.id);
      if (x.id === 'welcome') {
        r.fam = Math.min(1, r.fam + 0.3);
        remember(w, n, p, e.id, 0.25, 0.05, 0.2, 'made me welcome');
        bond(w, p.id, n.id).fam = Math.min(1, bond(w, p.id, n.id).fam + 0.3);
      } else remember(w, n, p, e.id, -0.1, 0, -0.05, 'kept me at a distance');
      break;
    }
    case 'asked': {
      const lead = inst.target!;
      if (x.id === 'straighttalk') {
        if (facet(lead, 'modesty', p.id) < -1 || facet(lead, 'patience') < -1) {
          remember(w, lead, p, e.id, -0.2, 0.1, 0, 'told me what was wrong with my plan, in that tone');
          queueProvocation(w, lead, p, e, false);
        } else remember(w, lead, p, e.id, 0.05, 0.25, 0.2, 'told me straight when I asked');
      } else {
        if (facet(lead, 'sincerity') > 0.8 && lead.aptitudes.socialInsight > 0.3)
          remember(w, lead, p, e.id, -0.05, -0.1, -0.2, 'told me what I wanted to hear');
        else remember(w, lead, p, e.id, 0.1, 0, 0.02, 'backed the plan');
      }
      break;
    }
    case 'danger': {
      const v = inst.target!;
      if (x.id === 'rescue') {
        remember(w, v, p, e.id, 0.5, 0.4, 0.5, 'came in after me');
        for (const q of live(w))
          if (q.job === p.job && q !== p) {
            const r = bond(w, q.id, p.id);
            r.respect = clamp(r.respect + 0.3, -1, 1);
          }
        if (w.rng.chance(0.15)) {
          p.ill = 1 + w.rng.int(0, 2);
          addEmotion(w, p, 'ill', 'banged up', -0.08, p.ill, e.id);
        }
      } else {
        remember(w, v, p, e.id, -0.2, -0.3, -0.2, 'froze when I needed help');
        if (facet(p, 'fearfulness') < 0.5 && !p.marks.some(m => m.key === 'froze'))
          p.marks.push({ t: w.t, key: 'froze', delta: 0, cause: e.id, text: `has not forgiven ${self(p)} for freezing at ${inst.place}` });
        addStress(p, 'froze', 'freezing when it mattered', 0.1, e.id);
      }
      break;
    }
    case 'criticised': {
      const q = inst.target!;
      if (x.id === 'confront' || x.id === 'snap' || x.id === 'sarcasm') {
        if (facet(q, 'patience', p.id) < -0.3 && w.rng.chance(0.5)) {
          const e2 = addEvent(w, {
            type: 'row',
            who: [p.id, q.id],
            text: `It turned into a row in front of everyone at ${inst.place}.`,
            causes: [eventCause(w, e.id, 0.6), traitCause(q, 'patience', 0.4, -1)],
            vis: 'local',
            evidence: [ev(q.id, 'patience', -1, 0.8, 0.8)],
            w: 1.3,
          });
          broadcast(w, e2);
          remember(w, p, q, e2.id, -0.2, -0.1, -0.1, 'went for me in front of everyone');
        }
      } else if (x.id === 'swallow' && p.perf > -0.3) addStress(p, 'swallowed', `taking @${q.id}'s criticism in silence`, 0.05, e.id);
      break;
    }
  }
}
export function addException(p: Person, other: Person, key: string, cause: number, text: string) {
  if (p.exceptions.length >= 2 || p.exceptions.some(x => x.other === other.id && x.key === key)) return;
  p.exceptions.push({ key, other: other.id, strength: -2.2, cause, text });
}

// Run every type's matcher, then the queue from last tick.
export function situationsTick(w: World) {
  const pending: Instance[] = w.queue.splice(0, w.queue.length);
  for (const inst of pending) {
    if (inst.actor.status !== 'in') continue;
    const o = run(w, inst);
    if (o) afterRun(w, inst, o);
  }
  harbourDay(w);
  const found: Instance[] = [];
  for (const ty of TYPES) found.push(...ty.match(w));
  // One situation per actor per tick, the most consequential first.
  const seen = new Set<number>();
  for (const inst of found.sort((a, b) => (b.w ?? 1) - (a.w ?? 1))) {
    if (seen.has(inst.actor.id) || inst.actor.status !== 'in') continue;
    seen.add(inst.actor.id);
    const o = run(w, inst);
    if (o) afterRun(w, inst, o);
  }
}

// Situations other systems raise directly (contests, judgements, losses).
export function contestLost(w: World, loser: Person, winner: Person, place: any, ref: number, deserved: boolean, wanted: boolean) {
  const feats = new Set<Feature>(['public', 'standing', 'authority']);
  const inst: Instance = {
    type: 'contest',
    actor: loser,
    target: winner,
    others: [],
    thing: place.title,
    features: feats,
    families: ['pride', 'humility', 'anger'],
    only: { humility: ['congratulate', 'swallow'], pride: ['confront', 'sulk', 'quitpride'] },
    cause: ref,
    place: place.name,
    w: 1.6,
    extra: [
      favour(
        pubC(
          'sting',
          deserved
            ? `had been doing the better work`
            : wanted
              ? `had wanted it since ${year(loser.wants.find(x => x.kind === 'attain' && x.target === place.id)?.since ?? w.t)}`
              : 'had hoped',
          deserved ? 0.9 : wanted ? 0.7 : 0.4,
        ),
        'pride',
        'anger',
      ),
    ],
    familyExtra: {
      pride: [bondC(w, loser, winner, 'respect', -1)],
      humility: [bondC(w, loser, winner, 'like', 1)],
      anger: [bondC(w, loser, winner, 'like', -1)],
    },
  };
  const o = run(w, inst);
  if (!o) return;
  if (o.expr.id === 'confront' && facet(winner, 'patience', loser.id, feats) < -0.5) {
    const e2 = addEvent(w, {
      type: 'row',
      who: [winner.id, loser.id],
      text: `It turned into a shouting match in front of everyone at ${place.name}.`,
      causes: [eventCause(w, o.event.id, 0.6), traitCause(winner, 'patience', 0.4, -1)],
      vis: 'local',
      evidence: [ev(winner.id, 'patience', -1, 1, 0.9)],
      w: 1.5,
    });
    broadcast(w, e2);
    remember(w, loser, winner, e2.id, -0.3, -0.2, -0.1, 'shouted me down');
  }
  return o;
}

export function judgement(w: World, lead: Person, s: Person, place: any): 'dismiss' | 'dressdown' | 'secondchance' | null {
  if ((lead.tried['judged:' + s.id]?.t ?? -99) > w.t - 12) return null;
  learned(w, lead, 'judged:' + s.id, true);
  const inst: Instance = {
    type: 'judgement',
    actor: lead,
    target: s,
    others: [],
    thing: place.name,
    features: new Set<Feature>(['authority', 'standing', 'public']),
    families: ['severity', 'leniency'],
    only: { severity: ['dismiss', 'dressdown'], leniency: ['secondchance'] },
    place: place.name,
    causeLabel: `@${s.id}'s work had been poor for months`,
    w: 1.5,
    familyExtra: {
      severity: [bondC(w, lead, s, 'like', -1), pubC('perf', `@${s.id}'s work has been poor for months`, clamp((-s.perf - 0.5) / 1.5, 0, 1))],
      leniency: [bondC(w, lead, s, 'like', 1)],
    },
  };
  const o = run(w, inst);
  if (!o) return null;
  if (o.expr.id === 'dressdown') {
    // Someone may stand up for them.
    const ally = live(w)
      .filter(q => q.job === s.job && q !== s && q !== lead && regard(w, q.id, s.id) > -0.1)
      .sort((a, b) => regard(w, b.id, s.id) - regard(w, a.id, s.id))[0];
    if (ally) {
      const o2 = run(w, {
        type: 'standup',
        actor: ally,
        target: s,
        others: [lead],
        thing: '',
        features: new Set<Feature>(['public', 'authority', 'need']),
        families: ['courage', 'caution'],
        only: { courage: ['speakup'], caution: ['keepquiet'] },
        cause: o.event.id,
        place: place.name,
        familyExtra: { courage: [bondC(w, ally, s, 'like', 1)], caution: [bondC(w, ally, lead, 'respect', 1)] },
        w: 1.3,
      });
      if (o2 && o2.family === 'courage') {
        remember(w, lead, ally, o2.event.id, -0.15, 0.1, 0, 'took the other side');
      }
    }
  }
  return o.expr.id as any;
}
export function loss(w: World, p: Person, ref: number, what: string) {
  // The bereaved cope; their friends show up, or don't.
  const feats = new Set<Feature>(['private', 'tired']);
  const to = p.partner != null ? P(w, p.partner) : (friendsOf(w, p)[0] ?? p.kids.map(k => P(w, k)).find(k => k.status === 'in' && age(w, k) >= 16));
  w.queue.push({
    type: 'loss',
    actor: p,
    target: to,
    others: [],
    thing: 'it',
    features: feats,
    families: to ? ['seeking', 'withdrawal'] : ['withdrawal'],
    only: { seeking: ['confide', 'call'], withdrawal: ['work', 'shutout', 'numb', 'skip'] },
    cause: ref,
    causeLabel: what,
    maxIntensity: 0.7,
  });
  for (const f of friendsOf(w, p)
    .sort((a, b) => regard(w, b.id, p.id) - regard(w, a.id, p.id))
    .slice(0, 3))
    w.queue.push({
      type: 'support',
      actor: f,
      target: p,
      others: [],
      thing: '',
      features: new Set<Feature>(['private', 'need', 'friend']),
      families: ['warmth', 'lapse'],
      only: { warmth: ['visit', 'show'], lapse: ['absent'] },
      cause: ref,
      w: 1,
      familyExtra: {
        warmth: [bondC(w, f, p, 'like', 1)],
        lapse: [stateC('own', f.stress > 0.5 ? 'had troubles of their own' : 'had the time', f.stress > 0.5 ? 0.7 : 0.15)],
      },
    });
}
export { FEATURE_WORDS, logistic };
