import type { Feature } from '../features';
import { type Person, age, live, P, topSources } from '../world';
import { staffOf } from '../scale';
import { stateC, bondC, learned } from '../considerations';
import { type Instance, friendsOf, family } from '../grammar';
import type { SituationType } from './index';

// Strain: pressure leaking out in small ways, and rarely breaking.
export const strain: SituationType = {
  id: 'strain',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (age(w, p) < 14 || p.stress < 0.45) continue;
      const breaking = p.stress > 0.85 && w.t - p.lastBreak > 12 && w.rng.chance(0.08);
      if (!breaking && (w.t - (p.tried['strain']?.t ?? -99) < 5 || !w.rng.chance(0.2))) continue;
      learned(w, p, 'strain', true);
      if (breaking) p.lastBreak = w.t;
      const srcs = topSources(p, 3);
      const targets: Person[] = [];
      if (p.partner != null) targets.push(P(w, p.partner));
      if (p.job) for (const q of staffOf(w, p.job)) if (q.job === p.job && q !== p) targets.push(q);
      for (const k of p.kids) {
        const c = P(w, k);
        if (c.status === 'in' && age(w, c) < 18) targets.push(c);
      }
      targets.push(...friendsOf(w, p));
      const t = targets.length ? w.rng.pick(targets) : undefined;
      const feats = new Set<Feature>(['tired', 'pressure']);
      if (t && t.job === p.job && p.job) feats.add('public');
      else feats.add('private');
      if (t && (family(p, t) || p.partner === t.id)) feats.add('family');
      else if (t && p.friends.has(t.id)) feats.add('friend');
      out.push({
        type: 'strain',
        actor: p,
        target: t,
        others: [],
        thing: 'help',
        features: feats,
        families: t ? ['anger', 'withdrawal', 'seeking'] : ['withdrawal'],
        causeLabel: `strain had been building: ${srcs.map(s => s.label).join(', ')}`,
        place: p.job && t?.job === p.job ? w.placeById.get(p.job)!.name : undefined,
        maxIntensity: breaking ? 1 : 0.5,
        familyExtra: {
          anger: t ? [bondC(w, p, t, 'like', -1)] : [],
          seeking: [t ? bondC(w, p, t, 'trust', 1) : stateC('alone', 'has nobody to turn to', 0.05)],
        },
        w: breaking ? 2 : undefined,
      });
    }
    return out;
  },
};
