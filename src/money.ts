// Money and wants: income and spending, and the wants money makes.

import { SETTING } from './setting';
import { type Person, type World, age, P, facet, addEvent, broadcast, year } from './world';
import { traitCause, ev, learned } from './considerations';
import { steering, extraPay } from './steer';
import { addWant } from './time';

export function moneyTick(w: World, p: Person) {
  const a = age(w, p);
  if (a < 18) return;
  let inc = 0;
  if (p.job) inc = w.placeById.get(p.job)!.pay + (p.lead ? 0.8 : 0);
  else if (p.retired) inc = 1.3;
  else if (!p.student) inc = 0.8;
  const saving = p.wants.find(x => !x.done && x.pursuit && !x.pursuit.owner && (x.kind === 'acquire' || x.kind === 'escape'));
  const cost =
    1.55 +
    (p.kids.filter(k => P(w, k).status === 'in' && age(w, P(w, k)) < 18).length * 0.45) / (p.partner != null ? 2 : 1) +
    (p.drinks ? 0.3 : 0) -
    (p.partner != null ? 0.25 : 0) -
    (facet(p, 'greedAvoidance') > 0.8 ? 0.1 : 0) +
    (facet(p, 'prudence') < -0.8 ? 0.2 : 0) -
    (saving ? 0.3 * saving.pursuit!.effort : 0);
  p.savings += inc + (steering() ? extraPay(p) : 0) - cost;
  // Nobody is lent without limit: a jobless household cuts back long before it is a hundred months in the red.
  if (p.savings < -12) {
    p.savings += (-12 - p.savings) * 0.3;
    if (p.savings < -40) p.savings = -40;
  }
}
export function wantTick(w: World, p: Person) {
  const a = age(w, p);
  const esc = p.wants.find(x => x.kind === 'escape' && !x.done && !x.pursuit);
  if (esc && w.rng.chance(0.06) && (p.tried['tell:leave']?.n ?? 0) < 1) {
    learned(w, p, 'tell:leave', true);
    const e = addEvent(w, {
      type: 'tell',
      who: [p.id],
      text: `@${p.id} has been talking about the city a lot lately.`,
      causes: [
        { kind: 'want', label: `wants out of ${SETTING.name} (since ${year(esc.since)})`, weight: 0.6, key: 'escape', who: p.id },
        traitCause(p, 'inquisitiveness', 0.4, 1),
      ],
      vis: 'local',
      evidence: [
        ev(p.id, 'inquisitiveness', 1, 0.6, 0.6),
        ev(p.id, 'attach:home', -1, 0.5, 0.5),
        ev(p.id, 'value:' + esc.value, 1, 0.8, 0.6),
        ev(p.id, 'want:escape', 1, 1, 0.7),
      ],
      w: 0.6,
    });
    broadcast(w, e);
  }
  if (a < 18 || !w.rng.chance(0.08)) return;
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (p.coreValues.includes('success') && pl && !p.lead && w.t - p.jobSince > 24) addWant(w, p, 'attain', pl.id, 'success', 0.6);
  if (p.coreValues.includes('success') && !pl && !p.retired && a < 60) addWant(w, p, 'attain', 'work', 'success', 0.8);
  const lastWith = (type: string, q: number | null) =>
    q == null
      ? undefined
      : p.events
          .slice()
          .reverse()
          .find(i => w.events[i].type === type && w.events[i].who.includes(q));
  if (p.coreValues.includes('lovedOnes') && p.partner != null && p.pstat === 'married' && p.kids.length === 0 && a < 40)
    addWant(w, p, 'create', 'child', 'lovedOnes', 0.5, lastWith('married', p.partner));
  if (p.coreValues.includes('lovedOnes') && p.partner != null && p.pstat === 'dating')
    addWant(w, p, 'win', String(p.partner), 'lovedOnes', 0.5, lastWith('dating', p.partner));
  if ((p.coreValues.includes('freedom') || p.coreValues.includes('thrill')) && a < 32 && p.partner == null)
    addWant(w, p, 'escape', 'elsewhere', p.coreValues.includes('freedom') ? 'freedom' : 'thrill', 0.4);
}
