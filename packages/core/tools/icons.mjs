#!/usr/bin/env node
/**
 * design-library-icons (MP26, owner Q113): turns a folder of a brand's SVG icons into icon data for `Icon`.
 *
 *   npx design-library-icons src/brand/icons --out src/brand/icons.json [--id brand] [--name "Brand"] [--licence "Own work"]
 *   npx design-library-icons src/brand/icons --out src/brand/icons.json --check     fails when the output is stale
 *
 * Each file is named by the semantic icon name it replaces (`close.svg`, `chevron-down.svg`); names are the library's
 * own (`icons/icons.ts`), so one file changes that icon wherever components and layouts draw it. The output is plain
 * JSON: `{ id, name, licence, glyphs }`, each glyph `{ v, g, c, from }` (the shape the curated sets use), ready for
 * `registerIconSet` (a whole set) or, as its `glyphs`, for `setIconOverrides` and `IconOverrides` (just a few).
 *
 * Every file is reduced to shape elements and geometry attributes; every paint becomes `currentColor` (or stays
 * `none`), so the icon follows the text colour in every scheme and in forced colours. A file with a script, an event
 * attribute, `foreignObject`, an embedded image, an external reference or `@import` is refused, as is one without a
 * `viewBox` or size. A file whose name isn't a semantic name is reported with the nearest names. Exit code 1 when any
 * file is refused or misnamed; the rest are still written.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// The library's semantic names, read from the package's own icon data, and star, Rating's mark (MP24).
const NAMES = [...[...readFileSync(join(here, '..', 'icons', 'icons.ts'), 'utf8').matchAll(/^ {2}'?([a-z][a-z0-9-]*)'?: \{/gm)].map((m) => m[1]), 'star'];
const args = process.argv.slice(2);
if (args.includes('--names')) {
  console.log(NAMES.join('\n'));
  process.exit(0);
}
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const folder = args.find((a, i) => !a.startsWith('--') && !['--out', '--id', '--name', '--licence'].includes(args[i - 1]));
if (!folder || args.includes('--help')) {
  console.log('Usage: design-library-icons <folder of name.svg files> --out <file.json> [--id brand] [--name "Brand"] [--licence "Own work"] [--check]');
  process.exit(folder ? 0 : 2);
}
const dir = resolve(folder);
const out = resolve(flag('--out') ?? join(dir, 'icons.json'));
const check = args.includes('--check');
const rel = (p) => relative(process.cwd(), p) || '.';
if (!existsSync(dir)) {
  console.error(`design-library-icons: ${rel(dir)} doesn't exist`);
  process.exit(2);
}

const SHAPES = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g']);
const ATTRS = new Set(['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points', 'transform', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'fill-rule', 'clip-rule', 'opacity', 'fill-opacity', 'stroke-opacity']);
const ROOT_PAINT = ['stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'fill-rule', 'clip-rule'];
const UNSAFE = [
  [/<script\b/i, 'a script'],
  [/\son[a-z]+\s*=/i, 'an event attribute (on…)'],
  [/<foreignObject\b/i, 'foreignObject'],
  [/<image\b/i, 'an embedded image'],
  [/@import\b/i, '@import'],
  [/(?:xlink:)?href\s*=\s*["'](?!#)/i, 'an external reference (href)'],
  [/url\(\s*["']?(?!#)/i, 'an external url()'],
];
const PAINT = (v) => (v === 'none' ? 'none' : 'currentColor');
const camel = (a) => a.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function attrs(text) {
  const o = {};
  for (const m of text.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) o[m[1]] = m[2] ?? m[3];
  return o;
}

function clean(a) {
  const o = {};
  for (const [k, v] of Object.entries(a)) if (ATTRS.has(k)) o[camel(k)] = k === 'fill' || k === 'stroke' ? PAINT(v) : v;
  return o;
}

/** SVG text → { glyph: { v, g, c }, dropped: tag names not drawn } or { refused: reason }. */
function parse(svg) {
  for (const [re, what] of UNSAFE) if (re.test(svg)) return { refused: `has ${what}` };
  const open = svg.match(/<svg\b([^>]*)>/i);
  if (!open) return { refused: 'has no <svg> element' };
  const root = attrs(open[1]);
  const v = root.viewBox ?? (root.width && root.height ? `0 0 ${parseFloat(root.width)} ${parseFloat(root.height)}` : undefined);
  if (!v) return { refused: 'has no viewBox (or width and height)' };
  const body = svg.slice(open.index + open[0].length, svg.lastIndexOf('</svg>')).replace(/<!--[\s\S]*?-->/g, '');
  const stack = [[]];
  const dropped = new Set();
  let skip = 0; // inside an element that isn't drawn (defs, mask, title…): skip its children too
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9:]*)([^>]*?)(\/?)>/g)) {
    const [, close, tag, rest, self] = m;
    const shape = SHAPES.has(tag);
    if (close) {
      if (!shape) skip = Math.max(0, skip - 1);
      else if (tag === 'g' && !skip) stack.pop();
      continue;
    }
    if (!shape) {
      if (!['title', 'desc'].includes(tag)) dropped.add(tag);
      if (!self) skip++;
      continue;
    }
    if (skip) continue;
    const node = [tag, clean(attrs(rest))];
    stack[stack.length - 1].push(node);
    if (tag === 'g' && !self) {
      node[2] = [];
      stack.push(node[2]);
    }
  }
  const g = { fill: root.fill ? PAINT(root.fill) : 'currentColor', stroke: root.stroke ? PAINT(root.stroke) : 'none' };
  for (const k of ROOT_PAINT) if (root[k]) g[camel(k)] = root[k];
  return { glyph: { v, g, c: stack[0] }, dropped: [...dropped] };
}

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const nearest = (name) => NAMES.map((n) => [n, distance(name, n) - (n.includes(name) || name.includes(n) ? 2 : 0)]).sort((x, y) => x[1] - y[1]).slice(0, 3).map(([n]) => n);

const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.svg')).sort();
const glyphs = {};
const problems = [];
const notes = [];
for (const f of files) {
  const name = basename(f, '.svg').toLowerCase();
  const file = rel(join(dir, f));
  if (!NAMES.includes(name)) {
    problems.push(`${file} · "${name}" isn't an icon name · rename it to one of the names it replaces, such as ${nearest(name).join(', ')} (all names: npx design-library-icons --names)`);
    continue;
  }
  const r = parse(readFileSync(join(dir, f), 'utf8'));
  if (r.refused) {
    problems.push(`${file} · ${r.refused} · remove it and export the icon again as plain shapes`);
    continue;
  }
  if (r.dropped.length) notes.push(`${file} · not drawn: ${r.dropped.map((t) => `<${t}>`).join(', ')} (icons are shapes in one colour)`);
  glyphs[name] = { ...r.glyph, from: basename(f, '.svg') };
}

const data = {
  $comment: `Generated by design-library-icons from ${relative(dirname(out), dir).replace(/\\/g, '/') || '.'}; do not edit. Paint is currentColor so each icon follows the text colour.`,
  id: flag('--id') ?? 'brand',
  name: flag('--name') ?? 'Brand icons',
  licence: flag('--licence') ?? 'Own work',
  glyphs,
};
const text = `${JSON.stringify(data, null, 2)}\n`;

for (const n of notes) console.log(`  note: ${n}`);
for (const p of problems) console.error(`  ${p}`);
const count = Object.keys(glyphs).length;
if (check) {
  const current = existsSync(out) && readFileSync(out, 'utf8') === text;
  console.log(`design-library-icons: ${rel(out)} ${current ? 'is current' : 'is stale; run without --check'} (${count} of ${files.length} files).`);
  process.exit(current && !problems.length ? 0 : 1);
}
writeFileSync(out, text);
console.log(`design-library-icons: wrote ${rel(out)}: ${count} of ${files.length} files as icons${problems.length ? `, ${problems.length} refused or misnamed (above)` : ''}; every other name falls back to the active set.`);
process.exit(problems.length ? 1 : 0);
