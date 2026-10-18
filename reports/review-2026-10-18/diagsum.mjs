// Sums the diagnostic counters of the unchanged version's runs.
import { readFileSync, readdirSync, existsSync } from 'fs';
const S = process.argv[2];
const T = { score: {}, pop: { wrongTypes: {} } };
const add = (o, x) => {
  for (const [k, v] of Object.entries(x)) typeof v === 'number' ? (o[k] = (o[k] ?? 0) + v) : add((o[k] ??= {}), v);
};
for (const d of ['diag-base-train', 'diag-base-eval'])
  for (const f of readdirSync(`${S}/${d}`)) {
    const j = JSON.parse(readFileSync(`${S}/${d}/${f}`, 'utf8'));
    add(T.score, j.score);
    add(T.pop, j.pop);
  }
const s = T.score,
  p = T.pop;
console.log(`decisions ${s.n}; options with unequal numbers of considerations ${((100 * s.unequal) / s.n).toFixed(1)}%`);
console.log(`gap in count: ${JSON.stringify(s.gapHist)}`);
console.log(
  `likeliest answer changes if the count carried no weight: ${((100 * s.argmaxDiff) / s.n).toFixed(1)}% of all decisions, ${((100 * s.argmaxDiff) / s.unequal).toFixed(1)}% of unequal ones`,
);
console.log(
  `mean probability moved (total variation): ${(s.tvU / s.unequal).toFixed(3)} in unequal decisions; option(s) with fewest considerations gain on average ${(s.fewerGain / s.fewerN).toFixed(3)}`,
);
console.log(
  `unkept events taken off a person's list: ${p.n}; wrong one removed ${p.wrong} (${((100 * p.wrong) / p.n).toFixed(1)}%); ${JSON.stringify(p.wrongTypes)}; duplicate ids ${p.dupWho}`,
);
// The bent versions: how far each generator is from the readers' model.
for (const a of ['p3', 'p6', 'p10', 'p15']) {
  const G = { n: 0, tv: 0, argmax: 0 };
  for (const d of [`diag-${a}-train`, `diag-${a}-eval`]) {
    if (!existsSync(`${S}/${d}`)) continue;
    for (const f of readdirSync(`${S}/${d}`)) {
      const g = JSON.parse(readFileSync(`${S}/${d}/${f}`, 'utf8')).gen;
      if (g) for (const k in G) G[k] += g[k];
    }
  }
  if (G.n)
    console.log(
      `${a}: probability moved ${(G.tv / G.n).toFixed(3)} (total variation); likeliest answer changed in ${((100 * G.argmax) / G.n).toFixed(1)}% of ${G.n} decisions`,
    );
}
