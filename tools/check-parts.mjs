#!/usr/bin/env node
// @ts-check
/**
 * Part-selector check (owner Q68, Design tool audit DT5). Dependency-free.
 *
 *   node tools/check-parts.mjs             fail (exit 1) when a compound or layout styles a part through a descendant path
 *   node tools/check-parts.mjs --report    also list every remaining descendant part selector
 *   node tools/check-parts.mjs --baseline  rewrite tools/parts-allow.json to the current counts (only ever lower them)
 *
 * Rule: a compound or layout reaches its own parts by child paths (`[data-dl='x'] > [data-dl-part='y']`), never by a
 * descendant combinator (`[data-dl='x'] [data-dl-part='y']`). A descendant path also matches a part of the same name
 * inside any component placed in a slot (a Tabs panel inside an editor panel, a Card in a Dialog), so the outer
 * component restyles it. Files not yet swept are held at their count in parts-allow.json; a count may only fall.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['packages/core/css/compounds', 'packages/core/css/layouts'];
const ALLOW = join(ROOT, 'tools/parts-allow.json');
// A component or part selector, its own qualifiers, then whitespace (a descendant combinator), then a part.
const DESCENDANT = /\[data-dl(?:-part)?='[^']+'\](?:\[[^\]]*\]|:[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?)*\s+(?::is\()?\[data-dl-part=/g;

const args = new Set(process.argv.slice(2));
/** @type {Record<string, number>} */
const allow = JSON.parse(readFileSync(ALLOW, 'utf8'));
/** @type {Record<string, number>} */
const counts = {};
const lines = [];
for (const dir of DIRS) {
  for (const name of readdirSync(join(ROOT, dir)).filter((n) => n.endsWith('.css')).sort()) {
    const rel = `${dir}/${name}`;
    const text = readFileSync(join(ROOT, rel), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    let n = 0;
    text.split('\n').forEach((line, i) => {
      const hits = line.match(DESCENDANT);
      if (!hits) return;
      n += hits.length;
      lines.push(`${rel}:${i + 1}: ${line.trim()}`);
    });
    if (n) counts[rel] = n;
  }
}

if (args.has('--baseline')) {
  writeFileSync(ALLOW, `${JSON.stringify(counts, null, 2)}\n`);
  console.log(`parts-allow.json: ${Object.keys(counts).length} files, ${Object.values(counts).reduce((a, b) => a + b, 0)} selectors held`);
  process.exit(0);
}

const problems = [];
for (const [file, n] of Object.entries(counts)) {
  const held = allow[file] ?? 0;
  if (n > held) problems.push(`${file}: ${n} descendant part selectors (allowed ${held}); use child paths (\`> [data-dl-part=…]\`)`);
}
const swept = Object.keys(allow).filter((f) => (counts[f] ?? 0) < allow[f]);
if (args.has('--report')) for (const l of lines) console.log(l);
const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`check:parts: ${total} descendant part selectors in ${Object.keys(counts).length} not-yet-swept files; ${problems.length} problems`);
if (swept.length) console.log(`  lower the baseline (node tools/check-parts.mjs --baseline): ${swept.join(', ')}`);
for (const p of problems) console.error(`  ${p}`);
process.exit(problems.length ? 1 : 0);
