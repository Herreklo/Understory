// The first command (S1, #22): one person asks another to come and rehearse. The engine checks the conditions; the asked person answers
// by their own decision, and the answer is an event like any other, remembered by both. A yes goes through the engine's own forming or
// joining (group.ts). Reached only through the front door's `command`, so a world where nobody is asked is the world as it was.
// The command is its own turn: its dice come from a stream of its own, keyed by the run, the month and the two people, and the asked
// person's choice from their own (`chanceOf`), so asking changes nothing about the months after it but what the asking did.
import { clamp, stream } from './rng';
import { SETTING } from './setting';
import { z01 } from './decide';
import { decide } from './grammar';
import { pubC, privC, closeC, bondC, facetC, eventCause, ev } from './considerations';
import { pursuing } from './time';
import { form, join } from './group';
import { type World, type Person, type Event, P, age, year, addEvent, broadcast, remember, recentEvents } from './world';
import type { Feature } from './features';

type Kind = (typeof SETTING.groupKinds)[number];
const kindOf = (id: string): Kind => SETTING.groupKinds.find(k => k.id === id)!;
const plays = (p: Person, k: Kind) => k.skills.some(s => (p.skills[s]?.interest ?? 0) >= 1);
const bestSkill = (p: Person, k: Kind) => Math.max(...k.skills.map(s => p.skills[s]?.r ?? 0));
const her = (p: Person) => (p.sex === 'f' ? 'her' : 'him');

export interface Asked {
  ok: boolean;
  why: string[]; // a refusal's condition, or the reasons the answer gives
  events: Event[]; // what the asking recorded, in order: the answer, then a band started or joined
}

const refuse = (why: string): Asked => ({ ok: false, why: [why], events: [] });

/** `by` asks `to` to come and rehearse: with `by`'s band, or, if they have none, to start playing together. Nothing is written
 * unless every condition holds. */
export function invite(w: World, by: number, to: number): Asked {
  const p = w.byId.get(by),
    q = w.byId.get(to);
  if (!p || p.status !== 'in') return refuse(p ? `@${by} is not in town` : `nobody has the id ${by}`);
  if (!q || q.status !== 'in') return refuse(q ? `@${to} is not in town` : `nobody has the id ${to}`);
  if (p === q) return refuse('nobody asks themselves');
  const g = p.group != null ? w.groups[p.group] : undefined;
  const k = g ? kindOf(g.kind) : SETTING.groupKinds[0];
  if (age(w, p) < 15) return refuse(`@${by} is too young to be in a ${k.noun}`);
  if (age(w, q) < 15) return refuse(`@${to} is too young to be in a ${k.noun}`);
  if (!g && !plays(p, k)) return refuse(`@${by} plays nothing and is in no ${k.noun}: there is no rehearsal to ask anyone to`);
  if (!plays(q, k)) return refuse(`@${to} does not play`);
  if (q.group != null)
    return refuse(q.group === p.group ? `@${to} already plays in ${g!.name}` : `@${to} already plays in ${w.groups[q.group].name}`);
  if (g && g.members.length >= k.maxSize) return refuse(`there is no room in ${g.name}: there are ${g.members.length} already`);
  if (recentEvents(w, w.t).some(e => e.type === 'invite' && e.who[0] === q.id && e.who[1] === p.id))
    return refuse(`@${to} has already given @${by} an answer this month`);

  const prev = w.rng;
  w.rng = stream(w.seed, w.runSeed, 'run', 'command', 'invite', p.id, q.id, w.t);
  try {
    return answer(w, p, q, k, g);
  } finally {
    w.rng = prev;
  }
}

// The asked person's decision: whether they like the one asking, want to be heard, rate the playing (or the band), and have the time.
function answer(w: World, p: Person, q: Person, k: Kind, g: World['groups'][number] | undefined): Asked {
  const from = w.events.length;
  const feats = new Set<Feature>(['private']);
  if (q.friends.has(p.id)) feats.add('friend');
  const heard = pursuing(q, k.wantKind);
  const skill = z01((bestSkill(p, k) - 1150) / 150); // against the engine's own bar for wanting to be heard (group.ts)
  const spare = clamp(1 - (q.job ? 0.4 : 0) - 0.3 * q.stress - (q.kids.some(c => P(w, c).status === 'in' && age(w, P(w, c)) < 4) ? 0.3 : 0), 0, 1);
  const what = g ? `rehearse with ${g.name}` : 'come and play';
  const d = decide(w, q, `whether to ${what}, when @${p.id} asked`, [
    {
      id: 'yes',
      label: what,
      considerations: [
        bondC(w, q, p, 'like', 1),
        facetC(q, 'sociability', feats, 1, 3),
        privC(
          'heard',
          heard ? `had wanted to be heard since ${year(heard.since)}` : 'not looking to be heard',
          heard ? 0.9 : 0.3,
          1,
          0.2,
          undefined,
          0.3,
        ),
        pubC('playing', skill > 0.5 ? `@${p.id} can play` : `@${p.id} is no great player`, skill),
        ...(g ? [pubC('standing', g.standing > 0.5 ? `${g.name} draw a crowd` : `${g.name} are nobody yet`, clamp(0.3 + g.standing, 0, 1))] : []),
      ],
    },
    {
      id: 'no',
      label: 'turn it down',
      considerations: [
        bondC(w, q, p, 'like', -1),
        facetC(q, 'sociability', feats, -1, 3),
        closeC('time', spare > 0.5 ? 'has the evenings free' : 'has no evenings to give', 1 - spare, 1, 0.2),
      ],
    },
  ]);
  const yes = d.chosen === 'yes';
  const asked = g ? `to rehearse with ${g.name}` : 'to come and play';
  const e = addEvent(w, {
    type: 'invite',
    who: [q.id, p.id],
    text: `@${q.id} said ${yes ? 'yes' : 'no'} when @${p.id} asked ${her(q)} ${asked}.`,
    causes: d.why.slice(0, 3),
    vis: yes ? 'local' : 'private',
    decision: d.rec,
    evidence: [ev(q.id, 'sociability', yes ? 1 : -1, 0.4, 0.5)],
    w: 1,
  });
  e.knownBy.set(q.id, 'seen');
  e.knownBy.set(p.id, 'seen');
  broadcast(w, e);
  // Asked either way: to be asked is something, and the asker remembers the answer.
  remember(w, q, p, e.id, 0.05, 0.05, 0, 'asked me to play');
  if (yes) remember(w, p, q, e.id, 0.1, 0, 0.05, 'came when I asked');
  else remember(w, p, q, e.id, -0.05, 0, 0, 'turned me down');
  if (yes) {
    if (g) join(w, g, k, q, eventCause(w, e.id, 0.6), g.former.length > 0);
    else form(w, k, p, [q], eventCause(w, e.id, 0.6));
  }
  return { ok: true, why: e.causes.map(c => c.label), events: w.events.slice(from) };
}
