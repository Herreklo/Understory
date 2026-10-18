// Adds measurement hooks to a copy of The Lab. Every hook is off unless an environment variable turns it on,
// and none of them draws from a random stream, so with no variables set the copy behaves exactly as main.
import { readFileSync, writeFileSync } from 'fs';
const root = process.argv[2];
const edit = (f, a, b) => {
  const p = `${root}/${f}`,
    s = readFileSync(p, 'utf8');
  if (s.split(a).length !== 2) throw new Error(`not exactly once in ${f}: ${a.slice(0, 60)}`);
  writeFileSync(
    p,
    s.replace(a, () => b),
  );
};
// A shared diagnostics module.
writeFileSync(
  `${root}/src/diagx.ts`,
  `// Review diagnostics (not part of The Lab). Counters written to DIAG_OUT on exit.
import { writeFileSync, mkdirSync } from 'fs';
export const NOLEAK = new Set((process.env.NOLEAK ?? '').split(',').filter(Boolean));
export const D: any = { score: { n: 0, unequal: 0, argmaxDiff: 0, tv: 0, tvU: 0, chosenShift: 0, fewerGain: 0, fewerN: 0, gapHist: {} },
  pop: { n: 0, wrong: 0, wrongTypes: {}, dupWho: 0 }, ev: { n: 0, zSum: 0, circSum: 0, k: 0 } };
const out = process.env.DIAG_OUT;
if (out) process.on('exit', () => { mkdirSync(out, { recursive: true }); writeFileSync(\`\${out}/diag-\${process.pid}.json\`, JSON.stringify(D)); });
// The scoring rule with every option padded to the same number of considerations by its own geometric mean: what the choice would be
// if the count of considerations carried no weight. Same temperature, same compensation, nothing drawn.
export function scoreDiag(scored: any[], variability: number) {
  if (!out) return;
  const S = D.score; S.n++;
  const ns = scored.map(o => o.parts.length), nmax = Math.max(1, ...ns), nmin = Math.min(...ns);
  const tau = 0.035 + 0.065 * variability;
  const pad = scored.map(o => {
    const base = o.score; // not used
    const lg = o.parts.length ? o.parts.reduce((s: number, q: any) => s + Math.log(q.y), 0) / o.parts.length : 0;
    let s = (o.baseF ?? 1) * Math.exp(lg * nmax);
    const mod = 1 - 1 / nmax; s = s + (1 - s) * mod * s; return s;
  });
  const mx = Math.max(...pad); const e = pad.map(s => Math.exp((s - mx) / tau)); const z = e.reduce((a, b) => a + b, 0); const p2 = e.map(x => x / z);
  const tv = 0.5 * scored.reduce((s, o, i) => s + Math.abs(o.p - p2[i]), 0);
  S.tv += tv;
  const am = (xs: number[]) => xs.indexOf(Math.max(...xs));
  if (nmax !== nmin) {
    S.unequal++; S.tvU += tv;
    const g = nmax - nmin; S.gapHist[g] = (S.gapHist[g] ?? 0) + 1;
    scored.forEach((o, i) => { if (o.parts.length === nmin) { S.fewerGain += o.p - p2[i]; S.fewerN++; } });
  }
  if (am(scored.map(o => o.p)) !== am(p2)) S.argmaxDiff++;
}
// Before an unkept event is taken off each person's list: is the last entry the event itself?
export function popCheck(w: any, e: any, P: any) {
  if (!out) return;
  if (new Set(e.who).size !== e.who.length) D.pop.dupWho++;
  for (const id of e.who) {
    const l = P(w, id).events; D.pop.n++;
    const last = l[l.length - 1];
    if (last !== e.id) { D.pop.wrong++; const t = w.events.find((x: any) => x.id === last)?.type ?? '?'; D.pop.wrongTypes[t] = (D.pop.wrongTypes[t] ?? 0) + 1; }
  }
}
`,
);
// The bent generator (PERTURB=σ), used only by the two real choices; every reader keeps the original model.
writeFileSync(
  `${root}/src/diagx.ts`,
  readFileSync(`${root}/src/diagx.ts`, 'utf8') +
    `// A generator the readers were not built from (PERTURB=σ): each answer's consideration is bent by its own fixed exponent,
// exp(σ·N(0,1)), the same in every world, so people follow a psychology that differs from the model every reader uses.
import { hash } from './rng';
const SIGMA = +(process.env.PERTURB ?? 0);
const KS = new Map<string, number>();
export const genK = SIGMA
  ? (opt: string, c: string) => {
      const key = opt + '|' + c;
      let k = KS.get(key);
      if (k == null) {
        const u1 = (hash('gen', key, 1) + 0.5) / 4294967296, u2 = (hash('gen', key, 2) + 0.5) / 4294967296;
        k = Math.exp(SIGMA * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
        KS.set(key, k);
      }
      return k;
    }
  : undefined;
`,
);
edit(
  'src/decide.ts',
  `export function score(options: Option[], view: View, variability: number, neutralise?: string): Scored[] {`,
  `export function score(options: Option[], view: View, variability: number, neutralise?: string, gen?: (opt: string, c: string) => number): Scored[] {`,
);
edit(
  'src/decide.ts',
  `      const y = Math.max(0.01, Math.min(1, c.curve(x)));`,
  `      const y0 = Math.max(0.01, Math.min(1, c.curve(x)));
      const y = gen ? Math.max(0.01, Math.min(1, y0 ** gen(o.id, c.id))) : y0;`,
);
writeFileSync(
  `${root}/src/diagx.ts`,
  readFileSync(`${root}/src/diagx.ts`, 'utf8') +
    `// How far the bent generator is from the readers' model, on the real decisions: total variation and a changed likeliest answer.
export function genDiag(bent: any[], plain: any[]) {
  if (!out) return;
  const G = (D.gen ??= { n: 0, tv: 0, argmax: 0 }); G.n++;
  G.tv += 0.5 * bent.reduce((s, o, i) => s + Math.abs(o.p - plain[i].p), 0);
  const am = (xs: any[]) => xs.reduce((b, o, i) => (o.p > xs[b].p ? i : b), 0);
  if (am(bent) !== am(plain)) G.argmax++;
}
`,
);
// Score: keep the base factor so the padded rule can use it.
edit(
  'src/decide.ts',
  `return { id: o.id, label: o.label, score: s, p: 0, parts };`,
  `return { id: o.id, label: o.label, score: s, p: 0, parts, baseF: o.base ?? 1 } as any;`,
);
// The two real choices.
edit(
  'src/grammar.ts',
  `  const scored = score(options, truthView(w), p.variability);
  const chosen = choose(scored, chanceOf(w, p), { t: w.t, who: p.id, kind: trigger,`,
  `  const scored = score(options, truthView(w), p.variability, undefined, genK);
  scoreDiag(scored, p.variability);
  if (genK) genDiag(scored, score(options, truthView(w), p.variability));
  const chosen = choose(scored, chanceOf(w, p), { t: w.t, who: p.id, kind: trigger,`,
);
edit(
  'src/grammar.ts',
  `  const scored = score(options, truthView(w), p.variability);
  const chosen = choose(scored, chanceOf(w, p), { t: w.t, who: p.id, kind: inst.type,`,
  `  const scored = score(options, truthView(w), p.variability, undefined, genK);
  scoreDiag(scored, p.variability);
  if (genK) genDiag(scored, score(options, truthView(w), p.variability));
  const chosen = choose(scored, chanceOf(w, p), { t: w.t, who: p.id, kind: inst.type,`,
);
// The pops.
edit(
  'src/grammar.ts',
  `    e.w = 0.2;
    for (const id of e.who) P(w, id).events.pop();`,
  `    e.w = 0.2;
    popCheck(w, e, P);
    for (const id of e.who) P(w, id).events.pop();`,
);
const gs = readFileSync(`${root}/src/group.ts`, 'utf8');
const gpop = `    e.w = 0.2;
    for (const id of e.who) P(w, id).events.pop();`;
if (gs.split(gpop).length !== 3) throw new Error('group pops');
writeFileSync(
  `${root}/src/group.ts`,
  gs
    .split(gpop)
    .join(
      `    e.w = 0.2;
    popCheck(w, e, P);
    for (const id of e.who) P(w, id).events.pop();`,
    )
    .replace(/^/, `import { popCheck } from './diagx';\n`),
);
// The evidence a witness gets from an act: three things it could not see, each removable.
edit(
  'src/grammar.ts',
  `  const circ = clamp(
    forWhy.filter`,
  `  const circ0 = clamp(
    forWhy.filter`,
);
edit(
  'src/grammar.ts',
  `    0,
    1,
  );
  // How strongly the act was done`,
  `    0,
    1,
  );
  const circ = NOLEAK.has('circ') ? +(process.env.CIRC_C ?? 0) : circ0;
  // How strongly the act was done`,
);
edit(
  'src/grammar.ts',
  `    const z = Math.abs(facet(p, k, t?.id, feats));
    const situational = ifthen && ifthen.facet === k ? 0.5 : 1;`,
  `    const z0 = Math.abs(facet(p, k, t?.id, feats));
    D.ev.n++; D.ev.zSum += Math.min(2, z0); if (D.ev.k++ === 0 || true) D.ev.circSum += circ0;
    const z = NOLEAK.has('z') ? +(process.env.Z_C ?? 0) : z0;
    const situational = ifthen && ifthen.facet === k && !NOLEAK.has('ifthen') ? 0.5 : 1;`,
);
edit(
  'src/grammar.ts',
  `  if (ifthen)
    evidence.push(ev(p.id, \`ifthen:\${ifthen.feature}:\${ifthen.facet}\`, Math.sign(ifthen.shift),`,
  `  // NOLEAK=ifthen: the act, not the hidden if-then, says which way; an act that shows nothing about the facet says nothing about it.
  const itSign = NOLEAK.has('ifthen') ? Math.sign((expr.evidence as any)[ifthen?.facet ?? ''] ?? 0) : Math.sign(ifthen?.shift ?? 0);
  if (ifthen && itSign !== 0)
    evidence.push(ev(p.id, \`ifthen:\${ifthen.feature}:\${ifthen.facet}\`, itSign,`,
);
// Imports.
writeFileSync(
  `${root}/src/grammar.ts`,
  `import { NOLEAK, D, scoreDiag, popCheck, genK, genDiag } from './diagx';\n` + readFileSync(`${root}/src/grammar.ts`, 'utf8'),
);
console.log('patched');
