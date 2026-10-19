// Stress: how it builds and how it is relieved (the leaks and breaks are situations).

import { clamp } from './rng';
import { type Cause, type Person, type World, age, P, facet, likeOf, addEvent, broadcast, addStress, addEmotion } from './world';
import { z01, type Option } from './decide';
import { friendsOf, decide } from './grammar';
import { traitCause, stateCause, ev, facetC, valueC, pubC } from './considerations';
import { habitRelief } from './time';
import type { Feature } from './features';

const NONE = new Set<Feature>();
export function stressTick(w: World, p: Person) {
  const a = age(w, p);
  for (const k in p.sources) {
    p.sources[k].v *= 0.9;
    if (p.sources[k].v < 0.004) delete p.sources[k];
  }
  p.emotions = p.emotions.filter(e => e.until > w.t);
  if (p.phase && p.phase.until <= w.t) p.phase = undefined;
  if (a < 14) {
    p.stress *= 0.95;
    return;
  }
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (pl) {
    const soc = Math.max(0, -facet(p, 'sociability'));
    if (pl.people * soc > 0.3) addStress(p, 'fit', `dealing with people all day at ${pl.name}`, pl.people * soc * 0.03);
    if (p.values.success > 0.8 && !p.lead && w.t - p.jobSince > 48) addStress(p, 'stuck', 'years without a step up', 0.02 * z01(p.values.success));
    if (pl.lead != null && pl.lead !== p.id && Math.min(likeOf(w, pl.lead, p.id), likeOf(w, p.id, pl.lead)) < -0.2)
      addStress(p, 'boss', `bad terms with @${pl.lead}`, 0.025);
    if (p.lead) addStress(p, 'resp', `the weight of being ${pl.title}`, 0.012 * (1 - 0.3 * facet(p, 'organisation')));
    if (p.perf < -0.4) addStress(p, 'comp', `struggling with the work at ${pl.name}`, 0.014 * (1 + z01(p.values.success)));
    if (pl.lead != null && pl.lead !== p.id && p.values.freedom > 0.6 && facet(P(w, pl.lead), 'organisation') > 1)
      addStress(p, 'auto', `being told how to do everything by @${pl.lead}`, 0.014);
  } else if (!p.retired && !p.student && !p.givenUp && a >= 18 && a < 63) {
    addStress(p, 'jobless', 'out of work', 0.012 + 0.015 * z01(p.values.success));
    p.joblessMonths = (p.joblessMonths ?? 0) + 1;
    if (p.joblessMonths >= 30 && w.rng.chance(0.06)) {
      const opts: Option[] = [
        {
          id: 'giveup',
          label: 'stop looking',
          considerations: [
            facetC(p, 'diligence', NONE, -1),
            pubC('years', `${Math.round(p.joblessMonths / 12)} years without work`, clamp(p.joblessMonths / 60, 0, 1)),
          ],
        },
        { id: 'keep', label: 'keep trying', considerations: [facetC(p, 'diligence', NONE, 1), valueC(p, 'success', 1, 4)] },
      ];
      const d = decide(w, p, 'years without work', opts);
      if (d.chosen === 'giveup') {
        p.givenUp = true;
        const e = addEvent(w, {
          type: 'gaveup',
          who: [p.id],
          text: `@${p.id} stopped looking for work.`,
          causes: d.why,
          vis: 'local',
          decision: d.rec,
          evidence: [ev(p.id, 'diligence', -1, 0.8, 0.7)],
          w: 1.2,
        });
        broadcast(w, e);
      }
    }
  }
  if (p.savings < 0) addStress(p, 'money', 'money worries', 0.025);
  const fr = friendsOf(w, p).length;
  if (facet(p, 'sociability') > 0.3 && fr === 0 && p.partner == null) addStress(p, 'lonely', 'loneliness', 0.02 + 0.015 * facet(p, 'sociability'));
  if (a >= 24 && p.partner == null && fr === 0) addStress(p, 'alone', 'no one close', 0.01);
  if (p.partner != null && likeOf(w, p.id, p.partner) < 0.05) addStress(p, 'home', `trouble at home with @${p.partner}`, 0.025);
  if (p.ill) addStress(p, 'ill', 'illness', 0.012);
  let rl =
    0.025 * (1 + 0.2 * facet(p, 'patience')) +
    0.006 * Object.values(p.skills).filter(s => s.interest === 2).length +
    Math.min(0.015, fr * 0.005) +
    (p.drinks ? 0.015 : 0) +
    (p.retired ? 0.008 : 0) +
    habitRelief(p);
  if (p.partner != null && likeOf(w, p.id, p.partner) > 0.4) rl += 0.012;
  if (facet(p, 'dependence') > 0.8 && (fr > 0 || p.partner != null)) rl += 0.008;
  p.stress = clamp(p.stress - rl, 0, 1);
  if (
    p.drinks &&
    w.rng.chance(
      0.01 * (1 + 0.5 * facet(p, 'organisation')) + (p.partner != null && likeOf(w, p.id, p.partner) > 0.5 ? 0.01 : 0) + (p.ill ? 0.03 : 0),
    )
  ) {
    p.drinks = false;
    const e = addEvent(w, {
      type: 'sober',
      who: [p.id],
      text: `@${p.id} stopped drinking.`,
      causes: [
        p.ill ? stateCause('frightened by their own health', 0.5) : stateCause('', 0),
        ...(p.partner != null && likeOf(w, p.id, p.partner) > 0.5
          ? [{ kind: 'bond', label: `for @${p.partner}`, weight: 0.4, who: p.partner } as Cause]
          : []),
        traitCause(p, 'organisation', 0.3, 1),
      ].filter(c => c.label),
      vis: 'local',
      evidence: [ev(p.id, 'organisation', 1, 0.7, 0.6)],
      w: 1.5,
    });
    broadcast(w, e);
    addEmotion(w, p, 'sober', 'sober, and proud of it', 0.08, 12, e.id);
  }
}
