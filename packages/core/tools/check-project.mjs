#!/usr/bin/env node
// @ts-check
/**
 * Project check: the library's Never rules and "Rules agents miss", run on YOUR project (improvement plan IP37, IP38).
 * Dependency-free; reads only your source and this package's own token list.
 *
 *   npx design-library-check                         checks src/ (templates in src/templates/)
 *   npx design-library-check --src app --templates app/templates
 *   npx design-library-check --strict                errors fail the run (exit 1)
 *   npx design-library-check --strict=all            errors and warnings fail the run
 *   npx design-library-check --all                   list every finding (by default each file shows 3 per rule)
 *   npx design-library-check --share                 also print library vs custom elements per view (proof metric)
 *   npx design-library-check --json                  machine-readable result
 *   npx design-library-check --site content/site     the site document (site.json) to read; found under the
 *                                                    source folder when left out (a template's own site/ is not the project's)
 *   npx design-library-check --config <file>         the exceptions file (default design-library-check.json)
 *
 * Nothing fails the run by default during the Beta (Q105.3: new checks start as warnings); add --strict when you're ready.
 * Errors are rules the guide already states, now checked: styles in views, native <select>, selecting a
 * core component's data-dl name, descendant part selectors, raw scroll regions and scrollbar styling, backdrop blur
 * outside the material token, literal or "all" transitions, the private duration scale.
 * Warnings count what usually means a missing seam: core tokens set outside the
 * theme-settings allow-list, !important, primitive reads, raw sizes, a scaled root font size, global selectors, raw
 * interactive markup in custom parts, words written in code, unexplained clips, icon data under a name no component
 * draws (`icon-name`, MP26), and, when the project has a site
 * document, page-specific code (a literal route compared in TSX, DP19). Each finding names a file, a line and the fix.
 *
 * Exceptions (DP19) are declared, never silent: design-library-check.json in the project folder.
 *   {
 *     "wordsInCode": { "allow": ["Harbour Books", "/^v\\d+/"], "files": ["src/dev/**"] },
 *     "pageSpecificCode": { "files": ["src/router.tsx"] }
 *   }
 * An "allow" entry is the exact words or a /regular expression/; "files" are globs from the project folder (* and **).
 * The summary counts what each exception allowed and names entries that allowed nothing, so the list stays honest.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (/** @type {string} */ name, /** @type {string} */ fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const flag = (/** @type {string} */ name) => argv.some((a) => a === name || a.startsWith(`${name}=`));
const strict = argv.find((a) => a.startsWith('--strict'));
const CWD = process.cwd();
const SRC = resolve(CWD, opt('--src', 'src'));
const TEMPLATES = resolve(CWD, opt('--templates', join(opt('--src', 'src'), 'templates')));
const rel = (/** @type {string} */ p) => relative(CWD, p).split(sep).join('/');

if (!existsSync(SRC)) {
  console.error(`design-library-check: no source folder at ${rel(SRC) || '.'}; pass --src <folder>.`);
  process.exit(2);
}

// Core's own names: every custom property the token build writes, the theme-settings allow-list and core's data-dl names.
const tokensCss = readFileSync(join(PKG, 'css/tokens.css'), 'utf8');
const coreTokens = new Set([...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
/** @type {Record<string, Record<string, string>>} */
const settingsJson = existsSync(join(PKG, 'tokens/settings.json')) ? JSON.parse(readFileSync(join(PKG, 'tokens/settings.json'), 'utf8')) : {};
const settings = new Map(Object.entries(settingsJson).filter(([k]) => !k.startsWith('$')).flatMap(([component, names]) => Object.keys(names).map((n) => [n, component])));
const coreCss = (/** @type {string} */ dir) => (existsSync(dir) ? walk(dir, /\.css$/) : []);
const coreParts = new Set(coreCss(join(PKG, 'css')).flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/\[data-dl='([\w-]+)'\]/g)].map((m) => m[1])));

function walk(/** @type {string} */ dir, /** @type {RegExp} */ ext) {
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, ext));
    else if (ext.test(name)) out.push(p);
  }
  return out;
}

// ---- Exceptions (DP19) ----
const CONFIG = resolve(CWD, opt('--config', 'design-library-check.json'));
/** @type {{ wordsInCode?: { allow?: string[]; files?: string[] }; pageSpecificCode?: { files?: string[] } }} */
let config = {};
if (existsSync(CONFIG)) {
  try {
    config = JSON.parse(readFileSync(CONFIG, 'utf8'));
  } catch (e) {
    console.error(`design-library-check: ${rel(CONFIG)} isn't valid JSON (${/** @type {Error} */ (e).message}).`);
    process.exit(2);
  }
}
const glob = (/** @type {string} */ g) =>
  new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, (c) => `\\${c}`).replace(/\*\*\/?/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]').replace(/\u0000/g, '.*')}$`);
/** @type {Map<string, number>} */
const used = new Map();
const exception = (/** @type {string} */ key, /** @type {(entry: string) => boolean} */ test, /** @type {string[] | undefined} */ entries) => {
  for (const entry of entries ?? []) {
    const k = `${key} ${entry}`;
    used.set(k, used.get(k) ?? 0);
    if (test(entry)) {
      used.set(k, (used.get(k) ?? 0) + 1);
      return true;
    }
  }
  return false;
};
for (const [key, entries] of [
  ['wordsInCode.allow', config.wordsInCode?.allow],
  ['wordsInCode.files', config.wordsInCode?.files],
  ['pageSpecificCode.files', config.pageSpecificCode?.files],
])
  for (const entry of /** @type {string[] | undefined} */ (entries) ?? []) used.set(`${key} ${entry}`, 0);
const fileAllowed = (/** @type {string} */ key, /** @type {string[] | undefined} */ globs, /** @type {string} */ file) =>
  exception(`${key}.files`, (g) => glob(g).test(rel(file)), globs);
const wordsAllowed = (/** @type {string} */ words, /** @type {string} */ file) =>
  fileAllowed('wordsInCode', config.wordsInCode?.files, file) ||
  exception('wordsInCode.allow', (a) => (/^\/.+\/[a-z]*$/.test(a) ? new RegExp(a.slice(1, a.lastIndexOf('/')), a.slice(a.lastIndexOf('/') + 1)).test(words) : a === words.trim()), config.wordsInCode?.allow);

// ---- The site document (DP19): when the project has one, its routes are data ----
const siteArg = opt('--site', '');
/** @param {string} dir @param {number} depth @returns {string[]} */
const findSites = (dir, depth) => {
  if (depth < 0 || !existsSync(dir)) return [];
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...findSites(p, depth - 1));
    else if (name === 'site.json') {
      try {
        if ('siteVersion' in JSON.parse(readFileSync(p, 'utf8'))) out.push(dirname(p));
      } catch {}
    }
  }
  return out;
};
const sites = siteArg ? [resolve(CWD, siteArg)] : findSites(SRC, 6).filter((d) => !d.startsWith(TEMPLATES + sep));
/** @type {Map<string, string>} route → the page document that declares it */
const routes = new Map();
for (const site of sites) {
  const pages = join(site, 'pages');
  if (existsSync(pages))
    for (const name of readdirSync(pages).filter((n) => n.endsWith('.json'))) {
      try {
        const page = JSON.parse(readFileSync(join(pages, name), 'utf8'));
        if (typeof page.route === 'string') routes.set(page.route, rel(join(pages, name)));
      } catch {}
    }
}

const templateIds = existsSync(TEMPLATES) ? readdirSync(TEMPLATES).filter((n) => statSync(join(TEMPLATES, n)).isDirectory()) : [];
const inTemplate = (/** @type {string} */ f) => f.startsWith(TEMPLATES + sep);
const isPart = (/** @type {string} */ f) => inTemplate(f) && /[\\/](parts|tokens|motion)[\\/]/.test(f.slice(TEMPLATES.length));
const isStory = (/** @type {string} */ f) => /\.stories\.tsx?$/.test(f);
const isTokenFile = (/** @type {string} */ f) => /[\\/]tokens[\\/]/.test(f);

const tsx = walk(SRC, /\.tsx$/).filter((f) => !isStory(f));
const css = walk(SRC, /\.css$/);
const views = tsx.filter((f) => !isPart(f));
const parts = tsx.filter(isPart);

/** @type {{ level: 'error' | 'warning'; rule: string; file: string; line: number; message: string }[]} */
const findings = [];
const lineAt = (/** @type {string} */ text, /** @type {number} */ index) => text.slice(0, index).split('\n').length;
const add = (/** @type {'error'|'warning'} */ level, /** @type {string} */ rule, /** @type {string} */ file, /** @type {number} */ line, /** @type {string} */ message) =>
  findings.push({ level, rule, file: rel(file), line, message });
const noComments = (/** @type {string} */ t) => t.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

// ---- TSX ----
for (const file of views) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\b(className|style)\s*=\s*[{"']/g))
    add('error', 'view-style', file, lineAt(text, m.index ?? 0), `${m[1]} in a view: arrange with layouts, Stack, Cluster, Grid and props; the look comes from tokens (Never 1)`);
  // A view may import the library's stylesheets and a template's; its own stylesheet is a style in a view.
  for (const m of text.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)) {
    const target = m[1].startsWith('.') ? resolve(dirname(file), m[1]) : '';
    if (target && !target.startsWith(TEMPLATES + sep) && !inTemplate(file))
      add('error', 'view-style', file, lineAt(text, m.index ?? 0), `imports its own stylesheet (${m[1]}): styles live only in a template part with its own tokens (Never 1)`);
  }
}
for (const file of tsx) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/<select\b/g)) add('error', 'native-select', file, lineAt(text, m.index ?? 0), 'a native <select>: use Select from @design-library/core/components');
  for (const m of text.matchAll(/overflow(?:X|Y|Block|Inline)?\s*:\s*['"`](?:auto|scroll)['"`]/g))
    add('error', 'scroll-region', file, lineAt(text, m.index ?? 0), `an inline scroll region (${m[0]}): wrap the region in ScrollArea (Never 9)`);
  // Words a person reads, written in code (Never 8): text between tags and literal label-like props.
  for (const m of text.matchAll(/>\s*([A-Z][a-z]+(?:[ ,'’][A-Za-z]+){1,})\s*</g))
    if (!wordsAllowed(m[1], file)) add('warning', 'words-in-code', file, lineAt(text, m.index ?? 0), `"${m[1]}" is written in code: put it in content JSON or a prop (Never 8)`);
  for (const m of text.matchAll(/\b(label|title|alt|placeholder|hint|aria-label|description)\s*=\s*"([^"{}]*[A-Za-z]{2,}[^"{}]*)"/g))
    if ((/\s/.test(m[2]) || /^[A-Z]/.test(m[2])) && !wordsAllowed(m[2], file)) add('warning', 'words-in-code', file, lineAt(text, m.index ?? 0), `${m[1]}="${m[2]}" is written in code: read it from content (Never 8)`);
  // A binary setting is a Switch by default (Q121, Q124). A toggle button (Button or IconButton with `pressed`) or a
  // standalone Checkbox (not inside a CheckboxGroup) needs a reason in a comment within the three lines above it:
  // `{/* binary-setting: <why a Switch doesn't fit> */}` (`toggle-button:` is accepted too). Established icon-toggle
  // patterns need none (Q125): visibility (eye) and lock, recognised by their icon (eye, eye-off, lock, unlock) or a
  // name starting Show, Hide, Lock or Unlock.
  const lines = text.split('\n');
  for (const m of text.matchAll(/<(Button|IconButton|Checkbox)\b(?!Group)/g)) {
    let i = (m.index ?? 0) + m[0].length;
    let depth = 0;
    let quote = '';
    for (; i < text.length; i++) {
      const c = text[i];
      if (quote) { if (c === quote && text[i - 1] !== '\\') quote = ''; continue; }
      if (c === '"' || c === "'" || c === '`') quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) break;
    }
    const attrs = text.slice((m.index ?? 0) + m[0].length, i);
    const checkbox = m[1] === 'Checkbox';
    if (!checkbox && !/(^|\s)(pressed|aria-pressed)(\s*=|\s|\/?$)/.test(attrs)) continue;
    if (checkbox) {
      const before = text.slice(0, m.index ?? 0);
      if (before.lastIndexOf('<CheckboxGroup') > before.lastIndexOf('</CheckboxGroup>')) continue;
    }
    if (!checkbox && /['"`](eye|eye-off|eye-closed|lock|unlock|lock-open)['"`]|(label|aria-label)\s*=\s*\{?\s*[`'"](Show|Hide|Lock|Unlock)\b/.test(attrs)) continue;
    const line = lineAt(text, m.index ?? 0);
    const above = lines.slice(Math.max(0, line - 4), line).join('\n');
    if (!/(binary-setting|toggle-button):\s*[^\s*/}][^\n]{9,}/.test(above))
      add('error', 'toggle-justification', file, line, `${checkbox ? 'a standalone Checkbox' : `a toggle button (${m[1]} with pressed)`} without a reason: Switch is the default for a binary setting; if a ${checkbox ? 'checkbox' : 'toggle button'} fits better (a dense inspector, a toolbar, a list item's done state, consent), write why in a comment on the line above: {/* binary-setting: <why a Switch doesn't fit> */}. Visibility (eye) and lock toggles need none`);
  }
}
// Page-specific code (DP19, DR35): with a site document, a route compared in code is a page the data can't describe.
if (sites.length)
  for (const file of tsx) {
    const text = noComments(readFileSync(file, 'utf8')).replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    const ROUTE = /(?:[=!]==?\s*(['"`])(\/[^'"`\s]*)\1|(['"`])(\/[^'"`\s]*)\3\s*[=!]==?|\bcase\s+(['"`])(\/[^'"`\s]*)\5\s*:|\.startsWith\(\s*(['"`])(\/[^'"`\s]+)\7\s*\))/g;
    for (const m of text.matchAll(ROUTE)) {
      const route = m[2] ?? m[4] ?? m[6] ?? m[8];
      if (fileAllowed('pageSpecificCode', config.pageSpecificCode?.files, file)) continue;
      const page = routes.get(route);
      add('warning', 'page-specific', file, lineAt(text, m.index ?? 0), `compares the route '${route}' in code${page ? ` (the page in ${page})` : ''}: say what differs in the page document (a block, a slot, a binding), so the site stays data; a router that must branch goes in pageSpecificCode.files`);
    }
  }
for (const file of parts) {
  const text = readFileSync(file, 'utf8');
  const raw = [...text.matchAll(/<(a|button|img|h[1-6]|input|textarea)(?=[\s>/])/g)];
  for (const m of raw) {
    const core = { a: 'Link', button: 'Button', img: 'Image', input: 'TextField', textarea: 'TextArea' }[m[1]] ?? 'Heading';
    add('warning', 'raw-markup', file, lineAt(text, m.index ?? 0), `a raw <${m[1]}> in a custom part: compose core ${core}, so focus, names, targets and token updates come with it`);
  }
}

// ---- CSS ----
const DESCENDANT = /\[data-dl(?:-part)?='[^']+'\](?:\[[^\]]*\]|:[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?)*\s+(?::is\()?\[data-dl-part=/;
const LAYOUT = /^(width|height|inline-size|block-size|min-[\w-]+|max-[\w-]+|top|left|right|bottom|inset(-.+)?|margin(-.+)?|padding(-.+)?|grid-template-(rows|columns)|flex-basis|font-size)$/;
const SCALE = /--duration-(instant|fast|medium|slow|xslow)\b/;
const bare = (/** @type {string} */ v) => {
  let s = v;
  for (let i = 0; i < 6 && /var\(/.test(s); i++) s = s.replace(/var\([^()]*(\([^()]*\))*[^()]*\)/g, ' ');
  return s;
};

for (const file of css) {
  const text = noComments(readFileSync(file, 'utf8'));
  const tokenFile = isTokenFile(file);
  // A template theme generated from tokens/theme.json (Q118, F15.FR1) re-declares core tokens under [data-template] on purpose,
  // echoing core's own declarations (some read primitives); the generator checks theme.json, so those warnings don't apply here.
  const generatedTheme = /[\\/]tokens[\\/]theme\.css$/.test(file) && readFileSync(file, 'utf8').startsWith('/* Generated by design-library-template-tokens');
  if (SCALE.test(text)) add('error', 'motion', file, lineAt(text, text.search(SCALE)), `reads the private duration scale (${text.match(SCALE)?.[0]}): read a role such as --duration-change or --duration-move`);
  let rawSizes = 0;
  let firstRaw = 0;
  for (const rule of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim().replace(/\s+/g, ' ');
    if (selector.startsWith('@')) continue;
    const line = lineAt(text, (rule.index ?? 0) + rule[0].indexOf('{'));
    const body = rule[2];
    for (const m of selector.matchAll(/\[data-dl='([\w-]+)'\]/g))
      if (coreParts.has(m[1]) && !templateIds.some((id) => m[1].startsWith(`${id}-`)))
        add('error', 'core-selector', file, line, `selects the core component [data-dl='${m[1]}']: use a prop, slot, context attribute or theme setting (Never 2, the seam ladder)`);
    if (DESCENDANT.test(selector)) add('error', 'part-path', file, line, `a descendant part path (${selector}): reach your own parts by child paths (\`> [data-dl-part=…]\`)`);
    if (/::-webkit-scrollbar|(?:^|[;\s{])scrollbar-(?:width|color|gutter)\s*:/.test(rule[0])) add('error', 'scroll-region', file, line, `scrollbar styling on ${selector}: scrollbars are drawn only by ScrollArea`);
    const declarationsOnlyVars = body.split(';').every((d) => !d.trim() || d.trim().startsWith('--'));
    const context = /^((:root|html|body)?(\[data-(scheme|contrast|motion|space|shape|material|density)(=[^\]]+)?\])*)(\s*,\s*(:root|html|body)?(\[data-(scheme|contrast|motion|space|shape|material|density)(=[^\]]+)?\])*)*$/.test(selector);
    const scoped = /\[data-dl(-part)?[\^*$|~]?=/.test(selector) || (context && declarationsOnlyVars) || /^(:root|html)(\[[^\]]+\])*(\s*,\s*(:root|html)(\[[^\]]+\])*)*$/.test(selector) || /^(from|to|\d+%)/.test(selector);
    if (!generatedTheme && !scoped && !(declarationsOnlyVars && /^(:root|html|body)/.test(selector)))
      add('warning', 'global-selector', file, line, `a global selector (${selector}) reaches inside core parts: scope it to your part's [data-dl='{template}-…'], or use a theme setting`);
    for (const d of body.split(';')) {
      const at = d.indexOf(':');
      if (at < 0) continue;
      const prop = d.slice(0, at).trim();
      const value = d.slice(at + 1).trim();
      if (/!important/.test(value)) add('warning', 'important', file, line, `!important on ${prop} in ${selector}: find the seam instead; a template's layer already wins over core`);
      if (!generatedTheme && /var\(--p-[\w-]+/.test(value)) add('warning', 'primitive', file, line, `${prop} reads a primitive (${value.match(/var\(--p-[\w-]+/)?.[0]}): read a semantic role (Never 3)`);
      if (!generatedTheme && prop.startsWith('--') && !prop.startsWith('--t-') && (coreTokens.has(prop) || prop.startsWith('--c-'))) {
        if (settings.has(prop)) add('warning', 'core-token', file, line, `sets ${prop}, a theme setting of ${settings.get(prop)}: set it with applySettings({ '${prop}': … }) from @design-library/core/theme`);
        else add('warning', 'core-token', file, line, `sets the core token ${prop}, which isn't on the theme-settings allow-list (tokens/settings.json): use a prop, applyBrand, applyFonts or a theme setting, or your own --t-{template}-* token`);
      }
      if (prop === 'font-size' && /^(:root|html)\b/.test(selector) && !/^(100%|1em|medium|inherit)$/.test(value))
        add('warning', 'root-size', file, line, `the root font size is set (${value}): it rescales every core token and fights browser zoom; leave the root size to the person`);
      if (prop === 'backdrop-filter' && !/^(none|var\(--material-backdrop\))$/.test(value))
        add('error', 'material', file, line, `backdrop-filter: ${value}: blur only through var(--material-backdrop) (a material role)`);
      if (/^(background|background-color)$/.test(prop) && /rgba?\([^)]*,\s*0?\.\d|hsla\(|\/\s*0?\.\d+\s*\)|transparent\s+\d+%/.test(value) && !tokenFile)
        add('warning', 'material', file, line, `a see-through background (${value}): see-through fills come from material roles`);
      if (/^(overflow(-x|-y)?)$/.test(prop) && /^(auto|scroll)\b/.test(value)) add('error', 'scroll-region', file, line, `a raw scroll region on ${selector}: wrap the region in ScrollArea and move its padding to the content inside (Never 9)`);
      if (/^(overflow(-x|-y)?)$/.test(prop) && /^(hidden|clip)\b/.test(value)) add('warning', 'clip', file, line, `${prop}: ${value} on ${selector} clips focus rings and shadows: keep it only with a reason, and pad at least a ring's reach inside`);
      if (/^(transition|transition-property|transition-duration|transition-timing-function|animation|animation-duration|animation-timing-function)$/.test(prop) && !/^(none|initial|unset|inherit)$/.test(value)) {
        const plain = bare(value);
        const literal = plain.match(/(^|[\s,])(\d*\.?\d+m?s)\b/g)?.map((x) => x.trim().replace(/^,/, '')).filter((x) => !/^0m?s$/.test(x));
        if (literal?.length) add('error', 'motion', file, line, `literal duration ${literal.join(', ')} in ${prop}: use a duration role (--duration-change, --duration-move…)`);
        const curve = plain.match(/\b(ease-in-out|ease-in|ease-out|ease|linear|cubic-bezier|steps)\b/);
        if (curve && prop !== 'transition-property') add('error', 'motion', file, line, `literal curve "${curve[1]}" in ${prop}: use an easing role (--easing-standard…)`);
        if (prop.startsWith('transition')) {
          const props = prop === 'transition-property' ? value.split(',').map((s) => s.trim()) : value.split(',').map((t) => t.trim().split(/\s+/)[0]);
          for (const p of props) {
            if (p === 'all') add('error', 'motion', file, line, `transition: all on ${selector}: name the properties`);
            if (p === 'backdrop-filter') add('error', 'material', file, line, `transitions backdrop-filter: never animate the blur`);
            if (LAYOUT.test(p)) add('warning', 'motion', file, line, `transitions the layout property ${p}: move it by transform, or keep it only with a reason`);
          }
        }
      }
      if (prop === 'will-change') add('warning', 'motion', file, line, `will-change at rest on ${selector}: set it only while moving`);
      if (!prop.startsWith('--') || !tokenFile || true) {
        const raw = bare(value).match(/(?<![\w.-])\d*\.?\d+(px|rem|em)\b/g)?.filter((x) => !/^0(px|rem|em)$/.test(x) && !/^1px$/.test(x));
        if (raw?.length) {
          rawSizes += raw.length;
          firstRaw ||= line;
        }
      }
    }
  }
  if (rawSizes) add('warning', 'raw-size', file, firstRaw, `${rawSizes} raw sizes (px, rem, em): read space, size and type roles (var(--space-…)); a template token aliases a semantic role`);
}

// ---- Brand icons (MP26, Q113, ID48): icon data under names that exist, each with a viewBox ----
const iconNames = new Set([...[...readFileSync(join(PKG, 'icons/icons.ts'), 'utf8').matchAll(/^ {2}'?([a-z][a-z0-9-]*)'?: \{/gm)].map((m) => m[1]), 'star']); // and Rating's mark
for (const file of walk(SRC, /\.json$/)) {
  const text = readFileSync(file, 'utf8');
  if (!/"glyphs"\s*:/.test(text)) continue;
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    continue;
  }
  if (!data || typeof data.glyphs !== 'object' || Array.isArray(data.glyphs)) continue;
  for (const [name, glyph] of Object.entries(data.glyphs)) {
    const line = lineAt(text, text.indexOf(`"${name}"`));
    if (!iconNames.has(name)) add('warning', 'icon-name', file, line, `"${name}" isn't an icon name, so no component draws it: rename it to the semantic name it replaces (npx design-library-icons --names)`);
    else if (!glyph || typeof glyph.v !== 'string' || !Array.isArray(glyph.c)) add('warning', 'icon-name', file, line, `"${name}" has no viewBox or shapes: make the file again with npx design-library-icons`);
  }
}

// ---- Share (IV4): library vs custom elements placed by each view ----
/** @type {{ file: string; library: number; custom: number }[]} */
const share = [];
if (flag('--share') || flag('--json')) {
  for (const file of views) {
    const text = readFileSync(file, 'utf8');
    const names = (/** @type {RegExp} */ from) =>
      new Set([...text.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)].filter((m) => from.test(m[2])).flatMap((m) => m[1].split(',').map((s) => s.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop() ?? '').filter((s) => /^[A-Z]/.test(s))));
    const lib = names(/^@design-library\/core\/(react|render)$/);
    const own = names(/(^\.|templates)/);
    const count = (/** @type {Set<string>} */ set) => [...text.matchAll(/<([A-Z][\w.]*)/g)].filter((m) => set.has(m[1])).length;
    const library = count(lib);
    const custom = count(own);
    if (library + custom) share.push({ file: rel(file), library, custom });
  }
}

const errors = findings.filter((f) => f.level === 'error');
const warnings = findings.filter((f) => f.level === 'warning');
if (flag('--json')) {
  console.log(JSON.stringify({ errors: errors.length, warnings: warnings.length, findings, share, sites: sites.map((d) => rel(d)), exceptions: Object.fromEntries(used) }, null, 2));
} else {
  /** @type {Map<string, number>} */
  const shown = new Map();
  for (const f of findings) {
    const key = `${f.file} ${f.rule}`;
    const n = (shown.get(key) ?? 0) + 1;
    shown.set(key, n);
    if (n <= 3 || flag('--all')) console.log(`${f.level === 'error' ? '✗' : '!'} ${f.file}:${f.line} [${f.rule}] ${f.message}`);
  }
  for (const [key, n] of shown) if (n > 3 && !flag('--all')) console.log(`  … ${n - 3} more [${key.split(' ')[1]}] in ${key.split(' ')[0]} (--all lists them)`);
  if (share.length) {
    console.log('\nLibrary and custom elements placed by each view:');
    for (const s of share) console.log(`  ${s.file}: ${s.library} library, ${s.custom} custom (${Math.round((100 * s.library) / (s.library + s.custom))}% library)`);
  }
  const byRule = Object.entries(findings.reduce((/** @type {Record<string, number>} */ a, f) => ((a[`${f.level} ${f.rule}`] = (a[`${f.level} ${f.rule}`] ?? 0) + 1), a), {}));
  console.log(`\ndesign-library-check: ${tsx.length} TSX and ${css.length} CSS files in ${rel(SRC) || '.'}; ${errors.length} errors, ${warnings.length} warnings${byRule.length ? ` (${byRule.map(([k, n]) => `${k} ${n}`).join(', ')})` : ''}.`);
  if (sites.length) console.log(`Site document${sites.length > 1 ? 's' : ''}: ${sites.map((d) => rel(d) || '.').join(', ')} (${routes.size} page routes); page-specific code is checked.`);
  if (used.size) {
    const unused = [...used].filter(([, n]) => !n).map(([k]) => k.replace(' ', ' → '));
    const allowed = [...used].reduce((a, [, n]) => a + n, 0);
    console.log(`Exceptions in ${rel(CONFIG)}: ${allowed} findings allowed${unused.length ? `; never used (remove them): ${unused.join('; ')}` : ''}.`);
  }
  if (findings.length && !strict) console.log('Nothing fails the run during the Beta unless you pass --strict (errors) or --strict=all (errors and warnings). Fix at the owner: theme, layout choice, props and slots, your custom part, then content.');
}
const failing = strict === '--strict=all' ? findings.length : strict ? errors.length : 0;
process.exit(failing ? 1 : 0);
