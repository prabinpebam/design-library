#!/usr/bin/env node
/**
 * Views have no styles (brief: "The library presents itself"; foundation: "Self-presentation: compounds").
 *
 * Counts what the library app draws for itself instead of taking it from core: raw lowercase JSX elements in its
 * views and the rules in its own CSS. Files and rules on the named app-tooling list are reported apart and allowed.
 *
 *   node tools/check-views.mjs            report, fail if anything outside the app-tooling list carries styles
 *   node tools/check-views.mjs --report   report only, never fail
 *   node tools/check-views.mjs --json     machine-readable counts
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const appSrc = join(root, 'apps', 'library', 'src');

/**
 * App tooling: library-app-only machinery that is not a view and has no product job outside this app. Each entry is
 * named and justified in docs/foundation.md "Self-presentation: compounds". Keep this list short.
 */
const toolingFiles = new Set([
  // F4 element picker: a fixed overlay drawn from viewport geometry over any page (react-grab style). Not product UI.
  'apps/library/src/revisions/Picker.tsx',
  // Revision anchor capture: reads the DOM, renders nothing.
  'apps/library/src/revisions/capture.ts',
]);
/** CSS selectors (by their data-app / data-rev name) that are app tooling, allowed in @layer app. */
const toolingSelectors = [/data-app='pick-/, /\[data-rev-jumped\]/, /data-print='hide'/];

/**
 * Pending an owner decision (C6, 2026-11-07): the revision pane's comment list (one hairline between comments, 8 px
 * rows), its target lists and the archive disclosure. Merging them into RowList or a Disclosure would restyle them, so
 * they keep their look until the owner chooses. Exact selectors, and a per-file element budget that fails if exceeded.
 */
const pendingSelectors = [/data-app='rev-comments'/, /data-app='rev-targets'/, /data-app='rev-archived'/];
const pendingElements = new Map([['apps/library/src/revisions/RevisionPane.tsx', 8]]);

/** Native elements a view may still use without styling them: they carry semantics only, and core's base styles them. */
const semanticOnly = new Set(['code', 'kbd', 'small', 'strong', 'em', 'svg', 'path']);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const rel = (p) => relative(root, p).split(sep).join('/');

// Q64: the renderer and the templates' registries and bindings are views too; a template's own parts (parts/) are
// components and are held to the component rules instead.
const viewRoots = [appSrc, join(root, 'packages', 'core', 'render'), join(root, 'packages', 'templates')];
const files = viewRoots.flatMap(walk).filter((f) => !rel(f).includes('/node_modules/') && !/^packages\/templates\/[^/]+\/(parts|tokens)\//.test(rel(f)));
const report = { views: [], css: [], totals: { rawElements: 0, rawStyled: 0, cssRules: 0, cssRulesTooling: 0, dataApp: 0, pendingElements: 0, pendingRules: 0 } };

for (const file of files.filter((f) => f.endsWith('.tsx'))) {
  const text = readFileSync(file, 'utf8');
  const path = rel(file);
  const tooling = toolingFiles.has(path);
  const tags = [...text.matchAll(/(?<![\w$.])<([a-z][a-z0-9]*)(?=[\s>/])/g)].map((m) => m[1]);
  const styled = tags.filter((t) => !semanticOnly.has(t));
  const dataApp = (text.match(/data-app=/g) ?? []).length;
  report.views.push({ path, tooling, rawElements: tags.length, rawStyled: styled.length, dataApp, byTag: count(styled) });
  if (!tooling) {
    const pending = Math.min(pendingElements.get(path) ?? 0, styled.length);
    report.totals.pendingElements += pending;
    report.totals.rawElements += tags.length;
    report.totals.rawStyled += styled.length - pending;
    report.totals.dataApp += dataApp;
  }
}

for (const file of files.filter((f) => f.endsWith('.css'))) {
  const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const path = rel(file);
  // A rule is a selector block that holds declarations (not @layer / @media wrappers).
  const rules = [...text.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => m[1].trim()).filter((s) => !s.startsWith('@'));
  const tooling = rules.filter((s) => toolingSelectors.some((re) => re.test(s)));
  const pending = rules.filter((s) => pendingSelectors.some((re) => re.test(s)));
  report.css.push({ path, rules: rules.length, tooling: tooling.length, pending: pending.length });
  report.totals.pendingRules += pending.length;
  report.totals.cssRules += rules.length - tooling.length - pending.length;
  report.totals.cssRulesTooling += tooling.length;
}

function count(list) {
  const out = {};
  for (const t of list) out[t] = (out[t] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]));
}

const args = new Set(process.argv.slice(2));
if (args.has('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('Library app views: raw elements (styled by the app) / all raw / data-app hooks');
  for (const v of report.views) console.log(`  ${v.tooling ? '[tooling] ' : ''}${v.path}: ${v.rawStyled} / ${v.rawElements} / ${v.dataApp}  ${JSON.stringify(v.byTag)}`);
  console.log('Library app CSS rules (tooling, pending owner)');
  for (const c of report.css) console.log(`  ${c.path}: ${c.rules} (${c.tooling}, ${c.pending})`);
  const t = report.totals;
  console.log(`Totals outside app tooling: ${t.rawStyled} styled raw elements (${t.rawElements} raw), ${t.cssRules} app CSS rules, ${t.dataApp} data-app hooks; ${t.cssRulesTooling} tooling rules; pending owner: ${t.pendingElements} elements, ${t.pendingRules} rules.`);
}

const failing = report.totals.rawStyled + report.totals.cssRules;

// Q59: no native <select> anywhere in core or the library app; every dropdown is the custom Select (its list is ListItems).
const nativeSelects = [join(root, 'packages', 'core', 'react'), ...viewRoots]
  .flatMap(walk)
  .filter((f) => /\.(tsx|ts)$/.test(f))
  .flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/<select\b|createElement\(\s*['"]select['"]/g)].map(() => rel(f)));
if (!args.has('--json')) console.log(`Native <select> elements in core and the library app: ${nativeSelects.length}${nativeSelects.length ? ` (${[...new Set(nativeSelects)].join(', ')})` : ''}`);
if (!args.has('--report') && !args.has('--json') && nativeSelects.length > 0) {
  console.error('check-views: a native <select> is used; use Select (Q59).');
  process.exit(1);
}

if (!args.has('--report') && !args.has('--json') && failing > 0) {
  console.error(`check-views: views carry styles outside the app-tooling list (${failing}). See docs/foundation.md "Self-presentation: compounds".`);
  process.exit(1);
}
