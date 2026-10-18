// Prints a world's behaviour signature without any text (types, who, decisions, expressions, evidence, people), for comparing two trees.
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF } from '../../world';
import { createHash } from 'crypto';
for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
for (const seed of [11, 12, 13]) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 5);
  const s =
    w.events
      .map(
        e =>
          `${e.t}|${e.type}|${e.who.join(',')}|${(e.decision as any)?.chosen ?? ''}|${(e.decision as any)?.expr ?? ''}|${e.evidence.map(x => x.key + x.dir + x.strength.toFixed(4)).join(',')}`,
      )
      .join('\n') + `\n${w.people.length}|${w.people.map(p => p.status + p.facets.anxiety.toFixed(5)).join(',')}`;
  console.log(seed, w.events.length, createHash('sha1').update(s).digest('hex'));
}
