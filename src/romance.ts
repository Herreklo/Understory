// Romance and family: dating, marriage, splitting up, children.

import { SETTING } from './setting';
import {
  type Cause,
  type Person,
  type World,
  OFF,
  plasticity,
  age,
  live,
  P,
  facet,
  peekBond,
  likeOf,
  remember,
  addEvent,
  broadcast,
  addStress,
  addEmotion,
  year,
} from './world';
import { around, hoods } from './scale';
import { z01, type Option } from './decide';
import { generatePerson, attracted } from './generate';
import { loss } from './situations/raised';
import { family, decide } from './grammar';
import { stateCause, ev, facetC, valueC, pubC, attachC } from './considerations';
import { leftBy } from './love';
import { griefAtSplit } from './feelings';
import { resolveWants, wantRestore } from './time';
import type { Feature } from './features';
import { leaveTown } from './migration';
import { chemWhy, memWhy, contexts } from './social';
import { assignCircle } from './work';

const NONE = new Set<Feature>();
// Two who are seeing each other marry. `why` replaces the usual reasons (round 25d: one of them asked).
export function marry(w: World, p: Person, q: Person, why?: Cause[]) {
  const dur = w.t - p.psince;
  p.pstat = q.pstat = 'married';
  p.psince = q.psince = w.t;
  const e = addEvent(w, {
    type: 'married',
    who: [p.id, q.id],
    text: `@${p.id} and @${q.id} got married.`,
    causes: why ?? [stateCause(`together since ${year(p.psince - dur)}`, 0.5), { kind: 'bond', label: 'they had grown close', weight: 0.5 }],
    vis: 'public',
    evidence: [ev(p.id, 'bond:' + q.id, 1, 1, 0.8), ev(q.id, 'bond:' + p.id, 1, 1, 0.8)],
    w: 2,
  });
  broadcast(w, e);
  addEmotion(w, p, 'wed', 'newly married', 0.2, 18, e.id);
  addEmotion(w, q, 'wed', 'newly married', 0.2, 18, e.id);
  remember(w, p, q, e.id, 0.15, 0.1, 0.2, 'married');
  remember(w, q, p, e.id, 0.15, 0.1, 0.2, 'married');
  resolveWants(w, p, 'win', String(q.id), 'achieved', e.id);
  resolveWants(w, q, 'win', String(p.id), 'achieved', e.id);
  return e;
}
export function romanceTick(w: World) {
  const L = live(w);
  for (const p of L) {
    const a = age(w, p);
    if (p.partner != null) {
      if (p.id > p.partner) continue;
      const q = P(w, p.partner);
      if (q.status !== 'in') continue;
      const o1 = likeOf(w, p.id, q.id),
        o2 = likeOf(w, q.id, p.id),
        dur = w.t - p.psince;
      if (p.drinks) remember(w, q, p, -1, -0.03, -0.02, -0.03, 'the drinking');
      if (q.drinks) remember(w, p, q, -1, -0.03, -0.02, -0.03, 'the drinking');
      if (p.stress > 0.75) remember(w, q, p, -1, -0.015, 0, 0, 'always on edge');
      if (q.stress > 0.75) remember(w, p, q, -1, -0.015, 0, 0, 'always on edge');
      if (p.pstat === 'dating') {
        if (dur >= 10 && o1 > 0.5 && o2 > 0.5 && w.rng.chance(0.03 * (z01(p.values.lovedOnes) + z01(q.values.lovedOnes)))) marry(w, p, q);
        else if (Math.min(o1, o2) < 0.15 && w.rng.chance(0.08)) split(w, p, q, false);
      } else if ((OFF.has('love') || OFF.has('leaving')) && Math.min(o1, o2) < 0 && w.rng.chance(0.025)) split(w, p, q, true); // with love.ts, ending a marriage is a decision (round 20b)
      continue;
    }
    if (a < 18 || a > 70 || !w.rng.chance(0.1)) continue;
    const cands: [Person, number][] = [];
    for (const q of hoods(w) === 1 ? L : around(w, p)) {
      // in a city, someone to fall for is someone you know
      if (q === p || q.partner != null || age(w, q) < 18 || family(p, q) || !attracted(p, q) || !attracted(q, p)) continue;
      const ag = Math.abs(age(w, q) - a);
      if (ag > 7 + Math.min(a, age(w, q)) / 7) continue;
      const r1 = peekBond(w, p.id, q.id),
        r2 = peekBond(w, q.id, p.id);
      if (!r1 || !r2 || r1.like < 0.22 || r2.like < 0.18 || r1.fam < 0.08) continue;
      cands.push([q, (r1.like + r2.like) * (0.5 + z01(facet(p, 'socialBoldness')))]);
    }
    if (!cands.length || !w.rng.chance(0.35)) continue;
    const q = w.rng.weighted(cands);
    p.partner = q.id;
    q.partner = p.id;
    p.pstat = q.pstat = 'dating';
    p.psince = q.psince = w.t;
    (p as any).pairSince = (q as any).pairSince = w.t; // when this partnership began (words only: a couple's pattern dates from it)
    const e = addEvent(w, {
      type: 'dating',
      who: [p.id, q.id],
      text: `@${p.id} and @${q.id} started seeing each other.`,
      causes: [...contexts(w, p, q), ...chemWhy(w, p, q)]
        .slice(0, 3)
        .concat(contexts(w, p, q).length + chemWhy(w, p, q).length ? [] : [stateCause('they kept running into each other', 0.5)]),
      vis: 'local',
      evidence: [ev(p.id, 'bond:' + q.id, 1, 0.8, 0.8), ev(q.id, 'bond:' + p.id, 1, 0.8, 0.8)],
      w: 1,
    });
    broadcast(w, e);
    remember(w, p, q, e.id, 0.1, 0.05, 0.1, 'together');
    remember(w, q, p, e.id, 0.1, 0.05, 0.1, 'together');
    addEmotion(w, p, 'love', 'in love', 0.15, 6, e.id);
    addEmotion(w, q, 'love', 'in love', 0.15, 6, e.id);
  }
}
export function split(w: World, p: Person, q: Person, married: boolean, leaver?: Person, why?: Cause[]) {
  const [lo, hi] = leaver ? (leaver === p ? [p, q] : [q, p]) : likeOf(w, p.id, q.id) < likeOf(w, q.id, p.id) ? [p, q] : [q, p];
  const causes: Cause[] = why ?? [
    { kind: 'bond', label: `@${lo.id} had stopped wanting it`, weight: 0.4, who: lo.id },
    ...memWhy(w, lo, hi, -1),
    ...chemWhy(w, lo, hi, -1).slice(0, 1),
  ];
  if (hi.drinks) causes.push(stateCause(`@${hi.id}'s drinking`, 0.5));
  const e = addEvent(w, {
    type: married ? 'divorce' : 'split',
    who: [p.id, q.id],
    text: married ? `@${p.id} and @${q.id} divorced.` : `@${p.id} and @${q.id} split up.`,
    causes: causes.slice(0, 4),
    vis: 'public',
    evidence: [ev(lo.id, 'bond:' + hi.id, -1, 1, 0.8), ev(hi.id, 'bond:' + lo.id, -1, 0.5, 0.6)],
    w: married ? 2.5 : 1.2,
  });
  broadcast(w, e);
  for (const [x, y] of [
    [p, q],
    [q, p],
  ] as const) {
    x.partner = null;
    x.pstat = null;
    remember(w, x, y, e.id, -0.15, 0, -0.1, 'the break-up');
    addEmotion(w, x, 'breakup', married ? 'divorced' : 'heartbroken', x === lo ? -0.06 : married ? -0.2 : -0.12, married ? 18 : 8, e.id);
    addStress(x, 'breakup', married ? 'the divorce' : 'the break-up', x === lo ? 0.05 : married ? 0.16 : 0.09, e.id);
    griefAtSplit(w, x, y, e.id, married, x === lo);
    if (x !== lo) {
      loss(w, x, e.id, married ? 'the divorce' : 'the break-up');
      leftBy(w, x);
    }
  }
  resolveWants(w, p, 'win', String(q.id), 'failed', e.id);
  resolveWants(w, q, 'win', String(p.id), 'failed', e.id);
  if (!married && w.rng.chance(0.5)) wantRestore(w, hi, lo, e.id);
}
export function familyTick(w: World) {
  for (const p of live(w)) {
    // Couples who have settled, married or living together for two years, may have children.
    if (p.partner != null && p.id < p.partner && (p.pstat === 'married' || w.t - p.psince >= 24)) {
      const q = P(w, p.partner);
      if (q.status !== 'in') continue;
      const adopt = p.sex === q.sex;
      const mom = adopt ? (age(w, p) < age(w, q) ? p : q) : p.sex === 'f' ? p : q;
      const ma = age(w, mom);
      if (ma < 20 || ma > 43) continue;
      const nk = p.kids.filter(k => q.kids.includes(k)).length;
      let base =
        [0.45, 0.32, 0.12, 0.035][Math.min(3, nk)] *
        (0.5 + z01(p.values.lovedOnes) * 0.5 + z01(q.values.lovedOnes) * 0.5) *
        (ma > 36 ? 0.5 : 1) *
        (adopt ? 0.35 : 1) *
        (p.pstat === 'married' ? 1 : 0.6);
      if (Math.min(likeOf(w, p.id, q.id), likeOf(w, q.id, p.id)) < 0.2) base *= 0.3;
      if (w.rng.chance(base / 12)) {
        const c = generatePerson(w, {
          age: adopt ? w.rng.int(0, 3) : 0,
          parents: adopt ? [] : [p.id, q.id],
          last: w.rng.chance(0.7) ? p.last : q.last,
          founder: false,
        });
        if (adopt) {
          c.parents = [p.id, q.id];
          c.born = w.t - w.rng.int(0, 36);
        } else c.born = w.t;
        p.kids.push(c.id);
        q.kids.push(c.id);
        const e = addEvent(w, {
          type: 'born',
          who: [c.id, p.id, q.id],
          text: adopt ? `@${p.id} and @${q.id} adopted @${c.id}.` : `@${c.id} was born to @${p.id} and @${q.id}.`,
          causes: [],
          vis: 'public',
          evidence: [],
          w: 2,
        });
        broadcast(w, e);
        addEmotion(w, p, 'baby', 'a new baby', 0.18, 12, e.id);
        addEmotion(w, q, 'baby', 'a new baby', 0.18, 12, e.id);
        resolveWants(w, p, 'create', 'child', 'achieved', e.id);
        resolveWants(w, q, 'create', 'child', 'achieved', e.id);
        for (const x of [p, q])
          if (!x.marks.some(m => m.key === 'parent')) {
            x.facets.organisation += 0.2 * plasticity(w, x);
            x.facets.patience += 0.15 * plasticity(w, x);
            x.marks.push({ t: w.t, key: 'parent', delta: 0.2, cause: e.id, text: 'steadier since becoming a parent' });
          }
      }
    }
    const m = w.t - p.born;
    if (m === 192) assignCircle(w, p);
    if (m === 204) {
      const brains = (p.aptitudes.reasoning + p.aptitudes.language + p.aptitudes.memory) / 3;
      if (brains > 0.3 || facet(p, 'inquisitiveness') > 0.8 || brains < -0.6) {
        const e = addEvent(w, {
          type: 'tell',
          who: [p.id],
          text:
            brains > 0.3
              ? `Everyone says @${p.id} is the clever one.`
              : brains < -0.6
                ? `@${p.id} has been struggling at school.`
                : `@${p.id} reads everything ${p.sex === 'f' ? 'she' : 'he'} can get hold of.`,
          causes: [stateCause(brains > 0.3 ? 'top of the class' : brains < -0.6 ? 'bottom of the class' : 'curious about everything', 1)],
          vis: 'public',
          evidence: [
            ev(p.id, 'inquisitiveness', brains > 0.3 || facet(p, 'inquisitiveness') > 0.8 ? 1 : -1, 0.7, 0.6),
            ev(p.id, 'want:study', brains > 0.3 ? 1 : -1, 1, 0.6),
          ],
          w: 0.5,
        });
        broadcast(w, e);
      }
    }
    if (m === 216) {
      const brains = (p.aptitudes.reasoning + p.aptitudes.language + p.aptitudes.memory) / 3;
      const opts: Option[] = [
        {
          id: 'study',
          label: 'leave for university',
          considerations: [
            pubC('brains', brains > 0.3 ? 'did well at school' : 'school was a struggle', z01(brains * 1.5)),
            facetC(p, 'inquisitiveness', NONE, 1, 7),
            attachC(p, -1),
          ],
        },
        { id: 'stay', label: `stay in ${SETTING.name}`, considerations: [valueC(p, 'tradition', 1, 6), attachC(p, 1)] },
      ];
      const d = decide(w, p, 'turning eighteen', opts);
      if (d.chosen === 'study') leaveTown(w, p, 'study', `@${p.id} left for university in the city.`, d.why, d.rec);
      else {
        const e = addEvent(w, {
          type: 'stayed',
          who: [p.id],
          text: `@${p.id} turned eighteen and stayed in ${SETTING.name}.`,
          causes: d.why,
          vis: 'local',
          decision: d.rec,
          evidence: [ev(p.id, 'sentimentality', 1, 0.5, 0.5)],
          w: 0.7,
        });
        broadcast(w, e);
      }
    }
  }
}
