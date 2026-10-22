// Environment audit (research, 22 Oct 2026): run throwaway worlds and dump what the engine already does with weather, storms and
// shared conditions. Reads the world only; changes nothing in the engine. One JSONL file per seed.
//   ./run.sh notes/research/sources/environment-scripts/dump.ts A B [years] [outdir]
// Per present event: id, t, type, who, cited causes, weight, visibility, trigger, whether the witness knows it, how many know it.
// Per world: population at the start and end, harbour workers each month (who a storm can reach), and at the end, for every living
// adult, the lines of their portrait (describe) that name weather, a storm, snow, frost or a power cut.
import '../../../../src/tools/env';
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { pickWitness } from '../../../../src/witness';
import { live } from '../../../../src/world';
import { describe } from '../../../../src/persona';
import { SETTING } from '../../../../src/setting';

const [A, B] = [Number(process.argv[2] ?? 9001), Number(process.argv[3] ?? 9001)];
const years = Number(process.argv[4] ?? 8);
const out = process.argv[5] ?? 'out-environment';
const WEATHER = /weather|storm|snow|frost|power cut|gale|rain|winter|wave/i;
mkdirSync(out, { recursive: true });
for (let seed = A; seed <= B; seed++) {
  const w = buildWorld(seed, 1);
  const wit = pickWitness(w);
  const t0 = w.t;
  const pop0 = live(w).length;
  const harbour: number[] = [];
  for (let i = 0; i < years * 12; i++) {
    tick(w);
    harbour.push(live(w).filter(p => p.job != null && (p.job === SETTING.risk.place || (w.placeById.get(p.job) as any)?.type === SETTING.risk.place)).length);
  }
  const rows = w.events
    .filter(e => e.t >= t0)
    .map(e => {
      const d: any = e.decision;
      return {
        id: e.id,
        t: e.t - t0,
        ty: e.type,
        who: e.who,
        c: e.causes.filter(c => c.ref != null && c.ref >= 0).map(c => c.ref),
        w: e.w,
        vis: e.vis,
        tr: d?.trigger ?? null,
        kw: e.knownBy.has(wit.id) || e.who.includes(wit.id) ? 1 : 0,
        kn: e.knownBy.size,
        tx: /storm|weather|wave|snow/i.test(e.text) ? e.text : undefined,
      };
    });
  const adults = live(w).filter(p => w.t - p.born >= 18 * 12);
  const portraits = adults.map(p => ({ id: p.id, lines: describe(w, p).filter(l => WEATHER.test(l)) }));
  // Who a shared hardship would find most exposed, at the end (Semenza 1996: living alone, not leaving home, illness): adults 75 and
  // over, adults ill this month, adults living alone (no partner in town, no child under 20 in town, not themselves under 20 with a
  // parent), adults with no friend, and those both living alone and friendless.
  const inTown = (id: number | null | undefined) => id != null && w.byId.get(id)?.status === 'in';
  const yrs = (q: any) => (w.t - q.born) / 12;
  const alone = adults.filter(p => !inTown(p.partner) && !p.kids.some(k => inTown(k) && yrs(w.byId.get(k)) < 20));
  const exposed = {
    old: adults.filter(p => yrs(p) >= 75).length,
    ill: adults.filter(p => p.ill > 0).length,
    alone: alone.length,
    friendless: adults.filter(p => !p.friends?.size).length,
    aloneFriendless: alone.filter(p => !p.friends?.size).length,
    aloneOld: alone.filter(p => yrs(p) >= 75).length,
    oldOrIll: adults.filter(p => yrs(p) >= 75 || p.ill > 0).length, // the set a power cut or a hard winter would expose
  };
  const meta = { seed, t0, months: years * 12, pop0, pop: live(w).length, adults: adults.length, wit: wit.id, harbour, exposed, portraits: portraits.filter(x => x.lines.length) };
  writeFileSync(`${out}/${seed}.jsonl`, JSON.stringify(meta) + '\n' + rows.map(r => JSON.stringify(r)).join('\n') + '\n');
  console.log(seed, rows.length, 'events', meta.pop, 'people', 'weather portraits', meta.portraits.length);
}
