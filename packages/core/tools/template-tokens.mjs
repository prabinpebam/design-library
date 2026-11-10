#!/usr/bin/env node
/**
 * Template tokens (Q64, IP35), shipped with the package so a separate project runs it too:
 *   npx design-library-template-tokens --templates src/templates [--check]
 * Each template's own component tokens, `{templates}/{template}/tokens/tokens.json` (W3C DTCG), become `tokens.css` in
 * the same folder as custom properties in `@layer templates`. Every token must be named `t.{template}.{part}.{name}`,
 * carry a `$description`, and normally alias a core **semantic** token (`{space.stack-item}`), never a primitive (`p.*`)
 * or a private core component token (`c.*`). Brand-led custom parts may document their own composition per token in
 * `$extensions["org.design-library"].brand`. The root extension's ordered `contexts` re-resolve only named tokens:
 * `{ selector, media?, description, values: { "t.template.part.name": value } }`.
 * An alias stays live: `--t-…: var(--space-stack-item)`. Rename a token in tokens.json, run this, and tokens.css follows.
 *
 *   --templates <folder>   the folder holding one folder per template (default packages/templates, this repository's)
 *   --check                write nothing; fail if a token breaks a rule or a tokens.css is stale
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const core = fileURLToPath(new URL('..', import.meta.url));
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const check = process.argv.includes('--check');
const dir = resolve(root, arg('templates') ?? 'packages/templates');
if (!existsSync(dir)) {
  console.error(`template-tokens: no templates folder at ${dir}. Pass --templates <folder holding one folder per template>.`);
  process.exit(1);
}
const coreTokens = new Set(Object.keys(JSON.parse(readFileSync(join(core, 'tokens/generated/tokens.resolved.json'), 'utf8')).light));
// Optional public applyFonts roles are emitted at runtime rather than in the base token set.
for (const role of ['label', 'numeral']) coreTokens.add(`font.${role}`);
const settings = new Set(Object.values(JSON.parse(readFileSync(join(core, 'tokens/settings.json'), 'utf8'))).flatMap(Object.keys));
const rel = (f) => relative(root, f).split('\\').join('/');
const errors = [];
const outputs = [];
let written = 0;

for (const template of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const source = join(dir, template, 'tokens', 'tokens.json');
  if (!existsSync(source)) continue;
  const tokens = [];
  const walk = (node, path) => {
    if (node && typeof node === 'object' && '$value' in node) return tokens.push({ path: path.join('.'), node });
    for (const [k, v] of Object.entries(node ?? {})) if (!k.startsWith('$')) walk(v, [...path, k]);
  };
  const data = JSON.parse(readFileSync(source, 'utf8'));
  walk(data, []);
  const names = new Set(tokens.map(({ path }) => path));
  const cssNames = new Set(tokens.map(({ path }) => `--${path.replaceAll('.', '-')}`));
  const extension = data.$extensions?.['org.design-library'] ?? {};
  const valueCss = (value, path, node) => {
    const alias = typeof value === 'string' ? /^\{([a-z0-9.-]+)\}$/.exec(value)?.[1] : undefined;
    if (alias) {
      if (/^(p|c|spectrum|set)\./.test(alias) || (!coreTokens.has(alias) && !names.has(alias)))
        errors.push(`${rel(source)} · ${path} · aliases ${alias}, which isn't a semantic or local template token`);
      return `var(--${alias.replaceAll('.', '-')})`;
    }
    // Brand-led templates own measurements and compound CSS values, not new core roles.
    // The opt-in is per token, with its reason in the source, never a global bypass.
    if (typeof node.$extensions?.['org.design-library']?.brand !== 'string' || !node.$extensions['org.design-library'].brand.trim())
      errors.push(`${rel(source)} · ${path} · is a raw value; alias a semantic token or document this token's brand decision in $extensions["org.design-library"].brand`);
    if (typeof value !== 'string' && typeof value !== 'number') {
      errors.push(`${rel(source)} · ${path} · brand values must be CSS strings or numbers`);
      return '';
    }
    const css = String(value);
    if (/[;{}]|\/\*|@|url\s*\(/i.test(css))
      errors.push(`${rel(source)} · ${path} · isn't a single safe CSS value`);
    for (const match of css.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const name = match[1];
      if (!cssNames.has(name) && !settings.has(name) && !coreTokens.has(name.slice(2).replaceAll('-', '.'))) {
        // Core token segments may themselves contain hyphens.
        const semantic = [...coreTokens].some((token) => `--${token.replaceAll('.', '-')}` === name && !/^(p|c|spectrum|set)\./.test(token));
        if (!semantic) errors.push(`${rel(source)} · ${path} · reads unknown/private ${name}`);
      }
      if (/^--(?:p|c|spectrum|set)-/.test(name) && !settings.has(name))
        errors.push(`${rel(source)} · ${path} · reads private ${name}`);
    }
    return css;
  };
  const lines = [];
  const dependencies = new Map(tokens.map(({ path, node }) => [path, []]));
  const recordDependencies = (path, value) => {
    if (typeof value !== 'string') return;
    const variables = new Set([...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1]));
    for (const [other] of dependencies) {
      if (value === `{${other}}` || variables.has(`--${other.replaceAll('.', '-')}`))
        dependencies.get(path).push(other);
    }
  };
  for (const { path, node } of tokens) {
    if (!path.startsWith(`t.${template}.`)) errors.push(`${rel(source)} · ${path} · isn't named t.${template}.{part}.{name}`);
    if (!node.$description) errors.push(`${rel(source)} · ${path} · has no $description`);
    recordDependencies(path, node.$value);
    lines.push(`    --${path.replaceAll('.', '-')}: ${valueCss(node.$value, path, node)};`);
  }
  const contexts = [];
  for (const context of extension.contexts ?? []) {
    if (!context.description || typeof context.selector !== 'string' || /[{};@]|data-dl|--c-/.test(context.selector) ||
      (context.media !== undefined && (typeof context.media !== 'string' || /[{};@]/.test(context.media)))) {
      errors.push(`${rel(source)} · invalid context; describe a context selector/media, never a core component selector`);
      continue;
    }
    const declarations = [];
    for (const [path, value] of Object.entries(context.values ?? {})) {
      const node = tokens.find((token) => token.path === path)?.node;
      if (!node) errors.push(`${rel(source)} · context names unknown token ${path}`);
      else {
        recordDependencies(path, value);
        declarations.push(`    --${path.replaceAll('.', '-')}: ${valueCss(value, path, node)};`);
      }
    }
    const block = `  ${context.selector} {\n${declarations.join('\n')}\n  }`;
    contexts.push(context.media ? `  @media ${context.media} {\n${block.split('\n').map((line) => `  ${line}`).join('\n')}\n  }` : block);
  }
  const visit = (path, chain = []) => {
    if (chain.includes(path)) {
      errors.push(`${rel(source)} · circular template alias: ${[...chain, path].join(' -> ')}`);
      return;
    }
    for (const next of dependencies.get(path) ?? []) visit(next, [...chain, path]);
  };
  for (const path of names) visit(path);
  const css = `/* Generated by design-library-template-tokens from ${template}/tokens/tokens.json: do not edit. */\n@layer templates {\n  :root {\n${lines.join('\n')}\n  }\n${contexts.length ? `${contexts.join('\n')}\n` : ''}}\n`;
  const target = join(dir, template, 'tokens', 'tokens.css');
  if (check) {
    if (!existsSync(target) || readFileSync(target, 'utf8') !== css) errors.push(`${rel(target)} · is stale · run npx design-library-template-tokens --templates ${rel(dir)} (library repository: npm run tokens)`);
  } else {
    outputs.push({ target, css });
  }
}

/*
 * A template's theme (F15.FR1): `{templates}/{template}/tokens/theme.json` re-decides core tokens (semantic roles and
 * component tokens, never primitives `p.*`) for the template's own screens only: everything under
 * `[data-template="{template}"]`. A value is a raw value or `{ "light": …, "dark": … }` (becomes light-dark()), so the
 * theme follows the colour scheme. Because a custom property resolves where it is declared, every core token that
 * reads a re-decided one is declared again inside the scope (and again for each context, density, space or shape, that
 * changes it), so components follow without a fork. Output: `theme.css` beside it, in `@layer templates`.
 */
const coreCss = readFileSync(join(core, 'css/tokens.css'), 'utf8');
const blocks = [];
{
  const stack = [];
  for (const raw of coreCss.split('\n')) {
    const line = raw.trim();
    const decl = /^(--[a-z0-9-]+):\s*(.+);$/.exec(line);
    if (decl && stack.length) {
      const media = stack.filter((s) => s.startsWith('@media')).join(' ');
      const selector = stack.filter((s) => !s.startsWith('@')).at(-1);
      let block = blocks.find((b) => b.media === media && b.selector === selector);
      if (!block) blocks.push((block = { media, selector, decls: new Map() }));
      block.decls.set(decl[1], decl[2]);
    } else if (line.endsWith('{')) stack.push(line.slice(0, -1).trim());
    else if (line.startsWith('}')) stack.pop();
  }
}
const rootBlock = blocks.find((b) => !b.media && b.selector === ':root');
const refs = (value) => [...value.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);

for (const template of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const source = join(dir, template, 'tokens', 'theme.json');
  if (!existsSync(source)) continue;
  const set = new Map();
  const walk = (node, path) => {
    if (node && typeof node === 'object' && '$value' in node) {
      const name = path.join('.');
      if (!node.$description) errors.push(`${rel(source)} · ${name} · has no $description`);
      if (/^(p|t|spectrum|set)\./.test(name)) return errors.push(`${rel(source)} · ${name} · a theme re-decides semantic roles and component tokens only`);
      if (!coreTokens.has(name)) return errors.push(`${rel(source)} · ${name} · isn't a core token`);
      const v = node.$value;
      const one = (x) => (typeof x === 'string' && /^\{[a-z0-9.-]+\}$/.test(x) ? `var(--${x.slice(1, -1).replaceAll('.', '-')})` : String(x));
      set.set(`--${name.replaceAll('.', '-')}`, v && typeof v === 'object' ? `light-dark(${one(v.light)}, ${one(v.dark)})` : one(v));
      return;
    }
    for (const [k, v] of Object.entries(node ?? {})) if (!k.startsWith('$')) walk(v, [...path, k]);
  };
  walk(JSON.parse(readFileSync(source, 'utf8')), []);
  // every core token that reads a re-decided one, directly or through others
  const dependents = new Set();
  const reads = (name, value) => !set.has(name) && refs(value).some((r) => set.has(r) || dependents.has(r));
  for (let grew = true; grew; ) {
    grew = false;
    for (const b of blocks) for (const [n, v] of b.decls) if (!dependents.has(n) && reads(n, v)) (dependents.add(n), (grew = true));
  }
  const scope = `[data-template='${template}']`;
  const out = [`  ${scope} {`, ...[...set].map(([n, v]) => `    ${n}: ${v};`), ...[...dependents].filter((n) => rootBlock?.decls.has(n)).map((n) => `    ${n}: ${rootBlock.decls.get(n)};`), '  }'];
  for (const b of blocks) {
    if (b === rootBlock || b.selector === ':root' && !b.media) continue;
    const echo = [...b.decls].filter(([n]) => dependents.has(n));
    if (!echo.length) continue;
    const sel = b.selector === ':root' ? scope : b.selector.split(',').map((s) => `${s.trim()} ${scope}, ${scope}${s.trim()}`).join(', ');
    const rule = [`${b.media ? '    ' : '  '}${sel} {`, ...echo.map(([n, v]) => `${b.media ? '      ' : '    '}${n}: ${v};`), `${b.media ? '    ' : '  '}}`];
    out.push(...(b.media ? [`  ${b.media} {`, ...rule, '  }'] : rule));
  }
  const css = `/* Generated by design-library-template-tokens from ${template}/tokens/theme.json: do not edit. */\n@layer templates {\n${out.join('\n')}\n}\n`;
  const target = join(dir, template, 'tokens', 'theme.css');
  if (check) {
    if (!existsSync(target) || readFileSync(target, 'utf8') !== css) errors.push(`${rel(target)} · is stale · run npx design-library-template-tokens --templates ${rel(dir)} (library repository: npm run tokens)`);
  } else {
    writeFileSync(target, css);
    written += 1;
  }
}

if (errors.length) {
  console.error(`template-tokens: ${errors.length} problem${errors.length === 1 ? '' : 's'}\n${errors.map((e) => `  ${e}`).join('\n')}`);
  process.exit(1);
}
for (const { target, css } of outputs) {
  writeFileSync(target, css);
  written += 1;
}
console.log(check ? 'template-tokens: token sources and contexts valid; tokens.css current.' : `template-tokens: wrote ${written} tokens.css.`);
