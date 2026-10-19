// Round 29's own count: seen accounts held, how they were formed, and how often one decides. For smoke runs and the battery.
//   tsx src/tools/diag/accounts.ts A B [years]   (seeds A..B; OFF=accounts is read as the other tools read it)
// Last line: ACCOUNTS {...}
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF, P, peekBond, type World } from '../../world';

for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];

// A decision's top reason is its first keyed reason that is not an 'against' (as `decide` and `run` pick it); it passed the
// counterfactual check when the record says honest. A seen account speaks as a bond reason, 'having seen it happen'.
const SEEN = /having seen it happen/;
const topOf = (e: any) => (e.causes ?? []).find((c: any) => c.key && !String(c.key).startsWith('against:'));

const out: any = { seeds: [a, b], held: [], perAdult: [], decisions: 0, withOther: 0, anySeen: 0, seenTop: 0, sample: [] as string[] };
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  runYears(w, yrs);
  let held = 0;
  const adults = w.people.filter(p => p.status === 'in' && w.t - p.born >= 18 * 12);
  for (const p of adults) held += p.saw?.length ?? 0;
  out.held.push(held);
  out.perAdult.push(+(held / Math.max(1, adults.length)).toFixed(2));
  for (const e of w.events) {
    if (e.t <= t0 || !e.decision) continue;
    out.decisions++;
    const rec: any = e.decision;
    if (e.who.length < 2) continue;
    out.withOther++;
    if ((e.causes ?? []).some((c: any) => SEEN.test(String(c.label)))) out.anySeen++;
    const top = topOf(e);
    if (top && SEEN.test(String(top.label)) && rec.honest === true) {
      out.seenTop++;
      if (out.sample.length < 6) out.sample.push(`${e.type}: ${e.text} — ${top.label}`);
    }
  }
  // a few accounts as held, for reading
  for (const p of adults.slice(0, 40)) {
    for (const s of (p.saw ?? []).slice(0, 1)) {
      const m = peekBond(w, p.id, s.o)?.mem.find(m => m.ev === s.ev);
      if (m && out.sample.length < 12)
        out.sample.push(`${p.first} about ${P(w, s.o).first}: ${m.text} (like ${m.like.toFixed(2)}, trust ${m.trust.toFixed(2)})`);
    }
  }
}
out.seenTopShare = +(out.seenTop / Math.max(1, out.withOther)).toFixed(4);
out.anySeenShare = +(out.anySeen / Math.max(1, out.withOther)).toFixed(4);
for (const l of out.sample) console.log('  ' + l);
delete out.sample;
console.log('ACCOUNTS ' + JSON.stringify(out));
