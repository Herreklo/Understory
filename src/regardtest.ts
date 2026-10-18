// Regard tests.
// 1. Forgetting, on constructed cases: one impression, nothing new learned, must shrink toward neutral with time; a strong one slower than a mild one.
// 2. Opportunities follow standing, from a common checkpoint: each world runs its past and five present years once under the full rule, is
//    frozen, and then runs years six to ten three times, under full regard, bond-only regard (how the chooser feels, the pre-regard rule), and
//    neutral choice. The same people are compared with themselves across the three, by standing at year five.
//   tsx src/regardtest.ts [worlds]
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { OFF, live, age, observe, remember, peekBond, type World, type Person } from './world';
import { standing, regardRaw } from './regard';

// --- 1. constructed: two adults who have never met (no bond, no beliefs), then one impression and nothing else for ten years.
{
  const strangers = (w: World) => { const ad = live(w).filter(p => age(w, p) >= 25); for (const x of ad) for (const y of ad) if (x !== y && !peekBond(w, x.id, y.id) && regardRaw(w, x.id, y.id) === 0) return [x, y] as const; throw new Error('no strangers'); };
  const fresh = (strength: number) => { const w = buildWorld(3, 1); pickWitness(w); const [x, y] = strangers(w); observe(w, x.id, { subject: y.id, key: 'sincerity', dir: 1, strength, reliability: 0.8 }, 'seen'); return { w, x, y }; };
  const read = (s: { w: World; x: Person; y: Person }, months: number) => { s.w.t += months; const r = regardRaw(s.w, s.x.id, s.y.id); s.w.t -= months; return r; };
  const mild = fresh(0.6), strong = fresh(1.5);
  const m0 = read(mild, 0), m120 = read(mild, 120), s0 = read(strong, 0), s120 = read(strong, 120);
  // A bad memory of someone still seen keeps its weight; of someone not seen since, it fades with familiarity (0.7% a month).
  const bad = (() => { const w = buildWorld(3, 1); pickWitness(w); const [x, y] = strangers(w); remember(w, x, y, -1, -0.3, -0.1, -0.2, 'let me down'); peekBond(w, x.id, y.id)!.fam = 0.3; return { w, x, y }; })();
  const b0 = read(bad, 0); peekBond(bad.w, bad.x.id, bad.y.id)!.fam = 0.3 * Math.pow(0.993, 120); const b120 = read(bad, 120);
  const line = (k: string, v0: number, v1: number) => console.log(`${k.padEnd(48)} fresh ${v0.toFixed(3)}  ten years on ${v1.toFixed(3)}  (${Math.round(100 * v1 / (v0 || 1))}% left)`);
  line('one mild belief (strength 0.6), nothing new', m0, m120); line('one strong belief (strength 1.5), nothing new', s0, s120); line('one bad memory (like −0.3), not seen since', b0, b120);
  const ok = m0 > 0 && m120 / m0 < 0.3 && s120 / s0 > m120 / m0 && s120 / s0 < 0.8 && b0 < 0 && Math.abs(b120) < Math.abs(b0);
  console.log(ok ? 'regard forgetting ok: a lone impression fades, a strong one more slowly, a grudge against someone no longer seen too' : 'REGARD FORGETTING FAILED');
  if (!ok) process.exit(1);
}

// --- 2. from a common checkpoint
const N = +(process.argv[2] ?? 10);
const OPP = new Set(['hired', 'promoted', 'give', 'grudging', 'group:joined', 'confide', 'speakup', 'visit', 'show', 'chipin', 'quietgive', 'welcome']); // things that come to a person because others chose them
const MODES: Record<string, string[]> = { full: [], bond: ['regard:beliefs'], none: ['regard'] };
type Row = { seed: number; id: number; st: number; opp: Record<string, number>; quarrels: Record<string, number> };
const rows: Row[] = [];
for (let seed = 1; seed <= N; seed++) {
  let st = new Map<number, number>();
  for (const mode in MODES) {
    OFF.clear(); // the common five years always run under the full rule
    const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 5);
    if (mode === 'full') for (const p of live(w)) if (age(w, p) >= 20) st.set(p.id, standing(w, p.id));
    const t5 = w.t; for (const s of MODES[mode]) OFF.add(s); runYears(w, 5); OFF.clear();
    for (const [id, s] of st) {
      let row = rows.find(r => r.seed === seed && r.id === id); if (!row) { row = { seed, id, st: s, opp: {}, quarrels: {} }; rows.push(row); }
      let opp = 0, quarrels = 0; const pairs = new Map<number, number>();
      for (const e of w.events) { if (e.t < t5) continue;
        if (OPP.has(e.type) && ((['hired', 'promoted', 'group:joined'].includes(e.type) && e.who[0] === id) || (!['hired', 'promoted', 'group:joined'].includes(e.type) && e.who[1] === id))) opp++;
        if (['snap', 'sarcasm', 'cold', 'shout', 'confront', 'rake', 'dressdown'].includes(e.type) && e.who[0] === id && e.who[1] != null) pairs.set(e.who[1], (pairs.get(e.who[1]) ?? 0) + 1); }
      for (const n of pairs.values()) if (n >= 3) quarrels++;
      row.opp[mode] = opp; row.quarrels[mode] = quarrels;
    }
  }
}
rows.sort((a, b) => a.st - b.st); const q = Math.floor(rows.length / 4);
const bottom = rows.slice(0, q), top = rows.slice(-q);
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
const ci = (xs: number[]) => { const m = mean(xs); const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, xs.length - 1)); return 1.96 * sd / Math.sqrt(Math.max(1, xs.length)); };
console.log(`\n${N} worlds · standing at year 5 under the full rule, then years 6–10 three ways (${rows.length} adults, same people in each column)`.padEnd(96) + 'full'.padStart(10) + 'bond'.padStart(10) + 'none'.padStart(10));
const row = (k: string, f: (m: string) => string) => console.log(k.padEnd(96) + Object.keys(MODES).map(m => f(m).padStart(10)).join(''));
row('opportunities per person, bottom quarter of standing', m => mean(bottom.map(r => r.opp[m])).toFixed(2));
row('opportunities per person, top quarter of standing', m => mean(top.map(r => r.opp[m])).toFixed(2));
row('  ratio top / bottom', m => (mean(top.map(r => r.opp[m])) / Math.max(0.01, mean(bottom.map(r => r.opp[m])))).toFixed(2));
row('repeated quarrels (same pair, 3+ in five years), per town', m => (rows.reduce((s, r) => s + r.quarrels[m], 0) / N).toFixed(1));
console.log('\nThe same person, full minus neutral (paired; ± is a 95% interval over people):');
const d = (xs: Row[], a: string, b: string) => { const v = xs.map(r => r.opp[a] - r.opp[b]); return `${mean(v) >= 0 ? '+' : ''}${mean(v).toFixed(2)} ±${ci(v).toFixed(2)}`; };
console.log(`  bottom quarter: ${d(bottom, 'full', 'none')} · top quarter: ${d(top, 'full', 'none')} · all: ${d(rows, 'full', 'none')}`);
console.log('The same person, full minus bond-only:');
console.log(`  bottom quarter: ${d(bottom, 'full', 'bond')} · top quarter: ${d(top, 'full', 'bond')} · all: ${d(rows, 'full', 'bond')}`);
