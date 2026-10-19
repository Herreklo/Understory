// The world's signature for the identity check: hashes of everything a world holds, in a canonical order so that only a real
// difference shows. Shared by ident.ts and the boundary test.
import { createHash } from 'crypto';
import type { World } from '../../world';

export function canon(x: any, seen = new WeakSet()): any {
  if (x === null || typeof x !== 'object') return typeof x === 'function' ? undefined : typeof x === 'number' && !Number.isFinite(x) ? String(x) : x;
  if (seen.has(x)) return '[cycle]';
  seen.add(x);
  let out: any;
  if (x instanceof Map)
    out = [...x.entries()]
      .map(([k, v]) => [canon(k, seen), canon(v, seen)])
      .sort((a, b) => (String(a[0]) < String(b[0]) ? -1 : String(a[0]) > String(b[0]) ? 1 : 0));
  else if (x instanceof Set) out = [...x].map(v => canon(v, seen)).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
  else if (Array.isArray(x)) out = x.map(v => canon(v, seen));
  else {
    out = {};
    for (const k of Object.keys(x).sort()) {
      if (k === 'pupils') continue; // retired with the round-12 teacher mechanism (always empty)
      const v = canon(x[k], seen);
      if (v !== undefined) out[k] = v;
    }
  }
  seen.delete(x);
  return out;
}
export const h = (x: any) =>
  createHash('sha1')
    .update(JSON.stringify(canon(x)))
    .digest('hex')
    .slice(0, 12);

export function signature(w: World) {
  const people = w.people.map(p => ({ ...p, events: undefined }));
  return {
    events: h(w.events.map(e => ({ ...e, explain: undefined }))),
    people: h(people),
    bonds: h(w.bonds),
    beliefs: h(w.beliefs),
    rest: h({
      groups: w.groups,
      places: w.places,
      stats: w.stats,
      queue: w.queue,
      nextId: w.nextId,
      witness: w.witness,
      streams: Object.fromEntries(Object.entries(w.streams).map(([k, r]) => [k, (r as any).s ?? (r as any).state ?? JSON.stringify(r)])),
      extra: Object.fromEntries(Object.entries(w).filter(([k]) => k.startsWith('_'))),
    }),
    n: w.events.length,
  };
}
