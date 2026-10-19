// The coarse yearly pass: how people in the background of a city live, once a year, by odds fitted to the full engine.
// A background person is a full Person (traits, values, family, seed) with status 'bg'. The monthly systems act only on people
// 'in' town, so they pass over them; this pass ages them, gives them work, partners, children, illness and death, and writes each
// big event into the record like any other. Every draw uses the person's own dice (world seed, person, year, kind), so a
// background life does not depend on who else is simulated. Odds come from coarse-odds.ts, written by bench/fit.py.
import { Rng, hash, clamp } from './rng';
import { SETTING } from './setting';
import { FACETS, VALUES } from './core';
import { addEvent as addEv, addStress, age, type World, type Person, type Event } from './world';
import { generatePerson, attracted } from './generate';
import { hoods, idx, moved, hoodOf, background, toBackground, fromBackground, makeInstances, typeOf } from './scale';
import { formHabits } from './time';
import { catchUp, mature } from './life';
import { plasticity } from './world';
import { family } from './grammar';
import { ODDS } from './coarse-odds';
import { z01 } from './decide';

// A background neighbourhood draws the ids of the people born or arriving in it from a range of its own, and gives them first
// names that differ from its own residents', so nothing outside it (the town's births, other neighbourhoods) changes who they are.
const BG_ID0 = 1_000_000,
  HOOD_IDS = 20_000;
function bgId(w: World, h: number): number {
  const m = ((w as any).hoodNext ??= {}) as Record<number, number>;
  const n = m[h] ?? 0;
  m[h] = n + 1;
  const id = BG_ID0 + h * HOOD_IDS + n;
  if (n >= HOOD_IDS || id >= 2 ** 26) throw new Error(`neighbourhood ${h} has run out of ids`);
  return id;
}
type Roster = Map<number, Person[]>;
function bgPerson(w: World, h: number, roster: Roster, opt: Parameters<typeof generatePerson>[1]): Person {
  const list = roster.get(h) ?? roster.set(h, []).get(h)!;
  const p = generatePerson(w, { ...opt, id: bgId(w, h), among: list });
  list.push(p);
  return p;
}
// Background events go into the record private, so no monthly system reads news about strangers, but with the weight the town gives
// that kind of event, and with how widely the town would have seen it (seen), so they mark a person as they would in the town.
const TOWN: Record<string, [number, 'public' | 'local']> = {
  born: [2, 'public'],
  married: [2, 'public'],
  divorce: [2.5, 'public'],
  split: [1.2, 'public'],
  left: [2, 'public'],
  home: [2, 'public'],
  arrived: [1.5, 'public'],
  hired: [1, 'public'],
  retired: [1.5, 'public'],
  sober: [1.5, 'local'],
  death: [3, 'public'],
  ill: [2, 'local'],
  promoted: [2, 'public'],
  passed: [1.5, 'local'],
  froze: [1, 'local'],
  rose: [0.6, 'local'],
};
function addEvent(w: World, e: Parameters<typeof addEv>[1]): Event {
  const t = TOWN[e.type];
  if (t) e.w = t[0];
  const out = addEv(w, e);
  if (t) (out as any).seen = t[1];
  return out;
}
const dice = (w: World, p: Person, kind: string) => new Rng(hash(w.seed, 'coarse', p.id, Math.floor(w.t / 12), kind));
const inCity = (q: Person | undefined) => !!q && (q.status === 'bg' || q.status === 'in');

// The person's state, in the terms the odds were fitted on.
export function features(w: World, p: Person): number[] {
  const a = age(w, p);
  const kids = p.kids.map(k => w.byId.get(k)!).filter(inCity);
  const x: Record<string, number> = {
    age: a,
    female: p.sex === 'f' ? 1 : 0,
    partnered: p.partner != null ? 1 : 0,
    kids: kids.length,
    young: kids.filter(k => age(w, k) < 6).length,
    minors: kids.filter(k => age(w, k) < 18).length,
    working: p.job ? 1 : 0,
    retired: p.retired ? 1 : 0,
    student: 0,
    ill: p.ill > 0 ? 1 : 0,
    health: p.health,
    savings: clamp(p.savings, -20, 60),
    drinks: p.drinks ? 1 : 0,
    yearsJob: p.job ? (w.t - p.jobSince) / 12 : 0,
    yearsPartner: p.partner != null ? (w.t - p.psince) / 12 : 0,
    parentsHere: p.parents.filter(k => inCity(w.byId.get(k))).length,
  };
  for (const f of FACETS) x['f_' + f.id] = p.facets[f.id] ?? 0;
  for (const v of VALUES) x['v_' + v.id] = p.values[v.id] ?? 0;
  const v = ODDS.keys.map(k => x[k] ?? 0);
  const bins = ODDS.bins.map(() => 0);
  bins[Math.min(bins.length - 1, Math.floor(a / 5))] = 1;
  return [...v, ...bins].map((z, i) => (z - ODDS.mu[i]) / ODDS.sd[i]);
}
function odds(kind: keyof typeof ODDS.models, z: number[]): number {
  const m = ODDS.models[kind] as any;
  if (!m) return 0;
  if (m.base != null) return m.base;
  let s = m.b0;
  for (let i = 0; i < z.length; i++) s += m.w[i] * z[i];
  return 1 / (1 + Math.exp(-s));
}
const he = (p: Person) => (p.sex === 'f' ? 'she' : 'he');

// ---------- background institutions ----------
// Every background neighbourhood has its own workplaces (one of each kind the setting has, each with the kind's capacity), held
// apart from the monthly list in bgPlaces and findable by id. People work where there is a place for them: once a year each
// workplace with room takes on the best of its neighbourhood's job seekers, and one without a leader makes one of its staff
// leader. So work in the background is bounded by the jobs there are, as in the town, and a neighbourhood's workplaces are
// staffed by its own residents. All draws for a neighbourhood use its own dice (world seed, neighbourhood, year).
export const bgPlaces = (w: World): any[] => ((w as any).bgPlaces ??= []) as any[];
function hoodPlaces(w: World): Map<number, any[]> {
  const m = new Map<number, any[]>();
  for (const pl of bgPlaces(w)) (m.get(pl.hood) ?? m.set(pl.hood, []).get(pl.hood)!).push(pl);
  return m;
}
function addHoodPlaces(w: World, h: number) {
  const made = makeInstances(SETTING.places, h);
  for (const pl of made) {
    bgPlaces(w).push(pl);
    w.placeById.set(pl.id, pl);
  }
  return made;
}
const fit = (p: Person, pl: any, parentsThere: boolean) =>
  ((p.skills[pl.skill]?.r ?? 1000) - 1300) / 200 +
  [0, 0.15, 0.4][p.skills[pl.skill]?.interest ?? 0] +
  (parentsThere ? 0.35 : 0) +
  0.3 * ((p.facets as any).diligence ?? 0);
const seeker = (w: World, p: Person) => p.status === 'bg' && !p.job && !p.retired && age(w, p) >= 18 && age(w, p) < 63;
// Who is on each background workplace's staff now (background residents only: a neighbourhood's workplaces are staffed by its own).
function staffing(w: World): Map<string, Person[]> {
  const m = new Map<string, Person[]>();
  for (const p of background(w)) if (p.status === 'bg' && p.job) (m.get(p.job) ?? m.set(p.job, []).get(p.job)!).push(p);
  return m;
}
function coarseWork(w: World, roster: Roster) {
  const yr = Math.floor(w.t / 12);
  const staff = staffing(w);
  const seekers = new Map<number, Person[]>();
  for (const p of background(w))
    if (seeker(w, p)) {
      const h = (p as any).hood ?? 0;
      (seekers.get(h) ?? seekers.set(h, []).get(h)!).push(p);
    }
  for (const [h, pls] of [...hoodPlaces(w)].sort((a, b) => a[0] - b[0])) {
    const r = new Rng(hash(w.seed, 'coarse-work', h, yr));
    // hiring: each workplace with room takes the best-suited seeker of the neighbourhood, in an order drawn for the year
    const pool = seekers.get(h) ?? [];
    const open = r.shuffle(pls.filter(pl => (staff.get(pl.id)?.length ?? 0) < pl.cap));
    for (let round = 0, any = true; any && pool.length; round++) {
      any = false;
      for (const pl of open) {
        if ((staff.get(pl.id)?.length ?? 0) >= pl.cap || !pool.length) continue;
        let bi = -1,
          bs = -Infinity;
        for (let i = 0; i < pool.length; i++) {
          const c = pool[i];
          const s =
            fit(
              c,
              pl,
              c.parents.some(k => w.byId.get(k)?.job === pl.id),
            ) +
            r.normal() * 0.3;
          if (s > bs) {
            bs = s;
            bi = i;
          }
        }
        const c = pool.splice(bi, 1)[0];
        any = true;
        c.job = pl.id;
        c.jobSince = w.t;
        c.skills[pl.skill].r = Math.max(c.skills[pl.skill].r, 1060);
        delete (c as any).joblessSince;
        (staff.get(pl.id) ?? staff.set(pl.id, []).get(pl.id)!).push(c);
        addEvent(w, { type: 'hired', who: [c.id], text: `@${c.id} started work at ${pl.name}.`, causes: [], vis: 'private', evidence: [], w: 0.8 });
      }
    }
    // A job nobody here can take draws someone from outside, as in the town (life.ts newcomer: a vacancy with no one looking for
    // work, open more than six months, is filled from outside at 0.35 × 0.3 a month; so a slot still open at the year's end is filled
    // from outside within the year at about 0.7). This is the only way people arrive, as it is the town's.
    for (const pl of open)
      for (let k = staff.get(pl.id)?.length ?? 0; k < pl.cap; k++)
        if (r.chance(0.7)) (staff.get(pl.id) ?? staff.set(pl.id, []).get(pl.id)!).push(newcomer(w, pl, h, r, roster));
    // succession, once the year's hiring is done: a workplace whose leader has gone makes one of its staff leader (organisation, tenure, skill; the town's grounds)
    for (const pl of pls) {
      const st = staff.get(pl.id) ?? [];
      const L = pl.lead != null ? w.byId.get(pl.lead) : undefined;
      if (L && (L.status !== 'bg' || L.job !== pl.id)) {
        if (L.job !== pl.id) L.lead = false;
        pl.lead = null;
      }
      if (pl.lead == null && st.length) {
        const pool = st.filter(s => w.t - s.jobSince >= 12);
        const from = pool.length ? pool : st;
        const sc = from
          .map(
            s =>
              [
                s,
                ((s.skills[pl.skill]?.r ?? 1000) - 1150) / 150 +
                  0.3 * ((s.facets as any).organisation ?? 0) +
                  Math.min(10, (w.t - s.jobSince) / 12) * 0.08 +
                  r.normal() * 0.3,
              ] as const,
          )
          .sort((a, b) => b[1] - a[1] || a[0].id - b[0].id);
        const win = sc[0][0];
        pl.lead = win.id;
        win.lead = true;
        // the town's succession events (life.ts promote): the promotion, the new leader's first staff meeting, and those passed over
        const e = addEvent(w, {
          type: 'promoted',
          who: [win.id],
          text: `@${win.id} became ${pl.title} at ${pl.name}.`,
          causes: [],
          vis: 'private',
          evidence: [],
          w: 2,
        });
        const nerves = ((win.facets as any).anxiety ?? 0) - 0.5 * ((win.facets as any).socialBoldness ?? 0) + r.normal() * 0.6 * win.variability;
        if (Math.abs(nerves) > 0.5)
          addEvent(w, {
            type: nerves > 0 ? 'froze' : 'rose',
            who: [win.id],
            text: nerves > 0 ? `@${win.id} froze at the first staff meeting.` : `@${win.id} took to it at once.`,
            causes: [],
            vis: 'private',
            evidence: [],
            w: nerves > 0 ? 1 : 0.6,
          });
        for (const [l] of sc.slice(1)) {
          if (l.values.success < 0.6) continue; // in the background nobody is known to have wanted it, so only the ambitious mind
          const e2 = addEvent(w, {
            type: 'passed',
            who: [l.id, win.id],
            text: `@${l.id} was passed over for ${pl.title}; @${win.id} got the job.`,
            causes: [],
            vis: 'private',
            evidence: [],
            w: 1.5,
          });
          addStress(l, 'passed', `passed over for ${pl.title}`, 0.1 + 0.08 * z01(l.values.success), e2.id);
        }
      }
    }
  }
}
// Someone moves to the neighbourhood for a job, by the town's rule: mostly young; a third of those 27 and over bring a family.
function newcomer(w: World, pl: any, h: number, r: Rng, roster: Roster): Person {
  const a = 23 + Math.floor(Math.pow(r.next(), 1.5) * 20);
  const p = bgPerson(w, h, roster, { age: a, founder: true });
  const fam = [p];
  p.skills[pl.skill].r = 1250 + r.next() * 200;
  p.savings = 5 + r.next() * 10;
  p.job = pl.id;
  p.jobSince = w.t;
  if (a >= 27 && r.chance(0.35)) {
    const q = bgPerson(w, h, roster, {
      age: Math.max(22, a + r.int(-4, 4)),
      sex: p.attraction === 'both' ? (r.chance(0.5) ? 'f' : 'm') : (p.attraction as 'f' | 'm'),
      last: r.chance(0.6) ? p.last : undefined,
      founder: true,
    });
    q.attraction = q.attraction === 'both' ? 'both' : p.sex;
    q.savings = p.savings * 0.5;
    p.partner = q.id;
    q.partner = p.id;
    p.pstat = q.pstat = 'married';
    p.psince = q.psince = w.t - 12 * r.int(2, Math.max(2, a - 24));
    fam.push(q);
    const nk = a >= 30 ? r.int(0, 2) : r.int(0, 1);
    for (let i = 0; i < nk; i++) {
      const adopt = p.sex === q.sex;
      const k = bgPerson(w, h, roster, { age: r.int(0, Math.min(15, a - 24)), parents: adopt ? [] : [p.id, q.id], last: q.last, founder: false });
      if (adopt) k.parents = [p.id, q.id];
      p.kids.push(k.id);
      q.kids.push(k.id);
      fam.push(k);
    }
  }
  for (const x of fam) {
    x.status = 'bg';
    x.habits = [];
    x.circle = [];
    (x as any).hood = h;
    (x as any).arrivedAt = w.t;
  }
  toBackground(w, fam);
  addEvent(w, {
    type: 'arrived',
    who: fam.map(x => x.id),
    text: `@${p.id} moved to the city for a job at ${pl.name}${fam.length > 1 ? (fam.length === 2 ? `, with @${fam[1].id}` : `, with @${fam[1].id} and the children`) : ''}.`,
    causes: [],
    vis: 'private',
    evidence: [],
    w: 1,
  });
  return p;
}
// Leaving a job in the background: the workplace loses its leader if it was them.
function quitJob(w: World, p: Person) {
  const pl = p.job ? w.placeById.get(p.job) : undefined;
  if (pl && pl.lead === p.id) pl.lead = null;
  p.job = null;
  p.lead = false;
}

// A bench can count the coarse pass's risk sets and events (globalThis.SCALE_COARSE_STATS = {}); nothing reads it otherwise.
const tally = (k: string, risk: boolean, hit: boolean, pred = NaN) => {
  const C = (globalThis as any).SCALE_COARSE_STATS;
  if (!C || !risk) return;
  const c = (C[k] ??= [0, 0, 0]);
  c[0]++;
  if (hit) c[1]++;
  c[2] += pred;
};
const bandOf = (a: number) => (a < 25 ? '16-24' : a < 35 ? '25-34' : a < 50 ? '35-49' : '50+');
export function coarseYear(w: World) {
  const bg = background(w).filter(p => p.status === 'bg');
  if (!bg.length) return;
  const C = (globalThis as any).SCALE_COARSE_STATS;
  const band = (a: number) => (a < 25 ? '16-24' : a < 35 ? '25-34' : a < 50 ? '35-49' : '50+');
  const before = C ? bg.map(p => [p, p.partner != null, age(w, p), w.events.length] as const) : [];
  const wantPartner = new Map<number, Person[]>();
  const roster: Roster = new Map();
  for (const p of background(w))
    if (p.status !== 'dead') {
      const h = (p as any).hood ?? 0;
      (roster.get(h) ?? roster.set(h, []).get(h)!).push(p);
    }
  for (const p of background(w)) if (p.status !== 'dead') mature(w, p); // a year older, as everyone alive in the town grows older
  for (const p of bg) {
    if (p.status !== 'bg') continue; // a partner may have died or left earlier in this pass
    const a = age(w, p);
    const z = features(w, p);
    const r = (k: string) => dice(w, p, k).next();
    if (coarseBody(w, p)) continue; // the year lived month by month in the body: health, illness, retirement, death
    // The town's leaving odds are per person, and a household leaves together: so an adult starts a move at the odds divided by the
    // size of the household that goes with them, and children go only with their parents.
    if (a >= 18) {
      const hh =
        1 +
        (p.partner != null && w.byId.get(p.partner)!.status === 'bg' ? 1 : 0) +
        p.kids.filter(k => {
          const c = w.byId.get(k)!;
          return c.status === 'bg' && age(w, c) < 18;
        }).length;
      if (r('left') < odds('left', z) / hh) {
        coarseLeave(w, p);
        continue;
      }
    }
    if (!p.drinks && a >= 16 && r('drinks') < odds('drinks', z)) {
      p.drinks = true;
      p.drinkSince = w.t;
    } else if (p.drinks && r('sober') < odds('sober' as any, z)) {
      p.drinks = false;
      addEvent(w, { type: 'sober', who: [p.id], text: `@${p.id} stopped drinking.`, causes: [], vis: 'private', evidence: [], w: 1 });
    }
    if (p.job && r('lostJob') < odds('lostJob', z)) {
      quitJob(w, p);
      (p as any).joblessSince = w.t;
      addEvent(w, { type: 'lostjob', who: [p.id], text: `@${p.id} was out of work.`, causes: [], vis: 'private', evidence: [], w: 1 });
    }
    // finding work, changing it and being made leader are not odds here: they happen where there is a job (coarseWork, below)
    if (p.job) {
      const sk = w.placeById.get(p.job)?.skill;
      if (sk) p.skills[sk].r = Math.min(p.skills[sk].ceil, p.skills[sk].r + 19);
    } // a year at work: about what twelve months of practice give
    if (p.partner != null) {
      const q = w.byId.get(p.partner)!;
      if (q.status === 'bg' && p.id < q.id && r('separated') < odds('separated', z)) {
        const married = p.pstat === 'married'; // in the background every couple marries when it gets together, as the town's couples who stay do
        p.partner = null;
        q.partner = null;
        p.pstat = q.pstat = null;
        addEvent(w, {
          type: married ? 'divorce' : 'split',
          who: [p.id, q.id],
          text: married ? `@${p.id} and @${q.id} divorced.` : `@${p.id} and @${q.id} split up.`,
          causes: [],
          vis: 'private',
          evidence: [],
          w: 1.8,
        });
      } else if (p.sex === 'f' && a >= 16 && a <= 50 && q.status === 'bg') {
        const o = odds('child', z),
          hit = r('child') < o;
        tally('child ' + bandOf(a), true, hit, o);
        if (hit) coarseBirth(w, p, q, roster);
      }
    } else if (a >= 16 && r('partnered') < odds('partnered', z) / 2) {
      // each couple makes two of the town's yearly partnerings
      const h = (p as any).hood ?? 0;
      (wantPartner.get(h) ?? wantPartner.set(h, []).get(h)!).push(p);
    }
    p.savings +=
      (ODDS.models.dsav as any).b0 +
      (ODDS.models.dsav as any).w.reduce((s: number, wi: number, i: number) => s + wi * z[i], 0) +
      dice(w, p, 'sav').normal() * (ODDS.models.dsav as any).sd * 0.5;
  }
  // Someone ready for a partner finds one among the single adults of their neighbourhood: the nearest in age they are mutually drawn to.
  const singles = new Map<number, Person[]>();
  for (const q of background(w))
    if (q.status === 'bg' && q.partner == null && age(w, q) >= 16) {
      const h = (q as any).hood ?? 0;
      (singles.get(h) ?? singles.set(h, []).get(h)!).push(q);
    }
  for (const [h, ps] of [...wantPartner].sort((x, y) => x[0] - y[0])) {
    for (const a of ps) {
      if (a.partner != null || a.status !== 'bg') continue;
      const pick = (pool: Person[]) => {
        let best: Person | undefined,
          gap = 99;
        for (const b of pool) {
          if (b === a || b.partner != null) continue;
          const g = Math.abs(age(w, a) - age(w, b));
          if (g < 12 && g < gap && attracted(a, b) && attracted(b, a)) {
            best = b;
            gap = g;
          }
        }
        return best;
      };
      const best = pick(singles.get(h) ?? []); // someone from their own neighbourhood: a neighbourhood is a town's worth of people
      tally('match ' + bandOf(age(w, a)) + (best ? ((best as any).hood === h ? ' own' : ' other') : ' none'), true, true);
      if (!best) continue;
      const b = best;
      a.partner = b.id;
      b.partner = a.id;
      a.pstat = b.pstat = 'married';
      a.psince = b.psince = w.t;
      addEvent(w, {
        type: 'married',
        who: [a.id, b.id],
        text: `@${a.id} and @${b.id} got together.`,
        causes: [],
        vis: 'private',
        evidence: [],
        w: 1.2,
      });
    }
  }
  coarseReturns(w);
  coarseWork(w, roster);
  if (C) {
    const born = new Set<number>();
    for (let i = before[0]?.[3] ?? w.events.length; i < w.events.length; i++) if (w.events[i].type === 'born') born.add(w.events[i].who[1]);
    for (const [p, had, a] of before) {
      if (a < 16) continue;
      if (!had) tally('partnered ' + band(a), true, p.partner != null);
    }
  }
}

// People who left may come home, at the odds the town's leavers do (from the full towns: by age, years away, study, family here).
function coarseReturns(w: World) {
  const m = (ODDS.models as any).home;
  if (!m) return;
  for (const p of background(w)) {
    if (p.status !== 'gone' || (p as any).awayKind === 'family') continue;
    const x: Record<string, number> = {
      age: age(w, p),
      female: p.sex === 'f' ? 1 : 0,
      study: (p as any).awayKind === 'study' ? 1 : 0,
      yearsAway: (w.t - ((p as any).goneAt ?? w.t)) / 12,
      parentsHere: p.parents.filter(k => inCity(w.byId.get(k))).length,
      partnered: p.partner != null ? 1 : 0,
    };
    let s = m.b0;
    m.keys.forEach((k: string, i: number) => {
      s += (m.w[i] * ((x[k] ?? 0) - m.mu[i])) / m.sd[i];
    });
    if (dice(w, p, 'home').next() >= 1 / (1 + Math.exp(-s))) continue;
    const back = [
      p,
      ...(p.partner != null ? [w.byId.get(p.partner)!] : []),
      ...p.kids.map(k => w.byId.get(k)!).filter(k => k.status === 'gone' && (k as any).awayKind === 'family'),
    ].filter(q => q.status === 'gone');
    for (const q of back) {
      q.status = 'bg';
      (q as any).arrivedAt = w.t;
      delete (q as any).awayKind;
    }
    addEvent(w, {
      type: 'home',
      who: back.map(q => q.id),
      text: `@${p.id} came back to the city${back.length > 1 ? ' with the family' : ''}.`,
      causes: [],
      vis: 'private',
      evidence: [],
      w: 1.2,
    });
  }
}

// ---------- the body ----------
// Health, illness, retirement and death are rules about one person, so the background lives them by the town's own rules (life.ts:
// bodyTick, mortality, the retirement step of workTick), month by month through the year, on the person's own dice. Only what
// depends on other people (partners, splits, leaving, work) is drawn from fitted odds. Returns true if they died.
function coarseBody(w: World, p: Person): boolean {
  const r = dice(w, p, 'body');
  const born = p.born;
  for (let m = 0; m < 12; m++) {
    const t = w.t + m,
      a = (t - born) / 12;
    if (p.ill > 0) p.ill--;
    // strain, the part of it that is the person's own: illness adds to it, and it eases by the town's rule (the parts that come from
    // other people, such as grief, loneliness or trouble at home, are not lived in the background)
    if (p.ill) addStress(p, 'ill', 'illness', 0.012);
    p.stress = clamp(
      p.stress -
        (0.025 * (1 + 0.2 * (p.facets.patience ?? 0)) +
          0.006 * Object.values(p.skills).filter(s => s.interest === 2).length +
          (p.drinks ? 0.015 : 0) +
          (p.retired ? 0.008 : 0)),
      0,
      1,
    );
    for (const k in p.sources) {
      p.sources[k].v *= 0.9;
      if (p.sources[k].v < 0.004) delete p.sources[k];
    }
    const tgt =
      clamp(0.78 + 0.08 * p.constitution - Math.max(0, a - 45) * 0.009 - (p.drinks ? 0.12 : 0) - (p.stress > 0.7 ? 0.05 : 0), 0.05, 1) -
      (p.ill ? 0.3 : 0);
    p.health += (tgt - p.health) * 0.08;
    const last = (p as any).lastIll as { t: number; kind: string } | undefined;
    if (a >= 16 && !p.ill && t - (last?.t ?? -99) >= 9) {
      const risk = 0.0009 * Math.exp((a - 45) / 14) * (1.3 - 0.3 * p.constitution) * (p.drinks ? 1.8 : 1) * (p.stress > 0.7 ? 1.3 : 1);
      if (r.chance(risk)) {
        const kinds: [string, number][] =
          a < 50
            ? [
                ['was hospitalised with pneumonia', 3],
                ['needed surgery', 4],
                ['was signed off with a bad back', 3],
              ]
            : [
                ['had a heart attack', 5],
                ['was diagnosed with cancer', 8],
                ['had a stroke', 6],
                ['was hospitalised with pneumonia', 3],
              ];
        if (p.drinks && a > 40) kinds.push(['was admitted with liver damage', 6]);
        let [kind, mo] = r.pick(kinds);
        if (last && t - last.t < 48)
          kind = /cancer/.test(last.kind)
            ? 'learned the cancer was back'
            : /heart/.test(last.kind)
              ? 'had a second heart attack'
              : /stroke/.test(last.kind)
                ? 'had another stroke'
                : 'was back in hospital';
        (p as any).lastIll = { t, kind };
        p.ill = mo + r.int(0, 3);
        p.health = clamp(p.health - 0.2 - r.next() * 0.2, 0.05, 1);
        const e = addEvent(w, {
          type: 'ill',
          who: [p.id, ...(p.partner != null && w.byId.get(p.partner)?.status === 'bg' ? [p.partner] : [])],
          text: `@${p.id} ${kind}.`,
          causes: [],
          vis: 'private',
          evidence: [],
          w: 2,
        });
        addStress(p, 'ill', 'illness', 0.15, e.id);
      }
    }
    let h = Math.min(0.8, 0.0000025 * Math.exp(0.116 * a)) / 12;
    if (a >= 105) h = Math.max(h, 0.6 / 12);
    const norm = 0.78 - Math.max(0, a - 45) * 0.009;
    if (p.health < norm) h *= 1 + (norm - p.health) * 4;
    if (p.ill) h *= 2.2;
    tally('died ' + (a < 65 ? '<65' : a < 80 ? '65-79' : '80+'), m === 0, false, NaN);
    if (r.chance(h)) {
      const cause = p.ill
        ? 'died after a long illness'
        : p.drinks && a < 72
          ? 'died of liver failure'
          : a > 79
            ? `died in ${p.sex === 'f' ? 'her' : 'his'} sleep`
            : 'died of a sudden heart attack';
      const C = (globalThis as any).SCALE_COARSE_STATS;
      if (C) (C['died ' + (a < 65 ? '<65' : a < 80 ? '65-79' : '80+')] ??= [0, 0, 0])[1]++;
      coarseDeath(w, p, cause);
      return true;
    }
    if (p.job && a >= 62 && r.chance(0.012 + (a >= 67 ? 0.12 : 0) + (p.health < 0.5 ? 0.03 : 0))) {
      quitJob(w, p);
      p.retired = true;
      addEvent(w, { type: 'retired', who: [p.id], text: `@${p.id} retired.`, causes: [], vis: 'private', evidence: [], w: 0.8 });
    } else if (!p.job && !p.retired && a >= 65) p.retired = true;
  }
  return false;
}

function coarseDeath(w: World, p: Person, cause: string) {
  const a = Math.floor(age(w, p));
  quitJob(w, p);
  p.status = 'dead';
  p.diedAt = w.t;
  const close = [
    ...(p.partner != null ? [p.partner] : []),
    ...p.kids.filter(k => inCity(w.byId.get(k))),
    ...p.parents.filter(k => inCity(w.byId.get(k))),
  ];
  const de = addEvent(w, {
    type: 'death',
    who: [p.id, ...close],
    text: `@${p.id} ${cause}, aged ${a}.`,
    causes: [],
    vis: 'private',
    evidence: [],
    w: 3,
  });
  if (p.partner != null) {
    const q = w.byId.get(p.partner)!;
    q.partner = null;
    q.pstat = null;
  }
  const heirs = p.kids.map(k => w.byId.get(k)!).filter(inCity);
  if (heirs.length && p.savings > 0) for (const k of heirs) k.savings += p.savings / heirs.length;
}
// Leaving the city: the household goes together.
function coarseLeave(w: World, p: Person) {
  const goers = [
    p,
    ...(p.partner != null ? [w.byId.get(p.partner)!] : []),
    ...p.kids.map(k => w.byId.get(k)!).filter(k => k.status === 'bg' && age(w, k) < 18),
  ].filter(q => q.status === 'bg');
  const kind = age(w, p) < 26 && p.partner == null ? 'study' : 'move'; // the young and single leave to study or start out; they come home most
  for (const q of goers) {
    quitJob(w, q);
    q.status = 'gone';
    (q as any).goneAt = w.t;
    (q as any).awayKind = q === p ? kind : 'family';
  }
  addEvent(w, {
    type: 'left',
    who: goers.map(q => q.id),
    text: `@${p.id} moved away${goers.length > 1 ? ', and took the family' : ''}.`,
    causes: [],
    vis: 'private',
    evidence: [],
    w: 1,
  });
}
function coarseBirth(w: World, mother: Person, father: Person, roster: Roster) {
  const k = bgPerson(w, (mother as any).hood, roster, { age: 0, parents: [mother.id, father.id], last: father.last, founder: false });
  k.status = 'bg';
  (k as any).hood = (mother as any).hood;
  toBackground(w, [k]);
  mother.kids.push(k.id);
  father.kids.push(k.id);
  const e = addEvent(w, {
    type: 'born',
    who: [k.id, mother.id, father.id],
    text: `@${k.id} was born to @${mother.id} and @${father.id}.`,
    causes: [],
    vis: 'private',
    evidence: [],
    w: 1,
  });
  // becoming a parent steadies people, by the town's rule
  for (const x of [mother, father])
    if (!x.marks.some(m => m.key === 'parent')) {
      x.facets.organisation += 0.2 * plasticity(w, x);
      x.facets.patience += 0.15 * plasticity(w, x);
      x.marks.push({ t: w.t, key: 'parent', delta: 0.2, cause: e.id, text: 'steadier since becoming a parent' });
    }
}
// Promotion: a background neighbourhood comes into focus as a whole, so everyone in it arrives with the people they live among.
// Their record so far stands as it is. What the monthly world needs and the coarse pass did not keep is filled in from their own
// dice: routines, a circle of neighbours, and the years of ordinary contact (catchUp), run by the same rules as everyone's.
export function promoteHood(w: World, h: number, months = 360) {
  // thirty years: everyone gets the time they actually lived here (catchUp skips months before they were born or arrived)
  const ps = background(w).filter(p => p.status === 'bg' && (p as any).hood === h);
  if (!ps.length) return { promoted: 0, backstory: 0 };
  const r = new Rng(hash(w.seed, 'promote', h, w.t));
  for (const p of ps) p.status = 'in'; // everything they are stays as it is: health, illness, strain, work, family, traits
  fromBackground(w, ps);
  ((w as any).focus as Set<number> | undefined)?.add(h);
  const mine = bgPlaces(w).filter(pl => pl.hood === h);
  (w as any).bgPlaces = bgPlaces(w).filter(pl => pl.hood !== h);
  w.places.push(...mine);
  moved();
  for (const p of ps) {
    if (age(w, p) >= 16) {
      // as many routines as someone of their age in the monthly world has
      const like = idx(w).live.filter(q => !ps.includes(q) && Math.abs(age(w, q) - age(w, p)) < 6);
      const n = like.length ? like[r.int(0, like.length - 1)].habits.filter(x => !x.broken).length : 2;
      if (n > 0) formHabits(w, p, n, 'always has', r);
    }
    const others = idx(w).hood[h].filter(q => q !== p && !family(p, q) && Math.abs(age(w, q) - age(w, p)) < 15);
    p.circle = r
      .shuffle(others)
      .slice(0, 3 + r.int(0, 2))
      .map(q => q.id);
    (p as any).promotedAt = w.t;
  }
  const backstory = catchUp(w, ps, months, r);
  return { promoted: ps.length, backstory };
}

// A city's background at its founding: households shaped like the town's own founders (the same generator makes the people;
// the shape of each household, its ages, work and money are copied from a founding household of the town), placed about 80 to a
// neighbourhood. From then on the coarse pass lives their lives.
export function populateBackground(w: World, people: number, perHood = 80) {
  const heads = w.people.filter(p => p.status === 'in' && age(w, p) >= 18 && (p.partner == null || p.id < p.partner));
  if (!heads.length) return 0;
  const H0 = hoods(w);
  const r = new Rng(hash(w.seed, 'city'));
  let made = 0,
    h = H0,
    inHood = 0;
  let pls: any[] = [];
  const made_pl: any[] = [];
  const n = new Map<string, number>();
  while (made < people) {
    const t = heads[r.int(0, heads.length - 1)];
    const tp = t.partner != null ? w.byId.get(t.partner) : undefined;
    const tk = t.kids.map(k => w.byId.get(k)!).filter(k => k.status === 'in' && age(w, k) < 18);
    const A = generatePerson(w, { age: age(w, t), sex: t.sex, founder: true });
    const fam = [A];
    if (tp) {
      const B = generatePerson(w, { age: age(w, tp), sex: tp.sex, last: A.last, founder: true });
      if (!attracted(B, A)) B.attraction = A.sex;
      if (!attracted(A, B)) A.attraction = B.sex;
      A.partner = B.id;
      B.partner = A.id;
      A.pstat = B.pstat = 'married';
      A.psince = B.psince = t.psince;
      fam.push(B);
    }
    for (const k of tk) {
      const c = generatePerson(w, { age: age(w, k), parents: fam.map(x => x.id), last: A.last, founder: k.founder });
      for (const x of fam.slice(0, 2)) x.kids.push(c.id);
      fam.push(c);
    }
    if (pls.length === 0 || pls[0].hood !== h) {
      pls = addHoodPlaces(w, h);
      made_pl.push(...pls);
    }
    // work is copied from the founder household where the neighbourhood has room: the same kind of work if it is open, else the open
    // workplace that suits them best; a neighbourhood with no room left leaves them looking
    const copy = (x: Person, from: Person) => {
      if (from.job) {
        const was = w.placeById.get(from.job)!;
        const open = pls.filter(pl => (n.get(pl.id) ?? 0) < pl.cap);
        const pl =
          open.find(pl => typeOf(pl) === typeOf(was)) ??
          open.map(pl => [pl, x.skills[pl.skill].ceil + r.normal() * 80] as const).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (pl) {
          x.job = pl.id;
          x.jobSince = from.jobSince;
          n.set(pl.id, (n.get(pl.id) ?? 0) + 1);
          x.skills[pl.skill].r = Math.min(x.skills[pl.skill].ceil, from.skills[was.skill]?.r ?? 1060);
        }
      }
      x.retired = from.retired;
      x.savings = from.savings;
    };
    copy(A, t);
    if (tp) copy(fam[1], tp);
    for (const x of fam) {
      x.status = 'bg';
      x.habits = [];
      x.circle = [];
      (x as any).hood = h;
    }
    toBackground(w, fam);
    made += fam.length;
    inHood += fam.length;
    if (inHood >= perHood) {
      h++;
      inHood = 0;
    }
  }
  (w as any).H = inHood > 0 ? h + 1 : h;
  // each workplace's leader at the founding: by the town's founding rule (organisation and years there)
  const st = staffing(w);
  for (const pl of made_pl) {
    const s = (st.get(pl.id) ?? []).slice();
    if (!s.length) continue;
    const L = s.sort(
      (a, b) => (b.facets as any).organisation + (w.t - b.jobSince) / 120 - ((a.facets as any).organisation + (w.t - a.jobSince) / 120),
    )[0];
    pl.lead = L.id;
    L.lead = true;
  }
  return made;
}
