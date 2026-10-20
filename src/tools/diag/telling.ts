// Round 30's own count: told accounts (how many, how often wrong or bent) and how often an account is a decision's top reason.
//   tsx src/tools/diag/telling.ts A B [years]   (seeds A..B; OFF= and ON= are read as the other tools read them)
// Last line: TELLING {...}
import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { OFF, ON, type World } from '../../world';

for (const x of (process.env.OFF ?? '').split(',').filter(Boolean)) OFF.add(x);
for (const x of (process.env.ON ?? '').split(',').filter(Boolean)) ON.add(x);
const [a, b, yrs] = [+(process.argv[2] ?? 9001), +(process.argv[3] ?? process.argv[2] ?? 9001), +(process.argv[4] ?? 10)];

// A decision's top reason is its first keyed reason that is not an 'against' (as `decide` and `run` pick it); it passed the
// counterfactual check when the record says honest. An account is a consideration whose key is `account:<id>`.
const topOf = (e: any) => (e.causes ?? []).find((c: any) => c.key && !String(c.key).startsWith('against:'));

const out: any = {
  seeds: [a, b],
  told: [],
  perAdult: [],
  wrongShare: [],
  bentShare: [],
  secondShare: [],
  decisions: 0,
  withOther: 0,
  accountAny: 0,
  accountTop: 0,
  toldTop: 0,
  citedByChoice: 0,
  choices: 0,
  flips: 0,
  flipsCited: 0,
  sample: [] as string[],
};
for (let seed = a; seed <= b; seed++) {
  const w: World = buildWorld(seed, 1);
  pickWitness(w);
  const t0 = w.t;
  runYears(w, yrs);
  const s = (w as any).tellStats ?? { told: 0, second: 0, wrong: 0, bent: 0, hearers: {} };
  const adults = w.people.filter(p => w.t - p.born >= 18 * 12 && (p.status === 'in' || p.status === 'dead' || p.status === 'away'));
  out.told.push(s.told);
  out.perAdult.push(+(s.told / Math.max(1, adults.length)).toFixed(2));
  out.wrongShare.push(+(s.wrong / Math.max(1, s.told)).toFixed(4));
  out.bentShare.push(+(s.bent / Math.max(1, s.told)).toFixed(4));
  out.choices += s.choices ?? 0;
  out.flips += s.flips ?? 0;
  out.flipsCited += s.cited ?? 0;
  out.secondShare.push(+(s.second / Math.max(1, s.told)).toFixed(4));
  for (const e of w.events) {
    if (e.t <= t0) continue;
    const flip = (e.causes ?? []).find((c: any) => String(c.key ?? '').startsWith('account:') && c.weight === 0.3);
    if (flip) {
      out.citedByChoice++;
      if (out.sample.length < 14) out.sample.push(`flip ${e.type}: ${e.text} — [${flip.label}]`);
    }
    if (!e.decision) continue;
    out.decisions++;
    const rec: any = e.decision;
    if (e.who.length < 2) continue;
    out.withOther++;
    if ((e.causes ?? []).some((c: any) => String(c.key ?? '').startsWith('account:'))) out.accountAny++;
    const top = topOf(e);
    if (top && String(top.key).startsWith('account:') && rec.honest === true) {
      out.accountTop++;
      const told = /had heard from/.test(String(top.label));
      if (told) out.toldTop++;
      if (out.sample.length < 10) out.sample.push(`${told ? 'told' : 'done'} ${e.type}: ${e.text} — [${top.label}]`);
    }
  }
}
const med = (xs: number[]) => xs.slice().sort((p, q) => p - q)[Math.floor(xs.length / 2)];
out.perAdultMedian = med(out.perAdult);
out.flipShare = +(out.flips / Math.max(1, out.choices)).toFixed(4);
out.accountTopShare = +(out.accountTop / Math.max(1, out.withOther)).toFixed(4);
out.toldTopShare = +(out.toldTop / Math.max(1, out.withOther)).toFixed(4);
out.accountAnyShare = +(out.accountAny / Math.max(1, out.withOther)).toFixed(4);
const tot = out.told.reduce((p: number, q: number) => p + q, 0);
out.wrongAll = +(out.wrongShare.reduce((p: number, q: number, i: number) => p + q * out.told[i], 0) / Math.max(1, tot)).toFixed(4);
out.bentAll = +(out.bentShare.reduce((p: number, q: number, i: number) => p + q * out.told[i], 0) / Math.max(1, tot)).toFixed(4);
for (const l of out.sample) console.log('  ' + l);
delete out.sample;
console.log('TELLING ' + JSON.stringify(out));
