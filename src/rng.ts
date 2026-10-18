// Seeded randomness. Every draw comes from a stream derived from the world seed plus
// the entity and purpose it serves, so adding a person never changes anyone else's fate.

export function hash(...parts: (string | number)[]): number {
  let h = 2166136261 >>> 0;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x9e3779b9;
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
  }
  return h >>> 0;
}

export class Rng {
  private a: number;
  constructor(seed: number) {
    this.a = seed >>> 0 || 1;
  }
  next(): number {
    let t = (this.a = (this.a + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  normal(): number {
    let u = 0,
      v = 0;
    while (!u) u = this.next();
    while (!v) v = this.next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  int(a: number, b: number): number {
    return Math.floor(this.range(a, b + 1));
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
  weighted<T>(items: readonly (readonly [T, number])[]): T {
    let sum = 0;
    for (const [, w] of items) sum += Math.max(0, w);
    if (sum <= 0) return items[0][0];
    let r = this.next() * sum;
    for (const [it, w] of items) {
      r -= Math.max(0, w);
      if (r <= 0) return it;
    }
    return items[items.length - 1][0];
  }
  shuffle<T>(items: T[]): T[] {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

export const stream = (...parts: (string | number)[]) => new Rng(hash(...parts));

export const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// Standard normal cumulative distribution (Abramowitz–Stegun approximation).
export function normCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
