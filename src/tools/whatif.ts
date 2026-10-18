// What-ifs: what one choice changes in the chooser's life three years on (round 25a).
//   ./run.sh src/tools/whatif.ts check                 → a copied world behaves as the original (the cloner is sound)
//   ./run.sh src/tools/whatif.ts run A B [n] [topup]   → out-whatif/A-B.json: n random eligible choices per world (default 40), topped up so
//                                                        each kind of choice has at least `topup` (default 5); each flipped and placeboed
//   ./run.sh src/tools/whatif.ts report [dir]          → the effect of a choice, by kind, with intervals by resampling worlds
// A choice is eligible in the first seven present years when the likeliest answer not chosen had at least 0.15. The copy starts from the
// factual world at the start of the decision's month; both arms take one extra draw from the stream of the system at work (the smallest
// nudge to chance), then 'flip' gives the likeliest other answer and 'placebo' the same answer (the noise floor). The model never reads any of this (globalThis.WHATIF, src/decide.ts).
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { buildWorld, runYears } from '../build';
import { tick } from '../life';
import { pickWitness } from '../witness';
import { age, OFF, P, type Person, type World } from '../world';
import { Rng } from '../rng';
import { cloneWorld } from './clone';

const OUT = process.env.WHATIF_OUT ?? 'out-whatif';
const G = globalThis as any;
const H0 = () => ({ n: 0, at: -1, mode: '', log: null as any[] | null });

// ---------- a life, three years on ----------
type State = { status: string; job: string; partner: number; home: string; friends: number[]; savings: number; wants: string };
function stateOf(w: World, p: Person): State {
  const home =
    age(w, p) < 18
      ? p.parents.filter(k => P(w, k).status === 'in')
      : [...(p.partner != null && p.pstat === 'married' ? [p.partner] : []), ...p.kids.filter(k => P(w, k).status === 'in' && age(w, P(w, k)) < 18)];
  return {
    status: p.status,
    job: p.job ?? '',
    partner: p.partner ?? -1,
    home: home.sort((a, b) => a - b).join(','),
    friends: [...p.friends].sort((a, b) => a - b),
    savings: p.savings,
    wants: p.wants
      .filter(x => !x.done)
      .map(x => x.kind + ':' + x.target)
      .sort()
      .join(','),
  };
}
export const FIELDS = ['status', 'job', 'partner', 'home', 'friends', 'money', 'wants'] as const;
export const MAJOR = new Set(['status', 'job', 'partner', 'home']);
export function differs(a: State, b: State): string[] {
  if (a.status !== b.status) return ['status'];
  if (a.status !== 'in') return [];
  const d: string[] = [];
  if (a.job !== b.job) d.push('job');
  if (a.partner !== b.partner) d.push('partner');
  if (a.home !== b.home) d.push('home');
  const fa = new Set(a.friends),
    union = new Set([...a.friends, ...b.friends]);
  const both = b.friends.filter(x => fa.has(x)).length;
  if (union.size && both / union.size < 2 / 3) d.push('friends');
  if (Math.abs(a.savings - b.savings) >= Math.max(8, 0.25 * Math.abs(a.savings))) d.push('money');
  if (a.wants !== b.wants) d.push('wants');
  return d;
}

// ---------- kinds of choice ----------
export function kindOf(raw: string): string {
  const s = raw.replace(/@\d+/g, '@');
  if (s.startsWith('whether to go for ')) return 'go for a post';
  if (s.startsWith('whether to go ahead')) return 'go ahead with a plan';
  if (s.startsWith('whether to allow')) return 'allow a plan';
  if (s.startsWith('a want:')) return 'go after a want';
  if (s.startsWith('whether to go on:')) return 'keep at a want';
  if (s.endsWith(' is leaving')) return 'someone close is leaving';
  if (s.startsWith('how to go about it:')) return 'choose a way to go after a want';
  if (s.startsWith('whether @ can come along')) return 'asked to bring someone along';
  if (s.startsWith('whether to help @')) return 'asked for money by family';
  if (s.startsWith('whether @ should be ')) return 'asked whether someone could have a post';
  return s;
}

// ---------- the world, step by step ----------
function fresh(seed: number) {
  OFF.clear();
  for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
  G.WHATIF = undefined;
  const w = buildWorld(seed, 1);
  pickWitness(w);
  return w;
}
function step(w: World, H: any) {
  G.WHATIF = H;
  tick(w);
  G.WHATIF = undefined;
}

function sigOf(w: World) {
  const s =
    w.events
      .map(e => `${e.t}|${e.type}|${e.who.join(',')}|${e.text}|${e.causes.map(c => c.label).join(';')}|${[...e.knownBy].join(',')}`)
      .join('\n') +
    w.people.map(p => `${p.status}|${p.job}|${p.partner}|${p.savings.toFixed(6)}|${[...p.friends].join(',')}`).join('\n') +
    [...w.bonds.values()].map(b => JSON.stringify(b)).join('\n');
  return createHash('sha1').update(s).digest('hex');
}

const mode = process.argv[2];
if (mode === 'check') {
  // A copy taken at the start of the present, and one four years in, must run exactly as the original.
  let ok = true;
  for (const seed of [11, 12]) {
    for (const at of [0, 48]) {
      const a = fresh(seed);
      for (let i = 0; i < at; i++) step(a, H0());
      const b = cloneWorld(a);
      for (let i = at; i < 120; i++) {
        step(a, H0());
        step(b, H0());
      }
      const same = sigOf(a) === sigOf(b);
      ok &&= same;
      console.log(`world ${seed}, copied ${at / 12} years into the present: ${same ? 'same' : 'DIFFERENT'} (${a.events.length} events)`);
    }
    // Unset, the hook changes nothing: the same world with and without counting.
    const a = fresh(seed),
      b = fresh(seed);
    for (let i = 0; i < 60; i++) {
      step(a, undefined);
      step(b, { ...H0(), log: [] });
    }
    const same = sigOf(a) === sigOf(b);
    ok &&= same;
    console.log(`world ${seed}, counted and not counted: ${same ? 'same' : 'DIFFERENT'}`);
  }
  if (!ok) process.exit(1);
} else if (mode === 'run') {
  const A = +process.argv[3],
    B = +process.argv[4],
    N = +(process.argv[5] ?? 40),
    TOPUP = +(process.argv[6] ?? 5);
  mkdirSync(OUT, { recursive: true });
  // Each world is written as soon as it is done (out/<seed>.json), and a world already written is skipped, so a stopped run resumes.
  for (let seed = A; seed <= B; seed++) {
    if (readdirSync(OUT).includes(`${seed}.json`)) continue;
    const rows: any[] = [];
    const t1 = Date.now();
    // Pass 1: the factual run, counting every choice.
    let w = fresh(seed);
    const t0 = w.t;
    const Hf = { ...H0(), log: [] as any[] };
    const monthStart: number[] = [];
    for (let m = 0; m < 120; m++) {
      monthStart[m] = Hf.n;
      step(w, Hf);
    }
    // A choice belongs to the tick it was made in (the month's clock may already have moved on when it is drawn).
    const monthOf = (n: number) => {
      let m = 0;
      while (m < 119 && monthStart[m + 1] <= n) m++;
      return m;
    };
    const eligible = Hf.log!.filter(x => monthOf(x.n) < 84 && x.alt >= 0.15);
    const byKind = new Map<string, any[]>();
    for (const x of eligible) {
      const k = kindOf(x.kind);
      if (!byKind.has(k)) byKind.set(k, []);
      byKind.get(k)!.push(x);
    }
    const r = new Rng(seed * 7919 + 17);
    const shuffled = r.shuffle(eligible.slice());
    const chosen = new Set<any>(shuffled.slice(0, N));
    for (const [k, xs] of byKind) {
      const have = [...chosen].filter(x => kindOf(x.kind) === k).length;
      const rest = r.shuffle(xs.filter(x => !chosen.has(x)));
      for (let i = 0; i < TOPUP - have && i < rest.length; i++) chosen.add(rest[i]);
    }
    const samples = [...chosen].sort((a, b) => a.n - b.n);
    // Pass 2: the factual run again; at the start of each sampled month, copies that flip or placebo the choice run 36 months.
    w = fresh(seed);
    const H2 = H0();
    const due = new Map<number, { s: any; arm: string; st: State }[]>(); // factual month at which to compare → copies' end states
    let nulls = 0;
    for (let m = 0; m < 120; m++) {
      const here = samples.filter(s => s.n >= monthStart[m] && (m === 119 || s.n < monthStart[m + 1]));
      for (const s of here) {
        const arms = nulls < 2 ? ['flip', 'placebo', 'null'] : ['flip', 'placebo'];
        if (nulls < 2) nulls++;
        for (const arm of arms) {
          const c = cloneWorld(w);
          const Hc = { n: monthStart[m], at: arm === 'null' ? -1 : s.n, mode: arm, log: [] as any[] };
          for (let i = 0; i < 36; i++) step(c, Hc);
          const mine = Hc.log.find(x => x.n === s.n);
          if (!mine || mine.who !== s.who || mine.t !== s.t || mine.kind !== s.kind)
            throw new Error(`world ${seed}: the copy's choice ${s.n} is not the factual one`);
          const key = m + 36;
          if (!due.has(key)) due.set(key, []);
          due.get(key)!.push({ s, arm, st: stateOf(c, P(c, s.who)) });
        }
      }
      if (H2.n !== monthStart[m]) throw new Error(`world ${seed}: the factual count drifted`);
      step(w, H2);
      for (const d of due.get(m + 1) ?? []) {
        const f = stateOf(w, P(w, d.s.who));
        const diff = differs(f, d.st);
        if (d.arm === 'null' && diff.length) throw new Error(`world ${seed}: an untouched copy differs (${diff})`);
        if (d.arm === 'null') continue;
        rows.push({
          seed,
          n: d.s.n,
          t: d.s.t - t0,
          month: monthOf(d.s.n),
          who: d.s.who,
          kind: kindOf(d.s.kind),
          raw: d.s.kind.replace(/@\d+/g, '@'),
          alt: d.s.alt,
          arm: d.arm,
          diff,
          eligibleOfKind: byKind.get(kindOf(d.s.kind))!.length,
          sampledOfKind: samples.filter(x => kindOf(x.kind) === kindOf(d.s.kind)).length,
        });
      }
    }
    writeFileSync(`${OUT}/${seed}.json`, JSON.stringify(rows));
    console.error(`whatif: world ${seed}: ${eligible.length} eligible, ${samples.length} tested, ${((Date.now() - t1) / 1000).toFixed(0)} s`);
  }
} else if (mode === 'report') {
  const dir = process.argv[3] ?? OUT;
  const rows: any[] = readdirSync(dir)
    .filter(f => /^\d+(-\d+)?\.json$/.test(f))
    .flatMap(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')))
    .map((r: any) => ({ ...r, kind: kindOf(r.raw) }));
  const seeds = [...new Set(rows.map(r => r.seed))];
  const any = (r: any) => (r.diff.length ? 1 : 0),
    major = (r: any) => (r.diff.some((d: string) => MAJOR.has(d)) ? 1 : 0);
  // Effect = weighted share changed after a flip minus after a placebo; weights make the pooled number stand for every eligible choice.
  const effect = (rs: any[], f: (r: any) => number, weighted: boolean) => {
    const arm = (a: string) => {
      const xs = rs.filter(r => r.arm === a);
      const wt = (r: any) => (weighted ? r.eligibleOfKind / r.sampledOfKind : 1);
      const W = xs.reduce((s, r) => s + wt(r), 0);
      return W ? xs.reduce((s, r) => s + wt(r) * f(r), 0) / W : NaN;
    };
    return { flip: arm('flip'), placebo: arm('placebo'), d: arm('flip') - arm('placebo') };
  };
  const boot = (rs: any[], f: (r: any) => number, weighted: boolean) => {
    const r = new Rng(12345);
    const by = new Map(seeds.map(s => [s, rs.filter(x => x.seed === s)]));
    const ds: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const pick: any[] = [];
      for (let j = 0; j < seeds.length; j++) pick.push(...by.get(seeds[Math.floor(r.next() * seeds.length)])!);
      const e = effect(pick, f, weighted).d;
      if (!isNaN(e)) ds.push(e);
    }
    ds.sort((a, b) => a - b);
    return [ds[Math.floor(0.025 * ds.length)], ds[Math.floor(0.975 * ds.length)]];
  };
  const pc = (x: number) => (isNaN(x) ? '  –  ' : (100 * x).toFixed(1).padStart(5));
  const line = (label: string, rs: any[], weighted: boolean) => {
    const a = effect(rs, any, weighted),
      m = effect(rs, major, weighted);
    const [al, ah] = boot(rs, any, weighted),
      [ml, mh] = boot(rs, major, weighted);
    const n = rs.filter(r => r.arm === 'flip').length;
    console.log(
      `${label.slice(0, 34).padEnd(34)} ${String(n).padStart(4)}  any: flip ${pc(a.flip)} placebo ${pc(a.placebo)} effect ${pc(a.d)} [${pc(al)},${pc(ah)}]  major: flip ${pc(m.flip)} placebo ${pc(m.placebo)} effect ${pc(m.d)} [${pc(ml)},${pc(mh)}]`,
    );
  };
  console.log(`== what a choice changes, three years on · ${seeds.length} worlds · ${rows.filter(r => r.arm === 'flip').length} choices tested\n`);
  line('every eligible choice (weighted)', rows, true);
  console.log('\nby what changed (weighted; share of lives):');
  for (const f of FIELDS) {
    const e = effect(rows, r => (r.diff.includes(f) ? 1 : 0), true);
    console.log(`  ${f.padEnd(8)} flip ${pc(e.flip)} placebo ${pc(e.placebo)} effect ${pc(e.d)}`);
  }
  console.log('\nby kind of choice (kinds with at least 20 tested):');
  const kinds = [...new Set(rows.map(r => r.kind))]
    .map(k => ({ k, rs: rows.filter(r => r.kind === k) }))
    .filter(x => x.rs.filter(r => r.arm === 'flip').length >= 20)
    .sort((a, b) => effect(b.rs, major, false).d - effect(a.rs, major, false).d || effect(b.rs, any, false).d - effect(a.rs, any, false).d);
  for (const { k, rs } of kinds) line(k, rs, false);
}
