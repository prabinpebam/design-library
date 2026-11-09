#!/usr/bin/env node
/**
 * Icon sets (F17, owner Q36): subsets each curated MIT or Apache-2.0 icon library to the library's semantic icon names
 * and writes one JSON file per set plus an index, so the Icon fundamental can draw any of them and a page only loads
 * the set it uses. Source packages are dev dependencies installed through the approved npm proxy; nothing is fetched.
 *
 *   node tools/icon-sets.mjs          write packages/core/icons/sets/*.json
 *   node tools/icon-sets.mjs --check  fail when the written files are stale
 *
 * Every SVG is reduced to a whitelist of shape elements and geometry/paint attributes; colours become currentColor.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = (p) => join(root, 'node_modules', p);
const out = join(root, 'packages', 'core', 'icons', 'sets');
const check = process.argv.includes('--check');

// The semantic names the library draws (packages/core/icons/icons.ts), each with candidates per set, first found wins.
const NAMES = ['check', 'close', 'chevron-start', 'chevron-end', 'chevron-down', 'external', 'info', 'success', 'warning', 'error', 'plus', 'minus', 'search', 'menu', 'scheme-light', 'scheme-dark', 'contrast-standard', 'contrast-more', 'comment', 'copy'];

const sets = [
  {
    id: 'fluent',
    name: 'Fluent UI System Icons',
    author: 'Microsoft',
    licence: 'MIT',
    licenceUrl: 'https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE',
    pkg: '@fluentui/svg-icons',
    description: 'Microsoft’s product icons: friendly rounded geometry drawn on a 24 px grid, in regular and filled.',
    styles: [
      { id: 'regular', label: 'Regular' },
      { id: 'filled', label: 'Filled' },
    ],
    file: (style, n) => nm(`@fluentui/svg-icons/icons/${n}_24_${style}.svg`),
    map: { check: ['checkmark'], close: ['dismiss'], 'chevron-start': ['chevron_left'], 'chevron-end': ['chevron_right'], 'chevron-down': ['chevron_down'], external: ['open'], info: ['info'], success: ['checkmark_circle'], warning: ['warning'], error: ['dismiss_circle'], plus: ['add'], minus: ['subtract'], search: ['search'], menu: ['line_horizontal_3'], 'scheme-light': ['weather_sunny'], 'scheme-dark': ['weather_moon'], 'contrast-standard': ['circle_half_fill'], 'contrast-more': ['dark_theme'], comment: ['comment'], copy: ['copy'] },
  },
  {
    id: 'material',
    name: 'Material Symbols',
    author: 'Google',
    licence: 'Apache-2.0',
    licenceUrl: 'https://github.com/google/material-design-icons/blob/master/LICENSE',
    pkg: '@material-symbols/svg-400',
    description: 'Google’s variable icon family at weight 400, in three shapes: outlined, rounded and sharp, each with a filled form.',
    styles: [
      { id: 'outlined', label: 'Outlined' },
      { id: 'rounded', label: 'Rounded' },
      { id: 'sharp', label: 'Sharp' },
      { id: 'rounded-fill', label: 'Rounded, filled' },
    ],
    file: (style, n) => (style === 'rounded-fill' ? nm(`@material-symbols/svg-400/rounded/${n}-fill.svg`) : nm(`@material-symbols/svg-400/${style}/${n}.svg`)),
    map: { check: ['check'], close: ['close'], 'chevron-start': ['chevron_left'], 'chevron-end': ['chevron_right'], 'chevron-down': ['keyboard_arrow_down', 'expand_more'], external: ['open_in_new'], info: ['info'], success: ['check_circle'], warning: ['warning'], error: ['cancel'], plus: ['add'], minus: ['remove'], search: ['search'], menu: ['menu'], 'scheme-light': ['light_mode'], 'scheme-dark': ['dark_mode'], 'contrast-standard': ['contrast'], 'contrast-more': ['tonality', 'contrast_circle'], comment: ['comment', 'chat'], copy: ['content_copy'] },
  },
  {
    id: 'tabler',
    name: 'Tabler Icons',
    author: 'Paweł Kuna',
    licence: 'MIT',
    licenceUrl: 'https://github.com/tabler/tabler-icons/blob/main/LICENSE',
    pkg: '@tabler/icons',
    description: 'A large, even 2 px stroke set on a 24 px grid; a filled form for many glyphs.',
    styles: [
      { id: 'outline', label: 'Outline' },
      { id: 'filled', label: 'Filled' },
    ],
    file: (style, n) => nm(`@tabler/icons/icons/${style}/${n}.svg`),
    map: { check: ['check'], close: ['x'], 'chevron-start': ['chevron-left'], 'chevron-end': ['chevron-right'], 'chevron-down': ['chevron-down'], external: ['external-link'], info: ['info-circle'], success: ['circle-check'], warning: ['alert-triangle'], error: ['circle-x'], plus: ['plus'], minus: ['minus'], search: ['search'], menu: ['menu-2'], 'scheme-light': ['sun'], 'scheme-dark': ['moon'], 'contrast-standard': ['contrast'], 'contrast-more': ['contrast-2'], comment: ['message'], copy: ['copy'] },
  },
  {
    id: 'phosphor',
    name: 'Phosphor',
    author: 'Helena Zhang and Tobias Fried',
    licence: 'MIT',
    licenceUrl: 'https://github.com/phosphor-icons/core/blob/main/LICENSE',
    pkg: '@phosphor-icons/core',
    description: 'A flexible family in six weights, from thin to bold, plus fill and two-tone duotone.',
    styles: [
      { id: 'regular', label: 'Regular' },
      { id: 'thin', label: 'Thin' },
      { id: 'light', label: 'Light' },
      { id: 'bold', label: 'Bold' },
      { id: 'fill', label: 'Fill' },
      { id: 'duotone', label: 'Duotone' },
    ],
    file: (style, n) => nm(`@phosphor-icons/core/assets/${style}/${n}${style === 'regular' ? '' : `-${style}`}.svg`),
    map: { check: ['check'], close: ['x'], 'chevron-start': ['caret-left'], 'chevron-end': ['caret-right'], 'chevron-down': ['caret-down'], external: ['arrow-square-out'], info: ['info'], success: ['check-circle'], warning: ['warning'], error: ['x-circle'], plus: ['plus'], minus: ['minus'], search: ['magnifying-glass'], menu: ['list'], 'scheme-light': ['sun'], 'scheme-dark': ['moon'], 'contrast-standard': ['circle-half'], 'contrast-more': ['circle-half-tilt'], comment: ['chat-centered-text'], copy: ['copy'] },
  },
  {
    id: 'heroicons',
    name: 'Heroicons',
    author: 'Tailwind Labs',
    licence: 'MIT',
    licenceUrl: 'https://github.com/tailwindlabs/heroicons/blob/master/LICENSE',
    pkg: 'heroicons',
    description: 'Hand-crafted by the makers of Tailwind CSS: outline and solid at 24 px, mini at 20 and micro at 16.',
    styles: [
      { id: 'outline', label: 'Outline' },
      { id: 'solid', label: 'Solid' },
      { id: 'mini', label: 'Mini (20 px)' },
      { id: 'micro', label: 'Micro (16 px)' },
    ],
    file: (style, n) => nm(`heroicons/${{ outline: '24/outline', solid: '24/solid', mini: '20/solid', micro: '16/solid' }[style]}/${n}.svg`),
    map: { check: ['check'], close: ['x-mark'], 'chevron-start': ['chevron-left'], 'chevron-end': ['chevron-right'], 'chevron-down': ['chevron-down'], external: ['arrow-top-right-on-square'], info: ['information-circle'], success: ['check-circle'], warning: ['exclamation-triangle'], error: ['x-circle'], plus: ['plus'], minus: ['minus'], search: ['magnifying-glass'], menu: ['bars-3'], 'scheme-light': ['sun'], 'scheme-dark': ['moon'], 'contrast-standard': [], 'contrast-more': [], comment: ['chat-bubble-bottom-center-text'], copy: ['document-duplicate'] },
  },
  {
    id: 'bootstrap',
    name: 'Bootstrap Icons',
    author: 'The Bootstrap Authors',
    licence: 'MIT',
    licenceUrl: 'https://github.com/twbs/icons/blob/main/LICENSE',
    pkg: 'bootstrap-icons',
    description: 'Bootstrap’s own set on a 16 px grid, in regular and fill.',
    styles: [
      { id: 'regular', label: 'Regular' },
      { id: 'fill', label: 'Fill' },
    ],
    file: (style, n) => nm(`bootstrap-icons/icons/${n}${style === 'fill' ? '-fill' : ''}.svg`),
    map: { check: ['check-lg'], close: ['x-lg'], 'chevron-start': ['chevron-left'], 'chevron-end': ['chevron-right'], 'chevron-down': ['chevron-down'], external: ['box-arrow-up-right'], info: ['info-circle'], success: ['check-circle'], warning: ['exclamation-triangle'], error: ['x-circle'], plus: ['plus-lg'], minus: ['dash-lg'], search: ['search'], menu: ['list'], 'scheme-light': ['sun'], 'scheme-dark': ['moon'], 'contrast-standard': ['circle-half'], 'contrast-more': ['yin-yang'], comment: ['chat-left-text'], copy: ['copy'] },
  },
  {
    id: 'iconoir',
    name: 'Iconoir',
    author: 'Luca Burgio and contributors',
    licence: 'MIT',
    licenceUrl: 'https://github.com/iconoir-icons/iconoir/blob/main/LICENSE',
    pkg: 'iconoir',
    description: 'A light, airy 1.5 px stroke set on a 24 px grid, in regular and solid.',
    styles: [
      { id: 'regular', label: 'Regular' },
      { id: 'solid', label: 'Solid' },
    ],
    file: (style, n) => nm(`iconoir/icons/${style}/${n}.svg`),
    map: { check: ['check'], close: ['xmark'], 'chevron-start': ['nav-arrow-left'], 'chevron-end': ['nav-arrow-right'], 'chevron-down': ['nav-arrow-down'], external: ['open-new-window'], info: ['info-circle'], success: ['check-circle'], warning: ['warning-triangle'], error: ['xmark-circle'], plus: ['plus'], minus: ['minus'], search: ['search'], menu: ['menu'], 'scheme-light': ['sun-light'], 'scheme-dark': ['half-moon'], 'contrast-standard': ['contrast'], 'contrast-more': [], comment: ['chat-lines'], copy: ['copy'] },
  },
];

const excluded = [
  { name: 'Lucide', licence: 'ISC', reason: 'ISC, not MIT or Apache-2.0 (owner’s rule, 2026-11-07); include only if the owner widens the list.' },
  { name: 'Remix Icon', licence: 'Remix Icon License v1.0', reason: 'Its npm metadata still says Apache-2.0, but the licence file shipped since 2026 (v4.9) is the custom Remix Icon License v1.0, not Apache-2.0.' },
];

const SHAPES = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g']);
const ATTRS = new Set(['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points', 'transform', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'fill-rule', 'clip-rule', 'opacity', 'fill-opacity', 'stroke-opacity']);
const PAINT = (v) => (v === 'none' ? 'none' : 'currentColor');
const camel = (a) => a.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function attrs(text) {
  const o = {};
  for (const m of text.matchAll(/([a-zA-Z:-]+)\s*=\s*"([^"]*)"/g)) o[m[1]] = m[2];
  return o;
}

function clean(a) {
  const o = {};
  for (const [k, v] of Object.entries(a)) {
    if (!ATTRS.has(k)) continue;
    o[camel(k)] = k === 'fill' || k === 'stroke' ? PAINT(v) : v;
  }
  return o;
}

/** SVG text → { v: viewBox, g: root paint, c: [tag, attrs, children?][] }. */
function parse(svg) {
  const open = svg.match(/<svg\b([^>]*)>/);
  const rootA = attrs(open[1]);
  const body = svg.slice(open.index + open[0].length, svg.lastIndexOf('</svg>'));
  const stack = [{ c: [] }];
  for (const m of body.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    const [, close, tag, rest, self] = m;
    if (close) {
      if (SHAPES.has(tag)) stack.pop();
      continue;
    }
    if (!SHAPES.has(tag)) continue;
    const a = clean(attrs(rest));
    // Tabler's invisible bounding square.
    if (tag === 'path' && a.d === 'M0 0h24v24H0z' && a.fill === 'none') continue;
    const node = [tag, a];
    stack[stack.length - 1].c.push(node);
    if (!self && tag === 'g') {
      node[2] = [];
      stack.push({ c: node[2] });
    }
  }
  const g = {
    fill: rootA.fill ? PAINT(rootA.fill) : 'currentColor',
    stroke: rootA.stroke ? PAINT(rootA.stroke) : 'none',
  };
  for (const k of ['stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'fill-rule', 'clip-rule']) if (rootA[k]) g[camel(k)] = rootA[k];
  return { v: rootA.viewBox ?? `0 0 ${rootA.width ?? 24} ${rootA.height ?? 24}`, g, c: stack[0].c };
}

const versionOf = (pkg) => JSON.parse(readFileSync(nm(`${pkg}/package.json`), 'utf8')).version;

const index = { $comment: 'Generated by tools/icon-sets.mjs; do not edit. Owner Q36: MIT or Apache-2.0 sets only, each licence read from its official source.', names: NAMES, sets: [], excluded };
const files = {};
for (const set of sets) {
  if (!existsSync(nm(set.pkg))) throw new Error(`${set.pkg} is not installed: run npm install (approved proxy).`);
  const data = { id: set.id, styles: {} };
  const styles = [];
  for (const style of set.styles) {
    const icons = {};
    const gaps = [];
    for (const name of NAMES) {
      const hit = (set.map[name] ?? []).find((n) => existsSync(set.file(style.id, n)));
      if (hit) icons[name] = { ...parse(readFileSync(set.file(style.id, hit), 'utf8')), from: hit };
      else gaps.push(name);
    }
    data.styles[style.id] = icons;
    styles.push({ ...style, covered: NAMES.length - gaps.length, gaps });
  }
  files[`${set.id}.json`] = `${JSON.stringify(data)}\n`;
  index.sets.push({ id: set.id, name: set.name, author: set.author, licence: set.licence, licenceUrl: set.licenceUrl, package: set.pkg, version: versionOf(set.pkg), description: set.description, styles, bytes: files[`${set.id}.json`].length });
}
files['index.json'] = `${JSON.stringify(index, null, 2)}\n`;

let stale = 0;
mkdirSync(out, { recursive: true });
for (const [name, text] of Object.entries(files)) {
  const path = join(out, name);
  const same = existsSync(path) && readFileSync(path, 'utf8') === text;
  if (check) {
    if (!same) {
      stale++;
      console.error(`stale: packages/core/icons/sets/${name}`);
    }
  } else if (!same) writeFileSync(path, text);
}
if (check && stale) process.exit(1);
for (const s of index.sets) console.log(`${s.id}: ${(s.bytes / 1024).toFixed(1)} KB; ${s.styles.map((st) => `${st.id} ${st.covered}/${NAMES.length}${st.gaps.length ? ` (gaps: ${st.gaps.join(', ')})` : ''}`).join('; ')}`);
console.log(check ? 'icon sets: up to date' : 'icon sets: wrote packages/core/icons/sets');
