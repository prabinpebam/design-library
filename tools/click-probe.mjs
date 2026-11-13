#!/usr/bin/env node
// Q156 / scorecard F32: a replica must work, not just look right. The click probe opens each template layout in a
// headless browser, clicks every enabled control (buttons, links, tabs, switches, checkboxes, menu items, summaries)
// one by one, and reports each one that has no visible effect: no DOM change, no address change, no focus moved
// elsewhere and no new window. Disabled controls (disabled or aria-disabled) are listed apart, never clicked; a control
// that is already the current tab, page, choice or pressed state and changes nothing is listed as current, not dead,
// so a pressed toggle that never releases shows there by name.
//
//   node tools/click-probe.mjs --template word [--layouts home,document] [--origin http://127.0.0.1:8770]
//   node tools/click-probe.mjs --url "http://127.0.0.1:8770/site.html?chrome=none#/app/word/home"
//       --width 1280 --height 900   --json .shots/click-probe/word.json   --verbose (every control and its effect)
// Note-only clicks (the control's only effect is the honest not-in-replica note) are listed apart from working ones.
// Exit 1 when any control is dead. The server is not started: point --origin at a running library app.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(join(root, 'package.json'));
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
const origin = opt('origin', 'http://127.0.0.1:8770');
const width = +opt('width', 1280);
const height = +opt('height', 900);
const verbose = argv.includes('--verbose');

const targets = [];
for (const u of list(opt('url'))) targets.push({ id: u.replace(/^.*#\/app\//, ''), url: u });
const template = opt('template');
if (template) {
  const manifest = join(root, 'packages/templates', template, 'template.json');
  if (!existsSync(manifest)) {
    console.error(`click-probe: no template "${template}" (${manifest}).`);
    process.exit(2);
  }
  const only = new Set(list(opt('layouts')));
  for (const l of JSON.parse(readFileSync(manifest, 'utf8')).layouts ?? []) {
    if (l.planned || (only.size && !only.has(l.id))) continue;
    targets.push({ id: `${template}/${l.id}`, url: `${origin}/site.html?chrome=none#/app/${template}/${l.id}` });
  }
}
if (!targets.length) {
  console.error('click-probe: name a --template or one or more --url.');
  process.exit(2);
}

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const dir = join(process.env.LOCALAPPDATA ?? join(process.env.HOME ?? '', '.cache'), 'ms-playwright');
  const found = existsSync(dir) ? readdirSync(dir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]) : [];
  for (const d of found) {
    for (const exe of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
      if (existsSync(join(dir, d, exe))) return join(dir, d, exe);
    }
  }
  console.error('click-probe: no Chromium found; set CHROME_PATH.');
  process.exit(2);
}

const CONTROLS = 'button, a[href], summary, [role=button], [role=tab], [role=switch], [role=checkbox], [role=radio], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], input[type=checkbox], input[type=radio]';

// Tags every visible control in document order; returns their names and whether each is disabled.
async function tag(page) {
  return page.evaluate((sel) => {
    const seen = [];
    let n = 0;
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (!r.width || !r.height || s.visibility === 'hidden' || el.closest('[inert], [aria-hidden="true"]')) continue;
      // A control nested in another control (a part of a button) is clicked as its outer control.
      if (el.parentElement?.closest(sel)) continue;
      el.setAttribute('data-click-probe', String(n));
      const name = (el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.getAttribute('value') || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const disabled = el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true';
      // Already the current tab, page or choice: clicking it again rightly changes nothing.
      // An already-pressed member of a set (the active alignment) also changes nothing when chosen again.
      const current = el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-selected') === 'true' || (el.hasAttribute('aria-current') && el.getAttribute('aria-current') !== 'false') || ((el.getAttribute('role') === 'radio' || el.getAttribute('role') === 'menuitemradio' || el.type === 'radio') && (el.getAttribute('aria-checked') === 'true' || el.checked));
      seen.push({ n, name: name || `(${el.tagName.toLowerCase()} without a name)`, role: el.getAttribute('role') || el.tagName.toLowerCase(), disabled, current });
      n++;
    }
    return seen;
  }, CONTROLS);
}

// Watches for an effect; hover, focus and press styling attributes don't count.
// Changes inside the notification host (core `notify`) and the live announcer it speaks through are counted apart, so a click whose only effect is the
// "isn't part of the replica yet" note is reported as a note, not as working (F37).
const arm = () => {
  window.__cp?.disconnect();
  window.__cpCount = 0;
  window.__cpNotify = 0;
  window.__cpHref = location.href;
  const ignore = /^data-(click-probe|hover|hovered|focus|focused|focus-visible|active|pressing)/;
  window.__cp = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes' && ignore.test(r.attributeName ?? '')) continue;
      const node = r.target.nodeType === 1 ? r.target : r.target.parentElement;
      if (node?.closest('[data-dl="notifications"], [data-dl="announcer"]')) window.__cpNotify++;
      else window.__cpCount++;
    }
  });
  window.__cp.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
};
const effect = (n) => {
  const el = document.querySelector(`[data-click-probe="${n}"]`);
  const a = document.activeElement;
  const focusMoved = !!a && a !== document.body && a !== el && !el?.contains(a);
  const said = [...document.querySelectorAll('[data-dl="notifications"] [data-dl-part="message"]')].map((m) => m.textContent ?? '');
  return { dom: window.__cpCount, notify: window.__cpNotify, said: said.at(-1) ?? '', url: location.href !== window.__cpHref, focus: focusMoved };
};
// The honest stub note: "X isn't part of the replica yet", "… aren't part of this example".
const NOTE = /\b(isn[’']t|aren[’']t|is not|are not) part of (this|the) (replica|example)/i;

const { chromium } = require('playwright-core');
const browser = await chromium.launch({ executablePath: chromePath(), headless: true });
const report = { origin, width, height, layouts: [] };
let deadTotal = 0;
let noteTotal = 0;
let clickedTotal = 0;
let disabledTotal = 0;
for (const t of targets) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let popups = 0;
  context.on('page', () => popups++);
  const load = async () => {
    // Back to the layout's resting state: a template that keeps its state for the tab (a filter, a bag) would otherwise
    // reload with different controls than the ones tagged, and a click would be blamed on the wrong control.
    await page.evaluate(() => sessionStorage.clear()).catch(() => undefined);
    await page.goto('about:blank');
    await page.goto(t.url, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    // A navigation the page starts itself (a redirect, a dev server's reload) can destroy the context mid-read: retry.
    for (let i = 0; ; i++) {
      try {
        return await tag(page);
      } catch (e) {
        if (i >= 3) throw e;
        await page.waitForLoadState('load').catch(() => undefined);
        await page.waitForTimeout(700);
      }
    }
  };
  const controls = await load();
  let tagged = controls.length;
  const row = { id: t.id, url: t.url, controls: controls.length, clicked: 0, dead: [], notes: [], current: [], disabled: [], skipped: [], pageErrors: errors };
  for (const c of controls) {
    if (c.disabled) {
      row.disabled.push(c.name);
      continue;
    }
    let loc = page.locator(`[data-click-probe="${c.n}"]`);
    if (!(await loc.count()) || !(await loc.isVisible())) {
      await load();
      loc = page.locator(`[data-click-probe="${c.n}"]`);
      if (!(await loc.count()) || !(await loc.isVisible())) {
        row.skipped.push(c.name);
        continue;
      }
    }
    const before = popups;
    await page.evaluate(arm);
    try {
      await loc.click({ timeout: 2000 });
    } catch (e) {
      row.skipped.push(`${c.name} (${e.message.split('\n')[0].slice(0, 80)})`);
      await load();
      continue;
    }
    await page.waitForTimeout(250);
    let fx = await page.evaluate(effect, c.n).catch(() => ({ dom: 1, notify: 0, said: '', url: true, focus: false }));
    // A router may start a page change after a glide or a busy frame: give a quiet click one more look before calling it dead.
    if (!(fx.dom || fx.notify || fx.url || fx.focus || popups > before)) {
      await page.waitForTimeout(750);
      fx = await page.evaluate(effect, c.n).catch(() => ({ dom: 1, notify: 0, said: '', url: true, focus: false }));
    }
    const works = fx.dom > 0 || fx.url || fx.focus || popups > before;
    const note = !works && fx.notify > 0 && NOTE.test(fx.said);
    const alive = works || fx.notify > 0;
    row.clicked++;
    if (note) row.notes.push(c.name);
    else if (!alive) (c.current ? row.current : row.dead).push(c.name);
    if (verbose) console.log(`  ${note ? 'NOTE' : alive ? 'ok  ' : 'DEAD'} ${t.id} ${c.role} "${c.name}" dom ${fx.dom} notify ${fx.notify} url ${fx.url} focus ${fx.focus}`);
    // Back to the layout's resting state before the next control: Escape closes menus and popovers; reload only when
    // the address moved, a window opened or tagged controls disappeared (a view changed under them).
    await page.keyboard.press('Escape').catch(() => undefined);
    const remaining = await page.locator('[data-click-probe]').count().catch(() => 0);
    if (fx.url || popups > before || remaining < tagged) {
      for (const p of context.pages()) if (p !== page) await p.close();
      tagged = (await load()).length;
    }
  }
  clickedTotal += row.clicked;
  deadTotal += row.dead.length;
  noteTotal += row.notes.length;
  disabledTotal += row.disabled.length;
  report.layouts.push(row);
  console.log(`${t.id}: ${row.clicked} clicked, ${row.dead.length} dead, ${row.notes.length} note only, ${row.current.length} already current, ${row.disabled.length} disabled, ${row.skipped.length} skipped, ${errors.length} page errors${row.dead.length ? `\n  dead: ${row.dead.join(' | ')}` : ''}${row.skipped.length ? `\n  skipped: ${row.skipped.join(' | ')}` : ''}`);
  await context.close();
}
await browser.close();
report.summary = { layouts: targets.length, clicked: clickedTotal, dead: deadTotal, notes: noteTotal, disabled: disabledTotal };
console.log(`click-probe: ${targets.length} layouts, ${clickedTotal} controls clicked, ${deadTotal} dead, ${noteTotal} note only, ${disabledTotal} disabled (not clicked).`);
const out = opt('json', join('.shots', 'click-probe', `${template ?? 'urls'}.json`));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 1));
process.exit(deadTotal ? 1 : 0);
