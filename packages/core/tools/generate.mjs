#!/usr/bin/env node
// @ts-check
/**
 * Generated collections, rebuilt and checked by one command (DP14, DR23; 0.4.0). Dependency-free.
 *
 *   npx design-library-generate                     every collection with "generated" in the site under src/
 *   npx design-library-generate --site content/site the folder holding site.json and collections/
 *   npx design-library-generate --only talks        one collection
 *   npx design-library-generate --check             write nothing; exit 1 when a generated collection is stale
 *
 * A collection says where it comes from (collection.schema.json `generated`): `by` is a script in your project (a
 * path from the project folder to an .mjs or .js file) and `from` is its source (a file, a folder or an address). The
 * script's default export receives `{ from, collection, root }` (`from` resolved to a full path when it isn't an
 * address; `collection` the document as it stands) and returns the items, or a promise of them. This command writes
 * them into the collection with `generated.at`, only when they changed, then runs the content check on the site, so
 * a generated collection meets its `item` schema, its references resolve and its pages open. Build time only (ID15):
 * the site never runs a generator while it loads. A generated collection is rebuilt, never edited by hand; `--check`
 * in a build catches a hand edit or a source that moved on.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (/** @type {string} */ name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : undefined;
};
const CHECK = argv.includes('--check');
const CWD = process.cwd();
const rel = (/** @type {string} */ p) => relative(CWD, p).split(sep).join('/') || '.';

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
const sites = siteArg ? [resolve(CWD, siteArg)] : findSites(resolve(CWD, 'src'), 6);
if (sites.length !== 1) {
  console.error(sites.length ? `design-library-generate: ${sites.length} site documents (${sites.map(rel).join(', ')}); pass --site <folder>.` : 'design-library-generate: no site.json (with "siteVersion") under src/; pass --site <folder>.');
  process.exit(2);
}
const SITE = sites[0];
const dir = join(SITE, 'collections');
const files = existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.json')).sort().map((n) => join(dir, n)) : [];
const only = opt('--only');

const isAddress = (/** @type {string} */ s) => /^[a-z][a-z0-9+.-]*:\/\//i.test(s);
const same = (/** @type {unknown} */ a, /** @type {unknown} */ b) => JSON.stringify(a) === JSON.stringify(b);

let problems = 0;
let stale = 0;
let written = 0;
let seen = 0;
for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  /** @type {any} */
  let doc;
  try {
    doc = JSON.parse(raw);
  } catch {
    continue;
  }
  if (!doc?.generated || (only && doc.id !== only)) continue;
  seen++;
  const { by, from } = doc.generated;
  const script = resolve(CWD, String(by ?? ''));
  if (!/\.(mjs|js|cjs)$/.test(String(by)) || !existsSync(script)) {
    console.error(`✗ ${rel(file)} · /generated/by · "${by}" isn't a script in this project · write a path from ${rel(CWD)} to an .mjs or .js file whose default export returns the items`);
    problems++;
    continue;
  }
  const source = isAddress(String(from)) ? String(from) : resolve(CWD, String(from));
  if (!isAddress(String(from)) && !existsSync(source)) {
    console.error(`✗ ${rel(file)} · /generated/from · "${from}" doesn't exist · point it at the file or folder ${by} reads`);
    problems++;
    continue;
  }
  /** @type {unknown} */
  let items;
  try {
    const mod = await import(pathToFileURL(script).href);
    if (typeof mod.default !== 'function') throw new Error('it has no default export function');
    const result = await mod.default({ from: source, collection: structuredClone(doc), root: CWD });
    items = Array.isArray(result) ? result : /** @type {any} */ (result)?.items;
    if (!Array.isArray(items)) throw new Error('it returned no list of items (return an array, or { items })');
  } catch (e) {
    console.error(`✗ ${rel(file)} · /generated/by · ${by} failed: ${/** @type {Error} */ (e).message} · fix the script, then run this again`);
    problems++;
    continue;
  }
  if (same(items, doc.items)) {
    console.log(`  ${rel(file)}: ${items.length} items, current`);
    continue;
  }
  if (CHECK) {
    console.error(`✗ ${rel(file)} · /items · out of date with ${from} (${doc.items?.length ?? 0} items written, ${items.length} from the source) · run design-library-generate${siteArg ? ` --site ${siteArg}` : ''}`);
    stale++;
    continue;
  }
  // Keep the document's own order; only the items and the time change.
  const next = { ...doc, generated: { ...doc.generated, at: new Date().toISOString() }, items };
  const nl = raw.includes('\r\n') ? '\r\n' : '\n';
  writeFileSync(file, (JSON.stringify(next, null, 2) + '\n').replace(/\n/g, nl));
  console.log(`  ${rel(file)}: wrote ${items.length} items from ${from}`);
  written++;
}

if (only && !seen) {
  console.error(`design-library-generate: no generated collection "${only}" in ${rel(dir)}.`);
  process.exit(2);
}
console.log(`design-library-generate: ${seen} generated collection${seen === 1 ? '' : 's'} in ${rel(SITE)}; ${CHECK ? `${stale} stale` : `${written} written`}${problems ? `, ${problems} problems` : ''}.`);
if (problems || stale) process.exit(1);
if (!seen) process.exit(0);

// The content check on the whole site: items against `item`, references, bindings, pages.
const result = spawnSync(process.execPath, [join(PKG, 'tools/check-content.mjs'), '--site', SITE], { stdio: 'inherit', cwd: CWD });
process.exit(result.status ?? 1);
