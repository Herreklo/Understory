// Generating people: correlated dimensions, facets around them, signature traits,
// one tension, values from traits. Founders get a drawn past; everyone else lives one.

import { stream, clamp } from './rng';
import type { Rng } from './rng';
import { FACETS, DIM_CORR, VALUES, APTITUDES, TENSIONS, PASTS } from './core';
import { IFTHEN_TEMPLATES } from './features';
import type { Dim } from './core';
import { SETTING } from './setting';
import { inclination } from './inclination';
import { OFF, type Person, type World } from './world';

const DIM_IDS: Dim[] = ['H', 'E', 'X', 'A', 'C', 'O'];

function drawDims(r: Rng, parents: Person[], culture: Partial<Record<Dim, number>>): Record<Dim, number> {
  const d = {} as Record<Dim, number>;
  for (const id of DIM_IDS) {
    let mean = culture[id] ?? 0,
      varExplained = 0;
    if (parents.length) mean += (0.45 * parents.reduce((s, q) => s + q.dims[id], 0)) / parents.length; // ~45% heritable
    for (const prev of DIM_IDS) {
      if (prev === id) break;
      const c = DIM_CORR[prev][id] ?? DIM_CORR[id][prev] ?? 0;
      mean += c * (d[prev] - (culture[prev] ?? 0));
      varExplained += c * c;
    }
    d[id] = mean + r.normal() * Math.sqrt(Math.max(0.35, (parents.length ? 0.8 : 1) - varExplained));
  }
  return d;
}

export interface GenOpts {
  age: number;
  sex?: 'f' | 'm';
  parents?: number[];
  last?: string;
  founder: boolean;
}

export function pickName(w: World, r: Rng, sex: 'f' | 'm'): string {
  const pool = SETTING.names[sex];
  for (let i = 0; i < 40; i++) {
    const n = r.pick(pool);
    if (!w.people.some(p => p.first === n && p.status !== 'dead')) return n;
  }
  return r.pick(pool);
}

export function generatePerson(w: World, opt: GenOpts): Person {
  const id = w.nextId++;
  const r = stream(w.seed, 'person', id);
  const sex = opt.sex ?? (r.chance(0.5) ? 'f' : 'm');
  const parents = (opt.parents ?? []).map(i => w.byId.get(i)!).filter(Boolean);
  const dims = drawDims(r, parents, SETTING.culture);

  const facets: Record<string, number> = {};
  for (const f of FACETS) {
    const base = f.dim === 'I' ? 0.5 * dims.H + 0.5 * dims.A : dims[f.dim];
    facets[f.id] = 0.7 * base + r.normal() * 0.75;
  }

  // Signature traits: push two or three facets further the way they already lean.
  const nSig = r.chance(0.4) ? 3 : 2;
  const ranked = FACETS.map(f => [f.id, Math.abs(facets[f.id]) + r.normal() * 0.6] as const).sort((a, b) => b[1] - a[1]);
  const signatures: { facet: string; z: number }[] = [];
  const used = new Set<string>();
  for (const [fid] of ranked) {
    if (signatures.length >= nSig) break;
    const dir = facets[fid] >= 0 ? 1 : -1;
    facets[fid] = dir * Math.max(Math.abs(facets[fid]), 1.2 + r.next() * 0.7); // signatures stand out, a little past where they already lean
    used.add(fid);
    signatures.push({ facet: fid, z: facets[fid] });
  }

  // One tension, usually.
  let tension: Person['tension'];
  if (r.chance(0.65)) {
    const ok = TENSIONS.filter(t => [t.a, t.b].every(([fid, dir]) => !used.has(fid) || Math.sign(facets[fid]) === dir));
    if (ok.length) {
      const t = r.pick(ok);
      for (const [fid, dir] of [t.a, t.b]) {
        if (!used.has(fid)) facets[fid] = dir * (1.0 + r.next() * 0.6);
        used.add(fid);
      }
      tension = { id: t.id, label: t.label };
    }
  }

  // Values from traits plus noise; core = top two or three.
  const values: Record<string, number> = {};
  for (const v of VALUES) {
    let s = 0;
    for (const dim in v.from) s += (v.from as any)[dim] * dims[dim as Dim];
    values[v.id] = s + r.normal() * 0.8;
  }
  const coreValues = Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .slice(0, r.chance(0.5) ? 3 : 2)
    .map(([k]) => k);
  // Coherence: a person's facets lean a little towards the kind of person their core values describe.
  const LEAN: Record<string, Partial<Record<string, number>>> = {
    tradition: { patience: 0.3, modesty: 0.3, fairness: 0.2, unconventionality: -0.5, inquisitiveness: -0.3 },
    security: { prudence: 0.4, anxiety: 0.2, fearfulness: 0.2, organisation: 0.3 },
    freedom: { unconventionality: 0.5, flexibility: -0.3, inquisitiveness: 0.3, socialBoldness: 0.2 },
    thrill: { fearfulness: -0.5, prudence: -0.4, liveliness: 0.3 },
    success: { diligence: 0.4, modesty: -0.3, organisation: 0.2 },
    status: { modesty: -0.5, greedAvoidance: -0.5, socialBoldness: 0.2 },
    fairness: { fairness: 0.5, sincerity: 0.3, altruism: 0.2 },
    lovedOnes: { altruism: 0.3, sentimentality: 0.4, gentleness: 0.2 },
    fittingIn: { flexibility: 0.4, unconventionality: -0.4, socialBoldness: -0.2 },
    pleasure: { liveliness: 0.4, diligence: -0.3, prudence: -0.2 },
  };
  for (const cv of coreValues) for (const k in LEAN[cv]) if (!used.has(k)) facets[k] += LEAN[cv][k]! * 0.8;

  // If-then signatures (Mischel's situation profiles): one to three places where a person runs hotter or cooler than usual.
  // Most sharpen or soften the general trait; a minority run against it. A shift of about one standard score moves behaviour
  // without turning a patient person into an impatient one, except where the trait was mild to begin with.
  const ifThens: Person['ifThens'] = [];
  const nIf = 1 + (r.chance(0.5) ? 1 : 0) + (r.chance(0.2) ? 1 : 0);
  const pool = r.shuffle(IFTHEN_TEMPLATES);
  for (const tpl of pool) {
    if (ifThens.length >= nIf) break;
    if (ifThens.some(x => x.feature === tpl.feature && x.facet === tpl.facet)) continue;
    const base = facets[tpl.facet];
    const against = r.chance(0.3);
    const dir: 1 | -1 = against ? (base >= 0 ? -1 : 1) : base >= 0 ? 1 : -1;
    const shift = dir * (against ? 0.9 + r.next() * 0.5 : 0.5 + r.next() * 0.4);
    ifThens.push({ feature: tpl.feature, facet: tpl.facet, shift, words: tpl.words(dir) });
  }
  // Self-story: two statements from the strongest signatures and core values.
  const STORIES: { key: string; test: () => boolean; text: string }[] = [
    { key: 'kind', test: () => facets.altruism > 1, text: 'the one people come to' },
    { key: 'reliable', test: () => facets.organisation > 1, text: 'the one who holds things together' },
    { key: 'honest', test: () => facets.sincerity > 1, text: 'someone who says it straight' },
    { key: 'brave', test: () => facets.fearfulness < -1, text: 'not afraid of anything' },
    { key: 'proud', test: () => facets.modesty < -1, text: 'meant for more than this' },
    { key: 'self-reliant', test: () => facets.dependence < -1, text: 'someone who manages alone' },
    {
      key: 'rooted',
      test: () => coreValues.includes('tradition') || (facets.sentimentality > 1 && coreValues.includes('security')),
      text: `rooted in ${SETTING.name}, through and through`,
    },
    { key: 'free', test: () => coreValues.includes('freedom') || coreValues.includes('thrill'), text: 'not made for one place' },
    { key: 'steady', test: () => facets.patience > 1, text: 'the calm one' },
    { key: 'worker', test: () => facets.diligence > 1, text: 'someone who works harder than anyone' },
  ];
  const selfStory = r
    .shuffle(STORIES.filter(st => st.test()))
    .slice(0, 2)
    .map(st => ({ key: st.key, text: st.text, weight: 0.5 + r.next() * 0.5 }));

  // Aptitudes: a mild shared factor among the cognitive ones; inherited in part.
  const g = r.normal() * 0.6;
  const aptitudes: Record<string, number> = {};
  for (const a of APTITUDES) {
    const cognitive = ['reasoning', 'memory', 'language'].includes(a.id);
    let raw = (cognitive ? g : 0) + r.normal() * (cognitive ? 0.8 : 1);
    if (parents.length) raw = (0.4 * parents.reduce((s, q) => s + q.aptitudes[a.id], 0)) / parents.length + raw * 0.85;
    aptitudes[a.id] = raw;
  }

  const variability = clamp(0.7 + 0.15 * facets.anxiety - 0.1 * facets.organisation + r.normal() * 0.2, 0.3, 1.3);
  const presentation: Record<string, number> = {};
  // Low Sincerity shows a warmer, fairer face than the truth; high Anxiety shows less boldness.
  presentation.gentleness = Math.max(0, -facets.sincerity) * 0.6;
  presentation.fairness = Math.max(0, -facets.sincerity) * 0.5;
  presentation.socialBoldness = -Math.max(0, facets.anxiety) * 0.4;
  const selfBias = 0.35 * facets.socialSelfEsteem - 0.3 * facets.modesty - 0.2 * facets.anxiety;

  // Founders: a drawn childhood that fits the signatures.
  const foundingPast: string[] = [];
  if (opt.founder) {
    for (const s of signatures) {
      const pasts = PASTS.filter(p => p.facet === s.facet && p.dir === Math.sign(s.z));
      if (pasts.length && r.chance(0.8)) foundingPast.push(r.pick(pasts).text);
    }
  }

  const last = opt.last ?? parents[0]?.last ?? r.pick(SETTING.names.sur);
  // Who they are drawn to. Nobody in the world treats this as anything.
  const ar = r.next();
  const attraction: Person['attraction'] = ar < 0.88 ? (sex === 'f' ? 'm' : 'f') : ar < 0.95 ? sex : 'both';
  // Drive: how readily a want becomes a pursuit. Most people wish; a few go after things.
  const drive =
    0.5 * facets.diligence + 0.3 * facets.socialSelfEsteem - 0.3 * facets.anxiety + (0.3 * (values.success + values.freedom)) / 2 + r.normal() * 0.7;
  const p: Person = {
    id,
    first: pickName(w, r, sex),
    last,
    sex,
    born: w.t - Math.round(opt.age * 12) - r.int(0, 11),
    status: 'in',
    founder: opt.founder,
    foundingPast,
    dims,
    facets,
    variability,
    values,
    coreValues,
    aptitudes,
    constitution: r.normal(),
    reactivity: 0.4 * facets.anxiety + r.normal() * 0.8,
    health: 1,
    ill: 0,
    signatures,
    tension,
    presentation,
    selfBias,
    marks: [],
    exceptions: [],
    phase: undefined,
    ifThens,
    selfStory,
    job: null,
    lead: false,
    jobSince: 0,
    perf: 0,
    skills: {},
    partner: null,
    pstat: null,
    psince: 0,
    parents: opt.parents ?? [],
    kids: [],
    stress: 0.1 + r.next() * 0.15,
    sources: {},
    emotions: [],
    savings: 0,
    wants: [],
    events: [],
    friends: new Set(),
    retired: false,
    student: false,
    drinks: false,
    drinkSince: 0,
    lastProvoked: -99,
    lastBreak: -99,
    circle: [],
    tried: {},
    promises: [],
    secrets: [],
    attraction,
    habits: [],
    attachments: [],
    drive,
    lastHabit: -99,
    threads: [],
    group: null,
  };
  p.health = healthTarget(w, p);
  // Interest in a hobby: someone who arrives grown (their childhood happened elsewhere) brings what it gave them. A child who grows up here
  // starts with none; the inclination (aesthetic sense and ear, partly inherited) waits for something to call it out (see develop in group.ts).
  for (const sk in SETTING.skills) {
    const dealt = interestFor(p, sk, r);
    p.skills[sk] = {
      r: 1000,
      ceil: ceilingFor(p, sk),
      interest: !OFF.has('latent') && opt.age < 12 ? 0 : dealt,
    };
  }
  w.people.push(p);
  w.byId.set(id, p);
  return p;
}
export const attracted = (a: Person, b: Person) => a.attraction === 'both' || a.attraction === b.sex;

export function ceilingFor(p: Person, sk: string): number {
  const ws = SETTING.skills[sk];
  let z = 0;
  for (const a in ws) z += ws[a] * (p.aptitudes[a] ?? 0);
  return 1400 + 220 * z; // Elo-like: 1400 average ceiling, open-ended top
}
// What a grown arrival's childhood made of their inclination (or, with the latent rule off, what birth deals everyone).
function interestFor(p: Person, sk: string, r: Rng): number {
  const legacy = OFF.has('latent'); // the dealt rules, kept for the ablation
  const musical = sk === 'guitar' || sk === 'vocals';
  const z =
    (legacy ? (musical ? 0.5 * p.facets.aesthetic + 0.3 * p.aptitudes.ear : 0.3 * p.facets.inquisitiveness) : inclination(p, sk)) + r.normal() * 0.8;
  return z > 1.1 ? 2 : z > 0.2 ? 1 : 0; // none, mild, passionate
}

export function healthTarget(w: World, p: Person): number {
  const a = (w.t - p.born) / 12;
  return clamp(0.78 + 0.08 * p.constitution - Math.max(0, a - 45) * 0.009 - (p.drinks ? 0.12 : 0) - (p.stress > 0.7 ? 0.05 : 0), 0.05, 1);
}
