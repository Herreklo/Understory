// Round 12 test: the tie itself. Who takes whom on, whether it takes, and what the teacher's temper does to it. Residents at the end of ten present years.
//   tsx src/teachers.ts run A B → out-teachers/A-B.json ;  tsx src/teachers.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { live, age, facet, type World, type Person } from './world';
import { SETTING } from './setting';
(globalThis as any).TEACHER = true; // round 12: the mechanism itself
const OUT = 'out-teachers'; mkdirSync(OUT, { recursive: true });
type R = { warmN: number; warmY: number; harshN: number; harshY: number; midN: number; midY: number; pupils: number; music: number; trade: number; routes: Record<string, number>;
  youngWorkers: number; everApprenticed: number; players: number; fromTeacher: number; teachers: number; legacy: number; stopped: number; takenon: number; pop: number };
function measure(w: World): R {
  const L = live(w); const all = [...w.byId.values()];
  let warmN = 0, warmY = 0, harshN = 0, harshY = 0, midN = 0, midY = 0, pupils = 0, music = 0, trade = 0;
  for (const T of all) for (const x of T.pupils) { if (w.t - x.t < 36 && !x.took) continue; // give a tie three years before counting it as not taken
    pupils++; if (SETTING.hobbies.includes(x.sk)) music++; else trade++;
    const warmth = (facet(T, 'gentleness') + facet(T, 'patience')) / 2;
    if (warmth > 0) { warmN++; if (x.took) warmY++; } else if (warmth < -0.5) { harshN++; if (x.took) harshY++; } else { midN++; if (x.took) midY++; } }
  const routes: Record<string, number> = {}; let stopped = 0, takenon = 0;
  for (const e of w.events) { if (e.type === 'takenon') { takenon++; const r = e.causes[0]?.label ?? '?'; const k = /apprenticed|best hand/.test(e.text + r) ? 'work' : /school/.test(r) ? 'school' : /friend of the family/.test(r) ? 'family friend' : 'town'; routes[k] = (routes[k] ?? 0) + 1; } if (e.type === 'stopped') stopped++; }
  const yw = L.filter(p => p.job && age(w, p) >= 20 && age(w, p) <= 35);
  const apprenticed = (p: Person) => all.some(T => T.pupils.some(x => x.id === p.id && !SETTING.hobbies.includes(x.sk)));
  const plays = (p: Person) => SETTING.hobbies.some(h => p.skills[h]?.interest === 2);
  const players = L.filter(p => age(w, p) >= 15 && age(w, p) <= 60 && plays(p));
  const fromTeacher = players.filter(p => Object.values(((p as any).interestFrom ?? {}) as Record<string, string>).includes('teacher')).length;
  return { warmN, warmY, harshN, harshY, midN, midY, pupils, music, trade, routes, youngWorkers: yw.length, everApprenticed: yw.filter(apprenticed).length, players: players.length, fromTeacher,
    teachers: all.filter(T => T.pupils.length).length, legacy: all.filter(T => T.pupils.filter(x => x.took).length >= 2).length, stopped, takenon, pop: L.length };
}
if (process.argv[2] === 'run') {
  const A = +process.argv[3], B = +process.argv[4]; const out: { seed: number; r: R }[] = [];
  for (let seed = A; seed <= B; seed++) { const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 10); out.push({ seed, r: measure(w) }); console.error(`teachers: world ${seed}`); }
  writeFileSync(`${OUT}/${A}-${B}.json`, JSON.stringify(out));
} else {
  const rows: { seed: number; r: R }[] = []; for (const f of readdirSync(OUT)) rows.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'))); rows.sort((a, b) => a.seed - b.seed);
  const sum = (k: keyof R, rs = rows) => rs.reduce((s, x) => s + (x.r[k] as number), 0);
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ratio = (rs: { seed: number; r: R }[]) => (sum('warmY', rs) / Math.max(1, sum('warmN', rs))) / Math.max(1e-3, sum('harshY', rs) / Math.max(1, sum('harshN', rs)));
  const v: number[] = []; for (let i = 0; i < 2000; i++) v.push(ratio(rows.map(() => rows[Math.floor(rnd() * rows.length)]))); v.sort((a, b) => a - b);
  console.log(`${rows.length} worlds · ties at least three years old, or taken`);
  console.log(`  pupils ${sum('pupils')} (music ${sum('music')}, trade ${sum('trade')}); teachers ${sum('teachers')}; taken on ${sum('takenon')} ties written down, stopped under a harsh teacher ${sum('stopped')}; teachers with a legacy line (2+ took) ${sum('legacy')}`);
  const routes: Record<string, number> = {}; for (const x of rows) for (const [k, n] of Object.entries(x.r.routes)) routes[k] = (routes[k] ?? 0) + n; console.log(`  routes: ${Object.entries(routes).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ')}`);
  const pct = (y: keyof R, n: keyof R) => `${(100 * sum(y) / Math.max(1, sum(n))).toFixed(0)}% of ${sum(n)}`;
  console.log(`  took, by the teacher's warmth (gentleness+patience)/2: warm (>0) ${pct('warmY', 'warmN')} · middling ${pct('midY', 'midN')} · harsh (<−0.5) ${pct('harshY', 'harshN')}`);
  console.log(`  warm ÷ harsh take-rate, pooled, bootstrap over worlds: ${ratio(rows).toFixed(2)} [${v[50].toFixed(2)}–${v[1949].toFixed(2)}]`);
  console.log(`  young workers (20–35) ever apprenticed: ${pct('everApprenticed', 'youngWorkers')}`);
  console.log(`  adult players (15–60) whose love came from a teacher: ${pct('fromTeacher', 'players')}`);
}
