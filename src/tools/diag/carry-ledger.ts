// Diagnostic before round 32: is help between friends uneven today? For every pair who were friends at any point in the present years,
// count acts done for the other (help) and against them when asked (let-downs), each way, from the decision records.
import { buildWorld, runYears } from '../../build';
import type { World } from '../../world';
const HELP = new Set([
  'give',
  'grudging',
  'chipin',
  'quietgive',
  'visit',
  'deliver',
  'rescue',
  'stepup',
  'speakup',
  'keep',
  'show',
  'cheer',
  'secondchance',
  'hearout',
  'backsong',
  'makepeace',
  'congratulate',
  'credit',
]);
const DOWN = new Set([
  'refuse',
  'excuse',
  'nowallet',
  'absent',
  'slip',
  'froze',
  'hangback',
  'keepquiet',
  'late',
  'brushoff',
  'lookaway',
  'resentsong',
  'claimsong',
  'take',
  'skim',
  'liecover',
  'blame',
  'dismiss',
  'coolto',
]);
const [a, b] = [+(process.argv[2] ?? 9301), +(process.argv[3] ?? 9304)];
const tot = {
  pairs: 0,
  withAny: 0,
  oneSided3: 0,
  oneSided3min3: 0,
  helps: 0,
  downs: 0,
  bothZero: 0,
  ends: 0,
  endsUneven: 0,
  hist: {} as Record<string, number>,
  friendsEnd: 0,
};
const exprs: Record<string, number> = {};
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  const t0 = w.t;
  runYears(w, 10);
  const pairs = new Map<string, { h: [number, number]; d: [number, number]; ended: boolean }>();
  const key = (x: number, y: number) => (x < y ? `${x}|${y}` : `${y}|${x}`);
  const idx = (x: number, y: number) => (x < y ? 0 : 1);
  for (const e of w.events) {
    if (e.t <= t0) continue;
    if (e.type === 'friends' || e.type === 'madeup' || e.type === 'cooled') {
      const k = key(e.who[0], e.who[1]);
      const r = pairs.get(k) ?? { h: [0, 0], d: [0, 0], ended: false };
      if (e.type === 'cooled') r.ended = true;
      pairs.set(k, r);
    }
  }
  for (const p of w.people)
    for (const f of p.friends) if (p.id < f) pairs.set(key(p.id, f), pairs.get(key(p.id, f)) ?? { h: [0, 0], d: [0, 0], ended: false });
  for (const e of w.events) {
    if (e.t <= t0 || !e.decision) continue;
    const rec: any = e.decision;
    const x = e.who[0],
      y = rec.target;
    if (y == null || y === x) continue;
    const r = pairs.get(key(x, y));
    if (!r) continue;
    if (HELP.has(rec.expr)) {
      r.h[idx(x, y)]++;
      exprs[rec.expr] = (exprs[rec.expr] ?? 0) + 1;
    } else if (DOWN.has(rec.expr)) {
      r.d[idx(x, y)]++;
      exprs['-' + rec.expr] = (exprs['-' + rec.expr] ?? 0) + 1;
    }
  }
  for (const r of pairs.values()) {
    tot.pairs++;
    const [h0, h1] = r.h,
      n = h0 + h1,
      dn = r.d[0] + r.d[1];
    tot.helps += n;
    tot.downs += dn;
    if (n + dn === 0) tot.bothZero++;
    else tot.withAny++;
    const hi = Math.max(h0, h1),
      lo = Math.min(h0, h1);
    if (n > 0 && hi >= 3 * Math.max(lo, 1) - (lo === 0 ? 0 : 0) && hi >= 2) tot.oneSided3++;
    if (hi >= 3 && lo === 0) tot.oneSided3min3++;
    const bucket = `${Math.min(hi, 6)}:${Math.min(lo, 6)}`;
    tot.hist[bucket] = (tot.hist[bucket] ?? 0) + 1;
    if (r.ended) {
      tot.ends++;
      if (hi >= 2 && hi >= 2 * Math.max(lo, 1)) tot.endsUneven++;
    }
  }
}
console.log(JSON.stringify({ seeds: [a, b], ...tot, exprs }, null, 1));
