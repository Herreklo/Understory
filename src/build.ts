// Building a world: founders, families, careers at year 0, then the simulated past.

import { stream } from './rng';
import { SETTING } from './setting';
import { makeWorld, age, live, P, bond, remember, OFF, setStreams, type World, type Person } from './world';
import { generatePerson, attracted } from './generate';
import { tick } from './life';
import { formHabits } from './time';
const family = (a: Person, b: Person) =>
  a.parents.includes(b.id) || b.parents.includes(a.id) || (a.parents.length > 0 && a.parents.some(x => b.parents.includes(x)));

function couple(w: World, a: Person, b: Person, since: number) {
  a.partner = b.id;
  b.partner = a.id;
  a.pstat = b.pstat = 'married';
  a.psince = b.psince = since;
  for (const [x, y] of [
    [a, b],
    [b, a],
  ] as const) {
    const r = bond(w, x.id, y.id);
    r.fam = 1;
    r.like = 0.4 + w.rng.next() * 0.3;
    r.trust = 0.4;
    r.respect = 0.2;
    remember(w, x, y, -1, 0.15, 0.1, 0.2, 'married');
  }
}
function familyBonds(w: World, p: Person) {
  for (const k of p.parents) {
    const q = P(w, k);
    for (const [x, y] of [
      [p, q],
      [q, p],
    ] as const) {
      const r = bond(w, x.id, y.id);
      r.fam = 1;
      r.like = 0.5;
      r.trust = 0.5;
    }
  }
}

export function buildWorld(seed: number, runSeed: number, pastYears = 30, adults = 46): World {
  const w = makeWorld(seed, runSeed);
  w.startPresent = pastYears * 12;
  w.places = SETTING.places.map(p => ({ ...p, lead: null, vac: 0 }));
  w.placeById = new Map(w.places.map(p => [p.id, p]));
  const g = stream(seed, 'build');
  const countAdults = () => w.people.filter(p => age(w, p) >= 18).length;
  while (countAdults() < adults) {
    const r = g.next();
    if (r < 0.3) {
      generatePerson(w, { age: 20 + Math.floor(Math.pow(g.next(), 1.4) * 55), founder: true });
    } else {
      const withKids = r >= 0.55;
      const a = withKids ? 26 + g.int(0, 20) : 24 + g.int(0, 50);
      const last = g.pick(SETTING.names.sur);
      const A = generatePerson(w, { age: a, last, founder: true });
      const bSex = A.attraction === 'both' ? (g.chance(0.5) ? 'f' : 'm') : A.attraction;
      const B = generatePerson(w, { age: Math.max(20, a + g.int(-3, 4)), sex: bSex, last: g.chance(0.6) ? last : undefined, founder: true });
      if (!attracted(B, A)) B.attraction = A.sex;
      couple(w, A, B, -g.int(12, Math.max(13, (Math.min(a, age(w, B)) - 21) * 12)));
      if (withKids) {
        const n = 1 + g.int(0, 2);
        const adopt = A.sex === B.sex;
        for (let i = 0; i < n; i++) {
          if (adopt && i > 0) break;
          const ka = g.int(0, Math.min(17, a - 20));
          if (ka < 0) continue;
          const k = generatePerson(w, { age: ka, parents: adopt ? [] : [A.id, B.id], last: B.last, founder: ka >= 12 });
          if (adopt) k.parents = [A.id, B.id];
          A.kids.push(k.id);
          B.kids.push(k.id);
          familyBonds(w, k);
        }
      }
    }
  }
  // Careers at year 0.
  const working = w.people.filter(p => age(w, p) >= 18 && age(w, p) < 65 && g.chance(0.9));
  for (const p of g.shuffle(working)) {
    const open = w.places.filter(pl => live(w).filter(q => q.job === pl.id).length < pl.cap);
    if (!open.length) break;
    const pl = open.map(x => [x, p.skills[x.skill].ceil + g.normal() * 80] as const).sort((a, b) => b[1] - a[1])[0][0];
    const ten = g.int(6, Math.min(300, (age(w, p) - 19) * 12));
    p.job = pl.id;
    p.jobSince = -ten;
    p.skills[pl.skill].r = Math.min(p.skills[pl.skill].ceil, 1000 + ten * 1.6);
    p.savings = (age(w, p) - 18) * g.next() * 1.5 + g.normal() * 6;
  }
  for (const p of w.people) if (age(w, p) >= 65) p.retired = true;
  for (const pl of w.places) {
    const st = live(w).filter(q => q.job === pl.id);
    if (!st.length) continue;
    const L = st.sort((a, b) => b.facets.organisation + (w.t - b.jobSince) / 120 - (a.facets.organisation + (w.t - a.jobSince) / 120))[0];
    pl.lead = L.id;
    L.lead = true;
  }
  // Routines: most adults already have one or two.
  if (!OFF.has('habits')) for (const p of w.people) if (age(w, p) >= 16) formHabits(w, p, 1 + g.int(0, 2), 'always has', g);
  // Everyone gets a small fixed circle of neighbours they see every month.
  for (const p of w.people) {
    const others = w.people.filter(q => q !== p && !family(p, q));
    p.circle = g
      .shuffle(others)
      .slice(0, 3 + g.int(0, 2))
      .map(q => q.id);
  }
  // Social warm-up without events, then the simulated past.
  w.quiet = true;
  for (let i = 0; i < pastYears * 12; i++) tick(w);
  w.quiet = false;
  setStreams(w, seed, runSeed, 'run'); // from here on, fate
  return w;
}

export function runYears(w: World, years: number) {
  for (let i = 0; i < Math.round(years * 12); i++) tick(w);
}
