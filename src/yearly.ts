// Once a year: maturing, aptitude ageing, credit.

import { type Person, type World, plasticity, age, live, P, facet, remember, addEvent, broadcast, addEmotion, year } from './world';
import { hoods, staffOf } from './scale';
import { ceilingFor } from './generate';
import { traitCause, stateCause, ev, learned } from './considerations';

export function yearly(w: World) {
  for (const pl of w.places) {
    const lead = pl.lead != null ? P(w, pl.lead) : null;
    if (!lead) continue;
    const staff = (hoods(w) === 1 ? live(w) : staffOf(w, pl.id)).filter(q => q.job === pl.id && q !== lead);
    if (staff.length < 2) continue;
    const best = staff.slice().sort((a, b) => b.perf - a.perf)[0];
    if (best.perf > 0.6 && w.rng.chance(0.35) && w.t - (best.tried['praised']?.t ?? -99) > 36 && w.t - (lead.tried['credited']?.t ?? -99) > 24) {
      learned(w, best, 'praised', true);
      learned(w, lead, 'credited', true);
      const warm = facet(lead, 'gentleness') + 0.5 * facet(lead, 'modesty') + w.rng.normal() * 0.5 * lead.variability > -0.3;
      if (warm) {
        const e = addEvent(w, {
          type: 'credit',
          who: [lead.id, best.id],
          text: `@${lead.id} made sure everyone knew @${best.id} had carried ${pl.name} that year.`,
          causes: [stateCause(`@${best.id}'s work had been strong all year`, 0.6), traitCause(lead, 'gentleness', 0.4, 1)],
          vis: 'local',
          evidence: [ev(best.id, 'diligence', 1, 0.9, 0.75), ev(best.id, 'skill:' + pl.skill, 1, 0.8, 0.7), ev(lead.id, 'gentleness', 1, 0.6, 0.6)],
          w: 1,
        });
        broadcast(w, e);
        addEmotion(w, best, 'praised', 'recognised', 0.1, 6, e.id);
        remember(w, best, lead, e.id, 0.15, 0.1, 0.1, 'gave me credit');
      } else {
        const e = addEvent(w, {
          type: 'nocredit',
          who: [lead.id, best.id],
          text: `@${lead.id} took the credit for a year that @${best.id} had carried.`,
          causes: [traitCause(lead, 'modesty', 0.6, -1), stateCause(`@${best.id}'s work had been strong all year`, 0.4)],
          vis: 'local',
          evidence: [ev(lead.id, 'modesty', -1, 1, 0.8), ev(best.id, 'diligence', 1, 0.6, 0.6)],
          w: 1.2,
        });
        broadcast(w, e);
        remember(w, best, lead, e.id, -0.3, -0.2, -0.2, 'took the credit for my work');
      }
    }
  }
  for (const p of w.people) {
    if (p.status === 'dead') continue;
    mature(w, p);
  }
}
// A year of growing older: maturing (the direction the research finds, scaled by how much life still moves this person), aptitudes
// rising and falling with age, and skill ceilings following them. Everyone alive gets it once a year, in focus or in the background.
export function mature(w: World, p: Person) {
  const a = age(w, p);
  // Maturing: the direction the research finds, scaled by how much life still moves this person.
  if (a >= 20 && a <= 60) {
    const k = plasticity(w, p);
    p.facets.organisation += 0.015 * k;
    p.facets.patience += 0.012 * k;
    p.facets.forgiveness += 0.01 * k;
    p.facets.anxiety -= 0.01 * k;
  }
  for (const ap of [
    ['physique', 26, 0.045],
    ['reasoning', 22, 0.03],
    ['memory', 30, 0.025],
    ['dexterity', 27, 0.03],
    ['ear', 25, 0.02],
  ] as const)
    if (a > ap[1]) p.aptitudes[ap[0]] -= ap[2];
  for (const ap of [
    ['language', 55, 0.02],
    ['socialInsight', 48, 0.02],
    ['presence', 45, 0.01],
  ] as const)
    if (a < ap[1]) p.aptitudes[ap[0]] += ap[2];
    else p.aptitudes[ap[0]] -= ap[2] * 0.5;
  for (const sk in p.skills) p.skills[sk].ceil = ceilingFor(p, sk);
}
