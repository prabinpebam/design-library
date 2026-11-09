#!/usr/bin/env node
// @ts-check
/**
 * Layers check (owner F13a, 2026-11-07; docs/foundation.md#layers-z-index). Dependency-free.
 *
 *   node tools/check-layers.mjs            fail (exit 1) on a broken rule
 *   node tools/check-layers.mjs --report   also list who sits on each layer
 *
 * Rules: every z-index in core and app CSS reads a layer token (`var(--layer-*)`) or a component token that aliases
 * one (`var(--c-*)` → `{layer.*}`), never a number; every component token holding a stacking order aliases a layer;
 * a file using an inside-the-component layer (layer.behind, layer.raised) also declares `isolation: isolate`, so its
 * internal order never leaks; no inline `zIndex` in TSX.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../agentic-craft/tools/build-tokens.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Q78.1: templates (custom parts) and the example consumer too, so a part outside core can't bring its own number.
const CSS_ROOTS = ['packages/core/css', 'apps/library/src', 'packages/templates', 'apps/example/src'];
const TSX_ROOTS = ['packages/core/react', 'apps/library/src', 'packages/templates', 'apps/example/src'];
const SKIP = new Set(['packages/core/css/tokens.css']);
const INSIDE = new Set(['layer.behind', 'layer.raised']);

const walk = (/** @type {string} */ dir, /** @type {RegExp} */ ext) =>
  readdirSync(join(ROOT, dir)).flatMap((/** @type {string} */ name) => {
    if (name === 'node_modules' || name === 'dist') return [];
    const rel = `${dir}/${name}`;
    return statSync(join(ROOT, rel)).isDirectory() ? walk(rel, ext) : ext.test(name) ? [rel] : [];
  });

export function layers() {
  const model = load(join(ROOT, 'packages/core/tokens'));
  /** @type {Map<string, string>} css custom property → the layer token it finally reads */
  const layerOf = new Map();
  const problems = [];
  const follow = (/** @type {string} */ path) => {
    for (let p = path, hops = 0; hops < 8; hops++) {
      if (p.startsWith('layer.')) return p;
      const v = model.base.get(p)?.value;
      const m = typeof v === 'string' && /^\{([^}]+)\}$/.exec(v);
      if (!m) return undefined;
      p = m[1];
    }
    return undefined;
  };
  for (const [path] of model.base) {
    if (path.startsWith('layer.')) layerOf.set(`--${path.replace(/\./g, '-')}`, path);
    else if (path.startsWith('c.') && /layer$/.test(path)) {
      const l = follow(path);
      if (!l) problems.push(`${path}: a component's stacking order must alias a layer token`);
      else layerOf.set(`--${path.replace(/\./g, '-')}`, l);
    }
  }
  /** @type {Map<string, Set<string>>} layer → files that use it */
  const users = new Map([...model.base.keys()].filter((p) => p.startsWith('layer.')).map((p) => [p, new Set()]));
  for (const file of CSS_ROOTS.flatMap((d) => walk(d, /\.css$/)).filter((f) => !SKIP.has(f))) {
    const text = readFileSync(join(ROOT, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    let inside = false;
    for (const m of text.matchAll(/z-index\s*:\s*([^;]+);/g)) {
      const value = m[1].trim();
      const v = /^var\((--[\w-]+)\)$/.exec(value);
      const layer = v && layerOf.get(v[1]);
      const line = text.slice(0, m.index).split('\n').length;
      if (!layer) {
        problems.push(`${file}:${line}: z-index: ${value}; read a layer token (var(--layer-*)) or a component token aliasing one`);
        continue;
      }
      users.get(layer)?.add(file);
      if (INSIDE.has(layer)) inside = true;
    }
    if (inside && !/isolation\s*:\s*isolate/.test(text)) problems.push(`${file}: uses layer.behind or layer.raised without isolation: isolate, so its order would leak`);
  }
  for (const file of TSX_ROOTS.flatMap((d) => walk(d, /\.tsx$/))) {
    if (/zIndex\s*:/.test(readFileSync(join(ROOT, file), 'utf8'))) problems.push(`${file}: inline zIndex; stacking belongs to CSS through a layer token`);
  }
  return { users, problems };
}

function main(/** @type {string[]} */ argv) {
  const { users, problems } = layers();
  if (argv.includes('--report')) for (const [layer, files] of users) console.log(`${layer}: ${[...files].map((f) => relative('.', f)).join(', ') || '(none yet)'}`);
  for (const p of problems) console.error(`✗ ${p}`);
  if (!problems.length) console.log(`layers: every z-index reads a layer token; ${[...users.values()].reduce((n, s) => n + s.size, 0)} uses across ${[...users.values()].filter((s) => s.size).length} of ${users.size} layers`);
  return problems.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
