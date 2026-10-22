// The wording round's sizing (43w): reasons worded for the act. Words only, so one run gives both pages: each trait reason on a line is read
// back to its facet, pole and form, and said both as main says it (by the kind of answer, else in general) and as the round says it (by
// the act first). Never read by the model.
//   ./run.sh src/tools/diag/wording.ts A B          → one JSON line a world on stdout: the reasons the round words, their cells and where
//                                                     each comes from (check 3), and the changed lines on the pages a pack would read
//                                                     (check 5)
//   ARMS=1 ./run.sh src/tools/diag/wording.ts A B   → also runs each world with OFF=wording and checks that the two differ only in the
//                                                     words of reasons and of `backsong`, and that main's words said again here are the
//                                                     words the off arm wrote
//   PACK=<switch>|null ./run.sh src/tools/diag/wording.ts A B [per world] → the people pairarm.ts reads, chosen as it chooses them, each
//                                                     line with its act and its reasons read back (checks 1 and 2), as JSON on stdout
// Runs on older trees too (rounds 40 and 41, for M38's pages) with motives.ts and motives.json from this tree.
import '../env';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { age, nameOf, year, OFF, type Cause, type Event, type Person, type World } from '../../world';
import { againNote, pageLines, shownCauses } from '../../page';
import { FACET_BY_ID } from '../../core';
import { EXPR } from '../../families';
import { motive, voiceOf, type Act } from '../../motives';

const [a0, b0, n0] = process.argv.slice(2);
const A = +(a0 ?? 9001),
  B = +(b0 ?? A + 3);
const plain = (w: World, s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));

function world(seed: number, run = 1): World {
  const w = buildWorld(seed, run);
  pickWitness(w);
  runYears(w, 10);
  return w;
}

// A trait reason read back: which facet, pole and form its words are, and which table gave main's words; main's words and the round's.
export interface Read {
  facet: string;
  hi: boolean;
  against: boolean;
  src: 'family' | 'general';
  off: string;
  on: string;
}
// The act, for the words: the expression chosen, if the event is one, and the event's type.
export const actOf = (e: Event): Act => ({ expr: (e.decision as any)?.expr as string | undefined, type: e.type });
const cellOf = (e: Event, r: Read) => {
  const a = actOf(e);
  return `${a.expr ?? 'type:' + a.type}|${r.facet}|${r.hi ? 'hi' : 'lo'}|${r.against ? 'against' : 'for'}`;
};
export function readBack(w: World, e: Event, c: Cause): Read | undefined {
  if (c.kind !== 'trait' || !c.key) return undefined;
  const facet = c.key.replace(/^against:/, '');
  if (!FACET_BY_ID[facet]) return undefined;
  const p = w.byId.get(c.who ?? e.who[0]);
  if (!p) return undefined;
  const d = e.decision as any;
  const other = d?.target ?? (e.who[0] === p.id ? e.who[1] : undefined);
  const t = other != null ? `@${other}` : undefined;
  const v = voiceOf(p.sex);
  for (const hi of [true, false])
    for (const against of [false, true]) {
      const off = motive(facet, hi, d?.chosen, against, v, t);
      const on = motive(facet, hi, d?.chosen, against, v, t, actOf(e));
      if (off === undefined || on === undefined || (c.label !== off && c.label !== on)) continue;
      return { facet, hi, against, src: off !== motive(facet, hi, undefined, against, v, t) ? 'family' : 'general', off, on };
    }
  return undefined;
}
// The page's own text for a line, as the round says it: `backsong` reads as backing the song.
const SONG = / as if it were (?:his|her|.+?'s) own/;
const songOn = (s: string) => s.replace(SONG, ' the way it was written, and gave it everything');
const quotesSong = (s: string) => SONG.test(s) || s.includes(' the way it was written, and gave it everything');
const isSong = (e: Event) => actOf(e).expr === 'backsong';

// A page's lines as pairarm.ts writes them, with each line's act and its reasons read back, in main's words and in the round's.
function page(w: World, p: Person) {
  const events = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
  const out: any[] = [];
  let n = 0;
  for (const { e, cited, again, firstT } of pageLines(w, events, new Set(p.events))) {
    const shown = shownCauses(e);
    const say = (labels: string[]) => (labels.length ? '  [' + labels.map(l => plain(w, l)).join('; ') + ']' : '');
    const tail = again ? `  (${(againNote as any)(again, firstT)})` : '';
    const reads = shown.map(c => readBack(w, e, c));
    const head = `${year(e.t)}: ${plain(w, e.text)}`;
    // A reason that cites a `backsong` event, or tells of one, quotes its words.
    const text = head + say(shown.map((c, i) => reads[i]?.off ?? c.label)) + tail;
    const on = (isSong(e) ? songOn(head) : head) + say(shown.map((c, i) => reads[i]?.on ?? songOn(c.label))) + tail;
    out.push({
      n: ++n,
      text,
      on,
      changed: reads.some(x => x && x.on !== x.off) || quotesSong(head) || shown.some(c => quotesSong(c.label)),
      type: e.type,
      act: actOf(e),
      fam: (e.decision as any)?.chosen,
      cited: cited.length,
      causes: shown.map((c, i) => ({
        kind: c.kind,
        key: c.key,
        label: plain(w, c.label),
        ...(c.ref != null ? { ref: c.ref } : {}),
        ...(reads[i] ? { read: { ...reads[i], off: plain(w, reads[i]!.off), on: plain(w, reads[i]!.on) } } : {}),
      })),
    });
  }
  return out;
}

// The people a pack reads in a world, as pairarm.ts chooses them: the PER adults with the most weight in the present, in both arms.
function chosen(off: World, on: World, PER: number) {
  const score = (w: World, p: Person) => p.events.reduce((s, i) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const same = (p: Person) => on.people.find(q => q.first === p.first && q.last === p.last && q.born === p.born && q.sex === p.sex);
  return off.people
    .filter(p => p.status !== 'dead' && age(off, p) >= 18 && same(p)?.status === 'in')
    .sort((x, y) => score(off, y) + score(on, same(y)!) - score(off, x) - score(on, same(x)!))
    .slice(0, PER)
    .map(p => [p, same(p)!] as const);
}

if (process.env.PACK) packMode(process.env.PACK, +(n0 ?? 3));
else sizeMode(+(n0 ?? 3));

// Per world: every reason in the present the round words, by cell and by where it comes from; the pages a pack would read, with how many
// of their lines change words. Where a reworded reason comes from (check 3): on an event that is no decision, the code that wrote the event
// gave it ('own'); on a decision, a facet the expression chosen prefers at that pole ('prefers'), or else a consideration that favoured the
// family chosen ('weighed', weight above 0; an against form, the one that argued against it). Anything else is untraced.
function sizeMode(PER: number) {
  for (let seed = A; seed <= B; seed++) {
    const w = world(seed);
    const r = {
      seed,
      events: 0,
      reasons: 0, // trait reasons
      said: 0, // ... said as a motive
      worded: 0, // ... in words the round changed
      song: 0, // backsong events
      cells: {} as Record<string, number>,
      from: { own: 0, prefers: 0, weighed: 0, untraced: 0 },
      untraced: [] as string[],
      words: {} as Record<string, string[]>, // cell → [main's words, the round's], once
      pages: [] as { lines: number; changed: number }[],
      arms: undefined as undefined | ReturnType<typeof arms>,
    };
    for (const e of w.events) {
      if (e.t < w.startPresent) continue;
      r.events++;
      if (isSong(e)) r.song++;
      for (const c of e.causes) {
        if (c.kind !== 'trait' || !c.key) continue;
        r.reasons++;
        const x = readBack(w, e, c);
        if (!x) continue;
        r.said++;
        if (x.on === x.off) continue;
        r.worded++;
        const k = cellOf(e, x);
        r.cells[k] = (r.cells[k] ?? 0) + 1;
        r.words[k] ??= [x.off, x.on].map(s => s.replace(/@\d+/g, '{t}'));
        const d = e.decision as any;
        const pref = d?.expr ? (EXPR[d.expr]?.prefers as Record<string, number> | undefined)?.[x.facet] : undefined;
        const weighed = x.against ? c.key.startsWith('against:') || c.weight > 0 : !c.key.startsWith('against:') && c.weight > 0;
        const from = !d ? 'own' : !x.against && pref != null && pref > 0 === x.hi ? 'prefers' : weighed ? 'weighed' : 'untraced';
        r.from[from]++;
        if (from === 'untraced' && r.untraced.length < 5) r.untraced.push(`${k}: ${plain(w, e.text)} [${plain(w, c.label)}]`);
      }
    }
    for (const [p] of chosen(w, w, PER)) {
      const lines = page(w, p);
      r.pages.push({ lines: lines.length, changed: lines.filter(l => l.changed).length });
    }
    if (process.env.ARMS) r.arms = arms(w, seed);
    console.log(JSON.stringify(r));
    console.error(`wording: world ${seed}`);
  }
}

// The same world with OFF=wording: identical but for the words of reasons the round words and the text of `backsong` (and what quotes it).
function arms(on: World, seed: number) {
  OFF.add('wording');
  const off = world(seed);
  OFF.delete('wording');
  const diff: string[] = [];
  let reasons = 0,
    texts = 0;
  const note = (s: string) => void (diff.length < 8 && diff.push(s));
  const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);
  if (off.events.length !== on.events.length) note(`events ${off.events.length} against ${on.events.length}`);
  for (let i = 0; i < Math.min(off.events.length, on.events.length); i++) {
    const a = off.events[i],
      b = on.events[i];
    if (a.type !== b.type || a.t !== b.t || !same(a.who, b.who) || a.w !== b.w || !same(a.decision, b.decision)) {
      note(`event ${i}: ${a.type} against ${b.type}`);
      continue;
    }
    if (a.text !== b.text) {
      if (isSong(b) && songOn(plain(off, a.text)) === plain(on, b.text)) texts++;
      else note(`event ${i} text: ${a.text} | ${b.text}`);
    }
    if (a.causes.length !== b.causes.length) note(`event ${i}: ${a.causes.length} reasons against ${b.causes.length}`);
    a.causes.forEach((c, j) => {
      const d = b.causes[j];
      if (!d || c.kind !== d.kind || c.key !== d.key || c.weight !== d.weight || c.ref !== d.ref || c.who !== d.who)
        return note(`event ${i} reason ${j}: ${c.label} | ${d?.label}`);
      if (c.label === d.label) return;
      const x = readBack(on, b, d);
      if (x && x.on === d.label && x.off === c.label) return void reasons++;
      if (songOn(plain(off, c.label)) === plain(on, d.label)) return void texts++;
      note(`event ${i} reason ${j}: ${c.label} | ${d.label}`);
    });
  }
  // What people are at the end: who is alive and where, and every bond with what it remembers (a memory's words may quote `backsong`).
  const state = (w: World) =>
    JSON.stringify([
      w.people.map(p => [p.id, p.status, p.job, (p as any).home, p.events.length, [...p.friends]]),
      [...w.bonds].map(([k, b]) => [k, b.fam, b.like, b.respect, b.trust, b.mem.map(m => [m.ev, m.t, m.like, m.respect, m.trust])]),
    ]);
  if (state(off) !== state(on)) note('people differ at the end');
  return { same: diff.length === 0, events: on.events.length, reasons, texts, diff };
}

// The pages of a pack as pairarm.ts makes them. `sw` is a switch that is on unless OFF=<sw>, or 'null' for M38's null pack (both arms the
// engine as it is, the on arm on run seed 2).
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
    for (const [p, q] of chosen(off, on, PER))
      made.push({ id: `P${String(++n).padStart(2, '0')}`, seed, person: p.id, on: page(on, q), off: page(off, p) });
    console.error(`wording: pack world ${seed}`);
  }
  console.log(JSON.stringify(made));
}
