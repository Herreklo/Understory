// Ways of loving and fighting: how a person attaches, how they show care, and how they fight with the one they live with.
//
// Attachment has two dimensions, anxiety (fear of being left, need for reassurance) and avoidance (discomfort with closeness), not
// three boxes (Brennan, Clark and Shaver 1998; Fraley et al. 2015). Both are partly temperament and partly history: a parent lost young,
// a parents' divorce, being left. Responsiveness, noticing what a partner needs and answering it, is what makes a partner feel cared for
// (Reis and Shaver 1988; Reis, Clark and Holmes 2004). People show care in different ways (practical help, time, words, small gifts,
// touch); that is how it shows, not a language a partner must match. Couples fight; what predicts their end is how: criticism of the
// person rather than the act, contempt, defensiveness and stonewalling, against repair attempts that work (Gottman and Levenson 1992, 2000).
//
// Every couple has a running tension: everyday strain, money, drink, the anxious partner's need for reassurance, the avoidant
// partner's distance, how far apart their values are. Responsiveness and care bleed it off. When it builds, one of them raises it,
// and the row is a decision with reasons, answered by the other as a provocation. What they do in rows moves how they feel about each
// other, and the existing rule ends a marriage when one of them stops liking the other.
import { Rng, hash, clamp } from './rng';
import { OFF, type World, type Person, age, live, P, facet, likeOf, remember, addEvent, broadcast, bond, year, addStress } from './world';
import { run, bondC, privC, pubC, stateCause, ev } from './grammar';
import type { Feature } from './features';

const on = () => !OFF.has('love');
const f = (p: Person, k: string) => p.facets[k] ?? 0;
const mix = (r: Rng, composite: number, share: number) => share * composite + Math.sqrt(1 - share * share) * r.normal();
const norm = (ws: [number, number][]) => { let s = 0, ss = 0; for (const [wt, x] of ws) { s += wt * x; ss += wt * wt; } return s / Math.sqrt(ss || 1); };

export interface Loving { anxiety: number; avoidance: number; responsive: number; care: 'practical' | 'time' | 'words' | 'gifts' | 'touch'; criticism: number; contempt: number; defensive: number; stonewall: number; repair: number }

// How a person loves: fixed from temperament and their own seed, with what happened to them as a child (parents parted, a parent lost).
export function loving(w: World, p: Person): Loving {
  const c = (p as any)._loving as Loving | undefined; if (c) return c;
  const r = new Rng(hash(w.seed, p.id, 'loving'));
  const parents = p.parents.map(id => w.byId.get(id)).filter((q): q is Person => !!q);
  const childAt = (t: number) => (t - p.born) / 12;
  const lostYoung = parents.some(q => q.status === 'dead' && q.diedAt != null && childAt(q.diedAt) < 16) ? 0.4 : 0;
  const partedYoung = parents.length === 2 && w.events.some(e => (e.type === 'divorce' || e.type === 'split') && e.who.includes(parents[0].id) && e.who.includes(parents[1].id) && childAt(e.t) >= 0 && childAt(e.t) < 16) ? 0.35 : 0;
  const anxiety = mix(r, norm([[0.4, f(p, 'anxiety')], [0.3, f(p, 'dependence')], [-0.3, f(p, 'socialSelfEsteem')]]), 0.5) + lostYoung + partedYoung;
  const avoidance = mix(r, norm([[-0.35, f(p, 'sentimentality')], [-0.3, f(p, 'sociability')], [-0.3, f(p, 'dependence')], [-0.2, f(p, 'gentleness')]]), 0.5) + 0.5 * partedYoung;
  const responsive = mix(r, norm([[0.35, f(p, 'gentleness')], [0.3, f(p, 'altruism')], [0.3, p.aptitudes.socialInsight ?? 0], [0.2, f(p, 'patience')]]), 0.6) - 0.3 * avoidance;
  const styles = { practical: norm([[0.4, f(p, 'altruism')], [0.3, f(p, 'organisation')], [0.3, f(p, 'diligence')]]), time: norm([[0.4, f(p, 'sociability')], [0.4, f(p, 'sentimentality')]]), words: norm([[0.4, f(p, 'liveliness')], [0.3, p.aptitudes.language ?? 0], [0.2, f(p, 'socialBoldness')]]), gifts: norm([[0.5, f(p, 'sentimentality')], [0.3, f(p, 'aesthetic')]]), touch: norm([[0.4, f(p, 'liveliness')], [0.3, f(p, 'sociability')], [0.3, -avoidance]]) };
  const care = (Object.entries(styles).map(([k, v]) => [k, v + r.normal() * 0.8] as const).sort((a, b) => b[1] - a[1])[0][0]) as Loving['care'];
  const L: Loving = {
    anxiety, avoidance, responsive, care,
    criticism: mix(r, norm([[-0.4, f(p, 'gentleness')], [0.3, f(p, 'perfectionism')], [-0.2, f(p, 'patience')]]), 0.55),
    contempt: mix(r, norm([[-0.4, f(p, 'modesty')], [-0.35, f(p, 'gentleness')], [-0.25, f(p, 'fairness')]]), 0.55),
    defensive: mix(r, norm([[-0.35, f(p, 'modesty')], [0.35, anxiety], [-0.25, f(p, 'flexibility')]]), 0.5),
    stonewall: mix(r, norm([[0.45, avoidance], [-0.3, f(p, 'sociability')], [-0.2, f(p, 'liveliness')]]), 0.55),
    repair: mix(r, norm([[0.35, f(p, 'forgiveness')], [0.3, f(p, 'gentleness')], [0.25, f(p, 'liveliness')], [-0.3, avoidance]]), 0.55),
  };
  (p as any)._loving = L; return L;
}
export const attachmentWord = (L: Loving) => L.anxiety > 0.6 && L.avoidance > 0.6 ? 'fearful' : L.anxiety > 0.6 ? 'anxious' : L.avoidance > 0.6 ? 'avoidant' : 'secure';

// What wears on a couple this month, from each side, and what bleeds it off.
function strain(w: World, p: Person, q: Person) {
  const Lp = loving(w, p), Lq = loving(w, q);
  let s = 0.02 + 0.06 * p.stress + 0.06 * q.stress + (p.drinks ? 0.05 : 0) + (q.drinks ? 0.05 : 0) + (p.savings < -3 || q.savings < -3 ? 0.04 : 0);
  s += 0.02 * Math.max(0, Lp.anxiety) * Math.max(0, Lq.avoidance) + 0.02 * Math.max(0, Lq.anxiety) * Math.max(0, Lp.avoidance); // the one who needs more and the one who gives less
  let d = 0; for (const k of ['freedom', 'tradition', 'success', 'lovedOnes', 'fairness']) d += Math.abs((p.values[k] ?? 0) - (q.values[k] ?? 0)); s += 0.006 * d;
  const ease = 0.025 * (Math.max(-1, Lp.responsive) + Math.max(-1, Lq.responsive) + 2) / 2;
  return s - ease;
}

// One of them raises it; the other answers. Expressions are named for what research shows matters in couples' fights.
function row(w: World, p: Person, q: Person, tension: number) {
  const Lp = loving(w, p);
  const feats = new Set<Feature>(['family', 'private', 'love']);
  const subject = p.drinks || q.drinks ? 'the drinking' : p.savings < -3 || q.savings < -3 ? 'money' : q.stress > 0.6 ? `${q.sex === 'f' ? 'her' : 'his'} moods` : Lp.anxiety > 0.6 ? 'how little time they had together' : 'the same old thing';
  const o = run(w, {
    type: 'quarrel', actor: p, target: q, others: [], thing: subject, features: feats, families: ['anger', 'humility', 'withdrawal', 'pride'],
    only: { anger: ['criticise', 'contempt'], humility: ['repairjoke', 'soften'], withdrawal: ['stonewall'], pride: ['defend'] },
    causeLabel: `it had been building between them (${subject})`, w: 1,
    extra: [privC('tension', tension > 0.8 ? 'it had been building for months' : 'it had been building', clamp(tension, 0, 1), 1, 0.2, undefined, 0.4)],
    familyExtra: {
      anger: [privC('crit', Lp.criticism > 0.5 ? 'says what is wrong with people, not with what they did' : 'keeps it to the matter in hand', clamp(0.5 + Lp.criticism / 2.5, 0, 1), 1, 0.2, undefined, 0.5), bondC(w, p, q, 'like', -1)],
      humility: [privC('repair', Lp.repair > 0.5 ? 'knows how to take the heat out of a row' : 'does not know how to stop a row once it starts', clamp(0.5 + Lp.repair / 2.5, 0, 1), 1, 0.2, undefined, 0.5), bondC(w, p, q, 'like', 1)],
      withdrawal: [privC('wall', Lp.stonewall > 0.5 ? 'goes silent when it gets close' : 'stays in the room', clamp(0.5 + Lp.stonewall / 2.5, 0, 1), 1, 0.2, undefined, 0.5)],
      pride: [privC('defend', Lp.defensive > 0.5 ? 'hears every complaint as an attack' : 'can hear a complaint', clamp(0.5 + Lp.defensive / 2.5, 0, 1), 1, 0.2, undefined, 0.5)],
    },
  });
  return o;
}

// Care, the way this person shows it: a small moment now and then, more from the responsive.
const CARE: Record<Loving['care'], (a: string, t: string, his: string) => string> = {
  practical: (a, t) => `${a} fixed what had been bothering ${t} without being asked`,
  time: (a, t) => `${a} kept Sunday free for ${t}, as always`,
  words: (a, t, his) => `${a} told everyone at the Anchor how proud ${his === 'her' ? 'she' : 'he'} was of ${t}`,
  gifts: (a, t) => `${a} brought ${t} something back from town, for no reason`,
  touch: (a, t) => `${a} still holds ${t}'s hand at the co-op`,
};

export function loveTick(w: World) {
  if (!on()) return;
  for (const p of live(w)) {
    if (p.partner == null || p.id > p.partner) continue;
    const q = P(w, p.partner); if (q.status !== 'in') continue;
    const k = 'couple:' + q.id; const t = (p as any)[k] ?? 0;
    const tension = clamp(t * 0.92 + strain(w, p, q), 0, 1.5); (p as any)[k] = tension;
    // A row: when it has built, the one more bothered raises it (the anxious, the impatient).
    if (tension > 0.35 && w.rng.chance(0.15 * tension)) {
      const raiser = (loving(w, p).anxiety - f(p, 'patience')) >= (loving(w, q).anxiety - f(q, 'patience')) ? p : q; const other = raiser === p ? q : p;
      const o = row(w, raiser, other, tension);
      if (o) {
        (p as any)[k] = tension * (o.family === 'humility' ? 0.3 : o.family === 'anger' ? 0.8 : 0.6);
        if (o.expr.id === 'contempt') { const b = bond(w, other.id, raiser.id); b.respect = clamp(b.respect - 0.05, -1, 1); (other as any)['contempt:' + raiser.id] = ((other as any)['contempt:' + raiser.id] ?? 0) + 1; }
        if (o.expr.id === 'stonewall') addStress(other, 'wall', `${raiser.first} going silent`, 0.05, o.event.id);
      }
    }
    // Care: now and then, as each shows it.
    for (const [a, b] of [[p, q], [q, p]] as const) {
      const L = loving(w, a); if (!w.rng.chance(0.01 * (1 + clamp(L.responsive, -1, 1.5)))) continue;
      const e = addEvent(w, { type: 'care', who: [a.id, b.id], text: CARE[L.care](`@${a.id}`, `@${b.id}`, a.sex === 'f' ? 'her' : 'his') + '.', causes: [stateCause(`together since ${year(a.psince)}`, 0.3)], vis: 'local', evidence: [ev(a.id, 'bond:' + b.id, 1, 0.6, 0.7), ev(a.id, 'altruism', 1, 0.3, 0.4)], w: 0.6 });
      broadcast(w, e); remember(w, b, a, e.id, 0.04, 0.01, 0.03, 'looks after me'); (p as any)[k] = Math.max(0, ((p as any)[k] ?? 0) - 0.05);
    }
  }
}
