// The boundary test (in npm test): a world run through src/boundary.ts is the same world as one run directly, and everything the
// boundary gives back is plain data that survives a JSON round trip unchanged.
import { deepStrictEqual, strictEqual } from 'assert';
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { beliefsHeld, bondOf, command, createWorld, events, now, person, townIds, type WorldHandle } from '../boundary';
import { signature } from './diag/signature';
import type { World } from '../world';

const seed = 9001,
  pastYears = 10,
  months = 24;

const direct = buildWorld(seed, 1, pastYears);
pickWitness(direct);
runYears(direct, months / 12);

const h = createWorld({ seed, pastYears });
command(h, { kind: 'advance', months });
deepStrictEqual(signature(h as unknown as World), signature(direct), 'a world run through the boundary differs from one run directly');

const roundTrip = (label: string, x: unknown) => deepStrictEqual(JSON.parse(JSON.stringify(x)), x, `${label} does not survive JSON unchanged`);
const t = now(h);
roundTrip('now', t);
const evs = events(h);
strictEqual(evs.length, direct.events.length, 'events() from month 0 is not the whole record');
roundTrip('events', evs);
const recent = events(h, t.t - 6);
strictEqual(recent.length, direct.events.filter(e => e.t >= t.t - 6).length, 'events(since) misses or adds events');
const ids = townIds(h);
roundTrip('townIds', ids);
strictEqual(ids.length, direct.people.filter(q => q.status === 'in').length, 'townIds() is not the town');
for (const id of ids.slice(0, 10)) {
  roundTrip(`person ${id}`, person(h, id));
  roundTrip(`beliefs of ${id}`, beliefsHeld(h, id));
  for (const other of ids.slice(0, 10)) roundTrip(`bond ${id}→${other}`, bondOf(h, id, other));
}

// Reading through the boundary changed nothing (no bond made, no state written), and what it gave back is a copy: changing it
// leaves the world as it was. Compared with the world run directly, which nothing has read.
const p = person(h, ids[0])!;
(p as any).first = 'Changed';
evs[0].text = 'changed';
deepStrictEqual(
  signature(h as unknown as World),
  signature(direct),
  'reading through the boundary, or changing what it gave back, changed the world',
);

// The handle is opaque to callers: reading the world through it must not type-check (checked by tsc in npm test, never run).
export function opaque(x: WorldHandle) {
  // @ts-expect-error a WorldHandle has no fields a caller can read
  return x.people;
}
console.log(`boundary: identical to a direct run (seed ${seed}, ${evs.length} events); every answer is plain data`);
