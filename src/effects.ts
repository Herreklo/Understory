// What an answered situation leaves behind: on the people in it, their bonds, and what comes next.

import { clamp } from './rng';
import { onStage, obstacle } from './steer';
import { resolveWants, wantLabel, giveUp as giveUpWant } from './time';
import type { Feature } from './features';
import { SETTING, venueName } from './setting';
import {
  plasticity,
  type World,
  type Person,
  P,
  facet,
  bond,
  peekBond,
  remember,
  addEvent,
  broadcast,
  learnOf,
  addStress,
  addEmotion,
} from './world';
import { around, staffOf } from './scale';
import { z01 } from './decide';
import { traitCause, stateCause, eventCause, ev, privC, closeC, bondC, learned } from './considerations';
import { self, type Instance, type Outcome, run, friendsOf, queueProvocation, family } from './grammar';
import { asked } from './situations/asked';
import { deadline } from './situations/deadline';
import { yearlyAsk } from './situations/yearly';
import { applyAftermath } from './aftermath';
import { reckoned, answered, reckonCites, carryReset } from './carry';

// Hooks for world effects after specific expressions in specific types.
export function afterRun(w: World, inst: Instance, out: Outcome) {
  const p = inst.actor,
    e = out.event,
    x = out.expr;
  switch (inst.type) {
    case SETTING.yearly.id: {
      if (x.id === 'stepup') {
        if (!(w as any).yearlyOrganiser) (w as any).yearlyOrganiser = { id: p.id, t: w.t, ev: e.id };
        break;
      }
      const pool = ((w as any).yearlyPool ?? []) as Person[];
      const next = pool.shift();
      if (next && next.status === 'in') w.queue.push(yearlyAsk(w, next));
      break;
    }
    case 'temptation':
      if (x.family === 'dishonesty') {
        if (x.id === 'skim') p.savings += 2;
        if (w.rng.chance(0.3)) {
          const pl = w.placeById.get(p.job!)!;
          const lead = pl.lead != null && pl.lead !== p.id ? P(w, pl.lead) : null;
          const e2 = addEvent(w, {
            type: 'caught',
            who: [p.id, ...(lead ? [lead.id] : [])],
            text: `@${p.id} was found out: ${x.id === 'skim' ? `taking from ${inst.thing || 'what was not theirs'}` : x.id === 'blame' ? `@${inst.target!.id} had been blamed for @${p.id}'s mistake` : 'the cover-up came out'}.`,
            causes: [eventCause(w, e.id, 0.8), traitCause(p, 'organisation', 0.2, -1)],
            vis: 'local',
            evidence:
              x.id === 'skim'
                ? [ev(p.id, 'fairness', -1, 1, 0.95), ev(p.id, 'sincerity', -1, 0.4, 0.7)]
                : [ev(p.id, 'sincerity', -1, 1, 0.95), ev(p.id, 'fairness', -1, 0.4, 0.7)],
            w: 2,
          });
          broadcast(w, e2);
          learnOf(w, lead?.id ?? -1, e, 1);
          for (const q of staffOf(w, p.job))
            if (q.job === p.job && q !== p)
              remember(w, q, p, e2.id, -0.25, -0.3, -0.5, `found out ${x.id === 'skim' ? 'taking from the till' : 'lying'}`);
          addStress(p, 'caught', 'being found out', 0.14, e2.id);
          addEmotion(w, p, 'shame', 'ashamed', -0.12 * z01(facet(p, 'fairness')), 4, e2.id);
          p.secrets = p.secrets.filter(s => s !== e.id);
        }
      }
      break;
    case 'risk':
      if (x.family === 'courage') {
        p.savings += 1.5;
        if (w.rng.chance(0.06)) {
          p.ill = 2 + w.rng.int(0, 3);
          p.health = clamp(p.health - 0.25, 0.05, 1);
          const e2 = addEvent(w, {
            type: 'ill',
            who: [p.id],
            text: `@${p.id} was badly hurt when the boat was caught by a wave.`,
            causes: [eventCause(w, e.id, 0.6), traitCause(p, 'fearfulness', 0.4, -1)],
            vis: 'public',
            evidence: [],
            w: 2,
          });
          broadcast(w, e2);
          addEmotion(w, p, 'ill', 'shaken', -0.15, p.ill, e2.id);
          if (facet(p, 'fearfulness') > -0.5 && !p.marks.some(m => m.key === 'sea')) {
            p.facets.fearfulness += 0.8 * plasticity(w, p);
            p.marks.push({ t: w.t, key: 'sea', delta: 0.8, cause: e2.id, text: 'has not been easy at sea since the wave' });
          }
        }
      }
      break;
    case 'offer':
      if (x.family === 'openness') {
        w.hooks.leaveTown(w, p, 'work', `@${p.id} left ${SETTING.name} for the city.`, [eventCause(w, e.id, 1)], undefined);
      } else {
        for (const x2 of p.wants) if (x2.kind === 'escape' && !x2.done) x2.urgency += 0.1;
      }
      break;
    case 'chance':
      if (x.family === 'openness') {
        const staged = onStage(p);
        const sk = staged ? staged.target : SETTING.hobbies.find(h => p.skills[h] && p.skills[h].r > 1200)!;
        const r = p.skills[sk].r;
        const nerves = facet(p, 'anxiety', undefined, inst.features) + w.rng.normal() * 0.6 * p.variability;
        const good = (r - 1150) / 250 - Math.max(0, nerves) * 0.6 + w.rng.normal() * 0.3 * p.variability;
        const e2 = addEvent(w, {
          type: 'performed',
          who: [p.id],
          text:
            good > 0.8
              ? `@${p.id} played ${venueName()}'s open night and the room went quiet.`
              : good > 0.1
                ? `@${p.id} played ${venueName()}'s open night and did well.`
                : `@${p.id} played ${venueName()}'s open night and fell apart.`,
          causes: [
            eventCause(w, e.id, 0.3),
            stateCause(`${sk} ${r > 1400 ? 'far better than anyone knew' : 'good, not great'}`, 0.5),
            ...(nerves > 0.6 ? [traitCause(p, 'anxiety', 0.4, 1)] : []),
          ],
          vis: 'public',
          evidence: [
            ev(p.id, 'skill:' + sk, good > 0.1 ? 1 : -1, Math.min(1.5, Math.abs(good)), 0.85),
            ...(nerves > 0.6 ? [ev(p.id, 'anxiety', 1, 0.8, 0.7)] : []),
          ],
          w: good > 0.8 ? 2.5 : 1.2,
        });
        broadcast(w, e2);
        addEmotion(
          w,
          p,
          'perf',
          good > 0.1 ? 'still buzzing from the open night' : 'humiliated at the open night',
          good > 0.1 ? 0.15 : -0.15,
          6,
          e2.id,
        );
        if (good > 0.8)
          for (const q of around(w, p))
            if (q !== p && peekBond(w, q.id, p.id)) {
              const b = bond(w, q.id, p.id);
              b.respect = clamp(b.respect + 0.2, -1, 1);
            }
        if (staged) {
          if (good > 0.1) resolveWants(w, p, 'prove', staged.target, 'achieved', e2.id);
          else if (
            obstacle(
              w,
              p,
              staged,
              wantLabel(w, p, staged),
              'fell apart at the open night',
              e2.id,
              (w.t - staged.pursuit!.since) / 12,
              staged.pursuit!.progress,
            ) === 'giveup'
          )
            giveUpWant(w, p, staged, (staged as any).obstacleRec);
        }
      } else if (onStage(p)) {
        const staged = onStage(p)!;
        if (
          obstacle(
            w,
            p,
            staged,
            wantLabel(w, p, staged),
            'lost ' + (p.sex === 'f' ? 'her' : 'his') + ' nerve at the open night',
            e.id,
            (w.t - staged.pursuit!.since) / 12,
            staged.pursuit!.progress,
          ) === 'giveup'
        )
          giveUpWant(w, p, staged, (staged as any).obstacleRec);
      }
      break;
    case 'reckon': {
      // The carrier faced it. The event cites the acts it rests on; the other answers.
      const q = inst.target!;
      const kind = x.id as 'sayit' | 'askback' | 'stopgoing';
      e.causes = [...e.causes, ...reckonCites(w, p, q)];
      reckoned(w, p, q, kind, e.id);
      if (kind === 'sayit') {
        const o2 = run(w, {
          type: 'reckon-answer',
          actor: q,
          target: p,
          others: [],
          thing: 'it',
          features: new Set<Feature>(['private', 'friend']),
          families: ['warmth', 'withdrawal'],
          only: { warmth: ['heed'], withdrawal: ['brushoff'] },
          cause: e.id,
          familyExtra: { warmth: [bondC(w, q, p, 'like', 1), bondC(w, q, p, 'respect', 1)] },
          w: 1.1,
        });
        if (o2) answered(w, p, q, o2.expr.id, o2.event.id);
      } else if (kind === 'askback') {
        const back = (inst as Instance & { back?: string }).back ?? 'a hand';
        const o2 = run(w, {
          type: 'request-answer',
          actor: q,
          target: p,
          others: [],
          thing: back,
          features: new Set<Feature>(['private', 'need', 'safety', 'friend']),
          families: ['generosity', 'refusal'],
          only: { generosity: ['give', 'grudging'], refusal: ['refuse', 'excuse'] },
          cause: e.id,
          familyExtra: { generosity: [bondC(w, q, p, 'like', 1)], refusal: [] },
          w: 1.2,
        });
        if (o2) answered(w, p, q, o2.expr.id, o2.event.id);
      }
      break;
    }
    case 'aftermath':
      applyAftermath(w, inst, x.id, e.id);
      break;
    case 'request':
      if (x.family === 'seeking' && inst.target && ['ask', 'hint', 'confide'].includes(x.id)) {
        const q = inst.target;
        const need = inst.thing;
        const times = q.tried['helped:' + p.id]?.n ?? 0;
        const feats = new Set<Feature>(['private', 'need', need === 'money' ? 'money' : 'safety', family(p, q) ? 'family' : 'friend']);
        const o2 = run(w, {
          type: 'request-answer',
          actor: q,
          target: p,
          others: [],
          thing: need === 'money' ? 'the money' : 'help',
          features: feats,
          families: ['generosity', 'refusal'],
          only: { generosity: ['give', 'grudging'], refusal: ['refuse', 'excuse'] },
          cause: e.id,
          familyExtra: {
            generosity: [
              bondC(w, q, p, 'like', 1),
              ...(need === 'money'
                ? [closeC('own', q.savings > 10 ? 'can spare it' : 'short themselves', clamp(q.savings / 15, 0, 1), 1, 0.2, undefined, 0.6)]
                : []),
              privC(
                'times',
                times ? `has already helped @${p.id} ${times} time${times > 1 ? 's' : ''}` : 'first time asked',
                clamp(times / 3, 0, 1),
                -1,
                0.15,
                undefined,
                0.15,
              ),
            ],
            refusal: [],
          },
          w: 1.2,
        });
        if (o2 && o2.family === 'generosity') {
          if (need === 'money') {
            const amt = Math.min(Math.max(2, q.savings * 0.3), -p.savings + 1);
            q.savings -= amt;
            p.savings += amt;
          }
          learned(w, p, 'ask', true);
          learned(w, p, 'ask:' + q.id, true);
          learned(w, q, 'helped:' + p.id, true);
          addEmotion(w, p, 'helped', 'grateful', 0.1, 6, o2.event.id);
        } else if (o2) {
          learned(w, p, 'ask', false);
          learned(w, p, 'ask:' + q.id, false);
          if (facet(p, 'forgiveness') < -1.2 && p.savings < -8) addException(p, q, 'forgiveness', o2.event.id, `never forgave @${q.id}`);
        }
      }
      break;
    case 'confide':
      if (x.family === 'seeking' && inst.target) {
        const q = inst.target;
        const sid = p.secrets[p.secrets.length - 1];
        const se = w.events[sid];
        p.secrets = p.secrets.filter(s => s !== sid);
        learnOf(w, q.id, se, 0.9);
        const o2 = run(w, {
          type: 'discovery',
          actor: q,
          target: p,
          others: [],
          thing: 'it',
          features: new Set<Feature>(['private', family(p, q) ? 'family' : 'friend']),
          families: ['discretion', 'disclosure'],
          only: { discretion: ['keepsecret'], disclosure: ['tell', 'confrontsecret'] },
          cause: e.id,
          familyExtra: { discretion: [bondC(w, q, p, 'like', 1)] },
          w: 1,
        });
        if (o2 && o2.expr.id === 'tell') {
          const hearers = [...friendsOf(w, q), ...q.circle.map(i => P(w, i)).filter(h => h.status === 'in')].filter(h => h !== p).slice(0, 3);
          for (const h of hearers) learnOf(w, h.id, se, 0.6);
          if (w.rng.chance(0.5)) {
            const e3 = addEvent(w, {
              type: 'betrayed',
              who: [p.id, q.id],
              text: `It got back to @${p.id} that @${q.id} had been talking.`,
              causes: [eventCause(w, o2.event.id, 1)],
              vis: 'local',
              evidence: [],
              w: 2,
            });
            broadcast(w, e3);
            remember(w, p, q, e3.id, -0.5, -0.3, -0.7, 'told everyone what I told them in confidence');
            carryReset(w, p.id, q.id);
            p.friends.delete(q.id);
            q.friends.delete(p.id);
            if (facet(p, 'forgiveness') < -0.8) addException(p, q, 'forgiveness', e3.id, `never forgave @${q.id} for talking`);
          }
        } else if (o2 && o2.expr.id === 'confrontsecret') {
          /* handled by provocation queue */
        }
      }
      break;
    case 'strain':
      if (x.id === 'confide' && inst.target) {
        remember(w, p, inst.target, e.id, 0.15, 0, 0.25, 'was there when it mattered');
      }
      break;
    case 'deadline': {
      const pl = w.placeById.get(p.job!)!;
      const lead = pl.lead != null && pl.lead !== p.id ? P(w, pl.lead) : null;
      if (x.id === 'late') {
        p.perf -= 0.3;
        addStress(p, 'late', `missing the deadline on ${inst.thing}`, 0.08, e.id);
        if (lead) remember(w, lead, p, e.id, -0.15, -0.3, -0.2, `let us down on ${inst.thing}`);
        for (const q of staffOf(w, p.job))
          if (q.job === p.job && q !== p && q !== lead) {
            const r = bond(w, q.id, p.id);
            r.respect = clamp(r.respect - 0.1, -1, 1);
          }
      } else {
        p.perf += 0.15;
        if (lead) remember(w, lead, p, e.id, 0.08, 0.2, 0.1, `came through on ${inst.thing}`);
        if (x.id === 'allnighter') addStress(p, 'allnighter', 'the all-nighter', 0.04, e.id);
      }
      break;
    }
    case 'newcomer': {
      const n = inst.target!;
      const r = bond(w, n.id, p.id);
      if (x.id === 'welcome') {
        r.fam = Math.min(1, r.fam + 0.3);
        remember(w, n, p, e.id, 0.25, 0.05, 0.2, 'made me welcome');
        bond(w, p.id, n.id).fam = Math.min(1, bond(w, p.id, n.id).fam + 0.3);
      } else remember(w, n, p, e.id, -0.1, 0, -0.05, 'kept me at a distance');
      break;
    }
    case 'asked': {
      const lead = inst.target!;
      if (x.id === 'straighttalk') {
        if (facet(lead, 'modesty', p.id) < -1 || facet(lead, 'patience') < -1) {
          remember(w, lead, p, e.id, -0.2, 0.1, 0, 'told me what was wrong with my plan, in that tone');
          queueProvocation(w, lead, p, e, false);
        } else remember(w, lead, p, e.id, 0.05, 0.25, 0.2, 'told me straight when I asked');
      } else {
        if (facet(lead, 'sincerity') > 0.8 && lead.aptitudes.socialInsight > 0.3)
          remember(w, lead, p, e.id, -0.05, -0.1, -0.2, 'told me what I wanted to hear');
        else remember(w, lead, p, e.id, 0.1, 0, 0.02, 'backed the plan');
      }
      break;
    }
    case 'danger': {
      const v = inst.target!;
      if (x.id === 'rescue') {
        remember(w, v, p, e.id, 0.5, 0.4, 0.5, 'came in after me');
        for (const q of staffOf(w, p.job))
          if (q.job === p.job && q !== p) {
            const r = bond(w, q.id, p.id);
            r.respect = clamp(r.respect + 0.3, -1, 1);
          }
        if (w.rng.chance(0.15)) {
          p.ill = 1 + w.rng.int(0, 2);
          addEmotion(w, p, 'ill', 'banged up', -0.08, p.ill, e.id);
        }
      } else {
        remember(w, v, p, e.id, -0.2, -0.3, -0.2, 'froze when I needed help');
        if (facet(p, 'fearfulness') < 0.5 && !p.marks.some(m => m.key === 'froze'))
          p.marks.push({ t: w.t, key: 'froze', delta: 0, cause: e.id, text: `has not forgiven ${self(p)} for freezing at ${inst.place}` });
        addStress(p, 'froze', 'freezing when it mattered', 0.1, e.id);
      }
      break;
    }
    case 'criticised': {
      const q = inst.target!;
      if (x.id === 'confront' || x.id === 'snap' || x.id === 'sarcasm') {
        if (facet(q, 'patience', p.id) < -0.3 && w.rng.chance(0.5)) {
          const e2 = addEvent(w, {
            type: 'row',
            who: [p.id, q.id],
            text: `It turned into a row in front of everyone at ${inst.place}.`,
            causes: [eventCause(w, e.id, 0.6), traitCause(q, 'patience', 0.4, -1)],
            vis: 'local',
            evidence: [ev(q.id, 'patience', -1, 0.8, 0.8)],
            w: 1.3,
          });
          broadcast(w, e2);
          remember(w, p, q, e2.id, -0.2, -0.1, -0.1, 'went for me in front of everyone');
        }
      } else if (x.id === 'swallow' && p.perf > -0.3) addStress(p, 'swallowed', `taking @${q.id}'s criticism in silence`, 0.05, e.id);
      break;
    }
  }
}
export function addException(p: Person, other: Person, key: string, cause: number, text: string) {
  if (p.exceptions.length >= 2 || p.exceptions.some(x => x.other === other.id && x.key === key)) return;
  p.exceptions.push({ key, other: other.id, strength: -2.2, cause, text });
}
