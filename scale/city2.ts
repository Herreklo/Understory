// S7 tests on a city (S3's tests, with institutions: every neighbourhood has its own workplaces; no places are copied by hand): half its neighbourhoods simulated monthly, half by the coarse yearly pass.
//   npx tsx scale/city2.ts <adults> <seed> [presentYears] [promote]
// Test 3 (coarse matches full): the background half and the monthly half, built from the same generator, compared on demography.
// Test 4 (promoted people are indistinguishable): background neighbourhoods brought into focus at the start of the present,
// compared after catch-up and two years later with people who were always in focus.
import { performance } from 'perf_hooks';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { age, bkA, type World, type Person } from '../src/world';
import { hoods, everyone } from '../src/scale';
import { promoteHood, bgPlaces } from '../src/coarse';
import { typeOf } from '../src/scale';
import { persona } from '../src/persona';

const ADULTS = +(process.argv[2] ?? 920),
  SEED = +(process.argv[3] ?? 1),
  YEARS = +(process.argv[4] ?? 2),
  PROMOTE = +(process.argv[5] ?? 2);
const Hguess = Math.max(2, Math.round((ADULTS * 1.6) / 80));
const F = Math.floor(Hguess / 2);
(globalThis as any).SCALE_FOCUS = F;
const CS: any = ((globalThis as any).SCALE_COARSE_STATS = {}); // the coarse pass's own tallies, reported with the result
const t0 = performance.now();
const w = buildWorld(SEED, 1, 30, ADULTS);
pickWitness(w);
const buildS = (performance.now() - t0) / 1000;
const H = hoods(w);
const focus0 = new Set((w as any).focus as Set<number>);

type Group = Person[];
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN);
function demog(w: World, ps: Group, evFrom: number) {
  const A = ps.filter(p => age(w, p) >= 18),
    W = ps.filter(p => age(w, p) >= 20 && age(w, p) < 65),
    O = ps.filter(p => age(w, p) >= 65);
  const hs = new Set(ps.map(p => (p as any).hood)); // events of anyone who lived in these neighbourhoods, the dead included
  const evs = w.events.filter(e => e.t >= evFrom && hs.has((w.byId.get(e.who[0]) as any)?.hood));
  const yrs = Math.max(1, (w.t - evFrom) / 12);
  const pyramid = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(d => ps.filter(p => Math.min(8, Math.floor(age(w, p) / 10)) === d).length / ps.length);
  return {
    n: ps.length,
    under20: ps.filter(p => age(w, p) < 20).length / ps.length,
    over65: O.length / ps.length,
    pyramid,
    partnered: A.filter(p => p.partner != null).length / A.length,
    working: W.filter(p => p.job).length / W.length,
    retired65: O.filter(p => p.retired).length / Math.max(1, O.length),
    drinks: A.filter(p => p.drinks).length / A.length,
    savings: mean(A.map(p => p.savings)),
    kidsPerAdult40: mean(ps.filter(p => age(w, p) >= 40 && age(w, p) < 55).map(p => p.kids.length)),
    birthsPerK: (1000 * evs.filter(e => e.type === 'born').length) / ps.length / yrs,
    deathsPerK: (1000 * evs.filter(e => e.type === 'death').length) / ps.length / yrs,
  };
}
function social(w: World, ps: Group) {
  const A = ps.filter(p => age(w, p) >= 18),
    O40 = ps.filter(p => age(w, p) >= 40);
  const bondsOf = new Map<number, number>();
  for (const [key, r] of w.bonds) {
    const a = bkA(key);
    if (r.fam >= 0.1) bondsOf.set(a, (bondsOf.get(a) ?? 0) + 1);
  }
  const marks = (p: Person) => {
    const ps2 = persona(w, p);
    return ps2.sore.length + ps2.fears.length + ps2.rules.length;
  };
  return {
    n: ps.length,
    friendsPerAdult: mean(A.map(p => p.friends.size)),
    friendless: A.filter(p => p.friends.size === 0).length / A.length,
    knownWell: mean(ps.map(p => bondsOf.get(p.id) ?? 0)),
    habits: mean(A.map(p => p.habits.filter(h => !h.broken).length)),
    partnered: A.filter(p => p.partner != null).length / A.length,
    marked40: O40.filter(p => marks(p) > 0).length / Math.max(1, O40.length),
    marks40: mean(O40.map(marks)),
    pride40: mean(O40.map(p => persona(w, p).pride.length)),
  };
}

// Capacity: no workplace, monthly or background, has more staff than it has room for; and background staff live where they work.
function capacity(w: World) {
  const all = [...w.places, ...bgPlaces(w)] as any[];
  const n = new Map<string, number>();
  let away = 0,
    staffBg = 0;
  for (const p of everyone(w))
    if ((p.status === 'in' || p.status === 'bg') && p.job) {
      n.set(p.job, (n.get(p.job) ?? 0) + 1);
      if (p.status === 'bg') {
        staffBg++;
        if ((w.placeById.get(p.job) as any)?.hood !== (p as any).hood) away++;
      }
    }
  const over = all.filter(pl => (n.get(pl.id) ?? 0) > pl.cap);
  const byKind: Record<string, number> = {};
  for (const pl of all) if (pl.hood != null && pl.type != null) byKind[typeOf(pl)] = (byKind[typeOf(pl)] ?? 0) + (n.get(pl.id) ?? 0) / pl.cap;
  const kinds = Object.keys(byKind).length;
  const per = all.filter(pl => pl.hood != null && pl.type != null).length / Math.max(1, kinds);
  for (const k in byKind) byKind[k] = +(byKind[k] / per).toFixed(2);
  const bgSet = new Set(bgPlaces(w));
  const leaderless = all.filter(pl => bgSet.has(pl) && (n.get(pl.id) ?? 0) > 0 && pl.lead == null).length; // background workplaces; a monthly one fills its leader at its next month
  const badLeader = bgPlaces(w).filter((pl: any) => {
    if (pl.lead == null) return false;
    const L = w.byId.get(pl.lead);
    return !L || L.status !== 'bg' || L.job !== pl.id || (L as any).hood !== pl.hood || !L.lead;
  }).length; // a background leader is alive, in the background, on the staff, and lives there
  const leaderlessMonthly = all.filter(pl => !bgSet.has(pl) && (n.get(pl.id) ?? 0) > 0 && pl.lead == null).length;
  return {
    places: all.length,
    over: over.length,
    overIds: over.slice(0, 5).map(pl => `${pl.id}:${n.get(pl.id)}/${pl.cap}`),
    bgStaffLivingElsewhere: away,
    bgStaff: staffBg,
    leaderless,
    badLeader,
    leaderlessMonthly,
    fill: byKind,
  };
}
const inHood = (hs: Set<number>, st: string) => everyone(w).filter(p => p.status === st && hs.has((p as any).hood));
const bgSet = new Set(Array.from({ length: H }, (_, i) => i).filter(h => !focus0.has(h)));

// Test 3, at the start of the present: thirty years of each.
const t3 = { focus: demog(w, inHood(focus0, 'in'), 0), bg: demog(w, inHood(bgSet, 'bg'), 0) };
const cap0 = capacity(w);
// Promotion: the first PROMOTE background neighbourhoods come into focus.
const promoted = [...bgSet].slice(0, PROMOTE);
const tp = performance.now();
const prom = promoted.map(h => promoteHood(w, h));
const promoteS = (performance.now() - tp) / 1000;
const pset = new Set(promoted);
const t4a = { always: social(w, inHood(focus0, 'in')), promoted: social(w, inHood(pset, 'in')) };
const tr = performance.now();
runYears(w, YEARS);
const runS = (performance.now() - tr) / 1000;
const t4b = { always: social(w, inHood(focus0, 'in')), promoted: social(w, inHood(pset, 'in')) };
console.log(
  JSON.stringify({
    adults: ADULTS,
    seed: SEED,
    H,
    F,
    places: w.places.length,
    people: everyone(w).filter(p => p.status === 'in' || p.status === 'bg').length,
    inFocus: w.people.filter(p => p.status === 'in').length,
    background: everyone(w).filter(p => p.status === 'bg').length,
    cap0,
    cap1: capacity(w),
    buildS: +buildS.toFixed(1),
    promoteS: +promoteS.toFixed(2),
    msPerMonth: +((1000 * runS) / (YEARS * 12)).toFixed(0),
    prom,
    t3,
    t4a,
    t4b,
    coarse: CS,
  }),
);
