#!/usr/bin/env node
// @ts-check
/**
 * Breakpoints check (IP26, F31, F58). Dependency-free.
 *
 *   node tools/check-breakpoints.mjs            fail (exit 1) when a core window width query is off the set
 *   node tools/check-breakpoints.mjs --report   also list every change point
 *
 * Core CSS and core TSX fail; templates, the library app and the example only warn, so a project's own change point is
 * reported without breaking its build. The rule and the scanner: packages/core/tools/change-points.mjs.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../agentic-craft/tools/build-tokens.mjs';
import { changePoints } from '../packages/core/tools/change-points.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CORE = ['packages/core/css', 'packages/core/react'];
const OTHERS = ['packages/templates', 'apps/library/src', 'apps/example/src'];
const SKIP = new Set(['packages/core/css/tokens.css']);

const walk = (/** @type {string} */ dir) =>
  readdirSync(join(ROOT, dir)).flatMap((/** @type {string} */ name) => {
    if (name === 'node_modules' || name === 'dist') return [];
    const rel = `${dir}/${name}`;
    return statSync(join(ROOT, rel)).isDirectory() ? walk(rel) : /\.(css|tsx?)$/.test(name) && !SKIP.has(rel) ? [rel] : [];
  });

export function breakpointSet() {
  const model = load(join(ROOT, 'packages/core/tokens'));
  /** @type {Record<string, number>} */
  const set = {};
  for (const [path, token] of model.base) {
    if (!path.startsWith('breakpoint.')) continue;
    const v = /** @type {any} */ (token).value;
    const rem = typeof v === 'object' && v ? (v.unit === 'px' ? v.value / 16 : v.value) : Number.parseFloat(String(v));
    if (Number.isFinite(rem)) set[path] = rem;
  }
  return set;
}

function main(/** @type {string[]} */ argv) {
  const set = breakpointSet();
  const read = (/** @type {string[]} */ roots) => roots.flatMap(walk).map((path) => ({ path, text: readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n') }));
  const core = changePoints(read(CORE), set);
  const others = changePoints(read(OTHERS), set);
  const show = (/** @type {import('../packages/core/tools/change-points.mjs').ChangePoint} */ p) => `${p.file}:${p.line}: ${p.scope} ${p.edge}-${p.axis} ${p.rem}rem${p.token ? ` = ${p.token}` : ''}${p.reason ? ` (${p.reason})` : ''}`;
  if (argv.includes('--report')) for (const p of [...core, ...others]) console.log(`${p.ok ? ' ' : '✗'} ${show(p)}`);
  const fails = core.filter((p) => !p.ok);
  for (const p of fails) console.error(`✗ ${show(p)}: use a breakpoint.* value (${Object.entries(set).map(([k, v]) => `${k.slice(11)} ${v}rem`).join(', ')}) or say why above it with /* tied to … */`);
  for (const p of others.filter((x) => !x.ok)) console.warn(`! ${show(p)}: off the breakpoint set (warning)`);
  if (!fails.length) {
    const window = core.filter((p) => p.scope === 'window' && p.axis === 'width');
    console.log(`breakpoints: ${window.length} core window width queries, ${window.filter((p) => p.token).length} on the set and ${window.filter((p) => !p.token).length} tied to a component's own size; ${core.filter((p) => p.scope === 'container').length} container queries; ${others.filter((p) => !p.ok).length} warnings outside core`);
  }
  return fails.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
