// A city of 100,000: a town simulated monthly inside a background of this many people on the coarse yearly pass.
//   npx tsx scale/city100k2.ts (S7: every neighbourhood has its own workplaces; none copied by hand)
//   <backgroundPeople> <seed> [pastYears] [focusAdults]
import { performance } from 'perf_hooks';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { age } from '../src/world';
import { hoods, everyone } from '../src/scale';
import { promoteHood, bgPlaces } from '../src/coarse';
const N = +(process.argv[2] ?? 100000), SEED = +(process.argv[3] ?? 1), PAST = +(process.argv[4] ?? 30), FA = +(process.argv[5] ?? 184);
(globalThis as any).SCALE_CITY = N;
const mem = () => Math.round(process.memoryUsage().heapUsed / 1e6);
const t0 = performance.now(); const w = buildWorld(SEED, 1, PAST, FA); pickWitness(w); const buildS = (performance.now() - t0) / 1000;
const count = (st: string) => everyone(w).filter(p => p.status === st).length;
const months: number[] = [];
const over = () => { const n = new Map<string, number>(); for (const p of everyone(w)) if ((p.status === 'in' || p.status === 'bg') && p.job) n.set(p.job, (n.get(p.job) ?? 0) + 1); return [...w.places, ...bgPlaces(w)].filter((pl: any) => (n.get(pl.id) ?? 0) > pl.cap).length; };
for (let m = 0; m < 12; m++) { const t = performance.now(); runYears(w, 1 / 12); months.push(performance.now() - t); }
const yearly = months.filter((_, i) => (w.t - 12 + i + 1) % 12 === 0)[0] ?? Math.max(...months);
const ordinary = months.slice().sort((a, b) => a - b)[5];
const bg = everyone(w).filter(p => p.status === 'bg'); const inn = w.people.filter(p => p.status === 'in'); const inBefore = inn.length; // the people the timed months were run for
const share = (ps: typeof bg, f: (p: any) => boolean) => +(ps.filter(f).length / ps.length).toFixed(3);
const demo = (ps: typeof bg) => ({ n: ps.length, under20: share(ps, p => age(w, p) < 20), over65: share(ps, p => age(w, p) >= 65), partneredAdults: +(ps.filter(p => age(w, p) >= 18 && p.partner != null).length / ps.filter(p => age(w, p) >= 18).length).toFixed(3) });
const work = (ps: typeof bg) => { const W = ps.filter(p => age(w, p) >= 20 && age(w, p) < 65); return +(W.filter(p => p.job).length / W.length).toFixed(3); };
const F = (w as any).focus as Set<number>; const target = [...Array(hoods(w)).keys()].find(h => !F.has(h) && bg.some(p => (p as any).hood === h))!;
const tp = performance.now(); const prom = promoteHood(w, target); const promoteS = (performance.now() - tp) / 1000;
const after: number[] = []; for (let m = 0; m < 6; m++) { const t = performance.now(); runYears(w, 1 / 12); after.push(performance.now() - t); }
console.log(JSON.stringify({ background: N, seed: SEED, past: PAST, focusAdults: FA, hoods: hoods(w), buildS: +buildS.toFixed(1), heapMB: mem(),
  status: { in: count('in'), bg: count('bg'), gone: count('gone'), away: count('away'), dead: count('dead') }, events: w.events.length,
  inBefore, msOrdinaryMonth: Math.round(ordinary), msPerPersonMonth: +(ordinary / inBefore).toFixed(3), msYearEndMonth: Math.round(yearly), coarseYearMs: Math.round(yearly - ordinary),
  promoted: prom, promoteS: +promoteS.toFixed(1), msPerMonthAfter: Math.round(after.reduce((s, x) => s + x, 0) / after.length),
  demography: { focus: demo(inn), background: demo(bg) }, working: { focus: work(inn), background: work(bg) }, placesOverCap: over(), places: w.places.length + bgPlaces(w).length }));
