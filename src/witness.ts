// The witness: a simulated observer who learns only what their position lets them see.
// Surprise, explainability, hunches and hindsight all run through the witness.

import { FACET_BY_ID } from './core';
import { type World, type Event, type Person, P, belief, facet, year, live, age, observeAs, peekBond, tagObs } from './world';

export function pickWitness(w: World): Person {
  // Someone present, adult, with a job that sees people: the bar or the clinic if possible.
  const L = live(w).filter(p => age(w, p) >= 25 && age(w, p) < 60 && p.job);
  const pref = L.filter(p => p.job === 'bar' || p.job === 'paper' || p.job === 'clinic');
  const pool = pref.length ? pref : L;
  const p = pool.sort((a, b) => b.facets.sociability - a.facets.sociability)[0];
  w.witness = p.id;
  backfill(w, p);
  w.hooks.explain = explainOf;
  return p;
}
// What everybody knows: the witness arrives with the public past of the last ten years, and some of the local talk.
function backfill(w: World, wit: Person) {
  const since = w.startPresent - 120;
  const peopleJob = wit.job ? (w.placeById.get(wit.job)?.people ?? 0) >= 0.8 : false;
  const r = w.rng;
  tagObs('backfill');
  for (const e of w.events) {
    if (e.t < since || e.knownBy.has(wit.id) || e.who.includes(wit.id)) continue;
    const far = (w.startPresent - e.t) / 120; // older news is fainter
    if (e.vis === 'public') {
      e.knownBy.set(wit.id, 'heard');
      for (const ev of e.evidence) observeAs(w, wit.id, { ...ev, reliability: ev.reliability * (0.7 - 0.3 * far) }, 'heard');
    } else if (e.vis === 'local' && peopleJob && r.chance(0.4 - 0.2 * far)) {
      e.knownBy.set(wit.id, 'heard');
      for (const ev of e.evidence) observeAs(w, wit.id, { ...ev, reliability: ev.reliability * (0.5 - 0.2 * far) }, 'heard');
    }
  }
  tagObs('act');
}
// Does the witness know this person at all? Used to score surprise only where it is fair to.
export function knows(w: World, subject: number): boolean {
  if (w.witness == null || subject === w.witness) return false;
  const b = peekBond(w, w.witness, subject);
  if (b && b.fam > 0.25) return true;
  const bm = w.beliefs.get(w.witness);
  let n = 0;
  if (bm) for (const [k, x] of bm) if (k.startsWith(subject + '|') && x.n >= 2) n++;
  return n >= 3;
}

// Surprise: how unlikely the chosen option looked through the witness's beliefs.
// Explainability: how much of the event's cause chain the witness knows.
export function scoreEvent(w: World, e: Event): { surprise: number; explain: number } | null {
  if (w.witness == null || e.t < w.startPresent) return null;
  if (!e.knownBy.has(w.witness) && !e.who.includes(w.witness)) return null;
  let surprise = 0;
  if (e.decision && e.decision.pWitness != null) surprise = 1 - e.decision.pWitness;
  else surprise = Math.min(1, e.w / 3) * 0.4; // non-decision events: notability stands in
  const explain = e.explain ?? explainOf(w, e);
  e.surprise = surprise;
  e.explain = explain;
  // A reveal: surprising and unexplained, but what was unknown was the person (a trait, a want) and now it is known. Fair, and how you learn people.
  if (surprise > 0.5 && explain <= 0.5) {
    let about = 0,
      total = 0;
    for (const c of e.causes) {
      if (c.key?.startsWith('against:')) continue;
      const wgt = Math.max(0.05, c.weight);
      total += wgt;
      if (
        (c.kind === 'trait' || c.kind === 'want' || c.kind === 'value') &&
        c.who === e.who[0] &&
        e.evidence.some(x => x.subject === c.who && (x.key === beliefKey(c) || (c.kind === 'want' && x.key === 'want:' + c.key)))
      )
        about += wgt;
    }
    (e as any).reveal = total > 0 && about / total >= 0.5;
  }
  return { surprise, explain };
}
// What share of an event's causes the witness already knew. Called when the event is created, before it is broadcast.
// A cause's key as the witness's beliefs file it: bond:like:12 → bond:12; value:x stays value:x.
export const beliefKey = (c: { kind: string; key?: string }) => {
  const k = c.key ?? '';
  if (k.startsWith('bond:')) return k.replace(/^bond:(?:like|respect|trust):(\d+)$/, 'bond:$1');
  if (c.kind === 'value') return k.startsWith('value:') ? k : 'value:' + k;
  return k;
};
export function explainOf(w: World, e: Event): number {
  if (w.witness == null) return 0;
  let known = 0,
    total = 0;
  for (const c of e.causes) {
    const wgt = Math.max(0.05, c.weight);
    total += wgt;
    if (c.kind === 'event' && c.ref != null) {
      const ce = w.events[c.ref];
      if (ce && (ce.knownBy.has(w.witness) || ce.who.includes(w.witness))) known += wgt;
    } else if ((c.kind === 'trait' || c.kind === 'value' || (c.kind === 'bond' && c.key)) && c.who != null && c.key) {
      const bk = beliefKey(c);
      const b = belief(w, w.witness, c.who, bk);
      if (b && b.n > 0) {
        const truth =
          c.kind === 'value'
            ? P(w, c.who).values[bk.slice(6)]
            : bk.startsWith('bond:')
              ? (peekBond(w, c.who, +bk.slice(5))?.like ?? 0)
              : facet(P(w, c.who), bk);
        const sure = Math.min(1, (1 - b.v) * 1.6);
        known += wgt * (Math.sign(b.m) === Math.sign(truth) ? sure : sure * 0.3);
      }
    } else if (c.kind === 'bond' && c.who != null) known += wgt * 0.5;
    else if (c.kind === 'state') {
      const wb = /class/.test(c.label) ? belief(w, w.witness, e.who[0], 'want:study') : null;
      known += wgt * (wb && wb.n > 0 ? 0.9 : e.vis === 'private' ? 0.3 : 0.7);
    } else if (c.kind === 'want') {
      const wb = belief(w, w.witness, c.who ?? e.who[0], 'want:' + (c.key ?? 'escape'));
      known += wgt * (wb && wb.n > 0 ? 0.9 : 0.2);
    }
  }
  return total ? known / total : 0.5;
}

// Scored soon after it happened, with what the witness knew then. Not in hindsight.
export function scoreRecent(w: World) {
  if (w.witness == null) return;
  for (let i = w.events.length - 1; i >= 0; i--) {
    const e = w.events[i];
    if (e.t < w.t - 3) break;
    if (e.t >= w.startPresent && e.surprise == null && (e.knownBy.has(w.witness) || e.who.includes(w.witness))) scoreEvent(w, e);
  }
}
export function scoreAll(w: World) {
  for (const e of w.events) if (e.t >= w.startPresent && e.surprise == null) scoreEvent(w, e);
}

// Hunches: what the witness would put into words about a person.
export interface Hunch {
  key: string;
  text: string;
  sure: number;
  right: boolean;
}
export function hunches(w: World, subject: Person): Hunch[] {
  if (w.witness == null) return [];
  const out: Hunch[] = [];
  const insight = P(w, w.witness).aptitudes.socialInsight;
  const threshold = 0.55 - 0.08 * insight;
  const bm = w.beliefs.get(w.witness);
  if (!bm) return out;
  for (const [k, b] of bm) {
    const [sid, key] = k.split('|');
    if (+sid !== subject.id || key.startsWith('skill:') || key.startsWith('value:')) continue;
    if (b.v > threshold || Math.abs(b.m) < 0.6) continue;
    const f = FACET_BY_ID[key];
    if (!f) continue;
    const sure = 1 - b.v;
    const lead = sure > 0.8 ? "You'd bet" : sure > 0.6 ? "You're fairly sure" : 'You have a feeling';
    const truth = facet(subject, key);
    out.push({
      key,
      text: `${lead} on ${subject.first}: ${b.m > 0 ? f.high : f.low}.`,
      sure,
      right: Math.sign(truth) === Math.sign(b.m) && Math.abs(truth) > 0.4,
    });
  }
  return out.sort((a, b) => b.sure - a.sure);
}

// Hindsight: for an event, the causes the witness could have seen, and the ones they couldn't.
export function hindsight(w: World, e: Event): { seen: string[]; unseen: string[] } {
  const seen: string[] = [],
    unseen: string[] = [];
  for (const c of e.causes) {
    const label =
      c.kind === 'event' && c.ref != null
        ? `${w.events[c.ref].text} (${year(w.events[c.ref].t)})`
        : c.who != null && (c.kind === 'trait' || c.kind === 'value')
          ? `@${c.who}: ${c.label}`
          : c.label;
    let known = false;
    if (w.witness != null) {
      if (c.kind === 'event' && c.ref != null) known = w.events[c.ref].knownBy.has(w.witness) || w.events[c.ref].who.includes(w.witness);
      else if ((c.kind === 'trait' || c.kind === 'value' || c.kind === 'bond') && c.who != null && c.key) {
        const b = belief(w, w.witness, c.who, beliefKey(c));
        known = !!b && b.v < 0.6;
      } else if (c.kind === 'want') {
        const b = belief(w, w.witness, c.who ?? e.who[0], 'want:' + (c.key ?? 'escape'));
        known = !!b && b.n > 0;
      } else if (c.kind === 'state') known = e.vis !== 'private';
    }
    (known ? seen : unseen).push(label);
  }
  return { seen, unseen };
}
