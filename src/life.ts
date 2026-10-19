// World rules: the body, work, bonds, romance, family, money, migration. Everything people
// *do* in answer to a situation goes through the grammar; this file supplies the world those situations arise in.

import { clamp, hash } from './rng';
import { SETTING } from './setting';
import { VALUES, FACET_BY_ID } from './core';
import type { Cause, Person, World, Want } from './world';
import {
  bkA,
  bkB,
  OFF,
  recentEvents,
  setObsEvent,
  type Evidence,
  use,
  setStreams,
  plasticity,
  age,
  live,
  P,
  facet,
  bond,
  peekBond,
  likeOf,
  remember,
  memWeight,
  addEvent,
  broadcast,
  addStress,
  topSources,
  addEmotion,
  observe,
  year,
  logistic,
  tagObs,
  belief,
} from './world';
import { witnessView, truthView, z01, type Option } from './decide';
import { generatePerson, healthTarget, ceilingFor, attracted } from './generate';
import { regard, regardWeight } from './regard';
// How well ordinary contact reads a facet, by HEXACO dimension: the correlation of an other-rating with the truth after ordinary acquaintance.
const MANNER_ACCURACY: Record<string, number> = { X: 0.45, C: 0.35, O: 0.3, A: 0.25, E: 0.22, H: 0.18, I: 0.28 };
import {
  situationsTick,
  spotlightTick,
  contestLost,
  judgement,
  loss,
  friendsOf,
  family,
  traitCause,
  stateCause,
  eventCause,
  ev,
  facetC,
  valueC,
  stateC,
  pubC,
  privC,
  learned,
  decide,
  attachC,
} from './grammar';
import { scoreRecent } from './witness';
import { steering, extraPay, backing } from './steer';
import { threadsTick } from './threads';
import { groupTick, groupPairs } from './group';
import { dramaTick, dueToStepDown, contest, settle, grudge } from './drama';
import { projectsTick } from './projects';
import { personaTick } from './persona';
import { loveTick, leftBy } from './love';
import { timeTick, practise, addWant, resolveWants, wantRestore, pursuing, habitRelief, habitPairs, formHabits, homeOf, habitEvidence } from './time';
import type { Feature } from './features';

const VN = Object.fromEntries(VALUES.map(v => [v.id, v.name]));
const NONE = new Set<Feature>();

export function tick(w: World) {
  w.t++;
  // A month's chance is its own (round 25b): every system's stream is drawn afresh each month, so whatever shifts one shifts it only
  // until the month ends.
  if (!OFF.has('monthly')) setStreams(w, ...(w.t <= w.startPresent ? [w.seed, 'past'] : [w.seed, w.runSeed, 'run']), w.t);
  w.hooks.leaveTown = leaveTown;
  (w.hooks as any).split = split;
  use(w, 'body');
  for (const p of live(w)) bodyTick(w, p);
  for (const p of live(w)) if (mortality(w, p)) continue;
  use(w, 'work');
  workTick(w);
  use(w, 'social');
  socialTick(w);
  use(w, 'situations');
  situationsTick(w);
  spotlightTick(w);
  use(w, 'threads');
  threadsTick(w);
  use(w, 'time');
  timeTick(w);
  use(w, 'groups');
  if (!OFF.has('groups')) groupTick(w);
  use(w, 'drama');
  dramaTick(w);
  use(w, 'projects');
  projectsTick(w);
  use(w, 'persona');
  personaTick(w);
  use(w, 'love');
  loveTick(w);
  use(w, 'romance');
  romanceTick(w);
  use(w, 'family');
  familyTick(w);
  use(w, 'stress');
  for (const p of live(w)) stressTick(w, p);
  use(w, 'money');
  for (const p of live(w)) {
    moneyTick(w, p);
    skillTick(w, p);
    wantTick(w, p);
  }
  use(w, 'migration');
  migrationTick(w);
  use(w, 'yearly');
  if (w.t % 12 === 0) yearly(w);
  use(w, 'misc');
  scoreRecent(w);
}

// ---------- body ----------
function bodyTick(w: World, p: Person) {
  const a = age(w, p);
  if (p.ill > 0) {
    p.ill--;
    if (!p.ill) addEmotion(w, p, 'recovered', 'back on their feet', 0.08, 4);
  }
  const tgt = healthTarget(w, p) - (p.ill ? 0.3 : 0);
  p.health += (tgt - p.health) * 0.08;
  if (a < 16 || p.ill) return;
  if (w.t - (((p as any).lastIll as { t: number } | undefined)?.t ?? -99) < 9) return; // a body needs time between illnesses
  const risk = 0.0009 * Math.exp((a - 45) / 14) * (1.3 - 0.3 * p.constitution) * (p.drinks ? 1.8 : 1) * (p.stress > 0.7 ? 1.3 : 1);
  if (w.rng.chance(risk)) {
    const kinds: [string, number][] =
      a < 50
        ? [
            ['was hospitalised with pneumonia', 3],
            ['needed surgery', 4],
            ['was signed off with a bad back', 3],
          ]
        : [
            ['had a heart attack', 5],
            ['was diagnosed with cancer', 8],
            ['had a stroke', 6],
            ['was hospitalised with pneumonia', 3],
          ];
    if (p.drinks && a > 40) kinds.push(['was admitted with liver damage', 6]);
    let [kind, mo] = w.rng.pick(kinds);
    // A second illness within a few years is the same story continuing, not a new diagnosis.
    const last = (p as any).lastIll as { t: number; kind: string } | undefined;
    if (last && w.t - last.t < 48)
      kind = /cancer/.test(last.kind)
        ? 'learned the cancer was back'
        : /heart/.test(last.kind)
          ? 'had a second heart attack'
          : /stroke/.test(last.kind)
            ? 'had another stroke'
            : 'was back in hospital';
    (p as any).lastIll = { t: w.t, kind };
    p.ill = mo + w.rng.int(0, 3);
    p.health = clamp(p.health - 0.2 - w.rng.next() * 0.2, 0.05, 1);
    const causes: Cause[] = [stateCause(`age ${Math.floor(a)}`, 0.5)];
    if (p.constitution < -0.8) causes.push(stateCause('a weak constitution', 0.3));
    if (p.drinks) causes.push(stateCause(`drinking since ${year(p.drinkSince)}`, 0.5));
    if (p.stress > 0.7)
      causes.push(
        stateCause(
          `years of strain (${topSources(p)
            .map(s => s.label)
            .join(', ')})`,
          0.4,
        ),
      );
    const e = addEvent(w, {
      type: 'ill',
      who: [p.id, ...(p.partner != null ? [p.partner] : [])],
      text: `@${p.id} ${kind}.`,
      causes,
      vis: 'local',
      evidence: [],
      w: 2,
    });
    broadcast(w, e);
    addEmotion(w, p, 'ill', 'frightened by their own body', -0.18, p.ill, e.id);
    addStress(p, 'ill', 'illness', 0.15, e.id);
    if (p.partner != null) addStress(P(w, p.partner), 'pill', `@${p.id}'s illness`, 0.12, e.id);
    loss(w, p, e.id, 'ill');
  }
}
function mortality(w: World, p: Person): boolean {
  const a = age(w, p);
  // Gompertz, fitted to Norwegian rates (about 0.5% a year at 60, 1.6% at 70, 5% at 80, 16% at 90, half at 100); illness and poor health multiply it.
  let h = Math.min(0.8, 0.0000025 * Math.exp(0.116 * a)) / 12;
  if (a >= 105) h = Math.max(h, 0.6 / 12); // nobody outlives the record
  const norm = 0.78 - Math.max(0, a - 45) * 0.009; // health that is normal for this age
  if (p.health < norm) h *= 1 + (norm - p.health) * 4; // only health worse than that adds risk: drink, strain, a weak constitution
  if (p.ill) h *= 2.2;
  if (!w.rng.chance(h)) return false;
  let cause: string;
  const causes: Cause[] = [stateCause(`age ${Math.floor(a)}`, 0.5), stateCause('health had worn down', 0.3)];
  if (p.ill) cause = 'died after a long illness';
  else if (p.drinks && a < 72) {
    cause = 'died of liver failure';
    causes.push(stateCause(`drinking since ${year(p.drinkSince)}`, 0.6));
  } else if (a > 79) cause = `died in ${p.sex === 'f' ? 'her' : 'his'} sleep`;
  else cause = 'died of a sudden heart attack';
  die(w, p, cause, causes);
  return true;
}
function die(w: World, p: Person, cause: string, causes: Cause[]) {
  const a = Math.floor(age(w, p));
  p.status = 'dead';
  p.diedAt = w.t;
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (pl && pl.lead === p.id) pl.lead = null;
  p.job = null;
  p.lead = false;
  const close: number[] = [];
  if (p.partner != null) close.push(p.partner);
  for (const k of p.kids) if (P(w, k).status !== 'dead') close.push(k);
  for (const k of p.parents) if (P(w, k).status === 'in') close.push(k);
  const e = addEvent(w, {
    type: 'death',
    who: [p.id, ...close],
    text: `@${p.id} ${cause}, aged ${a}.`,
    causes,
    vis: 'public',
    evidence: [],
    w: 3,
  });
  broadcast(w, e);
  if (p.partner != null) {
    const q = P(w, p.partner);
    q.partner = null;
    q.pstat = null;
    grief(w, q, p, e.id, 0.32, 0.3, 30);
    loss(w, q, e.id, `@${p.id} died`);
  }
  for (const k of p.kids) {
    const c = P(w, k);
    if (c.status === 'in') {
      grief(w, c, p, e.id, 0.22, 0.15, 14);
      loss(w, c, e.id, `@${p.id} died`);
    } else if (c.status === 'away') maybeHomeForFuneral(w, c, p, e.id);
  }
  for (const k of p.parents) {
    const c = P(w, k);
    if (c.status === 'in') grief(w, c, p, e.id, 0.4, 0.35, 36);
  }
  for (const f of friendsOf(w, p)) grief(w, f, p, e.id, 0.1, 0.08, 8);
  const heirs = p.kids.map(k => P(w, k)).filter(k => k.status !== 'dead');
  if (heirs.length && p.savings > 0) for (const k of heirs) k.savings += p.savings / heirs.length;
  for (const id of p.friends) P(w, id).friends.delete(p.id);
  // Wanting to make things right with someone, or to win them, ends when they die. Making things right becomes a regret on the record.
  for (const q of w.people)
    if (q.status !== 'dead' && q !== p)
      for (const x of q.wants)
        if (!x.done && (x.kind === 'restore' || x.kind === 'win') && x.target === String(p.id)) {
          x.done = 'failed';
          x.doneAt = e.id;
          if (x.kind !== 'restore') continue;
          const yrs = Math.max(1, Math.round((w.t - x.since) / 12));
          const e2 = addEvent(w, {
            type: 'regret',
            who: [q.id, p.id],
            text: `@${q.id} never made things right with @${p.id}. ${yrs > 1 ? `${q.sex === 'f' ? 'She' : 'He'} had been meaning to for ${yrs} years.` : ''}`.trim(),
            causes: [
              eventCause(w, e.id, 1),
              {
                kind: 'want',
                label: `had wanted to make things right with @${p.id} since ${year(x.since)}`,
                weight: 0.6,
                key: 'restore',
                who: q.id,
              },
            ],
            vis: 'local',
            evidence: [],
            w: 1.4,
          });
          broadcast(w, e2);
          addEmotion(w, q, 'regret', `left it too late with @${p.id}`, -0.15, 12, e2.id);
        }
}
function grief(w: World, q: Person, p: Person, ref: number, moodHit: number, stress: number, months: number) {
  const sent = facet(q, 'sentimentality');
  addEmotion(w, q, 'grief' + p.id, `grieving @${p.id}`, -moodHit * (1 + 0.3 * sent), Math.round(months * (1 + 0.3 * sent)), ref);
  addStress(q, 'grief' + p.id, `grief for @${p.id}`, stress, ref);
}

// ---------- work ----------
function perfRaw(w: World, p: Person, sk: string): number {
  const r = p.skills[sk]?.r ?? 1000;
  let z = (r - 1150) / 150 + 0.35 * facet(p, 'diligence') + 0.2 * facet(p, 'organisation') + (p.health - 0.75) * 1.2;
  if (p.drinks) z -= 0.6;
  if (p.stress > 0.6) z -= (p.stress - 0.6) * 1.5;
  if (p.ill) z -= 1;
  return z + w.rng.normal() * 0.35 * p.variability;
}
function workTick(w: World) {
  const L = live(w);
  for (const pl of w.places) {
    if (pl.lead != null && (P(w, pl.lead).job !== pl.id || P(w, pl.lead).status !== 'in')) pl.lead = null;
    const staff = L.filter(p => p.job === pl.id);
    for (const s of staff) {
      practise(s, pl.skill, 1.0);
      s.perf = s.perf * 0.8 + perfRaw(w, s, pl.skill) * 0.2;
    }
    const lead = pl.lead != null ? P(w, pl.lead) : null;
    if (lead)
      for (const s of staff) {
        if (s === lead || w.t - s.jobSince < 18 || s.perf > -0.9 || !w.rng.chance(0.25)) continue;
        const verdict = judgement(w, lead, s, pl);
        if (verdict === 'dismiss') fire(w, s, pl);
      }
    if (lead && dueToStepDown(w, pl)) {
      retire(w, lead);
      const left = L.filter(p => p.job === pl.id);
      if (left.length) promote(w, pl, left);
    } else if (pl.lead == null && staff.length) promote(w, pl, staff);
    hire(w, pl);
  }
  for (const p of L) if (!p.job && !p.retired && age(w, p) >= 65) p.retired = true;
  for (const p of L) if (p.job && age(w, p) >= 62 && w.rng.chance(0.012 + (age(w, p) >= 67 ? 0.12 : 0) + (p.health < 0.5 ? 0.03 : 0))) retire(w, p);
}
function fire(w: World, s: Person, pl: any) {
  const ref = w.events.length - 1;
  s.job = null;
  s.quitFrom = pl.id;
  addEmotion(w, s, 'fired', 'humiliated', -0.2 - 0.05 * -facet(s, 'modesty'), 10, ref);
  addStress(s, 'fired', `losing the job at ${pl.name}`, 0.18, ref);
  s.wants.push({ kind: 'attain', target: 'work', value: 'security', since: w.t, urgency: 0.8 });
  loss(w, s, ref, `lost the job at ${pl.name}`);
}
function promote(w: World, pl: any, staff: Person[]) {
  const c = contest(w, pl, staff);
  const base = c ? c.pool : staff; // a succession season decides who is in the running
  const cands = base.filter(s => w.t - s.jobSince >= 12);
  const pool = cands.length ? cands : base;
  const peers = (s: Person) => {
    const o = staff.filter(x => x !== s);
    return o.length ? o.reduce((a, x) => a + regard(w, x.id, s.id), 0) / o.length : 0;
  };
  const sc = pool
    .map(
      s =>
        [
          s,
          s.perf +
            0.3 * facet(s, 'organisation') +
            0.25 * z01(facet(s, 'socialBoldness')) +
            0.6 * peers(s) +
            Math.min(10, (w.t - s.jobSince) / 12) * 0.08 +
            (c ? c.bonus(s) : 0) +
            backing(w, s, pl.id) +
            w.rng.normal() * 0.3,
        ] as const,
    )
    .sort((a, b) => b[1] - a[1]);
  const win = sc[0][0];
  pl.lead = win.id;
  win.lead = true;
  // In a contested season, say what decided it: the outgoing lead's backing, the campaign, or a rival found out.
  const second = sc[1]?.[0];
  const why: Cause[] = [];
  if (c && second && pool.length > 1) {
    if (c.decider && regard(w, c.decider.id, win.id) - regard(w, c.decider.id, second.id) > 0.15)
      why.push(stateCause(`@${c.decider.id} wanted @${win.id} to have it`, 0.5));
    if ((c.campaign[second.id] ?? 0) < -0.2) why.push(stateCause(`@${second.id} had been found out running people down`, 0.5));
    else if ((c.campaign[win.id] ?? 0) - (c.campaign[second.id] ?? 0) > 0.25) why.push(stateCause(`@${win.id} had worked for it`, 0.4));
  }
  const e = addEvent(w, {
    type: 'promoted',
    who: [win.id],
    text: `@${win.id} became ${pl.title} at ${pl.name}.`,
    causes: [
      ...why,
      stateCause(pool.length > 1 ? `the strongest record of ${pool.length}` : 'the only one in the running', 0.6),
      traitCause(win, 'organisation', 0.4, 1),
    ].slice(0, 3),
    vis: 'public',
    evidence: [ev(win.id, 'skill:' + pl.skill, 1, 0.6, 0.6)],
    w: 2,
  });
  broadcast(w, e);
  addEmotion(w, win, 'promo', 'proud of the step up', 0.15, 10, e.id);
  resolveWants(w, win, 'attain', pl.id, 'achieved', e.id);
  settle(w, pl, win, e.id);
  // Nerves at the first staff meeting: a test of Anxiety in public.
  const feats = new Set<Feature>(['public', 'watched', 'authority']);
  const nerves =
    facet(win, 'anxiety', undefined, feats) - 0.5 * facet(win, 'socialBoldness', undefined, feats) + w.rng.normal() * 0.6 * win.variability;
  if (Math.abs(nerves) > 0.5) {
    const e1 = addEvent(w, {
      type: nerves > 0 ? 'froze' : 'rose',
      who: [win.id],
      text: nerves > 0 ? `@${win.id} froze at the first staff meeting.` : `@${win.id} took to it at once.`,
      causes: [traitCause(win, 'anxiety', 0.6, nerves > 0 ? 1 : -1), traitCause(win, 'socialBoldness', 0.4, nerves > 0 ? -1 : 1)],
      vis: 'local',
      evidence:
        nerves > 0
          ? [ev(win.id, 'anxiety', 1, 1, 0.85), ev(win.id, 'socialBoldness', -1, 0.6, 0.6)]
          : [ev(win.id, 'anxiety', -1, 0.8, 0.7), ev(win.id, 'socialBoldness', 1, 0.8, 0.7)],
      w: nerves > 0 ? 1 : 0.6,
    });
    broadcast(w, e1);
    if (nerves > 0) addStress(win, 'froze', 'the staff meeting', 0.08, e1.id);
  }
  for (const [l] of sc.slice(1)) {
    const wanted = l.wants.find(x => x.kind === 'attain' && x.target === pl.id && !x.done);
    if (!wanted && l.values.success < 0.6) continue;
    const deserved = l.perf > win.perf + 0.3;
    if (wanted) resolveWants(w, l, 'attain', pl.id, 'failed', e.id);
    const e2 = addEvent(w, {
      type: 'passed',
      who: [l.id, win.id],
      text: `@${l.id} was passed over for ${pl.title}; @${win.id} got the job.`,
      causes: [
        deserved ? stateCause(`@${l.id} had been doing the better work`, 0.5) : stateCause(`@${win.id} had the stronger record`, 0.5),
        ...(wanted ? [{ kind: 'want', label: `had wanted it since ${year(wanted.since)}`, weight: 0.5 } as Cause] : []),
      ],
      vis: 'local',
      evidence: [],
      w: 1.5,
    });
    broadcast(w, e2);
    addStress(l, 'passed', `passed over for ${pl.title}`, 0.1 + 0.08 * z01(l.values.success), e2.id);
    addEmotion(w, l, 'passed', 'passed over', -0.12, 8, e2.id);
    const answer = contestLost(w, l, win, pl, e2.id, deserved, !!wanted);
    grudge(w, l, win, pl, answer?.family, e2.id);
  }
}
// Round 25c: a friend who works where there is an opening puts in a word for someone asking around.
function wordFor(w: World, c: Person, pl: any): Person | undefined {
  if (!steering() || !c.wants.some(x => !x.done && x.kind === 'attain' && x.target === 'work' && (x.pursuit as any)?.way === 'around'))
    return undefined;
  return friendsOf(w, c).find(q => q.job === pl.id);
}
function hire(w: World, pl: any) {
  const word = (c: Person) => wordFor(w, c, pl);
  const L = live(w);
  if (L.filter(p => p.job === pl.id).length >= pl.cap) {
    pl.vac = 0;
    return;
  }
  pl.vac++;
  if (!w.rng.chance(0.35)) return;
  const lead = pl.lead != null ? P(w, pl.lead) : null;
  // Round 25c: someone after a post who has chosen to look elsewhere is in the running too.
  const looking = (p: Person) =>
    steering() &&
    p.job != null &&
    p.job !== pl.id &&
    !p.lead &&
    p.wants.some(x => !x.done && x.kind === 'attain' && (x.pursuit as any)?.way === 'elsewhere');
  const cands = L.filter(
    p => (!p.job || looking(p)) && !p.retired && !p.student && !p.givenUp && age(w, p) >= 18 && age(w, p) < 63 && p.quitFrom !== pl.id,
  ).filter(p => {
    if (!lead || pl.vac > 12) return true;
    const b = w.beliefs.get(lead.id)?.get(`${p.id}|diligence`);
    return !(b && b.n >= 2 && b.m < -0.4);
  });
  if (!cands.length) {
    if (pl.vac > 6 && w.rng.chance(0.3)) newcomer(w, pl);
    return;
  }
  const view = lead ? witnessView(w, lead.id) : truthView(w);
  const sc = cands
    .map(c => {
      const skill = ((c.skills[pl.skill]?.r ?? 1000) - 1300) / 200;
      const seen = lead ? (w.beliefs.get(lead.id)?.get(`${c.id}|skill:${pl.skill}`)?.m ?? 0) : skill;
      const liking = lead ? likeOf(w, lead.id, c.id) : 0;
      const keen =
        (pursuing(c, 'attain') ? 0.35 : 0) +
        (word(c) ? 0.5 : 0) +
        (OFF.has('latent')
          ? 0
          : [0, 0.15, 0.4][c.skills[pl.skill]?.interest ?? 0] +
            (c.parents.some(id => P(w, id).status === 'in' && P(w, id).job === pl.id) ? 0.35 : 0));
      /* people look for work in what they love, and a parent who works there puts in a word */ return [
        c,
        0.6 * seen +
          0.3 * view.facet(c, 'diligence') +
          0.8 * (lead ? regard(w, lead.id, c.id) : 0) +
          0.15 * c.aptitudes.presence +
          0.1 * facet(c, 'socialBoldness') +
          keen +
          w.rng.normal() * 0.3,
        liking,
      ] as const;
    })
    .sort((a, b) => b[1] - a[1]);
  const [c, s, liking] = sc[0];
  if (s < -0.3 && pl.vac < 8) return;
  const friend = word(c);
  const causes: Cause[] = c.job
    ? []
    : [stateCause(cands.length > 1 ? `the best of ${cands.length} looking for work` : 'the only one looking for work', 0.5)];
  if (lead && liking > 0.3) causes.push({ kind: 'bond', label: `@${lead.id} likes them`, weight: 0.4, who: lead.id });
  if (friend) causes.push({ kind: 'bond', label: `@${friend.id} had put in a word`, weight: 0.5, who: friend.id });
  else if (pursuing(c, 'attain') && !c.job)
    causes.push({ kind: 'want', label: 'had been asking everywhere for work', weight: 0.4, key: 'attain', who: c.id });
  const from = c.job ? w.placeById.get(c.job)! : null;
  if (from) {
    // Leaving one job for another: the post they were after there is let go, for a fresh start here.
    if (from.lead === c.id) from.lead = null;
    for (const x of c.wants)
      if (!x.done && x.kind === 'attain') {
        x.done = 'abandoned';
        x.doneAt = w.events.length;
      }
    causes.unshift({ kind: 'want', label: `wanted more than ${from.name} could give`, weight: 0.5, key: 'attain', who: c.id });
  }
  if (s < -0.3) causes.push(stateCause('nobody better had applied for months', 0.4));
  c.joblessMonths = 0;
  c.job = pl.id;
  c.jobSince = w.t;
  c.skills[pl.skill].r = Math.max(c.skills[pl.skill].r, 1060);
  c.perf = Math.max(-0.3, perfRaw(w, c, pl.skill));
  pl.vac = 0;
  const e = addEvent(w, {
    type: from ? 'moved' : 'hired',
    who: [c.id],
    text: from ? `@${c.id} left ${from.name} for a start at ${pl.name}.` : `@${c.id} started work at ${pl.name}.`,
    causes,
    vis: 'public',
    evidence: [],
    w: from ? 1.5 : 1,
  });
  broadcast(w, e);
  addEmotion(w, c, 'hired', 'glad of the work', 0.08, 5, e.id);
  resolveWants(w, c, 'attain', 'work', 'achieved', e.id);
}
export function assignCircle(w: World, p: Person) {
  const others = live(w).filter(q => q !== p && !family(p, q) && Math.abs(age(w, q) - age(w, p)) < 15);
  p.circle = w.rng
    .shuffle(others)
    .slice(0, 3 + w.rng.int(0, 2))
    .map(q => q.id);
}
// Someone moves to town for a job. About a third of those in their late twenties and thirties bring a family: small towns live on that.
function newcomer(w: World, pl: any) {
  const a = 23 + Math.floor(Math.pow(w.rng.next(), 1.5) * 20); // mostly young: the jobs that go begging in a small town draw people starting out
  const p = generatePerson(w, { age: a, founder: true });
  settleIn(w, p);
  p.skills[pl.skill].r = 1250 + w.rng.next() * 200;
  p.savings = 5 + w.rng.next() * 10;
  p.job = pl.id;
  p.jobSince = w.t;
  p.perf = perfRaw(w, p, pl.skill);
  const fam: Person[] = [];
  if (a >= 27 && w.rng.chance(0.35)) {
    const q = generatePerson(w, {
      age: Math.max(22, a + w.rng.int(-4, 4)),
      sex: p.attraction === 'both' ? (w.rng.chance(0.5) ? 'f' : 'm') : p.attraction,
      last: w.rng.chance(0.6) ? p.last : undefined,
      founder: true,
    });
    q.attraction = q.attraction === 'both' ? 'both' : p.sex;
    settleIn(w, q);
    q.savings = p.savings * 0.5;
    p.partner = q.id;
    q.partner = p.id;
    p.pstat = q.pstat = 'married';
    p.psince = q.psince = w.t - 12 * w.rng.int(2, Math.max(2, a - 24));
    for (const [x, y] of [
      [p, q],
      [q, p],
    ] as const) {
      const r = bond(w, x.id, y.id);
      r.fam = 1;
      r.like = 0.4 + w.rng.next() * 0.3;
      r.trust = 0.4;
      r.respect = 0.2;
    }
    fam.push(q);
    const nk = a >= 30 ? w.rng.int(0, 2) : w.rng.int(0, 1);
    for (let i = 0; i < nk; i++) {
      const adopt = p.sex === q.sex;
      const k = generatePerson(w, { age: w.rng.int(0, Math.min(15, a - 24)), parents: adopt ? [] : [p.id, q.id], last: q.last, founder: false });
      if (adopt) k.parents = [p.id, q.id];
      p.kids.push(k.id);
      q.kids.push(k.id);
      settleIn(w, k);
      for (const par of [p, q])
        for (const [x, y] of [
          [k, par],
          [par, k],
        ] as const) {
          const r = bond(w, x.id, y.id);
          r.fam = 1;
          r.like = 0.5;
          r.trust = 0.5;
        }
      fam.push(k);
    }
  }
  const e = addEvent(w, {
    type: 'arrived',
    who: [p.id, ...fam.map(x => x.id)],
    text: fam.length
      ? `@${p.id} moved to ${SETTING.name} for a job at ${pl.name}, with ${fam.length === 1 ? `@${fam[0].id}` : `@${fam[0].id} and the children`}.`
      : `@${p.id} moved to ${SETTING.name} for a job at ${pl.name}.`,
    causes: [stateCause(`${pl.name} had been short-staffed for ${pl.vac} months`, 1)],
    vis: 'public',
    evidence: [],
    w: 1.5,
  });
  broadcast(w, e);
}
function settleIn(w: World, p: Person) {
  if (age(w, p) >= 14) assignCircle(w, p);
  p.attachments.push({ key: 'home', label: SETTING.name, like: -0.2, since: w.t });
  p.facets['attach:home'] = -0.4;
  if (age(w, p) >= 16) formHabits(w, p, 1 + w.rng.int(0, 2), 'always has');
}
function retire(w: World, p: Person) {
  const pl = w.placeById.get(p.job!)!;
  const yrs = Math.round((w.t - p.jobSince) / 12);
  if (pl.lead === p.id) pl.lead = null;
  p.job = null;
  p.lead = false;
  p.retired = true;
  for (const x of p.wants)
    if (!x.done && x.kind === 'attain') {
      x.done = 'abandoned';
      x.doneAt = w.events.length;
    }
  const e = addEvent(w, {
    type: 'retired',
    who: [p.id],
    text: `@${p.id} retired after ${yrs} years at ${pl.name}.`,
    causes: [stateCause(p.health < 0.5 ? 'poor health' : `age ${Math.floor(age(w, p))}`, 1)],
    vis: 'public',
    evidence: [],
    w: 1.5,
  });
  broadcast(w, e);
  addEmotion(
    w,
    p,
    'retired',
    p.values.success > 0.8 ? 'restless without the work' : 'enjoying the quiet',
    p.values.success > 0.8 ? -0.08 : 0.08,
    18,
    e.id,
  );
}
function skillTick(w: World, p: Person) {
  for (const sk in p.skills) {
    const s = p.skills[sk];
    if (p.job && w.placeById.get(p.job)!.skill === sk) continue;
    if (s.interest === 2 && w.rng.chance(0.6)) {
      practise(p, sk, 0.4);
      continue;
    }
    if (s.r > 1000) s.r -= (s.r - 1000) * 0.004;
  }
}

// ---------- social ----------
const SIMV = ['freedom', 'tradition', 'success', 'lovedOnes', 'fairness'];
function chemistry(a: Person, b: Person): number {
  let s = 0;
  for (const k of SIMV) s += 1 - Math.abs(a.values[k] - b.values[k]) / 2.5;
  s /= SIMV.length;
  return (
    (s - 0.35) * 2.0 +
    0.5 * (logistic(facet(b, 'gentleness') + facet(b, 'liveliness')) - 0.5) +
    0.3 * (logistic(facet(a, 'sociability')) - 0.5) -
    0.35 * Math.max(0, -facet(b, 'patience') - 0.8) -
    (facet(a, 'modesty') < -1.2 && facet(b, 'modesty') < -1.2 ? 0.25 : 0) -
    (s < 0.25 ? 0.25 : 0) -
    0.2 * Math.max(0, -facet(b, 'gentleness') - 1) -
    0.15 * Math.max(0, -facet(b, 'sincerity') - 1) * z01(facet(a, 'sincerity'))
  );
}
function chemWhy(w: World, a: Person, b: Person, sign = 1): Cause[] {
  const out: Cause[] = [];
  let s = 0;
  for (const k of SIMV) s += 1 - Math.abs(a.values[k] - b.values[k]) / 2.5;
  s /= SIMV.length;
  if (sign > 0) {
    if (s > 0.75) out.push({ kind: 'value', label: 'they want the same things from life', weight: 0.4 });
    if (facet(b, 'gentleness') > 0.9) out.push(traitCause(b, 'gentleness', 0.3, 1));
    if (facet(b, 'liveliness') > 0.9) out.push(traitCause(b, 'liveliness', 0.3, 1));
  } else {
    if (s < 0.3) {
      const k = SIMV.slice().sort((x, y) => Math.abs(a.values[y] - b.values[y]) - Math.abs(a.values[x] - b.values[x]))[0];
      out.push({ kind: 'value', label: `they see ${VN[k].toLowerCase()} completely differently`, weight: 0.4 });
    }
    if (facet(b, 'gentleness') < -1) out.push(traitCause(b, 'gentleness', 0.3, -1));
    if (facet(b, 'patience') < -1) out.push(traitCause(b, 'patience', 0.3, -1));
    if (facet(a, 'modesty') < -1.2 && facet(b, 'modesty') < -1.2)
      out.push({ kind: 'trait', label: 'two people who both need to be the one who matters', weight: 0.3 });
    if (facet(b, 'sincerity') < -1 && facet(a, 'sincerity') > 0.5)
      out.push({ kind: 'trait', label: `@${a.id} can tell when someone is performing`, weight: 0.3 });
  }
  return out;
}
// Which channel the current contact comes through (work, family, sought…), for the social-graph audit.
let channel = '';
function contact(w: World, a: Person, b: Person, i: number) {
  w.hooks.contact?.(w, a, b, i, channel);
  for (const [x, y] of [
    [a, b],
    [b, a],
  ] as const) {
    const r = bond(w, x.id, y.id);
    if ((r as any).since == null) (r as any).since = w.t;
    r.fam = Math.min(1, r.fam + 0.03 * i);
    r.touched = w.t;
    if (channel) {
      const via = ((r as any).via ??= {}) as Record<string, number>;
      via[channel] = (via[channel] ?? 0) + i;
    }
    (r as any).recent = ((r as any).recent ?? 0) + i; // contact lately: a running sum that halves in about six months // how these two came to spend time together
    let memLike = 0,
      memResp = 0,
      memTrust = 0;
    for (const m of r.mem) {
      const k = memWeight(x, m, w.t, y.id);
      memLike += m.like * k;
      memResp += m.respect * k;
      memTrust += m.trust * k;
    }
    // What x believes y feels about x shapes how x warms to y. When the belief is wrong, it can make itself true.
    const bl = OFF.has('respond') ? undefined : belief(w, x.id, y.id, 'bond:' + x.id);
    const chill = bl && bl.n > 0 && bl.m < -0.2 ? 0.35 * Math.min(1, -bl.m) : 0;
    const chem = chemistry(x, y);
    const tgtLike = clamp(chem * Math.min(1, 0.55 + r.fam) + (!OFF.has('exposure') && chem > -0.3 ? EXPOSURE * r.fam : 0) + memLike - chill, -1, 1); // knowing someone makes them easier to like (round 19c)
    if (
      chill > 0 &&
      r.like > 0 &&
      r.like + (tgtLike - r.like) * 0.06 * i <= 0 &&
      likeOf(w, y.id, x.id) > 0.2 &&
      !x.tried['misread:' + y.id] &&
      age(w, x) >= 16 &&
      age(w, y) >= 16
    ) {
      learned(w, x, 'misread:' + y.id, true);
      const e = addEvent(w, {
        type: 'misread',
        who: [x.id, y.id],
        text: `@${x.id} had decided @${y.id} never liked ${x.sex === 'f' ? 'her' : 'him'}, and went cool. @${y.id}, who did, never understood why.`,
        causes: [
          {
            kind: 'belief',
            label: `@${x.id} believed @${y.id} disliked ${x.sex === 'f' ? 'her' : 'him'} (wrongly)`,
            weight: 0.7,
            who: x.id,
            key: 'bond:' + x.id,
          },
          traitCause(x, 'socialSelfEsteem', 0.3, -1),
        ],
        vis: 'private',
        evidence: [ev(x.id, 'socialSelfEsteem', -1, 0.5, 0.6), ev(x.id, 'bond:' + y.id, -1, 0.6, 0.7)],
        w: 1.2,
      });
      e.knownBy.set(y.id, 'seen');
      broadcast(w, e);
      remember(w, y, x, e.id, -0.12, 0, -0.08, 'went cool on me for no reason I could see');
    }
    r.like += (tgtLike - r.like) * 0.06 * i + w.rng.normal() * 0.01 * i;
    r.respect += (clamp(0.3 * y.perf + memResp, -1, 1) - r.respect) * 0.04 * i;
    r.trust += (clamp(0.2 * facet(y, 'fairness') + memTrust + 0.1, -1, 1) - r.trust) * 0.03 * i;
    r.like = clamp(r.like, -1, 1);
    r.respect = clamp(r.respect, -1, 1);
    r.trust = clamp(r.trust, -1, 1);
    // Ordinary contact teaches you a little about people: their manner shows, their strong traits most of all. As good as the research
    // says and no better: a read of a facet is what the person shows (truth plus mask) plus noise, set so the read correlates with the
    // truth at the level other-ratings reach after ordinary acquaintance (Connelly & Ones 2010; HEXACO honesty-humility lowest). The weight
    // of the read scales with that accuracy, so what manner can teach about fairness is a fraction of what it teaches about sociability.
    if (!OFF.has('manner') && w.rng.chance(0.22 * i * (0.6 + 0.4 * z01(x.aptitudes.socialInsight)))) {
      tagObs('manner');
      const keys = [
        'sociability',
        'liveliness',
        'gentleness',
        'organisation',
        'patience',
        'sincerity',
        'modesty',
        'diligence',
        'socialBoldness',
        'inquisitiveness',
        'anxiety',
        'altruism',
        'fairness',
        'forgiveness',
        'dependence',
        'prudence',
        'greedAvoidance',
        'flexibility',
        'sentimentality',
      ];
      const k = w.rng.weighted(keys.map(k => [k, 0.5 + Math.abs(facet(y, k))] as [string, number]));
      const shown = facet(y, k) + (y.presentation[k] ?? 0);
      const acc = OFF.has('mannernoise') ? 1 : (MANNER_ACCURACY[FACET_BY_ID[k]?.dim ?? 'I'] ?? 0.3);
      const read = acc >= 1 ? shown : shown + w.rng.normal() * Math.sqrt(1 / (acc * acc) - 1);
      const mev = ev(y.id, k, Math.sign(read) || 1, Math.min(1.5, Math.abs(read)) * 0.8 * acc, 0.35);
      // What the witness noticed is written down, so a player can read it: a strong read, one time in three, at most once a year per person and facet.
      // The line follows the read, not the truth, so a wrong impression is a wrong line. Everyone else's manner reads stay silent.
      if (
        x.id === w.witness &&
        w.t >= w.startPresent &&
        Math.abs(read) >= 1.0 &&
        w.rng.chance(0.33) &&
        w.t - (x.tried['noticed:' + y.id + ':' + k]?.t ?? -99) >= 12
      ) {
        learned(w, x, 'noticed:' + y.id + ':' + k, true);
        const f = FACET_BY_ID[k];
        const tell = read > 0 ? f.hiTell : f.loTell;
        const e = addEvent(w, {
          type: 'noticed',
          who: [y.id],
          text: `Noticed: @${y.id} ${tell}.`,
          causes: [traitCause(y, k, 1, read > 0 ? 1 : -1)],
          vis: 'private',
          evidence: [mev],
          w: 0.3,
          knownBy: new Map([[x.id, 'seen']]),
        });
        broadcast(w, e);
      } else observe(w, x.id, mev, 'seen');
      tagObs('act');
    }
    // The closer you are, the more you see of how someone is doing: strain shows at the kitchen table, and so does money being tight.
    // When the observer is the witness, the kitchen table is written down (at most one line of each kind per person per half year); otherwise the read stays silent.
    // The easing line is only news when the witness had thought them low (or broke); otherwise nothing wrong is nothing to write.
    if (r.fam > 0.35 && w.rng.chance(0.08 * i * r.fam))
      kitchenTable(
        w,
        x,
        y,
        'low',
        ev(y.id, 'state:low', y.stress > 0.45 ? 1 : -1, y.stress > 0.45 ? 0.5 + y.stress * 0.5 : 0.5, 0.5),
        y.stress > 0.45 ? `Over dinner it was plain @${y.id} was carrying something.` : `@${y.id} seemed lighter than in a long while.`,
      );
    if (r.fam > 0.5 && w.rng.chance(0.03 * i * r.fam))
      kitchenTable(
        w,
        x,
        y,
        'broke',
        ev(y.id, 'state:broke', y.savings < -2 ? 1 : -1, y.savings < -2 ? 0.8 : 0.5, 0.5),
        y.savings < -2 ? `@${y.id} let slip that money was tight.` : `Money, at least, was not a worry for @${y.id}.`,
      );
    // What matters to a person reaches others only through what they do about it (values are causes of acts, and acts are evidence). Whether they'd ever leave, they say.
    if (w.rng.chance(0.04 * i) && r.fam > 0.3 && Math.abs(y.facets['attach:home'] ?? 0) > 0.5)
      observe(w, x.id, ev(y.id, 'attach:home', Math.sign(y.facets['attach:home']), 0.7, 0.4), 'seen');
    // Habits are the most visible thing about anyone.
    // Habits are the most visible thing about anyone, and learned once: the hundredth sighting of the morning swim teaches nothing new.
    if (w.rng.chance(0.06 * i)) {
      const kept = y.habits.filter(h => !h.broken && !x.tried[`knows:${y.id}:${h.id}`]);
      if (kept.length) {
        const h = w.rng.pick(kept);
        learned(w, x, `knows:${y.id}:${h.id}`, true);
        tagObs('habit');
        for (const e of habitEvidence(y, h.id, 0.5, 0.4)) observe(w, x.id, e, 'seen');
        tagObs('act');
      }
    }
  }
  checkBond(w, a, b);
}
// The kitchen table: what someone close sees of how another is doing. The witness's reads are written down (at most one line of each
// kind per person per half year), and the easing line only when the witness had thought them low or broke; everyone else's stay silent.
function thoughtLow(w: World, x: Person, y: Person, key: string) {
  const b = belief(w, x.id, y.id, 'state:' + key);
  return !!b && b.n > 0 && b.m > 0.3;
}
function kitchenTable(w: World, x: Person, y: Person, key: string, e2: Evidence, text: string) {
  if (
    x.id === w.witness &&
    w.t >= w.startPresent &&
    (e2.dir > 0 || thoughtLow(w, x, y, key)) &&
    w.t - (x.tried['table:' + key + ':' + y.id]?.t ?? -99) >= 6
  ) {
    learned(w, x, 'table:' + key + ':' + y.id, true);
    const e = addEvent(w, {
      type: 'table',
      who: [y.id],
      text,
      causes: [
        stateCause(
          key === 'low' ? (e2.dir > 0 ? `the strain @${y.id} is under` : 'things had eased') : e2.dir > 0 ? 'money is tight' : 'money is fine',
          0.6,
        ),
      ],
      vis: 'private',
      evidence: [e2],
      w: 0.3,
      knownBy: new Map([[x.id, 'seen']]),
    });
    broadcast(w, e);
  } else observe(w, x.id, e2, 'seen');
}
// How two people came to spend time together: the channel that gave them most contact.
function howMet(w: World, a: Person, b: Person): Cause[] {
  const via: Record<string, number> = {};
  for (const r of [peekBond(w, a.id, b.id), peekBond(w, b.id, a.id)])
    for (const [k, v] of Object.entries(((r as any)?.via ?? {}) as Record<string, number>)) via[k] = (via[k] ?? 0) + v;
  const top = Object.entries(via).sort((x, y) => y[1] - x[1])[0]?.[0];
  const hs = SETTING.hobbies.filter(h => a.skills[h]?.interest === 2 && b.skills[h]?.interest === 2);
  const label =
    top === 'work'
      ? a.job && a.job === b.job
        ? `they work together at ${w.placeById.get(a.job)!.name}`
        : 'they worked together for years'
      : top === 'circle'
        ? 'they run in the same crowd'
        : top === 'habit'
          ? (() => {
              const h = a.habits.find(x => !x.broken && x.kind === 'social' && b.habits.some(y => y.id === x.id && !y.broken));
              const d = h && SETTING.habits.find(x => x.id === h.id);
              return (d as any)?.together ?? 'the same routines kept bringing them together';
            })()
          : top === 'group'
            ? 'they make music together'
            : top === 'hobby'
              ? hs.length
                ? `both live for ${SETTING.skillWords[hs[0]] ?? hs[0]}`
                : 'they share a passion'
              : top === 'sought'
                ? 'they kept seeking each other out'
                : top === 'public'
                  ? 'they kept running into each other in town'
                  : top === 'family'
                    ? 'they grew up around each other'
                    : '';
  return label ? [stateCause(label, 0.3)] : [];
}
// Friendships are checked every month, met or not: a pair who stop seeing each other drift apart, and the dead and departed are not kept as close friends.
// Losing touch ends a friendship, checked monthly (round 15); with the time budget off, only a falling-out does.
const FADE = () => !OFF.has('budget');
export function friendsTick(w: World) {
  if (!FADE()) return;
  for (const p of live(w))
    for (const id of [...p.friends]) {
      const q = w.byId.get(id);
      if (!q || q.status !== 'in') {
        p.friends.delete(id);
        if (q) q.friends.delete(p.id);
        continue;
      } // a friendship ends for both
      if (q.id > p.id) checkBond(w, p, q);
    }
}
// A person's five most familiar people outside the family, refreshed each month (round 19b).
function closest(w: World, p: Person): Set<number> {
  return ((w as any)._closest as Map<number, Set<number>> | undefined)?.get(p.id) ?? new Set();
}
function refreshClosest(w: World) {
  if (OFF.has('relbar')) return;
  const by = new Map<number, [number, number][]>();
  for (const [k, r] of w.bonds) {
    const a = bkA(w, k),
      b = bkB(w, k);
    if (r.fam < 0.1) continue;
    (by.get(a) ?? by.set(a, []).get(a)!).push([b, r.fam]);
  }
  const out = new Map<number, Set<number>>();
  for (const [a, list] of by) {
    const pa = w.byId.get(a);
    if (!pa) continue;
    out.set(
      a,
      new Set(
        list
          .filter(([b]) => {
            const q = w.byId.get(b);
            return !!q && q.status === 'in' && !family(pa, q) && pa.partner !== b;
          })
          .sort((x, y) => y[1] - x[1])
          .slice(0, 5)
          .map(([b]) => b),
      ),
    );
  }
  (w as any)._closest = out;
}
// How much familiarity alone adds to liking, where there is no real friction (Reis et al. 2011). Set from the literature, not tuned.
const EXPOSURE = 0.2;
// Below this much recent contact (about one meeting in five months), a friendship has lapsed (Roberts and Dunbar 2011).
const LOST_TOUCH = 0.08;
function checkBond(w: World, a: Person, b: Person) {
  if (age(w, a) < (OFF.has('school') ? 16 : 12) || age(w, b) < (OFF.has('school') ? 16 : 12) || family(a, b)) return; // friendships from twelve, among those who grow up together
  const ra = bond(w, a.id, b.id),
    rb = bond(w, b.id, a.id);
  const friends = a.friends.has(b.id);
  // A pair who have never fallen out are making friends for the first time, not making up.
  const cooledAt = Math.max(a.tried['cooled:' + b.id]?.t ?? -Infinity, b.tried['cooled:' + a.id]?.t ?? -Infinity);
  // A friendship that faded (they stopped seeing each other) is not a falling-out: coming back to it is not news, and not 'after everything'.
  const fadedAt = !FADE() ? -Infinity : Math.max(a.tried['faded:' + b.id]?.t ?? -Infinity, b.tried['faded:' + a.id]?.t ?? -Infinity);
  const again = w.t - cooledAt < 600;
  const bar = again ? 0.62 : 0.45;
  const near = !OFF.has('relbar') && Math.min(ra.fam, rb.fam) > 0.2 && closest(w, a).has(b.id) && closest(w, b).has(a.id); // each among the other's five most familiar outside the family
  if (
    !friends &&
    ra.like > bar &&
    rb.like > bar &&
    (ra.fam > 0.5 || near) &&
    a.partner !== b.id &&
    w.t - cooledAt > 36 &&
    (OFF.has('refade') || w.t - fadedAt > 36) && // round H25: a friendship that lapsed does not quietly come back within three years
    w.t - (a.tried['friends']?.t ?? -99) > 4 &&
    w.t - (b.tried['friends']?.t ?? -99) > 4
  ) {
    a.friends.add(b.id);
    b.friends.add(a.id);
    learned(w, a, 'friends', true);
    learned(w, b, 'friends', true);
    const nAgain = again ? Math.max(a.tried['madeup']?.n ?? 0, b.tried['madeup']?.n ?? 0) : 0;
    if (again) {
      learned(w, a, 'madeup', true);
      learned(w, b, 'madeup', true);
    }
    // A friendship that lapsed and comes back: quiet within five years, unless lapses are held off (round H25), when the page says so.
    const renewed = !again && !OFF.has('refade') && w.t - fadedAt < 600;
    const quiet = !again && !renewed && w.t - fadedAt < 60;
    if (nAgain < 2 && !quiet) {
      const e = addEvent(w, {
        type: again ? 'madeup' : 'friends',
        who: [a.id, b.id],
        text: again
          ? `@${a.id} and @${b.id} are close again, after everything.`
          : renewed
            ? `@${a.id} and @${b.id} picked up where they had left off.`
            : [
                `@${a.id} and @${b.id} became friends.`,
                `@${a.id} and @${b.id} have become friends.`,
                `@${a.id} and @${b.id} are friends now.`,
                `@${a.id} found a friend in @${b.id}.`,
              ][hash(w.seed, a.id, b.id, w.t) % 4],
        causes: [...memWhy(w, a, b, 1), ...memWhy(w, b, a, 1), ...howMet(w, a, b), ...chemWhy(w, a, b)].slice(0, 3),
        vis: 'local',
        evidence: [
          ev(a.id, 'sociability', 1, 0.3, 0.4),
          ev(b.id, 'sociability', 1, 0.3, 0.4),
          ev(a.id, 'bond:' + b.id, 1, 0.8, 0.8),
          ev(b.id, 'bond:' + a.id, 1, 0.8, 0.8),
          ...(again ? [ev(a.id, 'forgiveness', 1, 0.5, 0.5), ev(b.id, 'forgiveness', 1, 0.5, 0.5)] : []),
        ],
        w: again ? 1.3 : 1,
      });
      broadcast(w, e);
      addEmotion(w, a, 'friend' + b.id, 'a new friend', 0.06, 6, e.id);
      addEmotion(w, b, 'friend' + a.id, 'a new friend', 0.06, 6, e.id);
      resolveWants(w, a, 'belong', 'people', 'achieved', e.id);
      resolveWants(w, b, 'belong', 'people', 'achieved', e.id);
      resolveWants(w, a, 'restore', String(b.id), 'achieved', e.id);
      resolveWants(w, b, 'restore', String(a.id), 'achieved', e.id);
    }
  } else if (
    friends &&
    (ra.like < 0.02 ||
      rb.like < 0.02 ||
      (Math.min(ra.like, rb.like) < 0.12 && Math.min(ra.fam, rb.fam) < 0.35) ||
      (!OFF.has('budget') && Math.max((ra as any).recent ?? 0, (rb as any).recent ?? 0) < LOST_TOUCH))
  ) {
    const fellOut = !FADE() || ra.like < 0.02 || rb.like < 0.02;
    const mark = fellOut ? 'cooled:' : 'faded:';
    a.friends.delete(b.id);
    b.friends.delete(a.id);
    learned(w, a, mark + b.id, true);
    learned(w, b, mark + a.id, true);
    const [x, y] = ra.like < rb.like ? [a, b] : [b, a];
    const lost = !OFF.has('budget') && !fellOut && Math.min(ra.like, rb.like) >= 0.12; // still liked; they just stopped seeing each other
    const e = addEvent(w, {
      type: 'cooled',
      who: [a.id, b.id],
      text: lost
        ? [
            `@${a.id} and @${b.id} lost touch.`,
            `@${a.id} and @${b.id} stopped seeing each other, and that was that.`,
            `@${a.id} and @${b.id} drifted out of each other's lives.`,
          ][hash(w.seed, a.id, b.id, w.t) % 3]
        : `@${a.id} and @${b.id} drifted apart.`,
      causes: [
        ...memWhy(w, x, y, -1),
        ...(contexts(w, a, b).length ? [] : [stateCause('they stopped seeing each other', 0.3)]),
        ...chemWhy(w, x, y, -1).slice(0, 1),
      ].slice(0, 3),
      vis: 'local',
      evidence: [ev(a.id, 'bond:' + b.id, -1, 0.6, 0.7), ev(b.id, 'bond:' + a.id, -1, 0.6, 0.7)],
      w: 1,
    });
    broadcast(w, e);
    wantRestore(w, y, x, e.id); // the one who still cares may try to put it right
  }
  for (const [x, y, r] of [
    [a, b, ra],
    [b, a, rb],
  ] as const) {
    const key = 'hate' + y.id;
    const hates = x.emotions.some(e => e.k === key);
    if (!hates && r.like < -0.4 && r.fam > 0.45 && (x.tried['dislikes']?.n ?? 0) < 3 + (facet(x, 'gentleness') < -1 ? 2 : 0)) {
      learned(w, x, 'dislikes', true);
      addEmotion(w, x, key, `can't stand @${y.id}`, -0.03, 999);
      const e = addEvent(w, {
        type: 'dislike',
        who: [x.id],
        text: [
          `@${x.id} can't stand @${y.id}.`,
          `@${x.id} has no time for @${y.id} any more.`,
          `@${x.id} cannot be in a room with @${y.id} for long.`,
        ][hash(w.seed, x.id, y.id, w.t) % 3],
        causes: [...memWhy(w, x, y, -1), ...chemWhy(w, x, y, -1)].slice(0, 3),
        vis: 'private',
        evidence: [ev(x.id, 'forgiveness', -1, 0.5, 0.5)],
        w: 1.5,
      });
      broadcast(w, e);
    } else if (hates && r.like > -0.1) x.emotions = x.emotions.filter(e => e.k !== key);
  }
}
function memWhy(w: World, x: Person, y: Person, sign: number): Cause[] {
  const r = peekBond(w, x.id, y.id);
  if (!r) return [];
  const seen = new Set<string>();
  return r.mem
    .map(m => ({ m, v: (m.like + m.trust) * memWeight(x, m, w.t, y.id) }))
    .filter(o => sign * o.v > 0.08)
    .sort((p, q) => sign * (q.v - p.v))
    .map(o => ({ kind: 'event', label: `${o.m.text} (${year(o.m.t)})`, weight: 0.5, ref: o.m.ev }) as Cause)
    .filter(c => {
      if (seen.has(c.label)) return false;
      seen.add(c.label);
      return true;
    })
    .slice(0, 2);
}
function contexts(w: World, a: Person, b: Person): Cause[] {
  const out: Cause[] = [];
  if (a.job && a.job === b.job) out.push(stateCause(`they work together at ${w.placeById.get(a.job)!.name}`, 0.3));
  const hs = SETTING.hobbies.filter(h => a.skills[h]?.interest === 2 && b.skills[h]?.interest === 2);
  if (hs.length) out.push(stateCause(`both live for ${hs[0]}`, 0.3));
  return out;
}
function socialTick(w: World) {
  const L = live(w);
  const pairs = (arr: Person[], i: number) => {
    for (let a = 0; a < arr.length; a++) for (let b = a + 1; b < arr.length; b++) contact(w, arr[a], arr[b], i);
  };
  // Round 15: in a shared setting of more than four, a person's time is what three partners would get, shared by attention (Dunbar, Duncan and Nettle 1995).
  const all = (arr: Person[]) => {
    const o: [Person, Person][] = [];
    for (let a = 0; a < arr.length; a++) for (let b = a + 1; b < arr.length; b++) o.push([arr[a], arr[b]]);
    return o;
  };
  const budget = (ps: [Person, Person][], c: number) => {
    if (OFF.has('budget')) {
      for (const [a, b] of ps) contact(w, a, b, c);
      return;
    }
    const K = 3;
    const nb = new Map<number, Person[]>();
    for (const [a, b] of ps) {
      (nb.get(a.id) ?? nb.set(a.id, []).get(a.id)!).push(b);
      (nb.get(b.id) ?? nb.set(b.id, []).get(b.id)!).push(a);
    }
    const give = new Map<number, Map<number, number>>();
    for (const [id, qs] of nb) {
      const m = new Map<number, number>();
      if (qs.length <= K) for (const q of qs) m.set(q.id, c);
      else {
        const att = qs.map(q => 0.15 + Math.max(0, likeOf(w, id, q.id)) + 0.5 * (peekBond(w, id, q.id)?.fam ?? 0));
        const sum = att.reduce((x, y) => x + y, 0);
        qs.forEach((q, k) => m.set(q.id, (c * K * att[k]) / sum));
      }
      give.set(id, m);
    }
    for (const [a, b] of ps) {
      const i = ((give.get(a.id)!.get(b.id) ?? 0) + (give.get(b.id)!.get(a.id) ?? 0)) / 2;
      if (i >= 0.01) contact(w, a, b, i);
    }
  };
  channel = 'work';
  for (const pl of w.places) budget(all(L.filter(p => p.job === pl.id)), 1);
  channel = 'home';
  for (const p of L) {
    if (p.partner != null && p.id < p.partner && P(w, p.partner).status === 'in') contact(w, p, P(w, p.partner), 1.5);
    for (const k of p.kids) {
      const c = P(w, k);
      if (c.status === 'in') contact(w, p, c, age(w, c) < 20 ? 1.2 : 0.4);
    }
  }
  // School: those from six to eighteen who are not working spend each school day with others within two years of their age.
  channel = 'school';
  if (!OFF.has('school')) {
    const kids = L.filter(p => age(w, p) >= 6 && age(w, p) < 19 && !p.job);
    const ps: [Person, Person][] = [];
    for (let i = 0; i < kids.length; i++)
      for (let j = i + 1; j < kids.length; j++)
        if (Math.abs(age(w, kids[i]) - age(w, kids[j])) <= 2 && !family(kids[i], kids[j])) ps.push([kids[i], kids[j]]);
    budget(ps, 1);
  }
  channel = 'family';
  for (const p of L)
    if (p.parents.length)
      for (const q of L)
        if (q.id > p.id && family(p, q) && !p.parents.includes(q.id) && !q.parents.includes(p.id))
          contact(w, p, q, age(w, p) < 20 && age(w, q) < 20 ? 1 : 0.3);
  channel = 'hobby';
  for (const h of SETTING.hobbies) {
    let hs = L.filter(p => p.skills[h]?.interest === 2 && age(w, p) >= 14);
    if (hs.length > 6) hs = w.rng.shuffle(hs).slice(0, 6);
    budget(all(hs), 0.5);
  }
  channel = 'circle';
  for (const p of L)
    for (const id of p.circle) {
      const q = w.byId.get(id);
      if (q && q.status === 'in' && q.id > p.id) contact(w, p, q, 0.5);
    }
  channel = 'habit';
  if (OFF.has('budget')) for (const [a, b] of habitPairs(w)) contact(w, a, b, 0.4);
  else {
    const by = new Map<string, Person[]>();
    for (const p of L) for (const h of p.habits) if (!h.broken && h.kind === 'social') (by.get(h.id) ?? by.set(h.id, []).get(h.id)!).push(p);
    for (const [, ps] of by) budget(all(ps), 0.4);
  }
  channel = 'group';
  budget(groupPairs(w), 0.8);
  channel = 'sought';
  const adults = L.filter(p => age(w, p) >= 16);
  for (const p of adults) {
    const young = age(w, p) < 40;
    const n =
      Math.round(z01(facet(p, 'sociability')) * w.rng.next() * (young ? 4 : 2.5)) +
      (p.partner == null && young ? 1 : 0) +
      (pursuing(p, 'belong') ? 2 : 0);
    // Access: one pool for everyone, the adults near enough in age to spend time with (the same window the age check uses, so no draw is wasted).
    // How often a person seeks company (initiative) and whom they pick from the pool (preference, by regard) are decided separately.
    const pool = adults.filter(q => q !== p && Math.abs(age(w, q) - age(w, p)) < 12);
    // People seek out those they like and keep away from those they can't stand; the disliked are left more alone.
    const src = pool.length ? pool : adults;
    let kept = 0;
    // The weights are worked out once per person and kept up as they go: a contact changes only how p regards the one just met.
    let weights: [Person, number][] | null = null;
    for (let i = 0; i < n; i++) {
      if (!OFF.has('respond') && !weights) weights = src.map(q => [q, regardWeight(w, p.id, q.id, 1.5)] as [Person, number]);
      const q = OFF.has('respond') ? w.rng.pick(src) : w.rng.weighted(weights!);
      if (q !== p && Math.abs(age(w, q) - age(w, p)) < 12) {
        kept++;
        contact(w, p, q, 0.5);
        if (weights) for (const x of weights) if (x[0] === q) x[1] = regardWeight(w, p.id, q.id, 1.5);
        const sought = ((w.stats as any).sought ??= new Map<number, number>()) as Map<number, number>;
        sought.set(q.id, (sought.get(q.id) ?? 0) + 1);
      }
    }
    w.hooks.seek?.(w, p, n, kept, src.length);
  }
  channel = 'public';
  for (const pl of w.places)
    if (pl.people >= 0.8)
      for (const st of L.filter(p => p.job === pl.id))
        for (let i = 0; i < 3; i++) {
          const q = w.rng.pick(adults);
          if (q !== st) contact(w, st, q, 0.35);
        }
  for (const r of w.bonds.values()) {
    if (r.touched !== w.t) r.fam *= 0.993;
    if ((r as any).recent) (r as any).recent *= 0.89;
  }
  channel = '';
  refreshClosest(w);
  friendsTick(w);
  gossip(w);
}
function gossip(w: World) {
  const recent = recentEvents(w, w.t - 2).filter(e => e.vis !== 'private' && e.evidence.length);
  for (const e of recent)
    for (const [teller, how] of [...e.knownBy]) {
      if (how !== 'seen') continue;
      const tp = P(w, teller);
      if (tp.status !== 'in' || !w.rng.chance(0.25 * z01(facet(tp, 'sociability')))) continue;
      for (const l of [...friendsOf(w, tp), ...(tp.partner != null ? [P(w, tp.partner)] : [])]) {
        if (e.knownBy.has(l.id) || e.who.includes(l.id)) continue;
        e.knownBy.set(l.id, 'heard');
        const trust = (peekBond(w, l.id, tp.id)?.trust ?? 0) + 0.5;
        const bend = facet(tp, 'sincerity') < -0.8 ? w.rng.normal() * 0.5 : 0;
        tagObs('gossip');
        setObsEvent(e);
        for (const x of e.evidence) observe(w, l.id, { ...x, dir: x.dir + bend, reliability: x.reliability * clamp(trust, 0.2, 1) * 0.6 }, 'heard');
        setObsEvent(null);
        tagObs('act');
      }
    }
}

// ---------- romance and family ----------
function romanceTick(w: World) {
  const L = live(w);
  for (const p of L) {
    const a = age(w, p);
    if (p.partner != null) {
      if (p.id > p.partner) continue;
      const q = P(w, p.partner);
      if (q.status !== 'in') continue;
      const o1 = likeOf(w, p.id, q.id),
        o2 = likeOf(w, q.id, p.id),
        dur = w.t - p.psince;
      if (p.drinks) remember(w, q, p, -1, -0.03, -0.02, -0.03, 'the drinking');
      if (q.drinks) remember(w, p, q, -1, -0.03, -0.02, -0.03, 'the drinking');
      if (p.stress > 0.75) remember(w, q, p, -1, -0.015, 0, 0, 'always on edge');
      if (q.stress > 0.75) remember(w, p, q, -1, -0.015, 0, 0, 'always on edge');
      if (p.pstat === 'dating') {
        if (dur >= 10 && o1 > 0.5 && o2 > 0.5 && w.rng.chance(0.03 * (z01(p.values.lovedOnes) + z01(q.values.lovedOnes)))) {
          p.pstat = q.pstat = 'married';
          p.psince = q.psince = w.t;
          const e = addEvent(w, {
            type: 'married',
            who: [p.id, q.id],
            text: `@${p.id} and @${q.id} got married.`,
            causes: [stateCause(`together since ${year(p.psince - dur)}`, 0.5), { kind: 'bond', label: 'they had grown close', weight: 0.5 }],
            vis: 'public',
            evidence: [ev(p.id, 'bond:' + q.id, 1, 1, 0.8), ev(q.id, 'bond:' + p.id, 1, 1, 0.8)],
            w: 2,
          });
          broadcast(w, e);
          addEmotion(w, p, 'wed', 'newly married', 0.2, 18, e.id);
          addEmotion(w, q, 'wed', 'newly married', 0.2, 18, e.id);
          remember(w, p, q, e.id, 0.15, 0.1, 0.2, 'married');
          remember(w, q, p, e.id, 0.15, 0.1, 0.2, 'married');
          resolveWants(w, p, 'win', String(q.id), 'achieved', e.id);
          resolveWants(w, q, 'win', String(p.id), 'achieved', e.id);
        } else if (Math.min(o1, o2) < 0.15 && w.rng.chance(0.08)) split(w, p, q, false);
      } else if ((OFF.has('love') || OFF.has('leaving')) && Math.min(o1, o2) < 0 && w.rng.chance(0.025)) split(w, p, q, true); // with love.ts, ending a marriage is a decision (round 20b)
      continue;
    }
    if (a < 18 || a > 70 || !w.rng.chance(0.1)) continue;
    const cands: [Person, number][] = [];
    for (const q of L) {
      if (q === p || q.partner != null || age(w, q) < 18 || family(p, q) || !attracted(p, q) || !attracted(q, p)) continue;
      const ag = Math.abs(age(w, q) - a);
      if (ag > 7 + Math.min(a, age(w, q)) / 7) continue;
      const r1 = peekBond(w, p.id, q.id),
        r2 = peekBond(w, q.id, p.id);
      if (!r1 || !r2 || r1.like < 0.22 || r2.like < 0.18 || r1.fam < 0.08) continue;
      cands.push([q, (r1.like + r2.like) * (0.5 + z01(facet(p, 'socialBoldness')))]);
    }
    if (!cands.length || !w.rng.chance(0.35)) continue;
    const q = w.rng.weighted(cands);
    p.partner = q.id;
    q.partner = p.id;
    p.pstat = q.pstat = 'dating';
    p.psince = q.psince = w.t;
    (p as any).pairSince = (q as any).pairSince = w.t; // when this partnership began (words only: a couple's pattern dates from it)
    const e = addEvent(w, {
      type: 'dating',
      who: [p.id, q.id],
      text: `@${p.id} and @${q.id} started seeing each other.`,
      causes: [...contexts(w, p, q), ...chemWhy(w, p, q)]
        .slice(0, 3)
        .concat(contexts(w, p, q).length + chemWhy(w, p, q).length ? [] : [stateCause('they kept running into each other', 0.5)]),
      vis: 'local',
      evidence: [ev(p.id, 'bond:' + q.id, 1, 0.8, 0.8), ev(q.id, 'bond:' + p.id, 1, 0.8, 0.8)],
      w: 1,
    });
    broadcast(w, e);
    remember(w, p, q, e.id, 0.1, 0.05, 0.1, 'together');
    remember(w, q, p, e.id, 0.1, 0.05, 0.1, 'together');
    addEmotion(w, p, 'love', 'in love', 0.15, 6, e.id);
    addEmotion(w, q, 'love', 'in love', 0.15, 6, e.id);
  }
}
function split(w: World, p: Person, q: Person, married: boolean, leaver?: Person, why?: Cause[]) {
  const [lo, hi] = leaver ? (leaver === p ? [p, q] : [q, p]) : likeOf(w, p.id, q.id) < likeOf(w, q.id, p.id) ? [p, q] : [q, p];
  const causes: Cause[] = why ?? [
    { kind: 'bond', label: `@${lo.id} had stopped wanting it`, weight: 0.4, who: lo.id },
    ...memWhy(w, lo, hi, -1),
    ...chemWhy(w, lo, hi, -1).slice(0, 1),
  ];
  if (hi.drinks) causes.push(stateCause(`@${hi.id}'s drinking`, 0.5));
  const e = addEvent(w, {
    type: married ? 'divorce' : 'split',
    who: [p.id, q.id],
    text: married ? `@${p.id} and @${q.id} divorced.` : `@${p.id} and @${q.id} split up.`,
    causes: causes.slice(0, 4),
    vis: 'public',
    evidence: [ev(lo.id, 'bond:' + hi.id, -1, 1, 0.8), ev(hi.id, 'bond:' + lo.id, -1, 0.5, 0.6)],
    w: married ? 2.5 : 1.2,
  });
  broadcast(w, e);
  for (const [x, y] of [
    [p, q],
    [q, p],
  ] as const) {
    x.partner = null;
    x.pstat = null;
    remember(w, x, y, e.id, -0.15, 0, -0.1, 'the break-up');
    addEmotion(w, x, 'breakup', married ? 'divorced' : 'heartbroken', x === lo ? -0.06 : married ? -0.2 : -0.12, married ? 18 : 8, e.id);
    addStress(x, 'breakup', married ? 'the divorce' : 'the break-up', x === lo ? 0.05 : married ? 0.16 : 0.09, e.id);
    if (x !== lo) {
      loss(w, x, e.id, married ? 'the divorce' : 'the break-up');
      leftBy(w, x);
    }
  }
  resolveWants(w, p, 'win', String(q.id), 'failed', e.id);
  resolveWants(w, q, 'win', String(p.id), 'failed', e.id);
  if (!married && w.rng.chance(0.5)) wantRestore(w, hi, lo, e.id);
}
function familyTick(w: World) {
  for (const p of live(w)) {
    // Couples who have settled, married or living together for two years, may have children.
    if (p.partner != null && p.id < p.partner && (p.pstat === 'married' || w.t - p.psince >= 24)) {
      const q = P(w, p.partner);
      if (q.status !== 'in') continue;
      const adopt = p.sex === q.sex;
      const mom = adopt ? (age(w, p) < age(w, q) ? p : q) : p.sex === 'f' ? p : q;
      const ma = age(w, mom);
      if (ma < 20 || ma > 43) continue;
      const nk = p.kids.filter(k => q.kids.includes(k)).length;
      let base =
        [0.45, 0.32, 0.12, 0.035][Math.min(3, nk)] *
        (0.5 + z01(p.values.lovedOnes) * 0.5 + z01(q.values.lovedOnes) * 0.5) *
        (ma > 36 ? 0.5 : 1) *
        (adopt ? 0.35 : 1) *
        (p.pstat === 'married' ? 1 : 0.6);
      if (Math.min(likeOf(w, p.id, q.id), likeOf(w, q.id, p.id)) < 0.2) base *= 0.3;
      if (w.rng.chance(base / 12)) {
        const c = generatePerson(w, {
          age: adopt ? w.rng.int(0, 3) : 0,
          parents: adopt ? [] : [p.id, q.id],
          last: w.rng.chance(0.7) ? p.last : q.last,
          founder: false,
        });
        if (adopt) {
          c.parents = [p.id, q.id];
          c.born = w.t - w.rng.int(0, 36);
        } else c.born = w.t;
        p.kids.push(c.id);
        q.kids.push(c.id);
        const e = addEvent(w, {
          type: 'born',
          who: [c.id, p.id, q.id],
          text: adopt ? `@${p.id} and @${q.id} adopted @${c.id}.` : `@${c.id} was born to @${p.id} and @${q.id}.`,
          causes: [],
          vis: 'public',
          evidence: [],
          w: 2,
        });
        broadcast(w, e);
        addEmotion(w, p, 'baby', 'a new baby', 0.18, 12, e.id);
        addEmotion(w, q, 'baby', 'a new baby', 0.18, 12, e.id);
        resolveWants(w, p, 'create', 'child', 'achieved', e.id);
        resolveWants(w, q, 'create', 'child', 'achieved', e.id);
        for (const x of [p, q])
          if (!x.marks.some(m => m.key === 'parent')) {
            x.facets.organisation += 0.2 * plasticity(w, x);
            x.facets.patience += 0.15 * plasticity(w, x);
            x.marks.push({ t: w.t, key: 'parent', delta: 0.2, cause: e.id, text: 'steadier since becoming a parent' });
          }
      }
    }
    const m = w.t - p.born;
    if (m === 192) assignCircle(w, p);
    if (m === 204) {
      const brains = (p.aptitudes.reasoning + p.aptitudes.language + p.aptitudes.memory) / 3;
      if (brains > 0.3 || facet(p, 'inquisitiveness') > 0.8 || brains < -0.6) {
        const e = addEvent(w, {
          type: 'tell',
          who: [p.id],
          text:
            brains > 0.3
              ? `Everyone says @${p.id} is the clever one.`
              : brains < -0.6
                ? `@${p.id} has been struggling at school.`
                : `@${p.id} reads everything ${p.sex === 'f' ? 'she' : 'he'} can get hold of.`,
          causes: [stateCause(brains > 0.3 ? 'top of the class' : brains < -0.6 ? 'bottom of the class' : 'curious about everything', 1)],
          vis: 'public',
          evidence: [
            ev(p.id, 'inquisitiveness', brains > 0.3 || facet(p, 'inquisitiveness') > 0.8 ? 1 : -1, 0.7, 0.6),
            ev(p.id, 'want:study', brains > 0.3 ? 1 : -1, 1, 0.6),
          ],
          w: 0.5,
        });
        broadcast(w, e);
      }
    }
    if (m === 216) {
      const brains = (p.aptitudes.reasoning + p.aptitudes.language + p.aptitudes.memory) / 3;
      const opts: Option[] = [
        {
          id: 'study',
          label: 'leave for university',
          considerations: [
            pubC('brains', brains > 0.3 ? 'did well at school' : 'school was a struggle', z01(brains * 1.5)),
            facetC(p, 'inquisitiveness', NONE, 1, 7),
            attachC(p, -1),
          ],
        },
        { id: 'stay', label: `stay in ${SETTING.name}`, considerations: [valueC(p, 'tradition', 1, 6), attachC(p, 1)] },
      ];
      const d = decide(w, p, 'turning eighteen', opts);
      if (d.chosen === 'study') leaveTown(w, p, 'study', `@${p.id} left for university in the city.`, d.why, d.rec);
      else {
        const e = addEvent(w, {
          type: 'stayed',
          who: [p.id],
          text: `@${p.id} turned eighteen and stayed in ${SETTING.name}.`,
          causes: d.why,
          vis: 'local',
          decision: d.rec,
          evidence: [ev(p.id, 'sentimentality', 1, 0.5, 0.5)],
          w: 0.7,
        });
        broadcast(w, e);
      }
    }
  }
}

// ---------- stress: build and relief (the leaks and breaks live in the grammar) ----------
function stressTick(w: World, p: Person) {
  const a = age(w, p);
  for (const k in p.sources) {
    p.sources[k].v *= 0.9;
    if (p.sources[k].v < 0.004) delete p.sources[k];
  }
  p.emotions = p.emotions.filter(e => e.until > w.t);
  if (p.phase && p.phase.until <= w.t) p.phase = undefined;
  if (a < 14) {
    p.stress *= 0.95;
    return;
  }
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (pl) {
    const soc = Math.max(0, -facet(p, 'sociability'));
    if (pl.people * soc > 0.3) addStress(p, 'fit', `dealing with people all day at ${pl.name}`, pl.people * soc * 0.03);
    if (p.values.success > 0.8 && !p.lead && w.t - p.jobSince > 48) addStress(p, 'stuck', 'years without a step up', 0.02 * z01(p.values.success));
    if (pl.lead != null && pl.lead !== p.id && Math.min(likeOf(w, pl.lead, p.id), likeOf(w, p.id, pl.lead)) < -0.2)
      addStress(p, 'boss', `bad terms with @${pl.lead}`, 0.025);
    if (p.lead) addStress(p, 'resp', `the weight of being ${pl.title}`, 0.012 * (1 - 0.3 * facet(p, 'organisation')));
    if (p.perf < -0.4) addStress(p, 'comp', `struggling with the work at ${pl.name}`, 0.014 * (1 + z01(p.values.success)));
    if (pl.lead != null && pl.lead !== p.id && p.values.freedom > 0.6 && facet(P(w, pl.lead), 'organisation') > 1)
      addStress(p, 'auto', `being told how to do everything by @${pl.lead}`, 0.014);
  } else if (!p.retired && !p.student && !p.givenUp && a >= 18 && a < 63) {
    addStress(p, 'jobless', 'out of work', 0.012 + 0.015 * z01(p.values.success));
    p.joblessMonths = (p.joblessMonths ?? 0) + 1;
    if (p.joblessMonths >= 30 && w.rng.chance(0.06)) {
      const opts: Option[] = [
        {
          id: 'giveup',
          label: 'stop looking',
          considerations: [
            facetC(p, 'diligence', NONE, -1),
            pubC('years', `${Math.round(p.joblessMonths / 12)} years without work`, clamp(p.joblessMonths / 60, 0, 1)),
          ],
        },
        { id: 'keep', label: 'keep trying', considerations: [facetC(p, 'diligence', NONE, 1), valueC(p, 'success', 1, 4)] },
      ];
      const d = decide(w, p, 'years without work', opts);
      if (d.chosen === 'giveup') {
        p.givenUp = true;
        const e = addEvent(w, {
          type: 'gaveup',
          who: [p.id],
          text: `@${p.id} stopped looking for work.`,
          causes: d.why,
          vis: 'local',
          decision: d.rec,
          evidence: [ev(p.id, 'diligence', -1, 0.8, 0.7)],
          w: 1.2,
        });
        broadcast(w, e);
      }
    }
  }
  if (p.savings < 0) addStress(p, 'money', 'money worries', 0.025);
  const fr = friendsOf(w, p).length;
  if (facet(p, 'sociability') > 0.3 && fr === 0 && p.partner == null) addStress(p, 'lonely', 'loneliness', 0.02 + 0.015 * facet(p, 'sociability'));
  if (a >= 24 && p.partner == null && fr === 0) addStress(p, 'alone', 'no one close', 0.01);
  if (p.partner != null && likeOf(w, p.id, p.partner) < 0.05) addStress(p, 'home', `trouble at home with @${p.partner}`, 0.025);
  if (p.ill) addStress(p, 'ill', 'illness', 0.012);
  let rl =
    0.025 * (1 + 0.2 * facet(p, 'patience')) +
    0.006 * Object.values(p.skills).filter(s => s.interest === 2).length +
    Math.min(0.015, fr * 0.005) +
    (p.drinks ? 0.015 : 0) +
    (p.retired ? 0.008 : 0) +
    habitRelief(p);
  if (p.partner != null && likeOf(w, p.id, p.partner) > 0.4) rl += 0.012;
  if (facet(p, 'dependence') > 0.8 && (fr > 0 || p.partner != null)) rl += 0.008;
  p.stress = clamp(p.stress - rl, 0, 1);
  if (
    p.drinks &&
    w.rng.chance(
      0.01 * (1 + 0.5 * facet(p, 'organisation')) + (p.partner != null && likeOf(w, p.id, p.partner) > 0.5 ? 0.01 : 0) + (p.ill ? 0.03 : 0),
    )
  ) {
    p.drinks = false;
    const e = addEvent(w, {
      type: 'sober',
      who: [p.id],
      text: `@${p.id} stopped drinking.`,
      causes: [
        p.ill ? stateCause('frightened by their own health', 0.5) : stateCause('', 0),
        ...(p.partner != null && likeOf(w, p.id, p.partner) > 0.5
          ? [{ kind: 'bond', label: `for @${p.partner}`, weight: 0.4, who: p.partner } as Cause]
          : []),
        traitCause(p, 'organisation', 0.3, 1),
      ].filter(c => c.label),
      vis: 'local',
      evidence: [ev(p.id, 'organisation', 1, 0.7, 0.6)],
      w: 1.5,
    });
    broadcast(w, e);
    addEmotion(w, p, 'sober', 'sober, and proud of it', 0.08, 12, e.id);
  }
}

// ---------- money, wants, migration ----------
function moneyTick(w: World, p: Person) {
  const a = age(w, p);
  if (a < 18) return;
  let inc = 0;
  if (p.job) inc = w.placeById.get(p.job)!.pay + (p.lead ? 0.8 : 0);
  else if (p.retired) inc = 1.3;
  else if (!p.student) inc = 0.8;
  const saving = p.wants.find(x => !x.done && x.pursuit && !x.pursuit.owner && (x.kind === 'acquire' || x.kind === 'escape'));
  const cost =
    1.55 +
    (p.kids.filter(k => P(w, k).status === 'in' && age(w, P(w, k)) < 18).length * 0.45) / (p.partner != null ? 2 : 1) +
    (p.drinks ? 0.3 : 0) -
    (p.partner != null ? 0.25 : 0) -
    (facet(p, 'greedAvoidance') > 0.8 ? 0.1 : 0) +
    (facet(p, 'prudence') < -0.8 ? 0.2 : 0) -
    (saving ? 0.3 * saving.pursuit!.effort : 0);
  p.savings += inc + (steering() ? extraPay(p) : 0) - cost;
  // Nobody is lent without limit: a jobless household cuts back long before it is a hundred months in the red.
  if (p.savings < -12) {
    p.savings += (-12 - p.savings) * 0.3;
    if (p.savings < -40) p.savings = -40;
  }
}
function wantTick(w: World, p: Person) {
  const a = age(w, p);
  const esc = p.wants.find(x => x.kind === 'escape' && !x.done && !x.pursuit);
  if (esc && w.rng.chance(0.06) && (p.tried['tell:leave']?.n ?? 0) < 1) {
    learned(w, p, 'tell:leave', true);
    const e = addEvent(w, {
      type: 'tell',
      who: [p.id],
      text: `@${p.id} has been talking about the city a lot lately.`,
      causes: [
        { kind: 'want', label: `wants out of ${SETTING.name} (since ${year(esc.since)})`, weight: 0.6, key: 'escape', who: p.id },
        traitCause(p, 'inquisitiveness', 0.4, 1),
      ],
      vis: 'local',
      evidence: [
        ev(p.id, 'inquisitiveness', 1, 0.6, 0.6),
        ev(p.id, 'attach:home', -1, 0.5, 0.5),
        ev(p.id, 'value:' + esc.value, 1, 0.8, 0.6),
        ev(p.id, 'want:escape', 1, 1, 0.7),
      ],
      w: 0.6,
    });
    broadcast(w, e);
  }
  if (a < 18 || !w.rng.chance(0.08)) return;
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (p.coreValues.includes('success') && pl && !p.lead && w.t - p.jobSince > 24) addWant(w, p, 'attain', pl.id, 'success', 0.6);
  if (p.coreValues.includes('success') && !pl && !p.retired && a < 60) addWant(w, p, 'attain', 'work', 'success', 0.8);
  const lastWith = (type: string, q: number | null) =>
    q == null
      ? undefined
      : p.events
          .slice()
          .reverse()
          .find(i => w.events[i].type === type && w.events[i].who.includes(q));
  if (p.coreValues.includes('lovedOnes') && p.partner != null && p.pstat === 'married' && p.kids.length === 0 && a < 40)
    addWant(w, p, 'create', 'child', 'lovedOnes', 0.5, lastWith('married', p.partner));
  if (p.coreValues.includes('lovedOnes') && p.partner != null && p.pstat === 'dating')
    addWant(w, p, 'win', String(p.partner), 'lovedOnes', 0.5, lastWith('dating', p.partner));
  if ((p.coreValues.includes('freedom') || p.coreValues.includes('thrill')) && a < 32 && p.partner == null)
    addWant(w, p, 'escape', 'elsewhere', p.coreValues.includes('freedom') ? 'freedom' : 'thrill', 0.4);
}
export function leaveTown(w: World, p: Person, kind: string, text: string, why: Cause[], rec?: any) {
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (pl && pl.lead === p.id) pl.lead = null;
  p.job = null;
  p.lead = false;
  // A partner and children are not left behind in silence. Either the household goes (the more they like each other and the less the
  // partner is rooted here, the likelier), or the one who stays is left, and knows it.
  const minors = p.kids.map(k => P(w, k)).filter(k => k.status === 'in' && age(w, k) < 18);
  let tail = '';
  if (OFF.has('household') && p.partner != null && kind !== 'study') {
    const q = P(w, p.partner);
    q.partner = null;
    q.pstat = null;
    p.partner = null;
    p.pstat = null;
  } else if (p.partner != null && kind !== 'study' && kind !== 'family') {
    const q = P(w, p.partner);
    const mutual = Math.min(likeOf(w, p.id, q.id), likeOf(w, q.id, p.id));
    const together = w.rng.chance(clamp(0.45 + 0.5 * mutual - 0.35 * homeOf(q).like, 0.05, 0.95));
    if (together) {
      for (const k of minors) {
        k.status = 'away';
        k.awayKind = 'family';
        k.awaySince = w.t;
      }
      leaveTown(w, q, 'family', '', [], undefined);
      tail = minors.length ? ` @${q.id} and the children went too.` : ` @${q.id} went too.`;
    } else {
      q.partner = null;
      q.pstat = null;
      p.partner = null;
      p.pstat = null;
      tail = ` @${q.id}${minors.length ? ' and the children' : ''} stayed, and that was the end of the marriage.`;
      remember(w, q, p, w.events.length, -0.35, -0.2, -0.35, 'left me');
      remember(w, p, q, w.events.length, -0.1, 0, -0.1, 'would not come');
      addStress(q, 'left', `@${p.id} left`, 0.14);
      leftBy(w, q);
      addEmotion(w, q, 'left', `left by @${p.id}`, -0.2, 18);
    }
  } else if (
    !OFF.has('household') &&
    kind !== 'study' &&
    kind !== 'family' &&
    minors.length &&
    !minors.some(k => k.parents.some(pa => pa !== p.id && P(w, pa).status === 'in'))
  ) {
    for (const k of minors) {
      k.status = 'away';
      k.awayKind = 'family';
      k.awaySince = w.t;
    }
    tail = ' The children went too.';
  }
  p.status = 'away';
  p.awayKind = kind;
  p.awaySince = w.t;
  p.student = kind === 'study';
  for (const h of p.habits)
    if (!h.broken) {
      h.broken = w.t;
      h.breakWhy = 'left town';
    } // routines stay behind
  if (kind === 'family') return; // the household's move is one event, the mover's
  const hl = homeOf(p).like;
  const e = addEvent(w, {
    type: 'left',
    who: [p.id, ...(p.partner != null && P(w, p.partner).status === 'away' ? [p.partner] : [])],
    text: text.replace(/\.$/, '') + '.' + tail,
    causes: why,
    vis: 'public',
    decision: rec,
    evidence: [
      ev(p.id, 'inquisitiveness', 1, 0.5, 0.5),
      ...(hl < 0 ? [ev(p.id, 'attach:home', -1, 0.6, 0.6)] : hl > 0.3 ? [ev(p.id, 'attach:home', 1, 0.3, 0.4)] : []),
    ],
    w: 2,
  });
  broadcast(w, e);
  for (const q of friendsOf(w, p)) addEmotion(w, q, 'miss' + p.id, `misses @${p.id}`, -0.05, 6, e.id);
  const home = homeOf(p);
  if (home.like > 0.35) {
    addEmotion(w, p, 'homesick', 'homesick', -0.1 * home.like, 18, e.id);
    addStress(p, 'homesick', 'missing home', 0.06, e.id);
  }
  resolveWants(w, p, 'escape', 'elsewhere', 'achieved', e.id);
  // Whoever said they'd go too has to decide now.
  if (kind !== 'study')
    for (const q of live(w)) {
      const y = q.wants.find(x => !x.done && x.kind === 'escape' && x.pursuit?.owner === p.id);
      if (!y) continue;
      const tied = q.partner != null || q.kids.some(k => P(w, k).status === 'in' && age(w, P(w, k)) < 18);
      const d = decide(w, q, `@${p.id} is leaving`, [
        {
          id: 'go',
          label: 'go too',
          considerations: [
            pubC('bond', `would follow @${p.id} anywhere`, (likeOf(w, q.id, p.id) + 1) / 2),
            facetC(q, 'dependence', NONE, 1, 4),
            attachC(q, -1),
          ],
        },
        {
          id: 'stay',
          label: 'stay after all',
          considerations: [
            pubC('ties', tied ? 'people here depend on them' : 'nobody here depends on them', tied ? 0.9 : 0.2),
            attachC(q, 1),
            facetC(q, 'fearfulness', NONE, 1, 3),
          ],
        },
      ]);
      if (d.chosen === 'go') {
        y.done = 'achieved';
        y.doneAt = e.id;
        leaveTown(
          w,
          q,
          'work',
          `@${q.id} went with @${p.id}, as ${q.sex === 'f' ? 'she' : 'he'} had said ${q.sex === 'f' ? 'she' : 'he'} would.`,
          [eventCause(w, e.id, 0.5), ...d.why.slice(0, 2)],
          d.rec,
        );
      } else {
        y.done = 'abandoned';
        y.doneAt = e.id;
        const e2 = addEvent(w, {
          type: 'stayed',
          who: [q.id, p.id],
          text: `When it came to it, @${q.id} stayed and let @${p.id} go alone.`,
          causes: d.why.slice(0, 3),
          vis: 'local',
          decision: d.rec,
          evidence: [ev(q.id, 'attach:home', 1, 0.6, 0.6)],
          w: 1.4,
        });
        broadcast(w, e2);
        remember(w, p, q, e2.id, -0.1, -0.1, -0.15, "said they would come, and didn't");
      }
    }
}
function comeHome(w: World, p: Person, text: string, why: Cause[], rec?: any) {
  const yrs = Math.max(1, Math.round((w.t - p.awaySince!) / 12));
  for (const sk of ['writing', 'bookkeeping', 'care', 'teaching'])
    if (p.skills[sk]) p.skills[sk].r = Math.max(p.skills[sk].r, Math.min(p.skills[sk].ceil, 1100 + yrs * 40 * (p.awayKind === 'study' ? 1.5 : 1)));
  p.status = 'in';
  p.student = false;
  p.stress = clamp(p.stress - 0.1, 0, 1);
  p.emotions = p.emotions.filter(e => e.k !== 'homesick');
  delete p.sources['homesick'];
  // The household that went together comes back together.
  for (const id of [...(p.partner != null ? [p.partner] : []), ...p.kids]) {
    const q = P(w, id);
    if (q.status === 'away' && q.awayKind === 'family') {
      q.status = 'in';
      q.student = false;
    }
  }
  // Years away often end with someone met there, who comes too.
  let brought: Person | null = null;
  if (p.partner == null && age(w, p) >= 25 && age(w, p) <= 45 && yrs >= 3 && w.rng.chance(0.4)) {
    const q = generatePerson(w, {
      age: Math.max(22, age(w, p) + w.rng.int(-4, 4)),
      sex: p.attraction === 'both' ? (w.rng.chance(0.5) ? 'f' : 'm') : p.attraction,
      founder: true,
    });
    q.attraction = q.attraction === 'both' ? 'both' : p.sex;
    settleIn(w, q);
    p.partner = q.id;
    q.partner = p.id;
    p.pstat = q.pstat = w.rng.chance(0.5) ? 'married' : 'dating';
    p.psince = q.psince = w.t - 12 * w.rng.int(1, Math.min(yrs, 6));
    for (const [x, y] of [
      [p, q],
      [q, p],
    ] as const) {
      const r = bond(w, x.id, y.id);
      r.fam = 1;
      r.like = 0.45 + w.rng.next() * 0.3;
      r.trust = 0.4;
      r.respect = 0.2;
    }
    brought = q;
  }
  const e = addEvent(w, {
    type: 'home',
    who: [p.id, ...(brought ? [brought.id] : [])],
    text:
      (text || `@${p.id} came back to ${SETTING.name} after ${yrs} year${yrs > 1 ? 's' : ''} away`).replace(/\.$/, '') +
      (brought ? `, and brought @${brought.id} too.` : '.'),
    causes: why,
    vis: 'public',
    decision: rec,
    evidence: [ev(p.id, 'attach:home', 1, 0.8, 0.7), ev(p.id, 'sentimentality', 1, 0.5, 0.6)],
    w: 2,
  });
  broadcast(w, e);
  // Old routines come back first, if they were loved.
  for (const h of p.habits
    .filter(h => h.breakWhy === 'left town')
    .sort((a, b) => b.adherence - a.adherence)
    .slice(0, 2))
    if (w.rng.chance(0.6)) {
      h.broken = undefined;
      h.since = w.t;
      h.from = 'picked up where they left off';
    }
}
function maybeHomeForFuneral(w: World, c: Person, p: Person, ref: number) {
  const opts: Option[] = [
    { id: 'home', label: 'come home and stay', considerations: [attachC(c, 1), valueC(c, 'lovedOnes')] },
    { id: 'back', label: 'go back to the city after the funeral', considerations: [valueC(c, 'success'), attachC(c, -1)] },
  ];
  const d = decide(w, c, 'a parent’s funeral', opts);
  if (d.chosen === 'home') comeHome(w, c, `@${c.id} came home for @${p.id}'s funeral and stayed.`, [eventCause(w, ref, 0.5), ...d.why], d.rec);
}
function migrationTick(w: World) {
  for (const p of w.people) {
    if (p.status !== 'away') continue;
    const yrs = (w.t - p.awaySince!) / 12;
    const oldParent = p.parents.map(k => P(w, k)).find(q => q.status === 'in' && (age(w, q) > 72 || q.ill > 0));
    const home = homeOf(p);
    const pull = 0.3 + 1.4 * z01(home.like * 2.2);
    // People who left to study think of home most around the age of settling down; a want for family pulls hardest.
    const settling = age(w, p) >= 26 && age(w, p) <= 38 ? 1.6 + 0.6 * z01(p.values.lovedOnes) : 1;
    let c = p.awayKind === 'study' ? (yrs >= 3 ? 0.02 * pull * settling : 0) : 0.005 * pull;
    if (oldParent) c *= 2.5;
    if (p.awayKind !== 'study' && yrs < 1.5) c = 0;
    if (home.like < 0 && !oldParent && p.awayKind !== 'study') c = 0; // nobody comes home for nothing
    if (w.t - (p.tried['stayaway']?.t ?? -99) < (oldParent ? 18 : 48)) c = 0; // a decision to stay holds for years
    if (!w.rng.chance(c)) continue;
    const opts: Option[] = [
      {
        id: 'home',
        label: 'come home',
        considerations: [
          attachC(p, 1),
          pubC('parent', oldParent ? `@${oldParent.id} is getting old` : 'parents are fine', oldParent ? 0.9 : 0.3),
          valueC(p, 'lovedOnes', 1, 4),
        ],
      },
      { id: 'stay', label: 'stay away', considerations: [valueC(p, 'success'), facetC(p, 'inquisitiveness', NONE, 1, 4, 0.55), attachC(p, -1)] },
    ];
    const d = decide(w, p, 'thinking of home', opts);
    if (d.chosen === 'home') comeHome(w, p, '', [...(p.awayKind === 'study' ? [stateCause('finished studying', 0.3)] : []), ...d.why], d.rec);
    else learned(w, p, 'stayaway', true);
  }
  const adults = live(w).filter(p => age(w, p) >= 18).length;
  if (adults < 42 && w.rng.chance(0.04)) {
    const open = w.places.filter(pl => live(w).filter(q => q.job === pl.id).length < pl.cap);
    if (open.length) newcomer(w, w.rng.pick(open));
  }
}

// ---------- yearly: maturing, aptitude ageing, credit ----------
function yearly(w: World) {
  for (const pl of w.places) {
    const lead = pl.lead != null ? P(w, pl.lead) : null;
    if (!lead) continue;
    const staff = live(w).filter(q => q.job === pl.id && q !== lead);
    if (staff.length < 2) continue;
    const best = staff.slice().sort((a, b) => b.perf - a.perf)[0];
    if (best.perf > 0.6 && w.rng.chance(0.35) && w.t - (best.tried['praised']?.t ?? -99) > 36 && w.t - (lead.tried['credited']?.t ?? -99) > 24) {
      learned(w, best, 'praised', true);
      learned(w, lead, 'credited', true);
      const warm = facet(lead, 'gentleness') + 0.5 * facet(lead, 'modesty') + w.rng.normal() * 0.5 * lead.variability > -0.3;
      if (warm) {
        const e = addEvent(w, {
          type: 'credit',
          who: [lead.id, best.id],
          text: `@${lead.id} made sure everyone knew @${best.id} had carried ${pl.name} that year.`,
          causes: [stateCause(`@${best.id}'s work had been strong all year`, 0.6), traitCause(lead, 'gentleness', 0.4, 1)],
          vis: 'local',
          evidence: [ev(best.id, 'diligence', 1, 0.9, 0.75), ev(best.id, 'skill:' + pl.skill, 1, 0.8, 0.7), ev(lead.id, 'gentleness', 1, 0.6, 0.6)],
          w: 1,
        });
        broadcast(w, e);
        addEmotion(w, best, 'praised', 'recognised', 0.1, 6, e.id);
        remember(w, best, lead, e.id, 0.15, 0.1, 0.1, 'gave me credit');
      } else {
        const e = addEvent(w, {
          type: 'nocredit',
          who: [lead.id, best.id],
          text: `@${lead.id} took the credit for a year that @${best.id} had carried.`,
          causes: [traitCause(lead, 'modesty', 0.6, -1), stateCause(`@${best.id}'s work had been strong all year`, 0.4)],
          vis: 'local',
          evidence: [ev(lead.id, 'modesty', -1, 1, 0.8), ev(best.id, 'diligence', 1, 0.6, 0.6)],
          w: 1.2,
        });
        broadcast(w, e);
        remember(w, best, lead, e.id, -0.3, -0.2, -0.2, 'took the credit for my work');
      }
    }
  }
  for (const p of w.people) {
    if (p.status === 'dead') continue;
    const a = age(w, p);
    // Maturing: the direction the research finds, scaled by how much life still moves this person.
    if (a >= 20 && a <= 60) {
      const k = plasticity(w, p);
      p.facets.organisation += 0.015 * k;
      p.facets.patience += 0.012 * k;
      p.facets.forgiveness += 0.01 * k;
      p.facets.anxiety -= 0.01 * k;
    }
    for (const ap of [
      ['physique', 26, 0.045],
      ['reasoning', 22, 0.03],
      ['memory', 30, 0.025],
      ['dexterity', 27, 0.03],
      ['ear', 25, 0.02],
    ] as const)
      if (a > ap[1]) p.aptitudes[ap[0]] -= ap[2];
    for (const ap of [
      ['language', 55, 0.02],
      ['socialInsight', 48, 0.02],
      ['presence', 45, 0.01],
    ] as const)
      if (a < ap[1]) p.aptitudes[ap[0]] += ap[2];
      else p.aptitudes[ap[0]] -= ap[2] * 0.5;
    for (const sk in p.skills) p.skills[sk].ceil = ceilingFor(p, sk);
  }
}
