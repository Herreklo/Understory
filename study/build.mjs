// Builds the human study's page (round Q3): puts the packed items into study/template.html and writes dist/study.html.
//   node study/build.mjs [items.json]      default items: study/items.json
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
const src = process.argv[2] ?? 'study/items.json';
const items = JSON.parse(readFileSync(src, 'utf8'));
const kinds = {};
for (const it of items) kinds[it.trigger] = (kinds[it.trigger] ?? 0) + 1;
const html = readFileSync('study/template.html', 'utf8').replace('/*__ITEMS__*/null', () => JSON.stringify(items).replace(/<\/script/g, '<\\/script'));
mkdirSync('dist', { recursive: true });
writeFileSync('dist/study.html', html);
console.log(`study: ${items.length} items from ${new Set(items.map(i => i.seed)).size} worlds → dist/study.html · by kind: ${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(', ')}`);
