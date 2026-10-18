// Wrong-sign beliefs: of the witness's facet beliefs that disagree with the truth, where did the evidence come from?
// Each piece of evidence reaching the witness is tagged by its path and checked against the truth of the person it is about.
//   tsx src/wrongsign.ts [worlds] [years]
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { facet, type World, type Evidence } from './world';
import { FACET_BY_ID } from './core';
const N = +(process.argv[2] ?? 10), YEARS = +(process.argv[3] ?? 10);
type T = { n: number; wrong: number; wStrength: number; rStrength: number };
const byPath = new Map<string, T>(), byFacet = new Map<string, T>(), byHow = new Map<string, T>();
const bump = (m: Map<string, T>, k: string, wrong: boolean, s: number) => { const t = m.get(k) ?? { n: 0, wrong: 0, wStrength: 0, rStrength: 0 }; t.n++; if (wrong) { t.wrong++; t.wStrength += s; } else t.rStrength += s; m.set(k, t); };
// Beliefs at the end: wrong in sign, by certainty band and by how many pieces of evidence built them.
const bel = { sure: { n: 0, wrong: 0 }, fair: { n: 0, wrong: 0 }, vague: { n: 0, wrong: 0 } }; const byN = new Map<string, { n: number; wrong: number }>();
let weakTruth = 0, wrongTotal = 0;
// Per belief: how much of its evidence came through each path, to see which path builds the wrong ones.
// Realised accuracy: at the end, how well the witness's beliefs correlate with the truth, by dimension, and the same for beliefs built mostly from manner.
const pairs = new Map<string, { m: number[]; t: number[] }>(); const pairsManner = new Map<string, { m: number[]; t: number[] }>();
const share = new Map<string, Record<string, number>>(); const sureWrong = new Map<string, true>(); const dominant = new Map<string, { n: number; wrong: number }>();
for (let seed = 1; seed <= N; seed++) {
  const w = buildWorld(seed, 1); pickWitness(w);
  w.hooks.observed = (w2: World, e: Evidence, how, tag) => {
    if (!FACET_BY_ID[e.key]) return; const p = w2.byId.get(e.subject); if (!p) return;
    const t = facet(p, e.key); if (Math.abs(t) < 0.3) return; // a near-zero trait has no sign to get wrong
    const wrong = Math.sign(e.dir) !== Math.sign(t);
    const sk = `${w2.seed}|${e.subject}|${e.key}`; const sh = share.get(sk) ?? {}; sh[tag] = (sh[tag] ?? 0) + e.strength * e.reliability; share.set(sk, sh);
    bump(byPath, tag, wrong, e.strength * e.reliability); bump(byFacet, e.key, wrong, e.strength * e.reliability); bump(byHow, how, wrong, e.strength * e.reliability);
  };
  runYears(w, YEARS);
  const bm = w.beliefs.get(w.witness!)!;
  for (const [k, b] of bm) { const [sid, key] = k.split('|'); if (!FACET_BY_ID[key] || b.n === 0) continue; const p = w.byId.get(+sid); if (!p) continue; const t = facet(p, key); const wrong = Math.sign(b.m) !== Math.sign(t) && Math.abs(b.m) > 0.2; const band = b.v < 0.3 ? 'sure' : b.v < 0.6 ? 'fair' : 'vague'; bel[band].n++; if (wrong && band === 'sure') sureWrong.set(`${seed}|${sid}|${key}`, true); if (wrong) { bel[band].wrong++; wrongTotal++; if (Math.abs(t) < 0.5) weakTruth++; } const sh = share.get(`${seed}|${sid}|${key}`) ?? {}; const tot = Object.values(sh).reduce((a, x) => a + x, 0); const dom = tot ? Object.entries(sh).sort((a, b) => b[1] - a[1])[0] : null; const dk = dom && dom[1] / tot > 0.6 ? dom[0] : 'mixed'; const dr = dominant.get(dk) ?? { n: 0, wrong: 0 }; dr.n++; if (wrong) dr.wrong++; dominant.set(dk, dr);
    const nb = b.n === 1 ? '1' : b.n <= 3 ? '2-3' : b.n <= 8 ? '4-8' : '9+'; const r = byN.get(nb) ?? { n: 0, wrong: 0 }; r.n++; if (wrong) r.wrong++; byN.set(nb, r);
    const dim = FACET_BY_ID[key].dim; const pr = pairs.get(dim) ?? { m: [], t: [] }; pr.m.push(b.m); pr.t.push(t); pairs.set(dim, pr);
    const sh2 = share.get(`${w.seed}|${sid}|${key}`); const tot2 = sh2 ? Object.values(sh2).reduce((a, x) => a + x, 0) : 0; if (sh2 && tot2 > 0 && (sh2['manner'] ?? 0) / tot2 > 0.6) { const pm = pairsManner.get(dim) ?? { m: [], t: [] }; pm.m.push(b.m); pm.t.push(t); pairsManner.set(dim, pm); } }
}
const pct = (a: number, b: number) => `${(100 * a / Math.max(1, b)).toFixed(0)}%`;
console.log(`${N} worlds × ${YEARS} years\n\nEvidence reaching the witness, by path (wrong = points the other way from the person's true trait):`);
for (const [k, t] of [...byPath].sort((a, b) => b[1].n - a[1].n)) console.log(`  ${k.padEnd(9)} n ${String(t.n).padStart(6)} · wrong ${pct(t.wrong, t.n).padStart(4)} · weight of wrong ${(t.wStrength / Math.max(1e-6, t.wStrength + t.rStrength) * 100).toFixed(0)}%`);
// Sure beliefs that are wrong: which event types supplied their evidence?
console.log('\nEvidence behind SURE beliefs that are wrong in sign, by path (weight share):');
{ const agg = new Map<string, number>(); let tot = 0; for (const [k, sh] of share) { const [seed, sid, key] = k.split('|'); const bw = sureWrong.get(k); if (!bw) continue; for (const t in sh) { agg.set(t, (agg.get(t) ?? 0) + sh[t]); tot += sh[t]; } } for (const [t, v] of [...agg].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${t.padEnd(18)} ${(100 * v / tot).toFixed(0)}%`); }
console.log('\nBy how it arrived:'); for (const [k, t] of byHow) console.log(`  ${k.padEnd(9)} n ${String(t.n).padStart(6)} · wrong ${pct(t.wrong, t.n)}`);
console.log('\nBy facet (worst first):'); for (const [k, t] of [...byFacet].sort((a, b) => b[1].wrong / b[1].n - a[1].wrong / a[1].n).slice(0, 10)) console.log(`  ${FACET_BY_ID[k].name.padEnd(22)} n ${String(t.n).padStart(5)} · wrong ${pct(t.wrong, t.n)}`);
console.log('\nBeliefs at the end, wrong in sign:'); for (const k of ['sure', 'fair', 'vague'] as const) console.log(`  ${k.padEnd(6)} n ${String(bel[k].n).padStart(6)} · wrong ${pct(bel[k].wrong, bel[k].n)}`);
console.log('  by pieces of evidence:'); for (const k of ['1', '2-3', '4-8', '9+']) { const r = byN.get(k); if (r) console.log(`    ${k.padEnd(4)} n ${String(r.n).padStart(6)} · wrong ${pct(r.wrong, r.n)}`); }
console.log(`  of all wrong beliefs, the true trait was mild (|z| < 0.5): ${pct(weakTruth, wrongTotal)}`);
console.log('  by the path that supplied most of the evidence (>60% of weight):'); for (const [k, r] of [...dominant].sort((a, b) => b[1].n - a[1].n)) console.log(`    ${k.padEnd(9)} n ${String(r.n).padStart(6)} · wrong ${pct(r.wrong, r.n)}`);

// Realised correlations: the number the MANNER_ACCURACY parameters were meant to produce after years of acquaintance, measured rather than assumed.
const corr = (xs: number[], ys: number[]) => { const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; } return sxy / Math.sqrt(sxx * syy || 1); };
console.log(`\nRealised accuracy at the end: corr(witness belief, truth) over all beliefs with evidence, by dimension; then over beliefs built mostly (>60%) from manner.`);
for (const d of ['H', 'E', 'X', 'A', 'C', 'O', 'I']) { const a = pairs.get(d), m = pairsManner.get(d); console.log(`  ${d}  all beliefs r ${a && a.m.length > 10 ? corr(a.m, a.t).toFixed(2) : '  — '} (n ${String(a?.m.length ?? 0).padStart(5)})   manner-built r ${m && m.m.length > 10 ? corr(m.m, m.t).toFixed(2) : '  — '} (n ${String(m?.m.length ?? 0).padStart(5)})`); }
