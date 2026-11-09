#!/usr/bin/env node
// @ts-check
/**
 * The block registry, searched by need (DP10, DR6, DR11; 0.4.0). Dependency-free.
 *
 *   npx design-library-blocks "a list of people with photos"   the blocks that fit, core first, then template parts
 *   npx design-library-blocks                                   every block
 *   npx design-library-blocks hero --full                      whole examples (by default each is cut to one line)
 *   npx design-library-blocks "pricing" --templates src/templates   also your own templates' parts (default src/templates)
 *   npx design-library-blocks "faq" --json                     machine-readable
 *
 * Every core block comes from the agent index (`agent/index.json`, generated from `schemas/blocks.schema.json`): its
 * type, one-line purpose, fields and an example (the schema's own, or a real use in a shipped template). Template
 * parts placed as blocks (`parts.blocks` in a template.json) come after, from the shipped templates and your own;
 * place a core block when one fits, and a part of your own only when none does.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (/** @type {string} */ name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : undefined;
};
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const valued = new Set(['--templates']);
const need = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1])).join(' ').trim();

/** @typedef {{ type: string; description: string; fields: { name: string; shape?: string; required?: boolean; description?: string }[]; example?: unknown; exampleFrom?: string; usedBy?: string[]; template?: string; source: 'core' | 'template' }} Entry */
const readJson = (/** @type {string} */ f) => JSON.parse(readFileSync(f, 'utf8'));
const index = readJson(join(PKG, 'agent/index.json'));

/** @type {Entry[]} */
const core = index.blocks.map((/** @type {any} */ b) => ({ ...b, source: 'core' }));

/** A template's parts placed as blocks: type, purpose (from its content schema), fields and example. */
const partsOf = (/** @type {string} */ id, /** @type {any} */ parts, /** @type {any} */ schema) =>
  (parts?.blocks ?? []).map((/** @type {any} */ b) => {
    const def = String(b.schema ?? '').startsWith('#/$defs/') ? schema?.$defs?.[b.schema.slice('#/$defs/'.length)] : undefined;
    const required = new Set(def?.required ?? []);
    return /** @type {Entry} */ ({
      type: b.type,
      description: b.description ?? def?.description ?? `Renders ${b.renders ?? b.type}.`,
      fields: Object.entries(def?.properties ?? {})
        .filter(([k]) => k !== 'type')
        .map(([k, s]) => ({ name: k, ...(required.has(k) ? { required: true } : {}), ...(/** @type {any} */ (s)?.description ? { description: /** @type {any} */ (s).description } : {}) })),
      example: b.example,
      template: id,
      source: 'template',
    });
  });

/** @type {Map<string, Entry>} */
const templateParts = new Map();
for (const t of index.templates ?? []) for (const e of partsOf(t.id, t.parts, undefined)) templateParts.set(e.type, e);
const own = resolve(process.cwd(), opt('--templates') ?? 'src/templates');
if (existsSync(own))
  for (const id of readdirSync(own)) {
    const manifest = join(own, id, 'template.json');
    if (!statSync(join(own, id)).isDirectory() || !existsSync(manifest)) continue;
    try {
      const schemaFile = join(own, id, 'content.schema.json');
      for (const e of partsOf(id, readJson(manifest).parts, existsSync(schemaFile) ? readJson(schemaFile) : undefined)) templateParts.set(e.type, e);
    } catch {}
  }

// Search: words of the need (stemmed), widened by the plain names people use for each kind of block.
const STOP = new Set('a an the of with and or for to in on at by my our your some any that this which where who show shows showing want need page site'.split(' '));
const stem = (/** @type {string} */ w) => w.replace(/ies$/, 'y').replace(/(ss)$/, '$1').replace(/([^s])s$/, '$1').replace(/ing$/, '');
const words = (/** @type {string} */ text) => text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)).map(stem);
/** Everyday words → the words block purposes and fields use. */
const SAY = /** @type {Record<string, string[]>} */ ({
  photo: ['picture', 'image', 'gallery'], image: ['picture', 'gallery'], portrait: ['picture', 'person'], logo: ['mark'],
  team: ['people', 'person'], speaker: ['people', 'person'], author: ['person', 'byline'], staff: ['people'], member: ['people'], bio: ['person'],
  event: ['schedule', 'agenda'], talk: ['schedule', 'session'], timetable: ['schedule'], programme: ['schedule'], program: ['schedule'],
  price: ['ticket'], pricing: ['ticket'], plan: ['ticket'], tier: ['ticket'],
  faq: ['question'], answer: ['question'],
  number: ['stat'], metric: ['stat'], figure: ['stat'], count: ['stat'], kpi: ['stat'],
  banner: ['hero'], opening: ['hero'], headline: ['hero'], intro: ['hero'], masthead: ['hero'],
  signup: ['cta'], action: ['cta'], button: ['cta'], call: ['cta'],
  menu: ['site-header', 'navigation'], nav: ['navigation'], navigation: ['site-header'],
  article: ['prose', 'post'], paragraph: ['prose'], body: ['prose'], text: ['prose'], markdown: ['prose'],
  news: ['post'], blog: ['post'],
  error: ['alert', 'status'], warning: ['alert'], notice: ['alert'], message: ['alert', 'status'], offline: ['status'],
  nothing: ['empty'], none: ['empty'], blank: ['empty'],
  column: ['grid', 'split'], side: ['split'], beside: ['split'], half: ['split'],
  testimonial: ['quote'], review: ['quote'],
  fact: ['detail'], spec: ['detail'], property: ['detail'],
  filter: ['search'], find: ['search'],
  preference: ['setting'], option: ['setting'],
  input: ['form'], field: ['form'], contact: ['form'],
  tile: ['card'], teaser: ['card'],
  trail: ['breadcrumb'], path: ['breadcrumb'],
  timer: ['countdown'], sponsor: ['sponsor'], partner: ['sponsor'],
});

// A purpose that names other blocks (a slot listing what it takes) doesn't match on their names.
const blockNames = new Set(core.flatMap((e) => words(e.type.replace(/[.-]/g, ' '))));
const scoreOf = (/** @type {Entry} */ e, /** @type {string[]} */ terms) => {
  const typeWords = new Set(words(e.type.replace(/[.-]/g, ' ')).flatMap((w) => [w, stem(w)]));
  const purpose = new Set(words(e.description).filter((w) => typeWords.has(w) || !blockNames.has(w)));
  const fieldWords = new Set(e.fields.flatMap((f) => words(`${f.name.replace(/([a-z])([A-Z])/g, '$1 $2')} ${f.shape ?? ''}`)));
  const fieldText = new Set(e.fields.flatMap((f) => words(f.description ?? '')));
  let score = 0;
  for (const term of terms) {
    const alts = [term, ...(SAY[term] ?? []).map(stem)];
    const hit = (/** @type {Set<string>} */ set, /** @type {number} */ weight) => (alts.some((a, i) => set.has(a) && (score += i ? weight * 0.8 : weight)) ? 1 : 0);
    hit(typeWords, 6) || hit(purpose, 3) || hit(fieldWords, 2) || hit(fieldText, 1);
  }
  return score;
};

const terms = words(need);
const rank = (/** @type {Entry[]} */ list) =>
  terms.length
    ? list.map((e) => ({ e, score: scoreOf(e, terms) })).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).map((r) => r.e)
    : [...list];
const all = flags.has('--all') || !terms.length;
const coreHits = rank(core).slice(0, all ? undefined : 5);
const partHits = rank([...templateParts.values()]).slice(0, all ? undefined : 3);

if (flags.has('--json')) {
  console.log(JSON.stringify({ need, core: coreHits, templateParts: partHits }, null, 2));
  process.exit(coreHits.length + partHits.length ? 0 : 1);
}

const one = (/** @type {unknown} */ v) => {
  const text = JSON.stringify(v);
  return flags.has('--full') || text.length <= 160 ? text : `${text.slice(0, 157)}…`;
};
const show = (/** @type {Entry} */ e) => {
  const lines = [`  ${e.type}${e.template ? `  (template ${e.template})` : ''}`, `    ${e.description}`];
  if (e.fields.length) lines.push(`    fields: ${e.fields.map((f) => `${f.name}${f.required ? '' : '?'}`).join(', ')}`);
  if (e.example !== undefined) lines.push(`    example: ${flags.has('--full') ? JSON.stringify(e.example, null, 2).replace(/\n/g, '\n    ') : one(e.example)}`);
  if (e.exampleFrom && e.exampleFrom !== 'schema') lines.push(`    in use: ${e.exampleFrom}`);
  return lines.join('\n');
};

const library = String(index.components?.find((/** @type {any} */ c) => c.libraryPage)?.libraryPage ?? '').split('#')[0];
const label = need ? ` for "${need}"` : '';
if (coreHits.length) console.log(`Core blocks${label}${terms.length ? ', best first' : ''}:\n\n${coreHits.map(show).join('\n\n')}\n`);
else console.log(`No core block${label}.\n`);
if (partHits.length) console.log(`Template parts${label} (place one only when no core block fits):\n\n${partHits.map(show).join('\n\n')}\n`);
if (!coreHits.length && !partHits.length)
  console.log(`Nothing matches. Try other words, list every block with no words, or open the library's Core first page${library ? ` (${library}#/core-first)` : ''}. If none fits, make a part in your template (npx design-library-new-template).`);
else console.log(`Each block's fields and rules: ${'@design-library/core/schemas/blocks.schema.json'} (core), the template's content.schema.json (parts).`);
process.exit(coreHits.length + partHits.length ? 0 : 1);
