// Round 7d: the social loop, measured. Conduct → what the town thinks → what comes to a person → what they then do.
// Each world runs its past and five present years once under the full rule and is frozen there (standing at year five is the town's
// verdict on five years of conduct). Years six to ten then run twice, with regard deciding (full) and with neutral choice (none), and the
// same people are compared with themselves, by their standing at year five.
//   Link 1: standing → what comes to them (how often others seek their company; chosen-events such as being hired, asked, confided in).
//   Link 2: what comes to them → what they do and become (strain at year ten; withdrawal and anger acts; warm and generous acts; standing at year ten).
//   tsx src/tools/loop.ts [worlds]
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { OFF, live, age, type World, type Person } from '../world';
import { standing } from '../regard';
import { EXPR } from '../families';

const N = +(process.argv[2] ?? 10);
const OPP = new Set([
  'hired',
  'promoted',
  'give',
  'grudging',
  'group:joined',
  'confide',
  'speakup',
  'visit',
  'show',
  'chipin',
  'quietgive',
  'welcome',
]);
const COLD = new Set(['withdrawal', 'anger']),
  WARM = new Set(['warmth', 'generosity', 'seeking', 'honesty', 'courage']);
type M = { sought: number; opp: number; stress: number; cold: number; warm: number; st10: number; threads: number };
const MODES: Record<string, string[]> = { full: [], none: ['regard'] };
const MODE_NAMES = Object.keys(MODES) as ('full' | 'none')[];
type Row = { seed: number; id: number; st5: number; full?: M; none?: M };
const rows: Row[] = [];
const ages = new Map<string, number>();
for (let seed = 1; seed <= N; seed++) {
  for (const mode of MODE_NAMES) {
    OFF.clear();
    const w = buildWorld(seed, 1);
    pickWitness(w);
    runYears(w, 5);
    const adults = live(w).filter(p => age(w, p) >= 20 && age(w, p) <= 70);
    const st5 = new Map(adults.map(p => [p.id, standing(w, p.id)] as const));
    for (const p of adults) ages.set(`${seed}|${p.id}`, age(w, p));
    (w.stats as any).sought = new Map<number, number>();
    const t5 = w.t;
    for (const o of MODES[mode]) OFF.add(o);
    runYears(w, 5);
    OFF.clear();
    const sought = (w.stats as any).sought as Map<number, number>;
    for (const [id, s] of st5) {
      const p = w.byId.get(id)!;
      if (p.status !== 'in') continue;
      let row = rows.find(r => r.seed === seed && r.id === id);
      if (!row) {
        row = { seed, id, st5: s };
        rows.push(row);
      }
      let opp = 0,
        cold = 0,
        warm = 0;
      for (const e of w.events) {
        if (e.t < t5) continue;
        if (
          OPP.has(e.type) &&
          ((['hired', 'promoted', 'group:joined'].includes(e.type) && e.who[0] === id) ||
            (!['hired', 'promoted', 'group:joined'].includes(e.type) && e.who[1] === id))
        )
          opp++;
        if (e.who[0] === id && e.decision) {
          const fam = EXPR[e.type]?.family;
          if (fam && COLD.has(fam)) cold++;
          if (fam && WARM.has(fam)) warm++;
        }
      }
      row[mode] = {
        sought: sought.get(id) ?? 0,
        opp,
        stress: p.stress,
        cold,
        warm,
        st10: standing(w, p.id),
        threads: p.threads.filter(th => th.since >= t5 && th.family === 'withdrawal').length,
      };
    }
  }
}
const both = rows.filter(r => r.full && r.none);
// Standing travels with age (the old are calm, admired and rarely sought; the young are active and criticised), so people are ranked by
// standing relative to their own age band, else the quarters compare the retired with the young.
for (const r of both) (r as any).age = ages.get(`${r.seed}|${r.id}`) ?? 40;
const bandMean = new Map<number, number>();
const bandN = new Map<number, number>();
for (const r of both) {
  const b = Math.floor((r as any).age / 10);
  bandMean.set(b, (bandMean.get(b) ?? 0) + r.st5);
  bandN.set(b, (bandN.get(b) ?? 0) + 1);
}
for (const r of both) {
  const b = Math.floor((r as any).age / 10);
  r.st5 -= bandMean.get(b)! / bandN.get(b)!;
}
both.sort((a, b) => a.st5 - b.st5);
const q = Math.floor(both.length / 4);
const bottom = both.slice(0, q),
  top = both.slice(-q);
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
const ci = (xs: number[]) => {
  const m = mean(xs);
  const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, xs.length - 1));
  return (1.96 * sd) / Math.sqrt(Math.max(1, xs.length));
};
const corr = (xs: number[], ys: number[]) => {
  const mx = mean(xs),
    my = mean(ys);
  let sxy = 0,
    sxx = 0,
    syy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy || 1);
};
// Paired effect, with the interval over worlds: people in one town share its events and are not independent observations.
// Each world contributes the mean full − none over its people in the slice; the interval is a t-interval over those world means.
const T = (n: number) =>
  n >= 30
    ? 1.96
    : ([
        0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09, 2.08, 2.07, 2.07,
        2.06, 2.06, 2.06, 2.05, 2.05, 2.05,
      ][n - 1] ?? 1.96);
const d = (xs: Row[], k: keyof M, vs: 'none' = CMP) => {
  const byWorld = new Map<number, number[]>();
  for (const r of xs) {
    const l = byWorld.get(r.seed) ?? [];
    l.push(r.full![k] - r[vs]![k]);
    byWorld.set(r.seed, l);
  }
  const wm = [...byWorld.values()].map(mean);
  const m = mean(wm);
  const sd = Math.sqrt(wm.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, wm.length - 1));
  return `${m >= 0 ? '+' : ''}${m.toFixed(2)} ±${((T(wm.length) * sd) / Math.sqrt(Math.max(1, wm.length))).toFixed(2)} (${wm.length} worlds)`;
};
const lv = (xs: Row[], k: keyof M, m: 'full' | 'none') => mean(xs.map(r => r[m]![k])).toFixed(2);
const CMP = 'none' as const;
console.log(
  `${N} worlds · ${both.length} adults aged 20–70, standing at year 5 (relative to their age band) under the full rule, then years 6–10 under the full model and with neutral choice (regard off)\n`,
);
console.log(
  'Link 1: standing → what comes to them (years 6–10). Levels full / compared, then the same person full − none (± 95% over worlds, since people in one town are not independent).',
);
for (const [k, label] of [
  ['sought', 'times sought out as company'],
  ['opp', 'chosen-events (hired, asked, confided in, visited…)'],
] as const) {
  console.log(`  ${label}`);
  console.log(`    bottom quarter  ${lv(bottom, k, 'full')} / ${lv(bottom, k, CMP)}   Δ ${d(bottom, k)}`);
  console.log(`    top quarter     ${lv(top, k, 'full')} / ${lv(top, k, CMP)}   Δ ${d(top, k)}`);
  console.log(
    `    corr(standing at 5, ${k} in 6–10)  full ${corr(
      both.map(r => r.st5),
      both.map(r => r.full![k]),
    ).toFixed(2)}  ${CMP} ${corr(
      both.map(r => r.st5),
      both.map(r => r[CMP]![k]),
    ).toFixed(2)}`,
  );
}
console.log('\nLink 2: what comes to them → what they do and become (years 6–10).');
for (const [k, label] of [
  ['stress', 'strain at year 10 (0–1)'],
  ['threads', 'withdrawal threads begun'],
  ['cold', 'withdrawal and anger acts'],
  ['warm', 'warm, generous, open acts'],
] as const) {
  console.log(`  ${label}`);
  console.log(`    bottom quarter  ${lv(bottom, k, 'full')} / ${lv(bottom, k, CMP)}   Δ ${d(bottom, k)}`);
  console.log(`    top quarter     ${lv(top, k, 'full')} / ${lv(top, k, CMP)}   Δ ${d(top, k)}`);
}
console.log(
  `\nReputation persists: corr(standing at 5, standing at 10)  full ${corr(
    both.map(r => r.st5),
    both.map(r => r.full!.st10),
  ).toFixed(2)}  ${CMP} ${corr(
    both.map(r => r.st5),
    both.map(r => r[CMP]!.st10),
  ).toFixed(2)}`,
);
console.log(
  `Nobody locked in: of the bottom quarter at year 5, share above the median at year 10  full ${((100 * bottom.filter(r => r.full!.st10 > median(both.map(x => x.full!.st10))).length) / Math.max(1, bottom.length)).toFixed(0)}%  ${CMP} ${((100 * bottom.filter(r => r[CMP]!.st10 > median(both.map(x => x[CMP]!.st10))).length) / Math.max(1, bottom.length)).toFixed(0)}%`,
);
// How concentrated company is: a town where a few are everyone's company and some are nobody's would show a large spread. Pooled over worlds.
{
  const sought = both.map(r => r.full!.sought).sort((a, b) => a - b);
  const tenth = Math.max(1, Math.floor(sought.length / 10));
  const tot = sought.reduce((a, b) => a + b, 0) || 1;
  const low = sought.slice(0, tenth).reduce((a, b) => a + b, 0) / tot,
    high = sought.slice(-tenth).reduce((a, b) => a + b, 0) / tot;
  const soc = both.map(r => ages.get(`${r.seed}|${r.id}`) ?? 0);
  void soc;
  console.log(
    `Company concentration (full): the least-sought tenth receive ${(100 * low).toFixed(0)}% of all company, the most-sought tenth ${(100 * high).toFixed(0)}% (equal shares would be 10% each); median ${median(sought)} times in five years, range ${sought[0]}–${sought[sought.length - 1]}.`,
  );
}
function median(xs: number[]) {
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
}
