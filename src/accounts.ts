// Accounts: what people hold about an act. The record keeps what happened; an account is one person's hold on it, kept in their
// bond toward the one who did it, beside the trait evidence the act taught them. The person an act was done to keeps it as a memory
// (`remember`, source absent); someone who saw a weighty act keeps it too (source 'saw'), with a smaller effect on how they feel about
// the doer. Everything that reads memories reads accounts: liking (contact), the bond reasons a decision gives, a friendship's or a
// dislike's reasons. Only an act done to oneself can come back as an old wound.
//
// Seen accounts form from weighty acts (an event someone chose, on the consequence map's own line of weight) that others could see, for the people `broadcast` reached
// as having seen it, so they follow settings and never a walk over the town. They fade as memories do; past a bound of live ones a
// person drops the most faded first, so a crowded month loses what was half-forgotten and never what mattered.

import { EXPR } from './families';
import { clamp } from './rng';
import { OFF, bond, remember, memWeight, TEXTURE, VALENCE, type World, type Event, type Person, type Memory } from './world';

export const accountsOn = () => !OFF.has('accounts');
const SHARE = 0.3; // a seen act moves the bystander's feeling about the doer this much of what it does to the one it was done to
const BOUND = 32; // live seen accounts a person holds before the most faded go
const TYPICAL: [number, number, number] = [0.2, 0.3, 0.2]; // like, respect, trust: the hit of an act with no target of its own

// How admirable the act was in the eyes of the town: the act's evidence about the doer, read on the facets whose high end people
// admire (+) or deplore (-). Between -1 and 1; near 0, there is nothing to feel about it.
function valence(e: Event, actor: number): number {
  let v = 0;
  for (const x of e.evidence) if (x.subject === actor) v += (VALENCE[x.key] ?? 0) * x.dir * x.strength;
  return clamp(v, -1, 1);
}

// The act as seen: the record's first sentence (a note such as when it happened before stays with the record).
const asSeen = (text: string) => {
  const t = text.split(/(?<=\.)\s+(?=[A-Z])/)[0].replace(/\.\s*$/, '');
  return 'was there when ' + (t.startsWith('@') ? t : t[0].toLowerCase() + t.slice(1));
};

// Called by `broadcast` with the people who saw the event.
export function keepAccounts(w: World, e: Event, seen: number[]) {
  if (!accountsOn() || !e.decision || e.w < 0.8 || TEXTURE.has(e.type) || e.vis === 'private' || !e.who.length) return;
  const actor = w.byId.get(e.who[0]);
  if (!actor) return;
  const v = valence(e, actor.id);
  if (Math.abs(v) < 0.1) return;
  const x = EXPR[e.type];
  const hit: [number, number, number] =
    x && Math.abs(x.like) + Math.abs(x.respect) + Math.abs(x.trust) > 0 ? [Math.abs(x.like), Math.abs(x.respect), Math.abs(x.trust)] : TYPICAL;
  const s = SHARE * v;
  for (const id of seen) {
    if (e.who.includes(id)) continue;
    const h = w.byId.get(id);
    if (!h || h.status !== 'in') continue;
    const r = bond(w, h.id, actor.id);
    if (r.mem.some(m => m.ev === e.id)) continue;
    remember(w, h, actor, e.id, s * hit[0], s * hit[1], s * hit[2], asSeen(e.text));
    const m = r.mem.find(m => m.ev === e.id);
    if (!m) continue;
    m.source = 'saw';
    (h.saw ??= []).push({ o: actor.id, ev: e.id });
    if (h.saw.length > BOUND) dropFaded(w, h);
  }
}

// The live weight of a seen account: how strongly it is felt, times how much of it is left.
const strength = (h: Person, m: Memory, t: number, o: number) => (Math.abs(m.like) + Math.abs(m.respect) + Math.abs(m.trust)) * memWeight(h, m, t, o);

function dropFaded(w: World, h: Person) {
  const list = h.saw!;
  let worst = -1,
    least = Infinity;
  for (let i = 0; i < list.length; i++) {
    const { o, ev } = list[i];
    const m = bond(w, h.id, o).mem.find(m => m.ev === ev);
    if (!m) {
      // already gone (the pair's own bound took it): nothing to drop but the entry
      list.splice(i, 1);
      return;
    }
    const s = strength(h, m, w.t, o);
    if (s < least) {
      least = s;
      worst = i;
    }
  }
  const { o, ev } = list[worst];
  const r = bond(w, h.id, o);
  r.mem = r.mem.filter(m => m.ev !== ev);
  list.splice(worst, 1);
}
