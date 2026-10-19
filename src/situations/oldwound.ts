import type { Feature } from '../features';
import { type Person, age, live, peekBond, year } from '../world';
import { around } from '../scale';
import { ev, facetC, bondC, learned } from '../considerations';
import { type Instance, family } from '../grammar';
import type { SituationType } from './index';

// The old wound: months after a slight, the two meet again where others can see. Forgiveness shows.
export const oldwound: SituationType = {
  id: 'oldwound',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (age(w, p) < 16 || !w.rng.chance(0.06)) continue;
      const cands: [Person, { t: number; ev: number; text: string }][] = [];
      for (const q of around(w, p)) {
        if (q === p || (p.tried['oldwound:' + q.id]?.t ?? -99) > w.t - 24) continue;
        const shared = (p.job && p.job === q.job) || p.circle.includes(q.id) || (p.group != null && p.group === q.group);
        if (!shared) continue;
        const r = peekBond(w, p.id, q.id);
        if (!r) continue;
        const m = r.mem
          .filter(m => m.like + m.trust < -0.15 && w.t - m.t >= 3 && w.t - m.t <= 24 && m.ev >= 0)
          .sort((a, b) => a.like + a.trust - (b.like + b.trust))[0];
        if (m) cands.push([q, m]);
      }
      if (!cands.length) continue;
      const [q, m] = w.rng.pick(cands);
      learned(w, p, 'oldwound:' + q.id, true);
      const pub = !!(p.job && p.job === q.job);
      out.push({
        type: 'oldwound',
        actor: p,
        target: q,
        others: [],
        thing: `what @${q.id} did ${w.t - m.t >= 9 ? 'last year' : 'a few months back'}`,
        features: new Set<Feature>([
          pub ? 'public' : 'private',
          'standing',
          ...(p.friends.has(q.id) ? ['friend' as Feature] : []),
          ...(family(p, q) ? ['family' as Feature] : []),
        ]),
        families: ['leniency', 'severity'],
        only: { leniency: ['letgo'], severity: ['rake'] },
        cause: m.ev,
        place: pub ? w.placeById.get(p.job!)!.name : undefined,
        w: 0.9,
        familyExtra: {
          leniency: [facetC(p, 'forgiveness', new Set<Feature>([pub ? 'public' : 'private']), 1, 6), bondC(w, p, q, 'like', 1, 3)],
          severity: [facetC(p, 'forgiveness', new Set<Feature>([pub ? 'public' : 'private']), -1, 6), bondC(w, p, q, 'like', -1, 3)],
        },
      });
    }
    return out;
  },
};
