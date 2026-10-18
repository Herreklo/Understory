// Ablations: switch one system off at a time. A system that changes nothing measurable is weight without behaviour.
import { buildWorld, runYears } from './build';
import { pickWitness, scoreAll } from './witness';
import { OFF } from './world';
import { measure, avg, fmt } from './measure';
const N = +(process.argv[2] ?? 8), YEARS = +(process.argv[3] ?? 10);
const systems = ['none', 'ifthens', 'selfstory', 'threads', 'pursuits', 'habits', 'everyday', 'bias', 'attach', 'groups'];
for (const sys of systems) {
  OFF.clear(); if (sys !== 'none') OFF.add(sys);
  const ms = []; for (let seed = 1; seed <= N; seed++) { const w = buildWorld(seed, 1); pickWitness(w); runYears(w, YEARS); scoreAll(w); ms.push(measure(w)); }
  console.log(`${('off: ' + sys).padEnd(16)} ${fmt(avg(ms))}`);
}
