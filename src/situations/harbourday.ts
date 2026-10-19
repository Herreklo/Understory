import type { Feature } from '../features';
import type { Family } from '../families';
import { type World, type Person, age, live, P, facet, remember, addEvent, broadcast, addStress, addEmotion } from '../world';
import { hoodOf, hoods, near, placeOf } from '../scale';
import { traitCause, eventCause, ev, stateC } from '../considerations';
import { type Instance, run, favour } from '../grammar';
import type { SituationType } from './index';

// The harbour day: once a year someone has to organise it. Who steps up, and whether the day runs, is public.
export const harbourday: SituationType = {
  id: 'harbourday',
  match(w) {
    if (w.t % 12 !== 4 || w.t < w.startPresent - 120) return [];
    const bar = w.placeById.get('bar');
    const pool = w.rng.shuffle(live(w).filter(p => age(w, p) >= 20 && age(w, p) < 70 && !p.ill)).slice(0, 5);
    (w as any).harbourPool = pool.slice(1);
    (w as any).harbourOrganiser = undefined;
    return pool.slice(0, 1).map(p => harbourAsk(w, p));
  },
};

export function harbourAsk(w: World, p: Person): Instance {
  const bar = w.placeById.get('bar');
  return {
    type: 'harbourday',
    actor: p,
    others: [],
    thing: '',
    features: new Set<Feature>(['public', 'standing', 'pressure']),
    families: ['duty', 'lapse'] as Family[],
    only: { duty: ['stepup'], lapse: ['leaveit'] },
    causeLabel: 'the harbour day needed someone to run it',
    place: (hoods(w) === 1 ? bar : (placeOf(w, 'bar', hoodOf(w, p)) ?? bar))?.name,
    w: 0.8,
    extra: [favour(stateC('load', p.stress > 0.5 ? 'already stretched' : 'had room for it', p.stress, -1, 0.3), 'duty')],
  };
}
// The harbour day itself, a month after someone took it on: organisation and diligence, with everyone there.
export function harbourDay(w: World) {
  const org = (w as any).harbourOrganiser as { id: number; t: number; ev: number } | undefined;
  if (!org) return;
  if (w.t - org.t < 1) return;
  (w as any).harbourOrganiser = undefined;
  const p = P(w, org.id);
  if (p.status !== 'in') return;
  const z = 0.7 * facet(p, 'organisation') + 0.4 * facet(p, 'diligence') - 0.3 * Math.max(0, p.stress - 0.5) + w.rng.normal() * 0.5 * p.variability;
  if (Math.abs(z) < 0.35) {
    const e = addEvent(w, {
      type: 'harbour:ok',
      who: [p.id],
      text: `The harbour day went off well enough, with @${p.id} running it.`,
      causes: [eventCause(w, org.ev, 0.6), traitCause(p, 'organisation', 0.4)],
      vis: 'public',
      evidence: [ev(p.id, 'organisation', Math.sign(z) || 1, 0.3, 0.6)],
      w: 0.8,
    });
    broadcast(w, e);
    return;
  }
  const good = z > 0;
  const e = addEvent(w, {
    type: good ? 'harbour:ran' : 'harbour:chaos',
    who: [p.id],
    text: good
      ? `The harbour day ran like clockwork; @${p.id} had a list for everything.`
      : `The harbour day was chaos: nobody knew where the tables were, and @${p.id} was nowhere to be found.`,
    causes: [eventCause(w, org.ev, 0.5), traitCause(p, 'organisation', 0.5, good ? 1 : -1), traitCause(p, 'diligence', 0.3, good ? 1 : -1)],
    vis: 'public',
    evidence: [ev(p.id, 'organisation', good ? 1 : -1, 1, 0.85), ev(p.id, 'diligence', good ? 1 : -1, 0.5, 0.6)],
    w: 1.4,
  });
  broadcast(w, e);
  for (const q of w.rng.shuffle(near(w, p.id).filter(q => q !== p && age(w, q) >= 16)).slice(0, 6))
    remember(w, q, p, e.id, good ? 0.08 : -0.06, good ? 0.2 : -0.2, good ? 0.05 : -0.05, good ? 'ran the harbour day' : 'the harbour day fiasco');
  if (good) addEmotion(w, p, 'harbour', 'proud of the day', 0.12, 6, e.id);
  else {
    addStress(p, 'harbour', 'the harbour day', 0.08, e.id);
    addEmotion(w, p, 'harbour', 'embarrassed about the day', -0.1, 6, e.id);
  }
}
