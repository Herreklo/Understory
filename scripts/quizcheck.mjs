import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
const errs = [];
for (const [w, h, scheme, name] of [[400, 900, 'light', 'phone'], [1100, 900, 'dark', 'desk']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: scheme }); p.on('pageerror', e => errs.push(e.message));
  const html = (await import('fs')).readFileSync('/home/claude/lab/quiz/index.html', 'utf8');
  await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>');
  await p.waitForTimeout(500); await p.click('#go'); await p.waitForTimeout(200);
  await p.click('.opt'); await p.click('#c-70'); await p.click('#submit'); await p.waitForTimeout(200);
  const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await p.screenshot({ path: `/tmp/claude-0/-home-claude/3b0212e1-98dd-5b2e-8ae3-765eee9e1e5f/scratchpad/quiz-${name}.png`, fullPage: false });
  console.log(name, 'horizontal overflow:', wide, 'count:', await p.textContent('#count'));
}
console.log('errors:', errs.length ? errs : 'none'); await b.close();
