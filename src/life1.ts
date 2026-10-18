import { buildWorld, runYears } from './build';
import { pickWitness, scoreAll } from './witness';
import { fullName, year, age } from './world';
const seed = +(process.argv[2] ?? 3);
const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 10); scoreAll(w);
const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => w.byId.get(+id)?.first ?? '?');
const score = (p: any) => p.events.filter((i: number) => w.events[i].t >= w.startPresent && ['pursuit', 'follow', 'gaveup', 'bought', 'gotgood', 'habit:broke', 'belonged', 'mended', 'stayed', 'tell', 'rescue', 'froze', 'home', 'left'].includes(w.events[i].type)).length;
for (const p of w.people.filter(x => x.status !== 'dead').sort((a, b) => score(b) - score(a)).slice(0, 3)) {
  console.log(`== ${fullName(p)}, ${Math.floor(age(w, p))} · drive ${p.drive.toFixed(1)}`);
  for (const i of p.events) { const e = w.events[i]; if (e.t < w.startPresent) continue; console.log(`  ${year(e.t)}: ${plain(e.text)}${e.causes.length ? '  [' + e.causes.slice(0, 2).map(c => plain(c.label)).join('; ') + ']' : ''}`); }
}
