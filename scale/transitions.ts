// S3: log what happens to people year by year in full simulation, so the coarse yearly pass can be fitted to the engine.
//   npx tsx scale/transitions.ts <fromSeed> <toSeed> [years] > out.jsonl
// One line per person-year: their state at the start of the year, and what happened to them during it.
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { live, age, type World, type Person } from '../src/world';
import { FACETS, VALUES } from '../src/core';

const A = +(process.argv[2] ?? 1),
  B = +(process.argv[3] ?? A),
  YEARS = +(process.argv[4] ?? 10);
type Snap = {
  id: number;
  t: number;
  x: Record<string, number>;
  partner: number | null;
  kids: number;
  job: string | null;
  retired: boolean;
  drinks: boolean;
  savings: number;
  events: number;
};

function snap(w: World, p: Person): Snap {
  const a = age(w, p);
  const kidsIn = p.kids.map(k => w.byId.get(k)!).filter(k => k && k.status === 'in');
  const x: Record<string, number> = {
    age: a,
    female: p.sex === 'f' ? 1 : 0,
    partnered: p.partner != null ? 1 : 0,
    kids: kidsIn.length,
    young: kidsIn.filter(k => age(w, k) < 6).length,
    minors: kidsIn.filter(k => age(w, k) < 18).length,
    working: p.job ? 1 : 0,
    retired: p.retired ? 1 : 0,
    student: p.student ? 1 : 0,
    ill: p.ill > 0 ? 1 : 0,
    health: p.health,
    savings: Math.max(-20, Math.min(60, p.savings)),
    drinks: p.drinks ? 1 : 0,
    yearsJob: p.job ? (w.t - p.jobSince) / 12 : 0,
    yearsPartner: p.partner != null ? (w.t - p.psince) / 12 : 0,
    parentsHere: p.parents.filter(k => w.byId.get(k)?.status === 'in').length,
    friends: p.friends.size,
    stress: p.stress,
  };
  for (const f of FACETS) x['f_' + f.id] = p.facets[f.id] ?? 0;
  for (const v of VALUES) x['v_' + v.id] = p.values[v.id] ?? 0;
  return {
    id: p.id,
    t: w.t,
    x,
    partner: p.partner,
    kids: p.kids.length,
    job: p.job,
    retired: p.retired,
    drinks: p.drinks,
    savings: p.savings,
    events: p.events.length,
  };
}

for (let seed = A; seed <= B; seed++) {
  // The thirty-year past and ten present years, logged from year 5 of the past on (the first years still carry the founders' set-up).
  const w = buildWorld(seed, 1, 30, 46);
  pickWitness(w);
  // buildWorld has already run the past; log the present years plus a re-run of the past would need hooks, so log the present only,
  // and use several seeds. Arrivals are logged as a rate per resident-year.
  for (let y = 0; y < YEARS; y++) {
    const L = live(w);
    const snaps = L.map(p => snap(w, p));
    const pop = L.length;
    const t0 = w.t;
    const n0 = w.events.length;
    // People away: their odds of coming home this year.
    const away = w.people
      .filter(p => p.status === 'away')
      .map(p => ({
        id: p.id,
        x: {
          age: age(w, p),
          female: p.sex === 'f' ? 1 : 0,
          study: p.awayKind === 'study' ? 1 : 0,
          yearsAway: (w.t - p.awaySince!) / 12,
          parentsHere: p.parents.filter(k => w.byId.get(k)?.status === 'in').length,
          partnered: p.partner != null ? 1 : 0,
        },
      }));
    runYears(w, 1);
    const ev = w.events.slice(n0);
    const arrived = ev.filter(e => e.type === 'arrived').reduce((s, e) => s + e.who.length, 0);
    const home = ev.filter(e => e.type === 'home').length;
    console.log(
      JSON.stringify({
        kind: 'town',
        seed,
        t0,
        pop,
        arrived,
        home,
        births: ev.filter(e => e.type === 'born').length,
        groups: ev.filter(e => e.type === 'arrived').map(e => e.who.map(id => Math.floor(age(w, w.byId.get(id)!)))),
      }),
    );
    for (const a of away) console.log(JSON.stringify({ kind: 'away', seed, t0, id: a.id, x: a.x, home: w.byId.get(a.id)!.status === 'in' ? 1 : 0 }));
    for (const s of snaps) {
      const p = w.byId.get(s.id)!;
      const mine = p.events.slice(s.events).map(i => w.events[i]);
      const has = (ty: string, role?: 0 | 1) => mine.some(e => e.type === ty && (role == null || e.who[role] === p.id));
      const partnerNow = p.partner;
      const y = {
        died: p.status === 'dead' ? 1 : 0,
        left: p.status === 'away' ? 1 : 0,
        leftStudy: p.status === 'away' && p.awayKind === 'study' ? 1 : 0,
        partnered: s.partner == null && partnerNow != null ? 1 : 0,
        separated: s.partner != null && partnerNow !== s.partner && w.byId.get(s.partner)!.status !== 'dead' && p.status !== 'dead' ? 1 : 0,
        child: p.kids.length > s.kids ? 1 : 0,
        gotJob: !s.job && p.job ? 1 : 0,
        lostJob: s.job && !p.job && !p.retired && p.status === 'in' ? 1 : 0,
        changedJob: s.job && p.job && p.job !== s.job ? 1 : 0,
        retired: !s.retired && p.retired ? 1 : 0,
        ill: has('ill', 0) ? 1 : 0,
        drinks: !s.drinks && p.drinks ? 1 : 0,
        sober: s.drinks && !p.drinks && p.status === 'in' ? 1 : 0,
        promoted: has('promoted', 0) ? 1 : 0,
        dsav: p.status === 'in' ? p.savings - s.savings : 0,
      };
      console.log(JSON.stringify({ kind: 'py', seed, t0, id: s.id, x: s.x, y }));
    }
  }
}
