import type { Feature } from '../features';
import { year } from '../world';
import { staffOf } from '../scale';
import { facetC, stateC, learned } from '../considerations';
import { type Instance, favour } from '../grammar';
import type { SituationType } from './index';

// Deadline: a rush job lands on a workplace. Pressure, in public, with the boss watching.
export const deadline: SituationType = {
  id: 'deadline',
  match(w) {
    const out: Instance[] = [];
    for (const pl of w.places) {
      if (!w.rng.chance(0.009)) continue;
      const staff = w.rng.shuffle(staffOf(w, pl.id).filter(p => p.job === pl.id && !p.lead)).slice(0, 3);
      const job = w.rng.pick(['the big order', 'the audit', 'the inspection', 'the end-of-year figures', 'the rush job']);
      for (const p of staff) {
        if ((p.tried['deadline']?.t ?? -99) > w.t - 10) continue;
        learned(w, p, 'deadline', true);
        const feats = new Set<Feature>([
          'pressure',
          'public',
          ...(pl.lead != null ? ['authority' as Feature] : []),
          ...(p.stress > 0.5 ? ['tired' as Feature] : []),
        ]);
        out.push({
          type: 'deadline',
          actor: p,
          others: [],
          thing: job,
          features: feats,
          families: ['duty', 'lapse'],
          only: { duty: ['deliver', 'allnighter', 'redo'], lapse: ['late', 'rough'] },
          causeLabel: `${job} landed on ${pl.name}`,
          place: pl.name,
          w: 1,
          familyExtra: { duty: [facetC(p, 'perfectionism', feats, 1, 4)] },
          extra: [favour(stateC('load', p.stress > 0.5 ? 'already stretched' : 'had room for it', p.stress, -1, 0.3), 'duty')],
        });
      }
    }
    return out;
  },
};
