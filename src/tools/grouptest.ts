// Deterministic test of group escalation: in one group, the second row in three years earns a word, the third an asking-to-leave.
// Finds a world where one member rows repeatedly and checks the order of events for that member.
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { escalation } from '../group';
// Constructed histories first: the rule on its own, at exact dates (months).
const unit: [number[], number | undefined, number, string][] = [
  [[], undefined, 100, 'row'], // first row ever
  [[90], undefined, 100, 'word'], // second row in three years: a word
  [[90], 100, 101, 'asked'], // a row while a warning stands: asked to go
  [[70, 90], undefined, 100, 'asked'], // third row in three years: asked, word or no word
  [[20], undefined, 100, 'row'], // the earlier row lapsed (80 months ago): back to a first row
  [[20], 24, 100, 'row'], // the warning lapsed too (76 months)
  [[64], 64, 100, 'asked'], // warning exactly at the edge (36 months) still stands
  [[63], 63, 100, 'row'], // one month past the edge, row and warning have both lapsed
];
let ubad = 0;
for (const [rows, warned, now, want] of unit) {
  const got = escalation(rows, warned, now);
  if (got !== want) {
    ubad++;
    console.log(`escalation(${JSON.stringify(rows)}, ${warned}, ${now}) = ${got}, expected ${want}`);
  }
}
if (ubad) {
  console.log(`GROUP ESCALATION FAILED: ${ubad} constructed cases wrong`);
  process.exit(1);
}
let checked = 0,
  bad = 0;
for (let seed = 1; seed <= 30 && checked < 6; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 20);
  // The rule is the group's: rows are counted within one group, so a person who rowed elsewhere and joined fresh starts at zero here.
  const byPerson = new Map<string, { t: number; kind: string }[]>();
  for (const g of w.groups)
    for (const i of g.events) {
      const e = w.events[i];
      const k =
        e.type === 'quitgroup' || e.type === 'stayfor'
          ? 'row'
          : e.type === 'group:word'
            ? 'word'
            : e.type === 'group:left' && /asked .* to go/.test(e.text)
              ? 'asked'
              : null;
      if (!k) continue;
      const who = k === 'word' ? e.who[1] : e.who[0];
      const key = `${g.name}|${who}`;
      const l = byPerson.get(key) ?? [];
      l.push({ t: e.t, kind: k });
      byPerson.set(key, l);
    }
  for (const [id, l] of byPerson) {
    const words = l.filter(x => x.kind === 'word'),
      asked = l.filter(x => x.kind === 'asked');
    if (!words.length && !asked.length) continue;
    checked++;
    // Before the first word there must be exactly one earlier row within three years (the word comes on the second). An asking must follow a word.
    // Rows count from any time (the rule does); only warnings and askings in the present are judged.
    for (const wd of words.filter(x => x.t >= w.startPresent)) {
      const before = l.filter(x => x.kind === 'row' && x.t < wd.t && wd.t - x.t <= 36).length;
      if (before !== 1) {
        bad++;
        console.log(`seed ${seed} person ${id}: word after ${before} earlier rows (expected 1)`);
      }
    }
    for (const a of asked.filter(x => x.t >= w.startPresent)) {
      if (!words.some(wd => wd.t < a.t && a.t - wd.t <= 36)) {
        bad++;
        console.log(`seed ${seed} person ${id}: asked to leave without a word in the three years before`);
      }
    }
  }
}
if (checked < 3) {
  console.log(`GROUP ESCALATION FAILED: only ${checked} cases found in generated worlds (need 3)`);
  process.exit(1);
}
console.log(
  bad
    ? `GROUP ESCALATION FAILED: ${bad} violations in ${checked} cases`
    : `group escalation ok: ${unit.length} constructed cases; ${checked} generated cases, word on the second row, asked after a word`,
);
if (bad) process.exit(1);
