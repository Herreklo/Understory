import { clamp } from '../rng';
import type { Feature } from '../features';
import { addEvent, broadcast, addEmotion } from '../world';
import { hoods, staffOf, typeOf } from '../scale';
import { stateCause, bondC } from '../considerations';
import type { Instance } from '../grammar';
import type { SituationType } from './index';

// Danger: an accident at work, and who goes in.
export const danger: SituationType = {
  id: 'danger',
  match(w) {
    const out: Instance[] = [];
    const kinds = ['mill', 'garage', 'harbour'];
    // a town has one of each; a city, every sawmill, garage and fleet in the monthly world
    for (const pl of hoods(w) === 1 ? kinds : w.places.filter(x => kinds.includes(typeOf(x))).map(x => x.id)) {
      if (!w.rng.chance(0.0045)) continue;
      const staff = staffOf(w, pl).filter(p => p.job === pl);
      if (staff.length < 2) continue;
      const v = w.rng.pick(staff);
      const kind = typeOf(w.placeById.get(pl) ?? { id: pl });
      const what = kind === 'mill' ? 'got caught in the saw' : kind === 'garage' ? 'was pinned under a car' : 'went over the side';
      v.ill = 2 + w.rng.int(0, 4);
      v.health = clamp(v.health - 0.2, 0.05, 1);
      const e = addEvent(w, {
        type: 'accident',
        who: [v.id],
        text: `@${v.id} ${what} at ${w.placeById.get(pl)!.name}.`,
        causes: [stateCause('an accident at work', 1)],
        vis: 'public',
        evidence: [],
        w: 2,
      });
      broadcast(w, e);
      addEmotion(w, v, 'ill', 'shaken', -0.15, v.ill, e.id);
      for (const p of staff)
        if (p !== v)
          out.push({
            type: 'danger',
            actor: p,
            target: v,
            others: [],
            thing: '',
            features: new Set<Feature>(['danger', 'public', 'need', ...(p.friends.has(v.id) ? ['friend' as Feature] : [])]),
            families: ['courage', 'caution'],
            only: { courage: ['rescue'], caution: ['froze'] },
            cause: e.id,
            place: w.placeById.get(pl)!.name,
            w: 1.8,
            familyExtra: { courage: [bondC(w, p, v, 'like', 1, 3)] },
          });
    }
    return out;
  },
};
