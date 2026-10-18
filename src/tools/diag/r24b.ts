// Round 24b measures: what decisions weighed (the self-story; circumstances a situation gives every option), from the diagnostic logs.
//   tsx src/tools/diag/r24b.ts run A B [rule] → out-r24b/<rule>-A-B.json ;  tsx src/tools/diag/r24b.ts report
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF } from '../../world';
import { WEIGH_LOG, WEIGH_DEC } from '../../grammar';
const OUT = process.env.R24B_OUT ?? 'out-r24b';
mkdirSync(OUT, { recursive: true });
const CIRC = new Set(['money', 'load', 'ties', 'skill', 'sting', 'trade', 'heat']);
type Row = {
  seed: number;
  idOptions: number;
  idCut: number;
  idFav: { chose: boolean }[];
  circ: { type: string; id: string; strong: boolean; toward: boolean }[];
  circDecisions: number;
  circCited: number;
  examples: string[];
};
if (process.argv[2] === 'run') {
  const A = +process.argv[3],
    B = +process.argv[4],
    rule = process.argv[5] ?? 'on';
  const out: Row[] = [];
  (globalThis as any).WEIGH = true;
  for (let seed = A; seed <= B; seed++) {
    OFF.clear();
    if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
    const w = buildWorld(seed, 1);
    pickWitness(w);
    const t0 = w.t;
    WEIGH_LOG.length = 0;
    WEIGH_DEC.length = 0;
    runYears(w, 10);
    const row: Row = { seed, idOptions: 0, idCut: 0, idFav: [], circ: [], circDecisions: 0, circCited: 0, examples: [] };
    for (const o of WEIGH_LOG)
      if (o.id) {
        row.idOptions++;
        if (o.idCut) row.idCut++;
      }
    for (const d of WEIGH_DEC) {
      const fav = d.idFams.filter((x: any) => x.x > 0.5);
      if (fav.length === 1 && d.families.length > 1) row.idFav.push({ chose: d.chosen === fav[0].fam });
      for (const c of d.circ)
        if (c.x > 0.6 || c.x < 0.4) row.circ.push({ type: d.type, id: c.id, strong: c.x > 0.6, toward: c.toward.includes(d.chosen) });
    }
    const name = (s: string) => s.replace(/@(\d+)/g, (_, id) => w.byId.get(+id)?.first ?? '?');
    for (const e of w.events) {
      if (e.t < t0) continue;
      const tr = String((e.decision as any)?.trigger ?? '');
      if (!['temptation', 'risk', 'offer', 'chance', 'deadline', 'harbourday', 'collection', 'contest', 'threat', 'rivalry', 'grudge'].includes(tr))
        continue;
      row.circDecisions++;
      const c = e.causes.find(c => CIRC.has(String(c.key ?? '').replace(/^against:/, '')));
      if (c) {
        row.circCited++;
        if (row.examples.length < 6) row.examples.push(`${name(e.text)} — ${e.causes.map(x => name(x.label)).join('; ')}`);
      }
    }
    out.push(row);
    console.error(`r24b ${rule}: world ${seed}`);
  }
  OFF.clear();
  writeFileSync(`${OUT}/${rule}-${A}-${B}.json`, JSON.stringify(out));
} else {
  const rules = [
    ...new Set(
      readdirSync(OUT)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace(/-\d+-\d+\.json$/, '')),
    ),
  ];
  const pct = (a: number, b: number) => (b ? ((100 * a) / b).toFixed(1) + '%' : '–');
  const ci = (a: number, b: number) => {
    const p = a / Math.max(1, b),
      z = 1.96,
      d = 1 + (z * z) / b,
      c = (p + (z * z) / (2 * b)) / d,
      h = (z * Math.sqrt((p * (1 - p)) / b + (z * z) / (4 * b * b))) / d;
    return `${(100 * p).toFixed(1)}% [${(100 * (c - h)).toFixed(1)}, ${(100 * (c + h)).toFixed(1)}]`;
  };
  for (const rule of rules) {
    const R: Row[] = [];
    for (const f of readdirSync(OUT).filter(f => f.startsWith(rule + '-') && /-\d+-\d+\.json$/.test(f) && f.replace(/-\d+-\d+\.json$/, '') === rule))
      R.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
    console.log(`\n== ${rule} · ${R.length} worlds · ten present years`);
    const io = R.reduce((s, r) => s + r.idOptions, 0),
      ic = R.reduce((s, r) => s + r.idCut, 0);
    console.log(`  self-story: options it applies to ${io}, cut from ${pct(ic, io)}`);
    const fav = R.flatMap(r => r.idFav);
    console.log(
      `  where the self-story favours one answer, that answer is chosen: ${ci(fav.filter(x => x.chose).length, fav.length)} of ${fav.length}`,
    );
    const C = R.flatMap(r => r.circ);
    const gap = (xs: typeof C, label: string) => {
      const s = xs.filter(x => x.strong),
        k = xs.filter(x => !x.strong);
      console.log(
        `  ${label.padEnd(26)} toward the answer it favours: strong ${ci(s.filter(x => x.toward).length, s.length)} (n ${s.length}) · weak ${ci(k.filter(x => x.toward).length, k.length)} (n ${k.length})`,
      );
    };
    gap(C, 'circumstances, pooled');
    gap(
      C.filter(x => x.type === 'collection'),
      'the hat (short of money)',
    );
    gap(
      C.filter(x => x.type === 'deadline'),
      'deadline (stretched)',
    );
    for (const t of ['temptation', 'risk', 'offer', 'chance', 'harbourday', 'contest', 'threat', 'rivalry', 'grudge'])
      if (C.some(x => x.type === t))
        gap(
          C.filter(x => x.type === t),
          t,
        );
    const cd = R.reduce((s, r) => s + r.circDecisions, 0),
      cc = R.reduce((s, r) => s + r.circCited, 0);
    console.log(`  circumstance given among the reasons: ${ci(cc, cd)} of ${cd} decisions`);
    const ex = R.flatMap(r => r.examples);
    if (ex.length)
      console.log(
        '  examples:\n' +
          ex
            .slice(0, 6)
            .map(x => '    ' + x)
            .join('\n'),
      );
  }
}
