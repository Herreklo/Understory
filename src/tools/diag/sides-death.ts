// Round 46 sizing aside: deaths per arm, and the drinking and stress beside them (a throwaway tracer, not kept).
import '../env';
import { writeFileSync } from 'fs';
import { buildWorld } from '../../build';
import { tick } from '../../life';
import { age, OFF } from '../../world';
const [A, B, rule] = [+process.argv[2], +process.argv[3], process.argv[4]];
if (rule !== 'on') OFF.add(rule);
for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  const t0 = w.startPresent;
  let stressed = 0,
    drinkers = 0,
    months = 0;
  for (let m = 0; m < 120; m++) {
    tick(w);
    for (const p of w.people)
      if (p.status === 'in' && age(w, p) >= 18) {
        months++;
        if (p.stress > 0.7) stressed++;
        if (p.drinks) drinkers++;
      }
  }
  const pres = w.events.filter(e => e.t >= t0);
  const deaths = pres.filter(e => e.type === 'death');
  const out = {
    seed,
    rule,
    deaths: deaths.length,
    deathDrinker: deaths.filter(e => w.byId.get(e.who[0])?.drinks).length,
    deathAge: deaths.map(e => age(w, w.byId.get(e.who[0])!)),
    numb: pres.filter(e => e.type === 'numb').length,
    stressedShare: stressed / months,
    drinkerShare: drinkers / months,
    texts: deaths.map(e => e.text.replace(/@\d+/g, '@')),
  };
  writeFileSync(`${process.env.DEATH_OUT ?? 'out-sides-death'}/${rule}-${seed}.json`, JSON.stringify(out));
}
