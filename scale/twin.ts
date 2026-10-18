// S11, the twin test: does a person who spent thirty years in the background behave like the same person who lived them in full?
//   npx tsx scale/twin.ts <adults> <seed>
// Three cities from one founding (same people, same traits, same families at year 0). Neighbourhood k is:
//   A  — in focus for the whole thirty-year past (monthly);
//   A2 — in focus too, but the monthly world lives the past on other dice and the present on another run seed: a different full life;
//   B  — in the background for the whole past, then promoted at the start of the present.
// Every founder of neighbourhood k who is in town and at least 30 in all three is put through the same battery of situations, the
// engine's own: the options and considerations are built by its rules (wiringC, identityC) and scored by its decision engine with
// the true state of the person (truthView), toward the same stranger. For each situation we read the probability of each answer
// family, and the act the person would choose within each family.
// Distances: d(A,B) is the twin gap; d(A,A2) is how much a different full life moves the same person (the floor); d(A,A') between
// different people of the same neighbourhood and age band is the ceiling. As a check of sensitivity, the same people at the founding
// (thirty years younger, before any of it was lived) against A shows how much thirty years of life move answers at all. The gap ratio g = (d(A,B) − d(A,A2)) / (ceiling − d(A,A2)):
// 0 means living in the background changes a person no more than living a different full life; 1 means it makes them a stranger.
import { buildWorld } from '../src/build';
import { age, type World, type Person } from '../src/world';
import { hoods } from '../src/scale';
import { promoteHood } from '../src/coarse';
import { score, truthView, type Option, type Consideration } from '../src/decide';
import { wiringC, identityC, pickExpression, type Instance } from '../src/grammar';
import type { Family } from '../src/families';
import type { Feature } from '../src/features';
import { generatePerson } from '../src/generate';
const ADULTS = +(process.argv[2] ?? 300),
  SEED = +(process.argv[3] ?? 91);
const Hguess = Math.max(2, Math.round((ADULTS * 1.6) / 80));
const K = Math.floor(Hguess / 2); // the neighbourhood under test: the first background one
// The battery: the engine's situations, by their features and answer families (grammar, drama, group, threads, time, projects).
const BATTERY: [string, Feature[], Family[]][] = [
  ['provocation', ['public', 'standing', 'challenged'], ['anger', 'humility', 'pride']],
  ['asked', ['authority', 'private', 'standing'], ['honesty', 'dishonesty']],
  ['chance', ['public', 'watched', 'standing'], ['openness', 'reluctance']],
  ['collection', ['public', 'money'], ['generosity', 'refusal']],
  ['confide', ['private', 'friend'], ['seeking', 'withdrawal']],
  ['danger', ['danger', 'public'], ['courage', 'caution']],
  ['deadline', ['pressure'], ['duty', 'lapse']],
  ['discovery', ['private', 'friend'], ['discretion', 'disclosure']],
  ['judgement', ['authority', 'standing', 'public'], ['severity', 'leniency']],
  ['newcomer', ['stranger', 'public'], ['warmth', 'withdrawal']],
  ['obligation', ['private', 'family', 'need'], ['duty', 'lapse']],
  ['standup', ['public', 'authority', 'need'], ['courage', 'caution']],
  ['support', ['private', 'need', 'friend'], ['warmth', 'lapse']],
  ['groupstrain', ['public', 'standing', 'pressure'], ['pride', 'humility']],
  ['reachout', ['private', 'friend'], ['humility', 'pride']],
  ['risk', ['danger', 'money', 'public'], ['courage', 'caution']],
];
type Profile = { p: number[][]; acts: string[][] };
function profile(w: World, p: Person, stranger: Person, kin?: Person): Profile {
  const view = truthView(w);
  const out: Profile = { p: [], acts: [] };
  for (const target of kin ? [stranger, kin] : [stranger])
    for (const [type, f, fams] of BATTERY) {
      const feats = new Set<Feature>(f);
      const inst: Instance = { type, actor: p, target, others: [], thing: 'it', features: feats, families: fams } as any;
      const options: Option[] = fams.map(fam => {
        const cs: Consideration[] = [...wiringC(p, fam, feats, target.id)];
        const idc = identityC(p, fam);
        if (idc) cs.push(idc);
        for (const c of cs) if (!c.who) c.who = p;
        return { id: fam, label: fam, considerations: cs.slice(0, 5) };
      });
      out.p.push(score(options, view, p.variability).map(o => o.p));
      out.acts.push(fams.map(fam => pickExpression(w, p, fam, inst, view).id));
    }
  return out;
}
const tv = (a: number[], b: number[]) => a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0) / 2;
function dist(a: Profile, b: Profile) {
  let d = 0,
    act = 0,
    n = 0;
  const m = Math.min(a.p.length, b.p.length);
  for (let i = 0; i < m; i++) {
    d += tv(a.p[i], b.p[i]);
    for (let j = 0; j < a.acts[i].length; j++) {
      act += a.acts[i][j] !== b.acts[i][j] ? 1 : 0;
      n++;
    }
  }
  return { choice: d / m, act: act / n };
}
// Each person is also asked toward one of their own family from the founding (same id in every world), so ties count.
const KIN = new Map<number, number>();
function world(focusTo: number, runSeed: number, salt: number | undefined, promote: boolean, past = 30) {
  (globalThis as any).SCALE_FOCUS = focusTo;
  (globalThis as any).SCALE_PAST_SALT = salt;
  const w = buildWorld(SEED, runSeed, past, ADULTS);
  if (promote) promoteHood(w, K);
  const stranger = generatePerson(w, { age: 40, sex: 'm', founder: true, id: 9_999_999 });
  stranger.status = 'gone'; // the same stranger in every world
  const ps = w.people.filter(
    p => (p.status === 'in' || (past === 0 && p.status === 'bg')) && (p as any).hood === K && p.founder && age(w, p) >= (past === 0 ? 0 : 30),
  );
  for (const p of ps)
    if (!KIN.has(p.id)) {
      const k = [...p.parents, ...p.kids, ...(p.partner != null ? [p.partner] : [])].find(id => w.byId.get(id)?.founder);
      if (k != null) KIN.set(p.id, k);
    }
  const prof = new Map(ps.map(p => [p.id, profile(w, p, stranger, KIN.has(p.id) ? w.byId.get(KIN.get(p.id)!) : undefined)] as const));
  const state = new Map(
    ps.map(
      p =>
        [
          p.id,
          {
            story: p.selfStory.length,
            ifThens: p.ifThens.length,
            facets: { ...p.facets },
            stress: p.stress,
            health: p.health,
            age: age(w, p),
            friends: p.friends.size,
            marks: p.marks.length,
          },
        ] as const,
    ),
  );
  return { prof, state, hoods: hoods(w) };
}
const Z = world(K + 1, 1, undefined, false, 0); // the founding itself: the same people thirty years younger
const A = world(K + 1, 1, undefined, false),
  A2 = world(K + 1, 2, 5, false),
  B = world(K, 1, undefined, true);
const ids = [...A.prof.keys()].filter(id => A2.prof.has(id) && B.prof.has(id));
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
const pair = (X: typeof A, Y: typeof A) => ids.map(id => dist(X.prof.get(id)!, Y.prof.get(id)!));
const ab = pair(A, B),
  aa = pair(A, A2);
const fromZ = (X: typeof A) => ids.filter(id => Z.prof.has(id)).map(id => dist(X.prof.get(id)!, Z.prof.get(id)!));
const life = fromZ(A),
  lifeA2 = fromZ(A2),
  lifeB = fromZ(B);
const between: { choice: number; act: number }[] = []; // different people, same neighbourhood, within ten years of age, both in A
for (const i of ids)
  for (const j of ids) if (i < j && Math.abs(A.state.get(i)!.age - A.state.get(j)!.age) < 10) between.push(dist(A.prof.get(i)!, A.prof.get(j)!));
const g = (k: 'choice' | 'act') => (mean(ab.map(x => x[k])) - mean(aa.map(x => x[k]))) / (mean(between.map(x => x[k])) - mean(aa.map(x => x[k])));
const facetGap = (X: typeof A, Y: typeof A) =>
  mean(
    ids.map(id => {
      const a = X.state.get(id)!.facets,
        b = Y.state.get(id)!.facets;
      const ks = Object.keys(a).filter(k => !k.includes(':'));
      return Math.sqrt(mean(ks.map(k => (a[k] - (b[k] ?? 0)) ** 2)));
    }),
  );
const st = (X: typeof A, k: 'story' | 'ifThens' | 'stress' | 'health' | 'friends' | 'marks') => +mean(ids.map(id => X.state.get(id)![k])).toFixed(3);
console.log(
  JSON.stringify({
    seed: SEED,
    adults: ADULTS,
    hood: K,
    twins: ids.length,
    betweenPairs: between.length,
    choice: {
      AB: +mean(ab.map(x => x.choice)).toFixed(4),
      AA2: +mean(aa.map(x => x.choice)).toFixed(4),
      between: +mean(between.map(x => x.choice)).toFixed(4),
      gap: +g('choice').toFixed(3),
    },
    act: {
      AB: +mean(ab.map(x => x.act)).toFixed(4),
      AA2: +mean(aa.map(x => x.act)).toFixed(4),
      between: +mean(between.map(x => x.act)).toFixed(4),
      gap: +g('act').toFixed(3),
    },
    thirtyYears: { choice: +mean(life.map(x => x.choice)).toFixed(4), act: +mean(life.map(x => x.act)).toFixed(4), n: life.length },
    // how far each copy moved from who they were at the founding: the background keeps a life if B moved as far as A and A2
    fromFounding: Object.fromEntries(
      (
        [
          ['A', life],
          ['A2', lifeA2],
          ['B', lifeB],
        ] as const
      ).map(([k, xs]) => [k, { choice: +mean(xs.map(x => x.choice)).toFixed(4), act: +mean(xs.map(x => x.act)).toFixed(4) }]),
    ),
    facetRms: { AB: +facetGap(A, B).toFixed(4), AA2: +facetGap(A, A2).toFixed(4) },
    state: Object.fromEntries(
      (['story', 'ifThens', 'stress', 'health', 'friends', 'marks'] as const).map(k => [k, { A: st(A, k), A2: st(A2, k), B: st(B, k) }]),
    ),
  }),
);
