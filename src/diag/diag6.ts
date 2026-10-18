import { buildWorld, runYears } from '../build';
import { pickWitness, scoreAll } from '../witness';
import { fullName, year } from '../world';
const w = buildWorld(+(process.argv[2] ?? 4), 1); pickWitness(w); runYears(w, 10); scoreAll(w);
const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => w.byId.get(+id)?.first ?? '?');
let n = 0;
for (const p of w.people) { const ths = p.threads.filter(t => t.since >= w.startPresent && t.stage >= 2); if (!ths.length || n >= 3) continue; n++;
  console.log(`== ${fullName(p)}`);
  for (const th of ths) { console.log(`  thread ${th.family} ${year(th.since)}–${year(th.lastAt)} acts ${th.acts} stage ${th.stage} ${th.how ?? 'open'} · ${plain(th.source)}`); for (const i of th.events) { const e = w.events[i]; console.log(`     ${year(e.t)} ${e.w >= 1 ? '*' : ' '} ${plain(e.text)}${e.surprise != null ? ` {s ${e.surprise.toFixed(2)} e ${(e.explain ?? 0).toFixed(2)}}` : ''}`); } }
}
