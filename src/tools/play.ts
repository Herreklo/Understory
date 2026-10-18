// The play page: "Twelve months in town". A small game over the quiz's items, so a person can feel the model: meet three or four people
// through what the witness has seen, then month by month bet on what one of them does in a spot they have never been seen in, and see
// what they did and why. Each set is one world; its people recur, so reading them pays. Nothing is stored; it is for feeling, not measuring.
//   BASE_DIR=<dir with base-*.json> tsx src/tools/play.ts A B     → dist/play.html (sets from worlds A..B) and out-play/sets.json
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { SETTING } from '../setting';
import { itemsOf, readBase, type Item } from './quiz';

const A = +process.argv[2],
  B = +process.argv[3];
const CARDS = 12,
  PER = 3; // cards in a set, cards per person
const table = readBase(process.env.BASE_DIR ?? 'out-9b');

type Set_ = { seed: number; town: string; you: Item['you']; people: Item['person'][]; cards: Item[] };
const sets: Set_[] = [];
for (let seed = A; seed <= B; seed++) {
  const { items } = itemsOf(seed, table, PER + 1, 80);
  const by = new Map<string, Item[]>();
  for (const it of items) (by.get(it.person.name) ?? by.set(it.person.name, []).get(it.person.name)!).push(it);
  const people = [...by.values()].filter(v => v.length >= PER).sort((a, b) => b.length - a.length);
  if (people.length < 3) {
    console.error(`play: world ${seed}: only ${people.length} people with ${PER} items, skipped`);
    continue;
  }
  const cards: Item[] = [];
  for (const v of people.slice(0, Math.ceil(CARDS / PER))) cards.push(...v.sort((x, y) => x.t! - y.t!).slice(0, PER));
  cards.sort((x, y) => x.t! - y.t!);
  if (cards.length < CARDS) {
    console.error(`play: world ${seed}: ${cards.length} cards, skipped`);
    continue;
  }
  const first = new Map<string, Item>();
  for (const c of cards) if (!first.has(c.person.name)) first.set(c.person.name, c);
  sets.push({ seed, town: SETTING.name, you: cards[0].you, people: [...first.values()].map(c => c.person), cards: cards.slice(0, CARDS) });
  console.error(`play: world ${seed}: ${first.size} people, ${cards.length} cards`);
}
if (!sets.length) throw new Error('play: no set could be built');
mkdirSync('out-play', { recursive: true });
mkdirSync('dist', { recursive: true });
writeFileSync('out-play/sets.json', JSON.stringify(sets));
const html = readFileSync('play/template.html', 'utf8').replace('/*__SETS__*/null', () => JSON.stringify(sets).replace(/<\/script/g, '<\\/script'));
writeFileSync('dist/play.html', html);
console.log(`play: ${sets.length} sets → dist/play.html`);
