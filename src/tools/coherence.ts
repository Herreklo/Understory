// Round F27: the coherence floor. Builds fresh worlds, runs ten present years, and counts every known fault type (BOARD, round F27,
// types 1–12) over the record and over the rendered lives, then prints a table and a machine-readable line.
//   tsx src/tools/coherence.ts A B        (seeds A..B; OFF=floor and ON=<name> are read as the other tools read them)
// Last line: COHERENCE {"seeds":[A,B],"counts":{"1":n,...,"12":n}}
//
// Where each type is counted. On the record (w.events, bonds, people): 1, 2, 3, 4, 8, 11, 12. On the page (a person's life as the
// app renders it: every event on their own list, with its first three reasons, the hindsight of their two biggest surprises, and
// their wants with their dates): 5, 6, 7, 9, 10. What is approximate is said at each type below.
import { buildWorld } from '../build';
import { tick } from '../life';
import { pickWitness, hindsight } from '../witness';
import { OFF, ON, year, nameOf, fullName, age, type World, type Person, type Event, type Cause } from '../world';
import { SETTING } from '../setting';
import { EXPR } from '../families';
import { MOTIVE_FACETS } from '../motives';
import { wantLabel } from '../time';
for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
for (const x of (process.env.ON ?? '').split(',').filter(Boolean)) ON.add(x);

const A = +process.argv[2],
  B = +process.argv[3];
if (!(A >= 0 && B >= A)) {
  console.error('usage: tsx src/tools/coherence.ts A B');
  process.exit(2);
}

const NAMES: Record<number, string> = {
  1: 'a remembered event held twice in one bond',
  2: '"nothing had changed since" earlier than "together since"',
  3: "a group's event holds the group's live member list",
  4: 'a dead person in a later event',
  5: 'a stock reason that does not fit the act',
  6: 'a reason citing an event that is not on the page',
  7: 'one want dated two ways',
  8: 'an act at a workplace the person has left',
  9: 'a broken phrase',
  10: 'a repeat a writer would cut',
  11: 'near-identical names among the living',
  12: 'a friendship that ends and restarts with nothing between',
};
const counts: Record<number, number> = {};
const examples: Record<number, { seed: number; text: string }[]> = {};
for (let n = 1; n <= 12; n++) {
  counts[n] = 0;
  examples[n] = [];
}
function hit(n: number, seed: number, text: string) {
  counts[n]++;
  if (examples[n].length < 2) examples[n].push({ seed, text: text.replace(/\s+/g, ' ').trim().slice(0, 160) });
}

const PLACES = SETTING.places as { id: string; name: string; role: string; title: string }[];
const MONEY = /\b(money|cash|till|wallet|pay|paid|owed|owe|debt|loan|price|cost|bill|rent|savings|account|expenses|claims|catch\b)/i;
const MONEY_NAMES = Object.values((SETTING as any).resources as Record<string, string>);
const stripYears = (s: string) => s.replace(/\b(19|20)\d{2}\b/g, 'YEAR');
const lev1 = (a: string, b: string) => {
  // true when the two words are within one letter of each other (one substitution, insertion or deletion)
  if (a === b) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
};

const t0run = Date.now();
for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  const wit = pickWitness(w);
  const t0 = w.t;
  const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
  const knownByWitness = (e: Event) => e.knownBy.has(wit.id) || e.who.includes(wit.id);
  // Ten present years, month by month, keeping each person's job at the start and the end of every month (type 8).
  const jobBefore = new Map<number, Map<number, string | null>>();
  const jobAfter = new Map<number, Map<number, string | null>>();
  const snap = (into: Map<number, Map<number, string | null>>, t: number) => {
    for (const p of w.people) {
      let m = into.get(p.id);
      if (!m) into.set(p.id, (m = new Map()));
      m.set(t, p.job);
    }
  };
  snap(jobBefore, w.t); // the month the witness arrives has events of its own
  snap(jobAfter, w.t);
  for (let i = 0; i < 120; i++) {
    snap(jobBefore, w.t + 1); // tick moves the clock first, then runs that month
    tick(w);
    snap(jobAfter, w.t);
  }

  // ----- 1. A remembered event held twice in one bond: bond entries sharing one event id, counted once per bond and event. -----
  for (const r of w.bonds.values()) {
    const seen = new Set<number>(),
      twice = new Set<number>();
    for (const m of r.mem) {
      if (m.ev < 0 || !w.events[m.ev]) continue; // a memory with no event behind it
      if (seen.has(m.ev)) twice.add(m.ev);
      seen.add(m.ev);
    }
    for (const ev of twice) hit(1, seed, `bond holds "${plain(w.events[ev].text)}" ${r.mem.filter(m => m.ev === ev).length} times`);
  }

  // ----- 2. "Nothing had changed since Y" earlier than the same event's "together since Z". -----
  for (const e of w.events) {
    if (e.t < t0) continue;
    const nc = e.text.match(/Nothing had changed since (\d{4})/);
    const ts = e.causes.map(c => c.label.match(/together since (\d{4})/)).find(Boolean);
    if (nc && ts && +nc[1] < +ts[1]) hit(2, seed, `${plain(e.text)} [together since ${ts[1]}]`);
  }

  // ----- 3. A group's formed/hole/split event whose who is the group's live list (same array), or on only some of its people's own lists. -----
  for (const g of w.groups) {
    for (const i of g.events) {
      const e = w.events[i];
      if (!e || !['group:formed', 'group:hole', 'group:split'].includes(e.type)) continue;
      const people = [...new Set(e.who)].filter(id => w.byId.has(id));
      const has = people.filter(id => w.byId.get(id)!.events.includes(e.id)).length;
      if (e.who === g.members) hit(3, seed, `${e.type}: "${plain(e.text)}" shares its who with ${g.name}'s member list`);
      else if (has !== 0 && has !== people.length) hit(3, seed, `${e.type}: "${plain(e.text)}" is on ${has} of ${people.length} own lists`);
    }
  }

  // ----- 4. A person named in an event dated after their death (any type; the type is named in the example). -----
  for (const e of w.events)
    for (const id of new Set(e.who)) {
      const p = w.byId.get(id);
      if (p && p.diedAt != null && e.t > p.diedAt)
        hit(4, seed, `${e.type}: ${fullName(p)} (died ${year(p.diedAt)}) in "${plain(e.text)}" (${year(e.t)})`);
    }

  // ----- 8. An act at a workplace the person has left: a work event (hired, moved, promoted, passed, retired, or an act decided at work)
  // whose text names a SETTING place that was not the subject's job at the start or the end of that month. A place named where it is
  // not a workplace (a drink at the Anchor, a visit to the clinic) is not counted, so only work-typed events are read. -----
  const WORK_TYPES = new Set(['promoted', 'passed', 'dressdown', 'dismissed', 'secondchance', 'contest', 'rivalry']);
  for (const e of w.events) {
    if (e.t < t0 || !e.who.length) continue;
    const trig = (e.decision?.trigger ?? '').replace(/:.*$/, '');
    const atWork = WORK_TYPES.has(e.type) || ['deadline', 'work', 'shift', 'boss', 'task'].includes(trig);
    if (!atWork) continue;
    const p = w.byId.get(e.who[0]);
    if (!p) continue;
    const before = jobBefore.get(p.id)?.get(e.t),
      after = jobAfter.get(p.id)?.get(e.t);
    const said = e.text.replace(/"[^"]*"/g, ''); // a song title is not a place
    for (const pl of PLACES) {
      if (!said.includes(`at ${pl.name}`)) continue;
      if (pl.id === before || pl.id === after) continue;
      hit(8, seed, `${e.type}: "${plain(e.text)}" (${year(e.t)}; job then: ${before ?? 'none'})`);
    }
  }

  // ----- 11. Near-identical names among the living: same first name with surnames within one letter, or the same full name. -----
  const adults = w.people.filter(p => p.status !== 'dead' && age(w, p) >= 18);
  for (let i = 0; i < adults.length; i++)
    for (let j = i + 1; j < adults.length; j++) {
      const a = adults[i],
        b = adults[j];
      if (a.first !== b.first) continue;
      if (a.last === b.last || lev1(a.last, b.last)) hit(11, seed, `${fullName(a)} and ${fullName(b)}`);
    }

  // ----- 12. A friendship that ends (cooled) and restarts (friends or madeup) within three years with no event between that names both. -----
  const cooled = new Map<string, Event>();
  for (const e of w.events) {
    if (e.who.length < 2) continue;
    const key = [...new Set(e.who)].sort((a, b) => a - b).join('-');
    if (e.type === 'cooled' && e.who.length === 2) cooled.set(key, e);
    else if ((e.type === 'friends' || e.type === 'madeup') && e.who.length === 2) {
      const c = cooled.get(key);
      if (c && e.t - c.t <= 36 && e.t >= t0) {
        const between = w.events.slice(c.id + 1, e.id).some(x => x.who.includes(e.who[0]) && x.who.includes(e.who[1]));
        if (!between) hit(12, seed, `"${plain(c.text)}" (${year(c.t)}) then "${plain(e.text)}" (${year(e.t)})`);
      }
      cooled.delete(key);
    }
  }

  // ----- The page: each person's life as the app renders it. -----
  for (const p of w.people) {
    if (p.id === wit.id) continue;
    const mine = new Set(p.events);
    const lines: string[] = [];
    const shownCauses = (e: Event): Cause[] => e.causes.filter(c => !c.key?.startsWith('against:')).slice(0, 3);
    for (const i of p.events) {
      const e = w.events[i];
      const why = shownCauses(e);
      lines.push(`${year(e.t)}: ${plain(e.text)}${why.length ? ' [' + why.map(c => plain(c.label)).join('; ') + ']' : ''}`);
      // ----- 6. A reason citing an event that is not on this page (not on the person's own list: unlisted, or someone else's) and that
      // the witness did not see. Present years only. -----
      for (const c of why)
        if (e.t >= t0 && c.kind === 'event' && c.ref != null && c.ref >= 0 && !mine.has(c.ref) && !knownByWitness(w.events[c.ref]))
          hit(6, seed, `${fullName(p)}: "${plain(e.text)}" cites "${plain(c.label)}"`);
      // ----- 5. A stock reason that does not fit the act. Only the detectable core is counted: the two wordings the cold read quoted,
      // where the act is not about what they describe ("would not take what was not his" on an act with no money in it; "has never
      // minded being looked at" on a couple or a group parting). A general test (a motive whose facet the act's family is not wired
      // to) counts every reason a feature brought in, most of them fair, so it is not used; wordings outside these two are not counted. -----
      if (e.t >= t0 && e.decision) {
        const fam = EXPR[e.type]?.family ?? e.decision.chosen;
        for (const c of why) {
          if (c.kind !== 'trait' || !c.key || !MOTIVE_FACETS.includes(c.key.replace(/^against:/, ''))) continue;
          const label = plain(c.label);
          const taking = /would not take what was not (his|hers)/.test(label) && !MONEY.test(e.text) && !MONEY_NAMES.some(m => e.text.includes(m));
          const lookedAt = /never minded being looked at/.test(label) && /^(couple:apart|group:split)$/.test(e.type);
          if (taking || lookedAt) hit(5, seed, `${fullName(p)}: "${plain(e.text)}" [${label}] (${fam})`);
        }
      }
    }
    const big = p.events
      .map(i => w.events[i])
      .filter(e => e.t >= t0 && e.surprise != null && e.surprise > 0.45 && e.w >= 1 && knownByWitness(e))
      .sort((a, b) => b.surprise! - a.surprise!)
      .slice(0, 2);
    for (const e of big) {
      const h = hindsight(w, e);
      lines.push(`Looking back: ${plain(e.text)} · could have seen: ${plain(h.seen.join('; '))} · could not: ${plain(h.unseen.join('; '))}`);
    }
    for (const x of p.wants) lines.push(`Want: ${plain(wantLabel(w, p, x))} (since ${year(x.since)})`);

    // ----- 9. Broken phrases, by pattern. "finally said it out loud" (the confiding wording) is counted whenever it appears, since it
    // never says what was said. Present years only. -----
    const BROKEN: [RegExp, string][] = [
      [/ of in /, '"of in"'],
      [/\bat (the [A-Za-z' ]+?) at \1\b/, 'the same place twice'],
      [/playing vocals/, '"playing vocals"'],
      [/finally said it out loud/, '"out loud" without what'],
      [/\bundefined\b/, '"undefined"'],
      [/\bNaN\b/, '"NaN"'],
      [/\S {2,}[.,;:]/, 'spaces before punctuation'],
      [/'s 's/, '"\'s \'s"'],
    ];
    for (const line of lines) {
      if (/^(19|20)\d{2}: /.test(line) && +line.slice(0, 4) < year(t0)) continue; // the past is not counted
      for (const [re, what] of BROKEN) {
        const m = line.match(re);
        if (m) hit(9, seed, `${what}: ${fullName(p)}: ${line.slice(Math.max(0, m.index! - 60), m.index! + 60)}`);
      }
    }

    // ----- 7. One want dated two ways: the years the page gives one want. The wants list says "since <the want's year>"; the event that
    // settled it and every present event whose want-reason points at it (same source event, or the person's only want of that kind) say
    // "had wanted it since <year>" or "working toward it since <year>". Two different years for one want is one fault. A want-reason
    // on a want the person holds twice of the same kind cannot be told apart and is not counted. -----
    const SINCE = /\b(?:want(?:ed|s)?\b[^.;:\[\]()]*?|working toward it |meant to [^.;]*?)since (\d{4})/g;
    for (const x of p.wants) {
      const years = new Map<string, string>([[String(year(x.since)), 'the wants list']]);
      const only = p.wants.filter(y => y.kind === x.kind).length === 1;
      for (const i of p.events) {
        const e = w.events[i];
        if (e.t < t0 && x.doneAt !== e.id) continue;
        const cites =
          x.doneAt === e.id ||
          shownCauses(e).some(
            c =>
              c.kind === 'want' &&
              (c.who == null || c.who === p.id) &&
              (c.ref != null && x.cause != null ? c.ref === x.cause : only && (c.key == null || c.key === x.kind)),
          );
        if (!cites) continue;
        for (const c of shownCauses(e)) for (const m of c.label.matchAll(SINCE)) years.set(m[1], plain(e.text));
      }
      if (years.size > 1)
        hit(7, seed, `${fullName(p)}: ${plain(wantLabel(w, p, x))}: ${[...years].map(([y, where]) => `${y} (${where})`).join(' / ')}`);
    }

    // ----- 10. Repeats a writer would cut: the same type, the same people and the same words (years aside) more than twice on one page;
    // the third and later are counted, when they fall in the present years. -----
    const same = new Map<string, number>();
    for (const i of p.events) {
      const e = w.events[i];
      const k = `${e.type}|${[...new Set(e.who)].sort((a, b) => a - b).join(',')}|${stripYears(e.text)}`;
      const n = (same.get(k) ?? 0) + 1;
      same.set(k, n);
      if (n > 2 && e.t >= t0) hit(10, seed, `${fullName(p)}: ×${n} "${plain(e.text)}"`);
    }
  }
  if (process.env.DEBUG) console.error(`seed ${seed} done, ${((Date.now() - t0run) / 1000).toFixed(0)}s`);
}
OFF.clear();
ON.clear();

const secs = ((Date.now() - t0run) / 1000).toFixed(0);
console.log(`Coherence faults · seeds ${A}–${B} · ten present years · ${secs}s`);
console.log(`${'no.'.padEnd(4)}${'count'.padEnd(7)}fault`);
for (let n = 1; n <= 12; n++) {
  console.log(`${String(n).padEnd(4)}${String(counts[n]).padEnd(7)}${NAMES[n]}`);
  for (const x of examples[n]) console.log(`           e.g. seed ${x.seed}: ${x.text}`);
}
console.log(`COHERENCE ${JSON.stringify({ seeds: [A, B], counts: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v])) })}`);
