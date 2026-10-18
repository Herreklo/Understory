// Silent-facet triage: a facet with no observable consequence is fixed, kept or cut.
// For each facet: read by decisions (any), shapes expression style, evidence reaching the witness per decade, and whether it ever decides anything.
//   tsx src/silent.ts [worlds] [years]
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { type World, type Person, type Evidence } from './world';
import { FACETS, FACET_BY_ID } from './core';
import { EXPRESSIONS } from './families';
import type { Option } from './decide';
const N = +(process.argv[2] ?? 8), YEARS = +(process.argv[3] ?? 10);
const read = new Map<string, number>(), decisive = new Map<string, number>(), evid = new Map<string, number>(); let decisions = 0;
for (let seed = 1; seed <= N; seed++) {
  const w = buildWorld(seed, 1); pickWitness(w);
  w.hooks.predict = (_w: World, _p: Person, options: Option[], _c: string, rec: any) => {
    decisions++;
    const keys = new Set<string>(); for (const o of options) for (const c of o.considerations) if (FACET_BY_ID[c.id]) keys.add(c.id);
    for (const k of keys) read.set(k, (read.get(k) ?? 0) + 1);
    // decisive: the facet is among the top causes the engine gave for the choice
    for (const c of (rec.why ?? [])) if (c.key && FACET_BY_ID[c.key]) decisive.set(c.key, (decisive.get(c.key) ?? 0) + 1);
  };
  w.hooks.observed = (_w: World, e: Evidence) => { if (FACET_BY_ID[e.key]) evid.set(e.key, (evid.get(e.key) ?? 0) + 1); };
  runYears(w, YEARS);
}
const style = new Map<string, number>(); for (const e of EXPRESSIONS) for (const k in e.prefers) style.set(k, (style.get(k) ?? 0) + 1);
console.log(`${N} worlds × ${YEARS} years · ${decisions} decisions\n`);
console.log('facet'.padEnd(22) + 'read by decisions'.padStart(18) + 'styles expressions'.padStart(20) + 'evidence/decade'.padStart(17) + '  verdict');
for (const f of FACETS.slice().sort((a, b) => (read.get(a.id) ?? 0) - (read.get(b.id) ?? 0))) {
  const r = (read.get(f.id) ?? 0) / decisions, s = style.get(f.id) ?? 0, e = (evid.get(f.id) ?? 0) / N / (YEARS / 10);
  const verdict = r < 0.005 && s === 0 ? 'SILENT' : r < 0.005 ? 'style only' : r < 0.03 ? 'rarely read' : '';
  console.log(f.name.padEnd(22) + `${(100 * r).toFixed(1)}%`.padStart(18) + String(s).padStart(20) + e.toFixed(0).padStart(17) + '  ' + verdict);
}
