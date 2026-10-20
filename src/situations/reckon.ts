import type { Feature } from '../features';
import { age, live } from '../world';
import { hash } from '../rng';
import { bondC, stateC } from '../considerations';
import type { Instance } from '../grammar';
import type { SituationType } from './index';
import { reckonable, carrierDid } from '../carry';

// The reckoning: a friend who has carried a friendship for a year, and minds, faces it once. Says it straight, asks for something
// back, or stops going round; the other answers (effects.ts). One friendship a month at most, the one minded most.
export const reckon: SituationType = {
  id: 'reckon',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (age(w, p) < 16) continue;
      const cands = reckonable(w, p);
      if (!cands.length || !w.rng.chance(0.25)) continue;
      const { other: q, c, m } = cands.sort((x, y) => y.m - x.m)[0];
      const did = carrierDid(c, p.id, q.id);
      // What is asked back, if it comes to that; said by the answer ("gave @p a hand with the roof").
      const back = ['a hand with the roof', 'a day of help with the garden', 'a hand moving the furniture', 'the loan of the car for a day'][
        hash(w.seed, p.id, q.id, w.t) % 4
      ];
      out.push({
        type: 'reckon',
        actor: p,
        target: q,
        others: [],
        thing: did,
        features: new Set<Feature>(['private', 'friend']),
        families: ['honesty', 'seeking', 'withdrawal'],
        only: { honesty: ['sayit'], seeking: ['askback'], withdrawal: ['stopgoing'] },
        causeLabel: `was always the one who ${did}, never @${q.id}`,
        extra: [stateC('minds', m > 0.75 ? 'had had enough of it' : 'had begun to mind', m, 1, 0.3)],
        familyExtra: {
          honesty: [bondC(w, p, q, 'trust', 1)],
          seeking: [bondC(w, p, q, 'like', 1)],
          withdrawal: [bondC(w, p, q, 'like', -1)],
        },
        w: 1.2,
        back,
      } as Instance & { back: string });
    }
    return out;
  },
};
