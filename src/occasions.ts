// Occasions (round 36): a want answers what happens. Each month a person looks at last month: what happened to them and around them
// that they know of (someone close bought something, a colleague was made lead, a band they saw play, a blow), and where they stand in
// life (a round birthday, retiring, a wedding, a baby, the last child grown). An occasion can open a want, but only one the person holds
// the value for and whose door is open to them; the occasion is the want's origin, and the first reason given when they go after it.
// Wanting is kept from flooding: an occasion opens a want only while the person has fewer than three open of their own and none of that
// kind; a want not gone after in three years lapses (said only if it had been let slip); a want achieved does not come back for five
// years (steer.ts). A house is a couple's: its door is shut while the partner has one or wants one.
//
// What a want does once it is open (ways, obstacles, outcomes) is the pursuit machinery in time.ts and steer.ts, unchanged.

import { SETTING } from './setting';
import { ON, together, age, addEvent, broadcast, year, type World, type Person, type Event, type Want, type Cause } from './world';
import { eventCause, stateCause } from './considerations';
import { family } from './grammar';
import { markGivenUp } from './steer';

// Off unless ON=occasions: round 36 was withdrawn before its test. On throwaway worlds it reached people (adults going after something
// 56% against 46%, things bought four times as often) but less than its expectations, and barely changed the most eventful lives the
// reading reads (docs/BOARD.md, round 36).
export const occasionsOn = () => ON.has('occasions') || together();

// Kinds of want a person goes after themselves (time.ts PLAN); the caps and the lapse count only these.
export const OWN_KINDS = new Set(['attain', 'acquire', 'escape', 'prove', 'belong', 'restore']);
export const ownOpen = (p: Person) => p.wants.filter(x => !x.done && OWN_KINDS.has(x.kind) && !x.pursuit?.owner);

// Whether an occasion may open a want now (time.ts addWant): fewer than three open of one's own, and none of that kind.
export function roomFor(p: Person, kind: string): boolean {
  if (!occasionsOn() || !OWN_KINDS.has(kind)) return true;
  const open = ownOpen(p);
  return open.length < 3 && !open.some(x => x.kind === kind);
}

export interface Origin {
  kind: string; // the occasion: 'saw:bought', 'stage:40', 'blow:split', ...
  label: string; // its words, with @id tokens
  ref?: number; // the event, when it is one
}
// The reason an occasion gives: the event itself, or the stage of life in words.
export const originCause = (w: World, o: Origin, weight = 0.6): Cause =>
  o.ref != null && w.events[o.ref] ? eventCause(w, o.ref, weight) : stateCause(o.label, weight);

const held = (p: Person, v: string) => p.coreValues.includes(v) || (p.values[v] ?? 0) >= 0.5;
// The person's values, most important first: core values in order, then the others held strongly.
const valuesInOrder = (p: Person) => [
  ...p.coreValues,
  ...Object.keys(p.values)
    .filter(v => !p.coreValues.includes(v) && p.values[v] >= 0.5)
    .sort((a, b) => p.values[b] - p.values[a] || (a < b ? -1 : 1)),
];

type Spec = { kind: string; target: string; value: string };

// Doors: each says whether it is open to the person now, and the want it opens.
const owns = (p: Person, g: string) => p.attachments.some(a => a.key === g);
const wanting = (p: Person, kind: string, target: string) => p.wants.some(x => !x.done && x.kind === kind && x.target === target);
// A house is a couple's: the door is shut while the partner has one or wants one (time.ts has no other shared good).
function thing(w: World, p: Person, g: string, value: string): Spec | null {
  if (!SETTING.goods.some(x => x.id === g) || owns(p, g) || wanting(p, 'acquire', g) || p.savings < -6) return null;
  const q = g === 'house' && p.partner != null ? w.byId.get(p.partner) : undefined;
  if (q && (owns(q, g) || wanting(q, 'acquire', g))) return null;
  return { kind: 'acquire', target: g, value };
}
function post(w: World, p: Person, value: string): Spec | null {
  const pl = p.job ? w.placeById.get(p.job) : undefined;
  if (!pl || p.lead || p.retired || age(w, p) >= 62 || w.t - p.jobSince < 24 || (pl as any).closed) return null;
  return { kind: 'attain', target: pl.id, value };
}
function heard(w: World, p: Person, value: string, maxAge = 55): Spec | null {
  if (age(w, p) >= maxAge || p.group != null) return null;
  const h = SETTING.hobbies
    .filter(h => (p.skills[h]?.interest ?? 0) >= 1 && (p.skills[h]?.r ?? 0) > 1000)
    .sort((a, b) => p.skills[b].r - p.skills[a].r || (a < b ? -1 : 1))[0];
  return h ? { kind: 'prove', target: h, value } : null;
}
const people = (p: Person): Spec | null => (p.friends.size < 2 ? { kind: 'belong', target: 'people', value: 'fittingIn' } : null);

// What each value opens at a stage of life (a round birthday, retiring, the last child grown), first open door in value order.
function byValue(w: World, p: Person, retiring: boolean): Spec | null {
  for (const v of valuesInOrder(p)) {
    const s =
      v === 'status'
        ? thing(w, p, 'car', v)
        : v === 'success'
          ? retiring
            ? null
            : post(w, p, v)
          : v === 'freedom'
            ? thing(w, p, 'boat', v)
            : v === 'thrill'
              ? thing(w, p, 'trip', v)
              : v === 'pleasure'
                ? heard(w, p, v)
                : v === 'fittingIn'
                  ? people(p)
                  : v === 'security'
                    ? thing(w, p, 'house', v)
                    : null;
    if (s) return s;
  }
  return null;
}
// A house, for a wedding, a baby or a post won.
function home(w: World, p: Person): Spec | null {
  const v = ['security', 'lovedOnes', 'tradition'].find(v => held(p, v));
  return v ? thing(w, p, 'house', v) : null;
}

interface Occ {
  type: string; // one occasion of a type in three years
  origin: Origin;
  open: () => Spec | null;
  chance: number;
  blow?: boolean;
}

const NUM: Record<number, string> = { 30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty' };

// Last month's occasions for a person, blows first, then their own life, then what they saw.
function occasionsOf(w: World, p: Person): Occ[] {
  const out: Occ[] = [];
  const last = w.t - 1;
  let i = w.events.length;
  while (i > 0 && w.events[i - 1].t >= last) i--;
  const evs: Event[] = [];
  for (; i < w.events.length; i++) if (w.events[i].t === last) evs.push(w.events[i]);
  const close = (q: Person) => p.friends.has(q.id) || p.partner === q.id || family(p, q);
  const ev = (e: Event): Origin => ({ kind: '', label: e.text, ref: e.id });
  const blows: Occ[] = [],
    own: Occ[] = [],
    seen: Occ[] = [];
  for (const e of evs) {
    const mine = e.who.includes(p.id);
    if (!mine && !e.knownBy.has(p.id)) continue;
    const q = e.who[0] != null && e.who[0] !== p.id ? w.byId.get(e.who[0]) : undefined;
    switch (e.type) {
      case 'bought': {
        if (!q || !close(q)) break;
        const g = q.attachments.find(a => a.cause === e.id)?.key;
        const good = g ? SETTING.goods.find(x => x.id === g) : undefined;
        if (good && held(p, good.value)) seen.push({ type: 'saw:bought', origin: ev(e), open: () => thing(w, p, good.id, good.value), chance: 0.3 });
        break;
      }
      case 'promoted': {
        if (!q || !p.job || q.job !== p.job) break;
        const v = ['success', 'status'].find(v => held(p, v));
        if (v) seen.push({ type: 'saw:promoted', origin: ev(e), open: () => post(w, p, v), chance: 0.3 });
        break;
      }
      case 'performed':
      case 'group:show':
      case 'group:formed': {
        if (mine) break;
        const v = ['pleasure', 'status', 'freedom'].find(v => held(p, v));
        if (v) seen.push({ type: 'saw:played', origin: ev(e), open: () => heard(w, p, v), chance: 0.15 });
        break;
      }
      case 'passed': {
        if (e.who[0] !== p.id) break;
        const v = ['success', 'status'].find(v => held(p, v));
        if (v) blows.push({ type: 'blow:passed', origin: ev(e), open: () => post(w, p, v), chance: 0.5, blow: true });
        break;
      }
      case 'divorce':
      case 'split':
      case 'death':
      case 'group:split': {
        if (!mine) break;
        if (e.type === 'death' && e.who[0] === p.id) break;
        const band = e.type === 'group:split';
        const open = (): Spec | null => {
          for (const v of valuesInOrder(p)) {
            const s =
              v === 'fittingIn' || v === 'lovedOnes'
                ? people(p)
                : v === 'thrill' || v === 'freedom'
                  ? thing(w, p, 'trip', v)
                  : band && (v === 'pleasure' || v === 'status')
                    ? heard(w, p, v)
                    : null;
            if (s) return s;
          }
          return null;
        };
        blows.push({ type: band ? 'blow:band' : 'blow:' + e.type, origin: ev(e), open, chance: 0.5, blow: true });
        break;
      }
      case 'married':
        if (mine) own.push({ type: 'stage:married', origin: ev(e), open: () => home(w, p), chance: 0.6 });
        break;
      case 'born':
        if (e.who.slice(1).includes(p.id)) own.push({ type: 'stage:baby', origin: ev(e), open: () => home(w, p), chance: 0.6 });
        break;
      case 'retired':
        if (e.who[0] === p.id) own.push({ type: 'stage:retired', origin: ev(e), open: () => byValue(w, p, true), chance: 0.5 });
        break;
      case 'want:achieved':
        if (e.who[0] === p.id && p.lead && p.wants.some(x => x.kind === 'attain' && x.doneAt === e.id))
          own.push({
            type: 'own:post',
            origin: ev(e),
            open: () => home(w, p) ?? (held(p, 'status') ? thing(w, p, 'car', 'status') : null),
            chance: 0.4,
          });
        break;
    }
  }
  // Stages with no event of their own: a round birthday, the last child grown.
  const months = w.t - p.born;
  if (months % 12 === 0 && NUM[months / 12])
    own.push({
      type: 'stage:birthday',
      origin: { kind: '', label: `turned ${NUM[months / 12]}`, ref: undefined },
      open: () => byValue(w, p, false),
      chance: 0.5,
    });
  const kids = p.kids.map(id => w.byId.get(id)).filter((k): k is Person => !!k && k.status !== 'dead');
  const youngest = kids.sort((a, b) => b.born - a.born)[0];
  if (youngest && w.t - youngest.born === 18 * 12)
    own.push({
      type: 'stage:grown',
      origin: { kind: '', label: `the last of the children grown`, ref: undefined },
      open: () => byValue(w, p, age(w, p) >= 62),
      chance: 0.5,
    });
  for (const o of [...blows, ...own, ...seen]) o.origin.kind = o.type;
  return [...blows, ...own, ...seen];
}

export type AddWant = (kind: string, target: string, value: string, urgency: number, origin: Origin) => boolean;

// Once a month (time.ts pursuitTick, after the old routes): at most one want from last month's occasions, and wants long unpursued lapse.
export function occasionsTick(w: World, p: Person, add: AddWant, label: (x: Want) => string) {
  if (!occasionsOn()) return;
  lapse(w, p, label);
  if (age(w, p) < 16) return;
  for (const o of occasionsOf(w, p)) {
    const k = 'occ:' + o.type;
    if (w.t - (p.tried[k]?.t ?? -99) < 36) continue;
    const s = o.open();
    if (!s) continue;
    if (!w.rng.chance(o.chance)) continue;
    const urgency = 0.3 + 0.3 * Math.max(0, Math.min(1, ((p.values[s.value] ?? 0) + 2) / 4)) + (o.blow ? 0.2 : 0.1);
    if (add(s.kind, s.target, s.value, urgency, o.origin)) {
      p.tried[k] = { t: w.t, ok: true, n: (p.tried[k]?.n ?? 0) + 1 };
      return;
    }
  }
}

// What the person did since a want began that served it by another road than a pursuit: playing the open night, or being in a band (it
// formed, they joined, brought it a song, it played), for a want to be heard; going to the person, for a want to make things right with
// them (round 40).
const HEARD = new Set(['performed', 'group:formed', 'group:joined', 'group:work', 'group:show']);
function served(w: World, p: Person, x: Want): number | undefined {
  if (x.kind !== 'prove' && x.kind !== 'restore') return undefined;
  for (let k = p.events.length - 1; k >= 0; k--) {
    const e = w.events[p.events[k]];
    if (e.t < x.since) continue; // a person's list is not strictly in time order (a cited past can be added later)
    if (x.kind === 'prove' ? HEARD.has(e.type) : e.who[0] === p.id && e.who.includes(+x.target)) return e.id;
  }
  const g = x.kind === 'prove' && p.group != null ? w.groups[p.group] : undefined;
  return g && g.lastShow >= x.since ? (g.events[g.events.length - 1] ?? g.events[0]) : undefined;
}

// A want not gone after in three years lapses; said only if it had been let slip, and only if nothing the person did served it: a want
// to be heard met by playing with a band is met, and one to make things right that the person acted on was not let go untried.
function lapse(w: World, p: Person, label: (x: Want) => string) {
  for (const x of p.wants) {
    if (x.done || x.pursuit || !OWN_KINDS.has(x.kind) || w.t - x.since <= 36) continue;
    const met = served(w, p, x);
    if (met != null) {
      x.done = x.kind === 'prove' ? 'achieved' : 'abandoned';
      x.doneAt = met;
      if (x.kind !== 'prove') markGivenUp(w, p, x);
      continue;
    }
    x.done = 'abandoned';
    markGivenUp(w, p, x);
    if (!(x as any).said) continue;
    const e = addEvent(w, {
      type: 'want:lapsed',
      who: [p.id],
      text: `@${p.id} no longer talks about wanting ${label(x)}.`,
      causes: [{ kind: 'want', label: `had wanted it since ${year(x.since)}, and never went after it`, weight: 0.6, key: x.kind, who: p.id }],
      vis: 'local',
      evidence: [],
      w: 0.6,
    });
    x.doneAt = e.id;
    broadcast(w, e);
  }
}
