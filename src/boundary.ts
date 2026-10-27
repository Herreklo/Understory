// The boundary: how a game, or any front end outside this repo, talks to a world (docs/scale/portability.md, rule 1).
// A world is created and advanced by commands, and read through events and queries. Everything given back is plain data: numbers,
// strings, booleans, arrays and records, never a Map, a Set or a function, and never a reference into the world, so a caller cannot
// change a world by holding on to what it was given. The Understory page and the tools read the engine directly; they are instruments.
import { buildWorld } from './build';
import { tick } from './life';
import { pickWitness } from './witness';
import { invite } from './invite';
import { projects, type Project } from './projects';
import { feelingsOf, feelingWords, weighs } from './feelings';
import { peekBond, year, type Belief, type Bond, type Event, type Group, type Person, type Place, type World } from './world';

declare const opaque: unique symbol;
/** A world, held by the caller and read only through this file. */
export type WorldHandle = { readonly [opaque]: true };
const W = (h: WorldHandle) => h as unknown as World;

/** What a value looks like once it has crossed the boundary. */
export type Plain<T> =
  T extends Map<infer K, infer V>
    ? [Plain<K>, Plain<V>][]
    : T extends Set<infer V>
      ? Plain<V>[]
      : T extends (...args: any[]) => any
        ? never
        : T extends object
          ? { [P in keyof T]: Plain<T[P]> }
          : T;

/** A deep copy as plain data: a Map becomes its entries and a Set its members, both in the engine's own (insertion) order;
 * functions and undefined fields are left out, and a negative zero is given as zero, since JSON cannot carry its sign. */
export function plain<T>(x: T): Plain<T> {
  if (x === null || typeof x !== 'object') return (Object.is(x, -0) ? 0 : x) as Plain<T>;
  if (x instanceof Map) return [...x.entries()].map(([k, v]) => [plain(k), plain(v)]) as Plain<T>;
  if (x instanceof Set) return [...x].map(v => plain(v)) as Plain<T>;
  if (Array.isArray(x)) return x.map(v => plain(v)) as Plain<T>;
  const out: any = {};
  for (const k of Object.keys(x)) {
    const v = (x as any)[k];
    if (v === undefined || typeof v === 'function') continue;
    out[k] = plain(v);
  }
  return out;
}

// ── Commands ──

export interface CreateWorld {
  seed: number; // the world: who is born and what happened in the past
  runSeed?: number; // the present: what happens from the moment the witness arrives (default 1)
  pastYears?: number; // years simulated before the present (default 30)
  adults?: number; // founding adults (default 46)
  witness?: boolean; // place the witness, the one person whose view the page shows (default true)
}

/** `advance`: run the world on, month by month. `invite`: `by` asks `to` to a rehearsal, with `by`'s band or, if they have none, to
 * start playing together; `to` answers by their own decision, and a yes starts the band or brings them into it. */
export type Command = { kind: 'advance'; months: number } | { kind: 'invite'; by: number; to: number; what: 'rehearsal' };

/** What the engine says to a command. `ok` false: a condition does not hold, `why` names it, and the world is exactly as it was.
 * An invitation that was put is `ok` whatever the answer: the first event is the answer (`type` 'invite', its `decision.chosen`
 * 'yes' or 'no'), and any after it are what the yes led to. */
export interface Answer {
  ok: boolean;
  why: string[]; // a refusal's condition, or the reasons the answer gives; people as @id, as in events
  events: Plain<Event>[]; // what the command recorded, in order; an advance's events are read with `events(h, since)`
}

export function createWorld(c: CreateWorld): WorldHandle {
  const w = buildWorld(c.seed, c.runSeed ?? 1, c.pastYears ?? 30, c.adults ?? 46);
  if (c.witness ?? true) pickWitness(w);
  return w as unknown as WorldHandle;
}

export function command(h: WorldHandle, c: Command): Answer {
  switch (c.kind) {
    case 'advance':
      for (let i = 0; i < c.months; i++) tick(W(h));
      return { ok: true, why: [], events: [] };
    case 'invite': {
      const a = invite(W(h), c.by, c.to);
      return { ok: a.ok, why: a.why, events: a.events.map(e => plain(e)) };
    }
  }
}

// ── Events ──

/** Every event from month `since` on, in the order the record holds them, each with its reasons, its evidence and who knows it.
 * The whole record is read: in a city, a neighbourhood brought into focus adds events dated in its replayed past at the end. */
export function events(h: WorldHandle, since = 0): Plain<Event>[] {
  return W(h)
    .events.filter(e => e.t >= since)
    .map(e => plain(e));
}

// ── Queries ──

export interface Now {
  t: number; // month index
  year: number;
  startPresent: number; // the month the witness arrived
  witness: number | null;
}

export function now(h: WorldHandle): Now {
  const w = W(h);
  return { t: w.t, year: year(w.t), startPresent: w.startPresent, witness: w.witness };
}

/** The people in town now (in a city: everyone simulated month by month), by id, in the engine's order. Read straight from the
 * people, never through the city's index, which places people in neighbourhoods as it is built. */
export function townIds(h: WorldHandle): number[] {
  return W(h)
    .people.filter(p => p.status === 'in')
    .map(p => p.id);
}

export function person(h: WorldHandle, id: number): Plain<Person> | null {
  const p = W(h).byId.get(id);
  return p ? plain(p) : null;
}

/** How `a` stands toward `b`, or null if they have no bond. Asking never creates one. */
export function bondOf(h: WorldHandle, a: number, b: number): Plain<Bond> | null {
  const r = peekBond(W(h), a, b);
  return r ? plain(r) : null;
}

export interface BeliefOut extends Belief {
  subject: number;
  key: string;
}

/** What `holder` believes, about one subject or about everyone, in the order the beliefs were formed. */
export function beliefsHeld(h: WorldHandle, holder: number, subject?: number): BeliefOut[] {
  const held = W(h).beliefs.get(holder);
  if (!held) return [];
  const out: BeliefOut[] = [];
  for (const [k, b] of held) {
    const bar = k.indexOf('|');
    const s = Number(k.slice(0, bar));
    if (subject !== undefined && s !== subject) continue;
    out.push({ subject: s, key: k.slice(bar + 1), ...plain(b) });
  }
  return out;
}

export interface FeelingOut {
  kind: 'grief' | 'resentment' | 'guilt' | 'gratitude';
  toward: number; // the person it is about (for grief, the one lost or parted from)
  cause: number; // the event behind it
  strength: number; // 0..1 now
  since: number; // the month it began
  stands: boolean; // its cause still stands (a wrong not made right, a debt not repaid)
  words: string; // as a reason says it, people as @id: "still sore at @12 over what @12 did (2026)"
}

/** What `holder` feels toward named people, strongest first: grief, resentment, guilt and gratitude, each with its cause. A feeling
 * too faint to weigh in any decision is left out. */
export function feelingsHeld(h: WorldHandle, holder: number): FeelingOut[] {
  const w = W(h);
  const p = w.byId.get(holder);
  if (!p) return [];
  return feelingsOf(w, holder)
    .filter(weighs)
    .sort((a, b) => b.v - a.v)
    .map(f => ({ kind: f.k, toward: f.o, cause: f.ev, strength: f.v, since: f.t, stands: f.stands, words: feelingWords(w, p, f) }));
}

/** The town's places of work, the ones ventures opened among them, in the order they were made. A place never closes. */
export function places(h: WorldHandle): Plain<Place>[] {
  return W(h).places.map(p => plain(p));
}

/** Every group the town has had (bands and the like), ended or not, with its members, former members and history. */
export function groups(h: WorldHandle): Plain<Group>[] {
  return W(h).groups.map(g => plain(g));
}

/** Every venture or cause someone has tried, whatever came of it, with its owner, helpers, opponents and the place it opened. */
export function ventures(h: WorldHandle): Plain<Project>[] {
  return projects(W(h)).map(v => plain(v));
}
