// Round 46's sizing: taking sides (sides.ts), on (ON=sides) against off, paired by world, with the counter and the five fail-ifs of
// notes/research/sides.md.
//   ./run.sh src/tools/diag/sides.ts run A B [rule] [years]   → out-sides/<rule>-<seed>.json, one world each (a stopped run resumes)
//   ./run.sh src/tools/diag/sides.ts report [on] [off]          → the checks; a rule is 'on', or switches joined by '+'
// The counter: of side-takings in the first seven present years, the share that lead somewhere within three years, counting descent only:
// a tie ended or started (a friendship's end or start, a partnership's, a falling-out or a making-up) or a weighty event among the events
// that descend from it through cited causes. Beside it: the ties alone, the decider's own friendship ended at once, a meeting among the
// descendants, and the off arm's would-be deciders who lose a friendship with a side or fall into a rift with one within three years
// (no descent: the research's 20.7%).
// The witness line: per witness-year, side-takings where the witness is a side or the decider; or one of the three is the witness's friend,
// partner or kin. Never a target.
// Last line: SIDES {...}
import '../env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { hash } from '../../rng';
import { BY_FAMILY } from '../../families';
import { riftOf, castOf, type Cast } from '../../sides';
import { regardPart } from '../../telling';
import { age, facet, peekBond, OFF, ON, TEXTURE, type Event, type Person, type World } from '../../world';
import { copies, lineTexts, norm, packPage } from './pages';
import { reversals } from './story';
import { countFlips } from './flip';

const OUT = process.env.SIDES_OUT ?? 'out-sides';
const PER = 3;
const SOURCES = 84; // side-takings of the first seven present years
const FOLLOW = 36; // followed for three
const TIES = new Set(['cooled', 'friends', 'madeup', 'mended', 'dating', 'married', 'split', 'divorce', 'betrayed', 'thread:cost']);
const CHOICES = ['sideagainst', 'standby', 'keepout'] as const;
const SIDE_LINE =
  /took .+'s side|sided with|stood by|stuck (by|with)|kept (to|with) |kept out of|would not take sides|stayed (on good terms|friends) with both|backed .+ in the rivalry|stopped speaking to/;
const WRONGS = new Set(
  Object.values(BY_FAMILY)
    .flat()
    .filter(x => x.like <= -0.25 && x.intensity >= 0.45)
    .map(x => x.id),
);
const weighty = (e: Event) => e.w >= 0.8 && !TEXTURE.has(e.type);
const AGREE = ['forgiveness', 'gentleness', 'flexibility', 'patience'];

interface Taking {
  t: number; // month, from the start of the present
  kind: string;
  cast: Cast;
  chosen: string;
  gap: number; // liking of the side named as doing it, less the other's, at the rift
  near: number; // the same, as the decision reads it (liking, regard, accounts)
  fair: number; // the decider's fairness
  agree: number; // the decider's agreeableness (mean of its four facets)
  full: boolean; // three years to follow
  tie: boolean;
  cut: boolean;
  weightyD: boolean; // a weighty descendant
  cited: boolean; // a weighty event cites it directly
  meeting: boolean; // a meeting among its descendants
  meetingOnly: boolean; // it leads somewhere only through a meeting and what followed one
  witParty: boolean;
  witClose: boolean;
  witKnows: boolean;
  principled: boolean;
  led: string[]; // the types of the descendants that lead somewhere (a side-taking as 'sides:<type>')
}
interface WouldBe {
  t: number;
  kind: string;
  cast: Cast;
  d: number;
  a: number;
  b: number;
}
interface WorldOut {
  seed: number;
  rule: string;
  years: number;
  adultYears: number;
  witYears: number;
  takings: Taking[];
  would: { n: number; full: number; lost: number; ended: number; byCast: Record<string, number> };
  fairFlips: { weighed: number; flips: number };
  traitFlips?: { weighed: number; flips: number }; // the decider's fairness as a trait, on keeping out (second pass)
  fairBoth?: { weighed: number; flips: number }; // both together
  feels: { renewed: number; reopened: number; byKind: Record<string, [number, number]> };
  feuds: { wrongs: number; rows: number; dislikes: number; ended: number };
  paths: Record<string, number>;
  friendsPerAdult: number;
  rev90: number;
  pages: Record<'busiest' | 'random' | 'all', { lines: number; copies: number; top25: number; top25Sides: number; touched: number; pages: number }>;
}

function top25(pages: string[][]) {
  const freq = new Map<string, number>();
  for (const pg of pages) for (const t of lineTexts(pg)) freq.set(norm(t), (freq.get(norm(t)) ?? 0) + 1);
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
  return { n: top.reduce((s, x) => s + x[1], 0), sides: top.filter(([t]) => SIDE_LINE.test(t)).length };
}
function pagesOf(w: World, people: Person[]) {
  const pages = people.map(p => packPage(w, p));
  const c = copies(pages);
  const t = top25(pages);
  const touched = people.filter(p =>
    p.events.some(i => w.events[i].t >= w.startPresent && (w.events[i].decision as any)?.trigger === 'sides'),
  ).length;
  return { lines: c.lines, copies: c.copies, top25: t.n, top25Sides: t.sides, touched, pages: people.length };
}

function runWorld(seed: number, rule: string, years: number): WorldOut {
  const w = buildWorld(seed, 1);
  const wit = pickWitness(w).id;
  const t0 = w.startPresent;
  const fair = countFlips(w, 'sides:fair');
  const fairT = countFlips(w, 'fairness');
  const fairB = countFlips(w, '/^(sides:fair|fairness)$/');
  const feels: WorldOut['feels'] = { renewed: 0, reopened: 0, byKind: {} };
  (globalThis as any).FEELLOG = (k: string, reopened: boolean) => {
    if (w.t < t0) return;
    feels.renewed++;
    if (reopened) feels.reopened++;
    const r = (feels.byKind[k] ??= [0, 0]);
    r[0]++;
    if (reopened) r[1]++;
  };
  const would: WouldBe[] = [];
  const pre = new Map<string, { gap: number; near: number }>(); // the queued choices' liking, read at the rift
  let adultMonths = 0;
  for (let m = 0; m < years * 12; m++) {
    tick(w);
    adultMonths += w.people.filter(p => p.status === 'in' && age(w, p) >= 18).length;
    // Would-be deciders, in either arm, as sidesTick reads them.
    for (let i = w.events.length - 1; i >= 0 && w.events[i].t === w.t; i--) {
      const r = riftOf(w, w.events[i]);
      if (!r) continue;
      for (const { p, cast } of castOf(w, r)) {
        would.push({ t: w.t - t0, kind: r.kind, cast, d: p.id, a: r.t, b: r.o });
        const near = (x: number) => (peekBond(w, p.id, x)?.like ?? 0) + 0.3 * (peekBond(w, p.id, x)?.respect ?? 0) + regardPart(w, p.id, x);
        pre.set(`${w.t}:${p.id}:${r.ev}`, {
          gap: (peekBond(w, p.id, r.t)?.like ?? 0) - (peekBond(w, p.id, r.o)?.like ?? 0),
          near: near(r.t) - near(r.o),
        });
      }
    }
  }
  (globalThis as any).FEELLOG = undefined;
  const end = w.t - t0;
  const pres = w.events.filter(e => e.t >= t0);
  const kids = new Map<number, number[]>();
  for (const f of pres) {
    const seen = new Set<number>();
    for (const c of f.causes)
      if (c.ref != null && c.ref >= 0 && c.ref < f.id && !seen.has(c.ref)) {
        seen.add(c.ref);
        (kids.get(c.ref) ?? kids.set(c.ref, []).get(c.ref)!).push(f.id);
      }
  }
  // Descendants within three years; `through` says whether each was reached through a meeting.
  const descend = (e: Event) => {
    const d = new Map<number, boolean>();
    const q: [number, boolean][] = [[e.id, false]];
    while (q.length) {
      const [id, via] = q.shift()!;
      for (const k of kids.get(id) ?? []) {
        const f = w.events[k];
        if (d.has(k) || f.t > e.t + FOLLOW) continue;
        const m = via || String((f.decision as any)?.trigger ?? '').startsWith('meeting');
        d.set(k, m);
        q.push([k, m]);
      }
    }
    return d;
  };
  const q = w.byId.get(wit)!;
  const closeToWit = (x: number) => q.friends.has(x) || q.partner === x || q.parents.includes(x) || q.kids.includes(x);
  const takings: Taking[] = [];
  for (const e of pres) {
    const s = (e.decision as any)?.trigger === 'sides' ? (e.decision as any).sided : undefined;
    if (!s) continue;
    const [d, a, b] = e.who;
    const D = descend(e);
    const evs = [...D.keys()].map(k => w.events[k]);
    const leads = (f: Event) => TIES.has(f.type) || weighty(f);
    const tie = evs.some(f => TIES.has(f.type));
    const somewhere = evs.filter(leads);
    const pp = w.byId.get(d)!;
    const at = pre.get(`${e.t - 1}:${d}:${s.rift.ev}`);
    takings.push({
      t: e.t - t0,
      kind: s.rift.kind,
      cast: s.cast,
      chosen: e.type,
      gap: at?.gap ?? NaN,
      near: at?.near ?? NaN,
      fair: facet(pp, 'fairness'),
      agree: AGREE.reduce((x, k) => x + facet(pp, k), 0) / AGREE.length,
      full: e.t - t0 + FOLLOW <= end,
      tie,
      cut: evs.some(f => f.type === 'cooled' && f.causes[0]?.ref === e.id),
      weightyD: evs.some(weighty),
      cited: (kids.get(e.id) ?? []).some(k => weighty(w.events[k]) && w.events[k].t <= e.t + FOLLOW),
      meeting: [...D.values()].some(Boolean),
      meetingOnly: somewhere.length > 0 && somewhere.every(f => D.get(f.id)),
      witParty: e.who.includes(wit),
      witClose: e.who.includes(wit) || e.who.some(closeToWit),
      witKnows: e.knownBy.has(wit) || e.who.includes(wit),
      principled: !!s.rift.said && e.causes.some((c: any) => c.label === s.rift.said),
      led: [...new Set(somewhere.map(f => ((f.decision as any)?.trigger === 'sides' ? 'sides:' : '') + f.type))],
    });
    void a;
    void b;
  }
  // The would-be deciders: a friendship with a side ended, or a rift with one, within three years.
  const wo: WorldOut['would'] = { n: 0, full: 0, lost: 0, ended: 0, byCast: {} };
  const byPair = new Map<string, Event[]>();
  for (const e of pres)
    if (e.who.length >= 2 && (e.type === 'cooled' || riftOf(w, e) || ['rivals', 'betrayed', 'scheme:found'].includes(e.type))) {
      const k = `${Math.min(e.who[0], e.who[1])}:${Math.max(e.who[0], e.who[1])}`;
      (byPair.get(k) ?? byPair.set(k, []).get(k)!).push(e);
    }
  for (const x of would) {
    wo.n++;
    wo.byCast[x.cast] = (wo.byCast[x.cast] ?? 0) + 1;
    if (x.t >= SOURCES || x.t + FOLLOW > end) continue;
    wo.full++;
    const hits = [x.a, x.b]
      .flatMap(s => byPair.get(`${Math.min(x.d, s)}:${Math.max(x.d, s)}`) ?? [])
      .filter(e => e.t - t0 > x.t && e.t - t0 <= x.t + FOLLOW);
    if (hits.length) wo.lost++;
    if (hits.some(e => e.type === 'cooled')) wo.ended++;
  }
  const feuds = { wrongs: 0, rows: 0, dislikes: 0, ended: 0 };
  const paths: Record<string, number> = {};
  for (const e of pres) {
    const trig = e.decision?.trigger as string | undefined;
    if (WRONGS.has(e.type) && trig && !trig.startsWith('row')) feuds.wrongs++;
    if (trig === 'row') feuds.rows++;
    if (e.type === 'dislike') feuds.dislikes++;
    if (e.type === 'cooled') feuds.ended++;
    for (const k of ['left', 'home', 'arrived', 'dating', 'married', 'split', 'divorce', 'hired', 'dismiss', 'born', 'death'])
      if (e.type === k) paths[k] = (paths[k] ?? 0) + 1;
  }
  const adults = w.people.filter(p => p.status === 'in' && age(w, p) >= 18);
  const friends = adults.reduce((s, p) => s + p.friends.size, 0) / Math.max(1, adults.length);
  const revs = adults.map(p => reversals(w, p)).sort((x, y) => x - y);
  const weight = (p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= t0 ? w.events[i].w : 0), 0);
  const busiest = adults
    .slice()
    .sort((x, y) => weight(y) - weight(x) || x.id - y.id)
    .slice(0, PER);
  const random = adults
    .slice()
    .sort((x, y) => hash('pick', seed, x.id) - hash('pick', seed, y.id) || x.id - y.id)
    .slice(0, PER);
  const fr = fair.byTrigger['sides'] ?? { weighed: 0, flips: 0 };
  return {
    seed,
    rule,
    years,
    adultYears: adultMonths / 12,
    witYears: years,
    takings,
    would: wo,
    fairFlips: { weighed: fr.weighed, flips: fr.flips },
    traitFlips: { weighed: fairT.byTrigger['sides']?.weighed ?? 0, flips: fairT.byTrigger['sides']?.flips ?? 0 },
    fairBoth: { weighed: fairB.byTrigger['sides']?.weighed ?? 0, flips: fairB.byTrigger['sides']?.flips ?? 0 },
    feels,
    feuds,
    paths,
    friendsPerAdult: friends,
    rev90: revs[Math.floor(0.9 * (revs.length - 1))] ?? 0,
    pages: { busiest: pagesOf(w, busiest), random: pagesOf(w, random), all: pagesOf(w, adults) },
  };
}

// Mean and 95% half-width over worlds (Student's t).
const T95 = [
  12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08,
  2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042, 2.04, 2.037, 2.035, 2.032, 2.03, 2.028, 2.026, 2.024, 2.023,
];
function ci(xs: number[]) {
  xs = xs.filter(Number.isFinite);
  const n = xs.length;
  const m = xs.reduce((s, x) => s + x, 0) / Math.max(1, n);
  const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, n - 1));
  return { n, m, sd, h: n > 1 ? ((T95[n - 2] ?? 1.96) * sd) / Math.sqrt(n) : NaN };
}
const fmt = (x: number, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '–');
const pct = (a: number, b: number) => (b ? (100 * a) / b : NaN);

const mode = process.argv[2];
if (mode === 'run') {
  const A = +process.argv[3],
    B = +(process.argv[4] ?? process.argv[3]),
    rule = process.argv[5] ?? 'on',
    years = +(process.argv[6] ?? 10);
  if (rule === 'on') ON.add('sides');
  else for (const x of rule.split('+')) OFF.add(x);
  mkdirSync(OUT, { recursive: true });
  for (let seed = A; seed <= B; seed++) {
    const f = `${OUT}/${rule}-${seed}.json`;
    const x: WorldOut | undefined = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : undefined;
    if (x && x.years === years) continue;
    writeFileSync(f, JSON.stringify(runWorld(seed, rule, years)));
    console.error(`sides ${rule}: world ${seed}`);
  }
} else if (mode === 'report') {
  const [ra, rb] = [process.argv[3] ?? 'on', process.argv[4] ?? 'sides'];
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
    console.log(`sides: no paired worlds in ${OUT} for ${ra} and ${rb}`);
    process.exit(1);
  }
  const out: Record<string, unknown> = { worlds: seeds.length, seeds: [seeds[0], seeds[seeds.length - 1]] };
  const yrs = A.get(seeds[0])!.years;
  console.log(`${seeds.length} worlds (${seeds[0]}–${seeds[seeds.length - 1]}), ${yrs} present years · ${ra} / ${rb} · mean per world ±95%`);
  const line = (name: string, x: { m: number; h: number }, d = 1, key?: string, extra = '') => {
    console.log(name.padEnd(70) + `${fmt(x.m, d)} ±${fmt(x.h, d)}`.padStart(16) + (extra ? '   ' + extra : ''));
    if (key) out[key] = { m: +x.m.toFixed(4), h: +x.h.toFixed(4) };
  };
  const row = (name: string, f: (x: WorldOut) => number, d = 1, key?: string) => {
    const a = ci(seeds.map(s => f(A.get(s)!))),
      b = ci(seeds.map(s => f(B.get(s)!))),
      dd = ci(seeds.map(s => f(A.get(s)!) - f(B.get(s)!)));
    console.log(
      name.padEnd(62) +
        `${fmt(a.m, d)} ±${fmt(a.h, d)}`.padStart(15) +
        `${fmt(b.m, d)} ±${fmt(b.h, d)}`.padStart(15) +
        `${fmt(dd.m, d)} ±${fmt(dd.h, d)}`.padStart(16),
    );
    if (key)
      out[key] = {
        on: +a.m.toFixed(4),
        onH: +a.h.toFixed(4),
        off: +b.m.toFixed(4),
        offH: +b.h.toFixed(4),
        d: +dd.m.toFixed(4),
        dH: +dd.h.toFixed(4),
      };
    return { a, b, dd };
  };
  // Per world, over side-takings with three years to follow, from the first seven years.
  const src = (x: WorldOut, f: (t: Taking) => boolean = () => true) => x.takings.filter(t => t.t < SOURCES && t.full && f(t));
  const share = (x: WorldOut, f: (t: Taking) => boolean, g: (t: Taking) => boolean = () => true) => pct(src(x, g).filter(f).length, src(x, g).length);
  const leads = (t: Taking) => t.tie || t.weightyD;
  const pooled = (f: (t: Taking) => boolean, g: (t: Taking) => boolean = () => true) => {
    const all = seeds.flatMap(s => src(A.get(s)!, g));
    return `${all.filter(f).length}/${all.length} pooled`;
  };

  console.log(`\nSide-takings (${ra}), per world-decade (×10/years)`);
  const per = (x: WorldOut, f: (t: Taking) => boolean = () => true) => (x.takings.filter(f).length * 10) / x.years;
  line('  all', ci(seeds.map(s => per(A.get(s)!))), 1, 'takings');
  for (const c of ['friends', 'kin', 'inlaw']) line(`  cast: ${c}`, ci(seeds.map(s => per(A.get(s)!, t => t.cast === c))), 1, 'cast_' + c);
  for (const k of ['rivals', 'fellout', 'split', 'divorce', 'scheme:found', 'betrayed'])
    line(`  rift: ${k}`, ci(seeds.map(s => per(A.get(s)!, t => t.kind === k))), 1, 'rift_' + k);
  line(`  would-be deciders in ${rb} (all casts)`, ci(seeds.map(s => (B.get(s)!.would.n * 10) / yrs)), 1, 'would_off');

  console.log('\n1. The counter: of side-takings (first seven years, three to follow), the share that lead somewhere, by descent; stop under 15');
  line(
    '  leads somewhere: a tie, or a weighty event among its descendants (%)',
    ci(seeds.map(s => share(A.get(s)!, leads))),
    1,
    'counter',
    pooled(leads),
  );
  for (const c of ['friends', 'kin', 'inlaw'])
    line(
      `    cast: ${c}`,
      ci(seeds.map(s => share(A.get(s)!, leads, t => t.cast === c))),
      1,
      'counter_' + c,
      pooled(leads, t => t.cast === c),
    );
  line("    friends of both only (the research's cast)", ci(seeds.map(s => share(A.get(s)!, leads, t => t.cast === 'friends'))), 1);
  for (const c of CHOICES)
    line(
      `    answer: ${c}`,
      ci(seeds.map(s => share(A.get(s)!, leads, t => t.chosen === c))),
      1,
      'counter_' + c,
      pooled(leads, t => t.chosen === c),
    );
  line(
    '  a tie among its descendants (%)',
    ci(seeds.map(s => share(A.get(s)!, t => t.tie))),
    1,
    'ties',
    pooled(t => t.tie),
  );
  line(
    "    … the decider's friendship ended at once (%)",
    ci(seeds.map(s => share(A.get(s)!, t => t.cut))),
    1,
    'cut',
    pooled(t => t.cut),
  );
  line('  a weighty event cites it directly (%)', ci(seeds.map(s => share(A.get(s)!, t => t.cited))), 1, 'cited');
  line('  a meeting among its descendants (%)', ci(seeds.map(s => share(A.get(s)!, t => t.meeting))), 1, 'meeting');
  line('  leads somewhere only through a meeting (%)', ci(seeds.map(s => share(A.get(s)!, t => t.meetingOnly))), 1, 'meetingOnly');
  const wl = (x: WorldOut) => pct(x.would.lost, x.would.full);
  row('  would-be deciders: friendship with a side ended, or a rift, in 3 years (%)', wl, 1, 'cooccur');
  row('    … the friendship ended (%)', x => pct(x.would.ended, x.would.full), 1, 'cooccurEnded');
  // Power: the half-width 40 fresh worlds would give, from these worlds' spread.
  const c = ci(seeds.map(s => share(A.get(s)!, leads)));
  console.log(
    `  power: between-world sd ${fmt(c.sd)}; ±${fmt((2.023 * c.sd) / Math.sqrt(40))} on 40 worlds, ±${fmt((2.069 * c.sd) / Math.sqrt(24))} on 24`,
  );
  out.counterSd = +c.sd.toFixed(3);

  console.log('\nThe witness line (per witness-year; never a target)');
  line('  the witness is a side or the decider', ci(seeds.map(s => A.get(s)!.takings.filter(t => t.witParty).length / yrs)), 2, 'witParty');
  line(
    "  … or one of the three is the witness's friend, partner or kin",
    ci(seeds.map(s => A.get(s)!.takings.filter(t => t.witClose).length / yrs)),
    2,
    'witClose',
  );
  console.log(
    `  witnesses with none as a party in ${yrs} years: ${seeds.filter(s => !A.get(s)!.takings.some(t => t.witParty)).length} of ${seeds.length}`,
  );

  console.log('\n2. The choice belongs to the person');
  const sided = (t: Taking) => t.chosen !== 'keepout' && Number.isFinite(t.gap) && Math.abs(t.gap) >= 0.1;
  const against = (t: Taking) => (t.chosen === 'standby' ? t.gap < 0 : t.gap > 0); // the side taken is not the one liked more
  const all = seeds.flatMap(s => A.get(s)!.takings);
  console.log(
    `  side taken is not the one liked more, gap ≥ 0.1: ${fmt(pct(all.filter(t => sided(t) && against(t)).length, all.filter(sided).length))}% of ${all.filter(sided).length} (≥ 25)`,
  );
  const thirds = (f: (t: Taking) => number) => {
    const xs = all.slice().sort((a, b) => f(a) - f(b));
    const n = Math.floor(xs.length / 3);
    const nei = (ys: Taking[]) => pct(ys.filter(t => t.chosen === 'keepout').length, ys.length);
    return [nei(xs.slice(0, n)), nei(xs.slice(-n))];
  };
  for (const [k, f] of [
    ['fairness', (t: Taking) => t.fair],
    ['agreeableness', (t: Taking) => t.agree],
  ] as const) {
    const [lo, hi] = thirds(f);
    console.log(`  neither, bottom third of ${k} ${fmt(lo)}%, top ${fmt(hi)}%: ${fmt(Math.max(lo, hi) / Math.min(lo, hi), 2)}× (≥ 1.3)`);
    out['neither_' + k] = [+lo.toFixed(2), +hi.toFixed(2)];
  }
  const ff = seeds.reduce((s, x) => ({ w: s.w + A.get(x)!.fairFlips.weighed, f: s.f + A.get(x)!.fairFlips.flips }), { w: 0, f: 0 });
  const nAll = all.length;
  console.log(
    `  the fairness consideration flips ${ff.f} of ${ff.w} choices that weigh it (${fmt(pct(ff.f, ff.w))}%), ${fmt(pct(ff.f, nAll))}% of all ${nAll} (≥ 5)`,
  );
  for (const [k, name] of [
    ['traitFlips', 'the fairness trait'],
    ['fairBoth', 'both fairness considerations together'],
  ] as const) {
    const f2 = seeds.reduce((s, x) => ({ w: s.w + (A.get(x)![k]?.weighed ?? 0), f: s.f + (A.get(x)![k]?.flips ?? 0) }), { w: 0, f: 0 });
    console.log(`  ${name} flips ${f2.f} of ${f2.w} choices that weigh it, ${fmt(pct(f2.f, nAll))}% of all ${nAll}`);
    out['flips_' + k] = +pct(f2.f, nAll).toFixed(2);
  }
  console.log(`  given on fairness (principled): ${fmt(pct(all.filter(t => t.principled).length, nAll))}%`);

  console.log('\n3. No camps: stops, not targets');
  row('  friendships per adult at the end', x => x.friendsPerAdult, 2, 'friends');
  row('  reversals, 90th percentile', x => x.rev90, 2, 'rev90');
  for (const k of ['wrongs', 'rows', 'dislikes', 'ended'] as const)
    row(`  ${k} per thousand adult-years`, x => (1000 * x.feuds[k]) / x.adultYears, 1, 'feud_' + k);
  console.log('  paths a side-taking has no claim on, per world-decade:');
  for (const k of ['left', 'home', 'arrived', 'dating', 'married', 'split', 'divorce', 'hired', 'dismiss', 'born', 'death'])
    row(`    ${k}`, x => ((x.paths[k] ?? 0) * 10) / x.years, 1, 'path_' + k);

  console.log('\n4. Someone can see it');
  console.log(`  the witness knows ${fmt(pct(all.filter(t => t.witKnows).length, nAll))}% of side-takings (≥ 30)`);
  out.witKnows = +pct(all.filter(t => t.witKnows).length, nAll).toFixed(2);

  console.log('\n5. Not a script');
  for (const c of CHOICES) {
    const s = pct(all.filter(t => t.chosen === c).length, nAll);
    console.log(`  ${c}: ${fmt(s)}% (≥ 15)`);
    out['answer_' + c] = +s.toFixed(2);
  }
  for (const k of ['rivals', 'fellout', 'split', 'divorce', 'scheme:found', 'betrayed']) {
    const xs = all.filter(t => t.kind === k);
    console.log(
      `  ${k.padEnd(13)} n ${String(xs.length).padStart(4)}: ` +
        CHOICES.map(c => `${c} ${fmt(pct(xs.filter(t => t.chosen === c).length, xs.length))}%`).join(', '),
    );
  }
  console.log(
    `  side-taking lines among any world's 25 commonest templates (every adult): ${seeds.reduce((s, x) => s + A.get(x)!.pages.all.top25Sides, 0)}`,
  );
  for (const [k, name] of [
    ['busiest', 'the three busiest'],
    ['random', 'three at random'],
    ['all', 'every adult'],
  ] as const)
    row(`  copy share, ${name} (%)`, x => pct(x.pages[k].copies, x.pages[k].lines), 2, 'copy_' + k);
  for (const k of ['busiest', 'random'] as const)
    console.log(
      `  ${k} pages with a side-taking line: ${fmt(
        pct(
          seeds.reduce((s, x) => s + A.get(x)!.pages[k].touched, 0),
          seeds.reduce((s, x) => s + A.get(x)!.pages[k].pages, 0),
        ),
      )}%`,
    );

  console.log('\nRenewals and reopenings (present years, per world-decade): a weaker cause renewing a feeling; reopened, one let go');
  row('  renewed', x => (x.feels.renewed * 10) / x.years, 1, 'renewed');
  row('  reopened', x => (x.feels.reopened * 10) / x.years, 2, 'reopened');
  row('  resentments renewed', x => ((x.feels.byKind.resentment?.[0] ?? 0) * 10) / x.years, 1, 'renewedRes');
  console.log('\nSIDES ' + JSON.stringify(out));
}
