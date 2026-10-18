// Shared measures for the proof tests: blind reading, witness accuracy, repetition, twist mix.
import { type World, type Person, age, live, type Event } from '../world';
import { knows } from '../witness';

// A life's profile: what the person did (event types where they acted), as a normalised vector.
function profile(w: World, p: Person, evs: Event[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of evs) {
    if (e.who[0] !== p.id) continue;
    const k = e.decision ? e.decision.chosen : e.type;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  let n = 0;
  for (const v of m.values()) n += v * v;
  n = Math.sqrt(n) || 1;
  for (const [k, v] of m) m.set(k, v / n);
  return m;
}
const cos = (a: Map<string, number>, b: Map<string, number>) => {
  let s = 0;
  for (const [k, v] of a) s += v * (b.get(k) ?? 0);
  return s;
};

// Blind reading: match the first half of each life to the second half among all adults. Chance = 1/N.
export function blindReading(w: World, felt = false): { acc: number; n: number } {
  const wit = w.witness!;
  const mid = w.startPresent + Math.floor((w.t - w.startPresent) / 2);
  const people = live(w).filter(p => age(w, p) >= 20 && p.id !== wit);
  const halves = people
    .map(p => {
      const evs = p.events
        .map(i => w.events[i])
        .filter(e => e.t >= w.startPresent && e.w > 0.25 && (!felt || e.knownBy.has(wit) || e.who.includes(wit)));
      return {
        p,
        a: profile(
          w,
          p,
          evs.filter(e => e.t < mid),
        ),
        b: profile(
          w,
          p,
          evs.filter(e => e.t >= mid),
        ),
        na: evs.filter(e => e.t < mid && e.who[0] === p.id).length,
        nb: evs.filter(e => e.t >= mid && e.who[0] === p.id).length,
      };
    })
    .filter(h => h.na >= 4 && h.nb >= 4);
  let hit = 0;
  for (const h of halves) {
    let best = -1,
      bi = -1;
    for (const g of halves) {
      const s = cos(h.a, g.b);
      if (s > best) {
        best = s;
        bi = g.p.id;
      }
    }
    if (bi === h.p.id) hit++;
  }
  return { acc: halves.length ? hit / halves.length : 0, n: halves.length };
}

export interface Measures {
  witness: number;
  known: number;
  strangers: number;
  blind: number;
  blindN: number;
  blindFelt: number;
  twists: number;
  reveals: number;
  lottery: number;
  kinds: number;
  maxRepeat: number;
  sig: number;
  events: number;
}
export function measure(w: World): Measures {
  const wit = w.witness!;
  let n = 0,
    hit = 0,
    kn = 0,
    khit = 0,
    sn = 0,
    shit = 0,
    twists = 0,
    reveals = 0,
    lottery = 0,
    events = 0;
  const present = w.events.filter(e => e.t >= w.startPresent);
  for (const e of present) {
    const d = e.decision;
    if (d && d.witnessGuess) {
      n++;
      const ok = d.witnessGuess === d.chosen;
      if (ok) hit++;
      if (knows(w, d.person)) {
        kn++;
        if (ok) khit++;
      } else {
        sn++;
        if (ok) shit++;
      }
    }
    if (e.w >= 1 && e.surprise != null) {
      events++;
      const hiS = e.surprise > 0.5,
        hiE = (e.explain ?? 0) > 0.5;
      if (hiS && hiE) twists++;
      else if (hiS && (e as any).reveal) reveals++;
      else if (hiS) lottery++;
    }
  }
  const adults = live(w).filter(p => age(w, p) >= 18);
  let sigN = 0,
    sigS = 0,
    maxRepeat = 0;
  const kinds = new Set<string>();
  for (const p of adults) {
    for (const s of p.signatures) {
      sigN++;
      if (p.events.some(i => w.events[i].t >= w.startPresent && w.events[i].evidence.some(x => x.subject === p.id && x.key === s.facet))) sigS++;
    }
    const seen = new Map<string, number>();
    for (const i of p.events) {
      const e = w.events[i];
      if (
        e.t >= w.startPresent &&
        e.who[0] === p.id &&
        e.w > 0.25 &&
        !['tell', 'everyday', 'noticed', 'table', 'habit:broke', 'habit:back', 'ill'].includes(e.type)
      ) {
        const key = e.type + '|' + e.who.slice(1).sort().join(',');
        seen.set(key, (seen.get(key) ?? 0) + 1);
        kinds.add(e.type);
      }
    }
    for (const v of seen.values()) maxRepeat = Math.max(maxRepeat, v);
  }
  const b = blindReading(w),
    bf = blindReading(w, true);
  const yrs = (w.t - w.startPresent) / 120;
  return {
    witness: hit / Math.max(1, n),
    known: khit / Math.max(1, kn),
    strangers: shit / Math.max(1, sn),
    blind: b.acc,
    blindN: b.n,
    blindFelt: bf.acc,
    twists: twists / yrs,
    reveals: reveals / yrs,
    lottery: lottery / yrs,
    kinds: kinds.size,
    maxRepeat,
    sig: sigS / Math.max(1, sigN),
    events,
  };
}
export function avg(ms: Measures[]): Measures {
  const o: any = {};
  for (const k of Object.keys(ms[0]) as (keyof Measures)[]) o[k] = ms.reduce((s, m) => s + m[k], 0) / ms.length;
  return o;
}
export const fmt = (m: Measures) =>
  `witness ${(100 * m.witness).toFixed(0)}% (known ${(100 * m.known).toFixed(0)}% / strangers ${(100 * m.strangers).toFixed(0)}%) · blind reading ${(100 * m.blind).toFixed(0)}% of ${m.blindN.toFixed(0)} (felt only ${(100 * m.blindFelt).toFixed(0)}%) · twists ${m.twists.toFixed(1)} reveals ${m.reveals.toFixed(1)} lottery ${m.lottery.toFixed(1)} · kinds ${m.kinds.toFixed(0)} · max repeat ${m.maxRepeat.toFixed(1)} · signatures ${(100 * m.sig).toFixed(0)}%`;
