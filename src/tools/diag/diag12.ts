import { buildWorld, runYears } from '../../build';
import { pickWitness, knows } from '../../witness';
const by = new Map<string, { n: number; w: number; t: number; c: number; b: Map<string, number> }>();
for (let seed = 1; seed <= 10; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 10);
  for (const e of w.events) {
    const d: any = e.decision;
    if (!d || !d.witnessGuess || e.t < w.startPresent) continue;
    const best = Math.max(...d.options.map((o: any) => o.p));
    if (best >= 0.9 || !knows(w, d.person)) continue;
    const k = d.trigger
      .replace(/:.*$/, '')
      .replace(/^a want.*/, 'want')
      .replace(/^whether to go on.*/, 'go on');
    const r = by.get(k) ?? { n: 0, w: 0, t: 0, c: 0, b: new Map() };
    by.set(k, r);
    r.n++;
    if (d.witnessGuess === d.chosen) r.w++;
    if (d.traitGuess === d.chosen) r.t++;
    if (d.circGuess === d.chosen) r.c++;
    r.b.set(d.chosen, (r.b.get(d.chosen) ?? 0) + 1);
  }
}
console.log('contested, known well:  trigger  n  baseline  witness  traits-only  circ-only');
for (const [k, r] of [...by].sort((a, b) => b[1].n - a[1].n)) {
  const base = Math.max(...r.b.values()) / r.n;
  console.log(
    k.padEnd(16),
    String(r.n).padStart(5),
    (100 * base).toFixed(0).padStart(6) + '%',
    ((100 * r.w) / r.n).toFixed(0).padStart(6) + '%',
    ((100 * r.t) / r.n).toFixed(0).padStart(8) + '%',
    ((100 * r.c) / r.n).toFixed(0).padStart(8) + '%',
  );
}
