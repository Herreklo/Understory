// Builds H1's pair page (study/h1.md): picks the pairs by the rule written there, deals them to A and B, and writes dist/h1.html
// (the pages and nothing of the round or the arm) and study/h1-key.json (what each pair on the page is). Prints counts only, never a
// pair's arm or the model readers' answer to it.
//   node study/h1-build.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
const R = 'reports';
const json = f => JSON.parse(readFileSync(`${R}/${f}`, 'utf8'));

// A small deterministic random stream from a string, as Q3's page has it.
function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffled(xs, seed) { const r = rng(seed), a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// A pack's versions: {P01: {A: {head, lines}, B: ...}}. A line is {y, t, why, cited: [...]}; the numbers M38's packs put before a
// line are dropped (the page numbers lines itself). Lines are counted as round 35 counts them: not the cited events shown under one.
function pack(f) {
  const out = {}; let cur = null;
  for (const raw of readFileSync(`${R}/${f}`, 'utf8').split('\n')) {
    const h = raw.match(/^##### (P\d+), version ([AB]) — (.*)$/);
    if (h) { cur = { head: h[3], lines: [] }; (out[h[1]] ??= {})[h[2]] = cur; continue; }
    if (!cur || !raw.trim()) continue;
    const s = raw.replace(/^\s*\d+\s{2}(?=\d{4}: )/, '');
    if (s.trimStart().startsWith('↳')) { cur.lines.at(-1)?.cited.push(s.trim().replace(/^↳\s*/, '')); continue; }
    const m = s.match(/^(\d{4}): (.*?)(?:  \[(.*)\])?$/);
    if (!m) throw new Error(`${f}: cannot read the line "${s.slice(0, 60)}"`);
    cur.lines.push({ y: +m[1], t: m[2], why: m[3] ?? '', cited: [] });
  }
  return out;
}

// The model readers on one pack: each role's choice and margin per pair, from its sittings (a role's parts are separate files).
function readers(r) {
  const f = existsSync(`${R}/${r}-answers.json`) ? Object.values(json(`${r}-answers.json`)) : ['novelist', 'socialworker', 'player'].map(n => json(`${r}-${n}.json`));
  const roles = {};
  for (const s of f) for (const [p, v] of Object.entries(s.pairs)) {
    const role = s.reader.replace(/-\d+$/, '');
    const pick = v.prefer === 'A' || v.prefer === 'B' ? v.prefer : null;
    const other = pick === 'A' ? 'B' : 'A';
    (roles[p] ??= {})[role] = { pick, margin: pick ? v[pick].score - v[other].score : 0 };
  }
  return roles;
}
// The majority in the pack's letters, how clear it is, and its mean margin.
function majority(byRole) {
  const rs = Object.values(byRole), a = rs.filter(x => x.pick === 'A').length, b = rs.filter(x => x.pick === 'B').length;
  const pick = a > b ? 'A' : b > a ? 'B' : null;
  const same = pick && rs.every(x => x.pick === pick);
  return { pick, roles: rs.length, forIt: Math.max(a, b), same, clear: same && rs.every(x => x.margin > 0), margin: rs.reduce((t, x) => t + (x.pick === pick ? x.margin : -x.margin), 0) / rs.length };
}

const chosen = []; // {source, pack, pair, onIs (pack letter or null), model, lines {A,B}, kinds {A,B}}
const count = { r40: {}, length: {}, null: {} };

// Round 40's busiest: 12 clear pairs, alternating the arm the majority chose, strongest first.
{
  const P = pack('40-reading-busiest-pack.txt'), key = json('40-reading-busiest-key.json'), rd = readers('40-reading-busiest');
  const all = Object.keys(key).sort().map(p => {
    const m = majority(rd[p]), on = key[p].onIs, off = on === 'A' ? 'B' : 'A';
    return { source: 'r40', pack: '40-reading-busiest', pair: p, onIs: on, model: m, lines: { A: P[p].A.lines.length, B: P[p].B.lines.length }, kinds: { [on]: key[p].on.kinds, [off]: key[p].off.kinds }, keyLines: { [on]: key[p].on.lines, [off]: key[p].off.lines } };
  });
  const rank = xs => xs.sort((x, y) => y.model.margin - x.model.margin || (x.pair < y.pair ? -1 : 1));
  const take = (pool, n) => {
    const onM = rank(pool.filter(x => x.model.pick === x.onIs)), offM = rank(pool.filter(x => x.model.pick !== x.onIs));
    const out = [];
    while (out.length < n && (onM.length || offM.length)) { const l = (out.length % 2 === 0 && onM.length) || !offM.length ? onM : offM; out.push(l.shift()); }
    return out;
  };
  const clear = all.filter(x => x.model.clear);
  const got = take(clear, 12);
  if (got.length < 12) got.push(...take(all.filter(x => x.model.same && !x.model.clear), 12 - got.length));
  count.r40 = { clear: clear.length, taken: got.length, fromClear: got.filter(x => x.model.clear).length, mismatchedLines: all.filter(x => x.lines.A !== x.keyLines.A || x.lines.B !== x.keyLines.B).length };
  chosen.push(...got);
}

// Rounds 29-34: 6 pairs rebuilt exactly by round 36, at most 1 kind apart (relaxed to 2, then 3) and at least 10 lines apart.
{
  const vOn = json('36-variety-on.json'), vOff = json('36-variety-off.json');
  const exact = (v, r, p) => v.find(x => x.round === r && x.pair === p && x.lines === x.packLines);
  const cands = [];
  for (const r of ['29', '30', '31', '32', '33', '34']) {
    const P = pack(`${r}-reading-pack.txt`), key = json(`${r}-reading-key.json`), rd = readers(`${r}-reading`);
    for (const p of Object.keys(key).sort()) {
      const on = key[p].onIs, off = on === 'A' ? 'B' : 'A', a = exact(vOn, r, p), b = exact(vOff, r, p);
      if (!a || !b) continue;
      const lines = { A: P[p].A.lines.length, B: P[p].B.lines.length };
      if (lines[on] !== a.lines || lines[off] !== b.lines) { count.length.mismatchedLines = (count.length.mismatchedLines ?? 0) + 1; continue; }
      cands.push({ source: 'length', pack: `${r}-reading`, round: r, pair: p, onIs: on, model: majority(rd[p]), lines, kinds: { [on]: a.distinctTypes, [off]: b.distinctTypes } });
    }
  }
  const dl = x => Math.abs(x.lines.A - x.lines.B), dk = x => Math.abs(x.kinds.A - x.kinds.B);
  let bound = 1, got = [];
  for (; bound <= 3; bound++) {
    const el = cands.filter(x => dk(x) <= bound && dl(x) >= 10).sort((x, y) => dl(y) - dl(x) || (x.round + x.pair < y.round + y.pair ? -1 : 1));
    got = []; const per = {};
    for (const x of el) { if (got.length >= 6) break; if ((per[x.round] ?? 0) >= 2) continue; per[x.round] = (per[x.round] ?? 0) + 1; got.push(x); }
    if (got.length >= 6) break;
  }
  count.length = { ...count.length, rebuilt: cands.length, kindBound: Math.min(bound, 3), taken: got.length };
  chosen.push(...got);
}

// M38's null: 6 pairs by a fixed seed.
{
  const P = pack('M38-reading-null-pack.txt'), key = json('M38-reading-null-key.json'), rd = readers('M38-reading-null');
  const got = shuffled(Object.keys(key).sort(), 'h1-null').slice(0, 6).sort().map(p => {
    const on = key[p].onIs, off = on === 'A' ? 'B' : 'A';
    return { source: 'null', pack: 'M38-reading-null', pair: p, onIs: null, model: majority(rd[p]), lines: { A: P[p].A.lines.length, B: P[p].B.lines.length }, kinds: { [on]: key[p].on.kinds, [off]: key[p].off.kinds } };
  });
  count.null = { taken: got.length };
  chosen.push(...got);
}

// Deal to the page: half of each source flipped, in blocks of four (round 40, length, round 40, null), each source in a seeded order.
const packs = {};
const bySource = s => shuffled(chosen.filter(x => x.source === s), `h1-order-${s}`);
const flips = new Set();
for (const s of ['r40', 'length', 'null']) { const xs = shuffled(chosen.filter(x => x.source === s), `h1-ab-${s}`); xs.slice(0, Math.floor(xs.length / 2)).forEach(x => flips.add(x)); }
const queues = { r40: bySource('r40'), length: bySource('length'), null: bySource('null') };
const order = [];
while (order.length < chosen.length) for (const s of ['r40', 'length', 'r40', 'null']) if (queues[s].length) order.push(queues[s].shift());
const pairs = [], key = {};
order.forEach((x, i) => {
  const id = `H${String(i + 1).padStart(2, '0')}`, P = (packs[x.pack] ??= pack(`${x.pack}-pack.txt`))[x.pair];
  const flip = flips.has(x), src = flip ? { A: 'B', B: 'A' } : { A: 'A', B: 'B' }; // page letter → pack letter
  const toPage = l => (l == null ? null : flip ? (l === 'A' ? 'B' : 'A') : l);
  pairs.push({ id, A: P[src.A], B: P[src.B] });
  const arm = l => (x.onIs == null ? 'null' : src[l] === x.onIs ? 'on' : 'off');
  key[id] = {
    source: x.source, pack: x.pack, pair: x.pair, flipped: flip,
    arm: { A: arm('A'), B: arm('B') },
    model: { majority: toPage(x.model.pick), clear: x.model.clear, unanimous: !!x.model.same, roles: x.model.roles, forIt: x.model.forIt, margin: +x.model.margin.toFixed(2) },
    lines: { A: x.lines[src.A], B: x.lines[src.B] }, kinds: { A: x.kinds[src.A], B: x.kinds[src.B] },
    linesAminusB: x.lines[src.A] - x.lines[src.B], kindsAminusB: x.kinds[src.A] - x.kinds[src.B],
  };
});
const page = createHash('sha1').update(JSON.stringify(pairs)).digest('hex').slice(0, 8);
writeFileSync('study/h1-key.json', JSON.stringify({ page, rule: 'study/h1.md', pairs: key }, null, 1) + '\n');
const html = readFileSync('study/h1-template.html', 'utf8').replace('/*__PAIRS__*/null', () => JSON.stringify({ page, pairs }).replace(/<\/script/gi, '<\\/script'));
mkdirSync('dist', { recursive: true });
writeFileSync('dist/h1.html', html);
const words = pairs.map(p => ['A', 'B'].reduce((t, v) => t + p[v].lines.reduce((u, l) => u + `${l.t} ${l.why} ${l.cited.join(' ')}`.split(/\s+/).length, 0), 0)).sort((a, b) => a - b);
const r40on = order.filter(x => x.source === 'r40' && x.kinds[x.onIs] > x.kinds[x.onIs === 'A' ? 'B' : 'A']).length;
console.log(`h1: ${pairs.length} pairs (round 40 ${count.r40.taken}, ${count.r40.fromClear} of them clear, of ${count.r40.clear} clear; length ${count.length.taken} of ${count.length.rebuilt} rebuilt, kinds within ${count.length.kindBound}; null ${count.null.taken}) → dist/h1.html, study/h1-key.json · page ${page} · words a pair, median ${words[words.length >> 1]} · round 40 pairs whose on version has more kinds ${r40on} of ${count.r40.taken}${count.r40.mismatchedLines || count.length.mismatchedLines ? ` · lines not matching the key: ${count.r40.mismatchedLines} + ${count.length.mismatchedLines ?? 0}` : ''}`);
