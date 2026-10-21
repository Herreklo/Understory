import type { Feature } from '../features';
import { age, live, P, year, together } from '../world';
import { facetC, valueC, pubC, attachC } from '../considerations';
import { type Instance, favour } from '../grammar';
import type { Family } from '../families';
import type { SituationType } from './index';

// Offer from outside: work in the city.
export const offer: SituationType = {
  id: 'offer',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      const a = age(w, p);
      if (a < 19 || a > 50 || !w.rng.chance(0.012)) continue;
      const wants = p.wants.find(x => x.kind === 'escape' && !x.done);
      if (!wants && !(p.values.success > 0.8 && !p.lead) && !(p.job == null && !p.retired) && !((p.facets['attach:home'] ?? 0) < -0.7)) continue;
      const tied =
        p.partner != null ||
        p.kids.some(k => P(w, k).status === 'in' && age(w, P(w, k)) < 18) ||
        p.parents.some(k => P(w, k).status === 'in' && (P(w, k).ill > 0 || age(w, P(w, k)) > 74));
      const feats = new Set<Feature>(['private', 'freedom', 'money']);
      if (tied) feats.add('family');
      out.push({
        type: 'offer',
        actor: p,
        others: [],
        thing: 'a job in the city',
        features: feats,
        families: ['openness', 'reluctance'],
        only: { openness: ['take'], reluctance: ['decline'] },
        causeLabel: wants ? `had wanted out since ${year(wants.since)}` : p.job ? 'word came of work in the city' : 'no work here',
        // Round 40: turning it down, a want to get out (or having no work) is what argued the other way, said last; and not wanting to see
        // anywhere else is no reason for someone who wants out.
        ...(together()
          ? {
              against: (fam: Family) =>
                fam !== 'reluctance'
                  ? undefined
                  : wants
                    ? `though ${p.sex === 'f' ? 'she' : 'he'} had wanted out since ${year(wants.since)}`
                    : p.job == null
                      ? 'though there was no work here'
                      : undefined,
              hide: (fam: Family) => (fam === 'reluctance' && wants ? ['inquisitiveness'] : []),
            }
          : {}),
        extra: [favour(pubC('ties', tied ? 'people here depend on them' : 'nobody here depends on them', tied ? 0.9 : 0.1, -1, 0.15), 'openness')],
        familyExtra: {
          openness: [facetC(p, 'unconventionality', feats, 1, 3), valueC(p, wants ? wants.value : 'success'), attachC(p, -1)],
          reluctance: [attachC(p, 1)],
        },
        w: 2,
      });
    }
    return out;
  },
};
