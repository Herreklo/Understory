// Round 38's own count: contests (rivalries) started in the present years by where they came from, what the rivals did, how they
// ended, how those not picked for a band answered, the reasons contest acts gave, and kinds of line a life.
//   tsx src/tools/diag/collide.ts A B [years]   (seeds A..B; OFF= and ON= are read from the environment, as by every check)
// Last line: COLLIDE {...}
import '../env';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { pageLines } from '../../page';
import { rivalries } from '../../drama';
import { age, live, type World, type Person } from '../../world';

const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];
const inc = (m: Record<string, number>, k: string, v = 1) => (m[k] = (m[k] ?? 0) + v);
const ANSWERS = new Set(['congratulate', 'swallow', 'confront', 'sulk', 'quitpride']);
const out = {
  seeds: [a, b],
  worlds: 0,
  contests: {} as Record<string, number>, // rivalries started in the window, by source
  contestsPostOrBand: 0, // rivalries over a post (in or out of season), and band places with two or more in the running
  bandContests: 0, // band places with two or more in the running (each place once, however many were not picked)
  notPicked: 0,
  answers: {} as Record<string, number>, // how those passed over (post) or not picked (band) answered
  acts: {} as Record<string, number>, // rivalry and grudge acts, by what was done
  outcomes: {} as Record<string, number>,
  contestLines: 0, // rivalry and grudge acts on someone's page
  traitLines: 0, // ... giving a trait or the self-story as a reason
  kindsAll: 0,
  adults: 0,
  kindsTop: 0,
  linesTop: 0,
  top: 0,
};
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  runYears(w, yrs);
  out.worlds++;
  for (const r of rivalries(w)) {
    if (r.since < t0) continue;
    const src = r.src ?? (r.stake === 'post' ? 'season' : r.stake);
    inc(out.contests, src);
    if (r.stake === 'post') out.contestsPostOrBand++;
    inc(out.outcomes, r.outcome ?? 'running');
  }
  const bandSeen = new Set<number>();
  const listed = new Set<number>();
  for (const p of w.people) for (const i of p.events) listed.add(i);
  for (const e of w.events) {
    if (e.t < t0) continue;
    if (e.type === 'notpicked') {
      out.notPicked++;
      const joined = e.causes.find(c => c.kind === 'event')?.ref;
      if (joined != null && !bandSeen.has(joined)) {
        bandSeen.add(joined);
        out.bandContests++;
        out.contestsPostOrBand++;
      }
    }
    const tr = String((e.decision as any)?.trigger ?? '');
    if (tr === 'contest' && ANSWERS.has(e.type)) {
      const from = e.causes[0]?.ref != null ? w.events[e.causes[0].ref!]?.type : undefined;
      inc(out.answers, `${from ?? '?'}:${e.type}`);
    }
    if (tr === 'rivalry' || tr === 'grudge') {
      inc(out.acts, e.type);
      if (listed.has(e.id) && e.t >= w.startPresent) {
        out.contestLines++;
        if (e.causes.some(c => c.kind === 'trait' || c.key === 'identity')) out.traitLines++;
      }
    }
  }
  const score = (p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const page = (p: Person) =>
    pageLines(
      w,
      p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent),
      new Set(p.events),
    );
  const adults = live(w).filter(p => age(w, p) >= 18);
  for (const p of adults) {
    out.adults++;
    out.kindsAll += new Set(page(p).map(l => l.e.type)).size;
  }
  for (const p of adults
    .slice()
    .sort((x, y) => score(y) - score(x) || x.id - y.id)
    .slice(0, 3)) {
    const L = page(p);
    out.top++;
    out.linesTop += L.length;
    out.kindsTop += new Set(L.map(l => l.e.type)).size;
  }
}
const r = (x: number) => +x.toFixed(3);
console.log(
  'COLLIDE ' +
    JSON.stringify({
      ...out,
      contestsPerWorldDecade: r(((out.contestsPostOrBand / out.worlds) * 10) / yrs),
      bandPerWorldDecade: r(((out.bandContests / out.worlds) * 10) / yrs),
      notPickedPerWorldDecade: r(((out.notPicked / out.worlds) * 10) / yrs),
      kindsAllPerLife: r(out.kindsAll / Math.max(1, out.adults)),
      kindsTopPerLife: r(out.kindsTop / Math.max(1, out.top)),
      linesTopPerLife: r(out.linesTop / Math.max(1, out.top)),
    }),
);
