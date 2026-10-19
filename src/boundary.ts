// The boundary: how a game, or any front end outside this repo, talks to a world (docs/scale/portability.md, rule 1).
// A world is created and advanced by commands, and read through events and queries. Everything given back is plain data: numbers,
// strings, booleans, arrays and records, never a Map, a Set or a function, and never a reference into the world, so a caller cannot
// change a world by holding on to what it was given. The lab page and the tools read the engine directly; they are instruments.
import { buildWorld } from './build';
import { tick } from './life';
import { pickWitness } from './witness';
import { live, peekBond, year, type Belief, type Bond, type Event, type Person, type World } from './world';

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

export type Command = { kind: 'advance'; months: number };

export function createWorld(c: CreateWorld): WorldHandle {
  const w = buildWorld(c.seed, c.runSeed ?? 1, c.pastYears ?? 30, c.adults ?? 46);
  if (c.witness ?? true) pickWitness(w);
  return w as unknown as WorldHandle;
}

export function command(h: WorldHandle, c: Command): void {
  switch (c.kind) {
    case 'advance':
      for (let i = 0; i < c.months; i++) tick(W(h));
      return;
  }
}

// ── Events ──

/** Every event from month `since` on, oldest first, each with its reasons, its evidence and who knows it. */
export function events(h: WorldHandle, since = 0): Plain<Event>[] {
  const evs = W(h).events;
  let i = evs.length;
  while (i > 0 && evs[i - 1].t >= since) i--; // the record is in time order: read it from the end
  return evs.slice(i).map(e => plain(e));
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

/** The people living in town now, by id, in the engine's order. */
export function townIds(h: WorldHandle): number[] {
  return live(W(h)).map(p => p.id);
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
