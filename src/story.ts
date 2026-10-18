// Is a life worth reading? Measures of story, per adult who lived in town through ten present years.
//   tsx src/story.ts run A B <rule> → out-story/<rule>-A-B.json ; tsx src/story.ts report <ruleA> <ruleB>
// rule: 'on' (default model) or an OFF switch name (e.g. 'drama').
// - weighty events: events the person is the subject of, weight ≥ 0.8, not routine texture (everyday, noticed, kitchen table, habits)
// - dead life: fewer than five weighty events in ten years
// - callbacks: weighty events whose causes point back to an earlier event this person was part of, or to a want or rivalry of theirs
// - repeats: weighty events of a type the person already had in the window
// - rivals: adults in at least one rivalry with a named person
// - arcs: wants or rivalries that met an obstacle and reached an outcome in the window (want achieved/failed/abandoned after a setback, passed over, rebuff, or a rival's move; rivalry resolved)
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { buildWorld, runYears } from './build';
import { pickWitness } from './witness';
import { OFF, live, age, type World, type Person } from './world';
const OUT = process.env.STORY_OUT ?? 'out-story'; mkdirSync(OUT, { recursive: true });
const TEXTURE = new Set(['everyday', 'noticed', 'table', 'habit:new', 'habit:broke', 'habit:back', 'tell', 'ill']);
type R = { n: number; dead: number; weighty: number[]; callbacks: number; weightyN: number; repeats: number; rivals: number; arcs: number[]; types: number[]; townTypes: number; triggers: Record<string, number>; soreActs?: number; ruleActs?: number; humour?: number };
function measure(w: World, t0: number, ids: Set<number>): R {
  const ps = live(w).filter(p => ids.has(p.id) && age(w, p) >= 25);
  const rivals = new Set<number>(); for (const r of ((w as any).rivalries ?? []) as any[]) if (r.since >= t0 || !r.over || r.over >= t0) { rivals.add(r.a); rivals.add(r.b); }
  let callbacks = 0, weightyN = 0, repeats = 0, dead = 0; const weighty: number[] = [], arcs: number[] = [], types: number[] = [];
  for (const p of ps) {
    const ev = p.events.map(i => w.events[i]).filter(e => e.t >= t0 && e.who[0] === p.id && e.w >= 0.8 && !TEXTURE.has(e.type));
    weighty.push(ev.length); if (ev.length < 5) dead++;
    const seen = new Set<string>(); const mine = new Set(p.events);
    for (const e of ev) { weightyN++; if (seen.has(e.type)) repeats++; seen.add(e.type);
      if (e.causes.some(c => (c.kind === 'event' && c.ref != null && c.ref < e.id && mine.has(c.ref) && w.events[c.ref].who.includes(p.id) && w.events[c.ref].type !== e.type) || c.kind === 'want' || (c as any).rivalry)) callbacks++; }
    types.push(seen.size);
    let a = 0; const obstacle = (x: any) => ev.some(e => ['setback', 'passed', 'rebuffed', 'pushon', 'undermined', 'scheme:found'].includes(e.type));
    for (const x of p.wants) if (x.done && x.since >= t0 - 24 && x.pursuit && x.doneAt != null && w.events[x.doneAt]?.t >= t0 && ((x.pursuit.setbacks ?? 0) > 0 || obstacle(x))) a++;
    for (const r of ((w as any).rivalries ?? []) as any[]) if ((r.a === p.id || r.b === p.id) && r.over && r.over >= t0) a++;
    // From round 18: a plan of one's own that met a refusal or an objection and came to an end in the window is an arc too.
    for (const pr of ((w as any).projects ?? []) as any[]) if (pr.owner === p.id && pr.ended != null && pr.ended >= t0 && (pr.asked.length > pr.helpers.length + ((pr.backers ?? []).length) || pr.opponents.length || pr.council === 'no')) a++;
    arcs.push(a);
  }
  const triggers: Record<string, number> = {}; for (const e of w.events) if (e.t >= t0 && e.decision) { const k = String((e.decision as any).trigger ?? e.type).replace(/:.*$/, ''); triggers[k] = (triggers[k] ?? 0) + 1; }
  const SORE = /^(touchy about being passed over|slow to trust anyone at work|cannot bear being shown up|afraid of being out of work|afraid of being left|has not trusted (him|her)self in a crisis|lost a parent young)/;
  const RULE = /that is who .* is: (never asks anyone for anything|says things to your face, after|does everything (her|him)self now|never turns anyone away, because)/;
  const pres = w.events.filter(e => e.t >= t0);
  const soreActs = pres.filter(e => e.causes.some(c => SORE.test(c.label))).length, ruleActs = pres.filter(e => e.causes.some(c => RULE.test(c.label.replace(/@\d+/g, 'X')))).length;
  return { soreActs, ruleActs, humour: pres.filter(e => e.type === 'humour').length, n: ps.length, dead, weighty, callbacks, weightyN, repeats, rivals: ps.filter(p => rivals.has(p.id)).length, arcs, types, townTypes: new Set(w.events.filter(e => e.t >= t0 && e.w >= 0.8 && !TEXTURE.has(e.type)).map(e => e.type)).size, triggers };
}
if (process.argv[2] === 'run') {
  const A = +process.argv[3], B = +process.argv[4], rule = process.argv[5] ?? 'on'; const out: { seed: number; r: R }[] = [];
  for (let seed = A; seed <= B; seed++) { OFF.clear(); if (rule !== 'on') OFF.add(rule); const w = buildWorld(seed, 1); pickWitness(w); const t0 = w.t; const ids = new Set(live(w).map(p => p.id)); runYears(w, 10); out.push({ seed, r: measure(w, t0, ids) }); OFF.clear(); console.error(`story ${rule}: world ${seed}`); }
  writeFileSync(`${OUT}/${rule}-${A}-${B}.json`, JSON.stringify(out));
} else {
  const load = (rule: string) => { const m = new Map<number, R>(); for (const f of readdirSync(OUT).filter(f => f.startsWith(rule + '-'))) for (const x of JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8'))) m.set(x.seed, x.r); return m; };
  const rules = process.argv.slice(3).length ? process.argv.slice(3) : ['on']; const ms = rules.map(load); const seeds = [...ms[0].keys()].filter(s => ms.every(m => m.has(s))).sort((a, b) => a - b);
  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  const T = (n: number) => [0, 12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.20, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.10, 2.09, 2.09][n - 1] ?? 2.05;
  const ci = (v: number[], d = 2) => { const m = mean(v); const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length - 1)); return `${m.toFixed(d)} ±${(T(v.length) * sd / Math.sqrt(v.length)).toFixed(d)}`; };
  console.log(`${seeds.length} worlds · adults (25+) present through ten years · ${rules.join(' / ')}`);
  const row = (name: string, f: (r: R) => number, d = 2) => console.log(`  ${name.padEnd(56)}${ms.map(m => ci(seeds.map(s => f(m.get(s)!)), d).padStart(18)).join('')}`);
  row('dead lives (fewer than 5 weighty events in 10 years)', r => r.dead / r.n);
  row('weighty events per life, median', r => { const v = r.weighty.slice().sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; }, 1);
  row('callbacks: share of weighty events tied to own past', r => r.callbacks / Math.max(1, r.weightyN));
  row('repeats: share of weighty events of a type already had', r => r.repeats / Math.max(1, r.weightyN));
  row('distinct kinds of weighty event per life', r => mean(r.types), 1);
  row('adults with a named rival', r => r.rivals / r.n);
  row('arcs per adult (obstacle and outcome in the window)', r => mean(r.arcs));
  row('adults with at least one arc', r => r.arcs.filter(x => x > 0).length / r.n);
  row('kinds of weighty event in the town', r => r.townTypes, 0);
  row('acts giving a sore spot or fear as a reason, per world', r => r.soreActs ?? 0, 1);
  row('acts giving a rule to live by as a reason, per world', r => r.ruleActs ?? 0, 1);
  row('moments of humour, per world', r => r.humour ?? 0, 1);
  for (const [i, m] of ms.entries()) { const tr: Record<string, number> = {}; for (const s of seeds) for (const [k, n] of Object.entries(m.get(s)!.triggers)) tr[k] = (tr[k] ?? 0) + n; const tot = Object.values(tr).reduce((a, b) => a + b, 0); const ent = -Object.values(tr).reduce((a, n) => a + (n / tot) * Math.log2(n / tot), 0); console.log(`  ${rules[i]}: ${Object.keys(tr).length} kinds of decision, entropy ${ent.toFixed(2)} bits; top: ${Object.entries(tr).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${k} ${(100 * n / tot).toFixed(0)}%`).join(' · ')}`); }
}
