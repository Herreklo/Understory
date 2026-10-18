// Round 11 test: inclination and interest for every skill. Same seeds built and run under three rules: all (every skill latent, interest
// steers job-seeking), music (round 10b: only music latent), dealt (interest dealt at birth). Residents at the end of ten present years.
//   tsx src/interests.ts run A B <all|music|dealt> → out-interests/<rule>-A-B.json ;  tsx src/interests.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { OFF, live, age, type World, type Person } from './world';
import { SETTING } from './setting';
import { inclination } from './inclination';
const OUT = 'out-interests'; mkdirSync(OUT, { recursive: true });
const TRADES = Object.keys(SETTING.skills).filter(s => !SETTING.hobbies.includes(s));
const plays = (p: Person | undefined) => !!p && SETTING.hobbies.some(h => p.skills[h]?.interest === 2);
type R = { musicShare: number; famY: number; famN: number; nfY: number; nfN: number; trY: number; trN: number; ntY: number; ntN: number; workers: number; workLove: number; workAny: number; inclGap: number; loveSkill: number; birthsDeaths: number; pop: number };
function tradeOf(w: World, p: Person): string | null {
  if (p.job) return w.placeById.get(p.job)?.skill ?? null;
  const best = TRADES.map(s => [s, p.skills[s]?.r ?? 0] as const).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 1250 ? best[0] : null; // retired or between jobs: the trade they are best at, if they are good at one
}
function measure(w: World, births: number, deaths: number): R {
  const L = live(w); const ad = L.filter(p => age(w, p) >= 15 && age(w, p) <= 60);
  const kids = L.filter(p => age(w, p) >= 15 && age(w, p) <= 40 && p.parents.length && !p.founder);
  const parentPlays = (p: Person) => p.parents.some(id => plays(w.byId.get(id)));
  let trY = 0, trN = 0, ntY = 0, ntN = 0;
  for (const c of L.filter(p => age(w, p) >= 20 && age(w, p) <= 50 && p.job && p.parents.length && !p.founder)) {
    const mine = tradeOf(w, c); const theirs = new Set(c.parents.map(id => w.byId.get(id)).filter(Boolean).map(q => tradeOf(w, q!)).filter(Boolean) as string[]);
    for (const t of TRADES) { if (theirs.has(t)) { trN++; if (mine === t) trY++; } else { ntN++; if (mine === t) ntY++; } }
  }
  const workers = L.filter(p => p.job && age(w, p) >= 20 && age(w, p) <= 60);
  const workSkill = (p: Person) => w.placeById.get(p.job!)!.skill;
  const corrPairs: [number, number][] = []; for (const p of L.filter(p => age(w, p) >= 35 && age(w, p) <= 60)) for (const t of TRADES) corrPairs.push([p.skills[t]?.interest ?? 0, p.skills[t]?.r ?? 1000]);
  const m = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  const mx = m(corrPairs.map(x => x[0])), my = m(corrPairs.map(x => x[1])); let sxy = 0, sxx = 0, syy = 0; for (const [x, y] of corrPairs) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
  const lovers = workers.filter(p => (p.skills[workSkill(p)]?.interest ?? 0) === 2), rest = workers.filter(p => (p.skills[workSkill(p)]?.interest ?? 0) < 2);
  return { musicShare: ad.filter(plays).length / Math.max(1, ad.length), famY: kids.filter(p => parentPlays(p) && plays(p)).length, famN: kids.filter(parentPlays).length, nfY: kids.filter(p => !parentPlays(p) && plays(p)).length, nfN: kids.filter(p => !parentPlays(p)).length, trY, trN, ntY, ntN,
    workers: workers.length, workLove: lovers.length, workAny: workers.filter(p => (p.skills[workSkill(p)]?.interest ?? 0) >= 1).length,
    inclGap: m(lovers.map(p => inclination(p, workSkill(p)))) - m(rest.map(p => inclination(p, workSkill(p)))), loveSkill: sxy / Math.sqrt(sxx * syy || 1), birthsDeaths: births / Math.max(1, deaths), pop: L.length };
}
if (process.argv[2] === 'run') {
  const A = +process.argv[3], B = +process.argv[4], rule = process.argv[5] ?? 'all'; const out: { seed: number; r: R }[] = [];
  for (let seed = A; seed <= B; seed++) { OFF.clear(); if (rule === 'music') OFF.add('latentall'); if (rule === 'dealt') OFF.add('latent'); if (rule === 'teacher') OFF.add('teacher'); (globalThis as any).TEACHER = rule === 'all' && process.env.ON === 'teacher';
    const w = buildWorld(seed, 1); pickWitness(w); const n0 = w.events.length; runYears(w, 10); const ev = w.events.slice(n0);
    out.push({ seed, r: measure(w, ev.filter(e => e.type === 'born').length, ev.filter(e => e.type === 'death').length) }); OFF.clear(); console.error(`interests ${rule}: world ${seed}`); }
  writeFileSync(`${OUT}/${rule}-${A}-${B}.json`, JSON.stringify(out));
} else {
  const load = (rule: string) => { const m = new Map<number, R>(); for (const f of readdirSync(OUT).filter(f => f.startsWith(rule + '-'))) for (const x of JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'))) m.set(x.seed, x.r); return m; };
  const rules = (process.argv[3] ? process.argv.slice(3) : ['all', 'music', 'dealt']).map(r => [r, load(r)] as const).filter(([, m]) => m.size);
  const seeds = [...rules[0][1].keys()].filter(s => rules.every(([, m]) => m.has(s))).sort((a, b) => a - b);
  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  const T = (n: number) => [0, 12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.20, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.10, 2.09, 2.09][n - 1] ?? 2.05;
  const ci = (v: number[]) => { v = v.filter(x => isFinite(x)); const m = mean(v); const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1)); return `${m.toFixed(2)} ±${(T(v.length) * sd / Math.sqrt(Math.max(1, v.length))).toFixed(2)}`; };
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ratio = (m: Map<number, R>, ss: number[], y1: keyof R, n1: keyof R, y0: keyof R, n0: keyof R) => { const s = (k: keyof R) => ss.reduce((a, x) => a + (m.get(x)![k] as number), 0); return (s(y1) / Math.max(1, s(n1))) / Math.max(1e-4, s(y0) / Math.max(1, s(n0))); };
  const boot = (m: Map<number, R>, ...k: (keyof R)[]) => { const v: number[] = []; for (let i = 0; i < 2000; i++) v.push(ratio(m, seeds.map(() => seeds[Math.floor(rnd() * seeds.length)]), k[0], k[1], k[2], k[3])); v.sort((a, b) => a - b); return `${ratio(m, seeds, k[0], k[1], k[2], k[3]).toFixed(2)} [${v[50].toFixed(2)}–${v[1949].toFixed(2)}]`; };
  console.log(`${seeds.length} worlds · residents at the end of ten present years\n` + ''.padEnd(58) + rules.map(([r]) => r.padStart(18)).join(''));
  const line = (name: string, f: (m: Map<number, R>) => string) => console.log(`  ${name.padEnd(56)}` + rules.map(([, m]) => f(m).padStart(18)).join(''));
  line('share of 15–60s who play music', m => ci(seeds.map(s => m.get(s)!.musicShare)));
  line('music family ratio (pooled, bootstrap over worlds)', m => boot(m, 'famY', 'famN', 'nfY', 'nfN'));
  line('trade following: works in a parent\'s trade ÷ otherwise', m => boot(m, 'trY', 'trN', 'ntY', 'ntN'));
  line('workers who love their trade (interest 2)', m => ci(seeds.map(s => m.get(s)!.workLove / Math.max(1, m.get(s)!.workers))));
  line('workers with any interest in their trade', m => ci(seeds.map(s => m.get(s)!.workAny / Math.max(1, m.get(s)!.workers))));
  line('inclination for the trade, lovers minus the rest (SD)', m => ci(seeds.map(s => m.get(s)!.inclGap)));
  line('corr(interest, skill) in trades, aged 35–60', m => ci(seeds.map(s => m.get(s)!.loveSkill)));
  line('births ÷ deaths, present', m => ci(seeds.map(s => m.get(s)!.birthsDeaths)));
  line('population at the end', m => ci(seeds.map(s => m.get(s)!.pop)));
}
