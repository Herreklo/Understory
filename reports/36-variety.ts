// What in a life goes with a higher reader score (round 36's outcome): the lives of the readings of rounds 29-34 rebuilt, in either arm,
// each page described by its lines, its kinds of line and the people in it. One JSON array to stdout; reports/36-variety.py reads it.
//   npx tsx reports/36-variety.ts 29,30,31,32,33,34 off > out-variety-off.json   (and `on`, with each round's switch)
// A life rebuilt is kept only if its page has as many lines as the pack the readers read (it is the same page).
import { readFileSync } from 'fs';
import { buildWorld, runYears } from '../src/build';
import { pickWitness } from '../src/witness';
import { pageLines } from '../src/page';
import { TEXTURE, ON, nameOf, type World } from '../src/world';
const R = 'reports';
const arm = process.argv[3] ?? 'off'; // 'off': today's engine; 'on': the round's switch on
const rounds = (process.argv[2] ?? '29,30,31,32,33,34').split(',');
const SW: Record<string, string> = { '29': 'accounts', '30': 'telling', '31': 'telling', '32': 'carry', '33': 'reckon', '34': 'aftermath' };
const CAT: [string, RegExp][] = [
  ['friendship', /^(friends|madeup|cooled|mended|drift)/],
  ['romance', /^(dating|married|split|divorce|couple:|proposed|win|flirt|love|jealous|affair)/],
  ['work', /^(hired|promoted|passed|dismiss|fired|quit|retired|work|stepdown|caught|skim|credit|walkout|decline)/],
  ['pursuit', /^(pursuit|want:|gaveup|pushon|otherway|aimlower|setback|gotgood|bought|follow|unfollow|tell)$/],
  ['group', /^group:|^backsong|^claimsong|^performed|^seize|^shyaway/],
  ['family', /^(born|death|ill|accident|visit|care)/],
  ['town', /^(night:|pitchin|notthetime|putin|notthemoney|chipin|quietgive|token|nowallet|council:|plan|harbour)/],
  ['conflict', /^(criticise|rake|contempt|stonewall|needle|sarcasm|shout|snap|confront|grudging|coolto|rivals|blame|scheme)/],
];
const out: any[] = [];
for (const r of rounds) {
  const key = JSON.parse(readFileSync(`${R}/${r}-reading-key.json`, 'utf8'));
  const pack = readFileSync(`${R}/${r}-reading-pack.txt`, 'utf8');
  const packLines: Record<string, number> = {};
  let cur = '';
  for (const l of pack.split('\n')) {
    const m = l.match(/^##### (P\d+), version ([AB])/);
    if (m) {
      cur = m[1] + m[2];
      packLines[cur] = 0;
    } else if (cur && l.trim() && !l.startsWith('    ↳')) packLines[cur]++;
  }
  const bySeed = new Map<number, string[]>();
  for (const [p, k] of Object.entries<any>(key)) bySeed.set(k.seed, [...(bySeed.get(k.seed) ?? []), p]);
  for (const [seed, ps] of bySeed) {
    ON.clear();
    if (arm === 'on') ON.add(SW[r]);
    const w: World = buildWorld(seed, 1);
    pickWitness(w);
    runYears(w, 10);
    for (const p of ps) {
      const k = key[p];
      const off = arm === 'on' ? k.onIs : k.onIs === 'A' ? 'B' : 'A';
      const cands = w.people.filter(x => nameOf(w, x.id) === k.name);
      const q = cands.length === 1 ? cands[0] : undefined;
      if (!q) continue;
      const evs = q.events.map(i => w.events[i]).filter(e => e.t >= w.startPresent);
      const lines = pageLines(w, evs, new Set(q.events));
      const row: any = { round: r, pair: p, arm, version: off, lines: lines.length, packLines: packLines[p + off] };
      const cats: Record<string, number> = {};
      const people = new Set<number>();
      let weighty = 0,
        texture = 0,
        top = 0;
      const types = new Map<string, number>();
      for (const { e } of lines) {
        const c = CAT.find(([, re]) => re.test(e.type))?.[0] ?? 'other';
        cats[c] = (cats[c] ?? 0) + 1;
        for (const id of e.who) if (id !== q.id) people.add(id);
        if (e.w >= 0.8 && !TEXTURE.has(e.type)) weighty++;
        if (TEXTURE.has(e.type)) texture++;
        if (e.w >= 1.5) top++;
        types.set(e.type, (types.get(e.type) ?? 0) + 1);
      }
      row.cats = cats;
      row.people = people.size;
      row.weighty = weighty;
      row.texture = texture;
      row.big = top;
      row.distinctTypes = types.size;
      row.repeatShare = 1 - types.size / Math.max(1, lines.length);
      row.age = Math.floor((w.t - q.born) / 12);
      row.sex = q.sex;
      out.push(row);
    }
    console.error(`round ${r} world ${seed}`);
  }
}
console.log(JSON.stringify(out));
