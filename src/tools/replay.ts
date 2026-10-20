// Determinism: the same world seed and run seed must give the same history, event for event.
import './env'; // OFF= and ON= from the environment, before anything runs
import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
function hist(seed: number, run: number) {
  const w = buildWorld(seed, run);
  pickWitness(w);
  runYears(w, 6);
  return w.events.map(e => `${e.t}|${e.type}|${e.text}`);
}
const a = hist(3, 2),
  b = hist(3, 2);
let diff = -1;
for (let i = 0; i < Math.max(a.length, b.length); i++)
  if (a[i] !== b[i]) {
    diff = i;
    break;
  }
if (diff >= 0) {
  console.error(`REPLAY FAILED at event ${diff}:\n  ${a[diff]}\n  ${b[diff]}`);
  process.exit(1);
}
const c = hist(3, 3);
const same = a.filter((x, i) => x === c[i]).length;
console.log(
  `replay ok: ${a.length} events identical · same world, other fate: ${same} of ${a.length} events identical (expect the shared past only)`,
);
