// The identity check: a change that should not alter behaviour must leave everything the same. Hashes the whole world on fixed
// seeds (every event with its words, reasons, decision and who knew it; every person; every bond and memory; every belief; every
// group; the state of every random stream), in a canonical order so that only a real difference shows.
//   tsx src/tools/diag/ident.ts save [file]   → write the hashes            tsx src/tools/diag/ident.ts check [file]   → compare with them
// Arms: the default, plus each switch in IDENT_ARMS (comma-separated; '+' joins switches into one arm). Seeds 11–13 for the default, 11 for each switch arm; eight years.
// IDENT_SKIP_DEFAULT=1 leaves the default out, so arms can be checked in parallel processes (scripts/identity-ci.sh).
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF, type World } from '../../world';

function canon(x: any, seen = new WeakSet()): any {
  if (x === null || typeof x !== 'object') return typeof x === 'function' ? undefined : typeof x === 'number' && !Number.isFinite(x) ? String(x) : x;
  if (seen.has(x)) return '[cycle]';
  seen.add(x);
  let out: any;
  if (x instanceof Map)
    out = [...x.entries()]
      .map(([k, v]) => [canon(k, seen), canon(v, seen)])
      .sort((a, b) => (String(a[0]) < String(b[0]) ? -1 : String(a[0]) > String(b[0]) ? 1 : 0));
  else if (x instanceof Set) out = [...x].map(v => canon(v, seen)).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
  else if (Array.isArray(x)) out = x.map(v => canon(v, seen));
  else {
    out = {};
    for (const k of Object.keys(x).sort()) {
      if (k === 'pupils') continue; // retired with the round-12 teacher mechanism (always empty)
      const v = canon(x[k], seen);
      if (v !== undefined) out[k] = v;
    }
  }
  seen.delete(x);
  return out;
}
const h = (x: any) =>
  createHash('sha1')
    .update(JSON.stringify(canon(x)))
    .digest('hex')
    .slice(0, 12);

export function signature(w: World) {
  const people = w.people.map(p => ({ ...p, events: undefined }));
  return {
    events: h(w.events.map(e => ({ ...e, explain: undefined }))),
    people: h(people),
    bonds: h(w.bonds),
    beliefs: h(w.beliefs),
    rest: h({
      groups: w.groups,
      places: w.places,
      stats: w.stats,
      queue: w.queue,
      nextId: w.nextId,
      witness: w.witness,
      streams: Object.fromEntries(Object.entries(w.streams).map(([k, r]) => [k, (r as any).s ?? (r as any).state ?? JSON.stringify(r)])),
      extra: Object.fromEntries(Object.entries(w).filter(([k]) => k.startsWith('_'))),
    }),
    n: w.events.length,
  };
}

const SEEDS = [11, 12, 13];
const arms = [...(process.env.IDENT_SKIP_DEFAULT ? [] : ['']), ...(process.env.IDENT_ARMS ?? '').split(',').filter(Boolean)];
const mode = process.argv[2] ?? 'check',
  file = process.argv[3] ?? 'reports/ident-baseline.json';
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
