// Round 48's sizing: the band year (norms.ts), with the counter and the five fail-ifs of notes/research/band-year.md.
//   ./run.sh src/tools/diag/norms.ts found A B [rule]   → out-norms/found-<rule>-<seed>.json: 40 years from the town's founding
//   ./run.sh src/tools/diag/norms.ts pages A B [rule]   → out-norms/pages-<rule>-<seed>.json: the usual 30-year past and ten present years
//   ./run.sh src/tools/diag/norms.ts report [rule] [offrule]
// A rule is 'on' (ON=norms), 'off' (main's model), or 'tellless' (ON=norms with OFF=normtell: norms learned from acts alone). The rule
// sets the switches itself, so the environment needs none. A stopped run resumes.
//
// The counter: for each band that loses every founding member (the members of its formed event) and goes on, the founders' credit norm in
// their last year together (the founders in the band, each month, their held norm averaged; a founder who holds none holds 0) against the
// members' a year after the last founder has gone (a member who holds none holds 0). r across bands, pooled over worlds.
// The gate: of decisions that weigh a norm, the share whose likeliest answer changes with the norm read at its neutral value (flip.ts).
// Fail-if 3: the members' held norm against their own make-up (modesty and sincerity), and bands matched on their founders' make-up whose
// founders' norms three years in lie on opposite sides of zero. Fail-if 5: of acts a norm decided (flipped), the share the witness knows.
// Last line of a report: NORMS {...}
import '../env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { pickWitness } from '../../witness';
import { score, truthView, type Option } from '../../decide';
import { heldNorm } from '../../norms';
import { age, facet, OFF, ON, type Group, type Person, type World } from '../../world';
import { neutralised, stateMatcher } from './flip';
import { copies, lineTexts, norm, packPage } from './pages';

const OUT = process.env.NORMS_OUT ?? 'out-norms';
const NORM_LINE = /how it goes in|a song is everyone's|who gets the credit|does not go unanswered|rows blow over/;
const DUD = /^@ brought a song to .*, "…", and it did not come to much\.$/; // the commonest band line (the research's 6.3 a world-decade)

function setRule(rule: string) {
  ON.clear();
  OFF.clear();
  if (rule === 'on' || rule === 'tellless') ON.add('norms');
  if (rule === 'tellless') OFF.add('normtell');
}
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
const credit = (w: World, i: number, g: Group) => heldNorm(w, i, g, 'credit')?.m ?? 0;
const lean = (p: Person) => (facet(p, 'modesty') + facet(p, 'sincerity')) / 2;
const strip = (s: string) => s.replace(/@\d+/g, '@').replace(/"[^"]*"/g, '"…"');

interface Flip {
  trigger: string;
  flipped: boolean;
  witness: boolean | null; // whether the witness knows the act, for a flipped decision whose act is on the record
}
interface Band {
  id: number;
  since: number;
  founders: number[];
  foundersLean: number; // the founders' mean modesty and sincerity at the founding
  f3: number | null; // the founders' mean held credit norm three years in, those still in the band
  window: number[]; // the founders' monthly mean, the last twelve months they were in it
  gone: number | null; // the month the last founder went
  F: number | null; // the founders' norm in their last year together
  Frows: number | null;
  M: number | null; // the members' a year after the last founder went
  Mheld: number | null; // the same, holders only
  Mrows: number | null;
  Mlean: number | null; // the members' mean modesty and sincerity then
  M3: number | null; // the members' three and five years after, for drift
  M5: number | null;
  Flean: number | null; // the founders' (those in the last year) mean modesty and sincerity
  after: number; // members a year after
  told: number; // members then who had been told
  newcomers: number; // joins since the founding
  endM: number | null; // at the end of the run: the members' mean held norm and make-up, for every band alive
  endLean: number | null;
}
export interface FoundOut {
  seed: number;
  rule: string;
  months: number;
  bands: Band[];
  flips: Flip[];
  tellers: { joins: number; candidate: number; told: number; tellsByTeller: Record<number, number> };
  expr: Record<string, number>;
  rows: Record<string, number>;
  listed: { told: number; dud: number; band: number; all: number };
}

// ---------- from the founding ----------
function runFound(seed: number, rule: string): FoundOut {
  setRule(rule);
  const w = buildWorld(seed, 1, 0);
  const wit = pickWitness(w).id;
  const match = stateMatcher('norm:');
  const flips: Flip[] = [];
  const flipRec = new Map<any, Flip>();
  const prev = w.hooks.predict;
  w.hooks.predict = (w2: World, p: Person, options: Option[], chosenId: string, rec: any) => {
    prev?.(w2, p, options, chosenId, rec);
    if (!options.some(o => o.considerations.some(c => match(c.id)))) return;
    const view = truthView(w2);
    const top = (s: ReturnType<typeof score>) => s.reduce((a, b) => (b.p > a.p ? b : a)).id;
    const f: Flip = {
      trigger: String(rec?.trigger ?? '?'),
      flipped: top(score(options, view, p.variability)) !== top(score(neutralised(options, match), view, p.variability)),
      witness: null,
    };
    flips.push(f);
    if (f.flipped) flipRec.set(rec, f);
  };
  const bands = new Map<number, Band>();
  const tellers = { joins: 0, candidate: 0, told: 0, tellsByTeller: {} as Record<number, number> };
  const expr: Record<string, number> = {};
  const rows: Record<string, number> = {};
  const listed = { told: 0, dud: 0, band: 0, all: 0 };
  const months = 40 * 12;
  let seen = w.events.length;
  for (let m = 0; m < months; m++) {
    tick(w);
    for (let i = seen; i < w.events.length; i++) {
      const e = w.events[i];
      const f = e.decision ? flipRec.get(e.decision) : undefined;
      if (f) f.witness = e.knownBy.has(wit) || e.who.includes(wit);
      const tr = (e.decision as any)?.trigger;
      if (e.type === 'group:joined') tellers.joins++;
      if (e.type === 'group:told') {
        tellers.told++;
        tellers.tellsByTeller[e.who[0]] = (tellers.tellsByTeller[e.who[0]] ?? 0) + 1;
      }
      const step =
        e.type === 'group:word' ? 'word' : e.type === 'group:left' && / asked @\d+ to go/.test(e.text) ? 'asked' : tr === 'groupstrain' ? e.type : '';
      if (step) rows[step] = (rows[step] ?? 0) + 1;
      if (e.w > 0.25) {
        listed.all++;
        if (e.type.startsWith('group:') || tr === 'authorship') listed.band++;
        if (e.type === 'group:told') listed.told++;
        if (DUD.test(strip(e.text))) listed.dud++;
      }
    }
    seen = w.events.length;
    for (const g of w.groups) {
      let b = bands.get(g.id);
      if (!b) {
        const founders = [...w.events[g.events[0]].who];
        b = {
          id: g.id,
          since: g.since,
          founders,
          foundersLean: mean(founders.map(i => lean(w.byId.get(i)!))),
          f3: null,
          window: [],
          gone: null,
          F: null,
          Frows: null,
          M: null,
          Mheld: null,
          Mrows: null,
          Mlean: null,
          Flean: null,
          after: 0,
          told: 0,
          newcomers: 0,
          endM: null,
          endLean: null,
          M3: null,
          M5: null,
        };
        bands.set(g.id, b);
      }
      if (g.ended != null && g.ended < w.t) continue;
      const fin = g.members.filter(i => b!.founders.includes(i));
      if (w.t - g.since === 36 && fin.length) b.f3 = mean(fin.map(i => credit(w, i, g)));
      if (b.gone == null) {
        if (fin.length) {
          b.window.push(mean(fin.map(i => credit(w, i, g))));
          if (b.window.length > 12) b.window.shift();
          (b as any).lastFin = fin;
        } else if (!g.ended && g.members.length) {
          b.gone = w.t;
          b.F = mean(b.window);
          const last: number[] = (b as any).lastFin ?? [];
          b.Frows = mean(last.map(i => heldNorm(w, i, g, 'rows')?.m ?? 0));
          b.Flean = mean(last.map(i => lean(w.byId.get(i)!)));
        }
      } else if ((w.t - b.gone === 36 || w.t - b.gone === 60) && !g.ended && g.members.length) {
        b[w.t - b.gone === 36 ? 'M3' : 'M5'] = mean(g.members.map(i => credit(w, i, g)));
      } else if (b.M == null && w.t - b.gone === 12 && !g.ended && g.members.length) {
        const ms = g.members;
        b.M = mean(ms.map(i => credit(w, i, g)));
        const held = ms.filter(i => heldNorm(w, i, g, 'credit'));
        b.Mheld = held.length ? mean(held.map(i => credit(w, i, g))) : null;
        b.Mrows = mean(ms.map(i => heldNorm(w, i, g, 'rows')?.m ?? 0));
        b.Mlean = mean(ms.map(i => lean(w.byId.get(i)!)));
        b.after = ms.length;
        b.told = ms.filter(i => w.events.some(e => e.type === 'group:told' && e.who[1] === i && g.events.includes(e.id))).length;
      }
    }
  }
  for (const g of w.groups) {
    const b = bands.get(g.id)!;
    const joins = g.events.filter(i => w.events[i].type === 'group:joined').length;
    b.newcomers = joins;
    if (!g.ended && g.members.length) {
      b.endM = mean(g.members.map(i => credit(w, i, g)));
      b.endLean = mean(g.members.map(i => lean(w.byId.get(i)!)));
    }
    delete (b as any).lastFin;
    b.window = [];
  }
  // Authorship answers by expression: read from the events' decision records.
  for (const e of w.events) {
    const d = e.decision as any;
    if (d?.trigger === 'authorship') expr[d.expr] = (expr[d.expr] ?? 0) + 1;
  }
  return { seed, rule, months, bands: [...bands.values()], flips, tellers, expr, rows, listed };
}

// ---------- the page, paired: the usual past and ten present years ----------
export interface PagesOut {
  seed: number;
  rule: string;
  lines: number;
  copies: number;
  top25: number;
  top25Norm: number;
  normLines: number; // lines whose words or reasons carry a norm
  dud: number;
  decided: number; // present-years acts a norm decided (flipped), and those the witness knows
  known: number;
  weighed: number;
}
function runPages(seed: number, rule: string): PagesOut {
  setRule(rule);
  const w = buildWorld(seed, 1);
  const wit = pickWitness(w).id;
  const match = stateMatcher('norm:');
  const flipped = new Set<any>();
  let weighed = 0;
  const prev = w.hooks.predict;
  w.hooks.predict = (w2: World, p: Person, options: Option[], chosenId: string, rec: any) => {
    prev?.(w2, p, options, chosenId, rec);
    if (!options.some(o => o.considerations.some(c => match(c.id)))) return;
    weighed++;
    const view = truthView(w2);
    const top = (s: ReturnType<typeof score>) => s.reduce((a, b) => (b.p > a.p ? b : a)).id;
    if (top(score(options, view, p.variability)) !== top(score(neutralised(options, match), view, p.variability))) flipped.add(rec);
  };
  for (let m = 0; m < 120; m++) tick(w);
  let decided = 0,
    known = 0;
  for (const e of w.events)
    if (e.decision && flipped.has(e.decision)) {
      decided++;
      if (e.knownBy.has(wit) || e.who.includes(wit)) known++;
    }
  const adults = w.people.filter(p => p.status === 'in' && age(w, p) >= 18);
  const pages = adults.map(p => packPage(w, p));
  const c = copies(pages);
  const freq = new Map<string, number>();
  for (const pg of pages) for (const t of lineTexts(pg)) freq.set(norm(t), (freq.get(norm(t)) ?? 0) + 1);
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
  let normLines = 0,
    dud = 0;
  for (const pg of pages)
    for (const raw of pg) {
      if (NORM_LINE.test(raw)) normLines++;
      if (/and it did not come to much\./.test(raw)) dud++;
    }
  return {
    seed,
    rule,
    lines: c.lines,
    copies: c.copies,
    top25: top.reduce((s, x) => s + x[1], 0),
    top25Norm: top.filter(([t]) => NORM_LINE.test(t)).length,
    normLines,
    dud,
    decided,
    known,
    weighed,
  };
}

// ---------- report ----------
const read = <T>(prefix: string): T[] =>
  existsSync(OUT)
    ? readdirSync(OUT)
        .filter(f => f.startsWith(prefix + '-') && f.endsWith('.json'))
        .map(f => JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')) as T)
        .sort((a: any, b: any) => a.seed - b.seed)
    : [];
function pearson(xs: number[], ys: number[]) {
  const n = xs.length,
    mx = mean(xs),
    my = mean(ys);
  let sxy = 0,
    sxx = 0,
    syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
}
// r with its Fisher interval (95% two-sided) and the one-sided 95% lower bound.
function rCI(xs: number[], ys: number[]) {
  const r = pearson(xs, ys),
    n = xs.length;
  const z = Math.atanh(r),
    se = 1 / Math.sqrt(Math.max(1, n - 3));
  return { r, n, lo: Math.tanh(z - 1.96 * se), hi: Math.tanh(z + 1.96 * se), lo1: Math.tanh(z - 1.645 * se) };
}
const f2 = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : '—');
const pct = (a: number, b: number) => (b ? (100 * a) / b : 0);
function meanCI(xs: number[]) {
  const n = xs.length,
    m = mean(xs);
  const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, n - 1));
  return { m, half: (1.96 * sd) / Math.sqrt(Math.max(1, n)), up1: m + (1.645 * sd) / Math.sqrt(Math.max(1, n)), n };
}

function report(rule: string, offRule: string) {
  const W = read<FoundOut>('found-' + rule);
  const out: Record<string, any> = { rule, worlds: W.length };
  const say = (s: string) => console.log(s);
  say(`# Round 48 sizing, rule ${rule}: ${W.length} worlds from the founding (${W[0]?.seed}–${W[W.length - 1]?.seed})`);
  const bands = W.flatMap(x => x.bands.map(b => ({ ...b, seed: x.seed })));
  const lost = bands.filter(b => b.gone != null);
  const scored = lost.filter(b => b.M != null && b.F != null);
  say(
    `bands ${bands.length} (${f2(bands.length / W.length)} a world); lost every founder ${lost.length} (${f2(lost.length / W.length)} a world); scored a year on ${scored.length}`,
  );
  const c = rCI(
    scored.map(b => b.F!),
    scored.map(b => b.M!),
  );
  say(`COUNTER r(founders' credit norm, members' a year after) = ${f2(c.r)} [${f2(c.lo)}, ${f2(c.hi)}], one-sided lower ${f2(c.lo1)}, n ${c.n}`);
  const ch = scored.filter(b => b.Mheld != null);
  const c2 = rCI(
    ch.map(b => b.F!),
    ch.map(b => b.Mheld!),
  );
  say(`  holders only: r ${f2(c2.r)} [${f2(c2.lo)}, ${f2(c2.hi)}], n ${c2.n}`);
  const cr = rCI(
    scored.map(b => b.Frows!),
    scored.map(b => b.Mrows!),
  );
  say(`  rows norm beside: r ${f2(cr.r)} [${f2(cr.lo)}, ${f2(cr.hi)}]`);
  const sel = rCI(
    scored.map(b => b.Flean!),
    scored.map(b => b.Mlean!),
  );
  say(`  make-up (modesty and sincerity), founders' against members': r ${f2(sel.r)} [${f2(sel.lo)}, ${f2(sel.hi)}] (selection)`);
  const sdF = Math.sqrt(mean(scored.map(b => (b.F! - mean(scored.map(x => x.F!))) ** 2)));
  const sdM = Math.sqrt(mean(scored.map(b => (b.M! - mean(scored.map(x => x.M!))) ** 2)));
  say(
    `  F mean ${f2(mean(scored.map(b => b.F!)))} sd ${f2(sdF)}; M mean ${f2(mean(scored.map(b => b.M!)))} sd ${f2(sdM)}; members a year on ${f2(mean(scored.map(b => b.after)))}, told ${f2(mean(scored.map(b => b.told)))}`,
  );
  for (const k of ['M3', 'M5'] as const) {
    const xs = scored.filter(b => b[k] != null);
    const d = rCI(
      xs.map(b => b.F!),
      xs.map(b => b[k]!),
    );
    say(
      `  drift: the founders' norm against members' ${k === 'M3' ? 'three' : 'five'} years after: r ${f2(d.r)} [${f2(d.lo)}, ${f2(d.hi)}], n ${d.n}`,
    );
    out['drift' + k] = d;
  }
  out.counter = c;
  out.counterHeld = c2;
  out.rows = cr;
  out.selection = sel;
  out.bands = { all: bands.length, lost: lost.length, scored: scored.length };
  // Same sign, the plain reading of r: the share of scored bands whose members lean the founders' way.
  const sameSign = scored.filter(b => Math.abs(b.F!) >= 0.05 && Math.sign(b.F!) === Math.sign(b.M!)).length;
  const signed = scored.filter(b => Math.abs(b.F!) >= 0.05).length;
  say(`  members lean the founders' way: ${sameSign} of ${signed} (${f2(pct(sameSign, signed))}%)`);
  out.sameSign = [sameSign, signed];

  // The gate.
  const fl = W.flatMap(x => x.flips);
  const byT: Record<string, [number, number]> = {};
  for (const f of fl) {
    const r = (byT[f.trigger] ??= [0, 0]);
    r[0]++;
    if (f.flipped) r[1]++;
  }
  const flipped = fl.filter(f => f.flipped).length;
  const perWorld = W.map(x => pct(x.flips.filter(f => f.flipped).length, x.flips.length)).filter((_, i) => W[i].flips.length);
  const pw = meanCI(perWorld);
  say(`GATE flips ${flipped} of ${fl.length} weighed (${f2(pct(flipped, fl.length))}% pooled; ${f2(pw.m)} ±${f2(pw.half)} a world)`);
  for (const [t, [n, k]] of Object.entries(byT)) say(`  ${t}: ${k} of ${n} (${f2(pct(k, n))}%)`);
  out.gate = { weighed: fl.length, flipped, pooled: pct(flipped, fl.length), byTrigger: byT, perWorld: pw };

  // Fail-if 3: a relabelled trait average?
  const alive = bands.filter(b => b.endM != null);
  const t1 = rCI(
    scored.map(b => b.Mlean!),
    scored.map(b => b.M!),
  );
  const t2 = rCI(
    alive.map(b => b.endLean!),
    alive.map(b => b.endM!),
  );
  say(
    `FAIL-IF 3 members' held norm against their make-up: a year on r ${f2(t1.r)} (n ${t1.n}); every band alive at the end r ${f2(t2.r)} (n ${t2.n}); stop above 0.7`,
  );
  const withF3 = bands.filter(b => b.f3 != null);
  let pairs = 0,
    apart = 0,
    far = 0;
  for (const b of withF3) {
    let best: (typeof withF3)[number] | undefined,
      d = Infinity;
    for (const o of withF3)
      if (o !== b && Math.abs(o.foundersLean - b.foundersLean) < d) {
        d = Math.abs(o.foundersLean - b.foundersLean);
        best = o;
      }
    if (!best || d > 0.1) continue;
    pairs++;
    if (Math.sign(b.f3!) !== Math.sign(best.f3!) && Math.abs(b.f3! - best.f3!) >= 0.2) apart++;
    if (Math.abs(b.f3! - best.f3!) >= 0.5) far++;
  }
  say(
    `  bands matched on founders' make-up (within 0.1): ${pairs}; three years in, their founders' norms on opposite sides ${apart} (${f2(pct(apart, pairs))}%), apart by 0.5 or more ${far} (${f2(pct(far, pairs))}%); need a third`,
  );
  out.trait = { yearOn: t1, end: t2, pairs, apart, far };

  // Fail-if 4, from the founding: tellers per newcomer, told lines.
  const T = W.reduce((s, x) => ({ joins: s.joins + x.tellers.joins, told: s.told + x.tellers.told }), { joins: 0, told: 0 });
  const tellsPer = W.flatMap(x => Object.values(x.tellers.tellsByTeller));
  say(
    `FAIL-IF 4 joins ${T.joins}, told ${T.told} (${f2(pct(T.told, T.joins))}% of newcomers, one teller each at most); told lines listed ${f2(mean(W.map(x => x.listed.told)) / 4)} a world-decade; a teller tells ${f2(mean(tellsPer))} newcomers over 40 years (most ${Math.max(0, ...tellsPer)})`,
  );
  say(
    `  band lines listed ${f2(mean(W.map(x => x.listed.band)) / 4)} a world-decade, ${f2(pct(mean(W.map(x => x.listed.band)), mean(W.map(x => x.listed.all))))}% of listed; "did not come to much" ${f2(mean(W.map(x => x.listed.dud)) / 4)} a world-decade`,
  );
  out.telling = {
    ...T,
    listedPerDecade: mean(W.map(x => x.listed.told)) / 4,
    bandPerDecade: mean(W.map(x => x.listed.band)) / 4,
    dudPerDecade: mean(W.map(x => x.listed.dud)) / 4,
  };
  const ex: Record<string, number> = {};
  for (const x of W) for (const [k, n] of Object.entries(x.expr)) ex[k] = (ex[k] ?? 0) + n;
  say(
    `  authorship answers: ${Object.entries(ex)
      .map(([k, n]) => `${k} ${n}`)
      .join(', ')}`,
  );
  const rw: Record<string, number> = {};
  for (const x of W) for (const [k, n] of Object.entries(x.rows)) rw[k] = (rw[k] ?? 0) + n;
  say(
    `  rows and what followed: ${Object.entries(rw)
      .map(([k, n]) => `${k} ${n}`)
      .join('; ')}`,
  );
  out.expr = ex;

  // Fail-if 5.
  const fd = fl.filter(f => f.flipped && f.witness != null);
  const known = fd.filter(f => f.witness).length;
  say(`FAIL-IF 5 the witness knows ${known} of ${fd.length} acts a norm decided (${f2(pct(known, fd.length))}%); stop under 30%`);
  out.witness = { known, of: fd.length };

  // Fail-if 4 on the page, paired by world.
  const P1 = read<PagesOut>('pages-' + rule),
    P0 = new Map(read<PagesOut>('pages-' + offRule).map(x => [x.seed, x]));
  const paired = P1.filter(x => P0.has(x.seed));
  if (paired.length) {
    const d = meanCI(paired.map(x => pct(x.copies, x.lines) - pct(P0.get(x.seed)!.copies, P0.get(x.seed)!.lines)));
    const dud = meanCI(paired.map(x => x.dud - P0.get(x.seed)!.dud));
    say(
      `PAGES (${paired.length} worlds, 30-year past and ten present years, every adult): copy share ${f2(mean(paired.map(x => pct(x.copies, x.lines))))}% against ${f2(mean(paired.map(x => pct(P0.get(x.seed)!.copies, P0.get(x.seed)!.lines))))}%, difference ${f2(d.m)} ±${f2(d.half)}, one-sided bound ${f2(d.up1)} (stop above +0.6)`,
    );
    say(
      `  norm lines in any world's top 25: ${paired.reduce((s, x) => s + x.top25Norm, 0)}; lines carrying a norm ${f2(mean(paired.map(x => x.normLines)))} a world; "did not come to much" ${f2(mean(paired.map(x => x.dud)))} against ${f2(mean(paired.map(x => P0.get(x.seed)!.dud)))} (difference ${f2(dud.m)} ±${f2(dud.half)})`,
    );
    const wk = paired.reduce((s, x) => s + x.known, 0),
      wd = paired.reduce((s, x) => s + x.decided, 0);
    say(
      `  the witness knows ${wk} of ${wd} present-years acts a norm decided (${f2(pct(wk, wd))}%); norm weighed in ${paired.reduce((s, x) => s + x.weighed, 0)} decisions`,
    );
    out.pagesWitness = { known: wk, of: wd };
    out.pages = {
      n: paired.length,
      copyDiff: d,
      top25Norm: paired.reduce((s, x) => s + x.top25Norm, 0),
      normLines: mean(paired.map(x => x.normLines)),
      dud,
    };
  }
  console.log('NORMS ' + JSON.stringify(out));
}

const [cmd, a, b, rule0] = process.argv.slice(2);
if (cmd === 'found' || cmd === 'pages') {
  const rule = rule0 ?? 'on';
  mkdirSync(OUT, { recursive: true });
  for (let s = Number(a); s <= Number(b); s++) {
    const f = `${OUT}/${cmd}-${rule}-${s}.json`;
    if (existsSync(f)) continue;
    const r = cmd === 'found' ? runFound(s, rule) : runPages(s, rule);
    writeFileSync(f, JSON.stringify(r));
    console.log(cmd, rule, s);
  }
} else if (cmd === 'report') report(a ?? 'on', b ?? 'off');
else console.log('usage: norms.ts found|pages A B [rule] | report [rule] [offrule]');
