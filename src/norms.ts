// The band year (round 48; notes/research/band-year.md). How things are done in a group lives only in what its members believe. Each
// member holds a belief about the group, in the store that holds beliefs about people (holder → "<subject>|norm:<what>", the group's
// subject being −1 − its id, apart from every person's), with how strongly they hold it (m) and how unsure they are (v), and it settles as
// a belief about a person does: the first things seen move it most.
//
// Two norms:
//   credit  how a bandmate's song is answered here. Above 0, a song is everyone's once it is brought in (it is cheered, backed); below,
//           credit is fought over (resented, claimed). Formed from every answer to a song the member sees in the group (group.ts `work`),
//           and weighed in every member's own answer to a song.
//   rows    how rows go here. Above 0, a repeated row is answered (a word, an asking to leave); below, it is let go. Formed from what follows
//           a member's repeated row, and weighed by the member who decides what follows the next one. A separate part: only with ON=normrows.
// A norm is weighed beside the five strongest considerations, never cut, once it is held surely enough to say (two acts of a kind, not
// one), and when it decides it is the reason, said with the group's name.
//
// A newcomer is told how things are done by one incumbent: the one most moved to say it, read from each incumbent's own state (how sure they
// are of how things go, how bold they are, how they like the newcomer). That one decides whether to say it. The newcomer holds the teller's
// version (telling.ts `normVersion`), as sure as they think well of the teller, and goes on learning from what they see. Nothing is held by
// the group itself, and nothing counts or caps tellings. On unless OFF=norms: with it off nothing here runs and no draw is taken.

import { clamp } from './rng';
import { curves, z01, type Consideration, type Option } from './decide';
import type { Feature } from './features';
import type { Family } from './families';
import { facetC, bondC, pubC, privC, ev } from './considerations';
import { decide } from './grammar';
import { normVersion } from './telling';
import {
  OFF,
  beliefsOf,
  bkey,
  facet,
  likeOf,
  peekBond,
  addEvent,
  broadcast,
  ordinal,
  P,
  type World,
  type Person,
  type Group,
  type Belief,
  type Cause,
} from './world';

export type Norm = 'credit' | 'rows';
const NORMS: Norm[] = ['credit', 'rows'];
const SEEN = 1; // the noise of one act seen, as a belief about a person takes an act seen (world.ts `observe`, reliability 0.6)
const REGROW = 0.002; // how fast certainty fades without fresh evidence, as for a trait
const SAY = 0.3; // how surely a norm must be held to be worth saying, or to be a reason: two acts of a kind, not one
const some = (c: Consideration | undefined): Consideration[] => (c ? [c] : []);

export const subjectOf = (g: Group) => -1 - g.id;
const keyOf = (what: Norm) => 'norm:' + what;
export const heldNorm = (w: World, holder: number, g: Group, what: Norm): Belief | undefined =>
  w.beliefs.get(holder)?.get(bkey(subjectOf(g), keyOf(what)));
const sure = (b: Belief | undefined) => (b ? Math.max(0, 1 - b.v) * Math.min(2, Math.abs(b.m)) : 0);

// One piece of evidence about how things go here, taken by a holder: dir above 0 for "credit is shared" or "rows are answered".
function take(w: World, holder: number, g: Group, what: Norm, dir: number, noise: number) {
  const map = beliefsOf(w, holder);
  const k = bkey(subjectOf(g), keyOf(what));
  let b = map.get(k);
  if (!b) {
    b = { m: 0, v: 1, n: 0, last: w.t, seen: 0 };
    map.set(k, b);
  }
  b.v = Math.min(1, b.v + (w.t - b.last) * REGROW);
  b.m = (noise * b.m + b.v * dir) / (b.v + noise);
  b.v = (b.v * noise) / (b.v + noise);
  b.n++;
  b.seen++;
  b.last = w.t;
}
// What the members see: every member present takes the act as evidence of how things go here.
export function seeNorm(w: World, g: Group, what: Norm, dir: number) {
  for (const i of g.members) take(w, i, g, what, dir, SEEN);
}
// The credit an answer to a song gives: cheering and backing it share it, resenting and claiming it fight over it.
export const creditOf = (expr: string): number =>
  expr === 'cheer' || expr === 'backsong' ? 1 : expr === 'resentsong' || expr === 'claimsong' ? -1 : 0;

const SAID: Record<Norm, [string, string]> = {
  credit: ["a song is everyone's once it is brought in", 'people keep an eye on who gets the credit'],
  rows: ['a row does not go unanswered', 'rows blow over'],
};
// The norm as a consideration for one answer: dir 1 weighs it for the answers it favours, −1 against. Absent unless held surely.
export function normC(w: World, p: Person, g: Group, what: Norm, dir: 1 | -1, k = 5): Consideration | undefined {
  const b = heldNorm(w, p.id, g, what);
  if (!b || sure(b) < SAY) return undefined; // a norm held too loosely to say is not weighed: nothing to go on, not a neutral
  const m = b.m;
  return {
    id: keyOf(what),
    cause: () => ({
      kind: 'belief',
      label: `in ${g.name}, ${SAID[what][m >= 0 ? 0 : 1]}`,
      weight: 1,
      key: keyOf(what),
      who: p.id,
    }),
    input: v => v.state(p, 'close', z01(m), 0.5),
    curve: dir > 0 ? curves.sCurve(k, 0.5) : curves.sFalling(k, 0.5),
    neutral: 0.5,
    know: 'close',
    who: p,
  };
}
// The credit norm for an answer to a bandmate's song, by family: the generous answers weigh it as written, the others read the other way.
export function creditBeside(w: World, p: Person, g: Group): Partial<Record<Family, Consideration[]>> | undefined {
  const up = normC(w, p, g, 'credit', 1),
    down = normC(w, p, g, 'credit', -1);
  if (!up || !down) return undefined;
  return { warmth: [up], humility: [up], pride: [down], dishonesty: [down] };
}

// How a member leans, by their own make-up, on how a norm should go: the teller's own bend (telling.ts `normVersion`).
const leanOf = (p: Person, what: Norm) =>
  what === 'credit' ? (facet(p, 'modesty') + facet(p, 'sincerity')) / 2 : -(facet(p, 'forgiveness') + facet(p, 'patience')) / 2;

// A newcomer has joined: the incumbent most moved to say how things are done here decides whether to say it.
export function tellNewcomer(w: World, g: Group, q: Person) {
  if (OFF.has('normtell')) return; // the sizing's variant: norms learned from acts alone
  let teller: Person | undefined,
    best = -Infinity;
  for (const i of g.members) {
    if (i === q.id) continue;
    const t = P(w, i);
    const held = Math.max(...NORMS.map(n => sure(heldNorm(w, i, g, n))));
    if (held <= 0) continue;
    const s = held + 0.3 * z01(facet(t, 'socialBoldness')) + 0.3 * likeOf(w, i, q.id);
    if (s > best) {
      best = s;
      teller = t;
    }
  }
  if (!teller) return;
  const says = NORMS.filter(n => sure(heldNorm(w, teller!.id, g, n)) >= SAY).sort(
    (a, b) => sure(heldNorm(w, teller!.id, g, b)) - sure(heldNorm(w, teller!.id, g, a)),
  );
  if (!says.length) return;
  const feats = new Set<Feature>(['private']);
  const held = clamp(sure(heldNorm(w, teller.id, g, says[0])), 0, 1);
  const options: Option[] = [
    {
      id: 'tell',
      label: `tell @${q.id} how things are done in ${g.name}`,
      considerations: [
        privC('normheld', `sure of how things go in ${g.name}`, held, 1, 0.2),
        facetC(teller, 'socialBoldness', feats, 1, 3),
        bondC(w, teller, q, 'like', 1),
      ],
    },
    {
      id: 'leave',
      label: `let @${q.id} find out`,
      considerations: [facetC(teller, 'socialBoldness', feats, -1, 3), bondC(w, teller, q, 'like', -1)],
    },
  ];
  const d = decide(w, teller, 'whether to tell a newcomer how things are done', options);
  if (d.chosen !== 'tell') return;
  // The newcomer takes it as surely as they think well of the teller.
  const r = peekBond(w, q.id, teller.id);
  const noise = clamp(1.2 - 0.6 * (r?.like ?? 0) - 0.3 * (r?.respect ?? 0), 0.5, 1.6);
  for (const n of says) {
    const b = heldNorm(w, teller.id, g, n)!;
    const told = normVersion(teller, b.m, leanOf(teller, n));
    take(w, q.id, g, n, told, noise);
  }
  const e = addEvent(w, {
    type: 'group:told',
    who: [teller.id, q.id],
    text: `@${teller.id} told @${q.id} how it goes in ${g.name}: ${SAID[says[0]][heldNorm(w, teller.id, g, says[0])!.m >= 0 ? 0 : 1]}.`,
    causes: d.why.slice(0, 3),
    vis: 'local',
    decision: d.rec,
    evidence: [ev(teller.id, 'socialBoldness', 1, 0.3, 0.5)],
    w: 0.7,
  });
  broadcast(w, e);
  g.events.push(e.id);
}

// What follows a member's repeated row: the one who would say it (group.ts, from state) decides whether to let it go, have a word or, after
// a warning or a third row, ask them to leave. While a word still stands it has been said: what is left is to ask them or let it go. The
// rows they have had and the norm are weighed beside who the speaker is.
export function rowAnswer(
  w: World,
  g: Group,
  speaker: Person,
  p: Person,
  rows: number,
  canAsk: boolean,
  warned: boolean,
): { step: 'row' | 'word' | 'asked'; why: Cause[]; rec: any } {
  const feats = new Set<Feature>(['standing', 'pressure']);
  const n = rows + 1;
  const count = (dir: 1 | -1) => pubC('rows', `@${p.id}'s ${ordinal(n)} row in ${g.name} in three years`, clamp((n - 1) / 3, 0, 1), dir);
  const norm = (dir: 1 | -1) => normC(w, speaker, g, 'rows', dir);
  const options: Option[] = [
    {
      id: 'row',
      label: 'let it go',
      considerations: [facetC(speaker, 'forgiveness', feats, 1, 4), bondC(w, speaker, p, 'like', 1), count(-1), ...some(norm(-1))],
    },
    ...(warned
      ? []
      : [
          {
            id: 'word',
            label: `have a word with @${p.id}`,
            considerations: [
              facetC(speaker, 'socialBoldness', feats, 1, 4),
              facetC(speaker, 'organisation', feats, 1, 3),
              count(1),
              ...some(norm(1)),
            ],
          },
        ]),
    ...(canAsk
      ? [
          {
            id: 'asked',
            label: `ask @${p.id} to leave ${g.name}`,
            considerations: [
              facetC(speaker, 'socialBoldness', feats, 1, 4),
              facetC(speaker, 'forgiveness', feats, -1, 4),
              bondC(w, speaker, p, 'like', -1),
              count(1),
              ...some(norm(1)),
            ],
          },
        ]
      : []),
  ] as Option[];
  const d = decide(w, speaker, "what to do about a bandmate's rows", options);
  return { step: d.chosen as 'row' | 'word' | 'asked', why: d.why, rec: d.rec };
}
