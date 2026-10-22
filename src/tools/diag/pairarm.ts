// A paired reading across one switch (M26's method, made general): the same people shown as the engine writes them with the switch on
// and with it off, each pair as A and B in a random order; the key says which is which and goes to nobody who reads. The people are the
// adults of each world most eventful over both arms together (the sum of their present-years weight in each), matched across arms by
// name and birth (the past differs between arms, so a person born or arrived during it may exist in one arm only, or carry another's
// id). Ranking by one arm alone would lean the reading toward that arm: a person picked for an eventful life in one arm regresses
// toward the mean in the other (round 29, STATUS weakness 15). The page is what the app shows:
// the present years' lines with their reasons, folded as src/page.ts folds them, in both arms alike.
//   ./run.sh src/tools/diag/pairarm.ts <switch> A B [per world] → out-pair-<name>/pairs.txt (for readers; in parts of twelve pairs as
//   pairs-1.txt, pairs-2.txt... when larger), key.json and meta.json. Scored by scripts/pairscore.py.
// <switch> is a mechanism that is on unless OFF=<name> (a round under test), or +<name> for one that is off unless ON=<name> (a round not
// kept, read again). meta.json records the switch, its kind, the worlds and the commit, so a pack can be made again from the same tree.
import { mkdirSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { age, nameOf, year, OFF, ON, type Person, type World } from '../../world';
import { againNote, pageLines, shownCauses } from '../../page';
import { hash } from '../../rng';

const [sw, a0, b0, n0] = process.argv.slice(2);
if (!sw) throw new Error('usage: pairarm.ts <switch>|+<switch> A B [per world]');
const onKind = sw.startsWith('+'),
  name = sw.replace(/^\+/, '');
const A = +(a0 ?? 2921),
  B = +(b0 ?? A + 3),
  PER = +(n0 ?? 3);
// PICK=random (round 39): the people read are adults drawn at random among those in town in both arms, not the most eventful, so a
// change meant for the quiet majority is read where it lands.
const PICK = process.env.PICK === 'random' ? 'random' : 'eventful';
// NULL=<run seed> (M38): a null pair. Both arms run the engine as it is, with no switch changed; the on arm lives the present on another
// run seed, so the same people with the same past live another present by chance. Read blind, it shows what readers find where nothing
// changed.
const NULL = process.env.NULL ? +process.env.NULL : 0;
const OUT = `out-pair-${name}${PICK === 'random' ? '-random' : ''}`;
mkdirSync(OUT, { recursive: true });

function page(w: World, p: Person): string[] {
  const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
  const events = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
  const out: string[] = [];
  let n = 0;
  // Each line is numbered, so readers cite a fault by its line (M38); an earlier event shown under a line (↳) has no number of its own.
  for (const { e, cited, again, firstT } of pageLines(w, events, new Set(p.events))) {
    const shown = shownCauses(e);
    const why = shown.length ? '  [' + shown.map(c => plain(c.label)).join('; ') + ']' : '';
    out.push(`${String(++n).padStart(3)}  ${year(e.t)}: ${plain(e.text)}${why}${again ? `  (${againNote(again, firstT)})` : ''}`);
    for (const x of cited) out.push(`       ↳ ${year(x.t)}: ${plain(x.text)}`);
  }
  return out;
}
function world(seed: number, on: boolean): World {
  if (NULL) {
    const w = buildWorld(seed, on ? NULL : 1);
    pickWitness(w);
    runYears(w, 10);
    return w;
  }
  if (onKind) {
    if (on) ON.add(name);
    else ON.delete(name);
  } else if (on) OFF.delete(name);
  else OFF.add(name);
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 10);
  return w;
}

// Each pair is kept as both pages until every pair is chosen; then which arm comes first is dealt out half and half (an odd pair
// out goes by the hash), shuffled by a hash of the switch, so readers who lean toward the version they read second lean equally
// toward both arms.
// How much happens in a page: its lines, and its kinds of line (the event types on it), which readers score (round 36).
function measure(w: World, p: Person) {
  const lines = pageLines(
    w,
    p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent),
    new Set(p.events),
  );
  return { lines: lines.length, kinds: new Set(lines.map(l => l.e.type)).size };
}
const made: {
  id: string;
  head: string;
  on: string[];
  off: string[];
  seed: number;
  person: number;
  name: string;
  m: { on: { lines: number; kinds: number }; off: { lines: number; kinds: number } };
}[] = [];
let n = 0;
for (let seed = A; seed <= B; seed++) {
  const off = world(seed, false);
  const on = world(seed, true);
  const score = (w: World, p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const same = (p: Person) => on.people.find(q => q.first === p.first && q.last === p.last && q.born === p.born && q.sex === p.sex);
  const people = off.people
    .filter(p => p.status !== 'dead' && age(off, p) >= 18 && same(p)?.status === 'in')
    .sort((x, y) =>
      PICK === 'random'
        ? hash('pick', seed, x.id) - hash('pick', seed, y.id) || x.id - y.id
        : score(off, y) + score(on, same(y)!) - score(off, x) - score(on, same(x)!),
    )
    .slice(0, PER);
  for (const p of people) {
    const q = same(p)!;
    const head = `${nameOf(off, p.id)}, ${Math.floor(age(off, p))} in ${year(off.t)}`;
    if (nameOf(on, q.id) !== nameOf(off, p.id)) console.error(`pairarm: ${nameOf(off, p.id)} is ${nameOf(on, q.id)} in the on arm`);
    n++;
    made.push({
      id: `P${String(n).padStart(2, '0')}`,
      head,
      on: page(on, q),
      off: page(off, p),
      seed,
      person: p.id,
      name: nameOf(off, p.id),
      m: { on: measure(on, q), off: measure(off, p) },
    });
  }
  console.error(`pairarm: world ${seed}`);
}
const order = made.map((_, i) =>
  i < Math.floor(made.length / 2) ? true : i < 2 * Math.floor(made.length / 2) ? false : hash('pairarm', sw, i) % 2 === 0,
);
for (let i = order.length - 1; i > 0; i--) {
  const j = hash('pairarm', sw, A, B, i) % (i + 1);
  [order[i], order[j]] = [order[j], order[i]];
}
const pairs: string[] = [];
const key: Record<
  string,
  { seed: number; person: number; name: string; onIs: 'A' | 'B'; on: { lines: number; kinds: number }; off: { lines: number; kinds: number } }
> = {};
made.forEach((m, i) => {
  const onFirst = order[i];
  const [first, second] = onFirst ? [m.on, m.off] : [m.off, m.on];
  key[m.id] = { seed: m.seed, person: m.person, name: m.name, onIs: onFirst ? 'A' : 'B', on: m.m.on, off: m.m.off };
  pairs.push(`##### ${m.id}, version A — ${m.head}\n${first.join('\n')}\n\n##### ${m.id}, version B — ${m.head}\n${second.join('\n')}\n`);
});
writeFileSync(`${OUT}/pairs.txt`, pairs.join('\n'));
// A reader reads at most twelve pairs at a sitting: a larger pack is also written in parts (pairs-1.txt, pairs-2.txt, ...), twelve
// pairs each, in order, for one reader each; the key covers them all.
const PART = 12;
if (pairs.length > PART)
  for (let i = 0; i * PART < pairs.length; i++) writeFileSync(`${OUT}/pairs-${i + 1}.txt`, pairs.slice(i * PART, (i + 1) * PART).join('\n'));
writeFileSync(`${OUT}/key.json`, JSON.stringify(key, null, 1));
let commit = '';
try {
  commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
} catch {
  commit = 'unknown';
}
writeFileSync(
  `${OUT}/meta.json`,
  JSON.stringify({ switch: name, kind: NULL ? `NULL=${NULL}` : onKind ? 'ON' : 'OFF', worlds: [A, B], perWorld: PER, pick: PICK, commit }, null, 1),
);
console.log(`${n} pairs in ${OUT}/pairs.txt; key in ${OUT}/key.json`);
