import { buildWorld, runYears } from '../build';
import { againNote, pageLines } from '../page';
import { pickWitness, scoreAll, hunches, hindsight } from '../witness';
import { age, fullName, year, type World, type Person, nameOf, OFF, ON } from '../world';
import { FACET_BY_ID, VALUES } from '../core';
for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x); // an arm without a mechanism: OFF=threads
for (const x of (process.env.ON ?? '').split(',').filter(Boolean)) ON.add(x);
const seed = +(process.argv[2] ?? 2);
const w = buildWorld(seed, 1);
const wit = pickWitness(w);
runYears(w, 10);
scoreAll(w);
const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
const VN = Object.fromEntries(VALUES.map(v => [v.id, v.name]));
console.log(`Witness: ${fullName(wit)}, ${wit.job}. Years ${year(w.startPresent)}–${year(w.t)}\n`);
const score = (p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
for (const p of w.people
  .filter(x => x.status !== 'dead')
  .sort((a, b) => score(b) - score(a))
  .slice(0, 5)) {
  console.log(
    `== ${fullName(p)}, ${Math.floor(age(w, p))} · TRUTH: ${p.signatures.map(s => FACET_BY_ID[s.facet].name + (s.z > 0 ? '+' : '−')).join(', ')} · values ${p.coreValues.map(v => VN[v]).join(', ')}${p.tension ? ' · ' + p.tension.label : ''}\n   if-then: ${p.ifThens.map(x => x.words).join('; ')}\n   self: ${p.selfStory.map(x => x.text).join('; ') || '(none)'}${p.founder && p.foundingPast.length ? '\n   past: ' + p.foundingPast.join('; ') : ''}${p.marks.length ? '\n   marks: ' + p.marks.map(m => m.text).join('; ') : ''}${p.exceptions.length ? '\n   exceptions: ' + p.exceptions.map(x => plain(x.text)).join('; ') : ''}`,
  );
  const events = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent - 120);
  for (const { e, cited, again } of pageLines(w, events, new Set(p.events))) {
    const past = e.t < w.startPresent ? '  ' : '  ';
    console.log(
      `${past}${year(e.t)}: ${plain(e.text)}${
        e.causes.length
          ? '  [' +
            e.causes
              .slice(0, 3)
              .map(c => plain(c.label))
              .join('; ') +
            ']'
          : ''
      }${again ? `  (${againNote(again)})` : ''}${e.surprise != null && e.surprise > 0.5 ? `  ← surprise ${e.surprise.toFixed(2)} / explain ${(e.explain ?? 0).toFixed(2)}` : ''}`,
    );
    for (const x of cited) console.log(`      ↳ ${year(x.t)}: ${plain(x.text)}`);
  }
  const h = hunches(w, p);
  console.log(`   WITNESS: ${h.length ? h.map(x => x.text + (x.right ? '' : ' (wrong)')).join(' ') : 'no real sense of them yet'}`);
  const big = p.events
    .map(i => w.events[i])
    .filter(e => e.surprise != null && e.surprise > 0.5 && e.w >= 1)
    .sort((a, b) => b.surprise! - a.surprise!)[0];
  if (big) {
    const hs = hindsight(w, big);
    console.log(
      `   HINDSIGHT on "${plain(big.text)}": could have seen: ${hs.seen.map(plain).join('; ') || 'nothing'} · could not: ${hs.unseen.map(plain).join('; ') || 'nothing'}`,
    );
  }
  console.log();
}
