#!/usr/bin/env node
// @ts-check
/**
 * TypeScript types from a data-driven site's documents (DP19, DR38; 0.4.0). Dependency-free.
 *
 *   npx design-library-types                          finds site.json under src/, writes site-types.ts beside it
 *   npx design-library-types --site content/site      the folder holding site.json, pages/ and collections/
 *   npx design-library-types --out src/site-types.ts  where to write
 *   npx design-library-types --check                  write nothing; exit 1 when the file is missing or out of date
 *
 * What it writes, all from your JSON (nothing about any one site is built in):
 * - one interface per collection, from the collection's `item` schema (`{Collection}Item`), with each field's
 *   description as its comment; a reference field is `ItemRef`;
 * - `CollectionItems` (collection id → item type), `CollectionId`, and per collection the union of its item ids;
 * - `PageId`, `Route`, `DerivedName` and `Ref` (every `collection/id` a reference may name);
 * - `SiteCollections`, the collections typed by their items, for code that reads them (a build step, a custom part).
 * The core document types (`SiteDocument`, `PageDocument`, `CollectionDocument`, `ItemRef`) come from
 * `@design-library/core/render`; this file only narrows them to your site. Run it again after editing the JSON, or
 * add `--check` to your build so a stale file fails it.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const argv = process.argv.slice(2);
const opt = (/** @type {string} */ name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : undefined;
};
const CWD = process.cwd();
const rel = (/** @type {string} */ p) => relative(CWD, p).split(sep).join('/');

/** @param {string} dir @param {number} depth @returns {string[]} */
const findSites = (dir, depth) => {
  if (depth < 0 || !existsSync(dir)) return [];
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.') || name === 'templates') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...findSites(p, depth - 1));
    else if (name === 'site.json') {
      try {
        if ('siteVersion' in JSON.parse(readFileSync(p, 'utf8'))) out.push(dir);
      } catch {}
    }
  }
  return out;
};

const siteArg = opt('--site');
const found = siteArg ? [resolve(CWD, siteArg)] : findSites(resolve(CWD, 'src'), 6);
if (found.length !== 1) {
  console.error(
    found.length
      ? `design-library-types: ${found.length} site documents (${found.map(rel).join(', ')}); pass --site <folder>.`
      : 'design-library-types: no site.json (with "siteVersion") under src/; pass --site <folder>.',
  );
  process.exit(2);
}
const SITE = found[0];
if (!existsSync(join(SITE, 'site.json'))) {
  console.error(`design-library-types: no site.json in ${rel(SITE)}.`);
  process.exit(2);
}
const OUT = resolve(CWD, opt('--out') ?? join(SITE, 'site-types.ts'));

const readJson = (/** @type {string} */ f) => JSON.parse(readFileSync(f, 'utf8'));
const listJson = (/** @type {string} */ sub) =>
  existsSync(join(SITE, sub)) ? readdirSync(join(SITE, sub)).filter((n) => n.endsWith('.json')).sort().map((n) => join(SITE, sub, n)) : [];

const site = readJson(join(SITE, 'site.json'));
const pages = listJson('pages').map(readJson);
const collections = listJson('collections').map(readJson).filter((c) => typeof c.id === 'string');

const pascal = (/** @type {string} */ s) => s.replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase());
const lit = (/** @type {unknown} */ v) => JSON.stringify(v);
const union = (/** @type {unknown[]} */ values) => (values.length ? [...new Set(values)].map(lit).join(' | ') : 'never');
const key = (/** @type {string} */ k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : lit(k));
const comment = (/** @type {string | undefined} */ text, /** @type {string} */ pad) => (text ? `${pad}/** ${text.replace(/\*\//g, '*\\/')} */\n` : '');

/**
 * A JSON schema as a TypeScript type: the subset collection item schemas use.
 * @param {any} s @param {string} pad @returns {string}
 */
function tsType(s, pad = '') {
  if (!s || typeof s !== 'object' || s === true) return 'unknown';
  if (typeof s.$ref === 'string') {
    if (/\/core\/collection\/1#\/\$defs\/ref$/.test(s.$ref)) return 'ItemRef';
    if (/\/core\/collection\/1#\/\$defs\/item$/.test(s.$ref)) return 'ItemValue';
    return 'unknown';
  }
  if ('const' in s) return lit(s.const);
  if (Array.isArray(s.enum)) return union(s.enum);
  const alt = s.anyOf ?? s.oneOf;
  if (Array.isArray(alt)) return [...new Set(alt.map((a) => tsType(a, pad)))].join(' | ');
  if (Array.isArray(s.type)) return s.type.map((/** @type {string} */ t) => tsType({ ...s, type: t }, pad)).join(' | ');
  switch (s.type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    case 'array': {
      const inner = tsType(s.items, pad);
      return /[|&]/.test(inner) ? `(${inner})[]` : `${inner}[]`;
    }
    case 'object':
      return objectType(s, pad);
    default:
      return s.properties ? objectType(s, pad) : 'unknown';
  }
}

/** @param {any} s @param {string} pad */
function objectType(s, pad) {
  const required = new Set(s.required ?? []);
  const lines = Object.entries(s.properties ?? {}).map(
    ([k, v]) => `${comment(/** @type {any} */ (v)?.description, `${pad}  `)}${pad}  ${key(k)}${required.has(k) ? '' : '?'}: ${tsType(v, `${pad}  `)};`,
  );
  if (s.additionalProperties !== false) lines.push(`${pad}  [field: string]: unknown;`);
  return lines.length ? `{\n${lines.join('\n')}\n${pad}}` : 'Record<string, unknown>';
}

const blocks = [];
const names = new Map(collections.map((c) => [c.id, `${pascal(c.id)}Item`]));
for (const c of collections) {
  const idField = c.idField ?? 'id';
  const body = c.item ? tsType({ type: 'object', ...c.item }) : `{\n  ${key(idField)}: string;\n  [field: string]: unknown;\n}`;
  blocks.push(`${comment(`An item of "${c.id}"${c.title ? ` (${c.title})` : ''}, from collections/${c.id}.json.`, '')}export interface ${names.get(c.id)} ${body.startsWith('{') ? body : `{ value: ${body} }`}`);
  blocks.push(`/** The ids of the items in "${c.id}". */\nexport type ${pascal(c.id)}Id = ${union((c.items ?? []).map((/** @type {any} */ it) => String(it?.[idField])))};`);
}
const refs = collections.flatMap((c) => (c.items ?? []).map((/** @type {any} */ it) => `${c.id}/${it?.[c.idField ?? 'id']}`));

const from = relative(dirname(OUT), join(SITE, 'site.json')).split(sep).join('/');
const text = `// Generated by design-library-types from ${from}. Don't edit: change the JSON and run design-library-types again
// (add --check to a build so a stale file fails it).
import type { CollectionDocument, ItemRef, ItemValue } from '@design-library/core/render';

${blocks.join('\n\n')}

/** Each collection's id and the type of its items. */
export interface CollectionItems {
${collections.map((c) => `  ${key(c.id)}: ${names.get(c.id)};`).join('\n')}
}

/** The site's collections. */
export type CollectionId = ${union(collections.map((c) => c.id))};

/** Every \`collection/id\` a reference (\`{ "ref": … }\`) may name. */
export type Ref = ${union(refs)};

/** The site's collections, typed by their items. */
export type SiteCollections = { [C in CollectionId]: Omit<CollectionDocument, 'items'> & { items: CollectionItems[C][] } };

/** The site's page ids. */
export type PageId = ${union(pages.map((p) => p.id).filter((x) => typeof x === 'string'))};

/** The site's page routes (\`:id\` stands for an item's id). */
export type Route = ${union(pages.map((p) => p.route).filter((x) => typeof x === 'string'))};

/** The values the site document derives (\`{ "derived": … }\`). */
export type DerivedName = ${union(Object.keys(site.derive ?? {}))};

// Keeps the imports used when a site has no references or item values.
export type { ItemRef, ItemValue };
`;

const current = existsSync(OUT) ? readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : undefined;
if (argv.includes('--check')) {
  if (current === text) {
    console.log(`design-library-types: ${rel(OUT)} is current (${collections.length} collections, ${pages.length} pages).`);
    process.exit(0);
  }
  console.error(`design-library-types: ${rel(OUT)} is ${current === undefined ? 'missing' : 'out of date'}; run npx design-library-types${siteArg ? ` --site ${siteArg}` : ''}${opt('--out') ? ` --out ${opt('--out')}` : ''}.`);
  process.exit(1);
}
if (!existsSync(dirname(OUT))) {
  console.error(`design-library-types: no folder ${rel(dirname(OUT))}.`);
  process.exit(2);
}
writeFileSync(OUT, text);
console.log(`design-library-types: wrote ${rel(OUT)} (${collections.length} collections, ${refs.length} items, ${pages.length} pages, ${Object.keys(site.derive ?? {}).length} derived values).`);
