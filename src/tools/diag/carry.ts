// Round 32's own count: one-sided friendships, how friendships end, and how often who carries a friendship is a decision's reason.
//   tsx src/tools/diag/carry.ts A B [years]   (seeds A..B; OFF= and ON= are read from the environment, as by every check)
// Last line: CARRY {...}
import '../env';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { carrying } from '../../carry';
import type { World } from '../../world';

const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];
// Where the record bears: being asked, a promise coming due, a friend in trouble.
const BEARS = new Set(['request-answer', 'obligation', 'support', 'notice']);
const topOf = (e: any) => (e.causes ?? []).find((c: any) => c.key && !String(c.key).startsWith('against:'));
const CARRY = /was always the one who|had always been the one who/;
const DATED = /\(\d{4}\)|since \d{4}|in \d{4}/;

const out: any = {
  seeds: [a, b],
  lasting: 0, // friendships that lasted three years or more inside the window
  lastingOneSided: 0, // of those, one-sided for a year at some point (the line, or already so at the start)
  lines: 0,
  endings: 0,
  endingsCarry: 0,
  endingsDated: 0,
  bearing: 0, // decisions where it may bear, between friends
  bearingAll: 0,
  cited: 0, // ... given it as a reason
  top: 0, // ... as the top reason that passed the counterfactual check
  adultYears: 0,
  sample: [] as string[],
};
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  const key = (x: number, y: number) => (x < y ? `${x}|${y}` : `${y}|${x}`);
  // Friendships at the start, and whether each was already carried for a year.
  const start = new Map<string, { from: number; one: boolean }>();
  for (const p of w.people) for (const f of p.friends) if (p.id < f) start.set(key(p.id, f), { from: t0, one: !!carrying(w, p.id, f) });
  runYears(w, yrs);
  for (const p of w.people) if (p.status !== 'dead' && w.t - p.born >= 18 * 12) out.adultYears += yrs;
  // Friendships through the window, from the record.
  const open = new Map(start);
  const spans: { from: number; to: number; one: boolean }[] = [];
  const friendsAt = new Set<string>(start.keys());
  for (const e of w.events) {
    if (e.t <= t0) continue;
    const k = e.who.length >= 2 ? key(e.who[0], e.who[1]) : '';
    if (e.type === 'friends' || e.type === 'madeup') {
      open.set(k, { from: e.t, one: false });
      friendsAt.add(k);
    } else if (e.type === 'cooled') {
      const s = open.get(k);
      if (s) spans.push({ from: s.from, to: e.t, one: s.one });
      open.delete(k);
      friendsAt.delete(k);
      out.endings++;
      const labels = (e.causes ?? []).map((c: any) => String(c.label));
      if (labels.some((l: string) => CARRY.test(l))) {
        out.endingsCarry++;
        if (out.sample.length < 8) out.sample.push(`end: ${e.text} [${labels.join('; ')}]`);
      }
      if (labels.some((l: string) => DATED.test(l))) out.endingsDated++;
    } else if (e.type === 'carried') {
      out.lines++;
      const s = open.get(k);
      if (s) s.one = true;
      if (out.sample.length < 4) out.sample.push(`line: ${e.text}`);
    }
    const rec: any = e.decision;
    if (rec && BEARS.has(rec.trigger) && rec.target != null) {
      out.bearingAll++;
      if (!friendsAt.has(key(e.who[0], rec.target))) continue;
      out.bearing++;
      if ((e.causes ?? []).some((c: any) => String(c.key ?? '').startsWith('carry:'))) {
        out.cited++;
        if (out.sample.length < 16) out.sample.push(`${rec.trigger} ${e.type}: ${e.text} [${(e.causes ?? []).map((c: any) => c.label).join('; ')}]`);
      }
      const top = topOf(e);
      if (top && String(top.key).startsWith('carry:') && rec.honest === true) out.top++;
    }
  }
  for (const s of open.values()) spans.push({ from: s.from, to: w.t, one: s.one });
  for (const s of spans)
    if (s.to - s.from >= 36) {
      out.lasting++;
      if (s.one) out.lastingOneSided++;
    }
}
out.oneSidedShare = +(out.lastingOneSided / Math.max(1, out.lasting)).toFixed(4);
out.endingsCarryShare = +(out.endingsCarry / Math.max(1, out.endings)).toFixed(4);
out.endingsDatedShare = +(out.endingsDated / Math.max(1, out.endings)).toFixed(4);
out.endingsPerAdultYear = +(out.endings / Math.max(1, out.adultYears)).toFixed(4);
out.citedShare = +(out.cited / Math.max(1, out.bearing)).toFixed(4);
out.topShare = +(out.top / Math.max(1, out.bearing)).toFixed(4);
for (const l of out.sample) console.log('  ' + l);
delete out.sample;
console.log('CARRY ' + JSON.stringify(out));
