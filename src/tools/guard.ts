// The guard (notes/build-plan.md, section 2): storiness must not become scripting. Two checks over the engine, in npm test.
//   1. No module outside src/tools/ imports from src/tools/: no engine rule reads a story measure, a density rate or any instrument.
//   2. A lint over the engine (src/ and scale/, without src/tools/, the page and the front door) flags what pacing looks like in code:
//      a `tried[…].n` count compared with anything (a cap, a quota), a count of events by `.events.filter(…).length` (compared, or
//      kept to compare), and a field whose name starts with `last` (a timer). A flagged line passes only when the allow-list below
//      names it, with a one-line justification the reviewer accepts. An entry that matches nothing fails too, so the list stays what
//      main does. A count of a person's own past may scale a weight or a feeling; it may never gate whether an event can happen.
//   tsx src/tools/guard.ts     Last line: GUARD {...}
import { readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import * as ts from 'typescript';

type Rule = 'tried-n' | 'events-count' | 'last-field';
const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '../..');
const TOOLS = join(ROOT, 'src/tools');
// Outside the engine: the instruments, the page (src/page.ts renders, src/app.ts is the app) and the front door.
const NOT_ENGINE = new Set(['src/page.ts', 'src/app.ts', 'src/boundary.ts']);

// Lines main already has, each with why it stands. They are listed for review, and the rule binds every new reader.
const ALLOW: { rule: Rule; file: string; has: string; why: string }[] = [
  {
    rule: 'tried-n',
    file: 'src/social.ts',
    has: "x.tried['dislikes']?.n",
    why: 'the dislikes cap: how many people one comes to dislike is capped by a count (build plan, section 2). Grandfathered, for review.',
  },
  {
    rule: 'tried-n',
    file: 'src/money.ts',
    has: "p.tried['tell:leave']?.n",
    why: 'talk of leaving for the city is told once a life: a quota of one on a kind of event. Grandfathered, for review.',
  },
  {
    rule: 'tried-n',
    file: 'src/time.ts',
    has: "(p.tried['tell:home']?.n ?? 0) < 2",
    why: 'a rooted person says so at most twice a life: a quota on a kind of event. Grandfathered, for review.',
  },
  {
    rule: 'tried-n',
    file: 'src/time.ts',
    has: "p.tried['tell:nohome'].n % 2",
    why: 'words only: the count picks one of two wordings of a line that happens either way.',
  },
  {
    rule: 'tried-n',
    file: 'src/grammar.ts',
    has: "p.tried['last:' + inst.type]?.n",
    why: 'routine is not news: the count decides whether a repeated answer is logged, never whether it is made. Grandfathered, for review.',
  },
  {
    rule: 'events-count',
    file: 'src/group.ts',
    has: "g.events.filter(i => w.events[i].type === 'group:show').length",
    why: "a band's first show is always news: the group's own count of shows decides whether one is broadcast. Grandfathered, for review.",
  },
];
// Timer fields main already has, by name.
const FIELDS: Record<string, string> = {
  lastGain: "a pursuit's last progress, which its setbacks are read against",
  lastAt: "a thread's last act, which its stage is read against",
  lastProvoked: 'a timer with no reader; N2 cuts it (build plan, section 2)',
  lastIll:
    'the last illness: a body needs nine months between illnesses (a cooldown, for review), and a second within four years continues the first',
  lastCheck: 'when a stalled pursuit was last weighed for giving up: a cooldown of eight months, for review',
  lastBreak: 'when a habit was last broken',
  lastHabit: 'when a habit was last taken up',
  lastWork: "a group's last work, which its rhythm is read against",
  lastShow: "a group's last show, which its rhythm is read against",
  lastQ: "the quality of a group's last show, for the words of the next (group.ts)",
  lastFam: 'the family of the last answer to a kind of situation, for routine that is not news (grammar.ts)',
};

function files(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}
const inTools = (p: string) => p === TOOLS || p.startsWith(TOOLS + '/');
const engine = [...files(join(ROOT, 'src')), ...files(join(ROOT, 'scale'))].filter(f => !inTools(f));

// 1. Imports: every static, dynamic or required module named by an engine file, resolved against the file.
const badImports: string[] = [];
for (const f of engine) {
  for (const m of ts.preProcessFile(readFileSync(f, 'utf8'), true, true).importedFiles)
    if (m.fileName.startsWith('.') && inTools(resolve(dirname(f), m.fileName))) badImports.push(`${relative(ROOT, f)}: imports ${m.fileName}`);
}

// 2. The lint.
const COMPARE = new Set([
  ts.SyntaxKind.LessThanToken,
  ts.SyntaxKind.LessThanEqualsToken,
  ts.SyntaxKind.GreaterThanToken,
  ts.SyntaxKind.GreaterThanEqualsToken,
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
]);
const ARITH = new Set([
  ts.SyntaxKind.PlusToken,
  ts.SyntaxKind.MinusToken,
  ts.SyntaxKind.AsteriskToken,
  ts.SyntaxKind.SlashToken,
  ts.SyntaxKind.PercentToken,
  ts.SyntaxKind.QuestionQuestionToken,
]);
const bare = (n: ts.Expression): ts.Expression =>
  ts.isParenthesizedExpression(n) || ts.isNonNullExpression(n) || ts.isAsExpression(n) ? bare(n.expression) : n;
const named = (n: ts.Expression, name: string) =>
  (ts.isPropertyAccessExpression(n) && n.name.text === name) || (ts.isIdentifier(n) && n.text === name);
// Does the value end up compared, through brackets, arithmetic and `??`?
function compared(n: ts.Node): boolean {
  for (let x = n, p = n.parent; p; x = p, p = p.parent) {
    if (ts.isParenthesizedExpression(p) || ts.isNonNullExpression(p) || ts.isAsExpression(p) || ts.isPrefixUnaryExpression(p)) continue;
    if (!ts.isBinaryExpression(p)) return false;
    if (COMPARE.has(p.operatorToken.kind)) return true;
    if (!ARITH.has(p.operatorToken.kind)) return false;
  }
  return false;
}
// A string key's name: 'lastFam:' + type is the field lastFam.
function keyName(n: ts.Expression): string | undefined {
  n = bare(n);
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text.match(/^[A-Za-z_$][\w$]*/)?.[0];
  if (ts.isTemplateExpression(n)) return n.head.text.match(/^[A-Za-z_$][\w$]*/)?.[0];
  if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) return keyName(n.left);
}
const LAST = /^last[A-Z]/;
const hits: { rule: Rule; file: string; line: number; text: string; name?: string }[] = [];
for (const f of engine) {
  const file = relative(ROOT, f);
  if (NOT_ENGINE.has(file)) continue;
  const src = ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true);
  const hit = (rule: Rule, n: ts.Node, name?: string) => {
    const { line } = src.getLineAndCharacterOfPosition(n.getStart(src));
    hits.push({ rule, file, line: line + 1, text: src.text.split('\n')[line].trim(), name });
  };
  const visit = (n: ts.Node) => {
    // tried[k].n, tried[k]?.n, tried.k.n, compared
    if (ts.isPropertyAccessExpression(n) && n.name.text === 'n') {
      const o = bare(n.expression);
      if ((ts.isElementAccessExpression(o) || ts.isPropertyAccessExpression(o)) && named(bare(o.expression), 'tried') && compared(n))
        hit('tried-n', n);
    }
    // x.events.filter(…).length
    if (ts.isPropertyAccessExpression(n) && n.name.text === 'length') {
      const c = bare(n.expression);
      if (
        ts.isCallExpression(c) &&
        ts.isPropertyAccessExpression(c.expression) &&
        c.expression.name.text === 'filter' &&
        named(bare(c.expression.expression), 'events')
      )
        hit('events-count', n);
    }
    // last* as a field: declared, assigned, read (not a method called), or a string key outside `tried`
    if (
      (ts.isPropertySignature(n) || ts.isPropertyDeclaration(n) || ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) &&
      (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name)) &&
      LAST.test(n.name.text)
    )
      hit('last-field', n, n.name.text);
    if (ts.isPropertyAccessExpression(n) && LAST.test(n.name.text) && !(ts.isCallExpression(n.parent) && n.parent.expression === n))
      hit('last-field', n, n.name.text);
    if (ts.isElementAccessExpression(n) && !named(bare(n.expression), 'tried')) {
      const k = keyName(n.argumentExpression);
      if (k && LAST.test(k)) hit('last-field', n, k);
    }
    ts.forEachChild(n, visit);
  };
  visit(src);
}

const unexplained = hits.filter(h =>
  h.rule === 'last-field' ? !FIELDS[h.name!] : !ALLOW.some(a => a.rule === h.rule && a.file === h.file && h.text.includes(a.has)),
);
const stale = [
  ...ALLOW.filter(a => !hits.some(h => h.rule === a.rule && h.file === a.file && h.text.includes(a.has))).map(a => `${a.file}: ${a.has}`),
  ...Object.keys(FIELDS)
    .filter(k => !hits.some(h => h.name === k))
    .map(k => `field ${k}`),
];
const RULES: Record<Rule, string> = {
  'tried-n': 'a count of what a person has done, compared: a cap or a quota on a kind of event',
  'events-count': 'a count of events',
  'last-field': 'a new last* field: a timer',
};
for (const b of badImports) console.log(`✗ ${b}: the engine never reads anything under src/tools/`);
for (const h of unexplained) console.log(`✗ ${h.file}:${h.line} ${RULES[h.rule]}${h.name ? ` (${h.name})` : ''}\n    ${h.text}`);
for (const s of stale) console.log(`✗ the allow-list names ${s}, which the engine no longer has: take it off the list`);
if (unexplained.length)
  console.log(
    'A flagged line is pacing unless it only scales a weight or a feeling, or picks words. Either read the state in the person instead,\n' +
      'or add it to the allow-list in src/tools/guard.ts with a one-line justification for the reviewer (build plan, section 2).',
  );
const out = { modules: engine.length, badImports: badImports.length, flagged: hits.length, unexplained: unexplained.length, stale: stale.length };
console.log('GUARD ' + JSON.stringify(out));
if (badImports.length || unexplained.length || stale.length) process.exit(1);
