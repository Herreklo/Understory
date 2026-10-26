// Round 45's sizing: feelings meet their object (notes/research/meeting.md), paired by world over three arms: on; OFF=meeting (round
// 44's feelings without the meeting, the research's baseline); OFF=feelings (main). feel.ts gives round 44's five checks beside it.
//   ./run.sh src/tools/diag/meet.ts run A B [arm] [years]   → out-meet/<arm>-<seed>.json (arm: on | meeting | feelings; default 20 years)
//   ./run.sh src/tools/diag/meet.ts report                  → the counter, the five fail-ifs' checks, demography; last line MEET {...}
// Per world:
//   counter     of resentments, guilts and gratitudes first held (≥ 0.12) in the first ten present years at 0.3 or more, the share whose
//               holder, within twelve months, decides with the object and removing the feeling flips that decision (flip.ts), as the
//               research counted it; round 44's counter (flips among decisions weighing the four kinds) beside it, first ten years
//   meetings    each meeting raised: holder, object, kind, answer; whether something followed within a year (the feeling ended or lost
//               its standing, a tie began or ended, a debt was paid, a lasting change toward the object); whether the same two met again
//               with the feeling unchanged since the last; the holder's forgiveness and social boldness
//   displaced   holder-months a meeting won where another matched situation would have run (situations/index.ts)
//   templates   at ten years: the 25 commonest templates of every adult's lines, and whether a meeting's line is one of them
//   demography  births, deaths, marriages, splits and hires over the whole run
import '../env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { feelingsOf } from '../../feelings';
import { score, truthView, type Option } from '../../decide';
import { OFF, age, type Person, type World } from '../../world';
import { lineTexts, norm, packPage } from './pages';
import { neutralised, stateMatcher } from './flip';
import type { Instance } from '../../grammar';

const OUT = process.env.MEET_OUT ?? 'out-meet';
const KINDS = ['resentment', 'guilt', 'gratitude'] as const;
const FOUR = stateMatcher('/^feel:(grief|resentment|guilt|gratitude)$/');
const ALL = stateMatcher('feel:*');

interface Dec {
  t: number;
  p: number;
  o?: number;
  feel: Record<string, boolean>;
}
interface Meet {
  t: number;
  p: number;
  o: number;
  k: string;
  fam: string;
  forg: number;
  bold: number;
  followed?: string; // what followed first, if anything
  same?: boolean; // met before, and the feeling as it was at that meeting (every answer changes it: zero by construction)
  still?: boolean; // met before, and nothing changed the feeling since that meeting's own answer
  prevFam?: string; // the answer at the last meeting
  answered?: string; // the apology's answer
}

function runWorld(seed: number, arm: string, years: number) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  const tCount = t0 + 120; // the counter's window: onsets in the first ten present years
  const decs: Dec[] = [];
  const r44 = { decisions: 0, weighed: 0, flips: 0, weighedAll: 0, flipsAll: 0 };
  const meets: Meet[] = [];
  const after = new Map<string, string>(); // holder|kind|object → the feeling's state at the end of the month of its last meeting
  const at = new Map<string, string>(); // … and at that meeting, before its answer
  const state = (p: number, k: string, o: number) => {
    const f = feelingsOf(w, p).find(x => x.k === k && x.o === o);
    return f ? `${f.v0.toFixed(6)}|${f.stands}|${f.away ?? 1}|${f.t}` : 'none';
  };
  let decisions10 = 0;
  w.hooks.predict = (w2: World, p: Person, options: Option[], chosen: string, rec: any) => {
    if (w2.t < t0) return;
    const trig = String(rec.trigger);
    const view = truthView(w2);
    const top = (s: { id: string; p: number }[]) => s.reduce((a, b) => (b.p > a.p ? b : a)).id;
    const before = top(score(options, view, p.variability));
    const feel: Record<string, boolean> = {};
    for (const k of KINDS) {
      const m = stateMatcher('feel:' + k);
      if (options.some(o => o.considerations.some(c => m(c.id)))) feel[k] = top(score(neutralised(options, m), view, p.variability)) !== before;
    }
    decs.push({ t: w2.t, p: p.id, o: rec.target, feel });
    if (w2.t < tCount) {
      decisions10++;
      r44.decisions++;
      for (const [m, wk, fk] of [
        [FOUR, 'weighed', 'flips'],
        [ALL, 'weighedAll', 'flipsAll'],
      ] as const)
        if (options.some(o => o.considerations.some(c => m(c.id)))) {
          r44[wk]++;
          if (top(score(neutralised(options, m), view, p.variability)) !== before) r44[fk]++;
        }
    }
    if (trig.startsWith('meeting:')) {
      const k = trig.slice(8),
        o = rec.target as number;
      const key = `${p.id}|${k}|${o}`;
      const prev = after.get(key),
        was = at.get(key),
        now = state(p.id, k, o);
      at.set(key, now);
      const last = [...meets].reverse().find(x => x.p === p.id && x.k === k && x.o === o);
      meets.push({
        ...(last ? { prevFam: last.fam } : {}),
        t: w2.t,
        p: p.id,
        o,
        k,
        fam: chosen,
        forg: p.facets.forgiveness ?? 0,
        bold: p.facets.socialBoldness ?? 0,
        ...(was != null ? { same: was === now } : {}),
        ...(prev != null ? { still: prev === now } : {}),
      });
    }
    if (trig === 'meeting-answer') {
      const m = [...meets].reverse().find(x => x.o === p.id && x.p === rec.target && x.fam === 'humility' && !x.answered);
      if (m) m.answered = chosen;
    }
  };
  // Displaced: a meeting won the holder's month over another matched situation.
  let displaced = 0;
  const month = new Map<number, string>();
  (globalThis as any).SCHED = (inst: Instance, won: boolean) => {
    if (w.t < t0 || w.t >= tCount) return;
    if (won) month.set(inst.actor.id, inst.type);
    else if (month.get(inst.actor.id)?.startsWith('meeting:') && month.get(inst.actor.id) !== 'x') {
      displaced++;
      month.set(inst.actor.id, 'x'); // one displaced decision a holder-month, at most
    }
  };
  // Episodes (as meet.ts in the research): from the month a feeling is first seen at 0.12 or more until it is gone.
  const open = new Map<string, any>();
  const episodes: any[] = [];
  let adultMonths = 0;
  let templates: { top: string[]; meetLines: number; meetInTop: number; meetTemplates: number } | undefined;
  // What each meeting is waited on for: the state at the meeting, then a year of month-ends.
  const watch: { m: Meet; friends: boolean; partner: boolean; owes: boolean; exc: number }[] = [];
  for (let mo = 0; mo < years * 12; mo++) {
    const nMeets = meets.length;
    // The ties before this month's meetings: read now, before tick.
    const pre = new Map<number, Person>();
    void pre;
    month.clear();
    tick(w);
    for (const p of w.people) if (p.status === 'in' && age(w, p) >= 18) adultMonths++;
    for (let i = nMeets; i < meets.length; i++) {
      const m = meets[i];
      const p = w.byId.get(m.p)!;
      watch.push({
        m,
        friends: p.friends.has(m.o),
        partner: p.partner === m.o,
        owes: p.owes?.to === m.o || w.byId.get(m.o)?.owes?.to === m.p,
        exc: p.exceptions.filter(x => x.other === m.o).length,
      });
      after.set(`${m.p}|${m.k}|${m.o}`, state(m.p, m.k, m.o));
      // The feeling's own change at the meeting counts only if it ends or loses its standing (had out and kept away do not, alone).
      const f = feelingsOf(w, m.p).find(x => x.k === m.k && x.o === m.o);
      if (!f || !f.stands) m.followed = !f ? 'ended' : 'no longer stands';
    }
    for (const x of watch) {
      if (x.m.followed || w.t - x.m.t > 12) continue;
      const p = w.byId.get(x.m.p)!;
      const f = feelingsOf(w, x.m.p).find(y => y.k === x.m.k && y.o === x.m.o);
      if (!f) x.m.followed = 'ended';
      else if (!f.stands) x.m.followed = 'no longer stands';
      else if (p.friends.has(x.m.o) !== x.friends || (p.partner === x.m.o) !== x.partner) x.m.followed = 'a tie';
      else if (x.owes && !(p.owes?.to === x.m.o || w.byId.get(x.m.o)?.owes?.to === x.m.p)) x.m.followed = 'a debt paid';
      else if (p.exceptions.filter(y => y.other === x.m.o).length !== x.exc) x.m.followed = 'a lasting change';
    }
    const seen = new Set<string>();
    for (const p of w.people) {
      if (p.status !== 'in' || age(w, p) < 18) continue;
      for (const f of feelingsOf(w, p.id)) {
        if (!(KINDS as readonly string[]).includes(f.k) || f.v < 0.12) continue;
        const key = `${p.id}|${f.k}|${f.o}`;
        seen.add(key);
        if (!open.has(key)) {
          const e = { p: p.id, k: f.k, o: f.o, t: w.t, v0: f.v, forg: p.facets.forgiveness ?? 0, bold: p.facets.socialBoldness ?? 0 };
          open.set(key, e);
          if (w.t < tCount) episodes.push(e);
        }
      }
    }
    for (const key of [...open.keys()]) if (!seen.has(key)) open.delete(key);
    if (mo === 119) {
      const adults = w.people.filter(p => p.status === 'in' && age(w, p) >= 18);
      const freq = new Map<string, number>();
      for (const p of adults) for (const t of lineTexts(packPage(w, p))) freq.set(norm(t), (freq.get(norm(t)) ?? 0) + 1);
      const top = [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25)
        .map(x => x[0]);
      const mine = w.events.filter(
        e => e.t >= t0 && (String(e.decision?.trigger).startsWith('meeting:') || e.decision?.trigger === 'meeting-answer'),
      );
      const mt = new Set(mine.map(e => norm(e.text.replace(/@\d+/g, 'X').replace(/\.$/, ''))));
      templates = { top, meetLines: mine.length, meetInTop: [...mt].filter(t => top.includes(t)).length, meetTemplates: mt.size };
    }
  }
  // The counter: within twelve months of onset, a decision of the holder with the object that weighs the feeling, and flips there.
  const byPair = new Map<string, Dec[]>();
  for (const d of decs) if (d.o != null) (byPair.get(`${d.p}|${d.o}`) ?? byPair.set(`${d.p}|${d.o}`, []).get(`${d.p}|${d.o}`)!).push(d);
  const mByKey = new Map<string, Meet[]>();
  for (const m of meets) (mByKey.get(`${m.p}|${m.k}|${m.o}`) ?? mByKey.set(`${m.p}|${m.k}|${m.o}`, []).get(`${m.p}|${m.k}|${m.o}`)!).push(m);
  for (const e of episodes) {
    const inYear = (t: number) => t >= e.t && t < e.t + 12;
    const weighed = (byPair.get(`${e.p}|${e.o}`) ?? []).filter(d => inYear(d.t) && d.feel[e.k] != null);
    e.met = weighed.length > 0;
    e.flipped = weighed.some(d => d.feel[e.k]);
    e.raised = (mByKey.get(`${e.p}|${e.k}|${e.o}`) ?? []).some(m => inYear(m.t));
  }
  const ev = w.events.filter(e => e.t >= t0);
  const n = (f: (e: any) => boolean) => ev.filter(f).length;
  return {
    seed,
    arm,
    years,
    adultMonths,
    decisions10,
    r44,
    episodes: episodes.map(e => ({ k: e.k, v0: +e.v0.toFixed(3), met: e.met, flipped: e.flipped, raised: e.raised, forg: e.forg, bold: e.bold })),
    meets: meets.map(m => ({ ...m, t: m.t - t0 })),
    displaced,
    templates,
    demog: {
      births: n(e => e.type === 'born' && /was born/.test(e.text)),
      deaths: n(e => e.type === 'death'),
      marriages: n(e => e.type === 'married'),
      splits: n(e => e.type === 'divorce' || e.type === 'split'),
      hires: n(e => e.type === 'hired'),
    },
  };
}
type WorldOut = ReturnType<typeof runWorld>;

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
const f1 = (x: number, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '–');
const pm = (c: { m: number; h: number }, d = 1) => `${f1(c.m, d)} ±${f1(c.h, d)}`;
const pct = (a: number, b: number) => (100 * a) / Math.max(1, b);

const mode = process.argv[2];
if (mode === 'run') {
  const A = +process.argv[3],
    B = +(process.argv[4] ?? process.argv[3]),
    arm = process.argv[5] ?? 'on',
    years = +(process.argv[6] ?? 20);
  if (arm !== 'on') OFF.add(arm);
  mkdirSync(OUT, { recursive: true });
  for (let seed = A; seed <= B; seed++) {
    const f = `${OUT}/${arm}-${seed}.json`;
    if (existsSync(f) && JSON.parse(readFileSync(f, 'utf8')).years === years) continue;
    writeFileSync(f, JSON.stringify(runWorld(seed, arm, years)));
    console.error(`meet ${arm}: world ${seed}`);
  }
} else if (mode === 'report') {
  const load = (arm: string) => {
    const m = new Map<number, WorldOut>();
    for (const f of existsSync(OUT) ? readdirSync(OUT) : [])
      if (f.startsWith(arm + '-') && /^\d+\.json$/.test(f.slice(arm.length + 1))) {
        const x: WorldOut = JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'));
        m.set(x.seed, x);
      }
    return m;
  };
  const on = load('on'),
    mt = load('meeting'),
    off = load('feelings');
  const seeds = [...on.keys()].filter(s => mt.has(s) && off.has(s)).sort((a, b) => a - b);
  const out: Record<string, unknown> = { worlds: seeds.length, seeds: [seeds[0], seeds[seeds.length - 1]] };
  console.log(`${seeds.length} worlds (${seeds[0]}–${seeds[seeds.length - 1]}), ${on.get(seeds[0])!.years} present years; mean per world ±95%`);
  const W = (m: Map<number, WorldOut>) => seeds.map(s => m.get(s)!);

  console.log('\nThe counter: held feelings (0.3 or more at onset, first ten years) changing an act toward their object within a year (%)');
  const counter = (x: WorldOut, k?: string) => {
    const es = x.episodes.filter(e => e.v0 >= 0.3 && (!k || e.k === k));
    return pct(es.filter(e => e.flipped).length, es.length);
  };
  for (const k of [undefined, ...KINDS]) {
    const a = ci(W(on).map(x => counter(x, k))),
      b = ci(W(mt).map(x => counter(x, k))),
      d = ci(seeds.map(s => counter(on.get(s)!, k) - counter(mt.get(s)!, k)));
    const pooled = (m: Map<number, WorldOut>) => {
      const es = W(m).flatMap(x => x.episodes.filter(e => e.v0 >= 0.3 && (!k || e.k === k)));
      return `${es.filter(e => e.flipped).length}/${es.length}`;
    };
    console.log(
      `  ${(k ?? 'all').padEnd(11)} on ${pm(a)} (${pooled(on)})   meeting off ${pm(b)} (${pooled(mt)})   paired ${pm(d)}   sd a world ${f1(a.sd, 2)}`,
    );
    out['counter_' + (k ?? 'all')] = {
      on: +a.m.toFixed(3),
      onH: +a.h.toFixed(3),
      sd: +a.sd.toFixed(3),
      off: +b.m.toFixed(3),
      d: +d.m.toFixed(3),
      dH: +d.h.toFixed(3),
    };
  }
  console.log("\nRound 44's counter (first ten years): flips among decisions weighing the four kinds; with the debt beside (%)");
  for (const [name, m] of [
    ['on', on],
    ['meeting off', mt],
  ] as const) {
    const a = ci(W(m).map(x => pct(x.r44.flips, x.r44.weighed))),
      b = ci(W(m).map(x => pct(x.r44.flipsAll, x.r44.weighedAll)));
    const tot = W(m).reduce((s, x) => [s[0] + x.r44.flips, s[1] + x.r44.weighed, s[2] + x.r44.decisions], [0, 0, 0]);
    console.log(
      `  ${name.padEnd(12)} four kinds ${pm(a)} (pooled ${tot[0]}/${tot[1]}, weighed in ${f1(pct(tot[1], tot[2]))}% of decisions); with the debt ${pm(b)}`,
    );
    out['r44_' + name.replace(' ', '')] = { m: +a.m.toFixed(3), h: +a.h.toFixed(3), withDebt: +b.m.toFixed(3) };
  }

  const M = W(on).flatMap(x => x.meets);
  const perDecade = (m: Map<number, WorldOut>, f: (x: WorldOut) => number) => ci(W(m).map(x => (f(x) * 10) / x.years));
  console.log('\nMeetings (on)');
  console.log(`  per world-decade: ${pm(perDecade(on, x => x.meets.length))}`);
  for (const k of KINDS) {
    const mk = M.filter(m => m.k === k);
    const fams: Record<string, number> = {};
    for (const m of mk) fams[m.fam] = (fams[m.fam] ?? 0) + 1;
    console.log(
      `  ${k.padEnd(11)} ${pm(perDecade(on, x => x.meets.filter(m => m.k === k).length))} a world-decade; answers ${Object.entries(fams)
        .map(([f, v]) => `${f} ${f1(pct(v, mk.length), 0)}%`)
        .join(', ')}`,
    );
  }
  const ap = M.filter(m => m.fam === 'humility');
  console.log(
    `  apologies answered: ${ap.filter(m => m.answered).length} of ${ap.length}; forgiven ${ap.filter(m => m.answered === 'leniency').length}`,
  );

  console.log('\nFail-if 1: the counter, above; stop under 2.5%. Power: below.');
  console.log('\nFail-if 2: the meeting recurs where nothing changed');
  const again = M.filter(m => m.same != null);
  console.log(`  met again: ${again.length}; with the feeling as it was at the last meeting: ${again.filter(m => m.same).length} (must be 0)`);
  const still = M.filter(m => m.still);
  const sf: Record<string, number> = {};
  for (const m of still) sf[m.k] = (sf[m.k] ?? 0) + 1;
  console.log(
    `  beside it: met again with nothing changed since the last meeting's own answer: ${still.length} (${Object.entries(sf)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ')}); the last answer was keeping away in ${still.filter(m => m.prevFam === 'withdrawal').length}`,
  );
  out.recur = { again: again.length, same: again.filter(m => m.same).length, still: still.length };
  const full = W(on).flatMap(x => x.meets.filter(m => m.t + 12 <= x.years * 12));
  const fol: Record<string, number> = {};
  for (const m of full) fol[m.followed ?? 'nothing'] = (fol[m.followed ?? 'nothing'] ?? 0) + 1;
  const followed = ci(
    W(on).map(x => {
      const ms = x.meets.filter(m => m.t + 12 <= x.years * 12);
      return pct(ms.filter(m => m.followed).length, ms.length);
    }),
  );
  console.log(
    `  something followed within a year: ${pm(followed)}% (stop under 50, line 60); pooled ${Object.entries(fol)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ')}`,
  );
  for (const k of KINDS) {
    const ms = full.filter(m => m.k === k);
    console.log(`    ${k}: ${f1(pct(ms.filter(m => m.followed).length, ms.length))}% of ${ms.length}`);
  }
  out.followed = { m: +followed.m.toFixed(2), h: +followed.h.toFixed(2) };

  console.log('\nFail-if 3: crowding out');
  const disp = ci(W(on).map(x => pct(x.displaced, x.decisions10)));
  console.log(`  decisions displaced by a meeting (first ten years): ${pm(disp, 2)}% of decisions (stop above 2)`);
  out.displaced = { m: +disp.m.toFixed(3), h: +disp.h.toFixed(3) };
  for (const [name, m] of [
    ['on − off (main)', off],
    ['on − meeting off', mt],
  ] as const) {
    console.log(`  paired ${name}, per world-decade over ${on.get(seeds[0])!.years} years:`);
    for (const k of ['births', 'deaths', 'marriages', 'splits', 'hires'] as const) {
      const a = ci(W(on).map(x => (x.demog[k] * 10) / x.years)),
        b = ci(W(m).map(x => (x.demog[k] * 10) / x.years)),
        d = ci(seeds.map(s => ((on.get(s)!.demog[k] - m.get(s)!.demog[k]) * 10) / on.get(s)!.years));
      console.log(`    ${k.padEnd(10)} on ${pm(a)}   other ${pm(b)}   paired ${pm(d)}`);
      out[`demog_${k}_${name.startsWith('on − off') ? 'main' : 'meeting'}`] = {
        on: +a.m.toFixed(2),
        other: +b.m.toFixed(2),
        d: +d.m.toFixed(2),
        dH: +d.h.toFixed(2),
      };
    }
    const ratio = (mm: Map<number, WorldOut>) =>
      W(mm).reduce((s, x) => s + x.demog.births, 0) /
      Math.max(
        1,
        W(mm).reduce((s, x) => s + x.demog.deaths, 0),
      );
    console.log(`    births over deaths: on ${f1(ratio(on), 2)}, other ${f1(ratio(m), 2)}`);
  }

  console.log("\nFail-if 4: feuds: round 44's check 4, from feel.ts (report on feelings and on meeting)");

  console.log('\nFail-if 5: a script');
  const strongR = (x: WorldOut, pick?: (e: any) => boolean) => {
    const es = x.episodes.filter(e => e.k === 'resentment' && e.v0 >= 0.3 && (!pick || pick(e)));
    return pct(es.filter(e => e.raised).length, es.length);
  };
  const raised = ci(W(on).map(x => strongR(x)));
  console.log(`  strong resentments raising a meeting within a year: ${pm(raised)}% (between 15 and 60)`);
  for (const k of ['guilt', 'gratitude']) {
    const c = ci(
      W(on).map(x => {
        const es = x.episodes.filter(e => e.k === k && e.v0 >= 0.3);
        return pct(es.filter(e => e.raised).length, es.length);
      }),
    );
    console.log(`    ${k}: ${pm(c)}%`);
  }
  out.raised = { m: +raised.m.toFixed(2), h: +raised.h.toFixed(2) };
  // Thirds of the holders, pooled over worlds: the cut points from the episodes' holders.
  const thirds = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return [s[Math.floor(s.length / 3)], s[Math.floor((2 * s.length) / 3)]];
  };
  const ER = W(on).flatMap(x => x.episodes.filter(e => e.k === 'resentment' && e.v0 >= 0.3));
  const [f1c, f2c] = thirds(ER.map(e => e.forg));
  const rate = (es: any[]) => pct(es.filter(e => e.raised).length, es.length);
  const lo = rate(ER.filter(e => e.forg <= f1c)),
    hi = rate(ER.filter(e => e.forg >= f2c));
  console.log(`  raising by forgiveness: bottom third ${f1(lo)}%, top third ${f1(hi)}%, ratio ${f1(lo / Math.max(1e-9, hi), 2)} (at least 1.3)`);
  const MR = M.filter(m => m.k === 'resentment');
  const [b1, b2] = thirds(MR.map(m => m.bold));
  const away = (ms: Meet[]) => pct(ms.filter(m => m.fam === 'withdrawal').length, ms.length);
  const blo = away(MR.filter(m => m.bold <= b1)),
    bhi = away(MR.filter(m => m.bold >= b2));
  console.log(
    `  keeping away at a resentment's meeting by social boldness: bottom third ${f1(blo)}%, top third ${f1(bhi)}%, ratio ${f1(blo / Math.max(1e-9, bhi), 2)} (at least 1.3)`,
  );
  const [g1, g2] = thirds(ER.map(e => e.bold));
  console.log(
    `  raising by social boldness: bottom third ${f1(rate(ER.filter(e => e.bold <= g1)))}%, top third ${f1(rate(ER.filter(e => e.bold >= g2)))}%`,
  );
  out.thirds = { forgLo: +lo.toFixed(2), forgHi: +hi.toFixed(2), awayLo: +blo.toFixed(2), awayHi: +bhi.toFixed(2) };
  const T = W(on)
    .map(x => x.templates!)
    .filter(Boolean);
  console.log(
    `  meeting lines at ten years: ${T.reduce((s, x) => s + x.meetLines, 0)}, in ${T.reduce((s, x) => s + x.meetTemplates, 0)} world-templates; in a world's top 25: ${T.reduce((s, x) => s + x.meetInTop, 0)}`,
  );
  console.log("  copy share and the top-25 share: round 44's check 3, from feel.ts");

  console.log('\nPower: 24 fresh worlds, the counter on its per-world sd, against the stop line');
  const sd = ci(W(on).map(x => counter(x))).sd;
  for (const n of [24, 48]) {
    const se = sd / Math.sqrt(n);
    for (const truth of [4, 3.5, 3, 2.5]) {
      // One-sided: the point estimate at or above 2.5, and the 95% lower bound above it.
      const z = (truth - 2.5) / se;
      const phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
      console.log(`  n ${n}, true ${truth}%: point ≥ 2.5 in ${f1(100 * phi(z), 0)}%; lower bound > 2.5 in ${f1(100 * phi(z - 1.714), 0)}%`);
    }
  }
  out.sd = +sd.toFixed(3);
  console.log('MEET ' + JSON.stringify(out));
} else {
  console.error('usage: meet.ts run A B [arm] [years] | report');
  process.exit(2);
}
function erf(x: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
