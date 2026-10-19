import type { Feature } from '../features';
import { regard } from '../regard';
import { OFF, age, P, recentEvents } from '../world';
import { around, hoodOf, hoods, placeOf } from '../scale';
import { closeC, bondC, learned } from '../considerations';
import { type Instance, favour, family, reciprocity } from '../grammar';
import type { SituationType } from './index';

// The collection: the hat goes round at the venue for someone hit by illness or loss. Money and need, in the open.
export const collection: SituationType = {
  id: 'collection',
  match(w) {
    const out: Instance[] = [];
    const bar = w.placeById.get('bar');
    const hit = recentEvents(w, w.t - 2).filter(
      e => e.t < w.t && (e.type === 'ill' || e.type === 'accident' || (e.type === 'death' && e.who.length > 1)),
    );
    for (const e0 of hit) {
      const x = e0.type === 'death' ? P(w, e0.who[1]) : P(w, e0.who[0]);
      if (!x || x.status !== 'in' || (x.tried['collection']?.t ?? -99) > w.t - 24 || !w.rng.chance(0.5)) continue;
      learned(w, x, 'collection', true);
      const pool = around(w, x).filter(
        q =>
          q !== x &&
          age(w, q) >= 18 &&
          !family(q, x) &&
          q.partner !== x.id &&
          (OFF.has('respond') || regard(w, q.id, x.id) > -0.2) &&
          ((q.job && q.job === x.job) || q.circle.includes(x.id) || x.circle.includes(q.id) || q.friends.has(x.id) || w.rng.chance(0.15)),
      );
      for (const q of w.rng.shuffle(pool).slice(0, 3 + w.rng.int(0, 2))) {
        const back = OFF.has('reciprocity') ? [] : reciprocity(w, q, x);
        out.push({
          type: 'collection',
          actor: q,
          target: x,
          others: [],
          thing: '',
          features: new Set<Feature>(['public', 'money', 'need', ...(q.friends.has(x.id) ? ['friend' as Feature] : [])]),
          families: ['generosity', 'refusal'],
          only: { generosity: ['chipin', 'quietgive'], refusal: ['token', 'nowallet'] },
          cause: e0.id,
          place: (hoods(w) === 1 ? bar : (placeOf(w, 'bar', hoodOf(w, x)) ?? bar))?.name, // in a city, the bar of their own neighbourhood
          w: 0.9,
          extra: [
            favour(
              closeC('money', q.savings < 0 ? 'short of money' : 'money is fine', q.savings < 0 ? 0.85 : 0.25, -1, 0.3, undefined, 0.3),
              'generosity',
            ),
          ],
          familyExtra: { generosity: [...back.map(b => b.generosity), bondC(w, q, x, 'like', 1, 3)], refusal: back.map(b => b.refusal) },
        });
      }
    }
    return out;
  },
};
