// Round M26: the paired reading's sensitivity on a known contrast. Sixteen people (the four most eventful adults of each of four worlds),
// each shown as their true page (the present years' events, with reasons) against the same page with its events in a shuffled order of
// years. Each pair is written as A and B in a random order; the key says which is which and goes to nobody who reads.
//   ./run.sh src/tools/diag/m26pair.ts A B → out-m26pair/pairs.txt (for readers) and out-m26pair/key.json
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { age, nameOf, year, type Person, type World } from '../../world';
import { hash } from '../../rng';

const [a0, b0] = process.argv.slice(2);
const A = +(a0 ?? 2873),
  B = +(b0 ?? A + 3);
const OUT = 'out-m26pair';
mkdirSync(OUT, { recursive: true });
const pairs: string[] = [];
const key: Record<string, { seed: number; person: number; name: string; trueIs: 'A' | 'B' }> = {};
let n = 0;
for (let seed = A; seed <= B; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 10);
  const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
  const score = (p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const people = w.people
    .filter(p => p.status !== 'dead' && age(w, p) >= 18)
    .sort((x, y) => score(y) - score(x))
    .slice(0, 4);
  for (const p of people) {
    const lines = p.events
      .map(i => w.events[i])
      .filter(e => e.t >= w.startPresent)
      .map(
        e =>
          `${year(e.t)}: ${plain(e.text)}${
            e.causes.length
              ? '  [' +
                e.causes
                  .slice(0, 3)
                  .map(c => plain(c.label))
                  .join('; ') +
                ']'
              : ''
          }`,
      );
    // The same lines in a shuffled order, keyed by the world and the person, so the pack is the same every time.
    const shuffled = [...lines];
    let h = hash('m26pair', seed, p.id);
    for (let i = shuffled.length - 1; i > 0; i--) {
      h = hash(h, i);
      const k = h % (i + 1);
      [shuffled[i], shuffled[k]] = [shuffled[k], shuffled[i]];
    }
    n++;
    const id = `P${String(n).padStart(2, '0')}`;
    const trueFirst = hash('m26pair-order', seed, p.id) % 2 === 0;
    const [first, second] = trueFirst ? [lines, shuffled] : [shuffled, lines];
    key[id] = { seed, person: p.id, name: nameOf(w, p.id), trueIs: trueFirst ? 'A' : 'B' };
    pairs.push(`##### ${id}, version A\n${first.join('\n')}\n\n##### ${id}, version B\n${second.join('\n')}\n`);
  }
  console.error(`m26pair: world ${seed}`);
}
writeFileSync(`${OUT}/pairs.txt`, pairs.join('\n'));
writeFileSync(`${OUT}/key.json`, JSON.stringify(key, null, 1));
console.log(`${n} pairs in ${OUT}/pairs.txt; key in ${OUT}/key.json`);
