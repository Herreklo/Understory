// What N1b counts (notes/build-plan.md, section 4): whether lives lead somewhere. Read from the record and the page at the end of a run;
// nothing here is read by the engine (guard.ts), and no decision may read a story measure (the build plan, section 2).
//   life turns     lines of the page subject's own job, home, partner or child (the readings' turn, intrigue-readings.md), and of
//                  the engine's TURNS (consequence-defs.ts); each with the share whose cause is on an earlier line: an event shown
//                  higher on the same page (a line, or an event shown under one) from which the turn descends through cited causes
//   counterparts   others who share three or more weighty present events with the person
//   reversals      a thread of the person's life changing sign: a tie with one named person made, then broken, or broken, then
//                  mended; work gained, then lost; a want gone after, then given up. Present years only, as a page shows them
//   cited          of weighty events in the first seven present years, the share cited by a later weighty event within three years;
//                  and exit point 2's numbers from the consequence map: a weighty descendant, a turn, reach
//   knowable turns per 100 people a month (density.ts): reported beside exit point 2, never a target
//   blow → rise    of blows in the first seven present years, the share followed by a rise for the same person within three years,
//                  and by one that descends from the blow by citation (the intrigue audit's kind 8: 56% and 3% on 22 October)
//   blow → want    of wants the engine opened as the answer to a blow (Want.origin), the share met within three years whose meeting
//                  descends from the blow by citation: whether the record loses the chain at the want
import { pageLines } from '../../page';
import { type Event, type Person, type World } from '../../world';
import { knowable, TURNS, weighty } from '../consequence-defs';

const FOLLOW = 36; // months a source is followed, as the consequence map
const SOURCES = 84; // sources from the first seven present years, as the consequence map

// The person a life-turn line is about: the subject's own job, home, partner or child.
const JOB = new Set(['hired', 'promoted', 'retired', 'stepdown', 'quitpride', 'walkout', 'moved']);
const PARTNER = new Set(['dating', 'married', 'split', 'divorce']);
export function lifeTurn(e: Event, p: number): boolean {
  if (JOB.has(e.type) || e.type === 'left' || e.type === 'home') return e.who[0] === p;
  if (e.type === 'dismiss') return e.who[1] === p; // the one let go
  if (e.type === 'arrived' || PARTNER.has(e.type)) return e.who.includes(p);
  if (e.type === 'bought') return e.who[0] === p && /\bhouse\b/.test(e.text);
  if (e.type === 'born') return e.who.slice(1).includes(p);
  return false;
}

// Events an event descends from through cited causes, present years only.
function ancestors(w: World, e: Event, memo: Map<number, Set<number>>): Set<number> {
  const got = memo.get(e.id);
  if (got) return got;
  const out = new Set<number>();
  const q = [e.id];
  while (q.length) {
    const id = q.pop()!;
    for (const c of w.events[id].causes) {
      const r = c.ref;
      if (r == null || r < 0 || r >= id || out.has(r) || w.events[r].t < w.startPresent) continue;
      out.add(r);
      q.push(r);
    }
  }
  memo.set(e.id, out);
  return out;
}

export interface PageStory {
  lines: number;
  lifeTurns: number;
  lifeCaused: number; // a cause on an earlier line
  lifeCited: number; // … which the line's own reasons cite
  turns: number; // the engine's TURNS on the page
  turnsCaused: number;
  turnsCited: number;
}
// The turns on a person's page, and whether the page showed their cause above them.
export function pageStory(w: World, p: Person, memo = new Map<number, Set<number>>()): PageStory {
  const lines = pageLines(
    w,
    p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent),
    new Set(p.events),
  );
  const out: PageStory = { lines: lines.length, lifeTurns: 0, lifeCaused: 0, lifeCited: 0, turns: 0, turnsCaused: 0, turnsCited: 0 };
  const above = new Set<number>();
  for (const l of lines) {
    const life = lifeTurn(l.e, p.id);
    const turn = TURNS.has(l.e.type);
    if (life || turn) {
      const anc = ancestors(w, l.e, memo);
      const caused = [...above].some(id => anc.has(id)) ? 1 : 0;
      const cited = l.e.causes.slice(0, 3).some(c => c.ref != null && above.has(c.ref)) ? 1 : 0;
      if (life) out.lifeTurns++, (out.lifeCaused += caused), (out.lifeCited += cited);
      if (turn) out.turns++, (out.turnsCaused += caused), (out.turnsCited += cited);
    }
    above.add(l.e.id);
    for (const x of l.cited) above.add(x.id);
  }
  return out;
}

// Others who share three or more weighty present events with the person.
export function counterparts(w: World, p: Person): number {
  const n = new Map<number, number>();
  for (const i of p.events) {
    const e = w.events[i];
    if (e.t < w.startPresent || !weighty(e)) continue;
    for (const q of new Set(e.who)) if (q !== p.id) n.set(q, (n.get(q) ?? 0) + 1);
  }
  return [...n.values()].filter(k => k >= 3).length;
}

// A thread of a life, and which way an event moves it: +1 made or gained, −1 broken or lost.
const TIE_UP = new Set(['friends', 'madeup', 'mended', 'dating', 'married', 'peace']);
const TIE_DOWN = new Set(['cooled', 'split', 'divorce', 'rivals', 'rivalry', 'grudge']);
function thread(e: Event, p: number): [string, 1 | -1] | null {
  if (TIE_UP.has(e.type) || TIE_DOWN.has(e.type)) {
    const q = e.who.find(x => x !== p);
    return q == null || !e.who.includes(p) ? null : ['tie:' + q, TIE_UP.has(e.type) ? 1 : -1];
  }
  if ((e.type === 'hired' || e.type === 'promoted') && e.who[0] === p) return ['work', 1];
  if (['walkout', 'quitpride', 'stepdown'].includes(e.type) && e.who[0] === p) return ['work', -1];
  if (e.type === 'dismiss' && e.who[1] === p) return ['work', -1];
  if (e.type === 'pursuit' && e.who[0] === p) return ['want', 1];
  if (['gaveup', 'want:failed', 'want:abandoned'].includes(e.type) && e.who[0] === p) return ['want', -1];
  return null;
}
export function reversals(w: World, p: Person): number {
  const sign = new Map<string, number>();
  let n = 0;
  for (const i of p.events) {
    const e = w.events[i];
    if (e.t < w.startPresent) continue;
    const th = thread(e, p.id);
    if (!th) continue;
    const prev = sign.get(th[0]);
    if (prev != null && prev !== th[1]) n++;
    sign.set(th[0], th[1]);
  }
  return n;
}

export interface WorldStory {
  personMonths: number; // people in town (all ages), summed over the present months
  sources: number; // weighty events in the first seven present years
  citedW: number; // … cited by a later weighty event within three years
  conseq: number; // … with a weighty descendant within three years (the consequence map's line)
  turn: number; // … with a turn among their descendants
  reach: number; // … with a weighty descendant involving someone outside their own people
  turns: number; // turns (TURNS) in the present
  turnsKnown: number;
  turnsCould: number;
  blows: number; // blows in the first seven present years
  risen: number; // … followed by a rise for the same person within three years
  riseCites: number; // … a rise that descends from the blow by citation
  wantAnswers: number; // wants opened as the answer to a blow in the first seven present years (Want.origin)
  wantMet: number; // … met within three years of the blow
  wantMetCites: number; // … where the act that met it, or its "got there" line, descends from the blow by citation
}
// The blows and rises are the intrigue audit's (notes/research/sources/intrigue-scripts/analyse.py, kind 8), with the one let go as the
// subject of a dismissal.
const BLOW = new Set([
  'dismiss',
  'split',
  'divorce',
  'plan:failed',
  'want:failed',
  'caught',
  'passed',
  'accident',
  'scheme:found',
  'notpicked',
  'setback',
  'betrayed',
]);
const RISE = new Set(['hired', 'promoted', 'married', 'dating', 'want:achieved', 'bought', 'opened', 'group:joined', 'seize', 'take']);
const subject = (e: Event) => (e.type === 'dismiss' ? e.who[1] : e.who[0]);

export function worldStory(w: World, wit: number, personMonths: number): WorldStory {
  const t0 = w.startPresent;
  const pres = w.events.filter(e => e.t >= t0);
  const kids = new Map<number, number[]>();
  for (const f of pres) {
    const seen = new Set<number>();
    for (const c of f.causes)
      if (c.ref != null && c.ref >= 0 && c.ref < f.id && !seen.has(c.ref)) {
        seen.add(c.ref);
        (kids.get(c.ref) ?? kids.set(c.ref, []).get(c.ref)!).push(f.id);
      }
  }
  const descendants = (e: Event, within = FOLLOW) => {
    const d = new Set<number>([e.id]);
    const q = [e.id];
    while (q.length)
      for (const k of kids.get(q.shift()!) ?? []) {
        if (d.has(k) || w.events[k].t > e.t + within) continue;
        d.add(k);
        q.push(k);
      }
    d.delete(e.id);
    return d;
  };
  const out: WorldStory = {
    personMonths,
    sources: 0,
    citedW: 0,
    conseq: 0,
    turn: 0,
    reach: 0,
    turns: 0,
    turnsKnown: 0,
    turnsCould: 0,
    blows: 0,
    risen: 0,
    riseCites: 0,
    wantAnswers: 0,
    wantMet: 0,
    wantMetCites: 0,
  };
  for (const e of pres) {
    if (e.t >= t0 + SOURCES || !weighty(e)) continue;
    out.sources++;
    if ((kids.get(e.id) ?? []).some(k => weighty(w.events[k]) && w.events[k].t <= e.t + FOLLOW)) out.citedW++;
    const D = [...descendants(e)].map(k => w.events[k]);
    if (D.some(weighty)) out.conseq++;
    if (D.some(f => TURNS.has(f.type))) out.turn++;
    if (D.some(f => weighty(f) && f.who.some(id => !e.who.includes(id)))) out.reach++;
  }
  const { known, could } = knowable(w, wit);
  for (const e of pres)
    if (TURNS.has(e.type)) {
      out.turns++;
      if (known(e)) out.turnsKnown++;
      if (could(e)) out.turnsCould++;
    }
  // Blows, and the rises after them.
  const rises = new Map<number, Event[]>();
  for (const e of pres) if (RISE.has(e.type)) (rises.get(e.who[0]) ?? rises.set(e.who[0], []).get(e.who[0])!).push(e);
  for (const e of pres) {
    if (!BLOW.has(e.type) || e.t >= t0 + SOURCES) continue;
    const s = subject(e);
    const p = s == null ? undefined : w.byId.get(s);
    if (!p) continue;
    out.blows++;
    const later = (rises.get(p.id) ?? []).filter(r => r.t > e.t && r.t <= e.t + FOLLOW);
    if (later.length) out.risen++;
    const D = descendants(e, Infinity);
    if (later.some(r => D.has(r.id))) out.riseCites++;
  }
  // Wants the engine opened as the answer to a blow (occasions.ts: a post passed over, a split, a divorce, a death, a band's end), and
  // whether the act that met one descends from the blow by citation, or the record loses the chain at the want.
  for (const p of w.people)
    for (const x of p.wants) {
      const r = x.origin?.ref;
      if (!x.origin?.kind.startsWith('blow:') || r == null || w.events[r].t < t0 || w.events[r].t >= t0 + SOURCES) continue;
      out.wantAnswers++;
      if (x.done !== 'achieved' || x.doneAt == null || w.events[x.doneAt].t > w.events[r].t + FOLLOW) continue;
      out.wantMet++;
      // The act that met it (Want.doneAt), and the "got there" line that cites that act.
      const D = descendants(w.events[r], Infinity);
      const metBy = [x.doneAt, ...(kids.get(x.doneAt) ?? []).filter(k => w.events[k].type === 'want:achieved' && w.events[k].who[0] === p.id)];
      if (metBy.some(k => D.has(k))) out.wantMetCites++;
    }
  return out;
}
