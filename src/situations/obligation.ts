import type { Feature } from '../features';
import { age, live, P, topSources } from '../world';
import { stateC, learned } from '../considerations';
import { type Instance, friendsOf, family } from '../grammar';
import type { SituationType } from './index';
import { strain } from './strain';

// Obligation: a promise comes due.
export const obligation: SituationType = {
  id: 'obligation',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (age(w, p) >= 16 && w.rng.chance(0.015) && p.promises.length < 1) {
        const pool = [
          ...friendsOf(w, p),
          ...(p.partner != null ? [P(w, p.partner)] : []),
          ...p.circle.map(i => P(w, i)).filter(q => q.status === 'in'),
        ];
        if (pool.length) {
          const to = w.rng.pick(pool);
          const due = w.t + 1 + w.rng.int(0, 3);
          // What is promised fits the one it is promised to: the kids only to someone with young children, a word put in only to a
          // friend outside the household. The same single draw either way, so the wording changes nothing else.
          const young = to.kids.some(k => w.byId.get(k)?.status === 'in' && age(w, w.byId.get(k)!) < 12);
          const home = to.id === p.partner;
          p.promises.push({
            to: to.id,
            due,
            what: w.rng.pick([
              'to help with the roof',
              'to be there on the day',
              home ? 'to sort out the bills by the end of the month' : 'to pay it back by the end of the month',
              young ? 'to look after the kids' : 'to help with the garden',
              home ? 'to be home early on Friday' : 'to put in a word for them',
            ]),
          });
        }
      }
      for (const pr of p.promises.slice()) {
        if (pr.due > w.t) continue;
        p.promises = p.promises.filter(x => x !== pr);
        const t = P(w, pr.to);
        if (t.status !== 'in') continue;
        out.push({
          type: 'obligation',
          actor: p,
          target: t,
          others: [],
          thing: pr.what,
          features: new Set<Feature>(['private', family(p, t) ? 'family' : 'friend', ...(p.stress > 0.5 ? ['tired' as Feature] : [])]),
          families: ['duty', 'lapse'],
          only: { duty: ['keep'], lapse: ['slip'] },
          familyExtra: {
            lapse: [
              stateC(
                'strain',
                p.stress > 0.5
                  ? `under strain (${topSources(p, 1)
                      .map(x => x.label)
                      .join('')})`
                  : 'nothing was in the way',
                p.stress > 0.5 ? 0.8 : 0.15,
              ),
            ],
          },
          w: 0.7,
        });
      }
      // A parent in need, with a child who could come.
      if (p.ill > 0)
        for (const k of p.kids) {
          const c = P(w, k);
          if (c.status === 'in' && age(w, c) >= 18 && (c.tried['dutyill:' + p.id]?.t ?? -99) < w.t - 12 && w.rng.chance(0.5)) {
            learned(w, c, 'dutyill:' + p.id, true);
            out.push({
              type: 'obligation',
              actor: c,
              target: p,
              others: [],
              thing: 'it',
              features: new Set<Feature>(['private', 'family', 'need']),
              families: ['duty', 'lapse'],
              only: { duty: ['show'], lapse: ['absent'] },
              causeLabel: `@${p.id} was ill`,
              familyExtra: { lapse: [stateC('own', c.stress > 0.5 ? 'had troubles of their own' : 'had the time', c.stress > 0.5 ? 0.7 : 0.2)] },
              w: 1.3,
            });
          }
        }
    }
    return out;
  },
};
