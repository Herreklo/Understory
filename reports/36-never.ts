// Round 36, withdrawn before its test: among adults who went after nothing in ten years with occasions on, why.
//   ON=occasions npx tsx reports/36-never.ts   (throwaway worlds 9001-9008)
import '../src/tools/env';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { age, live } from '../src/world';
import { OWN_KINDS } from '../src/occasions';
const inc = (m: Record<string, number>, k: string) => (m[k] = (m[k] ?? 0) + 1);
const c: Record<string, number> = {};
let n = 0, never = 0;
for (let s = 9001; s <= 9008; s++) {
  const w = buildWorld(s, 1); pickWitness(w); const t0 = w.t; runYears(w, 10);
  for (const p of live(w)) {
    const a = age(w, p); if (a < 18) continue; n++;
    if (p.wants.some(x => x.pursuit && !x.pursuit.owner && x.pursuit.start >= t0)) continue;
    never++;
    const band = a >= 65 ? '65+' : a >= 40 ? '40-64' : '18-39';
    inc(c, 'age ' + band);
    const oldActive = p.wants.some(x => x.pursuit && !x.pursuit.owner && x.pursuit.start < t0 && (!x.done || (x.doneAt != null && w.events[x.doneAt]?.t >= t0 + 24)));
    if (oldActive) inc(c, 'held by a pursuit from before');
    const wanted = p.wants.some(x => OWN_KINDS.has(x.kind) && x.since >= t0 && !x.pursuit?.owner);
    if (wanted) inc(c, 'had a want in the window, never started');
    else inc(c, 'no want in the window');
    if (p.wants.some(x => x.origin)) inc(c, 'had an occasion want');
  }
}
console.log(`adults ${n}, never pursued ${never} (${(100 * never / n).toFixed(0)}%)`);
for (const [k, v] of Object.entries(c).sort()) console.log(`  ${k}: ${v} (${(100 * v / never).toFixed(0)}%)`);
