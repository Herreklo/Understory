import type { Feature } from '../features';
import { age, live, P, topSources } from '../world';
import { bondC, learned } from '../considerations';
import type { Instance } from '../grammar';
import { asked } from './asked';
import type { SituationType } from './index';

// Home truths: someone close asks how things really are. Family, in private, and something to hide.
export const hometruth: SituationType = {
  id: 'hometruth',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (age(w, p) < 16 || p.stress < 0.35 || !w.rng.chance(0.03) || (p.tried['hometruth']?.t ?? -99) > w.t - 12) continue;
      const close = [...(p.partner != null ? [P(w, p.partner)] : []), ...p.parents.map(k => P(w, k))].filter(q => q.status === 'in');
      if (!close.length) continue;
      const q = close[0];
      const src = topSources(p, 1)[0];
      if (!src) continue;
      learned(w, p, 'hometruth', true);
      // If this person looked away from the trouble a few months ago, asking now is a turn, and the text says so; in the first weeks after, nobody asks.
      const looked = q.tried['lookaway:' + p.id];
      if (looked && w.t - looked.t < 3) continue;
      const turn = looked && w.t - looked.t <= 18;
      out.push({
        type: 'hometruth',
        actor: p,
        target: q,
        others: [],
        thing: src.label,
        features: new Set<Feature>(['family', 'private', ...(p.stress > 0.6 ? ['tired' as Feature] : [])]),
        families: ['honesty', 'dishonesty'],
        only: { honesty: ['admit'], dishonesty: ['allfine'] },
        causeLabel: turn ? `@${q.id} had said nothing for months, then asked how things really were` : `@${q.id} asked how things really were`,
        w: 0.9,
        familyExtra: { honesty: [bondC(w, p, q, 'trust', 1)] },
      });
    }
    return out;
  },
};
