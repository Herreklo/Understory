// Friends: close friendship kept up, or lost. Same seeds under each rule (on; nobudget = OFF=budget; or any switches joined by '+'); adults at the end of ten present years.
//   tsx src/tools/friends.ts run A B <on|off> → out-friends/<rule>-A-B.json ;  tsx src/tools/friends.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { OFF, live, age, bkA, bkB, type World } from '../world';
const OUT = process.env.FRIENDS_OUT ?? 'out-friends';
mkdirSync(OUT, { recursive: true });
type R = {
  counts: number[];
  made: number;
  ended: number;
  adultYears: number;
  start: number;
  startEnded: number;
  reasons: Record<string, number>;
  lines: number;
  strainLow: number;
  top5: number[];
  young: number[];
  dislike?: number;
  births: number;
  deaths: number;
  pop: number;
};
const inTown = (w: World, id: number) => w.byId.get(id)?.status === 'in';
function pairsNow(w: World) {
  const s = new Set<string>();
  for (const p of live(w)) for (const id of p.friends) if (inTown(w, id) && id > p.id) s.add(`${p.id}-${id}`);
  return s;
}
if (process.argv[2] === 'run') {
  const A = +process.argv[3],
    B = +process.argv[4],
    rule = process.argv[5] ?? 'on';
  const out: { seed: number; r: R }[] = [];
  for (let seed = A; seed <= B; seed++) {
    if (existsSync(`${OUT}/${rule}-${seed}-${seed}.json`)) continue; // done before: a stopped run resumes where it was
    OFF.clear();
    if (rule === 'nobudget') OFF.add('budget');
    else if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
    const w = buildWorld(seed, 1);
    pickWitness(w);
    const n0 = w.events.length;
    const start = pairsNow(w);
    const contact = new Map<number, number>();
    let last = false;
    const per = new Map<number, Map<number, number>>();
    w.hooks.contact = (_w, a, b, i) => {
      contact.set(a.id, (contact.get(a.id) ?? 0) + i);
      contact.set(b.id, (contact.get(b.id) ?? 0) + i);
      if (last)
        for (const [x, y] of [
          [a, b],
          [b, a],
        ]) {
          const m = per.get(x.id) ?? per.set(x.id, new Map()).get(x.id)!;
          m.set(y.id, (m.get(y.id) ?? 0) + i);
        }
    };
    runYears(w, 9);
    last = true;
    runYears(w, 1);
    OFF.clear();
    const E = w.events.slice(n0);
    const adults = live(w).filter(p => age(w, p) >= 18);
    const end = pairsNow(w);
    let startEnded = 0,
      startBoth = 0;
    for (const k of start) {
      const [a, b] = k.split('-').map(Number);
      if (!inTown(w, a) || !inTown(w, b)) continue;
      startBoth++;
      if (!end.has(k)) startEnded++;
    }
    const reasons: Record<string, number> = {};
    const f = E.filter(e => e.type === 'friends');
    for (const e of f)
      for (const c of e.causes) {
        const k = c.label
          .replace(/@\d+/g, '@')
          .replace(/ at .*$/, ' at …')
          .replace(/both live for .*/, 'both live for …')
          .replace(/\(\d{4}\)$/, '(year)');
        reasons[k] = (reasons[k] ?? 0) + 1;
      }
    // Friendships ended: every pair that was friends at some month and is not at the end, counted by the 'cooled' events plus quiet displacements: measured as made + start − end.
    const ended = f.length + start.size - end.size; // pairs that left town or died are included; reported alongside
    const low = adults
      .slice()
      .sort((a, b) => (contact.get(a.id) ?? 0) - (contact.get(b.id) ?? 0))
      .slice(0, Math.max(1, Math.floor(adults.length / 10)));
    out.push({
      seed,
      r: {
        counts: adults.map(p => [...p.friends].filter(id => inTown(w, id)).length),
        made: f.length,
        ended,
        adultYears: adults.length * 10,
        start: startBoth,
        startEnded,
        reasons,
        lines: f.length,
        strainLow: low.reduce((s, p) => s + p.stress, 0) / low.length,
        dislike: (() => {
          let n = 0,
            d = 0;
          for (const [k, b] of w.bonds) {
            if (b.fam <= 0.3) continue;
            const a1 = w.byId.get(bkA(w, k)),
              b1 = w.byId.get(bkB(w, k));
            if (!a1 || !b1 || a1.status !== 'in' || b1.status !== 'in' || age(w, a1) < 18 || age(w, b1) < 18) continue;
            n++;
            if (b.like < -0.2) d++;
          }
          return d / Math.max(1, n);
        })(),
        young: adults.filter(p => age(w, p) < 30).map(p => [...p.friends].filter(id => inTown(w, id)).length),
        top5: adults
          .filter(p => age(w, p) <= 70)
          .map(p => {
            const v = [...(per.get(p.id)?.values() ?? [])].sort((a, b) => b - a);
            const t = v.reduce((a, b) => a + b, 0);
            return t ? v.slice(0, 5).reduce((a, b) => a + b, 0) / t : NaN;
          })
          .filter(x => isFinite(x)),
        births: E.filter(e => e.type === 'born').length,
        deaths: E.filter(e => e.type === 'death').length,
        pop: live(w).length,
      },
    });
    writeFileSync(`${OUT}/${rule}-${seed}-${seed}.json`, JSON.stringify([out[out.length - 1]]));
    console.error(`friends ${rule}: world ${seed}`);
  }
  // Each world was written when it was done.
} else {
  const load = (rule: string) => {
    const m = new Map<number, R>();
    for (const f of readdirSync(OUT).filter(f => f.startsWith(rule + '-')))
      for (const x of JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'))) m.set(x.seed, x.r);
    return m;
  };
  const RA = process.argv[3] ?? 'on',
    RB = process.argv[4] ?? 'nobudget';
  const on = load(RA),
    off = load(RB);
  const seeds = [...on.keys()].filter(s => off.has(s)).sort((a, b) => a - b);
  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  const T = (n: number) =>
    [0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09][n - 1] ?? 2.05;
  const ci = (v: number[], d = 2) => {
    const m = mean(v);
    const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1));
    return `${m.toFixed(d)} ±${((T(v.length) * sd) / Math.sqrt(v.length)).toFixed(d)}`;
  };
  const q = (v: number[], x: number) => {
    const s = v.slice().sort((a, b) => a - b);
    return s[Math.floor(x * (s.length - 1))];
  };
  console.log(`${seeds.length} worlds · adults at the end of ten present years · on / nobudget (OFF=budget)`);
  for (const [name, m] of [
    [RA, on],
    [RB, off],
  ] as const) {
    const all = seeds.flatMap(s => m.get(s)!.counts);
    const reasons: Record<string, number> = {};
    let lines = 0;
    for (const s of seeds) {
      lines += m.get(s)!.lines;
      for (const [k, n] of Object.entries(m.get(s)!.reasons)) reasons[k] = (reasons[k] ?? 0) + n;
    }
    const top = Object.entries(reasons).sort((a, b) => b[1] - a[1]);
    console.log(
      `  ${name}: close friends in town per adult: median ${q(all, 0.5)}, top tenth ${q(all, 0.9)}, most ${Math.max(...all)}, none ${((100 * all.filter(x => x === 0).length) / all.length).toFixed(0)}%`,
    );
    console.log(
      `      made per adult a year ${ci(seeds.map(s => (2 * m.get(s)!.made) / m.get(s)!.adultYears))} · ended per adult a year ${ci(seeds.map(s => (2 * m.get(s)!.ended) / m.get(s)!.adultYears))} · of year-0 friendships with both in town at 10, ended ${(
        (100 * seeds.reduce((a, s) => a + m.get(s)!.startEnded, 0)) /
        Math.max(
          1,
          seeds.reduce((a, s) => a + m.get(s)!.start, 0),
        )
      ).toFixed(0)}% of ${seeds.reduce((a, s) => a + m.get(s)!.start, 0)}`,
    );
    console.log(
      `      friendship lines ${lines}; reasons: ${top
        .slice(0, 6)
        .map(([k, n]) => `${k} ${((100 * n) / Math.max(1, lines)).toFixed(0)}%`)
        .join(' · ')}`,
    );
    console.log(
      `      familiar pairs where one dislikes the other: ${((100 * seeds.reduce((a, s) => a + (m.get(s)!.dislike ?? 0), 0)) / seeds.length).toFixed(1)}%`,
    );
    const yg = seeds.flatMap(s => m.get(s)!.young ?? []);
    if (yg.length)
      console.log(`      aged 18–29 with no friend in town: ${((100 * yg.filter(x => x === 0).length) / yg.length).toFixed(0)}% of ${yg.length}`);
    const t5 = seeds.flatMap(s => m.get(s)!.top5 ?? []);
    if (t5.length) console.log(`      share of contact to the top five (last year, adults to 70): median ${(100 * q(t5, 0.5)).toFixed(0)}%`);
    console.log(
      `      strain, least-contacted tenth ${ci(seeds.map(s => m.get(s)!.strainLow))} · births ÷ deaths ${ci(seeds.map(s => m.get(s)!.births / Math.max(1, m.get(s)!.deaths)))} · population ${ci(
        seeds.map(s => m.get(s)!.pop),
        1,
      )}`,
    );
  }
  console.log(`  paired, on − off: strain of the least-contacted tenth ${ci(seeds.map(s => on.get(s)!.strainLow - off.get(s)!.strainLow))}`);
}
