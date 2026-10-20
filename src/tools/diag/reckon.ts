// Round 33's own count: reckonings, their answers and what followed within a year; friendships one-sided for a year with a carrier
// who minds and how many had a reckoning; endings by cause over every path.
//   tsx src/tools/diag/reckon.ts A B [years]   (seeds A..B; OFF= and ON= are read from the environment, as by every check)
// Last line: RECKON {...}
import '../env';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { carryStats, type Reckoning } from '../../carry';
import type { World } from '../../world';

const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];
const CARRY = /was always the one who|had always been the one who|had stopped going round/;
const DATED = /\(\d{4}\)|since \d{4}|in \d{4}/;

const out: any = {
  seeds: [a, b],
  worlds: 0,
  reckonings: 0,
  byKind: {} as Record<string, number>,
  byAnswer: {} as Record<string, number>,
  followed: 0, // within a year: no longer one-sided, the carrier got what they asked, or the friendship ended
  byFollowed: {} as Record<string, number>,
  eligible: 0, // friendships one-sided for a year whose carrier minds, with a full year left in the window
  eligibleReckoned: 0, // ... with a reckoning within the next year
  cooled: 0,
  cooledCarry: 0,
  cooledDated: 0,
  endingsAll: 0,
  adultYears: 0,
  sample: [] as string[],
};
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  const key = (x: number, y: number) => (x < y ? `${x}|${y}` : `${y}|${x}`);
  const startPairs = new Set<string>();
  for (const p of w.people) for (const f of p.friends) if (p.id < f) startPairs.add(key(p.id, f));
  runYears(w, yrs);
  out.worlds++;
  for (const p of w.people) if (p.status !== 'dead' && w.t - p.born >= 18 * 12) out.adultYears += yrs;
  const st = carryStats(w);
  for (const r of st.reckonings as Reckoning[]) {
    out.reckonings++;
    out.byKind[r.kind] = (out.byKind[r.kind] ?? 0) + 1;
    if (r.answer) out.byAnswer[r.answer] = (out.byAnswer[r.answer] ?? 0) + 1;
    // A reckoning in the last year of the window has not had its year to be followed; it is counted only if something followed.
    if (r.followed) {
      out.followed++;
      out.byFollowed[r.followed] = (out.byFollowed[r.followed] ?? 0) + 1;
    }
  }
  out.reckoningsWithYear = (out.reckoningsWithYear ?? 0) + (st.reckonings as Reckoning[]).filter(r => w.t - r.t >= 12).length;
  out.followedWithYear = (out.followedWithYear ?? 0) + (st.reckonings as Reckoning[]).filter(r => w.t - r.t >= 12 && r.followed).length;
  for (const e of st.eligible as { pair: string; t: number; reckoned?: number }[]) {
    if (w.t - e.t < 12) continue;
    out.eligible++;
    if (e.reckoned != null && e.reckoned - e.t <= 12) out.eligibleReckoned++;
  }
  const ever = new Set(startPairs);
  for (const e of w.events) {
    if (e.t <= t0) continue;
    if (e.type === 'friends' || e.type === 'madeup') ever.add(key(e.who[0], e.who[1]));
    if (e.type === 'cooled') {
      out.cooled++;
      const labels = (e.causes ?? []).map((c: any) => String(c.label));
      if (labels.some((l: string) => CARRY.test(l)) || CARRY.test(e.text)) {
        out.cooledCarry++;
        if (out.sample.length < 6) out.sample.push(`end: ${e.text} [${labels.join('; ')}]`);
      }
      if (labels.some((l: string) => DATED.test(l))) out.cooledDated++;
    }
    if (['sayit', 'askback', 'stopgoing'].includes(e.type) && out.sample.length < 18)
      out.sample.push(`${e.type}: ${e.text} [${(e.causes ?? []).map((c: any) => c.label).join('; ')}]`);
    if (e.decision && (e.decision as any).trigger === 'reckon-answer' && out.sample.length < 18) out.sample.push(`  answer: ${e.text}`);
  }
  const now = new Set<string>();
  for (const p of w.people) for (const f of p.friends) if (p.id < f) now.add(key(p.id, f));
  for (const k of ever) if (!now.has(k)) out.endingsAll++;
}
out.eligibleReckonedShare = +(out.eligibleReckoned / Math.max(1, out.eligible)).toFixed(4);
out.followedShare = +(out.followedWithYear / Math.max(1, out.reckoningsWithYear)).toFixed(4);
out.perWorldDecade = +((out.reckonings / Math.max(1, out.worlds)) * (10 / yrs)).toFixed(2);
out.cooledCarryShare = +(out.cooledCarry / Math.max(1, out.cooled)).toFixed(4);
out.cooledCarryShareAll = +(out.cooledCarry / Math.max(1, out.endingsAll)).toFixed(4);
out.cooledDatedShare = +(out.cooledDated / Math.max(1, out.cooled)).toFixed(4);
out.endingsPerAdultYear = +(out.endingsAll / Math.max(1, out.adultYears)).toFixed(4);
for (const l of out.sample) console.log('  ' + l);
delete out.sample;
console.log('RECKON ' + JSON.stringify(out));
