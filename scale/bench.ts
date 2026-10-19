// S0 benchmark: how the engine's cost grows with population. Reads the engine, changes nothing in src/.
//   npx tsx scale/bench.ts <adults> <seed> [pastYears] [presentMonths]
// Scales the setting's workplaces with the town (k copies of each place, k = adults / 46), builds a world,
// then times each system of the monthly tick during the present. A system's time is measured from the moment
// tick() switches to its random stream (use(w, sys)) to the next switch, so nothing in the engine is touched.
import { performance } from 'perf_hooks';
import { existsSync } from 'fs';
import { SETTING } from '../src/setting';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { live, age, type World } from '../src/world';

const ADULTS = +(process.argv[2] ?? 46),
  SEED = +(process.argv[3] ?? 1);
const PAST = +(process.argv[4] ?? 30),
  MONTHS = +(process.argv[5] ?? 12);
const k = Math.max(1, Math.round(ADULTS / 46));
const base = SETTING.places.slice();
// An engine with neighbourhoods (src/scale.ts) gives each its own workplaces; one without gets k copies of each, for the same room.
const HOODED = existsSync('src/scale.ts');
if (!HOODED) for (let i = 2; i <= k; i++) for (const pl of base) SETTING.places.push({ ...pl, id: `${pl.id}-${i}`, name: `${pl.name} ${i}` });

const NESTED = new Set(['moments']); // read inside another system without switching to it
function timeSystems(w: World) {
  const ms = new Map<string, number>();
  let cur = 'misc';
  let t0 = performance.now();
  const real = w.streams;
  w.streams = new Proxy(real, {
    get(o, key: string) {
      if (typeof key === 'string' && key in o && !NESTED.has(key)) {
        const t = performance.now();
        ms.set(cur, (ms.get(cur) ?? 0) + t - t0);
        cur = key;
        t0 = t;
      }
      return (o as any)[key];
    },
  });
  return {
    ms,
    flush() {
      const t = performance.now();
      ms.set(cur, (ms.get(cur) ?? 0) + t - t0);
      t0 = t;
    },
    restore() {
      w.streams = real;
    },
  };
}

const tb = performance.now();
const w = buildWorld(SEED, 1, PAST, ADULTS);
const buildMs = performance.now() - tb;
pickWitness(w);
const contacts = new Map<string, number>();
w.hooks.contact = (_w, _a, _b, _i, ch) => contacts.set(ch || '?', (contacts.get(ch || '?') ?? 0) + 1);
const pop0 = live(w).length;
const T = timeSystems(w);
const tp = performance.now();
runYears(w, MONTHS / 12);
T.flush();
T.restore();
const presentMs = performance.now() - tp;
const L = live(w);
const bonds = w.bonds.size;
let beliefs = 0;
for (const m of w.beliefs.values()) beliefs += (m as any).size ?? 0;
const out = {
  adults: ADULTS,
  k,
  hooded: HOODED,
  seed: SEED,
  past: PAST,
  months: MONTHS,
  people: L.length,
  pop0,
  adultsNow: L.filter(p => age(w, p) >= 18).length,
  buildMs: Math.round(buildMs),
  msPerMonth: +(presentMs / MONTHS).toFixed(2),
  bySystem: Object.fromEntries([...T.ms].map(([s, v]) => [s, +(v / MONTHS).toFixed(3)])),
  contactsPerMonth: Object.fromEntries([...contacts].map(([s, v]) => [s, Math.round(v / MONTHS)])),
  events: w.events.length,
  bonds,
  beliefs,
  heapMB: Math.round(process.memoryUsage().heapUsed / 1e6),
};
console.log(JSON.stringify(out));
