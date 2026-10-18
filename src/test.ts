// Batch tests for the five acceptance criteria. Run: npx tsx src/test.ts [seeds] [years]

import { buildWorld, runYears } from './build';
import { pickWitness, scoreAll, hunches, knows } from './witness';
import { live, age, fullName, year, P, type World } from './world';
import { FACET_BY_ID } from './core';

const N = +(process.argv[2] ?? 40);
const YEARS = +(process.argv[3] ?? 10);

function plain(w: World, s: string) { return s.replace(/@(\d+)/g, (_, id) => w.byId.get(+id)?.first ?? '?'); }

const agg = { seeds: 0, pop: 0, births: 0, deaths: 0, marriages: 0, splits: 0, hires: 0, fires: 0, quits: 0, left: 0, home: 0, breaks: 0, outbursts: 0, drinks: 0,
  decisions: 0, honest: 0, honestN: 0, witnessRight: 0, witnessN: 0, knownRight: 0, knownN: 0, twists: 0, lottery: 0, routine: 0, noise: 0, ktwists: 0, klottery: 0, reveals: 0, kreveals: 0, hunchN: 0, hunchRight: 0, sigShown: 0, sigN: 0, stressHi: 0, adults: 0, maxRepeat: 0, typeMax: 0, typeTotal: 0, kinds: 0, maxShare: 0, ifShown: 0, ifN: 0, wantsResolved: 0, wantsN: 0, sw: { witnessN: 0, witnessRight: 0, knownN: 0, knownRight: 0, honestN: 0, honest: 0 } };

let shareType = ''; // Situation baseline: the choice most people make in that kind of situation, learned from the other worlds.
type Dec = { world: number; trigger: string; chosen: string; guess?: string; expr?: string; exprGuess?: string; bestP: number; known: boolean; fam: string; pWit: number; nOpt: number; traitGuess?: string; circGuess?: string };
const decs: Dec[] = [];
const lotteryTypes = new Map<string, number>(); const repeatTypes = new Map<string, number>();
const r2 = { pursuits: 0, follows: 0, gaveup: 0, pushon: 0, bought: 0, gotgood: 0, mended: 0, achieved: 0, habitsBroke: 0, habitsBack: 0, habitsNew: 0, deadline: 0, newcomer: 0, asked: 0, danger: 0, criticised: 0, spotlight: 0, adults: 0, pursuing: 0, never: 0, habits: 0, kindsPerLife: 0, sameSex: 0, homeN: 0, homeTwist: 0, homeLottery: 0, ifPeople: 0, ifAny: 0, groups: 0, groupsAlive: 0, shows: 0, works: 0, splits: 0, left: 0, joined: 0, holes: 0, rows: 0, threads: 0, threadCost: 0, threadThrough: 0 };
for (let seed = 1; seed <= N; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, YEARS);
  scoreAll(w);
  const present = w.events.filter(e => e.t >= w.startPresent);
  const c = (t: string) => present.filter(e => e.type === t && e.w > 0.25).length;
  agg.seeds++;
  for (const k of ['witnessN', 'witnessRight', 'knownN', 'knownRight', 'honestN', 'honest'] as const) agg.sw[k] += w.stats[k];
  const L = live(w); agg.pop += L.length;
  const adults = L.filter(p => age(w, p) >= 18); agg.adults += adults.length;
  agg.stressHi += adults.filter(p => p.stress > 0.65).length;
  agg.births += c('born'); agg.deaths += c('death'); agg.marriages += c('married'); agg.splits += c('divorce') + c('split');
  agg.hires += c('hired'); agg.fires += c('dismiss'); agg.quits += c('walkout') + c('quitpride'); agg.left += c('left'); agg.home += c('home');
  agg.breaks += c('shout') + c('walkout') + c('shutout') + c('numb') + c('quitpride');
  agg.outbursts += c('shout'); agg.drinks += c('numb');
  for (const e of present) {
    if (e.decision && e.decision.witnessGuess) { const d = e.decision as any; decs.push({ world: seed, trigger: d.trigger.replace(/:.*$/, '').replace(/^a want.*/, 'want').replace(/^whether to go on.*/, 'go on').replace(/^@\d+ is leaving$/, 'follow'), chosen: d.chosen, guess: d.witnessGuess, expr: d.expr, exprGuess: d.exprGuess, bestP: Math.max(...d.options.map((o: any) => o.p)), known: knows(w, d.person), fam: d.chosen, pWit: d.pWitness ?? 0, nOpt: d.options.length, traitGuess: d.traitGuess, circGuess: d.circGuess }); }
    if (e.decision) { agg.decisions++; if (e.decision.honest != null) { agg.honestN++; if (e.decision.honest) agg.honest++; } if (e.decision.witnessGuess) { agg.witnessN++; const hit = e.decision.witnessGuess === e.decision.chosen; if (hit) agg.witnessRight++; const bm = w.beliefs.get(w.witness!); let n = 0; if (bm) for (const [k, b] of bm) if (k.startsWith(e.decision.person + '|') && b.n >= 2) n++; if (n >= 3) { agg.knownN++; if (hit) agg.knownRight++; } } }
    if (e.surprise != null && e.w >= 1) {
      const hiS = e.surprise > 0.5, hiE = (e.explain ?? 0) > 0.5;
      if (hiS && hiE) agg.twists++; else if (hiS && (e as any).reveal) agg.reveals++; else if (hiS) { agg.lottery++; lotteryTypes.set(e.type, (lotteryTypes.get(e.type) ?? 0) + 1); } else if (hiE) agg.routine++; else agg.noise++;
      if (knows(w, e.who[0])) { if (hiS && hiE) agg.ktwists++; else if (hiS && (e as any).reveal) agg.kreveals++; else if (hiS) agg.klottery++; }
    }
  }
  // Distinct people: does each signature trait appear as evidence in that person's own events?
  for (const p of adults) {
    for (const s of p.signatures) { agg.sigN++; if (p.events.some(i => w.events[i].t >= w.startPresent && w.events[i].evidence.some(x => x.subject === p.id && x.key === s.facet))) agg.sigShown++; }
    const seen = new Map<string, number>(); for (const i of p.events) { const e = w.events[i]; if (e.t >= w.startPresent && e.who[0] === p.id && !['tell', 'everyday', 'noticed', 'table', 'habit:broke', 'habit:back', 'ill'].includes(e.type)) { const key = e.type + '|' + e.who.slice(1).sort().join(','); seen.set(key, (seen.get(key) ?? 0) + 1); } }
    for (const [k, n] of seen) { if (n > agg.maxRepeat) { agg.maxRepeat = n; } if (n >= 5) repeatTypes.set(k.split('|')[0], Math.max(repeatTypes.get(k.split('|')[0]) ?? 0, n)); }
    for (const x of p.wants) { if (x.since >= w.startPresent) { agg.wantsN++; if (x.done) agg.wantsResolved++; } }
    const h = hunches(w, p); agg.hunchN += h.length; agg.hunchRight += h.filter(x => x.right).length;
  }
  const types = new Map<string, number>(); for (const e of present) types.set(e.type, (types.get(e.type) ?? 0) + 1);
  agg.kinds += types.size;
  for (const p of adults) { const m = new Map<string, number>(); let n = 0; for (const i of p.events) { const e = w.events[i]; if (e.t >= w.startPresent) { m.set(e.type, (m.get(e.type) ?? 0) + 1); n++; } } if (n >= 8) for (const [k, v] of m) { if (v / n > agg.maxShare) { agg.maxShare = v / n; shareType = k; } }
    let anyIf = false; for (const it of p.ifThens) { agg.ifN++; if (p.events.some(i => { const e = w.events[i]; return e.t >= w.startPresent && e.causes.some(c => c.label === it.words); })) { agg.ifShown++; anyIf = true; } } r2.ifPeople++; if (anyIf) r2.ifAny++; }
  agg.typeTotal += present.length; agg.typeMax += Math.max(...types.values());
  // Round 2: pursuits, habits, attachments.
  r2.pursuits += c('pursuit'); r2.follows += c('follow'); r2.gaveup += c('gaveup'); r2.pushon += c('pushon'); r2.bought += c('bought'); r2.gotgood += c('gotgood'); r2.mended += c('mended');
  r2.achieved += present.filter(e => e.type === 'want:achieved' && /got there/.test(e.text)).length;
  r2.habitsBroke += c('habit:broke'); r2.habitsBack += c('habit:back'); r2.habitsNew += c('habit:new');
  r2.groups += w.groups.filter(g => g.since >= w.startPresent).length; r2.groupsAlive += w.groups.filter(g => !g.ended).length; r2.shows += c('group:show'); r2.works += c('group:work'); r2.splits += c('group:split'); r2.left += c('group:left'); r2.joined += c('group:joined'); r2.holes += c('group:hole'); r2.rows += c('group:creditrow') + present.filter(e => e.type === 'resentsong' || e.type === 'claimsong').length; r2.threads += c('thread:pattern'); r2.threadCost += c('thread:cost'); r2.threadThrough += c('thread:through');
  r2.deadline += c('deliver') + c('allnighter') + c('late'); r2.newcomer += c('welcome') + c('coolto'); r2.asked += c('straighttalk') + c('flatter'); r2.danger += c('rescue') + c('froze'); r2.criticised += present.filter(e => e.decision?.trigger === 'criticised').length; r2.spotlight += c('rose') + present.filter(e => e.type === 'froze' && !e.decision).length;
  for (const p of adults) { r2.adults++; if (p.wants.some(x => !x.done && x.pursuit && !x.pursuit.owner)) r2.pursuing++; if (!p.wants.some(x => x.pursuit)) r2.never++; r2.habits += p.habits.filter(h => !h.broken).length; const kinds = new Set(p.events.filter(i => w.events[i].t >= w.startPresent).map(i => w.events[i].type)); r2.kindsPerLife += kinds.size; }
  for (const p of live(w)) if (p.partner != null && p.id < p.partner && P(w, p.partner).sex === p.sex) r2.sameSex++;
  const homeEv = present.filter(e => e.type === 'home'); r2.homeN += homeEv.length; r2.homeTwist += homeEv.filter(e => e.surprise != null && e.surprise > 0.5 && (e.explain ?? 0) > 0.5).length; r2.homeLottery += homeEv.filter(e => e.surprise != null && e.surprise > 0.5 && (e.explain ?? 0) <= 0.5).length;

  if (seed === 1) {
    console.log(`\n=== Seed 1, ${year(w.startPresent)}–${year(w.t)} · witness: ${fullName(w.byId.get(w.witness!)!)} ===`);
    const score = (p: any) => p.events.reduce((s: number, i: number) => s + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
    for (const p of w.people.slice().sort((a, b) => score(b) - score(a)).slice(0, 4)) {
      console.log(`\n-- ${fullName(p)}, ${Math.floor(age(w, p))} · ${p.signatures.map(s => FACET_BY_ID[s.facet].name + (s.z > 0 ? '+' : '-')).join(', ')}${p.tension ? ' · ' + p.tension.label : ''}`);
      for (const i of p.events) { const e = w.events[i]; if (e.t < w.startPresent - 60) continue; console.log(`  ${year(e.t)}: ${plain(w, e.text)}${e.causes.length ? '  [' + e.causes.slice(0, 3).map(c => plain(w, c.label)).join('; ') + ']' : ''}${e.surprise != null ? `  {s ${e.surprise.toFixed(2)} e ${(e.explain ?? 0).toFixed(2)}}` : ''}`); }
    }
    const types2 = [...types].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ');
    console.log('\nevent types:', types2);
  }
}
const d = YEARS / 10, s = agg.seeds;
console.log(`\n=== ${s} worlds × ${YEARS} years (per decade per world) ===`);
console.log(`pop ${(agg.pop / s).toFixed(0)} · adults ${(agg.adults / s).toFixed(0)} · stressed ${(100 * agg.stressHi / agg.adults).toFixed(0)}%`);
console.log(`births ${(agg.births / s / d).toFixed(1)} · deaths ${(agg.deaths / s / d).toFixed(1)} · marriages ${(agg.marriages / s / d).toFixed(1)} · splits ${(agg.splits / s / d).toFixed(1)}`);
console.log(`hires ${(agg.hires / s / d).toFixed(1)} · fires ${(agg.fires / s / d).toFixed(1)} · quits ${(agg.quits / s / d).toFixed(1)} · left ${(agg.left / s / d).toFixed(1)} · home ${(agg.home / s / d).toFixed(1)}`);
console.log(`breaking points ${(agg.breaks / s / d).toFixed(1)} (outbursts ${(agg.outbursts / s / d).toFixed(1)}, drink ${(agg.drinks / s / d).toFixed(1)})`);
console.log(`1 distinct: signatures shown ${(100 * agg.sigShown / agg.sigN).toFixed(0)}% · if-thens shown ${(100 * agg.ifShown / Math.max(1, agg.ifN)).toFixed(0)}% (people with at least one shown ${(100 * r2.ifAny / Math.max(1, r2.ifPeople)).toFixed(0)}%) · event kinds per world ${(agg.kinds / s).toFixed(0)} · worst same-type share of a life ${(100 * agg.maxShare).toFixed(0)}% (${shareType}) · max same act to same people ${agg.maxRepeat} · dominant type ${(100 * agg.typeMax / agg.typeTotal).toFixed(0)}%`);
console.log(`3 predictable (all decisions): witness right ${(100 * agg.sw.witnessRight / Math.max(1, agg.sw.witnessN)).toFixed(0)}% (${agg.sw.witnessN}) · for people they know ${(100 * agg.sw.knownRight / Math.max(1, agg.sw.knownN)).toFixed(0)}% (${agg.sw.knownN}) · hunches right ${(100 * agg.hunchRight / Math.max(1, agg.hunchN)).toFixed(0)}% (${(agg.hunchN / s).toFixed(1)} per world)`);
console.log(`4 twists: twists ${(agg.twists / s / d).toFixed(1)} · reveals ${(agg.reveals / s / d).toFixed(1)} · lottery ${(agg.lottery / s / d).toFixed(1)} · routine ${(agg.routine / s / d).toFixed(1)} · noise ${(agg.noise / s / d).toFixed(1)} · among people the witness knows: twists ${(agg.ktwists / s / d).toFixed(1)} · reveals ${(agg.kreveals / s / d).toFixed(1)} · lottery ${(agg.klottery / s / d).toFixed(1)}`);
console.log(`5 honest whys (all decisions): ${(100 * agg.sw.honest / Math.max(1, agg.sw.honestN)).toFixed(0)}% of ${agg.sw.honestN} · wants resolved ${(100 * agg.wantsResolved / Math.max(1, agg.wantsN)).toFixed(0)}% of ${(agg.wantsN / s).toFixed(1)} per world`);
// Character lift: witness accuracy over the situation baseline, where it should matter (contested decisions, people known well).
{
  const counts = new Map<string, Map<string, number>>(); // trigger|world -> chosen -> n
  for (const x of decs) { const k = x.trigger + '|' + x.world; const m = counts.get(k) ?? new Map(); counts.set(k, m); m.set(x.chosen, (m.get(x.chosen) ?? 0) + 1); }
  const modal = (trigger: string, notWorld: number) => { const tot = new Map<string, number>(); for (const [k, m] of counts) { const [t, wv] = k.split('|'); if (t !== trigger || +wv === notWorld) continue; for (const [c, n] of m) tot.set(c, (tot.get(c) ?? 0) + n); } let best = '', bn = -1; for (const [c, n] of tot) if (n > bn) { bn = n; best = c; } return best; };
  const exprCounts = new Map<string, Map<string, number>>(); for (const x of decs) if (x.expr) { const m = exprCounts.get(x.fam) ?? new Map(); exprCounts.set(x.fam, m); m.set(x.expr, (m.get(x.expr) ?? 0) + 1); }
  const modalExpr = (fam: string) => { let best = '', bn = -1; for (const [c, n] of exprCounts.get(fam) ?? []) if (n > bn) { bn = n; best = c; } return best; };
  // Held out: the baseline is learned on the other worlds (leave-one-out), never on the world it is scored on.
  // Brier: the witness is scored on the probability it gave the actual choice (lower is better; a coin flip on 2 options is 0.25).
  const baseP = (x: Dec) => { const tot = new Map<string, number>(); let all = 0; for (const [k, m] of counts) { const [t, wv] = k.split('|'); if (t !== x.trigger || +wv === x.world) continue; for (const [c, n] of m) { tot.set(c, (tot.get(c) ?? 0) + n); all += n; } } return all ? (tot.get(x.chosen) ?? 0) / all : 1 / x.nOpt; };
  const row = (label: string, xs: Dec[]) => { const n = xs.length || 1; const base = xs.filter(x => modal(x.trigger, x.world) === x.chosen).length / n; const wit = xs.filter(x => x.guess === x.chosen).length / n; const ceil = xs.reduce((a, x) => a + x.bestP, 0) / n; const brierB = xs.reduce((a, x) => a + (1 - baseP(x)) ** 2, 0) / n; const brierW = xs.reduce((a, x) => a + (1 - x.pWit) ** 2, 0) / n; const ex = xs.filter(x => x.expr && x.exprGuess); const exBase = ex.filter(x => modalExpr(x.fam) === x.expr).length / (ex.length || 1); const exWit = ex.filter(x => x.exprGuess === x.expr).length / (ex.length || 1); const tr = xs.filter(x => x.traitGuess === x.chosen).length / n, ci = xs.filter(x => x.circGuess === x.chosen).length / n; return `${label.padEnd(30)} n ${String(xs.length).padStart(5)} · baseline ${(100 * base).toFixed(0)}% · witness ${(100 * wit).toFixed(0)}% · lift ${(100 * (wit - base)).toFixed(0).padStart(3)} · ceiling ${(100 * ceil).toFixed(0)}% (traits only ${(100 * tr).toFixed(0)}%, circumstances only ${(100 * ci).toFixed(0)}%) · Brier base ${brierB.toFixed(3)} witness ${brierW.toFixed(3)} · expression: base ${(100 * exBase).toFixed(0)}% witness ${(100 * exWit).toFixed(0)}% (${ex.length})`; };
  console.log('6 CHARACTER LIFT (the premise: knowing the person beats knowing the situation)');
      console.log(row('all decisions', decs));
  const contested = decs.filter(x => x.bestP < 0.9);
  console.log(row('contested (best option < 90%)', contested));
  console.log(row('contested, people known well', contested.filter(x => x.known)));
  console.log(row('contested, strangers', contested.filter(x => !x.known)));
}
const f = (x: number) => (x / s / d).toFixed(1);
console.log(`R2 pursuits: started ${f(r2.pursuits)} · followed ${f(r2.follows)} · got there ${f(r2.achieved)} (bought ${f(r2.bought)}, got good ${f(r2.gotgood)}, mended ${f(r2.mended)}) · gave up ${f(r2.gaveup)} · pushed on ${f(r2.pushon)} · adults pursuing now ${(100 * r2.pursuing / r2.adults).toFixed(0)}% · never pursued anything ${(100 * r2.never / r2.adults).toFixed(0)}%`);
console.log(`R2 habits: per adult ${(r2.habits / r2.adults).toFixed(1)} · broke ${f(r2.habitsBroke)} · back ${f(r2.habitsBack)} · new ${f(r2.habitsNew)} · kinds per life ${(r2.kindsPerLife / r2.adults).toFixed(1)}`);
console.log(`R2 features: deadlines ${f(r2.deadline)} · newcomers met ${f(r2.newcomer)} · asked ${f(r2.asked)} · danger ${f(r2.danger)} · criticised ${f(r2.criticised)} · spotlight ${f(r2.spotlight)} · same-sex couples per world ${(r2.sameSex / s).toFixed(1)}`);
console.log(`R3 groups: formed ${f(r2.groups)} · alive at end ${(r2.groupsAlive / s).toFixed(1)} · works ${f(r2.works)} · shows ${f(r2.shows)} · left ${f(r2.left)} · joined ${f(r2.joined)} · holes ${f(r2.holes)} · credit rows ${f(r2.rows)} · split ${f(r2.splits)}`);
console.log(`R3 threads: patterns ${f(r2.threads)} · costs ${f(r2.threadCost)} · came through ${f(r2.threadThrough)}`);
console.log(`R2 homecomings: ${f(r2.homeN)} per decade · twists ${r2.homeTwist} · lottery ${r2.homeLottery} (all worlds)`);
console.log(`lottery by type: ${[...lotteryTypes].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`same act to same people ≥5: ${[...repeatTypes].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${v}`).join(', ')}`);
