// Round T3: the invariants as properties over many seeds, with fast-check. The engine's only input is a seed, so each property is
// "for every seed in a throwaway range, after the past and after every present month, this holds". A failure names the seed and
// the first few breaks. Seeds 9201 and up are throwaway (never a test range).
//   tsx src/tools/props.ts [seeds] [present years] [first seed]     npm test runs 5 seeds × 2 years; npm run props 50 × 3.
import fc from 'fast-check';
import { buildWorld } from '../build';
import { tick } from '../life';
import { pickWitness } from '../witness';
import { live, type World } from '../world';
import { hash } from '../rng';
import { audit, type Found } from './audit';

const [n0, y0, f0] = process.argv.slice(2);
const SEEDS = +(n0 ?? 5),
  YEARS = +(y0 ?? 2),
  FIRST = +(f0 ?? 9201);
const BOUND = 100000; // bond keys are a × 100000 + b (scale contract, rule 8)

type Breaks = string[];
const few = (b: Breaks, s: string) => {
  if (b.length < 5) b.push(s);
};

// 1. The record is in time order; every event's people exist; an event is on the own list of everyone in it or of nobody (an act the
//    record did not keep comes off every list, weight 0.2), and one the record kept is on everyone's, once.
function record(w: World, b: Breaks) {
  const own = new Map<number, Set<number>>();
  for (const p of w.people) {
    const s = new Set(p.events);
    if (s.size !== p.events.length) few(b, `record: ${p.first} ${p.last}'s own list holds an event twice`);
    own.set(p.id, s);
  }
  for (let i = 0; i < w.events.length; i++) {
    const e = w.events[i];
    if (e.id !== i) few(b, `record: event ${i} has id ${e.id}`);
    if (i && e.t < w.events[i - 1].t) few(b, `record: event ${i} (${e.type}) is earlier than the one before it`);
    const people = [...new Set(e.who)];
    const missing = people.filter(id => !w.byId.has(id));
    for (const id of missing) few(b, `record: event ${i} (${e.type}) names person ${id}, who does not exist`);
    const has = people.filter(id => w.byId.has(id) && own.get(id)!.has(e.id)).length;
    const present = people.length - missing.length;
    if (has !== 0 && has !== present) few(b, `record: event ${i} (${e.type}) is on ${has} of ${present} of its people's own lists`);
    if (has === 0 && present > 0 && e.w > 0.2) few(b, `record: event ${i} (${e.type}, weight ${e.w}) is on nobody's own list`);
  }
}
// 2. A decision's chosen answer is among its options; every reason's person exists.
function decisions(w: World, b: Breaks) {
  for (const e of w.events) {
    const d = e.decision as any;
    if (d && d.options && !d.options.some((o: any) => o.id === d.chosen)) few(b, `decision: event ${e.id} chose ${d.chosen}, not among its options`);
    for (const c of e.causes)
      if (c.who != null && !w.byId.has(c.who)) few(b, `decision: event ${e.id} has a reason about person ${c.who}, who does not exist`);
  }
}
// 3. Friendship is mutual among the living; partnership is mutual.
function ties(w: World, b: Breaks) {
  for (const p of w.people) {
    if (p.status === 'dead') continue;
    for (const f of p.friends) {
      const q = w.byId.get(f);
      if (q && q.status !== 'dead' && !q.friends.has(p.id)) few(b, `ties: ${p.first} counts ${q.first} as a friend, not the other way`);
    }
    if (p.partner != null) {
      const q = w.byId.get(p.partner);
      if (!q) few(b, `ties: ${p.first}'s partner ${p.partner} does not exist`);
      else if (q.partner !== p.id) few(b, `ties: ${p.first}'s partner is ${q.first}, whose partner is ${q.partner}`);
    }
  }
}
// 4. The consistency audit finds nothing.
function consistency(w: World, b: Breaks) {
  const found: Found = new Map();
  audit(w, found);
  for (const [k, v] of found) few(b, `audit: ${k} × ${v.n} (${v.ex[0]})`);
}
// 5. Nobody dead is in an event after their death.
function dead(w: World, b: Breaks) {
  for (const p of w.people) {
    if (p.status !== 'dead' || p.diedAt == null) continue;
    for (const i of p.events) {
      const e = w.events[i];
      if (e.t > p.diedAt) few(b, `dead: ${p.first} ${p.last} is in "${e.type}" ${e.t - p.diedAt} months after dying`);
    }
  }
}
// 6. A bond's two ends exist, and no key exceeds the bound.
function bonds(w: World, b: Breaks) {
  for (const k of w.bonds.keys()) {
    const a = Math.floor(k / BOUND),
      c = k % BOUND;
    if (a >= BOUND || c >= BOUND) few(b, `bonds: key ${k} exceeds the bound`);
    if (!w.byId.has(a) || !w.byId.has(c)) few(b, `bonds: key ${k} joins a person who does not exist`);
  }
}
// Faults the suite found on main that a later round takes (round T3). Each is named here, counted on every run and reported, and the
// run fails only on anything else. The round that fixes one removes its line, and the property then guards it.
const KNOWN: { pattern: RegExp; what: string; round: string }[] = []; // round F27 fixed the two the suite found on main; the properties guard them now
const CHECKS = [record, decisions, ties, consistency, dead, bonds];

// 7. The same seed twice gives the same world: a signature over every event and every person.
function signature(w: World): number {
  let h = hash('props', w.events.length, w.people.length, w.bonds.size);
  for (const e of w.events) h = hash(h, e.type, e.t, e.who.join(','), (e.decision as any)?.chosen ?? '', (e.decision as any)?.expr ?? '');
  for (const p of w.people) h = hash(h, p.id, p.status, p.partner ?? -1, p.friends.size);
  return h;
}
function runWorld(seed: number, years: number): { w: World; breaks: Breaks } {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const breaks: Breaks = [];
  const checkAll = (when: string) => {
    for (const c of CHECKS) {
      const b: Breaks = [];
      c(w, b);
      for (const s of b) {
        const k = KNOWN.find(x => x.pattern.test(s));
        if (k) (known.get(k.what) ?? known.set(k.what, new Set<string>()).get(k.what)!).add(s);
        else few(breaks, `${when}: ${s}`);
      }
    }
  };
  checkAll('end of the past');
  for (let m = 1; m <= Math.round(years * 12); m++) {
    tick(w);
    checkAll(`present month ${m}`);
  }
  return { w, breaks };
}

const known = new Map<string, Set<string>>(); // known fault -> the distinct breaks seen
const t0 = Date.now();
let worlds = 0;
try {
  fc.assert(
    fc.property(fc.integer({ min: FIRST, max: FIRST + SEEDS - 1 }), seed => {
      const { w, breaks } = runWorld(seed, YEARS);
      worlds++;
      if (breaks.length) throw new Error(`seed ${seed}:\n  ${breaks.join('\n  ')}`);
      const again = runWorld(seed, YEARS).w;
      if (signature(again) !== signature(w)) throw new Error(`seed ${seed}: the same seed gave a different world the second time`);
    }),
    { numRuns: SEEDS, seed: FIRST, endOnFailure: true, verbose: false },
  );
  for (const [what, n] of known) console.log(`props: known fault, ${n.size} distinct breaks: ${what} (${KNOWN.find(k => k.what === what)!.round})`);
  console.log(
    `props: ${worlds} worlds (seeds ${FIRST}–${FIRST + SEEDS - 1}, ${YEARS} present years), every property holds · ${Math.round((Date.now() - t0) / 1000)}s`,
  );
} catch (e: any) {
  console.error(`PROPERTY FAILED after ${worlds} worlds · ${Math.round((Date.now() - t0) / 1000)}s`);
  console.error(
    String(e.message ?? e)
      .split('\n')
      .slice(0, 12)
      .join('\n'),
  );
  process.exitCode = 1;
}
