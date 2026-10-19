import type { Feature } from '../features';
import { age, P, recentEvents } from '../world';
import { around } from '../scale';
import type { Instance } from '../grammar';
import type { SituationType } from './index';

// Newcomer: someone new in town, and how people take to a stranger.
export const newcomer: SituationType = {
  id: 'newcomer',
  match(w) {
    const out: Instance[] = [];
    const arrived = recentEvents(w, w.t - 1).filter(
      e => e.t === w.t - 1 && (e.type === 'arrived' || (e.type === 'home' && w.t - (P(w, e.who[0]).awaySince ?? w.t) > 60)),
    );
    for (const e of arrived) {
      const n = P(w, e.who[0]);
      if (n.status !== 'in') continue;
      const pool = around(w, n).filter(
        q => q !== n && age(w, q) >= 16 && (q.job === n.job || (q.job && w.placeById.get(q.job)!.people >= 0.8) || n.circle.includes(q.id)),
      );
      for (const q of w.rng.shuffle(pool).slice(0, 2))
        out.push({
          type: 'newcomer',
          actor: q,
          target: n,
          others: [],
          thing: '',
          features: new Set<Feature>(['stranger', 'public']),
          families: ['warmth', 'withdrawal'],
          only: { warmth: ['welcome'], withdrawal: ['coolto'] },
          cause: e.id,
          w: 0.9,
        });
    }
    return out;
  },
};
