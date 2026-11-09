#!/usr/bin/env node
/**
 * The names check (IV6, F57, DoD B3.27): every component, prop, export, token and command the consumer guides name
 * exists, read from the agent index (`packages/core/agent/`) and the package sources. A guide that names something the
 * library doesn't have sends an agent down a dead end (the Beta's `Grid` `min`), so this fails `npm run check`.
 *
 *   node ./tools/check-names.mjs [files…]    default: packages/core/AGENTS.md, guide/*.md, UPGRADE.md
 *
 * What it reads in each guide:
 * - imports from `@design-library/core/<entry>` in code blocks: each name is exported by that entry;
 * - JSX in code blocks: a tag the index knows takes each attribute it's given (`key`, `ref`, `aria-*`, `data-*` and
 *   `children` always; any attribute when the props extend HTML attributes);
 * - inline pairs such as `Grid` `ratio` or `Text` `tone="accent"`: the prop exists on the component;
 * - inline tokens such as `size.column-min` (a group the semantic tokens use) and custom properties such as
 *   `--c-grid-aside`: they exist (names with `*`, `{` or `<` are patterns, not names);
 * - commands: `npx design-library-…` is a bin of a library package; `npm run …` is a script of this repository.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const core = join(root, 'packages/core');
const rel = (f) => relative(root, f).split('\\').join('/');
const read = (f) => readFileSync(f, 'utf8');

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => resolve(f))
  : [join(core, 'AGENTS.md'), ...readdirSync(join(core, 'guide')).filter((f) => f.endsWith('.md')).map((f) => join(core, 'guide', f)), join(core, 'UPGRADE.md')].filter(existsSync);

// What exists.
const index = JSON.parse(read(join(core, 'agent/index.json')));
const components = new Map();
for (const f of readdirSync(join(core, 'agent/components'))) {
  const c = JSON.parse(read(join(core, 'agent/components', f)));
  const names = new Set((c.props ?? []).flatMap((i) => (i.props ?? []).map((p) => p.name)));
  const open = (c.props ?? []).some((i) => /HTMLAttributes|Attributes<|ComponentProps|Omit<|Pick<|Props\b/.test(`${i.extends ?? ''}`.replace(/\bDataAttributes\b/g, '')));
  components.set(c.name, { names, open });
}
const pkg = JSON.parse(read(join(core, 'package.json')));
const exportsOf = new Map();
const namesIn = (file, seen = new Set()) => {
  if (!file || seen.has(file) || !existsSync(file)) return new Set();
  seen.add(file);
  const src = read(file);
  const out = new Set();
  for (const m of src.matchAll(/export\s+(?:declare\s+)?(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) out.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g))
    for (const part of m[1].split(',')) {
      const n = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()?.trim();
      if (n) out.add(n);
    }
  for (const m of src.matchAll(/export\s+(?:type\s+)?\*\s+from\s+['"](\.[^'"]+)['"]/g)) {
    const base = resolve(dirname(file), m[1]);
    const target = ['.ts', '.tsx', '/index.ts', '/index.tsx'].map((e) => base + e).find(existsSync);
    for (const n of namesIn(target, seen)) out.add(n);
  }
  return out;
};
const entryFile = (entry) => {
  const target = pkg.exports?.[entry === '' ? '.' : `./${entry}`];
  const path = typeof target === 'string' ? target : target?.import ?? target?.default ?? target?.types;
  return path ? join(core, path) : undefined;
};
const exportsFor = (entry) => {
  if (!exportsOf.has(entry)) exportsOf.set(entry, entry === 'react' ? new Set([...(index.react.values ?? []), ...(index.react.types ?? [])]) : namesIn(entryFile(entry)));
  return exportsOf.get(entry);
};
const semantic = new Set(index.tokens.semantic.map((t) => t.name));
const groups = new Set([...semantic].map((n) => n.split('.')[0]));
const privateNames = new Set(Object.values(index.tokens.private).flatMap((v) => (Array.isArray(v) ? v : [])));
const cssVars = new Set([
  ...index.tokens.semantic.map((t) => t.var),
  ...Object.values(index.tokens.componentTokens).flat(),
]);
const walkCss = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkCss(join(d, e.name)) : e.name.endsWith('.css') ? [join(d, e.name)] : []));
for (const f of walkCss(join(core, 'css'))) for (const m of read(f).matchAll(/(--[a-z][\w-]*)\s*:/g)) cssVars.add(m[1]);
const bins = new Set(
  ['packages/core/package.json', 'packages/templates/package.json']
    .map((f) => join(root, f))
    .filter(existsSync)
    .flatMap((f) => Object.keys(JSON.parse(read(f)).bin ?? {})),
);
const prefixes = new Set([...cssVars].map((v) => v.slice(2).split('-')[0]));
// A reader's own project scripts a guide may name (`npm run build` in their project), besides this repository's.
const projectScripts = new Set(['build', 'dev', 'preview', 'start', 'test', 'typecheck', 'lint']);
const scripts = new Set(Object.keys(JSON.parse(read(join(root, 'package.json'))).scripts ?? {}));

// Reading the guides.
const problems = [];
const say = (file, line, what, fix) => problems.push(`${rel(file)}:${line} · ${what} · ${fix}`);
const always = (n) => ['key', 'ref', 'children'].includes(n) || /^(aria|data)-/.test(n);

/** The attributes of a JSX opening tag starting just after its name; skips strings and balanced braces. */
function attributes(src, at) {
  const names = [];
  let i = at;
  const skipBraces = () => {
    let depth = 0;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (ch === '"' || ch === "'" || ch === '`') {
        const q = ch;
        for (i++; i < src.length && src[i] !== q; i++) if (src[i] === '\\') i++;
      } else if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return void i++;
    }
  };
  while (i < src.length) {
    const ch = src[i];
    if (ch === '>' || (ch === '/' && src[i + 1] === '>')) return names;
    if (/\s/.test(ch)) i++;
    else if (ch === '{') skipBraces();
    else if (/[A-Za-z_]/.test(ch)) {
      const m = /^[A-Za-z_][\w-]*/.exec(src.slice(i));
      names.push(m[0]);
      i += m[0].length;
      if (src[i] === '=') {
        i++;
        if (src[i] === '{') skipBraces();
        else if (src[i] === '"' || src[i] === "'") {
          const q = src[i];
          for (i++; i < src.length && src[i] !== q; i++);
          i++;
        }
      }
    } else return names;
  }
  return names;
}

for (const file of files) {
  const text = read(file);
  const lineAt = (offset) => text.slice(0, offset).split('\n').length;
  // Code blocks: imports and JSX.
  for (const block of text.matchAll(/```(tsx|jsx|ts|js|typescript)\n([\s\S]*?)```/g)) {
    const body = block[2];
    const start = (block.index ?? 0) + block[0].indexOf('\n') + 1;
    const imported = new Set();
    for (const m of body.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@design-library\/core(?:\/([\w/-]+))?['"]/g)) {
      const entry = m[2] ?? '';
      const known = exportsFor(entry);
      if (!entryFile(entry) && entry !== 'react') {
        say(file, lineAt(start + (m.index ?? 0)), `imports from @design-library/core/${entry}, which the package doesn't export`, `use one of: ${Object.keys(pkg.exports).filter((k) => !k.includes('*')).join(', ')}`);
        continue;
      }
      for (const part of m[1].split(',')) {
        const n = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
        if (!n) continue;
        imported.add(n);
        if (!known.has(n)) say(file, lineAt(start + (m.index ?? 0)), `imports ${n} from @design-library/core${entry ? '/' + entry : ''}, which doesn't export it`, 'name an export the index lists, or fix the entry');
      }
    }
    for (const m of body.matchAll(/<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g)) {
      const c = components.get(m[1]);
      if (!c) continue;
      for (const a of attributes(body, (m.index ?? 0) + m[0].length)) {
        if (always(a) || c.names.has(a) || c.open) continue;
        say(file, lineAt(start + (m.index ?? 0)), `<${m[1]} ${a}>: ${m[1]} has no prop "${a}"`, `use one of: ${[...c.names].join(', ')}`);
      }
    }
  }
  // Prose outside code blocks.
  const prose = text.replace(/```[\s\S]*?```/g, (b) => b.replace(/[^\n]/g, ' '));
  for (const m of prose.matchAll(/`([A-Z][A-Za-z0-9]*)`\s+`([a-z][A-Za-z0-9]*)(?:=[^`]*)?`/g)) {
    const c = components.get(m[1]);
    if (c && !c.open && !always(m[2]) && !c.names.has(m[2])) say(file, lineAt(m.index ?? 0), `\`${m[1]}\` \`${m[2]}\`: ${m[1]} has no prop "${m[2]}"`, `use one of: ${[...c.names].join(', ')}`);
  }
  for (const m of prose.matchAll(/`([^`\s]+)`/g)) {
    const name = m[1];
    if (/[*{<]/.test(name)) continue;
    const token = /^([a-z]+)\.[a-z0-9-]+(\.[a-z0-9-]+)*$/.exec(name);
    if (token && groups.has(token[1]) && !semantic.has(name) && !privateNames.has(name)) say(file, lineAt(m.index ?? 0), `names token ${name}, which doesn't exist`, 'name a semantic token from the index (agent/index.json tokens.semantic)');
    const v = /^(--[a-z][\w-]*)(?::.*)?$/.exec(name);
    // A command-line flag (`--strict`) isn't a custom property: only names that share a declared property's prefix count.
    if (v && prefixes.has(v[1].slice(2).split('-')[0]) && !cssVars.has(v[1])) say(file, lineAt(m.index ?? 0), `names custom property ${v[1]}, which no core stylesheet declares`, 'name a token or component property from the index');
  }
  for (const m of text.matchAll(/npx\s+(design-library-[a-z-]+)/g)) if (!bins.has(m[1])) say(file, lineAt(m.index ?? 0), `names npx ${m[1]}, which no library package ships`, `use one of: ${[...bins].join(', ')}`);
  for (const m of text.matchAll(/npm run ([a-z][\w:-]*)/g)) if (!scripts.has(m[1]) && !projectScripts.has(m[1])) say(file, lineAt(m.index ?? 0), `names npm run ${m[1]}, which isn't a script of this repository`, 'name a script in the root package.json, or write the npx command');
}

if (problems.length) {
  console.error(`check:names: ${problems.length} name${problems.length === 1 ? '' : 's'} the guides give that don't exist\n` + problems.map((p) => `  ${p}`).join('\n'));
  process.exit(1);
}
console.log(`check:names: ${files.length} guides; every component, prop, export, token and command they name exists.`);
