// Coverage: which facets do contested decisions read, and how often does the witness hold a settled belief about them?
// Funder's chain: a trait is judged accurately only when behaviour is relevant, available, detected and used. This finds where the chain breaks.
//   tsx src/coverage.ts [worlds] [years]
import { buildWorld, runYears } from './build';
import { pickWitness, knows } from './witness';
import { score, witnessView, type Option } from './decide';
import { belief, facet, type World, type Person } from './world';
import { FACET_BY_ID, FACETS } from './core';
const N = +(process.argv[2] ?? 12), YEARS = +(process.argv[3] ?? 10);
type Row = { read: number; held: number; right: number; evidenceN: number; sumAbsTruth: number };
const rows = new Map<string, Row>(); const row = (k: string) => { let r = rows.get(k); if (!r) { r = { read: 0, held: 0, right: 0, evidenceN: 0, sumAbsTruth: 0 }; rows.set(k, r); } return r; };
let contested = 0, known = 0;
const evidenceByFacet = new Map<string, number>(); // how often evidence about each facet reaches the witness
for (let seed = 1; seed <= N; seed++) {
  const w = buildWorld(seed, 1); pickWitness(w);
  w.hooks.predict = (w2: World, p: Person, options: Option[], _c: string, _rec: any) => {
    if (w2.witness == null || w2.witness === p.id || !knows(w2, p.id)) return;
    const sit = score(options, { ...witnessView(w2, w2.witness), facet: () => 0, value: () => 0 }, 0.7);
    if (Math.max(...sit.map(o => o.p)) >= 0.65) return;
    contested++; known++;
    const keys = new Set<string>(); for (const o of options) for (const c of o.considerations) if (FACET_BY_ID[c.id]) keys.add(c.id);
    for (const k of keys) { const r = row(k); r.read++; const b = belief(w2, w2.witness, p.id, k); const t = facet(p, k); r.sumAbsTruth += Math.abs(t); if (b && b.n > 0 && b.v < 0.7) { r.held++; if (Math.sign(b.m) === Math.sign(t) || Math.abs(t) < 0.3) r.right++; } }
  };
  runYears(w, YEARS);
  for (const e of w.events) if (e.t >= w.startPresent && (e.knownBy.has(w.witness!) || e.who.includes(w.witness!))) for (const x of e.evidence) if (FACET_BY_ID[x.key]) evidenceByFacet.set(x.key, (evidenceByFacet.get(x.key) ?? 0) + 1);
}
console.log(`${N} worlds × ${YEARS} years · ${contested} contested decisions about known people\n`);
console.log('facet'.padEnd(20) + 'read in'.padStart(8) + 'held'.padStart(7) + 'right'.padStart(7) + 'evidence to witness/decade'.padStart(28) + '  mean |truth|');
for (const [k, r] of [...rows].sort((a, b) => b[1].read - a[1].read)) console.log(FACET_BY_ID[k].name.padEnd(20) + `${(100 * r.read / contested).toFixed(0)}%`.padStart(8) + `${(100 * r.held / r.read).toFixed(0)}%`.padStart(7) + `${r.held ? (100 * r.right / r.held).toFixed(0) : '-'}%`.padStart(7) + ((evidenceByFacet.get(k) ?? 0) / N / (YEARS / 10)).toFixed(0).padStart(28) + `  ${(r.sumAbsTruth / r.read).toFixed(2)}`);
console.log('\nFacets never read by any contested decision: ' + FACETS.filter(f => !rows.has(f.id)).map(f => f.name).join(', '));
