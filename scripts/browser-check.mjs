// The lab page must run in a browser: build a town, show people, no page errors. Node-only references (process.env) have broken it before.
import { chromium } from 'playwright';
import { readdirSync, existsSync } from 'fs';
const roots = ['/opt/pw-browsers'];
let exe = process.env.CHROME;
if (!exe) for (const r of roots) if (existsSync(r)) for (const d of readdirSync(r)) if (d.startsWith('chromium_headless_shell')) exe = `${r}/${d}/chrome-linux/headless_shell`;
const b = await chromium.launch(exe ? { executablePath: exe } : {});
const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto('file://' + process.cwd() + '/dist/index.html'); await p.waitForTimeout(12000);
const detail = await p.evaluate(() => (document.getElementById('detail')?.innerText ?? '').length);
if (errs.length || detail < 50) { console.error('BROWSER CHECK FAILED', errs.join(' | '), 'detail length', detail); process.exit(1); }
console.log('browser ok: page builds a town and shows a person');
// The human study's page (round Q3): a whole sitting on a phone-sized screen, answered quickly, ends in a block of answers that parses.
if (existsSync('dist/study.html')) {
  const q = await b.newPage({ viewport: { width: 390, height: 844 } }); const qerrs = [];
  q.on('pageerror', e => qerrs.push(e.message.slice(0, 200)));
  await q.goto('file://' + process.cwd() + '/dist/study.html');
  await q.getByRole('button', { name: 'Begin' }).click();
  let n = 0;
  while (n < 40) {
    const opts = q.locator('#opts .btn'); if (!(await opts.count())) break;
    await opts.nth(n % (await opts.count())).click();
    await q.locator('#conf .btn').nth(n % 3).click();
    await q.locator('#lock').click();
    n++;
    const last = (await q.locator('#opts').count()) === 0 || (await q.getByRole('button', { name: 'Finish' }).count()) > 0;
    await q.getByRole('button', { name: last ? 'Finish' : 'Next' }).click();
    if (last) break;
  }
  await q.locator('#felt .btn').nth(3).click();
  await q.locator('#again .btn').nth(0).click();
  await q.getByRole('button', { name: 'Show my answers to send' }).click();
  const text = await q.locator('#out').inputValue();
  let parsed = null; try { parsed = JSON.parse(text); } catch (e) {}
  await q.close();
  if (qerrs.length || !parsed || parsed.items.length !== n || n < 16) { console.error('STUDY PAGE CHECK FAILED', qerrs.join(' | '), 'items answered', n, 'parsed', !!parsed); process.exit(1); }
  console.log(`browser ok: the study page runs a sitting of ${n} items and hands back ${text.length} characters`);
}
await b.close();
