// Identity check: a fingerprint of a whole world run, to compare engine and branch on the same seed.
//   npx tsx scale/identity.ts <seed> [years] [adults]
// Prints a hash of every event (time, type, text, who knew it) and of everyone's bonds and beliefs at the end.
import { createHash } from 'crypto';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import * as W from '../src/world';
// Bonds are hashed by the pair they join, so trees that store bond keys differently still compare.
const kA = (W as any).bkA ?? ((k: number) => Math.floor(k / 100000)),
  kB = (W as any).bkB ?? ((k: number) => k % 100000);
const seed = +(process.argv[2] ?? 1),
  years = +(process.argv[3] ?? 10),
  adults = +(process.argv[4] ?? 46);
const w = buildWorld(seed, 1, 30, adults);
pickWitness(w);
runYears(w, years);
const h = createHash('sha256');
for (const e of w.events) h.update(`${e.t}|${e.type}|${e.text}|${[...e.knownBy].map(([k, v]) => k + v).join(',')}\n`);
const ev = h.digest('hex').slice(0, 16);
const h2 = createHash('sha256');
for (const [k, r] of w.bonds) h2.update(`${kA(k)}-${kB(k)}|${r.like.toFixed(6)}|${r.trust.toFixed(6)}|${r.fam.toFixed(6)}\n`);
let nb = 0;
for (const m of w.beliefs.values())
  for (const [k, b] of m as Map<string, any>) {
    nb++;
    h2.update(`${k}|${(b.m ?? 0).toFixed(6)}|${b.n}\n`);
  }
console.log(
  JSON.stringify({
    seed,
    years,
    events: w.events.length,
    people: w.people.length,
    bonds: w.bonds.size,
    beliefs: nb,
    eventsHash: ev,
    stateHash: h2.digest('hex').slice(0, 16),
  }),
);
