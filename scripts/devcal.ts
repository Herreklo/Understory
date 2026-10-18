import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { OFF, live, age } from '../src/world';
const rate = +process.argv[2];
const off = process.argv[3] === 'off';
(globalThis as any).DEV_RATE = rate;
if (off) OFF.add('latent');
const b: Record<string, [number, number]> = { '12-17': [0, 0], '18-25': [0, 0], '26-40': [0, 0], '41-60': [0, 0], '15-60': [0, 0] };
let births = 0;
for (const seed of [1801, 1802, 1803, 1804, 1805, 1806, 1807, 1808, 1809, 1810]) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const n0 = w.events.length;
  runYears(w, 10);
  births += w.events.slice(n0).filter(e => e.type === 'born').length;
  for (const p of live(w)) {
    const a = age(w, p);
    const pl = ['guitar', 'vocals'].some(h => p.skills[h]?.interest === 2);
    for (const [k, [lo, hi]] of [
      ['12-17', [12, 17]],
      ['18-25', [18, 25]],
      ['26-40', [26, 40]],
      ['41-60', [41, 60]],
      ['15-60', [15, 60]],
    ] as const)
      if (a >= lo && a < hi + 1) {
        b[k][1]++;
        if (pl) b[k][0]++;
      }
  }
}
console.log(
  off ? 'dealt     ' : `rate ${rate}`.padEnd(10),
  Object.entries(b)
    .map(([k, [a, n]]) => `${k} ${((100 * a) / n).toFixed(0)}%`)
    .join('  '),
  ` births ${births}`,
);
