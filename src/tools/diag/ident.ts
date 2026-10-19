// The identity check: a change that should not alter behaviour must leave everything the same. Hashes the whole world on fixed
// seeds (every event with its words, reasons, decision and who knew it; every person; every bond and memory; every belief; every
// group; the state of every random stream), in a canonical order so that only a real difference shows.
//   tsx src/tools/diag/ident.ts save [file]   → write the hashes            tsx src/tools/diag/ident.ts check [file]   → compare with them
//   tsx src/tools/diag/ident.ts record [dir]  → write the full event record of the default arm, one canonical JSON line per event, through
//   the boundary (out-reference/<seed>.jsonl): what a port of the engine must reproduce line for line (docs/scale/portability.md).
// Arms: the default, plus each switch in IDENT_ARMS (comma-separated; '+' joins switches into one arm). Seeds 11–13 for the default, 11 for each switch arm; eight years.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF } from '../../world';
import { canon, signature } from './signature';
import { createWorld, command, events } from '../../boundary';

const SEEDS = [11, 12, 13];
const arms = ['', ...(process.env.IDENT_ARMS ?? '').split(',').filter(Boolean)];
const mode = process.argv[2] ?? 'check',
  file = process.argv[3] ?? 'reports/ident-baseline.json';
if (mode === 'record') {
  const dir = process.argv[3] ?? 'out-reference';
  mkdirSync(dir, { recursive: true });
  OFF.clear();
  for (const seed of SEEDS) {
    const wh = createWorld({ seed });
    command(wh, { kind: 'advance', months: 96 });
    const lines = events(wh).map(e => JSON.stringify(canon(e)));
    writeFileSync(`${dir}/${seed}.jsonl`, lines.join('\n') + '\n');
    console.log(`seed ${seed}: ${lines.length} events → ${dir}/${seed}.jsonl`);
  }
  process.exit(0);
}
const out: Record<string, any> = {};
for (const arm of arms)
  for (const seed of arm ? SEEDS.slice(0, 1) : SEEDS) {
    OFF.clear();
    for (const x of [...arm.split('+'), ...(process.env.IDENT_BASE_OFF ?? '').split(',')].filter(Boolean)) OFF.add(x);
    const w = buildWorld(seed, 1);
    pickWitness(w);
    runYears(w, 8);
    out[`${arm || 'on'}/${seed}`] = signature(w);
  }
OFF.clear();
if (mode === 'save') {
  const prev = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  writeFileSync(file, JSON.stringify({ ...prev, ...out }, null, 1));
  console.log(`saved ${Object.keys(out).length} signatures to ${file}`);
} else {
  const base = JSON.parse(readFileSync(file, 'utf8'));
  let bad = 0;
  for (const [k, s] of Object.entries(out)) {
    const b = base[k];
    if (!b) {
      console.log(`${k}: no baseline`);
      bad++;
      continue;
    }
    const diff = Object.keys(s).filter(f => (s as any)[f] !== b[f]);
    console.log(`${k}: ${diff.length ? 'DIFFERENT in ' + diff.join(', ') + ` (events ${b.n} → ${s.n})` : 'identical'}`);
    if (diff.length) bad++;
  }
  console.log(bad ? `${bad} differ` : 'all identical');
  if (bad) process.exitCode = 1;
}
