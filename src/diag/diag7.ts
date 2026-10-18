import { buildWorld, runYears } from '../build';
import { pickWitness } from '../witness';
import { fullName, year } from '../world';
for (let seed = 1; seed <= 6; seed++) {
  const w = buildWorld(seed, 1); pickWitness(w); runYears(w, 10);
  const plain = (s: string) => s.replace(/@(\d+)/g, (_, id) => w.byId.get(+id)?.first ?? '?');
  for (const g of w.groups) {
    const evs = g.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent && e.w > 0.25);
    console.log(`seed ${seed} ${g.name} ${year(g.since)}${g.ended ? '–' + year(g.ended) + ' (' + g.how + ')' : ''} members ${g.members.length} former ${g.former.length} works ${g.works.length} chem ${g.chem.toFixed(2)} standing ${g.standing.toFixed(2)} · logged events in present: ${evs.length}`);
    const byType: Record<string, number> = {}; for (const e of evs) byType[e.type] = (byType[e.type] ?? 0) + 1; console.log('   ', JSON.stringify(byType));
    for (const e of evs.slice(0, 14)) console.log('   ', year(e.t), plain(e.text));
  }
}
