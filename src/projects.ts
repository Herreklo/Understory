// Plans that need other people: ventures (a café in the old bank) and causes (a summer festival on the quay).
//
// A person with the drive and the values for it starts a plan and says so. A plan needs things only other people have: their money or
// their hands, the council's say-so, and the patience of whoever it threatens. So the owner asks people, one at a time; each answer is a
// decision with reasons (the bond, their generosity, whether they believe in the owner, what they can spare). Those whose trade it
// threatens may try to stop it, openly or in a word to the council, and that can turn into a rivalry. The council decides. A venture
// that opens is a new place in town, with jobs; a festival is one night that goes well or goes badly depending on who turned up. A plan
// can fail: the money never comes, the council says no, the helpers let it down. People's goals are pursued inside their networks, and
// others help or hinder (Little 1983 on personal projects; Fitzsimons, Finkel and vanDellen 2015 on transactive goal dynamics).
// Kinds are setting content (SETTING.projects); this module knows only the shape of a plan.
import { clamp } from './rng';
import { SETTING } from './setting';
import {
  OFF,
  type World,
  type Person,
  type Event,
  age,
  live,
  P,
  facet,
  likeOf,
  remember,
  addEvent,
  broadcast,
  addEmotion,
  addStress,
  year,
  bond,
} from './world';
import { around, hoodOf, hoods, jobSet, moved, near, placeOf, staffOf } from './scale';
import { run, decide, traitCause, stateCause, eventCause, ev, facetC, bondC, pubC, privC, family, favour } from './grammar';
import { z01 } from './decide';
import { regard } from './regard';
import { startRivalry } from './drama';
import type { Feature } from './features';

export interface ProjectKind {
  id: string;
  kind: 'venture' | 'cause';
  label: string;
  short: string;
  values: string[];
  facets: Record<string, number>;
  skill?: string;
  money: number;
  helpers: number;
  permission: boolean;
  months: [number, number];
  threatens?: string;
  yearly?: boolean;
  place?: { name: string; role: string; title: string; skill: string; cap: number; pay: number; people: number };
}
export interface Project {
  id: number;
  kind: string;
  owner: number;
  since: number;
  due: number;
  first: number;
  status: 'gathering' | 'done' | 'failed' | 'dropped';
  money: number;
  helpers: number[];
  asked: number[];
  opponents: number[];
  council?: 'yes' | 'no';
  events: number[];
  ended?: number;
  place?: string;
}
export const projects = (w: World) => ((w as any).projects ??= []) as Project[];
const KINDS = () => ((SETTING as any).projects ?? []) as ProjectKind[];
const kindOf = (pr: Project) => KINDS().find(k => k.id === pr.kind)!;
const on = () => !OFF.has('projects');
const she = (p: Person) => (p.sex === 'f' ? 'she' : 'he');
const her = (p: Person) => (p.sex === 'f' ? 'her' : 'his');
const active = (w: World) => projects(w).filter(pr => pr.status === 'gathering');
export const projectOf = (w: World, p: Person) => active(w).find(pr => pr.owner === p.id);
// A workplace's own plan, for when the boss asks staff what they think: the same plan for two years at a time.
export const placePlan = (w: World, pl: any): string | undefined => {
  const ps = pl.plans as string[] | undefined;
  if (!ps?.length) return undefined;
  const i = (Math.floor(w.t / 24) + pl.id.length) % ps.length;
  return `the plan ${ps[i]}`;
};
export const projectLabel = (w: World, p: Person) => {
  const pr = projectOf(w, p);
  return pr ? `${her(p)} plan ${kindOf(pr).label}` : undefined;
};

// How much a kind of plan draws this person: their values, the facets it needs, and the skill if it has one.
function fit(p: Person, k: ProjectKind) {
  let z = 0;
  for (const v of k.values) z += 0.6 * z01(p.values[v] ?? 0) - 0.3;
  for (const f in k.facets) z += k.facets[f] * facet(p, f);
  if (k.skill) z += ((p.skills[k.skill]?.r ?? 1000) - 1150) / 250 + 0.4 * (p.skills[k.skill]?.interest ?? 0);
  return z;
}

function start(w: World, p: Person, k: ProjectKind) {
  const meant = OFF.has('turneddown') ? undefined : p.wants.find(x => !x.done && (x as any).again && x.target === k.id);
  const d = decide(w, p, `whether to go ahead: ${k.short}`, [
    {
      id: 'go',
      label: `start ${k.short}`,
      considerations: [
        privC('drive', p.drive > 0.3 ? 'the kind who makes things happen' : 'not one to start things', z01(p.drive * 1.2), 1, 0.2, undefined, 0.35),
        ...(meant ? [privC('meant', `had meant to bring ${k.short} back since ${year(meant.since)}`, 0.9, 1, 0.2, meant.cause, 0.5)] : []),
        facetC(p, 'socialBoldness', new Set<Feature>(['public', 'standing']), 1, 4),
        ...(k.kind === 'venture'
          ? [
              privC(
                'money',
                p.savings > k.money * 0.4 ? 'has some money put by' : 'has nothing put by',
                clamp(p.savings / k.money, 0, 1),
                1,
                0.2,
                undefined,
                0.3,
              ),
            ]
          : []),
      ],
    },
    {
      id: 'wish',
      label: 'keep it a daydream',
      considerations: [
        facetC(p, 'prudence', new Set<Feature>(['money']), 1, 4),
        facetC(p, 'anxiety', new Set<Feature>(['public']), 1, 3),
        privC(
          'gaveup',
          p.tried['gaveup'] ? `gave up on something before (${year(p.tried['gaveup'].t)})` : 'never tried and failed',
          p.tried['gaveup'] ? 0.8 : 0.35,
          1,
          0.2,
          undefined,
          0.35,
        ),
      ],
    },
  ]);
  if (meant) {
    meant.done = d.chosen === 'go' ? 'achieved' : 'abandoned';
    if (d.chosen === 'go') meant.doneAt = w.events.length; // the plan, written next
  }
  if (d.chosen !== 'go') return;
  const e = addEvent(w, {
    type: 'plan',
    who: [p.id],
    text: `@${p.id} has started telling people ${she(p)} means ${k.label}.`,
    causes: d.why.slice(0, 3),
    vis: 'local',
    decision: d.rec,
    evidence: [ev(p.id, 'socialBoldness', 1, 0.5, 0.5), ...k.values.slice(0, 1).map(v => ev(p.id, 'value:' + v, 1, 0.6, 0.6))],
    w: 1.3,
  });
  broadcast(w, e);
  const due = w.t + k.months[0] + w.rng.int(0, k.months[1] - k.months[0]);
  projects(w).push({
    id: projects(w).length,
    kind: k.id,
    owner: p.id,
    since: w.t,
    due,
    first: e.id,
    status: 'gathering',
    money: k.kind === 'venture' ? Math.min(p.savings, k.money * 0.6) : 0,
    helpers: [],
    asked: [],
    opponents: [],
    events: [e.id],
  });
  p.wants.push({ kind: 'project', target: k.id, value: k.values[0], since: w.t, urgency: 0.7 } as any);
}

// The owner asks someone for their money or their hands. The answer is the other person's decision.
function ask(w: World, pr: Project, p: Person, q: Person) {
  const k = kindOf(pr);
  pr.asked.push(q.id);
  const money = k.kind === 'venture' && pr.money < k.money;
  const spare = money ? clamp(q.savings / 12, 0, 1) : clamp(1 - (q.job ? 0.4 : 0) - 0.3 * q.stress, 0, 1);
  const feats = new Set<Feature>(money ? ['money', 'private'] : ['need', 'private']);
  if (q.friends.has(p.id)) feats.add('friend');
  if (family(p, q)) feats.add('family');
  const o = run(w, {
    type: 'backing',
    actor: q,
    target: p,
    others: [],
    thing: k.short,
    features: feats,
    families: ['generosity', 'refusal'],
    only: { generosity: [money ? 'putin' : 'pitchin'], refusal: [money ? 'notthemoney' : 'notthetime'] },
    cause: pr.first,
    causeLabel: `@${p.id} asked for help with ${k.short}`,
    w: 1,
    extra: [],
    familyExtra: {
      generosity: [
        bondC(w, q, p, 'like', 1),
        pubC(
          'believe',
          regard(w, q.id, p.id) > 0.2 ? `believes @${p.id} can do it` : `doubts @${p.id} can pull it off`,
          clamp(0.5 + regard(w, q.id, p.id), 0, 1),
          1,
          0.2,
        ),
        privC(
          'spare',
          money ? (spare > 0.5 ? 'has money put by' : 'has little to spare') : spare > 0.5 ? 'has the time' : 'has no time to give',
          spare,
          1,
          0.2,
          undefined,
          0.5,
        ),
      ],
      refusal: [facetC(q, 'prudence', feats, 1, 3)],
    },
  });
  if (!o) return;
  pr.events.push(o.event.id);
  if (o.family === 'generosity') {
    if (money) {
      const amt = Math.max(1, Math.min(q.savings * 0.3, k.money * 0.25));
      q.savings -= amt;
      pr.money += amt;
      (pr as any).backers = [...((pr as any).backers ?? []), q.id];
    } else pr.helpers.push(q.id);
  }
}

// The workplace a plan threatens: that kind of place in the owner's own neighbourhood (a town has one of each).
function threatOf(w: World, p: Person, k: { threatens?: string }): string {
  return (placeOf(w, k.threatens!, hoodOf(w, p)) ?? w.placeById.get(k.threatens!))?.id ?? k.threatens!;
}
// Whoever the plan threatens decides whether to fight it: openly, by a word to the council, or not at all.
function threatened(w: World, pr: Project, opp: Person, p: Person) {
  const k = kindOf(pr);
  pr.opponents.push(opp.id);
  const council = councilLead(w);
  const feats = new Set<Feature>(['standing', 'money', 'public']);
  const o = run(w, {
    type: 'threat',
    actor: opp,
    target: p,
    others: [],
    thing: `${k.short}|${council && council !== opp ? '@' + council.id : 'people'}`,
    features: feats,
    families: council && council !== opp ? ['anger', 'dishonesty', 'leniency'] : ['anger', 'leniency'],
    only: { anger: ['needleplan'], dishonesty: ['whisperplan'], leniency: ['letbe'] },
    cause: pr.first,
    causeLabel: `${k.short} would take trade from ${w.placeById.get(threatOf(w, p, k))?.name}`,
    w: 1.2,
    extra: [
      favour(pubC('trade', `${k.short} would take trade from ${w.placeById.get(threatOf(w, p, k))?.name}`, 0.7, 1, 0.2), 'anger', 'dishonesty'),
    ],
    familyExtra: { leniency: [bondC(w, opp, p, 'like', 1)], anger: [bondC(w, opp, p, 'like', -1)] },
  });
  if (!o) return;
  pr.events.push(o.event.id);
  if (o.expr.id === 'whisperplan' && council) remember(w, council, p, o.event.id, -0.05, -0.08, -0.06, `heard every reason ${k.short} would fail`);
  if (o.family !== 'leniency' && w.placeById.get(threatOf(w, p, k))?.lead === opp.id) startRivalry(w, opp, p, 'trade', k.short, pr.first, 0.4);
}

function councilLead(w: World) {
  const c = w.placeById.get('council');
  return c && c.lead != null ? w.byId.get(c.lead) : undefined;
}

// The council's say-so: the chief officer weighs the owner against those who object.
function council(w: World, pr: Project, p: Person) {
  const k = kindOf(pr);
  const c = councilLead(w);
  const objectors = pr.opponents.map(id => P(w, id)).filter(q => q.status === 'in');
  let yes = true;
  let why: any[] = [];
  if (c && c !== p) {
    const d = decide(w, c, `whether to allow ${k.short}`, [
      {
        id: 'yes',
        label: 'say yes',
        considerations: [
          ...(k.kind === 'cause' ? [pubC('town', 'good for the town', 0.75, 1, 0.2)] : []),
          pubC(
            'owner',
            regard(w, c.id, p.id) > 0.2 ? `thinks well of @${p.id}` : `has doubts about @${p.id}`,
            clamp(0.5 + regard(w, c.id, p.id), 0, 1),
            1,
            0.2,
          ),
          bondC(w, c, p, 'like', 1),
          pubC(
            'support',
            `${pr.helpers.length + ((pr as any).backers?.length ?? 0)} people behind it`,
            clamp((pr.helpers.length + ((pr as any).backers?.length ?? 0)) / 6, 0, 1),
            1,
            0.2,
          ),
        ],
      },
      {
        id: 'no',
        label: 'say no',
        considerations: [
          facetC(c, 'prudence', new Set<Feature>(['authority', 'money']), 1, 4),
          ...(objectors.length
            ? [
                pubC(
                  'objections',
                  `${objectors.map(q => '@' + q.id).join(' and ')} against it`,
                  clamp(objectors.reduce((s, q) => s + 0.5 + regard(w, c.id, q.id), 0) / 2, 0, 1),
                  1,
                  0.2,
                ),
              ]
            : []),
        ],
      },
    ]);
    yes = d.chosen === 'yes';
    why = d.why;
    const e = addEvent(w, {
      type: yes ? 'council:yes' : 'council:no',
      who: [p.id, c.id],
      text: yes
        ? `The council said yes to @${p.id}'s ${k.short.replace(/^the /, '')}.`
        : `The council turned down @${p.id}'s ${k.short.replace(/^the /, '')}.`,
      causes: [eventCause(w, pr.first, 0.4), ...why.slice(0, 2)],
      vis: 'public',
      decision: d.rec,
      evidence: [],
      w: 1.6,
    });
    broadcast(w, e);
    pr.events.push(e.id);
    if (!yes) {
      addEmotion(w, p, 'refused', 'turned down', -0.15, 8, e.id);
      for (const q of objectors) remember(w, p, q, e.id, -0.3, -0.1, -0.2, `got ${k.short} turned down`);
    }
  }
  pr.council = yes ? 'yes' : 'no';
  if (!yes) end(w, pr, 'failed', `the council said no`);
}

function end(w: World, pr: Project, how: Project['status'], why: string) {
  pr.status = how;
  pr.ended = w.t;
  const p = P(w, pr.owner);
  const k = kindOf(pr);
  const failing = how === 'failed' || how === 'dropped';
  // A want ends with the event that ended it: the opening, or the giving up (written just below).
  const endAt = failing && !OFF.has('turneddown') ? w.events.length : w.events.length - 1;
  for (const x of p.wants)
    if ((x as any).kind === 'project' && x.target === k.id && !x.done) {
      x.done = how === 'done' ? 'achieved' : 'abandoned';
      x.doneAt = endAt;
    }
  if (failing) {
    const e = addEvent(w, {
      type: 'plan:failed',
      who: [p.id],
      text: `@${p.id} gave up on ${k.short}: ${why}.`,
      causes: [eventCause(w, pr.first, 0.4), stateCause(why, 0.6)],
      vis: 'local',
      evidence: [],
      w: 1.5,
    });
    broadcast(w, e);
    pr.events.push(e.id);
    addEmotion(w, p, 'planfailed', `${k.short} came to nothing`, -0.18, 12, e.id);
    addStress(p, 'planfailed', `${k.short} coming to nothing`, 0.1, e.id);
    p.tried['gaveup'] = { t: w.t, ok: false, n: (p.tried['gaveup']?.n ?? 0) + 1 };
    if (!OFF.has('turneddown') && how === 'failed') {
      moneyLost(w, pr, p, e);
      turnedDown(w, pr, p, e);
    }
  }
}

// Money put into a plan that comes to nothing is gone, and those who put it in trust the owner less for it.
function moneyLost(w: World, pr: Project, p: Person, failed: Event) {
  const k = kindOf(pr);
  const backers = (((pr as any).backers ?? []) as number[]).map(id => P(w, id)).filter(b => b.status !== 'dead');
  if (!backers.length) return;
  const names = backers.map(b => '@' + b.id);
  const e = addEvent(w, {
    type: 'plan:lost',
    who: [...backers.map(b => b.id), p.id],
    text: `${names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names.at(-1) : names[0]} lost the money ${backers.length > 1 ? 'they' : she(backers[0])} had put into ${k.short}.`,
    causes: [eventCause(w, failed.id, 0.7)],
    vis: 'local',
    evidence: [],
    w: 1.2,
  });
  broadcast(w, e);
  pr.events.push(e.id);
  for (const b of backers) {
    remember(w, b, p, e.id, -0.1, -0.35, -0.1, `lost my money on ${k.short}`);
    addStress(b, 'planlost', `the money lost on ${k.short}`, 0.05, e.id);
  }
}

// The owner of a plan that failed decides how to take it: hold it against whoever stood in the way, mean to bring it back, or let it go.
// People meet failure differently, some by blaming others and some by going again (Ucbasaran, Shepherd, Lockett and Lyon 2013).
function turnedDown(w: World, pr: Project, p: Person, failed: Event) {
  const k = kindOf(pr);
  const evs = pr.events.map(i => w.events[i]);
  const no = evs.filter(e => e.type === 'council:no').at(-1);
  // Who stood in the way: the council's officer who said no; else, of those who would not help, the one the owner had counted on most.
  let t: Person | undefined = no ? P(w, no.who[1]) : undefined;
  if (!no) {
    const refused = evs.filter(e => (e.type === 'notthemoney' || e.type === 'notthetime') && e.who[1] === p.id).map(e => P(w, e.who[0]));
    t = refused.sort((a, b) => regard(w, p.id, b.id) - regard(w, p.id, a.id))[0];
  }
  if (t && (t.status !== 'in' || t === p)) t = undefined;
  const yrs = (w.t - pr.since) / 12;
  const feats = new Set<Feature>(['standing', 'public']);
  const o = run(w, {
    type: 'turneddown',
    actor: p,
    target: t,
    others: [],
    thing: k.short,
    features: feats,
    families: t ? ['anger', 'humility', 'pride'] : ['humility', 'pride'],
    only: { anger: ['holdagainst'], humility: ['letgoplan'], pride: ['tryagain'] },
    ownFirst: true,
    cause: failed.id,
    w: 1.2,
    familyExtra: {
      anger: t ? [facetC(p, 'forgiveness', feats, -1, 4), bondC(w, p, t, 'like', -1)] : [],
      humility: [facetC(p, 'forgiveness', feats, 1, 4), facetC(p, 'flexibility', feats, 1, 3)],
      pride: [
        facetC(p, 'diligence', feats, 1, 4),
        privC('time', yrs >= 1.5 ? `${Math.round(yrs)} years of work on it` : 'only months into it', clamp(yrs / 2, 0, 1), 1, 0.3, undefined, 0.5),
      ],
    },
  });
  if (!o) return;
  pr.events.push(o.event.id);
  if (o.expr.id === 'holdagainst' && t) {
    remember(w, p, t, o.event.id, -0.2, -0.15, -0.1, `stood in the way of ${k.short}`);
    startRivalry(w, p, t, 'grudge', k.short, o.event.id, 0.5);
  } else if (o.expr.id === 'tryagain') {
    p.wants.push({ kind: 'project', target: k.id, value: k.values[0], since: w.t, urgency: 0.6, cause: o.event.id, again: true } as any);
  }
}

// A venture opens: a new place in town, with the owner at its head and jobs to fill.
function open(w: World, pr: Project, p: Person) {
  const k = kindOf(pr);
  const tpl = k.place!;
  const id = `${k.id}${pr.id}`;
  const name = tpl.name.replace('@', p.first);
  const pl: any = {
    id,
    name,
    role: tpl.role,
    title: tpl.title,
    skill: tpl.skill,
    cap: tpl.cap,
    pay: tpl.pay,
    people: tpl.people,
    lead: p.id,
    vac: 0,
  };
  w.places.push(pl);
  w.placeById.set(id, pl);
  if (hoods(w) > 1) {
    (pl as any).hood = hoodOf(w, p); // in a city a venture opens in its founder's neighbourhood
    moved();
  }
  if (p.job) {
    const old = w.placeById.get(p.job);
    if (old && old.lead === p.id) old.lead = null;
  }
  jobSet(w, p, id);
  p.lead = true;
  p.jobSince = w.t;
  if (!p.skills[tpl.skill]) p.skills[tpl.skill] = { r: 1100, ceil: 1500, interest: 1 } as any;
  p.savings -= Math.max(0, Math.min(p.savings, k.money * 0.6));
  const backers = ((pr as any).backers ?? []) as number[];
  const e = addEvent(w, {
    type: 'opened',
    who: [p.id, ...backers.slice(0, 2)],
    text: `@${p.id} opened ${name}${k.label.includes('old bank') ? ' in the old bank' : ''}.`,
    causes: [
      eventCause(w, pr.first, 0.4),
      ...(backers.length
        ? [
            stateCause(
              `${backers
                .slice(0, 2)
                .map(id => '@' + id)
                .join(' and ')} put money in`,
              0.4,
            ),
          ]
        : []),
      traitCause(p, 'socialBoldness', 0.3, 1),
    ],
    vis: 'public',
    evidence: [ev(p.id, 'diligence', 1, 0.5, 0.5)],
    w: 2.5,
  });
  broadcast(w, e);
  pr.events.push(e.id);
  pr.place = id;
  addEmotion(w, p, 'opened', 'something of their own', 0.25, 12, e.id);
  for (const id2 of backers) remember(w, p, P(w, id2), e.id, 0.25, 0.15, 0.25, `put money into ${name}`);
  end(w, pr, 'done', '');
}

// A cause comes to its night: the helpers either do their part or they don't, and the town remembers who did.
function night(w: World, pr: Project, p: Person) {
  const k = kindOf(pr);
  let lapses = 0;
  const lapsed: Person[] = [];
  // Round F27: the helpers list is only ever added to, so a helper who has died or left stays on it; the night names and counts
  // only those still here.
  const helpers = pr.helpers.filter(id => P(w, id).status === 'in');
  for (const h of helpers.map(id => P(w, id)).filter(q => q.status === 'in')) {
    const o = run(w, {
      type: 'pitch',
      actor: h,
      target: undefined,
      others: [],
      thing: `${h.sex === 'f' ? 'her' : 'his'} part of ${k.short}`,
      features: new Set<Feature>(['pressure', 'public']),
      families: ['duty', 'lapse'],
      only: { duty: ['deliver', 'allnighter', 'redo'], lapse: ['late', 'rough'] },
      cause: pr.first,
      causeLabel: `promised @${p.id} a hand with ${k.short}`,
      w: 0.9,
      familyExtra: { duty: [bondC(w, h, p, 'like', 1)] },
    });
    if (o) {
      pr.events.push(o.event.id);
      if (o.family === 'lapse') {
        lapses++;
        lapsed.push(h);
        remember(w, p, h, o.event.id, -0.2, -0.25, -0.3, `let ${k.short} down`);
      } else remember(w, p, h, o.event.id, 0.15, 0.2, 0.2, `came through for ${k.short}`);
    }
  }
  const quality = 0.4 * facet(p, 'organisation') + (0.25 * helpers.length) / Math.max(1, k.helpers) - 0.5 * lapses + w.rng.normal() * 0.4;
  const good = quality > 0;
  const e = addEvent(w, {
    type: good ? 'night:good' : 'night:bad',
    who: [p.id, ...helpers.slice(0, 3)],
    text: good
      ? `${k.short.charAt(0).toUpperCase() + k.short.slice(1)} that @${p.id} put on was the best night ${SETTING.name} had had in years.`
      : `${k.short.charAt(0).toUpperCase() + k.short.slice(1)} that @${p.id} put on was a washout${
          lapsed.length
            ? `; ${lapsed
                .slice(0, 2)
                .map(q => '@' + q.id)
                .join(' and ')} never did ${lapsed.length > 1 ? 'their' : her(lapsed[0])} part`
            : ''
        }.`,
    causes: [
      eventCause(w, pr.first, 0.4),
      traitCause(p, 'organisation', 0.4, good ? 1 : -1),
      ...(lapsed.length
        ? [stateCause(`${lapsed.length} of the helpers let it down`, 0.5)]
        : [stateCause(`${helpers.length} people pitched in`, 0.4)]),
    ],
    vis: 'public',
    evidence: [ev(p.id, 'organisation', good ? 1 : -1, 0.6, 0.6)],
    w: 2.2,
  });
  broadcast(w, e);
  pr.events.push(e.id);
  for (const q of near(w, p.id))
    if (q !== p && age(w, q) >= 16) {
      const r = bond(w, q.id, p.id);
      r.respect = clamp(r.respect + (good ? 0.06 : -0.03), -1, 1);
    }
  addEmotion(w, p, 'night', good ? 'the night went well' : 'the night went badly', good ? 0.2 : -0.15, 8, e.id);
  end(w, pr, 'done', '');
  (pr as any).good = good;
}

// How hard an owner asks around: up to this many people a month, half the time each. Set on used worlds before the test.
const ASKS_PER_MONTH = 2;
export function projectsTick(w: World) {
  if (!on()) return;
  const L = live(w);
  // Starting: one plan of a kind at a time in town; a yearly cause comes round again if last year's went well.
  for (const k of KINDS()) {
    if (active(w).some(pr => pr.kind === k.id)) continue;
    if (k.kind === 'venture' && projects(w).some(pr => pr.kind === k.id && pr.status === 'done' && w.placeById.has(pr.place ?? ''))) continue; // the café exists
    const last = projects(w)
      .filter(pr => pr.kind === k.id)
      .at(-1);
    if (last && w.t - (last.ended ?? last.since) < (k.yearly ? 9 : 24)) continue;
    const cands = L.filter(
      p => age(w, p) >= 25 && age(w, p) <= 60 && !projectOf(w, p) && !p.wants.some(x => !x.done && x.pursuit && !x.pursuit.owner),
    );
    if (!cands.length) continue;
    // The likeliest few think about it; a yearly cause that went well is taken up again by whoever ran it.
    const again = k.yearly && last && (last as any).good && P(w, last.owner).status === 'in' ? P(w, last.owner) : undefined;
    const back = OFF.has('turneddown')
      ? undefined
      : cands.find(p => p.wants.some(x => !x.done && (x as any).again && x.target === k.id && w.t - x.since >= 24));
    if (!again && back && w.rng.chance(0.1)) {
      start(w, back, k);
      continue;
    }
    const top = again
      ? [again]
      : cands
          .map(p => [p, fit(p, k)] as const)
          .filter(([, z]) => z > 0.4)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([p]) => p);
    for (const p of top)
      if (w.rng.chance(again ? 0.3 : 0.02)) {
        start(w, p, k);
        break;
      }
  }
  for (const pr of active(w)) {
    const k = kindOf(pr);
    const p = P(w, pr.owner);
    if (p.status !== 'in') {
      end(w, pr, 'dropped', `${she(p)} was gone`);
      continue;
    }
    // Asking: about one person a month, people the owner knows, the ones they regard most first.
    const needMore = (k.kind === 'venture' && pr.money < k.money) || pr.helpers.length < k.helpers;
    if (needMore)
      for (let i = 0; i < ASKS_PER_MONTH; i++)
        if (w.rng.chance(0.5)) {
          const pool = around(w, p)
            .filter(q => q !== p && age(w, q) >= 18 && !pr.asked.includes(q.id) && (bond(w, p.id, q.id).fam > 0.1 || family(p, q)))
            .sort((a, b) => regard(w, p.id, b.id) - regard(w, p.id, a.id));
          if (pool.length) ask(w, pr, p, pool[Math.min(pool.length - 1, w.rng.int(0, 2))]);
        }
    // Those it threatens hear of it and decide whether to fight it, once each.
    if (k.threatens && w.t - pr.since >= 2)
      for (const opp of staffOf(w, threatOf(w, p, k)).filter(
        q =>
          q.job === threatOf(w, p, k) &&
          q !== p &&
          !pr.opponents.includes(q.id) &&
          (w.placeById.get(threatOf(w, p, k))!.lead === q.id || w.rng.chance(0.3)),
      ))
        if (w.rng.chance(0.25)) threatened(w, pr, opp, p);
    // The council's say-so, once enough is behind it.
    const ready = (k.kind === 'venture' ? pr.money >= k.money * 0.8 : true) && pr.helpers.length >= Math.ceil(k.helpers * 0.6);
    if (k.permission && !pr.council && ready && w.t >= pr.due - 3) {
      council(w, pr, p);
      if (pr.status !== 'gathering') continue;
    }
    if (w.t >= pr.due) {
      if (!ready) {
        if (w.t >= pr.due + 6) end(w, pr, 'failed', k.kind === 'venture' ? 'the money was never there' : 'not enough people would help');
        continue;
      }
      if (k.permission && pr.council !== 'yes') continue;
      if (k.kind === 'venture') open(w, pr, p);
      else night(w, pr, p);
    }
  }
}
