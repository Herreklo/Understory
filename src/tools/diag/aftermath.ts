// Round 34's own count: blows, the aftermath they bring, and whether a blow changed the person's life within three years.
//   tsx src/tools/diag/aftermath.ts A B [years]   (seeds A..B; OFF= and ON= are read from the environment, as by every check)
// A blow and its person are found the same way in both arms (aftermath.ts `blowsOf`, the heaviest blow of a month for each person),
// so the share of blows followed by a change is measured alike with the aftermath on and off. A life changed when, three years after
// the month of the blow, any of these differs from just after it: their job, their partner, the routines they keep, the music they
// live for, their group, or their being in town. Blows in the last three years of the window are not followed.
// Last line: AFTERMATH {...}
import '../env';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { SETTING } from '../../setting';
import { blowsOf, SHORT, aftermathStats } from '../../aftermath';
import { age, type World, type Person } from '../../world';

const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];
const mark = (w: World, p: Person) => ({
  job: p.job ?? null,
  partner: p.partner ?? null,
  habits: p.habits
    .filter(h => !h.broken)
    .map(h => h.id)
    .sort()
    .join(','),
  music: SETTING.hobbies.filter(h => p.skills[h]?.interest === 2).join(','),
  group: p.group ?? null,
  status: p.status,
});
const KEYS = ['job', 'partner', 'habits', 'music', 'group', 'status'] as const;
const out: any = {
  seeds: [a, b],
  worlds: 0,
  blows: 0,
  followed: 0,
  changed: 0,
  byWhat: {},
  byBlow: {},
  perWorld: [],
  decided: 0,
  byKind: {},
  sample: [],
};
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  const end = t0 + yrs * 12;
  const pending: { p: Person; at: number; m: ReturnType<typeof mark>; blow: string }[] = [];
  let scan = w.events.length;
  let n = 0,
    ch = 0;
  while (w.t < end) {
    tick(w);
    const heaviest = new Map<number, { w: number; type: string }>();
    for (let i = scan; i < w.events.length; i++) {
      const e = w.events[i];
      if (!SHORT[e.type]) continue;
      for (const x of blowsOf(w, e)) {
        const cur = heaviest.get(x.victim);
        if (!cur || e.w > cur.w) heaviest.set(x.victim, { w: e.w, type: e.type });
      }
    }
    scan = w.events.length;
    if (w.t <= end - 36)
      for (const [id, x] of heaviest) {
        const p = w.byId.get(id);
        if (!p || p.status !== 'in' || age(w, p) < 16) continue;
        pending.push({ p, at: w.t, m: mark(w, p), blow: x.type });
      }
    for (const q of pending.filter(q => w.t - q.at === 36)) {
      const now = mark(w, q.p);
      const what = KEYS.filter(k => now[k] !== q.m[k]);
      n++;
      out.byBlow[q.blow] ??= [0, 0];
      out.byBlow[q.blow][0]++;
      if (what.length) {
        ch++;
        out.byBlow[q.blow][1]++;
        for (const k of what) out.byWhat[k] = (out.byWhat[k] ?? 0) + 1;
      }
    }
  }
  const st = aftermathStats(w);
  out.decided += st.decided;
  for (const [k, v] of Object.entries(st.byKind)) out.byKind[k] = (out.byKind[k] ?? 0) + (v as number);
  for (const e of w.events)
    if (e.t > t0 && ['startover', 'takeup', 'keepaway'].includes(e.type) && out.sample.length < 12)
      out.sample.push(`${e.type}: ${e.text} [${(e.causes ?? []).map((c: any) => c.label).join('; ')}]`);
  out.worlds++;
  out.blows += n;
  out.changed += ch;
  out.perWorld.push(+(ch / Math.max(1, n)).toFixed(4));
}
out.changedShare = +(out.changed / Math.max(1, out.blows)).toFixed(4);
out.decidedPerWorldDecade = +((out.decided / Math.max(1, out.worlds)) * (10 / yrs)).toFixed(1);
const ch = Object.entries(out.byKind)
  .filter(([k]) => k !== 'carryon')
  .reduce((s, [, v]) => s + (v as number), 0);
out.changeShare = +(ch / Math.max(1, out.decided)).toFixed(4);
for (const l of out.sample) console.log('  ' + l);
delete out.sample;
console.log('AFTERMATH ' + JSON.stringify(out));
