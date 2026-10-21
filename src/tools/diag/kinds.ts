// Kinds of line a life (the distinct event types on a person's page, present years), which readers score (round 36): every adult at the
// end, and the three most eventful adults of each world, as the reading picks them.
//   tsx src/tools/diag/kinds.ts A B [years]   (seeds A..B; OFF= and ON= are read from the environment, as by every check)
// Last line: KINDS {...}
import '../env';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { pageLines } from '../../page';
import { age, live, type Person } from '../../world';

const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];
const perWorld: { seed: number; all: number; top: number; linesTop: number }[] = [];
for (let seed = a; seed <= b; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, yrs);
  const score = (p: Person) => p.events.reduce((t, i) => t + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const page = (p: Person) =>
    pageLines(
      w,
      p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent),
      new Set(p.events),
    );
  const adults = live(w).filter(p => age(w, p) >= 18);
  const all = adults.reduce((t, p) => t + new Set(page(p).map(l => l.e.type)).size, 0) / Math.max(1, adults.length);
  const top3 = adults
    .slice()
    .sort((x, y) => score(y) - score(x) || x.id - y.id)
    .slice(0, 3);
  const top = top3.reduce((t, p) => t + new Set(page(p).map(l => l.e.type)).size, 0) / Math.max(1, top3.length);
  const linesTop = top3.reduce((t, p) => t + page(p).length, 0) / Math.max(1, top3.length);
  perWorld.push({ seed, all: +all.toFixed(3), top: +top.toFixed(3), linesTop: +linesTop.toFixed(2) });
  console.error(`kinds: world ${seed}`);
}
const mean = (k: 'all' | 'top' | 'linesTop') => +(perWorld.reduce((t, x) => t + x[k], 0) / perWorld.length).toFixed(3);
console.log('KINDS ' + JSON.stringify({ seeds: [a, b], all: mean('all'), top: mean('top'), linesTop: mean('linesTop'), perWorld }));
