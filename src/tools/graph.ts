// The social graph as it is: who spends time with whom, through which channel, and why.
// Counts every contact channel (work, home, family, hobby, circle, habit, group, sought, public), not only the optional one.
// For the sought channel it separates initiative (how many encounters a person tries to seek), access (how many people are
// in the pool they draw from, and how many draws survive the age check) and preference (whom they pick from that pool).
//   tsx src/tools/graph.ts [worlds] [years]
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { live, age, facet, type Person } from '../world';
import { standing } from '../regard';

const N = +(process.argv[2] ?? 10),
  YEARS = +(process.argv[3] ?? 5);
const CH = ['work', 'home', 'family', 'hobby', 'circle', 'habit', 'group', 'sought', 'public'];
type R = {
  seed: number;
  id: number;
  age: number;
  partnered: boolean;
  soc: number;
  st: number;
  stress: number;
  recv: Record<string, number>;
  total: number;
  drawn: number;
  kept: number;
  pool: number;
  ticks: number;
};
const rows: R[] = [];
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
const corr = (xs: number[], ys: number[]) => {
  const mx = mean(xs),
    my = mean(ys);
  let a = 0,
    b = 0,
    c = 0;
  for (let i = 0; i < xs.length; i++) {
    a += (xs[i] - mx) * (ys[i] - my);
    b += (xs[i] - mx) ** 2;
    c += (ys[i] - my) ** 2;
  }
  return a / Math.sqrt(b * c || 1);
};
// Correlations within each world, then averaged with a t-interval over worlds: people in one town are not independent.
const T = (n: number) =>
  [0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09][n - 1] ?? 2.05;
const overWorlds = (f: (xs: R[]) => number) => {
  const v = [...new Set(rows.map(r => r.seed))].map(s => f(rows.filter(r => r.seed === s))).filter(x => !isNaN(x));
  const m = mean(v);
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1));
  return `${m >= 0 ? '+' : ''}${m.toFixed(2)} ±${((T(v.length) * sd) / Math.sqrt(v.length)).toFixed(2)}`;
};

for (let seed = 1; seed <= N; seed++) {
  const w = buildWorld(700 + seed, 1);
  pickWitness(w);
  const recv = new Map<number, Record<string, number>>(),
    seek = new Map<number, { drawn: number; kept: number; pool: number; ticks: number }>();
  const add = (p: Person, ch: string, i: number) => {
    const r = recv.get(p.id) ?? {};
    r[ch] = (r[ch] ?? 0) + i;
    recv.set(p.id, r);
  };
  w.hooks.contact = (_w, a, b, i, ch) => {
    add(b, ch, i);
    if (ch !== 'sought') add(a, ch, i);
  }; // sought is directional: only the one chosen receives it
  w.hooks.seek = (_w, p, drawn, kept, pool) => {
    const s = seek.get(p.id) ?? { drawn: 0, kept: 0, pool: 0, ticks: 0 };
    s.drawn += drawn;
    s.kept += kept;
    s.pool += pool;
    s.ticks++;
    seek.set(p.id, s);
  };
  runYears(w, YEARS);
  for (const p of live(w)) {
    const a = age(w, p);
    if (a < 20 || a > 75) continue;
    const r = recv.get(p.id) ?? {};
    const s = seek.get(p.id) ?? { drawn: 0, kept: 0, pool: 0, ticks: 1 };
    rows.push({
      seed,
      id: p.id,
      age: a,
      partnered: p.partner != null,
      soc: facet(p, 'sociability'),
      st: standing(w, p.id),
      stress: p.stress,
      recv: r,
      total: CH.reduce((t, c) => t + (r[c] ?? 0), 0),
      drawn: s.drawn,
      kept: s.kept,
      pool: s.pool / Math.max(1, s.ticks),
      ticks: s.ticks,
    });
  }
}
const groups: [string, (r: R) => boolean][] = [
  ['single, under 40', r => !r.partnered && r.age < 40],
  ['single, 40+', r => !r.partnered && r.age >= 40],
  ['partnered, under 40', r => r.partnered && r.age < 40],
  ['partnered, 40+', r => r.partnered && r.age >= 40],
];
console.log(`${N} worlds × ${YEARS} years · ${rows.length} adults aged 20–75 at the end (contact intensity received, summed over the period)\n`);
const tot = mean(rows.map(r => r.total));
console.log('Where contact comes from (share of all contact received):');
console.log('  ' + CH.map(c => `${c} ${((100 * mean(rows.map(r => r.recv[c] ?? 0))) / tot).toFixed(0)}%`).join(' · '));
console.log('\nBy partnership and age: mean contact received, all channels and the sought channel; then the sought channel decomposed.');
console.log(
  '  group'.padEnd(24) +
    'n'.padStart(5) +
    'all'.padStart(8) +
    'sought'.padStart(8) +
    '   initiative (draws/mo)'.padEnd(26) +
    'access (pool)'.padEnd(15) +
    'draws kept',
);
for (const [name, f] of groups) {
  const xs = rows.filter(f);
  if (!xs.length) continue;
  const dr = mean(xs.map(r => r.drawn / Math.max(1, r.ticks))),
    pool = mean(xs.map(r => r.pool)),
    kept =
      xs.reduce((s, r) => s + r.kept, 0) /
      Math.max(
        1,
        xs.reduce((s, r) => s + r.drawn, 0),
      );
  console.log(
    `  ${name.padEnd(22)}${String(xs.length).padStart(5)}${mean(xs.map(r => r.total))
      .toFixed(0)
      .padStart(8)}${mean(xs.map(r => r.recv.sought ?? 0))
      .toFixed(1)
      .padStart(8)}   ${dr.toFixed(2).padEnd(23)}${pool.toFixed(0).padEnd(15)}${(100 * kept).toFixed(0)}%`,
  );
}
const conc = (k: (r: R) => number) => {
  const xs = rows.map(k).sort((a, b) => a - b);
  const t = xs.reduce((a, b) => a + b, 0) || 1;
  const d = Math.max(1, Math.floor(xs.length / 10));
  return `least-received tenth ${((100 * xs.slice(0, d).reduce((a, b) => a + b, 0)) / t).toFixed(1)}%, most-received tenth ${((100 * xs.slice(-d).reduce((a, b) => a + b, 0)) / t).toFixed(0)}%`;
};
console.log(`\nConcentration: all channels ${conc(r => r.total)} · sought only ${conc(r => r.recv.sought ?? 0)}`);
console.log('\nWhat predicts contact received (correlation within each world, mean ± 95% over worlds):');
const pred: [string, (r: R) => number][] = [
  ['partnered', r => +r.partnered],
  ['age', r => r.age],
  ['sociability', r => r.soc],
  ['standing', r => r.st],
];
for (const [k, g] of pred)
  console.log(
    `  ${k.padEnd(12)} all channels ${overWorlds(xs =>
      corr(
        xs.map(g),
        xs.map(r => r.total),
      ),
    )}   sought ${overWorlds(xs =>
      corr(
        xs.map(g),
        xs.map(r => r.recv.sought ?? 0),
      ),
    )}`,
  );
console.log('\nWho is isolated (bottom tenth of all-channel contact received, within each world):');
const iso: R[] = [];
for (const s of new Set(rows.map(r => r.seed))) {
  const xs = rows.filter(r => r.seed === s).sort((a, b) => a.total - b.total);
  iso.push(...xs.slice(0, Math.max(1, Math.floor(xs.length / 10))));
}
const rest = rows.filter(r => !iso.includes(r));
const desc = (xs: R[]) =>
  `n ${xs.length} · partnered ${(100 * mean(xs.map(r => +r.partnered))).toFixed(0)}% · mean age ${mean(xs.map(r => r.age)).toFixed(0)} · sociability ${mean(xs.map(r => r.soc)).toFixed(2)} · standing ${mean(xs.map(r => r.st)).toFixed(2)} · strain ${mean(xs.map(r => r.stress)).toFixed(2)} · contact ${mean(xs.map(r => r.total)).toFixed(0)}`;
console.log(`  isolated  ${desc(iso)}\n  everyone  ${desc(rest)}`);
