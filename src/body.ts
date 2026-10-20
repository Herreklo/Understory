// The body: health, illness, ageing, death, and grief.

import { clamp } from './rng';
import { type Cause, type Person, type World, age, P, facet, addEvent, broadcast, addStress, topSources, addEmotion, year } from './world';
import { carryReset } from './carry';
import { jobSet, moved } from './scale';
import { healthTarget } from './generate';
import { loss } from './situations/raised';
import { friendsOf } from './grammar';
import { stateCause, eventCause } from './considerations';
import { maybeHomeForFuneral } from './migration';
import * as MX from './mathx';

export function bodyTick(w: World, p: Person) {
  const a = age(w, p);
  if (p.ill > 0) {
    p.ill--;
    if (!p.ill) addEmotion(w, p, 'recovered', 'back on their feet', 0.08, 4);
  }
  const tgt = healthTarget(w, p) - (p.ill ? 0.3 : 0);
  p.health += (tgt - p.health) * 0.08;
  if (a < 16 || p.ill) return;
  if (w.t - (((p as any).lastIll as { t: number } | undefined)?.t ?? -99) < 9) return; // a body needs time between illnesses
  const risk = 0.0009 * MX.exp((a - 45) / 14) * (1.3 - 0.3 * p.constitution) * (p.drinks ? 1.8 : 1) * (p.stress > 0.7 ? 1.3 : 1);
  if (w.rng.chance(risk)) {
    const kinds: [string, number][] =
      a < 50
        ? [
            ['was hospitalised with pneumonia', 3],
            ['needed surgery', 4],
            ['was signed off with a bad back', 3],
          ]
        : [
            ['had a heart attack', 5],
            ['was diagnosed with cancer', 8],
            ['had a stroke', 6],
            ['was hospitalised with pneumonia', 3],
          ];
    if (p.drinks && a > 40) kinds.push(['was admitted with liver damage', 6]);
    let [kind, mo] = w.rng.pick(kinds);
    // A second illness within a few years is the same story continuing, not a new diagnosis.
    const last = (p as any).lastIll as { t: number; kind: string } | undefined;
    if (last && w.t - last.t < 48)
      kind = /cancer/.test(last.kind)
        ? 'learned the cancer was back'
        : /heart/.test(last.kind)
          ? 'had a second heart attack'
          : /stroke/.test(last.kind)
            ? 'had another stroke'
            : 'was back in hospital';
    (p as any).lastIll = { t: w.t, kind };
    p.ill = mo + w.rng.int(0, 3);
    p.health = clamp(p.health - 0.2 - w.rng.next() * 0.2, 0.05, 1);
    const causes: Cause[] = [stateCause(`age ${Math.floor(a)}`, 0.5)];
    if (p.constitution < -0.8) causes.push(stateCause('a weak constitution', 0.3));
    if (p.drinks) causes.push(stateCause(`drinking since ${year(p.drinkSince)}`, 0.5));
    if (p.stress > 0.7)
      causes.push(
        stateCause(
          `years of strain (${topSources(p)
            .map(s => s.label)
            .join(', ')})`,
          0.4,
        ),
      );
    const e = addEvent(w, {
      type: 'ill',
      who: [p.id, ...(p.partner != null ? [p.partner] : [])],
      text: `@${p.id} ${kind}.`,
      causes,
      vis: 'local',
      evidence: [],
      w: 2,
    });
    broadcast(w, e);
    addEmotion(w, p, 'ill', 'frightened by their own body', -0.18, p.ill, e.id);
    addStress(p, 'ill', 'illness', 0.15, e.id);
    if (p.partner != null) addStress(P(w, p.partner), 'pill', `@${p.id}'s illness`, 0.12, e.id);
    loss(w, p, e.id, 'ill');
  }
}
export function mortality(w: World, p: Person): boolean {
  const a = age(w, p);
  // Gompertz, fitted to Norwegian rates (about 0.5% a year at 60, 1.6% at 70, 5% at 80, 16% at 90, half at 100); illness and poor health multiply it.
  let h = Math.min(0.8, 0.0000025 * MX.exp(0.116 * a)) / 12;
  if (a >= 105) h = Math.max(h, 0.6 / 12); // nobody outlives the record
  const norm = 0.78 - Math.max(0, a - 45) * 0.009; // health that is normal for this age
  if (p.health < norm) h *= 1 + (norm - p.health) * 4; // only health worse than that adds risk: drink, strain, a weak constitution
  if (p.ill) h *= 2.2;
  if (!w.rng.chance(h)) return false;
  let cause: string;
  const causes: Cause[] = [stateCause(`age ${Math.floor(a)}`, 0.5), stateCause('health had worn down', 0.3)];
  if (p.ill) cause = 'died after a long illness';
  else if (p.drinks && a < 72) {
    cause = 'died of liver failure';
    causes.push(stateCause(`drinking since ${year(p.drinkSince)}`, 0.6));
  } else if (a > 79) cause = `died in ${p.sex === 'f' ? 'her' : 'his'} sleep`;
  else cause = 'died of a sudden heart attack';
  die(w, p, cause, causes);
  return true;
}
function die(w: World, p: Person, cause: string, causes: Cause[]) {
  const a = Math.floor(age(w, p));
  p.status = 'dead';
  moved();
  p.diedAt = w.t;
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (pl && pl.lead === p.id) pl.lead = null;
  jobSet(w, p, null);
  p.lead = false;
  const close: number[] = [];
  if (p.partner != null) close.push(p.partner);
  for (const k of p.kids) if (P(w, k).status !== 'dead') close.push(k);
  for (const k of p.parents) if (P(w, k).status === 'in') close.push(k);
  const e = addEvent(w, {
    type: 'death',
    who: [p.id, ...close],
    text: `@${p.id} ${cause}, aged ${a}.`,
    causes,
    vis: 'public',
    evidence: [],
    w: 3,
  });
  broadcast(w, e);
  if (p.partner != null) {
    const q = P(w, p.partner);
    q.partner = null;
    q.pstat = null;
    grief(w, q, p, e.id, 0.32, 0.3, 30);
    loss(w, q, e.id, `@${p.id} died`);
  }
  for (const k of p.kids) {
    const c = P(w, k);
    if (c.status === 'in') {
      grief(w, c, p, e.id, 0.22, 0.15, 14);
      loss(w, c, e.id, `@${p.id} died`);
    } else if (c.status === 'away') maybeHomeForFuneral(w, c, p, e.id);
  }
  for (const k of p.parents) {
    const c = P(w, k);
    if (c.status === 'in') grief(w, c, p, e.id, 0.4, 0.35, 36);
  }
  for (const f of friendsOf(w, p)) grief(w, f, p, e.id, 0.1, 0.08, 8);
  const heirs = p.kids.map(k => P(w, k)).filter(k => k.status !== 'dead');
  if (heirs.length && p.savings > 0) for (const k of heirs) k.savings += p.savings / heirs.length;
  for (const id of p.friends) {
    carryReset(w, p.id, id);
    P(w, id).friends.delete(p.id);
  }
  // Wanting to make things right with someone, or to win them, ends when they die. Making things right becomes a regret on the record.
  for (const q of w.people)
    if (q.status !== 'dead' && q !== p)
      for (const x of q.wants)
        if (!x.done && (x.kind === 'restore' || x.kind === 'win') && x.target === String(p.id)) {
          x.done = 'failed';
          x.doneAt = e.id;
          if (x.kind !== 'restore') continue;
          const yrs = Math.max(1, Math.round((w.t - x.since) / 12));
          const e2 = addEvent(w, {
            type: 'regret',
            who: [q.id, p.id],
            text: `@${q.id} never made things right with @${p.id}. ${yrs > 1 ? `${q.sex === 'f' ? 'She' : 'He'} had been meaning to for ${yrs} years.` : ''}`.trim(),
            causes: [
              eventCause(w, e.id, 1),
              {
                kind: 'want',
                label: `had wanted to make things right with @${p.id} since ${year(x.since)}`,
                weight: 0.6,
                key: 'restore',
                who: q.id,
              },
            ],
            vis: 'local',
            evidence: [],
            w: 1.4,
          });
          broadcast(w, e2);
          addEmotion(w, q, 'regret', `left it too late with @${p.id}`, -0.15, 12, e2.id);
        }
}
function grief(w: World, q: Person, p: Person, ref: number, moodHit: number, stress: number, months: number) {
  const sent = facet(q, 'sentimentality');
  addEmotion(w, q, 'grief' + p.id, `grieving @${p.id}`, -moodHit * (1 + 0.3 * sent), Math.round(months * (1 + 0.3 * sent)), ref);
  addStress(q, 'grief' + p.id, `grief for @${p.id}`, stress, ref);
}
