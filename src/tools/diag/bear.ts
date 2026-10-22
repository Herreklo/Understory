// Round 42's sizing: reasons that bear on the act. Behaviour is the same with the switch on and off (the words check), so one run gives
// both pages: on as the page shows it, off with every reason the decision marks as idle shown again (`shownCauses(e, true)`), which is
// main's page. Never read by the model.
//   ./run.sh src/tools/diag/bear.ts A B          → one JSON line a world on stdout: the round's counter and the sizing checks
//   ARMS=1 ./run.sh src/tools/diag/bear.ts A B   → also runs each world with OFF=bear and checks that it differs from the on arm only
//                                                    in the decision records' `idle` (every event's words and reasons, every bond)
//   PACK=<switch>|null ./run.sh src/tools/diag/bear.ts A B [per world]  → the people pairarm.ts reads, chosen as it chooses them, each
//                                                    line of each page with whether bear changes it (check 2), as JSON on stdout
import '../env';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { age, nameOf, year, OFF, type Cause, type Event, type Person, type World } from '../../world';
import { againNote, pageLines, shownCauses } from '../../page';
import { EXPR } from '../../families';
import { FACET_BY_ID } from '../../core';

const [a0, b0, n0] = process.argv.slice(2);
const A = +(a0 ?? 9001),
  B = +(b0 ?? A + 3);
const isAcc = (c: Cause) => c.kind === 'belief' && (c.key ?? '').startsWith('account:');
const isTrait = (c: Cause) => c.kind === 'trait' && !!c.key && !!FACET_BY_ID[c.key];
const idleOf = (e: Event) => new Set(e.decision?.idle ?? []);
const plain = (w: World, s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
// A reason as a phrase, without names, so the same wording is one phrase wherever it falls (for check 1's reader rates).
const phrase = (s: string) =>
  s
    .replace(/@\d+/g, 'X')
    .replace(/\b(19|20)\d{2}\b/g, 'Y')
    .trim();

function world(seed: number, run = 1): World {
  const w = buildWorld(seed, run);
  pickWitness(w);
  runYears(w, 10);
  return w;
}

// A page's lines as pairarm.ts writes them, with the reasons shown as main shows them or as bear does.
function page(w: World, p: Person, all: boolean): { text: string; e: Event }[] {
  const events = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
  const out: { text: string; e: Event }[] = [];
  for (const { e, again, firstT } of pageLines(w, events, new Set(p.events), all)) {
    const shown = shownCauses(e, all);
    const why = shown.length ? '  [' + shown.map(c => plain(w, c.label)).join('; ') + ']' : '';
    out.push({ text: `${year(e.t)}: ${plain(w, e.text)}${why}${again ? `  (${againNote(again, firstT)})` : ''}`, e });
  }
  return out;
}

if (process.env.PACK) packMode(process.env.PACK, +(n0 ?? 3));
else sizeMode();

function sizeMode() {
  for (let seed = A; seed <= B; seed++) {
    const w = world(seed);
    const onPage = new Set<number>();
    for (const p of w.people) for (const i of p.events) if (w.events[i].t >= w.startPresent) onPage.add(i);
    const o = {
      seed,
      lines: 0, // decision lines on someone's page
      withReason: 0, // of them, with a reason beyond the event under main's page
      changed: 0, // whose reasons shown differ
      bare: 0, // check 3: had a reason beyond the event, and have none with bear
      traitShown: 0, // trait reasons shown, main's page
      traitIdle: 0, // counter: trait reasons shown that do not bear (main's page); on, the same count is 0 by construction
      traitIdleOn: 0,
      traitExprOnly: 0, // the note's test without the motive clause: traits the expression neither prefers nor shows
      rescued: 0, // check 1: of those, kept because the motive has words of its own for the family
      accShown: 0,
      accIdle: 0, // counter: accounts shown that decided nothing (main's page)
      accIdleOn: 0,
      accShownOn: 0,
      cited: 0, // events shown under a line because a reason cites them: main's page
      citedOn: 0,
      busiest: { pagesAccOff: 0, pagesAccOn: 0, pagesAccBoth: 0, pages: 0 }, // check 5
      dropped: {} as Record<string, number>, // check 1: the phrases bear leaves out, by count
      kept: {} as Record<string, number>, // and the trait phrases it keeps
    };
    for (const i of onPage) {
      const e = w.events[i];
      if (!e.decision) continue;
      o.lines++;
      const off = shownCauses(e, true),
        on = shownCauses(e);
      const idle = idleOf(e);
      const reasons = (cs: Cause[]) => cs.filter(c => c.kind !== 'event');
      if (reasons(off).length) o.withReason++;
      if (off.map(c => c.label).join('|') !== on.map(c => c.label).join('|')) o.changed++;
      if (reasons(off).length && !reasons(on).length) o.bare++;
      const x = EXPR[(e.decision as any).expr ?? ''];
      for (const c of off) {
        if (isTrait(c)) {
          o.traitShown++;
          if (idle.has(c.key!)) {
            o.traitIdle++;
            o.dropped[phrase(c.label)] = (o.dropped[phrase(c.label)] ?? 0) + 1;
          } else o.kept[phrase(c.label)] = (o.kept[phrase(c.label)] ?? 0) + 1;
          if (x && !(x.prefers[c.key!] ?? 0) && !((x.evidence as Record<string, number | undefined>)[c.key!] ?? 0)) {
            o.traitExprOnly++;
            if (!idle.has(c.key!)) o.rescued++;
          }
        }
        if (isAcc(c)) {
          o.accShown++;
          if (idle.has(c.key!)) {
            o.accIdle++;
            o.dropped[phrase(c.label)] = (o.dropped[phrase(c.label)] ?? 0) + 1;
          }
        }
      }
      for (const c of on) {
        if (isTrait(c) && idle.has(c.key!)) o.traitIdleOn++;
        if (isAcc(c)) {
          o.accShownOn++;
          if (idle.has(c.key!)) o.accIdleOn++;
        }
      }
    }
    // Events shown under a line, on whole pages (pageLines), with and without bear: a reason left out may take its cited event with it.
    const adults = w.people.filter(p => p.status !== 'dead' && age(w, p) >= 18);
    for (const p of adults) {
      const events = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
      o.cited += pageLines(w, events, new Set(p.events), true).reduce((s, l) => s + l.cited.length, 0);
      o.citedOn += pageLines(w, events, new Set(p.events)).reduce((s, l) => s + l.cited.length, 0);
    }
    // Check 5: the busiest pages, as pairarm.ts picks them (three a world, by present weight), with an account shown, on and off.
    const weight = (p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
    const busiest = adults
      .filter(p => p.status === 'in')
      .sort((x, y) => weight(y) - weight(x))
      .slice(0, 3);
    for (const p of busiest) {
      const hasAcc = (all: boolean) => page(w, p, all).some(l => shownCauses(l.e, all).some(isAcc));
      const off = hasAcc(true),
        on = hasAcc(false);
      o.busiest.pages++;
      if (off) o.busiest.pagesAccOff++;
      if (on) o.busiest.pagesAccOn++;
      if (on && off) o.busiest.pagesAccBoth++;
    }
    if (process.env.ARMS) Object.assign(o, { arms: arms(seed, w) });
    console.log(JSON.stringify(o));
    console.error(`bear: world ${seed}`);
  }
}

// The on arm against OFF=bear: the same world but for the decision records' `idle`.
function arms(seed: number, on: World) {
  OFF.add('bear');
  const off = world(seed);
  OFF.delete('bear');
  const strip = (e: Event) => JSON.stringify({ ...e, knownBy: [...e.knownBy], decision: e.decision && { ...e.decision, idle: undefined } });
  let events = on.events.length === off.events.length ? 0 : -1,
    idle = 0;
  if (events === 0)
    for (let i = 0; i < on.events.length; i++) {
      if (strip(on.events[i]) !== strip(off.events[i])) events++;
      if (on.events[i].decision?.idle) idle++;
      if (off.events[i].decision?.idle) events++;
    }
  let bonds = 0;
  for (const [k, b] of on.bonds) if (JSON.stringify(b) !== JSON.stringify(off.bonds.get(k))) bonds++;
  if (on.bonds.size !== off.bonds.size) bonds += Math.abs(on.bonds.size - off.bonds.size);
  return { eventsDiffer: events, bondsDiffer: bonds, decisionsMarked: idle, rng: on.rng.save() === off.rng.save() };
}

// Check 2: the pages of a pack as pairarm.ts makes them, each line with what bear does to it. `sw` is a switch that is on unless OFF=<sw>,
// or 'null' for M38's null pack (both arms the engine as it is, the on arm on run seed 2).
function packMode(sw: string, PER: number) {
  const NULL = sw === 'null';
  const arm = (seed: number, on: boolean) => {
    if (NULL) return world(seed, on ? 2 : 1);
    if (on) OFF.delete(sw);
    else OFF.add(sw);
    const w = world(seed);
    OFF.delete(sw);
    return w;
  };
  const made: any[] = [];
  let n = 0;
  for (let seed = A; seed <= B; seed++) {
    const off = arm(seed, false);
    const on = arm(seed, true);
    const score = (w: World, p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
    const same = (p: Person) => on.people.find(q => q.first === p.first && q.last === p.last && q.born === p.born && q.sex === p.sex);
    const people = off.people
      .filter(p => p.status !== 'dead' && age(off, p) >= 18 && same(p)?.status === 'in')
      .sort((x, y) => score(off, y) + score(on, same(y)!) - score(off, x) - score(on, same(x)!))
      .slice(0, PER);
    for (const p of people) {
      const q = same(p)!;
      const lines = (w: World, x: Person) => {
        const all = page(w, x, true),
          bear = page(w, x, false);
        return all.map((l, i) => ({
          text: l.text,
          bear: bear[i].text,
          trait: shownCauses(l.e, true).some(isTrait),
          motive: shownCauses(l.e, true).some(c => isTrait(c) && !/: /.test(c.label)),
          account: shownCauses(l.e, true).some(isAcc),
        }));
      };
      made.push({ id: `P${String(++n).padStart(2, '0')}`, seed, person: p.id, on: lines(on, q), off: lines(off, p) });
    }
    console.error(`bear: pack world ${seed}`);
  }
  console.log(JSON.stringify(made));
}
