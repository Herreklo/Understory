import type { Feature } from '../features';
import { regard } from '../regard';
import { age, live, P } from '../world';
import { stateC, lastTime } from '../considerations';
import { type Instance, friendsOf, family } from '../grammar';
import type { SituationType } from './index';
import { counterpart } from '../telling';

// Request: someone in need asks someone who can help.
export const request: SituationType = {
  id: 'request',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (age(w, p) < 18 || !(p.savings < -2 || (p.ill > 0 && p.partner == null)) || !w.rng.chance(0.15)) continue;
      if (w.t - (p.tried['fam:seeking']?.t ?? -99) < 5) continue;
      const need = p.savings < -2 ? 'money' : 'help';
      const pool = [
        ...friendsOf(w, p),
        ...p.circle.map(i => P(w, i)).filter(q => q.status === 'in'),
        ...(p.partner != null ? [P(w, p.partner)] : []),
      ].filter(q => q !== p && !(p.tried['ask:' + q.id] && (!p.tried['ask:' + q.id].ok || w.t - p.tried['ask:' + q.id].t < 24)));
      if (!pool.length) continue;
      const q = counterpart(
        w,
        p.id,
        pool.length,
        () => pool.sort((a, b) => regard(w, p.id, b.id) - regard(w, p.id, a.id))[0],
        x => [x.id],
      );
      const feats = new Set<Feature>(['private', 'need', need === 'money' ? 'money' : 'safety', family(p, q) ? 'family' : 'friend']);
      out.push({
        type: 'request',
        actor: p,
        target: q,
        others: [],
        thing: need === 'money' ? 'money' : 'help',
        features: feats,
        families: ['seeking', 'withdrawal'],
        only: { seeking: ['ask', 'hint'], withdrawal: ['work', 'skip'] },
        causeLabel: need === 'money' ? (p.savings < -8 ? 'badly in debt' : 'in debt') : 'ill, and alone',
        familyExtra: {
          seeking: [stateC('need', p.savings < -8 ? 'desperate' : 'struggling', p.savings < -8 ? 0.95 : 0.5), lastTime(p, 'ask', 'asking for help')],
        },
      });
    }
    return out;
  },
};
