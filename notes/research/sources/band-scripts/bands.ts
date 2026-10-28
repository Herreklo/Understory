// P6 research (28 Oct 2026): what groups the engine has, what state they hold, how long they last, whether any outlives its
// founders, how often rows escalate, and how close the witness is to a band. Throwaway worlds only, every system on (main at b826dec).
// Reads the world; changes nothing in the engine.
//   ./run.sh notes/research/sources/band-scripts/bands.ts A B [years] [outdir]   → <outdir>/bands-<seed>.json
// Per band (every band in the record, the 30-year past included): when it formed and ended, its founding members (the formed event's
// who), every join and leave, rows (groupstrain decisions), words, askings-to-leave, works and shows, its standing and chemistry at
// the end. Per workplace: staff at the start of the present and at its end. Per world: adults in a band, the witness's nearness to a band,
// group events per present decade, listed and not, and their commonest texts with names stripped.
import '../../../../src/tools/env';
import { mkdirSync, writeFileSync } from 'fs';
import { buildWorld } from '../../../../src/build';
import { tick } from '../../../../src/life';
import { pickWitness } from '../../../../src/witness';
import { age, live, type World } from '../../../../src/world';

const [A, B] = [Number(process.argv[2] ?? 9001), Number(process.argv[3] ?? 9001)];
const YEARS = Number(process.argv[4] ?? 10);
const OUT = process.argv[5] ?? 'out-bands';
mkdirSync(OUT, { recursive: true });
const strip = (s: string) => s.replace(/@\d+/g, '@').replace(/"[^"]*"/g, '"…"');

function runWorld(seed: number) {
  const w = buildWorld(seed, 1);
  const wit = pickWitness(w).id;
  const t0 = w.t;
  const staff0 = Object.fromEntries(
    w.places.map(pl => [
      pl.id,
      live(w)
        .filter(p => p.job === pl.id)
        .map(p => p.id),
    ]),
  );
  const lead0 = Object.fromEntries(w.places.map(pl => [pl.id, pl.lead]));
  let adultMonths = 0,
    inBandMonths = 0,
    witInBand = 0,
    witNearBand = 0;
  const social: Record<string, number[]> = {};
  for (let m = 0; m < YEARS * 12; m++) {
    tick(w);
    const L = live(w);
    for (const p of L)
      if (age(w, p) >= 18) {
        adultMonths++;
        if (p.group != null) inBandMonths++;
      }
    const q = w.byId.get(wit);
    if (q && q.status === 'in') {
      if (q.group != null) witInBand++;
      const close = [...q.friends, q.partner, ...q.parents, ...q.kids].filter(x => x != null) as number[];
      if (q.group != null || close.some(x => w.byId.get(x)?.group != null)) witNearBand++;
    }
    if (m % 12 === 11)
      for (const p of L)
        for (const h of p.habits) if (!h.broken && (h as any).kind === 'social') (social[h.id] ??= Array(YEARS).fill(0))[(m + 1) / 12 - 1]++;
  }
  const tEnd = w.t;
  const bands = w.groups.map(g => {
    const evs = g.events.map(i => w.events[i]);
    const formed = evs.find(e => e.type === 'group:formed');
    const founding = formed ? [...formed.who] : [g.founder];
    const joins = evs.filter(e => e.type === 'group:joined').map(e => ({ t: e.t, who: e.who[0] }));
    const lefts = evs.filter(e => e.type === 'group:left').map(e => ({ t: e.t, who: e.who[0] }));
    // When each founding member stopped being a member: from the record of who was in, month by month, is not kept, so from `former`
    // order and leave events; a member who left without a listed line (a row walked out) is in `former` too.
    const all = w.events.filter(
      e =>
        (e.t >= g.since && (e.decision?.trigger === 'groupstrain' || e.type.startsWith('group:')) && e.text.includes(g.name)) ||
        (e.decision?.trigger === 'groupstrain' && evs.includes(e)),
    );
    const strain = evs.filter(e => e.decision?.trigger === 'groupstrain').map(e => ({ t: e.t, who: e.who[0], ch: e.decision!.chosen }));
    return {
      id: g.id,
      since: g.since,
      ended: g.ended ?? null,
      how: g.how ?? null,
      founder: g.founder,
      founding,
      members: [...g.members],
      former: [...g.former],
      foundersLeft: founding.filter(x => g.former.includes(x)).length,
      foundersIn: founding.filter(x => g.members.includes(x)).length,
      joins,
      lefts,
      strain,
      words: evs.filter(e => e.type === 'group:word').map(e => e.t),
      asked: evs.filter(e => e.type === 'group:left' && /asked .* to go/.test(e.text)).map(e => e.t),
      works: g.works.length,
      shows: evs.filter(e => e.type === 'group:show').length,
      standing: Math.round(g.standing * 100) / 100,
      chem: Math.round(g.chem * 100) / 100,
      chemWhy: g.chemWhy.map(c => strip(c.label)),
      nAll: all.length,
    };
  });
  // Group events in the present decade: listed (on someone's page) and not.
  const present = w.events.filter(
    e => e.t >= t0 && (e.type.startsWith('group:') || e.decision?.trigger === 'groupstrain' || e.decision?.trigger === 'authorship'),
  );
  const onPage = (e: any) => e.who.some((i: number) => w.byId.get(i)?.events.includes(e.id));
  const texts: Record<string, number> = {};
  for (const e of present)
    if (onPage(e))
      texts[strip(e.text).replace(/the [A-Z][a-z]+( [A-Z][a-z]+)?|[A-Z][a-z]+ [A-Z][a-z]+/g, 'NAME')] =
        (texts[strip(e.text).replace(/the [A-Z][a-z]+( [A-Z][a-z]+)?|[A-Z][a-z]+ [A-Z][a-z]+/g, 'NAME')] ?? 0) + 1;
  const allListed = w.events.filter(e => e.t >= t0 && onPage(e)).length;
  const places = w.places.map(pl => {
    const now = live(w)
      .filter(p => p.job === pl.id)
      .map(p => p.id);
    return {
      id: pl.id,
      staff0: staff0[pl.id]?.length ?? 0,
      staffEnd: now.length,
      new: !(pl.id in staff0),
      stayed: (staff0[pl.id] ?? []).filter(x => now.includes(x)).length,
      lead0: lead0[pl.id],
      leadEnd: pl.lead,
    };
  });
  const adultsEnd = live(w).filter(p => age(w, p) >= 18).length;
  return {
    seed,
    t0,
    tEnd,
    adultsEnd,
    adultYears: adultMonths / 12,
    inBandShare: inBandMonths / adultMonths,
    witInBandYears: witInBand / 12,
    witNearBandYears: witNearBand / 12,
    social,
    bands,
    places,
    present: { n: present.length, listed: present.filter(onPage).length, allListed, texts },
  };
}

for (let s = A; s <= B; s++) {
  const r = runWorld(s);
  writeFileSync(`${OUT}/bands-${s}.json`, JSON.stringify(r));
  console.log(s, r.bands.length, 'bands', r.present.listed, 'listed band lines of', r.present.allListed);
}
