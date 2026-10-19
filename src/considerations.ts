// The parts a decision is made of: causes, evidence, and the considerations that weigh for and against each option.

import { stream } from './rng';
import { FACET_BY_ID } from './core';
import type { Feature } from './features';
import { OFF, type World, type Person, type Cause, type Evidence, bond, peaks } from './world';
import { curves, z01, type Consideration, type Know } from './decide';
import { VN } from './grammar';
import { strain } from './situations/strain';

// ---------- causes and evidence helpers ----------
// dir: the direction the act implies for this facet (+1 high, -1 low). A person whose trait runs the other way did it despite the trait, and the label says so.
// Pseudo-facets (a way of loving and fighting, love.ts) print like facets in reasons.
export const PSEUDO: Record<string, { name: string; high: string; low: string }> = {};
export const traitCause = (p: Person, key: string, w = 1, dir?: 1 | -1): Cause => {
  const f = FACET_BY_ID[key] ?? PSEUDO[key];
  const z = p.facets[key] ?? 0;
  const pole = f ? (z > 0.5 ? f.high : z < -0.5 ? f.low : '') : '';
  const against = dir != null && pole && Math.sign(z) !== dir;
  return {
    kind: 'trait',
    label: f ? (pole ? `${against ? 'despite ' : ''}${f.name.toLowerCase()}: ${pole}` : f.name.toLowerCase()) : key,
    weight: w,
    key,
    who: p.id,
    ...(f && !pole ? { mid: true } : {}),
  };
};
export const stateCause = (label: string, w = 1, ref?: number): Cause => ({ kind: 'state', label, weight: w, ref });
export const eventCause = (w: World, ref: number, weight = 1): Cause => ({ kind: 'event', label: w.events[ref].text, weight, ref });
export const ev = (subject: number, key: string, dir: number, strength = 1, reliability = 0.8): Evidence => ({
  subject,
  key,
  dir,
  strength,
  reliability,
});

// A consideration reading one facet, in the situation's features (so if-then signatures apply).
export function facetC(p: Person, key: string, feats: Set<Feature>, dir: 1 | -1, k = 5, mid = 0.5, toward?: number): Consideration {
  return {
    id: key,
    cause: () => traitCause(p, key),
    input: v => z01(v.facet(p, key, toward, feats)),
    curve: dir > 0 ? curves.sCurve(k, mid) : curves.sFalling(k, mid),
  };
}
export function valueC(p: Person, key: string, dir: 1 | -1 = 1, k = 5, mid = 0.5): Consideration {
  return {
    id: 'value:' + key,
    cause: () => ({ kind: 'value', label: `values ${VN[key].toLowerCase()}`, weight: 1, key, who: p.id }),
    input: v => z01(v.value(p, key)),
    curve: dir > 0 ? curves.sCurve(k, mid) : curves.sFalling(k, mid),
  };
}
// A circumstance. `know` says who could know it: 'public' (a storm), 'close' (debt, strain; the default), 'private' (how badly they want it).
export function stateC(
  id: string,
  label: string,
  x: number,
  dir: 1 | -1 = 1,
  lo = 0.2,
  ref?: number,
  know: Know = 'close',
  who?: Person,
): Consideration {
  const STATE_KEY: Record<string, string> = { worn: 'low', load: 'low', strain: 'low', money: 'broke', own: 'broke', need: 'broke', alone: 'alone' };
  const c: Consideration = {
    id,
    cause: () => stateCause(label, 1, ref),
    input: v => v.state(c.who, c.know ?? 'close', x, c.neutral ?? 0.5, STATE_KEY[id]),
    curve: dir > 0 ? curves.rising(lo, 1) : curves.falling(lo, 1),
    know,
    who,
    neutral: 0.5,
  };
  return c;
}
export const pubC = (id: string, label: string, x: number, dir: 1 | -1 = 1, lo = 0.2, ref?: number) => stateC(id, label, x, dir, lo, ref, 'public');
// A private circumstance: the observer's best guess is the base rate (how often it is true of people in general), never a coin flip.
export const privC = (id: string, label: string, x: number, dir: 1 | -1 = 1, lo = 0.2, ref?: number, base = 0.5) => {
  const c = stateC(id, label, x, dir, lo, ref, 'private');
  c.neutral = base;
  return c;
};
// A circumstance those close to the person would know; others guess the base rate.
export const closeC = (id: string, label: string, x: number, dir: 1 | -1 = 1, lo = 0.2, ref?: number, base = 0.5) => {
  const c = stateC(id, label, x, dir, lo, ref, 'close');
  c.neutral = base;
  return c;
};
export function bondC(w: World, p: Person, other: Person, axis: 'like' | 'respect' | 'trust', dir: 1 | -1 = 1, k = 4, mid = 0.5): Consideration {
  // Said as the feeling itself ("is fond of Ben", "has never trusted Ben"); a bond near neutral explains nothing and is not a reason.
  const o = `@${other.id}`;
  const say = (x: number): string | undefined =>
    axis === 'like'
      ? x > 0.6
        ? `thinks the world of ${o}`
        : x > 0.3
          ? `is fond of ${o}`
          : x > 0.1
            ? `likes ${o}`
            : x < -0.5
              ? `can't stand ${o}`
              : x < -0.25
                ? `does not like ${o}`
                : x < -0.1
                  ? `is not fond of ${o}`
                  : undefined
      : axis === 'trust'
        ? x > 0.4
          ? `trusts ${o}`
          : x > 0.15
            ? `mostly trusts ${o}`
            : x < -0.3
              ? `has never trusted ${o}`
              : x < -0.1
                ? `does not quite trust ${o}`
                : undefined
        : x > 0.4
          ? `thinks highly of ${o}`
          : x > 0.15
            ? `respects ${o}`
            : x < -0.3
              ? `has no respect for ${o}`
              : x < -0.1
                ? `does not think much of ${o}`
                : undefined;
  return {
    id: `bond:${axis}:${other.id}`,
    cause: v => {
      const m = peaks(w, p, other, 1)[0];
      const said = say(v.bond(p, other.id, axis));
      return {
        kind: 'bond',
        label: said ? (m && m.source === 'saw' && m.ev >= 0 ? `${said}, having seen it happen` : said) : `${axis} toward ${o}`,
        weight: 1,
        who: p.id,
        key: 'bond:' + other.id,
        ...(said ? {} : { mid: true }),
        ...(m && m.ev >= 0 ? { ref: m.ev } : {}),
      };
    },
    input: v => (v.bond(p, other.id, axis) + 1) / 2,
    curve: dir > 0 ? curves.sCurve(k, mid) : curves.sFalling(k, mid),
  };
}
// Attachment to home, read as a pseudo-facet so beliefs and views work on it like any trait.
export function attachC(p: Person, dir: 1 | -1 = 1): Consideration {
  if (OFF.has('attach'))
    return { id: 'attach:home', cause: () => ({ kind: 'state', label: 'home', weight: 0 }), input: () => 0.5, curve: curves.flat(0.5) };
  return {
    id: 'attach:home',
    cause: v => {
      const z = v.facet(p, 'attach:home');
      return {
        kind: 'bond',
        label:
          z > 0.6 ? 'rooted here: the sea, the people, the house' : z < -0.4 ? 'nothing much holding them here' : 'neither here nor there about home',
        weight: 1,
        key: 'attach:home',
        who: p.id,
      };
    },
    input: v => z01(v.facet(p, 'attach:home')),
    curve: dir > 0 ? curves.sCurve(5, 0.5) : curves.sFalling(5, 0.5),
  };
}
export function lastTime(p: Person, key: string, label: string): Consideration {
  const h = p.tried[key];
  const x = h ? (h.ok ? 0.85 : 0.15) : 0.5;
  return {
    id: 'last:' + key,
    cause: () => stateCause(h ? (h.ok ? `${label} worked last time` : `${label} went badly last time`) : `has never tried ${label}`, 1),
    input: v => v.state(p, 'private', x, 0.5),
    curve: curves.rising(0.25, 1),
    neutral: 0.5,
    know: 'private',
    who: p,
  };
}
export function learned(w: World, p: Person, key: string, ok: boolean) {
  const h = p.tried[key] || (p.tried[key] = { t: w.t, ok, n: 0 });
  h.t = w.t;
  h.ok = ok;
  h.n++;
}

// A plain decision for choices that are not social behaviour (study, come home, start a pursuit).
// Records the same stats as a grammar run: honesty of the why, and what the witness would have predicted.
// A choice's chance is the chooser's own (round 25b): its draw comes from a stream keyed by the run, the month, the person and how many
// choices they have made this month, so one person's choices never shift the draws of anyone else's.
export function chanceOf(w: World, p: Person): () => number {
  const c: Map<number, { t: number; n: number }> = ((w as any).choiceN ??= new Map());
  const k = c.get(p.id);
  const n = k && k.t === w.t ? k.n + 1 : 0;
  c.set(p.id, { t: w.t, n });
  const s = w.t <= w.startPresent ? stream(w.seed, 'past', 'choice', p.id, w.t, n) : stream(w.seed, w.runSeed, 'run', 'choice', p.id, w.t, n);
  return () => s.next();
}
