// Round F26: the fault counts and how often the new scoring rule changes the likeliest answer, with or without the round's switches.
//   tsx src/tools/diag/f26.ts A B [years]   (OFF=countfair,eventfix,identfix,honestev for the arm without)
// Counted over the present: removals of unkept acts that would take another event (and, with the fix, any that found nothing to take),
// thread events missing from their own people's lists, unkept acts still on a list, self-story readings where the strongest entry did
// not speak, and decisions whose likeliest answer differs between the old and the new scoring rule.
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF } from '../../world';
import { UNLISTED, IDENTITY } from '../../grammar';

for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
const [a0, b0, y0] = process.argv.slice(2);
const A = +(a0 ?? 3021),
  B = +(b0 ?? A),
  Y = +(y0 ?? 10);
(globalThis as any).F26 = { decisions: 0, differ: 0, unkept: new Set<number>(), missing: 0 };
const G = (globalThis as any).F26;
const tot = { removals: 0, other: 0, missing: 0, threadMissing: 0, unkeptListed: 0, identity: 0, identityDiffer: 0, decisions: 0, differ: 0 };
for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  for (const k of ['n', 'other'] as const) UNLISTED[k] = 0;
  IDENTITY.n = IDENTITY.differ = 0;
  G.decisions = G.differ = G.missing = 0;
  G.unkept = new Set<number>();
  runYears(w, Y);
  tot.removals += UNLISTED.n;
  tot.other += UNLISTED.other;
  tot.missing += G.missing;
  tot.identity += IDENTITY.n;
  tot.identityDiffer += IDENTITY.differ;
  tot.decisions += G.decisions;
  tot.differ += G.differ;
  for (const e of w.events)
    if (e.type.startsWith('thread:')) for (const id of new Set(e.who)) if (!w.byId.get(id)?.events.includes(e.id)) tot.threadMissing++;
  for (const p of w.people) for (const id of p.events) if (G.unkept.has(id)) tot.unkeptListed++;
}
const pc = (x: number, n: number) => `${x} of ${n} (${((100 * x) / Math.max(1, n)).toFixed(2)}%)`;
console.log(`F26 faults, worlds ${A}–${B}, ${Y} present years, OFF=${process.env.OFF ?? ''}`);
console.log(`  removals of unkept acts where the last entry was another event: ${pc(tot.other, tot.removals)}`);
console.log(`  removals that found nothing to take (fix on): ${tot.missing}`);
console.log(`  thread events missing from their own people's lists: ${tot.threadMissing}`);
console.log(`  unkept acts still on someone's list: ${tot.unkeptListed}`);
console.log(`  self-story readings where the old and new rules disagree: ${pc(tot.identityDiffer, tot.identity)}`);
console.log(`  decisions whose likeliest answer differs between the old and the new scoring rule: ${pc(tot.differ, tot.decisions)}`);
