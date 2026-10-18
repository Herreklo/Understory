// Time: what people work toward (pursuits), what they do every day (habits), and what holds them (attachments).
// Pursuits make people agents instead of reactors. Habits make ordinary days legible. Attachments make leaving cost something.

import { quirkLine } from './persona';
import { clamp } from './rng';
import { SETTING } from './setting';
import { VALUES, FACETS, FACET_BY_ID } from './core';
import {
  titleAt,
  OFF,
  type World,
  type Person,
  type Want,
  type Cause,
  type Habit,
  age,
  live,
  P,
  facet,
  likeOf,
  peekBond,
  bond,
  remember,
  addEvent,
  broadcast,
  addStress,
  addEmotion,
  topSources,
  year,
} from './world';
import { z01, curves, type Option, type Consideration } from './decide';
import {
  decide,
  run,
  friendsOf,
  family,
  traitCause,
  stateCause,
  eventCause,
  ev,
  facetC,
  valueC,
  stateC,
  privC,
  pubC,
  closeC,
  bondC,
  learned,
} from './grammar';
import type { Feature } from './features';
import { hasWays, chooseWay, setOut, wayTick, obstacle, markGivenUp, mayComeBack, steering, everyone, wantFromValues } from './steer';

const VN = Object.fromEntries(VALUES.map(v => [v.id, v.name]));
const NONE = new Set<Feature>();
const she = (p: Person) => (p.sex === 'f' ? 'she' : 'he');
const her = (p: Person) => (p.sex === 'f' ? 'her' : 'his');

// ---------- wants ----------
export function wantLabel(w: World, p: Person, x: Want): string {
  switch (x.kind) {
    case 'attain': {
      if (x.target === 'work') return 'to find work';
      const pl = w.placeById.get(x.target);
      return pl ? `to become ${titleAt(pl)}` : 'to get on';
    }
    case 'create':
      return 'a child';
    case 'win':
      return `to marry @${x.target}`;
    case 'escape':
      return `to get out of ${SETTING.name}`;
    case 'acquire':
      return (SETTING.goods.find(g => g.id === x.target)?.label ?? x.target).replace(/\btheir\b/, p.sex === 'f' ? 'her' : 'his');
    case 'prove':
      return x.target === 'vocals' ? 'to be heard singing' : `to be heard playing ${SETTING.skillWords?.[x.target] ?? x.target}`;
    case 'belong':
      return `to find ${p.sex === 'f' ? 'her' : 'his'} people`;
    case 'restore':
      return `to make things right with @${x.target}`;
    case 'project':
      return ((SETTING as any).projects ?? []).find((k: any) => k.id === x.target)?.label ?? 'a plan of their own';
  }
  return x.kind;
}
// A want remembers the event it came from, when it came from one (round 23a); wants from character alone have none.
export function addWant(w: World, p: Person, kind: string, target: string, value: string, urgency: number, cause?: number) {
  if (p.wants.some(x => x.kind === kind && x.target === target && !x.done)) return;
  const back = mayComeBack(w, p, kind, target); // round 25c: a want given up comes back only changed
  if (!back.ok) return;
  p.wants.push({
    kind,
    target,
    value,
    since: w.t,
    urgency,
    ...(cause != null && cause >= 0 ? { cause } : {}),
    ...(back.why ? { back: back.why } : {}),
  } as Want);
}
export function resolveWants(w: World, p: Person, kind: string, target: string, how: Want['done'], ref: number) {
  for (const x of p.wants)
    if (x.kind === kind && x.target === target && !x.done) {
      x.done = how;
      x.doneAt = ref;
      const yrs = Math.max(1, Math.round((w.t - x.since) / 12));
      const pu = x.pursuit;
      const tried = Math.max(1, Math.round((w.t - (pu?.since ?? x.since)) / 12)); // trying is counted from the pursuit, wanting from the want
      const text =
        how === 'achieved'
          ? pu && !pu.owner
            ? `@${p.id} got there: ${
                x.kind === 'prove' && w.events[ref]?.type === 'gotgood'
                  ? `people have started to talk about ${her(p)} ${x.target === 'vocals' ? 'singing' : x.target}`
                  : wantLabel(w, p, x)
              }, ${w.t - x.since < 12 ? 'within the year' : `after ${yrs} year${yrs > 1 ? 's' : ''} of wanting it`}.`
            : `@${p.id} got what ${she(p)} had wanted for ${yrs > 1 ? yrs + ' years' : 'a year'}: ${wantLabel(w, p, x).replace(/^to /, '')}.`
          : `What @${p.id} had wanted for ${yrs} year${yrs > 1 ? 's' : ''} was gone.`;
      const causes: Cause[] = [eventCause(w, ref, 1)];
      if (pu && !pu.owner && how === 'achieved')
        causes.push(traitCause(p, 'diligence', 0.4, 1), {
          kind: 'want',
          label: `had wanted it since ${year(x.since)}`,
          weight: 0.5,
          key: x.kind,
          who: p.id,
        });
      const e = addEvent(w, {
        type: 'want:' + how,
        who: [p.id],
        text,
        causes,
        vis: pu && pu.visible && !pu.owner ? 'local' : 'private',
        evidence: pu && how === 'achieved' ? [ev(p.id, 'diligence', 1, 0.6, 0.6)] : [],
        w: pu && !pu.owner ? 2 : 1.5,
      });
      broadcast(w, e);
      addEmotion(w, p, 'want' + x.kind, how === 'achieved' ? 'a long want fulfilled' : 'a long want lost', how === 'achieved' ? 0.2 : -0.2, 12, e.id);
      if (pu && !pu.owner && how === 'achieved') {
        // Achieving something you worked for rewrites the story a little.
        if (!p.selfStory.some(s => s.key === 'achiever') && p.selfStory.length < 3 && w.rng.chance(0.6))
          p.selfStory.push({ key: 'achiever', text: 'someone who gets what they go after', weight: 0.5 });
        learned(w, p, 'achieved', true);
      }
      // Followers lose their borrowed want when the owner's ends.
      for (const q of live(w))
        for (const y of q.wants)
          if (!y.done && y.pursuit?.owner === p.id && y.kind === kind)
            endFollow(
              w,
              q,
              y,
              how === 'achieved'
                ? `@${p.id} got there, and @${q.id} found ${she(q)} had never wanted it for ${q.sex === 'f' ? 'herself' : 'himself'}`
                : `it had only ever been @${p.id}'s dream`,
              ref,
            );
    }
}

// ---------- pursuits ----------
const PLAN: Record<string, string> = {
  attain: 'work harder than anyone',
  acquire: 'save',
  escape: 'save and ask around',
  prove: 'practise',
  belong: 'show up',
  restore: 'reach out',
};
const active = (p: Person) => p.wants.filter(x => !x.done && x.pursuit && !x.pursuit.owner);

function newWants(w: World, p: Person) {
  wantFromValues(w, p, (kind, target, value, urgency) => addWant(w, p, kind, target, value, urgency)); // round 25d
  const a = age(w, p);
  if (a < 15 || !w.rng.chance(0.06)) return;
  // Something to own.
  if (a >= 22 && a < 60 && !active(p).length) {
    for (const g of SETTING.goods) {
      if (p.attachments.some(x => x.key === g.id) || p.wants.some(x => x.kind === 'acquire' && x.target === g.id)) continue;
      if (p.savings > g.cost * 0.5 || p.savings < -6) continue; // the rich just buy it; the broke can't dream yet
      const pull =
        z01(p.values[g.value]) *
        (p.coreValues.includes(g.value) ? 1.6 : 0.5) *
        (g.id === 'house' && p.partner != null ? 1.5 : 1) *
        (g.id === 'boat' && p.job === 'harbour' ? 1.5 : 1);
      if (w.rng.chance(pull * 0.12)) {
        addWant(w, p, 'acquire', g.id, g.value, 0.3 + 0.4 * z01(p.values[g.value]));
        break;
      }
    }
  }
  // Something to be heard for.
  for (const h of SETTING.hobbies) {
    const s = p.skills[h];
    if (s && s.interest === 2 && s.r > 1080 && a < 45 && w.rng.chance(0.4)) {
      addWant(w, p, 'prove', h, facet(p, 'modesty') < 0 ? 'status' : 'pleasure', 0.3 + 0.3 * z01(facet(p, 'aesthetic')));
      break;
    }
  }
  // Someone to belong with.
  const lastBelong = p.wants.filter(x => x.kind === 'belong' && x.done).reduce((m, x) => Math.max(m, x.since), -999);
  if (a >= 16 && !p.friends.size && p.partner == null && facet(p, 'sociability') > -0.3 && w.t - lastBelong > 48 && w.rng.chance(0.5))
    addWant(w, p, 'belong', 'people', 'fittingIn', 0.4 + 0.2 * z01(facet(p, 'sociability')));
}
// After a falling-out: the want to put it right, if they still care.
export function wantRestore(w: World, p: Person, q: Person, cause?: number) {
  if (likeOf(w, p.id, q.id) < 0.2 || facet(p, 'forgiveness') < -0.8) return;
  addWant(w, p, 'restore', String(q.id), 'lovedOnes', 0.5, cause);
}

function startPursuit(w: World, p: Person, x: Want) {
  const lbl = wantLabel(w, p, x);
  const opts: Option[] = [
    {
      id: 'start',
      label: `go after it: ${lbl}`,
      considerations: [
        privC('urgency', x.urgency > 0.5 ? 'wants it badly' : 'wants it, but not badly', x.urgency, 1, 0.2, undefined, 0.3),
        privC('drive', p.drive > 0.3 ? 'the kind who goes after things' : 'not one to chase things', z01(p.drive * 1.2), 1, 0.2, undefined, 0.3),
        facetC(p, 'diligence', NONE, 1, 4),
        stateC('worn', p.stress > 0.5 ? 'worn down' : 'not worn down', p.stress, -1, 0.25),
      ],
    },
    {
      id: 'wait',
      label: 'keep wishing',
      considerations: [
        facetC(p, 'anxiety', NONE, 1, 4),
        facetC(p, 'prudence', NONE, 1, 3, 0.6),
        privC(
          'gaveup',
          p.tried['gaveup'] ? `gave up on something once already (${year(p.tried['gaveup'].t)})` : 'never tried and failed',
          p.tried['gaveup'] ? 0.8 : 0.35,
          1,
          0.2,
          undefined,
          0.35,
        ),
      ],
    },
  ];
  const d = decide(w, p, 'a want: ' + lbl, opts);
  if (d.chosen !== 'start') return;
  const visible = w.rng.next() < 0.35 + 0.4 * z01(facet(p, 'sociability')) + 0.2 * z01(facet(p, 'socialBoldness'));
  x.pursuit = {
    plan: PLAN[x.kind] ?? 'try',
    progress: 0,
    effort: clamp(0.3 + 0.3 * z01(facet(p, 'diligence')) + 0.3 * x.urgency, 0.2, 1),
    since: w.t,
    visible,
    setbacks: 0,
    lastGain: w.t,
    start: w.t,
    told: 0,
  };
  if (x.kind === 'acquire' || x.kind === 'escape') x.pursuit.progress = clamp(p.savings / costOf(x), 0, 0.6);
  const steer = hasWays(w, x) ? chooseWay(w, p, x, lbl) : null;
  if (x.kind === 'belong' && (!steer || steer.way.id === 'show')) {
    const soc = SETTING.habits.filter(h => h.kind === 'social' && available(w, p, h)).sort((a, b) => b.fit(p) - a.fit(p))[0];
    if (soc) {
      formHabit(w, p, soc.id, 'to meet people', 0.6);
      (x.pursuit as any).via = soc.id;
    }
  }
  if (x.kind === 'prove') {
    const s = p.skills[x.target];
    (x.pursuit as any).r0 = s.r;
    (x.pursuit as any).rt = Math.min(s.ceil, s.r + 180);
    formHabit(w, p, 'practise', `took up ${x.target} in earnest`, 0.7);
  }
  const verb: Record<string, string> = {
    attain: 'started working for it',
    acquire: `started saving for ${lbl}`,
    escape: `started saving to leave`,
    prove: `started practising ${x.target} in earnest`,
    belong: 'started turning up to things',
    restore: `started trying to put things right with @${x.target}`,
  };
  if (steer) {
    // Round 25c: the way they chose is what the record says, with the decision to go after it and, if it is a want come back, what changed.
    const back = (x as any).back as string | undefined;
    const why = [...(back ? [stateCause(`back to it, ${back}`, 0.5)] : []), ...d.why];
    const e = setOut(w, p, x, steer.way, lbl, why, steer.d?.rec ?? d.rec);
    if (visible && e.vis !== 'private') followers(w, p, x, e.id);
    return;
  }
  const e = addEvent(w, {
    type: 'pursuit',
    who: [p.id],
    text: visible ? `@${p.id} ${verb[x.kind]}, and tells everyone.` : `@${p.id} quietly ${verb[x.kind]}.`,
    causes: [
      { kind: 'want', label: `wants ${lbl.replace(/^to /, 'to ')} (since ${year(x.since)})`, weight: 0.5, key: x.kind, who: p.id },
      ...d.why.slice(0, 2),
    ],
    vis: visible ? 'local' : 'private',
    decision: d.rec,
    evidence: [ev(p.id, 'want:' + x.kind, 1, 1, 0.75), ev(p.id, 'diligence', 1, 0.4, 0.5)],
    w: 1.1,
  });
  broadcast(w, e);
  if (visible) followers(w, p, x, e.id);
}
const costOf = (x: Want) => (x.kind === 'escape' ? SETTING.moveCost : (SETTING.goods.find(g => g.id === x.target)?.cost ?? 20));

// Tagging along: a friend with little drive of their own joins someone else's pursuit. Their commitment is borrowed.
function followers(w: World, p: Person, x: Want, ref: number) {
  if (!['prove', 'escape', 'acquire', 'belong'].includes(x.kind)) return;
  const pool = [...friendsOf(w, p), ...(p.partner != null && x.kind !== 'escape' ? [P(w, p.partner)] : [])].filter(
    q => q !== p && age(w, q) >= 15 && !active(q).length && !q.wants.some(y => !y.done && y.pursuit?.owner),
  );
  for (const q of pool) {
    if (x.kind === 'prove' && !q.skills[x.target]?.interest) continue;
    if (x.kind === 'acquire' && x.target !== 'trip') continue;
    const pull =
      0.35 * z01(facet(q, 'flexibility')) + 0.35 * z01(facet(q, 'dependence')) + 0.4 * Math.max(0, likeOf(w, q.id, p.id)) - 0.4 * z01(q.drive) - 0.1;
    if (!w.rng.chance(pull)) continue;
    const y: Want = {
      kind: x.kind,
      target: x.kind === 'prove' ? (q.skills[x.target] ? x.target : SETTING.hobbies[0]) : x.target,
      value: 'lovedOnes',
      since: w.t,
      urgency: 0.3,
      pursuit: {
        plan: PLAN[x.kind],
        progress: 0,
        effort: 0.3,
        since: w.t,
        visible: true,
        setbacks: 0,
        lastGain: w.t,
        start: w.t,
        told: 0,
        owner: p.id,
      },
    };
    q.wants.push(y);
    const e = addEvent(w, {
      type: 'follow',
      who: [q.id, p.id],
      text:
        x.kind === 'prove'
          ? `@${q.id} has started playing with @${p.id}.`
          : x.kind === 'escape'
            ? `@${q.id} says ${she(q)}'ll go too, if @${p.id} goes.`
            : `@${q.id} is in on @${p.id}'s plan: ${wantLabel(w, p, x)}.`,
      causes: [
        eventCause(w, ref, 0.5),
        { kind: 'bond', label: `would follow @${p.id} anywhere`, weight: 0.5, who: p.id },
        traitCause(q, 'dependence', 0.3, 1),
      ],
      vis: 'local',
      evidence: [ev(q.id, 'dependence', 1, 0.5, 0.6), ev(q.id, 'flexibility', 1, 0.4, 0.5)],
      w: 1,
    });
    broadcast(w, e);
    if (x.kind === 'prove') formHabit(w, q, 'practise', `playing with @${p.id}`, 0.5);
    break;
  }
}
function endFollow(w: World, q: Person, y: Want, why: string, ref: number) {
  y.done = 'abandoned';
  y.doneAt = ref;
  const e = addEvent(w, {
    type: 'unfollow',
    who: [q.id],
    text: `@${q.id} let it go: ${why}.`,
    causes: [eventCause(w, ref, 0.6), traitCause(q, 'dependence', 0.4, -1)],
    vis: 'local',
    evidence: [],
    w: 0.9,
  });
  broadcast(w, e);
  const h = q.habits.find(h => h.id === 'practise' && !h.broken);
  if (h && y.kind === 'prove') breakHabit(w, q, h, `@${y.pursuit!.owner} stopped`, ref);
}

const WISH: Record<string, (w: World, p: Person, x: Want) => string> = {
  acquire: (w, p, x) => `@${p.id} talks about ${wantLabel(w, p, x)} the way other people talk about the weather.`,
  prove: (w, p, x) => `@${p.id} said, not quite joking, that ${she(p)} could play the open night if ${she(p)} wanted to.`,
  escape: (w, p) => `@${p.id} has been talking about the city a lot lately.`,
  attain: (w, p, x) => `@${p.id} let slip ${she(p)} would want it, if it ever came up: ${wantLabel(w, p, x)}.`,
  belong: (w, p) => `@${p.id} said ${she(p)} did not really know anyone here, and laughed it off.`,
  restore: (w, p, x) => `@${p.id} went quiet when @${x.target}'s name came up.`,
};
function pursuitTick(w: World, p: Person) {
  const a = age(w, p);
  newWants(w, p);
  // Wishes leak: people say what they want long before they do anything about it.
  for (const x of p.wants)
    if (
      !x.done &&
      !x.pursuit &&
      WISH[x.kind] &&
      w.t - x.since > 2 &&
      w.rng.chance(0.025 * (0.6 + 0.8 * z01(facet(p, 'sociability')))) &&
      (p.tried['wish:' + x.kind]?.t ?? -99) < w.t - 30
    ) {
      learned(w, p, 'wish:' + x.kind, true);
      const e = addEvent(w, {
        type: 'tell',
        who: [p.id],
        text: WISH[x.kind](w, p, x),
        causes: [
          { kind: 'want', label: `wants ${wantLabel(w, p, x)} (since ${year(x.since)})`, weight: 0.7, key: x.kind, who: p.id },
          traitCause(p, 'sociability', 0.3, 1),
        ],
        vis: 'local',
        evidence: [ev(p.id, 'want:' + x.kind, 1, 0.8, 0.6)],
        w: 0.5,
      });
      seenByClose(w, p, e);
      broadcast(w, e);
    }
  // Followers: the bond is the commitment.
  for (const y of p.wants)
    if (!y.done && y.pursuit?.owner != null) {
      const o = P(w, y.pursuit.owner);
      if (o.status !== 'in' || likeOf(w, p.id, o.id) < 0.15) {
        endFollow(w, p, y, o.status !== 'in' ? `@${o.id} was gone` : `things had cooled with @${o.id}`, w.events.length - 1);
        continue;
      }
      if (y.kind === 'prove') practise(p, y.target, 0.5);
    }
  // Starting: a want becomes a pursuit, or stays a wish.
  if (a >= 15 && !active(p).length && w.rng.chance(0.1)) {
    const open = p.wants.filter(
      x => !x.done && !x.pursuit && (PLAN[x.kind] || (x.kind === 'win' && everyone())) && !(x.kind === 'attain' && !p.job && x.target !== 'work'),
    );
    if (open.length) startPursuit(w, p, w.rng.pick(open));
  }
  for (const x of active(p)) {
    const pu = x.pursuit!;
    const prev = pu.progress;
    // Round 25c: a way's answers come in, and a no is an obstacle to decide about.
    if (hasWays(w, x)) {
      const j = (p as any).joinHabit;
      if (j) {
        delete (p as any).joinHabit;
        formHabit(w, p, j.id, j.from, 0.6);
        (pu as any).via = j.id;
      }
      const ob = wayTick(w, p, x);
      if (ob) {
        const ch = obstacle(w, p, x, wantLabel(w, p, x), ob.what, ob.ref, (w.t - pu.since) / 12, pu.progress);
        if (ch === 'giveup') giveUp(w, p, x, (x as any).obstacleRec);
        if (x.done) continue;
      }
    }
    const eff = pu.effort * (1 - 0.5 * p.stress) * (p.ill ? 0.3 : 1);
    switch (x.kind) {
      case 'acquire':
      case 'escape':
        pu.progress = clamp(p.savings / costOf(x), 0, 1);
        break;
      case 'attain': {
        const pl = w.placeById.get(x.target);
        if (x.target === 'work') pu.progress = clamp((w.t - pu.since) / 30, 0, 0.95);
        else if (pl) {
          practise(p, pl.skill, 0.5 * eff);
          p.perf += 0.04 * eff;
          pu.progress = clamp(0.5 * z01(p.perf) + (w.t - pu.since) / 72, 0, 0.95);
        }
        break;
      }
      case 'prove': {
        const s = p.skills[x.target];
        practise(p, x.target, 1.2 * eff);
        pu.progress = clamp((s.r - (pu as any).r0) / Math.max(40, (pu as any).rt - (pu as any).r0), 0, 1);
        if (pu.progress >= 1) {
          achieveProve(w, p, x);
          continue;
        }
        break;
      }
      case 'belong': {
        pu.progress = clamp((w.t - pu.since) / 24, 0, 0.95);
        if (p.friends.size || p.partner != null) {
          const ref = p.events
            .slice()
            .reverse()
            .find(i => ['friends', 'madeup', 'dating', 'married'].includes(w.events[i].type));
          if (ref != null) {
            resolveWants(w, p, 'belong', 'people', 'achieved', ref);
            continue;
          }
        }
        const via = (pu as any).via;
        const h = via && p.habits.find(h => h.id === via && !h.broken);
        if (h && w.t - pu.since >= 10) {
          const mates = live(w).filter(
            q => q !== p && q.habits.some(g => g.id === via && !g.broken) && likeOf(w, p.id, q.id) > 0.25 && likeOf(w, q.id, p.id) > 0.2,
          );
          if (mates.length) {
            const tpl = SETTING.habits.find(t => t.id === via)!;
            const e = addEvent(w, {
              type: 'belonged',
              who: [p.id, ...mates.slice(0, 2).map(q => q.id)],
              text: `@${p.id} has found ${her(p)} people: ${mates
                .slice(0, 2)
                .map(q => '@' + q.id)
                .join(
                  ' and ',
                )}, ${/at the Anchor|with the choir/.test(tpl.label) ? 'from ' + tpl.label.replace(/^.*?(the Anchor|the choir).*$/, '$1') : 'from ' + tpl.label.replace(/^is /, '')}.`,
              causes: [
                { kind: 'want', label: `had been lonely, and went looking (since ${year(pu.since)})`, weight: 0.6, key: 'belong', who: p.id },
                traitCause(p, 'sociability', 0.4, 1),
              ],
              vis: 'local',
              evidence: [ev(p.id, 'sociability', 1, 0.5, 0.5)],
              w: 1.3,
            });
            broadcast(w, e);
            resolveWants(w, p, 'belong', 'people', 'achieved', e.id);
            continue;
          }
        }
        break;
      }
      case 'restore': {
        if (w.rng.chance(0.2 * eff)) reachOut(w, p, x);
        break;
      }
    }
    if (pu.progress > prev + 0.004) pu.lastGain = w.t;
    // Setback: ground lost.
    if (pu.progress < prev - 0.12 && (x.kind === 'acquire' || x.kind === 'escape')) {
      pu.setbacks++;
      const src = topSources(p, 1)[0];
      const e = addEvent(w, {
        type: 'setback',
        who: [p.id],
        text: `The money @${p.id} had put by for ${wantLabel(w, p, x).replace(/^to /, '')} went${src ? ` on ${src.label}` : ''}.`,
        causes: [
          src ? stateCause(src.label, 0.6, src.ref) : stateCause('money ran short', 0.6),
          { kind: 'want', label: `had been saving since ${year(pu.since)}`, weight: 0.4, key: x.kind, who: p.id },
        ],
        vis: pu.visible ? 'local' : 'private',
        evidence: [],
        w: 1,
      });
      broadcast(w, e);
      addEmotion(w, p, 'setback', 'back to square one', -0.1, 4, e.id);
    }
    // Buying the thing.
    if (x.kind === 'acquire' && pu.progress >= 1) {
      buy(w, p, x);
      continue;
    }
    // Tells: effort shows, if it is allowed to.
    if (pu.visible && pu.told < 3 && w.t - pu.since > 3 && w.rng.chance(0.07)) tell(w, p, x);
    // Giving up: stalled, or knocked back.
    const stalled = w.t - pu.lastGain > 14;
    if ((stalled || pu.setbacks > 0) && w.rng.chance(0.05) && w.t - ((pu as any).lastCheck ?? -99) > 8) {
      (pu as any).lastCheck = w.t;
      if (hasWays(w, x)) {
        const what = stalled
          ? `no progress for ${Math.round(((w.t - pu.lastGain) / 12) * 10) / 10} years`
          : `knocked back ${pu.setbacks} time${pu.setbacks > 1 ? 's' : ''}`;
        const ch = obstacle(w, p, x, wantLabel(w, p, x), what, undefined, (w.t - pu.since) / 12, pu.progress);
        if (ch === 'giveup') giveUp(w, p, x, (x as any).obstacleRec);
        continue;
      }
      const opts: Option[] = [
        {
          id: 'push',
          label: 'keep at it',
          considerations: [
            facetC(p, 'diligence', NONE, 1, 4),
            pubC('invested', `${Math.max(1, Math.round((w.t - pu.since) / 12))} years in`, clamp((w.t - pu.since) / 60, 0, 1)),
            privC('close', pu.progress > 0.6 ? 'so close' : 'a long way off', pu.progress, 1, 0.2, undefined, 0.45),
          ],
        },
        {
          id: 'giveup',
          label: 'let it go',
          considerations: [
            privC(
              'stalled',
              stalled
                ? `no progress for ${Math.round(((w.t - pu.lastGain) / 12) * 10) / 10} years`
                : `knocked back ${pu.setbacks} time${pu.setbacks > 1 ? 's' : ''}`,
              stalled ? 0.8 : 0.5 + 0.15 * pu.setbacks,
              1,
              0.2,
              undefined,
              0.3,
            ),
            facetC(p, 'anxiety', NONE, 1, 3),
            stateC('worn', p.stress > 0.5 ? 'worn down' : 'not worn down', p.stress, 1, 0.25),
            privC(
              'gaveup',
              p.tried['gaveup'] ? 'has given up before' : 'has never given up on anything',
              p.tried['gaveup'] ? 0.75 : 0.3,
              1,
              0.2,
              undefined,
              0.3,
            ),
          ],
        },
      ];
      const d = decide(w, p, 'whether to go on: ' + wantLabel(w, p, x), opts);
      if (d.chosen === 'giveup') giveUp(w, p, x, d);
      else {
        pu.setbacks = 0;
        pu.lastGain = w.t;
        const close = (d.rec.options.find((o: any) => o.id === 'giveup')?.p ?? 0) > 0.3;
        if (close && (!(pu as any).pushed || w.rng.chance(0.3))) {
          (pu as any).pushed = true;
          const e = addEvent(w, {
            type: 'pushon',
            who: [p.id],
            text: `@${p.id} would not let it go: ${wantLabel(w, p, x)}.`,
            causes: d.why.slice(0, 3),
            vis: pu.visible ? 'local' : 'private',
            decision: d.rec,
            evidence: [ev(p.id, 'diligence', 1, 0.8, 0.7)],
            w: 1,
          });
          broadcast(w, e);
        }
      }
    }
  }
}
// Letting a want go: the record, the feeling, the self-story, the habit it came with, and anyone who had tagged along.
export function giveUp(w: World, p: Person, x: Want, d: any) {
  const pu = x.pursuit!;
  x.done = 'abandoned';
  x.doneAt = w.events.length;
  markGivenUp(w, p, x);
  learned(w, p, 'gaveup', true);
  const e = addEvent(w, {
    type: 'gaveup',
    who: [p.id],
    text: `@${p.id} gave up on it: ${wantLabel(w, p, x)}.`,
    causes: [...d.why.slice(0, 3), { kind: 'want', label: `had been at it since ${year(pu.since)}`, weight: 0.3, key: x.kind, who: p.id }],
    vis: pu.visible ? 'local' : 'private',
    decision: d.rec,
    evidence: [ev(p.id, 'diligence', -1, 0.5, 0.6), ev(p.id, 'anxiety', 1, 0.3, 0.4)],
    w: 1.4,
  });
  broadcast(w, e);
  addEmotion(w, p, 'gaveup', 'something let go of', -0.15, 8, e.id);
  const s = p.selfStory.find(s => s.key === 'worker' || s.key === 'achiever');
  if (s) s.weight = Math.max(0.1, s.weight - 0.2);
  const h = p.habits.find(h => h.id === 'practise' && !h.broken);
  if (h && x.kind === 'prove') breakHabit(w, p, h, 'gave it up', e.id);
  for (const q of live(w))
    for (const y of q.wants) if (!y.done && y.pursuit?.owner === p.id && y.kind === x.kind) endFollow(w, q, y, `@${p.id} gave up`, e.id);
}
function tell(w: World, p: Person, x: Want) {
  const pu = x.pursuit!;
  pu.told++;
  const texts: Record<string, string[]> = {
    attain: [
      `@${p.id} has been first in and last out for months.`,
      `@${p.id} has been taking on everything nobody else wants.`,
      `@${p.id} asked @lead what it would take.`,
    ],
    acquire: [
      `@${p.id} has been putting every spare penny aside.`,
      `@${p.id} has stopped coming out; saving, ${she(p)} says.`,
      `@${p.id} has been pricing up ${wantLabel(w, p, x).replace(/ of their own/, 's')}.`,
    ],
    escape: [
      `@${p.id} has been talking about the city a lot lately.`,
      `@${p.id} asked around about work in the city.`,
      `@${p.id} has been counting what it would cost to leave.`,
    ],
    prove: [
      `@${p.id} has been practising every night; the neighbours can hear.`,
      `@${p.id} asked @bar about the open night.`,
      `@${p.id} has been playing to anyone who will listen.`,
    ],
    belong: [`@${p.id} has started turning up to things.`, `@${p.id} has been at the Anchor more than usual.`, `@${p.id} asked to be dealt in.`],
    win: [
      `@${p.id} has been talking about @${x.target} as if it were settled.`,
      `@${p.id} has been looking at rings.`,
      `@${p.id} asked @${x.target}'s family round for Sunday lunch.`,
    ],
    restore: [
      `@${p.id} has been asking after @${x.target}.`,
      `@${p.id} went quiet when @${x.target}'s name came up.`,
      `@${p.id} asked what @${x.target} had been saying.`,
    ],
  };
  const lead = p.job ? w.placeById.get(p.job)!.lead : null;
  const barLead = w.placeById.get('bar')?.lead;
  let text = texts[x.kind][Math.min(pu.told - 1, 2)]
    .replace('@lead', lead != null && lead !== p.id ? `@${lead}` : 'around')
    .replace('@bar', barLead != null ? `@${barLead}` : 'at the Anchor');
  const e = addEvent(w, {
    type: 'tell',
    who: [p.id],
    text,
    causes: [
      { kind: 'want', label: `wants ${wantLabel(w, p, x)} (since ${year(x.since)})`, weight: 0.6, key: x.kind, who: p.id },
      traitCause(p, 'diligence', 0.4, 1),
    ],
    vis: 'local',
    evidence: [
      ev(p.id, 'want:' + x.kind, 1, 1, 0.7),
      ev(p.id, 'diligence', 1, 0.5, 0.5),
      ...(x.kind === 'escape' ? [ev(p.id, 'sentimentality', -1, 0.4, 0.5), ev(p.id, 'attach:home', -1, 0.6, 0.5)] : []),
    ],
    w: 0.6,
  });
  broadcast(w, e);
}
function buy(w: World, p: Person, x: Want) {
  const g = SETTING.goods.find(g => g.id === x.target)!;
  p.savings -= g.cost;
  const e = addEvent(w, {
    type: 'bought',
    who: [p.id],
    text: `@${p.id} bought ${g.label.replace('their', her(p))}.`,
    causes: [
      { kind: 'want', label: `had been saving since ${year(x.pursuit!.since)}`, weight: 0.6, key: 'acquire', who: p.id },
      traitCause(p, 'diligence', 0.4, 1),
    ],
    vis: 'public',
    evidence: [ev(p.id, 'diligence', 1, 0.5, 0.6), ev(p.id, 'value:' + g.value, 1, 0.7, 0.6)],
    w: 1.8,
  });
  broadcast(w, e);
  p.attachments.push({ key: g.id, label: g.label.replace('their', her(p)), like: 0.5, since: w.t, cause: e.id });
  if (g.habit) formHabit(w, p, g.habit, `since buying the ${g.id}`, 0.6);
  resolveWants(w, p, 'acquire', g.id, 'achieved', e.id);
}
function achieveProve(w: World, p: Person, x: Want) {
  const s = p.skills[x.target];
  const e = addEvent(w, {
    type: 'gotgood',
    who: [p.id],
    text: `@${p.id} has got seriously good on the ${x.target}; people have started to say so.`,
    causes: [
      { kind: 'want', label: `practising since ${year(x.pursuit!.since)}`, weight: 0.5, key: 'prove', who: p.id },
      traitCause(p, 'diligence', 0.3, 1),
      stateCause(s.r > 1400 ? 'a real gift' : 'hard work more than gift', 0.3),
    ],
    vis: 'local',
    evidence: [ev(p.id, 'skill:' + x.target, 1, 1, 0.8), ev(p.id, 'diligence', 1, 0.6, 0.6)],
    w: 1.5,
  });
  broadcast(w, e);
  resolveWants(w, p, 'prove', x.target, 'achieved', e.id);
}
function reachOut(w: World, p: Person, x: Want) {
  const q = P(w, +x.target);
  if (q.status !== 'in') {
    x.done = 'failed';
    return;
  }
  const feats = new Set<Feature>(['private', family(p, q) ? 'family' : 'friend']);
  const o = run(w, {
    type: 'reachout',
    actor: p,
    target: q,
    others: [],
    thing: 'it',
    features: feats,
    families: ['humility', 'pride'],
    only: { humility: ['apologise', 'call'], pride: ['sulk'] },
    causeLabel: `wanted to put things right with @${q.id}`,
    familyExtra: { humility: [bondC(w, p, q, 'like', 1)] },
    w: 1.1,
  });
  if (!o) return;
  if (o.family === 'humility') {
    const warm = likeOf(w, q.id, p.id) + 0.4 * facet(q, 'forgiveness', p.id) > -0.1;
    if (warm) {
      remember(w, q, p, o.event.id, 0.2, 0.05, 0.15, 'came and put it right');
      remember(w, p, q, o.event.id, 0.1, 0, 0.1, 'let me put it right');
      const r = bond(w, q.id, p.id);
      r.like = clamp(r.like + 0.2, -1, 1);
      if (likeOf(w, q.id, p.id) > 0.3) {
        const e = addEvent(w, {
          type: 'mended',
          who: [p.id, q.id],
          text: `@${p.id} and @${q.id} are on speaking terms again.`,
          causes: [eventCause(w, o.event.id, 0.6), traitCause(q, 'forgiveness', 0.4, 1)],
          vis: 'local',
          evidence: [ev(q.id, 'forgiveness', 1, 0.7, 0.6)],
          w: 1.3,
        });
        broadcast(w, e);
        resolveWants(w, p, 'restore', x.target, 'achieved', e.id);
      }
    } else {
      x.pursuit!.setbacks++;
      const e = addEvent(w, {
        type: 'rebuffed',
        who: [q.id, p.id],
        text: `@${q.id} would not hear it from @${p.id}.`,
        causes: [eventCause(w, o.event.id, 0.5), traitCause(q, 'forgiveness', 0.5, -1)],
        vis: 'private',
        evidence: [ev(q.id, 'forgiveness', -1, 0.8, 0.7)],
        w: 1.2,
      });
      broadcast(w, e);
      addEmotion(w, p, 'rebuffed', `turned away by @${q.id}`, -0.1, 4, e.id);
    }
  }
}
export function practise(p: Person, sk: string, amount: number) {
  const s = p.skills[sk];
  if (!s) return;
  const gain = 9 * amount * (0.6 + 0.25 * s.interest) * (1 + 0.2 * facet(p, 'diligence'));
  s.r += gain * Math.max(0, 1 - (s.r - 900) / (s.ceil - 900));
}
export const pursuing = (p: Person, kind: string) => p.wants.find(x => !x.done && x.kind === kind && x.pursuit && !x.pursuit.owner);

// ---------- habits ----------
function available(w: World, p: Person, h: (typeof SETTING.habits)[number]): boolean {
  if (p.habits.some(x => x.id === h.id)) return false;
  if (h.kind === 'work' && !p.job) return false;
  if (h.id === 'call' && !p.parents.some(k => P(w, k).status === 'in' && P(w, k).sex === 'f')) return false;
  if (h.id === 'sunday' && !(p.partner != null || p.parents.some(k => P(w, k).status === 'in') || p.kids.some(k => P(w, k).status === 'in')))
    return false;
  if (h.id === 'choir' && p.aptitudes.ear < -0.3) return false;
  if ((h.id === 'anchor' || h.id === 'cards' || h.id === 'drink') && age(w, p) < 18) return false;
  return true;
}
export function formHabits(w: World, p: Person, n: number, from: string, r = w.rng) {
  const cands = SETTING.habits
    .filter(h => h.fit(p) > -5 && available(w, p, h))
    .map(h => [h, h.fit(p) + r.normal() * 0.8] as const)
    .filter(([, s]) => s > 0.2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
  for (const [h] of cands) formHabit(w, p, h.id, from, undefined, false);
}
export function formHabit(w: World, p: Person, id: string, from: string, adherence?: number, log = true) {
  const t = SETTING.habits.find(h => h.id === id);
  if (!t) return;
  const old = p.habits.find(h => h.id === id);
  if (old && !old.broken) return;
  const kept = p.habits.filter(h => !h.broken);
  if (kept.length >= 4) {
    // a life only holds so many routines: the weakest one goes quietly
    const weakest = kept.filter(h => h.kind !== 'practice').sort((a, b) => a.adherence - b.adherence)[0];
    if (!weakest || (t.kind !== 'practice' && t.kind !== 'social' && from !== 'to meet people')) return;
    weakest.broken = w.t;
    weakest.breakWhy = `no time for it any more (${t.label.replace(/^is /, '')})`;
  }
  if (old) {
    old.broken = undefined;
    old.from = from;
    old.since = w.t;
  } else
    p.habits.push({
      id,
      label: t.label,
      kind: t.kind,
      place: t.place,
      adherence: adherence ?? clamp(0.5 + 0.15 * facet(p, 'organisation') + 0.1 * facet(p, 'diligence') + (age(w, p) > 35 ? 0.1 : 0), 0.2, 0.95),
      since: w.t,
      from,
    });
  p.lastHabit = w.t;
  if (log && !w.quiet) {
    const e = addEvent(w, {
      type: old ? 'habit:back' : 'habit:new',
      who: [p.id],
      text: old
        ? `Once again, @${p.id} ${t.label.replace(/\btheir\b/g, her(p))}.`
        : `@${p.id} ${t.label.startsWith('is ') ? 'is now ' + t.label.slice(3) : 'now ' + t.label}.`.replace(/\btheir\b/g, her(p)),
      causes: [stateCause(from, 1)],
      vis: t.kind === 'solo' ? 'private' : 'local',
      evidence: habitEvidence(p, id),
      w: 0.6,
    });
    seenByClose(w, p, e);
    broadcast(w, e);
  }
}
// A habit shows the person: whoever swims every morning whatever the weather is telling you something.
export function habitEvidence(p: Person, id: string, strength = 0.6, reliability = 0.55) {
  const t = SETTING.habits.find(h => h.id === id);
  if (!t) return [];
  return Object.entries(t.shows).map(([k, d]) => ev(p.id, k, d, strength * Math.abs(d), reliability));
}
function seenByClose(w: World, p: Person, e: { knownBy: Map<number, 'seen' | 'heard'> }) {
  if (p.partner != null) e.knownBy.set(p.partner, 'seen');
  for (const f of p.friends) e.knownBy.set(f, 'seen');
  for (const c of p.circle) if (w.rng.chance(0.5)) e.knownBy.set(c, 'seen');
  for (const k of p.kids) e.knownBy.set(k, 'seen');
  for (const k of p.parents) e.knownBy.set(k, 'seen');
}
export function breakHabit(w: World, p: Person, h: Habit, why: string, ref?: number) {
  h.broken = w.t;
  h.breakWhy = why;
  h.breakCause = ref;
  (h as any).breaks = ((h as any).breaks ?? 0) + 1;
  if ((h as any).breaks > 2 && !w.rng.chance(0.3)) return;
  const e = addEvent(w, {
    type: 'habit:broke',
    who: [p.id],
    text: `@${p.id} ${h.label.startsWith('is ') ? 'is no longer ' + h.label.slice(3) : 'no longer ' + h.label}.`.replace(/\btheir\b/g, her(p)),
    causes: [ref != null ? eventCause(w, ref, 0.6) : stateCause(why, 0.8)],
    vis: h.kind === 'solo' ? 'private' : 'local',
    evidence: [ev(p.id, 'state:low', 1, 1, 0.7)],
    w: 0.9,
  });
  seenByClose(w, p, e);
  broadcast(w, e);
}
function habitTick(w: World, p: Person) {
  const a = age(w, p);
  if (a < 14) return;
  const grief = p.emotions.find(e => e.k.startsWith('grief') && e.until > w.t);
  const newLove = p.partner != null && w.t - p.psince < 6 && p.pstat === 'dating';
  const newBaby = p.emotions.some(e => e.k === 'baby' && e.until > w.t);
  const newPursuit = active(p).some(x => w.t - x.pursuit!.since < 4);
  for (const h of p.habits) {
    if (h.broken != null) {
      const breaks = (h as any).breaks ?? 1;
      if (
        !available(w, p, { ...h, id: h.id } as any) &&
        p.habits.some(x => x === h) &&
        (h.kind === 'work' ? !p.job : h.id === 'call' ? !p.parents.some(k => P(w, k).status === 'in' && P(w, k).sex === 'f') : false)
      )
        continue; // what broke it is still gone
      if (w.t - h.broken > 8 && p.stress < 0.4 && !grief && w.rng.chance((0.03 / breaks) * (h.kind === 'body' ? 0.3 : 1)))
        formHabit(w, p, h.id, p.stress < 0.3 ? 'things had settled' : 'needed it back', undefined, breaks <= 2);
      continue;
    }
    if (p.ill) continue;
    let hz = 0.0007 * (1 + 10 * Math.max(0, p.stress - 0.35)) * (2 - h.adherence);
    if (grief) hz *= h.kind === 'family' ? 0.5 : 3.5;
    if (p.drinks && h.kind !== 'body') hz *= 2;
    if (newLove && h.kind !== 'family') hz *= 2.5;
    if (newBaby && (h.kind === 'solo' || h.kind === 'social')) hz *= 3;
    if (newPursuit && h.kind !== 'practice') hz *= 1.6;
    if (h.kind === 'work' && !p.job) hz = 1;
    if (h.id === 'call' && !p.parents.some(k => P(w, k).status === 'in' && P(w, k).sex === 'f')) hz = 1;
    if (!w.rng.chance(hz)) continue;
    const why =
      hz >= 1
        ? h.kind === 'work'
          ? 'no work to go to'
          : 'nobody to ring'
        : grief
          ? grief.label
          : newBaby
            ? 'the baby'
            : newLove
              ? `@${p.partner}`
              : p.drinks
                ? 'the drinking'
                : newPursuit
                  ? `every spare hour goes on ${wantLabel(w, p, active(p)[0])}`
                  : p.stress > 0.45
                    ? (topSources(p, 1)[0]?.label ?? 'strain')
                    : 'it just lapsed';
    breakHabit(w, p, h, why, grief?.cause);
  }
  if (a >= 18 && w.t - p.lastHabit > 30 && p.habits.filter(h => !h.broken).length < 3 && w.rng.chance(0.03)) formHabits(w, p, 1, 'took it up');
}
// Routine steadies people: each kept habit is a little relief. People who share a habit see each other.
export const habitRelief = (p: Person) => 0.003 * p.habits.filter(h => !h.broken).length;
export function habitPairs(w: World): [Person, Person][] {
  const out: [Person, Person][] = [];
  const by = new Map<string, Person[]>();
  for (const p of live(w)) for (const h of p.habits) if (!h.broken && h.kind === 'social') (by.get(h.id) ?? by.set(h.id, []).get(h.id)!).push(p);
  for (const [, ps] of by) for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) out.push([ps[i], ps[j]]);
  return out;
}

// ---------- attachments ----------
export function homeOf(p: Person) {
  let h = p.attachments.find(a => a.key === 'home');
  if (!h) {
    h = { key: 'home', label: SETTING.name, like: 0, since: p.born };
    p.attachments.push(h);
  }
  return h;
}
export function attachTick(w: World, p: Person) {
  const h = homeOf(p);
  const away = p.status === 'away';
  const yrs = Math.max(0, ((away ? p.awaySince! : w.t) - h.since) / 12);
  const yrsAway = away ? (w.t - p.awaySince!) / 12 : 0;
  const familyHere = p.parents.some(k => P(w, k).status === 'in') || p.kids.some(k => P(w, k).status === 'in');
  const tied =
    !away &&
    (p.habits.some(x => !x.broken && ['swim', 'shore', 'boat', 'garden'].includes(x.id)) ||
      p.attachments.some(a => a.key === 'boat' || a.key === 'house'));
  const target = clamp(
    0.3 * facet(p, 'sentimentality') +
      0.2 * p.values.tradition -
      0.2 * p.values.freedom -
      0.15 * facet(p, 'inquisitiveness') +
      Math.min(0.3, yrs * 0.012) +
      0.04 * Math.min(4, p.friends.size) +
      (familyHere ? 0.12 : 0) +
      (tied ? 0.15 : 0) -
      0.2 -
      Math.min(0.3, yrsAway * 0.015),
    -1,
    1,
  );
  h.like += (target - h.like) * (away ? 0.15 : 0.25);
  p.facets['attach:home'] = h.like * 2.2; // mirrored as a pseudo-facet so beliefs and views can read it
  // A thing can be lost.
  for (const a of p.attachments.slice())
    if (a.key !== 'home' && p.savings < -12 && w.rng.chance(0.3)) {
      p.attachments = p.attachments.filter(x => x !== a);
      const e = addEvent(w, {
        type: 'lost',
        who: [p.id],
        text: `@${p.id} had to sell the ${a.key}.`,
        causes: [stateCause('the money had run out', 0.7), ...topSources(p, 1).map(s => stateCause(s.label, 0.3, s.ref))],
        vis: 'public',
        evidence: [],
        w: 1.6,
      });
      broadcast(w, e);
      addEmotion(w, p, 'lost' + a.key, `misses the ${a.key}`, -0.15 * (1 + 0.3 * facet(p, 'sentimentality')), 12, e.id);
      addStress(p, 'lost', `losing the ${a.key}`, 0.1, e.id);
      p.savings += SETTING.goods.find(g => g.id === a.key)!.cost * 0.5;
    }
}
// Attachment leaks out in words, which is how anyone can predict a homecoming.
export function attachTells(w: World, p: Person) {
  const h = homeOf(p);
  if (p.status === 'in' && age(w, p) >= 16 && w.rng.chance(0.3)) {
    if (h.like > 0.45 && (p.tried['tell:home']?.t ?? -99) < w.t - 60 && (p.tried['tell:home']?.n ?? 0) < 2) {
      learned(w, p, 'tell:home', true);
      const ROOTED = [
        `@${p.id} says ${she(p)} could never live anywhere else.`,
        `@${p.id} knows every boat in the harbour by name.`,
        `@${p.id} still lives in the house ${she(p)} grew up in, and means to die there.`,
        `Ask @${p.id} about the town and you get an hour.`,
        `@${p.id} has never once talked about leaving.`,
        `@${p.id} walks the same shore path every evening, and has for years.`,
      ];
      const e = addEvent(w, {
        type: 'tell',
        who: [p.id],
        text: ROOTED[(p.id * 7 + p.tried['tell:home'].n * 3) % ROOTED.length],
        causes: [{ kind: 'bond', label: 'rooted here', weight: 0.7, key: 'attach:home', who: p.id }, traitCause(p, 'sentimentality', 0.3, 1)],
        vis: 'local',
        evidence: [ev(p.id, 'attach:home', 1, 1, 0.75), ev(p.id, 'sentimentality', 1, 0.5, 0.5), ev(p.id, 'value:lovedOnes', 1, 0.5, 0.5)],
        w: 0.5,
      });
      broadcast(w, e);
    } else if (h.like < -0.25 && (p.tried['tell:nohome']?.t ?? -99) < w.t - 36 && age(w, p) < 45) {
      learned(w, p, 'tell:nohome', true);
      const e = addEvent(w, {
        type: 'tell',
        who: [p.id],
        text:
          p.tried['tell:nohome'].n % 2 === 1
            ? `@${p.id} says there's nothing for ${her(p).replace('his', 'him')} here.`
            : `@${p.id} talks about ${SETTING.name} as if ${she(p)} had already left.`,
        causes: [
          { kind: 'bond', label: 'nothing holding them here', weight: 0.7, key: 'attach:home', who: p.id },
          traitCause(p, 'inquisitiveness', 0.3, 1),
        ],
        vis: 'local',
        evidence: [ev(p.id, 'attach:home', -1, 1, 0.75), ev(p.id, 'sentimentality', -1, 0.4, 0.5)],
        w: 0.5,
      });
      broadcast(w, e);
    }
  }
  if (p.status === 'away' && h.like < -0.15 && w.rng.chance(0.3) && (p.tried['tell:gone']?.t ?? -99) < w.t - 30) {
    learned(w, p, 'tell:gone', true);
    const n = ((p.tried['tell:gone'].n - 1) % 3) + 1;
    const e = addEvent(w, {
      type: 'tell',
      who: [p.id],
      text:
        n === 1
          ? `@${p.id} has not been back in years; a card at Christmas and nothing more.`
          : n === 2
            ? `@${p.id} sounded like a stranger on the phone, people say.`
            : `@${p.id} missed another family do.`,
      causes: [
        { kind: 'bond', label: 'nothing much holding them here', weight: 0.7, key: 'attach:home', who: p.id },
        traitCause(p, 'sentimentality', 0.3, -1),
      ],
      vis: 'local',
      evidence: [ev(p.id, 'attach:home', -1, 1, 0.7), ev(p.id, 'sentimentality', -1, 0.4, 0.5)],
      w: 0.5,
    });
    seenByClose(w, p, e);
    broadcast(w, e);
  }
  if (p.status === 'away' && h.like > 0.15 && w.rng.chance(0.4) && (p.tried['tell:away']?.t ?? -99) < w.t - 24) {
    learned(w, p, 'tell:away', true);
    const n = ((p.tried['tell:away'].n - 1) % 3) + 1;
    const e = addEvent(w, {
      type: 'tell',
      who: [p.id],
      text:
        n === 1
          ? `@${p.id} rang from the city asking after everyone.`
          : n === 2
            ? `@${p.id} was back for the summer again, and stayed longer than planned.`
            : `@${p.id} said the city was fine, in the voice of someone who meant something else.`,
      causes: [{ kind: 'bond', label: 'homesick', weight: 0.7, key: 'attach:home', who: p.id }, traitCause(p, 'sentimentality', 0.3, 1)],
      vis: 'local',
      evidence: [ev(p.id, 'attach:home', 1, 1, 0.75), ev(p.id, 'sentimentality', 1, 0.5, 0.5), ev(p.id, 'value:lovedOnes', 1, 0.6, 0.5)],
      w: 0.6,
    });
    seenByClose(w, p, e);
    broadcast(w, e);
  }
}
// ---------- everyday tells ----------
// Strong traits leak out in ordinary moments. Slow, never the same tell twice in a few years, and always tied to a place.
const EVERYDAY: Record<string, [string[], string[]]> = {
  creativity: [
    [
      'came up with a way of doing it nobody had thought of',
      'rebuilt the thing from scratch, just to see if it could be done differently',
      'had an idea at the meeting that half the room laughed at and the other half used',
    ],
    ['did it the way it had always been done, and said so', 'had no patience for a new way of doing it'],
  ],
  unconventionality: [
    [
      'turned up in something nobody else would have worn',
      'said the thing at dinner that made the table go quiet, and meant it',
      'has started doing it their own odd way again',
    ],
    ['thought the new way of doing things was nonsense', 'was the first to say how things ought to be done'],
  ],
  aesthetic: [
    [
      'stopped in the middle of the road to watch the light on the water',
      "spent a week's wages on a print for the wall",
      'went to the city for a concert and talked about it for a month',
    ],
    ['could not see what the fuss was about the new mural', 'painted over the old boathouse door without a second look'],
  ],
  socialSelfEsteem: [
    ['took the compliment without a fuss', 'shrugged off the gossip about them as if it were weather'],
    ['brushed off the praise as if it were meant for someone else', 'apologised for something nobody had noticed'],
  ],
  liveliness: [
    ['had the whole table laughing by the second round', 'was singing in the car park at closing time'],
    ['sat through the whole party without anyone noticing whether they were enjoying it', 'said "fine" to everything for a month'],
  ],
  inquisitiveness: [
    [
      'was asking the engineer how the new machine worked before anyone else had looked at it',
      'came back from the library with a stack of books on something nobody else cared about',
    ],
    ['had never once been to the city and saw no reason to go', 'changed the subject the moment it got complicated'],
  ],
  greedAvoidance: [
    ['turned down the bigger wage to stay where they were', 'drives the same old car and seems to like it'],
    ['asked what it paid before anything else', 'has been talking about the new car for weeks'],
  ],
  perfectionism: [
    ['redid what was already fine', 'stayed late straightening something nobody else would ever look at'],
    ['shipped it rough, as usual', 'left it at good enough, and it was'],
  ],
  flexibility: [
    ['went along with the others without a word', 'changed their plans for everyone else again'],
    ['argued the point to the end, again', 'refused to do it any other way'],
  ],
  prudence: [
    ['asked for a night to think about it', 'read the small print twice'],
    ['decided on the spot, again', 'bought it the day they saw it'],
  ],
  fearfulness: [
    ['would not go out on the water when the wind was up', 'stayed on the ground while the others climbed up to fix the roof'],
    ['climbed out onto the roof in the rain to fix the gutter', 'swam out past the buoys for a dare'],
  ],
  gentleness: [
    ['found something kind to say about the worst work anyone had seen', 'let the kid off with a word'],
    ['told the apprentice exactly what was wrong, in front of everyone', 'said what everyone thought and nobody said'],
  ],
};
function everydayTick(w: World, p: Person) {
  if (age(w, p) < 16 || !w.rng.chance(0.03) || w.t - (p.tried['every']?.t ?? -99) < 8) return;
  learned(w, p, 'every', true);
  // Every facet can show in the everyday: hand-written lines where they exist, the facet's own tells otherwise.
  const strong = FACETS.map(f => f.id).filter(k => Math.abs(facet(p, k)) > 1.1 && w.t - (p.tried['every:' + k]?.t ?? -99) > 30);
  if (!strong.length) return;
  const k = w.rng.pick(strong);
  const z = facet(p, k);
  const [hi, lo] = EVERYDAY[k] ?? [[FACET_BY_ID[k].hiTell], [FACET_BY_ID[k].loTell]];
  const n = p.tried['every:' + k]?.n ?? 0;
  learned(w, p, 'every:' + k, true);
  const pool = z > 0 ? hi : lo;
  const what = quirkLine(w, p, k, z, n) ?? pool[n % pool.length]; // their own oddity, every other time, when they have one
  const where = p.job ? w.placeById.get(p.job)!.name : null;
  const ctx = w.rng.pick([where ? `At ${where}, ` : '', 'Typical: ', 'People have noticed: ', '']);
  const e = addEvent(w, {
    type: 'everyday',
    who: [p.id],
    text: `${ctx}@${p.id} ${what}.`.replace(/^([a-z])/, c => c.toUpperCase()),
    causes: [traitCause(p, k, 1)],
    vis: 'local',
    evidence: [ev(p.id, k, Math.sign(z), 0.6, 0.55)],
    w: 0.4,
  });
  seenByClose(w, p, e);
  if (p.job) for (const q of live(w)) if (q.job === p.job && q !== p) e.knownBy.set(q.id, 'seen');
  broadcast(w, e);
}

export function timeTick(w: World) {
  for (const p of live(w)) {
    if (!OFF.has('pursuits')) pursuitTick(w, p);
    if (!OFF.has('habits')) habitTick(w, p);
    if (!OFF.has('everyday')) everydayTick(w, p);
  }
  for (const p of w.people) if (p.status !== 'dead' && (w.t + p.id) % 12 === 0) attachTick(w, p);
  for (const p of w.people) if (p.status !== 'dead' && (w.t + p.id) % 6 === 0) attachTells(w, p);
}
