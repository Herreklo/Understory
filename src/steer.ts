// Steering (round 25c): a pursuit has a way, chosen by the person, and each way goes through a part of the town that changes something
// (a job, money, who they see). When a way fails, that is a decision: keep at it, try another way, aim lower, or let it go. People pursue
// goals by choosing means and switching when one is blocked (Kruglanski and others 2002), and adjust a goal that cannot be had (Wrosch
// and others 2003). A want given up comes back only changed. Switch: OFF=steer.
import { clamp } from './rng';
import { SETTING } from './setting';
import {
  OFF,
  type World,
  type Person,
  type Want,
  type Cause,
  age,
  live,
  P,
  facet,
  likeOf,
  bond,
  remember,
  addEvent,
  broadcast,
  addStress,
  year,
} from './world';
import { z01, type Option, type Consideration } from './decide';
import { decide, family, friendsOf, stateCause, eventCause, ev, facetC, privC, pubC, closeC, bondC } from './grammar';
import { regard } from './regard';
import type { Feature } from './features';
import { marry } from './life';

export const steering = () => !OFF.has('steer');
const NONE = new Set<Feature>();
const she = (p: Person) => (p.sex === 'f' ? 'she' : 'he');
const her = (p: Person) => (p.sex === 'f' ? 'her' : 'his');
type Pu = NonNullable<Want['pursuit']> & { way?: string; ways?: string[]; obstacles?: number; asked?: number };
const pu = (x: Want) => x.pursuit as Pu;

// ---------- the ways ----------
type Way = {
  id: string;
  label: string; // the option, as a person would put it
  ok: (w: World, p: Person, x: Want) => boolean;
  cs: (w: World, p: Person, x: Want) => Consideration[];
  start: (w: World, p: Person, x: Want, lbl: string) => string; // what the record says when they set out this way
};
const placeOf = (w: World, x: Want) => (x.kind === 'attain' && x.target !== 'work' ? w.placeById.get(x.target) : undefined);
const kin = (w: World, p: Person) =>
  live(w).filter(q => q !== p && age(w, q) >= 18 && (p.parents.includes(q.id) || q.parents.some(k => p.parents.includes(k))));
const kinWhoCould = (w: World, p: Person, x: Want) =>
  kin(w, p)
    .filter(q => q.savings > Math.max(8, 0.6 * costOf(x)))
    .sort((a, b) => likeOf(w, p.id, b.id) - likeOf(w, p.id, a.id))[0];
export const costOf = (x: Want) => (x.kind === 'escape' ? SETTING.moveCost : (SETTING.goods.find(g => g.id === x.target)?.cost ?? 20));
const workingFriend = (w: World, p: Person) => friendsOf(w, p).filter(q => q.job != null);
// Someone they would like to know better, with a social routine they do not share.
function companion(w: World, p: Person) {
  return live(w)
    .filter(q => q !== p && !p.friends.has(q.id) && !family(p, q) && age(w, q) >= 16 && Math.abs(age(w, q) - age(w, p)) < 20)
    .map(q => ({ q, h: q.habits.find(h => !h.broken && h.kind === 'social' && !p.habits.some(g => g.id === h.id && !g.broken)) }))
    .filter(c => c.h && likeOf(w, p.id, c.q.id) > 0.05)
    .sort((a, b) => likeOf(w, p.id, b.q.id) - likeOf(w, p.id, a.q.id))[0];
}

const WAYS: Record<string, Way[]> = {
  win: [
    {
      id: 'wait',
      label: 'wait for it to happen',
      ok: () => true,
      cs: (w, p) => [facetC(p, 'patience', NONE, 1, 3), facetC(p, 'socialBoldness', NONE, -1, 3)],
      start: (w, p, x) => `@${p.id} has started hoping @${x.target} will ask.`,
    },
    {
      id: 'propose',
      label: 'ask',
      ok: (w, p, x) => p.partner === +x.target && p.pstat === 'dating',
      cs: (w, p, x) => [facetC(p, 'socialBoldness', NONE, 1, 4), facetC(p, 'love:anxiety', NONE, -1, 3), bondC(w, p, P(w, +x.target), 'trust', 1)],
      start: (w, p, x) => `@${p.id} has decided to ask @${x.target} to marry ${p.sex === 'f' ? 'her' : 'him'}.`,
    },
  ],
  post: [
    {
      id: 'work',
      label: 'work for it',
      ok: () => true,
      cs: (w, p) => [facetC(p, 'diligence', NONE, 1, 4), facetC(p, 'modesty', NONE, 1, 3)],
      start: (w, p) => `@${p.id} quietly started working for it.`,
    },
    {
      id: 'ask',
      label: 'ask for it',
      ok: (w, p, x) => {
        const pl = placeOf(w, x);
        return !!pl && pl.lead != null && pl.lead !== p.id && P(w, pl.lead).status === 'in';
      },
      cs: (w, p, x) => {
        const lead = P(w, placeOf(w, x)!.lead!);
        return [facetC(p, 'socialBoldness', new Set<Feature>(['standing']), 1, 4), facetC(p, 'modesty', NONE, -1, 3), bondC(w, p, lead, 'trust', 1)];
      },
      start: (w, p, x) => `@${p.id} asked @${placeOf(w, x)!.lead} straight out what it would take to be ${placeOf(w, x)!.title}.`,
    },
    {
      id: 'elsewhere',
      label: 'look for a better start somewhere else',
      ok: (w, p) => p.job != null && w.places.some(pl => pl.id !== p.job && pl.lead !== p.id && !(pl as any).closed),
      cs: (w, p) => [
        facetC(p, 'sentimentality', NONE, -1, 3),
        facetC(p, 'inquisitiveness', NONE, 1, 3),
        closeC(
          'stuck',
          w.t - p.jobSince > 60 ? `${Math.round((w.t - p.jobSince) / 12)} years in the same place` : 'not long in the job',
          clamp((w.t - p.jobSince) / 120, 0, 1),
        ),
      ],
      start: (w, p) => `@${p.id} has started looking for work somewhere else.`,
    },
  ],
  work: [
    {
      id: 'wait',
      label: 'wait for something to come up',
      ok: () => true,
      cs: (w, p) => [facetC(p, 'patience', NONE, 1, 3), facetC(p, 'socialBoldness', NONE, -1, 3)],
      start: (w, p) => `@${p.id} is waiting for something to come up.`,
    },
    {
      id: 'around',
      label: 'ask around',
      ok: (w, p) => workingFriend(w, p).length > 0,
      cs: (w, p) => [facetC(p, 'sociability', NONE, 1, 4), facetC(p, 'dependence', NONE, 1, 3)],
      start: (w, p) => `@${p.id} has been asking everyone ${she(p)} knows about work.`,
    },
  ],
  money: [
    {
      id: 'save',
      label: 'save',
      ok: () => true,
      cs: (w, p) => [facetC(p, 'prudence', NONE, 1, 4), facetC(p, 'patience', NONE, 1, 3)],
      start: (w, p, x, lbl) => `@${p.id} quietly started saving ${x.kind === 'escape' ? 'to leave' : 'for ' + lbl}.`,
    },
    {
      id: 'extra',
      label: 'take on extra work',
      ok: (w, p) => p.job != null && !p.retired,
      cs: (w, p) => [
        facetC(p, 'diligence', NONE, 1, 4),
        stateC0('worn', p.stress > 0.5 ? 'already worn down' : 'has the energy for it', p.stress, -1),
      ],
      start: (w, p, x, lbl) => `@${p.id} took on extra work to pay for ${x.kind === 'escape' ? 'getting out' : lbl}.`,
    },
    {
      id: 'family',
      label: 'ask family to help',
      ok: (w, p, x) => !!kinWhoCould(w, p, x),
      cs: (w, p, x) => [facetC(p, 'dependence', NONE, 1, 4), facetC(p, 'modesty', NONE, 1, 2), bondC(w, p, kinWhoCould(w, p, x)!, 'like', 1)],
      start: (w, p, x, lbl) => `@${p.id} asked @${kinWhoCould(w, p, x)!.id} for help with ${x.kind === 'escape' ? 'the cost of leaving' : lbl}.`,
    },
  ],
  prove: [
    {
      id: 'practise',
      label: 'practise until it is good enough',
      ok: () => true,
      cs: (w, p) => [facetC(p, 'diligence', NONE, 1, 4), facetC(p, 'perfectionism', NONE, 1, 3)],
      start: (w, p, x) => `@${p.id} quietly started practising ${x.target} in earnest.`,
    },
    {
      id: 'stage',
      label: 'get up and play the open night',
      ok: (w, p, x) => (p.skills[x.target]?.r ?? 0) > 1100,
      cs: (w, p) => [facetC(p, 'socialBoldness', new Set<Feature>(['public', 'watched']), 1, 4), facetC(p, 'anxiety', NONE, -1, 3)],
      start: (w, p) => `@${p.id} put ${her(p)} name down for the open night.`,
    },
  ],
  belong: [
    {
      id: 'show',
      label: 'turn up to things',
      ok: () => true,
      cs: (w, p) => [facetC(p, 'sociability', NONE, 1, 3), facetC(p, 'socialBoldness', NONE, -1, 3)],
      start: (w, p) => `@${p.id} quietly started turning up to things.`,
    },
    {
      id: 'ask',
      label: 'ask someone along',
      ok: (w, p) => !!companion(w, p),
      cs: (w, p) => [facetC(p, 'socialBoldness', NONE, 1, 4), bondC(w, p, companion(w, p)!.q, 'like', 1)],
      start: (w, p) => `@${p.id} asked @${companion(w, p)!.q.id} if ${she(p)} could come along.`,
    },
  ],
};
function stateC0(id: string, label: string, x: number, dir: 1 | -1) {
  return closeC(id, label, x, dir, 0.25);
}
export const waysFor = (w: World, x: Want): Way[] =>
  x.kind === 'win'
    ? everyone()
      ? WAYS.win
      : []
    : x.kind === 'attain'
      ? x.target === 'work'
        ? WAYS.work
        : placeOf(w, x)
          ? WAYS.post
          : []
      : x.kind === 'acquire' || x.kind === 'escape'
        ? WAYS.money
        : (WAYS[x.kind] ?? []);
export const hasWays = (w: World, x: Want) => steering() && waysFor(w, x).length > 1;

// The person chooses how. `not` are ways already tried; `why` is what sent them looking for another.
export function chooseWay(w: World, p: Person, x: Want, lbl: string, not: string[] = [], why?: Cause): { way: Way; d: any } | null {
  const ways = waysFor(w, x).filter(y => !not.includes(y.id) && y.ok(w, p, x));
  if (!ways.length) return null;
  if (ways.length === 1 && !not.length) return { way: ways[0], d: null };
  const opts: Option[] = ways.map(y => ({ id: y.id, label: y.label, considerations: y.cs(w, p, x) }));
  if (opts.length === 1) return { way: ways[0], d: null };
  const d = decide(w, p, 'how to go about it: ' + lbl, opts);
  void why;
  return { way: ways.find(y => y.id === d.chosen)!, d };
}

// Setting out on a way: what it starts, and what the record says.
export function setOut(w: World, p: Person, x: Want, way: Way, lbl: string, why: Cause[], rec: any, again?: Cause) {
  const u = pu(x);
  u.way = way.id;
  u.ways = [...(u.ways ?? []), way.id];
  u.asked = undefined;
  const e = addEvent(w, {
    type: again ? 'otherway' : 'pursuit',
    who: [p.id],
    text: again
      ? way
          .start(w, p, x, lbl)
          .replace(/ quietly /, ' ')
          .replace(/^@(\d+) /, `Instead, @$1 `)
      : way.start(w, p, x, lbl),
    causes: [
      ...(again ? [again] : [{ kind: 'want', label: `wants ${lbl} (since ${year(x.since)})`, weight: 0.5, key: x.kind, who: p.id } as Cause]),
      ...why.filter(c => !again || c.label !== again.label).slice(0, 2),
    ],
    vis: way.id === 'save' || way.id === 'practise' || way.id === 'work' || way.id === 'wait' || way.id === 'show' ? 'private' : 'local',
    ...(rec ? { decision: rec } : {}),
    evidence: [ev(p.id, 'want:' + x.kind, 1, 1, 0.75)],
    w: again ? 1.2 : 1.1,
  });
  broadcast(w, e);
  begin(w, p, x, way, e.id);
  return e;
}

// What a way does at once.
function begin(w: World, p: Person, x: Want, way: Way, ref: number) {
  const u = pu(x);
  if (way.id === 'extra') {
    const h = p.habits.find(h => !h.broken && h.kind === 'social');
    if (h) {
      h.broken = w.t;
      h.breakWhy = 'no time for it, with the extra work';
      h.breakCause = ref;
    }
  }
  if (way.id === 'ask' && x.kind === 'attain') u.asked = w.t + 1; // the answer comes next month
  if (way.id === 'family') u.asked = w.t + 1;
  if (way.id === 'ask' && x.kind === 'belong') u.asked = w.t + 1;
  if (way.id === 'propose') u.asked = w.t + 2;
}

// Each month, for a pursuit with a way: answers, and what the way adds. Returns an obstacle, if one came up.
export function wayTick(w: World, p: Person, x: Want): { what: string; ref: number } | null {
  const u = pu(x);
  if (!u.way) return null;
  if (u.way === 'extra') addStress(p, 'extra', 'working all hours', 0.01);
  if (u.asked == null || w.t < u.asked) return null;
  u.asked = undefined;
  if (u.way === 'ask' && x.kind === 'attain') return askForPost(w, p, x);
  if (u.way === 'family') return askFamily(w, p, x);
  if (u.way === 'ask' && x.kind === 'belong') return askAlong(w, p, x);
  if (u.way === 'propose') return propose(w, p, x);
  return null;
}
// Extra money a month from extra work.
export const extraPay = (p: Person) => {
  const x = p.wants.find(y => !y.done && y.pursuit && !y.pursuit.owner && (y.pursuit as Pu).way === 'extra');
  return x && p.job ? 0.5 * (x.pursuit as Pu).effort + 0.2 : 0;
};

function askForPost(w: World, p: Person, x: Want) {
  const pl = placeOf(w, x)!;
  if (pl.lead == null || P(w, pl.lead).status !== 'in') return null;
  const lead = P(w, pl.lead);
  const d = decide(w, lead, `whether @${p.id} should be ${pl.title} one day`, [
    {
      id: 'yes',
      label: `tell @${p.id} it could be theirs`,
      considerations: [
        privC(
          'regard',
          regard(w, lead.id, p.id) > 0.2 ? `thinks well of @${p.id}` : `is not sure of @${p.id}`,
          clamp(0.5 + regard(w, lead.id, p.id), 0, 1),
          1,
          0.2,
        ),
        pubC('record', p.perf > 0.3 ? 'a strong record' : p.perf < -0.3 ? 'a poor record' : 'a fair record', clamp(0.5 + p.perf / 2, 0, 1), 1, 0.2),
      ],
    },
    {
      id: 'no',
      label: 'tell them not yet',
      considerations: [facetC(lead, 'sincerity', NONE, 1, 3), facetC(lead, 'gentleness', NONE, -1, 3)],
    },
  ]);
  const yes = d.chosen === 'yes';
  const e = addEvent(w, {
    type: yes ? 'backed' : 'notyet',
    who: [lead.id, p.id],
    text: yes
      ? `@${lead.id} told @${p.id} the ${pl.title}'s job would be ${p.sex === 'f' ? 'hers' : 'his'} to win when it came up.`
      : `@${lead.id} told @${p.id} not yet: ${she(p)} was not ready to be ${pl.title}.`,
    causes: d.why.slice(0, 2),
    vis: 'local',
    decision: d.rec,
    evidence: [],
    w: 1.2,
  });
  broadcast(w, e);
  if (yes) {
    (p as any).backedFor = { place: pl.id, by: lead.id, t: w.t, ev: e.id };
    remember(w, p, lead, e.id, 0.15, 0.1, 0.15, 'backed me for the job');
    return null;
  }
  remember(w, p, lead, e.id, -0.05, 0, -0.05, 'told me I was not ready');
  return { what: `@${lead.id} said not yet`, ref: e.id };
}
// The backing counts when the post comes up (life.ts promote).
export function backing(w: World, s: Person, place: string): number {
  if (!steering()) return 0;
  const b = (s as any).backedFor;
  return b && b.place === place && w.t - b.t < 96 ? 0.5 : 0;
}

function askFamily(w: World, p: Person, x: Want) {
  const q = kinWhoCould(w, p, x);
  if (!q) return { what: 'nobody in the family could help', ref: w.events.length - 1 };
  const amount = Math.min(0.5 * costOf(x), 0.4 * q.savings);
  const d = decide(w, q, `whether to help @${p.id}`, [
    {
      id: 'give',
      label: `help @${p.id}`,
      considerations: [
        bondC(w, q, p, 'like', 1),
        facetC(q, 'altruism', NONE, 1, 3),
        closeC('means', 'can afford it', clamp(q.savings / 60, 0, 1), 1, 0.2),
      ],
    },
    {
      id: 'keep',
      label: 'keep it',
      considerations: [facetC(q, 'greedAvoidance', NONE, -1, 3), facetC(q, 'prudence', NONE, 1, 3), bondC(w, q, p, 'trust', -1)],
    },
  ]);
  const yes = d.chosen === 'give';
  const e = addEvent(w, {
    type: yes ? 'helped' : 'refusedhelp',
    who: [q.id, p.id],
    text: yes
      ? `@${q.id} gave @${p.id} money toward ${x.kind === 'escape' ? 'getting out' : labelOf(w, p, x)}.`
      : `@${q.id} would not help @${p.id} with the money.`,
    causes: d.why.slice(0, 2),
    vis: 'private',
    decision: d.rec,
    evidence: [ev(q.id, 'altruism', yes ? 1 : -1, 0.6, 0.6)],
    w: 1.2,
  });
  e.knownBy.set(p.id, 'seen');
  broadcast(w, e);
  if (yes) {
    q.savings -= amount;
    p.savings += amount;
    remember(w, p, q, e.id, 0.15, 0.05, 0.2, 'helped me when I asked');
    return null;
  }
  remember(w, p, q, e.id, -0.15, -0.05, -0.15, 'would not help when I asked');
  return { what: `@${q.id} would not help`, ref: e.id };
}

function askAlong(w: World, p: Person, x: Want) {
  const c = companion(w, p);
  if (!c) return { what: 'nobody to ask', ref: w.events.length - 1 };
  const { q, h } = c;
  const tpl = SETTING.habits.find(t => t.id === h!.id)!;
  const d = decide(w, q, `whether @${p.id} can come along`, [
    { id: 'yes', label: 'bring them along', considerations: [bondC(w, q, p, 'like', 1), facetC(q, 'sociability', NONE, 1, 3)] },
    { id: 'no', label: 'put them off', considerations: [bondC(w, q, p, 'like', -1), facetC(q, 'sociability', NONE, -1, 3)] },
  ]);
  const yes = d.chosen === 'yes';
  const what = tpl.label.replace(/^is /, '').replace(/\btheir\b/g, her(q));
  const e = addEvent(w, {
    type: yes ? 'broughtalong' : 'putoff',
    who: [q.id, p.id],
    text: yes ? `@${q.id} took @${p.id} along: ${what}.` : `@${q.id} put @${p.id} off.`,
    causes: d.why.slice(0, 2),
    vis: yes ? 'local' : 'private',
    decision: d.rec,
    evidence: [],
    w: 1,
  });
  e.knownBy.set(p.id, 'seen');
  broadcast(w, e);
  if (!yes) return { what: `@${q.id} put ${p.sex === 'f' ? 'her' : 'him'} off`, ref: e.id };
  for (const [a, b] of [
    [p, q],
    [q, p],
  ] as const) {
    const r = bond(w, a.id, b.id);
    r.fam = Math.min(1, r.fam + 0.1);
    r.touched = w.t;
  }
  (p as any).joinHabit = { id: h!.id, from: `went along with @${q.id}`, ref: e.id };
  return null;
}

// ---------- an obstacle ----------
// When a way fails or stalls: keep at it, another way, aim lower, or let it go. Returns what was chosen.
export function obstacle(w: World, p: Person, x: Want, lbl: string, what: string, ref: number | undefined, years: number, progress: number): string {
  const u = pu(x);
  u.obstacles = (u.obstacles ?? 0) + 1;
  const tried = u.ways ?? [waysFor(w, x)[0]?.id]; // a pursuit begun before it had a way (a contender for a post) is on the first one
  const others = waysFor(w, x).filter(y => !tried.includes(y.id) && y.ok(w, p, x));
  const lower = lowerOf(w, p, x);
  const hit: Cause = ref != null && ref >= 0 && ref < w.events.length ? eventCause(w, ref, 0.6) : stateCause(what, 0.6);
  const opts: Option[] = [
    {
      id: 'push',
      label: 'keep at it the same way',
      considerations: [
        facetC(p, 'diligence', NONE, 1, 4),
        pubC('invested', `${Math.max(1, Math.round(years))} years in`, clamp(years / 5, 0, 1)),
        privC('close', progress > 0.6 ? 'so close' : 'a long way off', progress, 1, 0.2, undefined, 0.45),
      ],
    },
    ...(others.length
      ? [
          {
            id: 'other',
            label: 'try another way',
            considerations: [
              facetC(p, 'flexibility', NONE, 1, 3),
              facetC(p, 'creativity', NONE, 1, 3),
              privC('blocked', 'this way was not working', 0.7, 1, 0.2, undefined, 0.4),
            ],
          },
        ]
      : []),
    ...(lower
      ? [
          {
            id: 'lower',
            label: `settle for ${lower.label}`,
            considerations: [
              facetC(p, 'modesty', NONE, 1, 3),
              facetC(p, 'prudence', NONE, 1, 3),
              privC('urgency', x.urgency > 0.5 ? 'wants it badly' : 'does not want it badly', x.urgency, -1, 0.2, undefined, 0.4),
            ],
          },
        ]
      : []),
    {
      id: 'giveup',
      label: 'let it go',
      considerations: [
        facetC(p, 'anxiety', NONE, 1, 3),
        closeC('worn', p.stress > 0.5 ? 'worn down' : 'not worn down', p.stress, 1, 0.25),
        privC(
          'gaveup',
          p.tried['gaveup'] ? 'has given up before' : 'has never given up on anything',
          p.tried['gaveup'] ? 0.75 : 0.3,
          1,
          0.2,
          undefined,
          0.3,
        ),
      ],
    },
  ];
  const d = decide(w, p, 'whether to go on: ' + lbl, opts);
  if (d.chosen === 'other') {
    u.ways = tried;
    const c = chooseWay(w, p, x, lbl, tried, hit);
    if (c) setOut(w, p, x, c.way, lbl, d.why, c.d?.rec ?? d.rec, { ...hit, label: hit.label });
    u.setbacks = 0;
    u.lastGain = w.t;
  } else if (d.chosen === 'lower') {
    const e = addEvent(w, {
      type: 'aimlower',
      who: [p.id],
      text: `@${p.id} set ${her(p)} sights lower: ${lower!.label} instead of ${lbl.replace(/^to /, '')}.`,
      causes: [hit, ...d.why.slice(0, 2)],
      vis: u.visible ? 'local' : 'private',
      decision: d.rec,
      evidence: [ev(p.id, 'modesty', 1, 0.4, 0.5)],
      w: 1.2,
    });
    broadcast(w, e);
    x.done = 'abandoned';
    x.doneAt = e.id;
    (x as any).at = snapshot(w, p);
    p.wants.push({
      ...lower!.want,
      since: w.t,
      cause: e.id,
      pursuit: { ...u, progress: clamp(p.savings / costOf(lower!.want as Want), 0, 1), setbacks: 0, lastGain: w.t },
    } as Want);
  } else if (d.chosen === 'push') {
    u.setbacks = 0;
    u.lastGain = w.t;
    if (ref != null) {
      const e = addEvent(w, {
        type: 'pushon',
        who: [p.id],
        text: `@${p.id} would not let it go: ${lbl}.`,
        causes: [hit, ...d.why.slice(0, 2)],
        vis: u.visible ? 'local' : 'private',
        decision: d.rec,
        evidence: [ev(p.id, 'diligence', 1, 0.8, 0.7)],
        w: 1,
      });
      broadcast(w, e);
    }
  }
  (x as any).obstacleRec = d;
  return d.chosen;
}
function lowerOf(w: World, p: Person, x: Want): { label: string; want: Partial<Want> } | null {
  if (x.kind === 'acquire') {
    const cur = SETTING.goods.find(g => g.id === x.target);
    const g = SETTING.goods
      .filter(
        g =>
          cur &&
          g.cost < cur.cost * 0.75 &&
          !p.attachments.some(a => a.key === g.id) &&
          !p.wants.some(y => !y.done && y.kind === 'acquire' && y.target === g.id),
      )
      .sort((a, b) => b.cost - a.cost)[0];
    return g
      ? { label: g.label.replace(/\btheir\b/, her(p)), want: { kind: 'acquire', target: g.id, value: g.value, urgency: x.urgency * 0.8 } }
      : null;
  }
  if (x.kind === 'escape') {
    const g = SETTING.goods.find(g => g.id === 'trip');
    return g && !p.wants.some(y => !y.done && y.kind === 'acquire' && y.target === 'trip')
      ? { label: g.label.replace(/\btheir\b/, her(p)), want: { kind: 'acquire', target: 'trip', value: x.value, urgency: x.urgency * 0.8 } }
      : null;
  }
  return null;
}
const labelOf = (w: World, p: Person, x: Want) =>
  x.kind === 'acquire' ? (SETTING.goods.find(g => g.id === x.target)?.label ?? x.target).replace(/\btheir\b/, her(p)) : 'it';

// ---------- coming back to a want ----------
const snapshot = (w: World, p: Person) => ({ t: w.t, job: p.job, partner: p.partner, savings: p.savings });
export function markGivenUp(w: World, p: Person, x: Want) {
  if (steering()) (x as any).at = snapshot(w, p);
}
// A want given up comes back only after three years, and only once something it depends on has changed; the change is its reason.
export function mayComeBack(w: World, p: Person, kind: string, target: string): { ok: boolean; why?: string } {
  if (!steering()) return { ok: true };
  const old = p.wants
    .filter(y => y.kind === kind && y.target === target && y.done === 'abandoned' && (y as any).at)
    .sort((a, b) => (b as any).at.t - (a as any).at.t)[0];
  if (!old) return { ok: true };
  const at = (old as any).at;
  if (w.t - at.t < 36) return { ok: false };
  if (p.job !== at.job) return { ok: true, why: p.job ? `now working at ${w.placeById.get(p.job)?.name ?? 'a new place'}` : 'out of work now' };
  if (p.partner !== at.partner) return { ok: true, why: p.partner != null ? `with @${p.partner} now` : `on ${her(p)} own now` };
  if (p.savings - at.savings >= 8) return { ok: true, why: 'better off than before' };
  return { ok: false };
}

// The pursuit of someone who has put their name down for the open night.
export const onStage = (p: Person): Want | undefined =>
  steering() ? p.wants.find(x => !x.done && x.kind === 'prove' && x.pursuit && !x.pursuit.owner && (x.pursuit as Pu).way === 'stage') : undefined;

// ---------- everyone wants something (round 25d) ----------
export const everyone = () => steering() && !OFF.has('everyone');
function propose(w: World, p: Person, x: Want) {
  const q = P(w, +x.target);
  if (p.partner !== q.id || p.pstat !== 'dating' || q.status !== 'in') return null;
  const d = decide(w, q, `whether to marry @${p.id}`, [
    {
      id: 'yes',
      label: 'say yes',
      considerations: [
        bondC(w, q, p, 'like', 1),
        bondC(w, q, p, 'trust', 1),
        closeC('time', w.t - q.psince > 24 ? 'they have been together a while' : 'it is early days', clamp((w.t - q.psince) / 48, 0, 1)),
      ],
    },
    {
      id: 'no',
      label: 'say not yet',
      considerations: [
        facetC(q, 'love:avoidance', NONE, 1, 4),
        privC(
          'free',
          'not ready to settle',
          clamp(0.5 + 0.5 * (q.values.freedom ?? 0) - 0.3 * (q.values.lovedOnes ?? 0), 0, 1),
          1,
          0.2,
          undefined,
          0.4,
        ),
      ],
    },
  ]);
  if (d.chosen === 'yes') {
    const e0 = addEvent(w, {
      type: 'proposed',
      who: [p.id, q.id],
      text: `@${p.id} asked @${q.id} to marry ${p.sex === 'f' ? 'her' : 'him'}, and @${q.id} said yes.`,
      causes: d.why.slice(0, 2),
      vis: 'local',
      decision: d.rec,
      evidence: [ev(p.id, 'socialBoldness', 1, 0.5, 0.5)],
      w: 1.4,
    });
    broadcast(w, e0);
    marry(w, p, q, [eventCause(w, e0.id, 0.8)]);
    return null;
  }
  const e = addEvent(w, {
    type: 'notready',
    who: [q.id, p.id],
    text: `@${p.id} asked @${q.id} to marry ${p.sex === 'f' ? 'her' : 'him'}, and @${q.id} said not yet.`,
    causes: d.why.slice(0, 2),
    vis: 'local',
    decision: d.rec,
    evidence: [ev(q.id, 'love:avoidance', 1, 0.6, 0.6)],
    w: 1.4,
  });
  broadcast(w, e);
  remember(w, p, q, e.id, -0.05, 0, -0.05, 'said not yet');
  return { what: `@${q.id} said not yet`, ref: e.id };
}
// The door each core value opens, if the town has it open to this person: the want it gives (kind, target), or nothing.
type Door = (w: World, p: Person) => [string, string] | null;
const own = (p: Person, g: string) => p.attachments.some(a => a.key === g);
const affordable = (p: Person, g: string) => {
  const c = SETTING.goods.find(x => x.id === g)?.cost ?? 20;
  return !own(p, g) && p.savings <= c * 0.5 && p.savings >= -6;
};
const post: Door = (w, p) => (p.job && !p.lead && w.t - p.jobSince > 12 ? ['attain', p.job] : null);
const work: Door = (w, p) => (!p.job && !p.retired && !p.student ? ['attain', 'work'] : null);
const goods =
  (g: string): Door =>
  (w, p) =>
    affordable(p, g) ? ['acquire', g] : null;
const DOORS: Record<string, Door[]> = {
  success: [post, work],
  status: [goods('car'), post],
  security: [(w, p) => (age(w, p) >= 22 ? goods('house')(w, p) : null), work],
  freedom: [goods('boat'), goods('trip')],
  thrill: [goods('trip')],
  pleasure: [
    (w, p) => {
      const h = SETTING.hobbies.find(h => (p.skills[h]?.interest ?? 0) >= 1 && (p.skills[h]?.r ?? 0) > 1000);
      return h && age(w, p) < 60 ? ['prove', h] : null;
    },
  ],
  fittingIn: [(w, p) => (p.friends.size < 2 ? ['belong', 'people'] : null)],
  lovedOnes: [
    (w, p) => (p.pstat === 'dating' && p.partner != null ? ['win', String(p.partner)] : null),
    (w, p) => (p.partner != null ? goods('house')(w, p) : null),
  ],
  tradition: [
    (w, p) => (p.pstat === 'dating' && p.partner != null ? ['win', String(p.partner)] : null),
    (w, p) => (age(w, p) >= 22 ? goods('house')(w, p) : null),
  ],
  fairness: [],
};
// Once a year, an adult with no want of their own takes one from what they value most, through the first door open to them.
export function wantFromValues(w: World, p: Person, add: (kind: string, target: string, value: string, urgency: number) => void) {
  if (!everyone() || (w.t + p.id) % 12 !== 0) return;
  const a = age(w, p);
  if (a < 18 || a >= 65 || p.retired) return;
  if (p.wants.some(x => !x.done && !x.pursuit?.owner)) return;
  for (const v of p.coreValues) {
    for (const door of DOORS[v] ?? []) {
      const d = door(w, p);
      if (!d) continue;
      const before = p.wants.length;
      add(d[0], d[1], v, clamp(0.3 + 0.4 * z01(p.values[v] ?? 0), 0.2, 0.9));
      if (p.wants.length > before) return;
    }
  }
}
