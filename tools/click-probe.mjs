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
// Layouts run in parallel pages of one browser (--jobs, default 8); a page reloads only when a click navigated away
// (address change, new window) or when the next control is gone. tools/check-works.mjs imports probeLayouts.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

// The probe targets for one template: every built layout, or the ones named.
export function layoutTargets(root, template, origin, layouts = []) {
  const manifest = join(root, 'packages/templates', template, 'template.json');
  if (!existsSync(manifest)) throw new Error(`no template "${template}" (${manifest})`);
  const only = new Set(layouts);
  return (JSON.parse(readFileSync(manifest, 'utf8')).layouts ?? [])
    .filter((l) => !l.planned && (!only.size || only.has(l.id)))
    .map((l) => ({ template, id: `${template}/${l.id}`, url: `${origin}/site.html?chrome=none#/app/${template}/${l.id}` }));
}

export function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const dir = join(process.env.LOCALAPPDATA ?? join(process.env.HOME ?? '', '.cache'), 'ms-playwright');
  const found = existsSync(dir) ? readdirSync(dir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]) : [];
  for (const d of found) {
    for (const exe of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
      if (existsSync(join(dir, d, exe))) return join(dir, d, exe);
    }
  }
  throw new Error('no Chromium found; set CHROME_PATH');
}

export async function launch(root = process.cwd()) {
  const { chromium } = createRequire(join(root, 'package.json'))('playwright-core');
  return chromium.launch({ executablePath: chromePath(), headless: true });
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

// Watches for an effect; hover, focus and press styling attributes and hover hints don't count.
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
      // A hover hint (role tooltip) opens on its own timer under the pointer: it's not the click's effect.
      if (node?.closest('[role="tooltip"]')) continue;
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


// Whether the control plainly can't take a click: '' when it may, else the reason. Only two sure cases: a control placed
// off the page (a skip link before it's focused) and one under an open modal layer. Anything else is left to the click.
const hidden = (loc) =>
  loc
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      if (r.right + scrollX <= 0 || r.bottom + scrollY <= 0) return 'off the page';
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return '';
      const top = document.elementFromPoint(x, y);
      const modal = top?.closest('dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"]');
      return top && modal && !modal.contains(el) && !el.contains(top) ? 'under a modal layer' : '';
    })
    .catch(() => '');

// Waits until the view has rendered: the control count holds for 200 ms (at least 300 ms, at most 1.5 s after load).
async function settle(page) {
  let last = -1;
  let steady = 0;
  for (let waited = 0; waited < 1500; waited += 100) {
    await page.waitForTimeout(100);
    const n = await page.evaluate((sel) => document.querySelectorAll(sel).length, CONTROLS).catch(() => -1);
    steady = n > 0 && n === last ? steady + 1 : 0;
    last = n;
    if (steady >= 2 && waited >= 200) return;
  }
}

// Clicks every control of one layout in its own browser context.
async function probeLayout(browser, t, { width, height, verbose }) {
  const began = Date.now();
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let popups = 0;
  context.on('page', () => popups++);
  let loads = 0;
  let loadMs = 0;
  const load = async () => {
    loads++;
    const t0 = Date.now();
    try {
      return await reload();
    } finally {
      loadMs += Date.now() - t0;
    }
  };
  const reload = async () => {
    // Back to the layout's resting state: a template that keeps its state for the tab (a filter, a bag) would otherwise
    // reload with different controls than the ones tagged, and a click would be blamed on the wrong control.
    await page.evaluate(() => sessionStorage.clear()).catch(() => undefined);
    await page.goto('about:blank');
    await page.goto(t.url, { waitUntil: 'load' });
    await settle(page);
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
  const lines = [];
  for (const c of controls) {
    if (c.disabled) {
      row.disabled.push(c.name);
      continue;
    }
    let loc = page.locator(`[data-click-probe="${c.n}"]`);
    if (!(await loc.count()) || !(await loc.isVisible())) {
      // The view changed under the tagged controls: back to the resting state.
      await load();
      loc = page.locator(`[data-click-probe="${c.n}"]`);
      if (!(await loc.count()) || !(await loc.isVisible())) {
        row.skipped.push(c.name);
        continue;
      }
    }
    // A control under a modal layer or off the screen (a skip link) can't take the click: list it as skipped at once,
    // rather than letting the click time out and reloading. A layer that's on its way out gets one more look.
    let covered = await hidden(loc);
    if (covered) {
      await page.waitForTimeout(400);
      covered = await hidden(loc);
    }
    if (covered) {
      row.skipped.push(`${c.name} (${covered})`);
      continue;
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
    // A router may start a page change after a glide or a busy frame, and a busy machine may paint the note before the
    // change: give a quiet or note-only click one more look before calling it dead or note only.
    if (!(fx.dom || fx.url || fx.focus || popups > before)) {
      await page.waitForTimeout(750);
      fx = await page.evaluate(effect, c.n).catch(() => ({ dom: 1, notify: 0, said: '', url: true, focus: false }));
    }
    const works = fx.dom > 0 || fx.url || fx.focus || popups > before;
    const note = !works && fx.notify > 0 && NOTE.test(fx.said);
    const alive = works || fx.notify > 0;
    row.clicked++;
    if (note) row.notes.push(c.name);
    else if (!alive) (c.current ? row.current : row.dead).push(c.name);
    if (verbose) lines.push(`  ${note ? 'NOTE' : alive ? 'ok  ' : 'DEAD'} ${t.id} ${c.role} "${c.name}" dom ${fx.dom} notify ${fx.notify} url ${fx.url} focus ${fx.focus}`);
    // Back to the layout's resting state before the next control: Escape closes menus and popovers; reload only when
    // the click navigated away (the address moved or a window opened) or the view changed under the tagged controls.
    await page.keyboard.press('Escape').catch(() => undefined);
    const remaining = await page.locator('[data-click-probe]').count().catch(() => 0);
    if (fx.url || popups > before || remaining < tagged) {
      for (const p of context.pages()) if (p !== page) await p.close();
      tagged = (await load()).length;
    }
  }
  row.loads = loads;
  row.loadMs = loadMs;
  row.ms = Date.now() - began;
  await context.close();
  return { row, lines };
}

const line = (row) =>
  `${row.id}: ${row.clicked} clicked, ${row.dead.length} dead, ${row.notes.length} note only, ${row.current.length} already current, ${row.disabled.length} disabled, ${row.skipped.length} skipped, ${row.pageErrors.length} page errors${row.dead.length ? `\n  dead: ${row.dead.join(' | ')}` : ''}${row.skipped.length ? `\n  skipped: ${row.skipped.join(' | ')}` : ''}`;

// Probes the targets in parallel pages of one browser; rows come back in target order. onRow(row, target) sees each as it ends.
export async function probeLayouts(browser, targets, { width = 1280, height = 900, jobs = 8, verbose = false, onRow } = {}) {
  const rows = new Array(targets.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(jobs, targets.length)) }, async () => {
      for (let i = next++; i < targets.length; i = next++) {
        const t = targets[i];
        let r;
        try {
          r = await probeLayout(browser, t, { width, height, verbose });
        } catch (e) {
          r = { row: { id: t.id, url: t.url, controls: 0, clicked: 0, dead: [], notes: [], current: [], disabled: [], skipped: [], pageErrors: [], failed: e.message.split('\n')[0] }, lines: [] };
        }
        rows[i] = r.row;
        onRow?.(r.row, t, [...r.lines, r.row.failed ? `${t.id}: the probe failed: ${r.row.failed}` : line(r.row)].join('\n'));
      }
    }),
  );
  return rows;
}

export const summarize = (rows) => ({
  layouts: rows.length,
  clicked: rows.reduce((n, r) => n + r.clicked, 0),
  dead: rows.reduce((n, r) => n + r.dead.length, 0),
  notes: rows.reduce((n, r) => n + r.notes.length, 0),
  disabled: rows.reduce((n, r) => n + r.disabled.length, 0),
  failed: rows.filter((r) => r.failed).length,
});

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const root = process.cwd();
  const argv = process.argv.slice(2);
  const opt = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
  };
  const origin = opt('origin', 'http://127.0.0.1:8770');
  const width = +opt('width', 1280);
  const height = +opt('height', 900);
  const targets = list(opt('url')).map((u) => ({ id: u.replace(/^.*#\/app\//, ''), url: u }));
  const template = opt('template');
  try {
    if (template) targets.push(...layoutTargets(root, template, origin, list(opt('layouts'))));
  } catch (e) {
    console.error(`click-probe: ${e.message}.`);
    process.exit(2);
  }
  if (!targets.length) {
    console.error('click-probe: name a --template or one or more --url.');
    process.exit(2);
  }
  const browser = await launch(root);
  const rows = await probeLayouts(browser, targets, { width, height, jobs: +opt('jobs', 8), verbose: argv.includes('--verbose'), onRow: (_r, _t, text) => console.log(text) });
  await browser.close();
  const summary = summarize(rows);
  console.log(`click-probe: ${summary.layouts} layouts, ${summary.clicked} controls clicked, ${summary.dead} dead, ${summary.notes} note only, ${summary.disabled} disabled (not clicked).`);
  const out = opt('json', join('.shots', 'click-probe', `${template ?? 'urls'}.json`));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify({ origin, width, height, layouts: rows, summary }, null, 1));
  process.exit(summary.dead || summary.failed ? 1 : 0);
}
