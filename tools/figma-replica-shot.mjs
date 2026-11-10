#!/usr/bin/env node
// Figma replica side-by-side shots (Q118, docs/figma-replica.md, open item E1). Template-specific evaluator tool, not a
// core probe. Opens the Design template's editor headless at R11's CSS size (2878 × 1414 px at 1.8× = 1599 × 786),
// light and dark, runs tools/figma-replica-measure.js, and writes into the git-ignored .design-library/figma-ref/:
//   ours-{scheme}.png          the editor at R11's size
//   compare-{scheme}.png       R11 (light reference) above ours, same CSS scale, for review by eye
//   measure-{scheme}.json      window.replicaMeasure() output
// Usage: node ./tools/figma-replica-shot.mjs [--url http://127.0.0.1:8766/site.html#/app/design/editor]
// Needs playwright (project or global install) and an installed Chrome, Edge or Playwright Chromium.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '.design-library', 'figma-ref');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const url = arg('--url', 'http://127.0.0.1:8766/site.html#/app/design/editor');
const W = 1599, H = 786;

let chromium;
for (const base of [root, (() => { try { return execSync('npm root -g', { encoding: 'utf8' }).trim(); } catch { return null; } })()]) {
  if (!base) continue;
  for (const name of ['playwright-core', 'playwright', '@playwright/test']) {
    try { ({ chromium } = createRequire(join(base, base === root ? 'package.json' : 'x.js'))(name)); break; } catch {}
  }
  if (chromium) break;
}
if (!chromium) { console.error('figma-replica-shot: needs playwright (npm i -g @playwright/test, or playwright-core in the project).'); process.exit(1); }

const launch = async () => {
  for (const channel of ['msedge', 'chrome', undefined]) {
    try { return await chromium.launch(channel ? { channel } : {}); } catch {}
  }
  throw new Error('no browser: install Edge or Chrome, or run npx playwright install chromium');
};

const browser = await launch();
const ref = join(out, '5576781786647-2.png');
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate((s) => document.documentElement.setAttribute('data-scheme', s), scheme);
  await page.waitForTimeout(800);
  await page.addScriptTag({ path: join(root, 'tools', 'figma-replica-measure.js') });
  const m = await page.evaluate(() => window.replicaMeasure());
  writeFileSync(join(out, `measure-${scheme}.json`), JSON.stringify(m, null, 2));
  const ours = join(out, `ours-${scheme}.png`);
  await page.screenshot({ path: ours });
  const insp = join(out, 'owner', 'owner-07-frame-selected-inspector-dark.png');
  if (scheme === 'dark' && existsSync(insp)) {
    // R12: the owner's real Figma inspector (dark, 1×, 361 × 1124, panel 330 px). Ours: the right 361 px, same height.
    await page.setViewportSize({ width: W, height: 1124 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.documentElement.setAttribute('data-scheme', 'dark'));
    await page.waitForTimeout(800);
    const ours2 = join(out, 'ours-inspector-dark.png');
    await page.screenshot({ path: ours2, clip: { x: W - 361, y: 0, width: 361, height: 1124 } });
    const img = (p) => 'data:image/png;base64,' + readFileSync(p).toString('base64');
    await page.setViewportSize({ width: 361 * 2 + 16, height: 1124 + 24 });
    await page.setContent(`<body style="margin:0;background:#888;font:12px system-ui;color:#fff"><div style="height:24px;line-height:24px;padding-left:8px">← R12 owner's Figma inspector (dark, 1×) · ours (dark) →</div>
      <div style="display:flex;gap:16px"><img src="${img(insp)}" style="display:block"><img src="${img(ours2)}" style="display:block"></div></body>`);
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(out, 'compare-inspector-dark.png') });
  }
  if (existsSync(ref)) {
    const img = (p) => 'data:image/png;base64,' + readFileSync(p).toString('base64');
    await page.setViewportSize({ width: W, height: H * 2 + 24 });
    await page.setContent(`<body style="margin:0;background:#888;font:12px system-ui;color:#fff">
      <div style="height:${H}px;overflow:hidden"><img src="${img(ref)}" style="width:${W}px;display:block"></div>
      <div style="height:24px;line-height:24px;padding-left:8px">↑ R11 Figma UI3 (light, 1.8× scaled to CSS px) · ↓ ours (${scheme})</div>
      <img src="${img(ours)}" style="width:${W}px;display:block"></body>`);
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(out, `compare-${scheme}.png`) });
  }
  console.log(`${scheme}: ${m.viewport}, fails ${m.fails.join(' ') || 'none'}`);
  if (scheme === 'light') {
    // Basic behaviour (Q118.2): FB1 pages, FB2 canvas <-> layers, FB5 tabs, FB6 menus. Each step reports what it saw.
    const bctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const page = await bctx.newPage();
    page.setDefaultTimeout(5000);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const fb = {};
    const step = async (id, fn) => { try { fb[id] = await fn(); } catch (e) { fb[id] = { pass: false, error: String(e.message || e).split('\n')[0] }; } };
    await step('FB2 canvas→layers', async () => {
      const target = page.locator('[data-dl="canvas"] [aria-label^="Text:"]').first();
      const name = (await target.getAttribute('aria-label')).replace(/^[^:]+:\s*/, '');
      await target.click();
      const row = page.getByRole('treeitem', { name, exact: false }).first();
      return { pass: (await row.getAttribute('aria-selected')) === 'true', clicked: name };
    });
    await step('FB2 layers→canvas', async () => {
      const row = page.getByRole('treeitem', { name: 'Logo', exact: true }).first();
      const name = 'Logo';
      await row.click();
      const pressed = await page.locator(`[data-dl="canvas"] [aria-label$="${name}"]`).first().getAttribute('aria-pressed');
      return { pass: pressed === 'true', clicked: name };
    });
    await step('FB1 pages', async () => {
      const pages = page.getByRole('treeitem', { name: 'Components', exact: true }).first();
      const before = await page.locator('[data-dl="canvas"]').innerText();
      await pages.click();
      await page.waitForTimeout(300);
      const after = await page.locator('[data-dl="canvas"]').innerText();
      return { pass: before !== after, note: 'canvas content changes after choosing the Components page' };
    });
    await step('FB5 tabs', async () => {
      const tab = page.getByRole('tab', { name: /Prototype/ }).first();
      await tab.click();
      return { pass: (await tab.getAttribute('aria-selected')) === 'true' };
    });
    await step('FB6 main menu', async () => {
      const btn = page.getByRole('button', { name: /Main menu/i }).first();
      await btn.click();
      const open = await page.getByRole('menu').first().isVisible();
      await page.keyboard.press('Escape');
      const back = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim());
      return { pass: open && /main menu/i.test(back || ''), menuOpened: open, focusReturnedTo: back };
    });
    writeFileSync(join(out, 'behaviour.json'), JSON.stringify(fb, null, 2));
    console.log('behaviour: ' + Object.entries(fb).map(([k, v]) => `${k} ${v.pass ? 'pass' : 'FAIL'}`).join(' · '));
    await bctx.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`Wrote ours-*.png, compare-*.png, measure-*.json in ${pathToFileURL(out).href}`);
