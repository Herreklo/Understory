// World state: people, bonds, beliefs and the event log. Plain, serialisable data.

import { Rng, stream, clamp } from './rng';
import type { Dim } from './core';
import type { Feature } from './features';
import { FACET_BY_ID } from './core';
import { motive, voiceOf } from './motives';
import { hoods, idx, residentsNear, staffOf, town } from './scale';
import * as MX from './mathx';
import { keepAccounts } from './accounts';
import { citeFlip } from './telling';

export type Status = 'in' | 'away' | 'dead' | 'bg' | 'gone'; // bg: lives in the city, simulated by the coarse yearly pass; gone: left the city

export interface Cause {
  kind: 'event' | 'trait' | 'value' | 'state' | 'belief' | 'bond' | 'want';
  label: string; // plain words, may contain @id tokens
  weight: number; // 0..1 share of the decision or event it explains
  ref?: number; // event id for kind 'event'
  key?: string; // facet / value / state id
  who?: number; // person the cause is about
  mid?: boolean; // a trait near the middle: it explains nothing, so it is never written down as a reason
}

export interface Evidence {
  subject: number;
  key: string;
  dir: number;
  strength: number;
  reliability: number;
  circ?: number;
} // circ: how much visible circumstance explained the act (0..1)

export interface Event {
  id: number;
  t: number; // month index
  type: string;
  who: number[]; // people involved (first = subject)
  text: string; // with @id tokens
  causes: Cause[];
  vis: 'private' | 'local' | 'public';
  evidence: Evidence[];
  w: number; // notability 0..3
  decision?: DecisionRecord;
  knownBy: Map<number, 'seen' | 'heard'>;
  surprise?: number; // filled for the witness
  explain?: number;
}

export interface DecisionRecord {
  trigger: string;
  person: number;
  options: { id: string; label: string; p: number; score: number }[];
  chosen: string;
  pWitness?: number; // witness's predicted probability of the chosen option
  witnessGuess?: string;
  honest?: boolean; // neutralising the top cause changes the choice
}

// Kinds of event that are the texture of a life, not news: never weighty, whatever their weight (the consequence map's line too).
export const TEXTURE = new Set(['everyday', 'noticed', 'table', 'habit:new', 'habit:broke', 'habit:back', 'tell', 'ill']);
export interface Memory {
  t: number;
  ev: number;
  like: number;
  respect: number;
  trust: number;
  text: string;
  source?: 'saw'; // whose hold on the act this is: absent, it was done to the holder; 'saw', the holder was there (accounts.ts)
}
// A told account (telling.ts): what a person heard about another, from whom, how sure, and how far the teller laid it on them.
export interface Heard {
  ev: number; // the act in the record
  about: number; // whom the hearer believes did it (the record may say otherwise)
  from: number; // who told it
  t: number;
  conf: number; // how sure: 0.7 first hand, less at second
  blame: number; // -1..1: the act's worth as told, bent by the teller
  base: number; // the act's worth in the town's eyes, before the teller bent it
  hand: 1 | 2;
  text: string; // the act as told
}
export interface Bond {
  fam: number;
  like: number;
  respect: number;
  trust: number;
  mem: Memory[];
  touched: number;
  heard?: Heard[]; // what the holder has been told about the other (telling.ts)
}

export interface Belief {
  m: number;
  v: number;
  n: number;
  last: number;
  seen: number;
}

export interface Emotion {
  k: string;
  label: string;
  v: number;
  until: number;
  cause?: number;
}

export interface Want {
  kind: string;
  target: string;
  value: string;
  since: number;
  urgency: number;
  done?: 'achieved' | 'failed' | 'abandoned';
  doneAt?: number;
  cause?: number;
  pursuit?: Pursuit;
  origin?: { kind: string; label: string; ref?: number }; // the occasion it answers (round 36, occasions.ts)
}

// A pursuit is a want with a plan: progress, effort, setbacks, and the option of giving up.
// A follower's pursuit belongs to someone else (owner): their commitment is borrowed.
export interface Pursuit {
  plan: string;
  progress: number;
  effort: number;
  since: number;
  visible: boolean;
  setbacks: number;
  lastGain: number;
  owner?: number;
  start: number;
  told: number;
}

export interface Habit {
  id: string;
  label: string;
  kind: 'solo' | 'social' | 'family' | 'practice' | 'work' | 'body';
  place?: string;
  adherence: number;
  since: number;
  from: string;
  broken?: number;
  breakCause?: number;
  breakWhy?: string;
}

export interface Attachment {
  key: string;
  label: string;
  like: number;
  since: number;
  cause?: number;
}

// A thread: repeated acts from one pressure, seen as one developing situation with stages.
export interface Thread {
  id: number;
  family: string;
  source: string;
  since: number;
  lastAt: number;
  acts: number;
  stage: 1 | 2 | 3;
  events: number[];
  targets: Record<number, number>;
  noticedBy?: number;
  asked?: boolean;
  ended?: number;
  how?: string;
}

export interface Mark {
  t: number;
  key: string;
  delta: number;
  cause: number;
  text: string;
}

export interface Exception {
  key: string;
  other: number;
  strength: number;
  cause: number;
  text: string;
}

export interface Phase {
  deltas: Record<string, number>;
  until: number;
  cause: number;
  label: string;
}

export interface Person {
  id: number;
  first: string;
  last: string;
  sex: 'f' | 'm';
  born: number; // month index (negative before the simulation start)
  status: Status;
  diedAt?: number;
  awaySince?: number;
  awayKind?: string;
  founder: boolean;
  foundingPast: string[];
  dims: Record<Dim, number>;
  facets: Record<string, number>;
  variability: number;
  values: Record<string, number>;
  coreValues: string[];
  aptitudes: Record<string, number>;
  constitution: number;
  reactivity: number;
  health: number; // 0..1
  ill: number; // months left
  signatures: { facet: string; z: number }[];
  tension?: { id: string; label: string };
  presentation: Record<string, number>;
  selfBias: number; // how far self-image runs above (+) or below (−) the truth
  marks: Mark[];
  exceptions: Exception[];
  saw?: { o: number; ev: number }[]; // the seen accounts this person holds, by the doer and the event (accounts.ts)
  heardOf?: { o: number; ev: number }[]; // the told accounts this person holds, by whom they are about and the event (telling.ts)
  phase?: Phase;
  // life
  job: string | null;
  lead: boolean;
  jobSince: number;
  perf: number; // standard score of recent work
  skills: Record<string, { r: number; ceil: number; interest: number }>;
  partner: number | null;
  pstat: 'dating' | 'married' | null;
  psince: number;
  parents: number[];
  kids: number[];
  stress: number; // 0..1
  sources: Record<string, { label: string; v: number; ref?: number }>;
  emotions: Emotion[];
  savings: number;
  wants: Want[];
  events: number[];
  friends: Set<number>;
  retired: boolean;
  student: boolean;
  drinks: boolean;
  drinkSince: number;
  quitFrom?: string;
  lastProvoked: number;
  lastBreak: number;
  circle: number[];
  tried: Record<string, { t: number; ok: boolean; n: number }>; // what happened last time, per trigger and target
  owes?: { to: number; ev: number; t: number }; // an apology owed
  promises: { to: number; due: number; what: string }[];
  secrets: number[]; // private events of their own they might confide
  joblessMonths?: number;
  givenUp?: boolean;
  ifThens: { feature: Feature; facet: string; shift: number; words: string }[];
  selfStory: { key: string; text: string; weight: number; rule?: boolean }[]; // rule: from a rule to live by (persona.ts), held while its mark lasts
  // round 2: time
  attraction: 'f' | 'm' | 'both';
  habits: Habit[];
  attachments: Attachment[];
  drive: number; // standard score: how readily wants become pursuits
  lastHabit: number;
  threads: Thread[];
  group: number | null;
}

export interface Work {
  t: number;
  author: number;
  quality: number;
  title: string;
  credit: Record<number, number>;
}
export interface Group {
  id: number;
  kind: string;
  name: string;
  members: number[];
  founder: number;
  since: number;
  works: Work[];
  standing: number;
  chem: number;
  chemWhy: Cause[];
  events: number[];
  lastWork: number;
  lastShow: number;
  lowSince: number;
  ended?: number;
  how?: string;
  former: number[];
}
export interface Place {
  id: string;
  name: string;
  role: string;
  title: string;
  skill: string;
  cap: number;
  pay: number;
  people: number;
  lead: number | null;
  vac: number;
}

export interface World {
  seed: number;
  runSeed: number;
  t: number;
  startPresent: number; // month the witness arrives (present day)
  people: Person[];
  byId: Map<number, Person>;
  bonds: Map<number, Bond>;
  beliefs: Map<number, Map<string, Belief>>; // holder -> "subject|key" -> belief
  events: Event[];
  places: Place[];
  placeById: Map<string, Place>;
  nextId: number;
  witness: number | null;
  rng: Rng; // run stream for this world
  quiet: boolean;
  stats: { decisions: number; witnessN: number; witnessRight: number; knownN: number; knownRight: number; honestN: number; honest: number };
  hooks: {
    leaveTown: (w: World, p: Person, kind: string, text: string, why: Cause[], rec?: any) => void;
    explain?: (w: World, e: Event) => number;
    predict?: (w: World, p: Person, options: any[], chosenId: string, rec: any) => void;
    observed?: (w: World, e: Evidence, how: 'seen' | 'heard', tag: string, textful: boolean) => void;
    contact?: (w: World, a: Person, b: Person, i: number, channel: string) => void;
    seek?: (w: World, p: Person, drawn: number, kept: number, pool: number) => void;
  };
  decIdx: Map<number, number[]>; // person -> their decision events, oldest first (the notebook reads this)
  queue: any[]; // pending situations, one tick later
  groups: Group[];
  streams: Record<string, Rng>; // one random stream per system, so switching a system off reshuffles nothing else
}
export const SYSTEMS = [
  'body',
  'work',
  'social',
  'situations',
  'threads',
  'time',
  'groups',
  'romance',
  'family',
  'stress',
  'money',
  'migration',
  'yearly',
  'misc',
  'moments',
  'drama',
  'projects',
  'persona',
  'love',
];
export function setStreams(w: World, ...parts: (string | number)[]) {
  w.streams = {};
  for (const s of SYSTEMS) w.streams[s] = stream(...parts, s);
  w.rng = w.streams.misc;
}
export const use = (w: World, sys: string) => {
  w.rng = w.streams[sys] ?? w.streams.misc;
};

export const YEAR0 = 1996; // simulated past starts here; the present begins 30 years later
export const year = (t: number) => YEAR0 + Math.floor(t / 12);
export const age = (w: World, p: Person) => ((p.status === 'dead' ? p.diedAt! : w.t) - p.born) / 12;
export const live = (w: World) => (hoods(w) === 1 ? town(w) : idx(w).live.slice()); // the people in town; in a city, from the membership index, so the background is never scanned
export const P = (w: World, id: number) => w.byId.get(id)!;
export const fullName = (p: Person) => `${p.first} ${p.last}`;
// A post at a place, for a sentence: "foreman at the sawmill", but "head of the clinic", never "head of the clinic at the clinic".
export const titleAt = (pl: { title: string; name: string }) =>
  pl.title.includes(pl.name.replace(/^the /, '')) ? pl.title : `${pl.title} at ${pl.name}`;
export const logistic = (z: number, k = 1.2) => 1 / (1 + MX.exp(-k * z));

// Plasticity: how much life still moves a person. Heredity is set at birth and never changes; what fades with age is the environment's grip.
// About 1.7 at 18, 1.0 at 40, 0.3 at 65. Applied to every life-driven change of a trait (chosen expressions, life marks, maturing), never to the birth draw.
export const plasticity = (w: World, p: Person) => (OFF.has('plasticity') ? 1 : clamp(1.8 - 0.03 * (age(w, p) - 16), 0.3, 1.8));

// Effective facet: the trait, plus a phase, plus if-then signatures for the situation's features,
// plus any exception toward a specific other person.
// Ablation switches, for tests that turn one system off to see what it was doing. Empty in normal runs.
export const OFF = new Set<string>();
// Mechanisms that are off unless asked for: a round that did not meet its expectations keeps its code behind one of these, so the
// default model is the one before it. Turned on for a test with ON=<name>, as OFF=<name> turns a kept one off.
export const ON = new Set<string>();
// The four (round 40): wants that answer what happens, contests out of season and for band places, a blow's aftermath and telling, on
// together unless OFF=together. With them off, each can be turned on alone with its own ON=<name>.
export const together = () => !OFF.has('together');
// Round 41: lines and reasons that hold up: spans said in words, a folded repeat saying which time it was, a friendship's end saying what
// changed, lines true of the person when they are said. On unless OFF=fit (round 41's test).
export const fit = () => !OFF.has('fit');
const SMALL = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
// A span of months as a person would say it: "a few weeks", "five months", "a year", "a year and a half", "three years".
export function spanWords(months: number): string {
  const m = Math.max(0, Math.round(months));
  if (m < 2) return 'a few weeks';
  if (m < 11) return `${SMALL[m]} months`;
  if (m < 16) return 'a year';
  if (m < 22) return 'a year and a half';
  const y = Math.round(m / 12);
  return `${y <= 12 ? SMALL[y] : y} years`;
}
// How many times, as a person would say it: "once", "twice", "five times".
export const timesWords = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n <= 12 ? SMALL[n] : n} times`);
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
export const ordinal = (n: number) => ORD[n] ?? `${n}th`;
// A name a reader can follow: the first name, with the surname when someone else in town (or away) has the same first name, and the
// year of birth when they share both. Rendering only.
export function nameOf(w: World, id: number): string {
  const p = w.byId.get(id);
  if (!p) return '?';
  const same = w.people.filter(q => q !== p && q.status !== 'dead' && q.first === p.first);
  if (!same.length) return p.first;
  return same.some(q => q.last === p.last) ? `${p.first} ${p.last} (b. ${year(p.born)})` : `${p.first} ${p.last}`;
}
export function facet(p: Person, key: string, toward?: number, feats?: Set<Feature>): number {
  let z = p.facets[key] ?? 0;
  if (p.phase && p.phase.deltas[key]) z += p.phase.deltas[key];
  if (feats && !OFF.has('ifthens')) for (const it of p.ifThens) if (it.facet === key && feats.has(it.feature)) z += it.shift;
  if (toward != null) for (const ex of p.exceptions) if (ex.key === key && ex.other === toward) z = ex.strength;
  return z;
}

// ----- bonds -----
// Bond keys: a × base + b. A town keeps base 100,000. A city, which can hold more people than that, uses 2^26, which stays an exact
// integer up to 67 million people (scale contract, rule 8). The base widens when a city's neighbourhoods are set, before anyone
// beyond the founding families exists: the founders' bonds are re-keyed in their order.
const keyBase = (w: World): number => ((w as any).wideKeys ? 67108864 : 100000);
const BK = (w: World, a: number, b: number) => a * keyBase(w) + b;
export const bkA = (w: World, k: number) => Math.floor(k / keyBase(w));
export const bkB = (w: World, k: number) => k % keyBase(w);
export function widenKeys(w: World) {
  if ((w as any).wideKeys) return;
  const old = [...w.bonds];
  w.bonds.clear();
  (w as any).wideKeys = true;
  for (const [k, r] of old) w.bonds.set(BK(w, Math.floor(k / 100000), k % 100000), r);
}
export function bond(w: World, a: number, b: number): Bond {
  let r = w.bonds.get(BK(w, a, b));
  if (!r) {
    r = { fam: 0, like: 0, respect: 0, trust: 0.15, mem: [], touched: -1 };
    w.bonds.set(BK(w, a, b), r);
    (w as any)._onNewBond?.(a, b, r); // set only while a promotion catches up
  }
  return r;
}
export const peekBond = (w: World, a: number, b: number) => w.bonds.get(BK(w, a, b));
export const likeOf = (w: World, a: number, b: number) => peekBond(w, a, b)?.like ?? 0;

// Negativity bias: bad memories land harder than good ones.
// Peak-end: when the memory of a person fills up, the peaks and the most recent stay; the mild middle fades.
export function remember(w: World, holder: Person, other: Person, ev: number, like: number, respect: number, trust: number, text: string) {
  const r = bond(w, holder.id, other.id);
  const neg = like + trust < 0;
  const k = neg ? 0.8 : 0.5;
  if (ev >= 0) {
    // Round F27: an act's generic effect and the situation's own effect could both remember one event. The second write keeps
    // its words (the situation's are the more particular) and adds nothing to the bond: the first write already did.
    const i = r.mem.findIndex(m => m.ev === ev);
    if (i >= 0) {
      const m = r.mem[i];
      if (m.source === 'saw') {
        // The holder saw it first (accounts.ts) and it turns out to have been done to them: the act's own hit replaces the
        // bystander's share, and the memory becomes theirs.
        const k2 = like + trust < 0 ? 0.8 : 0.5;
        r.like = clamp(r.like + (like - m.like) * k2, -1, 1);
        r.respect = clamp(r.respect + (respect - m.respect) * k2, -1, 1);
        r.trust = clamp(r.trust + (trust - m.trust) * k2, -1, 1);
        Object.assign(m, { like, respect, trust, text, source: undefined });
        delete m.source;
        if (holder.saw) holder.saw = holder.saw.filter(s => !(s.o === other.id && s.ev === ev));
        return;
      }
      m.text = text;
      return;
    }
  }
  r.mem.push({ t: w.t, ev, like, respect, trust, text });
  r.like = clamp(r.like + like * k, -1, 1);
  r.respect = clamp(r.respect + respect * k, -1, 1);
  r.trust = clamp(r.trust + trust * k, -1, 1);
  if (r.mem.length > 12) {
    const recent = r.mem.slice(-4);
    const rest = r.mem
      .slice(0, -4)
      .sort((a, b) => Math.abs(b.like) + Math.abs(b.trust) - (Math.abs(a.like) + Math.abs(a.trust)))
      .slice(0, 8);
    r.mem = [...rest.sort((a, b) => a.t - b.t), ...recent];
  }
}
// The strongest memories of a person, the ones that come up when their name does.
export function peaks(w: World, holder: Person, other: Person, n = 2): Memory[] {
  const r = peekBond(w, holder.id, other.id);
  if (!r) return [];
  return r.mem
    .slice()
    .sort(
      (a, b) =>
        (Math.abs(b.like) + Math.abs(b.trust)) * memWeight(holder, b, w.t, other.id) -
        (Math.abs(a.like) + Math.abs(a.trust)) * memWeight(holder, a, w.t, other.id),
    )
    .slice(0, n);
}

// Memory weight now: negative memories fade with Forgiveness, positive ones with Sentimentality.
export function memWeight(p: Person, m: Memory, t: number, toward: number): number {
  const neg = m.like + m.trust < 0;
  const half = neg ? 18 * MX.exp(-0.7 * facet(p, 'forgiveness', toward)) : 30 * MX.exp(0.5 * facet(p, 'sentimentality'));
  return MX.pow(0.5, (t - m.t) / Math.max(2, half));
}

// ----- beliefs -----
export const bkey = (subject: number, key: string) => `${subject}|${key}`;
export function beliefsOf(w: World, holder: number): Map<string, Belief> {
  let m = w.beliefs.get(holder);
  if (!m) {
    m = new Map();
    w.beliefs.set(holder, m);
  }
  return m;
}
export function belief(w: World, holder: number, subject: number, key: string): Belief | undefined {
  return w.beliefs.get(holder)?.get(bkey(subject, key));
}
// Gaussian update: average of the old estimate and the evidence, weighted by their certainty.
// Diagnostics: which path a piece of evidence came through (an act seen, an act heard of, gossip, everyday manner, a habit, the backfill).
export let obsTag = 'act';
export const tagObs = (t: string) => {
  obsTag = t;
};
// The event whose evidence is being delivered, when there is one. Evidence carries text when it rides a logged event (or a habit, which the
// felt view prints); manner, the kitchen-table reads of strain and money, and acts that never made the story carry none.
export let obsEvent: Event | null = null;
export const setObsEvent = (e: Event | null) => {
  obsEvent = e;
};
// A player's page carries: the chronicle (events that were news), the ledger (every act the witness saw, news or not), known habits, and the witness-only lines.
// Hearsay reaches the page only when the event was news.
export const textful = (how: 'seen' | 'heard') =>
  obsTag === 'habit' ||
  (obsTag.startsWith('act:') && obsEvent != null && (obsEvent.w > 0.25 || how === 'seen')) ||
  (obsTag === 'gossip' && obsEvent != null && obsEvent.w > 0.25);
export function observe(w: World, holder: number, e: Evidence, how: 'seen' | 'heard', bias = 0) {
  if (holder === e.subject && !e.key.startsWith('skill:')) return;
  if (w.hooks.observed && holder === w.witness) w.hooks.observed(w, e, how, obsTag, textful(how));
  const map = beliefsOf(w, holder);
  const k = bkey(e.subject, e.key);
  let b = map.get(k);
  if (!b) {
    b = { m: bias, v: 1.0, n: 0, last: w.t, seen: 0 };
    map.set(k, b);
  }
  // people change: uncertainty regrows slowly without fresh evidence; circumstances change fast
  b.v = Math.min(1.0, b.v + (w.t - b.last) * (e.key.startsWith('state:') ? 0.04 : 0.002));
  // Calibration: an act of strength 1 reads as a trait of about 1.7 standard scores, which is what such acts come from.
  const ev =
    e.dir *
    e.strength *
    (e.key.startsWith('skill:') ||
    e.key.startsWith('bond:') ||
    e.key.startsWith('want:') ||
    e.key.startsWith('value:') ||
    e.key.startsWith('ifthen:') ||
    e.key.startsWith('state:')
      ? 1
      : 1.5);
  const ve = 1 / Math.max(0.05, e.reliability) - 0.6 + (how === 'heard' ? 0.8 : 0);
  b.m = (ve * b.m + b.v * ev) / (b.v + ve);
  b.v = (b.v * ve) / (b.v + ve);
  b.n++;
  if (how === 'seen') b.seen++;
  b.last = w.t;
}

// ----- events -----
// The record is in time order (an event is dated when it is added, and the clock only moves on), so recent history is read from the end.
// (A tool that winds the clock back by hand must not add events while it is back.)
export function recentEvents(w: World, since: number): Event[] {
  let i = w.events.length;
  while (i > 0 && w.events[i - 1].t >= since) i--;
  return w.events.slice(i);
}
// A reason as a person would give it: a trait said as the motive it gives in this kind of answer (motives.ts), and a feeling for
// someone that argued against the act said as one ("though she is fond of Ben"). Only a reason in the exact form a trait reason takes
// is rewritten, so if-then signatures, the self-story and every other reason keep their own words.
function saidAsMotive(w: World, ev: { who: number[]; decision?: DecisionRecord }, c: Cause): Cause {
  const p = w.byId.get(c.who ?? ev.who[0]);
  if (!p) return c;
  if (c.kind === 'bond' && c.label.startsWith('despite: ')) return { ...c, label: `though ${voiceOf(p.sex).she} ${c.label.slice(9)}` };
  if (c.kind !== 'trait' || !c.key) return c;
  const key = c.key.replace(/^against:/, '');
  const f = FACET_BY_ID[key];
  if (!f) return c;
  const z = p.facets[key] ?? 0;
  const pole = z > 0 ? f.high : f.low;
  const plain = `${f.name.toLowerCase()}: ${pole}`;
  const against = c.label === 'despite ' + plain;
  if (!against && c.label !== plain) return c;
  const d = ev.decision as any;
  const other = d?.target ?? (ev.who[0] === p.id ? ev.who[1] : undefined);
  const said = motive(key, z > 0, d?.chosen, against, voiceOf(p.sex), other != null ? `@${other}` : undefined);
  return said ? { ...c, label: said } : c;
}
export function addEvent(w: World, ev: Omit<Event, 'id' | 't' | 'knownBy'> & { knownBy?: Map<number, 'seen' | 'heard'> }): Event {
  // A reason that is a want cites the event the want came from, if it came from one (round 23a).
  for (const c of ev.causes)
    if (c.kind === 'want' && c.ref == null) {
      const p = w.byId.get(c.who ?? ev.who[0]);
      const x = p?.wants
        .slice()
        .reverse()
        .find(x => (c.key == null || x.kind === c.key) && x.cause != null);
      if (x) c.ref = x.cause;
    }
  // A trait near the middle is not a reason anyone would give (a bare 'patience' says nothing about the person).
  if (ev.causes.some(c => c.mid)) ev = { ...ev, causes: ev.causes.filter(c => !c.mid) };
  // A counterpart chosen this month who would not have been chosen without what the chooser had been told: the account is one of the
  // event's reasons (telling.ts).
  const cited = citeFlip(w, ev.who, ev.causes);
  if (cited !== ev.causes) ev = { ...ev, causes: cited };
  ev = { ...ev, causes: ev.causes.map(c => saidAsMotive(w, ev, c)) };
  const e: Event = { ...ev, id: w.events.length, t: w.t, knownBy: ev.knownBy ?? new Map() };
  w.events.push(e);
  // Explainability is fixed here, before anyone learns from the event itself: what the witness knew going in.
  if (w.hooks.explain && w.witness != null && w.t >= w.startPresent) e.explain = w.hooks.explain(w, e);
  for (const id of new Set(e.who)) w.byId.get(id)?.events.push(e.id);
  if (e.decision) {
    const l = w.decIdx.get(e.decision.person) ?? [];
    l.push(e.id);
    w.decIdx.set(e.decision.person, l);
  }
  return e;
}

// Witnesses: those involved see it; for local events, coworkers and partners see it too.
export function witnessesOf(w: World, e: Event): number[] {
  const out = new Set<number>(e.who);
  if (e.vis !== 'private') {
    for (const id of e.who) {
      const p = w.byId.get(id);
      if (!p || p.status !== 'in') continue;
      if (p.partner != null) out.add(p.partner);
      if (p.job) for (const q of staffOf(w, p.job)) out.add(q.id);
    }
  }
  return [...out];
}

// Biased observation. Two biases, both from research and both unfair:
// the halo: someone you like gets the benefit of the doubt, someone you dislike gets none;
// attribution: another person's failure reads as character, more than it should (own failures are never read at all).
// Which way a trait reads as 'bad' socially: +1 when the high end is admired, -1 when the low end is, 0 when neither.
export const VALENCE: Record<string, number> = {
  sincerity: 1,
  fairness: 1,
  greedAvoidance: 1,
  modesty: 1,
  forgiveness: 1,
  gentleness: 1,
  patience: 1,
  organisation: 1,
  diligence: 1,
  prudence: 1,
  altruism: 1,
  anxiety: -1,
  fearfulness: -1,
};
export function observeAs(w: World, holder: number, e: Evidence, how: 'seen' | 'heard') {
  if (holder === e.subject || OFF.has('bias')) {
    observe(w, holder, e, how);
    return;
  }
  const like = likeOf(w, holder, e.subject);
  const val = VALENCE[e.key] ?? 0;
  const bad = val !== 0 && Math.sign(e.dir) !== val; // the act reads badly
  const good = val !== 0 && Math.sign(e.dir) === val;
  let strength = e.strength;
  if (bad) strength *= 1.15 * (1 - 0.5 * Math.max(0, like)) * (1 + 0.4 * Math.max(0, -like));
  else if (good) strength *= (1 + 0.3 * Math.max(0, like)) * (1 - 0.3 * Math.max(0, -like));
  // The fundamental attribution error: other people's excuses count for less than they should, and for nothing if you dislike them.
  if (e.circ && bad) strength /= 1 - 0.6 * e.circ * (like < -0.2 ? 1 : 0.5);
  observe(w, holder, { ...e, strength }, how);
}

// Deliver an event's evidence to everyone who saw it. Public events reach the whole town, faintly.
// People whose work is all people (the bar, the clinic, the school) hear local news more than most.
export function broadcast(w: World, e: Event) {
  const prevTag = obsTag,
    prevEv = obsEvent;
  obsTag = 'act:' + e.type;
  obsEvent = e;
  try {
    broadcastInner(w, e);
  } finally {
    obsTag = prevTag;
    obsEvent = prevEv;
  }
}
function broadcastInner(w: World, e: Event) {
  const seen = witnessesOf(w, e);
  for (const id of seen) {
    if (!e.knownBy.has(id)) e.knownBy.set(id, 'seen');
    for (const ev of e.evidence) observeAs(w, id, ev, 'seen');
  }
  keepAccounts(w, e, seen);
  if (w.quiet) return;
  if (e.vis === 'public') {
    for (const q of residentsNear(w, e.who)) {
      if (e.knownBy.has(q.id) || w.t - q.born < 14 * 12) continue;
      e.knownBy.set(q.id, 'heard');
      for (const ev of e.evidence) observeAs(w, q.id, { ...ev, reliability: ev.reliability * 0.8 }, 'heard');
    }
  } else if (e.vis === 'local') {
    for (const q of residentsNear(w, e.who)) {
      if (e.knownBy.has(q.id) || !q.job) continue;
      const pl = w.placeById.get(q.job)!;
      if ((pl.people >= 0.8 && w.rng.chance(pl.people * 0.45)) || (q.id === w.witness && w.rng.chance(0.5))) {
        e.knownBy.set(q.id, 'heard');
        for (const ev of e.evidence) observeAs(w, q.id, { ...ev, reliability: ev.reliability * 0.6 }, 'heard');
      }
    }
  }
}
export function learnOf(w: World, q: number, e: Event, reliability = 0.6) {
  if (e.knownBy.has(q)) return;
  e.knownBy.set(q, 'heard');
  for (const ev of e.evidence) observeAs(w, q, { ...ev, reliability: ev.reliability * reliability }, 'heard');
}

export function addStress(p: Person, key: string, label: string, amt: number, ref?: number) {
  if (amt <= 0) return;
  const gain = amt * (1 + 0.25 * p.reactivity) * (1 + 0.15 * (p.facets.anxiety ?? 0));
  p.stress = clamp(p.stress + gain, 0, 1);
  const s = p.sources[key] || (p.sources[key] = { label, v: 0, ref });
  s.label = label;
  s.v += gain;
  if (ref != null) s.ref = ref;
}
export const topSources = (p: Person, n = 2) =>
  Object.values(p.sources)
    .filter(s => s.v > 0.02)
    .sort((a, b) => b.v - a.v)
    .slice(0, n);

export function addEmotion(w: World, p: Person, k: string, label: string, v: number, months: number, cause?: number) {
  p.emotions = p.emotions.filter(e => e.k !== k);
  p.emotions.push({ k, label, v, until: w.t + months, cause });
}

// Mood is never stored: computed from emotions, needs and the body.
export function mood(w: World, p: Person): number {
  let m = 0.5 + 0.06 * facet(p, 'liveliness') - 0.05 * facet(p, 'anxiety');
  for (const e of p.emotions) if (e.until > w.t) m += e.v;
  m -= p.stress * 0.35;
  if (p.ill) m -= 0.1;
  return clamp(m, 0, 1);
}

export function makeWorld(seed: number, runSeed: number): World {
  const w: World = {
    seed,
    runSeed,
    t: 0,
    startPresent: 360,
    people: [],
    byId: new Map(),
    bonds: new Map(),
    beliefs: new Map(),
    events: [],
    places: [],
    placeById: new Map(),
    nextId: 1,
    witness: null,
    rng: stream(seed, 'past'),
    quiet: false, // the past belongs to the world seed; the run seed takes over at the present
    stats: { decisions: 0, witnessN: 0, witnessRight: 0, knownN: 0, knownRight: 0, honestN: 0, honest: 0 },
    hooks: { leaveTown: () => {} },
    queue: [],
    groups: [],
    streams: {},
    decIdx: new Map(),
  };
  setStreams(w, seed, 'past');
  return w;
}
