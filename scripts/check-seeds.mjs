// Fails if two seed ranges in docs/seeds.md overlap, unless both are throwaway (smoke or diag).
//   node scripts/check-seeds.mjs [path]
import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? new URL('../docs/seeds.md', import.meta.url);
const THROWAWAY = new Set(['smoke', 'diag']);
const USES = new Set(['train', 'eval', 'test', 'quiz', 'diag', 'smoke']);

const rows = [];
const errors = [];
readFileSync(path, 'utf8')
  .split('\n')
  .forEach((line, i) => {
    const cells = line.split('|').map(c => c.trim());
    if (cells.length < 6 || !/^\d+$/.test(cells[1])) return;
    const [, from, to, lane, use, round] = cells;
    const row = { from: +from, to: +to, lane, use, round, line: i + 1 };
    if (row.to < row.from) errors.push(`line ${row.line}: range ends before it starts`);
    if (!USES.has(use)) errors.push(`line ${row.line}: unknown use "${use}"`);
    rows.push(row);
  });

for (let a = 0; a < rows.length; a++)
  for (let b = a + 1; b < rows.length; b++) {
    const x = rows[a],
      y = rows[b];
    if (x.from > y.to || y.from > x.to) continue;
    if (THROWAWAY.has(x.use) && THROWAWAY.has(y.use)) continue;
    errors.push(
      `lines ${x.line} and ${y.line} overlap: ${x.from}–${x.to} (${x.use}, ${x.round || x.lane}) and ${y.from}–${y.to} (${y.use}, ${y.round || y.lane})`,
    );
  }

if (!rows.length) errors.push('no seed rows found');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`seeds ok: ${rows.length} ranges, none reused`);
