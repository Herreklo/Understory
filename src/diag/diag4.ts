import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { age } from '../world';
const n = new Map<string, number>(), shown = new Map<string, number>(); const evk = new Map<string, number>();
const itN = new Map<string, number>(), itS = new Map<string, number>();
for (let seed = 1; seed <= 10; seed++) {
  const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 10);
  for (const e of w.events) if (e.t >= w.startPresent) for (const x of e.evidence) evk.set(x.key, (evk.get(x.key) ?? 0) + 1);
  for (const p of w.people) { if (p.status !== 'in' || age(w, p) < 18) continue;
    for (const s of p.signatures) { const k = s.facet + (s.z > 0 ? '+' : '-'); n.set(k, (n.get(k) ?? 0) + 1); if (p.events.some(i => w.events[i].t >= w.startPresent && w.events[i].evidence.some(x => x.subject === p.id && x.key === s.facet))) shown.set(k, (shown.get(k) ?? 0) + 1); }
    for (const it of p.ifThens) { const k = it.feature + ':' + it.facet; itN.set(k, (itN.get(k) ?? 0) + 1); if (p.events.some(i => { const e = w.events[i]; return e.t >= w.startPresent && e.causes.some(c => c.label === it.words); })) itS.set(k, (itS.get(k) ?? 0) + 1); }
  }
}
console.log('SIGNATURES'); for (const [k, v] of [...n].sort((a, b) => b[1] - a[1])) console.log(k.padEnd(22), v, Math.round(100 * (shown.get(k) ?? 0) / v) + '%', 'evidence events', evk.get(k.slice(0, -1)) ?? 0);
console.log('IF-THENS'); for (const [k, v] of [...itN].sort((a, b) => b[1] - a[1])) console.log(k.padEnd(28), v, Math.round(100 * (itS.get(k) ?? 0) / v) + '%');
