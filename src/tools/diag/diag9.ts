import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { facet, peekBond } from '../../world';
import { FACET_BY_ID } from '../../core';
let n = 0,
  sumT = 0,
  sumB = 0,
  sumTT = 0,
  sumBB = 0,
  sumTB = 0,
  right = 0,
  big = 0,
  bigRight = 0,
  ratio = 0,
  nr = 0;
let nIf = 0,
  nIfB = 0;
let known = 0,
  people = 0,
  nb = 0;
for (let seed = 1; seed <= 8; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 10);
  const bm = w.beliefs.get(w.witness!)!;
  for (const p of w.people) {
    if (p.status !== 'in' || p.id === w.witness) continue;
    people++;
    const r = peekBond(w, w.witness!, p.id);
    if (r && r.fam > 0.4) known++;
    for (const [k, b] of bm) {
      const [sid, key] = k.split('|');
      if (+sid !== p.id) continue;
      if (key.startsWith('ifthen:')) {
        nIfB++;
        continue;
      }
      if (!FACET_BY_ID[key] || b.n < 2) continue;
      nb++;
      const t = facet(p, key);
      n++;
      sumT += t;
      sumB += b.m;
      sumTT += t * t;
      sumBB += b.m * b.m;
      sumTB += t * b.m;
      if (Math.sign(t) === Math.sign(b.m)) right++;
      if (Math.abs(t) > 1.2) {
        big++;
        if (Math.sign(t) === Math.sign(b.m) && Math.abs(b.m) > 0.5) bigRight++;
        ratio += Math.abs(b.m) / Math.abs(t);
        nr++;
      }
    }
    nIf += p.ifThens.length;
  }
}
const corr = (n * sumTB - sumT * sumB) / Math.sqrt((n * sumTT - sumT * sumT) * (n * sumBB - sumB * sumB));
console.log(`people ${people}, well known ${known}, facet beliefs with 2+ obs ${nb} (${(nb / people).toFixed(1)} per person of 25)`);
console.log(
  `belief vs truth: correlation ${corr.toFixed(2)}, sign right ${((100 * right) / n).toFixed(0)}%, strong traits (|z|>1.2) confidently right ${((100 * bigRight) / big).toFixed(0)}%, belief magnitude / truth magnitude ${(ratio / nr).toFixed(2)}`,
);
console.log(`if-thens in population ${nIf}, if-then beliefs held by witness ${nIfB}`);
