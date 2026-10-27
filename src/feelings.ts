// Feelings, part one (round 44; notes/research/feelings-and-traits.md): grief, resentment, guilt and gratitude, each toward a named person.
//
// A feeling holds a kind, its cause (an event), its object (a person), an intensity, and whether its cause still stands: the death, the
// wrong not yet put right, the help not yet repaid. It is renewed, not timed. Each month it fades at its kind's rate, slowly while its cause
// stands and fast once it is gone; a resentment flares again whenever the two meet in a situation. A person holds one per kind and object,
// the strongest kept, and at most eight.
//
//   grief        a death, or a break-up for the one left. Its fading follows a trajectory drawn at onset (Bonanno): most are resilient,
//                some recover over a year, some stay; dependence makes it chronic, sentimentality makes it deeper.
//   resentment   a named person wronged me: an act done to me that hurt (the acts that provoke an answer, grammar.ts). Fast, with a long
//                tail while the wrong stands; amends end its standing. Patience, forgiveness and gentleness lower it.
//   guilt        my act hurt someone I value. It stands until amends are made. Sincerity, fairness and altruism raise it.
//   gratitude    another's costly help when I was in need, not owed (not a duty, and not a small kindness). It stands until repaid, and leaves a bond gain when it is.
//
// In a situation that involves its object (grief: any choice it bears on), a feeling weighs for the families it pulls toward and against
// the rest, as one consideration on every answer, so it is the reason when it decides, worded with its kind and its object. A strong
// resentment adds a hard answer where the object needs something of the holder (revenge waits for its opening); a strong guilt adds an
// apology where the two meet under strain or old business. A feeling left unresolved past its kind's horizon becomes a lasting change.
//
// The debt: a wrong leaves the wrongdoer owing the one wronged, costly help leaves the helped owing the helper (`Person.owes`, the latest
// debt, beside the gratitude or guilt that carries it). It is paid by amends or help in return, and called in when the creditor next needs
// the debtor: in need, they ask the one who owes them first (situations/request.ts), the debt weighs for asking, and the debtor weighs it
// in answering.
//
// The meeting (round 45, notes/research/meeting.md): a strong resentment, guilt or gratitude whose cause still stands may bring its holder
// to its object, where the two share a place (situations/meeting.ts). Its chance each month is the intensity times the holder's approach
// for that kind, from facets; never a timer or a count. Its answers are the kind's own: have it out, let it go or keep away; make amends
// or keep away; thank, repay or keep away. Every answer changes the feeling, so the same state never raises the meeting twice: had out
// halves it, let go ends its standing, kept away halves the holder's seeking of the object, amends and thanks pay it. An apology is
// answered by its object through the queue. A have-out is a wrong (`isWrong`), so its object resents it and is owed, and that
// resentment may bring them to a meeting of their own; it raises no provocation (`rake` sits at the threshold, grammar.ts). A feeling is
// muted only in the immediate answer to its own cause, where the line already says it.
//
// On unless OFF=feelings, the system's switch. Mood is unchanged: the emotions written at the same events still bend it, with no object.

import { clamp } from './rng';
import { pow } from './mathx';
import { curves, type Consideration, type Know, type Option } from './decide';
import { OFF, facet, peekBond, bond, year, type World, type Person } from './world';
import { chanceOf } from './considerations';
import { BY_FAMILY, type Expression, type Family } from './families';
import type { Instance } from './grammar';

export const feelingsOn = () => !OFF.has('feelings');

export type Kind = 'grief' | 'resentment' | 'guilt' | 'gratitude';
export interface Feeling {
  k: Kind;
  o: number; // its object
  ev: number; // its cause
  v: number; // intensity now, 0..1
  v0: number; // intensity at onset, or at its strongest cause since
  t: number; // onset
  stands: boolean; // its cause still stands
  what: string; // the cause in words, for its reason (@id tokens allowed)
  half?: number; // grief: months to fade to half, drawn at onset
  lasting?: boolean; // it has become a lasting change
  away?: number; // how far the holder still seeks the object out, 1 unless they have kept away at a meeting
}

const CAP = 8; // feelings a person holds at once
const GONE = 0.08; // below this a feeling is over
const WEIGH = 0.12; // below this it weighs in no decision
const OWN = 0.3; // at or above this it may add its own answer

function store(w: World): Map<number, Feeling[]> {
  return ((w as any).feelings ??= new Map<number, Feeling[]>()) as Map<number, Feeling[]>;
}
export const feelingsOf = (w: World, id: number): Feeling[] => ((w as any).feelings as Map<number, Feeling[]> | undefined)?.get(id) ?? [];
export const weighs = (f: Feeling) => f.v >= WEIGH;
const find = (w: World, id: number, k: Kind, o: number) => feelingsOf(w, id).find(f => f.k === k && f.o === o);
const strongest = (fs: Feeling[]) => fs.reduce<Feeling | undefined>((a, f) => (!a || f.v > a.v ? f : a), undefined);

// A feeling begins, or a new cause renews it: the stronger cause is kept, a weaker one adds to it.
function feel(w: World, p: Person, k: Kind, o: number, ev: number, v: number, what: string, half?: number): Feeling | undefined {
  if (p.status !== 'in' || o === p.id || v < GONE) return undefined;
  const s = store(w);
  const list = s.get(p.id) ?? [];
  if (!s.has(p.id)) s.set(p.id, list);
  let f = list.find(x => x.k === k && x.o === o);
  if (f && v < f.v) {
    f.v = clamp(f.v + 0.3 * v, 0, 1);
    f.stands = true;
    return f;
  }
  if (f) Object.assign(f, { ev, v, v0: Math.max(v, f.v0), t: w.t, stands: true, what, ...(half != null ? { half } : {}) });
  else list.push((f = { k, o, ev, v, v0: v, t: w.t, stands: true, what, ...(half != null ? { half } : {}) }));
  if (list.length > CAP) {
    const weakest = list.reduce((a, x) => (x.v < a.v ? x : a));
    list.splice(list.indexOf(weakest), 1);
  }
  return f;
}
function end(w: World, id: number, f: Feeling) {
  const list = feelingsOf(w, id);
  const i = list.indexOf(f);
  if (i >= 0) list.splice(i, 1);
}

// ---------- onsets ----------
// Grief at a death (body.ts), as deep as the mood it costs: a parent losing a child most, a friend least.
export function griefAtDeath(w: World, q: Person, dead: Person, ev: number, moodHit: number) {
  if (!feelingsOn()) return;
  grieve(w, q, dead.id, ev, clamp(moodHit * 2.5 * (1 + 0.25 * facet(q, 'sentimentality')), 0, 1), `@${dead.id}, gone since`);
}
// Grief at a break-up (romance.ts), for the one left; the one who ended it feels a little.
export function griefAtSplit(w: World, x: Person, y: Person, ev: number, married: boolean, ender: boolean) {
  if (!feelingsOn()) return;
  const v = (ender ? 0.18 : married ? 0.6 : 0.36) * (1 + 0.25 * facet(x, 'sentimentality'));
  grieve(w, x, y.id, ev, clamp(v, 0, 1), `the end with @${y.id}, since`);
}
// The trajectory, drawn at onset from the person's own chance: resilient (half gone in two months), recovering over a year, or chronic.
function grieve(w: World, q: Person, o: number, ev: number, v: number, what: string) {
  const r = chanceOf(w, q)();
  const chronic = clamp(0.12 + 0.06 * facet(q, 'dependence'), 0.03, 0.3);
  const half = r < chronic ? 30 : r < chronic + 0.25 ? 8 : 2;
  feel(w, q, 'grief', o, ev, v, what, half);
}

// ---------- acts between two people (grammar.ts `run`, after the act) ----------
// A wrong: the acts that provoke an answer (an act that hurt, done hard enough), outside a couple's row, which is answered inside it.
const isWrong = (inst: Instance, x: Expression) => x.like <= -0.25 && x.intensity >= 0.45 && !inst.type.startsWith('row');
// Costly help, not owed: a giving act of some weight (not a visit or a coin in the hat), done for someone in need or in danger, and
// not a duty (a promise kept, a child at a parent's bedside), which is owed already.
const HELPS = new Set<Family>(['generosity', 'warmth', 'courage']);
const isHelp = (inst: Instance, fam: Family, x: Expression) =>
  x.like > 0 && x.intensity >= 0.5 && HELPS.has(fam) && (inst.features.has('need') || inst.features.has('danger'));
// Amends: any kind act toward the one owed.
const AMENDS = new Set<Family>(['humility', 'generosity', 'warmth', 'leniency', 'duty', 'courage']);

// A wrong as the one wronged says it, and as the one who did it says it.
const WRONG: Record<string, string> = {
  shout: 'being shouted at',
  sarcasm: 'the sarcasm',
  dressdown: 'the dressing-down',
  dismiss: 'the sack',
  refuse: 'being turned down',
  absent: 'not being there',
  blame: 'being blamed',
  confront: 'the confrontation',
  rake: 'the old business dragged up',
  needle: 'the needling',
  needleplan: 'the needling',
  contempt: 'the contempt',
  quitgroup: 'walking out on the band',
  claimsong: 'the song',
  resentsong: 'the song',
  tell: 'the secret told',
  confrontsecret: 'the secret thrown back',
};
const DONE: Record<string, (t: string) => string> = {
  shout: t => `shouting at ${t}`,
  sarcasm: t => `the sarcasm toward ${t}`,
  dressdown: t => `tearing into ${t}`,
  dismiss: t => `letting ${t} go`,
  refuse: t => `turning ${t} down`,
  absent: t => `not being there for ${t}`,
  blame: t => `blaming ${t}`,
  confront: t => `confronting ${t}`,
  rake: t => `dragging up the old business with ${t}`,
  tell: t => `telling ${t}'s secret`,
};
// Help as the one helped says it.
const HELP: Record<string, string> = {
  visit: 'being there',
  show: 'turning up',
  rescue: 'the rescue',
  speakup: 'speaking up',
  putin: 'backing the plan',
  pitchin: 'backing the plan',
  chipin: 'putting in',
  quietgive: 'putting in',
  keep: 'keeping the promise',
  askwhat: 'asking what was wrong',
};

export function feelAct(w: World, inst: Instance, p: Person, t: Person | undefined, fam: Family, x: Expression, ev: number) {
  if (!feelingsOn() || !t || x.solo) return;
  // Meeting renews a standing resentment, either way round.
  meet(w, p, t);
  meet(w, t, p);
  const repaid = x.like > 0 && AMENDS.has(fam) && amends(w, p, t);
  if (isWrong(inst, x)) wronged(w, p, t, fam, x, ev);
  else if (!repaid && isHelp(inst, fam, x)) helped(w, p, t, x, inst, ev);
}
function meet(w: World, a: Person, b: Person) {
  const f = find(w, a.id, 'resentment', b.id);
  if (!f || !f.stands) return;
  f.v = Math.max(f.v, f.v0 * clamp(0.6 - 0.15 * facet(a, 'forgiveness', b.id), 0.3, 0.9));
}
// The one who did the wrong owes the one wronged; the one wronged resents it; the one who did it, if they value the other, feels guilty.
// Hurting someone one resents is the resentment answered: it halves, and so does the guilt.
function wronged(w: World, p: Person, t: Person, fam: Family, x: Expression, ev: number) {
  const harm = clamp(-x.like * (0.5 + x.intensity), 0, 1);
  const prone = clamp(1 - 0.2 * facet(t, 'patience', p.id) - 0.2 * facet(t, 'forgiveness', p.id) - 0.1 * facet(t, 'gentleness', p.id), 0.4, 1.6);
  feel(w, t, 'resentment', p.id, ev, clamp(1.4 * harm * prone, 0, 1), WRONG[x.id] ?? `what @${p.id} did`);
  p.owes = { to: t.id, ev, t: w.t };
  const back = find(w, p.id, 'resentment', t.id);
  if (back && back.v >= WEIGH && ['severity', 'anger', 'refusal', 'lapse', 'pride', 'disclosure', 'dishonesty'].includes(fam)) back.v *= 0.5;
  const like = peekBond(w, p.id, t.id)?.like ?? 0;
  const close = p.partner === t.id || p.friends.has(t.id) || kin(p, t);
  const value = close ? 1 : like > 0.2 ? 0.7 : 0;
  if (!value) return;
  const g = clamp(0.6 + 0.2 * facet(p, 'sincerity') + 0.2 * facet(p, 'fairness') + 0.15 * facet(p, 'altruism'), 0.2, 1.2);
  const said = (DONE[x.id] ?? ((o: string) => `what ${p.sex === 'f' ? 'she' : 'he'} did to ${o}`))(`@${t.id}`);
  feel(w, p, 'guilt', t.id, ev, clamp(1.4 * harm * value * g * (back ? 0.5 : 1), 0, 1), said);
}
// Help not owed: the one helped is grateful, and owes the helper.
function helped(w: World, p: Person, t: Person, x: Expression, inst: Instance, ev: number) {
  const cost = 0.4 + 0.6 * x.intensity;
  const v = clamp(cost * (0.6 + 0.2 * facet(t, 'altruism') + 0.2 * facet(t, 'sentimentality')), 0, 1);
  const what = HELP[x.id] ?? (inst.thing === 'the money' ? 'the money' : 'the help');
  if (feel(w, t, 'gratitude', p.id, ev, v, what)) t.owes = { to: p.id, ev, t: w.t };
}
// A kind act toward someone owed pays what is owed: gratitude repaid leaves a bond gain, guilt ends with amends made, and the other's
// resentment no longer stands.
function amends(w: World, p: Person, t: Person): boolean {
  let paid = false;
  const gr = find(w, p.id, 'gratitude', t.id);
  if (gr) {
    const b = bond(w, p.id, t.id);
    b.like = clamp(b.like + 0.1 * gr.v, -1, 1);
    b.trust = clamp(b.trust + 0.1 * gr.v, -1, 1);
    end(w, p.id, gr);
    paid = true;
  }
  const gu = find(w, p.id, 'guilt', t.id);
  if (gu) {
    end(w, p.id, gu);
    paid = true;
  }
  const r = find(w, t.id, 'resentment', p.id);
  if (r && r.stands) {
    r.stands = false;
    paid = true;
  }
  if (p.owes?.to === t.id) {
    delete p.owes;
    paid = true;
  }
  return paid;
}
const kin = (a: Person, b: Person) =>
  a.parents.includes(b.id) || b.parents.includes(a.id) || (a.parents.length > 0 && a.parents.some(x => b.parents.includes(x)));

// ---------- the month ----------
// Each feeling fades at its kind's rate; one toward someone who has died, other than grief, ends; a debt to the dead is void.
export function feelingsTick(w: World) {
  if (!feelingsOn()) return;
  const s = store(w);
  for (const [id, list] of s) {
    const p = w.byId.get(id);
    if (!p || p.status === 'dead') {
      s.delete(id);
      continue;
    }
    for (const f of list) {
      const o = w.byId.get(f.o);
      if (f.k !== 'grief' && (!o || o.status === 'dead')) {
        f.v = 0;
        continue;
      }
      f.v *= pow(0.5, 1 / halfLife(p, f));
      lasting(w, p, f);
    }
    const kept = list.filter(f => f.v >= GONE);
    if (kept.length) s.set(id, kept);
    else s.delete(id);
    if (p.owes && w.byId.get(p.owes.to)?.status === 'dead') delete p.owes;
  }
}
function halfLife(p: Person, f: Feeling): number {
  switch (f.k) {
    case 'grief':
      return f.half ?? 8;
    case 'resentment':
      return !f.stands ? 1 : f.v > 0.35 * f.v0 ? 3 : 24;
    case 'guilt':
      return f.stands ? 6 * clamp(1 + 0.3 * facet(p, 'sincerity'), 0.5, 1.6) : 1;
    case 'gratitude':
      return f.stands ? 24 : 1;
  }
}
// Left unresolved past its kind's horizon, a feeling changes the person for good: a grudge three years on is never forgiven (an
// exception toward that one person), a grief still deep after two years leaves its mark.
function lasting(w: World, p: Person, f: Feeling) {
  if (f.lasting || OFF.has('marks')) return;
  if (f.k === 'resentment' && f.stands && f.v >= 0.25 && w.t - f.t >= 36) {
    f.lasting = true;
    if (p.exceptions.length < 2 && !p.exceptions.some(x => x.other === f.o && x.key === 'forgiveness'))
      p.exceptions.push({ key: 'forgiveness', other: f.o, strength: -2.2, cause: f.ev, text: `never forgave @${f.o} for ${f.what}` });
  } else if (f.k === 'grief' && f.v >= 0.3 && w.t - f.t >= 24) {
    f.lasting = true;
    const dead = w.byId.get(f.o)?.status === 'dead';
    p.marks.push({ t: w.t, key: 'grief', delta: 0, cause: f.ev, text: `never quite the same since @${f.o} ${dead ? 'died' : 'left'}` });
  }
}

// ---------- in a decision ----------
// Which answers each kind pulls toward; every other answer it pulls against.
const PULLS: Record<Kind, Family[]> = {
  grief: ['reluctance', 'withdrawal'],
  resentment: ['severity', 'anger', 'refusal', 'lapse', 'withdrawal', 'pride', 'disclosure'],
  guilt: ['humility', 'honesty', 'generosity', 'warmth', 'duty', 'leniency', 'discretion'],
  gratitude: ['warmth', 'generosity', 'duty', 'humility', 'leniency', 'discretion', 'courage'],
};
const KNOW: Record<Kind, Know> = { grief: 'close', resentment: 'close', guilt: 'private', gratitude: 'close' };
const pron = (p: Person) => (p.sex === 'f' ? 'her' : 'him');
// The reason, with its kind and its object.
export function feelingWords(w: World, p: Person, f: Feeling): string {
  const y = year(w.events[f.ev]?.t ?? f.t);
  switch (f.k) {
    case 'grief':
      return `still grieving ${f.what} ${y}`;
    case 'resentment':
      return `still sore at @${f.o} over ${f.what} (${y})`;
    case 'guilt':
      return `guilty about ${f.what} (${y})`;
    case 'gratitude':
      return `grateful to @${f.o} for ${f.what} (${y})`;
  }
}

// The feelings a decision weighs: the strongest grief, wherever it bears; resentment, guilt and gratitude toward the one it is with.
function bearing(w: World, p: Person, t: Person | undefined): Feeling[] {
  const mine = feelingsOf(w, p.id).filter(f => f.v >= WEIGH);
  const out: Feeling[] = [];
  const g = strongest(mine.filter(f => f.k === 'grief'));
  if (g) out.push(g);
  if (t) for (const k of ['resentment', 'guilt', 'gratitude'] as Kind[]) out.push(...mine.filter(f => f.k === k && f.o === t.id));
  return out;
}
// Grief seeks out a few: the people closest are pulled toward, not away from.
function pulls(p: Person, t: Person | undefined, f: Feeling): Family[] {
  if (f.k === 'grief' && t && (p.partner === t.id || kin(p, t) || p.friends.has(t.id))) return [...PULLS.grief, 'seeking'];
  return PULLS[f.k];
}

// A feeling whose cause is the event the situation answers adds nothing in the immediate answer to it: the answer already weighs the act,
// and the line already says it. Anywhere later (the old wound, a meeting), it weighs the grudge it is about.
const IMMEDIATE = new Set(['provocation', 'row-answer', 'aftermath']);
export function withFeelings(w: World, p: Person, t: Person | undefined, options: Option[], answers: number | undefined, type: string) {
  if (!feelingsOn()) return;
  const fams = options.map(o => o.id as Family);
  let debt = false;
  for (const f of bearing(w, p, t)) {
    if (f.ev === answers && IMMEDIATE.has(type)) continue;
    const toward = pulls(p, t, f).filter(x => fams.includes(x));
    if (!toward.length || toward.length === fams.length) continue;
    if (f.k === 'gratitude' || f.k === 'guilt') debt = true;
    const label = feelingWords(w, p, f);
    add(options, toward, 'feel:' + f.k, label, 0.5 + 0.5 * f.v, KNOW[f.k], p, f.ev);
  }
  // A debt called in: with the one who owes them, the one owed is pulled toward asking.
  const owed = t && fams.includes('seeking') ? debtOf(w, t, p) : undefined;
  if (owed && fams.length > 1) add(options, ['seeking'], 'feel:owed', `@${t!.id} owed ${pron(p)} (since ${year(owed.t)})`, 0.85, 'close', p, owed.ev);
  // A debt the feeling no longer carries is still owed: called in, it weighs for the answers that pay it.
  if (!debt && t && p.owes?.to === t.id) {
    const toward = PULLS.gratitude.filter(x => fams.includes(x));
    if (toward.length && toward.length < fams.length)
      add(options, toward, 'feel:owes', `owed @${t.id} since ${year(p.owes.t)}`, 0.7, 'close', p, p.owes.ev);
  }
}
// A yes-or-no answer to `t` (the front door's invitation, invite.ts): resentment toward `t` weighs for no, gratitude and guilt for yes.
export function withFeelingsToward(w: World, p: Person, t: Person, options: Option[]) {
  if (!feelingsOn()) return;
  for (const f of feelingsOf(w, p.id))
    if (weighs(f) && f.o === t.id && f.k !== 'grief')
      add(options, [(f.k === 'resentment' ? 'no' : 'yes') as Family], 'feel:' + f.k, feelingWords(w, p, f), 0.5 + 0.5 * f.v, KNOW[f.k], p, f.ev);
}
// One consideration on every answer: as written on those it pulls toward, read the other way on the rest, so it pushes one way.
function add(options: Option[], toward: Family[], id: string, label: string, x: number, know: Know, p: Person, ref: number) {
  const up = curves.rising(0.3, 1);
  for (const o of options) {
    const pro = toward.includes(o.id as Family);
    const c: Consideration = {
      id,
      cause: () => ({ kind: 'state', label, weight: 1, who: p.id, ref }),
      input: v => v.state(p, know, x, 0.5),
      curve: pro ? up : y => up(1 - y),
      neutral: 0.5,
      know,
      who: p,
    };
    o.considerations = [...o.considerations, c];
  }
}

// A strong feeling adds its own answer where it fits: resentment a hard word where the one resented needs something of the holder,
// guilt an apology where the two meet under strain or old business. The situation's ceiling rises to the act where it would bar it.
const SEVERE = new Set(['request-answer', 'collection', 'backing', 'authorship']);
const AMEND = new Set(['strain', 'oldwound', 'reckon', 'reckon-answer', 'turneddown', 'threat']);
export function offerFeelings(w: World, inst: Instance): Instance {
  const t = inst.target;
  if (!feelingsOn() || !t) return inst;
  const p = inst.actor;
  let out = inst;
  const offer = (fam: Family, id: string) => {
    if (out.families.includes(fam)) return;
    const x = BY_FAMILY[fam].find(e => e.id === id)!;
    if ((x.needs && !x.needs.every(f => inst.features.has(f))) || x.bars?.some(f => inst.features.has(f)) || (x.onlyIf && !x.onlyIf(p))) return;
    out = {
      ...out,
      families: [...out.families, fam],
      only: { ...(out.only ?? {}), [fam]: [id] },
      ...(out.maxIntensity != null && out.maxIntensity < x.intensity ? { maxIntensity: x.intensity } : {}),
    };
  };
  const r = find(w, p.id, 'resentment', t.id);
  if (r && r.v >= OWN && SEVERE.has(inst.type) && !inst.families.includes('anger')) offer('severity', 'dressdown');
  const g = find(w, p.id, 'guilt', t.id);
  if (g && g.v >= OWN && AMEND.has(inst.type)) offer('humility', 'apologise');
  return out;
}

// ---------- the debt called in ----------
// What q owes p, if anything: a gratitude or guilt toward p that still stands, else the latest debt.
function debtOf(w: World, q: Person, p: Person): { v: number; t: number; ev: number } | undefined {
  const f = [find(w, q.id, 'gratitude', p.id), find(w, q.id, 'guilt', p.id)]
    .filter(x => x && x.stands && x.v >= WEIGH)
    .sort((a, b) => b!.v - a!.v)[0];
  if (f) return { v: f.v, t: f.t, ev: f.ev };
  if (q.owes?.to === p.id) return { v: 0.05, t: q.owes.t, ev: q.owes.ev };
  return undefined;
}
// Of the people someone in need could ask, the one who owes them most, if any.
export function debtorAmong(w: World, p: Person, pool: Person[]): Person | undefined {
  if (!feelingsOn()) return undefined;
  let best: Person | undefined,
    bv = 0;
  for (const q of pool) {
    const v = debtOf(w, q, p)?.v ?? 0;
    if (v > bv) {
      best = q;
      bv = v;
    }
  }
  return best;
}

// ---------- the meeting (round 45) ----------
// A meeting's chance a month at full intensity and an average approach: the top of the research's range (c = 0.1 to 0.25), the least
// at which a strong resentment raises one within a year in 15% of cases (meeting.md, fail-if 5).
const RAISE = 0.25;
// How readily the holder goes to the object, by kind, from facets (r ≈ .1 to .3, meeting.md): the forgiving let a grudge lie, the sincere
// make amends, the sentimental go back to thank, and the bold go.
function approach(p: Person, f: Feeling): number {
  const bold = 0.15 * facet(p, 'socialBoldness', f.o);
  const lean =
    f.k === 'resentment'
      ? -0.25 * facet(p, 'forgiveness', f.o)
      : f.k === 'guilt'
        ? 0.25 * facet(p, 'sincerity', f.o)
        : 0.25 * facet(p, 'sentimentality', f.o);
  return clamp(1 + lean + bold, 0.3, 1.7);
}
// The feeling that brings its holder to its object this month, if any. Of those strong enough, whose cause stands, toward someone in a
// place they share, each draws its chance (the intensity times the approach, times how far the holder still seeks the object out); the
// strongest that comes up goes.
export function meetingFeeling(w: World, p: Person, shares: (q: Person) => boolean): Feeling | undefined {
  if (!feelingsOn()) return undefined;
  let best: Feeling | undefined;
  for (const f of feelingsOf(w, p.id)) {
    if (f.k === 'grief' || f.v < OWN || !f.stands) continue;
    const q = w.byId.get(f.o);
    if (!q || q.status !== 'in' || !shares(q)) continue;
    if (w.rng.chance(clamp(RAISE * f.v * approach(p, f) * (f.away ?? 1), 0, 1)) && (!best || f.v > best.v)) best = f;
  }
  return best;
}
// Every answer at a meeting changes the feeling it was about: had out, it halves (and so does what a later meeting renews it to); let go,
// it no longer stands; kept away, the holder seeks the object out half as much; amends made or thanks given, it is paid (feelAct's
// amends has usually paid it already).
export function metObject(w: World, p: Person, t: Person, k: Kind, x: Expression) {
  const f = find(w, p.id, k, t.id);
  if (!f) return;
  if (x.family === 'severity') {
    f.v0 *= 0.5;
    f.v = Math.min(f.v, f.v0);
  } else if (x.family === 'leniency') f.stands = false;
  else if (x.family === 'withdrawal') f.away = (f.away ?? 1) * 0.5;
  else end(w, p.id, f);
}
// Whether q's resentment of p stands: read before an apology, which ends its standing (amends).
export const resentmentStands = (w: World, q: Person, p: Person) => !!find(w, q.id, 'resentment', p.id)?.stands;
// The one apologised to answers: forgiven, the resentment is over; refused, it stands as it did before the apology.
export function apologyAnswered(w: World, q: Person, p: Person, x: Expression, stood: boolean) {
  const r = find(w, q.id, 'resentment', p.id);
  if (!r) return;
  if (x.family === 'leniency') end(w, q.id, r);
  else r.stands = stood;
}
