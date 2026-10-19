// City scale: settings instead of the whole town.
// People meet through bounded settings (household, workplace, school, neighbourhood, venue) so that a month costs
// time in proportion to the people in it. A town is split into neighbourhoods of about HOOD people; a town smaller
// than that is a single neighbourhood, and then every rule here gives exactly what the town rules give.
import type { World, Person } from './world';

export const HOOD = 80;

// Membership changes (who is in town, who works where) call moved(), so indexes are rebuilt only when needed. The index is a cache
// kept beside the world, not in it, so it is never hashed, copied or saved with the world.
let POPVER = 0;
const INDEX = new WeakMap<World, Index & { _jobless?: Person[] }>();
export const rebuilds = new WeakMap<World, number>();
export function moved() {
  POPVER++;
}
// A change of job, kept in the index without rebuilding it: the staff lists and the jobless list are replaced by updated copies,
// still in the engine's order (so a list someone is walking through stays as it was, as with a rebuild).
export function jobSet(w: World, p: Person, job: string | null) {
  const old = p.job;
  p.job = job;
  if (old === job) return;
  const I = INDEX.get(w);
  if (!I || I.t !== w.t || I.len !== w.people.length || I.ver !== POPVER || I.H !== hoods(w) || p.status !== 'in' || !I.pos.has(p.id)) {
    POPVER++;
    return;
  }
  const at = p.id; // the engine's order is the order people were created in, which is the order of their ids
  const insert = (l: Person[]) => {
    const c = l.slice();
    let i = 0;
    while (i < c.length && c[i].id < at) i++;
    c.splice(i, 0, p);
    return c;
  };
  if (old) {
    const l = I.byJob.get(old);
    if (l)
      I.byJob.set(
        old,
        l.filter(x => x !== p),
      );
  }
  if (job) I.byJob.set(job, insert(I.byJob.get(job) ?? []));
  if (I._jobless) I._jobless = job ? (old ? I._jobless : I._jobless.filter(x => x !== p)) : old ? insert(I._jobless) : I._jobless;
}

// Neighbourhood count is fixed when the town is built, from its size then.
export function setHoods(w: World, people: number) {
  const H = Math.max(1, Math.round(people / HOOD));
  if (H > 1) (w as any).H = H;
} // a town of one neighbourhood carries nothing
export const hoods = (w: World): number => (w as any).H ?? 1;

const mix = (a: number, b: number) => {
  let h = (a * 0x9e3779b1) ^ (b * 0x85ebca77);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  return (h ^ (h >>> 15)) >>> 0;
};

export interface Index {
  t: number;
  len: number;
  ver: number;
  H: number; // valid while the month, the number of people, the membership version and the neighbourhood count are unchanged
  live: Person[]; // in town, in the order of w.people (the order the engine iterates)
  byJob: Map<string, Person[]>; // workplace -> staff, same order
  hood: Person[][]; // neighbourhood -> residents, same order
  placeHood: Map<string, number>;
  pos: Map<number, number>; // person id -> position in live
}

// A household lives together: children under twenty with a parent in town live with that parent; partners share a home.
// A person's neighbourhood is kept once given, and changes only when they move in with someone or grow up into their own.
function assignHood(w: World, p: Person, H: number, seen: Set<number>): number {
  const a = p as any;
  if (seen.has(p.id)) return a.hood ?? 0;
  seen.add(p.id);
  const age = (w.t - p.born) / 12;
  if (age < 20) {
    for (const k of p.parents) {
      const q = w.byId.get(k);
      if (q && q.status === 'in') return (a.hood = assignHood(w, q, H, seen));
    }
  }
  if (p.partner != null) {
    const q = w.byId.get(p.partner);
    if (q && q.status === 'in' && q.id < p.id) return (a.hood = assignHood(w, q, H, seen));
  }
  if (a.hood == null || a.hood >= H) {
    const F = (w as any).focus as Set<number> | undefined;
    a.hood = F ? [...F][mix(w.seed, p.id) % F.size] : mix(w.seed, p.id) % H;
  }
  return a.hood;
}

export function idx(w: World): Index {
  const cur = INDEX.get(w);
  if (cur && cur.t === w.t && cur.len === w.people.length && cur.ver === POPVER && cur.H === hoods(w)) return cur;
  if (cur && cur.H > 1 && cur.H === hoods(w) && cur.ver === POPVER && cur.len < w.people.length && cur.t === w.t) {
    // only new people since: append them
    const seen = new Set<number>();
    const c = cur as Index & { _jobless?: Person[] };
    for (let i = cur.len; i < w.people.length; i++) {
      const p = w.people[i];
      if (p.status !== 'in') continue;
      cur.pos.set(p.id, cur.live.length);
      cur.live.push(p);
      const h = assignHood(w, p, cur.H, seen);
      cur.hood[h] = [...cur.hood[h], p];
      if (p.job) cur.byJob.set(p.job, [...(cur.byJob.get(p.job) ?? []), p]);
      else if (c._jobless) c._jobless = [...c._jobless, p];
    }
    cur.len = w.people.length;
    return cur;
  }
  rebuilds.set(w, (rebuilds.get(w) ?? 0) + 1);
  const H = hoods(w);
  const live: Person[] = [];
  const byJob = new Map<string, Person[]>();
  const hood: Person[][] = Array.from({ length: H }, () => []);
  const seen = new Set<number>();
  const pos = new Map<number, number>();
  for (const p of w.people)
    if (p.status === 'in') {
      pos.set(p.id, live.length);
      live.push(p);
      if (p.job) (byJob.get(p.job) ?? byJob.set(p.job, []).get(p.job)!).push(p);
      hood[H === 1 ? 0 : assignHood(w, p, H, seen)].push(p);
    }
  const placeHood = new Map<string, number>();
  w.places.forEach((pl, i) => placeHood.set(pl.id, (pl as any).hood ?? i % H));
  const out: Index = { t: w.t, len: w.people.length, ver: POPVER, H, live, byJob, hood, placeHood, pos };
  INDEX.set(w, out);
  return out;
}

// A town of one neighbourhood never uses the index: every lookup is the engine's own scan of the town, so a town runs exactly as
// the engine does whatever the index holds. The index serves cities only.
export const town = (w: World): Person[] => w.people.filter(p => p.status === 'in');
export const hoodOf = (w: World, p: Person): number => (hoods(w) === 1 ? 0 : ((p as any).hood ?? (idx(w), (p as any).hood ?? 0)));
// Everyone in the neighbourhoods of these people, in the engine's order, each once.
export function residentsNear(w: World, ids: number[]): Person[] {
  if (hoods(w) === 1) return town(w);
  const I = idx(w);
  const hs = new Set<number>();
  for (const id of ids) {
    const p = w.byId.get(id);
    if (p && p.status === 'in') hs.add(hoodOf(w, p));
  }
  if (hs.size === 1) return I.hood[[...hs][0]];
  const lists = [...hs].map(h => I.hood[h]);
  const at = lists.map(() => 0);
  const out: Person[] = [];
  for (;;) {
    let k = -1;
    for (let j = 0; j < lists.length; j++) if (at[j] < lists[j].length && (k < 0 || lists[j][at[j]].id < lists[k][at[k]].id)) k = j;
    if (k < 0) break;
    out.push(lists[k][at[k]++]);
  }
  return out;
}

// Staff of a workplace, from the index (the same people in the same order as a scan of the town).
export const staffOf = (w: World, job: string | null | undefined): Person[] =>
  !job ? [] : hoods(w) === 1 ? w.people.filter(p => p.status === 'in' && p.job === job) : (idx(w).byJob.get(job) ?? []);
// Those who could plausibly hear of or react to what these people did: their neighbourhoods. A one-neighbourhood town: everyone.
export const near = (w: World, ...ids: number[]): Person[] => residentsNear(w, ids);
// The people someone could plausibly deal with: their neighbourhood, workplace, circle, friends and family. A one-neighbourhood town: everyone.
export function around(w: World, p: Person): Person[] {
  if (hoods(w) === 1) return town(w);
  const I = idx(w);
  const set = new Set<Person>(I.hood[hoodOf(w, p)]);
  const add = (id: number | null | undefined) => {
    if (id == null) return;
    const q = w.byId.get(id);
    if (q && q.status === 'in') set.add(q);
  };
  for (const q of staffOf(w, p.job)) set.add(q);
  for (const id of p.circle) add(id);
  for (const id of p.friends) add(id);
  add(p.partner);
  for (const id of p.kids) add(id);
  for (const id of p.parents) add(id);
  return [...set].sort((a, b) => a.id - b.id);
}
export function aroundAll(w: World, ps: Person[]): Person[] {
  if (hoods(w) === 1 || ps.length === 0) return hoods(w) === 1 ? town(w) : idx(w).live.slice();
  const set = new Set<Person>();
  for (const p of ps) for (const q of around(w, p)) set.add(q);
  return [...set].sort((a, b) => a.id - b.id);
}
// The record of the last few months, read from the end (the record is in time order).
export function recent(w: World, months: number): World['events'] {
  const out: World['events'] = [];
  for (let i = w.events.length - 1; i >= 0 && w.events[i].t >= w.t - months; i--) out.push(w.events[i]);
  return out.reverse();
}

// Everyone in town without a job, in the engine's order: the people a vacancy can be filled from.
export function jobless(w: World): Person[] {
  if (hoods(w) === 1) return town(w).filter(p => !p.job);
  const I = idx(w) as Index & { _jobless?: Person[] };
  return (I._jobless ??= I.live.filter(p => !p.job));
}

// The background of a city is kept apart from the people of the monthly world, so nothing that runs each month ever walks
// past them: w.people holds the monthly world (in town, away, and their dead), the background list holds everyone else.
export const background = (w: World): Person[] => ((w as any).background ??= []) as Person[];
export function toBackground(w: World, ps: Person[]) {
  if (!ps.length) return;
  const S = new Set(ps);
  if (ps.length === 1 && w.people[w.people.length - 1] === ps[0]) w.people.pop();
  else w.people = w.people.filter(p => !S.has(p));
  background(w).push(...ps);
}
// The bonds a background person holds are put away with them: no contact happens in the background, so nothing should fade or be
// read there, and the monthly world's walks over its bonds do not pass them. They come back with the person (fromBackground).
const stowed = (w: World): Map<number, any> => ((w as any).bgBonds ??= new Map()) as Map<number, any>;
export function stowBonds(w: World, ps: Person[]) {
  const S = new Set(ps.map(p => p.id));
  const B = stowed(w);
  for (const [k, b] of w.bonds)
    if (S.has(Math.floor(k / 2 ** 26))) {
      B.set(k, b);
      w.bonds.delete(k);
    }
}
// Back into the monthly world, in id order (the engine's order).
export function fromBackground(w: World, ps: Person[]) {
  const S = new Set(ps);
  (w as any).background = background(w).filter(p => !S.has(p));
  const B = (w as any).bgBonds as Map<number, any> | undefined;
  if (B?.size) {
    const ids = new Set(ps.map(p => p.id));
    for (const [k, b] of B)
      if (ids.has(Math.floor(k / 2 ** 26))) {
        if (!w.bonds.has(k)) w.bonds.set(k, b);
        B.delete(k);
      }
  }
  const add = ps.slice().sort((a, b) => a.id - b.id);
  const out: Person[] = [];
  let i = 0,
    j = 0;
  while (i < w.people.length || j < add.length)
    out.push(j >= add.length || (i < w.people.length && w.people[i].id < add[j].id) ? w.people[i++] : add[j++]);
  w.people = out;
  moved();
}
export const everyone = (w: World): Person[] => w.people.concat(background(w));

// ---------- institutions ----------
// A workplace is an instance of a kind (the setting's places: a sawmill, a school, a bar...). A city gives every neighbourhood its own
// set, each with its own capacity, staff and leader; a town of one neighbourhood has exactly the setting's places. Instances of the
// first neighbourhood keep the kind's own id, so the engine's few references to a kind by name ('bar', 'council') still find one.
export const typeOf = (pl: any): string => pl.type ?? pl.id;
// Neighbourhood names are plain English parts, as the setting's own names are (no country's place names).
const HOODS_A = ['North', 'South', 'East', 'West', 'Upper', 'Lower', 'Old', 'New', 'Far', 'High', 'Low', 'Little'];
const HOODS_B = ['field', 'hill', 'gate', 'bridge', 'brook', 'green', 'croft', 'wharf', 'moor', 'cross', 'lea', 'ford', 'bank', 'well'];
export const hoodName = (h: number) =>
  h === 0
    ? 'the old town'
    : HOODS_A[h % HOODS_A.length] +
      HOODS_B[Math.floor(h / HOODS_A.length) % HOODS_B.length] +
      (h >= HOODS_A.length * HOODS_B.length ? ' ' + (1 + Math.floor(h / (HOODS_A.length * HOODS_B.length))) : '');
export function makeInstances(base: any[], h: number) {
  return base.map(p => ({
    ...p,
    type: p.id,
    id: h === 0 ? p.id : `${p.id}~${h}`,
    name: h === 0 ? p.name : `${p.name} in ${hoodName(h)}`,
    hood: h,
    lead: null,
    vac: 0,
  }));
}
// The instance of a kind in a neighbourhood (the first of that kind if the neighbourhood has none in the monthly world).
export function placeOf(w: World, type: string, hood: number): any {
  let first: any;
  for (const pl of w.places as any[])
    if (typeOf(pl) === type) {
      if ((pl.hood ?? 0) === hood) return pl;
      first ??= pl;
    }
  return first;
}
