// Aftermath (round 34): a blow changes something that lasts. When a blow lands on someone (a death close to them, a marriage or a
// friendship ending when they cared more, being let go, passed over, found out, shamed in front of everyone, a want they pursued
// failing), the next month they face it once: start again at work, take up a new routine, keep away from one, or carry on. The act
// is its own event with the blow as its reason, and the change stays until life changes it again.
//
// Off unless ON=aftermath. Round 34 did not meet its expectations: blows changed lives (67% against 50% within three years, in every
// world) without moving the scoreboard, but blind readers could not say the lives read better (−0.12 ±0.41 over 24 pairs), and quoted
// the trait given as the reason for a change as not fitting it. Round 37 gave the reasons a reader accepts for a change (the blow, how
// hard it hit, what ties the change to it): readers quoted them as fitting 17 times and as unfit once, blows changed lives 71% against
// 52%, and the lives still read no better (+0.04 ±0.49). A routine taken up or dropped is texture, not a turn.
//
// Blows are read from the month's events at its end (`aftermathTick`, after every system), so no system that makes a blow needs to
// know about it; the decision is a queued situation, run with next month's situations.

import { SETTING } from './setting';
import { clamp } from './rng';
import { ON, P, age, likeOf, type World, type Person, type Event, type Habit, type Cause } from './world';
import { stateC, bondC, stateCause } from './considerations';
import { type Instance, favour, leaveJob } from './grammar';
import type { Feature } from './features';
import { formHabit } from './time';

export const aftermathOn = () => ON.has('aftermath');

// Starting again at work answers a blow that came through work: passed over, found out, a shaming at their own workplace, or a want
// that failed (the amendment to round 34: walking out of a job over a friendship's end does not fit the blow).
const WORK_BLOWS = new Set(['passed', 'caught']);
const SHAMING = new Set(['dressdown', 'rake']);
export const SHORT: Record<string, (w: World, e: Event, p: Person) => string> = {
  death: (w, e) => `@${e.who[0]}'s death`,
  divorce: (w, e, p) => `the divorce from @${e.who.find(x => x !== p.id)}`,
  split: (w, e, p) => `the break-up with @${e.who.find(x => x !== p.id)}`,
  cooled: (w, e, p) => `the falling-out with @${e.who.find(x => x !== p.id)}`,
  dismiss: () => 'being let go',
  passed: () => 'being passed over',
  caught: () => 'being found out',
  dressdown: () => 'being torn into in front of everyone',
  rake: () => 'having the past dragged up in front of everyone',
  'want:failed': () => 'what had come of it',
};

export function aftermathStats(w: World) {
  return ((w as any).aftermathStats ??= { blows: 0, decided: 0, byKind: {} as Record<string, number>, byBlow: {} as Record<string, number> });
}

// Who an event is a blow to, and the person it came from (if any).
export function blowsOf(w: World, e: Event): { victim: number; from?: number }[] {
  switch (e.type) {
    case 'death': {
      const dead = w.byId.get(e.who[0]);
      if (!dead) return [];
      const close = e.who.slice(1).filter(id => {
        const q = w.byId.get(id);
        return q && q.status === 'in' && age(w, q) >= 16;
      });
      // and the two friends who liked them most
      const friends = [...dead.friends]
        .map(id => w.byId.get(id))
        .filter((q): q is Person => !!q && q.status === 'in' && !close.includes(q.id))
        .sort((a, b) => likeOf(w, b.id, dead.id) - likeOf(w, a.id, dead.id) || a.id - b.id)
        .slice(0, 2)
        .map(q => q.id);
      return [...close, ...friends].map(id => ({ victim: id }));
    }
    case 'divorce':
    case 'split':
    case 'cooled': {
      const [a, b] = e.who;
      if (a == null || b == null) return [];
      // the one who still cared more
      const v = likeOf(w, a, b) >= likeOf(w, b, a) ? a : b;
      return [{ victim: v, from: v === a ? b : a }];
    }
    case 'dismiss':
    case 'dressdown':
    case 'rake':
      return e.who[1] != null ? [{ victim: e.who[1], from: e.who[0] }] : [];
    case 'passed':
      return [{ victim: e.who[0], from: e.who[1] }];
    case 'caught':
    case 'want:failed':
      return [{ victim: e.who[0] }];
  }
  return [];
}

// At the end of the month: every blow this month, the heaviest for each person, queued as their aftermath.
export function aftermathTick(w: World) {
  if (!aftermathOn()) return;
  const W = w as any;
  const from = (W.aftermathScan ?? 0) as number;
  W.aftermathScan = w.events.length;
  const heaviest = new Map<number, { e: Event; from?: number }>();
  for (let i = from; i < w.events.length; i++) {
    const e = w.events[i];
    if (!SHORT[e.type]) continue;
    for (const b of blowsOf(w, e)) {
      const cur = heaviest.get(b.victim);
      if (!cur || e.w > cur.e.w) heaviest.set(b.victim, { e, from: b.from });
    }
  }
  for (const [id, { e, from: other }] of [...heaviest].sort((a, b) => a[0] - b[0])) {
    const p = w.byId.get(id);
    if (!p || p.status !== 'in' || age(w, p) < 16) continue;
    if (w.t >= w.startPresent) aftermathStats(w).blows++;
    if (w.t - (p.tried['aftermath']?.t ?? -99) < 12) continue;
    const inst = instance(w, p, e, other != null ? w.byId.get(other) : undefined);
    if (inst) w.queue.push(inst);
  }
}

// The routine they would take up: the best fit they do not have, social first if it fits nearly as well.
function newRoutine(w: World, p: Person) {
  const have = new Set(p.habits.filter(h => !h.broken).map(h => h.id));
  const cands = SETTING.habits
    .filter(h => !have.has(h.id) && h.kind !== 'work' && h.kind !== 'family' && (!h.adult || age(w, p) >= 18) && h.fit(p) > 0)
    .filter(h => !h.minAptitude || Object.entries(h.minAptitude).every(([k, v]) => p.aptitudes[k] >= v))
    .map(h => [h, h.fit(p) + (h.kind === 'social' ? 0.2 : 0)] as const)
    .sort((a, b) => b[1] - a[1] || (a[0].id < b[0].id ? -1 : 1));
  return cands[0]?.[0];
}
// The routine they would drop: a social one, the one they share with the person the blow came from if there is one.
function oldRoutine(p: Person, other?: Person): Habit | undefined {
  const social = p.habits.filter(h => !h.broken && h.kind === 'social');
  if (!social.length) return undefined;
  const shared = other ? social.find(h => other.habits.some(x => !x.broken && x.id === h.id)) : undefined;
  return shared ?? social.sort((a, b) => b.since - a.since)[0];
}
const now = (label: string) => (label.startsWith('is ') ? 'is now ' + label.slice(3) : 'now ' + label);
const noLonger = (label: string) => (label.startsWith('is ') ? 'is no longer ' + label.slice(3) : 'no longer ' + label);

function instance(w: World, p: Person, e: Event, other?: Person): Instance | null {
  const families: string[] = [];
  const held = p.job && age(w, p) < 62 && !p.retired ? w.placeById.get(p.job) : undefined;
  const atWork = !!held && (WORK_BLOWS.has(e.type) || (SHAMING.has(e.type) && e.text.includes(held.name)));
  const job = held && (atWork || e.type === 'want:failed') ? held : undefined;
  if (job) families.push('courage');
  const take = age(w, p) < 75 ? newRoutine(w, p) : undefined;
  if (take) families.push('openness');
  const drop = oldRoutine(p, other);
  if (drop) families.push('withdrawal');
  if (!families.length) return null;
  families.push('reluctance');
  const her = (s: string) => s.replace(/\btheir\b/g, p.sex === 'f' ? 'her' : 'his');
  // The words for each answer, in one filler: the expression for each family takes its own part (see families.ts, round 34).
  const thing = [job?.name ?? '', take ? her(now(take.label)) : '', drop ? her(noLonger(drop.label)) : ''].join('|');
  const short = SHORT[e.type](w, e, p);
  // The reasons each change gives after the blow itself (round 37): how hard it hit, then what ties the change to it.
  const hit = stateCause(e.w >= 2 ? 'it hit hard' : `it had shaken ${p.sex === 'f' ? 'her' : 'him'}`, 0.5);
  const shared = drop && other && other.status === 'in' && other.habits.some(h => !h.broken && h.id === drop.id);
  const reasonsFor = (fam: string): Cause[] =>
    fam === 'courage' && atWork
      ? [hit, stateCause('it happened at work', 0.4)]
      : fam === 'withdrawal' && shared
        ? [hit, stateCause(`@${other!.id} is there too`, 0.4)]
        : [hit];
  return {
    type: 'aftermath',
    actor: p,
    target: other && other.status === 'in' ? other : undefined,
    others: [],
    thing,
    features: new Set<Feature>(['private', ...(atWork ? (['public'] as Feature[]) : [])]),
    families: families as any,
    only: { courage: ['startover'], openness: ['takeup'], withdrawal: ['keepaway'], reluctance: ['carryon'] },
    cause: e.id,
    causeLabel: `after ${short}`,
    extra: [
      favour(
        stateC('blow', e.w >= 2 ? `it hit hard` : `it had shaken ${p.sex === 'f' ? 'her' : 'him'}`, clamp(e.w / 2.5, 0, 1), 1, 0.2),
        'courage',
        'openness',
        'withdrawal',
      ),
      ...(atWork && job ? [favour(stateC('work', 'it happened at work', 0.85, 1, 0.2), 'courage')] : []),
    ],
    familyExtra: other && other.status === 'in' ? { withdrawal: [bondC(w, p, other, 'like', -1)] } : {},
    w: 1.1,
    reasonsFor,
    aftermath: { blow: e.type, take: take?.id, drop: drop?.id },
  } as Instance & { aftermath: { blow: string; take?: string; drop?: string } };
}

// What the chosen answer does (effects.ts, after the act).
export function applyAftermath(w: World, inst: Instance, expr: string, ev: number) {
  const p = inst.actor;
  const a = (inst as any).aftermath as { blow: string; take?: string; drop?: string };
  p.tried['aftermath'] = { t: w.t, ok: expr !== 'carryon', n: (p.tried['aftermath']?.n ?? 0) + 1 };
  if (w.t >= w.startPresent) {
    const st = aftermathStats(w);
    st.decided++;
    st.byKind[expr] = (st.byKind[expr] ?? 0) + 1;
    st.byBlow[a.blow] = (st.byBlow[a.blow] ?? 0) + 1;
  }
  if (expr === 'startover') leaveJob(w, p, w.events[ev]);
  else if (expr === 'takeup' && a.take) formHabit(w, p, a.take, 'to get through it', undefined, false);
  else if (expr === 'keepaway' && a.drop) {
    const h = p.habits.find(x => x.id === a.drop && !x.broken);
    if (h) {
      h.broken = w.t;
      h.breakWhy = 'kept away, after what happened';
      h.breakCause = ev;
    }
  }
}
