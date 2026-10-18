// Demography invariants: a town should neither empty nor fill, and should have children in it.
// A small rural town has more deaths than births and lives on people moving in; births at least 60% of deaths, population within -20%..+35% over the run.
//   tsx src/demography.ts [worlds] [years]
import { buildWorld, runYears } from './build';
import { OFF } from './world';
for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x); // ablation, as in board.ts
import { pickWitness } from './witness';
import { live, age } from './world';
const N = +(process.argv[2] ?? 12), Y = +(process.argv[3] ?? 20);
let births = 0, deaths = 0, start = 0, end = 0, young = 0, n = 0, arrived = 0, left = 0;
const bins = new Array(9).fill(0);
for (let seed = 1; seed <= N; seed++) {
  const w = buildWorld(seed, 1); pickWitness(w); start += live(w).length; const t0 = w.t;
  runYears(w, Y);
  const ev = w.events.filter(e => e.t >= t0);
  births += ev.filter(e => e.type === 'born' && /was born/.test(e.text)).length; deaths += ev.filter(e => e.type === 'death').length;
  arrived += ev.filter(e => e.type === 'arrived').reduce((s, e) => s + e.who.length, 0); left += ev.filter(e => e.type === 'left').length;
  const L = live(w); end += L.length; for (const p of L) { bins[Math.min(8, Math.floor(age(w, p) / 10))]++; if (age(w, p) < 20) young++; n++; }
}
const d = Y / 10;
console.log(`${N} worlds × ${Y} years, per decade per world: births ${(births / N / d).toFixed(1)} · deaths ${(deaths / N / d).toFixed(1)} · arrivals ${(arrived / N / d).toFixed(1)} · population ${(start / N).toFixed(0)} → ${(end / N).toFixed(0)}`);
console.log(`age pyramid at the end (share by decade 0-9 … 80+): ${bins.map(b => (100 * b / n).toFixed(0) + '%').join(' ')} · under 20: ${(100 * young / n).toFixed(0)}%`);
const ratio = births / Math.max(1, deaths), grow = end / start;
const ok = ratio >= 0.6 && ratio < 1.6 && young / n >= 0.15 && grow > 0.8 && grow < 1.35;
console.log(ok ? 'demography ok' : `DEMOGRAPHY FAILED: births/deaths ${ratio.toFixed(2)}, under-20 ${(100 * young / n).toFixed(0)}%, growth ${grow.toFixed(2)}`);
if (!ok) process.exit(1);
