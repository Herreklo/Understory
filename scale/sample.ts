// One background neighbourhood, before and after it comes into focus: for the report.
//   npx tsx scale/sample.ts <adults> <seed>
// Prints its workplaces with their leaders, three residents' records as the background lived them (the spine), then promotes the
// neighbourhood and prints what promotion made of the same three people: friends, routines and marks (the texture).
import { buildWorld } from '../src/build';
import { age, type Person } from '../src/world';
import { hoods, background, hoodName } from '../src/scale';
import { promoteHood, bgPlaces } from '../src/coarse';
import { persona } from '../src/persona';
const ADULTS = +(process.argv[2] ?? 300),
  SEED = +(process.argv[3] ?? 61);
const Hguess = Math.max(2, Math.round((ADULTS * 1.6) / 80));
(globalThis as any).SCALE_FOCUS = Math.floor(Hguess / 2);
const w = buildWorld(SEED, 1, 30, ADULTS);
const F = (w as any).focus as Set<number>;
const h = [...Array(hoods(w)).keys()].find(x => !F.has(x))!;
const nm = (id: number) => {
  const p = w.byId.get(id);
  return p ? `${p.first} ${p.last}` : `#${id}`;
};
const say = (t: string) => t.replace(/@(\d+)/g, (_, d) => nm(+d));
const res = background(w).filter(p => (p as any).hood === h && p.status === 'bg');
const places = bgPlaces(w)
  .filter((pl: any) => pl.hood === h)
  .map((pl: any) => ({
    name: pl.name,
    title: pl.title,
    lead: pl.lead != null ? nm(pl.lead) : null,
    staff: res.filter(p => p.job === pl.id).length,
    cap: pl.cap,
  }));
// three residents with the fullest records: one over 60, one 35–60, one 20–35
const evs = (p: Person) =>
  p.events.map(i => w.events[i]).filter(e => e.who[0] === p.id || e.who[1] === p.id || e.type === 'death' || e.type === 'born');
const pick = (lo: number, hi: number) =>
  res.filter(p => age(w, p) >= lo && age(w, p) < hi).sort((a, b) => evs(b).length - evs(a).length || a.id - b.id)[0];
const three = [pick(60, 90), pick(35, 60), pick(20, 35)].filter(Boolean);
const record = (p: Person) =>
  evs(p)
    .filter(e => !['hired'].includes(e.type) || e.who[0] === p.id)
    .map(e => ({ year: Math.floor(e.t / 12), text: say(e.text) }));
const before = three.map(p => ({
  name: nm(p.id),
  age: Math.floor(age(w, p)),
  job: p.job ? w.placeById.get(p.job)!.name : p.retired ? 'retired' : 'no job',
  record: record(p),
}));
const prom = promoteHood(w, h);
const after = three.map(p => {
  const ps = persona(w, p);
  return {
    name: nm(p.id),
    friends: [...p.friends].map(nm),
    routines: p.habits.filter(x => !x.broken).map(x => (x as any).label ?? (x as any).id),
    marks: [...ps.sore, ...ps.fears, ...ps.rules].map(m => m.text),
    pride: ps.pride.map(x => say(x.text)),
  };
});
console.log(JSON.stringify({ seed: SEED, hood: hoodName(h), people: res.length, promoted: prom, places, before, after }, null, 1));
