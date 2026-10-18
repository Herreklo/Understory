// Round 10a test: moments that shape people. Each world runs its past and three present years with the mechanism off and is frozen there;
// years four to ten then run with it on and off, and the same towns are compared. Intervals over worlds.
//   tsx src/moments.ts run A B → out-moments/m-A-B.json ;  tsx src/moments.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { OFF, live, age } from './world';
import { SETTING } from './setting';
const OUT = 'out-moments'; mkdirSync(OUT, { recursive: true });
type Sight = { t: number; sk: string; z: number; a: number };
type W = { seed: number; on: { sights: { id: number; s: Sight[]; sparked: boolean }[]; sparks: { t: number; held: boolean | null; friend: boolean }[]; glows: number; shows: number; audience: number; players: number; pop: number; born: number }; off: { players: number; pop: number; born: number } };
if (process.argv[2] === 'run') {
  const A = +process.argv[3], B = +process.argv[4]; const out: W[] = [];
  for (let seed = A; seed <= B; seed++) {
    const res: any = {};
    for (const arm of ['on', 'off'] as const) {
      OFF.clear(); OFF.add('moments'); const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 3); const t3 = w.t;
      if (arm === 'on') OFF.delete('moments'); runYears(w, 7); OFF.clear();
      const players = live(w).filter(p => age(w, p) < 35 && SETTING.hobbies.some(h => p.skills[h]?.interest === 2)).length;
      const born = w.events.filter(e => e.type === 'born' && e.t > t3).length;
      if (arm === 'off') { res.off = { players, pop: live(w).length, born }; continue; }
      const recs = ((w.stats as any).moments ?? []) as { t: number; audience: number; sparks: number[]; sparkFriend: boolean[]; glows: number[] }[];
      const sights = w.people.filter(p => (p as any).sawGreat).map(p => ({ id: p.id, s: (p as any).sawGreat as Sight[], sparked: SETTING.hobbies.some(h => p.tried['spark:' + h] && p.tried['spark:' + h].t > t3) }));
      const sparks: W['on']['sparks'] = []; for (const r of recs) r.sparks.forEach((id, i) => { const p = w.byId.get(id)!; const h = SETTING.hobbies.find(h => p.tried['spark:' + h]?.t === r.t)!; const tr = p.tried['spark:' + h]; sparks.push({ t: r.t, held: w.t - r.t >= 36 ? tr.ok === true : null, friend: r.sparkFriend[i] }); });
      res.on = { sights, sparks, glows: recs.reduce((s, r) => s + r.glows.length, 0), shows: recs.length, audience: recs.reduce((s, r) => s + r.audience, 0), players, pop: live(w).length, born };
    }
    out.push({ seed, ...res }); console.error(`moments: world ${seed}`);
  }
  writeFileSync(`${OUT}/m-${A}-${B}.json`, JSON.stringify(out));
} else {
  const ws: W[] = []; for (const f of readdirSync(OUT)) ws.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
  const mean = (x: number[]) => x.reduce((a, b) => a + b, 0) / Math.max(1, x.length);
  const T = (n: number) => [0, 12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.20, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.10, 2.09, 2.09][n - 1] ?? 2.05;
  const ci = (v: number[]) => { v = v.filter(x => !isNaN(x)); const m = mean(v); const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1)); return `${m.toFixed(3)} ±${(T(v.length) * sd / Math.sqrt(Math.max(1, v.length))).toFixed(3)} (${v.length} worlds)`; };
  const pct = (v: number[]) => ci(v.map(x => 100 * x)).replace(/(\d+\.\d)\d\d/g, '$1');
  console.log(`${ws.length} worlds · years 4–10 from a common checkpoint · mechanism on against off\n`);
  console.log(`great nights per town ${mean(ws.map(w => w.on.shows)).toFixed(1)}, audience per night ${(mean(ws.map(w => w.on.audience / Math.max(1, w.on.shows)))).toFixed(1)}`);
  const share = (lo: number, hi: number) => ws.map(w => { const xs = w.on.sights.filter(s => s.s[0].a >= lo && s.s[0].a < hi); return xs.length ? xs.filter(s => s.sparked).length / xs.length : NaN; });
  console.log(`1. share of those who saw a great night who were sparked (by age at first sight): 10–30 ${pct(share(10, 31))} · 31–39 ${pct(share(31, 40))} · 40+ ${pct(share(40, 120))}`);
  const zs = ws.map(w => { const all = w.on.sights.flatMap(s => s.s.map(x => x.z)), sp = w.on.sights.filter(s => s.sparked).flatMap(s => s.s.map(x => x.z)); return sp.length ? mean(sp) - mean(all) : NaN; });
  console.log(`2. inclination of the sparked minus that of everyone who saw (in SD of facets): ${ci(zs)}`);
  const held = (f: boolean) => ws.map(w => { const xs = w.on.sparks.filter(s => s.held !== null && s.friend === f); return xs.length ? xs.filter(s => s.held).length / xs.length : NaN; });
  console.log(`3. sparks still held after three years: with a friend who plays ${pct(held(true))} · without ${pct(held(false))} · all ${pct(ws.map(w => { const xs = w.on.sparks.filter(s => s.held !== null); return xs.length ? xs.filter(s => s.held).length / xs.length : NaN; }))}`);
  console.log(`   glows per spark: ${(ws.reduce((s, w) => s + w.on.glows, 0) / Math.max(1, ws.reduce((s, w) => s + w.on.sparks.length, 0))).toFixed(1)} (${ws.reduce((s, w) => s + w.on.glows, 0)} glows, ${ws.reduce((s, w) => s + w.on.sparks.length, 0)} sparks)`);
  console.log(`4. passionate players under 35 at year ten, on − off: ${ci(ws.map(w => w.on.players - w.off.players))}; population on − off ${ci(ws.map(w => w.on.pop - w.off.pop))}; births ${ci(ws.map(w => w.on.born - w.off.born))}`);
}
