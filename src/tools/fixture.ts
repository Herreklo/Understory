// Exports one real run as a fixture for Overstory (its engine request 10): a small world from an actual engine run, read only through
// the front door (boundary.ts), with its people, households, places, ventures, groups and events, as one JSON file in the shape of
// Overstory's engine contract (docs/engine-contract.md there): string ids typed by prefix, calendar years and months, provenance on
// every record. Nothing here changes what the engine does.
//
//   npx tsx src/tools/fixture.ts [--seed 9989] [--years 10] [--since present|all|<year>] [--out out-fixture/world-9989.json]
//
// Years are the engine's own (its past starts in 1996, the present thirty years later); a setting's start year is engine issue #23.
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { command, createWorld, events, groups, now, person, places, townIds, ventures } from '../boundary';
import { YEAR0 } from '../world';

const arg = (k: string, d: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const seed = Number(arg('seed', '9989'));
const years = Number(arg('years', '10'));
const out = arg('out', `out-fixture/world-${seed}.json`);
const sinceArg = arg('since', 'present');

const h = createWorld({ seed });
command(h, { kind: 'advance', months: years * 12 });
const at = now(h);
const since = sinceArg === 'present' ? at.startPresent : sinceArg === 'all' ? -1e9 : (Number(sinceArg) - YEAR0) * 12;

const when = (t: number) => ({ year: YEAR0 + Math.floor(t / 12), month: 1 + (((t % 12) + 12) % 12) });
const pid = (n: number | null | undefined) => (n == null ? null : `p-${n}`);
const S = 'simulated';

// Everyone the record names, and everyone in town now.
const all = events(h);
const ids = new Set<number>(townIds(h));
for (const e of all) for (const w of e.who) ids.add(w);
const people = [...ids]
  .sort((a, b) => a - b)
  .flatMap(id => {
    const p = person(h, id);
    return p ? [p] : [];
  });
const name = new Map(people.map(p => [p.id, `${p.first} ${p.last}`]));
const words = (s: string) => s.replace(/@(\d+)/g, (_, n) => name.get(Number(n)) ?? `someone (p-${n})`);
const ageAt = (born: number) => Math.floor((at.t - born) / 12);

const peopleOut = people.map(p => ({
  id: pid(p.id),
  name: `${p.first} ${p.last}`,
  sex: p.sex,
  born: when(p.born),
  status: p.status,
  ...(p.diedAt != null ? { died: when(p.diedAt) } : {}),
  ...(p.awaySince != null ? { away: { since: when(p.awaySince), kind: p.awayKind } } : {}),
  job: p.job ? { place: `pl-${p.job}`, since: when(p.jobSince), lead: p.lead } : null,
  retired: p.retired,
  student: p.student,
  partner: p.partner != null ? { id: pid(p.partner), kind: p.pstat, since: when(p.psince) } : null,
  parents: p.parents.map(pid),
  kids: p.kids.map(pid),
  group: p.group != null ? `g-${p.group}` : null,
  // What the person is attached to (the town, a home, a house of their own once bought, a boat): an attachment, not a deed.
  attachments: p.attachments.map(a => ({ key: a.key, label: a.label, since: when(a.since) })),
  habits: p.habits.map(x => ({
    label: x.label,
    kind: x.kind,
    ...(x.place ? { place: `pl-${x.place}` } : {}),
    since: when(x.since),
    ...(x.broken != null ? { broken: when(x.broken) } : {}),
  })),
  provenance: S,
}));

// Households: the engine has no homes yet (issue #59). This groups the people in town by a stated rule, from facts it has, and is
// labelled derived: a married couple shares a household; any other adult (18 or over) has their own; a child under 18 lives with the
// household of the parent in town, and a child whose parents are both in town in two households is listed with both.
const inTown = new Set(townIds(h));
const byId = new Map(people.map(p => [p.id, p]));
const hh = new Map<number, number>(); // adult id -> household index
const households: { id: string; members: string[]; children: string[]; childrenShared: string[]; provenance: string; rule: string }[] = [];
const RULE =
  'a married couple shares a household; any other adult (18 or over) has their own; a child under 18 lives with the household of the parent in town, and is listed with both when the parents are in town in two households';
for (const p of people) {
  if (!inTown.has(p.id) || ageAt(p.born) < 18 || hh.has(p.id)) continue;
  const i = households.length;
  households.push({ id: `h-${i + 1}`, members: [pid(p.id)!], children: [], childrenShared: [], provenance: 'derived', rule: RULE });
  hh.set(p.id, i);
  const q = p.partner != null ? byId.get(p.partner) : undefined;
  if (q && p.pstat === 'married' && inTown.has(q.id) && ageAt(q.born) >= 18 && !hh.has(q.id)) {
    households[i].members.push(pid(q.id)!);
    hh.set(q.id, i);
  }
}
for (const p of people) {
  if (!inTown.has(p.id) || ageAt(p.born) >= 18) continue;
  const homes = [...new Set(p.parents.filter(q => hh.has(q)).map(q => hh.get(q)!))];
  if (homes.length === 1) households[homes[0]].children.push(pid(p.id)!);
  for (const i of homes.length > 1 ? homes : []) households[i].childrenShared.push(pid(p.id)!);
}

const placesOut = places(h).map(pl => {
  const v = ventures(h).find(x => x.place === pl.id);
  return {
    id: `pl-${pl.id}`,
    name: pl.name,
    worker: pl.role,
    staff: people.filter(p => inTown.has(p.id) && p.job === pl.id).map(p => pid(p.id)),
    lead: pid(pl.lead),
    ...(v ? { openedBy: `v-${v.id}`, opened: when(v.ended ?? v.since) } : {}),
    to: null,
    provenance: S,
  };
});

const venturesOut = ventures(h).map(v => ({
  id: `v-${v.id}`,
  kind: v.kind,
  owner: pid(v.owner),
  since: when(v.since),
  status: v.status,
  ...(v.ended != null ? { ended: when(v.ended) } : {}),
  ...(v.place ? { place: `pl-${v.place}` } : {}),
  helpers: v.helpers.map(pid),
  opponents: v.opponents.map(pid),
  ...(v.council ? { council: v.council } : {}),
  events: v.events.map(n => `e-${n}`),
  provenance: S,
}));

const groupsOut = groups(h).map(g => ({
  id: `g-${g.id}`,
  kind: g.kind,
  name: g.name,
  founder: pid(g.founder),
  members: g.members.map(pid),
  former: g.former.map(pid),
  since: when(g.since),
  to: g.ended != null ? when(g.ended) : null,
  ...(g.how ? { how: g.how } : {}),
  events: g.events.map(n => `e-${n}`),
  provenance: S,
}));

const eventsOut = all
  .filter(e => e.t >= since)
  .map(e => ({
    id: `e-${e.id}`,
    at: when(e.t),
    type: e.type,
    who: e.who.map(pid),
    text: words(e.text),
    causes: e.causes
      .filter(c => !c.mid)
      .map(c => ({ kind: c.kind, label: words(c.label), weight: Math.round(c.weight * 1000), ...(c.ref != null ? { event: `e-${c.ref}` } : {}) })),
    vis: e.vis,
    notability: Math.round(e.w * 1000),
    ...(e.decision ? { decision: (e.decision as any).chosen ?? null } : {}),
    provenance: S,
  }));

let sha = 'unknown';
try {
  sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
} catch {}

const fixture = {
  schemaVersion: 1,
  rulesetVersion: `understory@${sha}`,
  worldSeed: seed,
  runSeed: 1,
  at: when(at.t),
  presentFrom: when(at.startPresent),
  eventsFrom: since < 0 ? 'all' : when(since),
  notes: [
    "Exported by Understory's src/tools/fixture.ts through the read-only front door (src/boundary.ts). Its reads show the truth, for tools, never what a player could know.",
    `The engine's years: its past starts in ${YEAR0}, the present thirty years later. A setting's start year is engine issue #23.`,
    'Places never close in the engine yet, so every place has to: null. The engine has no buildings, only places of work.',
    'Households are derived by the stated rule (homes are engine issue #59). Everything else is simulated.',
    'Weights and notability are per mille. Traits, values and wants are inner and are left out.',
  ],
  people: peopleOut,
  households,
  places: placesOut,
  ventures: venturesOut,
  groups: groupsOut,
  events: eventsOut,
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(fixture, null, 1));
console.log(
  `${out}: ${peopleOut.length} people (${inTown.size} in town), ${households.length} households, ${placesOut.length} places, ${venturesOut.length} ventures, ${groupsOut.length} groups, ${eventsOut.length} events; at ${fixture.at.year}-${fixture.at.month}`,
);
