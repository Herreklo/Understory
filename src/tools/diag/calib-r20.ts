// Calibration only (train worlds): the generator's attachment shares at a few cuts, and partners' respect for each other. No outcomes.
import { buildWorld } from '../../build';
import { live, age, bond } from '../../world';
import { loving } from '../../love';
const L: { a: number; v: number }[] = [];
const resp: number[] = [];
for (const seed of [1501, 1502, 1503, 1504, 1505]) {
  const w = buildWorld(seed, 1);
  for (const p of live(w)) {
    if (age(w, p) < 18) continue;
    const x = loving(w, p);
    L.push({ a: x.anxiety, v: x.avoidance });
    if (p.partner != null) resp.push(bond(w, p.id, p.partner).respect);
  }
}
for (const c of [0.5, 0.6, 0.7, 0.8]) {
  const n = L.length;
  const f = (pr: (x: any) => boolean) => ((100 * L.filter(pr).length) / n).toFixed(0);
  console.log(
    `cut ${c}: secure ${f(x => x.a <= c && x.v <= c)}% anxious ${f(x => x.a > c && x.v <= c)}% avoidant ${f(x => x.a <= c && x.v > c)}% fearful ${f(x => x.a > c && x.v > c)}% (n ${n})`,
  );
}
const m = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sd = Math.sqrt(m(L.map(x => x.a ** 2)) - m(L.map(x => x.a)) ** 2);
console.log(
  `anxiety mean ${m(L.map(x => x.a)).toFixed(2)} sd ${sd.toFixed(2)}; corr(anx, avoid) ${(() => {
    const ma = m(L.map(x => x.a)),
      mv = m(L.map(x => x.v));
    let c = 0,
      sa = 0,
      sv = 0;
    for (const x of L) {
      c += (x.a - ma) * (x.v - mv);
      sa += (x.a - ma) ** 2;
      sv += (x.v - mv) ** 2;
    }
    return (c / Math.sqrt(sa * sv)).toFixed(2);
  })()}`,
);
const s = resp.slice().sort((a, b) => a - b);
console.log(
  `partner respect: n ${s.length}, 10th ${s[Math.floor(0.1 * s.length)].toFixed(2)}, 20th ${s[Math.floor(0.2 * s.length)].toFixed(2)}, median ${s[Math.floor(0.5 * s.length)].toFixed(2)}, share < 0 ${((100 * s.filter(x => x < 0).length) / s.length).toFixed(0)}%`,
);
{
  const sdv = (k: 'a' | 'v') => {
    const mm = m(L.map(x => x[k]));
    return [mm, Math.sqrt(m(L.map(x => (x[k] - mm) ** 2)))];
  };
  const [ma, sa] = sdv('a'),
    [mv, sv] = sdv('v');
  const ca = ma + 0.75 * sa,
    cv = mv + 0.75 * sv;
  const f = (pr: (x: any) => boolean) => ((100 * L.filter(pr).length) / L.length).toFixed(0);
  console.log(
    `mean + 0.75 sd: anxiety cut ${ca.toFixed(2)}, avoidance cut ${cv.toFixed(2)} → secure ${f(x => x.a <= ca && x.v <= cv)}% anxious ${f(x => x.a > ca && x.v <= cv)}% avoidant ${f(x => x.a <= ca && x.v > cv)}% fearful ${f(x => x.a > ca && x.v > cv)}%`,
  );
}
