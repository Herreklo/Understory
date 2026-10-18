// S8 invariance: a background neighbourhood's life does not depend on anything outside it.
//   npx tsx scale/invariance.ts <adults> <seed> [years]
// Two cities from the same seed and the same founding. In the second, the monthly world lives its thirty-year past on different
// dice (SCALE_PAST_SALT) and its present on a different run seed, so the focus neighbourhoods live different lives from year 0.
// The second also promotes a background neighbourhood into focus at the start of the present, and both then run on. Every other
// background neighbourhood must come out identical in both: every field of every person in it, every event about them (event ids
// are replaced by their content, since the shared record interleaves differently; every field of the event is compared), every
// bond they hold, every belief they hold, and their workplaces. A control: the focus itself must come out different.
import { createHash } from 'crypto';
import { buildWorld, runYears } from '../src/build';
import { hoods, background } from '../src/scale';
import { bkA, bkB } from '../src/world';
import { promoteHood } from '../src/coarse';
const ADULTS = +(process.argv[2] ?? 300), SEED = +(process.argv[3] ?? 31), YEARS = +(process.argv[4] ?? 3);
const Hguess = Math.max(2, Math.round(ADULTS * 1.6 / 80)); const F = Math.floor(Hguess / 2); (globalThis as any).SCALE_FOCUS = F;
const SKIP = new Set(['_idx', '_rebuilds', 'H', 'townScale', 'focus', 'background', '_onNewBond', '_out', 'events']);
function prints(runSeed: number, promote: boolean, salt?: number) {
  (globalThis as any).SCALE_PAST_SALT = salt;
  const w = buildWorld(SEED, runSeed, 30, ADULTS);
  const bgH = [...Array(hoods(w)).keys()].filter(h => !(w as any).focus.has(h));
  if (promote) promoteHood(w, bgH[0]);
  runYears(w, YEARS);
  const evKey = new Map<number, string>(); // an event, by what it says (its references to other events replaced the same way, recursively)
  const keyOf = (id: number, depth = 0): string => { if (evKey.has(id)) return evKey.get(id)!; const e: any = w.events[id]; if (!e) return 'none';
    const k = JSON.stringify([e.t, e.type, e.text, e.who, e.happened ?? null, e.vis, e.w, e.seen ?? null, e.evidence ?? null, e.backstory ?? null, depth < 3 ? (e.causes ?? []).map((c: any) => [c.kind, c.label, c.weight, c.who ?? null, c.ref != null ? keyOf(c.ref, depth + 1) : null]) : null]); evKey.set(id, k); return k; };
  const canon = (x: any) => JSON.stringify(x, function (k, v) {
    if (SKIP.has(k)) return undefined;
    if ((k === 'cause' || k === 'ref') && typeof v === 'number') return keyOf(v);
    if (v instanceof Map) return { __map: [...v.entries()] }; if (v instanceof Set) return { __set: [...v.values()] };
    if (typeof v === 'number' && !Number.isFinite(v)) return String(v); return v; });
  const out = new Map<number, string>();
  for (const h of bgH.slice(promote ? 1 : 0)) {
    const ps = background(w).filter(p => (p as any).hood === h).sort((a, b) => a.id - b.id); const ids = new Set(ps.map(p => p.id));
    const evs = w.events.filter(e => e.who.some(i => ids.has(i))).map(e => keyOf(e.id));
    const places = ((w as any).bgPlaces as any[]).filter(pl => pl.hood === h);
    const bonds = [...w.bonds, ...(((w as any).bgBonds as Map<number, any> | undefined) ?? [])].filter(([k]) => ids.has(bkA(k))).map(([k, b]) => `${bkA(k)}-${bkB(k)}:${canon(b)}`).sort();
    const beliefs = ps.map(p => `${p.id}:${canon(w.beliefs.get(p.id) ?? null)}`);
    out.set(h, createHash('sha256').update(ps.map(canon).join('\n') + '\n#\n' + evs.join('\n') + '\n#\n' + bonds.join('\n') + '\n#\n' + beliefs.join('\n') + '\n#\n' + canon(places)).digest('hex').slice(0, 12) + ` (${ps.length} people, ${evs.length} events, ${bonds.length} bonds)`);
  }
  const focusPrint = createHash('sha256').update(w.people.filter(p => p.status !== 'bg' && (w as any).focus.has((p as any).hood) && !(promote && (p as any).hood === bgH[0])).map(canon).join('\n')).digest('hex').slice(0, 12);
  return { out, focus: w.people.filter(p => p.status === 'in').length, events: w.events.length, focusPrint };
}
const A = prints(1, false), B = prints(2, true, 7);
let same = 0, diff = 0; const bad: string[] = [];
for (const [h, x] of B.out) { const y = A.out.get(h); if (y === x) same++; else { diff++; if (bad.length < 5) bad.push(`${h}: ${y} vs ${x}`); } }
console.log(JSON.stringify({ seed: SEED, adults: ADULTS, years: YEARS, focusPeople: [A.focus, B.focus], events: [A.events, B.events], focusDiffers: A.focusPrint !== B.focusPrint, hoodsCompared: same + diff, identical: same, differ: diff, examples: bad }));
