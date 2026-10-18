// Round 25c measures: how people go after what they want (ways, obstacles, changes of course, getting there), ten present years.
//   ./run.sh src/tools/diag/r25c.ts run A B [rule] → out-r25c/<rule>-A-B.json ;  ./run.sh src/tools/diag/r25c.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF, age, live } from '../../world';
const OUT = process.env.R25C_OUT ?? 'out-r25c';
mkdirSync(OUT, { recursive: true });
type Row = {
  seed: number;
  started: number;
  byWay: Record<string, number>;
  metObstacle: number;
  changedCourse: number;
  choice: Record<string, number>;
  gotThere: number;
  gotThereBy: Record<string, number>;
  departures: number;
  adults: number;
  neverPursued: number;
  types: Record<string, number>;
};
if (process.argv[2] === 'run') {
  const A = +process.argv[3],
    B = +process.argv[4],
    rule = process.argv[5] ?? 'on';
  const out: Row[] = [];
  for (let seed = A; seed <= B; seed++) {
    if (existsSync(`${OUT}/${rule}-${seed}-${seed}.json`)) continue; // done before: a stopped run resumes where it was
    OFF.clear();
    if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
    const w = buildWorld(seed, 1);
    pickWitness(w);
    const t0 = w.t;
    const before = new Set(w.people.filter(p => p.status === 'in').map(p => p.id));
    runYears(w, 10);
    const row: Row = {
      seed,
      started: 0,
      byWay: {},
      metObstacle: 0,
      changedCourse: 0,
      choice: {},
      gotThere: 0,
      gotThereBy: {},
      departures: 0,
      adults: 0,
      neverPursued: 0,
      types: {},
    };
    for (const p of w.people)
      for (const x of p.wants) {
        const u = x.pursuit as any;
        if (!u || u.owner != null || u.start < t0) continue;
        row.started++;
        const way = u.ways?.[0] ?? 'one way';
        row.byWay[`${x.kind}:${way}`] = (row.byWay[`${x.kind}:${way}`] ?? 0) + 1;
        if ((u.obstacles ?? 0) > 0) row.metObstacle++;
        if ((u.ways?.length ?? 0) > 1) row.changedCourse++;
        if (x.done === 'achieved') {
          row.gotThere++;
          row.gotThereBy[x.kind] = (row.gotThereBy[x.kind] ?? 0) + 1;
        }
      }
    for (const e of w.events) {
      if (e.t < t0) continue;
      row.types[e.type] = (row.types[e.type] ?? 0) + 1;
      if (e.type === 'aimlower') row.changedCourse++;
      const tr = String((e.decision as any)?.trigger ?? '');
      if (tr.startsWith('whether to go on:') && e.decision)
        row.choice[(e.decision as any).chosen] = (row.choice[(e.decision as any).chosen] ?? 0) + 1;
    }
    for (const p of w.people) if (before.has(p.id) && p.status === 'away' && (p.awaySince ?? 0) >= t0) row.departures++;
    for (const p of live(w))
      if (age(w, p) >= 18) {
        row.adults++;
        if (!p.wants.some(x => x.pursuit && !x.pursuit.owner && x.pursuit.start >= t0)) row.neverPursued++;
      }
    out.push(row);
    writeFileSync(`${OUT}/${rule}-${seed}-${seed}.json`, JSON.stringify([out[out.length - 1]]));
    console.error(`r25c ${rule}: world ${seed}`);
  }
  OFF.clear();
  // Each world was written when it was done.
} else {
  const files = readdirSync(OUT).filter(f => f.endsWith('.json'));
  const rules = [...new Set(files.map(f => f.replace(/-\d+-\d+\.json$/, '')))];
  for (const rule of rules) {
    const R: Row[] = files.filter(f => f.replace(/-\d+-\d+\.json$/, '') === rule).flatMap(f => JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
    const n = R.length;
    const sum = (f: (r: Row) => number) => R.reduce((s, r) => s + f(r), 0);
    const merge = (f: (r: Row) => Record<string, number>) => {
      const m: Record<string, number> = {};
      for (const r of R) for (const [k, v] of Object.entries(f(r))) m[k] = (m[k] ?? 0) + v;
      return Object.entries(m)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k} ${(v / n).toFixed(1)}`)
        .join(' · ');
    };
    const met = sum(r => r.metObstacle),
      ch = sum(r => r.changedCourse);
    console.log(`\n== ${rule} · ${n} worlds · ten present years (per world)`);
    console.log(
      `  pursuits started ${(sum(r => r.started) / n).toFixed(1)} · met an obstacle ${(met / n).toFixed(1)} · changed course (another way or aimed lower) ${(ch / n).toFixed(1)} (${met ? ((100 * ch) / met).toFixed(0) : '–'}% of those that met one)`,
    );
    console.log(`  got there ${(sum(r => r.gotThere) / n).toFixed(1)}: ${merge(r => r.gotThereBy)}`);
    console.log(`  at an obstacle: ${merge(r => r.choice)}`);
    console.log(`  ways: ${merge(r => r.byWay)}`);
    console.log(
      `  departures ${(sum(r => r.departures) / n).toFixed(1)} · adults who never pursued anything ${(
        (100 * sum(r => r.neverPursued)) /
        Math.max(
          1,
          sum(r => r.adults),
        )
      ).toFixed(1)}%`,
    );
    const T = [
      'married',
      'born',
      'proposed',
      'notready',
      'moved',
      'backed',
      'notyet',
      'helped',
      'refusedhelp',
      'broughtalong',
      'putoff',
      'otherway',
      'aimlower',
      'gaveup',
      'pushon',
      'performed',
      'hired',
      'promoted',
    ];
    console.log(`  events: ${T.map(t => `${t} ${(sum(r => r.types[t] ?? 0) / n).toFixed(1)}`).join(' · ')}`);
  }
}
