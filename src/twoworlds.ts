// Two worlds alive at once must not read each other's bonds (each person knows their own world).
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
function hist(w: ReturnType<typeof buildWorld>) { return w.events.map(e => `${e.t}|${e.type}|${e.text}`).join('\n'); }
const solo = buildWorld(5, 1); pickWitness(solo); runYears(solo, 3);
const a = buildWorld(5, 1), b = buildWorld(6, 1); pickWitness(a); pickWitness(b);
for (let m = 0; m < 36; m++) { runYears(a, 1 / 12); runYears(b, 1 / 12); }
if (hist(a) !== hist(solo)) { console.error('TWO WORLDS FAILED: world 5 changed when world 6 ran beside it'); process.exit(1); }
console.log('two worlds ok: running another world alongside changes nothing');
