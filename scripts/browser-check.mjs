// The lab page must run in a browser: build a town, show people, no page errors. Node-only references (process.env) have broken it before.
import { chromium } from 'playwright';
import { readdirSync, existsSync } from 'fs';
const roots = ['/opt/pw-browsers'];
let exe = process.env.CHROME;
if (!exe) for (const r of roots) if (existsSync(r)) for (const d of readdirSync(r)) if (d.startsWith('chromium_headless_shell')) exe = `${r}/${d}/chrome-linux/headless_shell`;
const b = await chromium.launch(exe ? { executablePath: exe } : {});
const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto('file://' + process.cwd() + '/index.html'); await p.waitForTimeout(12000);
const detail = await p.evaluate(() => (document.getElementById('detail')?.innerText ?? '').length);
await b.close();
if (errs.length || detail < 50) { console.error('BROWSER CHECK FAILED', errs.join(' | '), 'detail length', detail); process.exit(1); }
console.log('browser ok: page builds a town and shows a person');
