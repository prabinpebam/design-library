#!/usr/bin/env node
/**
 * check-build-css: fails when a production build has polyfilled `light-dark()`.
 *
 * Core declares every colour token as a native `light-dark()` pair on `:root` (and templates on `[data-template]`), and a
 * nested `[data-scheme]` region only sets `color-scheme`. That works only while `light-dark()` stays native: a minifier's
 * fallback (Lightning CSS writes `var(--lightningcss-light, a) var(--lightningcss-dark, b)`) resolves each token where it's
 * declared, so every nested scheme region inherits the outer scheme's colours in the build but not on the dev server.
 * Fix it in the bundler, e.g. Vite: `css: { lightningcss: { exclude: Features.LightDark } }` (packages/core/AGENTS.md).
 *
 * Usage: node check-build-css.mjs <build folder> [more folders]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dirs = process.argv.slice(2);
if (!dirs.length) {
  console.error('Usage: node check-build-css.mjs <build folder> [more folders]');
  process.exit(2);
}
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : /\.css$/.test(n) ? [p] : [];
});
const bad = [];
let files = 0;
for (const d of dirs) for (const f of walk(d)) {
  files++;
  const n = (readFileSync(f, 'utf8').match(/--lightningcss-(?:light|dark)\b/g) || []).length;
  if (n) bad.push(`${relative(process.cwd(), f)}: ${n} polyfilled light-dark() switches`);
}
if (bad.length) {
  console.error(`check-build-css: light-dark() was polyfilled, so nested [data-scheme] regions take the outer scheme in this build.\n  ${bad.join('\n  ')}\n  Keep it native in the bundler, e.g. Vite css.lightningcss.exclude = Features.LightDark.`);
  process.exit(1);
}
console.log(`check-build-css: ${files} CSS files, light-dark() native.`);
