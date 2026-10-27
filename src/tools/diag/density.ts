// Event density and reach: how often something notable happens, how much of it the witness knows or could know, how often it leads
// to a turn, and which kinds of event produce the turns a witness could know. A diagnostic: it reads the record and changes nothing.
// It uses the consequence map's own definitions (consequence-defs.ts): a weighty event, a turn, a consequence (a weighty descendant
// within three years), reach (people in weighty descendants outside the source's own people), and the part of the model.
//   ./run.sh src/tools/diag/density.ts run A B [years]   → out-density/<seed>.json, one world each (a stopped run resumes)
//   ./run.sh src/tools/diag/density.ts report [A B]      → the tables, from the files
// Knowable, two tiers (known, could know), as consequence-defs.ts `knowable` defines them.
import '../env';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { live, type World } from '../../world';
import { knowable, TURNS, weighty, system } from '../consequence-defs';

const OUT = process.env.DENSITY_OUT ?? 'out-density';
const FOLLOW = 36; // months a source is followed, as the consequence map
type Src = { type: string; sys: string; trig: string; k: 0 | 1; c: 0 | 1; wd: 0 | 1; tu: 0 | 1; reach: number; kt: number; ct: number };
type Turn = { type: string; k: 0 | 1; c: 0 | 1; cited: string; anc: string };
type WorldOut = {
  seed: number;
  months: number;
  srcMonths: number;
  pop: number;
  witnessIn: number; // months the witness was in town
  weighty: number;
  wKnown: number;
  wCould: number;
  turns: number;
  tKnown: number;
  tCould: number;
  tWeighty: number;
  srcs: Src[];
  turnRows: Turn[];
};

function runWorld(seed: number, years: number): WorldOut {
  const w = buildWorld(seed, 1);
  const wit = pickWitness(w);
  const t0 = w.t;
  const months = Math.round(years * 12);
  let popSum = 0,
    witIn = 0;
  for (let i = 0; i < months; i++) {
    tick(w);
    popSum += live(w).length;
    if (wit.status === 'in') witIn++;
  }
  const { known, could } = knowable(w, wit.id);
  const b = (x: boolean) => (x ? 1 : 0) as 0 | 1;
  // Children by cited cause, present only (as the consequence map).
  const kids = new Map<number, number[]>();
  for (const f of w.events) {
    if (f.t < t0) continue;
    const seen = new Set<number>();
    for (const c of f.causes)
      if (c.ref != null && c.ref >= 0 && c.ref < f.id && !seen.has(c.ref)) {
        seen.add(c.ref);
        (kids.get(c.ref) ?? kids.set(c.ref, []).get(c.ref)!).push(f.id);
      }
  }
  const pres = w.events.filter(e => e.t >= t0);
  const W = pres.filter(weighty);
  const T = pres.filter(e => TURNS.has(e.type));
  // Sources: weighty events early enough to be followed for three years inside the run.
  const srcMonths = months - FOLLOW;
  const srcs: Src[] = [];
  for (const e of W) {
    if (e.t >= t0 + srcMonths) continue;
    const depth = new Set<number>([e.id]);
    const q = [e.id];
    while (q.length) {
      const id = q.shift()!;
      for (const k of kids.get(id) ?? []) {
        if (depth.has(k) || w.events[k].t > e.t + FOLLOW) continue;
        depth.add(k);
        q.push(k);
      }
    }
    depth.delete(e.id);
    const D = [...depth].map(k => w.events[k]);
    const reach = new Set<number>();
    for (const f of D) if (weighty(f)) for (const id of f.who) if (!e.who.includes(id)) reach.add(id);
    const DT = D.filter(f => TURNS.has(f.type));
    srcs.push({
      type: e.type,
      sys: system(e),
      trig: String(e.decision?.trigger ?? '-').replace(/:.*$/, ''),
      k: b(known(e)),
      c: b(could(e)),
      wd: b(D.some(weighty)),
      tu: b(DT.length > 0),
      reach: reach.size,
      kt: DT.filter(known).length,
      ct: DT.filter(could).length,
    });
  }
  // Every turn in the present: what it cites, and its nearest weighty ancestor within three years (backwards over cited causes).
  const turnRows: Turn[] = T.map(f => {
    const refs = f.causes.filter(c => c.ref != null && c.ref >= 0 && c.ref < f.id).sort((x, y) => y.weight - x.weight);
    let anc = '-';
    const seen = new Set<number>([f.id]);
    let frontier = [f.id];
    while (frontier.length && anc === '-') {
      const next: number[] = [];
      for (const id of frontier)
        for (const c of w.events[id].causes) {
          const r = c.ref;
          if (r == null || r < 0 || r >= id || seen.has(r) || w.events[r].t < f.t - FOLLOW) continue;
          seen.add(r);
          next.push(r);
        }
      const hit = next.map(i => w.events[i]).filter(weighty);
      if (hit.length) anc = hit.sort((x, y) => y.t - x.t || y.id - x.id)[0].type;
      frontier = next;
    }
    return { type: f.type, k: b(known(f)), c: b(could(f)), cited: refs.length ? w.events[refs[0].ref!].type : '-', anc };
  });
  return {
    seed,
    months,
    srcMonths,
    pop: popSum / months,
    witnessIn: witIn,
    weighty: W.length,
    wKnown: W.filter(known).length,
    wCould: W.filter(could).length,
    turns: T.length,
    tKnown: T.filter(known).length,
    tCould: T.filter(could).length,
    tWeighty: T.filter(weighty).length,
    srcs,
    turnRows,
  };
}

const mean = (v: number[]) => v.reduce((a, x) => a + x, 0) / Math.max(1, v.length);
const tq = (n: number) =>
  [0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09][n - 1] ?? 2.05;
const ci = (v: number[], d = 2) => {
  const m = mean(v);
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1));
  return `${m.toFixed(d)} ±${((tq(v.length) * sd) / Math.sqrt(v.length)).toFixed(d)}`;
};
const pct = (x: number) => `${(100 * x).toFixed(0)}%`;

if (process.argv[2] === 'run') {
  mkdirSync(OUT, { recursive: true });
  const [A, B, Y] = [+process.argv[3], +(process.argv[4] ?? process.argv[3]), +(process.argv[5] ?? 8)];
  for (let seed = A; seed <= B; seed++) {
    const f = `${OUT}/${seed}.json`;
    if (existsSync(f)) continue;
    writeFileSync(f, JSON.stringify(runWorld(seed, Y)));
    console.error(`density: world ${seed}`);
  }
} else {
  const [A, B] = [+(process.argv[3] ?? 0), +(process.argv[4] ?? 1e9)];
  const all: WorldOut[] = readdirSync(OUT)
    .filter(f => /^\d+\.json$/.test(f))
    .map(f => JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')) as WorldOut)
    .filter(x => x.seed >= A && x.seed <= B)
    .sort((a, b) => a.seed - b.seed);
  const per100 = (x: WorldOut, n: number) => (100 * n) / x.pop / x.months;
  const perWeek = (x: WorldOut, n: number) => n / x.months / (52 / 12);
  console.log(
    `${all.length} worlds (${all[0]?.seed}–${all[all.length - 1]?.seed}) · ${all[0]?.months} present months · town ${ci(
      all.map(x => x.pop),
      0,
    )} people (all ages, mean over months) · witness in town ${pct(mean(all.map(x => x.witnessIn / x.months)))} of months`,
  );
  console.log(`\nper world: seed, people, weighty / 100 people / month (known, could know), turns / 100 / month (known, could know)`);
  for (const x of all)
    console.log(
      `  ${x.seed}  ${x.pop.toFixed(0).padStart(4)}  ${per100(x, x.weighty).toFixed(2).padStart(6)} (${per100(x, x.wKnown).toFixed(2)}, ${per100(x, x.wCould).toFixed(2)})  ${per100(x, x.turns).toFixed(2).padStart(6)} (${per100(x, x.tKnown).toFixed(2)}, ${per100(x, x.tCould).toFixed(2)})${x.witnessIn < x.months ? `  witness gone after ${x.witnessIn} months` : ''}`,
    );
  console.log(`\nper 100 people per month, mean ±95% interval over worlds`);
  console.log(`  1. weighty events                       ${ci(all.map(x => per100(x, x.weighty)))}`);
  console.log(`  2. weighty, the witness knows           ${ci(all.map(x => per100(x, x.wKnown)))}`);
  console.log(`     weighty, the witness could know      ${ci(all.map(x => per100(x, x.wCould)))}`);
  console.log(`  3. turns                                ${ci(all.map(x => per100(x, x.turns)))}`);
  console.log(`     turns, the witness knows             ${ci(all.map(x => per100(x, x.tKnown)))}`);
  console.log(`     turns, the witness could know        ${ci(all.map(x => per100(x, x.tCould)))}`);
  console.log(`     turns that are themselves weighty    ${ci(all.map(x => per100(x, x.tWeighty)))}`);
  const srcRate = (x: WorldOut, f: (s: Src) => boolean) => (100 * x.srcs.filter(f).length) / x.pop / x.srcMonths;
  console.log(
    `     weighty events that lead to a turn   ${ci(all.map(x => srcRate(x, s => s.tu === 1)))}  (sources in the first ${all[0]?.srcMonths} months)`,
  );
  console.log(`       … to a turn the witness knows      ${ci(all.map(x => srcRate(x, s => s.kt > 0)))}`);
  console.log(`       … to a turn it could know          ${ci(all.map(x => srcRate(x, s => s.ct > 0)))}`);
  console.log(`\n4. per week, in a town of ${mean(all.map(x => x.pop)).toFixed(0)} (Overstory's unit: notable = weighty)`);
  console.log(`  weighty events                          ${ci(all.map(x => perWeek(x, x.weighty)))}`);
  console.log(`  weighty, the witness knows              ${ci(all.map(x => perWeek(x, x.wKnown)))}`);
  console.log(`  weighty, the witness could know         ${ci(all.map(x => perWeek(x, x.wCould)))}`);
  console.log(`  turns, the witness knows                ${ci(all.map(x => perWeek(x, x.tKnown)))}`);
  console.log(`  turns, the witness could know           ${ci(all.map(x => perWeek(x, x.tCould)))}`);
  const TR = all.flatMap(x => x.turnRows);
  const Kc = TR.filter(t => t.c);
  console.log(
    `\nturns the witness could know (${Kc.length}): cite an event ${pct(mean(Kc.map(t => +(t.cited !== '-'))))}, have a weighty ancestor within three years ${pct(mean(Kc.map(t => +(t.anc !== '-'))))}`,
  );
  const group = <T>(rows: T[], key: (r: T) => string) => {
    const g = new Map<string, T[]>();
    for (const r of rows) (g.get(key(r)) ?? g.set(key(r), []).get(key(r))!).push(r);
    return g;
  };
  const tops = (key: (t: Turn) => string, title: string) => {
    console.log(`\n${title}`);
    for (const [k, v] of [...group(Kc, key)].sort((a, b) => b[1].length - a[1].length).slice(0, 15))
      console.log(`  ${k.padEnd(28)}${String(v.length).padStart(6)}${pct(v.length / Kc.length).padStart(6)}   known ${pct(mean(v.map(t => t.k)))}`);
  };
  tops(t => t.type, 'turns the witness could know, by their own kind');
  tops(t => t.anc, 'turns the witness could know, by the kind of their nearest weighty ancestor (- = none within three years)');
  const S = all.flatMap(x => x.srcs);
  const people = all.reduce((s, x) => s + x.pop * x.srcMonths, 0) / 100; // 100-person-months of sources
  const table = (key: (s: Src) => string, min: number, title: string) => {
    console.log(`\n${title} (at least ${min} sources), ranked by turns the witness could know that descend from them, per 100 people a month`);
    console.log(
      `  ${'kind'.padEnd(24)}${'n'.padStart(6)}${'/100/mo'.padStart(9)}${'known'.padStart(7)}${'conseq'.padStart(8)}${'turn'.padStart(6)}${'reach'.padStart(7)}${'mean'.padStart(6)}${'k-turn'.padStart(8)}${'c-turns'.padStart(9)}${'/100/mo'.padStart(9)}`,
    );
    const rows = [...group(S, key)].filter(([, v]) => v.length >= min);
    rows.sort((a, b) => b[1].reduce((s, r) => s + r.ct, 0) - a[1].reduce((s, r) => s + r.ct, 0));
    for (const [k, v] of rows) {
      const ct = v.reduce((s, r) => s + r.ct, 0);
      console.log(
        `  ${k.slice(0, 23).padEnd(24)}${String(v.length).padStart(6)}${(v.length / people).toFixed(2).padStart(9)}${pct(mean(v.map(r => r.k))).padStart(7)}${pct(mean(v.map(r => r.wd))).padStart(8)}${pct(mean(v.map(r => r.tu))).padStart(6)}${pct(mean(v.map(r => +(r.reach > 0)))).padStart(7)}${mean(
          v.map(r => r.reach),
        )
          .toFixed(1)
          .padStart(6)}${pct(mean(v.map(r => +(r.kt > 0)))).padStart(8)}${String(ct).padStart(9)}${(ct / people).toFixed(3).padStart(9)}`,
      );
    }
  };
  console.log(
    `\nColumns: n sources; their rate; known = the witness knows the source; conseq = has a weighty descendant within three years; turn = has a turn among its descendants; reach = a weighty descendant involves someone outside the source's people, and mean = how many such people; k-turn = has a descendant turn the witness knows; c-turns = descendant turns the witness could know (a turn descending from two sources counts for each).`,
  );
  table(s => s.sys, 30, 'By part of the model');
  table(s => s.trig, 30, 'By situation (decision trigger; - = no decision)');
  table(s => s.type, 30, 'By kind of event');
  console.log(
    `\nDENSITY ${JSON.stringify({
      worlds: all.length,
      pop: +mean(all.map(x => x.pop)).toFixed(1),
      weighty: +mean(all.map(x => per100(x, x.weighty))).toFixed(3),
      weightyKnown: +mean(all.map(x => per100(x, x.wKnown))).toFixed(3),
      weightyCould: +mean(all.map(x => per100(x, x.wCould))).toFixed(3),
      turns: +mean(all.map(x => per100(x, x.turns))).toFixed(3),
      turnsKnown: +mean(all.map(x => per100(x, x.tKnown))).toFixed(3),
      turnsCould: +mean(all.map(x => per100(x, x.tCould))).toFixed(3),
    })}`,
  );
}
