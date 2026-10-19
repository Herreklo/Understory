// Migration: leaving town, coming home, and coming back for a funeral.

import { clamp } from './rng';
import { SETTING } from './setting';
import {
  type Cause,
  type Person,
  type World,
  OFF,
  age,
  live,
  P,
  bond,
  likeOf,
  remember,
  addEvent,
  broadcast,
  addStress,
  addEmotion,
  year,
} from './world';
import { around, hoods, jobSet, moved, staffOf } from './scale';
import { z01, type Option } from './decide';
import { generatePerson } from './generate';
import { friendsOf, decide } from './grammar';
import { stateCause, eventCause, ev, facetC, valueC, pubC, learned, attachC } from './considerations';
import { leftBy } from './love';
import { resolveWants, homeOf } from './time';
import type { Feature } from './features';
import { newcomer, settleIn } from './work';

const NONE = new Set<Feature>();
export function leaveTown(w: World, p: Person, kind: string, text: string, why: Cause[], rec?: any) {
  const pl = p.job ? w.placeById.get(p.job)! : null;
  if (pl && pl.lead === p.id) pl.lead = null;
  jobSet(w, p, null);
  p.lead = false;
  // A partner and children are not left behind in silence. Either the household goes (the more they like each other and the less the
  // partner is rooted here, the likelier), or the one who stays is left, and knows it.
  const minors = p.kids.map(k => P(w, k)).filter(k => k.status === 'in' && age(w, k) < 18);
  let tail = '';
  if (OFF.has('household') && p.partner != null && kind !== 'study') {
    const q = P(w, p.partner);
    q.partner = null;
    q.pstat = null;
    p.partner = null;
    p.pstat = null;
  } else if (p.partner != null && kind !== 'study' && kind !== 'family') {
    const q = P(w, p.partner);
    const mutual = Math.min(likeOf(w, p.id, q.id), likeOf(w, q.id, p.id));
    const together = w.rng.chance(clamp(0.45 + 0.5 * mutual - 0.35 * homeOf(q).like, 0.05, 0.95));
    if (together) {
      for (const k of minors) {
        k.status = 'away';
        moved();
        k.awayKind = 'family';
        k.awaySince = w.t;
      }
      leaveTown(w, q, 'family', '', [], undefined);
      tail = minors.length ? ` @${q.id} and the children went too.` : ` @${q.id} went too.`;
    } else {
      q.partner = null;
      q.pstat = null;
      p.partner = null;
      p.pstat = null;
      tail = ` @${q.id}${minors.length ? ' and the children' : ''} stayed, and that was the end of the marriage.`;
      remember(w, q, p, w.events.length, -0.35, -0.2, -0.35, 'left me');
      remember(w, p, q, w.events.length, -0.1, 0, -0.1, 'would not come');
      addStress(q, 'left', `@${p.id} left`, 0.14);
      leftBy(w, q);
      addEmotion(w, q, 'left', `left by @${p.id}`, -0.2, 18);
    }
  } else if (
    !OFF.has('household') &&
    kind !== 'study' &&
    kind !== 'family' &&
    minors.length &&
    !minors.some(k => k.parents.some(pa => pa !== p.id && P(w, pa).status === 'in'))
  ) {
    for (const k of minors) {
      k.status = 'away';
      moved();
      k.awayKind = 'family';
      k.awaySince = w.t;
    }
    tail = ' The children went too.';
  }
  p.status = 'away';
  moved();
  p.awayKind = kind;
  p.awaySince = w.t;
  p.student = kind === 'study';
  for (const h of p.habits)
    if (!h.broken) {
      h.broken = w.t;
      h.breakWhy = 'left town';
    } // routines stay behind
  if (kind === 'family') return; // the household's move is one event, the mover's
  const hl = homeOf(p).like;
  const e = addEvent(w, {
    type: 'left',
    who: [p.id, ...(p.partner != null && P(w, p.partner).status === 'away' ? [p.partner] : [])],
    text: text.replace(/\.$/, '') + '.' + tail,
    causes: why,
    vis: 'public',
    decision: rec,
    evidence: [
      ev(p.id, 'inquisitiveness', 1, 0.5, 0.5),
      ...(hl < 0 ? [ev(p.id, 'attach:home', -1, 0.6, 0.6)] : hl > 0.3 ? [ev(p.id, 'attach:home', 1, 0.3, 0.4)] : []),
    ],
    w: 2,
  });
  broadcast(w, e);
  for (const q of friendsOf(w, p)) addEmotion(w, q, 'miss' + p.id, `misses @${p.id}`, -0.05, 6, e.id);
  const home = homeOf(p);
  if (home.like > 0.35) {
    addEmotion(w, p, 'homesick', 'homesick', -0.1 * home.like, 18, e.id);
    addStress(p, 'homesick', 'missing home', 0.06, e.id);
  }
  resolveWants(w, p, 'escape', 'elsewhere', 'achieved', e.id);
  // Whoever said they'd go too has to decide now.
  if (kind !== 'study')
    for (const q of hoods(w) === 1 ? live(w) : around(w, p)) {
      const y = q.wants.find(x => !x.done && x.kind === 'escape' && x.pursuit?.owner === p.id);
      if (!y) continue;
      const tied = q.partner != null || q.kids.some(k => P(w, k).status === 'in' && age(w, P(w, k)) < 18);
      const d = decide(w, q, `@${p.id} is leaving`, [
        {
          id: 'go',
          label: 'go too',
          considerations: [
            pubC('bond', `would follow @${p.id} anywhere`, (likeOf(w, q.id, p.id) + 1) / 2),
            facetC(q, 'dependence', NONE, 1, 4),
            attachC(q, -1),
          ],
        },
        {
          id: 'stay',
          label: 'stay after all',
          considerations: [
            pubC('ties', tied ? 'people here depend on them' : 'nobody here depends on them', tied ? 0.9 : 0.2),
            attachC(q, 1),
            facetC(q, 'fearfulness', NONE, 1, 3),
          ],
        },
      ]);
      if (d.chosen === 'go') {
        y.done = 'achieved';
        y.doneAt = e.id;
        leaveTown(
          w,
          q,
          'work',
          `@${q.id} went with @${p.id}, as ${q.sex === 'f' ? 'she' : 'he'} had said ${q.sex === 'f' ? 'she' : 'he'} would.`,
          [eventCause(w, e.id, 0.5), ...d.why.slice(0, 2)],
          d.rec,
        );
      } else {
        y.done = 'abandoned';
        y.doneAt = e.id;
        const e2 = addEvent(w, {
          type: 'stayed',
          who: [q.id, p.id],
          text: `When it came to it, @${q.id} stayed and let @${p.id} go alone.`,
          causes: d.why.slice(0, 3),
          vis: 'local',
          decision: d.rec,
          evidence: [ev(q.id, 'attach:home', 1, 0.6, 0.6)],
          w: 1.4,
        });
        broadcast(w, e2);
        remember(w, p, q, e2.id, -0.1, -0.1, -0.15, "said they would come, and didn't");
      }
    }
}
function comeHome(w: World, p: Person, text: string, why: Cause[], rec?: any) {
  const yrs = Math.max(1, Math.round((w.t - p.awaySince!) / 12));
  for (const sk of ['writing', 'bookkeeping', 'care', 'teaching'])
    if (p.skills[sk]) p.skills[sk].r = Math.max(p.skills[sk].r, Math.min(p.skills[sk].ceil, 1100 + yrs * 40 * (p.awayKind === 'study' ? 1.5 : 1)));
  p.status = 'in';
  moved();
  p.student = false;
  p.stress = clamp(p.stress - 0.1, 0, 1);
  p.emotions = p.emotions.filter(e => e.k !== 'homesick');
  delete p.sources['homesick'];
  // The household that went together comes back together.
  for (const id of [...(p.partner != null ? [p.partner] : []), ...p.kids]) {
    const q = P(w, id);
    if (q.status === 'away' && q.awayKind === 'family') {
      q.status = 'in';
      moved();
      q.student = false;
    }
  }
  // Years away often end with someone met there, who comes too.
  let brought: Person | null = null;
  if (p.partner == null && age(w, p) >= 25 && age(w, p) <= 45 && yrs >= 3 && w.rng.chance(0.4)) {
    const q = generatePerson(w, {
      age: Math.max(22, age(w, p) + w.rng.int(-4, 4)),
      sex: p.attraction === 'both' ? (w.rng.chance(0.5) ? 'f' : 'm') : p.attraction,
      founder: true,
    });
    q.attraction = q.attraction === 'both' ? 'both' : p.sex;
    settleIn(w, q);
    p.partner = q.id;
    q.partner = p.id;
    p.pstat = q.pstat = w.rng.chance(0.5) ? 'married' : 'dating';
    p.psince = q.psince = w.t - 12 * w.rng.int(1, Math.min(yrs, 6));
    for (const [x, y] of [
      [p, q],
      [q, p],
    ] as const) {
      const r = bond(w, x.id, y.id);
      r.fam = 1;
      r.like = 0.45 + w.rng.next() * 0.3;
      r.trust = 0.4;
      r.respect = 0.2;
    }
    brought = q;
  }
  const e = addEvent(w, {
    type: 'home',
    who: [p.id, ...(brought ? [brought.id] : [])],
    text:
      (text || `@${p.id} came back to ${SETTING.name} after ${yrs} year${yrs > 1 ? 's' : ''} away`).replace(/\.$/, '') +
      (brought ? `, and brought @${brought.id} too.` : '.'),
    causes: why,
    vis: 'public',
    decision: rec,
    evidence: [ev(p.id, 'attach:home', 1, 0.8, 0.7), ev(p.id, 'sentimentality', 1, 0.5, 0.6)],
    w: 2,
  });
  broadcast(w, e);
  // Old routines come back first, if they were loved.
  for (const h of p.habits
    .filter(h => h.breakWhy === 'left town')
    .sort((a, b) => b.adherence - a.adherence)
    .slice(0, 2))
    if (w.rng.chance(0.6)) {
      h.broken = undefined;
      h.since = w.t;
      h.from = 'picked up where they left off';
    }
}
export function maybeHomeForFuneral(w: World, c: Person, p: Person, ref: number) {
  const opts: Option[] = [
    { id: 'home', label: 'come home and stay', considerations: [attachC(c, 1), valueC(c, 'lovedOnes')] },
    { id: 'back', label: 'go back to the city after the funeral', considerations: [valueC(c, 'success'), attachC(c, -1)] },
  ];
  const d = decide(w, c, 'a parent’s funeral', opts);
  if (d.chosen === 'home') comeHome(w, c, `@${c.id} came home for @${p.id}'s funeral and stayed.`, [eventCause(w, ref, 0.5), ...d.why], d.rec);
}
export function migrationTick(w: World) {
  for (const p of w.people) {
    if (p.status !== 'away') continue;
    const yrs = (w.t - p.awaySince!) / 12;
    const oldParent = p.parents.map(k => P(w, k)).find(q => q.status === 'in' && (age(w, q) > 72 || q.ill > 0));
    const home = homeOf(p);
    const pull = 0.3 + 1.4 * z01(home.like * 2.2);
    // People who left to study think of home most around the age of settling down; a want for family pulls hardest.
    const settling = age(w, p) >= 26 && age(w, p) <= 38 ? 1.6 + 0.6 * z01(p.values.lovedOnes) : 1;
    let c = p.awayKind === 'study' ? (yrs >= 3 ? 0.02 * pull * settling : 0) : 0.005 * pull;
    if (oldParent) c *= 2.5;
    if (p.awayKind !== 'study' && yrs < 1.5) c = 0;
    if (home.like < 0 && !oldParent && p.awayKind !== 'study') c = 0; // nobody comes home for nothing
    if (w.t - (p.tried['stayaway']?.t ?? -99) < (oldParent ? 18 : 48)) c = 0; // a decision to stay holds for years
    if (!w.rng.chance(c)) continue;
    const opts: Option[] = [
      {
        id: 'home',
        label: 'come home',
        considerations: [
          attachC(p, 1),
          pubC('parent', oldParent ? `@${oldParent.id} is getting old` : 'parents are fine', oldParent ? 0.9 : 0.3),
          valueC(p, 'lovedOnes', 1, 4),
        ],
      },
      { id: 'stay', label: 'stay away', considerations: [valueC(p, 'success'), facetC(p, 'inquisitiveness', NONE, 1, 4, 0.55), attachC(p, -1)] },
    ];
    const d = decide(w, p, 'thinking of home', opts);
    if (d.chosen === 'home') comeHome(w, p, '', [...(p.awayKind === 'study' ? [stateCause('finished studying', 0.3)] : []), ...d.why], d.rec);
    else learned(w, p, 'stayaway', true);
  }
  const adults = live(w).filter(p => age(w, p) >= 18).length;
  const sc = (w as any).townScale > 1.5 ? (w as any).townScale : 1; // a city draws newcomers as so many towns would
  if (sc === 1) {
    if (adults < 42 && w.rng.chance(0.04)) {
      const open = w.places.filter(pl => live(w).filter(q => q.job === pl.id).length < pl.cap);
      if (open.length) newcomer(w, w.rng.pick(open));
    }
  } else
    for (let i = 0; i < Math.round(sc); i++)
      if (adults < 42 * sc && w.rng.chance(0.04)) {
        const open = w.places.filter(pl => staffOf(w, pl.id).length < pl.cap);
        if (open.length) newcomer(w, w.rng.pick(open));
      }
}
