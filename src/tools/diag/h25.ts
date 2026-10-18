// Round H25: faults in the record that a reader stops trusting the page for, counted over ten present years.
//   ./run.sh src/tools/diag/h25.ts A B [rule]
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF } from '../../world';
import { SETTING } from '../../setting';
const MONEY = Object.values((SETTING as any).resources as Record<string, string>);
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
  const wrote = new Map<number, number>(); // author → first work's time
  const dated = new Map<string, number>(); // pair → when they started seeing each other
  const lost = new Map<string, number>(); // pair → last time they lost touch with no line since saying they came back
  for (const e of w.events) {
    const present = e.t >= t0;
    if (/Nobody was surprised: it was the third time\.|Nobody was surprised any more\.$/.test(e.text) && present) add('repeat stamp with no years');
    if (e.type === 'group:work') {
      const a = e.who[0];
      if (/had never written one before/.test(e.text) && wrote.has(a) && present) add('first work said to be a first ever, wrongly');
      if (!wrote.has(a)) wrote.set(a, e.t);
    }
    if (e.type === 'ownup' && MONEY.some(m => e.text.includes('owned up about ' + m)) && present) add('owning up about money not taken');
    if (e.type === 'skim' && /a mistake at work/.test(e.text) && present) add('skimming with no money in it ');
    if (e.type === 'couple:pattern' && present) {
      const m = e.text.match(/Nothing had changed since (\d{4})/);
      const began = dated.get([...e.who].sort((a, b) => a - b).join('-')); // when this partnership began, as the record has it then
      if (m && began != null && +m[1] < 1996 + Math.floor(began / 12)) add("a couple's pattern dated before their partnership");
    }
    const key = [...e.who].sort((a, b) => a - b).join('-');
    if (e.type === 'dating') dated.set(key, e.t);
    if (e.who.length === 2 && ['friends', 'madeup'].includes(e.type)) lost.delete(key);
    if (e.type === 'cooled') {
      if (lost.has(key) && present) add('the same two losing touch again, with nothing between');
      lost.set(key, e.t);
    }
  }
  add('worlds');
}
OFF.clear();
console.log(`H25 faults · ${rule} · worlds ${A}-${B}`);
for (const [k, v] of Object.entries(tot)) console.log(`  ${k}: ${v}`);
