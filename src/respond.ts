// Round 6b test: the world responds. Runs the mechanisms on and off and reports the pre-registered measures (BOARD.md).
//   tsx src/respond.ts [worlds] [years]
import { buildWorld, runYears } from './build';
import { pickWitness, scoreAll } from './witness';
import { OFF, live, age, likeOf, type World } from './world';
import { blindReading } from './measure';
import { FACETS } from './core';
const N = +(process.argv[2] ?? 10), YEARS = +(process.argv[3] ?? 20);
function runSet(off: string[]) {
  OFF.clear(); for (const s of off) OFF.add(s);
  let blind = 0, blindN = 0, maxRepeat = 0, chronic = 0, words = 0, asked = 0, rowLeft = 0, rowLeftWarned = 0, misread = 0, misreadN = 0, misreadDrop = 0, ctrlN = 0, ctrlDrop = 0, joined = 0, joinedAfterRows = 0;
  let youngChange = 0, youngN = 0, oldChange = 0, oldN = 0; let lonelyDisliked = 0, dislikedN = 0, partnersLiked = 0, likedN = 0;
  for (let seed = 1; seed <= N; seed++) {
    const w = buildWorld(seed, 1); pickWitness(w);
    const start = new Map<number, { age: number; facets: Record<string, number> }>(); for (const p of live(w)) start.set(p.id, { age: age(w, p), facets: { ...p.facets } });
    // Month by month: at each misread, note the other's liking for the misreader, and read it again twelve months later.
    // Controls: at the same moment, a pair with the same liking (±0.1) and no misreading between them, read twelve months later too.
    const pending: { t: number; x: number; y: number; like0: number; ctrl?: { a: number; b: number; like0: number } }[] = [];
    for (let m = 0; m < Math.round(YEARS * 12); m++) {
      const n0 = w.events.length; runYears(w, 1 / 12);
      for (const e of w.events.slice(n0)) if (e.type === 'misread') { const [x, y] = e.who; const like0 = likeOf(w, y, x); let ctrl: { a: number; b: number; like0: number } | undefined; for (const a of live(w)) { if (ctrl) break; for (const b of live(w)) { if (a === b || a.id === x || b.id === x) continue; const l = likeOf(w, a.id, b.id); if (Math.abs(l - like0) < 0.1 && (w.bonds.get(a.id * 100000 + b.id)?.fam ?? 0) > 0.3 && !w.events.some(z => z.type === 'misread' && z.who.includes(a.id) && z.who.includes(b.id))) { ctrl = { a: a.id, b: b.id, like0: l }; break; } } } pending.push({ t: w.t, x, y, like0, ctrl }); }
      for (const q of pending.filter(q => w.t - q.t === 12)) { misreadN++; misreadDrop += q.like0 - likeOf(w, q.y, q.x); if (q.ctrl) { ctrlN++; ctrlDrop += q.ctrl.like0 - likeOf(w, q.ctrl.a, q.ctrl.b); } }
    }
    scoreAll(w);
    const b = blindReading(w); blind += b.acc * b.n; blindN += b.n;
    const present = w.events.filter(e => e.t >= w.startPresent);
    for (const p of w.people) { const seen = new Map<string, number>(); for (const i of p.events) { const e = w.events[i]; if (e.t >= w.startPresent && e.who[0] === p.id && !['tell', 'everyday', 'noticed', 'table', 'habit:broke', 'habit:back', 'ill'].includes(e.type)) { const key = e.type + '|' + e.who.slice(1).sort().join(','); seen.set(key, (seen.get(key) ?? 0) + 1); } } for (const n of seen.values()) maxRepeat = Math.max(maxRepeat, n); }
    words += present.filter(e => e.type === 'group:word').length; chronic += present.filter(e => e.type === 'thread:chronic').length;
    for (const e of present.filter(e => e.type === 'group:left')) if (/asked .* to go/.test(e.text)) asked++;
    for (const e of present.filter(e => e.type === 'quitgroup')) { rowLeft++; const p = e.who[0]; if (present.some(x => x.type === 'group:word' && x.who[1] === p && x.t < e.t && e.t - x.t <= 36)) rowLeftWarned++; }
    misread += present.filter(e => e.type === 'misread').length;
    for (const e of present.filter(e => e.type === 'group:joined')) joined++;
    // plasticity: mean absolute facet change over the run, by age at the start
    for (const p of w.people) { const s = start.get(p.id); if (!s || p.status === 'dead') continue; let d = 0, n = 0; for (const f of FACETS) { d += Math.abs(p.facets[f.id] - s.facets[f.id]); n++; } if (s.age >= 18 && s.age <= 30) { youngChange += d / n; youngN++; } else if (s.age >= 50 && s.age <= 65) { oldChange += d / n; oldN++; } }
    // company: how many people spend time with the disliked
    for (const p of live(w)) { if (age(w, p) < 18) continue; const dislikers = live(w).filter(q => q !== p && likeOf(w, q.id, p.id) < -0.3).length; const partners = live(w).filter(q => q !== p && (w.bonds.get(q.id * 100000 + p.id)?.touched ?? -99) >= w.t - 1).length; if (dislikers >= 3) { lonelyDisliked += partners; dislikedN++; } else if (dislikers === 0) { partnersLiked += partners; likedN++; } }
  }
  const d = N * YEARS / 10;
  return { blind: 100 * blind / Math.max(1, blindN), maxRepeat, chronic: chronic / d, words: words / d, asked: asked / d, rowLeft: rowLeft / d, rowLeftWarned: rowLeft ? 100 * rowLeftWarned / rowLeft : 0, misread: misread / d, misreadDrop: misreadN ? misreadDrop / misreadN : 0, ctrlDrop: ctrlN ? ctrlDrop / ctrlN : 0, misreadN, ctrlN, joined: joined / d, young: youngChange / Math.max(1, youngN), old: oldChange / Math.max(1, oldN), ratio: (youngChange / Math.max(1, youngN)) / Math.max(1e-6, oldChange / Math.max(1, oldN)), disliked: lonelyDisliked / Math.max(1, dislikedN), liked: partnersLiked / Math.max(1, likedN) };
}
const on = runSet([]), off = runSet(['respond', 'plasticity']);
const row = (k: string, f: (r: any) => string) => console.log(k.padEnd(44) + f(on).padStart(10) + f(off).padStart(10));
console.log(`${N} worlds × ${YEARS} years` + ''.padEnd(26) + 'on'.padStart(10) + 'off'.padStart(10));
row('blind reading (half-lives matched, %)', r => r.blind.toFixed(1));
row('max same act to same people', r => String(r.maxRepeat));
row('chronic phases declared, per town-decade', r => r.chronic.toFixed(2));
row('group: words had, per town-decade', r => r.words.toFixed(2));
row('group: asked to leave, per town-decade', r => r.asked.toFixed(2));
row('group: left after a row, per town-decade', r => r.rowLeft.toFixed(2));
row('  of those, warned first (%)', r => r.rowLeftWarned.toFixed(0));
row('group: joined, per town-decade', r => r.joined.toFixed(2));
row('misread events, per town-decade', r => r.misread.toFixed(2));
row('  other\'s liking, fall over 12 months (misread pairs)', r => `${r.misreadDrop.toFixed(3)} (${r.misreadN})`);
row('  same, matched pairs with no misreading', r => `${r.ctrlDrop.toFixed(3)} (${r.ctrlN})`);
row('monthly partners: disliked by 3+ / liked by all', r => `${r.disliked.toFixed(1)} / ${r.liked.toFixed(1)}`);
row('facet change 20y: 18-30 at start', r => r.young.toFixed(3));
row('facet change 20y: 50-65 at start', r => r.old.toFixed(3));
row('  ratio young/old', r => r.ratio.toFixed(2));
