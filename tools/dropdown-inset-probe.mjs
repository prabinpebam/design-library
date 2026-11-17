#!/usr/bin/env node
// Q171: a dropdown trigger's chevron sits as far from the trailing edge as its first content (words, or a leading icon)
// sits from the leading edge, both measured to the drawn ink (the text's glyph bounds, the SVG's geometry with its
// stroke), at every size, emphasis, scheme and density. Reads a running library app; never changes it.
//
//   npm run probe:dropdown-inset                          the core MenuButton and Select pages and the coss, alignui,
//                                                         word-figma and slack templates, light and dark, both densities
//   node tools/dropdown-inset-probe.mjs --origin http://127.0.0.1:8770 --all
//   node tools/dropdown-inset-probe.mjs --page "site.html?chrome=none#/app/alignui/components"
//
// Uses --origin (default http://127.0.0.1:8770) when it answers; otherwise starts the library's Vite dev server on a free
// port for the run and stops it. Prints one row per kind of trigger (worst case over its instances) and exits 1 when the
// two insets differ by more than --tolerance px (default 1).
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './click-probe.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const many = (name) => argv.flatMap((a, i) => (a === `--${name}` && argv[i + 1] ? [argv[i + 1]] : []));
const tolerance = +opt('tolerance', 1);
const PAGES = many('page').length
  ? many('page')
  : [
      'index.html#/menubutton',
      'index.html#/select',
      'site.html?chrome=none#/app/coss/components',
      'site.html?chrome=none#/app/alignui/components',
      'site.html?chrome=none#/app/heroui/components',
      'site.html?chrome=none#/app/word-figma/editor',
      'site.html?chrome=none#/app/slack/channel',
    ];
const SCHEMES = many('scheme').length ? many('scheme') : ['light', 'dark'];
const DENSITIES = many('density').length ? many('density') : ['default', 'compact'];

const answers = async (origin) => {
  try {
    return (await fetch(`${origin}/`, { signal: AbortSignal.timeout(3000) })).ok;
  } catch {
    return false;
  }
};
const freePort = () =>
  new Promise((ok) => {
    const s = createServer().listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });

let origin = opt('origin', 'http://127.0.0.1:8770');
let server;
if (!(await answers(origin))) {
  const port = await freePort();
  origin = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort', '--logLevel', 'error'], { cwd: join(root, 'apps/library'), stdio: 'ignore', windowsHide: true });
  const until = Date.now() + 60000;
  while (!(await answers(origin))) {
    if (Date.now() > until) throw new Error(`the library dev server didn't start on ${origin}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

// Runs in the page: every visible dropdown-like trigger (words and a trailing chevron), its leading and trailing ink insets.
const measure = () => {
  const ctx = document.createElement('canvas').getContext('2d');
  const shown = (el) => el && el.getClientRects().length > 0 && el.checkVisibility({ visibilityProperty: true, opacityProperty: false });
  const svgInk = (svg) => {
    const vb = svg.viewBox?.baseVal;
    const scale = vb?.width ? svg.getBoundingClientRect().width / vb.width : 1;
    let l = Infinity;
    let r = -Infinity;
    for (const g of svg.querySelectorAll('path, circle, rect, line, polyline, polygon, ellipse')) {
      const b = g.getBoundingClientRect();
      const cs = getComputedStyle(g);
      const half = cs.stroke !== 'none' ? ((parseFloat(cs.strokeWidth) || 0) * scale) / 2 : 0;
      l = Math.min(l, b.left - half);
      r = Math.max(r, b.right + half);
    }
    return Number.isFinite(l) ? { l, r } : null;
  };
  const textInk = (el, last = false) => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.data.trim()) nodes.push(n);
    const n = last ? nodes.at(-1) : nodes[0];
    if (!n) return null;
    const i = last ? n.data.trimEnd().length - 1 : n.data.search(/\S/);
    const range = document.createRange();
    range.setStart(n, i);
    range.setEnd(n, i + 1);
    const box = range.getBoundingClientRect();
    const cs = getComputedStyle(n.parentElement);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = ctx.measureText(n.data[i]);
    return { l: box.left - m.actualBoundingBoxLeft, r: box.left + m.actualBoundingBoxRight };
  };
  const inkOf = (el) => {
    if (!el) return null;
    if (el.matches('svg')) return { kind: 'icon', ...svgInk(el) };
    const svg = el.matches("[data-dl-part='leading']") && el.querySelector('svg');
    if (svg) return { kind: 'icon', ...svgInk(svg) };
    if (el.matches("[data-dl='avatar'], [data-dl='flag']")) {
      const b = el.getBoundingClientRect();
      return { kind: el.dataset.dl, l: b.left, r: b.right };
    }
    const t = textInk(el);
    return t && { kind: 'words', ...t };
  };
  const rows = [];
  const add = (kind, edge, size, emphasis, lead, chevron) => {
    if (!shown(edge) || !shown(chevron)) return;
    const box = edge.getBoundingClientRect();
    const first = inkOf(lead);
    const end = svgInk(chevron);
    if (!first || !end) return;
    const rtl = getComputedStyle(edge).direction === 'rtl';
    const start = rtl ? box.right - first.r : first.l - box.left;
    const trail = rtl ? end.l - box.left : box.right - end.r;
    rows.push({ kind, size, emphasis, lead: first.kind, h: Math.round(box.height), name: (edge.textContent ?? '').trim().slice(0, 22), start: +start.toFixed(1), trail: +trail.toFixed(1) });
  };
  for (const trigger of document.querySelectorAll("[data-dl='menu-button'] > [data-dl-part='trigger']:not([data-icon-only])")) {
    if (trigger.closest("[data-dl-part='box']")) continue;
    const layer = trigger.querySelector(":scope > [data-dl-part='layer'][data-shown]");
    const chevron = layer?.lastElementChild;
    if (!chevron?.matches("[data-dl-part='chevron']")) continue;
    add('MenuButton', trigger, trigger.dataset.size, trigger.dataset.emphasis ?? 'default', layer.firstElementChild, chevron);
  }
  for (const box of document.querySelectorAll("[data-dl='select'] [data-dl-part='control'] > [data-dl-part='box']")) {
    const cell = box.lastElementChild;
    if (!cell?.matches("[data-dl-part='chevron']")) continue;
    const select = box.closest("[data-dl='select']");
    add('Select', box, select.dataset.size ?? 'normal', 'field', box.firstElementChild, cell.querySelector('svg'));
  }
  return rows;
};

const browser = await launch(root);
const all = [];
try {
  for (const page of PAGES) {
    for (const scheme of SCHEMES) {
      for (const density of DENSITIES) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
        const tab = await context.newPage();
        await tab.goto(`${origin}/${page}`, { waitUntil: 'load' });
        await tab.evaluate(async (d) => {
          if (d !== 'default') document.documentElement.setAttribute('data-density', d);
          await document.fonts.ready;
        }, density);
        // Icon measures each glyph's ink after layout (a ResizeObserver); give it a few frames.
        await tab.waitForTimeout(1200);
        for (const r of await tab.evaluate(measure)) all.push({ page, scheme, density, ...r, diff: +(r.trail - r.start).toFixed(1) });
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  server?.kill();
}

const short = (p) => p.replace('site.html?chrome=none#/app/', '').replace('index.html#/', 'library/');
const ok = (r) => Math.abs(r.diff) <= tolerance;
if (argv.includes('--all')) {
  for (const r of all) console.log([short(r.page), r.scheme, r.density, r.kind, r.size, r.emphasis, r.lead, r.h, r.start, r.trail, r.diff, ok(r) ? 'ok' : 'FAIL', r.name].join('\t'));
}
// One row per page, trigger kind, size, emphasis and first content; the worst instance across schemes and densities.
const groups = new Map();
for (const r of all) {
  const key = [short(r.page), r.kind, r.size, r.emphasis, r.lead].join('|');
  const g = groups.get(key);
  if (!g || Math.abs(r.diff) > Math.abs(g.diff)) groups.set(key, { ...r, n: (g?.n ?? 0) + 1 });
  else g.n += 1;
}
const head = ['page', 'trigger', 'size', 'emphasis', 'starts with', 'height', 'start ink', 'chevron ink', 'diff', 'n', ''];
const body = [...groups.values()].map((r) => [short(r.page), r.kind, r.size, r.emphasis, r.lead, r.h, r.start, r.trail, r.diff, r.n, ok(r) ? 'ok' : 'FAIL'].map(String));
const widths = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join('  ').trimEnd();
console.log(line(head));
for (const b of body) console.log(line(b));
const failed = all.filter((r) => !ok(r));
const pagesWith = new Set(all.map((r) => r.page));
for (const p of PAGES) if (!pagesWith.has(p)) console.log(`(no dropdown trigger with words found on ${short(p)})`);
console.log(`\n${all.length} triggers measured on ${origin} (${SCHEMES.join(', ')}; ${DENSITIES.join(', ')}); ${failed.length} differ by more than ${tolerance}px.`);
process.exitCode = failed.length ? 1 : 0;
