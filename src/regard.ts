// Regard: how one person regards another, from what they have seen and heard. The single idea every situation uses when it chooses
// a counterpart, so that what a person does changes which situations they meet. Built only from the chooser's own bond and beliefs; never from truth.
//
// Two kinds of time act on it. Reinterpretation: newer beliefs outweigh older ones. Forgetting: an old impression nobody has fed
// shrinks toward neutral even when nothing new is learned (the belief part is divided by its evidence plus a prior, and the strongest
// impressions fade slowest), and a bond with someone no longer seen counts less as familiarity fades.

import { OFF, peekBond, belief, likeOf, type World } from './world';
import { around } from './scale';

// Facets whose high end the town admires (+1) or whose low end it does (-1). Mirrors the observer's own valence table.
const ADMIRED: Record<string, number> = { sincerity: 1, fairness: 1, greedAvoidance: 1, modesty: 1, forgiveness: 1, gentleness: 1, patience: 1, organisation: 1, diligence: 1, prudence: 1, altruism: 1, anxiety: -1 };
const PRIOR = 0.5; // pseudo-evidence toward neutral: a lone fresh belief counts two thirds, a lone ten-year-old belief under a fifth

// Modes for the ablation: full; 'regard:beliefs' off leaves only the bond part (how the chooser feels, the pre-regard rule); 'regard' off is neutral.
export function regard(w: World, who: number, ofWhom: number): number {
  if (OFF.has('regard')) return 0;
  if (OFF.has('regard:beliefs')) return clamp1(0.65 * bondPart(w, who, ofWhom));
  return regardRaw(w, who, ofWhom);
}
const clamp1 = (x: number) => Math.max(-1, Math.min(1, x));

// How the chooser feels. Liking, trust and respect are kept up by contact (ordinary company moves them toward how the two get on), so
// they are not read from fading memories; what fades is familiarity, and a bond with someone not seen for years counts a third.
export function bondPart(w: World, who: number, ofWhom: number): number {
  const r = peekBond(w, who, ofWhom); if (!r) return 0;
  const fam = Math.max(0.3, Math.min(1, r.fam / 0.25));
  return clamp1((0.5 * r.like + 0.3 * r.trust + 0.2 * r.respect) * fam);
}

// The same measure with the ablation switch ignored, so tests can split people by standing even in a world where regard decides nothing.
export function regardRaw(w: World, who: number, ofWhom: number): number {
  if (who === ofWhom) return 0;
  if (OFF.has('forget')) { // diagnostic: the round-6c formula, which never forgets
    const r = peekBond(w, who, ofWhom); const bp = r ? 0.5 * r.like + 0.3 * r.trust + 0.2 * r.respect : 0; let s2 = 0, n2 = 0;
    for (const k in ADMIRED) { const b = belief(w, who, ofWhom, k); if (b && b.n > 0) { const sure = Math.max(0, 1 - b.v) * Math.exp(-(w.t - b.last) / 54); s2 += Math.tanh(b.m) * ADMIRED[k] * sure; n2 += sure; } }
    return clamp1(0.65 * bp + 0.35 * (n2 ? s2 / n2 : 0));
  }
  let sum = 0, n = 0;
  for (const k in ADMIRED) {
    const b = belief(w, who, ofWhom, k); if (!b || b.n <= 0) continue;
    const strength = Math.abs(Math.tanh(b.m));
    const tau = 54 + 126 * Math.max(0, Math.min(1, (strength - 0.5) / 0.4)); // ordinary impressions: a third left after five years; the strongest: after fifteen
    const sure = Math.max(0, 1 - b.v) * Math.exp(-(w.t - b.last) / tau);
    sum += Math.tanh(b.m) * ADMIRED[k] * sure; n += sure;
  }
  const beliefPart = sum / (n + PRIOR);
  return clamp1(0.65 * bondPart(w, who, ofWhom) + 0.35 * beliefPart);
}
// What the town thinks of a person: the mean regard of those who know them at all. For tests and for anonymous pools (who gets hired by a place with no lead).
export function standing(w: World, ofWhom: number): number {
  let s = 0, n = 0;
  const o = w.byId.get(ofWhom);
  for (const p of (o ? around(w, o) : w.people)) { if (p.id === ofWhom || p.status !== 'in') continue; const r = peekBond(w, p.id, ofWhom); if (!r || r.fam < 0.1) continue; s += regardRaw(w, p.id, ofWhom); n++; }
  return n ? s / n : 0;
}
// Weight for choosing among candidates: likes and admires strongly favoured, the disliked nearly never chosen.
export const regardWeight = (w: World, who: number, ofWhom: number, k = 2.5) => Math.exp(k * regard(w, who, ofWhom));
export { likeOf };
