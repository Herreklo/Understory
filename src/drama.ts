// Drama: ambition and rivalry. People want things other people also want, and the wanting has a history.
//
// Succession is a season. A lead who is getting on, seriously ill or wanting to leave may announce they will step down; through the
// months before they go, staff decide whether to go for the post and say so. Two who go for the same post become rivals when they are
// close enough to feel it (similar record and age, or a contest between them before: Kilduff, Elfenbein and Staw 2010). Rivals act on it
// every few months, more often the hotter it runs: work to be seen, run the other down to whoever decides (secret, sometimes found out),
// pick at the other's work in public, or step aside. Who gets the post weighs the record, the outgoing lead's regard and what the campaign
// did. A loser who answers with pride or anger carries it as a grudge, in small acts, until the two make peace, one goes, or it cools.
// Every act cites where the rivalry started, so the record tells one story rather than many unrelated ones.
//
// Wants that collide (round 38, off unless ON=collide): out of season, two who want the same post where they work and learn it of each
// other (a line of the other's that gives the want away) may become rivals in the same way; what their rivalry wins is kept for the
// place and counts when the post falls vacant, and a season, when one comes, starts from it. An out-of-season rivalry cools as a
// grudge does. Its acts give the situation as their reasons: where it started, the rival's latest move, who is ahead.
import { staffOf } from './scale';
import { clamp } from './rng';
import {
  titleAt,
  OFF,
  ON,
  together,
  type World,
  type Person,
  type Event,
  age,
  live,
  P,
  facet,
  likeOf,
  remember,
  addEvent,
  broadcast,
  addEmotion,
  addStress,
  year,
  bond,
} from './world';
import { run, family, favour } from './grammar';
import { traitCause, stateCause, eventCause, ev, facetC, bondC, pubC, privC } from './considerations';
import { z01 } from './decide';
import { decide } from './grammar';
import { regard } from './regard';
import type { Feature } from './features';
import type { Cause } from './world';

export interface Rivalry {
  id: number;
  a: number;
  b: number;
  stake: 'post' | 'grudge' | 'trade';
  place: string;
  title: string;
  about: string; // what the rivalry is or was about: 'the head mechanic's job', 'the café'
  since: number;
  first: number;
  heat: number;
  events: number[];
  over?: number;
  outcome?: 'won' | 'conceded' | 'parted' | 'peace' | 'cooled' | 'turned';
  winner?: number;
  src?: 'open' | 'band'; // round 38: a rivalry from wants that collide (out of season) or from a place in a band; a season's has none
}
interface Succession {
  place: string;
  lead: number;
  due: number;
  contenders: number[];
  campaign: Record<number, number>;
  announced: number;
}
export const rivalries = (w: World) => ((w as any).rivalries ??= []) as Rivalry[];
const successions = (w: World) => ((w as any).successions ??= []) as Succession[];
const on = () => !OFF.has('drama');
// Off unless ON=collide: round 38 was withdrawn before its test. On throwaway worlds it moved contests out of season (2.6 a
// world-decade) rather than adding to them (5.0 against 4.5 in all), and its contest acts gave no trait as a reason (docs/BOARD.md).
export const collideOn = () => on() && (ON.has('collide') || together());
// Round 38: what an out-of-season rivalry has won, kept for the place until the post is filled.
const openCampaigns = (w: World) => ((w as any).openCampaigns ??= {}) as Record<string, Record<number, number>>;
const campaignOf = (w: World, place: string): Record<number, number> | undefined =>
  successions(w).find(z => z.place === place)?.campaign ?? (collideOn() ? openCampaigns(w)[place] : undefined);
const activeR = (w: World) => rivalries(w).filter(r => r.over == null);
const she = (p: Person) => (p.sex === 'f' ? 'she' : 'he');
export function rivalOf(w: World, p: Person, q: Person) {
  return activeR(w).find(r => (r.a === p.id && r.b === q.id) || (r.a === q.id && r.b === p.id));
}

// ---------- succession ----------
// Called by workTick: true when an announced step-down has come due and the lead should go now.
export function dueToStepDown(w: World, pl: any): boolean {
  if (!on()) return false;
  const s = successions(w).find(x => x.place === pl.id);
  return !!s && pl.lead === s.lead && w.t >= s.due;
}
// Called by promote: the extra a candidate's score gets from the outgoing lead's regard and the campaign, and who may be chosen.
export function contest(
  w: World,
  pl: any,
  staff: Person[],
): { pool: Person[]; decider?: Person; campaign: Record<number, number>; bonus: (p: Person) => number } | null {
  if (!on()) return null;
  const s = successions(w).find(x => x.place === pl.id);
  const contenders = (s?.contenders ?? []).map(id => P(w, id)).filter(p => p.status === 'in' && p.job === pl.id);
  const decider = s ? w.byId.get(s.lead) : undefined;
  const pool = contenders.length ? contenders : staff;
  const campaign = s?.campaign ?? (collideOn() ? (openCampaigns(w)[pl.id] ?? {}) : {});
  return {
    pool,
    decider: decider && decider.status === 'in' ? decider : undefined,
    campaign,
    bonus: p => (campaign[p.id] ?? 0) + (decider && decider.status === 'in' && decider !== p ? 0.8 * regard(w, decider.id, p.id) : 0),
  };
}
// Called by promote once the post is filled: settle the rivalries about it. Returns the losers who were in a rivalry over it.
export function settle(w: World, pl: any, win: Person, ref: number) {
  if (!on()) return;
  const i = successions(w).findIndex(x => x.place === pl.id);
  if (i >= 0) successions(w).splice(i, 1);
  if (collideOn()) delete openCampaigns(w)[pl.id];
  for (const r of activeR(w))
    if (r.stake === 'post' && r.place === pl.id) {
      r.over = w.t;
      r.events.push(ref);
      if (r.a === win.id || r.b === win.id) {
        r.outcome = 'won';
        r.winner = win.id;
      } else {
        r.outcome = 'parted';
      }
    }
}
// Called after a loser has answered (contestLost): pride or anger turns the contest into a grudge.
export function grudge(w: World, loser: Person, winner: Person, pl: any, fam: string | undefined, ref: number) {
  if (!on() || !fam || !['pride', 'anger'].includes(fam)) return;
  if (rivalOf(w, loser, winner)) return;
  const prior = rivalries(w).find(
    r => r.stake === 'post' && r.place === pl.id && [r.a, r.b].includes(loser.id) && [r.a, r.b].includes(winner.id) && r.over === w.t,
  );
  const r: Rivalry = {
    id: rivalries(w).length,
    a: loser.id,
    b: winner.id,
    stake: 'grudge',
    place: pl.id,
    title: pl.title,
    about: `the ${pl.title}'s job`,
    since: w.t,
    first: prior?.first ?? ref,
    heat: 0.5 + (prior ? 0.2 : 0),
    events: [ref],
  };
  if (prior) prior.outcome = 'turned';
  rivalries(w).push(r);
}

function announce(w: World, pl: any, lead: Person) {
  const why = age(w, lead) >= 61 ? 'getting on' : lead.ill ? 'not well' : 'wants out';
  const due = w.t + 8 + w.rng.int(0, 6);
  const e = addEvent(w, {
    type: 'stepdown',
    who: [lead.id],
    text: `@${lead.id} will step down as ${titleAt(pl)} next year.`,
    causes: [stateCause(why === 'getting on' ? `${Math.floor(age(w, lead))}, and tired` : why === 'not well' ? 'not well' : 'has had enough', 0.6)],
    vis: 'public',
    evidence: [],
    w: 1.2,
  });
  broadcast(w, e);
  // Round 38: rivals out of season are already in the running, with what their rivalry has won.
  const open = collideOn() ? openCampaigns(w)[pl.id] : undefined;
  successions(w).push({
    place: pl.id,
    lead: lead.id,
    due,
    contenders: open ? Object.keys(open).map(Number) : [],
    campaign: open ? { ...open } : {},
    announced: e.id,
  });
}

// Whether a member of staff goes for the post: wanting it, success and boldness against modesty, anxiety and a poor record.
function consider(w: World, s: Succession, pl: any, p: Person) {
  const want = p.wants.find(x => x.kind === 'attain' && x.target === pl.id && !x.done);
  const others = s.contenders.map(id => P(w, id)).filter(q => q.status === 'in');
  const feats = new Set<Feature>(['standing', 'public']);
  const d = decide(w, p, `whether to go for ${pl.title}`, [
    {
      id: 'go',
      label: `go for ${pl.title}`,
      considerations: [
        pubC('open', `the ${pl.title}'s job is going`, OPEN_PULL, 1, 0.2),
        privC(
          'want',
          want ? `has wanted it since ${year(want.since)}` : 'had not thought of it till now',
          want ? 0.85 : 0.35,
          1,
          0.2,
          undefined,
          0.3,
        ),
        stateC2('success', 'wants to get on', z01(p.values.success ?? 0)),
        facetC(p, 'socialBoldness', feats, 1, 4),
        pubC('record', p.perf > 0.3 ? 'a strong record' : p.perf < -0.3 ? 'a poor record' : 'a fair record', clamp(0.5 + p.perf / 2, 0, 1), 1, 0.2),
      ],
    },
    {
      id: 'stay',
      label: 'leave it to others',
      considerations: [
        facetC(p, 'modesty', feats, 1, 4),
        facetC(p, 'anxiety', feats, 1, 3),
        ...(others.length
          ? [
              pubC(
                'field',
                `${others.map(q => '@' + q.id).join(' and ')} already in for it`,
                Math.min(1, 0.35 * others.length + 0.3 * Math.max(0, Math.max(...others.map(q => q.perf)) - p.perf)),
                1,
                0.2,
              ),
            ]
          : []),
      ],
    },
  ]);
  if (d.chosen !== 'go') return;
  s.contenders.push(p.id);
  s.campaign[p.id] = 0;
  if (!want)
    p.wants.push({
      kind: 'attain',
      target: pl.id,
      value: 'success',
      since: w.t,
      urgency: 0.6,
      cause: s.announced,
      pursuit: {
        plan: 'work harder than anyone',
        progress: 0.2,
        effort: 0.6,
        since: w.t,
        visible: true,
        setbacks: 0,
        lastGain: w.t,
        start: w.t,
        told: 0,
      },
    });
  const e = addEvent(w, {
    type: 'goforit',
    who: [p.id],
    text: `@${p.id} has let it be known ${she(p)} wants to be ${pl.title}.`,
    causes: [eventCause(w, s.announced, 0.5), ...d.why.slice(0, 2)],
    vis: 'local',
    decision: d.rec,
    evidence: [ev(p.id, 'value:success', 1, 0.6, 0.6), ev(p.id, 'socialBoldness', 1, 0.4, 0.5)],
    w: 1.1,
  });
  broadcast(w, e);
  // Two in for the same post become rivals when they are close enough to feel it.
  for (const q of others) {
    if (rivalOf(w, p, q) || family(p, q) || p.partner === q.id) continue;
    const similar = clamp(1 - Math.abs(p.perf - q.perf) / 1.5 - Math.abs(age(w, p) - age(w, q)) / 30, 0, 1);
    const before =
      p.tried['passed:' + q.id] || q.tried['passed:' + p.id] || rivalries(w).some(r => [r.a, r.b].includes(p.id) && [r.a, r.b].includes(q.id))
        ? 0.3
        : 0;
    if (!w.rng.chance(clamp(0.3 + 0.5 * similar + before, 0, 0.95))) continue;
    const e2 = addEvent(w, {
      type: 'rivals',
      who: [p.id, q.id],
      text: `@${p.id} and @${q.id} are both after the ${pl.title}'s job, and it shows.`,
      causes: [eventCause(w, s.announced, 0.4), stateCause(similar > 0.6 ? 'so evenly matched' : 'neither will give way', 0.4)],
      vis: 'local',
      evidence: [],
      w: 1.3,
    });
    broadcast(w, e2);
    rivalries(w).push({
      id: rivalries(w).length,
      a: p.id,
      b: q.id,
      stake: 'post',
      place: pl.id,
      title: pl.title,
      about: `the ${pl.title}'s job`,
      since: w.t,
      first: e2.id,
      heat: 0.3 + 0.3 * similar + before,
      events: [e2.id],
    });
  }
}
// How strongly an open post pulls staff to go for it. Set on used worlds so that a season draws about one and a half contenders on average.
const OPEN_PULL = 0.8;
// A consideration about a state of the person's own (a value), read the same way by everyone close.
function stateC2(id: string, label: string, x: number) {
  return privC(id, label, x, 1, 0.2, undefined, 0.5);
}

// A rivalry from elsewhere (a plan that threatens someone's trade): carried on like a grudge, about the named thing.
export function startRivalry(w: World, a: Person, b: Person, stake: 'trade' | 'grudge', about: string, first: number, heat: number) {
  if (!on() || rivalOf(w, a, b) || a === b) return;
  rivalries(w).push({ id: rivalries(w).length, a: a.id, b: b.id, stake, place: '', title: about, about, since: w.t, first, heat, events: [first] });
}

// ---------- rivalry acts ----------
function act(w: World, r: Rivalry, x: Person, y: Person) {
  const s = successions(w).find(z => z.place === r.place);
  // Out of season (round 38), the one who decides is the lead as it stands, and what is won is kept for the place.
  const lead = !s && r.src === 'open' ? w.placeById.get(r.place)?.lead : undefined;
  const decider = s ? w.byId.get(s.lead) : lead != null ? w.byId.get(lead) : undefined;
  const camp = s?.campaign ?? (r.src === 'open' ? (openCampaigns(w)[r.place] ??= {}) : undefined);
  const post = r.stake === 'post';
  const feats = new Set<Feature>(['standing', post ? 'public' : 'private', 'challenged']);
  const since = year(w.events[r.first].t);
  const label = post && r.winner == null ? `both after ${r.about}` : `still sore about ${r.about} (${since})`; // once the post is decided, it is a grievance
  const heatC = privC('heat', r.heat > 0.6 ? 'it has got personal' : 'it is still about the job', r.heat, 1, 0.2, undefined, 0.4);
  const peaceLately = w.t - (x.tried['peace:' + r.id]?.t ?? -99) < 24;
  const burned = w.t - (x.tried['found:' + r.id]?.t ?? -99) < 24; // found out lately: not again, not soon
  const holder = r.stake === 'grudge' && x.id === r.b; // the one who got the post has nothing to win by talk
  const families = post
    ? decider && decider.status === 'in' && decider !== x && decider !== y && !burned
      ? ['duty', 'dishonesty', 'anger', 'humility']
      : ['duty', 'anger', 'humility']
    : ['anger', ...(burned || holder ? [] : ['dishonesty']), 'withdrawal', ...(peaceLately ? [] : ['humility'])];
  const grudgeTarget = !post
    ? staffOf(w, y.job).find(q => q !== x && q !== y && q.job != null && q.job === y.job && regard(w, q.id, y.id) > 0.1)
    : undefined;
  const o = run(w, {
    type: post ? 'rivalry' : 'grudge',
    actor: x,
    target: y,
    others: [],
    thing: post
      ? `${r.title}|${families.includes('dishonesty') ? '@' + decider!.id : 'people'}`
      : `the old business|${grudgeTarget ? '@' + grudgeTarget.id : 'people'}`,
    features: feats,
    families: families as any,
    only: post
      ? { duty: ['outwork'], dishonesty: ['whisper'], anger: ['needle'], humility: ['concede'] }
      : { anger: ['needle', 'cold'], dishonesty: ['whisper'], withdrawal: ['avoid'], humility: ['makepeace'] },
    cause: r.first,
    causeLabel: label,
    place: w.placeById.get(r.place)?.name,
    w: 1.1,
    ...(collideOn() ? { reasonsFor: () => contestReasons(w, r, y, post && r.winner == null, camp, x) } : {}),
    extra: [favour(heatC, 'anger', 'dishonesty')],
    familyExtra: {
      anger: [bondC(w, x, y, 'like', -1)],
      humility: [
        bondC(w, x, y, 'like', 1),
        ...(post
          ? [
              pubC(
                'odds',
                (camp?.[x.id] ?? 0) + x.perf < (camp?.[y.id] ?? 0) + y.perf ? `@${y.id} is ahead` : `@${x.id} is ahead`,
                clamp(0.5 + ((camp?.[y.id] ?? 0) + y.perf - (camp?.[x.id] ?? 0) - x.perf) / 2, 0, 1),
                1,
                0.2,
              ),
            ]
          : []),
      ],
      dishonesty: [privC('want', 'wants it badly', post ? 0.7 : 0.4, 1, 0.2, undefined, 0.4)],
    },
  });
  if (!o) return;
  r.events.push(o.event.id);
  const id = o.expr.id;
  if (id === 'needle') r.heat = clamp(r.heat + 0.1, 0, 1);
  else if (['cold', 'whisper', 'avoid'].includes(id)) r.heat = clamp(r.heat + 0.03, 0, 1);
  x.tried['rival:' + r.id] = { t: w.t, ok: true, n: (x.tried['rival:' + r.id]?.n ?? 0) + 1 };
  if (id === 'outwork' && camp) {
    camp[x.id] = (camp[x.id] ?? 0) + 0.15;
    x.perf += 0.1;
    if (decider && decider.status === 'in') {
      const b = bond(w, decider.id, x.id);
      b.respect = clamp(b.respect + 0.05, -1, 1);
    }
  }
  if (id === 'whisper') {
    // Running someone down to the one who decides: it works on the decider (or on whoever hears it, in a grudge), and it may come out.
    const hearer = post ? decider : grudgeTarget;
    if (camp && post) camp[x.id] = (camp[x.id] ?? 0) + 0.2;
    if (hearer) remember(w, hearer, y, o.event.id, -0.06, -0.08, -0.04, `heard what @${y.id} had got wrong`);
    if (w.rng.chance(0.2 + 0.2 * r.heat)) found(w, r, x, y, hearer, o.event);
  }
  if (id === 'concede') {
    r.over = w.t;
    r.outcome = 'conceded';
    r.winner = y.id;
    if (s) s.contenders = s.contenders.filter(c => c !== x.id);
    if (camp && !s) delete camp[x.id];
    for (const want of x.wants)
      if (want.kind === 'attain' && want.target === r.place && !want.done) {
        want.done = 'abandoned';
        want.doneAt = o.event.id;
      }
  }
  if (id === 'makepeace') {
    const warm = likeOf(w, y.id, x.id) + 0.5 * facet(y, 'forgiveness', x.id) > -0.1;
    const yrs = Math.max(1, Math.round((w.t - w.events[r.first].t) / 12));
    if (warm) {
      r.over = w.t;
      r.outcome = 'peace';
      const e = addEvent(w, {
        type: 'peace',
        who: [x.id, y.id],
        text: `@${x.id} and @${y.id} buried the hatchet, ${yrs} year${yrs > 1 ? 's' : ''} after ${r.about}.`,
        causes: [eventCause(w, o.event.id, 0.5), traitCause(y, 'forgiveness', 0.4, 1), eventCause(w, r.first, 0.3)],
        vis: 'local',
        evidence: [ev(y.id, 'forgiveness', 1, 0.7, 0.6)],
        w: 1.4,
      });
      broadcast(w, e);
      r.events.push(e.id);
      for (const [a, b] of [
        [x, y],
        [y, x],
      ]) {
        const k = bond(w, a.id, b.id);
        k.like = clamp(k.like + 0.25, -1, 1);
      }
    } else {
      r.heat = clamp(r.heat + 0.1, 0, 1);
      const e = addEvent(w, {
        type: 'rebuffed',
        who: [y.id, x.id],
        text: `@${y.id} would not hear it from @${x.id}; not after ${r.about}.`,
        causes: [eventCause(w, o.event.id, 0.5), traitCause(y, 'forgiveness', 0.5, -1), eventCause(w, r.first, 0.3)],
        vis: 'local',
        evidence: [ev(y.id, 'forgiveness', -1, 0.8, 0.7)],
        w: 1.2,
      });
      broadcast(w, e);
      r.events.push(e.id);
      addEmotion(w, x, 'rebuffed', `turned away by @${y.id}`, -0.1, 4, e.id);
      x.tried['peace:' + r.id] = { t: w.t, ok: false, n: 1 };
    }
  }
}
// A scheme comes out: everyone learns what was said, and to whom.
function found(w: World, r: Rivalry, x: Person, y: Person, hearer: Person | undefined, act: Event) {
  const e = addEvent(w, {
    type: 'scheme:found',
    who: [x.id, y.id, ...(hearer ? [hearer.id] : [])],
    text: `It came out that @${x.id} had been running @${y.id} down${hearer ? ` to @${hearer.id}` : ''}${r.stake === 'post' ? ` to get ${r.about}` : r.stake === 'trade' ? ` over ${r.about}` : ''}.`,
    causes: [eventCause(w, act.id, 0.6), traitCause(x, 'fairness', 0.5, -1), eventCause(w, r.first, 0.3)],
    vis: 'public',
    evidence: [ev(x.id, 'fairness', -1, 1.2, 0.85), ev(x.id, 'sincerity', -1, 0.6, 0.7)],
    w: 2,
  });
  broadcast(w, e);
  r.events.push(e.id);
  r.heat = clamp(r.heat + 0.3, 0, 1);
  x.tried['found:' + r.id] = { t: w.t, ok: false, n: 1 };
  remember(w, y, x, e.id, -0.5, -0.3, -0.6, `ran me down behind my back`);
  if (hearer) {
    remember(w, hearer, x, e.id, -0.15, -0.25, -0.3, `ran @${y.id} down to me`);
    remember(w, hearer, y, e.id, 0.06, 0.08, 0.04, 'was run down to me');
  }
  const camp = campaignOf(w, r.place);
  if (camp && (successions(w).some(z => z.place === r.place) || r.src === 'open')) camp[x.id] = (camp[x.id] ?? 0) - 0.5;
  addStress(x, 'found', 'found out', 0.12, e.id);
  addEmotion(w, x, 'found', 'exposed', -0.15, 8, e.id);
  // The one run down answers it, as a provocation of their own.
  if (y.status === 'in')
    w.queue.push({
      type: 'provocation',
      actor: y,
      target: x,
      others: [],
      thing: '',
      features: new Set<Feature>(['public', 'standing', 'challenged']),
      families: ['anger', 'humility', 'pride'],
      cause: e.id,
      place: w.placeById.get(r.place)?.name,
      w: 1.4,
    });
}

// ---------- the month ----------
export function dramaTick(w: World) {
  if (!on()) return;
  // Announcements: a lead getting on, ill, or wanting out.
  for (const pl of w.places) {
    if (pl.lead == null || successions(w).some(s => s.place === pl.id)) continue;
    const lead = w.byId.get(pl.lead);
    if (!lead || lead.status !== 'in') continue;
    const wantsOut = lead.wants.some(x => x.kind === 'escape' && !x.done && x.pursuit);
    const p = age(w, lead) >= 61 ? 0.03 : lead.ill && lead.health < 0.45 ? 0.04 : wantsOut ? 0.02 : 0;
    if (p && w.rng.chance(p)) announce(w, pl, lead);
  }
  // The season: staff consider going for it; a lead who has gone early leaves the field to the existing contenders.
  for (const s of successions(w)) {
    const pl = w.placeById.get(s.place);
    if (!pl) continue;
    const look = w.t === w.events[s.announced].t + 1 || w.t === s.due - 4;
    if (look)
      for (const p of staffOf(w, pl.id).filter(
        q => q.job === pl.id && q.id !== s.lead && w.t - q.jobSince >= 12 && age(w, q) < 62 && !s.contenders.includes(q.id),
      ))
        consider(w, s, pl, p);
  }
  // Round 38: out of season, two who want the same post may learn it of each other.
  if (collideOn()) notice(w);
  // Rivalries: each side acts every few months, more often the hotter it runs; it ends when one goes, or cools.
  for (const r of activeR(w)) {
    const a = w.byId.get(r.a)!,
      b = w.byId.get(r.b)!;
    if (a.status !== 'in' || b.status !== 'in') {
      r.over = w.t;
      r.outcome = 'parted';
      continue;
    }
    r.heat *= 0.97;
    if ((r.stake === 'grudge' || r.src === 'open') && r.heat < 0.06 && w.t - r.since > 36) {
      r.over = w.t;
      r.outcome = 'cooled';
      continue;
    }
    // A rivalry over a post is lived every few months; a grudge flares now and then. Nobody acts twice within a season of their last act.
    // An out-of-season rivalry (round 38) is lived at a grudge's pace: nothing is about to be decided.
    const post = r.stake === 'post' && r.src !== 'open';
    const rest = post ? 3 : 6;
    for (const [x, y] of [
      [a, b],
      [b, a],
    ] as const)
      if (
        r.over == null &&
        age(w, x) >= 18 &&
        w.t - (x.tried['rival:' + r.id]?.t ?? -99) >= rest &&
        w.rng.chance(post ? clamp(0.1 + 0.2 * r.heat, 0, 0.3) : clamp(0.03 + 0.1 * r.heat, 0, 0.13))
      )
        act(w, r, x, y);
  }
}

// ---------- wants that collide (round 38) ----------
// The reasons a contest act gives after where it started: the rival's latest move, then who is ahead (or what it is still about).
function contestReasons(w: World, r: Rivalry, y: Person, open: boolean, camp: Record<number, number> | undefined, x: Person): Cause[] {
  const theirs = r.events
    .slice()
    .reverse()
    .find(id => id !== r.first && w.events[id]?.who[0] === y.id);
  const ahead = (camp?.[x.id] ?? 0) + x.perf < (camp?.[y.id] ?? 0) + y.perf ? `@${y.id} is ahead` : `@${x.id} is ahead`;
  return [
    ...(theirs != null ? [eventCause(w, theirs, 0.4)] : []),
    stateCause(open ? ahead : `still sore about ${r.about} (${year(w.events[r.first].t)})`, 0.4),
  ];
}
// Whether someone who had not thought of the post goes for it too, on learning a colleague wants it: a season's decision, with the
// colleague's want in place of the step-down. At most once in three years for a post.
function vie(w: World, p: Person, q: Person, pl: any, giveaway: Event): boolean {
  if (w.t - p.jobSince < 24 || !['success', 'status'].some(v => p.coreValues.includes(v) || (p.values[v] ?? 0) >= 0.5)) return false;
  if (w.t - (p.tried['vie:' + pl.id]?.t ?? -99) < 36) return false;
  const feats = new Set<Feature>(['standing', 'public']);
  const d = decide(w, p, `whether to go for ${pl.title}`, [
    {
      id: 'go',
      label: `go for ${pl.title} too`,
      considerations: [
        pubC('rival', `@${q.id} is after it`, 0.7, 1, 0.2, giveaway.id),
        stateC2('success', 'wants to get on', z01(p.values.success ?? 0)),
        facetC(p, 'socialBoldness', feats, 1, 4),
        pubC('record', p.perf > 0.3 ? 'a strong record' : p.perf < -0.3 ? 'a poor record' : 'a fair record', clamp(0.5 + p.perf / 2, 0, 1), 1, 0.2),
      ],
    },
    {
      id: 'stay',
      label: 'leave it to others',
      considerations: [
        facetC(p, 'modesty', feats, 1, 4),
        facetC(p, 'anxiety', feats, 1, 3),
        pubC('field', `@${q.id} already in for it`, clamp(0.35 + 0.3 * Math.max(0, q.perf - p.perf), 0, 1), 1, 0.2),
      ],
    },
  ]);
  p.tried['vie:' + pl.id] = { t: w.t, ok: d.chosen === 'go', n: (p.tried['vie:' + pl.id]?.n ?? 0) + 1 };
  if (d.chosen !== 'go') return false;
  p.wants.push({
    kind: 'attain',
    target: pl.id,
    value: 'success',
    since: w.t,
    urgency: 0.6,
    cause: giveaway.id,
    pursuit: {
      plan: 'work harder than anyone',
      progress: 0.2,
      effort: 0.6,
      since: w.t,
      visible: true,
      setbacks: 0,
      lastGain: w.t,
      start: w.t,
      told: 0,
    },
  });
  const e = addEvent(w, {
    type: 'goforit',
    who: [p.id],
    text: `@${p.id} has let it be known ${she(p)} wants to be ${pl.title} too.`,
    causes: [eventCause(w, giveaway.id, 0.5), ...d.why.slice(0, 2)],
    vis: 'local',
    decision: d.rec,
    evidence: [ev(p.id, 'value:success', 1, 0.6, 0.6), ev(p.id, 'socialBoldness', 1, 0.4, 0.5)],
    w: 1.1,
  });
  broadcast(w, e);
  return true;
}
// Last month's lines that give away a colleague's want for the post where they work: anyone at the same place who wants it too and
// knows of the line may take them for a rival, as two who go for a post in a season do. Once for a pair and a post.
function notice(w: World) {
  const last = w.t - 1;
  let i = w.events.length;
  while (i > 0 && w.events[i - 1].t >= last) i--;
  for (; i < w.events.length; i++) {
    const e = w.events[i];
    if (e.t !== last || !e.causes.some(c => c.kind === 'want' && c.key === 'attain')) continue;
    const q = w.byId.get(e.who[0]);
    if (!q || q.status !== 'in' || !q.job || q.lead) continue;
    const pl = w.placeById.get(q.job);
    if (!pl || successions(w).some(z => z.place === pl.id)) continue;
    if (!q.wants.some(x => x.kind === 'attain' && x.target === pl.id && !x.done)) continue;
    for (const p of staffOf(w, pl.id)) {
      if (p === q || p.status !== 'in' || p.job !== pl.id || p.lead || age(w, p) >= 62 || !e.knownBy.has(p.id)) continue;
      if (rivalOf(w, p, q) || family(p, q) || p.partner === q.id) continue;
      // One who had not thought of it decides, as in a season, whether to go for it too (amendment, before any test run).
      if (!p.wants.some(x => x.kind === 'attain' && x.target === pl.id && !x.done) && !vie(w, p, q, pl, e)) continue;
      if (rivalries(w).some(r => r.place === pl.id && [r.a, r.b].includes(p.id) && [r.a, r.b].includes(q.id))) continue;
      const similar = clamp(1 - Math.abs(p.perf - q.perf) / 1.5 - Math.abs(age(w, p) - age(w, q)) / 30, 0, 1);
      const before =
        p.tried['passed:' + q.id] || q.tried['passed:' + p.id] || rivalries(w).some(r => [r.a, r.b].includes(p.id) && [r.a, r.b].includes(q.id))
          ? 0.3
          : 0;
      if (!w.rng.chance(clamp(0.3 + 0.5 * similar + before, 0, 0.95))) continue;
      const e2 = addEvent(w, {
        type: 'rivals',
        who: [p.id, q.id],
        text: `@${p.id} and @${q.id} are both after the ${pl.title}'s job, and it shows.`,
        causes: [eventCause(w, e.id, 0.5), stateCause(similar > 0.6 ? 'so evenly matched' : 'neither will give way', 0.4)],
        vis: 'local',
        evidence: [],
        w: 1.3,
      });
      broadcast(w, e2);
      const camp = (openCampaigns(w)[pl.id] ??= {});
      camp[p.id] ??= 0;
      camp[q.id] ??= 0;
      rivalries(w).push({
        id: rivalries(w).length,
        a: p.id,
        b: q.id,
        stake: 'post',
        place: pl.id,
        title: pl.title,
        about: `the ${pl.title}'s job`,
        since: w.t,
        first: e2.id,
        heat: 0.3 + 0.3 * similar + before,
        events: [e2.id],
        src: 'open',
      });
    }
  }
}
