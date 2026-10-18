// Promotion changes nothing it should not: every field of every person in a background neighbourhood, just before and just after it
// comes into focus (no time passes). Reports, per field, how many people it changed for, and the size of any change in health,
// illness, strain and savings. The fields promotion is meant to add (texture) are listed separately from everything else.
//   npx tsx scale/promoinv.ts <adults> <seed>
import { buildWorld } from '../src/build';
import { hoods, background } from '../src/scale';
import { promoteHood } from '../src/coarse';
const ADULTS = +(process.argv[2] ?? 300),
  SEED = +(process.argv[3] ?? 81);
const Hguess = Math.max(2, Math.round((ADULTS * 1.6) / 80));
(globalThis as any).SCALE_FOCUS = Math.floor(Hguess / 2);
const w = buildWorld(SEED, 1, 30, ADULTS);
const F = (w as any).focus as Set<number>;
const bgH = [...Array(hoods(w)).keys()].filter(h => !F.has(h));
const TEXTURE = new Set(['status', 'habits', 'circle', 'friends', 'events', 'promotedAt']); // what promotion is for: in focus, routines, neighbours, the years of contact replayed
const canon = (v: any) => JSON.stringify(v, (k, x) => (x instanceof Map ? [...x] : x instanceof Set ? [...x] : x));
const out: any[] = [];
for (const h of bgH) {
  const ps = background(w).filter(p => (p as any).hood === h && p.status === 'bg');
  const before = new Map(ps.map(p => [p.id, Object.fromEntries(Object.entries(p).map(([k, v]) => [k, canon(v)]))]));
  const num = new Map(ps.map(p => [p.id, { health: p.health, ill: p.ill, stress: p.stress, savings: p.savings }]));
  promoteHood(w, h);
  const changed: Record<string, number> = {};
  const delta: Record<string, number> = { health: 0, ill: 0, stress: 0, savings: 0 };
  for (const p of ps) {
    const b = before.get(p.id)!;
    for (const k of new Set([...Object.keys(b), ...Object.keys(p)])) if (canon((p as any)[k]) !== b[k]) changed[k] = (changed[k] ?? 0) + 1;
    const n = num.get(p.id)!;
    for (const k of Object.keys(delta)) delta[k] = Math.max(delta[k], Math.abs((p as any)[k] - (n as any)[k]));
  }
  out.push({
    hood: h,
    people: ps.length,
    texture: Object.fromEntries(Object.entries(changed).filter(([k]) => TEXTURE.has(k))),
    other: Object.fromEntries(Object.entries(changed).filter(([k]) => !TEXTURE.has(k) && !k.startsWith('_'))),
    cache: Object.fromEntries(Object.entries(changed).filter(([k]) => k.startsWith('_'))),
    maxChange: delta,
  });
}
console.log(JSON.stringify({ seed: SEED, adults: ADULTS, hoods: out }));
