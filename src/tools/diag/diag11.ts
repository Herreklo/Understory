import { buildWorld, runYears } from '../../build';
import { pickWitness, knows } from '../../witness';
const byCov = new Map<string, { n: number; hit: number; tr: number }>();
const facetNeed = new Map<string, number>(),
  facetHave = new Map<string, number>();
for (let seed = 1; seed <= 8; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 10);
  for (const e of w.events) {
    const d: any = e.decision;
    if (!d || !d.witnessGuess || e.t < w.startPresent) continue;
    const best = Math.max(...d.options.map((o: any) => o.p));
    if (best >= 0.9 || !knows(w, d.person)) continue;
    const cov = d.facetsRead.length ? `${d.facetsKnown}/${d.facetsRead.length}` : 'none';
    const k = d.facetsRead.length
      ? d.facetsKnown === d.facetsRead.length
        ? 'all known'
        : d.facetsKnown === 0
          ? 'none known'
          : 'some known'
      : 'no facets';
    const r = byCov.get(k) ?? { n: 0, hit: 0, tr: 0 };
    byCov.set(k, r);
    r.n++;
    if (d.witnessGuess === d.chosen) r.hit++;
    if (d.traitGuess === d.chosen) r.tr++;
    for (const f of d.facetsRead) {
      facetNeed.set(f, (facetNeed.get(f) ?? 0) + 1);
      const b = w.beliefs.get(w.witness!)?.get(`${d.person}|${f}`);
      if (b && b.n > 0) facetHave.set(f, (facetHave.get(f) ?? 0) + 1);
    }
  }
}
console.log('contested decisions of well-known people, by how many of the facets read the witness knows:');
for (const [k, r] of byCov)
  console.log(
    `  ${k.padEnd(12)} n ${String(r.n).padStart(5)} · witness ${((100 * r.hit) / r.n).toFixed(0)}% · traits-only ${((100 * r.tr) / r.n).toFixed(0)}%`,
  );
console.log('facets read in contested decisions, and how often the witness has a belief on them:');
for (const [f, n] of [...facetNeed].sort((a, b) => b[1] - a[1]))
  console.log(`  ${f.padEnd(18)} read ${String(n).padStart(5)} · known ${((100 * (facetHave.get(f) ?? 0)) / n).toFixed(0)}%`);
