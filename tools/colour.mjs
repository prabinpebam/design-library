#!/usr/bin/env node
// @ts-check
/**
 * Colour build and check (owner direction F7, F7d; docs/foundation.md#colour-model). Dependency-free.
 *
 *   node tools/colour.mjs           colour.config.json → packages/core/tokens/tokens.colour.json
 *   node tools/colour.mjs --check   fails (exit 1) on: an invalid config, stale output, a non-monotonic ramp, a contrast
 *                                   pair below its minimum in any of four contexts (light/dark × standard/more), a
 *                                   fixture theme or brand preset that fails the same, or component CSS / a component
 *                                   token / a status role reading the spectrum or a custom set.
 *
 * The pure generator lives in packages/core/colour/generate.mjs, shared with the library's live brand editor.
 */
import { copyFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contextTokens, load, resolveValue } from '../agentic-craft/tools/build-tokens.mjs';
import { contrast } from '../packages/core/colour/colour-math.mjs';
import { generate } from '../packages/core/colour/generate.mjs';

export { generate };
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/core/tokens');
const CONFIG = join(SRC, 'colour.config.json');
const PRESETS = join(SRC, 'colour-presets.json');
const OUT = 'tokens.colour.json';
const FIXTURES = join(SRC, 'colour-fixtures');
const CSS_DIR = join(ROOT, 'packages/core/css');
/** Component token groups allowed to read the spectrum or a set: data-visualisation compounds only (none yet). */
const DATA_VIZ_OWNERS = new Set([]);

const serialise = (/** @type {any} */ tree) => JSON.stringify(tree, null, 2) + '\n';

/** The four contexts every pair must hold in. */
const CONTEXTS = [
  ['light', 'standard'],
  ['light', 'more'],
  ['dark', 'standard'],
  ['dark', 'more'],
];

/** Contrast failures of a token source folder across the four contexts. */
export function contrastProblems(/** @type {string} */ src, /** @type {{ fg: string, bg: string, min: number }[]} */ extra) {
  const model = load(src);
  const { contrast: pairs = [] } = JSON.parse(readFileSync(join(src, 'checks.json'), 'utf8'));
  /** @type {string[]} */
  const out = [];
  let held = 0;
  for (const [theme, level] of CONTEXTS) {
    const tokens = contextTokens(model, { theme, contrast: level });
    for (const { fg, bg, min } of [...pairs, ...extra]) {
      try {
        const ratio = contrast(resolveValue(tokens, fg).slice(0, 7), resolveValue(tokens, bg).slice(0, 7));
        if (ratio < min) out.push(`contrast ${fg} on ${bg} (${theme}, ${level} contrast): ${ratio.toFixed(2)}:1, needs ${min}:1`);
        else held++;
      } catch (e) {
        out.push(`contrast ${fg} on ${bg} (${theme}, ${level}): ${/** @type {Error} */ (e).message}`);
      }
    }
  }
  return { out, held };
}

/** Spectrum and set tokens are non-functional: component CSS, component tokens and status roles never read them. */
export function lintProblems(/** @type {string} */ src) {
  /** @type {string[]} */
  const out = [];
  const walk = (/** @type {string} */ dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.css') && e.name !== 'tokens.css' ? [join(dir, e.name)] : []));
  for (const file of walk(CSS_DIR)) {
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line, i) => {
        if (/var\(--(spectrum|set)-/.test(line)) out.push(`${relative(ROOT, file)}:${i + 1}: component CSS reads a spectrum or set token; use a semantic role (status colours are color.status.*)`);
      });
  }
  const model = load(src);
  // Q44 purpose-scoped exception: color.category.* may alias the one set declaring roles "category"; anything but a
  // status role may read color.category.*. Nothing else may reach the spectrum or a set.
  const cfg = existsSync(join(src, 'colour.config.json')) ? JSON.parse(readFileSync(join(src, 'colour.config.json'), 'utf8')) : JSON.parse(readFileSync(CONFIG, 'utf8'));
  const categorySet = (cfg.sets ?? []).find((/** @type {any} */ s) => s.roles === 'category')?.name;
  const aiSet = (cfg.sets ?? []).find((/** @type {any} */ s) => s.roles === 'ai')?.name;
  for (const theme of ['light', 'dark']) {
    const tokens = contextTokens(model, { theme });
    for (const [path, t] of tokens) {
      const reader = path.startsWith('c.') ? 'component' : path.startsWith('color.status.') ? 'status' : path.startsWith('color.') || path.startsWith('state.') ? 'role' : null;
      if (!reader || (reader === 'component' && DATA_VIZ_OWNERS.has(String(t.owner)))) continue;
      let cur = t;
      for (let hops = 0; cur && typeof cur.value === 'string' && /^\{.+\}$/.test(cur.value) && hops < 12; hops++) {
        const target = cur.value.slice(1, -1);
        const via = hops === 0 ? path : '';
        if (target.startsWith('color.category.') && reader !== 'status') break;
        if (categorySet && via.startsWith('color.category.') && target.startsWith(`set.${categorySet}.`)) break;
        // Q56: the same purpose-scoped exception for the AI processing stops.
        if (target.startsWith('color.ai.') && reader !== 'status') break;
        if (aiSet && via.startsWith('color.ai.') && target.startsWith(`set.${aiSet}.`)) break;
        if (/^(spectrum|set)\./.test(target)) {
          out.push(`${path} (${theme}): a ${reader} token reads ${target}; the spectrum and custom sets are non-functional`);
          break;
        }
        cur = tokens.get(target);
      }
    }
  }
  return [...new Set(out)];
}

function main(/** @type {string[]} */ argv) {
  const check = argv.includes('--check');
  const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
  const { tree, pairs, errors } = generate(config);
  if (errors.length || !tree) {
    for (const e of errors) console.error(`✗ colour.config.json: ${e}`);
    return 1;
  }
  const text = serialise(tree);
  const outFile = join(SRC, OUT);
  if (!check) {
    writeFileSync(outFile, text);
    console.log(`colour: wrote ${relative(ROOT, outFile)}`);
    return 0;
  }
  /** @type {string[]} */
  const problems = [];
  if (!existsSync(outFile) || readFileSync(outFile, 'utf8').replace(/\r\n/g, '\n') !== text) problems.push(`${relative(ROOT, outFile)} is stale: run npm run tokens`);
  const own = contrastProblems(SRC, pairs);
  problems.push(...own.out);
  problems.push(...lintProblems(SRC));
  /** Generates a theme in a scratch copy of the token sources and holds its pairs in the four contexts. */
  const themeProblems = (/** @type {any} */ theme, /** @type {string} */ label) => {
    const g = generate(theme);
    if (g.errors.length || !g.tree) return g.errors.map((e) => `${label}: ${e}`);
    const tmp = mkdtempSync(join(tmpdir(), 'colour-theme-'));
    try {
      for (const file of readdirSync(SRC).filter((x) => x.startsWith('tokens') && x.endsWith('.json') && x !== OUT)) copyFileSync(join(SRC, file), join(tmp, file));
      for (const file of ['resolver.json', 'checks.json']) copyFileSync(join(SRC, file), join(tmp, file));
      writeFileSync(join(tmp, OUT), serialise(g.tree));
      return contrastProblems(tmp, g.pairs).out.map((e) => `${label}: ${e}`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  };
  let fixtures = 0;
  if (existsSync(FIXTURES)) {
    for (const f of readdirSync(FIXTURES).filter((x) => x.endsWith('.json'))) {
      problems.push(...themeProblems(JSON.parse(readFileSync(join(FIXTURES, f), 'utf8')), `fixture ${f}`));
      fixtures++;
    }
  }
  // Brand presets (F7d): each one applied over this theme must hold every pair, so choosing one never breaks contrast.
  const presets = existsSync(PRESETS) ? /** @type {{ id: string, brand: any }[]} */ (JSON.parse(readFileSync(PRESETS, 'utf8')).presets) : [];
  const ids = new Set();
  for (const preset of presets) {
    if (ids.has(preset.id)) problems.push(`preset ${preset.id}: the id is used twice`);
    ids.add(preset.id);
    problems.push(...themeProblems({ ...config, brand: preset.brand }, `preset ${preset.id}`));
  }
  for (const p of problems) console.error(`✗ ${p}`);
  if (!problems.length) console.log(`colour: current; ${own.held} pairs hold in light and dark at standard and more contrast; ${fixtures} fixture themes and ${presets.length} brand presets pass; no component or status role reads the spectrum or a set (category roles excepted by purpose, Q44)`);
  return problems.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
