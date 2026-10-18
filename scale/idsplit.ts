// Identity, split: a hash of the bonds and of the beliefs separately, to find where two trees part.
import { createHash } from 'crypto';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import * as W from '../src/world';
const kA = (W as any).bkA ?? ((k: number) => Math.floor(k / 100000)),
  kB = (W as any).bkB ?? ((k: number) => k % 100000);
const w = buildWorld(+(process.argv[2] ?? 1), 1, 30, 46);
pickWitness(w);
runYears(w, +(process.argv[3] ?? 2));
const hb = createHash('sha256');
const pairs: string[] = [];
for (const [k, r] of w.bonds) {
  pairs.push(`${kA(k)}-${kB(k)}`);
  hb.update(`${kA(k)}-${kB(k)}|${r.like.toFixed(6)}|${r.trust.toFixed(6)}|${r.fam.toFixed(6)}\n`);
}
const hl = createHash('sha256');
for (const m of w.beliefs.values()) for (const [k, b] of m as Map<string, any>) hl.update(`${k}|${(b.m ?? 0).toFixed(6)}|${b.n}\n`);
const he = createHash('sha256');
for (const e of w.events) he.update(`${e.t}|${e.text}\n`);
console.log(
  'events',
  w.events.length,
  he.digest('hex').slice(0, 10),
  'bonds',
  w.bonds.size,
  hb.digest('hex').slice(0, 10),
  'beliefs',
  hl.digest('hex').slice(0, 10),
  'pairs',
  pairs.slice(0, 4).join(' '),
);
