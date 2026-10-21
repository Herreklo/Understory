// Round 41's own count: lines readers quote as broken or untrue in every reading (rounds 39 and 40, both arms), counted over the pages of
// every adult (present years, rendered as the reading renders them) and, where the line makes a claim about the person, checked against
// the record at the time it was said. Its tests are its own, not the engine's.
//   tsx src/tools/diag/faults.ts A B [years]   (seeds A..B; OFF= and ON= are read from the environment, as by every check)
// Last line: FAULTS {...}
import '../env';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { againNote, pageLines, shownCauses } from '../../page';
import { age, live, nameOf, year, type World, type Person, type Event } from '../../world';

const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];
// Words: a span or a count no one would say, a fold note readers take for an artefact, a broken phrase.
const WORDS: Record<string, RegExp> = {
  decimalYears: /\b\d+\.\d+ years\b/,
  oneYears: /\b1 years\b|\bin 1 years\b|\b0 years\b/,
  foldNote: /\((and once more between|and \d+ more times between)\)/,
  itSong: /'s it was the best thing/,
  houseFor: /fixed a (house|boat|car)\b[^.]* of (his|her) own for|fixed a decent car for/,
  worstThe: /the worst the /,
  stoppedSeeing:
    /stopped seeing each other.*\[[^\]]*they stopped seeing each other|drifted out of each other's lives\.\s+\[[^\]]*they stopped seeing each other|lost touch\.\s+\[[^\]]*they stopped seeing each other/,
  neededSaying: /(drifted out of each other's lives|lost touch|stopped seeing each other|drifted apart)\.?\s+\[[^\]]*thought it needed saying/,
};
const out = {
  seeds: [a, b],
  worlds: 0,
  adults: 0,
  lines: 0,
  words: Object.fromEntries(Object.keys(WORDS).map(k => [k, 0])) as Record<string, number>,
  // Claims checked against the record when said:
  insteadUncited: 0, // "Instead, …" with no earlier way of the same person on the page, and no event among its reasons
  hatchetYear: 0, // "buried the hatchet, 1 year after" when the contest began less than a year before
  stoppedBringing: 0, // "had stopped bringing things up with X" when the person had raised something with X within the year
  stoppedBringingSaid: 0,
  nothingChanged: 0, // "Nothing had changed since …" lines
  babyNotBaby: 0, // "there was a baby at home" when the youngest child at home was two or more
  babySaid: 0,
  workNoJob: 0, // "buried herself in work" by someone with no job
  workSaid: 0,
  examples: [] as string[],
};
const perWorld: { seed: number; faults: number }[] = [];

for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  out.worlds++;
  const before =
    Object.values(out.words).reduce((s, x) => s + x, 0) +
    out.insteadUncited +
    out.hatchetYear +
    out.stoppedBringing +
    out.babyNotBaby +
    out.workNoJob;
  const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
  const say = (s: string) => {
    if (out.examples.length < 40) out.examples.push(`${seed} ${plain(s)}`);
  };
  for (let m = 0; m < yrs * 12; m++) {
    const from = w.events.length;
    tick(w);
    for (let i = from; i < w.events.length; i++) {
      const e = w.events[i];
      if (e.t < w.startPresent) continue;
      const x = w.byId.get(e.who[0]);
      if (!x) continue;
      if (/buried (him|her)self in work/.test(e.text)) {
        out.workSaid++;
        if (x.job == null) {
          out.workNoJob++;
          say(e.text);
        }
      }
      if (/there was a baby at home/.test(e.text)) {
        out.babySaid++;
        const kids = x.kids.map(id => w.byId.get(id)!).filter(c => c && c.status === 'in');
        const youngest = kids.length ? Math.min(...kids.map(c => age(w, c))) : 99;
        if (youngest >= 2) {
          out.babyNotBaby++;
          say(`${e.text} [youngest ${youngest.toFixed(1)}]`);
        }
      }
      const sb = e.text.match(/@(\d+) had stopped bringing things up with @(\d+)/);
      if (e.type === 'couple:pattern' && sb) {
        out.stoppedBringingSaid++;
        const p = +sb[1],
          q = +sb[2];
        const raised = w.events
          .slice(Math.max(0, i - 4000), i)
          .some(
            f =>
              w.t - f.t < 12 && String((f.decision as any)?.trigger ?? '') === 'row' && f.who[0] === p && f.who.includes(q) && f.type !== 'letslide',
          );
        if (raised) {
          out.stoppedBringing++;
          say(e.text);
        }
      }
      if (/buried the hatchet, 1 year after/.test(e.text)) {
        const first = e.causes.filter(c => c.kind === 'event' && c.ref != null).map(c => w.events[c.ref!].t);
        if (first.length && w.t - Math.min(...first) < 12) {
          out.hatchetYear++;
          say(e.text);
        }
      }
    }
  }
  // Pages: every adult's present years, rendered as the reading renders them.
  for (const p of live(w).filter(q => age(w, q) >= 18)) {
    out.adults++;
    const events = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
    let seenWay = false;
    for (const { e, cited, again, firstT } of pageLines(w, events, new Set(p.events))) {
      out.lines++;
      const why = shownCauses(e);
      const line = `${year(e.t)}: ${plain(e.text)}  [${why.map(c => plain(c.label)).join('; ')}]${again ? `  (${againNote(again, firstT)})` : ''}`;
      for (const [k, re] of Object.entries(WORDS))
        if (re.test(line)) {
          out.words[k]++;
          if (k !== 'foldNote') say(line);
        }
      if (/Nothing had changed since/.test(e.text)) out.nothingChanged++;
      if (e.type === 'otherway' && /^Instead,/.test(e.text) && !why.some(c => c.kind === 'event') && !seenWay) {
        out.insteadUncited++;
        say(line);
      }
      if (e.type === 'pursuit' || e.type === 'otherway') seenWay = true;
    }
  }
  const after =
    Object.values(out.words).reduce((s, x) => s + x, 0) +
    out.insteadUncited +
    out.hatchetYear +
    out.stoppedBringing +
    out.babyNotBaby +
    out.workNoJob;
  perWorld.push({ seed, faults: after - before });
  console.error(`faults: world ${seed}`);
}
for (const x of out.examples) console.log('  ' + x);
const { examples, ...counts } = out;
const total =
  Object.values(out.words).reduce((s, x) => s + x, 0) + out.insteadUncited + out.hatchetYear + out.stoppedBringing + out.babyNotBaby + out.workNoJob;
console.log('FAULTS ' + JSON.stringify({ ...counts, total, perWorld }));
