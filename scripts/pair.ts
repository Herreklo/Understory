// Paired scoreboard gate: the same evaluation worlds scored under two out dirs (e.g. a mechanism on and off). Per world, accuracy of the
// calibrated witness and of calibrated − notebook, A minus B, mean ± 95% over worlds, on the key slice and overall.
//   tsx scripts/pair.ts out-A out-B
import { readFileSync, readdirSync } from 'fs';
const load = (d: string) => { const m = new Map<number, any[]>(); for (const f of readdirSync(d).filter(f => f.startsWith('eval-'))) for (const w of JSON.parse(readFileSync(`${d}/${f}`, 'utf8'))) m.set(w.seed, w.g); return m; };
const [A, B] = [load(process.argv[2]), load(process.argv[3])]; const seeds = [...A.keys()].filter(s => B.has(s)).sort((a, b) => a - b);
const T = (n: number) => [0, 12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.20, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.10, 2.09, 2.09][n - 1] ?? 2.05;
const ci = (xs: number[]) => { const n = xs.length; const m = xs.reduce((s, x) => s + x, 0) / n; const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, n - 1)); return `${(100 * m).toFixed(1)} ±${(100 * T(n - 1) * sd / Math.sqrt(n)).toFixed(1)}`; };
const acc = (g: any[], k: string) => g.filter(x => x[k] === x.chosen).length / Math.max(1, g.length);
const SL: [string, (x: any) => boolean][] = [['all', () => true], ['novel · contested · known (key)', x => x.novel && x.contested && x.known]];
console.log(`${seeds.length} paired worlds · ${process.argv[2]} − ${process.argv[3]} (points)`);
for (const [name, f] of SL) { const a = seeds.map(s => A.get(s)!.filter(f)), b = seeds.map(s => B.get(s)!.filter(f));
  console.log(`  ${name.padEnd(34)} calibrated ${ci(a.map((g, i) => acc(g, 'cal') - acc(b[i], 'cal'))).padStart(12)} · calibrated−notebook ${ci(a.map((g, i) => (acc(g, 'cal') - acc(g, 'noteOrBase')) - (acc(b[i], 'cal') - acc(b[i], 'noteOrBase')))).padStart(12)} · page-evid ${ci(a.map((g, i) => acc(g, 'text') - acc(b[i], 'text'))).padStart(12)} · decisions ${a.reduce((s, g) => s + g.length, 0)}/${b.reduce((s, g) => s + g.length, 0)}`); }
