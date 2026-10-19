// Do two arms tell the same story? Builds each seed twice, once with the switches in A switched off and once with those in B, and
// compares the full event record: type, month, who, the decision chosen and the words, event by event. Prints the first event that
// differs, if any, and the largest gap in an option's probability (so last-digit differences show even when no decision moves).
//   tsx src/tools/diag/samerecord.ts <from> <to> [years]      with A=switches,B=switches in the environment (either may be empty)
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF, type World } from '../../world';

const [from, to] = [+process.argv[2], +(process.argv[3] ?? process.argv[2])],
  years = +(process.argv[4] ?? 10);
const arm = (sw: string, seed: number): World => {
  OFF.clear();
  for (const x of sw.split(',').filter(Boolean)) OFF.add(x);
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, years);
  OFF.clear();
  return w;
};
let differ = 0;
for (let seed = from; seed <= to; seed++) {
  const a = arm(process.env.A ?? '', seed),
    b = arm(process.env.B ?? '', seed);
  let first = -1,
    gap = 0;
  const n = Math.max(a.events.length, b.events.length);
  for (let i = 0; i < n; i++) {
    const x = a.events[i],
      y = b.events[i];
    if (
      !x ||
      !y ||
      x.type !== y.type ||
      x.t !== y.t ||
      x.who.join() !== y.who.join() ||
      x.text !== y.text ||
      (x.decision?.chosen ?? '') !== (y.decision?.chosen ?? '')
    ) {
      first = i;
      break;
    }
    if (x.decision && y.decision)
      for (let j = 0; j < x.decision.options.length; j++) gap = Math.max(gap, Math.abs(x.decision.options[j].p - y.decision.options[j].p));
  }
  if (first >= 0) differ++;
  console.log(
    JSON.stringify({
      seed,
      events: [a.events.length, b.events.length],
      same: first < 0,
      firstDiffers: first < 0 ? null : { i: first, t: a.events[first]?.t ?? b.events[first]?.t },
      maxOptionGap: gap,
    }),
  );
}
console.log(differ ? `${differ} of ${to - from + 1} worlds differ` : `all ${to - from + 1} worlds tell the same story`);
