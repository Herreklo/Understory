// Round 44's sizing: feelings, part one, on (ON=feelings, which the tool sets) against off (OFF=feelings), paired by world, with the five fail-ifs of
// notes/research/feelings-and-traits.md as checks.
//   ./run.sh src/tools/diag/feel.ts run A B [rule] [years]   → out-feel/<rule>-<seed>.json, one world each (a stopped run resumes)
//   ./run.sh src/tools/diag/feel.ts report [on] [off]          → the checks; rules as measures.ts takes them ('on', or switches joined by '+')
// Per world, over its present years:
//   1. carrying    adult-months carrying each kind at a weight it is weighed at (≥ 0.12), and the most in any month; grief-months
//                  against the adult-months carrying a grief emotion (the old decoration, which both arms write)
//   2. flips       of every decision weighing a feeling or a debt, the share whose likeliest answer changes without it (flip.ts), by kind
//   3. repeats     the copy share of the pages a reading picks and of every adult's, and the share of lines in the 25 commonest templates
//   4. feuds       per thousand adult-years: hostile acts (the wrongs), answers in kind to a provocation, couples' rows, dislikes,
//                  friendships ended
//   5. named       every line a feeling decided names its kind and its object, in the record and on the page
// And beside them: kinds of line per page, adults with a lasting change, pages touched, debts called in and paid, own answers taken.
// The repeat measures are also given without the random promise's lines, for a design that retires it.
// Last line: FEEL {...}
import '../env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { hash } from '../../rng';
import { shownCauses } from '../../page';
import { BY_FAMILY } from '../../families';
import { feelingsOf, type Kind } from '../../feelings';
import { age, ON, OFF, type Event, type Person, type World } from '../../world';
import { copies, lineTexts, norm, packPage, pageMeasure } from './pages';
import { countFlips, type FlipRow } from './flip';

const OUT = process.env.FEEL_OUT ?? 'out-feel';
const PER = 3;
const KINDS: Kind[] = ['grief', 'resentment', 'guilt', 'gratitude'];
const WEIGH = 0.12;
const WORDS: Record<Kind, RegExp> = { grief: /still grieving/, resentment: /still sore at/, guilt: /guilty about/, gratitude: /grateful to/ };
// The acts that are wrongs (feelings.ts): hurt done hard enough.
const WRONGS = new Set(
  Object.values(BY_FAMILY)
    .flat()
    .filter(x => x.like <= -0.25 && x.intensity >= 0.45)
    .map(x => x.id),
);

interface Pages {
  pages: number;
  lines: number;
  copies: number;
  kinds: number;
  touched: number; // pages with a line a feeling decided
  feelLines: number;
}
interface WorldOut {
  seed: number;
  rule: string;
  years: number;
  adults: number;
  adultMonths: number;
  carrying: Record<string, number>; // adult-months carrying each kind
  peak: Record<string, number>; // the most adults carrying it in one month, as a share
  griefEmotionMonths: number;
  flips: Record<string, FlipRow>;
  feuds: { wrongs: number; inKind: number; rows: number; dislikes: number; ended: number; adultYears: number };
  named: { lines: number; named: number; shown: number; byKind: Record<string, number> };
  busiest: Pages & { top25: number; linesX: number; copiesX: number; top25X: number };
  random: Pages & { top25: number; linesX: number; copiesX: number; top25X: number };
  all: Pages & { top25: number; linesX: number; copiesX: number; top25X: number };
  lasting: { adults: number; byKey: Record<string, number> };
  debts: { calledIn: number; asked: number; answered: number; paid: number; own: Record<string, [number, number]> };
}

// The key of the reason a decision gave first, if any (the situation's own cause carries none).
const topKey = (e: Event) => e.causes.find(c => c.key && !c.key.startsWith('against:'))?.key;
const feltKey = (k?: string) => !!k && k.startsWith('feel:');
function named(w: World, e: Event): { ok: boolean; shown: boolean; kind: string } {
  const k = topKey(e)!;
  const c = e.causes.find(x => x.key === k)!;
  const kind = k.slice(5);
  const re = kind === 'owes' ? /owed @\d+/ : kind === 'owed' ? /@\d+ owed/ : WORDS[kind as Kind];
  return { ok: re.test(c.label) && /@\d+/.test(c.label), shown: shownCauses(e).includes(c), kind };
}

const PROMISE = /had promised/;
function top25(pages: string[][]): number {
  const freq = new Map<string, number>();
  for (const pg of pages) for (const t of lineTexts(pg)) freq.set(norm(t), (freq.get(norm(t)) ?? 0) + 1);
  return [...freq.values()]
    .sort((a, b) => b - a)
    .slice(0, 25)
    .reduce((s, x) => s + x, 0);
}
function pagesOf(w: World, people: Person[]): Pages & { top25: number; linesX: number; copiesX: number; top25X: number } {
  const pages = people.map(p => packPage(w, p));
  const c = copies(pages);
  let kinds = 0,
    touched = 0,
    feelLines = 0;
  for (const p of people) kinds += pageMeasure(w, p).kinds;
  for (const p of people) {
    const n = p.events.filter(i => w.events[i].t >= w.startPresent && feltKey(topKey(w.events[i]))).length;
    feelLines += n;
    if (n) touched++;
  }
  // The same, without the random promise's lines, which the switch retires: what is left is the feelings' own effect on repeats.
  const kept = pages.map(pg => pg.filter(l => !PROMISE.test(l)));
  const cx = copies(kept);
  return {
    pages: c.pages,
    lines: c.lines,
    copies: c.copies,
    kinds,
    touched,
    feelLines,
    top25: top25(pages),
    linesX: cx.lines,
    copiesX: cx.copies,
    top25X: top25(kept),
  };
}

function runWorld(seed: number, rule: string, years: number): WorldOut {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const flips: Record<string, ReturnType<typeof countFlips>> = { all: countFlips(w, 'feel:*') };
  for (const k of KINDS) flips[k] = countFlips(w, 'feel:' + k);
  flips.owes = countFlips(w, '/^feel:owe[sd]$/');
  flips.kinds = countFlips(w, '/^feel:(grief|resentment|guilt|gratitude)$/'); // the four kinds' own reasons, without the debt's
  const debts: WorldOut['debts'] = { calledIn: 0, asked: 0, answered: 0, paid: 0, own: { severity: [0, 0], humility: [0, 0] } };
  const prev = w.hooks.predict;
  w.hooks.predict = (w2: World, p: Person, options: any[], chosen: string, rec: any) => {
    prev?.(w2, p, options, chosen, rec);
    const has = (id: string) => options.some(o => o.considerations.some((c: any) => c.id === id));
    // A debt called in: a decision of the one owed, with the one who owes them, weighing it; asked when they sought them out.
    if (has('feel:owed')) {
      debts.calledIn++;
      if (chosen === 'seeking') debts.asked++;
    }
    if (rec.trigger === 'request-answer' && (has('feel:gratitude') || has('feel:guilt') || has('feel:owes'))) {
      debts.answered++;
      if (chosen === 'generosity') debts.paid++;
    }
    // The feeling's own answer, where it was offered: severity beside resentment, humility beside guilt (feelings.ts offerFeelings).
    for (const [fam, k, types] of [
      ['severity', 'feel:resentment', ['request-answer', 'collection', 'backing', 'authorship']],
      ['humility', 'feel:guilt', ['strain', 'oldwound', 'reckon', 'reckon-answer', 'turneddown', 'threat']],
    ] as const)
      if ((types as readonly string[]).includes(rec.trigger) && has(k) && options.some(o => o.id === fam)) {
        debts.own[fam][0]++;
        if (chosen === fam) debts.own[fam][1]++;
      }
  };
  const carrying: Record<string, number> = Object.fromEntries(KINDS.map(k => [k, 0]));
  const peak: Record<string, number> = Object.fromEntries(KINDS.map(k => [k, 0]));
  let adultMonths = 0,
    griefEmotionMonths = 0;
  for (let m = 0; m < years * 12; m++) {
    tick(w);
    const adults = w.people.filter(p => p.status === 'in' && age(w, p) >= 18);
    adultMonths += adults.length;
    const n: Record<string, number> = Object.fromEntries(KINDS.map(k => [k, 0]));
    for (const p of adults) {
      for (const k of KINDS) if (feelingsOf(w, p.id).some(f => f.k === k && f.v >= WEIGH)) n[k]++;
      if (p.emotions.some(e => e.k.startsWith('grief') && e.until > w.t)) griefEmotionMonths++;
    }
    for (const k of KINDS) {
      carrying[k] += n[k];
      peak[k] = Math.max(peak[k], n[k] / Math.max(1, adults.length));
    }
  }
  const adults = w.people.filter(p => p.status === 'in' && age(w, p) >= 18);
  const present = w.events.filter(e => e.t >= w.startPresent);
  const feuds = { wrongs: 0, inKind: 0, rows: 0, dislikes: 0, ended: 0, adultYears: adultMonths / 12 };
  const nm: WorldOut['named'] = { lines: 0, named: 0, shown: 0, byKind: {} };
  for (const e of present) {
    const trig = e.decision?.trigger as string | undefined;
    if (WRONGS.has(e.type) && trig && !trig.startsWith('row')) feuds.wrongs++;
    if (trig === 'provocation' && ['anger', 'pride'].includes(e.decision!.chosen)) feuds.inKind++;
    if (trig === 'row') feuds.rows++;
    if (e.type === 'dislike') feuds.dislikes++;
    if (e.type === 'cooled') feuds.ended++;
    if (e.decision && feltKey(topKey(e))) {
      const x = named(w, e);
      nm.lines++;
      if (x.ok) nm.named++;
      if (x.shown) nm.shown++;
      nm.byKind[x.kind] = (nm.byKind[x.kind] ?? 0) + 1;
    }
  }
  const weight = (p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const busiest = adults
    .slice()
    .sort((x, y) => weight(y) - weight(x) || x.id - y.id)
    .slice(0, PER);
  const random = adults
    .slice()
    .sort((x, y) => hash('pick', seed, x.id) - hash('pick', seed, y.id) || x.id - y.id)
    .slice(0, PER);
  const byKey: Record<string, number> = {};
  let lastingN = 0;
  for (const p of adults) {
    const keys = new Set([
      ...p.marks.filter(m => m.t >= w.startPresent).map(m => m.key),
      ...p.exceptions.filter(x => (w.events[x.cause]?.t ?? -Infinity) >= w.startPresent).map(x => x.key),
    ]);
    if (keys.size) lastingN++;
    for (const k of keys) byKey[k] = (byKey[k] ?? 0) + 1;
  }
  return {
    seed,
    rule,
    years,
    adults: adults.length,
    adultMonths,
    carrying,
    peak,
    griefEmotionMonths,
    flips: Object.fromEntries(Object.entries(flips).map(([k, f]) => [k, f.all])),
    feuds,
    named: nm,
    busiest: pagesOf(w, busiest),
    random: pagesOf(w, random),
    all: pagesOf(w, adults),
    lasting: { adults: lastingN, byKey },
    debts,
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
  return { n, m, sd, h: n > 1 ? ((T95[n - 2] ?? 1.96) * sd) / Math.sqrt(n) : NaN };
}
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const fmt = (x: number, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '–');

const mode = process.argv[2];
if (mode === 'run') {
  const A = +process.argv[3],
    B = +(process.argv[4] ?? process.argv[3]),
    rule = process.argv[5] ?? 'on',
    years = +(process.argv[6] ?? 10);
  ON.add('feelings');
  if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
  mkdirSync(OUT, { recursive: true });
  for (let seed = A; seed <= B; seed++) {
    const f = `${OUT}/${rule}-${seed}.json`;
    const x: WorldOut | undefined = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : undefined;
    if (x && x.years === years) continue;
    writeFileSync(f, JSON.stringify(runWorld(seed, rule, years)));
    console.error(`feel ${rule}: world ${seed}`);
  }
} else if (mode === 'report') {
  const [ra, rb] = [process.argv[3] ?? 'on', process.argv[4] ?? 'feelings'];
  const load = (rule: string) => {
    const m = new Map<number, WorldOut>();
    for (const f of existsSync(OUT) ? readdirSync(OUT) : [])
      if (f.startsWith(rule + '-') && /^\d+\.json$/.test(f.slice(rule.length + 1))) {
        const x: WorldOut = JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'));
        m.set(x.seed, x);
      }
    return m;
  };
  const A = load(ra),
    B = load(rb);
  const seeds = [...A.keys()].filter(s => B.has(s)).sort((a, b) => a - b);
  if (!seeds.length) {
    console.log(`feel: no paired worlds in ${OUT} for ${ra} and ${rb}`);
    process.exit(1);
  }
  const out: Record<string, unknown> = { worlds: seeds.length, seeds: [seeds[0], seeds[seeds.length - 1]] };
  console.log(
    `${seeds.length} worlds (${seeds[0]}–${seeds[seeds.length - 1]}), ${A.get(seeds[0])!.years} present years · ${ra} / ${rb} · mean per world ±95%`,
  );
  const row = (name: string, f: (x: WorldOut) => number, d = 1, key?: string) => {
    const a = ci(seeds.map(s => f(A.get(s)!))),
      b = ci(seeds.map(s => f(B.get(s)!))),
      dd = ci(seeds.map(s => f(A.get(s)!) - f(B.get(s)!)));
    console.log(
      name.padEnd(58) +
        `${fmt(a.m, d)} ±${fmt(a.h, d)}`.padStart(16) +
        `${fmt(b.m, d)} ±${fmt(b.h, d)}`.padStart(16) +
        `${fmt(dd.m, d)} ±${fmt(dd.h, d)}`.padStart(18),
    );
    if (key)
      out[key] = {
        on: +a.m.toFixed(4),
        onH: +a.h.toFixed(4),
        off: +b.m.toFixed(4),
        offH: +b.h.toFixed(4),
        d: +dd.m.toFixed(4),
        dH: +dd.h.toFixed(4),
        dSd: +dd.sd.toFixed(4),
      };
    return { a, b, dd };
  };
  console.log(''.padEnd(58) + ra.padStart(16) + rb.padStart(16) + `${ra} − ${rb}`.padStart(18));

  console.log('\n1. Carrying: share of adult-months with each kind at a weight it is weighed at (%); stop above 25');
  for (const k of KINDS) row(`  ${k}`, x => (100 * x.carrying[k]) / Math.max(1, x.adultMonths), 1, 'carry_' + k);
  for (const k of KINDS) row(`  ${k}, the most in any month`, x => 100 * x.peak[k], 1, 'peak_' + k);
  row('  grief-emotion months, per 100 adult-months', x => (100 * x.griefEmotionMonths) / Math.max(1, x.adultMonths), 2, 'griefEmotion');
  const ratio = sum(seeds.map(s => A.get(s)!.carrying.grief)) / Math.max(1, sum(seeds.map(s => B.get(s)!.griefEmotionMonths)));
  console.log(`  grief-months (on) over grief-emotion months (off): ${fmt(ratio, 2)}; stop above 2`);
  out.griefRatio = +ratio.toFixed(3);

  console.log('\n2. Flips: of decisions weighing it, the share whose likeliest answer changes without it (%); stop below 5');
  for (const k of ['all', 'kinds', ...KINDS, 'owes']) {
    const r = row(`  ${k} (flips)`, x => (100 * x.flips[k].flips) / Math.max(1, x.flips[k].weighed), 1, 'flip_' + k);
    const tot = seeds.reduce(
      (s, x) => ({ w: s.w + A.get(x)!.flips[k].weighed, f: s.f + A.get(x)!.flips[k].flips, d: s.d + A.get(x)!.flips[k].decisions }),
      { w: 0, f: 0, d: 0 },
    );
    console.log(
      `      pooled: ${tot.f} of ${tot.w} weighed (${fmt((100 * tot.f) / Math.max(1, tot.w))}%), weighed in ${fmt((100 * tot.w) / Math.max(1, tot.d))}% of ${tot.d} decisions`,
    );
    void r;
  }

  console.log('\n3. Repeats: must not rise');
  for (const [k, name] of [
    ['busiest', 'the three busiest'],
    ['random', 'three at random'],
    ['all', 'every adult'],
  ] as const)
    row(`  copy share, ${name} (%)`, x => (100 * x[k].copies) / Math.max(1, x[k].lines), 2, 'copy_' + k);
  row(`  the 25 commonest templates' share of every adult's lines (%)`, x => (100 * x.all.top25) / Math.max(1, x.all.lines), 2, 'top25');
  console.log("  without the retired promise's lines, in both arms:");
  for (const [k, name] of [
    ['busiest', 'the three busiest'],
    ['random', 'three at random'],
    ['all', 'every adult'],
  ] as const)
    row(`  copy share, ${name} (%)`, x => (100 * x[k].copiesX) / Math.max(1, x[k].linesX), 2, 'copyX_' + k);
  row(`  the 25 commonest templates' share (%)`, x => (100 * x.all.top25X) / Math.max(1, x.all.linesX), 2, 'top25X');

  console.log('\n4. Feuds, per thousand adult-years: inside the off arm, or said');
  for (const [k, name] of [
    ['wrongs', 'hostile acts (the wrongs)'],
    ['inKind', 'provocations answered in kind'],
    ['rows', "couples' rows"],
    ['dislikes', 'dislikes'],
    ['ended', 'friendships ended'],
  ] as const)
    row(`  ${name}`, x => (1000 * x.feuds[k]) / Math.max(1, x.feuds.adultYears), 1, 'feud_' + k);

  console.log('\n5. Named: lines a feeling decided, and those naming kind and object');
  const nl = sum(seeds.map(s => A.get(s)!.named.lines)),
    nn = sum(seeds.map(s => A.get(s)!.named.named)),
    ns = sum(seeds.map(s => A.get(s)!.named.shown));
  const byKind: Record<string, number> = {};
  for (const s of seeds) for (const [k, v] of Object.entries(A.get(s)!.named.byKind)) byKind[k] = (byKind[k] ?? 0) + v;
  console.log(
    `  ${nl} lines; ${nn} name kind and object (${fmt((100 * nn) / Math.max(1, nl))}%); shown on the page in ${ns} (${fmt((100 * ns) / Math.max(1, nl))}%)`,
  );
  console.log(
    `  by kind: ${Object.entries(byKind)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ')}`,
  );
  out.named = { lines: nl, named: nn, shown: ns, byKind };

  console.log('\nBeside: what the reading can see');
  for (const [k, name] of [
    ['busiest', 'the three busiest'],
    ['random', 'three at random'],
  ] as const) {
    row(`  kinds of line per page, ${name}`, x => x[k].kinds / Math.max(1, x[k].pages), 2, 'kinds_' + k);
    row(`  lines per page, ${name}`, x => x[k].lines / Math.max(1, x[k].pages), 1, 'lines_' + k);
    row(`  pages with a line a feeling decided, ${name} (%)`, x => (100 * x[k].touched) / Math.max(1, x[k].pages), 1, 'touched_' + k);
    row(`  lines a feeling decided per page, ${name}`, x => x[k].feelLines / Math.max(1, x[k].pages), 2, 'feelLines_' + k);
  }
  row('  adults with a lasting change from the present (%)', x => (100 * x.lasting.adults) / Math.max(1, x.adults), 1, 'lasting');
  for (const k of ['grief', 'forgiveness']) row(`    ${k} (adults per world)`, x => x.lasting.byKey[k] ?? 0, 2, 'lasting_' + k);

  console.log('\nDebts and own answers (on), summed over worlds');
  const d = seeds.map(s => A.get(s)!.debts);
  const cin = sum(d.map(x => x.calledIn)),
    ans = sum(d.map(x => x.answered)),
    paid = sum(d.map(x => x.paid)),
    asked = sum(d.map(x => x.asked ?? 0));
  console.log(
    `  decisions of the one owed weighing the debt (called in): ${cin}, asking in ${asked} (${fmt((100 * asked) / Math.max(1, cin))}%); requests answered by one who owes the asker: ${ans}, given in ${paid} (${fmt((100 * paid) / Math.max(1, ans))}%)`,
  );
  for (const fam of ['severity', 'humility']) {
    const off = sum(d.map(x => x.own[fam][0])),
      took = sum(d.map(x => x.own[fam][1]));
    console.log(`  ${fam} offered by a feeling: ${off}, taken ${took} (${fmt((100 * took) / Math.max(1, off))}%)`);
  }
  out.debts = { calledIn: cin, asked, answered: ans, paid };
  console.log('FEEL ' + JSON.stringify(out));
} else {
  console.error('usage: feel.ts run A B [rule] [years] | report [ruleA] [ruleB]');
  process.exit(2);
}
