import { buildWorld, runYears } from '../../build';
import { pickWitness } from '../../witness';
import { fullName, year } from '../../world';
for (let seed = 1; seed <= 20; seed++) {
  const w = buildWorld(seed, 1);
  pickWitness(w);
  runYears(w, 10);
  for (const p of w.people) {
    const sh = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent && e.type === 'shout' && e.who[0] === p.id);
    if (sh.length >= 8) {
      console.log(
        seed,
        fullName(p),
        sh.length,
        'threads',
        p.threads.map(t => `${t.family}:${t.acts}:${t.stage}:${t.how ?? 'open'}:${year(t.since)}-${year(t.lastAt)}`).join(' '),
      );
      for (const e of sh.slice(0, 12)) console.log('   ', year(e.t), e.t % 12, e.decision?.trigger, e.text.slice(0, 60));
    }
  }
}
