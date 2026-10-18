// Where marks come from: the event types behind over-40s' sore spots, fears and rules, in focus and just promoted.
import { buildWorld } from '../src/build';
import { age } from '../src/world';
import { hoods } from '../src/scale';
import { promoteHood } from '../src/coarse';
import { persona } from '../src/persona';
const ADULTS = +(process.argv[2] ?? 300), SEED = +(process.argv[3] ?? 71);
const Hguess = Math.max(2, Math.round(ADULTS * 1.6 / 80)); (globalThis as any).SCALE_FOCUS = Math.floor(Hguess / 2);
const w = buildWorld(SEED, 1, 30, ADULTS); const F = new Set((w as any).focus as Set<number>);
const bgH = [...Array(hoods(w)).keys()].filter(h => !F.has(h)); for (const h of bgH) promoteHood(w, h);
for (const [lab, inG] of [['focus', (h: number) => F.has(h)], ['promoted', (h: number) => !F.has(h)]] as const) {
  const ps = w.people.filter(p => p.status === 'in' && age(w, p) >= 40 && inG((p as any).hood)); const by: Record<string, number> = {}; let n = 0;
  for (const p of ps) { const x = persona(w, p); for (const m of [...x.sore, ...x.fears, ...x.rules]) { const t = w.events[m.from]?.type ?? '?'; by[t] = (by[t] ?? 0) + 1; n++; } }
  console.log(lab, 'over-40s', ps.length, 'marks/person', (n / ps.length).toFixed(2), JSON.stringify(Object.fromEntries(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, +(v / ps.length).toFixed(3)]))));
}
