// Taking sides (round 46; notes/research/sides.md). After a rift between two people (a rivalry declared, a split or divorce, a betrayal,
// a scheme found out, a falling-out), each person close to both faces it once, in the month after: side with one, with the other, or
// with neither. Close to both is a friend of both; kin or partner of one and friend or kin of the other (a couple's grown children); and,
// at a split or divorce, kin of one who is fond of the other (the in-laws).
//
// The answer weighs how much closer they are to one side than to the other (liking and regard, with what they have been told of each,
// telling.ts), what the side named as doing it did, as far as they know of it and as fair as they are, and how torn they are. The rift
// names one side as doing it: the one who talked, schemed or walked out; at a falling-out, the one resented, else the one who stopped
// caring first; in a rivalry, the one who went for it. Siding with the other is `sideagainst` (severity), standing by them `standby`
// (leniency), neither `keepout` (discretion); the reasons name the act.
//
// What follows: the side taken remembers it. The side not taken trusts the decider less and resents it (feelings.ts), as much as the tie
// they had; less where the choice was made on what the other had done, since principle excuses disloyalty, and less again for neither,
// which costs too (Shaw et al. 2017). A friend not taken whose forgiveness is low ends the friendship, citing it. The resentment may then
// seek the decider out at a meeting (round 45). Nothing reads the triad's balance, and there is no timer, count or quota.
//
// Rifts are read from the month's events at its end (`sidesTick`, after every system, no dice), and each decision is a queued situation,
// run with next month's situations, so it displaces nothing. On unless OFF=sides.

import { clamp, hash } from './rng';
import { curves, z01, type Consideration } from './decide';
import type { Feature } from './features';
import { type Instance, type Outcome, family } from './grammar';
import type { Expression } from './families';
import { facetC, traitCause, eventCause, ev, learned } from './considerations';
import { regardPart } from './telling';
import { carryReset } from './carry';
import { feelingsOf, sideNotTaken } from './feelings';
import { sidesOn, age, facet, peekBond, remember, addEvent, broadcast, type World, type Person, type Event } from './world';

const RIFTS = new Set(['rivals', 'split', 'divorce', 'betrayed', 'scheme:found', 'cooled']);
const SIDED = new Set(['sideagainst', 'standby', 'keepout']);
const FELL_OUT = 0.02; // a friendship that ends with one liking below this ended in a falling-out, not by losing touch (social.ts)
const INLAW = 0.3; // how fond of the other side kin of one must be to be torn at a split

export interface Rift {
  ev: number;
  kind: string; // the rift's event type, 'fellout' for a falling-out
  t: number; // the side named as doing it
  o: number; // the other
  wrong: number; // how plainly it was a wrong done by t to o, 0..1
  said: string; // what t did, as a reason
}
export type Cast = 'friends' | 'kin' | 'inlaw';
// What a side-taking event was about: its rift and who decided, for the record and the sizing (the decision record carries it).
export interface Sided {
  rift: Rift;
  cast: Cast;
}

const like = (w: World, a: number, b: number) => peekBond(w, a, b)?.like ?? 0;
const kinOf = (p: Person, q: Person) => p.partner === q.id || family(p, q);
const closeTo = (p: Person, q: Person): 'friend' | 'kin' | undefined => (p.friends.has(q.id) ? 'friend' : kinOf(p, q) ? 'kin' : undefined);

// The rift an event opens, if it is one: who it names as doing it, and how plainly a wrong it was.
export function riftOf(w: World, e: Event): Rift | undefined {
  if (!RIFTS.has(e.type) || e.who.length < 2) return undefined;
  const [a, b] = [w.byId.get(e.who[0]), w.byId.get(e.who[1])];
  if (!a || !b || a === b || a.status !== 'in' || b.status !== 'in') return undefined;
  const r = (kind: string, t: Person, o: Person, wrong: number, said: string): Rift => ({ ev: e.id, kind, t: t.id, o: o.id, wrong, said });
  switch (e.type) {
    case 'betrayed':
      return r(e.type, b, a, 1, `@${b.id} had talked about what @${a.id} told in confidence`);
    case 'scheme:found':
      return r(e.type, a, b, 1, `@${a.id} had been running @${b.id} down`);
    case 'split':
    case 'divorce': {
      const t = e.evidence[0]?.subject === b.id ? b : a; // the one who stopped wanting it (romance.ts `split`)
      const o = t === a ? b : a;
      return r(e.type, t, o, 0.3, `@${t.id} ended it with @${o.id}`);
    }
    case 'rivals':
      return r(e.type, a, b, 0, '');
    case 'cooled': {
      if (Math.min(like(w, a.id, b.id), like(w, b.id, a.id)) >= FELL_OUT) return undefined;
      // A friendship a side-taking ended is that decision's consequence, not a new rift.
      if (e.causes.some(c => c.kind === 'event' && c.ref != null && SIDED.has(w.events[c.ref]?.type))) return undefined;
      const ra = resented(w, a, b),
        rb = resented(w, b, a);
      if (ra || rb) {
        const [t, o] = (ra ?? 0) >= (rb ?? 0) ? [b, a] : [a, b];
        return r('fellout', t, o, 0.6, `what @${t.id} had done to @${o.id}`);
      }
      const [t, o] = like(w, a.id, b.id) <= like(w, b.id, a.id) ? [a, b] : [b, a];
      return r('fellout', t, o, 0, '');
    }
  }
  return undefined;
}
// How strongly p holds a standing resentment of q, if they do.
function resented(w: World, p: Person, q: Person): number | undefined {
  const f = feelingsOf(w, p.id).find(x => x.k === 'resentment' && x.o === q.id && x.stands);
  return f && f.v >= 0.12 ? f.v : undefined;
}

// Everyone close to both sides: drawn from the two sides' own ties (their friends, partner, parents, children and siblings).
export function castOf(w: World, rift: Rift): { p: Person; cast: Cast }[] {
  const t = w.byId.get(rift.t)!,
    o = w.byId.get(rift.o)!;
  const ids = new Set<number>();
  for (const x of [t, o]) {
    for (const id of x.friends) ids.add(id);
    if (x.partner != null) ids.add(x.partner);
    for (const id of [...x.parents, ...x.kids]) ids.add(id);
    for (const pid of x.parents) for (const id of w.byId.get(pid)?.kids ?? []) ids.add(id);
  }
  const out: { p: Person; cast: Cast }[] = [];
  const split = rift.kind === 'split' || rift.kind === 'divorce';
  for (const id of ids) {
    const p = w.byId.get(id);
    if (!p || p === t || p === o || p.status !== 'in' || age(w, p) < 16) continue;
    const ct = closeTo(p, t),
      co = closeTo(p, o);
    if (ct && co) out.push({ p, cast: ct === 'friend' && co === 'friend' ? 'friends' : 'kin' });
    else if (split && ((ct === 'kin' && like(w, p.id, o.id) >= INLAW) || (co === 'kin' && like(w, p.id, t.id) >= INLAW)))
      out.push({ p, cast: 'inlaw' });
  }
  return out;
}

// The month's rifts, read at its end: each person close to both sides decides next month.
export function sidesTick(w: World) {
  if (!sidesOn()) return;
  const asked = new Set<string>();
  for (let i = w.events.length - 1; i >= 0 && w.events[i].t === w.t; i--) {
    const rift = riftOf(w, w.events[i]);
    if (!rift) continue;
    for (const { p, cast } of castOf(w, rift)) {
      const key = `${p.id}:${Math.min(rift.t, rift.o)}:${Math.max(rift.t, rift.o)}`;
      if (asked.has(key)) continue; // two rifts between the same pair in one month are one choice
      asked.add(key);
      w.queue.push(choice(w, p, rift, cast));
    }
  }
}

// How much closer the decider is to one side than the other: liking, with a little of regard and of what they have been told.
const nearness = (w: World, p: Person, x: number, v: { bond: (a: Person, b: number, axis: 'like' | 'respect' | 'trust') => number }) =>
  v.bond(p, x, 'like') + 0.3 * v.bond(p, x, 'respect') + regardPart(w, p.id, x);

function choice(w: World, p: Person, rift: Rift, cast: Cast): Instance {
  const t = w.byId.get(rift.t)!,
    o = w.byId.get(rift.o)!;
  const feats = new Set<Feature>([
    'private',
    ...(p.friends.has(t.id) || p.friends.has(o.id) ? ['friend' as Feature] : []),
    ...(kinOf(p, t) || kinOf(p, o) ? ['family' as Feature] : []),
  ]);
  const priv = new Set<Feature>(['private']);
  // Closer to `a` than to `b`: for siding with `a`.
  const closer = (a: Person, b: Person): Consideration => ({
    id: 'sides:like',
    cause: () => ({ kind: 'bond', label: `is closer to @${a.id} than to @${b.id}`, weight: 1, who: p.id, key: 'bond:' + a.id }),
    input: v => clamp(0.5 + 0.5 * (nearness(w, p, a.id, v) - nearness(w, p, b.id, v)), 0, 1),
    curve: curves.sCurve(6, 0.5),
  });
  const torn: Consideration = {
    id: 'sides:torn',
    cause: () => ({ kind: 'bond', label: `is close to both @${t.id} and @${o.id}`, weight: 1, who: p.id }),
    input: v => clamp(1 - Math.abs(nearness(w, p, t.id, v) - nearness(w, p, o.id, v)), 0, 1),
    curve: curves.sCurve(4, 0.7),
  };
  // What the side named did, for siding with the other: as plain a wrong as it was, if they know of it, the more the fairer they are.
  const known = w.events[rift.ev].knownBy.has(p.id);
  const fair: Consideration[] =
    rift.wrong > 0 && known
      ? [
          {
            id: 'sides:fair',
            cause: () => ({ kind: 'state', label: rift.said, weight: 1, who: p.id, ref: rift.ev }),
            input: v => 0.5 + 0.45 * rift.wrong * (0.4 + 0.6 * z01(v.facet(p, 'fairness', undefined, priv))),
            curve: curves.rising(0.3, 1),
            neutral: 0.5,
            know: 'close',
            favours: ['severity'],
          },
        ]
      : [];
  // Keeping out is the peacemaker's answer and not the fair-minded one's: fairness argues against it, the more so the plainer the wrong;
  // gentleness and flexibility for it, read together so the situation's own reasons are not cut at five.
  const peace: Consideration = {
    id: 'sides:peace',
    cause: () => traitCause(p, facet(p, 'gentleness') >= facet(p, 'flexibility') ? 'gentleness' : 'flexibility'),
    input: v => (z01(v.facet(p, 'gentleness', undefined, priv)) + z01(v.facet(p, 'flexibility', undefined, priv))) / 2,
    curve: curves.sCurve(5, 0.5),
  };
  return {
    type: 'sides',
    actor: p,
    target: t,
    others: [o],
    thing: `@${o.id}`,
    features: feats,
    families: ['severity', 'leniency', 'discretion'],
    only: { severity: ['sideagainst'], leniency: ['standby'], discretion: ['keepout'] },
    cause: rift.ev,
    extra: fair,
    familyExtra: {
      severity: [closer(o, t)],
      leniency: [closer(t, o)],
      discretion: [torn, facetC(p, 'socialBoldness', priv, -1, 4), facetC(p, 'fairness', priv, -1, 4 + 3 * rift.wrong), peace],
    },
    ownFirst: true,
    told: true,
    words: (x: Expression) => said(w, p, rift, x.id),
    w: 1.2,
    sided: { rift, cast },
  } as Instance & { sided: Sided };
}

// The words, by kind of rift (@T the side named as doing it, @O the other); a rift's later deciders who answer alike say so.
const WORDS: Record<string, Record<string, string[]>> = {
  betrayed: {
    sideagainst: ["@D took @O's side once it came out that @T had talked", '@D sided with @O: @T should have kept quiet'],
    standby: ['@D stood by @T, talk or no talk', '@D stuck by @T, whatever @T had let slip about @O'],
    keepout: ['@D would not take sides over what @T had let slip', '@D kept out of it between @T and @O'],
  },
  'scheme:found': {
    sideagainst: ["@D took @O's side once @T's scheming came out", '@D sided with @O against @T over the running-down'],
    standby: ['@D stood by @T when the scheming came out', '@D stuck with @T against @O'],
    keepout: ['@D kept out of the business between @T and @O', '@D would not take sides between @T and @O'],
  },
  split: {
    sideagainst: ["@D took @O's side when @T ended it", '@D sided with @O in the split'],
    standby: ['@D stood by @T when @T left @O', "@D kept to @T's side of the split"],
    keepout: ['@D stayed on good terms with both @T and @O through the split', '@D would not take sides in the split'],
  },
  divorce: {
    sideagainst: ["@D took @O's side when @T ended the marriage", '@D sided with @O in the divorce'],
    standby: ['@D stood by @T through the divorce', "@D kept to @T's side of the divorce"],
    keepout: ['@D stayed on good terms with both @T and @O through the divorce', '@D would not take sides in the divorce'],
  },
  rivals: {
    sideagainst: ['@D backed @O in the rivalry with @T', "@D took @O's side against @T"],
    standby: ['@D backed @T in the rivalry with @O', '@D stood by @T against @O'],
    keepout: ['@D kept out of the rivalry between @T and @O', '@D would not take sides between @T and @O'],
  },
  fellout: {
    sideagainst: ["@D took @O's side in the falling-out with @T", '@D sided with @O after the falling-out with @T'],
    standby: ['@D stood by @T in the falling-out with @O', '@D kept with @T when @T and @O fell out'],
    keepout: ['@D would not take sides when @T and @O fell out', '@D stayed friends with both @T and @O after the falling-out'],
  },
};
function said(w: World, p: Person, rift: Rift, expr: string): string | undefined {
  const ws = WORDS[rift.kind]?.[expr];
  if (!ws) return undefined;
  const line = ws[hash(w.seed, p.id, rift.ev) % ws.length].replace(/@D/g, `@${p.id}`).replace(/@T/g, `@${rift.t}`).replace(/@O/g, `@${rift.o}`);
  // Another of the rift's deciders who answered the same this month.
  for (let i = w.events.length - 1; i >= 0 && w.events[i].t === w.t; i--) {
    const e = w.events[i];
    if (e.type === expr && e.who[0] !== p.id && (e.decision as any)?.sided?.rift.ev === rift.ev)
      return line.replace(`@${p.id}`, `@${p.id}, like @${e.who[0]},`);
  }
  return line;
}

// After the choice: the other side's memory of it (the target's is the grammar's own), and for each side not taken, a resentment, and
// for a friend not taken who does not forgive, the friendship's end.
export function afterSides(w: World, inst: Instance, out: Outcome) {
  const p = inst.actor,
    t = inst.target!,
    o = inst.others[0];
  const sided = (inst as Instance & { sided: Sided }).sided;
  const x = out.expr,
    e = out.event;
  (e.decision as any).sided = sided;
  const k = 0.5 + 0.5 * x.intensity;
  const taken = x.id === 'sideagainst' ? o : x.id === 'standby' ? t : undefined;
  if (taken === o) remember(w, o, p, e.id, 0.15 * k, 0.05 * k, 0.2 * k, `took my side against @${t.id}`);
  else if (taken === t) remember(w, o, p, e.id, -0.2 * k, 0, -0.3 * k, `stood by @${t.id} against me`);
  else remember(w, o, p, e.id, -0.05 * k, 0, -0.1 * k, `would not take sides between me and @${t.id}`);
  // A choice given on what the other side did reads as principle.
  const principled = !!sided.rift.said && e.causes.some(c => c.label === sided.rift.said);
  for (const n of taken ? [taken === t ? o : t] : [t, o]) {
    if (n.status !== 'in') continue;
    sideNotTaken(w, n, p, e.id, taken ? `taking @${taken.id}'s side` : 'staying out of it', (taken ? 1 : 0.4) * (principled ? 0.7 : 1));
    if (taken && n.friends.has(p.id) && facet(n, 'forgiveness', p.id) < (principled ? -1 : -0.5)) cut(w, n, p, taken, e);
  }
}
// The friend not taken ends it.
function cut(w: World, n: Person, p: Person, taken: Person, side: Event) {
  carryReset(w, n.id, p.id);
  n.friends.delete(p.id);
  p.friends.delete(n.id);
  // A falling-out, as social.ts marks one: three years before they can be friends again, and then only as making up.
  learned(w, n, 'cooled:' + p.id, true);
  learned(w, p, 'cooled:' + n.id, true);
  const e = addEvent(w, {
    type: 'cooled',
    who: [n.id, p.id],
    text: `@${n.id} stopped speaking to @${p.id} after @${p.id} took @${taken.id}'s side.`,
    causes: [eventCause(w, side.id, 0.7), traitCause(n, 'forgiveness', 0.4, -1)],
    vis: 'local',
    evidence: [ev(n.id, 'forgiveness', -1, 0.6, 0.6), ev(n.id, 'bond:' + p.id, -1, 0.8, 0.7)],
    w: 1.4,
  });
  broadcast(w, e);
}
export const isSided = (id: string) => SIDED.has(id);
