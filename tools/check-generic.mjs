#!/usr/bin/env node
// Q118.4: the library stays generic. A template may look like any product (the Figma replica in
// packages/templates/design is the stress test), but core code, CSS and tokens never carry that
// product's identity: no product names in identifiers, selectors, token names or values, no
// product brand values, and no template token namespaces (`t.{template}.*`, `--t-{template}-*`; data-dl names can't be told apart from core ones like chat-message).
// Comments and token descriptions may cite a product as a reference; only what the code does is checked.
// The boundary rule and its decision test: docs/figma-replica.md, section 3.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const root = process.cwd();
const coreDirs = ['packages/core/react', 'packages/core/css', 'packages/core/tokens', 'packages/core/theme'];
const skipDir = /[\\/](stories|node_modules|dist)([\\/]|$)/;

// Product identities a template may imitate but core must never name in code.
const productNames = /\b(figma|sketch(?:app)?|framer|penpot|photoshop|canva)\b/i;
// Brand values of imitated products; extend when a new replica template starts.
const brandValues = [{ re: /#0d99ff\b/i, what: "Figma's accent #0D99FF" }];

let templateIds = [];
try {
  templateIds = readdirSync(join(root, 'packages/templates')).filter((d) => {
    try { return statSync(join(root, 'packages/templates', d, 'template.json')).isFile(); } catch { return false; }
  });
} catch { /* no templates folder */ }
const templateNs = templateIds.length
  ? new RegExp(`(\\bt\\.(${templateIds.join('|')})\\.|--t-(${templateIds.join('|')})-)`)
  : null;

const problems = [];
const report = (file, line, text, why, fix) =>
  problems.push(`${relative(root, file).replace(/\\/g, '/')}:${line} · ${why} · "${text.trim().slice(0, 100)}" · ${fix}`);

function stripComments(src, ext) {
  // Keep line numbers: replace comment characters with spaces, keep newlines.
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  let out = src.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (ext !== '.css') out = out.replace(/(^|[^:'"`])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)));
  return out;
}

function checkLines(file, text) {
  text.split('\n').forEach((line, i) => {
    if (productNames.test(line)) report(file, i + 1, line, `names a product (${line.match(productNames)[0]}) in code`, 'move the look to the template (theme, t.{template}.* tokens or a template part) and name the core seam by what it does');
    for (const b of brandValues) if (b.re.test(line)) report(file, i + 1, line, `carries ${b.what}`, "set the value in the template's theme or tokens, not as a core default");
    if (templateNs && templateNs.test(line)) report(file, i + 1, line, 'reaches a template namespace from core', 'core never reads or styles a template; expose a public seam instead');
  });
}

function walkJson(file, node, path) {
  if (Array.isArray(node)) return node.forEach((v, i) => walkJson(file, v, `${path}/${i}`));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$') && k !== '$value') continue; // descriptions and extensions may cite a product
      if (productNames.test(k)) report(file, 0, `${path}/${k}`, 'names a product in a token name', 'name the token by its role');
      walkJson(file, v, `${path}/${k}`);
    }
    return;
  }
  if (typeof node === 'string') {
    if (productNames.test(node)) report(file, 0, `${path}: ${node}`, 'names a product in a token value', 'use a role, not a product');
    for (const b of brandValues) if (b.re.test(node)) report(file, 0, `${path}: ${node}`, `carries ${b.what}`, "set it in the template's theme");
  }
}

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const p = join(dir, name);
    if (skipDir.test(p)) continue;
    const st = statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    const ext = extname(name);
    if (!['.ts', '.tsx', '.css', '.json', '.mjs', '.js'].includes(ext)) continue;
    const src = readFileSync(p, 'utf8');
    if (ext === '.json') {
      try { walkJson(p, JSON.parse(src), ''); } catch { checkLines(p, src); }
    } else {
      checkLines(p, stripComments(src, ext));
    }
  }
}

for (const d of coreDirs) walk(join(root, d));

if (problems.length) {
  console.error(`check:generic: ${problems.length} problem(s). Core stays generic (Q118.4, docs/figma-replica.md section 3):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`check:generic: core is free of product identities and template namespaces (${templateIds.length} templates known).`);
