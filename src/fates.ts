// Fates: one world, many run seeds. How much of a life is the person, how much the hand they are dealt?
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { fullName, age, live, type World, type Person } from './world';
const SEED = +(process.argv[2] ?? 3), RUNS = +(process.argv[3] ?? 8);
const outcomes = (w: World, p: Person) => ({
  left: p.status === 'away' || p.events.some(i => w.events[i].t >= w.startPresent && w.events[i].type === 'left'),
  partnered: p.partner != null, lead: p.lead, broke: p.events.some(i => w.events[i].t >= w.startPresent && ['shout', 'walkout', 'shutout', 'numb', 'quitpride'].includes(w.events[i].type)),
  pursued: p.wants.some(x => x.pursuit && !x.pursuit.owner && x.since >= w.startPresent), achieved: p.wants.some(x => x.done === 'achieved' && x.pursuit && x.since >= w.startPresent), inGroup: p.group != null || p.events.some(i => w.events[i].type === 'group:formed' || w.events[i].type === 'group:joined'),
  drinks: p.drinks, dead: p.status === 'dead',
});
const keys = ['left', 'partnered', 'lead', 'broke', 'pursued', 'achieved', 'inGroup', 'drinks', 'dead'] as const;
const per = new Map<number, Record<string, number>>(); let names = new Map<number, string>();
for (let r = 1; r <= RUNS; r++) {
  const w = buildWorld(SEED, r); pickWitness(w); runYears(w, 10);
  for (const p of w.people) { if (age(w, p) < 25 || age(w, p) > 70) continue; names.set(p.id, fullName(p)); const o = outcomes(w, p) as any; const rec = per.get(p.id) ?? Object.fromEntries(keys.map(k => [k, 0])); for (const k of keys) rec[k] += o[k] ? 1 : 0; per.set(p.id, rec); }
}
// Character share: for each outcome, how much of the variance is between people (character and circumstance) vs within a person across fates (luck).
console.log(`world ${SEED}, ${RUNS} fates, ${per.size} adults`);
for (const k of keys) {
  const ps = [...per.values()].map(r => r[k] / RUNS); const mean = ps.reduce((s, x) => s + x, 0) / ps.length;
  const between = ps.reduce((s, x) => s + (x - mean) ** 2, 0) / ps.length; const within = ps.reduce((s, x) => s + x * (1 - x), 0) / ps.length;
  const destined = ps.filter(x => x > 0.8).length, never = ps.filter(x => x < 0.2).length, open = ps.length - destined - never;
  console.log(`${k.padEnd(10)} base ${(100 * mean).toFixed(0).padStart(3)}% · character share ${(100 * between / Math.max(1e-9, between + within)).toFixed(0).padStart(3)}% · always ${destined} · never ${never} · open ${open}`);
}
const interesting = [...per.entries()].map(([id, r]) => [id, keys.filter(k => r[k] > 0 && r[k] < RUNS).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 3);
console.log('most fate-dependent lives:', interesting.map(([id, n]) => `${names.get(id)} (${n} outcomes vary: ${keys.filter(k => per.get(id)![k] > 0 && per.get(id)![k] < RUNS).map(k => `${k} ${per.get(id)![k]}/${RUNS}`).join(', ')})`).join(' · '));
