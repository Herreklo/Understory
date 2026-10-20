// Told accounts: what people hear about each other, and act on. Someone who saw a weighty act, or had it done to them, may tell it once
// to the one close person (a friend or a partner) who knows the one it is about; that person may tell it once more, less surely. The
// hearer keeps it on their bond toward the person it is about, with who told it, how sure they are, and how far the teller laid it on
// that person. Telling bends: a teller who likes them softens it, one who dislikes them, or will say anything, hardens it; rarely, one
// who will say anything names the wrong person. The record keeps what happened; the hearer's version is said as theirs.
//
// An account shifts no bond. It is read: as its own consideration in any decision that weighs its subject (said as the act, with its
// source), and as a part of regard when a counterpart is chosen, where the event that follows cites it.

import { clamp } from './rng';
import { curves, z01, type Consideration, type Option } from './decide';
import {
  OFF,
  P,
  bond,
  peekBond,
  likeOf,
  facet,
  memWeight,
  TEXTURE,
  VALENCE,
  year,
  type World,
  type Event,
  type Person,
  type Cause,
  type Heard,
} from './world';

export const tellingOn = () => !OFF.has('telling');
const FAM = 0.2; // how well a hearer must know the one it is about, short of sharing a workplace, group or circle with them
const BOUND = 32; // live told accounts a person holds before the most faded go
const SECOND = 0.6; // how much surer the first hearer is than the second

// The act's worth in the town's eyes: its evidence about the doer, read on the admired facets. Between -1 and 1.
function valence(e: Event, actor: number): number {
  let v = 0;
  for (const x of e.evidence) if (x.subject === actor) v += (VALENCE[x.key] ?? 0) * x.dir * x.strength;
  return clamp(v, -1, 1);
}
const actOf = (e: Event) => !!e.decision && e.w >= 0.8 && !TEXTURE.has(e.type) && e.vis !== 'private' && e.who.length > 0;
const firstSentence = (text: string) => text.split(/(?<=\.)\s+(?=[A-Z])/)[0].replace(/\.\s*$/, '');

const knows = (w: World, h: Person, o: Person) =>
  (peekBond(w, h.id, o.id)?.fam ?? 0) >= FAM ||
  (h.job != null && h.job === o.job) ||
  (h.group != null && h.group === o.group) ||
  h.circle.includes(o.id);
const holds = (w: World, h: Person, about: number, ev: number) => {
  const r = peekBond(w, h.id, about);
  return !!r && (r.heard?.some(a => a.ev === ev) || r.mem.some(m => m.ev === ev));
};

// The one the teller would tell: the friend or partner they like most who knows the one it is about and does not already hold it.
function hearerFor(w: World, teller: Person, e: Event, about: Person): Person | undefined {
  let best: Person | undefined,
    bestLike = -Infinity;
  const ids = [...teller.friends, ...(teller.partner != null ? [teller.partner] : [])];
  for (const id of ids) {
    const h = w.byId.get(id);
    if (!h || h.status !== 'in' || h === about || e.who.includes(h.id) || holds(w, h, about.id, e.id) || !knows(w, h, about)) continue;
    const l = likeOf(w, teller.id, h.id);
    if (l > bestLike || (l === bestLike && best && h.id < best.id)) {
      best = h;
      bestLike = l;
    }
  }
  return best;
}

// The teller's version: blame bent by how they feel about the one it is about, and by whether they will say anything.
function bend(w: World, teller: Person, about: number, base: number): number {
  const like = likeOf(w, teller.id, about);
  const loose = facet(teller, 'sincerity') < -0.8;
  let b = base;
  if (like > 0.3) b = base < 0 ? base * 0.5 : base * 1.5;
  else if (like < -0.3 || loose) b = base < 0 ? base * 1.5 : base * 0.5;
  return clamp(b, -1, 1);
}

// Someone else to pin it on: another person in the act, else someone the hearer knows who works with the doer.
function wrongOne(w: World, e: Event, actor: Person, hearer: Person, teller: Person): Person | undefined {
  for (const id of e.who.slice(1)) {
    const q = w.byId.get(id);
    if (q && q !== hearer && q !== teller && q.status === 'in') return q;
  }
  if (!actor.job) return undefined;
  return w.people.find(
    q => q.status === 'in' && q.job === actor.job && q !== actor && q !== hearer && q !== teller && (peekBond(w, hearer.id, q.id)?.fam ?? 0) >= FAM,
  );
}

function swapActor(text: string, actor: number, other: number) {
  const A = '\u0001';
  return text.replaceAll(`@${actor}`, A).replaceAll(`@${other}`, `@${actor}`).replaceAll(A, `@${other}`);
}

interface Pending {
  hearer: number;
  about: number;
  ev: number;
}
const stats = (w: World) =>
  ((w as any).tellStats ??= { told: 0, second: 0, wrong: 0, bent: 0, hearers: {} as Record<number, number> }) as {
    told: number;
    second: number;
    wrong: number;
    bent: number;
    hearers: Record<number, number>;
  };

// One telling: the teller decides whether to tell, to whom, and in what version.
function tell(
  w: World,
  teller: Person,
  e: Event,
  actor: Person,
  base: number,
  hand: 1 | 2,
  conf: number,
  done: boolean,
  text: string,
  next: Pending[],
) {
  if (teller.status !== 'in') return;
  if (!w.rng.chance(0.35 * z01(facet(teller, 'sociability')) * (done ? 1.5 : 1))) return;
  const h = hearerFor(w, teller, e, actor);
  if (!h) return;
  let about = actor,
    words = text;
  if (facet(teller, 'sincerity') < -0.8 && w.rng.chance(0.15)) {
    const q = wrongOne(w, e, actor, h, teller);
    if (q) {
      about = q;
      words = text.includes(`@${q.id}`) ? swapActor(text, actor.id, q.id) : text.replaceAll(`@${actor.id}`, `@${q.id}`);
    }
  }
  const blame = bend(w, teller, about.id, base);
  const heard: Heard = { ev: e.id, about: about.id, from: teller.id, t: w.t, conf, blame, base, hand, text: words };
  const r = bond(w, h.id, about.id);
  (r.heard ??= []).push(heard);
  (h.heardOf ??= []).push({ o: about.id, ev: e.id });
  if (h.heardOf.length > BOUND) dropFaded(w, h);
  if (w.t >= w.startPresent) {
    const s = stats(w);
    s.told++;
    if (hand === 2) s.second++;
    if (about !== actor) s.wrong++;
    if (Math.abs(blame - base) > 0.3) s.bent++;
    s.hearers[h.id] = (s.hearers[h.id] ?? 0) + 1;
  }
  if (hand === 1) next.push({ hearer: h.id, about: about.id, ev: e.id });
}

// Each month (in the social system's turn): last month's weighty acts may be told by those they were done to and those who saw them,
// and what was told last month may be told once more.
export function tellingTick(w: World) {
  if (!tellingOn()) return;
  const queue = ((w as any).tellQueue ?? []) as Pending[];
  const next: Pending[] = [];
  for (const q of queue) {
    const h = w.byId.get(q.hearer),
      about = w.byId.get(q.about);
    if (!h || !about || about.status !== 'in') continue;
    const a = peekBond(w, h.id, about.id)?.heard?.find(x => x.ev === q.ev);
    if (!a) continue;
    tell(w, h, w.events[q.ev], about, a.blame, 2, a.conf * SECOND, false, a.text, next);
  }
  for (let i = w.events.length - 1; i >= 0 && w.events[i].t >= w.t - 1; i--) {
    const e = w.events[i];
    if (e.t !== w.t - 1 || !actOf(e)) continue;
    const actor = w.byId.get(e.who[0]);
    if (!actor || actor.status !== 'in') continue;
    const base = valence(e, actor.id);
    if (Math.abs(base) < 0.1) continue;
    const text = firstSentence(e.text);
    for (const id of e.who.slice(1)) {
      const t = w.byId.get(id);
      if (t && t !== actor) tell(w, t, e, actor, base, 1, 0.7, true, text, next);
    }
    for (const [id, how] of e.knownBy) {
      if (how !== 'seen' || e.who.includes(id)) continue;
      const t = w.byId.get(id);
      if (t) tell(w, t, e, actor, base, 1, 0.7, false, text, next);
    }
  }
  (w as any).tellQueue = next;
}

// How much is left of an account: it fades as a memory of the same feeling would.
const fade = (h: Person, a: Heard, t: number) => memWeight(h, { t: a.t, ev: a.ev, like: a.blame, respect: 0, trust: 0, text: '' }, t, a.about);
const live = (h: Person, a: Heard, t: number) => a.blame * a.conf * fade(h, a, t);

function dropFaded(w: World, h: Person) {
  const list = h.heardOf!;
  let worst = 0,
    least = Infinity;
  for (let i = 0; i < list.length; i++) {
    const a = peekBond(w, h.id, list[i].o)?.heard?.find(x => x.ev === list[i].ev);
    const s = a ? Math.abs(live(h, a, w.t)) : -1;
    if (s < least) {
      least = s;
      worst = i;
    }
  }
  const { o, ev } = list[worst];
  const r = peekBond(w, h.id, o);
  if (r?.heard) r.heard = r.heard.filter(x => x.ev !== ev);
  list.splice(worst, 1);
}

// The strongest account a person holds about another: told to them, or done to them. Its signed strength is blame × confidence × how
// much is left; an act done to oneself is held for sure, with its blame read from what it did to the bond.
interface Held {
  s: number;
  ev: number;
  label: string;
}
export function strongest(w: World, p: Person, o: number): Held | undefined {
  const r = peekBond(w, p.id, o);
  if (!r) return undefined;
  let best: Held | undefined;
  for (const a of r.heard ?? []) {
    const s = live(p, a, w.t);
    if (!best || Math.abs(s) > Math.abs(best.s)) best = { s, ev: a.ev, label: toldAs(w, a) };
  }
  for (const m of r.mem) {
    if (m.ev < 0 || m.source === 'saw') continue;
    const hit = m.like + m.trust;
    const s = clamp(hit, -1, 1) * memWeight(p, m, w.t, o);
    if (!best || Math.abs(s) > Math.abs(best.s)) best = { s, ev: m.ev, label: doneAs(m.text, p.id, o, m.t) };
  }
  return best && Math.abs(best.s) >= 0.05 ? best : undefined;
}
function toldAs(w: World, a: Heard): string {
  const soft = Math.abs(a.blame) < Math.abs(a.base) - 0.3,
    hard = Math.abs(a.blame) > Math.abs(a.base) + 0.3;
  const how = soft ? `, though @${a.from} made light of it` : hard ? `, and @${a.from} made the most of it` : '';
  return `had heard from @${a.from} that ${a.text}${how} (${year(a.t)})`;
}
// A memory is kept in the holder's words ("wasn't there for me when it mattered"); as a reason it is said from outside, as the friendship
// reasons say it: "@52 wasn't there for @19 when it mattered".
const doneAs = (text: string, holder: number, o: number, t: number) => {
  const said = text.startsWith('@') ? text : `@${o} ${text.replace(/\bmy\b/g, `@${holder}'s`).replace(/\b(me|I)\b/g, `@${holder}`)}`;
  return `${said} (${year(t)})`;
};

// The account as a consideration about `o`, in the same direction as the bond consideration it stands beside.
export function accountC(w: World, p: Person, o: number, dir: 1 | -1): Consideration | undefined {
  const a = strongest(w, p, o);
  if (!a) return undefined;
  return {
    id: `account:${o}`,
    cause: () => ({ kind: 'belief', label: a.label, weight: 1, who: p.id, ref: a.ev }) as Cause,
    input: () => clamp(0.5 + 0.5 * a.s, 0, 1),
    curve: dir > 0 ? curves.sCurve(4, 0.5) : curves.sFalling(4, 0.5),
  };
}

// Which way a bond consideration pulls: toward the answer when the bond is warm (a rising curve), away when it is cold.
const aboutDir = (c: Consideration): 1 | -1 => (c.curve(0.9) > c.curve(0.1) ? 1 : -1);

// Every decision that weighs a person by a bond (a consideration `bond:<axis>:<id>`) also weighs what the chooser holds about them,
// beside it.
export function withAccounts(w: World, p: Person, options: Option[]) {
  if (!tellingOn()) return;
  for (const o of options) {
    const out: Consideration[] = [];
    const done = new Set<number>();
    for (const c of o.considerations) {
      out.push(c);
      const m = /^bond:[a-z]+:(\d+)$/.exec(c.id);
      if (!m || done.has(+m[1])) continue;
      done.add(+m[1]);
      const a = accountC(w, p, +m[1], aboutDir(c));
      if (a) out.push(a);
    }
    o.considerations = out;
  }
}

// The part of regard that is what the chooser has been told: bounded, and remembered for the month, so the event that follows the
// choice can cite the account that moved it.
export function regardPart(w: World, who: number, ofWhom: number): number {
  if (!tellingOn()) return 0;
  const r = peekBond(w, who, ofWhom);
  if (!r?.heard?.length) return 0;
  const p = P(w, who);
  let sum = 0,
    top: Heard | undefined;
  for (const a of r.heard) {
    const s = live(p, a, w.t);
    sum += s;
    if (!top || Math.abs(s) > Math.abs(live(p, top, w.t))) top = a;
  }
  const part = 0.25 * clamp(sum, -1, 1);
  if (Math.abs(part) >= 0.05 && top) ((w as any).regardMoved ??= new Map()).set(`${who}|${ofWhom}`, { t: w.t, a: top });
  return part;
}

// An event between two people this month, one of whom chose the other moved by an account: the account is one of its reasons.
export function citeMoved(w: World, who: number[], causes: Cause[]): Cause[] {
  const moved = (w as any).regardMoved as Map<string, { t: number; a: Heard }> | undefined;
  if (!tellingOn() || !moved || who.length < 2) return causes;
  const a0 = who[0];
  for (const b of who.slice(1)) {
    for (const [x, y] of [
      [a0, b],
      [b, a0],
    ]) {
      const m = moved.get(`${x}|${y}`);
      if (!m || m.t !== w.t || causes.some(c => c.key === `account:${y}`)) continue;
      causes = [...causes, { kind: 'belief', label: `@${x} ${toldAs(w, m.a)}`, weight: 0.3, who: x, ref: m.a.ev, key: `account:${y}` }];
    }
  }
  return causes;
}
