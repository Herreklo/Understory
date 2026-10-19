// Work: performance, hiring, firing, promotion, newcomers, retirement, and skills.

import { SETTING } from './setting';
import {
  type Cause,
  type Person,
  type World,
  titleAt,
  OFF,
  age,
  live,
  P,
  facet,
  bond,
  likeOf,
  addEvent,
  broadcast,
  addStress,
  addEmotion,
  year,
} from './world';
import { hoodOf, hoods, idx, jobSet, jobless, moved, staffOf } from './scale';
import { witnessView, truthView, z01 } from './decide';
import { generatePerson } from './generate';
import { regard } from './regard';
import { contestLost, judgement, loss } from './situations/raised';
import { friendsOf, family } from './grammar';
import { traitCause, stateCause, ev } from './considerations';
import { steering, backing } from './steer';
import { dueToStepDown, contest, settle, grudge } from './drama';
import { practise, resolveWants, pursuing, formHabits } from './time';
import type { Feature } from './features';
import * as MX from './mathx';

function perfRaw(w: World, p: Person, sk: string): number {
  const r = p.skills[sk]?.r ?? 1000;
  let z = (r - 1150) / 150 + 0.35 * facet(p, 'diligence') + 0.2 * facet(p, 'organisation') + (p.health - 0.75) * 1.2;
  if (p.drinks) z -= 0.6;
  if (p.stress > 0.6) z -= (p.stress - 0.6) * 1.5;
  if (p.ill) z -= 1;
  return z + w.rng.normal() * 0.35 * p.variability;
}
export function workTick(w: World) {
  const L = live(w);
  for (const pl of w.places) {
    if (pl.lead != null && (P(w, pl.lead).job !== pl.id || P(w, pl.lead).status !== 'in')) pl.lead = null;
    const staff = hoods(w) === 1 ? L.filter(p => p.job === pl.id) : staffOf(w, pl.id).slice(); // a city reads the staff list
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
      const left = hoods(w) === 1 ? L.filter(p => p.job === pl.id) : staffOf(w, pl.id).slice();
      if (left.length) promote(w, pl, left);
    } else if (pl.lead == null && staff.length) promote(w, pl, staff);
    hire(w, pl);
  }
  for (const p of L) if (!p.job && !p.retired && age(w, p) >= 65) p.retired = true;
  for (const p of L) if (p.job && age(w, p) >= 62 && w.rng.chance(0.012 + (age(w, p) >= 67 ? 0.12 : 0) + (p.health < 0.5 ? 0.03 : 0))) retire(w, p);
}
function fire(w: World, s: Person, pl: any) {
  const ref = w.events.length - 1;
  jobSet(w, s, null);
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
    text: `@${win.id} became ${titleAt(pl)}.`,
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
  const city = hoods(w) > 1;
  const L = city ? null : live(w);
  if ((L ? L.filter(p => p.job === pl.id) : staffOf(w, pl.id)).length >= pl.cap) {
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
  // A city's job seekers are its jobless and those after a post elsewhere, from lists kept for the month, not a walk past everyone.
  let cands = (L ?? cityLookers(w, looking))
    .filter(p => (!p.job || looking(p)) && !p.retired && !p.student && !p.givenUp && age(w, p) >= 18 && age(w, p) < 63 && p.quitFrom !== pl.id)
    .filter(p => {
      if (!lead || pl.vac > 12) return true;
      const b = w.beliefs.get(lead.id)?.get(`${p.id}|diligence`);
      return !(b && b.n >= 2 && b.m < -0.4);
    });
  if (!cands.length) {
    if (pl.vac > 6 && w.rng.chance(0.3)) newcomer(w, pl);
    return;
  }
  if (city) {
    // a city's workplace takes on people from its own neighbourhood first, as a background one does
    const h = idx(w).placeHood.get(pl.id);
    const local = cands.filter(c => hoodOf(w, c) === h);
    if (local.length) cands = local;
    // and a vacancy hears from some of its job seekers, not all
    if (cands.length > 24) {
      const pick: Person[] = [];
      const seen = new Set<number>();
      while (pick.length < 24) {
        const i = w.rng.int(0, cands.length - 1);
        if (!seen.has(i)) {
          seen.add(i);
          pick.push(cands[i]);
        }
      }
      cands = pick.sort((a, b) => a.id - b.id);
    }
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
  jobSet(w, c, pl.id);
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
// Everyone in town who is jobless or after a post elsewhere, in a city: one walk a month, then kept current by the job lists.
const LOOKERS = new WeakMap<World, { t: number; list: Person[] }>();
function cityLookers(w: World, looking: (p: Person) => boolean): Person[] {
  let c = LOOKERS.get(w);
  if (!c || c.t !== w.t) LOOKERS.set(w, (c = { t: w.t, list: idx(w).live.filter(p => p.job != null && looking(p)) }));
  return [...jobless(w), ...c.list];
}
export function assignCircle(w: World, p: Person) {
  const others = (hoods(w) === 1 ? live(w) : idx(w).hood[hoodOf(w, p)]).filter(q => q !== p && !family(p, q) && Math.abs(age(w, q) - age(w, p)) < 15);
  p.circle = w.rng
    .shuffle(others)
    .slice(0, 3 + w.rng.int(0, 2))
    .map(q => q.id);
}
// Someone moves to town for a job. About a third of those in their late twenties and thirties bring a family: small towns live on that.
export function newcomer(w: World, pl: any) {
  const a = 23 + Math.floor(MX.pow(w.rng.next(), 1.5) * 20); // mostly young: the jobs that go begging in a small town draw people starting out
  const p = generatePerson(w, { age: a, founder: true });
  settleIn(w, p);
  p.skills[pl.skill].r = 1250 + w.rng.next() * 200;
  p.savings = 5 + w.rng.next() * 10;
  jobSet(w, p, pl.id);
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
export function settleIn(w: World, p: Person) {
  if (age(w, p) >= 14) assignCircle(w, p);
  p.attachments.push({ key: 'home', label: SETTING.name, like: -0.2, since: w.t });
  p.facets['attach:home'] = -0.4;
  if (age(w, p) >= 16) formHabits(w, p, 1 + w.rng.int(0, 2), 'always has');
}
function retire(w: World, p: Person) {
  const pl = w.placeById.get(p.job!)!;
  const yrs = Math.round((w.t - p.jobSince) / 12);
  if (pl.lead === p.id) pl.lead = null;
  jobSet(w, p, null);
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
export function skillTick(w: World, p: Person) {
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
