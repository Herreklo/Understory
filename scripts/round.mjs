// One command for a round's whole test battery (round T1). From the round's switches and seed ranges it runs, from a frozen copy of
// the committed tree, the scoreboard with and without the switches (and without each one, when there are several), the lives measures
// on and off, the identity check with the switches off against the base branch, the round's own fault tool, `npm test`, and a blind
// cold-read pack written before anything else; then it writes one summary. Jobs run in parallel; any job that fails, or leaves an
// expected output missing, is named and makes the command exit nonzero. A separate agent still re-derives the headline numbers.
//   node scripts/round.mjs --id F26 --switches countfair,eventfix --train 1501-1520 --eval 1721-1740 --test 3001-3020
//        [--faults src/tools/diag/f26.ts --faults-range 3021-3024] [--cold 3025-3026] [--commit HEAD] [--base origin/main]
//        [--out out-round-F26] [--jobs 4] [--years 10] [--chunk 5] [--skip ident,npmtest,lives,loo,cold,board]
import { execFileSync, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const need = k => args[k] ?? die(`--${k} is required`);
function die(msg) {
  console.error('round: ' + msg);
  process.exit(2);
}
const range = s => {
  const [a, b] = String(s).split('-').map(Number);
  if (!(a > 0) || !(b >= a)) die(`bad range ${s}`);
  return [a, b];
};
const ID = need('id');
const SW = need('switches').split(',').filter(Boolean);
const TRAIN = range(need('train')),
  EVAL = range(need('eval')),
  TEST = range(need('test'));
const COLD = args.cold ? range(args.cold) : null;
const FAULTS = args.faults ?? null,
  FAULTS_RANGE = args['faults-range'] ? range(args['faults-range']) : null;
const OUT = resolve(ROOT, args.out ?? `out-round-${ID}`);
const JOBS = +(args.jobs ?? Math.max(1, cpus().length));
const YEARS = +(args.years ?? 10);
const CHUNK = +(args.chunk ?? 5);
const SKIP = new Set((args.skip ?? '').split(',').filter(Boolean));
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' }).trim();
const COMMIT = git('rev-parse', args.commit ?? 'HEAD');
const BASE = git('rev-parse', args.base ?? 'origin/main');

// A frozen tree: a detached worktree at the commit, so editing the working tree during a run changes nothing in it.
function tree(dir, commit) {
  git('worktree', 'prune'); // a registered worktree whose folder is gone would block the add
  if (existsSync(dir)) {
    try {
      git('worktree', 'remove', '--force', dir);
    } catch {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  git('worktree', 'add', '--detach', dir, commit);
  symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'));
  return dir;
}
mkdirSync(OUT, { recursive: true });
if (git('status', '--porcelain', '--untracked-files=no'))
  console.error('round: the working tree has uncommitted changes; they are not in the run, which uses ' + COMMIT.slice(0, 7));
const T = tree(join(OUT, 'tree'), COMMIT);
const B = SKIP.has('ident') ? null : tree(join(OUT, 'base'), BASE);
const TMP = join(OUT, 'tmp'),
  LOGS = join(OUT, 'logs');
mkdirSync(TMP, { recursive: true });
mkdirSync(LOGS, { recursive: true });

// Arms: on (the round as committed), off (all its switches off) and, with several switches, no-<switch> (only that one off).
const ARMS = [['on', []], ['off', SW], ...(SW.length > 1 && !SKIP.has('loo') ? SW.map(s => [`no-${s}`, [s]]) : [])];
const RULE_OFF = SW.join('+');
const chunks = ([a, b]) => {
  const out = [];
  for (let x = a; x <= b; x += CHUNK) out.push([x, Math.min(b, x + CHUNK - 1)]);
  return out;
};

// The job list. Each job is a command in a tree, the files it must leave behind, and the jobs it waits for.
const jobs = [];
const job = (name, cwd, cmd, { env = {}, outputs = [], after = [], result = false } = {}) =>
  jobs.push({ name, cwd, cmd, env, outputs, after, result, state: 'waiting' });
const run = (script, ...a) => ['./run.sh', script, ...a.map(String)];
if (COLD && !SKIP.has('cold'))
  for (const [arm, off] of ARMS.slice(0, 2))
    for (let s = COLD[0]; s <= COLD[1]; s++)
      job(`cold ${arm} ${s}`, T, run('src/tools/read.ts', s), { env: { OFF: off.join(',') }, outputs: [], result: false });
for (const [arm, off] of SKIP.has('board') ? [] : ARMS) {
  const dir = join(OUT, `board-${arm}`);
  mkdirSync(dir, { recursive: true });
  const trains = chunks(TRAIN).map(([a, b]) => {
    const n = `train ${arm} ${a}`;
    job(n, T, run('src/tools/board.ts', 'train', a, b, YEARS), {
      env: { OFF: off.join(','), BOARD_OUT: dir },
      outputs: [join(dir, `base-${a}-${b}.json`)],
    });
    return n;
  });
  for (const [a, b] of chunks(EVAL))
    job(`eval ${arm} ${a}`, T, run('src/tools/board.ts', 'eval', a, b, YEARS), {
      env: { OFF: off.join(','), BOARD_OUT: dir },
      // One file for the chunk, or one per world (board.ts on round 25d and after writes world by world).
      outputs: [
        { any: [join(dir, `eval-${a}-${b}.json`), ...Array.from({ length: b - a + 1 }, (_, i) => join(dir, `eval-${a + i}-${a + i}.json`))] },
      ],
      after: trains,
    });
}
if (!SKIP.has('lives'))
  for (const [rule, prefix] of [
    ['on', { story: 'on-', friends: 'on-', cons: '' }],
    [RULE_OFF, { story: RULE_OFF + '-', friends: RULE_OFF + '-', cons: RULE_OFF + '-' }],
  ])
    for (const [a, b] of chunks(TEST))
      for (const [tool, dir] of [
        ['story', 'out-story'],
        ['friends', 'out-friends'],
        ['cons', 'out-cons'],
      ])
        job(`${tool} ${rule === 'on' ? 'on' : 'off'} ${a}`, T, run(`src/tools/${tool === 'cons' ? 'consequences' : tool}.ts`, 'run', a, b, rule), {
          // One file for the chunk, or one per world (the lives tools from round 25d write world by world).
          outputs: [
            {
              any: [
                join(T, dir, `${prefix[tool]}${a}-${b}.json`),
                ...Array.from({ length: b - a + 1 }, (_, i) => join(T, dir, `${prefix[tool]}${a + i}-${a + i}.json`)),
              ],
            },
          ],
        });
if (FAULTS && FAULTS_RANGE)
  for (const [arm, off] of ARMS.slice(0, 2))
    job(`faults ${arm}`, T, run(FAULTS, FAULTS_RANGE[0], FAULTS_RANGE[1], YEARS), { env: { OFF: off.join(',') } });
if (B) {
  const arms = [
    ...new Set(
      readdirSync(join(B, 'src'))
        .filter(f => f.endsWith('.ts'))
        .flatMap(f => [...readFileSync(join(B, 'src', f), 'utf8').matchAll(/OFF\.has\('([a-z:]+)'\)/g)].map(m => m[1])),
    ),
  ].sort();
  const file = join(OUT, 'ident-base.json');
  job('ident base', B, run('src/tools/diag/ident.ts', 'save', file), { env: { IDENT_ARMS: arms.join(',') }, outputs: [file] });
  job('ident check', T, run('src/tools/diag/ident.ts', 'check', file), {
    env: { IDENT_ARMS: arms.join(','), IDENT_BASE_OFF: SW.join(',') },
    after: ['ident base'],
    result: true,
  });
}
if (!SKIP.has('npmtest')) job('npm test', T, ['npm', 'test']);

// The queue: jobs start in the order above as soon as what they wait for has finished, up to JOBS at a time. A job's log keeps its
// output; a 'result' job (the identity check) may exit 1 to say "different", which is its answer, not a failure.
const t0 = Date.now();
const logOf = j => join(LOGS, j.name.replace(/[^a-z0-9]+/gi, '-') + '.log');
await new Promise(done => {
  let running = 0;
  const pump = () => {
    for (const j of jobs) {
      if (running >= JOBS) break;
      if (j.state !== 'waiting') continue;
      const deps = j.after.map(n => jobs.find(x => x.name === n));
      if (deps.some(d => d.state === 'failed' || d.state === 'skipped')) {
        j.state = 'skipped';
        continue;
      }
      if (!deps.every(d => d.state === 'done')) continue;
      j.state = 'running';
      running++;
      const out = [];
      const p = spawn(j.cmd[0], j.cmd.slice(1), { cwd: j.cwd, env: { ...process.env, TMPDIR: TMP, ...j.env } });
      p.stdout.on('data', d => out.push(d));
      p.stderr.on('data', d => out.push(d));
      p.on('close', code => {
        running--;
        j.log = Buffer.concat(out).toString();
        writeFileSync(logOf(j), j.log);
        const present = f => (typeof f === 'string' ? existsSync(f) : f.any.every(x => existsSync(x)) || existsSync(f.any[0]));
        const missing = j.outputs.filter(f => !present(f));
        j.code = code;
        j.state = (code === 0 || (j.result && code === 1)) && !missing.length ? 'done' : 'failed';
        if (missing.length) j.missing = missing;
        console.error(`round: ${j.state === 'done' ? 'done  ' : 'FAILED'} ${j.name} (${Math.round((Date.now() - t0) / 1000)}s)`);
        pump();
      });
    }
    if (!running && !jobs.some(j => j.state === 'waiting' && j.after.every(n => jobs.find(x => x.name === n).state === 'done'))) {
      for (const j of jobs) if (j.state === 'waiting') j.state = 'skipped';
      done();
    }
  };
  pump();
});
const failed = jobs.filter(j => j.state !== 'done');
const ok = name => jobs.filter(j => j.name.startsWith(name)).every(j => j.state === 'done');

// The cold-read pack: the three most eventful lives of each cold-read world in each arm, shuffled by a seed taken from the round's
// name, each labelled by a code only. The key is written to its own file and is not to be shown to the reader.
let coldNote = 'not run';
if (COLD && !SKIP.has('cold') && ok('cold')) {
  const lives = [];
  for (const j of jobs.filter(j => j.name.startsWith('cold ')))
    for (const b of j.log
      .split(/\n(?=== )/)
      .filter(b => b.startsWith('== '))
      .slice(0, 3))
      lives.push({ arm: j.name.split(' ')[1], seed: +j.name.split(' ')[2], text: b.trim() });
  let h = 2166136261;
  for (const c of ID) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => (h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296;
  for (let i = lives.length - 1; i > 0; i--) {
    const k = Math.floor(rnd() * (i + 1));
    [lives[i], lives[k]] = [lives[k], lives[i]];
  }
  mkdirSync(join(OUT, 'cold'), { recursive: true });
  const code = i => `L${String(i + 1).padStart(2, '0')}`;
  writeFileSync(join(OUT, 'cold', 'lives.txt'), lives.map((l, i) => `##### ${code(i)}\n${l.text}\n`).join('\n'));
  writeFileSync(join(OUT, 'cold-key.json'), JSON.stringify(Object.fromEntries(lives.map((l, i) => [code(i), [l.arm, l.seed]])), null, 1));
  coldNote = `${lives.length} lives in \`${join(OUT, 'cold', 'lives.txt')}\` (key in \`cold-key.json\`, outside the folder a reader is given)`;
}

// Statistics: per world, paired by seed; intervals from Student's t with n − 1 degrees of freedom.
const T95 = [
  12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08,
  2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
];
const T90 = [
  6.314, 2.92, 2.353, 2.132, 2.015, 1.943, 1.895, 1.86, 1.833, 1.812, 1.796, 1.782, 1.771, 1.761, 1.753, 1.746, 1.74, 1.734, 1.729, 1.725, 1.721,
  1.717, 1.714, 1.711, 1.708, 1.706, 1.703, 1.701, 1.699, 1.697,
];
const tq = (tab, df, far) => tab[df - 1] ?? far;
function stats(xs) {
  const n = xs.length,
    m = xs.reduce((s, x) => s + x, 0) / n,
    se = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, n - 1)) / Math.sqrt(n);
  return { n, m, h95: tq(T95, n - 1, 1.96) * se, h90: tq(T90, n - 1, 1.645) * se };
}
const pts = x => (100 * x).toFixed(1);
const fmt = s => `${pts(s.m)} ±${pts(s.h95)}`;
const verdict = s =>
  s.n < 3
    ? 'too few worlds for a verdict'
    : 100 * (s.m + s.h95) < 0
      ? 'REGRESSION'
      : 100 * (s.m - s.h90) >= -2 && 100 * (s.m + s.h90) <= 2
        ? 'equivalent within ±2'
        : 'not shown either way';
const load = arm => {
  const dir = join(OUT, `board-${arm}`),
    m = new Map();
  if (!existsSync(dir)) return m;
  for (const f of readdirSync(dir).filter(f => f.startsWith('eval-')))
    for (const w of JSON.parse(readFileSync(join(dir, f), 'utf8'))) m.set(w.seed, w.g);
  return m;
};
const COUPLE = new Set(['row', 'row-answer', 'stay']);
const SLICES = [
  ['all decisions', () => true],
  ["not a couple's (row, row-answer, stay left out)", x => !COUPLE.has(x.trigger)],
  ['novel · contested · known (key)', x => x.novel && x.contested && x.known],
];
const acc = (g, k) => g.filter(x => x[k] === x.chosen).length / Math.max(1, g.length);
const boards = Object.fromEntries(ARMS.map(([a]) => [a, !SKIP.has('board') && ok(`train ${a}`) && ok(`eval ${a}`) ? load(a) : null]));
const seeds = [...(boards.on?.keys() ?? [])].sort((a, b) => a - b);
const lines = [];
const say = s => lines.push(s);
say(`# Round ${ID}: test battery`);
say('');
say(
  `Tree ${COMMIT.slice(0, 7)}; base ${BASE.slice(0, 7)}. Switches: ${SW.map(s => '`' + s + '`').join(', ')}. Scoreboard: base rates ${TRAIN.join('–')}, evaluation ${EVAL.join('–')}, ${YEARS} years. Lives ${TEST.join('–')}. ${Math.round((Date.now() - t0) / 60000)} minutes on ${JOBS} parallel jobs.`,
);
say('');
say(
  failed.length
    ? `**${failed.length} job(s) did not finish:** ${failed.map(j => `${j.name} (${j.state}${j.missing ? ', missing ' + j.missing.length + ' output(s)' : j.code != null ? ', exit ' + j.code : ''})`).join('; ')}. Numbers resting on them are marked missing.`
    : 'Every job finished and left its outputs.',
);
say('');
say('## Gate: the calibrated witness, on minus off, paired by world');
say('');
say('| Slice | on − off (95%) | 90% interval | Verdict | Decisions on / off |');
say('| --- | --- | --- | --- | --- |');
const pair = (A, Bm, f, key = 'cal') => {
  const ss = [...A.keys()].filter(s => Bm.has(s)).sort((a, b) => a - b);
  return stats(ss.map(s => acc(A.get(s).filter(f), key) - acc(Bm.get(s).filter(f), key)));
};
const size = (M, f) => [...M.values()].reduce((s, g) => s + g.filter(f).length, 0);
for (const [name, f] of SLICES) {
  if (!boards.on || !boards.off) {
    say(`| ${name} | missing | | | |`);
    continue;
  }
  const s = pair(boards.on, boards.off, f);
  const [a, b] = [size(boards.on, f), size(boards.off, f)];
  say(
    `| ${name} | ${fmt(s)} | ${pts(s.m - s.h90)} to ${pts(s.m + s.h90)} | ${verdict(s)} | ${a} / ${b}${Math.abs(a - b) > 0.1 * Math.max(a, b) ? ' **(not like for like: sizes differ by more than a tenth)**' : ''} |`,
  );
}
if (boards.on && boards.off) {
  const s = pair(boards.on, boards.off, SLICES[1][1], 'text');
  say('');
  say(`The page-annotation reader, on minus off, on decisions that are not a couple's: ${fmt(s)} (${verdict(s)}).`);
}
say('');
say('## Within each arm (mean over worlds, 95%)');
say('');
say('| Arm | Slice | Calibrated | − notebook | − tendency learner | Lift as a share of base rate → mind-reader |');
say('| --- | --- | --- | --- | --- | --- |');
for (const [arm] of ARMS.slice(0, 2)) {
  const M = boards[arm];
  if (!M) {
    say(`| ${arm} | | missing | | | |`);
    continue;
  }
  for (const [name, f] of [SLICES[0], SLICES[2]]) {
    const gs = seeds.map(s => M.get(s)?.filter(f) ?? []).filter(g => g.length);
    const st = k => stats(gs.map(g => acc(g, k)));
    const d = k => stats(gs.map(g => acc(g, 'cal') - acc(g, k)));
    const [c, b, mi] = [st('cal').m, st('base').m, st('mind').m];
    say(
      `| ${arm} | ${name} | ${fmt(st('cal'))} | ${fmt(d('noteOrBase'))} | ${fmt(d('tend'))} | ${mi > b ? Math.round((100 * (c - b)) / (mi - b)) + '%' : '–'} |`,
    );
  }
}
if (ARMS.length > 2) {
  say('');
  say('## Leave one out: on minus (all on except this one), the calibrated witness');
  say('');
  say("| Switch off alone | All decisions | Not a couple's | Page-annotation, not a couple's |");
  say('| --- | --- | --- | --- |');
  for (const [arm] of ARMS.slice(2)) {
    const M = boards[arm];
    if (!M || !boards.on) {
      say(`| \`${arm.slice(3)}\` | missing | | |`);
      continue;
    }
    say(
      `| \`${arm.slice(3)}\` | ${fmt(pair(boards.on, M, SLICES[0][1]))} | ${fmt(pair(boards.on, M, SLICES[1][1]))} | ${fmt(pair(boards.on, M, SLICES[1][1], 'text'))} |`,
    );
  }
}
const sh = (cwd, cmd) => {
  try {
    return execFileSync(cmd[0], cmd.slice(1), {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, TMPDIR: TMP },
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (e) {
    return `(failed: ${
      String(e.stderr ?? e.message)
        .trim()
        .split('\n')
        .slice(-1)[0]
    })`;
  }
};
const block = (title, text) => {
  say('');
  say(`## ${title}`);
  say('');
  say('```');
  say(text);
  say('```');
};
if (!SKIP.has('lives')) {
  block('Lives: story (on / off)', ok('story') ? sh(T, run('src/tools/story.ts', 'report', 'on', RULE_OFF)) : 'missing');
  block('Lives: friends', ok('friends') ? sh(T, run('src/tools/friends.ts', 'report', 'on', RULE_OFF)) : 'missing');
  block(
    'Lives: consequences (on)',
    ok('cons')
      ? sh(T, run('src/tools/consequences.ts', 'report', 'on'))
          .split('\n')
          .slice(0, 4)
          .join('\n')
      : 'missing',
  );
  block(
    'Lives: consequences (off)',
    ok('cons')
      ? sh(T, run('src/tools/consequences.ts', 'report', RULE_OFF))
          .split('\n')
          .slice(0, 4)
          .join('\n')
      : 'missing',
  );
}
for (const j of jobs.filter(j => j.name.startsWith('faults ')))
  block(`Faults (${j.name.split(' ')[1]})`, j.state === 'done' ? j.log.trim() : 'missing');
const id = jobs.find(j => j.name === 'ident check');
if (id)
  block(
    'Identity with the switches off, against the base',
    id.state === 'done'
      ? id.log
          .trim()
          .split('\n')
          .filter(l => !/: identical$/.test(l))
          .join('\n')
      : 'missing',
  );
const nt = jobs.find(j => j.name === 'npm test');
if (nt) {
  say('');
  say(`## npm test`);
  say('');
  say(nt.state === 'done' ? 'Passes.' : `**Fails** (exit ${nt.code}); see \`logs/npm-test.log\`.`);
}
say('');
say(`## Cold read`);
say('');
say(`${coldNote}. Give the pack to a reader before anyone reads the numbers above.`);
writeFileSync(join(OUT, 'summary.md'), lines.join('\n') + '\n');
console.error(`round: summary in ${join(OUT, 'summary.md')}`);
for (const d of readdirSync(T).filter(f => f.startsWith('out-'))) cpSync(join(T, d), join(OUT, d), { recursive: true });
for (const d of [T, B].filter(Boolean)) git('worktree', 'remove', '--force', d);
process.exit(failed.length ? 1 : 0);
