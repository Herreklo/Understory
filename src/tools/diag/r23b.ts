// Round 23b measures, read from the record after the fact so that both arms are measured the same way.
//   tsx src/tools/diag/r23b.ts run A B [rule] → out-r23b/<rule>-A-B.json ;  tsx src/tools/diag/r23b.ts report
// 1. Reciprocity: among the hat going round, how often the giver puts in generously, by what the one in need had done for them before
//    (put in for them, given next to nothing, or nothing on record), known to the giver, within twenty years.
// 2. Answers to a cutting joke: how the butt of it answered.
// 3. A plan that failed: how its owner took it, by forgiveness (true facet), and what came of trying again.
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF, type World } from '../../world';
const OUT = process.env.R23B_OUT ?? 'out-r23b';
mkdirSync(OUT, { recursive: true });
type Row = {
  seed: number;
  hat: { cls: 'owed' | 'stung' | 'none'; generous: boolean; cited: boolean }[];
  joke: { answer: string }[];
  failed: { answer: string; hadTarget: boolean; forgiveness: number }[];
  backAgain: number;
  lost: number;
  examples: string[];
};
function measure(w: World, seed: number, t0: number): Row {
  const name = (s: string) => s.replace(/@(\d+)/g, (_, id) => w.byId.get(+id)?.first ?? '?');
  const row: Row = { seed, hat: [], joke: [], failed: [], backAgain: 0, lost: 0, examples: [] };
  for (const e of w.events) {
    if (e.t < t0) continue;
    const d = e.decision as any;
    if (d?.trigger === 'collection') {
      const q = e.who[0],
        x = e.who[1];
      const qp = w.byId.get(q)!;
      let cls: 'owed' | 'stung' | 'none' = 'none';
      for (let i = qp.events.length - 1; i >= 0; i--) {
        const f = w.events[qp.events[i]];
        if (f.id >= e.id) continue;
        if (f.t < e.t - 240) break;
        if (f.who[0] !== x || f.who[1] !== q || !f.knownBy.has(q)) continue;
        if (f.type === 'chipin' || f.type === 'quietgive') {
          cls = 'owed';
          break;
        }
        if (f.type === 'token' || f.type === 'nowallet') {
          cls = 'stung';
          break;
        }
      }
      const cited = e.causes.some(c => c.label.includes('had put in for') || c.label.includes('had given next to nothing'));
      row.hat.push({ cls, generous: e.type === 'chipin' || e.type === 'quietgive', cited });
      if (cited && row.examples.length < 6) row.examples.push(`${name(e.text)} — because ${e.causes.map(c => name(c.label)).join('; ')}`);
    }
    if (d?.trigger === 'provocation' && e.causes.some(c => c.ref != null && w.events[c.ref]?.type === 'humour')) {
      row.joke.push({ answer: d.expr ?? e.type });
      if (row.examples.length < 12)
        row.examples.push(
          `${name(e.text)} — after: ${name(w.events[e.causes.find(c => c.ref != null && w.events[c.ref!]?.type === 'humour')!.ref!].text)}`,
        );
    }
    if (d?.trigger === 'turneddown') {
      const p = w.byId.get(e.who[0])!;
      row.failed.push({
        answer: d.expr ?? e.type,
        hadTarget: (d.options ?? []).some((o: any) => o.id === 'anger'),
        forgiveness: p.facets.forgiveness,
      });
      if (row.examples.length < 18) row.examples.push(`${name(e.text)} — because ${e.causes.map(c => name(c.label)).join('; ')}`);
    }
    if (e.type === 'plan' && e.causes.some(c => c.label.includes('had meant to bring'))) row.backAgain++;
    if (e.type === 'plan:lost') row.lost++;
  }
  return row;
}
if (process.argv[2] === 'run') {
  const A = +process.argv[3],
    B = +process.argv[4],
    rule = process.argv[5] ?? 'on';
  const out: Row[] = [];
  for (let seed = A; seed <= B; seed++) {
    OFF.clear();
    if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
    const w = buildWorld(seed, 1);
    pickWitness(w);
    const t0 = w.t;
    runYears(w, 10);
    out.push(measure(w, seed, t0));
    console.error(`r23b ${rule}: world ${seed}`);
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
  const pct = (a: number, b: number) => (b ? ((100 * a) / b).toFixed(0) + '%' : '–');
  for (const rule of rules) {
    const R: Row[] = [];
    for (const f of readdirSync(OUT).filter(f => f.startsWith(rule + '-') && /^[^-]+(\+[^-]+)*-\d+-\d+\.json$/.test(f)))
      R.push(...JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')));
    R.sort((a, b) => a.seed - b.seed);
    const hat = R.flatMap(r => r.hat);
    console.log(`\n== ${rule} · ${R.length} worlds · ten present years`);
    for (const cls of ['owed', 'none', 'stung'] as const) {
      const h = hat.filter(x => x.cls === cls);
      console.log(
        `  the hat: ${cls.padEnd(5)} n ${String(h.length).padStart(5)} · put in generously ${pct(h.filter(x => x.generous).length, h.length)}`,
      );
    }
    console.log(`  the hat: decisions whose reason cites what the other had done: ${pct(hat.filter(x => x.cited).length, hat.length)}`);
    const jk = R.flatMap(r => r.joke);
    const by = (xs: { answer: string }[]) =>
      Object.entries(xs.reduce((m, x) => ((m[x.answer] = (m[x.answer] ?? 0) + 1), m), {} as Record<string, number>))
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => `${k} ${n}`)
        .join(', ');
    console.log(`  answers to a cutting joke: ${jk.length} (${(jk.length / Math.max(1, R.length)).toFixed(1)} a world): ${by(jk)}`);
    const fl = R.flatMap(r => r.failed);
    console.log(
      `  failed plans answered: ${fl.length}: ${by(fl)} · tried again and started it ${R.reduce((s, r) => s + r.backAgain, 0)} · money lost on the record ${R.reduce((s, r) => s + r.lost, 0)}`,
    );
    const tg = fl.filter(x => x.hadTarget).sort((a, b) => a.forgiveness - b.forgiveness);
    const third = Math.floor(tg.length / 3);
    if (third) {
      const lo = tg.slice(0, third),
        hi = tg.slice(-third);
      console.log(
        `  held it against someone: least forgiving third ${pct(lo.filter(x => x.answer === 'holdagainst').length, lo.length)} · most forgiving third ${pct(hi.filter(x => x.answer === 'holdagainst').length, hi.length)} (of ${tg.length} with someone to blame)`,
      );
    }
    const ex = R.flatMap(r => r.examples);
    if (ex.length)
      console.log(
        '  examples:\n' +
          ex
            .slice(0, 9)
            .map(x => '    ' + x)
            .join('\n'),
      );
  }
}
