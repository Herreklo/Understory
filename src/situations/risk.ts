import type { Feature } from '../features';
import { SETTING } from '../setting';
import type { Family } from '../families';
import { live } from '../world';
import { stateC } from '../considerations';
import { favour } from '../grammar';
import type { SituationType } from './index';

// Risk for gain: the setting's risky trade goes out in bad weather for the money.
export const risk: SituationType = {
  id: 'risk',
  match(w) {
    if (!w.rng.chance(0.03)) return [];
    return live(w)
      .filter(p => p.job != null && (p.job === SETTING.risk.place || (w.placeById.get(p.job) as any)?.type === SETTING.risk.place)) // every one in the monthly world
      .map(p => ({
        type: 'risk',
        actor: p,
        others: [],
        thing: SETTING.risk.thing,
        features: new Set<Feature>(['danger', 'money', 'public']),
        families: ['courage', 'caution'] as Family[],
        only: { courage: ['go'], caution: ['hangback'] },
        causeLabel: SETTING.risk.cause,
        extra: [favour(stateC('money', p.savings < 3 ? 'needs the money' : 'can afford to wait', p.savings < 3 ? 0.9 : 0.3), 'courage')],
        w: 1,
      }));
  },
};
