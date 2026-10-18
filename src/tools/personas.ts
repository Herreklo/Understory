// Round 18, part one: are people unique, do they resemble each other, and does the generator follow the research? Every adult at the
// end of ten present years, pooled over many worlds.
//   tsx src/tools/personas.ts run A B → out-personas/A-B.json ; tsx src/tools/personas.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { live, age } from '../world';
import { FACETS } from '../core';
import { persona } from '../persona';
const OUT = process.env.PERSONAS_OUT ?? 'out-personas';
mkdirSync(OUT, { recursive: true });
type Row = {
  seed: number;
  f: number[];
  age: number;
  quirks: string[];
  patterns: string[];
  humour: Record<string, number>;
  voice: Record<string, number>;
  loves: string[];
  marks: string[];
};
if (process.argv[2] === 'run') {
  const A = +process.argv[3],
    B = +process.argv[4];
  const rows: Row[] = [];
  for (let seed = A; seed <= B; seed++) {
    const w = buildWorld(seed, 1);
    pickWitness(w);
    runYears(w, 10);
    for (const p of live(w).filter(q => age(w, q) >= 20)) {
      const ps = persona(w, p);
      rows.push({
        seed,
        f: FACETS.map(x => p.facets[x.id] ?? 0),
        age: age(w, p),
        quirks: ps.quirks.map(q => q.text),
        patterns: ps.quirks.map(q => q.pattern),
        humour: ps.humour,
        voice: ps.voice,
        loves: ps.loves,
        marks: [...ps.sore.map(x => 's:' + x.key), ...ps.fears.map(x => 'f:' + x.key), ...ps.rules.map(x => 'r:' + x.key)],
      });
    }
    console.error(`personas: world ${seed}`);
  }
  writeFileSync(`${OUT}/${A}-${B}.json`, JSON.stringify(rows));
} else {
  const R: Row[] = [];
  for (const f of readdirSync(OUT)) R.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
  const third = (x: number) => (x > 0.43 ? '+' : x < -0.43 ? '-' : '0');
  const main = (h: Record<string, number>) =>
    (['warm', 'coping', 'cutting', 'selfMocking'] as const).map(k => [k, h[k]] as const).sort((a, b) => b[1] - a[1])[0][0];
  const count = (keys: string[]) => {
    const m = new Map<string, number>();
    for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
    return m;
  };
  const withQ = R.filter(r => r.quirks.length);
  const qk = withQ.map(r => r.quirks.slice().sort().join(' | '));
  const qc = count(qk);
  const surf = R.map(r =>
    [r.quirks.slice().sort().join('|'), main(r.humour), Object.values(r.voice).map(third).join(''), r.loves.slice().sort().join('|')].join(' / '),
  );
  const sc = count(surf);
  const blank = R.filter(
    r =>
      !r.quirks.length &&
      !r.marks.length &&
      Math.max(r.humour.warm, r.humour.coping, r.humour.cutting, r.humour.selfMocking) <= 1 &&
      Math.abs(r.humour.wit) <= 1 &&
      Object.values(r.voice).every(v => Math.abs(v) <= 1),
  );
  console.log(`${R.length} adults (20+)`);
  console.log(
    `1. quirks identical to another adult's (among ${withQ.length} with quirks): ${((100 * qk.filter(k => qc.get(k)! > 1).length) / withQ.length).toFixed(2)}%`,
  );
  {
    const byTown = new Map<string, number>();
    for (const r of R)
      for (const q of r.quirks) {
        const k = r.seed + '|' + q;
        byTown.set(k, (byTown.get(k) ?? 0) + 1);
      }
    const shared = R.filter(r => r.quirks.some(q => byTown.get(r.seed + '|' + q)! > 1)).length;
    console.log(`   sharing a quirk sentence with someone in the same town: ${((100 * shared) / R.length).toFixed(2)}%`);
  }
  console.log(
    `   full surface identical to another's: ${((100 * surf.filter(k => sc.get(k)! > 1).length) / R.length).toFixed(2)}% · nothing at all: ${((100 * blank.length) / R.length).toFixed(1)}% · quirks per adult: ${(R.reduce((s, r) => s + r.quirks.length, 0) / R.length).toFixed(2)} · distinct quirk texts ${new Set(R.flatMap(r => r.quirks)).size} of ${R.reduce((s, r) => s + r.quirks.length, 0)}`,
  );
  // Nearest neighbours in trait space (a sample of 2,000 for the search), against random pairs.
  const d = (a: number[], b: number[]) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
    return s;
  };
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const shares = (a: Row, b: Row) =>
    main(a.humour) === main(b.humour) || a.patterns.some(x => b.patterns.includes(x)) || a.loves.some(x => b.loves.includes(x));
  const sample = R.map((_, i) => i)
    .sort(() => rnd() - 0.5)
    .slice(0, 2000);
  let nnShare = 0,
    rShare = 0,
    nnMarksDiffer = 0,
    nnMarksN = 0;
  for (const i of sample) {
    let best = -1,
      bd = Infinity;
    for (let j = 0; j < R.length; j++)
      if (j !== i) {
        const x = d(R[i].f, R[j].f);
        if (x < bd) {
          bd = x;
          best = j;
        }
      }
    if (shares(R[i], R[best])) nnShare++;
    const k = Math.floor(rnd() * R.length);
    if (k !== i && shares(R[i], R[k])) rShare++;
    if (R[i].marks.length || R[best].marks.length) {
      nnMarksN++;
      if (R[i].marks.slice().sort().join() !== R[best].marks.slice().sort().join()) nnMarksDiffer++;
    }
  }
  console.log(
    `2. nearest neighbours in traits share a surface feature ${((100 * nnShare) / sample.length).toFixed(1)}%, random pairs ${((100 * rShare) / sample.length).toFixed(1)}% (ratio ${(nnShare / Math.max(1, rShare)).toFixed(2)})`,
  );
  const corr = (xs: number[], ys: number[]) => {
    const n = xs.length,
      mx = xs.reduce((a, b) => a + b, 0) / n,
      my = ys.reduce((a, b) => a + b, 0) / n;
    let a = 0,
      b = 0,
      c = 0;
    for (let i = 0; i < n; i++) {
      a += (xs[i] - mx) * (ys[i] - my);
      b += (xs[i] - mx) ** 2;
      c += (ys[i] - my) ** 2;
    }
    return a / Math.sqrt(b * c);
  };
  const fi = (id: string) => FACETS.findIndex(x => x.id === id);
  console.log(
    `3. warm–sociability ${corr(
      R.map(r => r.humour.warm),
      R.map(r => r.f[fi('sociability')]),
    ).toFixed(2)} · cutting–gentleness ${corr(
      R.map(r => r.humour.cutting),
      R.map(r => r.f[fi('gentleness')]),
    ).toFixed(2)} · self-mocking–anxiety ${corr(
      R.map(r => r.humour.selfMocking),
      R.map(r => r.f[fi('anxiety')]),
    ).toFixed(2)} · coping–anxiety ${corr(
      R.map(r => r.humour.coping),
      R.map(r => r.f[fi('anxiety')]),
    ).toFixed(2)} · quirks–unconventionality ${corr(
      R.map(r => r.quirks.length),
      R.map(r => r.f[fi('unconventionality')]),
    ).toFixed(2)}`,
  );
  const over40 = R.filter(r => r.age >= 40);
  console.log(
    `4. adults 40+ with a mark from their own history: ${((100 * over40.filter(r => r.marks.length).length) / over40.length).toFixed(1)}% · nearest neighbours whose marks differ: ${((100 * nnMarksDiffer) / Math.max(1, nnMarksN)).toFixed(1)}% of ${nnMarksN}`,
  );
  const mc = count(R.flatMap(r => r.marks));
  console.log(
    `   marks: ${[...mc]
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ${n}`)
      .join(' · ')}`,
  );
  const pc = count(R.flatMap(r => r.patterns));
  console.log(
    `   most common quirk patterns: ${[...pc]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, n]) => `"${k}" ${n}`)
      .join(' · ')}`,
  );
}
