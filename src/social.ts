// Contact and friendship: who spends time with whom, what each comes to think of the other, gossip, and losing touch.

import { tellingTick } from './telling';
import { carrySought, carrySeekFactor, carryReset, carryEnd } from './carry';
import { clamp, hash, type Rng } from './rng';
import { SETTING } from './setting';
import { VALUES, FACET_BY_ID } from './core';
import {
  type Bond,
  type Cause,
  type Person,
  type World,
  bkA,
  bkB,
  OFF,
  recentEvents,
  setObsEvent,
  type Evidence,
  age,
  live,
  P,
  facet,
  bond,
  peekBond,
  likeOf,
  remember,
  memWeight,
  addEvent,
  broadcast,
  addEmotion,
  observe,
  year,
  logistic,
  tagObs,
  belief,
} from './world';
import { around, hoodOf, hoods, idx } from './scale';
import { z01 } from './decide';
import { regardWeight } from './regard';
import { friendsOf, family } from './grammar';
import { traitCause, stateCause, ev, learned } from './considerations';
import { groupPairs } from './group';
import { resolveWants, wantRestore, pursuing, habitPairs, habitEvidence } from './time';

const VN = Object.fromEntries(VALUES.map(v => [v.id, v.name]));
// How well ordinary contact reads a facet, by HEXACO dimension: the correlation of an other-rating with the truth after ordinary acquaintance.
const MANNER_ACCURACY: Record<string, number> = { X: 0.45, C: 0.35, O: 0.3, A: 0.25, E: 0.22, H: 0.18, I: 0.28 };
const SIMV = ['freedom', 'tradition', 'success', 'lovedOnes', 'fairness'];
function chemistry(a: Person, b: Person): number {
  let s = 0;
  for (const k of SIMV) s += 1 - Math.abs(a.values[k] - b.values[k]) / 2.5;
  s /= SIMV.length;
  return (
    (s - 0.35) * 2.0 +
    0.5 * (logistic(facet(b, 'gentleness') + facet(b, 'liveliness')) - 0.5) +
    0.3 * (logistic(facet(a, 'sociability')) - 0.5) -
    0.35 * Math.max(0, -facet(b, 'patience') - 0.8) -
    (facet(a, 'modesty') < -1.2 && facet(b, 'modesty') < -1.2 ? 0.25 : 0) -
    (s < 0.25 ? 0.25 : 0) -
    0.2 * Math.max(0, -facet(b, 'gentleness') - 1) -
    0.15 * Math.max(0, -facet(b, 'sincerity') - 1) * z01(facet(a, 'sincerity'))
  );
}
export function chemWhy(w: World, a: Person, b: Person, sign = 1): Cause[] {
  const out: Cause[] = [];
  let s = 0;
  for (const k of SIMV) s += 1 - Math.abs(a.values[k] - b.values[k]) / 2.5;
  s /= SIMV.length;
  if (sign > 0) {
    if (s > 0.75) out.push({ kind: 'value', label: 'they want the same things from life', weight: 0.4 });
    if (facet(b, 'gentleness') > 0.9) out.push(traitCause(b, 'gentleness', 0.3, 1));
    if (facet(b, 'liveliness') > 0.9) out.push(traitCause(b, 'liveliness', 0.3, 1));
  } else {
    if (s < 0.3) {
      const k = SIMV.slice().sort((x, y) => Math.abs(a.values[y] - b.values[y]) - Math.abs(a.values[x] - b.values[x]))[0];
      out.push({ kind: 'value', label: `they see ${VN[k].toLowerCase()} completely differently`, weight: 0.4 });
    }
    if (facet(b, 'gentleness') < -1) out.push(traitCause(b, 'gentleness', 0.3, -1));
    if (facet(b, 'patience') < -1) out.push(traitCause(b, 'patience', 0.3, -1));
    if (facet(a, 'modesty') < -1.2 && facet(b, 'modesty') < -1.2)
      out.push({ kind: 'trait', label: 'two people who both need to be the one who matters', weight: 0.3 });
    if (facet(b, 'sincerity') < -1 && facet(a, 'sincerity') > 0.5)
      out.push({ kind: 'trait', label: `@${a.id} can tell when someone is performing`, weight: 0.3 });
  }
  return out;
}
// Which channel the current contact comes through (work, family, sought…), for the social-graph audit.
let channel = '';
function contact(w: World, a: Person, b: Person, i: number) {
  w.hooks.contact?.(w, a, b, i, channel);
  for (const [x, y] of [
    [a, b],
    [b, a],
  ] as const) {
    const r = bond(w, x.id, y.id);
    if ((r as any).since == null) (r as any).since = w.t;
    r.fam = Math.min(1, r.fam + 0.03 * i);
    r.touched = w.t;
    if (channel) {
      const via = ((r as any).via ??= {}) as Record<string, number>;
      via[channel] = (via[channel] ?? 0) + i;
    }
    (r as any).recent = ((r as any).recent ?? 0) + i; // contact lately: a running sum that halves in about six months // how these two came to spend time together
    let memLike = 0,
      memResp = 0,
      memTrust = 0;
    for (const m of r.mem) {
      const k = memWeight(x, m, w.t, y.id);
      memLike += m.like * k;
      memResp += m.respect * k;
      memTrust += m.trust * k;
    }
    // What x believes y feels about x shapes how x warms to y. When the belief is wrong, it can make itself true.
    const bl = OFF.has('respond') ? undefined : belief(w, x.id, y.id, 'bond:' + x.id);
    const chill = bl && bl.n > 0 && bl.m < -0.2 ? 0.35 * Math.min(1, -bl.m) : 0;
    const chem = chemistry(x, y);
    const tgtLike = clamp(chem * Math.min(1, 0.55 + r.fam) + (!OFF.has('exposure') && chem > -0.3 ? EXPOSURE * r.fam : 0) + memLike - chill, -1, 1); // knowing someone makes them easier to like (round 19c)
    if (
      chill > 0 &&
      r.like > 0 &&
      r.like + (tgtLike - r.like) * 0.06 * i <= 0 &&
      likeOf(w, y.id, x.id) > 0.2 &&
      !x.tried['misread:' + y.id] &&
      age(w, x) >= 16 &&
      age(w, y) >= 16
    ) {
      learned(w, x, 'misread:' + y.id, true);
      const e = addEvent(w, {
        type: 'misread',
        who: [x.id, y.id],
        text: `@${x.id} had decided @${y.id} never liked ${x.sex === 'f' ? 'her' : 'him'}, and went cool. @${y.id}, who did, never understood why.`,
        causes: [
          {
            kind: 'belief',
            label: `@${x.id} believed @${y.id} disliked ${x.sex === 'f' ? 'her' : 'him'} (wrongly)`,
            weight: 0.7,
            who: x.id,
            key: 'bond:' + x.id,
          },
          traitCause(x, 'socialSelfEsteem', 0.3, -1),
        ],
        vis: 'private',
        evidence: [ev(x.id, 'socialSelfEsteem', -1, 0.5, 0.6), ev(x.id, 'bond:' + y.id, -1, 0.6, 0.7)],
        w: 1.2,
      });
      e.knownBy.set(y.id, 'seen');
      broadcast(w, e);
      remember(w, y, x, e.id, -0.12, 0, -0.08, 'went cool on me for no reason I could see');
    }
    r.like += (tgtLike - r.like) * 0.06 * i + w.rng.normal() * 0.01 * i;
    r.respect += (clamp(0.3 * y.perf + memResp, -1, 1) - r.respect) * 0.04 * i;
    r.trust += (clamp(0.2 * facet(y, 'fairness') + memTrust + 0.1, -1, 1) - r.trust) * 0.03 * i;
    r.like = clamp(r.like, -1, 1);
    r.respect = clamp(r.respect, -1, 1);
    r.trust = clamp(r.trust, -1, 1);
    // Ordinary contact teaches you a little about people: their manner shows, their strong traits most of all. As good as the research
    // says and no better: a read of a facet is what the person shows (truth plus mask) plus noise, set so the read correlates with the
    // truth at the level other-ratings reach after ordinary acquaintance (Connelly & Ones 2010; HEXACO honesty-humility lowest). The weight
    // of the read scales with that accuracy, so what manner can teach about fairness is a fraction of what it teaches about sociability.
    if (!OFF.has('manner') && w.rng.chance(0.22 * i * (0.6 + 0.4 * z01(x.aptitudes.socialInsight)))) {
      tagObs('manner');
      const keys = [
        'sociability',
        'liveliness',
        'gentleness',
        'organisation',
        'patience',
        'sincerity',
        'modesty',
        'diligence',
        'socialBoldness',
        'inquisitiveness',
        'anxiety',
        'altruism',
        'fairness',
        'forgiveness',
        'dependence',
        'prudence',
        'greedAvoidance',
        'flexibility',
        'sentimentality',
      ];
      const k = w.rng.weighted(keys.map(k => [k, 0.5 + Math.abs(facet(y, k))] as [string, number]));
      const shown = facet(y, k) + (y.presentation[k] ?? 0);
      const acc = OFF.has('mannernoise') ? 1 : (MANNER_ACCURACY[FACET_BY_ID[k]?.dim ?? 'I'] ?? 0.3);
      const read = acc >= 1 ? shown : shown + w.rng.normal() * Math.sqrt(1 / (acc * acc) - 1);
      const mev = ev(y.id, k, Math.sign(read) || 1, Math.min(1.5, Math.abs(read)) * 0.8 * acc, 0.35);
      // What the witness noticed is written down, so a player can read it: a strong read, one time in three, at most once a year per person and facet.
      // The line follows the read, not the truth, so a wrong impression is a wrong line. Everyone else's manner reads stay silent.
      if (
        x.id === w.witness &&
        w.t >= w.startPresent &&
        Math.abs(read) >= 1.0 &&
        w.rng.chance(0.33) &&
        w.t - (x.tried['noticed:' + y.id + ':' + k]?.t ?? -99) >= 12
      ) {
        learned(w, x, 'noticed:' + y.id + ':' + k, true);
        const f = FACET_BY_ID[k];
        const tell = read > 0 ? f.hiTell : f.loTell;
        const e = addEvent(w, {
          type: 'noticed',
          who: [y.id],
          text: `Noticed: @${y.id} ${tell}.`,
          causes: [traitCause(y, k, 1, read > 0 ? 1 : -1)],
          vis: 'private',
          evidence: [mev],
          w: 0.3,
          knownBy: new Map([[x.id, 'seen']]),
        });
        broadcast(w, e);
      } else observe(w, x.id, mev, 'seen');
      tagObs('act');
    }
    // The closer you are, the more you see of how someone is doing: strain shows at the kitchen table, and so does money being tight.
    // When the observer is the witness, the kitchen table is written down (at most one line of each kind per person per half year); otherwise the read stays silent.
    // The easing line is only news when the witness had thought them low (or broke); otherwise nothing wrong is nothing to write.
    if (r.fam > 0.35 && w.rng.chance(0.08 * i * r.fam))
      kitchenTable(
        w,
        x,
        y,
        'low',
        ev(y.id, 'state:low', y.stress > 0.45 ? 1 : -1, y.stress > 0.45 ? 0.5 + y.stress * 0.5 : 0.5, 0.5),
        y.stress > 0.45 ? `Over dinner it was plain @${y.id} was carrying something.` : `@${y.id} seemed lighter than in a long while.`,
      );
    if (r.fam > 0.5 && w.rng.chance(0.03 * i * r.fam))
      kitchenTable(
        w,
        x,
        y,
        'broke',
        ev(y.id, 'state:broke', y.savings < -2 ? 1 : -1, y.savings < -2 ? 0.8 : 0.5, 0.5),
        y.savings < -2 ? `@${y.id} let slip that money was tight.` : `Money, at least, was not a worry for @${y.id}.`,
      );
    // What matters to a person reaches others only through what they do about it (values are causes of acts, and acts are evidence). Whether they'd ever leave, they say.
    if (w.rng.chance(0.04 * i) && r.fam > 0.3 && Math.abs(y.facets['attach:home'] ?? 0) > 0.5)
      observe(w, x.id, ev(y.id, 'attach:home', Math.sign(y.facets['attach:home']), 0.7, 0.4), 'seen');
    // Habits are the most visible thing about anyone.
    // Habits are the most visible thing about anyone, and learned once: the hundredth sighting of the morning swim teaches nothing new.
    if (w.rng.chance(0.06 * i)) {
      const kept = y.habits.filter(h => !h.broken && !x.tried[`knows:${y.id}:${h.id}`]);
      if (kept.length) {
        const h = w.rng.pick(kept);
        learned(w, x, `knows:${y.id}:${h.id}`, true);
        tagObs('habit');
        for (const e of habitEvidence(y, h.id, 0.5, 0.4)) observe(w, x.id, e, 'seen');
        tagObs('act');
      }
    }
  }
  checkBond(w, a, b);
}
// The kitchen table: what someone close sees of how another is doing. The witness's reads are written down (at most one line of each
// kind per person per half year), and the easing line only when the witness had thought them low or broke; everyone else's stay silent.
function thoughtLow(w: World, x: Person, y: Person, key: string) {
  const b = belief(w, x.id, y.id, 'state:' + key);
  return !!b && b.n > 0 && b.m > 0.3;
}
function kitchenTable(w: World, x: Person, y: Person, key: string, e2: Evidence, text: string) {
  if (
    x.id === w.witness &&
    w.t >= w.startPresent &&
    (e2.dir > 0 || thoughtLow(w, x, y, key)) &&
    w.t - (x.tried['table:' + key + ':' + y.id]?.t ?? -99) >= 6
  ) {
    learned(w, x, 'table:' + key + ':' + y.id, true);
    const e = addEvent(w, {
      type: 'table',
      who: [y.id],
      text,
      causes: [
        stateCause(
          key === 'low' ? (e2.dir > 0 ? `the strain @${y.id} is under` : 'things had eased') : e2.dir > 0 ? 'money is tight' : 'money is fine',
          0.6,
        ),
      ],
      vis: 'private',
      evidence: [e2],
      w: 0.3,
      knownBy: new Map([[x.id, 'seen']]),
    });
    broadcast(w, e);
  } else observe(w, x.id, e2, 'seen');
}
// How two people came to spend time together: the channel that gave them most contact.
function howMet(w: World, a: Person, b: Person): Cause[] {
  const via: Record<string, number> = {};
  for (const r of [peekBond(w, a.id, b.id), peekBond(w, b.id, a.id)])
    for (const [k, v] of Object.entries(((r as any)?.via ?? {}) as Record<string, number>)) via[k] = (via[k] ?? 0) + v;
  const top = Object.entries(via).sort((x, y) => y[1] - x[1])[0]?.[0];
  const hs = SETTING.hobbies.filter(h => a.skills[h]?.interest === 2 && b.skills[h]?.interest === 2);
  const label =
    top === 'work'
      ? a.job && a.job === b.job
        ? `they work together at ${w.placeById.get(a.job)!.name}`
        : 'they worked together for years'
      : top === 'circle'
        ? 'they run in the same crowd'
        : top === 'habit'
          ? (() => {
              const h = a.habits.find(x => !x.broken && x.kind === 'social' && b.habits.some(y => y.id === x.id && !y.broken));
              const d = h && SETTING.habits.find(x => x.id === h.id);
              return (d as any)?.together ?? 'the same routines kept bringing them together';
            })()
          : top === 'group'
            ? 'they make music together'
            : top === 'hobby'
              ? hs.length
                ? `both live for ${SETTING.skillWords[hs[0]] ?? hs[0]}`
                : 'they share a passion'
              : top === 'sought'
                ? 'they kept seeking each other out'
                : top === 'public'
                  ? 'they kept running into each other in town'
                  : top === 'family'
                    ? 'they grew up around each other'
                    : '';
  return label ? [stateCause(label, 0.3)] : [];
}
// Friendships are checked every month, met or not: a pair who stop seeing each other drift apart, and the dead and departed are not kept as close friends.
// Losing touch ends a friendship, checked monthly (round 15); with the time budget off, only a falling-out does.
const FADE = () => !OFF.has('budget');
export function friendsTick(w: World) {
  // Without the budget the dead and departed still leave one's friends; only losing touch is skipped (round F26).
  const fade = FADE();
  for (const p of live(w))
    for (const id of [...p.friends]) {
      const q = w.byId.get(id);
      if (!q || q.status !== 'in') {
        carryReset(w, p.id, id);
        p.friends.delete(id);
        if (q) q.friends.delete(p.id);
        continue;
      } // a friendship ends for both
      if (fade && q.id > p.id) checkBond(w, p, q);
    }
}
// A person's five most familiar people outside the family, refreshed each month (round 19b).
function closest(w: World, p: Person): Set<number> {
  return ((w as any)._closest as Map<number, Set<number>> | undefined)?.get(p.id) ?? new Set();
}
function refreshClosest(w: World) {
  if (OFF.has('relbar')) return;
  const by = new Map<number, [number, number][]>();
  for (const [k, r] of w.bonds) {
    const a = bkA(w, k),
      b = bkB(w, k);
    if (r.fam < 0.1) continue;
    (by.get(a) ?? by.set(a, []).get(a)!).push([b, r.fam]);
  }
  const out = new Map<number, Set<number>>();
  for (const [a, list] of by) {
    const pa = w.byId.get(a);
    if (!pa) continue;
    out.set(
      a,
      new Set(
        list
          .filter(([b]) => {
            const q = w.byId.get(b);
            return !!q && q.status === 'in' && !family(pa, q) && pa.partner !== b;
          })
          .sort((x, y) => y[1] - x[1])
          .slice(0, 5)
          .map(([b]) => b),
      ),
    );
  }
  (w as any)._closest = out;
}
// How much familiarity alone adds to liking, where there is no real friction (Reis et al. 2011). Set from the literature, not tuned.
const EXPOSURE = 0.2;
// Below this much recent contact (about one meeting in five months), a friendship has lapsed (Roberts and Dunbar 2011).
const LOST_TOUCH = 0.08;
function checkBond(w: World, a: Person, b: Person) {
  if (age(w, a) < (OFF.has('school') ? 16 : 12) || age(w, b) < (OFF.has('school') ? 16 : 12) || family(a, b)) return; // friendships from twelve, among those who grow up together
  const ra = bond(w, a.id, b.id),
    rb = bond(w, b.id, a.id);
  const friends = a.friends.has(b.id);
  // A pair who have never fallen out are making friends for the first time, not making up.
  const cooledAt = Math.max(a.tried['cooled:' + b.id]?.t ?? -Infinity, b.tried['cooled:' + a.id]?.t ?? -Infinity);
  // A friendship that faded (they stopped seeing each other) is not a falling-out: coming back to it is not news, and not 'after everything'.
  const fadedAt = !FADE() ? -Infinity : Math.max(a.tried['faded:' + b.id]?.t ?? -Infinity, b.tried['faded:' + a.id]?.t ?? -Infinity);
  const again = w.t - cooledAt < 600;
  const bar = again ? 0.62 : 0.45;
  const near = !OFF.has('relbar') && Math.min(ra.fam, rb.fam) > 0.2 && closest(w, a).has(b.id) && closest(w, b).has(a.id); // each among the other's five most familiar outside the family
  if (
    !friends &&
    ra.like > bar &&
    rb.like > bar &&
    (ra.fam > 0.5 || near) &&
    a.partner !== b.id &&
    w.t - cooledAt > 36 &&
    w.t - fadedAt > 36 && // a friendship that lapsed does not quietly come back within three years
    w.t - (a.tried['friends']?.t ?? -99) > 4 &&
    w.t - (b.tried['friends']?.t ?? -99) > 4
  ) {
    a.friends.add(b.id);
    b.friends.add(a.id);
    carryReset(w, a.id, b.id);
    learned(w, a, 'friends', true);
    learned(w, b, 'friends', true);
    const nAgain = again ? Math.max(a.tried['madeup']?.n ?? 0, b.tried['madeup']?.n ?? 0) : 0;
    if (again) {
      learned(w, a, 'madeup', true);
      learned(w, b, 'madeup', true);
    }
    // A friendship that lapsed and comes back within fifty years: the page says so.
    const renewed = !again && w.t - fadedAt < 600;
    const quiet = !again && !renewed && w.t - fadedAt < 60;
    if (nAgain < 2 && !quiet) {
      const e = addEvent(w, {
        type: again ? 'madeup' : 'friends',
        who: [a.id, b.id],
        text: again
          ? `@${a.id} and @${b.id} are close again, after everything.`
          : renewed
            ? `@${a.id} and @${b.id} picked up where they had left off.`
            : [
                `@${a.id} and @${b.id} became friends.`,
                `@${a.id} and @${b.id} have become friends.`,
                `@${a.id} and @${b.id} are friends now.`,
                `@${a.id} found a friend in @${b.id}.`,
              ][hash(w.seed, a.id, b.id, w.t) % 4],
        causes: [...memWhy(w, a, b, 1), ...memWhy(w, b, a, 1), ...howMet(w, a, b), ...chemWhy(w, a, b)].slice(0, 3),
        vis: 'local',
        evidence: [
          ev(a.id, 'sociability', 1, 0.3, 0.4),
          ev(b.id, 'sociability', 1, 0.3, 0.4),
          ev(a.id, 'bond:' + b.id, 1, 0.8, 0.8),
          ev(b.id, 'bond:' + a.id, 1, 0.8, 0.8),
          ...(again ? [ev(a.id, 'forgiveness', 1, 0.5, 0.5), ev(b.id, 'forgiveness', 1, 0.5, 0.5)] : []),
        ],
        w: again ? 1.3 : 1,
      });
      broadcast(w, e);
      addEmotion(w, a, 'friend' + b.id, 'a new friend', 0.06, 6, e.id);
      addEmotion(w, b, 'friend' + a.id, 'a new friend', 0.06, 6, e.id);
      resolveWants(w, a, 'belong', 'people', 'achieved', e.id);
      resolveWants(w, b, 'belong', 'people', 'achieved', e.id);
      resolveWants(w, a, 'restore', String(b.id), 'achieved', e.id);
      resolveWants(w, b, 'restore', String(a.id), 'achieved', e.id);
    }
  } else if (
    friends &&
    (ra.like < 0.02 ||
      rb.like < 0.02 ||
      (Math.min(ra.like, rb.like) < 0.12 && Math.min(ra.fam, rb.fam) < 0.35) ||
      (!OFF.has('budget') && Math.max((ra as any).recent ?? 0, (rb as any).recent ?? 0) < LOST_TOUCH))
  ) {
    const fellOut = !FADE() || ra.like < 0.02 || rb.like < 0.02;
    const mark = fellOut ? 'cooled:' : 'faded:';
    const carried = fellOut ? undefined : carryEnd(w, a, b); // a friendship one friend had carried, and minded carrying, says so
    carryReset(w, a.id, b.id);
    a.friends.delete(b.id);
    b.friends.delete(a.id);
    learned(w, a, mark + b.id, true);
    learned(w, b, mark + a.id, true);
    const [x, y] = ra.like < rb.like ? [a, b] : [b, a];
    const lost = !OFF.has('budget') && !fellOut && Math.min(ra.like, rb.like) >= 0.12; // still liked; they just stopped seeing each other
    const e = addEvent(w, {
      type: 'cooled',
      who: [a.id, b.id],
      text: carried
        ? carried.text
        : lost
          ? [
              `@${a.id} and @${b.id} lost touch.`,
              `@${a.id} and @${b.id} stopped seeing each other, and that was that.`,
              `@${a.id} and @${b.id} drifted out of each other's lives.`,
            ][hash(w.seed, a.id, b.id, w.t) % 3]
          : `@${a.id} and @${b.id} drifted apart.`,
      causes: [
        ...(carried ? [carried.cause] : []),
        ...memWhy(w, x, y, -1),
        ...(contexts(w, a, b).length ? [] : [stateCause('they stopped seeing each other', 0.3)]),
        ...chemWhy(w, x, y, -1).slice(0, 1),
      ].slice(0, 3),
      vis: 'local',
      evidence: [ev(a.id, 'bond:' + b.id, -1, 0.6, 0.7), ev(b.id, 'bond:' + a.id, -1, 0.6, 0.7)],
      w: 1,
    });
    broadcast(w, e);
    wantRestore(w, y, x, e.id); // the one who still cares may try to put it right
  }
  for (const [x, y, r] of [
    [a, b, ra],
    [b, a, rb],
  ] as const) {
    const key = 'hate' + y.id;
    const hates = x.emotions.some(e => e.k === key);
    if (!hates && r.like < -0.4 && r.fam > 0.45 && (x.tried['dislikes']?.n ?? 0) < 3 + (facet(x, 'gentleness') < -1 ? 2 : 0)) {
      learned(w, x, 'dislikes', true);
      addEmotion(w, x, key, `can't stand @${y.id}`, -0.03, 999);
      const e = addEvent(w, {
        type: 'dislike',
        who: [x.id],
        text: [
          `@${x.id} can't stand @${y.id}.`,
          `@${x.id} has no time for @${y.id} any more.`,
          `@${x.id} cannot be in a room with @${y.id} for long.`,
        ][hash(w.seed, x.id, y.id, w.t) % 3],
        causes: [...memWhy(w, x, y, -1), ...chemWhy(w, x, y, -1)].slice(0, 3),
        vis: 'private',
        evidence: [ev(x.id, 'forgiveness', -1, 0.5, 0.5)],
        w: 1.5,
      });
      broadcast(w, e);
    } else if (hates && r.like > -0.1) x.emotions = x.emotions.filter(e => e.k !== key);
  }
}
const voiced = (text: string, holder: Person, other: Person) =>
  /\b(me|my|I)\b/.test(text) ? `@${other.id} ${text.replace(/\bmy\b/g, `@${holder.id}'s`).replace(/\b(me|I)\b/g, `@${holder.id}`)}` : text;
export function memWhy(w: World, x: Person, y: Person, sign: number): Cause[] {
  const r = peekBond(w, x.id, y.id);
  if (!r) return [];
  const seen = new Set<string>();
  return (
    r.mem
      .map(m => ({ m, v: (m.like + m.trust) * memWeight(x, m, w.t, y.id) }))
      .filter(o => sign * o.v > 0.08)
      .sort((p, q) => sign * (q.v - p.v))
      // A memory is kept in the holder's words ("went to me and apologised"); as a reason it is said from outside, once per event.
      .map(
        o =>
          ({
            kind: 'event',
            label: o.m.source === 'saw' ? `@${x.id} ${o.m.text} (${year(o.m.t)})` : `${voiced(o.m.text, x, y)} (${year(o.m.t)})`,
            weight: 0.5,
            ref: o.m.ev,
          }) as Cause,
      )
      .filter(c => {
        const k = c.ref != null && c.ref >= 0 ? 'e' + c.ref : c.label;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 2)
  );
}
export function contexts(w: World, a: Person, b: Person): Cause[] {
  const out: Cause[] = [];
  if (a.job && a.job === b.job) out.push(stateCause(`they work together at ${w.placeById.get(a.job)!.name}`, 0.3));
  const hs = SETTING.hobbies.filter(h => a.skills[h]?.interest === 2 && b.skills[h]?.interest === 2);
  if (hs.length) out.push(stateCause(`both live for ${hs[0]}`, 0.3));
  return out;
}
export function socialTick(w: World) {
  const L = live(w);
  // A city meets by settings: work by staff lists, school, hobbies, routines and the company sought within a neighbourhood. A town
  // of one neighbourhood (H = 1) runs the engine's own scans, exactly as before.
  const H = hoods(w),
    I = H === 1 ? null : idx(w);
  const pairs = (arr: Person[], i: number) => {
    for (let a = 0; a < arr.length; a++) for (let b = a + 1; b < arr.length; b++) contact(w, arr[a], arr[b], i);
  };
  // Round 15: in a shared setting of more than four, a person's time is what three partners would get, shared by attention (Dunbar, Duncan and Nettle 1995).
  const all = (arr: Person[]) => {
    const o: [Person, Person][] = [];
    for (let a = 0; a < arr.length; a++) for (let b = a + 1; b < arr.length; b++) o.push([arr[a], arr[b]]);
    return o;
  };
  const budget = (ps: [Person, Person][], c: number) => {
    if (OFF.has('budget')) {
      for (const [a, b] of ps) contact(w, a, b, c);
      return;
    }
    const K = 3;
    const nb = new Map<number, Person[]>();
    for (const [a, b] of ps) {
      (nb.get(a.id) ?? nb.set(a.id, []).get(a.id)!).push(b);
      (nb.get(b.id) ?? nb.set(b.id, []).get(b.id)!).push(a);
    }
    const give = new Map<number, Map<number, number>>();
    for (const [id, qs] of nb) {
      const m = new Map<number, number>();
      if (qs.length <= K) for (const q of qs) m.set(q.id, c);
      else {
        const att = qs.map(q => 0.15 + Math.max(0, likeOf(w, id, q.id)) + 0.5 * (peekBond(w, id, q.id)?.fam ?? 0));
        const sum = att.reduce((x, y) => x + y, 0);
        qs.forEach((q, k) => m.set(q.id, (c * K * att[k]) / sum));
      }
      give.set(id, m);
    }
    for (const [a, b] of ps) {
      const i = ((give.get(a.id)!.get(b.id) ?? 0) + (give.get(b.id)!.get(a.id) ?? 0)) / 2;
      if (i >= 0.01) contact(w, a, b, i);
    }
  };
  channel = 'work';
  for (const pl of w.places) budget(all(I ? (I.byJob.get(pl.id) ?? []) : L.filter(p => p.job === pl.id)), 1);
  channel = 'home';
  for (const p of L) {
    if (p.partner != null && p.id < p.partner && P(w, p.partner).status === 'in') contact(w, p, P(w, p.partner), 1.5);
    for (const k of p.kids) {
      const c = P(w, k);
      if (c.status === 'in') contact(w, p, c, age(w, c) < 20 ? 1.2 : 0.4);
    }
  }
  // School: those from six to eighteen who are not working spend each school day with others within two years of their age.
  channel = 'school';
  if (!OFF.has('school'))
    for (const among of I ? I.hood : [L]) {
      const kids = among.filter(p => age(w, p) >= 6 && age(w, p) < 19 && !p.job);
      const ps: [Person, Person][] = [];
      for (let i = 0; i < kids.length; i++)
        for (let j = i + 1; j < kids.length; j++)
          if (Math.abs(age(w, kids[i]) - age(w, kids[j])) <= 2 && !family(kids[i], kids[j])) ps.push([kids[i], kids[j]]);
      budget(ps, 1);
    }
  channel = 'family';
  if (!I) {
    for (const p of L)
      if (p.parents.length)
        for (const q of L)
          if (q.id > p.id && family(p, q) && !p.parents.includes(q.id) && !q.parents.includes(p.id))
            contact(w, p, q, age(w, p) < 20 && age(w, q) < 20 ? 1 : 0.3);
  } else {
    // in a city, brothers and sisters are found through their parents, not by checking every pair (same pairs, same order)
    const kidsOf = new Map<number, Person[]>();
    for (const p of L) for (const k of p.parents) (kidsOf.get(k) ?? kidsOf.set(k, []).get(k)!).push(p);
    for (const p of L)
      if (p.parents.length) {
        const sib = new Set<Person>();
        for (const k of p.parents) for (const q of kidsOf.get(k) ?? []) if (q.id > p.id) sib.add(q);
        for (const q of [...sib].sort((a, b) => a.id - b.id))
          if (family(p, q) && !p.parents.includes(q.id) && !q.parents.includes(p.id)) contact(w, p, q, age(w, p) < 20 && age(w, q) < 20 ? 1 : 0.3);
      }
  }
  channel = 'hobby';
  for (const h of SETTING.hobbies)
    for (const among of I ? I.hood : [L]) {
      let hs = among.filter(p => p.skills[h]?.interest === 2 && age(w, p) >= 14);
      if (hs.length > 6) hs = w.rng.shuffle(hs).slice(0, 6);
      budget(all(hs), 0.5);
    }
  channel = 'circle';
  for (const p of L)
    for (const id of p.circle) {
      const q = w.byId.get(id);
      if (q && q.status === 'in' && q.id > p.id) contact(w, p, q, 0.5);
    }
  channel = 'habit';
  if (OFF.has('budget')) for (const [a, b] of habitPairs(w)) contact(w, a, b, 0.4);
  else {
    const by = new Map<string, Person[]>();
    for (const p of L)
      for (const h of p.habits)
        if (!h.broken && h.kind === 'social') {
          const v = I ? h.id + '|' + hoodOf(w, p) : h.id; // in a city a routine is shared with the neighbourhood
          (by.get(v) ?? by.set(v, []).get(v)!).push(p);
        }
    for (const [, ps] of by) budget(all(ps), 0.4);
  }
  channel = 'group';
  budget(groupPairs(w), 0.8);
  channel = 'sought';
  const adults = L.filter(p => age(w, p) >= 16);
  const hoodAdults = I ? I.hood.map(r => r.filter(p => age(w, p) >= 16)) : [adults];
  for (const p of adults) {
    const near = I ? hoodAdults[hoodOf(w, p)] : adults; // company is sought in one's own neighbourhood
    const young = age(w, p) < 40;
    const n =
      Math.round(z01(facet(p, 'sociability')) * w.rng.next() * (young ? 4 : 2.5)) +
      (p.partner == null && young ? 1 : 0) +
      (pursuing(p, 'belong') ? 2 : 0);
    // Access: one pool for everyone, the adults near enough in age to spend time with (the same window the age check uses, so no draw is wasted).
    // How often a person seeks company (initiative) and whom they pick from the pool (preference, by regard) are decided separately.
    const pool = near.filter(q => q !== p && Math.abs(age(w, q) - age(w, p)) < 12);
    // People seek out those they like and keep away from those they can't stand; the disliked are left more alone.
    const src = pool.length ? pool : near;
    let kept = 0;
    // The weights are worked out once per person and kept up as they go: a contact changes only how p regards the one just met.
    let weights: [Person, number][] | null = null;
    for (let i = 0; i < n; i++) {
      if (!OFF.has('respond') && !weights)
        weights = src.map(q => [q, regardWeight(w, p.id, q.id, 1.5) * carrySeekFactor(w, p, q)] as [Person, number]);
      const q = OFF.has('respond') ? w.rng.pick(src) : w.rng.weighted(weights!);
      if (q !== p && Math.abs(age(w, q) - age(w, p)) < 12) {
        kept++;
        contact(w, p, q, 0.5);
        carrySought(w, p, q);
        if (weights) for (const x of weights) if (x[0] === q) x[1] = regardWeight(w, p.id, q.id, 1.5) * carrySeekFactor(w, p, q);
        const sought = ((w.stats as any).sought ??= new Map<number, number>()) as Map<number, number>;
        sought.set(q.id, (sought.get(q.id) ?? 0) + 1);
      }
    }
    w.hooks.seek?.(w, p, n, kept, src.length);
  }
  channel = 'public';
  for (const pl of w.places)
    if (pl.people >= 0.8) {
      // those who serve the public meet the adults of their workplace's neighbourhood
      const h = I?.placeHood.get(pl.id);
      const served = I && h != null && hoodAdults[h]?.length ? hoodAdults[h] : adults;
      for (const st of I ? (I.byJob.get(pl.id) ?? []) : L.filter(p => p.job === pl.id))
        for (let i = 0; i < 3; i++) {
          const q = w.rng.pick(served);
          if (q !== st) contact(w, st, q, 0.35);
        }
    }
  for (const r of w.bonds.values()) {
    if (r.touched !== w.t) r.fam *= 0.993;
    if ((r as any).recent) (r as any).recent *= 0.89;
  }
  channel = '';
  refreshClosest(w);
  friendsTick(w);
  gossip(w);
  tellingTick(w);
}
function gossip(w: World) {
  const recent = recentEvents(w, w.t - 2).filter(e => e.vis !== 'private' && e.evidence.length);
  for (const e of recent)
    for (const [teller, how] of [...e.knownBy]) {
      if (how !== 'seen') continue;
      const tp = P(w, teller);
      if (tp.status !== 'in' || !w.rng.chance(0.25 * z01(facet(tp, 'sociability')))) continue;
      for (const l of [...friendsOf(w, tp), ...(tp.partner != null ? [P(w, tp.partner)] : [])]) {
        if (e.knownBy.has(l.id) || e.who.includes(l.id)) continue;
        e.knownBy.set(l.id, 'heard');
        const trust = (peekBond(w, l.id, tp.id)?.trust ?? 0) + 0.5;
        const bend = facet(tp, 'sincerity') < -0.8 ? w.rng.normal() * 0.5 : 0;
        tagObs('gossip');
        setObsEvent(e);
        for (const x of e.evidence) observe(w, l.id, { ...x, dir: x.dir + bend, reliability: x.reliability * clamp(trust, 0.2, 1) * 0.6 }, 'heard');
        setObsEvent(null);
        tagObs('act');
      }
    }
}

// Promotion: people coming into focus get the years of ordinary contact they would have had, so they arrive with acquaintances,
// friends and dislikes formed by the same rule as everyone else's. Their settings (home, family, workplace, school, circle, venue,
// neighbourhood) are run for the given months on the promotion's own dice, only for pairs that include someone promoted.
// The months are lived on a clock set back to when they happened, so every rule that counts time (one new friend at a time,
// memories fading, grudges cooling) sees them as months. The clock is put back afterwards, and anything written to the record in
// those months is dated to the promotion and marked as backstory, so the record stays in time order.
export function catchUp(w: World, ps: Person[], months: number, r: Rng) {
  const now = w.t;
  const prevRng = w.rng,
    prevQuiet = w.quiet;
  w.rng = r;
  w.quiet = true;
  const n0 = w.events.length;
  const S0 = new Set(ps.map(p => p.id));
  let S = S0;
  const touch = (a: Person, b: Person) => S.has(a.id) || S.has(b.id);
  const here = (p: Person) => p.born <= w.t && ((p as any).arrivedAt ?? -Infinity) <= w.t; // born, and living here, by then
  const all = (arr: Person[]) => {
    const o: [Person, Person][] = [];
    for (let a = 0; a < arr.length; a++) for (let b = a + 1; b < arr.length; b++) if (touch(arr[a], arr[b])) o.push([arr[a], arr[b]]);
    return o;
  };
  const budget = (pairs: [Person, Person][], c: number) => {
    // the round-15 attention budget, as in socialTick
    if (OFF.has('budget')) {
      for (const [a, b] of pairs) contact(w, a, b, c);
      return;
    }
    const K = 3;
    const nb = new Map<number, Person[]>();
    for (const [a, b] of pairs) {
      (nb.get(a.id) ?? nb.set(a.id, []).get(a.id)!).push(b);
      (nb.get(b.id) ?? nb.set(b.id, []).get(b.id)!).push(a);
    }
    const give = new Map<number, Map<number, number>>();
    for (const [id, qs] of nb) {
      const m = new Map<number, number>();
      if (qs.length <= K) for (const q of qs) m.set(q.id, c);
      else {
        const att = qs.map(q => 0.15 + Math.max(0, likeOf(w, id, q.id)) + 0.5 * (peekBond(w, id, q.id)?.fam ?? 0));
        const sum = att.reduce((x, y) => x + y, 0);
        qs.forEach((q, k) => m.set(q.id, (c * K * att[k]) / sum));
      }
      give.set(id, m);
    }
    for (const [a, b] of pairs) {
      const i = ((give.get(a.id)!.get(b.id) ?? 0) + (give.get(b.id)!.get(a.id) ?? 0)) / 2;
      if (i >= 0.01) contact(w, a, b, i);
    }
  };
  const all0 = ps;
  // The bonds that involve someone promoted, kept as a list: one pass over the city's bonds now, then only the bonds added since.
  // Also each person's own bonds, so who is close can be refreshed for just the people whose bonds move (refreshClosest's rule).
  const mine: Bond[] = [];
  const perA = new Map<number, [number, Bond][]>();
  const ends = new Set<number>();
  const note = (a: number, b: number, rb: Bond) => {
    (perA.get(a) ?? perA.set(a, []).get(a)!).push([b, rb]);
    if (S0.has(a) || S0.has(b)) {
      mine.push(rb);
      ends.add(a);
      ends.add(b);
    }
  };
  for (const [key, rb] of w.bonds) note(bkA(w, key), bkB(w, key), rb);
  (w as any)._onNewBond = note;
  const closeFor = () => {
    if (OFF.has('relbar')) return;
    const out = ((w as any)._closest ??= new Map()) as Map<number, Set<number>>;
    for (const a of ends) {
      const pa = w.byId.get(a);
      if (!pa) continue;
      const list = (perA.get(a) ?? []).filter(([, rb]) => rb.fam >= 0.1).map(([b, rb]) => [b, rb.fam] as [number, number]);
      if (!list.length) {
        out.delete(a);
        continue;
      }
      out.set(
        a,
        new Set(
          list
            .filter(([b]) => {
              const q = w.byId.get(b);
              return !!q && q.status === 'in' && !family(pa, q) && pa.partner !== b;
            })
            .sort((x, y) => y[1] - x[1])
            .slice(0, 5)
            .map(([b]) => b),
        ),
      );
    }
  };
  for (let m = 0; m < months; m++) {
    w.t = now - months + m + 1;
    ps = all0.filter(here);
    S = new Set(ps.map(p => p.id));
    const I0 = idx(w);
    const I = { ...I0, byJob: new Map([...I0.byJob].map(([k, v]) => [k, v.filter(here)])), hood: I0.hood.map(h => h.filter(here)) };
    const hs = [...new Set(ps.map(p => hoodOf(w, p)))].sort((a, b) => a - b);
    channel = 'home';
    for (const p of ps) {
      if (p.partner != null) {
        const q = P(w, p.partner);
        if (q.status === 'in' && here(q) && (!S.has(q.id) || p.id < q.id)) contact(w, p, q, 1.5);
      }
      for (const k of p.kids) {
        const c = P(w, k);
        if (c.status === 'in' && here(c)) contact(w, p, c, age(w, c) < 20 ? 1.2 : 0.4);
      }
    }
    channel = 'work';
    for (const job of [...new Set(ps.map(p => p.job).filter(Boolean))] as string[]) budget(all(I.byJob.get(job) ?? []), 1);
    channel = 'school';
    if (!OFF.has('school'))
      for (const h of hs) {
        const kids = I.hood[h].filter(p => age(w, p) >= 6 && age(w, p) < 19 && !p.job);
        const pairs: [Person, Person][] = [];
        for (let i = 0; i < kids.length; i++)
          for (let j = i + 1; j < kids.length; j++)
            if (touch(kids[i], kids[j]) && Math.abs(age(w, kids[i]) - age(w, kids[j])) <= 2 && !family(kids[i], kids[j]))
              pairs.push([kids[i], kids[j]]);
        budget(pairs, 1);
      }
    channel = 'family';
    for (const p of ps)
      for (const k of p.parents) {
        const par = w.byId.get(k);
        if (!par) continue;
        for (const id of par.kids) {
          const q = w.byId.get(id)!;
          if (q !== p && q.status === 'in' && here(q) && (!S.has(q.id) || p.id < q.id)) contact(w, p, q, age(w, p) < 20 && age(w, q) < 20 ? 1 : 0.3);
        }
      }
    channel = 'circle';
    for (const p of ps)
      for (const id of p.circle) {
        const q = w.byId.get(id);
        if (q && q.status === 'in' && here(q) && (!S.has(q.id) || p.id < q.id)) contact(w, p, q, 0.5);
      }
    channel = 'hobby';
    for (const hb of SETTING.hobbies)
      for (const h of hs) {
        let g = I.hood[h].filter(p => p.skills[hb]?.interest === 2 && age(w, p) >= 14);
        if (g.length > 6) g = w.rng.shuffle(g).slice(0, 6);
        budget(all(g), 0.5);
      }
    channel = 'public';
    for (const h of hs) {
      const adults = I.hood[h].filter(p => age(w, p) >= 16);
      if (!adults.length) continue;
      for (const pl of w.places)
        if (pl.people >= 0.8 && I0.placeHood.get(pl.id) === h)
          for (const st of I.byJob.get(pl.id) ?? [])
            for (let i = 0; i < 3; i++) {
              const q = w.rng.pick(adults);
              if (q !== st && touch(st, q)) contact(w, st, q, 0.35);
            }
    }
    channel = 'habit';
    {
      const by = new Map<string, Person[]>();
      for (const h of hs)
        for (const p of I.hood[h])
          for (const hb of p.habits)
            if (!hb.broken && hb.kind === 'social') (by.get(hb.id + '|' + h) ?? by.set(hb.id + '|' + h, []).get(hb.id + '|' + h)!).push(p);
      for (const [, g] of by) budget(all(g), 0.4);
    }
    channel = '';
    closeFor(); // who counts as close, as the monthly tick keeps it (only those whose bonds can have moved)
    channel = 'sought';
    for (const p of ps) {
      if (age(w, p) < 16) continue;
      const near = I.hood[hoodOf(w, p)].filter(q => q !== p && age(w, q) >= 16 && Math.abs(age(w, q) - age(w, p)) < 12);
      if (!near.length) continue;
      const young = age(w, p) < 40;
      const n = Math.round(z01(facet(p, 'sociability')) * w.rng.next() * (young ? 4 : 2.5)) + (p.partner == null && young ? 1 : 0);
      for (let i = 0; i < n; i++) contact(w, p, w.rng.weighted(near.map(q => [q, regardWeight(w, p.id, q.id, 1.5)] as [Person, number])), 0.5);
    }
    // Ties not kept up fade, as in the monthly tick.
    for (const b of mine) {
      if (b.touched !== w.t) b.fam *= 0.993;
      if ((b as any).recent) (b as any).recent *= 0.89;
    }
  }
  delete (w as any)._onNewBond;
  w.t = now;
  channel = '';
  refreshClosest(w);
  for (let i = n0; i < w.events.length; i++) {
    (w.events[i] as any).backstory = true;
    (w.events[i] as any).happened = w.events[i].t;
    w.events[i].t = now;
  }
  w.rng = prevRng;
  w.quiet = prevQuiet;
  return w.events.length - n0;
}
