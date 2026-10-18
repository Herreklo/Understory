// Social outcomes per person, to check that the scale layer keeps each person's social world the same size as in the town.
//   npx tsx scale/social.ts <adults> <seed> [pastYears] [presentYears]
import { SETTING } from '../src/setting';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { live, age, bkA } from '../src/world';
const ADULTS = +(process.argv[2] ?? 46), SEED = +(process.argv[3] ?? 1), PAST = +(process.argv[4] ?? 5), YEARS = +(process.argv[5] ?? 5);
const k = Math.max(1, Math.round(ADULTS / 46));
const base = SETTING.places.slice();
for (let i = 2; i <= k; i++) for (const pl of base) SETTING.places.push({ ...pl, id: `${pl.id}-${i}`, name: `${pl.name} ${i}` });
const w = buildWorld(SEED, 1, PAST, ADULTS); pickWitness(w);
const contacts = new Map<number, number>();
let t0 = Infinity;
w.hooks.contact = (_w, a, b) => { if (w.t >= t0) { contacts.set(a.id, (contacts.get(a.id) ?? 0) + 1); contacts.set(b.id, (contacts.get(b.id) ?? 0) + 1); } };
runYears(w, YEARS - 1); t0 = w.t + 1; runYears(w, 1); // contacts counted over the final year
const L = live(w); const A = L.filter(p => age(w, p) >= 18); const young = A.filter(p => age(w, p) < 30);
const bondsOf = new Map<number, number>(); for (const [key, r] of w.bonds) { const a = bkA(key); if (r.fam >= 0.1) bondsOf.set(a, (bondsOf.get(a) ?? 0) + 1); }
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
const fr = (ps: typeof A) => mean(ps.map(p => p.friends.size));
const ev = w.events.filter(e => e.t >= w.startPresent);
console.log(JSON.stringify({
  adults: ADULTS, seed: SEED, people: L.length,
  friendsPerAdult: +fr(A).toFixed(2), friendlessAdults: +(A.filter(p => p.friends.size === 0).length / A.length).toFixed(3),
  friendsPerYoungAdult: +fr(young).toFixed(2), partnered: +(A.filter(p => p.partner != null).length / A.length).toFixed(3),
  knownWellPerPerson: +mean(L.map(p => bondsOf.get(p.id) ?? 0)).toFixed(1), contactsPerPersonMonth: +(mean(L.map(p => contacts.get(p.id) ?? 0)) / 12).toFixed(1),
  newFriendshipsPerAdultYear: +(ev.filter(e => e.type === 'friends').length * 2 / A.length / YEARS).toFixed(3),
  rowsPerAdultYear: +(ev.filter(e => e.type === 'row').length / A.length / YEARS).toFixed(3),
  eventsPerPersonYear: +(ev.length / L.length / YEARS).toFixed(1),
}));
