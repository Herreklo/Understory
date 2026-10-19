import { SETTING } from '../setting';
import type { Feature } from '../features';
import type { Family } from '../families';
import { type World, type Person, age, live, P, facet, remember, addEvent, broadcast, addStress, addEmotion } from '../world';
import { hoodOf, hoods, near, placeOf } from '../scale';
import { traitCause, eventCause, ev, stateC } from '../considerations';
import { type Instance, run, favour } from '../grammar';
import type { SituationType } from './index';

// The setting's yearly day: someone has to organise it. Who steps up, and whether the day runs, is public.
export const yearly: SituationType = {
  id: SETTING.yearly.id,
  match(w) {
    if (w.t % 12 !== SETTING.yearly.month || w.t < w.startPresent - 120) return [];
    const bar = w.placeById.get('bar');
    const pool = w.rng.shuffle(live(w).filter(p => age(w, p) >= 20 && age(w, p) < 70 && !p.ill)).slice(0, 5);
    (w as any).yearlyPool = pool.slice(1);
    (w as any).yearlyOrganiser = undefined;
    return pool.slice(0, 1).map(p => yearlyAsk(w, p));
  },
};

export function yearlyAsk(w: World, p: Person): Instance {
  const bar = w.placeById.get('bar');
  return {
    type: SETTING.yearly.id,
    actor: p,
    others: [],
    thing: '',
    features: new Set<Feature>(['public', 'standing', 'pressure']),
    families: ['duty', 'lapse'] as Family[],
    only: { duty: ['stepup'], lapse: ['leaveit'] },
    causeLabel: `${SETTING.yearly.name} needed someone to run it`,
    place: (hoods(w) === 1 ? bar : (placeOf(w, 'bar', hoodOf(w, p)) ?? bar))?.name,
    w: 0.8,
    extra: [favour(stateC('load', p.stress > 0.5 ? 'already stretched' : 'had room for it', p.stress, -1, 0.3), 'duty')],
  };
}
// The day itself, a month after someone took it on: organisation and diligence, with everyone there.
const DAY = SETTING.yearly.name[0].toUpperCase() + SETTING.yearly.name.slice(1); // at the start of a sentence
export function yearlyDay(w: World) {
  const org = (w as any).yearlyOrganiser as { id: number; t: number; ev: number } | undefined;
  if (!org) return;
  if (w.t - org.t < 1) return;
  (w as any).yearlyOrganiser = undefined;
  const p = P(w, org.id);
  if (p.status !== 'in') return;
  const z = 0.7 * facet(p, 'organisation') + 0.4 * facet(p, 'diligence') - 0.3 * Math.max(0, p.stress - 0.5) + w.rng.normal() * 0.5 * p.variability;
  if (Math.abs(z) < 0.35) {
    const e = addEvent(w, {
      type: `${SETTING.yearly.key}:ok`,
      who: [p.id],
      text: `${DAY} went off well enough, with @${p.id} running it.`,
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
    type: `${SETTING.yearly.key}:${good ? 'ran' : 'chaos'}`,
    who: [p.id],
    text: good
      ? `${DAY} ran like clockwork; @${p.id} had a list for everything.`
      : `${DAY} was chaos: nobody knew where the tables were, and @${p.id} was nowhere to be found.`,
    causes: [eventCause(w, org.ev, 0.5), traitCause(p, 'organisation', 0.5, good ? 1 : -1), traitCause(p, 'diligence', 0.3, good ? 1 : -1)],
    vis: 'public',
    evidence: [ev(p.id, 'organisation', good ? 1 : -1, 1, 0.85), ev(p.id, 'diligence', good ? 1 : -1, 0.5, 0.6)],
    w: 1.4,
  });
  broadcast(w, e);
  for (const q of w.rng.shuffle(near(w, p.id).filter(q => q !== p && age(w, q) >= 16)).slice(0, 6))
    remember(
      w,
      q,
      p,
      e.id,
      good ? 0.08 : -0.06,
      good ? 0.2 : -0.2,
      good ? 0.05 : -0.05,
      good ? `ran ${SETTING.yearly.name}` : `${SETTING.yearly.name} fiasco`,
    );
  if (good) addEmotion(w, p, SETTING.yearly.key, 'proud of the day', 0.12, 6, e.id);
  else {
    addStress(p, SETTING.yearly.key, SETTING.yearly.name, 0.08, e.id);
    addEmotion(w, p, SETTING.yearly.key, 'embarrassed about the day', -0.1, 6, e.id);
  }
}
