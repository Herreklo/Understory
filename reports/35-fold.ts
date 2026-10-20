// Round 35, withdrawn before its test: how much the registered fold (and wider ones) would shorten a page, on throwaway worlds.
//   npx tsx reports/35-fold.ts 9001 9008   (the three most eventful adults of each world, as the reading picks them)
// base: the page today. pre: rules 1 and 3 (bystanders, friendships made and lost with nothing between). type3: rule 2 as
// registered (routine of one kind and part within three years). type5, typeDec: five years, the whole ten. textDec: the same words
// apart from names, years and titles, over the ten years.
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { age, nameOf, year, type World, type Event, type Person } from '../src/world';
import { pageLines } from '../src/page';
const UP = new Set([
  'group:show',
  'group:work',
  'night:good',
  'night:bad',
  'pitchin',
  'notthetime',
  'putin',
  'notthemoney',
  'chipin',
  'quietgive',
  'token',
  'nowallet',
  'everyday',
  'tell',
  'noticed',
  'habit:back',
  'council:yes',
  'plan',
]);
const up = (t: string) => UP.has(t) || t.startsWith('harbour:');
const PART = new Set(['group:show', 'group:formed', 'group:split', 'night:good', 'night:bad']);
const role = (e: Event, id: number) => (PART.has(e.type) ? 'P' : e.who[0] === id ? 'A' : e.who[1] === id ? 'T' : 'o');
const MARK = / (It had happened before, in \d{4}\.|It was not the first time\.|It was the third time[^.]*\.|Nobody was surprised any more[^.]*\.)$/;
const mask = (s: string) =>
  s
    .replace(MARK, '')
    .replace(/@\d+(?:'s)?/g, '@')
    .replace(/\b(19|20)\d{2}\b/g, 'Y')
    .replace(/"[^"]*"/g, '"…"');
const [s0, s1, show] = process.argv.slice(2).map(Number);
const V: Record<string, { key: (e: Event, id: number) => string | null; win: number }> = {
  type3: { key: (e, id) => (up(e.type) ? e.type + role(e, id) : null), win: 36 },
  typeDec: { key: (e, id) => (up(e.type) ? e.type + role(e, id) : null), win: 999 },
  textDec: { key: (e, id) => (up(e.type) ? e.type + role(e, id) + mask(e.text) : null), win: 999 },
  type5: { key: (e, id) => (up(e.type) ? e.type + role(e, id) : null), win: 60 },
};
const tot: Record<string, number> = { base: 0, pre: 0 };
let lives = 0;
for (let s = s0; s <= s1; s++) {
  const w: World = buildWorld(s, 1);
  pickWitness(w);
  runYears(w, 10);
  const score = (p: Person) => p.events.reduce((t, i) => t + (w.events[i].t >= w.startPresent ? w.events[i].w : 0), 0);
  const ps = w.people
    .filter(p => p.status !== 'dead' && age(w, p) >= 18)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);
  for (const p of ps) {
    lives++;
    const plain = (x: string) => x.replace(/@(\d+)/g, (_, id) => nameOf(w, +id));
    const evs = p.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
    tot.base += pageLines(w, evs, new Set(p.events)).length;
    const e1 = evs.filter(e => role(e, p.id) !== 'o' || e.w >= 1.5);
    const drop = new Set<number>();
    for (let i = 0; i < e1.length; i++) {
      const f = e1[i];
      if (f.type !== 'friends' && f.type !== 'madeup') continue;
      const o = f.who.find(x => x !== p.id)!;
      for (let j = i + 1; j < e1.length; j++) {
        const g = e1[j];
        if (!g.who.includes(o)) continue;
        if (g.type === 'cooled') drop.add(f.id).add(g.id);
        break;
      }
    }
    const e3 = e1.filter(e => !drop.has(e.id));
    tot.pre += e3.length;
    for (const [lab, v] of Object.entries(V)) {
      const anchor = new Map<string, { t: number; n: number; last: number; line: string[] }>();
      const out: string[][] = [];
      for (const e of e3) {
        const k = v.key(e, p.id);
        const a = k != null ? anchor.get(k) : undefined;
        if (a && e.t - a.t < v.win) {
          a.n++;
          a.last = e.t;
          continue;
        }
        const line = [`${year(e.t)}: ${plain(e.text)}`];
        out.push(line);
        if (k != null) anchor.set(k, { t: e.t, n: 0, last: e.t, line });
      }
      for (const a of anchor.values())
        if (a.n) a.line.push(`   (much the same ${a.n === 1 ? 'once more' : a.n + ' more times'}, to ${year(a.last)})`);
      tot[lab] = (tot[lab] ?? 0) + out.length;
      if (show && lab === 'textDec' && lives === show) for (const l of out) console.log(l.join('\n'));
    }
  }
}
for (const [k, v] of Object.entries(tot))
  console.log(`${k.padEnd(9)} ${(v / lives).toFixed(1)} per life  (${(100 - (100 * v) / tot.base).toFixed(0)}% fewer)`);
