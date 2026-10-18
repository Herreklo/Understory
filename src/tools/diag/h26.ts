// Round H26: the second pass of faults in the record a reader stops trusting the page for, counted over ten present years.
//   ./run.sh src/tools/diag/h26.ts A B [rule]
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF, year } from '../../world';
import { rivalries } from '../../drama';
const A = +process.argv[2],
  B = +process.argv[3],
  rule = process.argv[4] ?? 'on';
const tot: Record<string, number> = {};
const add = (k: string, n = 1) => (tot[k] = (tot[k] ?? 0) + n);
for (let seed = A; seed <= B; seed++) {
  OFF.clear();
  if (rule !== 'on') for (const x of rule.split('+')) OFF.add(x);
  const w = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  runYears(w, 10);
  const promoted = new Map<string, number[]>(); // title → when someone got it
  for (const e of w.events) {
    if (e.type !== 'promoted') continue;
    const m = e.text.match(/became (.+?) at /);
    if (m) promoted.set(m[1], [...(promoted.get(m[1]) ?? []), e.t]);
  }
  for (const e of w.events) {
    if (e.t < t0) continue;
    const labels = e.causes.map(c => c.label);
    if (/undefined/.test(e.text) || labels.some(l => /undefined/.test(l))) add('"undefined" in the record');
    const tr = e.text.match(/after (\d+) years? of trying/);
    const since = labels.map(l => l.match(/working toward it since (\d{4})/)).find(Boolean);
    if (tr && since && +tr[1] > year(e.t) - +since[1] + 1) add('years of trying longer than the pursuit');
    if (labels.some(l => /\b(me|my)\b/.test(l))) add('a reason in the first person');
    const refs = e.causes.filter(c => /\(\d{4}\)$/.test(c.label) && c.ref != null && c.ref >= 0).map(c => c.ref);
    if (new Set(refs).size < refs.length) add('the same remembered event given twice');
    const nc = e.text.match(/Nothing had changed since (\d{4})/);
    const ts = labels.map(l => l.match(/together since (\d{4})/)).find(Boolean);
    if (nc && ts && +nc[1] < +ts[1]) add('"nothing had changed since" before "together since"');
    for (const l of labels) {
      const m = l.match(/^both after the (.+)'s job$/);
      if (!m) continue;
      const r = rivalries(w).find(r => r.title === m[1] && e.who.includes(r.a) && e.who.includes(r.b));
      if (r && (promoted.get(m[1]) ?? []).some(t => t > r.since && t < e.t)) add('"both after" a post already decided');
    }
    if (/ of in /.test(e.text)) add('"of in" in a duration');
    if (/raised the drinking|about the drinking/.test(e.text)) {
      const p = w.byId.get(e.who[0])!;
      const q = w.byId.get(e.who[1]);
      if (p.drinks && p.drinkSince <= e.t && q && !(q.drinks && q.drinkSince <= e.t)) add('the drinking raised by the one who drinks');
    }
    if (/buried (her|him)self in work/.test(e.text)) {
      const p = w.byId.get(e.who[0])!;
      const ret = p.events.map(i => w.events[i]).find(x => x.type === 'retired' && x.t <= e.t);
      if (ret) add('burying oneself in work after retiring');
    }
  }
  add('worlds');
}
OFF.clear();
console.log(`H26 faults · ${rule} · worlds ${A}-${B}`);
for (const [k, v] of Object.entries(tot)) console.log(`  ${k}: ${v}`);
