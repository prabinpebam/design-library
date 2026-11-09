#!/usr/bin/env node
// @ts-check
/**
 * Clipping check (owner F13b, 2026-11-07; docs/foundation.md#clipping). Dependency-free.
 *
 *   node tools/check-clipping.mjs            fail (exit 1) on a clip that isn't on the allow-list
 *   node tools/check-clipping.mjs --report   also list every allowed clip and every scroll region with its reason
 *
 * Clipping is a decision, not a side effect: `overflow` (and `-x`/`-y`) `hidden` or `clip`, `clip-path`, `contain`
 * with paint (`paint`, `content`, `strict`) and `text-overflow` may appear only in a rule on the named list below,
 * each with its reason, in tools/clipping-allow.json.
 *
 * Scroll regions (owner F14, Q96): every scroll region is a ScrollArea. `overflow: auto | scroll` may appear only in
 * ScrollArea's own stylesheet, and in a region listed in `scrollRegions` whose own controls replace the bar (it carries
 * `data-scrollbar="none"`, e.g. Carousel's track). Anything else draws the browser's bar beside the content and fails
 * with the fix: wrap the region in ScrollArea. Checked in core, library, template and example stylesheets, and in
 * inline styles in their TSX. In the browser, tools/scroll-probe.js flags any element that scrolls outside a
 * ScrollArea (docs/scrolling.md).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOTS = ['packages/core/css', 'apps/library/src', 'packages/templates', 'apps/example/src'];
const SKIP = new Set(['packages/core/css/tokens.css']);

const LIST = JSON.parse(readFileSync(join(ROOT, 'tools/clipping-allow.json'), 'utf8'));
/** Allowed clips: file, a selector fragment, the kind and the reason (tools/clipping-allow.json, also read by the library's Clipping page). */
/** @type {{ file: string, selector: string, kind: string, reason: string }[]} */
export const ALLOWED = LIST.clips;
/** Barless scroll regions: their own controls replace the bar (`data-scrollbar="none"`); each with its reason. */
/** @type {{ file: string, selector: string, reason: string }[]} */
export const SCROLL_REGIONS = LIST.scrollRegions;

const walk = (/** @type {string} */ dir, /** @type {string} */ ext = '.css') =>
  readdirSync(join(ROOT, dir)).flatMap((/** @type {string} */ name) => {
    if (name === 'node_modules' || name === 'dist') return [];
    const rel = `${dir}/${name}`;
    return statSync(join(ROOT, rel)).isDirectory() ? walk(rel, ext) : name.endsWith(ext) ? [rel] : [];
  });

const CLIP = /(?:^|;|\s)(overflow(?:-x|-y)?\s*:\s*(?:hidden|clip)\b|clip-path\s*:\s*(?!none)[^;]+|contain\s*:\s*[^;]*\b(?:paint|content|strict)\b|text-overflow\s*:\s*(?!clip\b)[^;]+)/g;
const SCROLL = /overflow(?:-x|-y)?\s*:\s*(?:auto|scroll)\b/;
/** Scrollbar styling lives in one place, ScrollArea (owner F14): anything else fails. */
const SCROLLBAR_HOME = 'packages/core/css/fundamentals/scroll-area.css';
const SCROLLBAR = /::-webkit-scrollbar|(?:^|[;\s{])scrollbar-(?:width|color|gutter)\s*:/;

export function clips() {
  const problems = [];
  const used = new Set();
  for (const file of ROOTS.flatMap((d) => walk(d)).filter((f) => !SKIP.has(f))) {
    const text = readFileSync(join(ROOT, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const rule of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = rule[1].trim().replace(/\s+/g, ' ');
      const line = text.slice(0, rule.index).split('\n').length;
      if (file !== SCROLLBAR_HOME && (SCROLLBAR.test(rule[1]) || SCROLLBAR.test(rule[2]))) problems.push(`${file}:${line}: scrollbar styling on ${selector}: scrollbars are drawn only by ScrollArea (${SCROLLBAR_HOME}); wrap the region in ScrollArea instead`);
      const allowedBy = (/** @type {{ file: string, selector: string }[]} */ list) => list.find((a) => a.file === file && selector.includes(a.selector));
      for (const m of rule[2].matchAll(CLIP)) {
        const a = allowedBy(ALLOWED);
        if (a) used.add(a);
        else problems.push(`${file}:${line}: ${m[1].trim()} on ${selector}: not on the clipping allow-list (tools/check-clipping.mjs ALLOWED); remove it, or add it with its reason`);
      }
      if (SCROLL.test(rule[2]) && file !== SCROLLBAR_HOME) {
        const s = allowedBy(SCROLL_REGIONS);
        if (s) used.add(s);
        else problems.push(`${file}:${line}: a raw scroll region on ${selector} draws the browser's scrollbar: wrap the region in ScrollArea (packages/core/react/fundamentals/ScrollArea.tsx; axis, maxSize, inset, contain) and move its padding to the content inside`);
      }
    }
  }
  // Inline styles in components, templates and the library (Q96): no scroll region outside ScrollArea there either.
  for (const file of ['packages/core/react', 'packages/templates', 'apps/library/src', 'apps/example/src'].flatMap((d) => walk(d, '.tsx'))) {
    const text = readFileSync(join(ROOT, file), 'utf8');
    for (const m of text.matchAll(/overflow(?:X|Y|Block|Inline)?\s*:\s*['"`](?:auto|scroll)['"`]/g)) {
      const line = text.slice(0, m.index).split('\n').length;
      problems.push(`${file}:${line}: an inline scroll region (${m[0]}) draws the browser's scrollbar: wrap the region in ScrollArea instead`);
    }
  }
  for (const a of [...ALLOWED, ...SCROLL_REGIONS]) if (!used.has(a)) problems.push(`${a.file}: listed ${a.selector} no longer clips; remove it from the list`);
  return { problems };
}

function main(/** @type {string[]} */ argv) {
  const { problems } = clips();
  if (argv.includes('--report')) {
    for (const a of ALLOWED) console.log(`clip  ${a.kind.padEnd(16)} ${a.selector}  (${a.file}): ${a.reason}`);
    for (const s of SCROLL_REGIONS) console.log(`scroll ${s.selector}  (${s.file}): ${s.reason}`);
  }
  for (const p of problems) console.error(`✗ ${p}`);
  if (!problems.length) console.log(`clipping: every clip is on the list (${ALLOWED.length} allowed, ${SCROLL_REGIONS.length} scroll regions)`);
  return problems.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
