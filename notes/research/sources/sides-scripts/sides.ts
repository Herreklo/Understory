// P2 research (27 Oct 2026): rifts, the friends of both who would decide, what follows for them within three years, and how often the
// witness is within reach. Throwaway worlds only, every system on (main after round 45). Reads the world; changes nothing in the engine.
//   ./run.sh notes/research/sources/sides-scripts/sides.ts A B [years] [outdir]   → <outdir>/sides-<seed>.json
// A rift is a rivalry declared, a split or divorce, a betrayal, a scheme found out, or a friendship ending with a falling-out (one
// liking below 0.02; "lost touch" is left out). Its deciders are the people who were friends of both sides that month.
// Per decider: liking, trust, respect and familiarity toward each side at the rift; within 36 months whether the friendship with either
// side ended (and how), a rivalry or a rift between them, and any weighty event shared with a side; life turns of the decider.
// Per rift: whether the witness is a side or a decider, whether the witness knows any of the three people (familiarity ≥ 0.1), and
// whether the witness knows the rift event by the end of the run.
import '../../../../src/tools/env';
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { pickWitness } from '../../../../src/witness';
import { age, live, peekBond, type World } from '../../../../src/world';
import { TURNS, weighty } from '../../../../src/tools/consequence-defs';

const [A, B] = [Number(process.argv[2] ?? 9001), Number(process.argv[3] ?? 9001)];
const YEARS = Number(process.argv[4] ?? 10);
const OUT = process.argv[5] ?? 'out-sides';
mkdirSync(OUT, { recursive: true });
const RIFT = new Set(['rivals', 'split', 'divorce', 'betrayed', 'scheme:found']);
const LIFE = new Set(['left', 'hired', 'dismiss', 'walkout', 'quitpride', 'promoted', 'married', 'split', 'divorce', 'moved', 'home']);
const r2 = (x: number | undefined) => Math.round((x ?? 0) * 100) / 100;
const view = (w: World, a: number, b: number) => {
  const r = peekBond(w, a, b);
  return { lk: r2(r?.like), tr: r2(r?.trust), rs: r2(r?.respect), fm: r2(r?.fam) };
};

function runWorld(seed: number) {
  const w = buildWorld(seed, 1);
  const wit = pickWitness(w).id;
  const t0 = w.t;
  const rifts: any[] = [];
  let seen = w.events.length;
  let adultYears = 0;
  for (let m = 0; m < YEARS * 12; m++) {
    // Friendships before the month, so a falling-out's friends of both are read as they stood.
    const before = new Map<number, Set<number>>();
    for (const p of live(w)) before.set(p.id, new Set(p.friends));
    tick(w);
    for (const p of live(w)) if (age(w, p) >= 18) adultYears += 1 / 12;
    for (let k = seen; k < w.events.length; k++) {
      const e = w.events[k];
      const [a, b] = e.who;
      if (a == null || b == null || a === b) continue;
      const fellOut = e.type === 'cooled' && Math.min(peekBond(w, a, b)?.like ?? 1, peekBond(w, b, a)?.like ?? 1) < 0.02;
      if (!RIFT.has(e.type) && !fellOut) continue;
      const fa = before.get(a) ?? new Set(),
        fb = before.get(b) ?? new Set();
      const deciders = [...fa].filter(x => fb.has(x) && x !== a && x !== b && w.byId.get(x)?.status === 'in');
      const fam = (x: number) => (peekBond(w, wit, x)?.fam ?? 0) >= 0.1;
      rifts.push({
        id: e.id,
        t: e.t - t0,
        ty: fellOut ? 'fellout' : e.type,
        a,
        b,
        w: e.w,
        d: deciders.map(x => ({ id: x, toA: view(w, x, a), toB: view(w, x, b), fromA: view(w, a, x), fromB: view(w, b, x) })),
        wit: { side: a === wit || b === wit, decider: deciders.includes(wit), knowsSide: fam(a) || fam(b), knowsDecider: deciders.some(fam) },
        // The witness's familiarity with each side and decider, and whether each is the witness's friend, partner or kin.
        wfam: { a: r2(peekBond(w, wit, a)?.fam), b: r2(peekBond(w, wit, b)?.fam), d: deciders.map(x => r2(peekBond(w, wit, x)?.fam)) },
        wclose: [a, b, ...deciders].map(x => {
          const q = w.byId.get(wit);
          return !!q && (q.friends.has(x) || q.partner === x || q.parents.includes(x) || q.kids.includes(x));
        }),
      });
    }
    seen = w.events.length;
  }
  // What followed, within 36 months of each rift (rifts after year 7 are followed for what is left and flagged).
  const tEnd = w.t - t0;
  for (const r of rifts) {
    r.full = r.t + 36 <= tEnd;
    for (const d of r.d) {
      d.after = { endA: null, endB: null, riftA: false, riftB: false, weightyA: 0, weightyB: 0, life: [] as string[] };
      for (const e of w.events) {
        if (e.t - t0 <= r.t || e.t - t0 > r.t + 36 || e.id === r.id) continue;
        const has = (x: number) => e.who.includes(x);
        if (!has(d.id)) continue;
        for (const [side, key] of [
          [r.a, 'A'],
          [r.b, 'B'],
        ] as const) {
          if (!has(side)) continue;
          if (e.type === 'cooled' && d.after['end' + key] == null)
            d.after['end' + key] = Math.min(peekBond(w, d.id, side)?.like ?? 1, peekBond(w, side, d.id)?.like ?? 1) < 0.02 ? 'fellout' : 'cooled';
          if (RIFT.has(e.type) && e.who[0] !== e.who[1]) d.after['rift' + key] = true;
          if (weighty(e)) d.after['weighty' + key]++;
        }
        if ((LIFE.has(e.type) || TURNS.has(e.type)) && e.who[0] === d.id) d.after.life.push(e.type);
      }
    }
    const ev = w.events[r.id];
    r.wit.knowsRift = ev.knownBy.has(wit) || ev.who.includes(wit);
  }
  return { seed, years: YEARS, adultYears: Math.round(adultYears), pop: live(w).length, rifts };
}

for (let seed = A; seed <= B; seed++) {
  const r = runWorld(seed);
  writeFileSync(`${OUT}/sides-${seed}.json`, JSON.stringify(r));
  console.log(
    seed,
    r.pop,
    r.rifts.length,
    r.rifts.reduce((s, x) => s + x.d.length, 0),
  );
}
