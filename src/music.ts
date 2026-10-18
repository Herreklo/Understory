// Round 10b test: where a love of music comes from. Same seeds built and run under each rule (OFF=latent restores interest dealt at birth);
// measured on residents at the end of ten present years. Intervals over worlds.
//   tsx src/music.ts run A B [off]   → out-music/<rule>-A-B.json ;  tsx src/music.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { OFF, live, age, type World, type Person } from './world';
import { SETTING } from './setting';
import { inclination } from './group';
const OUT = 'out-music'; mkdirSync(OUT, { recursive: true });
const plays = (p: Person | undefined) => !!p && SETTING.hobbies.some(h => p.skills[h]?.interest === 2);
const incl = (p: Person) => Math.max(...SETTING.hobbies.map(h => inclination(p, h)));
type R = { youngPlayers: number; youngNoParent: number; talN: number; talY: number; teenL1: number; wpN: number; wpY: number; npN: number; npY: number; share: number; withTie: number; nPlayers: number; ratio: number; pPar: number; pNo: number; gap: number; sparksPerNight: number; origin: Record<string, number> };
function measure(w: World): R {
  const L = live(w); const ad = L.filter(p => age(w, p) >= 15 && age(w, p) <= 60);
  const players = ad.filter(plays);
  const parentsPlay = (p: Person) => p.parents.some(id => plays(w.byId.get(id)));
  const tie = (p: Person) => parentsPlay(p) || plays(p.partner != null ? w.byId.get(p.partner) : undefined) || [...p.friends].some(f => plays(w.byId.get(f)));
  const adults = players.filter(p => age(w, p) >= 20);
  const kids = L.filter(p => age(w, p) >= 15 && age(w, p) <= 40 && p.parents.length && !p.founder);
  const wp = kids.filter(parentsPlay), np = kids.filter(p => !parentsPlay(p));
  const pPar = wp.length ? wp.filter(plays).length / wp.length : NaN, pNo = np.length ? np.filter(plays).length / np.length : NaN;
  const m = (xs: Person[]) => xs.reduce((s, p) => s + incl(p), 0) / Math.max(1, xs.length);
  const recs = ((w.stats as any).moments ?? []) as { t: number; sparks: number[] }[]; const present = recs.filter(r => r.t >= w.startPresent);
  const origin: Record<string, number> = {}; for (const p of players) { const o = (p as any).interestFrom ? Object.values((p as any).interestFrom as Record<string, string>)[0] ?? 'dealt' : 'dealt'; origin[o] = (origin[o] ?? 0) + 1; }
  // Realism of families: how many young players have parents who do not play; whether the most inclined children of non-playing parents find it anyway.
  const young = kids.filter(plays); const incl10 = [...kids].sort((a, b) => incl(b) - incl(a)).slice(0, Math.max(1, Math.floor(kids.length / 5))).filter(p => !parentsPlay(p));
  const teens = L.filter(p => age(w, p) >= 12 && age(w, p) < 18);
  return { youngPlayers: young.length, youngNoParent: young.filter(p => !parentsPlay(p)).length, talN: incl10.length, talY: incl10.filter(plays).length, teenL1: teens.length ? teens.filter(p => SETTING.hobbies.some(h => (p.skills[h]?.interest ?? 0) >= 1)).length / teens.length : NaN, wpN: wp.length, wpY: wp.filter(plays).length, npN: np.length, npY: np.filter(plays).length, share: players.length / Math.max(1, ad.length), withTie: adults.length ? adults.filter(tie).length / adults.length : NaN, nPlayers: players.length, ratio: pPar / Math.max(0.01, pNo), pPar, pNo, gap: m(players) - m(ad.filter(p => !plays(p))), sparksPerNight: present.length ? present.reduce((s, r) => s + r.sparks.length, 0) / present.length : NaN, origin };
}
if (process.argv[2] === 'run') {
  const A = +process.argv[3], B = +process.argv[4], rule = process.argv[5] ?? 'on'; const out: { seed: number; r: R }[] = []; // on | off (dealt at birth) | teacher (OFF=teacher)
  for (let seed = A; seed <= B; seed++) { OFF.clear(); if (rule === 'off') OFF.add('latent'); if (rule === 'teacher') OFF.add('teacher'); (globalThis as any).TEACHER = rule === 'on' && process.env.ON === 'teacher'; const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 10); out.push({ seed, r: measure(w) }); OFF.clear(); console.error(`music ${rule}: world ${seed}`); }
  writeFileSync(`${OUT}/${rule}-${A}-${B}.json`, JSON.stringify(out));
} else {
  const load = (rule: string) => { const m = new Map<number, R>(); for (const f of readdirSync(OUT).filter(f => f.startsWith(rule + '-'))) for (const x of JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'))) m.set(x.seed, x.r); return m; };
  const rA = process.argv[3] ?? 'on', rB = process.argv[4] ?? 'off'; const on = load(rA), off = load(rB); const seeds = [...on.keys()].filter(s => off.has(s)).sort((a, b) => a - b);
  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  const T = (n: number) => [0, 12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.20, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.10, 2.09, 2.09][n - 1] ?? 2.05;
  const ci = (v: number[], d = 2) => { v = v.filter(x => isFinite(x)); const m = mean(v); const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1)); return `${m.toFixed(d)} ±${(T(v.length) * sd / Math.sqrt(Math.max(1, v.length))).toFixed(d)}`; };
  const row = (name: string, k: keyof R, d = 2) => console.log(`  ${name.padEnd(62)} ${ci(seeds.map(s => on.get(s)![k] as number), d).padStart(14)} ${ci(seeds.map(s => off.get(s)![k] as number), d).padStart(14)}`);
  console.log(`${seeds.length} worlds · residents at the end of ten present years · ${rA} / ${rB}\n` + ''.padEnd(64) + rA.padStart(14) + rB.padStart(15));
  row('share of 15–60s who play (passionate)', 'share'); row('of adult players, share with a parent, partner or friend who plays', 'withTie');
  row('P(plays | a parent plays), born in town, 15–40', 'pPar'); row('P(plays | no parent plays)', 'pNo'); row('  ratio', 'ratio');
  // The family ratio, pooled over worlds (few children per world have a parent who plays), with a bootstrap over worlds.
  const pooled = (m: Map<number, R>, ss: number[]) => { const a = ss.reduce((s, x) => s + m.get(x)!.wpY, 0) / Math.max(1, ss.reduce((s, x) => s + m.get(x)!.wpN, 0)), b = ss.reduce((s, x) => s + m.get(x)!.npY, 0) / Math.max(1, ss.reduce((s, x) => s + m.get(x)!.npN, 0)); return a / Math.max(0.001, b); };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const boot = (m: Map<number, R>) => { const v: number[] = []; for (let i = 0; i < 2000; i++) v.push(pooled(m, seeds.map(() => seeds[Math.floor(rnd() * seeds.length)]))); v.sort((a, b) => a - b); return `${pooled(m, seeds).toFixed(2)} [${v[50].toFixed(2)}–${v[1949].toFixed(2)}]`; };
  console.log(`  ${'family ratio pooled over worlds, P(plays | parent plays) ÷ P(plays | not)'.padEnd(62)} ${boot(on).padStart(14)} ${boot(off).padStart(14)}`);
  const pool2 = (m: Map<number, R>, a: keyof R, b: keyof R) => { const x = seeds.reduce((s, k) => s + (m.get(k)![a] as number), 0), y = seeds.reduce((s, k) => s + (m.get(k)![b] as number), 0); return y ? `${(100 * x / y).toFixed(0)}% of ${y}` : '—'; };
  console.log(`  ${'young players (15–40, born here) whose parents do not play'.padEnd(62)} ${pool2(on, 'youngNoParent', 'youngPlayers').padStart(14)} ${pool2(off, 'youngNoParent', 'youngPlayers').padStart(14)}`);
  console.log(`  ${'most inclined fifth, parents do not play: share who play'.padEnd(62)} ${pool2(on, 'talY', 'talN').padStart(14)} ${pool2(off, 'talY', 'talN').padStart(14)}`);
  row('12–17s with at least a triggered interest', 'teenL1');
  row('inclination, players minus non-players (SD)', 'gap'); row('sparks per great night (present)', 'sparksPerNight');
  const orig: Record<string, number> = {}; for (const s of seeds) for (const [k, n] of Object.entries(on.get(s)!.origin)) orig[k] = (orig[k] ?? 0) + n;
  const orig2: Record<string, number> = {}; for (const s of seeds) for (const [k, n] of Object.entries(off.get(s)!.origin)) orig2[k] = (orig2[k] ?? 0) + n;
  console.log(`  where players' love of music came from (${rB}): ${Object.entries(orig2).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ')}`);
  console.log(`  where players' love of music came from (${rA}): ${Object.entries(orig).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ')}`);
}
