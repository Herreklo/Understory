import type { Feature } from '../features';
import { projectLabel, placePlan } from '../projects';
import { OFF, P } from '../world';
import { staffOf } from '../scale';
import { bondC, learned } from '../considerations';
import type { Instance } from '../grammar';
import type { SituationType } from './index';

// Asked: the boss wants an honest opinion. Authority, in private.
export const asked: SituationType = {
  id: 'asked',
  match(w) {
    const out: Instance[] = [];
    for (const pl of w.places) {
      if (pl.lead == null || !w.rng.chance(0.022)) continue;
      const lead = P(w, pl.lead);
      const staff = staffOf(w, pl.id).filter(p => p.job === pl.id && p !== lead);
      if (!staff.length) continue;
      const p = w.rng.pick(staff);
      if ((p.tried['asked']?.t ?? -99) > w.t - 12) continue;
      learned(w, p, 'asked', true);
      const plan = OFF.has('projects') ? undefined : (projectLabel(w, lead) ?? placePlan(w, pl)); // a real plan: the boss's own, or the workplace's
      out.push({
        type: 'asked',
        actor: p,
        target: lead,
        others: [],
        thing: plan ? plan.replace(/^(her|his) plan /, 'the plan ').replace(/^the plan (.*)$/, 'the plan $1') : 'the plan',
        features: new Set<Feature>(['authority', 'private', 'standing']),
        families: ['honesty', 'dishonesty'],
        only: { honesty: ['straighttalk'], dishonesty: ['flatter'] },
        causeLabel: `@${lead.id} asked what ${p.sex === 'f' ? 'she' : 'he'} really thought of ${plan ?? 'the plan'}`,
        w: 0.9,
        familyExtra: { dishonesty: [bondC(w, p, lead, 'trust', -1)], honesty: [bondC(w, p, lead, 'respect', 1)] },
      });
    }
    return out;
  },
};
