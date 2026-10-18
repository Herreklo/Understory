// A deep copy of a world, for what-ifs: every object, array, Map and Set is copied with its prototype (so random streams stay streams),
// shared references stay shared and cycles are kept; functions (the hooks) are kept by reference, since they take the world as an argument.
// Checked by `whatif.ts check`: a copy run ten years gives the same behaviour as the original.
import type { World } from '../world';

export function cloneWorld(w: World): World {
  const seen = new Map<any, any>();
  const copy = (x: any): any => {
    if (x === null || typeof x !== 'object') return x;
    const got = seen.get(x);
    if (got !== undefined) return got;
    if (Array.isArray(x)) {
      const a: any[] = new Array(x.length);
      seen.set(x, a);
      for (let i = 0; i < x.length; i++) a[i] = copy(x[i]);
      return a;
    }
    if (x instanceof Map) {
      const m = new Map();
      seen.set(x, m);
      for (const [k, v] of x) m.set(copy(k), copy(v));
      return m;
    }
    if (x instanceof Set) {
      const s = new Set();
      seen.set(x, s);
      for (const v of x) s.add(copy(v));
      return s;
    }
    if (x instanceof WeakMap || x instanceof WeakSet) throw new Error('cloneWorld: a weak collection inside the world');
    const o = Object.create(Object.getPrototypeOf(x));
    seen.set(x, o);
    for (const k of Object.keys(x)) o[k] = copy(x[k]);
    return o;
  };
  return copy(w);
}
