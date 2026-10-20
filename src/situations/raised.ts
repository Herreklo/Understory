// Situations other systems raise directly: contests, judgements, losses.

import { clamp } from '../rng';
import { FEATURE_WORDS, type Feature } from '../features';
import { regard } from '../regard';
import { type World, type Person, age, P, facet, remember, addEvent, broadcast, year, logistic } from '../world';
import { staffOf } from '../scale';
import { traitCause, eventCause, ev, stateC, pubC, bondC, learned } from '../considerations';
import { type Instance, run, friendsOf, favour } from '../grammar';

// Situations other systems raise directly (contests, judgements, losses).
// `opts` (round 38, a place in a band): since when they had wanted it, and the answers pride allows (no job to walk out of).
export function contestLost(
  w: World,
  loser: Person,
  winner: Person,
  place: any,
  ref: number,
  deserved: boolean,
  wanted: boolean,
  opts?: { since?: number; pride?: string[] },
) {
  const feats = new Set<Feature>(['public', 'standing', 'authority']);
  const inst: Instance = {
    type: 'contest',
    actor: loser,
    target: winner,
    others: [],
    thing: place.title,
    features: feats,
    families: ['pride', 'humility', 'anger'],
    only: { humility: ['congratulate', 'swallow'], pride: opts?.pride ?? ['confront', 'sulk', 'quitpride'] },
    cause: ref,
    place: place.name,
    w: 1.6,
    extra: [
      favour(
        pubC(
          'sting',
          deserved
            ? `had been doing the better work`
            : wanted
              ? `had wanted it since ${year(opts?.since ?? loser.wants.find(x => x.kind === 'attain' && x.target === place.id)?.since ?? w.t)}`
              : 'had hoped',
          deserved ? 0.9 : wanted ? 0.7 : 0.4,
        ),
        'pride',
        'anger',
      ),
    ],
    familyExtra: {
      pride: [bondC(w, loser, winner, 'respect', -1)],
      humility: [bondC(w, loser, winner, 'like', 1)],
      anger: [bondC(w, loser, winner, 'like', -1)],
    },
  };
  const o = run(w, inst);
  if (!o) return;
  if (o.expr.id === 'confront' && facet(winner, 'patience', loser.id, feats) < -0.5) {
    const e2 = addEvent(w, {
      type: 'row',
      who: [winner.id, loser.id],
      text: `It turned into a shouting match in front of everyone at ${place.name}.`,
      causes: [eventCause(w, o.event.id, 0.6), traitCause(winner, 'patience', 0.4, -1)],
      vis: 'local',
      evidence: [ev(winner.id, 'patience', -1, 1, 0.9)],
      w: 1.5,
    });
    broadcast(w, e2);
    remember(w, loser, winner, e2.id, -0.3, -0.2, -0.1, 'shouted me down');
  }
  return o;
}

export function judgement(w: World, lead: Person, s: Person, place: any): 'dismiss' | 'dressdown' | 'secondchance' | null {
  if ((lead.tried['judged:' + s.id]?.t ?? -99) > w.t - 12) return null;
  learned(w, lead, 'judged:' + s.id, true);
  const inst: Instance = {
    type: 'judgement',
    actor: lead,
    target: s,
    others: [],
    thing: place.name,
    features: new Set<Feature>(['authority', 'standing', 'public']),
    families: ['severity', 'leniency'],
    only: { severity: ['dismiss', 'dressdown'], leniency: ['secondchance'] },
    place: place.name,
    causeLabel: `@${s.id}'s work had been poor for months`,
    w: 1.5,
    familyExtra: {
      severity: [bondC(w, lead, s, 'like', -1), pubC('perf', `@${s.id}'s work has been poor for months`, clamp((-s.perf - 0.5) / 1.5, 0, 1))],
      leniency: [bondC(w, lead, s, 'like', 1)],
    },
  };
  const o = run(w, inst);
  if (!o) return null;
  if (o.expr.id === 'dressdown') {
    // Someone may stand up for them.
    const ally = staffOf(w, s.job)
      .filter(q => q.job === s.job && q !== s && q !== lead && regard(w, q.id, s.id) > -0.1)
      .sort((a, b) => regard(w, b.id, s.id) - regard(w, a.id, s.id))[0];
    if (ally) {
      const o2 = run(w, {
        type: 'standup',
        actor: ally,
        target: s,
        others: [lead],
        thing: '',
        features: new Set<Feature>(['public', 'authority', 'need']),
        families: ['courage', 'caution'],
        only: { courage: ['speakup'], caution: ['keepquiet'] },
        cause: o.event.id,
        place: place.name,
        familyExtra: { courage: [bondC(w, ally, s, 'like', 1)], caution: [bondC(w, ally, lead, 'respect', 1)] },
        w: 1.3,
      });
      if (o2 && o2.family === 'courage') {
        remember(w, lead, ally, o2.event.id, -0.15, 0.1, 0, 'took the other side');
      }
    }
  }
  return o.expr.id as any;
}
export function loss(w: World, p: Person, ref: number, what: string) {
  // The bereaved cope; their friends show up, or don't.
  const feats = new Set<Feature>(['private', 'tired']);
  const to = p.partner != null ? P(w, p.partner) : (friendsOf(w, p)[0] ?? p.kids.map(k => P(w, k)).find(k => k.status === 'in' && age(w, k) >= 16));
  w.queue.push({
    type: 'loss',
    actor: p,
    target: to,
    others: [],
    thing: 'it',
    features: feats,
    families: to ? ['seeking', 'withdrawal'] : ['withdrawal'],
    only: { seeking: ['confide', 'call'], withdrawal: ['work', 'shutout', 'numb', 'skip'] },
    cause: ref,
    causeLabel: what,
    maxIntensity: 0.7,
  });
  for (const f of friendsOf(w, p)
    .sort((a, b) => regard(w, b.id, p.id) - regard(w, a.id, p.id))
    .slice(0, 3))
    w.queue.push({
      type: 'support',
      actor: f,
      target: p,
      others: [],
      thing: '',
      features: new Set<Feature>(['private', 'need', 'friend']),
      families: ['warmth', 'lapse'],
      only: { warmth: ['visit', 'show'], lapse: ['absent'] },
      cause: ref,
      w: 1,
      familyExtra: {
        warmth: [bondC(w, f, p, 'like', 1)],
        lapse: [stateC('own', f.stress > 0.5 ? 'had troubles of their own' : 'had the time', f.stress > 0.5 ? 0.7 : 0.15)],
      },
    });
}
export { FEATURE_WORDS, logistic };
