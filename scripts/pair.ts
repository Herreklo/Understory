// Paired scoreboard gate (with an equivalence verdict, round M26): the same evaluation worlds scored under two out dirs (e.g. a mechanism on and off). Per world, accuracy of the
// calibrated witness and of calibrated − notebook, A minus B, mean ± 95% over worlds, on the key slice and overall.
//   tsx scripts/pair.ts out-A out-B
import { readFileSync, readdirSync } from 'fs';
const load = (d: string) => {
  const m = new Map<number, any[]>();
  for (const f of readdirSync(d).filter(f => f.startsWith('eval-')))
    for (const w of JSON.parse(readFileSync(`${d}/${f}`, 'utf8'))) m.set(w.seed, w.g);
  return m;
};
// EXCLUDE=row,row-answer leaves out decisions of those kinds (a diagnostic: is a change in the overall number only a change in the mix?).
const EX = new Set((process.env.EXCLUDE ?? '').split(',').filter(Boolean));
const [A0, B0] = [load(process.argv[2]), load(process.argv[3])];
const keep = (m: Map<number, any[]>) => new Map([...m].map(([k, g]) => [k, g.filter(x => !EX.has(x.trigger))]));
const [A, B] = [keep(A0), keep(B0)];
const seeds = [...A.keys()].filter(s => B.has(s)).sort((a, b) => a - b);
const T = (n: number) =>
  [0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09][n - 1] ?? 2.05;
const ci = (xs: number[]) => {
  const n = xs.length;
  const m = xs.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, n - 1));
  return `${(100 * m).toFixed(1)} ±${((100 * T(n) * sd) / Math.sqrt(n)).toFixed(1)}`;
};
// Round M26: equivalence said as such. Equivalent: the 90% interval lies within ±2 points (two one-sided tests); regression: the 95%
// interval lies wholly below 0; otherwise not shown either way.
const T90 = (n: number) =>
  [0, 6.31, 2.92, 2.35, 2.13, 2.02, 1.94, 1.89, 1.86, 1.83, 1.81, 1.8, 1.78, 1.77, 1.76, 1.75, 1.75, 1.74, 1.73, 1.73][n - 1] ?? 1.7;
const verdict = (xs: number[]) => {
  const n = xs.length;
  const m = xs.reduce((s, x) => s + x, 0) / n;
  const se = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, n - 1)) / Math.sqrt(n);
  if (100 * (m + T(n) * se) < 0) return 'REGRESSION';
  return Math.abs(100 * (m - T90(n) * se)) <= 2 && Math.abs(100 * (m + T90(n) * se)) <= 2 ? 'equivalent ±2' : 'not shown either way';
};
const acc = (g: any[], k: string) => g.filter(x => x[k] === x.chosen).length / Math.max(1, g.length);
const SL: [string, (x: any) => boolean][] = [
  ['all', () => true],
  ['novel · contested · known (key)', x => x.novel && x.contested && x.known],
];
console.log(`${seeds.length} paired worlds · ${process.argv[2]} − ${process.argv[3]} (points)`);
for (const [name, f] of SL) {
  const a = seeds.map(s => A.get(s)!.filter(f)),
    b = seeds.map(s => B.get(s)!.filter(f));
  console.log(
    `  ${name.padEnd(34)} calibrated ${ci(a.map((g, i) => acc(g, 'cal') - acc(b[i], 'cal'))).padStart(12)} (${verdict(a.map((g, i) => acc(g, 'cal') - acc(b[i], 'cal')))}) · calibrated−notebook ${ci(a.map((g, i) => acc(g, 'cal') - acc(g, 'noteOrBase') - (acc(b[i], 'cal') - acc(b[i], 'noteOrBase')))).padStart(12)} · page-annot ${ci(a.map((g, i) => acc(g, 'text') - acc(b[i], 'text'))).padStart(12)} · decisions ${a.reduce((s, g) => s + g.length, 0)}/${b.reduce((s, g) => s + g.length, 0)}`,
  );
}
