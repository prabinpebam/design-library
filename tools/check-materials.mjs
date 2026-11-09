#!/usr/bin/env node
/**
 * Materials check (Q73, docs/materials.md MB7: AV1, AR7, AR9, AR10, AR12).
 *
 *   node tools/check-materials.mjs          report, fail on any finding
 *   node tools/check-materials.mjs --json  machine-readable result
 *
 * Reads the product CSS (packages/core/css, packages/templates, apps/library) and the resolved tokens:
 *   M1  backdrop-filter only as var(--material-backdrop) (or none); one blur value, at most 24 px, in materials.css (AR10)
 *   M2  no translucent backgrounds outside materials.css: no rgba/hsla, no `/ alpha` colour, no mix with transparent
 *       (scrims and the veil are colour or material roles, never literals)
 *   M3  a rule that reads a frosted material fill also writes the backdrop, and the other way round (one recipe)
 *   M4  frosted only on the FR places: every file that reads --material-chrome-bg / --material-floating-bg is listed
 *       below with its FR row; a new reader must be added here on purpose
 *   M5  never animate or transition backdrop-filter (AR12)
 *   M6  materials.css keeps the AR7 nesting rule and the forced-solid fallbacks (AR2-AR6)
 *   M7  the tint floor (AR9): text and text-muted 4.5:1, focus and border-strong 3:1, on each frosted fill composited
 *       over a uniform black and a uniform white backdrop, light and dark, with no help from the blur
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const rel = (p) => relative(root, p).split(sep).join('/');
const MATERIALS = 'packages/core/css/materials.css';
const GENERATED = new Set(['packages/core/css/tokens.css']);
/** M1 exceptions, each with its reason: the Materials page specimen draws a material token by name (TokenSpecimen sets --specimen-filter to var(--material-backdrop)). */
const backdropExceptions = new Map([['packages/core/css/compounds/token-specimen.css', 'var(--specimen-filter, none)']]);

/** M4: the frosted places (docs/materials.md "Where frosted applies"). */
const frostedPlaces = new Map([
  ['packages/core/css/fundamentals/popover.css', 'FR4 popover'],
  ['packages/core/css/fundamentals/pickers.css', 'FR4 select, menu and mention lists'],
  ['packages/core/css/fundamentals/date-picker.css', 'FR4 date pickers'],
  ['packages/core/css/fundamentals/colour-picker.css', 'FR4 colour picker popover'],
  ['packages/core/css/fundamentals/avatar-group.css', 'FR4 avatar group popup'],
  ['packages/core/css/fundamentals/tooltip.css', 'FR5 tooltips'],
  ['packages/core/css/compounds/floating-bar.css', 'FR3 floating toolbar'],
  ['packages/core/css/compounds/notifications.css', 'FR6 notification pills'],
  ['packages/core/css/compounds/image-generation.css', 'FR6 status pill over a picture'],
  ['packages/core/css/compounds/sheet.css', 'FR7 standard sheets'],
  ['packages/core/css/layouts/chat-layout.css', 'FR7 drawer, FR6 jump button'],
  ['packages/core/css/layouts/app-layout.css', 'FR7 drawer'],
  ['packages/core/css/layouts/library.css', 'FR7 revision pane as a sheet'],
  ['packages/core/css/layouts/site-layout.css', 'FR1 sticky site header'],
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.css')) out.push(p);
  }
  return out;
}

const files = ['packages/core/css', 'packages/templates', 'apps/library/src', 'apps/library/revisions']
  .map((d) => join(root, d))
  .filter((d) => {
    try {
      return statSync(d).isDirectory();
    } catch {
      return false;
    }
  })
  .flatMap((d) => walk(d))
  .filter((p) => !GENERATED.has(rel(p)));

const findings = [];
const add = (rule, file, line, text) => findings.push({ rule, file, line, text: text.trim().slice(0, 160) });

/** Each declaration block with its first line, comments removed (line numbers kept). */
function blocks(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const out = [];
  const re = /\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) out.push({ body: m[1], line: clean.slice(0, m.index).split('\n').length });
  return out;
}

const readers = new Map();
for (const path of files) {
  const file = rel(path);
  const src = readFileSync(path, 'utf8');
  const isMaterials = file === MATERIALS;
  for (const { body, line } of blocks(src)) {
    const decls = body.split(';').map((d) => d.trim()).filter(Boolean);
    const at = (d) => line + body.slice(0, body.indexOf(d)).split('\n').length - 1;
    let readsFill = false;
    let writesBackdrop = false;
    for (const d of decls) {
      const [prop, ...rest] = d.split(':');
      const name = prop.trim();
      const value = rest.join(':').trim();
      if (/^(-webkit-)?backdrop-filter$/.test(name)) {
        if (value !== 'var(--material-backdrop)' && value !== 'none' && backdropExceptions.get(file) !== value) add('M1', file, at(d), d);
        if (value === 'var(--material-backdrop)') writesBackdrop = true;
      }
      if (/^(transition|transition-property|animation|will-change)$/.test(name) && /backdrop-filter/.test(value)) add('M5', file, at(d), d);
      if (/^background(-color)?$/.test(name)) {
        if (/--material-(chrome|floating)-bg/.test(value)) readsFill = true;
        const translucent = /\b(rgba|hsla)\(|\/\s*(0?\.\d+|\d+%)\s*\)|color-mix\([^)]*transparent/.test(value);
        if (translucent && !isMaterials) add('M2', file, at(d), d);
      }
    }
    if (!isMaterials && readsFill !== writesBackdrop && (readsFill || writesBackdrop)) add('M3', file, line, readsFill ? 'reads a frosted fill without var(--material-backdrop)' : 'writes var(--material-backdrop) without a frosted fill');
    if (readsFill && !isMaterials) readers.set(file, (readers.get(file) ?? 0) + 1);
  }
}

for (const file of readers.keys()) if (!frostedPlaces.has(file)) add('M4', file, 1, 'reads a frosted material but is not a listed frosted place (FR1-FR8)');

const materials = readFileSync(join(root, MATERIALS), 'utf8');
const blur = [...materials.replace(/@supports[^{]*/g, '').matchAll(/blur\((\d+(?:\.\d+)?)px\)/g)].map((m) => Number(m[1]));
if (new Set(blur).size > 1) add('M1', MATERIALS, 1, `more than one blur radius: ${[...new Set(blur)].join(', ')} px`);
if (blur.some((b) => b > 24)) add('M1', MATERIALS, 1, `blur above 24 px (AR10): ${Math.max(...blur)} px`);
if (!/\[data-material='floating'\]\s+\[data-material='floating'\]/.test(materials)) add('M6', MATERIALS, 1, 'the AR7 nesting rule is missing');
for (const [label, re] of [
  ['reduced transparency', /prefers-reduced-transparency/],
  ['more contrast', /prefers-contrast:\s*more/],
  ['forced colours', /forced-colors:\s*active/],
  ['no backdrop-filter support', /@supports not/],
  ['solid setting', /\[data-material='solid'\]/],
]) {
  if (!re.test(materials)) add('M6', MATERIALS, 1, `missing the forced-solid fallback: ${label}`);
}

// M7: the tint floor.
const tintMatch = /--material-tint:\s*(\d+(?:\.\d+)?)%/.exec(materials);
const tint = tintMatch ? Number(tintMatch[1]) / 100 : 1;
const resolved = JSON.parse(readFileSync(join(root, 'packages/core/tokens/generated/tokens.resolved.json'), 'utf8'));
const hex = (h) => {
  const v = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
};
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const over = (top, under, alpha) => top.map((c, i) => c * alpha + under[i] * (1 - alpha));
const floors = [];
for (const scheme of ['light', 'dark']) {
  const t = resolved[scheme];
  for (const [fill, role] of [['chrome', 'color.bg'], ['floating', 'color.bg-raised']]) {
    for (const [backdropName, backdrop] of [['black', [0, 0, 0]], ['white', [1, 1, 1]]]) {
      const surface = over(hex(t[role]), backdrop, tint);
      for (const [fg, min] of [['color.text', 4.5], ['color.text-muted', 4.5], ['color.focus', 3], ['color.border-strong', 3]]) {
        const r = ratio(hex(t[fg]), surface);
        floors.push({ scheme, fill, backdrop: backdropName, fg, ratio: Math.round(r * 100) / 100, min });
        if (r < min) add('M7', MATERIALS, 1, `${scheme} ${fill} at ${tint * 100}% over ${backdropName}: ${fg} ${r.toFixed(2)}:1 (needs ${min}:1)`);
      }
    }
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ files: files.length, frostedReaders: Object.fromEntries(readers), tint, floors, findings }, null, 2));
} else {
  const weakest = floors.reduce((a, b) => (b.ratio / b.min < a.ratio / a.min ? b : a));
  console.log(`check-materials: ${files.length} CSS files; ${readers.size} frosted places; tint ${tint * 100}%; ${floors.length} floor pairs, weakest ${weakest.scheme} ${weakest.fill} over ${weakest.backdrop}: ${weakest.fg} ${weakest.ratio}:1 (needs ${weakest.min}:1).`);
  for (const f of findings) console.log(`  ${f.rule} ${f.file}:${f.line}  ${f.text}`);
  console.log(findings.length ? `check-materials: ${findings.length} finding(s). See docs/materials.md "Build plan" MB7.` : 'check-materials: every rule holds.');
}
process.exit(findings.length ? 1 : 0);
