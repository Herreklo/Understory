// The scoreboard. See BOARD.md for the question, readers and slices.
//   tsx src/tools/board.ts train 101 120           learn base rates on held-out worlds -> out/base.json
//   tsx src/tools/board.ts eval 1 20 [years]       score readers on evaluation worlds   -> out/eval-<a>-<b>.json
//   tsx src/tools/board.ts report                  per-world means, 95% intervals, paired differences, examples
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { learnBase, makePredictor, Tendencies, TEXT_HOLDER, type BaseTable, type Guesses } from './predict';
import { fullName, year } from '../world';

const OUT = process.env.BOARD_OUT ?? 'out';
mkdirSync(OUT, { recursive: true });
const [mode, a0, b0, y0] = process.argv.slice(2);
import { OFF, observe } from '../world';
for (const s of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(s); // ablation: OFF=manner ./board.sh
const A = +(a0 ?? 1),
  B = +(b0 ?? A),
  YEARS = +(y0 ?? 10);

if (mode === 'train') {
  const table: BaseTable = new Map();
  for (let seed = A; seed <= B; seed++) {
    const w = buildWorld(seed, 1);
    pickWitness(w);
    w.hooks.predict = (_w, _p, _o, chosen, rec) => learnBase(table, rec.trigger, chosen);
    runYears(w, YEARS);
  }
  const file = `${OUT}/base-${A}-${B}.json`;
  writeFileSync(file, JSON.stringify({ base: [...table].map(([k, m]) => [k, [...m]]) }));
  console.log(`trained ${file}`);
} else if (mode === 'eval') {
  const table: BaseTable = new Map();
  for (const f of readdirSync(OUT).filter(f => f.startsWith('base-'))) {
    const j = JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'));
    for (const [k, m] of j.base as [string, [string, number][]][]) {
      const t = table.get(k) ?? new Map();
      for (const [o, n] of m) t.set(o, (t.get(o) ?? 0) + n);
      table.set(k, t);
    }
  }
  const worlds: { seed: number; g: (Guesses & { ex?: string })[] }[] = [];
  for (let seed = A; seed <= B; seed++) {
    if (existsSync(`${OUT}/eval-${seed}-${seed}.json`)) continue; // done before: a stopped run resumes where it was
    const w = buildWorld(seed, 1);
    pickWitness(w);
    const g: (Guesses & { ex?: string })[] = [];
    const tend = new Tendencies();
    w.hooks.predict = makePredictor(
      table,
      (_w2, x) => {
        g.push({ ...x });
      },
      tend,
    );
    // The text-only observer learns from the same moments as the witness, but only from evidence a reader of the felt history could see.
    w.hooks.observed = (w2, e, how, _tag, hasText) => {
      if (hasText) observe(w2, TEXT_HOLDER, e, how);
    };
    // Keep a readable line for examples: who decided what, when.
    const inner = w.hooks.predict;
    w.hooks.predict = (w2, p, o, c, rec) => {
      const n = g.length;
      inner(w2, p, o, c, rec);
      if (g.length > n) g[g.length - 1].ex = `${year(w2.t)} · ${fullName(p)} · ${rec.trigger} · options ${o.map((x: any) => x.id).join('/')}`;
    };
    // Month by month, so the tendency learner learns only from decisions the witness has actually learned of, and only after they happened.
    let fed = 0;
    for (let m = 0; m < Math.round(YEARS * 12); m++) {
      runYears(w, 1 / 12);
      for (; fed < w.events.length; fed++) {
        const e = w.events[fed];
        if (e.decision && e.t < w.t && e.decision.person !== w.witness && (e.knownBy.has(w.witness!) || e.who.includes(w.witness!)))
          tend.learn(e.decision.person, e.decision.chosen);
      }
    }
    // Witnessed or hypothetical: did the witness ever learn of the decision itself? (Known by the end of the run; gossip reaches people within two months, so this is close to the moment.)
    const byRec = new Map<any, any>();
    for (const e of w.events) if (e.decision) byRec.set(e.decision, e);
    for (const x of g) {
      const e = byRec.get(x.rec);
      x.seen = !!e && (e.knownBy.has(w.witness!) || e.who.includes(w.witness!));
      delete x.rec;
    }
    worlds.push({ seed, g });
    writeFileSync(`${OUT}/eval-${seed}-${seed}.json`, JSON.stringify([worlds[worlds.length - 1]]));
  }
  console.log(`evaluated ${A}-${B}: ${worlds.reduce((s, x) => s + x.g.length, 0)} decisions`);
} else if (mode === 'report') {
  const worlds: { seed: number; g: (Guesses & { ex?: string })[] }[] = [];
  for (const f of readdirSync(OUT)
    .filter(f => f.startsWith('eval-'))
    .sort())
    worlds.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
  worlds.sort((a, b) => a.seed - b.seed);
  const READERS = [
    ['base', 'Base rate'],
    ['sit', 'Situation reader'],
    ['noteOrBase', 'Notebook'],
    ['wit', 'Witness'],
    ['cal', 'Calibrated'],
    ['text', 'Page-annotation'],
    ['comb', 'Combined'],
    ['swap', 'Swapped'],
    ['tend', 'Tendency'],
    ['oracle', 'Trait oracle'],
    ['mind', 'Mind-reader'],
  ] as const;
  type G = Guesses & { ex?: string };
  // Like for like: situations that existed in round 4, so a round can be compared with the last without the new situations changing the mix.
  const NEW = new Set((process.env.NEW_SITUATIONS ?? 'collection,oldwound,harbourday').split(','));
  const SLICES: [string, (x: G) => boolean][] = [
    ['all', () => true],
    ['eventually witnessed', x => !!x.seen],
    ['never witnessed', x => !x.seen],
    ['known', x => x.known],
    ['strangers', x => !x.known],
    ['novel', x => x.novel],
    ['novel · known', x => x.novel && x.known],
    ['familiar', x => !x.novel],
    ['contested', x => x.contested],
    ['contested · known', x => x.contested && x.known],
    ['novel · contested · known', x => x.novel && x.contested && x.known],
    ['witnessed · contested · known', x => !!x.seen && x.contested && x.known],
    ['round-4 situations · novel · contested · known', x => !NEW.has(x.trigger) && x.novel && x.contested && x.known],
    ['tendency-blind · contested · known', x => x.tendBlind && x.contested && x.known],
  ];
  const T = (n: number) =>
    n >= 30
      ? 1.96
      : ([
          0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09, 2.08, 2.07, 2.07,
          2.06, 2.06, 2.06, 2.05, 2.05, 2.05,
        ][n - 1] ?? 2);
  const ci = (xs: number[]) => {
    const n = xs.length;
    const m = xs.reduce((s, x) => s + x, 0) / n;
    const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, n - 1));
    return { m, h: (T(n - 1 > 0 ? n - 1 : 1) * sd) / Math.sqrt(n), n };
  };
  const fmt = (c: { m: number; h: number }) => `${(100 * c.m).toFixed(1).padStart(5)} ±${(100 * c.h).toFixed(1).padEnd(4)}`;
  const MIN = 8; // a world contributes to a slice only with at least this many decisions in it
  console.log(`\n${worlds.length} worlds · ${worlds.reduce((s, x) => s + x.g.length, 0)} decisions · accuracy per world, mean ± 95% interval\n`);
  console.log('slice'.padEnd(27) + 'share'.padStart(6) + '  ' + READERS.map(([, n]) => n.padStart(12)).join(''));
  const total = worlds.reduce((s, x) => s + x.g.length, 0);
  for (const [name, f] of SLICES) {
    const per = worlds.map(wd => wd.g.filter(f)).filter(l => l.length >= MIN);
    if (per.length < 3) continue;
    const share = per.reduce((s, l) => s + l.length, 0) / total;
    console.log(
      name.padEnd(27) +
        `${(100 * share).toFixed(0)}%`.padStart(6) +
        '  ' +
        READERS.map(([k]) => fmt(ci(per.map(l => l.filter(x => x[k] === x.chosen).length / l.length))).padStart(12)).join(''),
    );
  }
  console.log('\nPaired differences per world (points), mean ± 95% interval. * = interval excludes zero.');
  const PAIRS: [string, string, string][] = [
    ['cal', 'noteOrBase', 'calibrated − notebook'],
    ['text', 'noteOrBase', 'page-annot − notebook'],
    ['cal', 'text', 'calibrated − page-anid'],
    ['comb', 'cal', 'combined − calibrated'],
    ['cal', 'tend', 'calibrated − tendency'],
    ['swap', 'base', 'swapped − base'],
    ['cal', 'base', 'calibrated − base'],
    ['cal', 'wit', 'calibrated − witness'],
    ['mind', 'base', 'mind − base (room)'],
  ];
  console.log('slice'.padEnd(27) + PAIRS.map(([, , n]) => n.slice(0, 20).padStart(22)).join(''));
  for (const [name, f] of SLICES) {
    const per = worlds.map(wd => wd.g.filter(f)).filter(l => l.length >= MIN);
    if (per.length < 3) continue;
    console.log(
      name.padEnd(27) +
        PAIRS.map(([a, b]) => {
          const c = ci(
            per.map(l => (l.filter(x => (x as any)[a] === x.chosen).length - l.filter(x => (x as any)[b] === x.chosen).length) / l.length),
          );
          const sig = c.m - c.h > 0 || c.m + c.h < 0;
          return `${(100 * c.m).toFixed(1).padStart(6)} ±${(100 * c.h).toFixed(1).padEnd(4)}${sig ? '*' : ' '}`.padStart(22);
        }).join(''),
    );
  }
  // Proper scoring rules, per world: multiclass Brier (lower is better) and log loss.
  const PR = [
    ['base', 'Base rate'],
    ['tend', 'Tendency'],
    ['cal', 'Calibrated'],
    ['text', 'Page-annotation'],
    ['comb', 'Combined'],
    ['mind', 'Mind-reader'],
  ] as const;
  // Calibration: does the reader know when it knows? Decisions binned by the probability the reader gave its own top guess; a calibrated reader is right
  // about as often as it said it would be. Overconfidence shows as accuracy below the bin; underconfidence as accuracy above it.
  const all = worlds.flatMap(x => x.g);
  const topConf = (x: G, k: 'base' | 'cal' | 'text') => x.top?.[k] ?? NaN;
  console.log('\nCalibration: accuracy of the top guess by the confidence the reader gave it (all decisions, pooled). Ideal: accuracy ≈ confidence.');
  const BINS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.01];
  for (const [k, name] of [
    ['cal', 'Calibrated witness'],
    ['text', 'Page-annotation reader'],
    ['base', 'Base rate'],
  ] as const) {
    const cells = BINS.slice(0, -1).map((lo, i) => {
      const hi = BINS[i + 1];
      const xs = all.filter(x => {
        const c = topConf(x, k);
        return c >= lo && c < hi;
      });
      const acc = xs.length ? xs.filter(x => (x as any)[k] === x.chosen).length / xs.length : NaN;
      const mc = xs.length ? xs.reduce((s, x) => s + topConf(x, k), 0) / xs.length : NaN;
      return `${(100 * lo).toFixed(0)}–${(100 * Math.min(1, hi)).toFixed(0)}%: ${isNaN(acc) ? '  —  ' : (100 * acc).toFixed(0).padStart(3) + '%'} (n ${String(xs.length).padStart(5)}, said ${isNaN(mc) ? '—' : (100 * mc).toFixed(0) + '%'})`;
    });
    console.log(`  ${name.padEnd(22)} ${cells.join(' · ')}`);
  }
  console.log(
    '\nScoring rules, mean per world: Brier (sum of squared errors over options; 0 perfect, 0.5 = coin flip on two) · log loss (−ln p of the chosen option)',
  );
  console.log('slice'.padEnd(27) + PR.map(([, n]) => (n + ' B / LL').padStart(20)).join(''));
  for (const [name, f] of SLICES) {
    const per = worlds.map(wd => wd.g.filter(f)).filter(l => l.length >= MIN);
    if (per.length < 3) continue;
    console.log(
      name.padEnd(27) +
        PR.map(([k]) => {
          const b = ci(per.map(l => l.reduce((s, x) => s + x.b[k], 0) / l.length));
          const ll = ci(per.map(l => l.reduce((s, x) => s - Math.log(Math.max(1e-4, x.p[k])), 0) / l.length));
          return `${b.m.toFixed(3)} / ${ll.m.toFixed(3)}`.padStart(20);
        }).join(''),
    );
  }
  // Where the witness wins and loses, by kind of situation (novel decisions about known people).
  const byTrig = new Map<string, { n: number; r: number; base: number; sit: number; mind: number }>();
  const RK = (process.env.READER ?? 'cal') as keyof G;
  for (const wd of worlds)
    for (const x of wd.g)
      if (x.novel && x.known) {
        const r = byTrig.get(x.trigger) ?? { n: 0, r: 0, base: 0, sit: 0, mind: 0 };
        r.n++;
        if (x[RK] === x.chosen) r.r++;
        if (x.base === x.chosen) r.base++;
        if (x.sit === x.chosen) r.sit++;
        if (x.mind === x.chosen) r.mind++;
        byTrig.set(x.trigger, r);
      }
  console.log('\nNovel decisions about known people, by kind of situation (pooled):');
  console.log('situation'.padEnd(24) + 'n'.padStart(6) + 'base'.padStart(7) + 'sit'.padStart(7) + String(RK).padStart(7) + 'mind'.padStart(7));
  for (const [k, r] of [...byTrig].sort((a, b) => b[1].n - a[1].n).slice(0, 18))
    console.log(
      k.slice(0, 23).padEnd(24) +
        String(r.n).padStart(6) +
        [r.base, r.sit, r.r, r.mind].map(v => `${((100 * v) / r.n).toFixed(0)}%`.padStart(7)).join(''),
    );
  // Concrete examples next to the numbers.
  const pool = worlds.flatMap(wd => wd.g.filter(x => x.novel && x.known && x.contested && x.ex));
  const right = pool.filter(x => x[RK] === x.chosen && x.base !== x.chosen && x.sit !== x.chosen);
  const wrong = pool.filter(x => x[RK] !== x.chosen && x.mind === x.chosen);
  const pick = <T>(l: T[], n: number) => l.filter((_, i) => i % Math.max(1, Math.floor(l.length / n)) === 0).slice(0, n);
  console.log(
    `\nExamples, novel and contested, known person. Character read right where circumstance said otherwise (${right.length} of ${pool.length}):`,
  );
  for (const x of pick(right, 3)) console.log(`  ${x.ex} → chose ${x.chosen}; base said ${x.base}, situation said ${x.sit}`);
  console.log(`Missed, though the truth would have called it (${wrong.length}):`);
  for (const x of pick(wrong, 3)) console.log(`  ${x.ex} → chose ${x.chosen}; reader said ${x[RK]}`);
}
