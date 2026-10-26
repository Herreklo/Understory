// P4 research (26 Oct 2026): where a held feeling meets its object and is not weighed, why. Throwaway worlds, feelings on. Reads only.
//   ./run.sh notes/research/sources/meeting-scripts/why.ts A B [years] [outdir]   → <outdir>/why-<seed>.json
// Every present decision of a situation (grammar.ts run) whose counterpart is the object of the actor's resentment, guilt or gratitude,
// at the moment of deciding, is put in one class: weighed; too weak (under 0.12); no answer it pulls toward, or every answer is one
// (withFeelings skips both); or else muted because the situation answers the feeling's own cause (v4's rule). By kind and trigger.
import '../../../../src/tools/env';
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { pickWitness } from '../../../../src/witness';
import { ON, type Person, type World } from '../../../../src/world';
import { feelingsOf } from '../../../../src/feelings';
import type { Option } from '../../../../src/decide';

const [A, B] = [Number(process.argv[2] ?? 9001), Number(process.argv[3] ?? 9001)];
const YEARS = Number(process.argv[4] ?? 10);
const OUT = process.argv[5] ?? 'out-meeting';
mkdirSync(OUT, { recursive: true });
ON.add('feelings');
// feelings.ts PULLS, copied (not exported).
const PULLS: Record<string, string[]> = {
  resentment: ['severity', 'anger', 'refusal', 'lapse', 'withdrawal', 'pride', 'disclosure'],
  guilt: ['humility', 'honesty', 'generosity', 'warmth', 'duty', 'leniency', 'discretion'],
  gratitude: ['warmth', 'generosity', 'duty', 'humility', 'leniency', 'discretion', 'courage'],
};
for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const out: Record<string, number> = {};
  const add = (k: string) => (out[k] = (out[k] ?? 0) + 1);
  w.hooks.predict = (w2: World, p: Person, options: Option[], _c: string, rec: any) => {
    if (w2.t < w2.startPresent || rec.target == null || rec.expr == null) return;
    const fams = options.map(o => o.id);
    for (const k of Object.keys(PULLS)) {
      const f = feelingsOf(w2, p.id).find(x => x.k === k && x.o === rec.target);
      if (!f) continue;
      const weighed = options.some(o => o.considerations.some(c => c.id === 'feel:' + k));
      const toward = PULLS[k].filter(x => fams.includes(x));
      const cls = weighed
        ? 'weighed'
        : f.v < 0.12
          ? 'weak'
          : !toward.length
            ? 'none-pulled'
            : toward.length === fams.length
              ? 'all-pulled'
              : 'own-cause';
      add(`${k}|${cls}`);
      add(`${k}|${cls}|${rec.trigger}`);
    }
  };
  for (let m = 0; m < YEARS * 12; m++) tick(w);
  writeFileSync(`${OUT}/why-${seed}.json`, JSON.stringify(out));
  console.log(seed);
}
