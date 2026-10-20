// A paired reading across one switch (M26's method, made general): the same people shown as the engine writes them with the switch on
// and with it off, each pair as A and B in a random order; the key says which is which and goes to nobody who reads. The people are the
// adults of each world most eventful over both arms together (the sum of their present-years weight in each), matched across arms by
// name and birth (the past differs between arms, so a person born or arrived during it may exist in one arm only, or carry another's
// id). Ranking by one arm alone would lean the reading toward that arm: a person picked for an eventful life in one arm regresses
// toward the mean in the other (round 29, STATUS weakness 15). The page is what the app shows:
// the present years' lines with their reasons, folded as src/page.ts folds them, in both arms alike.
//   ./run.sh src/tools/diag/pairarm.ts <switch> A B [per world] → out-pair-<switch>/pairs.txt (for readers) and key.json
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { age, nameOf, year, OFF, type Person, type World } from '../../world';
import { againNote, pageLines } from '../../page';
import { hash } from '../../rng';

const [sw, a0, b0, n0] = process.argv.slice(2);
if (!sw) throw new Error('usage: pairarm.ts <switch> A B [per world]');
const A = +(a0 ?? 2921),
  B = +(b0 ?? A + 3),
  PER = +(n0 ?? 3);
const OUT = `out-pair-${sw}`;
mkdirSync(OUT, { recursive: true });

function page(w: World, p: Person): string[] {
  const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
  const events = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
  const out: string[] = [];
  for (const { e, cited, again } of pageLines(w, events, new Set(p.events))) {
    const why = e.causes.length
      ? '  [' +
        e.causes
          .slice(0, 3)
          .map(c => plain(c.label))
          .join('; ') +
        ']'
      : '';
    out.push(`${year(e.t)}: ${plain(e.text)}${why}${again ? `  (${againNote(again)})` : ''}`);
    for (const x of cited) out.push(`    ↳ ${year(x.t)}: ${plain(x.text)}`);
  }
  return out;
}
function world(seed: number, on: boolean): World {
  if (on) OFF.delete(sw);
  else OFF.add(sw);
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 10);
  return w;
}

const pairs: string[] = [];
const key: Record<string, { seed: number; person: number; name: string; onIs: 'A' | 'B' }> = {};
let n = 0;
for (let seed = A; seed <= B; seed++) {
  const off = world(seed, false);
  const on = world(seed, true);
  const score = (w: World, p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const same = (p: Person) => on.people.find(q => q.first === p.first && q.last === p.last && q.born === p.born && q.sex === p.sex);
  const people = off.people
    .filter(p => p.status !== 'dead' && age(off, p) >= 18 && same(p)?.status === 'in')
    .sort((x, y) => score(off, y) + score(on, same(y)!) - score(off, x) - score(on, same(x)!))
    .slice(0, PER);
  for (const p of people) {
    const q = same(p)!;
    const head = `${nameOf(off, p.id)}, ${Math.floor(age(off, p))} in ${year(off.t)}`;
    if (nameOf(on, q.id) !== nameOf(off, p.id)) console.error(`pairarm: ${nameOf(off, p.id)} is ${nameOf(on, q.id)} in the on arm`);
    const [pOff, pOn] = [page(off, p), page(on, q)];
    n++;
    const id = `P${String(n).padStart(2, '0')}`;
    const onFirst = hash('pairarm', sw, seed, p.id) % 2 === 0;
    const [first, second] = onFirst ? [pOn, pOff] : [pOff, pOn];
    key[id] = { seed, person: p.id, name: nameOf(off, p.id), onIs: onFirst ? 'A' : 'B' };
    pairs.push(`##### ${id}, version A — ${head}\n${first.join('\n')}\n\n##### ${id}, version B — ${head}\n${second.join('\n')}\n`);
  }
  console.error(`pairarm: world ${seed}`);
}
writeFileSync(`${OUT}/pairs.txt`, pairs.join('\n'));
writeFileSync(`${OUT}/key.json`, JSON.stringify(key, null, 1));
console.log(`${n} pairs in ${OUT}/pairs.txt; key in ${OUT}/key.json`);
