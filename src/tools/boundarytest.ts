// The boundary test (in npm test): a world run through src/boundary.ts is the same world as one run directly, and everything the
// boundary gives back is plain data that survives a JSON round trip unchanged.
import './env'; // OFF= and ON= from the environment, before anything runs
import { deepStrictEqual, strictEqual } from 'assert';
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { beliefsHeld, bondOf, command, createWorld, events, groups, now, person, places, townIds, ventures, type WorldHandle } from '../boundary';
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
roundTrip('places', places(h));
strictEqual(places(h).length, direct.places.length, 'places() is not every place');
roundTrip('groups', groups(h));
strictEqual(groups(h).length, direct.groups.length, 'groups() is not every group');
roundTrip('ventures', ventures(h));

// A command the engine refuses names its condition and writes nothing: asking oneself, asking nobody, asking someone not old enough.
const young = ids.find(id => now(h).t - person(h, id)!.born < 12 * 15)!;
for (const [by, to] of [
  [ids[0], ids[0]],
  [ids[0], -1],
  [ids[0], young],
]) {
  const a = command(h, { kind: 'invite', by, to, what: 'rehearsal' });
  roundTrip(`refusal ${by}→${to}`, a);
  strictEqual(a.ok, false, `an invitation from ${by} to ${to} was not refused`);
  strictEqual(a.events.length, 0, 'a refusal recorded an event');
}

// Reading through the boundary, or a refused command, changed nothing (no bond made, no state written), and what it gave back is a
// copy: changing it leaves the world as it was. Compared with the world run directly, which nothing has read.
const p = person(h, ids[0])!;
(p as any).first = 'Changed';
evs[0].text = 'changed';
deepStrictEqual(
  signature(h as unknown as World),
  signature(direct),
  'reading through the boundary, a refused command, or changing what it gave back, changed the world',
);

// An invitation put: the answer is the asked person's own decision, recorded like any event and known to both; it is plain data;
// the same invitation in the same world gives the same answer and the same world, there and in the months after; and the same
// person cannot be asked again in the month they answered.
const free = ids.filter(
  id =>
    person(h, id)!.group == null &&
    now(h).t - person(h, id)!.born >= 12 * 15 &&
    ['guitar', 'vocals'].some(s => (person(h, id)!.skills[s]?.interest ?? 0) >= 1),
);
const [asker, asked] = free;
const put = () => {
  const x = createWorld({ seed, pastYears });
  command(x, { kind: 'advance', months });
  return { x, a: command(x, { kind: 'invite', by: asker, to: asked, what: 'rehearsal' }) };
};
const one = put(),
  two = put();
roundTrip('an invitation', one.a);
strictEqual(one.a.ok, true, `the invitation was refused: ${one.a.why.join('; ')}`);
const answer = one.a.events[0];
strictEqual(answer.type, 'invite', 'the first event of an invitation is not its answer');
strictEqual(answer.decision?.person, asked, 'the answer is not the asked person’s decision');
strictEqual(['yes', 'no'].includes(answer.decision!.chosen), true, 'the answer is neither yes nor no');
strictEqual(answer.knownBy.some(([id]) => id === asker) && answer.knownBy.some(([id]) => id === asked), true, 'the answer is not known to both');
deepStrictEqual(events(one.x, answer.t).slice(-one.a.events.length), one.a.events, 'what the invitation recorded is not in the record');
deepStrictEqual(one.a, two.a, 'the same invitation gave two answers');
deepStrictEqual(signature(one.x as unknown as World), signature(two.x as unknown as World), 'the same invitation left two worlds');
strictEqual(command(one.x, { kind: 'invite', by: asker, to: asked, what: 'rehearsal' }).ok, false, 'an answered invitation was put again');
command(one.x, { kind: 'advance', months: 6 });
command(two.x, { kind: 'advance', months: 6 });
deepStrictEqual(signature(one.x as unknown as World), signature(two.x as unknown as World), 'the months after an invitation differ');

// The handle is opaque to callers: reading the world through it must not type-check (checked by tsc in npm test, never run).
export function opaque(x: WorldHandle) {
  // @ts-expect-error a WorldHandle has no fields a caller can read
  return x.people;
}
console.log(
  `boundary: identical to a direct run (seed ${seed}, ${evs.length} events); every answer is plain data; a refused command writes ` +
    `nothing; an invitation is answered (${answer.decision!.chosen}) the same way every time`,
);
