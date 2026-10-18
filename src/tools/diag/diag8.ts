// Why doesn't knowing someone help the witness predict them? Break accuracy down by trigger, option count, and how well known.
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { peekBond } from '../../world';
const by = new Map<string, { n: number; hit: number; kn: number; khit: number; pmax: number }>();
const byFam = new Map<number, { n: number; hit: number }>();
for (let seed = 1; seed <= 12; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 10);
  for (const e of w.events) {
    const d = e.decision;
    if (!d || !d.witnessGuess || e.t < w.startPresent) continue;
    const key = d.trigger
      .replace(/:.*$/, '')
      .replace(/a want.*/, 'want')
      .replace(/whether to go on.*/, 'go on');
    const r = by.get(key) ?? { n: 0, hit: 0, kn: 0, khit: 0, pmax: 0 };
    by.set(key, r);
    const hit = d.witnessGuess === d.chosen;
    r.n++;
    if (hit) r.hit++;
    const pm = Math.max(...d.options.map(o => o.p));
    r.pmax += pm;
    const fam = peekBond(w, w.witness!, d.person)?.fam ?? 0;
    const bucket = fam > 0.6 ? 3 : fam > 0.3 ? 2 : fam > 0.1 ? 1 : 0;
    const f = byFam.get(bucket) ?? { n: 0, hit: 0 };
    byFam.set(bucket, f);
    f.n++;
    if (hit) f.hit++;
    if (fam > 0.4) {
      r.kn++;
      if (hit) r.khit++;
    }
  }
}
console.log('trigger'.padEnd(16), 'n', 'witness right', 'known right', 'truth max p');
for (const [k, r] of [...by].sort((a, b) => b[1].n - a[1].n))
  console.log(
    k.padEnd(16),
    String(r.n).padStart(5),
    ((100 * r.hit) / r.n).toFixed(0).padStart(5) + '%',
    r.kn ? ((100 * r.khit) / r.kn).toFixed(0).padStart(5) + '%' : '    -',
    ((100 * r.pmax) / r.n).toFixed(0).padStart(5) + '%',
  );
console.log(
  'by familiarity bucket (0 stranger .. 3 close):',
  [...byFam]
    .sort()
    .map(([b, f]) => `${b}: ${((100 * f.hit) / f.n).toFixed(0)}% (${f.n})`)
    .join('  '),
);
