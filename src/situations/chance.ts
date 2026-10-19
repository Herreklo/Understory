import { clamp } from '../rng';
import { onStage } from '../steer';
import type { Feature } from '../features';
import { SETTING } from '../setting';
import { age, live } from '../world';
import { facetC, stateC, learned } from '../considerations';
import { type Instance, favour } from '../grammar';
import type { SituationType } from './index';

// A chance for a talent: the open night at the Anchor.
export const chance: SituationType = {
  id: 'chance',
  match(w) {
    if (!w.rng.chance(0.08)) return [];
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (age(w, p) < 15) continue;
      // Round 25c: someone who has put their name down for it (a way to be heard) gets their turn soon, and plays what they practise.
      const staged = onStage(p);
      const sk = staged ? staged.target : SETTING.hobbies.find(h => p.skills[h] && p.skills[h].r > 1200 && p.skills[h].interest === 2);
      const seeking = p.wants.some(x => !x.done && x.kind === 'prove' && x.pursuit);
      if (
        !sk ||
        !w.rng.chance(staged ? 0.9 : seeking ? 0.6 : 0.3) ||
        (p.tried['chance']?.t ?? -99) > w.t - (staged ? 4 : (seeking ? 12 : 18) * (1 + Math.min(2, (p.tried['chance']?.n ?? 0) / 2)))
      )
        continue;
      learned(w, p, 'chance', true);
      out.push({
        type: 'chance',
        actor: p,
        others: [],
        thing: `a spot at the Anchor's open night`,
        features: new Set<Feature>(['public', 'watched', 'standing']),
        families: ['openness', 'reluctance'],
        only: { openness: ['seize'], reluctance: ['shyaway'] },
        causeLabel: `has been ${sk === 'vocals' ? 'singing' : `playing ${sk}`} for years`,
        place: 'the Anchor',
        w: 1.5,
        familyExtra: {
          openness: [
            facetC(p, 'aesthetic', new Set<Feature>(['public']), 1, 3),
            facetC(p, 'socialSelfEsteem', new Set<Feature>(['public', 'watched']), 1, 4),
          ],
          reluctance: [facetC(p, 'socialSelfEsteem', new Set<Feature>(['public', 'watched']), -1, 4)],
        },
        extra: [
          favour(
            stateC(
              'skill',
              `${sk} ${p.skills[sk].r > 1400 ? 'far better than anyone knows' : 'getting good'}`,
              clamp((p.skills[sk].r - 1150) / 400, 0, 1),
            ),
            'openness',
          ),
        ],
      });
    }
    return out;
  },
};
