#!/usr/bin/env node
/**
 * design-library-check-svg (MP22, owner Q112): SVG files a site draws as pictures or illustrations, checked before
 * they ship.
 *
 *   npx design-library-check-svg                 every .svg under src/ (and public/)
 *   npx design-library-check-svg assets art      the folders or files given
 *
 * Every file: no script, event attribute (`on…`), `foreignObject`, embedded image, external reference (`href` or
 * `url()` not starting with `#`) or `@import`; a `viewBox`; no SMIL (`animate`, `animateMotion`, `animateTransform`,
 * `set`) and no `@keyframes`, so reduced motion can't be bypassed: an illustration moves only through the library's
 * own motion parts (`data-motion`, ID43).
 * Token art (a file whose shapes use the role classes `ink`, `muted`, `fill`, `surface`, `accent`, ID41): colours come
 * only from those classes, so no literal colour in `fill`, `stroke`, `stop-color`, `color` or a `style`, and no
 * `<style>` element. `data-size` names only `compact`, `regular` or `wide` (ID42); `data-motion` only `float`, `pulse`,
 * `draw`, `fade` or `spin` (ID43).
 * Each finding names the file, the element and the fix. Exit code 1 when any file fails. `checkSvg(text)` is exported
 * for the content check.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROLE_CLASSES = ['ink', 'muted', 'fill', 'surface', 'accent'];
export const SIZE_GROUPS = ['compact', 'regular', 'wide'];
export const MOTIONS = ['float', 'pulse', 'draw', 'fade', 'spin'];

const UNSAFE = [
  [/<script\b/i, '<script>', 'remove the script; an illustration is shapes only'],
  [/<[a-zA-Z][^>]*\son[a-z]+\s*=/i, 'an event attribute (on…)', 'remove it; behaviour belongs to the component, not the file'],
  [/<foreignObject\b/i, '<foreignObject>', 'draw it as shapes'],
  [/<image\b/i, 'an embedded <image>', 'use a separate picture (Image) instead of one inside the drawing'],
  [/@import\b/i, '@import', 'remove it; styles come from the library'],
  [/(?:xlink:)?href\s*=\s*["'](?!#)/i, 'an external reference (href)', 'refer only to ids inside the file (#id)'],
  [/url\(\s*["']?(?!#)/i, 'an external url()', 'refer only to ids inside the file (url(#id))'],
];
const SMIL = /<(animate|animateMotion|animateTransform|set)\b/i;
const LITERAL = /^(?!none$|currentColor$|inherit$|transparent$|url\(#)/i;
const elementAt = (text, index) => text.slice(text.lastIndexOf('<', index), text.indexOf('>', index) + 1).slice(0, 80);

/** The problems in one SVG file's text: `{ where, problem, fix }[]`. */
export function checkSvg(text) {
  const out = [];
  const add = (where, problem, fix) => out.push({ where, problem, fix });
  for (const [re, what, fix] of UNSAFE) {
    const m = text.match(re);
    if (m) add(elementAt(text, m.index ?? 0), `has ${what}`, fix);
  }
  const root = text.match(/<svg\b[^>]*>/i);
  if (!root) return [{ where: '(file)', problem: 'has no <svg> element', fix: 'export it again as SVG' }];
  if (!/\sviewBox\s*=/.test(root[0])) add(root[0].slice(0, 80), 'has no viewBox', 'add viewBox="0 0 {width} {height}" so it scales to its frame');
  const smil = text.match(SMIL);
  if (smil) add(elementAt(text, smil.index ?? 0), `animates itself (<${smil[1]}>)`, 'remove it and mark the part with data-motion (float, pulse, draw, fade, spin); the library moves it and holds it still under reduced motion');
  if (/@keyframes\b/i.test(text)) add('<style>', 'has its own @keyframes', 'remove them and mark the part with data-motion; the library moves it and holds it still under reduced motion');
  for (const m of text.matchAll(/\sdata-size\s*=\s*["']([^"']*)["']/g))
    if (!SIZE_GROUPS.includes(m[1])) add(elementAt(text, m.index ?? 0), `data-size="${m[1]}" isn't a size group`, `use one of: ${SIZE_GROUPS.join(', ')}`);
  for (const m of text.matchAll(/\sdata-motion\s*=\s*["']([^"']*)["']/g))
    if (!MOTIONS.includes(m[1])) add(elementAt(text, m.index ?? 0), `data-motion="${m[1]}" isn't a motion`, `use one of: ${MOTIONS.join(', ')}`);
  const tokenArt = [...text.matchAll(/\sclass\s*=\s*["']([^"']*)["']/g)].some((m) => m[1].split(/\s+/).some((c) => ROLE_CLASSES.includes(c)));
  if (tokenArt) {
    const style = text.match(/<style\b/i);
    if (style) add('<style>', 'token art carries its own styles', `remove them; colours come from the role classes (${ROLE_CLASSES.join(', ')})`);
    for (const m of text.matchAll(/\s(fill|stroke|stop-color|color)\s*=\s*["']([^"']*)["']/g))
      if (LITERAL.test(m[2].trim())) add(elementAt(text, m.index ?? 0), `token art has a literal ${m[1]} "${m[2]}"`, `remove it and give the shape a role class (${ROLE_CLASSES.join(', ')}), or currentColor`);
    for (const m of text.matchAll(/\sstyle\s*=\s*["']([^"']*)["']/g))
      for (const d of m[1].matchAll(/(fill|stroke|stop-color|color)\s*:\s*([^;]+)/g))
        if (LITERAL.test(d[2].trim())) add(elementAt(text, m.index ?? 0), `token art has a literal ${d[1]} "${d[2].trim()}" in a style`, `remove it and give the shape a role class (${ROLE_CLASSES.join(', ')})`);
  }
  return out;
}

function walk(path) {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return path.toLowerCase().endsWith('.svg') ? [path] : [];
  return readdirSync(path).flatMap((n) => (n === 'node_modules' || n === 'dist' || n.startsWith('.') ? [] : walk(join(path, n))));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const given = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const roots = (given.length ? given : ['src', 'public']).map((p) => resolve(p));
  const files = roots.flatMap(walk);
  let failed = 0;
  for (const f of files) {
    const problems = checkSvg(readFileSync(f, 'utf8'));
    if (problems.length) failed++;
    for (const p of problems) console.error(`  ${relative(process.cwd(), f).replace(/\\/g, '/')} · ${p.where} · ${p.problem} · ${p.fix}`);
  }
  console.log(`check-svg: ${files.length} SVG files${failed ? `, ${failed} with problems (above)` : ', all clean'}.`);
  process.exit(failed ? 1 : 0);
}
