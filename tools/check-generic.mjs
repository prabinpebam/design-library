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
const productNames = /\b(figma|sketch(?:app)?|framer|penpot|photoshop|canva|ikea|slack|youtube|microsoft ?word|ms ?word|winword|microsoft 365)\b/i;
const productIn = (text) => text.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replaceAll('_', ' ').match(productNames);
// Brand values of imitated products; extend when a new replica template starts.
const brandValues = [
  { re: /#0d99ff\b/i, what: "Figma's accent #0D99FF" },
  { re: /#0058a3\b/i, what: "IKEA's blue #0058A3" },
  { re: /#ffdb00\b/i, what: "IKEA's yellow #FFDB00" },
  // Slack (Q143): aubergine brand and sidebar, the active-item blue, the four logo colours and its text colour.
  { re: /#4a154b\b/i, what: "Slack's aubergine #4A154B" },
  { re: /#3f0e40\b/i, what: "Slack's sidebar aubergine #3F0E40" },
  { re: /#611f69\b/i, what: "Slack's aubergine #611F69" },
  { re: /#350d36\b/i, what: "Slack's sidebar hover #350D36" },
  { re: /#1264a3\b/i, what: "Slack's active-item blue #1264A3" },
  { re: /#007a5a\b/i, what: "Slack's action green #007A5A" },
  { re: /#39073d\b/i, what: "Slack's current rail #39073D" },
  { re: /#501e54\b/i, what: "Slack's current sidebar #501E54" },
  { re: /#ffe5ff\b/i, what: "Slack's current selection #FFE5FF" },
  { re: /#36c5f0\b/i, what: "Slack's blue #36C5F0" },
  { re: /#2eb67d\b/i, what: "Slack's green #2EB67D" },
  { re: /#ecb22e\b/i, what: "Slack's yellow #ECB22E" },
  { re: /#e01e5a\b/i, what: "Slack's red #E01E5A" },
  { re: /#1d1c1d\b/i, what: "Slack's text #1D1C1D" },
  // Microsoft Word (Q145.W): the title bar and Share blue, the Word brand blue, the Dark Gray title bar.
  { re: /#185abd\b/i, what: "Word's title bar blue #185ABD" },
  { re: /#2b579a\b/i, what: "Word's brand blue #2B579A" },
  { re: /#54585a\b/i, what: "Word's Dark Gray title bar #54585A" },
  // YouTube (Q145.Y): the brand red of the logo mark; spec in .design-library/youtube-ref/README.md.
  { re: /#ff0000\b/i, what: "YouTube's brand red #FF0000" },
  // The player's seek red, by pixel (watch169-1280-L); Worker 102, Y2g-F30.
  { re: /#ff0033\b/i, what: "YouTube's player red #FF0033" },
];
// Embedding a provider's real player is a public integration, not an imitated look: MediaPlayer's
// `from: 'youtube'` source names the service it embeds. Only the product name is allowed, only there.
const embedProviders = [
  { file: 'packages/core/react/compounds/MediaPlayer.tsx', name: /^youtube$/i },
];

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
  const rel = relative(root, file).replace(/\\/g, '/');
  text.split('\n').forEach((line, i) => {
    const product = productIn(line);
    const embed = product && embedProviders.some((a) => a.file === rel && a.name.test(product[0]));
    if (product && !embed) report(file, i + 1, line, `names a product (${product[0]}) in code`, 'move the look to the template (theme, t.{template}.* tokens or a template part) and name the core seam by what it does');
    for (const b of brandValues) if (b.re.test(line)) report(file, i + 1, line, `carries ${b.what}`, "set the value in the template's theme or tokens, not as a core default");
    if (templateNs && templateNs.test(line)) report(file, i + 1, line, 'reaches a template namespace from core', 'core never reads or styles a template; expose a public seam instead');
  });
}

function walkJson(file, node, path) {
  if (Array.isArray(node)) return node.forEach((v, i) => walkJson(file, v, `${path}/${i}`));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$') && k !== '$value') continue; // descriptions and extensions may cite a product
      if (productIn(k)) report(file, 0, `${path}/${k}`, 'names a product in a token name', 'name the token by its role');
      walkJson(file, v, `${path}/${k}`);
    }
    return;
  }
  if (typeof node === 'string') {
    if (productIn(node)) report(file, 0, `${path}: ${node}`, 'names a product in a token value', 'use a role, not a product');
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

// Q143 RR4 (docs/replica-rules.md): core never restates a style on every template root. A `[data-template]` rule in
// core CSS may only re-resolve colour; anything a template needs on its root is generated into that template's own
// theme.css from what its theme declares (tools/template-tokens.mjs), and only when it declares it.
function checkTemplateRoot(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { checkTemplateRoot(p); continue; }
    if (extname(name) !== '.css') continue;
    const src = stripComments(readFileSync(p, 'utf8'), '.css');
    for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/\[data-template\]/.test(m[1])) continue;
      const props = m[2].split(';').map((d) => d.split(':')[0].trim()).filter(Boolean);
      const extra = props.filter((x) => !['color', 'background-color'].includes(x));
      if (extra.length) {
        const line = src.slice(0, m.index + m[0].indexOf('{')).split('\n').length;
        report(p, line, `${m[1].trim()} { ${extra.join(', ')} }`, 'core restates a style on every template root', "generate it into the template's theme.css only when its theme declares it (tools/template-tokens.mjs)");
      }
    }
  }
}
checkTemplateRoot(join(root, 'packages/core/css'));

if (problems.length) {
  console.error(`check:generic: ${problems.length} problem(s). Core stays generic (Q118.4, docs/figma-replica.md section 3):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`check:generic: core is free of product identities and template namespaces (${templateIds.length} templates known).`);
