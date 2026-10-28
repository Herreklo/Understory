// P3 refresh (28 Oct 2026): who surrounds the people a condition would expose, on current main. Reads the world only.
//   ./run.sh notes/research/sources/environment-scripts/probe47.ts A B
// Once a year for 10 present years, for each adult 75+ or ill: the people tied to them, by tie (household, kin in town, friends,
// colleagues, acquaintances who like them), and for the ones not yet friends or kin, whether a help act of a given size could carry
// the pair over the friendship bar (social.ts checkBond: both likes above 0.45, familiarity above 0.5; `near` is ignored, so it errs low).
import '../../../../src/tools/env';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { live, age, peekBond } from '../../../../src/world';
import { family } from '../../../../src/grammar';

const [A, B] = [Number(process.argv[2] ?? 9001), Number(process.argv[3] ?? 9020)];
const like = (w: any, a: number, b: number) => peekBond(w, a, b)?.like ?? 0;
const fam = (w: any, a: number, b: number) => peekBond(w, a, b)?.fam ?? 0;
const tot: Record<string, number> = {};
const add = (k: string, n = 1) => (tot[k] = (tot[k] ?? 0) + n);
const sizes: number[] = [];
for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  for (let m = 0; m < 120; m++) {
    tick(w);
    if (m % 12 !== 11) continue;
    const ps = live(w);
    for (const x of ps) {
      if (age(w, x) < 18 || !(age(w, x) >= 75 || (x as any).ill > 0)) continue;
      add('exposed');
      const seen = new Set<number>();
      const put = (q: any, kind: string) => {
        if (!q || q === x || seen.has(q.id) || q.status !== 'in' || age(w, q) < 16) return;
        seen.add(q.id);
        add('c:' + kind);
        if (kind === 'colleague' || kind === 'acquaintance') {
          const lq = like(w, q.id, x.id),
            lx = like(w, x.id, q.id),
            f = Math.min(fam(w, q.id, x.id), fam(w, x.id, q.id));
          if (lq > 0.45 && f > 0.5) {
            add('nf:helperLikes');
            for (const g of [0.25, 0.45]) if (lx + g > 0.45) add('nf:cross' + g);
          }
          add('nf');
        }
      };
      put(w.byId.get(x.partner as any), 'household');
      for (const id of [...x.kids, ...x.parents]) put(w.byId.get(id), 'kin');
      for (const q of ps) if (q !== x && family(q, x)) put(q, 'kin');
      for (const id of x.friends) put(w.byId.get(id), 'friend');
      if (x.job) for (const q of ps) if (q.job === x.job) put(q, 'colleague');
      for (const q of ps) if (like(w, q.id, x.id) > 0.2 && fam(w, q.id, x.id) > 0.3) put(q, 'acquaintance');
      sizes.push(seen.size);
      if (seen.size === 0) add('nobody');
      if (
        ![...seen].some(id => {
          const q = w.byId.get(id)!;
          return q.id === x.partner || family(q, x) || x.friends.has(id);
        })
      )
        add('noCloseTie');
    }
  }
}
sizes.sort((a, b) => a - b);
const n = tot['exposed'];
console.log(`${B - A + 1} worlds, yearly samples of adults 75+ or ill: ${n} person-years (${(n / (B - A + 1) / 10).toFixed(1)} a world-year)`);
for (const k of Object.keys(tot).sort()) console.log(`${k.padEnd(18)} ${String(tot[k]).padStart(6)}  per exposed ${(tot[k] / n).toFixed(2)}`);
console.log(`ties per exposed: median ${sizes[sizes.length >> 1]}, p90 ${sizes[Math.floor(sizes.length * 0.9)]}, max ${sizes.at(-1)}`);
