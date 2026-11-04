// Fails if a round that ran a battery has none of its raw outputs in the release's outputs/.
// A round ran one if BOARD, at the commit to tag, names out-round-<id>, or reports/ hold its battery summary.
// If the raw outputs are truly lost, a file in outputs/out-round-<id>/ saying so lets it pass and keeps the record.
//   node scripts/check-release.mjs <tag> <sha> [outputs]
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const [tag, sha, outputs = 'outputs'] = process.argv.slice(2);
if (!tag || !sha) {
  console.error('usage: node scripts/check-release.mjs <tag> <sha> [outputs]');
  process.exit(2);
}

const id = tag.replace(/^r/, '');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 2 ** 30 });
const filesIn = dir =>
  readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const path = join(dir, e.name);
    return e.isDirectory() ? filesIn(path) : [path];
  });

const named = new RegExp(`out-round-${id}([^0-9A-Za-z]|$)`, 'm').test(git('show', `${sha}:docs/BOARD.md`));
const summary = git('ls-tree', '-r', '--name-only', sha)
  .split('\n')
  .some(f => f.startsWith(`reports/${id}-battery-summary`));

if (!named && !summary) {
  console.log(`${tag} ran no battery, by BOARD and reports/.`);
  process.exit(0);
}

const folder = new RegExp(`(^|/)out-round-${id}(?![0-9A-Za-z])[^/]*/`);
const found = existsSync(outputs) ? filesIn(outputs).filter(f => folder.test(f)).length : 0;
if (found === 0) {
  console.error(
    `${tag} ran a battery, but ${outputs}/ holds no out-round-${id}. Copy it in (it may be in a frozen checkout such as ../lab-run-${id}). If it is lost, say so in a file in ${outputs}/out-round-${id}/.`,
  );
  process.exit(1);
}
console.log(`${tag}: ${found} files in out-round-${id}. Check that against the original's count.`);
