#!/usr/bin/env node
// G4 (F8, LG10): every core change since the frozen base is recorded in Templates and the library, with its reason and
// default. Run at P3 of the pressure-test loop, before a commit that touches core, like check:regression:
//
//   node tools/check-core-log.mjs [--base <commit>] [--doc <path to templates-and-library.md>]
//
// The base is .shots/base-dist/BASE.json's head unless --base is given. A changed core source file must be named in the
// record by its file name (`icons.ts`, `check-project.mjs`, `ribbon.css`, case-insensitively), a .tsx by its component
// (`Ribbon`), or a .css by any component it styles (`controls.css` by `Checkbox`, read from its [data-dl] selectors, F27);
// a change of line endings only is skipped (F23). A core token added since the base, or one whose resolved value changed, must be named by
// its dotted name (`c.button.pressed-edge`). Generated output, stories, guides and the agent index are not core changes.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const root = process.cwd();
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const baseJson = join(root, '.shots/base-dist/BASE.json');
const base = opt('base', existsSync(baseJson) ? JSON.parse(readFileSync(baseJson, 'utf8')).head : undefined);
if (!base) {
  console.error('check:core-log: no base. Freeze one (npm run regression:freeze) or pass --base <commit>.');
  process.exit(2);
}
const docPath = opt('doc', join(root, 'docs/templates-and-library.md'));
if (!existsSync(docPath)) {
  console.error(`check:core-log: no record at ${docPath}. Pass --doc <path to templates-and-library.md>.`);
  process.exit(2);
}
const doc = readFileSync(docPath, 'utf8');
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });

const GENERATED = /^packages\/core\/(agent\/|tokens\/generated\/|css\/tokens\.css$|tokens\/tokens\.(colour|contrast-[\w-]+)\.json$|probes\/|guide\/|AGENTS\.md$|README\.md$|CHANGELOG\.md$)|\.stories\.tsx$|\.md$/;
const changed = [...new Set([...git('diff', '--name-only', base, '--', 'packages/core').split('\n'), ...git('ls-files', '--others', '--exclude-standard', '--', 'packages/core').split('\n')])]
  .map((f) => f.trim())
  .filter((f) => f && !GENERATED.test(f) && /\.(tsx?|css|mjs|js|json)$/.test(f) && !/^packages\/core\/tokens\//.test(f));

const missing = [];
const lower = doc.toLowerCase();
const has = (/** @type {string} */ n) => new RegExp(`(^|[^\\w-])${n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(lower);
const hasComponent = (/** @type {string} */ n) => new RegExp(`(^|[^\\w-])${n}(?![\\w-])`).test(doc);
const pascalOf = (/** @type {string} */ s) => s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
for (const f of changed) {
  // F23, F27: a change of line endings only isn't a core change.
  try {
    git('diff', '--quiet', '--ignore-cr-at-eol', base, '--', f);
    if (existsSync(join(root, f)) && git('ls-files', '--', f).trim()) continue;
  } catch {}
  const name = basename(f);
  const stem = basename(f, extname(f));
  // F27: a shared stylesheet (controls.css) is recorded under any component it styles, read from its [data-dl] selectors.
  const styled = extname(f) === '.css' && existsSync(join(root, f))
    ? [...new Set([...readFileSync(join(root, f), 'utf8').matchAll(/\[data-dl\s*=\s*['"]?([\w-]+)['"]?\s*\]/g)].map((m) => m[1]))]
    : [];
  const components = [...(extname(f) === '.tsx' ? [stem] : []), ...styled.map(pascalOf)];
  if (![name, f].some(has) && !components.some(hasComponent)) missing.push(`${f}: name \`${name}\`${components.length ? ` or a component it ${extname(f) === '.css' ? 'styles' : 'is'} (${components.slice(0, 4).join(', ')})` : ''} in the record`);
}

// Tokens: the resolved set at the base and now, light and dark.
const resolvedPath = 'packages/core/tokens/generated/tokens.resolved.json';
let before = {};
try {
  before = JSON.parse(git('show', `${base}:${resolvedPath}`));
} catch {}
const now = JSON.parse(readFileSync(join(root, resolvedPath), 'utf8'));
const tokens = new Set();
for (const scheme of Object.keys(now)) {
  for (const [k, v] of Object.entries(now[scheme] ?? {})) {
    const was = before[scheme]?.[k];
    if (was === undefined || JSON.stringify(was) !== JSON.stringify(v)) tokens.add(k);
  }
}
for (const k of tokens) if (!doc.includes(k)) missing.push(`token ${k}: added or its default changed since ${base.slice(0, 7)}; name \`${k}\` in the record`);

console.log(`check:core-log: ${changed.length} core source files and ${tokens.size} tokens changed since ${base.slice(0, 7)}; ${missing.length} unrecorded (record: ${docPath}).`);
if (missing.length) {
  for (const m of missing.slice(0, 40)) console.log(`  ✗ ${m}`);
  if (missing.length > 40) console.log(`  … ${missing.length - 40} more`);
  process.exit(1);
}
