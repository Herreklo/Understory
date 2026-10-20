// Who carries a friendship. Each friendship keeps one record of what each friend has put in lately: seeking the other out, hearing them
// out when they confide, turning up or helping when asked, and, against them, letting the other down. Entries fade with a half-life of
// three years, so the record is the friendship as it has been lately.
//
// When one friend has put in at least three times as much as the other, over at least six entries' worth, faded, the friendship is
// one-sided; after a year of that the town knows it, as it knows a couple's pattern ("Hal was always the one who went round to Ruth's").
// The one who carries it may mind: higher fairness minds more, higher altruism minds less. The record is read in four places and no
// others: when a friend is asked for something or has promised it (the one who owes finds it harder to refuse, a carrier who minds is
// readier to say no), when a friend is in trouble (the same), in whom a carrier who minds seeks out (less of the friend they carry), and
// at the end of a friendship that faded that way, which says so, with the year it began.

import { clamp } from './rng';
import { pow } from './mathx';
import { curves, type Consideration, type Option } from './decide';
import { OFF, P, facet, year, addEvent, broadcast, type World, type Person, type Cause } from './world';

export const carryOn = () => !OFF.has('carry');

type Kind = 'seek' | 'hear' | 'help';
interface Side {
  put: number; // what this friend has put in, faded
  seek: number;
  hear: number;
  help: number;
}
interface Carry {
  lo: Side; // the friend with the lower id
  hi: Side;
  t: number; // when the record was last faded
  since: number; // when the friendship began, as far as this record knows
  one?: number; // which side carries it (an id), while it is one-sided
  from?: number; // when it became one-sided
  shown?: boolean; // the town knows it (the line was written)
}

const HALF = 36; // months for an entry to fade to half
const RATIO = 3;
const ENOUGH = 6; // live entries' worth, faded (the amendment to round 32)
const YEAR = 12;
// What an act puts in for the one it is done for, and what a let-down takes from the one who let the other down.
const PUTS: Record<string, [Kind, number]> = {
  give: ['help', 3],
  grudging: ['help', 2],
  keep: ['help', 2],
  show: ['help', 3],
  visit: ['help', 3],
  rescue: ['help', 3],
  speakup: ['help', 3],
  askwhat: ['hear', 2],
  chipin: ['help', 1],
  quietgive: ['help', 1],
};
const DOWNS: Record<string, number> = { refuse: 2, excuse: 2, slip: 2, absent: 3, lookaway: 2, nowallet: 1, froze: 2, keepquiet: 1 };

const side = (): Side => ({ put: 0, seek: 0, hear: 0, help: 0 });
const keyOf = (a: number, b: number) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const mine = (c: Carry, id: number, other: number) => (id < other ? c.lo : c.hi);

function store(w: World): Map<string, Carry> {
  return ((w as any).carry ??= new Map<string, Carry>()) as Map<string, Carry>;
}
export function carryStats(w: World) {
  return ((w as any).carryStats ??= {
    entries: 0,
    downs: 0,
    oneSided: 0, // friendships that became one-sided for a year (the line written)
    ended: 0, // friendships that ended while one friend minded carrying them
  });
}

// The record of a friendship, faded to now; none unless the two are friends.
function get(w: World, a: number, b: number, make = false): Carry | undefined {
  const pa = w.byId.get(a);
  if (!pa || !pa.friends.has(b)) return undefined;
  const s = store(w);
  const k = keyOf(a, b);
  let c = s.get(k);
  if (!c) {
    if (!make) return undefined;
    c = { lo: side(), hi: side(), t: w.t, since: w.t };
    s.set(k, c);
  }
  if (c.t !== w.t) {
    const f = pow(0.5, (w.t - c.t) / HALF);
    for (const x of [c.lo, c.hi]) {
      x.put *= f;
      x.seek *= f;
      x.hear *= f;
      x.help *= f;
    }
    c.t = w.t;
  }
  return c;
}

// A friendship begins or ends: its record starts again.
export function carryReset(w: World, a: number, b: number) {
  if (!carryOn()) return;
  store(w).delete(keyOf(a, b));
}

function note(w: World, by: number, to: number, kind: Kind, n: number) {
  const c = get(w, by, to, true);
  if (!c) return;
  const x = mine(c, by, to);
  x.put += n;
  x[kind] += n;
  if (w.t >= w.startPresent) carryStats(w).entries++;
  settle(w, c, by, to);
}
function down(w: World, by: number, to: number, n: number) {
  const c = get(w, by, to, true);
  if (!c) return;
  const x = mine(c, by, to);
  x.put = Math.max(0, x.put - n);
  if (w.t >= w.startPresent) carryStats(w).downs++;
  settle(w, c, by, to);
}

// Who carries it, if anyone, and since when. A friendship that has gone quiet has not changed who carried it: below six entries'
// worth there is nothing new to judge, and the last judgement stands.
function evaluate(w: World, c: Carry, a: number, b: number) {
  if (c.lo.put + c.hi.put < ENOUGH) return;
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const carrier = c.lo.put >= RATIO * Math.max(c.hi.put, 1) ? lo : c.hi.put >= RATIO * Math.max(c.lo.put, 1) ? hi : undefined;
  if (carrier !== c.one) {
    c.one = carrier;
    c.from = carrier == null ? undefined : w.t;
  }
}
// The line, once it has lasted a year.
function settle(w: World, c: Carry, a: number, b: number) {
  evaluate(w, c, a, b);
  const [lo, hi] = a < b ? [a, b] : [b, a];
  if (c.one == null || c.shown || w.t - c.from! < YEAR) return;
  c.shown = true;
  const o = c.one === lo ? hi : lo;
  if (w.t >= w.startPresent) carryStats(w).oneSided++;
  const e = addEvent(w, {
    type: 'carried',
    who: [c.one, o],
    text: line(c, c.one, o),
    causes: [{ kind: 'state', label: `since ${year(c.from!)}`, weight: 0.3 }],
    vis: 'local',
    evidence: [],
    w: 0.6,
  });
  broadcast(w, e);
}

// What the carrier mostly put in, as the town says it.
function mostly(c: Carry, id: number, other: number): Kind {
  const x = mine(c, id, other);
  return x.help >= x.seek && x.help >= x.hear ? 'help' : x.hear >= x.seek ? 'hear' : 'seek';
}
function line(c: Carry, id: number, other: number): string {
  const k = mostly(c, id, other);
  return k === 'seek'
    ? `@${id} was always the one who went round to @${other}'s.`
    : k === 'hear'
      ? `@${id} was always the one who listened when @${other} needed to talk.`
      : `@${id} was always the one who helped @${other} out.`;
}
// The same, as the carrier's own reason, and as the reason of the one who owes them.
const doing: Record<Kind, string> = { seek: 'came round', hear: 'listened', help: 'helped out' };
function carrierSays(c: Carry, id: number, other: number) {
  return `was always the one who ${doing[mostly(c, id, other)]}, never @${other} (since ${year(c.from!)})`;
}
function owerSays(c: Carry, carrier: number, other: number) {
  return `@${carrier} had always been the one who ${doing[mostly(c, carrier, other)]} (since ${year(c.from!)})`;
}

// How much a carrier minds: their own, from fairness (more) and altruism (less).
export function minds(p: Person): number {
  return clamp(0.5 + 0.25 * facet(p, 'fairness') - 0.25 * facet(p, 'altruism'), 0, 1);
}
// The carrier of a friendship, once it has been one-sided for a year, and how much they mind.
export function carrying(w: World, a: number, b: number): { carrier: number; other: number; m: number; c: Carry } | undefined {
  if (!carryOn()) return undefined;
  const c = get(w, a, b);
  if (c) evaluate(w, c, a, b);
  if (!c || c.one == null || w.t - c.from! < YEAR) return undefined;
  const other = c.one === a ? b : a;
  return { carrier: c.one, other, m: minds(P(w, c.one)), c };
}

// ---------- entries ----------
// Seeking a friend out (social.ts, the 'sought' channel).
export function carrySought(w: World, p: Person, q: Person) {
  if (!carryOn() || !p.friends.has(q.id)) return;
  note(w, p.id, q.id, 'seek', 1);
}
// An act done for, or to, a friend (grammar.ts, every decision with a target); being confided in is hearing them out.
export function carryAct(w: World, p: Person, t: Person | undefined, expr: string) {
  if (!carryOn() || !t || !p.friends.has(t.id)) return;
  if (expr === 'confide') return note(w, t.id, p.id, 'hear', 2);
  const put = PUTS[expr];
  if (put) return note(w, p.id, t.id, put[0], put[1]);
  const d = DOWNS[expr];
  if (d) down(w, p.id, t.id, d);
}

// ---------- where it bears ----------
// (c) A carrier who minds seeks that friend out less: the weight of the draw, cut by up to two thirds.
export function carrySeekFactor(w: World, p: Person, q: Person): number {
  const k = carrying(w, p.id, q.id);
  if (!k || k.carrier !== p.id || k.m < 0.5) return 1;
  return 1 - (2 / 3) * k.m;
}

// (a) and (b): being asked, a promise coming due, a friend in trouble. Giving answers and withholding answers by situation.
const BEARS: Record<string, [string, string]> = {
  'request-answer': ['generosity', 'refusal'],
  obligation: ['duty', 'lapse'],
  support: ['warmth', 'lapse'],
  notice: ['warmth', 'lapse'],
};
export function withCarry(w: World, type: string, p: Person, t: Person | undefined, options: Option[]) {
  if (!carryOn() || !t || !BEARS[type]) return;
  const k = carrying(w, p.id, t.id);
  if (!k) return;
  const [giving, withholding] = BEARS[type];
  // The one who owes is pulled to give; a carrier who minds, to withhold. A carrier who does not mind is not moved.
  const owes = k.carrier === t.id;
  if (!owes && k.m < 0.5) return;
  const fam = owes ? giving : withholding;
  const o = options.find(x => x.id === fam);
  if (!o) return;
  const x = owes ? 0.75 : 0.5 + 0.5 * k.m;
  const label = owes ? owerSays(k.c, k.carrier, p.id) : carrierSays(k.c, p.id, t.id);
  const c: Consideration = {
    id: 'carry:' + t.id,
    cause: () => ({ kind: 'state', label, weight: 1, who: p.id }) as Cause,
    input: v => v.state(p, 'close', x, 0.5),
    curve: curves.rising(0.3, 1),
    know: 'close',
    who: p,
    neutral: 0.5,
  };
  o.considerations = [...o.considerations, c];
}

// (d) The end: a friendship that a carrier who minded let go says so. Returns the words and the reason, or nothing.
export function carryEnd(w: World, a: Person, b: Person): { text: string; cause: Cause } | undefined {
  const k = carrying(w, a.id, b.id);
  if (!k || k.m < 0.5) return undefined;
  if (w.t >= w.startPresent) carryStats(w).ended++;
  const kind = mostly(k.c, k.carrier, k.other);
  const stop = kind === 'seek' ? 'stopped going round' : kind === 'hear' ? 'stopped being the one who listened' : 'stopped helping out';
  return {
    text: `@${k.carrier} ${stop}, and @${k.carrier} and @${k.other} drifted apart. @${k.carrier} had always been the one who did.`,
    cause: { kind: 'state', label: carrierSays(k.c, k.carrier, k.other), weight: 1, who: k.carrier },
  };
}
