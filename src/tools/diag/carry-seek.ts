// Diagnostic before round 32, part two: among friends, who seeks whom out, and who confides in whom.
import { buildWorld, runYears } from '../../build';
import type { World } from '../../world';
const [a, b] = [+(process.argv[2] ?? 9301), +(process.argv[3] ?? 9304)];
const SEEK = new Set(['confide', 'hint', 'ask', 'call', 'straight']);
const out = {
  pairs: 0,
  soughtPairs: 0,
  sought: 0,
  oneWay: 0,
  lean2: 0,
  lean3: 0,
  lean3min6: 0,
  hist: {} as Record<string, number>,
  confPairs: 0,
  confLean: 0,
};
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  const key = (x: number, y: number) => (x < y ? `${x}|${y}` : `${y}|${x}`);
  const idx = (x: number, y: number) => (x < y ? 0 : 1);
  const S = new Map<string, [number, number]>();
  const C = new Map<string, [number, number]>();
  let present = false;
  w.hooks.contact = (w2, x, y, i, ch) => {
    if (!present || ch !== 'sought') return;
    const k = key(x.id, y.id);
    const r = S.get(k) ?? [0, 0];
    r[idx(x.id, y.id)]++;
    S.set(k, r);
  };
  const t0 = w.t;
  present = true;
  runYears(w, 10);
  const friendsEver = new Set<string>();
  for (const e of w.events) {
    if (e.t <= t0) continue;
    if (e.type === 'friends' || e.type === 'madeup' || e.type === 'cooled') friendsEver.add(key(e.who[0], e.who[1]));
    if (e.decision && SEEK.has((e.decision as any).expr) && (e.decision as any).target != null) {
      const x = e.who[0],
        y = (e.decision as any).target;
      const r = C.get(key(x, y)) ?? [0, 0];
      r[idx(x, y)]++;
      C.set(key(x, y), r);
    }
  }
  for (const p of w.people) for (const f of p.friends) if (p.id < f) friendsEver.add(key(p.id, f));
  for (const k of friendsEver) {
    out.pairs++;
    const s = S.get(k);
    if (s) {
      out.soughtPairs++;
      const n = s[0] + s[1],
        hi = Math.max(...s),
        lo = Math.min(...s);
      out.sought += n;
      if (lo === 0 && hi >= 2) out.oneWay++;
      if (hi >= 2 * Math.max(lo, 1) && hi >= 4) out.lean2++;
      if (hi >= 3 * Math.max(lo, 1) && hi >= 4) out.lean3++;
      if (hi >= 3 * Math.max(lo, 1) && hi >= 6) out.lean3min6++;
      const bucket = `${Math.min(hi, 12)}:${Math.min(lo, 12)}`;
      out.hist[bucket] = (out.hist[bucket] ?? 0) + 1;
    }
    const c = C.get(k);
    if (c) {
      out.confPairs++;
      const hi = Math.max(...c),
        lo = Math.min(...c);
      if (hi >= 2 && lo === 0) out.confLean++;
    }
  }
}
console.log(JSON.stringify(out, null, 1));
