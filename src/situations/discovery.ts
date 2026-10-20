import type { Feature } from '../features';
import { regard } from '../regard';
import { live, P } from '../world';
import { bondC } from '../considerations';
import { type Instance, friendsOf, family } from '../grammar';
import type { SituationType } from './index';
import { counterpart } from '../telling';

// Discovery: someone holding a secret decides what to do with it; someone's secret may get out.
export const discovery: SituationType = {
  id: 'discovery',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (!p.secrets.length || !w.rng.chance(0.08)) continue;
      const sid = p.secrets[p.secrets.length - 1];
      const se = w.events[sid];
      const pool = [...friendsOf(w, p), ...(p.partner != null ? [P(w, p.partner)] : [])].filter(q => !se.knownBy.has(q.id));
      if (!pool.length) continue;
      const q = counterpart(
        w,
        p.id,
        pool.length,
        () => pool.sort((a, b) => regard(w, p.id, b.id) - regard(w, p.id, a.id))[0],
        x => [x.id],
      );
      out.push({
        type: 'confide',
        actor: p,
        target: q,
        others: [],
        thing: 'it',
        features: new Set<Feature>(['private', family(p, q) ? 'family' : 'friend']),
        families: ['seeking', 'withdrawal'],
        only: { seeking: ['confide'], withdrawal: ['work', 'skip'] },
        causeLabel: 'carrying something nobody knew',
        familyExtra: { seeking: [bondC(w, p, q, 'trust', 1, 6, 0.55)] },
      });
    }
    return out;
  },
};
