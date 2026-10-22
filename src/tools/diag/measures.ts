// The counters a round is judged on beside its reading (notes/build-plan.md, sections 3 and 4), from fresh worlds or from packs on file.
//   ./run.sh src/tools/diag/measures.ts run A B [rule] [years]   → out-measures/<rule>-<seed>.json, one world each (a stopped run resumes)
//   ./run.sh src/tools/diag/measures.ts report <ruleA> [ruleB]   → the table: each measure's mean per world, and A − B paired by world
//   ./run.sh src/tools/diag/measures.ts pack <pack.txt>...        → the page measures of packs on file
// rule: 'on', or switches to turn off joined by '+', as the lives tools take it. FLIP=<state> also counts that state's flips (flip.ts).
// Per world, the pages are those a reading would pick (pairarm.ts, one arm alone): the three most eventful adults in town and three
// drawn at random, and every adult in town. On them:
//   copy share   extra copies of a line already on the same page, its words normalised, over the page's lines (pages.ts)
//   templates    lines of the fifteen templates readers faulted most, per page
//   kinds        kinds of line per page (the event types on it); lines per page
// And of every adult in town at the end:
//   lasting      carries a lasting change made in the present years: a mark (Person.marks) or an exception (Person.exceptions) whose
//                cause falls in them, counted by its key. A mechanism that changes a person for good writes a mark with its own key.
// Last line: MEASURES {...}
import '../env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { hash } from '../../rng';
import { age, OFF, type Person, type World } from '../../world';
import { copies, packPage, packVersions, pageMeasure, TEMPLATES, type Copies } from './pages';
import { countFlips, type FlipRow, type Flips } from './flip';

const OUT = process.env.MEASURES_OUT ?? 'out-measures';
const PER = 3;

type Pages = Copies & { kinds: number; pageLines: number };
interface WorldOut {
  seed: number;
  rule: string;
  years: number;
  adults: number;
  busiest: Pages;
  random: Pages;
  all: Pages;
  lasting: { adults: number; byKey: Record<string, number> };
  flip?: Flips;
}

function pagesOf(w: World, people: Person[]): Pages {
  const ms = people.map(p => pageMeasure(w, p));
  return {
    ...copies(people.map(p => packPage(w, p))),
    kinds: ms.reduce((s, m) => s + m.kinds, 0),
    pageLines: ms.reduce((s, m) => s + m.lines, 0),
  };
}
function lasting(w: World, adults: Person[]) {
  const byKey: Record<string, number> = {};
  let n = 0;
  for (const p of adults) {
    const keys = new Set([
      ...p.marks.filter(m => m.t >= w.startPresent).map(m => m.key),
      ...p.exceptions.filter(x => (w.events[x.cause]?.t ?? -Infinity) >= w.startPresent).map(x => x.key),
    ]);
    if (keys.size) n++;
    for (const k of keys) byKey[k] = (byKey[k] ?? 0) + 1;
  }
  return { adults: n, byKey };
}
function runWorld(seed: number, rule: string, years: number): WorldOut {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const flip = process.env.FLIP ? countFlips(w, process.env.FLIP) : undefined;
  runYears(w, years);
  const adults = w.people.filter(p => p.status === 'in' && age(w, p) >= 18);
  const weight = (p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const busiest = adults
    .slice()
    .sort((x, y) => weight(y) - weight(x) || x.id - y.id)
    .slice(0, PER);
  const random = adults
    .slice()
    .sort((x, y) => hash('pick', seed, x.id) - hash('pick', seed, y.id) || x.id - y.id)
    .slice(0, PER);
  return {
    seed,
    rule,
    years,
    adults: adults.length,
    busiest: pagesOf(w, busiest),
    random: pagesOf(w, random),
    all: pagesOf(w, adults),
    lasting: lasting(w, adults),
    ...(flip ? { flip } : {}),
  };
}

// Mean and 95% half-width over worlds (Student's t).
const T95 = [
  12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08,
  2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
];
function ci(xs: number[]) {
  const n = xs.length;
  const m = xs.reduce((s, x) => s + x, 0) / Math.max(1, n);
  const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, n - 1));
  return { n, m, h: n > 1 ? ((T95[n - 2] ?? 1.96) * sd) / Math.sqrt(n) : NaN };
}
const share = (c: Copies) => c.copies / Math.max(1, c.lines);
const perPage = (x: number, c: Copies) => x / Math.max(1, c.pages);
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

const mode = process.argv[2];
if (mode === 'run') {
  const A = +process.argv[3],
    B = +(process.argv[4] ?? process.argv[3]),
    rule = process.argv[5] ?? 'on',
    years = +(process.argv[6] ?? 10);
  if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
  mkdirSync(OUT, { recursive: true });
  const done: WorldOut[] = [];
  // A world already written is kept only if it was run the same way (its years, and the state whose flips it counts).
  const same = (x: WorldOut) => x.years === years && (x.flip?.state ?? '') === (process.env.FLIP ?? '');
  for (let seed = A; seed <= B; seed++) {
    const f = `${OUT}/${rule}-${seed}.json`;
    let x: WorldOut | undefined = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : undefined;
    if (!x || !same(x)) {
      writeFileSync(f, JSON.stringify((x = runWorld(seed, rule, years))));
      console.error(`measures ${rule}: world ${seed}`);
    }
    done.push(x);
  }
  console.log(
    'MEASURES ' +
      JSON.stringify({
        rule,
        seeds: [A, B],
        copyShare: +(sum(done.map(x => x.busiest.copies)) / Math.max(1, sum(done.map(x => x.busiest.lines)))).toFixed(4),
      }),
  );
} else if (mode === 'report') {
  const rules = process.argv.slice(3).length ? process.argv.slice(3) : ['on'];
  const load = (rule: string) => {
    const m = new Map<number, WorldOut>();
    if (existsSync(OUT))
      for (const f of readdirSync(OUT).filter(f => f.startsWith(rule + '-') && /^\d+\.json$/.test(f.slice(rule.length + 1)))) {
        const x: WorldOut = JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'));
        m.set(x.seed, x);
      }
    return m;
  };
  const ms = rules.map(load);
  const seeds = [...ms[0].keys()].filter(s => ms.every(m => m.has(s))).sort((a, b) => a - b);
  if (!seeds.length) {
    console.log(`measures: no worlds in ${OUT} for ${rules.join(' and ')}`);
    process.exit(1);
  }
  const fmt = (x: number, d: number) => (Number.isFinite(x) ? x.toFixed(d) : '–');
  console.log(`${seeds.length} worlds (${seeds[0]}–${seeds[seeds.length - 1]}) · ${rules.join(' / ')} · mean per world ±95%`);
  const head = 'measure'.padEnd(46) + rules.map(r => r.padStart(16)).join('') + (rules.length > 1 ? `${rules[0]} − ${rules[1]}`.padStart(22) : '');
  console.log(head);
  const line = (name: string, f: (x: WorldOut) => number, scale = 1, d = 1) => {
    const cols = ms.map(m => ci(seeds.map(s => scale * f(m.get(s)!))));
    let s = name.padEnd(46) + cols.map(c => `${fmt(c.m, d)} ±${fmt(c.h, d)}`.padStart(16)).join('');
    if (ms.length > 1) {
      const dd = ci(seeds.map(x => scale * (f(ms[0].get(x)!) - f(ms[1].get(x)!))));
      s += `${fmt(dd.m, d)} ±${fmt(dd.h, d)}`.padStart(22);
    }
    console.log(s);
  };
  for (const [k, name] of [
    ['busiest', 'the three busiest'],
    ['random', 'three at random'],
    ['all', 'every adult'],
  ] as const) {
    line(`copy share, ${name} (%)`, x => share(x[k]), 100);
    line(`  the fifteen templates' lines per page`, x => perPage(sum(x[k].templates), x[k]), 1, 2);
    line(`  kinds of line per page`, x => perPage(x[k].kinds, x[k]), 1, 2);
    line(`  lines per page`, x => perPage(x[k].pageLines, x[k]), 1, 1);
  }
  line('adults with a lasting change from the present (%)', x => x.lasting.adults / Math.max(1, x.adults), 100);
  const keys = [...new Set(seeds.flatMap(s => ms.flatMap(m => Object.keys(m.get(s)!.lasting.byKey))))].sort();
  for (const k of keys) line(`  ${k} (adults per world)`, x => x.lasting.byKey[k] ?? 0, 1, 2);
  // The templates over all pages, summed over worlds: which of them a change moved.
  console.log(`\nthe fifteen templates, lines over every adult's page, summed over worlds (${rules.join(' / ')})`);
  TEMPLATES.forEach(([t], i) => console.log(ms.map(m => String(sum(seeds.map(s => m.get(s)!.all.templates[i]))).padStart(6)).join('') + '  ' + t));
  // Flips, where counted.
  if (seeds.every(s => ms.every(m => m.get(s)!.flip))) {
    const state = ms[0].get(seeds[0])!.flip!.state;
    console.log(`\nflips of '${state}': decisions weighing it, and of those the share whose likeliest answer changes without it`);
    const add = (a: FlipRow, b: FlipRow) => {
      for (const k of Object.keys(a) as (keyof FlipRow)[]) a[k] += b[k];
    };
    const zero = (): FlipRow => ({ decisions: 0, weighed: 0, flips: 0, turns: 0, shift: 0 });
    const show = (name: string, r: FlipRow[]) =>
      console.log(
        name.padEnd(28) +
          r
            .map(x =>
              `${x.weighed}/${x.decisions} · flips ${fmt((100 * x.flips) / Math.max(1, x.weighed), 1)}% · turns ${fmt((100 * x.turns) / Math.max(1, x.weighed), 1)}% · Δp ${fmt(x.shift / Math.max(1, x.weighed), 3)}`.padStart(
                58,
              ),
            )
            .join(''),
      );
    line(`  flips, share of decisions weighing it (%)`, x => x.flip!.all.flips / Math.max(1, x.flip!.all.weighed), 100);
    line(`  flips, share of every decision (%)`, x => x.flip!.all.flips / Math.max(1, x.flip!.all.decisions), 100, 2);
    const tot = ms.map(m => {
      const all = zero();
      const by: Record<string, FlipRow> = {};
      for (const s of seeds) {
        const f = m.get(s)!.flip!;
        add(all, f.all);
        for (const [k, r] of Object.entries(f.byTrigger)) add((by[k] ??= zero()), r);
      }
      return { all, by };
    });
    show(
      'all decisions',
      tot.map(t => t.all),
    );
    const trig = Object.entries(tot[0].by)
      .filter(([, r]) => r.weighed)
      .sort((a, b) => b[1].weighed - a[1].weighed)
      .slice(0, 10)
      .map(([k]) => k);
    for (const k of trig)
      show(
        '  ' + k,
        tot.map(t => t.by[k] ?? zero()),
      );
  }
} else if (mode === 'pack') {
  for (const f of process.argv.slice(3)) {
    const v = packVersions(readFileSync(f, 'utf8'));
    const c = copies(v.map(x => x.page));
    console.log(
      `${f}: ${c.pages} pages, ${c.lines} lines, ${c.copies} extra copies (${(100 * share(c)).toFixed(1)}%), the fifteen templates ${sum(c.templates)} lines`,
    );
    TEMPLATES.forEach(([t], i) => c.templates[i] && console.log(`${String(c.templates[i]).padStart(6)}  ${t}`));
    console.log('MEASURES ' + JSON.stringify({ pack: f, ...c }));
  }
} else {
  console.error('usage: measures.ts run A B [rule] [years] | report <ruleA> [ruleB] | pack <pack.txt>...');
  process.exit(2);
}
