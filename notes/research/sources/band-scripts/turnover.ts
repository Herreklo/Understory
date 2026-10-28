// P6 research (28 Oct 2026): whether a group's make-up survives the departure of its old guard today, with nothing carried, and how
// many decisions a group gives its members to learn a norm from. Throwaway worlds only, every system on (main at b826dec).
//   ./run.sh notes/research/sources/band-scripts/turnover.ts A B [years] [outdir] [past]   → <outdir>/turnover[-past<n>]-<seed>.json
// A group is a band or a workplace. Its old guard is its members at the start of the present (or its founding members, for a band
// formed in the present). Each month: who is in it. When the last of the old guard has gone, the members' mean facets then are set
// beside the old guard's at the start. Decisions inside a group: a decision whose chooser and at least one other named person were
// members of the same group that month; counted per group-year, with the trigger.
import '../../../../src/tools/env';
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { age, live, facet, type World, type Person } from '../../../../src/world';

const [A, B] = [Number(process.argv[2] ?? 9001), Number(process.argv[3] ?? 9001)];
const YEARS = Number(process.argv[4] ?? 10);
const OUT = process.argv[5] ?? 'out-bands';
const PAST = Number(process.argv[6] ?? 30); // 0 with 40 years: the whole record from the town's founding
mkdirSync(OUT, { recursive: true });
const FACETS = [
  'forgiveness',
  'patience',
  'modesty',
  'sincerity',
  'organisation',
  'socialBoldness',
  'aesthetic',
  'creativity',
  'diligence',
  'altruism',
];
const prof = (ps: Person[]) => Object.fromEntries(FACETS.map(f => [f, ps.length ? ps.reduce((s, p) => s + facet(p, f), 0) / ps.length : null]));

function membersOf(w: World): Map<string, number[]> {
  const m = new Map<string, number[]>();
  for (const g of w.groups) if (!g.ended && g.members.length) m.set('b' + g.id, [...g.members]);
  for (const p of live(w)) if (p.job != null) (m.get('w' + p.job) ?? m.set('w' + p.job, []).get('w' + p.job)!).push(p.id);
  return m;
}

function runWorld(seed: number) {
  const w = buildWorld(seed, 1, PAST);
  const t0 = w.t;
  const groups: Record<string, any> = {};
  for (const [k, ms] of membersOf(w))
    groups[k] = {
      k,
      guard: ms,
      start: t0,
      p0: prof(ms.map(i => w.byId.get(i)!)),
      gone: null,
      p1: null,
      months: 0,
      sizeSum: 0,
      dec: {} as Record<string, number>,
      newcomers: 0,
    };
  let seen = w.events.length;
  for (let m = 0; m < YEARS * 12; m++) {
    tick(w);
    const M = membersOf(w);
    for (const [k, ms] of M) {
      if (!groups[k]) {
        // a band formed (or a venture opened) in the present: its first members are its old guard
        groups[k] = {
          k,
          guard: ms,
          start: w.t,
          p0: prof(ms.map(i => w.byId.get(i)!)),
          gone: null,
          p1: null,
          months: 0,
          sizeSum: 0,
          dec: {},
          newcomers: 0,
          born: true,
        };
      }
      const g = groups[k];
      g.months++;
      g.sizeSum += ms.length;
      if (g.gone == null && !g.guard.some((i: number) => ms.includes(i))) {
        g.gone = w.t;
        g.p1 = prof(ms.map(i => w.byId.get(i)!));
        g.after = ms.length;
      }
      g.everIn = [...new Set([...(g.everIn ?? g.guard), ...ms])];
    }
    const by = new Map<number, string[]>();
    for (const [k, ms] of M) for (const i of ms) (by.get(i) ?? by.set(i, []).get(i)!).push(k);
    for (let e = seen; e < w.events.length; e++) {
      const ev = w.events[e];
      if (!ev.decision) continue;
      const a = ev.who[0];
      for (const k of by.get(a) ?? []) {
        const ms = M.get(k)!;
        if (ev.who.slice(1).some(x => x !== a && ms.includes(x))) {
          const tr = ev.decision.trigger;
          groups[k].dec[tr] = (groups[k].dec[tr] ?? 0) + 1;
        }
      }
    }
    seen = w.events.length;
  }
  for (const g of Object.values(groups)) g.newcomers = (g.everIn ?? g.guard).filter((i: number) => !g.guard.includes(i)).length;
  return { seed, t0, groups: Object.values(groups) };
}

for (let s = A; s <= B; s++) {
  const r = runWorld(s);
  writeFileSync(`${OUT}/turnover-${s}.json`, JSON.stringify(r));
  console.log(s, r.groups.length, 'groups', r.groups.filter((g: any) => g.gone != null).length, 'lost their old guard');
}
