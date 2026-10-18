// Groups: people making something together. The shape is general (members, binding, shared work, authorship, credit,
// chemistry, standing, leaving, replacement, break-up); what the work is and how the world counts it comes from the setting.
// Chemistry is a small-group thing: past six people it is cliques and pairs, so it is only computed for small groups.

import { clamp } from './rng';
import { SETTING } from './setting';
import { OFF, type World, type Person, type Group, type Cause, age, live, P, facet, bond, peekBond, likeOf, remember, addEvent, broadcast, addStress, addEmotion, year, logistic } from './world';
import { z01 } from './decide';
import { run, decide, friendsOf, family, traitCause, stateCause, eventCause, ev, facetC, bondC, pubC, privC, learned } from './grammar';
import { pursuing, practise, resolveWants, formHabit } from './time';
import { regard } from './regard';

// The group remembers who its rows are about. This row counts; rows and warnings lapse after three years.
// The second row in three years earns a word; a third, or a row after a standing warning, an asking-to-leave.
export function escalation(rows: number[], warnedAt: number | undefined, now: number): 'row' | 'word' | 'asked' {
  const recent = rows.filter(t => now - t <= 36).length + 1;
  if (recent >= 3 || (warnedAt != null && now - warnedAt <= 36)) return 'asked';
  return recent >= 2 ? 'word' : 'row';
}
import { topSources } from './world';
const topSourcesLabel = (p: Person) => topSources(p, 2).map(s => s.label).join(', ') || 'strain';
import type { Feature } from './features';

type Kind = (typeof SETTING.groupKinds)[number];
const kindOf = (g: Group): Kind => SETTING.groupKinds.find(k => k.id === g.kind)!;
const she = (p: Person) => (p.sex === 'f' ? 'she' : 'he');
const her = (p: Person) => (p.sex === 'f' ? 'her' : 'him');
const names = (ids: number[]) => ids.map(i => '@' + i).join(ids.length > 2 ? ', ' : ' and ').replace(/, ([^,]*)$/, ' and $1');
const bestSkill = (p: Person, k: Kind) => Math.max(...k.skills.map(s => p.skills[s]?.r ?? 0));
export const groupOf = (w: World, p: Person) => (p.group != null ? w.groups[p.group] : undefined);

// ---------- chemistry: what the people add up to, beyond their skills ----------
export function chemistry(w: World, g: Group): { chem: number; why: Cause[] } {
  const ms = g.members.map(i => P(w, i)); const why: Cause[] = [];
  if (ms.length < 2) return { chem: 0.5, why };
  if (ms.length > 6) return { chem: 0.5, why: [stateCause('too many to be one thing', 1)] };
  let like = 0, n = 0, taste = 0;
  for (const a of ms) for (const b of ms) if (a !== b) { like += likeOf(w, a.id, b.id); n++; taste += 1 - Math.min(2, Math.abs(facet(a, 'aesthetic') - facet(b, 'aesthetic')) + Math.abs(a.values.freedom - b.values.freedom) * 0.5) / 2; }
  like /= n; taste /= n;
  const glue = ms.map(p => [p, (facet(p, 'altruism') + facet(p, 'gentleness') + p.aptitudes.socialInsight) / 3] as const).sort((a, b) => b[1] - a[1])[0];
  const egos = ms.filter(p => facet(p, 'modesty') < -1);
  const feud = ms.flatMap(a => ms.filter(b => b !== a && likeOf(w, a.id, b.id) < -0.2).map(b => [a, b] as const))[0];
  // Chemistry is not harmony. Complementary strengths count; so does the one difficult person nobody else can replace; and friends who never push each other make less.
  const k = kindOf(g);
  const tops = ms.map(p => k.skills.slice().sort((x, y) => (p.skills[y]?.r ?? 0) - (p.skills[x]?.r ?? 0))[0]);
  const spread = new Set(tops).size / Math.min(ms.length, k.skills.length);
  const pushers = ms.filter(p => facet(p, 'creativity') > 0.8 || facet(p, 'perfectionism') > 1).length;
  const star = ms.map(p => [p, bestSkill(p, k)] as const).sort((a, b) => b[1] - a[1]);
  const indispensable = star.length > 1 && star[0][1] - star[1][1] > 150 ? star[0][0] : undefined;
  let chem = 0.5 + 0.3 * like + 0.2 * (taste - 0.5) + 0.15 * (z01(glue[1]) - 0.5) + 0.12 * (spread - 0.5) + (indispensable ? 0.08 : 0) - (like > 0.5 && pushers === 0 ? 0.08 : 0) - 0.12 * Math.max(0, egos.length - 1) - (feud ? 0.15 : 0);
  if (like > 0.35) why.push({ kind: 'bond', label: 'they genuinely like each other', weight: 0.4 }); else if (like < 0) why.push({ kind: 'bond', label: 'they do not much like each other', weight: 0.4 });
  if (spread > 0.75 && ms.length > 2) why.push({ kind: 'state', label: 'each brings something the others cannot', weight: 0.3 });
  if (indispensable) why.push({ kind: 'trait', label: `@${indispensable.id} is in a different class${likeOf(w, indispensable.id, ms.find(p => p !== indispensable)!.id) < 0 ? ', and hard to be around' : ''}`, weight: 0.3, who: indispensable.id });
  if (like > 0.5 && pushers === 0) why.push({ kind: 'state', label: 'nobody pushes anybody', weight: 0.3 });
  if (taste > 0.65) why.push({ kind: 'value', label: 'they hear the same thing', weight: 0.3 }); else if (taste < 0.4) why.push({ kind: 'value', label: 'they want it to sound like different things', weight: 0.3 });
  if (glue[1] > 0.6) why.push({ kind: 'trait', label: `@${glue[0].id} holds it together`, weight: 0.3, who: glue[0].id, key: 'altruism' });
  if (egos.length > 1) why.push({ kind: 'trait', label: `${names(egos.map(p => p.id))} each need to be the one who matters`, weight: 0.3 });
  if (feud) why.push({ kind: 'bond', label: `bad blood between @${feud[0].id} and @${feud[1].id}`, weight: 0.4 });
  return { chem: clamp(chem, 0, 1), why };
}

// ---------- forming ----------
function tryForm(w: World, p: Person, k: Kind) {
  const r = bestSkill(p, k); if (r < 1150 || age(w, p) < 15 || age(w, p) > 50) return;
  const pool = around(w, p).filter(q => q !== p && q.group == null && age(w, q) >= 15 && Math.abs(age(w, q) - age(w, p)) < 16 && bestSkill(q, k) > 1080 && k.skills.some(s => (q.skills[s]?.interest ?? 0) >= 1) && likeOf(w, p.id, q.id) > 0.2 && likeOf(w, q.id, p.id) > 0.15)
    .map(q => [q, likeOf(w, p.id, q.id) + 0.3 * z01((bestSkill(q, k) - 1200) / 150) + w.rng.normal() * 0.2] as const).sort((a, b) => b[1] - a[1]).slice(0, k.maxSize - 1);
  if (pool.length + 1 < k.minSize) return;
  const g: Group = { id: w.groups.length, kind: k.id, name: w.rng.pick(k.names.filter(n => !w.groups.some(x => x.name === n))) ?? k.names[0], members: [p.id, ...pool.map(x => x[0].id)], founder: p.id, since: w.t, works: [], standing: 0, chem: 0.5, chemWhy: [], events: [], lastWork: w.t, lastShow: w.t, lowSince: -1, former: [] };
  w.groups.push(g);
  for (const m of g.members) { P(w, m).group = g.id; formHabit(w, P(w, m), 'practise', `${g.name} rehearses twice a week`, 0.6, false); }
  const c = chemistry(w, g); g.chem = c.chem; g.chemWhy = c.why;
  const e = addEvent(w, { type: 'group:formed', who: g.members, text: `${names(g.members)} started a ${k.noun}: ${g.name}.`, causes: [{ kind: 'want', label: `@${p.id} had been wanting to be heard`, weight: 0.5, key: k.wantKind, who: p.id }, ...c.why.slice(0, 2)], vis: 'public', evidence: g.members.map(m => ev(m, 'sociability', 1, 0.3, 0.4)), w: 1.8 });
  broadcast(w, e); g.events.push(e.id);
  for (const m of g.members) addEmotion(w, P(w, m), 'group', `something starting with ${g.name}`, 0.12, 8, e.id);
}

// A title nobody in town has used: the setting's fixed titles first, then its patterns over its own words.
export function newTitle(w: World): string {
  const T = SETTING.titles; const used = new Set(w.groups.flatMap(x => x.works.map(y => y.title)));
  const free = T.fixed.filter(t => !used.has(t)); if (free.length) return w.rng.pick(free);
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_, k) => w.rng.pick((T as any)[k] as string[]));
  for (let i = 0; i < 40; i++) { const t = fill(w.rng.pick(T.patterns)); if (!used.has(t) && !/(\b\w+\b).*\b\1\b/.test(t)) return t; }
  return `Song ${used.size + 1}`;
}

// ---------- moments: a great night shapes some of those who saw it ----------
// Most of the room feels nothing much. Some are lit up for a while and it passes. A few, the inclined and the young, are changed: they pick up
// the instrument. A spark lasts if within three years they have got good enough to want to be heard, joined a band, or have a close friend
// who plays; otherwise it was a phase. Uses its own random stream, so with the mechanism off the world is exactly as it was.
const imp = (a: number) => a < 10 ? 0 : a < 12 ? 0.5 : a <= 25 ? 1 : a <= 35 ? 1 - 0.07 * (a - 25) : a <= 45 ? 0.3 - 0.02 * (a - 35) : 0.05; // the impressionable years
import { inclination } from './inclination';
import { around, aroundAll, hoodOf, hoods, idx, near, placeOf, staffOf, typeOf } from './scale';
export { inclination };
function moment(w: World, g: Group, k: Kind, e: { id: number; t: number }, ms: Person[]) {
  const prev = w.rng; w.rng = w.streams.moments ?? w.rng;
  try {
    const close = new Set<number>(); for (const m of ms) { if (m.partner != null) close.add(m.partner); for (const f of m.friends) close.add(f); for (const c of m.kids) close.add(c); for (const pa of m.parents) close.add(pa); }
    const audience = near(w, ...ms.map(m => m.id)).filter(x => !ms.includes(x) && age(w, x) >= 10 && w.rng.chance(clamp(0.08 + (close.has(x.id) ? 0.35 : 0) + (x.habits.some(h => !h.broken && /Anchor/.test(h.label)) ? 0.25 : 0) + (age(w, x) >= 15 && age(w, x) <= 30 ? 0.08 : 0) + 0.06 * Math.max(0, ...k.skills.map(s => x.skills[s]?.interest ?? 0)), 0, 0.8)));
    (w.stats as any).moments ??= []; const rec = { t: w.t, group: g.id, audience: audience.length, sparks: [] as number[], sparkFriend: [] as boolean[], glows: [] as number[] }; (w.stats as any).moments.push(rec);
    let mostMoved: Person | null = null, best = -9;
    for (const x of audience) {
      const sk = k.skills.slice().sort((a, b) => inclination(x, b) - inclination(x, a))[0]; const s = x.skills[sk]; if (!s) continue;
      const z = inclination(x, sk), a = age(w, x), im = imp(a);
      (x as any).sawGreat = [...((x as any).sawGreat ?? []), { t: w.t, sk, z, a }];
      if (s.interest < 2 && !x.tried['spark:' + sk] && w.rng.chance(im * 0.25 / (1 + Math.exp(-2.5 * (z - 0.6))))) {
        x.tried['spark:' + sk] = { t: w.t, ok: true, n: s.interest }; s.interest = 2; ((x as any).interestFrom ??= {})[sk] = 'moment'; rec.sparks.push(x.id); rec.sparkFriend.push([...x.friends].some(f => (w.byId.get(f)?.skills[sk]?.interest ?? 0) === 2));
        const ev2 = addEvent(w, { type: 'spark', who: [x.id], text: `Since the night ${g.name} played the Anchor, @${x.id} has been teaching ${x.sex === 'f' ? 'herself' : 'himself'} ${sk === 'vocals' ? 'to sing' : sk}.`, causes: [eventCause(w, e.id, 0.6), stateCause(a < 26 ? `${Math.floor(a)}, and it was the first time ${x.sex === 'f' ? 'she' : 'he'} had heard anything like it` : 'it stayed with them', 0.4)], vis: 'local', evidence: [ev(x.id, 'aesthetic', 1, 0.5, 0.6)], w: 1.3 });
        broadcast(w, ev2);
      } else if (w.rng.chance((0.05 + 0.3 / (1 + Math.exp(-1.5 * z))) * (0.5 + 0.5 * im))) {
        rec.glows.push(x.id); addEmotion(w, x, 'glow', `still full of the night ${g.name} played`, 0.08, 2, e.id);
        const moved = z + im + w.rng.normal() * 0.3; if (moved > best && !x.tried['glowline:' + g.id]) { best = moved; mostMoved = x; }
        // The second time a night takes hold of the same person, they are a fan, and that is said once.
        else if (x.tried['glowline:' + g.id] && !x.tried['fan:' + g.id] && w.t - x.tried['glowline:' + g.id].t >= 12) { learned(w, x, 'fan:' + g.id, true); const ev4 = addEvent(w, { type: 'glow', who: [x.id], text: `@${x.id} has not missed a night when ${g.name} played since.`, causes: [eventCause(w, e.id, 0.6)], vis: 'local', evidence: [], w: 0.5 }); broadcast(w, ev4); }
      }
    }
    if (mostMoved) { const x = mostMoved; learned(w, x, 'glowline:' + g.id, true); const ev3 = addEvent(w, { type: 'glow', who: [x.id], text: w.rng.pick([`@${x.id} talked about nothing but ${g.name} for a week.`, `@${x.id} went home humming the last song and could not stop.`, `For days afterwards, @${x.id} kept bringing up the night ${g.name} played.`]), causes: [eventCause(w, e.id, 0.7)], vis: 'local', evidence: [], w: 0.6 }); broadcast(w, ev3); }
  } finally { w.rng = prev; }
}
// A spark that found nothing to hold on to fades: three years on, not good enough to want to be heard, not in a band, no friend who plays.
// How a love of music is called out (Hidi & Renninger's four phases, folded into three levels): someone who plays nearby (a parent at
// home, a partner, a close friend) or a great night triggers interest (level 1), which fades after two years without anything to keep
// it alive; kept up for a year, it becomes the person's own (level 2). Every step scales with inclination (the inclined notice more and
// seek it out) and with age (childhood and youth most). Uses the moments stream, so with it off the rest of the world is untouched.
// Childhood and youth most; by forty few take up an instrument, however many friends play (measured: a friend-triggered median age of 60 before this curve was steepened).
const devImp = (a: number) => a < 4 ? 0 : a < 10 ? 0.9 : a <= 18 ? 1 : a <= 30 ? 1 - 0.07 * (a - 18) : a <= 40 ? 0.16 - 0.012 * (a - 30) : 0.02;
const devRate = () => ((globalThis as any).DEV_RATE as number | undefined) ?? 0.015; // calibration hook, no process access (browser-safe) // calibrated so the share who play matches the dealt rule (BOARD.md, 10b)
export function develop(w: World) {
  if (OFF.has('latent')) return;
  const prev = w.rng; w.rng = w.streams.moments ?? w.rng;
  try {
    const skills = OFF.has('latentall') ? SETTING.hobbies : Object.keys(SETTING.skills);
    for (const p of live(w)) {
      const a = age(w, p); if (a < 4) continue;
      for (const sk of skills) {
        const s = p.skills[sk]; if (!s) continue;
        const music = SETTING.hobbies.includes(sk);
        // Who does this skill, close by: loves it (interest 2), or for a trade, works at it.
        const does = (id: number | null | undefined) => { if (id == null) return false; const q = w.byId.get(id); if (!q || q.status !== 'in') return false; return q.skills[sk]?.interest === 2 || (!music && q.job != null && w.placeById.get(q.job)?.skill === sk); };
        const home = a < 18 && p.parents.some(does), near = does(p.partner) || [...p.friends].some(does);
        const atWork = !music && p.job != null && w.placeById.get(p.job)?.skill === sk;
        const school = a >= 6 && a <= 16 && SETTING.school.includes(sk);
        const tie = p.tried['pupil:' + sk]; const teacher = tie && !OFF.has('teacher') ? w.byId.get(tie.n) : undefined; const taught = !!teacher && teacher.status === 'in';
        const src = home ? 'home' : taught ? 'teacher' : near ? 'friend' : atWork ? 'work' : school ? 'school' : null;
        const key = 'int:' + sk; const st = p.tried[key];
        if (!src) { if (s.interest === 1 && st && w.t - st.t > 24) { s.interest = 0; delete p.tried[key]; delete (p as any)['int1:' + sk]; } continue; }
        if (s.interest === 2) continue;
        const z = inclination(p, sk); const pull = devRate() * (home ? 1.5 : taught ? 1.2 : near ? 0.6 : atWork ? 0.6 : 0.5) * devImp(a) / (1 + Math.exp(-2.5 * (z - 0.6)));
        if (s.interest === 0) { if (w.rng.chance(pull * 4)) { s.interest = 1; p.tried[key] = { t: w.t, ok: true, n: 1 }; (p as any)['int1:' + sk] = w.t; } continue; }
        p.tried[key] = { t: w.t, ok: true, n: (st?.n ?? 0) + 1 }; const since = ((p as any)['int1:' + sk] ??= w.t) as number;
        if (w.t - since >= 12 && w.rng.chance(pull)) {
          s.interest = 2; ((p as any).interestFrom ??= {})[sk] = src;
          const word = SETTING.skillWords[sk] ?? sk; const her = p.sex === 'f' ? 'her' : 'his';
          // Written down when a person brought it about, or when music came from nowhere; a trade learned at work is ordinary life.
          if (src === 'work' || (src === 'school' && !music)) continue;
          if (src === 'teacher') { const T = teacher!; const rec = T.pupils.find(x => x.id === p.id && x.sk === sk); if (rec) rec.took = true; delete p.tried['pupil:' + sk];
            const e1 = addEvent(w, { type: 'takenup', who: [p.id, T.id], text: `@${p.id} has taken to ${word}; @${T.id} taught ${p.sex === 'f' ? 'her' : 'him'}.`, causes: [stateCause(`@${T.id} took ${her === 'her' ? 'her' : 'him'} on`, 0.5), traitCause(T, 'patience', 0.3, 1)], vis: 'local', evidence: [ev(T.id, 'patience', 1, 0.3, 0.6), ev(T.id, 'altruism', 1, 0.3, 0.6)], w: 0.8 }); broadcast(w, e1); continue; }
          if (src === 'school') { const e0 = addEvent(w, { type: 'takenup', who: [p.id], text: `@${p.id} has taken up ${word}, and nobody quite knows where it came from.`, causes: [traitCause(p, 'aesthetic', 0.5, 1), stateCause('music lessons at school', 0.3)], vis: 'local', evidence: [ev(p.id, 'aesthetic', 1, 0.4, 0.6)], w: 0.8 }); broadcast(w, e0); continue; }
          const who = home ? w.byId.get(p.parents.find(does)!)! : w.byId.get(does(p.partner) ? p.partner! : [...p.friends].find(does)!)!;
          const facetKey = Object.entries(SETTING.inclination[sk] ?? {}).filter(([k]) => k in p.facets).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]))[0];
          const why = facetKey ? [traitCause(p, facetKey[0], 0.4, facetKey[1] > 0 ? 1 : -1)] : [];
          const e = addEvent(w, { type: 'takenup', who: [p.id, who.id], text: home ? `@${p.id} has taken to ${word}, like ${her} ${who.sex === 'f' ? 'mother' : 'father'}, @${who.id}.` : `@${p.id} has taken to ${word}; @${who.id} got ${p.sex === 'f' ? 'her' : 'him'} into it.`, causes: [stateCause(home ? `grew up with @${who.id} at it` : `@${who.id} lives for it`, 0.5), ...why], vis: 'local', evidence: facetKey ? [ev(p.id, facetKey[0], facetKey[1] > 0 ? 1 : -1, 0.4, 0.6)] : [], w: 0.8 });
          broadcast(w, e);
        }
      }
    }
  } finally { w.rng = prev; }
}
// A person who brings another into something: the first teacher (Bloom 1985) and the master who takes an apprentice. Outside the family only;
// a parent at it is the home source. Inclination is what gets a child noticed; the teacher's patience is what keeps the pupil coming back.
export function takenOn(w: World) {
  // Not part of the default model (round 12 outcome in BOARD.md): runs only when globalThis.TEACHER is set (ON=teacher for board.ts and the round-12 tests).
  if (!(globalThis as any).TEACHER || OFF.has('latent') || OFF.has('teacher')) return;
  const prev = w.rng; w.rng = w.streams.moments ?? w.rng;
  try {
    const skills = OFF.has('latentall') ? SETTING.hobbies : Object.keys(SETTING.skills);
    const L = live(w); const sig = (x: number) => 1 / (1 + Math.exp(-x));
    const good = (q: Person, sk: string, music: boolean) => (q.skills[sk]?.r ?? 0) >= 1250 && (q.skills[sk]?.interest === 2 || (!music && q.job != null && w.placeById.get(q.job)?.skill === sk));
    const school = w.places.find(pl => pl.skill === 'teaching');
    for (const p of L) {
      const a = age(w, p); if (a < 6 || a > 29) continue;
      for (const sk of skills) {
        const s = p.skills[sk]; if (!s) continue; const music = SETTING.hobbies.includes(sk); const key = 'pupil:' + sk; const tie = p.tried[key];
        if (tie) { // the tie: practice, and the chance of stopping
          const T = w.byId.get(tie.n); const over = !T || T.status !== 'in' || a >= 30;
          if (over) { delete p.tried[key]; continue; }
          practise(p, sk, 0.5);
          const harsh = Math.max(0, -(facet(T, 'gentleness') + facet(T, 'patience')) / 2);
          const quit = Math.max(0.004, 0.012 + 0.035 * harsh - 0.006 * facet(p, 'diligence'));
          if (w.rng.chance(quit)) { delete p.tried[key];
            if (harsh > 0.5) { const e = addEvent(w, { type: 'stopped', who: [p.id, T.id], text: `@${p.id} stopped going to @${T.id}; ${T.sex === 'f' ? 'she' : 'he'} had a sharp tongue.`, causes: [traitCause(T, 'gentleness', 0.6, -1), traitCause(T, 'patience', 0.3, -1)], vis: 'local', evidence: [ev(T.id, 'gentleness', -1, 0.6, 0.7), ev(T.id, 'patience', -1, 0.4, 0.6)], w: 0.8 }); broadcast(w, e); } }
          continue;
        }
        if (s.interest === 2 || a > 25 || (music && a < 6) || (!music && a < 15)) continue;
        if (p.parents.some(id => { const q = w.byId.get(id); return !!q && q.status === 'in' && good(q, sk, music); })) continue;
        // Routes, in order: the pupil's own workplace; staff at the school who love a hobby; a parent's friend or partner; anyone in town.
        let T: Person | undefined, route = 0, where = '';
        const notFamily = (q: Person) => q !== p && q.status === 'in' && age(w, q) >= 25 && !family(p, q) && good(q, sk, music);
        if (!music && p.job != null && w.placeById.get(p.job)?.skill === sk) { const pl = w.placeById.get(p.job)!; T = staffOf(w, pl.id).filter(q => q.job === pl.id && notFamily(q)).sort((x, y) => y.skills[sk].r - x.skills[sk].r)[0]; route = 1.0; where = pl.name; }
        if (!T && music && school && a <= 16) { const sch = placeOf(w, typeOf(school), hoodOf(w, p)) ?? school; T = w.rng.pick(staffOf(w, sch.id).filter(q => q.job === sch.id && notFamily(q)) as Person[]) ?? undefined; route = 0.6; where = 'school'; }
        if (!T) { const pf = new Set<number>(); for (const id of p.parents) { const q = w.byId.get(id); if (!q) continue; for (const f of q.friends) pf.add(f); if (q.partner != null) pf.add(q.partner); } const c = [...pf].map(id => w.byId.get(id)!).filter(q => q && notFamily(q)); if (c.length) { T = w.rng.pick(c); route = 0.5; where = 'home'; } }
        if (!T) { const c = near(w, p.id).filter(notFamily); if (c.length) { T = w.rng.pick(c); route = 0.15; where = 'town'; } }
        if (!T) continue;
        const z = inclination(p, sk); const willing = sig(facet(T, 'altruism') + 0.5 * facet(T, 'sociability'));
        if (!w.rng.chance(devRate() * route * devImp(a) * sig(2.5 * (z - 0.6)) * willing)) continue;
        p.tried[key] = { t: w.t, ok: true, n: T.id }; T.pupils.push({ id: p.id, sk, t: w.t, took: false });
        if (s.interest === 0) { s.interest = 1; p.tried['int:' + sk] = { t: w.t, ok: true, n: 1 }; (p as any)['int1:' + sk] = w.t; }
        const word = SETTING.skillWords[sk] ?? sk; const herHim = p.sex === 'f' ? 'her' : 'him';
        const shop = T.job != null ? w.placeById.get(T.job) : undefined; const her = T.sex === 'f' ? 'her' : 'his';
        const text = music ? `@${T.id} has taken @${p.id} on: teaches ${herHim} ${word} on Tuesdays.` : route === 1.0 ? `@${p.id} is apprenticed to @${T.id} at ${where}.` : shop && shop.skill === sk ? `@${T.id} has taken @${p.id} under ${her} wing at ${shop.name}.` : `@${T.id} has taken @${p.id} on; shows ${herHim} the trade.`;
        const noticed = where === 'town' ? `@${p.id} kept hanging round` : where === 'school' ? `noticed ${herHim} at school` : where === 'home' ? `a friend of the family` : `the best hand at ${where}`;
        const e = addEvent(w, { type: 'takenon', who: [T.id, p.id], text, causes: [stateCause(noticed, 0.5), traitCause(T, 'altruism', 0.4, 1)], vis: 'local', evidence: [ev(T.id, 'altruism', 1, 0.4, 0.6)], w: 0.7 });
        broadcast(w, e);
      }
    }
  } finally { w.rng = prev; }
}
export function momentsTick(w: World) {
  for (const p of live(w)) for (const sk of SETTING.hobbies) {
    const sp = p.tried['spark:' + sk]; if (!sp || sp.ok !== true || w.t - sp.t !== 36) continue;
    const s = p.skills[sk]; const held = (s?.r ?? 0) >= 1080 || p.group != null || [...p.friends].some(f => (w.byId.get(f)?.skills[sk]?.interest ?? 0) === 2);
    if (held) continue;
    sp.ok = false; if (s) s.interest = sp.n;
    const e = addEvent(w, { type: 'phase', who: [p.id], text: `@${p.id}'s ${sk === 'vocals' ? 'singing' : sk} went the way of most new things.`, causes: [stateCause('nobody to play with, and no real progress', 0.6)], vis: 'local', evidence: [], w: 0.5 }); broadcast(w, e);
  }
}

// ---------- the work: someone makes something; the others make it theirs, or don't ----------
function work(w: World, g: Group, k: Kind) {
  const ms = g.members.map(i => P(w, i));
  const author = w.rng.weighted(ms.map(p => [p, Math.max(0.05, 0.4 + 0.3 * facet(p, 'creativity') + 0.2 * facet(p, 'aesthetic') + 0.2 * z01(p.drive) + 0.2 * z01((bestSkill(p, k) - 1200) / 150))] as [Person, number]));
  const raw = clamp(0.35 + 0.25 * facet(author, 'creativity') + 0.15 * facet(author, 'aesthetic') + 0.25 * ((bestSkill(author, k) - 1150) / 300) + w.rng.normal() * 0.15, 0, 1.3);
  const quality = raw * (0.6 + 0.4 * g.chem);
  const used = new Set(w.groups.flatMap(x => x.works.map(y => y.title))); // one town, one song of that name
  const title = newTitle(w);
  const wk = { t: w.t, author: author.id, quality, title, credit: Object.fromEntries(ms.map(p => [p.id, p === author ? 0.7 : 0.3 / (ms.length - 1)])) };
  g.works.push(wk); g.lastWork = w.t;
  const best = g.works.slice(0, -1).every(x => x.quality < quality) && g.works.length > 2;
  const good = raw > 0.85;
  const first = !g.works.slice(0, -1).some(x => x.author === author.id);
  const notable = (good && (best || w.rng.chance(0.3))) || raw < 0.25 || g.works.length === 1 || first;
  const e = addEvent(w, { type: 'group:work', who: [author.id, ...ms.filter(p => p !== author).map(p => p.id)], text: `@${author.id} brought a ${k.work} to ${g.name}, "${title}"${best && good ? ', and everyone knew at once it was the best thing they had' : good ? ', and it was good' : raw < 0.25 ? ', and it did not come to much' : first ? `; ${she(author)} had never written one before` : ''}.`, causes: [traitCause(author, 'creativity', 0.5, 1), ...(good ? [stateCause('a real gift', 0.3)] : []), ...g.chemWhy.slice(0, 1)], vis: 'local', evidence: [ev(author.id, 'creativity', raw > 0.6 ? 1 : raw < 0.35 ? -1 : 0.3, Math.min(1, Math.abs(raw - 0.5) * 2), 0.6)], w: good ? 1.4 : 0.7 });
  if (notable) { broadcast(w, e); g.events.push(e.id); } else { e.w = 0.2; for (const id of e.who) P(w, id).events.pop(); }
  for (const p of ms) practise(p, k.skills.find(s => p.skills[s]) ?? k.skills[0], 0.6);
  // Authorship: each of the others answers. Mostly nothing; sometimes pride, sometimes worse.
  for (const m of ms) {
    if (m === author || raw < 0.5 || !w.rng.chance((good ? 0.25 : 0.08) * (facet(m, 'modesty') < -0.5 ? 1.5 : 1))) continue;
    const feats = new Set<Feature>(['public', 'standing', 'challenged', ...(m.friends.has(author.id) ? ['friend' as Feature] : [])]);
    const o = run(w, { type: 'authorship', actor: m, target: author, others: [], thing: k.work, features: feats, families: ['warmth', 'humility', 'pride', 'dishonesty'], only: { warmth: ['cheer'], humility: ['backsong'], pride: ['resentsong'], dishonesty: ['claimsong'] }, cause: e.id, place: g.name,
      familyExtra: { warmth: [bondC(w, m, author, 'like', 1), facetC(m, 'aesthetic', feats, 1, 3)], humility: [bondC(w, m, author, 'respect', 1)], pride: [pubC('better', good ? `@${author.id}'s ${k.work} was plainly the better one` : 'it was nothing special', good ? 0.2 : 0.6), facetC(m, 'creativity', feats, 1, 4)], dishonesty: [bondC(w, m, author, 'respect', -1), pubC('good', good ? 'worth claiming' : 'not worth claiming', good ? 0.8 : 0.2), facetC(m, 'sincerity', feats, -1, 6, 0.35)] } });
    if (!o) continue; g.events.push(o.event.id);
    if (o.expr.id === 'claimsong') { wk.credit[m.id] = (wk.credit[m.id] ?? 0) + 0.3; wk.credit[author.id] -= 0.3; if (w.rng.chance(0.4)) { const e2 = addEvent(w, { type: 'group:creditrow', who: [author.id, m.id], text: `@${author.id} found out what @${m.id} had been saying about "${title}".`, causes: [eventCause(w, o.event.id, 1)], vis: 'local', evidence: [], w: 1.5 }); broadcast(w, e2); g.events.push(e2.id); remember(w, author, m, e2.id, -0.4, -0.3, -0.6, `took credit for "${title}"`); } }
  }
}

// ---------- the show: what the world gets to measure ----------
function show(w: World, g: Group, k: Kind) {
  const ms = g.members.map(i => P(w, i)); g.lastShow = w.t;
  const front = ms.sort((a, b) => (b.aptitudes.presence + facet(b, 'socialBoldness')) - (a.aptitudes.presence + facet(a, 'socialBoldness')))[0];
  const feats = new Set<Feature>(['public', 'watched', 'standing']);
  const nerves = Math.max(0, facet(front, 'anxiety', undefined, feats) - 0.5 * facet(front, 'socialBoldness', undefined, feats)) + w.rng.normal() * 0.3 * front.variability;
  const recent = g.works.slice(-3); const material = recent.length ? recent.reduce((s, x) => s + x.quality, 0) / recent.length : 0.3;
  const skill = ms.reduce((s, p) => s + (bestSkill(p, k) - 1150) / 300, 0) / ms.length;
  const q = clamp(0.3 * material + 0.3 * skill + 0.4 * (g.chem - 0.5) * 1.5 + 0.35 - 0.25 * nerves + w.rng.normal() * 0.12, 0, 1.2);
  const feud = ms.flatMap(a => ms.filter(b => b !== a && likeOf(w, a.id, b.id) < -0.2).map(b => [a, b] as const))[0];
  const place = w.placeById.get(k.place)!.name; const prevQ = (g as any).lastQ ?? 0.5; (g as any).lastQ = q;
  const bestWork = g.works.slice().sort((a, b) => b.quality - a.quality)[0];
  const nShows = g.events.filter(i => w.events[i].type === 'group:show').length;
  const lastText = nShows ? w.events[g.events.filter(i => w.events[i].type === 'group:show').slice(-1)[0]].text : '';
  const greats = [`${g.name} played ${place} and the room went quiet.`, `${g.name} played ${place}; people who had come for the beer stayed for the last song.`, `${g.name} played ${place}, and "${bestWork?.title ?? 'the new one'}" got them called back twice.`, `${g.name} played ${place} and @${front.id} had the whole room in ${front.sex === 'f' ? 'her' : 'his'} hand.`];
  const goods = [`${g.name} played ${place} and did well.`, `${g.name} played ${place}; tighter than last time.`, `${g.name} played ${place} to a full room, the first in a while.`];
  const text = q > 0.8 ? greats.filter(t => t !== lastText)[(g.events.length + g.works.length) % 3] : q > 0.5 ? (prevQ < 0.4 ? goods[1] : goods[(g.events.length) % goods.length]) : feud ? `${g.name} played ${place}, and @${feud[0].id} and @${feud[1].id} never once looked at each other.` : nerves > 0.6 ? `${g.name} played ${place}; @${front.id} froze and the rest fell apart around ${her(front)}.` : prevQ > 0.7 ? `${g.name} played ${place} and it was not what it had been.` : `${g.name} played ${place} to a thin room.`;
  const causes: Cause[] = [...g.chemWhy.slice(0, 2), ...(material > 0.6 ? [stateCause(`strong ${k.work}s lately`, 0.3)] : []), ...(nerves > 0.6 ? [traitCause(front, 'anxiety', 0.4)] : [])];
  const e = addEvent(w, { type: 'group:show', who: ms.map(p => p.id), text, causes, vis: 'public', evidence: [...ms.map(p => ev(p.id, 'skill:' + (k.skills.find(s => p.skills[s]) ?? k.skills[0]), q > 0.5 ? 1 : -1, Math.min(1, Math.abs(q - 0.5) * 1.5), 0.7)), ...(nerves > 0.6 ? [ev(front.id, 'anxiety', 1, 0.8, 0.7)] : [])], w: q > 0.8 ? 2.2 : q < 0.3 ? 1.4 : 1 });
  // A good night is news when the band was struggling, or once in a while; the same kind of night as last time is the band's life, not the chronicle's.
  const notable = OFF.has('shownews') ? ((q > 0.8 && (g.standing < 0.8 || w.rng.chance(0.3))) || (q < 0.25 && !/froze|thin room/.test(lastText)) || nShows === 0 || (!!feud && w.rng.chance(0.4)) || w.rng.chance(0.12))
    : (q > 0.8 && (g.standing < 0.5 || w.rng.chance(0.15))) || (q < 0.25 && !/froze|thin room/.test(lastText)) || nShows === 0 || (!!feud && w.rng.chance(0.4) && !/never once looked/.test(lastText)) || w.rng.chance(0.08);
  if (notable) { broadcast(w, e); g.events.push(e.id); } else { e.w = 0.2; for (const id of e.who) P(w, id).events.pop(); }
  g.standing = clamp(g.standing * 0.85 + (q - 0.4), -1, 3);
  for (const p of ms) addEmotion(w, p, 'show', q > 0.5 ? `still buzzing from the ${k.show}` : `the ${k.show} that went wrong`, q > 0.5 ? 0.12 : -0.12, 5, e.id);
  if (q > 0.8) for (const x of near(w, ...ms.map(m => m.id))) if (!ms.includes(x) && w.rng.chance(0.3)) for (const p of ms) { const r = bond(w, x.id, p.id); r.respect = clamp(r.respect + 0.15, -1, 1); }
  if (q > 0.8 && !OFF.has('moments')) moment(w, g, k, e, ms);
  if (q < 0.3 && feud) { for (const p of ms) addStress(p, 'group', `${g.name} falling apart`, 0.06, e.id); }
}

// ---------- leaving, replacing, ending ----------
function leave(w: World, g: Group, p: Person, how: string, ref: number | undefined, text?: string, why: Cause[] = []) {
  // The person's marginal contribution, measured before they go: what the group loses with them.
  const withThem = chemistry(w, g).chem;
  g.members = g.members.filter(i => i !== p.id); g.former.push(p.id); p.group = null;
  const withoutThem = chemistry(w, g).chem;
  if (text) { const e = addEvent(w, { type: 'group:left', who: [p.id, ...g.members], text, causes: [...(ref != null ? [eventCause(w, ref, 0.7)] : []), ...why, ...g.chemWhy.slice(0, 1)].slice(0, 3), vis: 'public', evidence: [], w: 1.5 }); broadcast(w, e); g.events.push(e.id); }
  const h = p.habits.find(h => h.id === 'practise' && !h.broken); if (h) { h.broken = w.t; h.breakWhy = `left ${g.name}`; }
  const c = chemistry(w, g); g.chem = c.chem; g.chemWhy = c.why;
  if (withThem - withoutThem > 0.1 && g.members.length >= 2) {
    // Why they mattered: the glue, the one in a different class, or the one who brought what nobody else could.
    const k = kindOf(g); const rest = g.members.map(i => P(w, i));
    const glueScore = (q: Person) => (facet(q, 'altruism') + facet(q, 'gentleness') + q.aptitudes.socialInsight) / 3;
    const wasGlue = glueScore(p) > 0.5 && rest.every(q => glueScore(q) < glueScore(p) - 0.3);
    const wasStar = bestSkill(p, k) > Math.max(...rest.map(q => bestSkill(q, k))) + 120;
    const text = wasGlue ? `Without @${p.id}, ${names(g.members)} had nothing to say to each other.` : wasStar ? `Without @${p.id}, ${g.name} were a band that used to have @${p.id} in it.` : `Without @${p.id}, something had gone out of ${g.name} that nobody could name.`;
    const cause: Cause = wasGlue ? { kind: 'trait', label: `@${p.id} had held it together`, weight: 0.7, who: p.id, key: 'altruism' } : wasStar ? { kind: 'state', label: `@${p.id} was in a different class`, weight: 0.7, who: p.id } : { kind: 'state', label: `@${p.id} brought something the others could not`, weight: 0.7, who: p.id };
    const e2 = addEvent(w, { type: 'group:hole', who: g.members, text, causes: [cause], vis: 'local', evidence: wasGlue ? [ev(p.id, 'altruism', 1, 0.6, 0.6)] : [], w: 1.4 }); broadcast(w, e2); g.events.push(e2.id);
  }
}
function recruit(w: World, g: Group, k: Kind) {
  const ms = g.members.map(i => P(w, i)); const lead = P(w, g.founder).group === g.id ? P(w, g.founder) : ms[0];
  const pool = aroundAll(w, ms).filter(q => q.group == null && !g.former.includes(q.id) && age(w, q) >= 15 && bestSkill(q, k) > 1120 && k.skills.some(s => (q.skills[s]?.interest ?? 0) >= 1) && ms.every(m => regard(w, m.id, q.id) > -0.1));
  if (!pool.length) return;
  const q = pool.map(x => [x, 0.5 * z01((bestSkill(x, k) - 1200) / 150) + 0.5 * regard(w, lead.id, x.id) + w.rng.normal() * 0.2] as const).sort((a, b) => b[1] - a[1])[0][0];
  const better = bestSkill(q, k) > Math.max(...g.former.slice(-1).map(i => bestSkill(P(w, i), k)), 0);
  g.members.push(q.id); q.group = g.id; formHabit(w, q, 'practise', `joined ${g.name}`, 0.6, false);
  const before = g.chem; const c = chemistry(w, g); g.chem = c.chem; g.chemWhy = c.why;
  const e = addEvent(w, { type: 'group:joined', who: [q.id, ...ms.map(p => p.id)], text: `@${q.id} joined ${g.name}${better ? ', a better player than the one who left' : ''}${g.chem < before - 0.15 ? '; it was not the same' : ''}.`, causes: [stateCause(`${g.name} needed someone`, 0.5), ...(better ? [{ kind: 'state', label: 'the best player going', weight: 0.3 } as Cause] : []), ...c.why.slice(0, 1)], vis: 'public', evidence: [], w: 1.2 });
  broadcast(w, e); g.events.push(e.id);
}
function endGroup(w: World, g: Group, k: Kind, how: string, ref?: number) {
  g.ended = w.t; g.how = how;
  const yrs = Math.max(1, Math.round((w.t - g.since) / 12));
  const legacy = g.standing > 0.8 ? ` People still talk about the night the room went quiet.` : g.works.some(x => x.quality > 0.9) ? ` "${g.works.slice().sort((a, b) => b.quality - a.quality)[0].title}" outlived them.` : '';
  const e = addEvent(w, { type: 'group:split', who: g.members, text: `${g.name} split up after ${yrs} year${yrs > 1 ? 's' : ''}: ${how}.${legacy}`, causes: [...(ref != null ? [eventCause(w, ref, 0.5)] : []), ...g.chemWhy.slice(0, 2)], vis: 'public', evidence: [], w: 2 });
  broadcast(w, e); g.events.push(e.id);
  for (const i of g.members) { const p = P(w, i); p.group = null; const h = p.habits.find(h => h.id === 'practise' && !h.broken); if (h) { h.broken = w.t; h.breakWhy = `${g.name} ended`; } addEmotion(w, p, 'groupend', `${g.name} is over`, -0.1 * (1 + 0.3 * facet(p, 'sentimentality')), 10, e.id); }
  g.members = [];
}

export function groupTick(w: World) {
  if (!OFF.has('moments')) momentsTick(w);
  takenOn(w);
  develop(w);
  // Forming: someone who wants to be heard, with people who would play with them.
  for (const k of SETTING.groupKinds) for (const p of live(w)) if (p.group == null && pursuing(p, k.wantKind) && w.rng.chance(0.08)) tryForm(w, p, k);
  for (const g of w.groups) {
    if (g.ended) continue;
    const k = kindOf(g);
    const gone = g.members.filter(i => P(w, i).status !== 'in');
    for (const i of gone) { const q = P(w, i); const ref = q.events.slice().reverse().map(x => w.events[x]).find(x => x.type === 'left' || x.type === 'death')?.id; leave(w, g, q, 'gone', ref, `@${i} was gone, and ${g.name} had to go on without ${q.sex === 'f' ? 'her' : 'him'}.`); }
    if (g.members.length < k.minSize) { if (g.members.length && w.rng.chance(0.3)) recruit(w, g, k); if (g.members.length < k.minSize && w.t - g.lastShow > 8) { endGroup(w, g, k, 'nobody left to play with'); continue; } if (g.members.length < k.minSize) continue; }
    const c = chemistry(w, g); g.chem = g.chem * 0.7 + c.chem * 0.3; g.chemWhy = c.why;
    // Rehearsals: the members see each other, and the pressure finds the weak joints.
    const ms = g.members.map(i => P(w, i));
    if (w.t - g.lastWork >= k.workEvery && w.rng.chance(0.4)) work(w, g, k);
    if (w.t - g.lastShow >= k.showEvery && g.works.length && w.rng.chance(0.4)) show(w, g, k);
    // Leaving: a row with someone they can't stand, or a life that has moved on.
    for (const p of ms) {
      const enemy = ms.find(q => q !== p && likeOf(w, p.id, q.id) < -0.25);
      if (enemy && w.rng.chance(0.15)) {
        // The group remembers who the rows are about. Second row in three years: someone has a word. Third: they are asked to go.
        const rows: Record<number, number[]> = ((g as any).rows ??= {});
        const step = escalation(rows[p.id] ?? [], (g as any)['warned:' + p.id], w.t);
        if (!OFF.has('respond') && step !== 'row') {
          const others = ms.filter(x => x !== p && x !== enemy);
          const speaker = others.sort((a, b) => (facet(b, 'socialBoldness') + facet(b, 'organisation')) - (facet(a, 'socialBoldness') + facet(a, 'organisation')))[0] ?? enemy;
          if (step === 'word') {
            (g as any)['warned:' + p.id] = w.t;
            const e = addEvent(w, { type: 'group:word', who: [speaker.id, p.id], text: `@${speaker.id} took @${p.id} aside after practice: one more row and ${g.name} would be done with ${p.sex === 'f' ? 'her' : 'him'}.`, causes: [stateCause(`@${p.id}'s second row in ${g.name} in three years`, 0.6), traitCause(speaker, 'socialBoldness', 0.4, 1)], vis: 'local', evidence: [ev(speaker.id, 'socialBoldness', 1, 0.6, 0.7), ev(speaker.id, 'organisation', 1, 0.4, 0.5)], w: 1.3 });
            broadcast(w, e); g.events.push(e.id); remember(w, p, speaker, e.id, -0.1, 0.1, 0, 'took me aside after practice'); addStress(p, 'warned', `a warning from ${g.name}`, 0.06, e.id);
            rows[p.id] = [...(rows[p.id] ?? []), w.t]; continue;
          }
          leave(w, g, p, 'asked', undefined, `${g.name} asked @${p.id} to go. ${others.length ? `@${others[0].id} said it for the rest of them.` : ''}`.trim(), [stateCause(`three rows in three years, and a warning`, 0.6), traitCause(p, 'patience', 0.3)]);
          addStress(p, 'thrown', `thrown out of ${g.name}`, 0.14); addEmotion(w, p, 'thrown', 'humiliated', -0.18, 10);
          for (const q of others) remember(w, p, q, -1, -0.15, -0.05, -0.1, 'threw me out');
          break;
        }
        const o = run(w, { type: 'groupstrain', actor: p, target: enemy, others: ms.filter(x => x !== p && x !== enemy), thing: g.name, features: new Set<Feature>(['public', 'standing', 'pressure']), families: ['pride', 'humility'], only: { pride: ['quitgroup'], humility: ['stayfor'] }, place: g.name, w: 1.5, causeLabel: `@${p.id} and @${enemy.id} could not be in the same room`, familyExtra: { pride: [bondC(w, p, enemy, 'like', -1)], humility: [pubC('others', `the others`, clamp((ms.length - 2) / 3 + 0.3, 0, 1)), privC('invested', `${Math.max(1, Math.round((w.t - g.since) / 12))} years in`, clamp((w.t - g.since) / 72, 0, 1))] } });
        if (o) { g.events.push(o.event.id); (rows[p.id] = rows[p.id] ?? []).push(w.t); if (o.expr.id === 'quitgroup') { leave(w, g, p, 'row', o.event.id); break; } }
      } else if (k.binding === 'voluntary' && w.rng.chance(0.01) && (p.kids.some(c => P(w, c).status === 'in' && age(w, P(w, c)) < 4) || (p.stress > 0.7 && !pursuing(p, k.wantKind)))) {
        const baby = p.kids.map(c => P(w, c)).find(c => c.status === 'in' && age(w, c) < 4);
        leave(w, g, p, 'life', baby ? p.events.slice().reverse().map(x => w.events[x]).find(x => x.type === 'born')?.id : undefined, `@${p.id} left ${g.name}, quietly: ${baby ? 'there was a baby at home' : 'there was no room left in the week'}.`, baby ? [] : [stateCause(`worn down: ${topSourcesLabel(p)}`, 0.6)]); break;
      }
    }
    if (g.ended) continue;
    // A group with recent rows finds it harder to recruit: people have heard.
    const rowsRecent = OFF.has('respond') ? 0 : Object.values(((g as any).rows ?? {}) as Record<number, number[]>).reduce((s, l) => s + l.filter(t => w.t - t <= 36).length, 0);
    if (g.members.length < k.maxSize && g.members.length >= k.minSize && w.rng.chance(0.08 / (1 + rowsRecent))) recruit(w, g, k);
    // Ending: the chemistry has gone, and stayed gone.
    if (g.chem < 0.3) { if (g.lowSince < 0) g.lowSince = w.t; else if (w.t - g.lowSince > 6 && w.rng.chance(0.3)) endGroup(w, g, k, g.chemWhy[0]?.label.replace(/^@\d+ /, '') ?? 'the chemistry had gone'); } else g.lowSince = -1;
    if (!g.ended && w.t - g.since > 24 && !g.works.some(x => w.t - x.t < 24) && w.rng.chance(0.1)) endGroup(w, g, k, 'it had run its course');
  }
}
export function groupPairs(w: World): [Person, Person][] {
  const out: [Person, Person][] = [];
  for (const g of w.groups) if (!g.ended) { const ms = g.members.map(i => P(w, i)); for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) out.push([ms[i], ms[j]]); }
  return out;
}
