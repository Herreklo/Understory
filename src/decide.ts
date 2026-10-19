// Decisions: options carry a few considerations, each read through a response curve.
// Scores multiply (one strong objection can veto), choice is weighted by Variability.
// Decisions are pure: they read a View and return a result, changing nothing.

import type { Person, World, Cause } from './world';
import type { Feature } from './features';
import { facet, logistic, belief, peekBond, stateOf, OFF } from './world';
import { FACETS, FACET_BY_ID } from './core';
import * as MX from './mathx';

// A View is how the decider's inner life is read. 'truth' reads the person as they are;
// a witness view reads them through someone else's beliefs (for prediction and surprise).
// Who can know a circumstance: everyone (a storm, a death), people close to the person (debt, strain), or only the person (how badly they want it).
export type Know = 'public' | 'close' | 'private';
export interface View {
  facet(p: Person, key: string, toward?: number, feats?: Set<Feature>): number;
  value(p: Person, key: string): number;
  bond(a: Person, b: number, axis: 'like' | 'respect' | 'trust'): number; // -1..1
  state(p: Person | undefined, know: Know, x: number, neutral: number, id?: string): number;
}
// The truth: the person as they are, in their own world. One view per world, never shared.
const truths = new WeakMap<World, View>();
export function truthView(w: World): View {
  let v = truths.get(w);
  if (!v) {
    v = {
      facet: (p, k, t, f) => facet(p, k, t, f) + stateOf(w, p, k), // the level, plus this month's state (round 27)
      value: (p, k) => p.values[k] ?? 0,
      bond: (a, b, axis) => peekBond(w, a.id, b)?.[axis] ?? 0,
      state: (_p, _k, x) => x,
    };
    truths.set(w, v);
  }
  return v;
}
// Diagnostic readers: one knows the person's traits and nothing of their circumstances; the other the reverse.
export function traitOnlyView(w: World): View {
  return {
    facet: (p, k) => (p.facets[k] ?? 0) + (p.phase?.deltas[k] ?? 0) /* general traits only: no if-thens */,
    value: (p, k) => p.values[k] ?? 0,
    bond: (a, b) => (a.partner === b ? 0.4 : a.friends.has(b) ? 0.45 : 0),
    state: (_p, know, x, neutral) => (know === 'public' ? x : neutral),
  };
}
export function circOnlyView(w: World): View {
  return { facet: () => 0, value: () => 0, bond: (a, b, axis) => peekBond(w, a.id, b)?.[axis] ?? 0, state: (_p, _k, x) => x };
}
export function witnessView(w: World, holder: number): View {
  const h = w.byId.get(holder);
  return {
    facet: (p, k, t, f) => {
      if (p.id === holder) return facet(p, k, t, f);
      const b = belief(w, holder, p.id, k);
      let z: number;
      if (b && b.n > 0) z = b.m;
      else {
        // No evidence on this facet: infer it from what is known of its dimension. Outgoing people are probably lively; orderly people probably diligent.
        const dim = FACET_BY_ID[k]?.dim;
        let sum = 0,
          n = 0;
        if (dim)
          for (const f of FACETS)
            if (f.dim === dim && f.id !== k) {
              const fb = belief(w, holder, p.id, f.id);
              if (fb && fb.n > 0) {
                sum += fb.m * (1 - fb.v * 0.5);
                n++;
              }
            }
        z = n ? (0.55 * sum) / n : 0;
      }
      // The witness may have learned an if-then signature.
      if (f) {
        const ib = f.size ? [...f].map(x => belief(w, holder, p.id, `ifthen:${x}:${k}`)).find(Boolean) : undefined;
        if (ib) z += ib.m;
      }
      return z;
    },
    value: (p, k) => {
      if (p.id === holder) return p.values[k] ?? 0;
      const b = belief(w, holder, p.id, 'value:' + k);
      return b ? b.m : 0;
    },
    // What the witness thinks one person feels about another: their own bonds they know; others' from what they have seen pass between them.
    bond: (a, b, axis) => {
      if (a.id === holder) return peekBond(w, a.id, b)?.[axis] ?? 0; // I know how I feel about you; not how you feel about me
      const bl = belief(w, holder, a.id, 'bond:' + b);
      if (bl && bl.n > 0) return Math.max(-1, Math.min(1, bl.m));
      if (a.partner === b) return 0.4;
      if (a.friends.has(b)) return 0.45; // friendship is public
      if (a.parents.includes(b) || (h && w.byId.get(b)?.parents.includes(a.id))) return 0.3;
      return 0;
    },
    // Closeness makes knowledge likely, not certain: the closer, the more of the real circumstance the witness has.
    // A circumstance is known only through evidence about it (a 'state:' belief). Closeness brings more evidence (see contact in life.ts); it is never a route to the truth itself.
    state: (p, know, x, neutral, id) => {
      if (know === 'public' || (p && p.id === holder)) return x;
      if (know === 'private') return neutral;
      if (p && id) {
        const sb = belief(w, holder, p.id, 'state:' + id);
        if (sb && sb.n > 0) return Math.max(0, Math.min(1, 0.5 + 0.5 * Math.max(-1, Math.min(1, sb.m)) * (1 - sb.v * 0.5)));
      }
      return neutral;
    },
  };
}

export type Curve = (x: number) => number; // x in 0..1 -> desire in 0..1
export const curves = {
  rising:
    (lo = 0.1, hi = 1): Curve =>
    x =>
      lo + (hi - lo) * x,
  falling:
    (lo = 0.1, hi = 1): Curve =>
    x =>
      hi - (hi - lo) * x,
  sCurve:
    (k = 8, mid = 0.5, lo = 0.05): Curve =>
    x =>
      lo + (1 - lo) / (1 + MX.exp(-k * (x - mid))),
  sFalling:
    (k = 8, mid = 0.5, lo = 0.05): Curve =>
    x =>
      lo + (1 - lo) / (1 + MX.exp(k * (x - mid))),
  flat:
    (v = 1): Curve =>
    () =>
      v,
};

// Inputs are scaled to 0..1. Facets and values go through a logistic so a standard score maps smoothly.
export const z01 = (z: number) => logistic(z, 1.1);

export interface Consideration {
  id: string; // stable id, used by the honest-why test to neutralise it
  cause: (v: View) => Cause; // how it reads as a reason
  input: (v: View) => number; // 0..1
  curve: Curve;
  neutral?: number; // input value when neutralised (default 0.5)
  know?: Know; // who could know this circumstance (default close)
  who?: Person; // whose circumstance it is (set by the runner when missing)
  // A circumstance a situation gives every option: the answers it is weighed for as written. The others weigh it read the other way
  // (input x as 1 − x), so it pushes one way and is given as a reason; without this, a shared factor changes only how decisive a choice is.
  favours?: string[];
}
export interface Option {
  id: string;
  label: string;
  base?: number;
  considerations: Consideration[];
}

export interface Scored {
  id: string;
  label: string;
  score: number;
  p: number;
  parts: { c: Consideration; x: number; y: number }[];
}

export function score(options: Option[], view: View, variability: number, neutralise?: string): Scored[] {
  // How many considerations an answer carries must not decide it (round F26): every answer is scored as if it had as many as the one
  // with most, each missing one at the answer's own geometric mean, and the compensation is applied once, for that number.
  const fair = !OFF.has('countfair');
  const nAll = Math.max(1, ...options.map(o => o.considerations.length));
  const out: Scored[] = options.map(o => {
    let s = o.base ?? 1;
    let logSum = 0;
    const parts = o.considerations.map(c => {
      const x = c.id === neutralise ? (c.neutral ?? 0.5) : Math.max(0, Math.min(1, c.input(view)));
      const y = Math.max(0.01, Math.min(1, c.curve(x)));
      s *= y;
      logSum += MX.log(y);
      return { c, x, y };
    });
    if (fair && parts.length) s = (o.base ?? 1) * MX.exp((logSum / parts.length) * nAll);
    // Compensation, so options with more considerations aren't unfairly lowered.
    const n = fair ? nAll : Math.max(1, o.considerations.length);
    const mod = 1 - 1 / n;
    s = s + (1 - s) * mod * s;
    return { id: o.id, label: o.label, score: s, p: 0, parts };
  });
  // Weighted choice; Variability sets how strongly the best option dominates.
  const tau = 0.035 + 0.065 * variability;
  const mx = Math.max(...out.map(o => o.score));
  let sum = 0;
  for (const o of out) {
    o.p = MX.exp((o.score - mx) / tau);
    sum += o.p;
  }
  for (const o of out) o.p /= sum;
  return out;
}

// What an observer can know is there: a decision as a witness sees it, without the considerations whose very presence depends on what it
// cannot know (the self-story). Round M26; OFF=seenonly gives observers the true structure again.
export const seenBy = (options: Option[]): Option[] =>
  OFF.has('seenonly') ? options : options.map(o => ({ ...o, considerations: o.considerations.filter(c => c.id !== 'identity') }));
export type ChoiceCtx = { t: number; who: number; kind: string; nudge: () => void };
export function choose(scored: Scored[], r: () => number, ctx?: ChoiceCtx): Scored {
  let x = r();
  let pick = scored[scored.length - 1];
  for (const o of scored) {
    x -= o.p;
    if (x <= 0) {
      pick = o;
      break;
    }
  }
  const H = (globalThis as any).WHATIF;
  return H ? whatIf(H, scored, pick, r, ctx) : pick;
}
// What-ifs (src/tools/whatif.ts), never read by the model: every choice is counted; the one being tested takes one extra draw from the
// stream of the system at work (the smallest nudge to chance) and is then given the likeliest answer not chosen ('flip') or the same
// answer ('placebo', the noise floor).
function whatIf(H: any, scored: Scored[], pick: Scored, r: () => number, ctx?: ChoiceCtx): Scored {
  const n = H.n++;
  if (H.log && ctx)
    H.log.push({ n, t: ctx.t, who: ctx.who, kind: ctx.kind, chosen: pick.id, alt: Math.max(0, ...scored.filter(o => o !== pick).map(o => o.p)) });
  if (n !== H.at) return pick;
  // Both arms take the same nudge (round 25c), so the only difference between them is the answer.
  (ctx?.nudge ?? r)();
  if (H.mode === 'placebo') return pick;
  return scored.filter(o => o !== pick).sort((a, b) => b.p - a.p)[0] ?? pick;
}

// The why: the considerations that most favoured the chosen option over the next best,
// and the strongest one against it.
export function reasons(chosen: Scored, scored: Scored[], view: View): Cause[] {
  const rival = scored.filter(o => o.id !== chosen.id).sort((a, b) => b.score - a.score)[0];
  const rivalY = new Map(rival ? rival.parts.map(p => [p.c.id, p.y]) : []);
  const forParts = chosen.parts
    .map(p => ({ p, gain: MX.log(p.y) - MX.log(rivalY.get(p.c.id) ?? 0.5) }))
    .filter(x => x.gain > 0.05)
    .sort((a, b) => b.gain - a.gain);
  const total = forParts.reduce((s, x) => s + x.gain, 0) || 1;
  // A consideration can favour the chosen option over its rival and still have argued against the act itself (both options disliked,
  // this one less). Printed as a reason it reads as nonsense ("gave generously: looks after themselves"); it is a 'despite'.
  // A circumstance, a bond or a value that argued against the act is marked the same way ('despite: it was put gently').
  const despite = (c: Cause): Cause =>
    c.label.startsWith('despite')
      ? c
      : c.kind === 'trait'
        ? { ...c, label: 'despite ' + c.label }
        : OFF.has('despite')
          ? c
          : { ...c, label: 'despite: ' + c.label };
  // A trait near the middle cannot be a 'despite'; if it argued against the act it is simply not a reason.
  const sayable = (c: Cause, y: number) => y >= 0.45 || c.kind !== 'trait' || c.label.includes(':');
  const out: Cause[] = forParts
    .slice(0, 3)
    .map(x => ({ c: { ...x.p.c.cause(view), weight: x.gain / total, key: x.p.c.id }, y: x.p.y }))
    .filter(x => sayable(x.c, x.y))
    .map(x => (x.y < 0.45 ? despite(x.c) : x.c));
  // The strongest consideration against: one that favoured the rival. A circumstance both options share argued against neither.
  const against = (
    OFF.has('despite') ? chosen.parts.slice() : chosen.parts.filter(p => MX.log(p.y) - MX.log(rivalY.get(p.c.id) ?? 0.5) < -0.05)
  ).sort((a, b) => a.y - b.y)[0];
  if (against && against.y < 0.45 && !out.some(c => c.key === against.c.id)) {
    const c = against.c.cause(view);
    if (sayable(c, against.y)) out.push({ ...despite(c), weight: 0, key: 'against:' + against.c.id });
  }
  return out;
}

// Honest-why test: does neutralising the top cause shift the choice?
export function honestWhy(view: View, options: Option[], variability: number, chosenId: string, topKey: string | undefined): boolean | undefined {
  if (!topKey || topKey.startsWith('against:')) return undefined;
  const before = score(options, view, variability);
  const after = score(options, view, variability, topKey);
  const pb = before.find(o => o.id === chosenId)!.p;
  const pa = after.find(o => o.id === chosenId)!.p;
  const odds = (x: number) => x / Math.max(1e-6, 1 - x);
  return odds(pa) < odds(pb) * 0.5;
}
