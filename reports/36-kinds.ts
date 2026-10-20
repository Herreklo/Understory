// Round 36: kinds of line a life (distinct event types on the page, present years), every adult and the three busiest of each world.
//   ON=occasions npx tsx reports/36-kinds.ts   and without ON (throwaway worlds 9001-9008)
import '../src/tools/env';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { pageLines } from '../src/page';
import { age, live, type Person } from '../src/world';
let nTop = 0, kTop = 0, nAll = 0, kAll = 0, lTop = 0;
for (let s = 9001; s <= 9008; s++) {
  const w = buildWorld(s, 1); pickWitness(w); runYears(w, 10);
  const score = (p: Person) => p.events.reduce((t, i) => t + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const kinds = (p: Person) => {
    const L = pageLines(w, p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent), new Set(p.events));
    return [new Set(L.map(l => l.e.type)).size, L.length];
  };
  const ad = live(w).filter(p => age(w, p) >= 18);
  for (const p of ad) { nAll++; kAll += kinds(p)[0]; }
  for (const p of ad.slice().sort((a, b) => score(b) - score(a) || a.id - b.id).slice(0, 3)) { nTop++; const [k, l] = kinds(p); kTop += k; lTop += l; }
}
console.log(`kinds a life: every adult ${(kAll / nAll).toFixed(2)}; three busiest ${(kTop / nTop).toFixed(2)} (lines ${(lTop / nTop).toFixed(1)})`);
