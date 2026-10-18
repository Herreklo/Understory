// Diagnosis after round 20's result (used worlds 1871–1874 only): why most couples never row, and what ends the ones that end.
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { live, likeOf, P } from '../../world';
import { loving } from '../../love';
const q = (v: number[], x: number) => {
  const s = v.slice().sort((a, b) => a - b);
  return s[Math.floor(x * (s.length - 1))] ?? 0;
};
const strainParts: Record<string, number[]> = { base: [], stress: [], drink: [], money: [], attach: [], values: [], ease: [], net: [] };
const maxT = new Map<string, number>(),
  rows = new Map<string, number>(),
  likeMin = new Map<string, number>();
const ended: string[] = [];
for (const seed of [1871, 1872, 1873, 1874]) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const log: any[] = [];
  (w as any).loveLog = log;
  let seen = 0;
  const n0 = w.events.length;
  for (let m = 0; m < 120; m++) {
    tick(w);
    for (; seen < log.length; seen++) {
      const x = log[seen];
      if (x.care || x.s === 'letslide') continue;
      const k = `${seed}:${Math.min(x.a, x.b)}-${Math.max(x.a, x.b)}`;
      rows.set(k, (rows.get(k) ?? 0) + 1);
    }
    for (const p of live(w)) {
      if (p.partner == null || p.id > p.partner) continue;
      const o = P(w, p.partner);
      if (o.status !== 'in') continue;
      const k = `${seed}:${p.id}-${o.id}`;
      const t = (p as any)['couple:' + o.id] ?? 0;
      maxT.set(k, Math.max(maxT.get(k) ?? 0, t));
      likeMin.set(k, Math.min(likeMin.get(k) ?? 9, likeOf(w, p.id, o.id), likeOf(w, o.id, p.id)));
      if (m % 12 === 6) {
        const Lp = loving(w, p),
          Lq = loving(w, o);
        let d = 0;
        for (const v of ['freedom', 'tradition', 'success', 'lovedOnes', 'fairness']) d += Math.abs((p.values[v] ?? 0) - (o.values[v] ?? 0));
        const parts = {
          base: 0.02,
          stress: 0.06 * (p.stress + o.stress),
          drink: (p.drinks ? 0.05 : 0) + (o.drinks ? 0.05 : 0),
          money: p.savings < -3 || o.savings < -3 ? 0.04 : 0,
          attach: 0.02 * Math.max(0, Lp.anxiety) * Math.max(0, Lq.avoidance) + 0.02 * Math.max(0, Lq.anxiety) * Math.max(0, Lp.avoidance),
          values: 0.006 * d,
          ease: (-0.025 * (Math.max(-1, Lp.responsive) + Math.max(-1, Lq.responsive) + 2)) / 2,
        };
        let net = 0;
        for (const [k2, v] of Object.entries(parts)) {
          strainParts[k2].push(v);
          net += v;
        }
        strainParts.net.push(net);
      }
    }
  }
  for (const e of w.events.slice(n0))
    if (e.type === 'divorce' || e.type === 'split')
      ended.push(
        `${seed}:${Math.min(e.who[0], e.who[1])}-${Math.max(e.who[0], e.who[1])}|${e.type}|${e.causes.map(c => c.label.replace(/@\d+/g, '@')).join('; ')}`,
      );
}
console.log('monthly strain by part, couple-years sampled mid-year (median / 90th):');
for (const [k, v] of Object.entries(strainParts)) console.log(`  ${k.padEnd(7)} ${q(v, 0.5).toFixed(3)} / ${q(v, 0.9).toFixed(3)}`);
console.log(
  `  net strain > 0.028 (equilibrium tension above the 0.35 bar): ${((100 * strainParts.net.filter(x => x > 0.028).length) / strainParts.net.length).toFixed(0)}% of couple-years`,
);
const mt = [...maxT.values()];
console.log(
  `highest tension a couple reached in the decade: median ${q(mt, 0.5).toFixed(2)}, 90th ${q(mt, 0.9).toFixed(2)}; couples ${mt.length}; rowed at all ${[...maxT.keys()].filter(k => rows.has(k)).length}`,
);
console.log(
  `lowest liking either partner reached: median ${q([...likeMin.values()], 0.5).toFixed(2)}, 10th ${q([...likeMin.values()], 0.1).toFixed(2)}; below zero ${[...likeMin.values()].filter(x => x < 0).length}`,
);
console.log(`ended (${ended.length}):`);
for (const x of ended) {
  const [k, type, why] = x.split('|');
  console.log(`  ${type}: rows ${rows.get(k) ?? 0}, max tension ${(maxT.get(k) ?? 0).toFixed(2)} · ${why}`);
}
