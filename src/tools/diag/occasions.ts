// Round 36's own count: where wants come from, how many adults go after something, what comes of it, and how long a page is.
//   tsx src/tools/diag/occasions.ts A B [years]   (seeds A..B; OFF= and ON= are read from the environment, as by every check)
// Last line: OCC {...}
import '../env';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { pageLines } from '../../page';
import { age, live, nameOf, type World, type Person } from '../../world';
import { OWN_KINDS } from '../../occasions';

const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];
const inc = (m: Record<string, number>, k: string, v = 1) => (m[k] = (m[k] ?? 0) + v);
const out = {
  seeds: [a, b],
  worlds: 0,
  adults: 0,
  pursued: 0, // adults who started a pursuit of their own in the window (as r25c.ts counts it)
  wants: 0, // wants of one's own kinds that came in the window
  wantsByOrigin: {} as Record<string, number>,
  wantsByKind: {} as Record<string, number>,
  started: 0, // pursuits of one's own started in the window
  startedWithOrigin: 0,
  startedNotRestore: 0,
  outcome: {} as Record<string, number>, // of pursuits started: achieved, abandoned, open
  bought: 0,
  lapsedSaid: 0,
  wishes: 0,
  openPerAdult: 0,
  houses: 0, // adults owning a house at the end
  lines: 0, // page lines a life, all adults (present years)
  linesTop: 0, // the three most eventful adults of each world
  topN: 0,
  sample: [] as string[],
};
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  runYears(w, yrs);
  out.worlds++;
  const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
  for (const p of w.people)
    for (const x of p.wants) {
      if (!OWN_KINDS.has(x.kind) || x.pursuit?.owner != null) continue;
      if (x.since >= t0) {
        out.wants++;
        inc(out.wantsByOrigin, x.origin?.kind ?? 'none');
        inc(out.wantsByKind, x.kind);
      }
      const u = x.pursuit;
      if (!u || u.start < t0) continue;
      out.started++;
      if (x.origin) out.startedWithOrigin++;
      if (x.kind !== 'restore') out.startedNotRestore++;
      inc(out.outcome, x.done ?? 'open');
    }
  for (const e of w.events) {
    if (e.t < t0) continue;
    if (e.type === 'bought') out.bought++;
    if (e.type === 'want:lapsed') out.lapsedSaid++;
    if (e.type === 'tell' && e.causes[0]?.kind === 'event' && e.causes[1]?.kind === 'want') out.wishes++;
  }
  const score = (p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const adults = live(w).filter(p => age(w, p) >= 18);
  const linesOf = (p: Person) =>
    pageLines(
      w,
      p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent),
      new Set(p.events),
    ).length;
  for (const p of adults) {
    out.adults++;
    if (p.wants.some(x => x.pursuit && !x.pursuit.owner && x.pursuit.start >= t0)) out.pursued++;
    out.openPerAdult += p.wants.filter(x => !x.done && OWN_KINDS.has(x.kind) && !x.pursuit?.owner).length;
    if (p.attachments.some(x => x.key === 'house')) out.houses++;
    out.lines += linesOf(p);
  }
  for (const p of adults
    .slice()
    .sort((x, y) => score(y) - score(x) || x.id - y.id)
    .slice(0, 3)) {
    out.linesTop += linesOf(p);
    out.topN++;
  }
  for (const e of w.events)
    if (e.t >= t0 && out.sample.length < 4 * out.worlds && (e.type === 'pursuit' || e.type === 'bought') && e.causes[0]?.kind === 'event')
      out.sample.push(`${plain(e.text)} [${e.causes.map(c => plain(c.label)).join('; ')}]`);
}
const r = (x: number) => +x.toFixed(4);
const res = {
  ...out,
  pursuedShare: r(out.pursued / Math.max(1, out.adults)),
  wantsPerWorld: r(out.wants / out.worlds),
  startedPerWorld: r(out.started / out.worlds),
  startedNotRestorePerWorld: r(out.startedNotRestore / out.worlds),
  originShareOfWants: r((out.wants - (out.wantsByOrigin.none ?? 0)) / Math.max(1, out.wants)),
  originShareOfStarted: r(out.startedWithOrigin / Math.max(1, out.started)),
  boughtPerWorld: r(out.bought / out.worlds),
  openPerAdult: r(out.openPerAdult / Math.max(1, out.adults)),
  houseShare: r(out.houses / Math.max(1, out.adults)),
  linesPerLife: r(out.lines / Math.max(1, out.adults)),
  linesTopPerLife: r(out.linesTop / Math.max(1, out.topN)),
};
for (const l of res.sample) console.log('  ' + l);
delete (res as any).sample;
console.log('OCC ' + JSON.stringify(res));
