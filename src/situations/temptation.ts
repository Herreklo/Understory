import type { Feature } from '../features';
import { SETTING } from '../setting';
import { age, live, P } from '../world';
import { staffOf, typeOf } from '../scale';
import { stateC, bondC } from '../considerations';
import { type Instance, favour } from '../grammar';
import type { SituationType } from './index';

// Temptation: access to something that isn't yours, unobserved.
export const temptation: SituationType = {
  id: 'temptation',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (!p.job || age(w, p) < 18 || !w.rng.chance(0.012)) continue;
      const pl = w.placeById.get(p.job)!;
      const money = w.rng.chance(0.55);
      const thing = money ? (SETTING.resources[typeOf(pl)] ?? 'the till') : 'a mistake at work'; // a place opened in the present (a café) has a till
      const feats = new Set<Feature>(['private', money ? 'money' : 'standing']);
      if (!money) feats.add('challenged');
      const lead = pl.lead != null && pl.lead !== p.id ? P(w, pl.lead) : null;
      const coworker = staffOf(w, p.job).find(q => q.job === p.job && q !== p && q !== lead);
      out.push({
        type: 'temptation',
        actor: p,
        target: money ? undefined : coworker,
        others: [],
        thing,
        features: feats,
        families: money ? ['dishonesty', 'honesty'] : ['dishonesty', 'honesty'],
        place: pl.name,
        extra: [favour(stateC('money', p.savings < 0 ? 'in debt' : 'money is fine', p.savings < 0 ? 0.9 : 0.25), 'dishonesty')],
        familyExtra: lead ? { dishonesty: [bondC(w, p, lead, 'respect', -1)] } : undefined,
        maxIntensity: money ? 0.6 : 1,
        // Round H25: without money in it, taking a little is not one of the answers (skimming is the one act at 0.6).
        minIntensity: money ? 0.5 : 0.65,
      });
    }
    return out;
  },
};
