import type { Feature } from '../features';
import { live, facet } from '../world';
import { staffOf } from '../scale';
import { facetC, pubC, learned } from '../considerations';
import type { Instance } from '../grammar';
import type { SituationType } from './index';

// Criticised: a coworker questions their work in front of everyone.
export const criticised: SituationType = {
  id: 'criticised',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (!p.job || !w.rng.chance(0.005) || (p.tried['criticised']?.t ?? -99) > w.t - 18) continue;
      const others = staffOf(w, p.job).filter(q => q.job === p.job && q !== p);
      if (!others.length) continue;
      const q = others.sort((a, b) => facet(a, 'gentleness') - facet(b, 'gentleness'))[0];
      if (facet(q, 'gentleness') > 0.5 && !w.rng.chance(0.3)) continue;
      learned(w, p, 'criticised', true);
      out.push({
        type: 'criticised',
        actor: p,
        target: q,
        others: [],
        thing: '',
        features: new Set<Feature>(['public', 'challenged', 'standing', ...(q.lead ? ['authority' as Feature] : [])]),
        families: ['anger', 'humility', 'pride'],
        only: { anger: ['snap', 'quietword', 'sarcasm', 'cold'], humility: ['swallow', 'giveway'], pride: ['confront', 'digin'] },
        causeLabel: `@${q.id} picked @${p.id}'s work apart in front of everyone`,
        place: w.placeById.get(p.job)!.name,
        w: 0.9,
        familyExtra: {
          humility: [
            pubC('fair', p.perf < -0.3 ? 'the criticism was fair' : 'the criticism was unfair', p.perf < -0.3 ? 0.8 : 0.25),
            facetC(p, 'socialSelfEsteem', new Set<Feature>(['public', 'challenged']), -1, 4),
          ],
          anger: [pubC('unfair', p.perf < -0.3 ? 'the criticism was fair' : 'the criticism was unfair', p.perf < -0.3 ? 0.2 : 0.75)],
        },
      });
    }
    return out;
  },
};
