// Consistency audit (round 21): the invariants every world must keep, counted by kind, with a few examples each.
//   tsx src/tools/audit.ts A B [present years]   → every kind of violation, at the end of the past and every month of the present
// `audit(w)` is also used by `src/invariants.ts` (npm test).
import { buildWorld } from '../build';
import { tick } from '../life';
import { pickWitness } from '../witness';
import { OFF, ON, age, type World, type Person } from '../world';
import { rivalries } from '../drama';
import { projects } from '../projects';

export type Found = Map<string, { n: number; ex: string[] }>;
export function audit(w: World, found: Found = new Map()) {
  const bad = (kind: string, ex: string) => {
    const f = found.get(kind) ?? found.set(kind, { n: 0, ex: [] }).get(kind)!;
    f.n++;
    if (f.ex.length < 3) f.ex.push(`world ${w.seed}, month ${w.t}: ${ex}`);
  };
  const P = (id: number | null | undefined) => (id == null ? undefined : w.byId.get(id));
  const nm = (p?: Person) => (p ? `${p.first} ${p.last} (${p.status}, ${Math.floor(age(w, p))})` : 'nobody');
  const alive = (p?: Person) => !!p && p.status !== 'dead';
  for (const p of w.people) {
    if (!alive(p)) continue;
    // 1. Partners
    if (p.partner != null) {
      const q = P(p.partner);
      if (!q) bad('partner: missing', nm(p));
      else if (q.status === 'dead') bad('partner: dead', `${nm(p)} → ${nm(q)}`);
      else if (q.partner !== p.id) bad('partner: not named back', `${nm(p)} → ${nm(q)}, who names ${nm(P(q.partner))}`);
      else if (q.pstat !== p.pstat) bad('partner: status differs', `${nm(p)} ${p.pstat} / ${nm(q)} ${q.pstat}`);
      if (age(w, p) < 16) bad('partner: under 16', nm(p));
      if (p.psince > w.t) bad('partner: since in the future', nm(p));
    } else if (p.pstat != null) bad('partner: status without a partner', `${nm(p)} ${p.pstat}`);
    // 2. Family
    for (const id of p.parents) {
      const q = P(id);
      if (q && !q.kids.includes(p.id)) bad('family: parent does not list child', `${nm(q)} / ${nm(p)}`);
    }
    for (const id of p.kids) {
      const c = P(id);
      if (c && !c.parents.includes(p.id)) bad('family: child does not list parent', `${nm(p)} / ${nm(c)}`);
    }
    // 3. Friends
    for (const id of p.friends) {
      const q = P(id);
      if (id === p.id) bad('friends: self', nm(p));
      else if (!q || q.status === 'dead') bad('friends: dead friend', `${nm(p)} → ${nm(q)}`);
      else if (!q.friends.has(p.id)) bad('friends: one-sided', `${nm(p)} → ${nm(q)}`);
    }
    // 4. Work
    if (p.job && p.status !== 'in') bad('work: job held while away', `${nm(p)} at ${p.job}`);
    if (p.job && age(w, p) < 14) bad('work: under 14', nm(p));
    if (p.job && !w.placeById.get(p.job)) bad('work: no such place', `${nm(p)} at ${p.job}`);
    if (p.lead && (!p.job || w.placeById.get(p.job)?.lead !== p.id)) bad('work: head of a place that does not name them', `${nm(p)} at ${p.job}`);
    // 7. Groups
    if (p.group != null) {
      const g = w.groups[p.group];
      if (!g || g.ended != null || !g.members.includes(p.id))
        bad('groups: person names a group that does not list them', `${nm(p)} → ${g?.name ?? p.group}${g?.ended != null ? ' (ended)' : ''}`);
    }
    // 8. Wants
    for (const x of p.wants)
      if (
        !x.done &&
        /^\d+$/.test(x.target) &&
        ['win', 'restore', 'help', 'repair'].some(k => x.kind.startsWith(k)) &&
        P(+x.target)?.status === 'dead'
      )
        bad(`wants: open want aimed at the dead (${x.kind})`, `${nm(p)} → ${nm(P(+x.target))}`);
  }
  for (const p of w.people) if (p.status === 'dead' && p.job) bad('work: job held by the dead', nm(p));
  // 4. One head per place, who works there
  for (const pl of w.places) {
    const heads = w.people.filter(p => p.status !== 'dead' && p.lead && p.job === pl.id);
    if (heads.length > 1) bad('work: more than one head', `${pl.name}: ${heads.map(nm).join(', ')}`);
    if (pl.lead != null) {
      const h = P(pl.lead);
      if (!h || h.status !== 'in' || h.job !== pl.id) bad('work: head is gone or works elsewhere', `${pl.name}: ${nm(h)}`);
    }
  }
  // 5. Rivalries
  for (const r of rivalries(w)) {
    if (r.over != null) continue;
    const a = P(r.a),
      b = P(r.b);
    if (!alive(a) || !alive(b)) bad('rivalries: open with a dead party', `${nm(a)} / ${nm(b)} over ${r.about}`);
    else
      for (const x of [a!, b!])
        if (x.status === 'away' && w.t - (x.awaySince ?? w.t) > 12)
          bad('rivalries: open with a party away over a year', `${nm(a)} / ${nm(b)} over ${r.about}`);
  }
  // 6. Plans
  for (const pr of projects(w))
    if (pr.status === 'gathering') {
      const o = P(pr.owner);
      if (!o || o.status !== 'in') bad('plans: gathering with the owner gone', `${pr.kind} of ${nm(o)}`);
    }
  // 7. Groups, from the group's side
  for (const g of w.groups) {
    if (g.ended != null) continue;
    for (const id of g.members) {
      const m = P(id);
      if (!m || m.status === 'dead') bad('groups: dead member', `${g.name}: ${nm(m)}`);
      else if (m.status === 'away' && w.t - (m.awaySince ?? w.t) > 12) bad('groups: member away over a year', `${g.name}: ${nm(m)}`);
      else if (m.group !== g.id) bad('groups: member names another group', `${g.name}: ${nm(m)} → ${m.group}`);
    }
  }
  return found;
}

if (process.argv[1]?.endsWith('audit.ts')) {
  const A = +process.argv[2],
    B = +process.argv[3],
    Y = +(process.argv[4] ?? 10);
  for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
  for (const x of (process.env.ON ?? '').split(',').filter(Boolean)) ON.add(x);
  const past: Found = new Map(),
    present: Found = new Map();
  let months = 0;
  for (let seed = A; seed <= B; seed++) {
    const w = buildWorld(seed, 1);
    pickWitness(w);
    audit(w, past);
    for (let m = 0; m < Y * 12; m++) {
      tick(w);
      audit(w, present);
      months++;
    }
    console.error(`audit: world ${seed}`);
  }
  const show = (name: string, f: Found) => {
    console.log(`${name}: ${f.size ? '' : 'none'}`);
    for (const [k, v] of [...f].sort((a, b) => b[1].n - a[1].n)) {
      console.log(`  ${k}: ${v.n}`);
      for (const e of v.ex) console.log(`      ${e}`);
    }
  };
  console.log(`${B - A + 1} worlds${OFF.size ? ` · OFF=${[...OFF].join(',')}` : ''}`);
  show('at the end of the past (one snapshot per world)', past);
  show(`every month of the present (${months} world-months; counts are person-months)`, present);
}
