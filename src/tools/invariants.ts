// Invariants that must hold in every world (part of npm test).
//  1. Friendship is mutual: if A counts B as a friend, B counts A, whoever is in town or away (round 19d).
//  2. Marks from history fade with years even when nothing new happens, and a rule to live by leaves the self-story with its mark (round 19d).
//  3. Rows happen only between partners, and a couple's state is kept in one place whoever raises a row (rounds 20, 20b).
//  4. The consistency audit (round 21, src/audit.ts) finds nothing.
//  5. Every thread event is on the own list of each person it is about, and no list holds an event twice (round F26).
import { buildWorld } from '../build';
import { tick } from '../life';
import { pickWitness } from '../witness';
import { live, age, OFF, ON, type World } from '../world';
import { persona, personaTick, QUIRKS } from '../persona';
import { audit, type Found } from './audit';

for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
for (const x of (process.env.ON ?? '').split(',').filter(Boolean)) ON.add(x);
let bad = 0;
const fail = (s: string) => {
  if (bad++ < 5) console.error('INVARIANT FAILED: ' + s);
};
function friendsSymmetric(w: World) {
  for (const p of w.byId.values())
    for (const id of p.friends) {
      const q = w.byId.get(id);
      if (q && q.status !== 'dead' && p.status !== 'dead' && !q.friends.has(p.id))
        fail(`world ${w.seed}, month ${w.t}: ${p.first} (${p.status}) counts ${q.first} (${q.status}) as a friend, not the other way`);
    }
}
const found: Found = new Map();
for (const seed of [31, 32, 33]) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  audit(w, found);
  for (let m = 0; m < 72; m++) {
    tick(w);
    friendsSymmetric(w);
    audit(w, found);
  }
  for (const e of w.events) {
    const d = e.decision as any;
    if (!d || (d.trigger !== 'row' && d.trigger !== 'row-answer')) continue;
    if (e.who.length < 2) continue;
    const a = w.byId.get(e.who[0])!,
      b = w.byId.get(e.who[1])!;
    if (!b || (a.partner !== b.id && (a as any)['cs:' + b.id] == null && (b as any)['cs:' + a.id] == null))
      fail(`world ${seed}: a row between ${a.first} and ${b?.first}, who were never a couple`);
  }
  // Each person's own list holds every thread event about them, once.
  for (const e of w.events) {
    if (!e.type.startsWith('thread:')) continue;
    for (const id of new Set(e.who))
      if (!w.byId.get(id)?.events.includes(e.id)) fail(`world ${seed}: ${e.type} event ${e.id} is missing from ${w.byId.get(id)?.first}'s own list`);
  }
  for (const p of w.people) if (new Set(p.events).size !== p.events.length) fail(`world ${seed}: ${p.first}'s own list holds an event twice`);
  // A couple's state lives in one place: on the partner with the lower id, never on the other (the round 20 bug).
  for (const p of w.people)
    for (const k of Object.keys(p)) {
      if (k.startsWith('couple:')) fail(`${p.first}: old couple state ${k}`);
      if (k.startsWith('cs:') && +k.slice(3) < p.id) fail(`${p.first} holds the state of a couple whose lower id is ${k.slice(3)}`);
    }
}
// The consistency audit (round 21): partners, family, friends, work, rivalries, plans, groups, wants.
for (const [k, v] of found) fail(`${k}: ${v.n} (${v.ex[0]})`);
// Fading: the same people thirty years on, with nothing new happening to them.
{
  const w = buildWorld(34, 1);
  pickWitness(w);
  for (let m = 0; m < 24; m++) tick(w);
  const marked = live(w)
    .filter(p => age(w, p) >= 25)
    .map(p => [p, persona(w, p)] as const)
    .filter(([, ps]) => ps.sore.length + ps.fears.length + ps.rules.length > 0);
  const before = marked.reduce((s, [, ps]) => s + ps.sore.length + ps.fears.length + ps.rules.length, 0);
  w.t += 360;
  const quiet = (w as any).quiet;
  personaTick(w);
  (w as any).quiet = quiet;
  const after = marked.reduce((s, [p]) => {
    const ps = persona(w, p);
    return s + ps.sore.length + ps.fears.length + ps.rules.length;
  }, 0);
  if (!(after < before)) fail(`marks did not fade: ${before} held, ${after} thirty years on with nothing new`);
  for (const [p] of marked) {
    const ps = persona(w, p);
    for (const s of p.selfStory)
      if ((s as any).rule && !ps.rules.some(r => r.key === s.key && r.text === s.text))
        fail(`${p.first} still tells a rule (${s.text}) whose mark has gone`);
  }
  console.log(
    `invariants ok: the consistency audit and friendship symmetry hold over 3 worlds × 6 years; rows only between couples; marks fade (${before} held → ${after} thirty quiet years on), faded rules leave the self-story`,
  );
}
// A quirk may describe a habit, a disposition or a state, never a one-off past act that is not on the record. A pattern that opens with a
// past-tense verb must rest on something the record holds: someone they lost, an achievement of theirs, or a real grudge.
{
  const PAST =
    /^(once |)(\w+ed|took|bet|gave|told|said|sold|bought|threw|left|lent|slept|hung|kept|sent|ran|went|made|had|did|was|cried|swore|broke|lost|won|fought|stole)\b/;
  const grounded = /\{(lost|boast|grudge)\}/;
  const claims = QUIRKS.filter(q => PAST.test(q.text) && !grounded.test(q.text));
  if (claims.length) fail(`quirks claiming an incident not on the record: ${claims.length} (${claims[0].text})`);
  else console.log(`invariants ok: no quirk claims an incident the record does not hold (${QUIRKS.length} patterns)`);
}
if (bad) process.exit(1);
