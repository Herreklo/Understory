// How many things does each adult love (interest 2)? People have a few passions, not many.
import { buildWorld, runYears } from '../src/build'; import { pickWitness } from '../src/witness'; import { live, age } from '../src/world';
const hist = [0, 0, 0, 0, 0, 0];
for (const seed of [1801, 1802, 1803, 1804, 1805, 1806]) { const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 10);
  for (const p of live(w)) if (age(w, p) >= 20 && age(w, p) <= 60) hist[Math.min(5, Object.values(p.skills).filter(s => s.interest === 2).length)]++; }
const n = hist.reduce((a, b) => a + b, 0); console.log('adults by number of passions 0..5+:', hist.map(h => (100 * h / n).toFixed(0) + '%').join(' '));
