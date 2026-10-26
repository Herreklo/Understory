import type { Feature } from '../features';
import { type World, type Person, age, live } from '../world';
import { facetC, bondC } from '../considerations';
import { type Instance, type Outcome, family } from '../grammar';
import { meetingFeeling, metObject, apologyAnswered, resentmentStands, type Kind } from '../feelings';
import type { SituationType } from './index';

// The meeting (round 45; feelings.ts): a strong feeling brings its holder to its object, in a place the two share. The feeling is weighed
// as the decision's own consideration (`feel:<kind>`, withFeelings), and its answers are the kind's own. Off with the feelings.
const shares = (p: Person, q: Person) =>
  (!!p.job && p.job === q.job) ||
  p.circle.includes(q.id) ||
  q.circle.includes(p.id) ||
  (p.group != null && p.group === q.group) ||
  p.friends.has(q.id) ||
  p.partner === q.id ||
  family(p, q);

export const meeting: SituationType = {
  id: 'meeting',
  match(w) {
    const out: Instance[] = [];
    for (const p of live(w)) {
      if (age(w, p) < 16) continue;
      const f = meetingFeeling(w, p, q => shares(p, q));
      if (!f) continue;
      const q = w.byId.get(f.o)!;
      const pub = !!(p.job && p.job === q.job);
      const feats = new Set<Feature>([
        pub ? 'public' : 'private',
        ...(f.k === 'resentment' ? ['standing' as Feature] : []),
        ...(p.friends.has(q.id) ? ['friend' as Feature] : []),
        ...(family(p, q) ? ['family' as Feature] : []),
      ]);
      const priv = new Set<Feature>([pub ? 'public' : 'private']);
      const away = [facetC(p, 'socialBoldness', priv, -1, 4)];
      const base = {
        type: 'meeting:' + f.k,
        actor: p,
        target: q,
        others: [],
        features: feats,
        place: pub ? w.placeById.get(p.job!)!.name : undefined,
        w: 0.6 + 0.6 * f.v,
        ownFirst: true,
      };
      if (f.k === 'resentment')
        out.push({
          ...base,
          thing: `what @${q.id} did`,
          families: ['severity', 'leniency', 'withdrawal'],
          only: { severity: ['rake'], leniency: ['letgo'], withdrawal: ['avoid'] },
          familyExtra: {
            severity: [facetC(p, 'forgiveness', priv, -1, 6), bondC(w, p, q, 'like', -1, 3)],
            leniency: [facetC(p, 'forgiveness', priv, 1, 6), bondC(w, p, q, 'like', 1, 3)],
            withdrawal: away,
          },
        });
      else if (f.k === 'guilt')
        out.push({
          ...base,
          stood: resentmentStands(w, q, p),
          thing: '',
          families: ['humility', 'withdrawal'],
          only: { humility: ['apologise'], withdrawal: ['avoid'] },
          familyExtra: { humility: [facetC(p, 'modesty', priv, 1, 4), bondC(w, p, q, 'like', 1, 3)], withdrawal: away },
        } as Instance & { stood: boolean });
      else
        out.push({
          ...base,
          thing: `something back for ${f.what}`,
          families: ['warmth', 'generosity', 'withdrawal'],
          only: { warmth: ['visit'], generosity: ['give'], withdrawal: ['avoid'] },
          familyExtra: {
            warmth: [facetC(p, 'sentimentality', priv, 1, 4), bondC(w, p, q, 'like', 1, 3)],
            generosity: [facetC(p, 'altruism', priv, 1, 4)],
            withdrawal: away,
          },
        });
    }
    return out;
  },
};

// After a meeting: the feeling changes by the answer, and an apology is answered by the one apologised to, next month (the queue). A
// have-out is answered by the resentment it leaves in its object (feelings.ts), not by a provocation.
export function afterMeeting(w: World, inst: Instance, out: Outcome) {
  const p = inst.actor,
    q = inst.target!;
  metObject(w, p, q, inst.type.slice('meeting:'.length) as Kind, out.expr);
  if (out.expr.id !== 'apologise' || q.status !== 'in') return;
  w.queue.push({
    stood: (inst as Instance & { stood?: boolean }).stood ?? false,
    type: 'meeting-answer',
    actor: q,
    target: p,
    others: [],
    thing: `what @${p.id} did`,
    features: new Set<Feature>(['private', ...(q.friends.has(p.id) ? ['friend' as Feature] : []), ...(family(p, q) ? ['family' as Feature] : [])]),
    families: ['leniency', 'pride'],
    only: { leniency: ['letgo'], pride: ['sulk'] },
    cause: out.event.id,
    familyExtra: {
      leniency: [facetC(q, 'forgiveness', new Set<Feature>(['private']), 1, 6), bondC(w, q, p, 'like', 1, 3)],
      pride: [facetC(q, 'forgiveness', new Set<Feature>(['private']), -1, 6)],
    },
    ownFirst: true,
    w: 1,
  } as Instance & { stood: boolean });
}
export const afterMeetingAnswer = (w: World, inst: Instance, out: Outcome) =>
  apologyAnswered(w, inst.actor, inst.target!, out.expr, (inst as Instance & { stood?: boolean }).stood ?? false);
