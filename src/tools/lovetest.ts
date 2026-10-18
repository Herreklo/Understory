// Round 20 test: ways of loving and fighting. Same seeds under each rule (on; off = OFF=love; nocontempt = OFF=contempt).
//   tsx src/tools/lovetest.ts run A B <rule> → out-love/<rule>-A-B.json ;  tsx src/tools/lovetest.ts report [ruleA ruleB ruleC]
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld } from '../build';
import { tick } from '../life';
import { pickWitness } from '../witness';
import { OFF, live, age, type World, type Person } from '../world';
import { loving, attachmentWord } from '../love';
const OUT = process.env.LOVE_OUT ?? 'out-love';
mkdirSync(OUT, { recursive: true });

type Couple = {
  months: number;
  marriedMonths: number;
  marriedAfterContempt: number;
  rows: number;
  slides: number;
  contemptAt: number | null;
  ended: string | null;
  endedAfterContempt: boolean;
  care: number;
};
type R = {
  shares: Record<string, number>;
  adults: number;
  corr: { anxN: number; avoidSoc: number; anxAvoid: number; anxAge: number };
  partedGap: number | null;
  partedN: number;
  divorces: number;
  marriedYears: number;
  splits: number;
  datingYears: number;
  hazard: { cDiv: number; cYears: number; nDiv: number; nYears: number };
  rowsPerYear: number[];
  starts: Record<string, number>;
  answers: Record<string, number>;
  repairs: { landedHi: number; nHi: number; landedLo: number; nLo: number };
  pub: number;
  rowsAll: number;
  thinking?: [number, number];
  persist?: [number, number];
  stays: number;
  endits: number;
  quiet: number;
  early: number;
  divYears: number[];
  learnHi: [number, number];
  learnLo: [number, number];
  distEnd: number[];
  careActs: number;
  careLines: number;
  patterns: Record<string, number>;
  single25: number;
  n25: number;
  births: number;
  pop: number;
};
const corr = (x: number[], y: number[]) => {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n,
    my = y.reduce((a, b) => a + b, 0) / n;
  let c = 0,
    sx = 0,
    sy = 0;
  for (let i = 0; i < n; i++) {
    c += (x[i] - mx) * (y[i] - my);
    sx += (x[i] - mx) ** 2;
    sy += (y[i] - my) ** 2;
  }
  return c / Math.sqrt(sx * sy || 1);
};
const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

function partedYoung(w: World, p: Person) {
  const ps = p.parents.map(id => w.byId.get(id)).filter((q): q is Person => !!q);
  return (
    ps.length === 2 &&
    w.events.some(
      e =>
        (e.type === 'divorce' || e.type === 'split') &&
        e.who.includes(ps[0].id) &&
        e.who.includes(ps[1].id) &&
        e.t >= p.born &&
        (e.t - p.born) / 12 < 16,
    )
  );
}

if (process.argv[2] === 'run') {
  const A = +process.argv[3],
    B = +process.argv[4],
    rule = process.argv[5] ?? 'on';
  const out: { seed: number; r: R }[] = [];
  for (let seed = A; seed <= B; seed++) {
    OFF.clear();
    if (rule === 'off') OFF.add('love');
    else if (rule === 'nocontempt') OFF.add('contempt');
    else if (rule === 'r20') for (const x of ['friction', 'couplelearn', 'disengage', 'leaving']) OFF.add(x);
    else if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
    const w = buildWorld(seed, 1);
    pickWitness(w);
    const t0 = w.t;
    const n0 = w.events.length;
    const log: any[] = [];
    (w as any).loveLog = log;
    const C = new Map<string, Couple>();
    const get = (k: string) =>
      C.get(k) ??
      C.set(k, {
        months: 0,
        marriedMonths: 0,
        marriedAfterContempt: 0,
        rows: 0,
        slides: 0,
        contemptAt: null,
        ended: null,
        endedAfterContempt: false,
        care: 0,
      }).get(k)!;
    let seenLog = 0;
    for (let m = 0; m < 120; m++) {
      tick(w);
      for (; seenLog < log.length; seenLog++) {
        const x = log[seenLog];
        if (x.stay != null || x.doubt != null) continue;
        const c = get(key(x.a, x.b));
        if (x.care) {
          c.care++;
          continue;
        }
        if (x.s === 'letslide') c.slides++;
        else c.rows++;
        if ((x.s === 'contempt' || x.r === 'contempt') && c.contemptAt == null) c.contemptAt = w.t;
      }
      for (const p of live(w)) {
        if (p.partner == null || p.id > p.partner) continue;
        const q = w.byId.get(p.partner)!;
        if (q.status !== 'in') continue;
        const c = get(key(p.id, q.id));
        c.months++;
        if (p.pstat === 'married') {
          c.marriedMonths++;
          if (c.contemptAt != null) c.marriedAfterContempt++;
        }
      }
    }
    const E = w.events.slice(n0);
    let divorces = 0,
      splits = 0;
    const hz = { cDiv: 0, cYears: 0, nDiv: 0, nYears: 0 };
    for (const e of E)
      if (e.type === 'divorce' || e.type === 'split') {
        const c = get(key(e.who[0], e.who[1]));
        c.ended = e.type;
        c.endedAfterContempt = c.contemptAt != null && c.contemptAt <= e.t;
        if (e.type === 'divorce') divorces++;
        else splits++;
      }
    let marriedYears = 0,
      datingYears = 0;
    for (const c of C.values()) {
      marriedYears += c.marriedMonths / 12;
      datingYears += (c.months - c.marriedMonths) / 12;
      hz.cYears += c.marriedAfterContempt / 12;
      hz.nYears += (c.marriedMonths - c.marriedAfterContempt) / 12;
      if (c.ended === 'divorce') {
        if (c.endedAfterContempt) hz.cDiv++;
        else hz.nDiv++;
      }
    }
    const adults = live(w).filter(p => age(w, p) >= 18);
    const shares: Record<string, number> = { secure: 0, anxious: 0, avoidant: 0, fearful: 0 };
    for (const p of adults) shares[attachmentWord(loving(w, p))]++;
    const Ls = adults.map(p => loving(w, p));
    const parted = adults.filter(p => partedYoung(w, p)),
      rest = adults.filter(p => !partedYoung(w, p));
    const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
    const starts: Record<string, number> = {},
      answers: Record<string, number> = {};
    const rep = { landedHi: 0, nHi: 0, landedLo: 0, nLo: 0 };
    let pub = 0,
      rowsAll = 0;
    let stays = 0,
      endits = 0;
    const learnHi: [number, number] = [0, 0],
      learnLo: [number, number] = [0, 0];
    const thinking: [number, number] = [0, 0],
      persist: [number, number] = [0, 0];
    const dmap = new Map<string, number>();
    for (const x of log)
      if (x.doubt != null) {
        thinking[1]++;
        if (x.doubt > 0.3) thinking[0]++;
        const k0 = `${x.a}>${x.b}`;
        const prev = dmap.get(k0 + '@' + (x.t - 12));
        if (prev != null && prev > 0.3) {
          persist[1]++;
          if (x.doubt <= 0.3) persist[0]++;
        }
        dmap.set(k0 + '@' + x.t, x.doubt);
      }
    for (const x of log) {
      if (x.care || x.doubt != null) continue;
      if (x.stay != null) {
        stays++;
        if (x.stay === 'endit') endits++;
        continue;
      }
      rowsAll++;
      if (x.goodBefore != null && x.goodBefore + x.badBefore > 0.4) {
        const L = x.goodBefore > x.badBefore ? learnHi : learnLo;
        L[1]++;
        if (x.s === 'soften') L[0]++;
      }
      starts[x.s] = (starts[x.s] ?? 0) + 1;
      if (x.r != null) answers[x.r || 'none'] = (answers[x.r || 'none'] ?? 0) + 1;
      if (x.pub) pub++;
    }
    for (const x of log)
      if (x.landed != null) {
        if (x.liked > 0.4) {
          rep.nHi++;
          if (x.landed) rep.landedHi++;
        } else if (x.liked < 0.1) {
          rep.nLo++;
          if (x.landed) rep.landedLo++;
        }
      }
    const patterns: Record<string, number> = {};
    for (const e of E)
      if (e.type === 'couple:pattern') {
        const k = e.text.replace(/@\d+/g, '@').slice(0, 40);
        patterns[k] = (patterns[k] ?? 0) + 1;
      }
    // Endings: how long married, and whether it ended quietly (drifted apart, at most one row in the two years before).
    let quiet = 0,
      early = 0;
    const divYears: number[] = [];
    for (const e of E)
      if (e.type === 'divorce') {
        const k = key(e.who[0], e.who[1]);
        const rows2 = log.filter(
          x => !x.care && x.stay == null && x.doubt == null && key(x.a, x.b) === k && x.t <= e.t && e.t - x.t <= 24 && x.s !== 'letslide',
        ).length;
        const st = log.filter(x => x.stay != null && key(x.a, x.b) === k && x.t <= e.t).at(-1);
        const married = w.events.filter(m => m.type === 'married' && key(m.who[0], m.who[1]) === k && m.t <= e.t).at(-1);
        const yrs = married ? (e.t - married.t) / 12 : NaN;
        if (isFinite(yrs)) {
          divYears.push(yrs);
          if (yrs < 7) early++;
        }
        if (st && st.distance > 0.5 && rows2 <= 1) quiet++;
      }
    const distEnd: number[] = [];
    for (const p of live(w))
      if (p.partner != null && p.id < p.partner && p.pstat === 'married') {
        const c = (p as any)['cs:' + p.partner];
        if (c) distEnd.push(c.distance);
      }
    const a25 = live(w).filter(p => age(w, p) >= 25);
    out.push({
      seed,
      r: {
        shares,
        adults: adults.length,
        corr: {
          anxN: corr(
            Ls.map(l => l.anxiety),
            adults.map(p => p.facets.anxiety),
          ),
          avoidSoc: corr(
            Ls.map(l => l.avoidance),
            adults.map(p => p.facets.sociability),
          ),
          anxAvoid: corr(
            Ls.map(l => l.anxiety),
            Ls.map(l => l.avoidance),
          ),
          anxAge: corr(
            Ls.map(l => l.anxiety),
            adults.map(p => age(w, p)),
          ),
        },
        partedGap: parted.length >= 2 ? mean(parted.map(p => loving(w, p).anxiety)) - mean(rest.map(p => loving(w, p).anxiety)) : null,
        partedN: parted.length,
        divorces,
        marriedYears,
        splits,
        datingYears,
        hazard: hz,
        rowsPerYear: [...C.values()].filter(c => c.months >= 12).map(c => c.rows / (c.months / 12)),
        starts,
        answers,
        repairs: rep,
        pub,
        rowsAll,
        stays,
        endits,
        quiet,
        early,
        divYears,
        learnHi,
        learnLo,
        distEnd,
        thinking,
        persist,
        careActs: [...C.values()].reduce((s, c) => s + c.care, 0),
        careLines: E.filter(e => e.type === 'care').length,
        patterns,
        single25: a25.filter(p => p.partner == null).length,
        n25: a25.length,
        births: E.filter(e => e.type === 'born').length,
        pop: live(w).length,
      },
    });
    OFF.clear();
    console.error(`love ${rule}: world ${seed}`);
  }
  writeFileSync(`${OUT}/${rule}-${A}-${B}.json`, JSON.stringify(out));
} else {
  const load = (rule: string) => {
    const m = new Map<number, R>();
    for (const f of readdirSync(OUT).filter(f => f.startsWith(rule + '-')))
      for (const x of JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'))) m.set(x.seed, x.r);
    return m;
  };
  const rules = process.argv.slice(3).length ? process.argv.slice(3) : ['on', 'off', 'nocontempt'];
  const ms = rules.map(load);
  const seeds = [...ms[0].keys()].filter(s => ms.every(m => m.has(s))).sort((a, b) => a - b);
  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  const T = (n: number) =>
    [0, 12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09][n - 1] ?? 2.02;
  const ci = (v: number[], d = 2) => {
    const m = mean(v);
    const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1));
    return `${m.toFixed(d)} ±${((T(v.length) * sd) / Math.sqrt(v.length)).toFixed(d)}`;
  };
  const q = (v: number[], x: number) => {
    const s = v.slice().sort((a, b) => a - b);
    return s[Math.floor(x * (s.length - 1))] ?? 0;
  };
  const sum = (m: Map<number, R>, f: (r: R) => number) => seeds.reduce((s, k) => s + f(m.get(k)!), 0);
  // Interval for a ratio of rates by resampling worlds (bootstrap over worlds, fixed seed).
  let bs = 12345;
  const rnd = () => {
    bs = (bs * 1103515245 + 12345) & 0x7fffffff;
    return bs / 0x7fffffff;
  };
  const boot = (f: (ks: number[]) => number) => {
    const v: number[] = [];
    for (let i = 0; i < 2000; i++) {
      const ks = seeds.map(() => seeds[Math.floor(rnd() * seeds.length)]);
      const x = f(ks);
      if (isFinite(x)) v.push(x);
    }
    v.sort((a, b) => a - b);
    return [v[Math.floor(0.025 * v.length)], v[Math.floor(0.975 * v.length)]];
  };
  console.log(`${seeds.length} worlds · ten present years · ${rules.join(' / ')}`);
  for (const [i, m] of ms.entries()) {
    const name = rules[i];
    const tot = sum(m, r => r.adults);
    const sh = (k: string) => ((100 * sum(m, r => r.shares[k] ?? 0)) / tot).toFixed(0) + '%';
    console.log(`\n== ${name}`);
    console.log(
      `  attachment at the end (adults ${tot}): secure ${sh('secure')}, anxious ${sh('anxious')}, avoidant ${sh('avoidant')}, fearful ${sh('fearful')}`,
    );
    console.log(
      `  corr: attachment anxiety–anxiety facet ${ci(seeds.map(s => m.get(s)!.corr.anxN))} · avoidance–sociability ${ci(seeds.map(s => m.get(s)!.corr.avoidSoc))} · anxiety–avoidance ${ci(seeds.map(s => m.get(s)!.corr.anxAvoid))} · anxiety–age ${ci(seeds.map(s => m.get(s)!.corr.anxAge))}`,
    );
    const pg = seeds
      .map(s => m.get(s)!)
      .filter(r => r.partedGap != null)
      .map(r => r.partedGap!);
    console.log(
      `  parents parted before 16: ${sum(m, r => r.partedN)} adults; anxiety gap over the rest ${pg.length ? ci(pg) : 'n/a'} (${pg.length} worlds with two or more)`,
    );
    const dr = (ks: number[]) => (100 * ks.reduce((s, k) => s + m.get(k)!.divorces, 0)) / ks.reduce((s, k) => s + m.get(k)!.marriedYears, 0);
    const [dlo, dhi] = boot(dr);
    console.log(
      `  divorce: ${sum(m, r => r.divorces)} in ${sum(m, r => r.marriedYears).toFixed(0)} married couple-years = ${dr(seeds).toFixed(2)}% a year [${dlo.toFixed(2)}, ${dhi.toFixed(2)}] · dating splits ${sum(m, r => r.splits)} in ${sum(m, r => r.datingYears).toFixed(0)} = ${((100 * sum(m, r => r.splits)) / sum(m, r => r.datingYears)).toFixed(1)}% a year`,
    );
    const hr = (ks: number[]) => {
      const g = (f: (r: R) => number) => ks.reduce((s, k) => s + f(m.get(k)!), 0);
      return g(r => r.hazard.cDiv) / g(r => r.hazard.cYears) / (g(r => r.hazard.nDiv) / g(r => r.hazard.nYears));
    };
    const [hlo, hhi] = boot(hr);
    console.log(
      `  after contempt: ${sum(m, r => r.hazard.cDiv)} divorces in ${sum(m, r => r.hazard.cYears).toFixed(0)} married years; without: ${sum(m, r => r.hazard.nDiv)} in ${sum(m, r => r.hazard.nYears).toFixed(0)}; ratio ${hr(seeds).toFixed(2)} [${hlo?.toFixed(2)}, ${hhi?.toFixed(2)}]`,
    );
    const rpy = seeds.flatMap(s => m.get(s)!.rowsPerYear);
    console.log(
      `  rows per couple-year (couples together a year or more, ${rpy.length}): median ${q(rpy, 0.5).toFixed(2)}, top tenth ${q(rpy, 0.9).toFixed(2)}, none ${((100 * rpy.filter(x => x === 0).length) / Math.max(1, rpy.length)).toFixed(0)}%`,
    );
    const st: Record<string, number> = {},
      an: Record<string, number> = {};
    for (const s of seeds) {
      for (const [k, v] of Object.entries(m.get(s)!.starts)) st[k] = (st[k] ?? 0) + v;
      for (const [k, v] of Object.entries(m.get(s)!.answers)) an[k] = (an[k] ?? 0) + v;
    }
    const fmt = (o: Record<string, number>) => {
      const t = Object.values(o).reduce((a, b) => a + b, 0);
      return Object.entries(o)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k} ${((100 * v) / t).toFixed(0)}%`)
        .join(', ');
    };
    console.log(
      `  starts: ${fmt(st)} · answers: ${fmt(an)} · in company ${(
        (100 * sum(m, r => r.pub)) /
        Math.max(
          1,
          sum(m, r => r.rowsAll),
        )
      ).toFixed(0)}%`,
    );
    console.log(
      `  repairs that landed: when liked (> 0.4) ${sum(m, r => r.repairs.landedHi)}/${sum(m, r => r.repairs.nHi)}, when not (< 0.1) ${sum(m, r => r.repairs.landedLo)}/${sum(m, r => r.repairs.nLo)}`,
    );
    console.log(
      `  care: ${(
        sum(m, r => r.careActs) /
        Math.max(
          1,
          sum(m, r => r.marriedYears + r.datingYears),
        )
      ).toFixed(
        2,
      )} acts per couple-year, ${(sum(m, r => r.careLines) / seeds.length).toFixed(1)} lines per world · patterns per world ${(seeds.reduce((s, k) => s + Object.values(m.get(k)!.patterns).reduce((a, b) => a + b, 0), 0) / seeds.length).toFixed(1)}`,
    );
    const pt: Record<string, number> = {};
    for (const s of seeds) for (const [k, v] of Object.entries(m.get(s)!.patterns)) pt[k] = (pt[k] ?? 0) + v;
    if (Object.keys(pt).length)
      console.log(
        `    ${Object.entries(pt)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `"${k}…" ${v}`)
          .join(' · ')}`,
      );
    {
      const th = seeds.reduce((a, k) => [a[0] + (m.get(k)!.thinking?.[0] ?? 0), a[1] + (m.get(k)!.thinking?.[1] ?? 0)], [0, 0]),
        pe = seeds.reduce((a, k) => [a[0] + (m.get(k)!.persist?.[0] ?? 0), a[1] + (m.get(k)!.persist?.[1] ?? 0)], [0, 0]);
      if (th[1])
        console.log(
          `  thinking about leaving (doubt above 0.3), married partners sampled yearly: ${((100 * th[0]) / th[1]).toFixed(0)}% of ${th[1]} · of those thinking about it, no longer a year later: ${((100 * pe[0]) / Math.max(1, pe[1])).toFixed(0)}% of ${pe[1]}`,
        );
    }
    if (sum(m, r => r.stays ?? 0))
      console.log(
        `  whether to stay: ${sum(m, r => r.stays)} decisions, ${sum(m, r => r.endits)} ended it · divorces after under seven years married ${sum(m, r => r.early)} of ${sum(m, r => (r.divYears ?? []).length)}, quiet endings (drifted apart, at most one row in the two years before) ${sum(m, r => r.quiet ?? 0)} of ${sum(m, r => r.divorces)}`,
      );
    {
      const H = seeds.reduce((a, k) => [a[0] + (m.get(k)!.learnHi?.[0] ?? 0), a[1] + (m.get(k)!.learnHi?.[1] ?? 0)], [0, 0]),
        Lw = seeds.reduce((a, k) => [a[0] + (m.get(k)!.learnLo?.[0] ?? 0), a[1] + (m.get(k)!.learnLo?.[1] ?? 0)], [0, 0]);
      if (H[1] + Lw[1])
        console.log(
          `  raised gently: when their rows have mostly gone well ${((100 * H[0]) / Math.max(1, H[1])).toFixed(0)}% of ${H[1]} · when mostly badly ${((100 * Lw[0]) / Math.max(1, Lw[1])).toFixed(0)}% of ${Lw[1]}`,
        );
      const de = seeds.flatMap(k => m.get(k)!.distEnd ?? []);
      if (de.length)
        console.log(
          `  distance between married partners at the end: median ${q(de, 0.5).toFixed(2)}, top tenth ${q(de, 0.9).toFixed(2)}, over 0.5 ${((100 * de.filter(x => x > 0.5).length) / de.length).toFixed(0)}%`,
        );
    }
    console.log(
      `  single at 25+: ${((100 * sum(m, r => r.single25)) / sum(m, r => r.n25)).toFixed(1)}% · births per world ${ci(
        seeds.map(s => m.get(s)!.births),
        1,
      )} · population ${ci(
        seeds.map(s => m.get(s)!.pop),
        1,
      )}`,
    );
  }
  if (ms.length >= 2) {
    const [a, b] = ms;
    console.log(
      `\npaired ${rules[0]} − ${rules[1]}: single at 25+ ${ci(
        seeds.map(s => 100 * (a.get(s)!.single25 / a.get(s)!.n25 - b.get(s)!.single25 / b.get(s)!.n25)),
        1,
      )} points · births ${ci(
        seeds.map(s => a.get(s)!.births - b.get(s)!.births),
        1,
      )}`,
    );
  }
  if (ms.length >= 3) {
    const [a, , c] = ms;
    const r = (ks: number[], m: Map<number, R>) =>
      ks.reduce((s, k) => s + m.get(k)!.divorces, 0) / ks.reduce((s, k) => s + m.get(k)!.marriedYears, 0);
    const [lo, hi] = boot(ks => r(ks, c) / r(ks, a));
    console.log(`${rules[2]} ÷ ${rules[0]} divorce rate: ${(r(seeds, c) / r(seeds, a)).toFixed(2)} [${lo.toFixed(2)}, ${hi.toFixed(2)}]`);
  }
}
