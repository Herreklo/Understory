// Threads: the same pressure, answered the same way, again and again, is one situation developing, not many events.
// Stage 1: it starts (the first act is logged). Stage 2: it becomes a pattern; someone close notices and asks, or looks away.
// Stage 3: it costs something: a bond pays for it. It ends when the person comes through it, opens up, or breaks.

import { clamp } from './rng';
import {
  type World,
  type Person,
  type Thread,
  type Event,
  P,
  live,
  facet,
  bond,
  remember,
  addEvent,
  broadcast,
  addStress,
  addEmotion,
  year,
} from './world';
import type { Feature } from './features';
import type { Family, Expression } from './families';
import { run, friendsOf, family } from './grammar';
import { eventCause, stateCause, traitCause, bondC, pubC, ev } from './considerations';

const she = (p: Person) => (p.sex === 'f' ? 'she' : 'he');
const PATTERN: Record<string, (p: Person, th: Thread) => string> = {
  withdrawal: (p, th) =>
    `@${p.id} has not been ${she(p) === 'she' ? 'herself' : 'himself'} for months; ${she(p)} keeps to ${she(p) === 'she' ? 'herself' : 'himself'} and people have started to notice.`,
  anger: p => `@${p.id}'s temper has become a thing people talk about.`,
  seeking: p => `@${p.id} has been leaning on everyone lately, and everyone has noticed.`,
};
const CHRONIC: Record<string, (p: Person) => string> = {
  withdrawal: p => `By now @${p.id} was someone who kept to ${she(p) === 'she' ? 'herself' : 'himself'}; nobody remarked on it any more.`,
  anger: p => `People had learned to give @${p.id} a wide berth when the mood was on ${she(p) === 'she' ? 'her' : 'him'}.`,
  seeking: p => `It was known that @${p.id} leaned on people. They had stopped minding, or stopped being there.`,
};
const COST: Record<string, string> = {
  withdrawal: 'shut me out for months',
  anger: 'took it out on me one time too many',
  seeking: 'always needed something',
};

export function openThread(p: Person, fam: string, t: number): Thread | undefined {
  // An ended thread still absorbs the same answer for a while; a new one only starts after a real pause.
  return p.threads.find(th => th.family === fam && (!th.ended ? t - th.lastAt <= 18 : t - th.lastAt <= 9));
}

// Called by the grammar for every strain act. Returns whether the act itself should be logged.
export function threadStep(w: World, p: Person, fam: Family, expr: Expression, target: Person | undefined, source: string, e: Event): boolean {
  if (!['withdrawal', 'anger', 'seeking'].includes(fam)) return true;
  let th = openThread(p, fam, w.t);
  if (!th) {
    th = { id: w.events.length, family: fam, source, since: w.t, lastAt: w.t, acts: 1, stage: 1, events: [e.id], targets: {} };
    p.threads.push(th);
    if (target) th.targets[target.id] = 1;
    if (expr.intensity >= 0.8) {
      const news = w.t - (p.tried['big:' + fam]?.t ?? -99) > 24;
      if (news) p.tried['big:' + fam] = { t: w.t, ok: true, n: (p.tried['big:' + fam]?.n ?? 0) + 1 };
      return news;
    }
    // The third thread of the same kind in six years is no longer a thread: it is how this person is now. Said once; the single acts stop being news.
    if (p.tried['chronic:' + fam]) return false;
    if (p.threads.filter(x => x.family === fam && w.t - x.since <= 72).length >= 3) {
      p.tried['chronic:' + fam] = { t: w.t, ok: true, n: 1 };
      const text = CHRONIC[fam]?.(p) ?? `@${p.id} had settled into it.`;
      const c = addEvent(w, {
        type: 'thread:chronic',
        who: [p.id],
        text,
        causes: [
          stateCause(`years of ${source.replace(/^in /, '')}`, 0.6),
          traitCause(p, fam === 'withdrawal' ? 'sociability' : fam === 'anger' ? 'patience' : 'dependence', 0.4, fam === 'seeking' ? 1 : -1),
        ],
        vis: 'local',
        evidence:
          fam === 'withdrawal'
            ? [ev(p.id, 'sociability', -1, 0.6, 0.7)]
            : fam === 'anger'
              ? [ev(p.id, 'patience', -1, 0.6, 0.7)]
              : [ev(p.id, 'dependence', 1, 0.6, 0.7)],
        w: 1.4,
      });
      broadcast(w, c);
      return false;
    }
    return true;
  }
  th.acts++;
  th.lastAt = w.t;
  th.events.push(e.id);
  if (target) th.targets[target.id] = (th.targets[target.id] ?? 0) + 1;
  if (th.ended) return false; // the tail of something that has ended: absorbed, never escalated
  const big = expr.intensity >= 0.8;
  if (big) {
    // A breaking point is news once in a long while; the same outburst again is the thread, not news.
    const news = w.t - (p.tried['big:' + fam]?.t ?? -99) > 24;
    if (news) {
      p.tried['big:' + fam] = { t: w.t, ok: true, n: (p.tried['big:' + fam]?.n ?? 0) + 1 };
    }
    if (th.stage >= 2) {
      end(w, p, th, 'broke', e.id);
      return news;
    }
    if (th.acts >= 3) {
      pattern(w, p, th);
      return news;
    }
    return news;
  }
  if (th.stage === 1 && th.acts >= 3) {
    pattern(w, p, th);
    return false;
  }
  if (th.stage === 2 && th.acts >= 5) {
    cost(w, p, th);
    return false;
  }
  return false; // inside a thread, the repeats are the thread's, not the chronicle's
}

function closest(w: World, p: Person): Person | undefined {
  if (p.partner != null && P(w, p.partner).status === 'in') return P(w, p.partner);
  const f = friendsOf(w, p).sort((a, b) => bond(w, b.id, p.id).like - bond(w, a.id, p.id).like)[0];
  if (f) return f;
  if (p.job) {
    const pl = w.placeById.get(p.job)!;
    if (pl.lead != null && pl.lead !== p.id) return P(w, pl.lead);
  }
  for (const k of [...p.parents, ...p.kids]) {
    const q = P(w, k);
    if (q.status === 'in' && w.t - q.born > 16 * 12) return q;
  }
  return undefined;
}

function pattern(w: World, p: Person, th: Thread) {
  th.stage = 2;
  const e = addEvent(w, {
    type: 'thread:pattern',
    who: [p.id],
    text: PATTERN[th.family](p, th),
    causes: [stateCause(th.source, 0.6), eventCause(w, th.events[0], 0.4)],
    vis: 'local',
    evidence: [ev(p.id, 'state:low', 1, 1, 0.7)],
    w: 1.3,
  });
  broadcast(w, e);
  th.events.push(e.id);
  // Someone close notices, or looks away.
  const q = closest(w, p);
  if (!q) return;
  th.noticedBy = q.id;
  const feats = new Set<Feature>(['private', 'need', family(p, q) || p.partner === q.id ? 'family' : 'friend']);
  const o = run(w, {
    type: 'notice',
    actor: q,
    target: p,
    others: [],
    thing: '',
    features: feats,
    families: ['warmth', 'lapse'],
    only: { warmth: ['askwhat'], lapse: ['lookaway'] },
    cause: e.id,
    w: 1.1,
    familyExtra: {
      warmth: [bondC(w, q, p, 'like', 1)],
      lapse: [pubC('own', q.stress > 0.5 ? 'had troubles of their own' : 'had the time', q.stress > 0.5 ? 0.7 : 0.15)],
    },
  });
  if (!o) return;
  th.events.push(o.event.id);
  if (o.expr.id === 'lookaway') {
    q.tried['lookaway:' + p.id] = { t: w.t, ok: true, n: 1 };
    return;
  }
  if (o.expr.id !== 'askwhat') return;
  th.asked = true;
  // Asked straight out: open up, or brush it off.
  const o2 = run(w, {
    type: 'answer',
    actor: p,
    target: q,
    others: [],
    thing: 'it',
    features: new Set<Feature>(['private', feats.has('family') ? 'family' : 'friend', 'tired']),
    families: ['seeking', 'withdrawal'],
    only: { seeking: ['confide'], withdrawal: ['brushoff'] },
    cause: o.event.id,
    w: 1.2,
    familyExtra: { seeking: [bondC(w, p, q, 'trust', 1, 5, 0.45)] },
  });
  if (!o2) return;
  th.events.push(o2.event.id);
  if (o2.expr.id === 'confide') {
    remember(w, q, p, o2.event.id, 0.1, 0.05, 0.2, 'finally told me');
    remember(w, p, q, o2.event.id, 0.2, 0.1, 0.25, 'was there when it mattered');
    p.stress = clamp(p.stress - 0.15, 0, 1);
    end(w, p, th, 'opened up', o2.event.id);
  } else remember(w, q, p, o2.event.id, -0.05, 0, -0.1, 'would not let me in');
}

function cost(w: World, p: Person, th: Thread) {
  th.stage = 3;
  const tid = Object.entries(th.targets).sort((a, b) => b[1] - a[1])[0]?.[0];
  const q = tid != null ? P(w, +tid) : closest(w, p);
  if (!q || q.status !== 'in') return;
  const text =
    th.family === 'withdrawal'
      ? `@${q.id} stopped trying to reach @${p.id}.`
      : th.family === 'anger'
        ? `@${q.id} had had enough of @${p.id}'s temper.`
        : `@${q.id} stopped answering when @${p.id} rang.`;
  const e = addEvent(w, {
    type: 'thread:cost',
    who: [q.id, p.id],
    text,
    causes: [
      stateCause(`${th.acts} times in ${Math.max(1, Math.round(((w.t - th.since) / 12) * 10) / 10)} years: ${th.source}`, 0.6),
      traitCause(q, 'patience', 0.4, -1),
    ],
    vis: 'local',
    evidence: [ev(q.id, 'patience', -0.5, 0.5, 0.5), ev(q.id, 'bond:' + p.id, -1, 1, 0.7)],
    w: 1.6,
  });
  broadcast(w, e);
  th.events.push(e.id);
  remember(w, q, p, e.id, -0.3, -0.15, -0.2, COST[th.family]);
  if (p.friends.has(q.id) && facet(q, 'forgiveness', p.id) < 0.5) {
    p.friends.delete(q.id);
    q.friends.delete(p.id);
  }
  addStress(p, 'thread', `losing @${q.id}`, 0.1, e.id);
  addEmotion(w, p, 'thread', `@${q.id} has given up on ${she(p) === 'she' ? 'her' : 'him'}`, -0.12, 8, e.id);
}

// Told the truth at home: the withdrawal the asker had been watching is over. Called by the grammar after an admission.
export function openedUp(w: World, p: Person, q: Person, ref: number) {
  for (const th of p.threads)
    if (!th.ended && th.family === 'withdrawal' && (th.noticedBy == null || th.noticedBy === q.id)) {
      end(w, p, th, 'opened up', ref);
      remember(w, q, p, ref, 0.1, 0.05, 0.2, 'finally told me');
    }
}

function end(w: World, p: Person, th: Thread, how: string, ref: number) {
  th.ended = w.t;
  th.how = how;
  if (how === 'came through') {
    const months = w.t - th.since;
    const e = addEvent(w, {
      type: 'thread:through',
      who: [p.id],
      text: `@${p.id} came through it, after ${months >= 18 ? Math.round(months / 12) + ' years' : months + ' months'} of ${th.source === 'ill' ? 'illness' : th.source.replace(/^in /, '')}.`,
      causes: [eventCause(w, th.events[0], 0.4), stateCause(p.stress < 0.25 ? 'the pressure had eased' : 'learned to carry it', 0.6)],
      vis: 'local',
      evidence: [ev(p.id, 'state:low', -1, 1, 0.7)],
      w: 1.2,
    });
    broadcast(w, e);
    th.events.push(e.id);
  }
}

// Threads that go quiet end, one way or the other.
export function threadsTick(w: World) {
  for (const p of live(w))
    for (const th of p.threads) {
      if (th.ended) continue;
      if (w.t - th.lastAt >= 5 && p.stress < 0.4) end(w, p, th, th.stage >= 2 ? 'came through' : 'faded', w.events.length - 1);
      else if (w.t - th.lastAt > 14) end(w, p, th, 'faded', w.events.length - 1);
    }
}
