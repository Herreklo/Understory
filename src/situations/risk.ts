import type { Feature } from '../features';
import type { Family } from '../families';
import { live } from '../world';
import { stateC } from '../considerations';
import { favour } from '../grammar';
import type { SituationType } from './index';

// Risk for gain: the fleet in a storm.
export const risk: SituationType = {
  id: 'risk',
  match(w) {
    if (!w.rng.chance(0.03)) return [];
    return live(w)
      .filter(p => p.job != null && (p.job === 'harbour' || (w.placeById.get(p.job) as any)?.type === 'harbour')) // every fleet in the monthly world
      .map(p => ({
        type: 'risk',
        actor: p,
        others: [],
        thing: 'out into the storm',
        features: new Set<Feature>(['danger', 'money', 'public']),
        families: ['courage', 'caution'] as Family[],
        only: { courage: ['go'], caution: ['hangback'] },
        causeLabel: 'a storm came in',
        extra: [favour(stateC('money', p.savings < 3 ? 'needs the money' : 'can afford to wait', p.savings < 3 ? 0.9 : 0.3), 'courage')],
        w: 1,
      }));
  },
};
