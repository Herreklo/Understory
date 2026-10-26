// P4 research (26 Oct 2026): how often a held feeling meets its object, and what a meeting it raised would compete with. Throwaway
// worlds only, feelings on (round 44's code, ON=feelings). Reads the world through the predict hook; changes nothing in the engine.
//   ./run.sh notes/research/sources/meeting-scripts/meet.ts A B [years] [outdir]   → <outdir>/meet-<seed>.json
// Per world, over its present years:
//   episodes   every resentment, guilt and gratitude once it reaches the weight it is weighed at (0.12): its onset strength, whether its
//              cause still stood, each month's intensity, and whether holder and object share a place in each other's lives (a job,
//              a circle, a band, friends, a partner, kin). Then, within twelve months: a decision of the holder with the object that
//              weighs it, and whether removing it flips that decision (flip.ts); any decision of either with the other.
//   months     per eligible holder-month (the feeling at 0.3 or more, its cause standing, the object in town, a shared place): the weight
//              of the matched situation that won the holder's month (situations/index.ts), or none; and whether the holder's month
//              had a matched situation with another counterpart from the object's own places (a door that redirects it).
//   oldwound   decisions of the old wound where the actor resents the target, and how many weigh the resentment (v4's rule mutes a
//              feeling whose cause is the event the situation answers).
//   byTrigger  the flip share of the feeling's own reasons by kind of decision.
import '../../../../src/tools/env';
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { pickWitness } from '../../../../src/witness';
import { ON, age, type Person, type World } from '../../../../src/world';
import { feelingsOf } from '../../../../src/feelings';
import { score, truthView, type Option } from '../../../../src/decide';
import { neutralised, stateMatcher } from '../../../../src/tools/diag/flip';
import { SETTING } from '../../../../src/setting';

const [A, B] = [Number(process.argv[2] ?? 9001), Number(process.argv[3] ?? 9001)];
const YEARS = Number(process.argv[4] ?? 10);
const OUT = process.argv[5] ?? 'out-meeting';
mkdirSync(OUT, { recursive: true });
ON.add('feelings');

// The matched situations (situations/index.ts TYPES) and their weights; strain is 2 only when breaking, which a record does not say.
const MATCHED: Record<string, number> = {
  temptation: 1,
  request: 1,
  risk: 1,
  offer: 2,
  chance: 1.5,
  strain: 1,
  obligation: 1,
  confide: 1,
  deadline: 1,
  newcomer: 0.9,
  asked: 0.9,
  accident: 2,
  danger: 1.8,
  hometruth: 0.9,
  criticised: 0.9,
  collection: 0.9,
  oldwound: 0.9,
  reckon: 1.2,
  [SETTING.yearly.id]: 0.8,
};
const KINDS = ['resentment', 'guilt', 'gratitude'] as const;
const kin = (a: Person, b: Person) =>
  a.parents.includes(b.id) || b.parents.includes(a.id) || (a.parents.length > 0 && a.parents.some(x => b.parents.includes(x)));
const shared = (p: Person, q: Person) =>
  (!!p.job && p.job === q.job) ||
  p.circle.includes(q.id) ||
  q.circle.includes(p.id) ||
  (p.group != null && p.group === q.group) ||
  p.friends.has(q.id) ||
  p.partner === q.id ||
  kin(p, q);

interface Dec {
  t: number;
  p: number;
  o?: number;
  trig: string;
  sit: boolean; // in the situations phase
  feel: Record<string, boolean>; // kinds weighed → flipped
}

function runWorld(seed: number) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const decs: Dec[] = [];
  const byTrigger: Record<string, [number, number]> = {};
  const oldwound = { resenting: 0, weighed: 0 };
  w.hooks.predict = (w2: World, p: Person, options: Option[], chosen: string, rec: any) => {
    if (w2.t < w2.startPresent) return;
    const feel: Record<string, boolean> = {};
    const view = truthView(w2);
    const top = (s: { id: string; p: number }[]) => s.reduce((a, b) => (b.p > a.p ? b : a)).id;
    const before = top(score(options, view, p.variability));
    for (const k of ['grief', ...KINDS, 'owes', 'owed']) {
      const id = 'feel:' + k;
      if (!options.some(o => o.considerations.some(c => c.id === id))) continue;
      feel[k] = top(score(neutralised(options, stateMatcher(id)), view, p.variability)) !== before;
      const r = (byTrigger[`${k}|${rec.trigger}`] ??= [0, 0]);
      r[0]++;
      if (feel[k]) r[1]++;
    }
    if (
      rec.trigger === 'oldwound' &&
      rec.target != null &&
      feelingsOf(w2, p.id).some(f => f.k === 'resentment' && f.o === rec.target && f.v >= 0.12)
    ) {
      oldwound.resenting++;
      if (feel.resentment != null) oldwound.weighed++;
    }
    decs.push({ t: w2.t, p: p.id, o: rec.target, trig: rec.trigger, sit: w2.rng === w2.streams.situations, feel });
  };
  // Episodes, keyed holder|kind|object, from the month a feeling is first seen at 0.12 or more until it is gone.
  const open = new Map<string, any>();
  const episodes: any[] = [];
  const months: any[] = []; // eligible holder-months
  for (let m = 0; m < YEARS * 12; m++) {
    const d0 = decs.length;
    tick(w);
    // This month's matched winner for each actor, and the counterparts of their matched situations.
    const won = new Map<number, { w: number; o?: number }>();
    for (let i = d0; i < decs.length; i++) {
      const d = decs[i];
      if (d.sit && d.trig in MATCHED && !won.has(d.p)) won.set(d.p, { w: MATCHED[d.trig], o: d.o });
    }
    const seen = new Set<string>();
    for (const p of w.people) {
      if (p.status !== 'in' || age(w, p) < 18) continue;
      for (const f of feelingsOf(w, p.id)) {
        if (!(KINDS as readonly string[]).includes(f.k) || f.v < 0.12) continue;
        const key = `${p.id}|${f.k}|${f.o}`;
        seen.add(key);
        const q = w.byId.get(f.o);
        const sh = !!q && q.status === 'in' && shared(p, q);
        let e = open.get(key);
        if (!e) {
          e = { p: p.id, k: f.k, o: f.o, t: w.t, v0: f.v, stands0: f.stands, v: [] as number[], sh: [] as boolean[], end: null };
          open.set(key, e);
          episodes.push(e);
        }
        e.v.push(+f.v.toFixed(3));
        e.sh.push(sh);
        if (f.v >= 0.3 && f.stands && sh) {
          const win = won.get(p.id);
          const redirect = !!win && win.o != null && win.o !== f.o && !!q && shared(q, w.byId.get(win.o)!); // the object shares a place with the counterpart taken
          months.push({ k: f.k, v: +f.v.toFixed(3), win: win?.w ?? 0, redirect });
        }
      }
    }
    for (const [key, e] of open)
      if (!seen.has(key)) {
        e.end = w.t;
        open.delete(key);
      }
  }
  // Within twelve months of onset: met (a decision of the holder with the object weighing the feeling), flipped there, any contact.
  const byPair = new Map<string, Dec[]>();
  for (const d of decs) if (d.o != null) (byPair.get(`${d.p}|${d.o}`) ?? byPair.set(`${d.p}|${d.o}`, []).get(`${d.p}|${d.o}`)!).push(d);
  const horizon = w.t;
  for (const e of episodes) {
    const inYear = (d: Dec) => d.t >= e.t && d.t < e.t + 12;
    const mine = (byPair.get(`${e.p}|${e.o}`) ?? []).filter(inYear);
    const theirs = (byPair.get(`${e.o}|${e.p}`) ?? []).filter(inYear);
    const weighed = mine.filter(d => d.feel[e.k] != null);
    e.met = weighed.length > 0;
    e.metN = weighed.length;
    e.flipped = weighed.some(d => d.feel[e.k]);
    e.contact = mine.length + theirs.length > 0;
    e.mineN = mine.length;
    e.theirsN = theirs.length;
    e.full = e.t + 12 <= horizon; // a whole year observed
    e.metTrig = weighed.map(d => d.trig);
  }
  const adults = w.people.filter(p => p.status === 'in' && age(w, p) >= 18).length;
  return { seed, years: YEARS, adults, decisions: decs.filter(d => d.t >= w.startPresent).length, episodes, months, oldwound, byTrigger };
}

for (let seed = A; seed <= B; seed++) {
  const r = runWorld(seed);
  writeFileSync(`${OUT}/meet-${seed}.json`, JSON.stringify(r));
  console.log(seed, r.episodes.length, r.months.length, JSON.stringify(r.oldwound));
}
