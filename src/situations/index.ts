// The situations the world raises each month: every kind's matcher, in a fixed order (the order decides matching), then the queue.

import type { Feature } from '../features';
import { type World, type Cause, live, P, facet, remember, addEvent, broadcast, addStress } from '../world';
import { traitCause, ev, learned } from '../considerations';
import { afterRun } from '../effects';
import { type Instance, run } from '../grammar';
import { asked } from './asked';
import { chance } from './chance';
import { collection } from './collection';
import { criticised } from './criticised';
import { danger } from './danger';
import { deadline } from './deadline';
import { discovery } from './discovery';
import { yearly, yearlyDay } from './yearly';
import { hometruth } from './hometruth';
import { newcomer } from './newcomer';
import { obligation } from './obligation';
import { offer } from './offer';
import { oldwound } from './oldwound';
import { reckon } from './reckon';
import { request } from './request';
import { risk } from './risk';
import { strain } from './strain';
import { temptation } from './temptation';

// ---------- the matcher: situation types ----------
export interface SituationType {
  id: string;
  match(w: World): Instance[];
}

const TYPES: SituationType[] = [
  temptation,
  request,
  risk,
  offer,
  chance,
  strain,
  obligation,
  discovery,
  deadline,
  newcomer,
  asked,
  danger,
  hometruth,
  criticised,
  collection,
  oldwound,
  reckon,
  yearly,
];

// Spotlight: doing the job with everyone watching. Not a choice, a test of nerve, so the if-then for being watched gets its day.
export function spotlightTick(w: World) {
  for (const p of live(w)) {
    if (!p.job || p.lead || !w.rng.chance(0.006) || (p.tried['spotlight']?.t ?? -99) > w.t - 18) continue;
    learned(w, p, 'spotlight', true);
    const pl = w.placeById.get(p.job)!;
    const feats = new Set<Feature>(['watched', 'public', 'authority']);
    const occasion = w.rng.pick(['the inspection', 'the open day', 'the visit from head office', 'the day the council came round']);
    const nerves = facet(p, 'anxiety', undefined, feats) - 0.5 * facet(p, 'socialBoldness', undefined, feats) + w.rng.normal() * 0.6 * p.variability;
    if (Math.abs(nerves) < 0.5) continue;
    const it = p.ifThens.find(x => feats.has(x.feature) && (x.facet === 'anxiety' || x.facet === 'socialBoldness'));
    const e = addEvent(w, {
      type: nerves > 0 ? 'froze' : 'rose',
      who: [p.id],
      text:
        nerves > 0 ? `@${p.id} went to pieces during ${occasion} at ${pl.name}.` : `@${p.id} was the one who shone during ${occasion} at ${pl.name}.`,
      causes: [
        traitCause(p, 'anxiety', 0.6, nerves > 0 ? 1 : -1),
        traitCause(p, 'socialBoldness', 0.4, nerves > 0 ? -1 : 1),
        ...(it ? [{ kind: 'trait', label: it.words, weight: 0.4, key: it.facet, who: p.id } as Cause] : []),
      ],
      vis: 'local',
      evidence: [
        ...(nerves > 0
          ? [ev(p.id, 'anxiety', 1, 1, 0.85), ev(p.id, 'socialBoldness', -1, 0.6, 0.6)]
          : [ev(p.id, 'anxiety', -1, 0.8, 0.7), ev(p.id, 'socialBoldness', 1, 0.8, 0.7)]),
        ...(it ? [ev(p.id, `ifthen:${it.feature}:${it.facet}`, Math.sign(it.shift), Math.min(1.5, Math.abs(it.shift) * 0.6), 0.7)] : []),
      ],
      w: nerves > 0 ? 1 : 0.8,
    });
    broadcast(w, e);
    if (nerves > 0) addStress(p, 'froze', occasion, 0.06, e.id);
    else {
      const lead = pl.lead != null ? P(w, pl.lead) : null;
      if (lead) remember(w, lead, p, e.id, 0.1, 0.2, 0.05, 'shone when it counted');
    }
  }
}

// Run every type's matcher, then the queue from last tick.
export function situationsTick(w: World) {
  const pending: Instance[] = w.queue.splice(0, w.queue.length);
  for (const inst of pending) {
    if (inst.actor.status !== 'in') continue;
    const o = run(w, inst);
    if (o) afterRun(w, inst, o);
  }
  yearlyDay(w);
  const found: Instance[] = [];
  for (const ty of TYPES) found.push(...ty.match(w));
  // One situation per actor per tick, the most consequential first.
  const seen = new Set<number>();
  for (const inst of found.sort((a, b) => (b.w ?? 1) - (a.w ?? 1))) {
    if (seen.has(inst.actor.id) || inst.actor.status !== 'in') continue;
    seen.add(inst.actor.id);
    const o = run(w, inst);
    if (o) afterRun(w, inst, o);
  }
}
