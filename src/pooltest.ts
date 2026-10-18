// Round 9b test: one pool for everyone who seeks company, against the old rule (singles draw from singles; the partnered from everyone,
// most draws then lost to the age check). Each world runs its past and five present years under the old rule and is frozen there;
// years six to ten then run under each rule, and the same people are compared. Intervals over worlds.
//   tsx src/pooltest.ts run A B      → writes out-pool/pool-A-B.json
//   tsx src/pooltest.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { OFF, live, age, facet } from './world';
import { standing } from './regard';

const OUT = 'out-pool'; mkdirSync(OUT, { recursive: true });
const CH = ['work', 'home', 'family', 'hobby', 'circle', 'habit', 'group', 'sought', 'public'];
type P = { id: number; age: number; partnered: boolean; soc: number; st: number; recv: Record<string, Record<string, number>>; stress: Record<string, number> };
type Wd = { seed: number; people: P[]; events: Record<string, Record<string, number>> };
const mode = process.argv[2];
if (mode === 'run') {
  const A = +process.argv[3], B = +process.argv[4]; const out: Wd[] = [];
  for (let seed = A; seed <= B; seed++) {
    let base: P[] = []; const events: Record<string, Record<string, number>> = {};
    for (const rule of ['old', 'one'] as const) {
      OFF.clear(); OFF.add('onepool');
      const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 5);
      if (rule === 'old') base = live(w).filter(p => age(w, p) >= 20 && age(w, p) <= 75).map(p => ({ id: p.id, age: age(w, p), partnered: p.partner != null, soc: facet(p, 'sociability'), st: standing(w, p.id), recv: {}, stress: {} }));
      const byId = new Map(base.map(p => [p.id, p]));
      if (rule === 'one') OFF.delete('onepool');
      const t5 = w.t; const n0 = w.events.length;
      w.hooks.contact = (_w, a, b, i, ch) => { for (const [x, own] of [[b, true], [a, ch !== 'sought']] as const) { if (!own) continue; const q = byId.get(x.id); if (!q) continue; const r = (q.recv[rule] ??= {}); r[ch] = (r[ch] ?? 0) + i; } };
      runYears(w, 5); OFF.clear();
      for (const q of base) q.stress[rule] = w.byId.get(q.id)!.stress;
      const ev: Record<string, number> = {}; for (const e of w.events.slice(n0)) if (e.t > t5 && ['dating', 'married', 'born', 'friends', 'madeup', 'cooled', 'left', 'home'].includes(e.type)) ev[e.type] = (ev[e.type] ?? 0) + 1;
      ev.population = live(w).length; events[rule] = ev;
    }
    out.push({ seed, people: base, events }); console.error(`pool test: world ${seed} done`);
  }
  writeFileSync(`${OUT}/pool-${A}-${B}.json`, JSON.stringify(out));
} else {
  const worlds: Wd[] = []; for (const f of readdirSync(OUT).filter(f => f.startsWith('pool-'))) worlds.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
  worlds.sort((a, b) => a.seed - b.seed);
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
  const corr = (xs: number[], ys: number[]) => { const mx = mean(xs), my = mean(ys); let a = 0, b = 0, c = 0; for (let i = 0; i < xs.length; i++) { a += (xs[i] - mx) * (ys[i] - my); b += (xs[i] - mx) ** 2; c += (ys[i] - my) ** 2; } return a / Math.sqrt(b * c || 1); };
  const T = (n: number) => [0, 12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.20, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.10, 2.09, 2.09][n - 1] ?? 2.05;
  const ci = (v: number[]) => { const m = mean(v); const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1)); return { m, h: T(v.length) * sd / Math.sqrt(Math.max(1, v.length)) }; };
  const f = (c: { m: number; h: number }, d = 2) => `${c.m >= 0 && d < 3 ? '' : ''}${c.m.toFixed(d)} ±${c.h.toFixed(d)}`;
  const sought = (p: P, r: string) => p.recv[r]?.sought ?? 0, all = (p: P, r: string) => CH.reduce((t, c) => t + (p.recv[r]?.[c] ?? 0), 0);
  const conc = (xs: number[]) => { const s = xs.slice().sort((a, b) => a - b); const t = s.reduce((a, b) => a + b, 0) || 1; const d = Math.max(1, Math.floor(s.length / 10)); return s.slice(-d).reduce((a, b) => a + b, 0) / t; };
  const per = (g: (ps: P[], r: string) => number) => ({ old: ci(worlds.map(x => g(x.people, 'old'))), one: ci(worlds.map(x => g(x.people, 'one'))), d: ci(worlds.map(x => g(x.people, 'one') - g(x.people, 'old'))) });
  const line = (name: string, g: (ps: P[], r: string) => number, d = 2) => { const r = per(g); const sig = Math.abs(r.d.m) > r.d.h ? ' *' : ''; console.log(`  ${name.padEnd(52)} ${f(r.old, d).padStart(14)} ${f(r.one, d).padStart(14)}   Δ ${(r.d.m >= 0 ? '+' : '') + f(r.d, d)}${sig}`); };
  console.log(`${worlds.length} worlds · ${worlds.reduce((s, x) => s + x.people.length, 0)} adults · years 6–10 from a common checkpoint · old rule / one pool, mean ± 95% over worlds\n`);
  console.log('  Sought channel'.padEnd(55) + 'old'.padStart(14) + 'one pool'.padStart(15));
  line('corr(partnered, sought received)', (ps, r) => corr(ps.map(p => +p.partnered), ps.map(p => sought(p, r))));
  line('sought received, singles ÷ partnered', (ps, r) => mean(ps.filter(p => !p.partnered).map(p => sought(p, r))) / Math.max(0.1, mean(ps.filter(p => p.partnered).map(p => sought(p, r)))));
  line('most-sought tenth\'s share of the sought channel', (ps, r) => conc(ps.map(p => sought(p, r))));
  line('corr(standing at 5, sought received)', (ps, r) => corr(ps.map(p => p.st), ps.map(p => sought(p, r))));
  line('corr(sociability, sought received)', (ps, r) => corr(ps.map(p => p.soc), ps.map(p => sought(p, r))));
  line('sought channel\'s share of all contact', (ps, r) => mean(ps.map(p => sought(p, r))) / Math.max(1, mean(ps.map(p => all(p, r)))));
  console.log('  All channels');
  line('most-contacted tenth\'s share of all contact', (ps, r) => conc(ps.map(p => all(p, r))));
  line('corr(sociability, all contact)', (ps, r) => corr(ps.map(p => p.soc), ps.map(p => all(p, r))));
  line('corr(standing at 5, all contact)', (ps, r) => corr(ps.map(p => p.st), ps.map(p => all(p, r))));
  line('strain at year 10, least-contacted tenth', (ps, r) => { const s = ps.slice().sort((a, b) => all(a, r) - all(b, r)); return mean(s.slice(0, Math.max(1, Math.floor(s.length / 10))).map(p => p.stress[r])); });
  console.log('  Downstream (events per world, years 6–10)');
  for (const k of ['dating', 'married', 'born', 'friends', 'madeup', 'cooled', 'left', 'home', 'population']) { const o = ci(worlds.map(x => x.events.old?.[k] ?? 0)), n = ci(worlds.map(x => x.events.one?.[k] ?? 0)), d = ci(worlds.map(x => (x.events.one?.[k] ?? 0) - (x.events.old?.[k] ?? 0))); console.log(`  ${k.padEnd(52)} ${f(o, 1).padStart(14)} ${f(n, 1).padStart(14)}   Δ ${(d.m >= 0 ? '+' : '') + f(d, 1)}${Math.abs(d.m) > d.h ? ' *' : ''}  (${(100 * d.m / Math.max(0.1, o.m)).toFixed(0)}%)`); }
}
