// Ways of loving and fighting: how a person attaches, how they show care, and how they fight with the one they live with.
//
// Attachment has two dimensions, anxiety (fear of being left, need for reassurance) and avoidance (discomfort with closeness), not
// three boxes (Brennan, Clark and Shaver 1998; Fraley et al. 2015). Both are partly temperament (anxiety with neuroticism around 0.4–0.5,
// avoidance with low agreeableness and extraversion around 0.2–0.3: Noftle and Shaver 2006) and partly history: a parent lost young, the
// parents parting, being left as an adult. Responsiveness, noticing what a partner needs and answering it, is what makes a partner feel
// cared for (Reis and Shaver 1988; Reis, Clark and Holmes 2004). People show care in different ways (practical help, time, words, small
// gifts, touch); that is how it shows, not a language a partner must match (Impett, Park and Muise 2024).
//
// Couples fight; what predicts their end is how (Gottman and Levenson 1992, 2000). A row has two turns. It starts harshly (criticism of
// the person, not the act; contempt) or softly, or the one bothered lets it go again. The other answers: defends, goes silent
// (stonewalls), hits back, or tries to repair (a joke, hearing the other out). Whether a repair lands depends on how the one it is
// offered to feels about the one offering it (sentiment override: Weiss 1980; Gottman 1999). Contempt is not a fixed trait: it becomes
// available once respect for the partner has gone, which is why it marks a marriage near its end; the very contemptuous have it early.
//
// Every couple has a running tension: everyday strain, money, drink, the anxious partner's need for reassurance against the avoidant
// partner's distance, how far apart their values are. Responsiveness and care bleed it off. What they do in rows moves how they feel
// about each other, and the existing rule ends a partnership when one of them stops liking the other.
//
// How a person fights is held as pseudo-facets (love:criticism, love:stonewall, …) in their facets, so beliefs and views work on it
// like a trait and it can be learned from what they do. A style used deepens a little, like any trait that chooses an act.
import { Rng, hash, clamp } from './rng';
import { OFF, type World, type Person, age, live, P, likeOf, remember, addEvent, broadcast, bond, year, addStress, plasticity } from './world';
import { run, privC, pubC, closeC, valueC, bondC, stateCause, eventCause, ev, PSEUDO } from './grammar';
import { curves, z01, type Consideration } from './decide';
import { SETTING } from './setting';
import type { Feature } from './features';

const on = () => !OFF.has('love');
const fz = (p: Person, k: string) => p.facets[k] ?? 0;
const mix = (r: Rng, composite: number, share: number) => share * composite + Math.sqrt(1 - share * share) * r.normal();
const norm = (ws: [number, number][]) => {
  let s = 0,
    ss = 0;
  for (const [wt, x] of ws) {
    s += wt * x;
    ss += wt * wt;
  }
  return s / Math.sqrt(ss || 1);
};
const she = (p: Person) => (p.sex === 'f' ? 'she' : 'he'),
  her = (p: Person) => (p.sex === 'f' ? 'her' : 'his'),
  herO = (p: Person) => (p.sex === 'f' ? 'her' : 'him'),
  herself = (p: Person) => (p.sex === 'f' ? 'herself' : 'himself');

export type Care = 'practical' | 'time' | 'words' | 'gifts' | 'touch';
export interface Loving {
  anxiety: number;
  avoidance: number;
  responsive: number;
  care: Care;
  criticism: number;
  contempt: number;
  defensive: number;
  stonewall: number;
  repair: number;
}
const KEYS = ['anxiety', 'avoidance', 'responsive', 'criticism', 'contempt', 'defensive', 'stonewall', 'repair'] as const;

// Words for reasons (traitCause reads PSEUDO for keys that are not HEXACO facets).
Object.assign(PSEUDO, {
  'love:anxiety': {
    name: 'Attachment anxiety',
    high: 'afraid of being left, and needs to hear otherwise',
    low: 'not afraid of being left, or of being alone',
  },
  'love:avoidance': { name: 'Attachment avoidance', high: 'keeps people at a distance, even this one', low: 'lets people close' },
  'love:responsive': { name: 'Responsiveness', high: 'notices what the other needs', low: 'misses what the other needs' },
  'love:criticism': { name: 'Criticism', high: 'says what is wrong with people, not with what they did', low: 'keeps it to the matter in hand' },
  'love:contempt': { name: 'Contempt', high: 'looks down on the people closest', low: 'never looks down on anyone close' },
  'love:defensive': { name: 'Defensiveness', high: 'hears every complaint as an attack', low: 'can hear a complaint' },
  'love:stonewall': { name: 'Stonewalling', high: 'goes silent when it gets close', low: 'stays in the room' },
  'love:repair': { name: 'Repair', high: 'knows how to take the heat out of a row', low: 'does not know how to stop a row once it starts' },
});

// Attachment words, for the page and for measures; behaviour runs on the dimensions. Published adult samples put 47–59% secure
// (Bartholomew and Horowitz 1991; Mickelson, Kessler and Shaver 1997). Shares in test worlds carry what the simulation did to people.
// Each cut is three quarters of a standard deviation above the adult mean on training worlds 1501–1505 (anxiety 1.27, avoidance
// 0.90), which puts about a quarter above each and 59% secure there. The dimensions themselves are not tuned to the shares.
export const CUT_ANX = 1.27,
  CUT_AVO = 0.9;
export const attachmentWord = (L: Loving) =>
  L.anxiety > CUT_ANX && L.avoidance > CUT_AVO ? 'fearful' : L.anxiety > CUT_ANX ? 'anxious' : L.avoidance > CUT_AVO ? 'avoidant' : 'secure';

// How a person loves and fights: drawn once, from temperament, their own seed and their childhood (parents parted, a parent lost before
// sixteen), and kept in their facets from then on. Before sixteen it is read but not kept, since childhood is not over.
export function loving(w: World, p: Person): Loving {
  if (p.facets['love:anxiety'] == null) {
    const r = new Rng(hash(w.seed, p.id, 'loving'));
    const parents = p.parents.map(id => w.byId.get(id)).filter((q): q is Person => !!q);
    const childAt = (t: number) => (t - p.born) / 12;
    const lost = parents.some(q => q.status === 'dead' && q.diedAt != null && childAt(q.diedAt) < 16);
    const parted =
      parents.length === 2 &&
      w.events.some(
        e =>
          (e.type === 'divorce' || e.type === 'split') &&
          e.who.includes(parents[0].id) &&
          e.who.includes(parents[1].id) &&
          childAt(e.t) >= 0 &&
          childAt(e.t) < 16,
      );
    let anxiety: number, avoidance: number;
    // Both dimensions share a root of general insecurity (they correlate about +0.1 to +0.3 in adults: Fraley, Waller and Brennan
    // 2000; Cameron, Finnegan and Morry 2012), and early adversity raises that root (Fraley and Heffernan 2013), so a hard childhood
    // shows in either or both, depending on temperament.
    const g = new Rng(hash(w.seed, p.id, 'insecurity')).normal() + (lost ? 0.9 : 0) + (parted ? 0.8 : 0);
    anxiety =
      mix(
        r,
        norm([
          [0.4, fz(p, 'anxiety')],
          [0.3, fz(p, 'dependence')],
          [-0.3, fz(p, 'socialSelfEsteem')],
        ]),
        0.5,
      ) +
      0.7 * g;
    avoidance =
      mix(
        r,
        norm([
          [-0.35, fz(p, 'sentimentality')],
          [-0.3, fz(p, 'sociability')],
          [-0.3, fz(p, 'dependence')],
          [-0.2, fz(p, 'gentleness')],
        ]),
        0.5,
      ) +
      0.7 * g;
    const responsive =
      mix(
        r,
        norm([
          [0.35, fz(p, 'gentleness')],
          [0.3, fz(p, 'altruism')],
          [0.3, p.aptitudes.socialInsight ?? 0],
          [0.2, fz(p, 'patience')],
        ]),
        0.6,
      ) -
      0.3 * avoidance;
    const styles: Record<Care, number> = {
      practical: norm([
        [0.4, fz(p, 'altruism')],
        [0.3, fz(p, 'organisation')],
        [0.3, fz(p, 'diligence')],
      ]),
      time: norm([
        [0.4, fz(p, 'sociability')],
        [0.4, fz(p, 'sentimentality')],
      ]),
      words: norm([
        [0.4, fz(p, 'liveliness')],
        [0.3, p.aptitudes.language ?? 0],
        [0.2, fz(p, 'socialBoldness')],
      ]),
      gifts: norm([
        [0.5, fz(p, 'sentimentality')],
        [0.3, fz(p, 'aesthetic')],
      ]),
      touch: norm([
        [0.4, fz(p, 'liveliness')],
        [0.3, fz(p, 'sociability')],
        [0.3, -avoidance],
      ]),
    };
    const care = Object.entries(styles)
      .map(([k, v]) => [k, v + r.normal() * 0.8] as const)
      .sort((a, b) => b[1] - a[1])[0][0] as Care;
    const L: Loving = {
      anxiety,
      avoidance,
      responsive,
      care,
      criticism: mix(
        r,
        norm([
          [-0.4, fz(p, 'gentleness')],
          [0.3, fz(p, 'perfectionism')],
          [-0.2, fz(p, 'patience')],
        ]),
        0.55,
      ),
      contempt: mix(
        r,
        norm([
          [-0.4, fz(p, 'modesty')],
          [-0.35, fz(p, 'gentleness')],
          [-0.25, fz(p, 'fairness')],
        ]),
        0.55,
      ),
      defensive: mix(
        r,
        norm([
          [-0.35, fz(p, 'modesty')],
          [0.35, anxiety],
          [-0.25, fz(p, 'flexibility')],
        ]),
        0.5,
      ),
      stonewall: mix(
        r,
        norm([
          [0.45, avoidance],
          [-0.3, fz(p, 'sociability')],
          [-0.2, fz(p, 'liveliness')],
        ]),
        0.55,
      ),
      repair: mix(
        r,
        norm([
          [0.35, fz(p, 'forgiveness')],
          [0.3, fz(p, 'gentleness')],
          [0.25, fz(p, 'liveliness')],
          [-0.3, avoidance],
        ]),
        0.55,
      ),
    };
    if (age(w, p) < 16) return L;
    for (const k of KEYS) p.facets['love:' + k] = L[k];
    (p as any)._care = care;
    (p as any)._anxBase = anxiety;
  }
  const L = { care: (p as any)._care as Care } as Loving;
  for (const k of KEYS) (L as any)[k] = p.facets['love:' + k];
  return L;
}

// Being left by a partner leaves a person more anxious about being left again, more so the younger they are (Fraley, Vicary,
// Brumbaugh and Roisman 2011 on attachment change after relationship events). Called by the break-up and by a partner leaving town.
export function leftBy(w: World, x: Person) {
  if (!on() || age(w, x) < 16) return;
  loving(w, x);
  x.facets['love:anxiety'] += 0.15 * plasticity(w, x);
}

// Anxiety raised by being left settles back with years, faster in a partnership that is going well: attachment anxiety falls from
// young adulthood on (Chopik, Edelstein and Fraley 2013) and a responsive partner lowers it (earned security; Arriaga et al. 2018).
function settle(w: World) {
  for (const p of live(w)) {
    const base = (p as any)._anxBase as number | undefined;
    if (base == null) continue;
    const good = p.partner != null && likeOf(w, p.id, p.partner) > 0.4 && likeOf(w, p.partner, p.id) > 0.4;
    p.facets['love:anxiety'] += (base - p.facets['love:anxiety']) * (good ? 0.16 : 0.08);
  }
}

// One state per couple, kept on the partner with the lower id and read and written only through here.
// tension: what has built up; good, bad: how their rows have gone lately (fading by half in about three years); distance: how far
// they have drifted from talking about what matters; scorn: when each last showed the other contempt.
export interface Couple {
  tension: number;
  good: number;
  bad: number;
  distance: number;
  scorn: Record<number, number>;
  apartSaid?: number;
  doubt: Record<number, number>;
  doubtSince: Record<number, number>;
  wondering: Record<number, boolean>;
}
export function coupleOf(a: Person, b: Person): Couple {
  const [lo, hi] = a.id < b.id ? [a, b] : [b, a];
  const c = ((lo as any)['cs:' + hi.id] ??= { tension: 0, good: 0, bad: 0, distance: 0, scorn: {} }) as Couple;
  c.doubt ??= {};
  c.doubtSince ??= {};
  c.wondering ??= {};
  return c;
}
const learn = () => !OFF.has('couplelearn'),
  apart = () => !OFF.has('disengage');

// A way of fighting as a consideration: like a facet, the observer reads it from beliefs.
function loveC(p: Person, k: string, dir: 1 | -1 = 1): Consideration {
  const key = 'love:' + k;
  return {
    id: key,
    cause: v => {
      const z = v.facet(p, key);
      const w = PSEUDO[key];
      return {
        kind: 'trait',
        label: z > 0.5 ? (dir > 0 ? '' : 'despite ') + w.high : z < -0.5 ? (dir < 0 ? '' : 'despite ') + w.low : w.name.toLowerCase(),
        weight: 1,
        key,
        who: p.id,
        ...(Math.abs(z) <= 0.5 ? { mid: true } : {}),
      };
    },
    input: v => z01(v.facet(p, key)),
    curve: dir > 0 ? curves.sCurve(5, 0.5) : curves.sFalling(5, 0.5),
  };
}

// What wears on a couple this month, from each side, and what bleeds it off.
function strain(w: World, p: Person, q: Person) {
  const Lp = loving(w, p),
    Lq = loving(w, q);
  let s = 0.02 + 0.06 * p.stress + 0.06 * q.stress + (p.drinks ? 0.05 : 0) + (q.drinks ? 0.05 : 0) + (p.savings < -3 || q.savings < -3 ? 0.04 : 0);
  s += 0.02 * Math.max(0, Lp.anxiety) * Math.max(0, Lq.avoidance) + 0.02 * Math.max(0, Lq.anxiety) * Math.max(0, Lp.avoidance); // the one who needs more and the one who gives less
  let d = 0;
  for (const k of ['freedom', 'tradition', 'success', 'lovedOnes', 'fairness']) d += Math.abs((p.values[k] ?? 0) - (q.values[k] ?? 0));
  s += 0.006 * d;
  const ease = (0.025 * (Math.max(-1, Lp.responsive) + Math.max(-1, Lq.responsive) + 2)) / 2;
  return s - ease;
}

// Contempt is there to be used once respect has gone, or for the very contemptuous.
const CONTEMPT_RESPECT = 0;
const contemptOK = (w: World, a: Person, b: Person) =>
  !OFF.has('contempt') && (bond(w, a.id, b.id).respect < CONTEMPT_RESPECT || fz(a, 'love:contempt') > 1.0);
const HARSH = new Set(['criticise', 'contempt']);
const kindOf = (id: string) => (HARSH.has(id) ? 'anger' : id === 'defend' ? 'defend' : id === 'stonewall' ? 'stonewall' : 'repair');

// What a row is about. Most of a couple's rows are about the same one or two things that never get solved (perpetual problems, about
// two thirds of all couples' conflicts: Gottman 1999), so each couple has its own, from where they differ most; the rest come from
// what is pressing now. Words only: drawn from the couple's own seed, never from the world's random stream.
const VALUE_ROW: Record<string, (q: Person) => string> = {
  freedom: () => 'never going anywhere',
  tradition: q => `${her(q)} family`,
  success: () => 'money and getting on',
  lovedOnes: q => `how little time ${she(q)} gave the family`,
  fairness: () => 'who did what in the house',
};
function subjectOf(w: World, p: Person, q: Person) {
  const Lp = loving(w, p);
  const r = new Rng(hash(w.seed, p.id, q.id, 'row', w.t));
  const now: string[] = [];
  if (q.drinks) now.push('the drinking', 'the drinking'); // the one who raises it is not the one who drinks (round H26, words only)
  if (p.savings < -3 || q.savings < -3) now.push('money', 'the bills');
  if (q.stress > 0.6) now.push(`${her(q)} moods`);
  if (Lp.anxiety > CUT_ANX) now.push('how little time they had together', `whether ${she(q)} still cared`);
  const leave = (x: Person) => x.wants.some(y => y.kind === 'escape' && !y.done);
  if (leave(p) !== leave(q)) now.push(`leaving ${SETTING.name}`);
  const qjob = q.job ? w.placeById.get(q.job) : undefined;
  if (qjob && q.facets.diligence > 0.8) now.push(`${her(q)} hours at ${qjob.name}`);
  if (p.kids.some(k => q.kids.includes(k) && w.byId.get(k)?.status === 'in' && age(w, w.byId.get(k)!) < 18)) now.push('the children');
  if (now.length && r.chance(0.5)) return r.pick(now);
  // Their perpetual problem: where their values are furthest apart, fixed for the couple (the chores, when nothing stands out).
  const lo = Math.min(p.id, q.id),
    hi = Math.max(p.id, q.id);
  const pr = new Rng(hash(w.seed, lo, hi, 'perpetual'));
  const gaps = Object.keys(VALUE_ROW)
    .map(k => [k, Math.abs((p.values[k] ?? 0) - (q.values[k] ?? 0)) + pr.normal() * 0.3] as const)
    .sort((a, b) => b[1] - a[1]);
  if (gaps[0][1] > 1) return VALUE_ROW[gaps[0][0]](q);
  const chores = ((SETTING as any).material?.chores as string[] | undefined) ?? ['the washing-up'];
  return pr.pick(chores);
}
// Once the people around a couple know the shape of their rows, another row of the same shape is not news.
function unlog(w: World, e: { id: number; w: number; who: number[] }) {
  if (e.w <= 0.2) return;
  e.w = 0.2;
  for (const id of e.who) {
    const x = w.byId.get(id);
    if (!x) continue;
    const i = x.events.lastIndexOf(e.id);
    if (i >= 0) x.events.splice(i, 1);
  }
}

// One row: the one more bothered raises it (or lets it go again); the other answers.
function row(w: World, p: Person, q: Person, cs: Couple) {
  const tension = cs.tension;
  const M = (SETTING as any).material ?? {};
  const pub = tension > 0.6 && w.rng.chance(0.15);
  const place = pub ? w.rng.pick((M.places as string[] | undefined) ?? ['the shop']) : '';
  const subject = subjectOf(w, p, q);
  const feats = new Set<Feature>(['family', pub ? 'public' : 'private', 'love']);
  const tensionC = (dir: 1 | -1) =>
    privC(
      'tension',
      tension > 0.8 ? 'it had been building for months' : tension > 0.3 ? 'it had been building' : 'nothing much had built up',
      clamp(tension, 0, 1),
      dir,
      0.2,
      undefined,
      0.4,
    );
  const start = run(w, {
    type: 'row',
    actor: p,
    target: q,
    others: [],
    thing: subject,
    where: pub ? ` at ${place}, with people listening` : undefined,
    features: feats,
    families: ['anger', 'humility', 'withdrawal'],
    only: { anger: contemptOK(w, p, q) ? ['criticise', 'contempt'] : ['criticise'], humility: ['soften'], withdrawal: ['letslide'] },
    causeLabel: `it had been building between them (${subject})`,
    w: 1,
    ownFirst: true,
    familyExtra: {
      anger: [loveC(p, 'criticism', 1), tensionC(1)],
      humility: [
        loveC(p, 'criticism', -1),
        ...(learn()
          ? [
              privC(
                'works',
                goodShare(cs) > 0.5 ? 'talking it through usually works for them' : 'talking it through rarely works for them',
                goodShare(cs),
                1,
                0.2,
                undefined,
                0.4,
              ),
            ]
          : []),
      ],
      withdrawal: [
        loveC(p, 'avoidance', 1),
        loveC(p, 'anxiety', -1),
        ...(learn()
          ? [
              privC(
                'futile',
                badShare(cs) > 0.5 ? 'raising anything with them never goes anywhere' : 'raising things sometimes helps',
                badShare(cs),
                1,
                0.2,
                undefined,
                0.3,
              ),
            ]
          : []),
        tensionC(-1),
      ],
    },
  });
  if (!start) return;
  const log = (w as any).loveLog as any[] | undefined;
  const before = { good: goodShare(cs), bad: badShare(cs) };
  if (start.expr.id === 'letslide') {
    addStress(p, 'keptin', `keeping things in with @${q.id}`, 0.02);
    if (apart()) cs.distance = clamp(cs.distance + 0.08, 0, 1);
    log?.push({ t: w.t, a: p.id, b: q.id, s: 'letslide', pub, goodBefore: before.good, badBefore: before.bad });
    notePattern(w, p, q, 'letslide', '', start.event.id);
    return;
  }
  if (start.expr.id === 'contempt') cs.scorn[p.id] = w.t;
  // Sentiment override: after enough bad rows, or contempt lately, even a gentle word sounds like an attack (Weiss 1980; Gottman 1999).
  const sore = clamp(0.5 + (0.5 * (cs.bad - cs.good)) / (cs.good + cs.bad + 1) + (w.t - (cs.scorn[p.id] ?? -999) <= 12 ? 0.3 : 0), 0, 1);
  const overC = (dir: 1 | -1) =>
    privC(
      'override',
      sore > 0.6 ? `everything @${p.id} said sounded like an attack by now` : 'they still gave each other the benefit of the doubt',
      sore,
      dir,
      0.2,
      undefined,
      0.5,
    );
  const harsh = HARSH.has(start.expr.id);
  const harshC = (dir: 1 | -1) =>
    privC('harsh', harsh ? 'it came at them as an attack' : 'it was put gently', harsh ? 0.85 : 0.2, dir, 0.2, undefined, 0.5);
  const answer = run(w, {
    type: 'row-answer',
    actor: q,
    target: p,
    others: [],
    thing: 'it',
    features: feats,
    families: ['anger', 'humility', 'withdrawal', 'pride'],
    cause: start.event.id,
    only: {
      anger: contemptOK(w, q, p) ? ['criticise', 'contempt'] : ['criticise'],
      humility: ['repairjoke', 'hearout'],
      withdrawal: ['stonewall'],
      pride: ['defend'],
    },
    w: 1,
    ownFirst: true,
    familyExtra: {
      anger: [loveC(q, 'criticism', 1), harshC(1), ...(learn() ? [overC(1)] : [])],
      humility: [loveC(q, 'repair', 1), harshC(-1), ...(learn() ? [overC(-1)] : [])],
      withdrawal: [
        loveC(q, 'stonewall', 1),
        privC(
          'flooded',
          tension > 0.8 ? 'it had all got to be too much' : 'it was getting to be too much',
          clamp(tension * 0.8 + 0.2 * z01(fz(q, 'love:avoidance')), 0, 1),
          1,
          0.2,
          undefined,
          0.4,
        ),
      ],
      pride: [loveC(q, 'defensive', 1), harshC(1), ...(learn() ? [overC(1)] : [])],
    },
  });
  let mult = harsh ? 0.85 : 0.6;
  let landed: boolean | undefined;
  const liked = likeOf(w, p.id, q.id);
  if (answer) {
    const a = answer.expr.id;
    if (a === 'repairjoke') {
      // Whether a repair lands is up to the one it is offered to, and how they feel about the one offering it.
      const lands = w.rng.chance(clamp(0.5 + 0.8 * liked, 0.1, 0.95));
      landed = lands;
      answer.event.text =
        answer.event.text.replace(/\.$/, '') + (lands ? `, and @${p.id} laughed despite ${herself(p)}.` : `; @${p.id} was in no mood for it.`);
      if (!lands) remember(w, p, q, answer.event.id, -0.03, -0.02, 0, 'tried to laugh it off');
      mult = lands ? (harsh ? 0.35 : 0.2) : 0.75;
    } else if (a === 'hearout') mult = harsh ? 0.35 : 0.2;
    else if (a === 'defend') mult = harsh ? 0.8 : 0.6;
    else if (a === 'stonewall') {
      mult = 0.85;
      addStress(p, 'wall', `@${q.id} going silent`, 0.05, answer.event.id);
    } else mult = 0.9; // hit back
    // How it went, for what they learn: heard or laughed off is good; silence, hitting back, defending or a joke that fell flat is bad.
    const good = a === 'hearout' || (a === 'repairjoke' && landed);
    if (learn()) {
      if (good) cs.good += 1;
      else cs.bad += 1;
      if (start.expr.id === 'contempt') cs.bad += 0.5;
    }
    if (apart()) cs.distance = clamp(cs.distance + (good ? -0.1 : a === 'stonewall' ? 0.08 : a === 'defend' ? 0.04 : 0), 0, 1);
    if (a === 'contempt') cs.scorn[q.id] = w.t;
    log?.push({ t: w.t, a: p.id, b: q.id, s: start.expr.id, r: a, pub, landed, liked, ok: good, goodBefore: before.good, badBefore: before.bad });
    const shape = `${harsh ? 'harsh' : 'soft'}>${kindOf(a)}`;
    if (!pub && (p as any)['rowpatk:' + q.id] === shape) {
      unlog(w, start.event);
      unlog(w, answer.event);
    }
    notePattern(w, p, q, harsh ? 'harsh' : 'soft', kindOf(a), start.event.id);
    if (start.expr.id === 'contempt') notePattern(w, p, q, 'contempt', '', start.event.id);
    if (a === 'contempt') notePattern(w, q, p, 'contempt', '', answer.event.id);
  } else log?.push({ t: w.t, a: p.id, b: q.id, s: start.expr.id, r: '', pub });
  cs.tension *= mult;
}
const goodShare = (cs: Couple) => cs.good / (cs.good + cs.bad + 1),
  badShare = (cs: Couple) => cs.bad / (cs.good + cs.bad + 1);

// The shape a couple's rows take, said once when it has happened three times in six years (twice, for contempt): this is what the
// people around them come to know about them.
const PATTERN: Record<string, (p: Person, q: Person) => string> = {
  'harsh>stonewall': (p, q) =>
    `Their rows went the same way every time now: @${p.id} went at @${q.id}, and @${q.id} went quiet until @${p.id} gave up.`,
  'harsh>defend': (p, q) =>
    `Every row between @${p.id} and @${q.id} went the same way: @${p.id} listed what was wrong, and @${q.id} explained why none of it was ${her(q)} fault.`,
  'harsh>anger': (p, q) => `@${p.id} and @${q.id} had stopped arguing about anything in particular; they argued about each other.`,
  'harsh>repair': (p, q) => `@${p.id} flared up at @${q.id} often, and @${q.id} always found a way to bring ${herO(p)} round.`,
  'soft>repair': (p, q) => `@${p.id} and @${q.id} could have a row and be laughing about it by dinner.`,
  'soft>stonewall': (p, q) => `@${p.id} kept trying to talk to @${q.id}, gently, and @${q.id} kept not hearing it.`,
  'soft>defend': (p, q) => `However gently @${p.id} put things, @${q.id} heard an accusation.`,
  'soft>anger': (p, q) => `@${p.id} would bring something up gently and @${q.id} would bite ${her(p)} head off.`,
  'contempt>': (p, q) => `Somewhere along the way @${p.id} had stopped respecting @${q.id}, and it showed.`,
  'letslide>': (p, q) => `@${p.id} had stopped bringing things up with @${q.id}.`,
};
const PATTERN_EV: Record<string, [string, string][]> = {
  'harsh>stonewall': [
    ['a', 'criticism'],
    ['b', 'stonewall'],
  ],
  'harsh>defend': [
    ['a', 'criticism'],
    ['b', 'defensive'],
  ],
  'harsh>anger': [
    ['a', 'criticism'],
    ['b', 'criticism'],
  ],
  'harsh>repair': [
    ['a', 'criticism'],
    ['b', 'repair'],
  ],
  'soft>repair': [
    ['a', 'criticism'],
    ['b', 'repair'],
  ],
  'soft>stonewall': [['b', 'stonewall']],
  'soft>defend': [['b', 'defensive']],
  'soft>anger': [['b', 'criticism']],
  'contempt>': [['a', 'contempt']],
  'letslide>': [['a', 'avoidance']],
};
function notePattern(w: World, p: Person, q: Person, s: string, r: string, ref: number) {
  const key = `${s}>${r}`;
  const hist = ((p as any)['rows:' + q.id] ??= []) as { t: number; k: string }[];
  hist.push({ t: w.t, k: key });
  while (hist.length && w.t - hist[0].t > 72) hist.shift();
  const n = hist.filter(h => h.k === key).length;
  if (n < (s === 'contempt' ? 2 : 3)) return;
  const last = Math.max((p as any)['rowpat:' + q.id] ?? -999, (q as any)['rowpat:' + p.id] ?? -999);
  if (w.t - last < 60) return;
  const again = ((p as any)['rowsaid:' + q.id] ??= []) as string[];
  const firstSaid = ((p as any)['rowsaidT:' + q.id] ??= {}) as Record<string, number>; // when each pattern was first said, so a repeat can say since when
  // A pattern from an earlier partnership between the same two is not this one's (round H25, words only).
  const began = (p as any).pairSince ?? -Infinity;
  const said = again.includes(key) && (firstSaid[key] ?? -Infinity) >= began;
  again.push(key);
  if (!said) firstSaid[key] = w.t;
  (p as any)['rowpat:' + q.id] = w.t;
  (p as any)['rowpatk:' + q.id] = key;
  const evid = (PATTERN_EV[key] ?? []).map(([who, k]) =>
    ev((who === 'a' ? p : q).id, 'love:' + k, key === 'soft>repair' && who === 'a' ? -1 : 1, 0.8, 0.6),
  );
  const e = addEvent(w, {
    type: 'couple:pattern',
    who: [p.id, q.id],
    text: said
      ? (t => `Nothing had changed since ${year(firstSaid[key])}: ${t[0] === '@' ? t : t[0].toLowerCase() + t.slice(1)}`)(PATTERN[key](p, q))
      : PATTERN[key](p, q),
    causes: [
      eventCause(w, ref, 0.5),
      stateCause(`together since ${year(Math.min((p as any).pairSince ?? p.psince ?? w.t, (q as any).pairSince ?? q.psince ?? w.t))}`, 0.3),
    ],
    vis: 'local',
    evidence: [...evid, ev(p.id, 'bond:' + q.id, key.startsWith('soft>repair') || key === 'harsh>repair' ? 1 : -1, 0.5, 0.6)],
    w: 1.2,
  });
  broadcast(w, e);
}

// Care, the way this person shows it, filled from their own life. Often, from the responsive and the fond; said now and then (a way of
// being is learned once, so a line every five years or so), felt every time.
const CARE: Record<Care, (a: Person, t: Person, m: Record<string, string>) => string> = {
  practical: (a, t, m) => `@${a.id} fixed ${m.possession} for @${t.id} without being asked`,
  time: (a, t, m) => `@${a.id} keeps ${m.when} free for @${t.id}, whatever else is on`,
  words: (a, t, m) => `@${a.id} told people at ${m.place} how proud ${she(a)} was of @${t.id}`,
  gifts: (a, t, m) => `@${a.id} brought @${t.id} something back from ${m.nearby}, for no reason`,
  touch: (a, t, m) => `@${a.id} still holds @${t.id}'s hand on the way to ${m.place}`,
};
function careText(w: World, a: Person, t: Person, care: Care) {
  const M = (SETTING as any).material ?? {};
  const r = new Rng(hash(w.seed, a.id, 'care', w.t));
  const poss = a.attachments.filter(x => x.key !== 'home').map(x => x.label);
  const m = {
    possession: poss.length && r.chance(0.3) ? r.pick(poss) : r.pick((M.possessions as string[] | undefined) ?? ['the front door']),
    when: r.pick(['Sunday afternoons', 'Friday evenings', 'the first weekend of the month', 'one evening a week']),
    place: r.pick((M.places as string[] | undefined) ?? ['the shop']),
    nearby: r.pick(((M.nearby as string[] | undefined) ?? ['the next town']).filter(x => !x.includes(','))),
  };
  return CARE[care](a, t, m) + '.';
}

export function loveTick(w: World) {
  if (!on()) return;
  if (w.t % 12 === 0) settle(w);
  for (const p of live(w)) {
    if (p.partner == null || p.id > p.partner) continue;
    const q = P(w, p.partner);
    if (q.status !== 'in' || age(w, p) < 16 || age(w, q) < 16) continue;
    const cs = coupleOf(p, q);
    cs.tension = clamp(cs.tension * 0.92 + strain(w, p, q), 0, 1.5);
    if (learn()) {
      cs.good *= 0.98;
      cs.bad *= 0.98;
    }
    if (apart()) cs.distance *= 0.99;
    // A row. Every couple disagrees now and then, however well they get on; what builds up makes it likelier (round 20b). The one more
    // bothered raises it (the anxious, the impatient). Whether it becomes a fight is up to how each of them handles it.
    const rowNow = OFF.has('friction') ? cs.tension > 0.35 && w.rng.chance(0.15 * cs.tension) : w.rng.chance(0.05 + 0.25 * cs.tension);
    if (rowNow) {
      const Lp = loving(w, p),
        Lq = loving(w, q);
      const raiser = Lp.anxiety - fz(p, 'patience') >= Lq.anxiety - fz(q, 'patience') ? p : q;
      row(w, raiser, raiser === p ? q : p, cs);
    }
    // Care: now and then, as each shows it, more from the responsive and the fond, less as they drift apart; none from someone who no
    // longer likes the other.
    for (const [a, b] of [
      [p, q],
      [q, p],
    ] as const) {
      const L = loving(w, a);
      const fond = clamp((likeOf(w, a.id, b.id) + 0.2) / 0.8, 0, 1.2) * (apart() ? 1 - cs.distance : 1);
      if (!w.rng.chance(0.012 * (1 + clamp(L.responsive, -1, 1.5)) * fond)) continue;
      remember(w, b, a, -1, 0.04, 0.01, 0.03, 'looks after me');
      cs.tension = Math.max(0, cs.tension - 0.05);
      if (apart()) cs.distance = Math.max(0, cs.distance - 0.02);
      ((w as any).loveLog as any[] | undefined)?.push({ t: w.t, a: a.id, b: b.id, care: L.care });
      if (w.t - (a.tried['care:' + b.id]?.t ?? -999) < 60) continue;
      a.tried['care:' + b.id] = { t: w.t, ok: true, n: (a.tried['care:' + b.id]?.n ?? 0) + 1 };
      const e = addEvent(w, {
        type: 'care',
        who: [a.id, b.id],
        text: careText(w, a, b, L.care),
        causes: [
          {
            kind: 'trait',
            label: L.responsive > 0.5 ? `notices what @${b.id} needs` : `shows it in what ${she(a)} does`,
            weight: 0.5,
            key: 'love:responsive',
            who: a.id,
          },
          stateCause(`together since ${year((a as any).pairSince ?? a.psince)}`, 0.3),
        ],
        vis: 'local',
        evidence: [ev(a.id, 'bond:' + b.id, 1, 0.6, 0.7), ev(a.id, 'love:responsive', 1, 0.5, 0.5)],
        w: 0.6,
      });
      broadcast(w, e);
    }
    // Drifting apart, once it has gone far, is something the people around them see.
    if (apart() && cs.distance > 0.6 && w.t - (cs.apartSaid ?? -999) >= 60) {
      cs.apartSaid = w.t;
      const e = addEvent(w, {
        type: 'couple:apart',
        who: [p.id, q.id],
        text: `@${p.id} and @${q.id} had stopped talking about anything that mattered; they were polite with each other, and that was all.`,
        causes: [stateCause(`together since ${year((p as any).pairSince ?? p.psince)}`, 0.3)],
        vis: 'local',
        evidence: [ev(p.id, 'bond:' + q.id, -1, 0.5, 0.6), ev(q.id, 'bond:' + p.id, -1, 0.5, 0.6)],
        w: 1.2,
      });
      broadcast(w, e);
    }
    // Leaving is the end of a process: doubts build slowly from what the marriage gives reason to doubt and fade when it stops, and only
    // a year of serious doubt brings the decision whether to stay, which is a decision, not a threshold.
    if (!OFF.has('leaving') && p.pstat === 'married') {
      for (const [x, y] of [
        [p, q],
        [q, p],
      ] as const) {
        const scorned = w.t - (cs.scorn[y.id] ?? -999) <= 12;
        const dis = 0.5 * (0.4 - likeOf(w, x.id, y.id)) + 0.3 * cs.distance + (scorned ? 0.2 : 0) + 0.15 * (badShare(cs) - goodShare(cs));
        const d = clamp((cs.doubt[x.id] ?? 0) * 0.97 + 0.05 * Math.max(-0.2, dis), 0, 1);
        cs.doubt[x.id] = d;
        if (d > 0.3 && !cs.wondering[x.id]) {
          cs.wondering[x.id] = true;
          const best = [...x.friends]
            .map(id => w.byId.get(id)!)
            .filter(f => f && f.status === 'in' && f.id !== y.id)
            .sort((a, b) => likeOf(w, x.id, b.id) - likeOf(w, x.id, a.id))[0];
          const e = addEvent(w, {
            type: 'doubt',
            who: [x.id, y.id],
            text: `@${x.id} had begun to wonder whether to stay with @${y.id}.`,
            causes: [
              stateCause(
                cs.distance > 0.5
                  ? 'they had drifted apart'
                  : scorned
                    ? `the way @${y.id} had come to talk to ${herO(x)}`
                    : `things had not been good with @${y.id} for a while`,
                0.6,
              ),
            ],
            vis: 'private',
            evidence: [ev(x.id, 'bond:' + y.id, -1, 0.6, 0.6)],
            w: 0.8,
            knownBy: best ? new Map([[best.id, 'heard']]) : undefined,
          });
          broadcast(w, e);
        } else if (d < 0.15) cs.wondering[x.id] = false;
        if (d > 0.5) cs.doubtSince[x.id] ??= w.t;
        else delete cs.doubtSince[x.id];
        if (w.t % 12 === 0) ((w as any).loveLog as any[] | undefined)?.push({ t: w.t, a: x.id, b: y.id, doubt: d });
        if (cs.doubtSince[x.id] == null || w.t - cs.doubtSince[x.id] < 12 || w.t - (x.tried['stay:' + y.id]?.t ?? -999) < 12) continue;
        x.tried['stay:' + y.id] = { t: w.t, ok: true, n: (x.tried['stay:' + y.id]?.n ?? 0) + 1 };
        if (stayOrGo(w, x, y, cs, scorned)) break;
      }
    }
  }
}

// Staying or going weighs what pulls them apart against what holds them (commitment: Rusbult 1980; Le and Agnew 2003, satisfaction,
// alternatives and what has been put in; and children and money, which keep people together who would otherwise part).
function stayOrGo(w: World, x: Person, y: Person, cs: Couple, scorned: boolean): boolean {
  const kids = x.kids.some(k => y.kids.includes(k) && w.byId.get(k)?.status === 'in' && age(w, w.byId.get(k)!) < 18);
  const years = Math.max(0, (w.t - x.psince) / 12);
  const o = run(w, {
    type: 'stay',
    actor: x,
    target: y,
    others: [],
    thing: '',
    features: new Set<Feature>(['family', 'private', 'love']),
    families: ['courage', 'duty'],
    only: { courage: ['endit'], duty: ['stayon'] },
    ownFirst: true,
    causeLabel: `whether to stay with @${y.id}`,
    w: 2,
    familyExtra: {
      courage: [
        privC(
          'doubt',
          (n => `had been thinking of leaving for ${n} year${n > 1 ? 's' : ''}`)(
            Math.max(1, Math.round((w.t - (cs.doubtSince[x.id] ?? w.t)) / 12 + 0.5)),
          ),
          cs.doubt[x.id] ?? 0,
          1,
          0.2,
          undefined,
          0.2,
        ),
        bondC(w, x, y, 'like', -1),
        privC('apart', cs.distance > 0.5 ? 'they had grown apart' : 'they still talked', cs.distance, 1, 0.2, undefined, 0.2),
        privC(
          'scorn',
          scorned ? `the way @${y.id} had come to talk to ${herO(x)}` : 'no contempt between them',
          scorned ? 0.9 : 0.15,
          1,
          0.2,
          undefined,
          0.15,
        ),
        valueC(x, 'freedom', 1),
        loveC(x, 'anxiety', -1),
      ],
      duty: [
        privC('built', 'the life they had built together', 0.75, 1, 0.2, undefined, 0.6),
        pubC('kids', kids ? 'the children' : 'no children at home', kids ? 0.9 : 0.15, 1),
        valueC(x, 'lovedOnes', 1),
        valueC(x, 'tradition', 1),
        privC('years', `${Math.round(years)} years together`, clamp(years / 30, 0, 1), 1, 0.2, undefined, 0.4),
        closeC(
          'money',
          x.savings < SETTING.moveCost ? 'could not afford to start again' : 'could afford to go',
          x.savings < SETTING.moveCost ? 0.85 : 0.2,
          1,
          0.2,
          undefined,
          0.4,
        ),
      ],
    },
  });
  ((w as any).loveLog as any[] | undefined)?.push({ t: w.t, a: x.id, b: y.id, stay: o?.expr.id ?? '', distance: cs.distance, scorned, kids });
  if (o && o.expr.id === 'stayon') {
    cs.doubt[x.id] = (cs.doubt[x.id] ?? 0) * 0.6;
    const best = [...x.friends]
      .map(id => w.byId.get(id)!)
      .filter(f => f && f.status === 'in' && f.id !== y.id)
      .sort((a, b) => likeOf(w, x.id, b.id) - likeOf(w, x.id, a.id))[0];
    if (best) o.event.knownBy.set(best.id, 'heard'); // the people closest know they nearly went
  }
  if (!o || o.expr.id !== 'endit') return false;
  (w.hooks as any).split(w, x, y, true, x, [
    eventCause(w, o.event.id, 0.6),
    ...o.event.causes.filter(c => c.kind !== 'event' && c.kind !== 'state').slice(0, 2),
  ]);
  return true;
}
