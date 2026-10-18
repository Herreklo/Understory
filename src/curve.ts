// The learning curve: does knowing someone longer make them more predictable? And the ceiling: how well could anyone predict?
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { peekBond, type World } from './world';
const bucket = (m: number) => m < 6 ? '<6m' : m < 18 ? '6-18m' : m < 36 ? '1.5-3y' : m < 72 ? '3-6y' : '6y+';
const acc = new Map<string, { n: number; hit: number; ceil: number; ceilHit: number }>();
let first = new Map<string, number>(); // when the witness first learned anything about a person
for (let seed = 1; seed <= 12; seed++) {
  const w = buildWorld(seed, 1); pickWitness(w);
  first = new Map();
  const firstSeen = (pid: number) => { const k = `${seed}|${pid}`; if (!first.has(k)) { const bm = w.beliefs.get(w.witness!); let t = Infinity; if (bm) for (const [key, b] of bm) if (key.startsWith(pid + '|')) t = Math.min(t, b.last - 0); first.set(k, Math.min(w.startPresent, t)); } return first.get(k)!; };
  // run month by month so "months known" is measured as events happen
  for (let m = 0; m < 120; m++) {
    const n0 = w.events.length; runYears(w, 1 / 12);
    for (const e of w.events.slice(n0)) {
      const d = e.decision; if (!d || !d.witnessGuess) continue;
      const r = peekBond(w, w.witness!, d.person);
      const since = (r as any)?.since;
      const b = r && since != null ? bucket(Math.max(0, w.t - since)) : 'never met';
      const a = acc.get(b) ?? { n: 0, hit: 0, ceil: 0, ceilHit: 0 }; acc.set(b, a);
      a.n++; if (d.witnessGuess === d.chosen) a.hit++;
      const best = d.options.slice().sort((x, y) => y.p - x.p)[0]; a.ceil += best.p; if (best.id === d.chosen) a.ceilHit++;
    }
  }
}
console.log('known for'.padEnd(10), 'decisions', 'witness right', 'mind-reader right', 'avg best-option p');
// by amount of evidence held, not years
const byEv = new Map<string, { n: number; hit: number }>();
for (const k of ['never met', '<6m', '6-18m', '1.5-3y', '3-6y', '6y+']) { const a = acc.get(k); if (!a) continue; console.log(k.padEnd(10), String(a.n).padStart(9), (100 * a.hit / a.n).toFixed(0).padStart(12) + '%', (100 * a.ceilHit / a.n).toFixed(0).padStart(16) + '%', (100 * a.ceil / a.n).toFixed(0).padStart(16) + '%'); }
