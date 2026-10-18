// The quiz with a stand-in for the viewer's runtime: a db that stores documents in memory (slowly, like a network), and a user id.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
const errs = [];
const stub = `<script>
const store = new Map(); const later = v => new Promise(r => setTimeout(() => r(v), 150));
const ref = path => ({ get: () => later({ exists: store.has(path), data: () => store.get(path) }), set: d => { store.set(path, JSON.parse(JSON.stringify(d))); return later(); } });
window.claude = { use: name => later(name === 'db' ? { collection: c => ({ doc: id => ref(c + '/' + id), get: () => later({ docs: [...store].filter(([k]) => k.startsWith(c + '/')).map(([, v]) => ({ data: () => v })) }) }) } : name === 'user' ? { id: () => later('u_test') } : null) };
window.__store = store;
</script>`;
const p = await b.newPage({ viewport: { width: 400, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.setContent('<!doctype html><html><head><meta charset=utf8></head><body>' + stub + readFileSync('/home/claude/lab/quiz/index.html', 'utf8') + '</body></html>');
await p.waitForTimeout(600); console.log('after load:', (await p.textContent('#view')).slice(0, 60));
await p.click('#go'); await p.waitForTimeout(400); console.log('after start:', await p.textContent('#count'));
for (let i = 0; i < 20; i++) { await p.click('.opt'); await p.click('#c-70'); await p.click('#submit'); await p.waitForTimeout(250); await p.click('#next'); await p.waitForTimeout(150); }
await p.waitForTimeout(800);
console.log('end:', (await p.textContent('h2')), '| stored docs:', await p.evaluate(() => [...window.__store.keys()].join(',')), '| answers stored:', await p.evaluate(() => window.__store.get('answers/u_test')?.answers?.length));
console.log('pooled shown:', !!(await p.$('#pooled .sec')));
console.log('errors:', errs.length ? errs : 'none'); await b.close();
