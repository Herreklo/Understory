// Per version: calibrated witness minus notebook and minus the tendency learner, per world, mean ± 95% over worlds;
// and each version paired against the unchanged one.
import { readFileSync, readdirSync, existsSync } from 'fs';
const S = process.argv[2],
  ARMS = ['base', 'z', 'circ', 'ifthen', 'all', 'p3', 'p6', 'p10', 'p15'].filter(a => existsSync(`${S}/out-${a}`));
const tt = [0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09];
const ci = xs => {
  const n = xs.length,
    m = xs.reduce((a, b) => a + b, 0) / n,
    sd = Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1));
  return `${(100 * m).toFixed(1).padStart(5)} ±${((100 * (tt[n - 1] ?? 2.05) * sd) / Math.sqrt(n)).toFixed(1)}`;
};
const load = a => {
  const m = new Map();
  for (const f of readdirSync(`${S}/out-${a}`).filter(f => f.startsWith('eval-')))
    for (const w of JSON.parse(readFileSync(`${S}/out-${a}/${f}`, 'utf8'))) m.set(w.seed, w.g);
  return m;
};
const acc = (g, k) => g.filter(x => x[k] === x.chosen).length / Math.max(1, g.length);
const SL = { all: () => true, key: x => x.novel && x.contested && x.known, nonCouple: x => !['row', 'row-answer', 'stay'].includes(x.trigger) };
const D = Object.fromEntries(ARMS.map(a => [a, load(a)]));
const seeds = [...D.base.keys()].filter(s => ARMS.every(a => D[a].has(s))).sort((a, b) => a - b);
console.log(`${seeds.length} worlds (${seeds[0]}–${seeds.at(-1)})`);
for (const [sn, f] of Object.entries(SL)) {
  console.log(`\n== ${sn} ==`);
  console.log('version   decisions  calibrated   cal−notebook   cal−tendency   cal−base   | cal−notebook vs unchanged');
  for (const a of ARMS) {
    const g = seeds.map(s => D[a].get(s).filter(f)),
      gb = seeds.map(s => D.base.get(s).filter(f));
    const d = g.map(x => acc(x, 'cal') - acc(x, 'noteOrBase')),
      db = gb.map(x => acc(x, 'cal') - acc(x, 'noteOrBase'));
    console.log(
      `${a.padEnd(9)} ${String(g.reduce((s, x) => s + x.length, 0)).padStart(8)}  ${ci(g.map(x => acc(x, 'cal')))}  ${ci(d)}  ${ci(g.map(x => acc(x, 'cal') - acc(x, 'tend')))}  ${ci(g.map(x => acc(x, 'cal') - acc(x, 'base')))}  | ${a === 'base' ? '' : ci(d.map((x, i) => x - db[i]))}`,
    );
  }
}
