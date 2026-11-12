#!/usr/bin/env node
// check:copy (F11, D11; contract V3): the ui-copy rules that can be read from source, over the words a person reads:
// core stories, the library app's page data and every template's content JSON.
//
//   node tools/check-copy.mjs [--all] [--json]
//
// Rules (docs: .github/skills/ui-copy/SKILL.md, "Making it enforceable"):
//   CP1 banned   no "OK", "Submit", "click here", "please", "simply", "oops" as words a person reads
//   CP2 click    no "click": say "choose", "press", "select" or just the verb
//   CP3 ellipsis an ellipsis character (…), never three dots
//   CP4 quotes   curly apostrophes and quotes in visible copy (’ “ ”), never straight ones inside words
//   CP5 case     sentence case on button labels and headings: at most one capitalised word that isn't a proper noun
//   CP6 verbs    a button label is three words or fewer
// Errors fail the run. A replica template's content keeps the reference product's own words (RR1), so CP1, CP2, CP5
// and CP6 are warnings there and errors everywhere else; CP3 and CP4 are errors everywhere.
// Proper nouns and accepted terms: tools/copy-glossary.json ("proper": words that keep their capital, "allow": exact
// strings a rule may skip, each with its reason).
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const argv = process.argv.slice(2);
const rel = (p) => relative(root, p).split(sep).join('/');
const walk = (d, re) => (existsSync(d) ? readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? (f === 'node_modules' || f === 'dist' ? [] : walk(join(d, f), re)) : re.test(f) ? [join(d, f)] : [])) : []);
const glossaryFile = join(root, 'tools/copy-glossary.json');
const glossary = existsSync(glossaryFile) ? JSON.parse(readFileSync(glossaryFile, 'utf8')) : { proper: [], allow: [], replicas: [] };
const proper = new Set(glossary.proper ?? []);
const allow = new Set((glossary.allow ?? []).map((a) => a.text));
const replicas = new Set(glossary.replicas ?? []);

const LABEL_KEYS = /^(label|title|heading|hint|placeholder|description|alt|aria-label|ariaLabel|text|body|message|caption|summary|action|actionLabel|cta|button|empty|emptyTitle|emptyBody|status|name)$/;
const BUTTONISH = /^(action|actionLabel|cta|button)$/;
const HEADINGISH = /^(title|heading|emptyTitle)$/;

/** @type {{ file: string, line: number, rule: string, level: 'error'|'warning', text: string, message: string }[]} */
const findings = [];
const lineAt = (text, i) => text.slice(0, i).split('\n').length;

function judge(file, line, key, s, replica) {
  if (!s || allow.has(s) || !/[A-Za-z]{2}/.test(s) || /^[\w.-]+$/.test(s) && !/\s/.test(s) && /[.-]/.test(s)) return;
  if (/^(https?:|mailto:|\/|#|\{|var\(|--)/.test(s)) return;
  const soft = replica ? 'warning' : 'error';
  const add = (rule, level, message) => findings.push({ file: rel(file), line, rule, level, text: s.length > 80 ? `${s.slice(0, 77)}…` : s, message });
  if (/\b(OK|Submit|click here|Click here|please|Please|simply|Simply|oops|Oops)\b/.test(s)) add('CP1', soft, 'a banned word (OK, Submit, click here, please, simply, oops)');
  else if (/\bclick(s|ed|ing)?\b/i.test(s)) add('CP2', soft, 'says "click": say choose, press, select, or just the verb');
  if (/\.\.\./.test(s)) add('CP3', 'error', 'three dots: use the ellipsis character …');
  if (/[A-Za-z]'[A-Za-z]/.test(s) || /(^|\s)"[^"]+"(\s|$|[.,])/.test(s)) add('CP4', 'error', 'a straight apostrophe or quote in visible copy: use ’ or “ ”');
  if (BUTTONISH.test(key) || HEADINGISH.test(key)) {
    const words = s.replace(/[“”"’'(),.:;!?…]/g, ' ').split(/\s+/).filter(Boolean);
    const caps = words.slice(1).filter((w) => /^[A-Z][a-z]/.test(w) && !proper.has(w) && !proper.has(w.replace(/s$/, '')));
    if (words.length > 1 && caps.length >= 1 && caps.length >= Math.ceil((words.length - 1) / 2)) add('CP5', 'warning', `Title Case (${caps.join(', ')}): use sentence case, or add a proper noun to tools/copy-glossary.json`);
    if (BUTTONISH.test(key) && words.length > 3 && !/[.?!]$/.test(s)) add('CP6', 'warning', `a ${words.length}-word action label: three words or fewer`);
  }
}

// Stories and the library app: string literals of label-like JSX props, and label-like object keys in data.
const sources = [...walk(join(root, 'packages/core'), /\.stories\.tsx$/), ...walk(join(root, 'apps/library/src/data'), /\.(ts|tsx)$/)];
for (const file of sources) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\b([A-Za-z-]+)\s*=\s*"([^"{}\n]*)"/g)) if (LABEL_KEYS.test(m[1])) judge(file, lineAt(text, m.index ?? 0), m[1], m[2], false);
  for (const m of text.matchAll(/\b([A-Za-z]+)\s*:\s*(['"])((?:(?!\2)[^\\\n]|\\.)*)\2/g)) if (LABEL_KEYS.test(m[1])) judge(file, lineAt(text, m.index ?? 0), m[1], m[3].replace(/\\(.)/g, '$1'), false);
}
// Template content: every label-like string value.
const tdir = join(root, 'packages/templates');
for (const template of existsSync(tdir) ? readdirSync(tdir) : []) {
  for (const file of walk(join(tdir, template, 'content'), /\.json$/)) {
    const text = readFileSync(file, 'utf8');
    const visit = (node, key) => {
      if (typeof node === 'string') {
        if (LABEL_KEYS.test(key)) {
          const i = text.indexOf(JSON.stringify(node).slice(1, -1));
          judge(file, i >= 0 ? lineAt(text, i) : 1, key, node, replicas.has(template));
        }
      } else if (Array.isArray(node)) node.forEach((n) => visit(n, key));
      else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) visit(v, k);
    };
    visit(JSON.parse(text), '');
  }
}

const baselineFile = join(root, 'tools/copy-baseline.json');
const key = (f) => `${f.file} ${f.rule} ${f.text}`;
if (argv.includes('--write-baseline')) {
  const debt = findings.filter((f) => f.level === 'error').map((f) => ({ file: f.file, rule: f.rule, text: f.text }));
  writeFileSync(baselineFile, JSON.stringify({ $description: 'check:copy findings that existed when the check was added (C3, Worker 109, 2026-11-12). Fixing them changes rendered pages, so it is a copy packet of its own. Never add to this list to make a packet pass.', findings: debt }, null, 2) + '\n');
}
const baseline = new Set(existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')).findings.map(key) : []);
for (const f of findings) if (f.level === 'error' && baseline.has(key(f))) (f.level = 'warning'), (f.message += ' (baseline debt)');
const errors = findings.filter((f) => f.level === 'error');
const byRule = Object.entries(findings.reduce((a, f) => ((a[`${f.level} ${f.rule}`] = (a[`${f.level} ${f.rule}`] ?? 0) + 1), a), {}));
if (argv.includes('--json')) console.log(JSON.stringify({ errors: errors.length, warnings: findings.length - errors.length, byRule: Object.fromEntries(byRule), findings }, null, 2));
else {
  const shown = argv.includes('--all') ? findings : errors;
  for (const f of shown.slice(0, argv.includes('--all') ? Infinity : 40)) console.log(`${f.level === 'error' ? '✗' : '!'} ${f.file}:${f.line} [${f.rule}] “${f.text}”: ${f.message}`);
  console.log(`check:copy: ${sources.length} source files and template content; ${errors.length} errors, ${findings.length - errors.length} warnings${byRule.length ? ` (${byRule.map(([k, n]) => `${k} ${n}`).join(', ')})` : ''}.`);
}
process.exit(errors.length ? 1 : 0);
