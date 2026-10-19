// Round T2: three patterns that psychology has replicated many times, checked against pass bands set in BOARD before any number was
// computed. A pass is a plausibility check, never a realism claim; a fail names a target.
//   1. One act against many: the facet that weighs most for an answer, against choosing it in single decisions and as a rate over many.
//   2. Friendship: how far the most-befriended outrun the median, and how much a friend in common raises the chance of becoming friends.
//   3. What is easy to judge: how well the witness's beliefs track each HEXACO dimension, among less and more familiar people.
//   tsx src/tools/patterns.ts A B [present years]
import { buildWorld, runYears } from '../build';
import { pickWitness, knows } from '../witness';
import { age, belief, facet, live, peekBond, OFF, ON, type World } from '../world';
import { FAMILY_FACETS } from '../grammar';
import { FACETS } from '../core';

// Arms, as in board.ts: OFF=<switches> turns kept mechanisms off, ON=<switches> turns unkept ones on.
for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
for (const x of (process.env.ON ?? '').split(',').filter(Boolean)) ON.add(x);
const [a0, b0, y0] = process.argv.slice(2);
const A = +(a0 ?? 3101),
  B = +(b0 ?? A),
  YEARS = +(y0 ?? 10);
const isAdult = (w: World, id: number) => {
  const p = w.byId.get(id);
  return !!p && p.status === 'in' && age(w, p) >= 18;
};
function pearson(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 3) return NaN;
  const mx = xs.reduce((s, x) => s + x, 0) / n,
    my = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0,
    sxx = 0,
    syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN;
}
const median = (xs: number[]) => {
  const s = xs.filter(x => !Number.isNaN(x)).sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
};
const quantile = (xs: number[], q: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

// The facet that weighs most for each kind of answer, with its sign, from the engine's own wiring.
const MAIN = Object.entries(FAMILY_FACETS).map(([fam, ws]) => {
  const [k, v] = Object.entries(ws).sort((x, y) => Math.abs(y[1]!) - Math.abs(x[1]!))[0];
  return { fam, k, s: Math.sign(v!) };
});
const single = new Map(MAIN.map(m => [m.fam, { x: [] as number[], y: [] as number[] }]));
const perPerson = new Map(MAIN.map(m => [m.fam, new Map<string, { z: number; n: number; chose: number }>()]));
const friendCounts: number[] = [];
let mutualPairMonths = 0,
  mutualFormed = 0,
  nonePairMonths = 0,
  noneFormed = 0;
type Read = { dim: string; m: number; truth: number; fam: number };
const reads: Read[] = [];

for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  let fed = w.events.length;
  for (let month = 0; month < Math.round(YEARS * 12); month++) {
    // Who is friends with whom before the month, among adults in town.
    const adults = live(w)
      .filter(p => isAdult(w, p.id))
      .map(p => p.id);
    const before = new Map(adults.map(id => [id, new Set([...w.byId.get(id)!.friends].filter(f => adults.includes(f)))]));
    runYears(w, 1 / 12);
    // 1. Every decision of the month, with the chooser's facet at that moment.
    for (; fed < w.events.length; fed++) {
      const d = w.events[fed].decision as any;
      if (!d || !isAdult(w, d.person)) continue;
      const p = w.byId.get(d.person)!;
      for (const m of MAIN) {
        if (!d.options?.some((o: any) => o.id === m.fam)) continue;
        const z = m.s * facet(p, m.k);
        const c = d.chosen === m.fam ? 1 : 0;
        single.get(m.fam)!.x.push(z);
        single.get(m.fam)!.y.push(c);
        const key = `${seed}:${p.id}`;
        const r = perPerson.get(m.fam)!.get(key) ?? { z: 0, n: 0, chose: 0 };
        r.z = z;
        r.n++;
        r.chose += c;
        perPerson.get(m.fam)!.set(key, r);
      }
    }
    // 2b. Pairs who were not friends: did they become friends this month, by whether they had a friend in common?
    for (let i = 0; i < adults.length; i++)
      for (let j = i + 1; j < adults.length; j++) {
        const [x, y] = [adults[i], adults[j]];
        if (before.get(x)!.has(y)) continue;
        const now = w.byId.get(x)!;
        if (now.status !== 'in' || w.byId.get(y)!.status !== 'in') continue;
        let mutual = false;
        for (const f of before.get(x)!)
          if (before.get(y)!.has(f)) {
            mutual = true;
            break;
          }
        const formed = now.friends.has(y) ? 1 : 0;
        if (mutual) {
          mutualPairMonths++;
          mutualFormed += formed;
        } else {
          nonePairMonths++;
          noneFormed += formed;
        }
      }
  }
  // 2a. Close friends in town per adult, at the end.
  const adults = live(w).filter(p => isAdult(w, p.id));
  for (const p of adults) friendCounts.push([...p.friends].filter(f => isAdult(w, f)).length);
  // 3. The witness's belief about each facet of each person it knows (no belief is the prior, 0), against the truth.
  for (const p of adults) {
    if (p.id === w.witness || !knows(w, p.id)) continue;
    const fam = peekBond(w, w.witness!, p.id)?.fam ?? 0;
    for (const f of FACETS) {
      if (f.dim === 'I') continue;
      reads.push({ dim: f.dim + ':' + f.id, m: belief(w, w.witness!, p.id, f.id)?.m ?? 0, truth: facet(p, f.id), fam });
    }
  }
  console.error(`patterns: world ${seed}`);
}

const f2 = (x: number) => (Number.isNaN(x) ? '–' : x.toFixed(2));
const out: string[] = [];
const say = (s: string) => out.push(s);
say(`Round T2: three human patterns · worlds ${A}–${B} · ${YEARS} present years · adults`);
say('');
say('1. One act against many (pass: single acts .10 to .30, aggregates .40 to .70; medians over kinds of answer)');
const rows = MAIN.map(m => {
  const sx = single.get(m.fam)!;
  const people = [...perPerson.get(m.fam)!.values()].filter(r => r.n >= 10);
  return {
    ...m,
    n: sx.x.length,
    r1: pearson(sx.x, sx.y),
    people: people.length,
    rA:
      people.length >= 20
        ? pearson(
            people.map(r => r.z),
            people.map(r => r.chose / r.n),
          )
        : NaN,
  };
});
for (const r of rows)
  say(
    `   ${r.fam.padEnd(12)} ${(r.s > 0 ? '+' : '−') + r.k.padEnd(16)} single ${f2(r.r1).padStart(5)} (${String(r.n).padStart(6)} decisions) · aggregate ${f2(r.rA).padStart(5)} (${r.people} people)`,
  );
const m1 = median(rows.map(r => r.r1)),
  mA = median(rows.map(r => r.rA));
say(`   median: single ${f2(m1)} ${m1 >= 0.1 && m1 <= 0.3 ? 'PASS' : 'FAIL'} · aggregate ${f2(mA)} ${mA >= 0.4 && mA <= 0.7 ? 'PASS' : 'FAIL'}`);
say('');
const md = median(friendCounts),
  top = quantile(friendCounts, 0.9),
  most = Math.max(...friendCounts);
say('2. Friendship');
say(
  `   (a) close friends in town per adult: median ${md}, top tenth ${top}, most ${most} · top tenth ÷ median ${f2(top / md)} (pass ≤ 2.5) ${top / md <= 2.5 ? 'PASS' : 'FAIL'} · most ÷ median ${f2(most / md)} (pass ≤ 4) ${most / md <= 4 ? 'PASS' : 'FAIL'}`,
);
const rm = mutualFormed / Math.max(1, mutualPairMonths),
  rn = noneFormed / Math.max(1, nonePairMonths);
say(
  `   (b) becoming friends in a month: with a friend in common ${(1000 * rm).toFixed(2)} per thousand pairs (${mutualFormed} of ${mutualPairMonths}), with none ${(1000 * rn).toFixed(2)} (${noneFormed} of ${nonePairMonths}) · ratio ${f2(rm / rn)} (pass ≥ 3) ${rm / rn >= 3 ? 'PASS' : 'FAIL'}`,
);
say('');
say('3. What is easy to judge (correlation of belief with truth across known people, averaged over each dimension’s facets)');
const famMed = median(reads.map(r => r.fam));
const DIMS = ['H', 'E', 'X', 'A', 'C', 'O'];
const acc = (rs: Read[]) =>
  Object.fromEntries(
    DIMS.map(d => {
      const ids = [...new Set(rs.filter(r => r.dim.startsWith(d + ':')).map(r => r.dim))];
      const per = ids.map(id => {
        const x = rs.filter(r => r.dim === id);
        return pearson(
          x.map(r => r.m),
          x.map(r => r.truth),
        );
      });
      return [d, per.reduce((s, v) => s + v, 0) / per.length];
    }),
  ) as Record<string, number>;
const all = acc(reads),
  lo = acc(reads.filter(r => r.fam < famMed)),
  hi = acc(reads.filter(r => r.fam >= famMed));
say(`   known people ${reads.length / FACETS.filter(f => f.dim !== 'I').length} (pooled), familiarity median ${f2(famMed)}`);
for (const d of DIMS) say(`   ${d}  all ${f2(all[d])} · less familiar ${f2(lo[d])} · more familiar ${f2(hi[d])} · gain ${f2(hi[d] - lo[d])}`);
const rank = [...DIMS].sort((x, y) => all[y] - all[x]);
const c1 = rank.indexOf('X') <= 1,
  c2 = rank.indexOf('C') <= 2,
  c3 = lo.E < lo.X,
  c4 = hi.E - lo.E > hi.X - lo.X;
say(`   order: ${rank.join(' > ')}`);
say(
  `   extraversion first or second ${c1 ? 'PASS' : 'FAIL'} · conscientiousness in the top three ${c2 ? 'PASS' : 'FAIL'} · emotionality below extraversion among the less familiar ${c3 ? 'PASS' : 'FAIL'} · emotionality gains more from familiarity than extraversion ${c4 ? 'PASS' : 'FAIL'}`,
);
console.log(out.join('\n'));
