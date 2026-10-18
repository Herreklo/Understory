// Identity, whole world: a fingerprint of everything the world holds after a run, to compare engine and branch on one seed.
//   npx tsx scale/identity2.ts <seed> [years]
// Hashes, separately: every person (every field), every event (every field: causes, evidence, decision record, who knew it),
// every bond (every field, memories included), every belief, the groups, the workplaces and the world's counters.
// Bond keys are hashed as the pair they join, so trees that store keys differently still compare. Fields that exist only in the
// scale branch (its index and neighbourhood bookkeeping) are left out; they are absent in a one-neighbourhood town anyway.
import { createHash } from 'crypto';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import * as W from '../src/world';
const kA = (W as any).bkA ?? ((k: number) => Math.floor(k / 100000)),
  kB = (W as any).bkB ?? ((k: number) => k % 100000);
const seed = +(process.argv[2] ?? 1),
  years = +(process.argv[3] ?? 10);
const w = buildWorld(seed, 1, 30, 46);
pickWitness(w);
runYears(w, years);
const SKIP = new Set(['hood', '_idx', '_rebuilds', 'H', 'townScale', 'focus', 'background', '_onNewBond', '_out']);
const canon = (x: any): string =>
  JSON.stringify(x, function (k, v) {
    if (SKIP.has(k)) return undefined;
    if (v instanceof Map) return { __map: [...v.entries()] };
    if (v instanceof Set) return { __set: [...v.values()] };
    if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
    return v;
  });
const h = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 12);
const people = h(w.people.map(p => canon(p)).join('\n'));
const events = h(w.events.map(e => canon(e)).join('\n'));
const bonds = h([...w.bonds].map(([k, r]) => `${kA(k)}-${kB(k)}:${canon(r)}`).join('\n'));
const beliefs = h([...w.beliefs].map(([k, m]) => `${k}:${canon(m)}`).join('\n'));
const rest = h(canon({ groups: w.groups, places: w.places, stats: w.stats, t: w.t, nextId: w.nextId, queue: w.queue.length }));
console.log(JSON.stringify({ seed, years, people: w.people.length, events: w.events.length, hashes: { people, events, bonds, beliefs, rest } }));
