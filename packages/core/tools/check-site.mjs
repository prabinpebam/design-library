/**
 * The content check for a data-driven site (DP19, DR40; 0.4.0): a folder holding `site.json`, `pages/*.json` and
 * `collections/*.json`, the shape `loadSite` reads. Called by check-content.mjs for each template's `site/` folder and
 * for each `--site <folder>`. Everything is reported as `file · /json/pointer · what's wrong · how to fix`.
 *
 * - Each document against its core schema (site, page, collection), and each collection's items against its `item`.
 * - Ids: page ids, routes and collection ids are unique, item ids are unique within a collection; `home` and
 *   `notFound` name pages; a page's `collection` exists and its route has `:id`; `{ "item" }` only on such a page.
 * - Sections: references, item values and list bindings are resolved with the renderer's own `resolveData` (so the
 *   CLI and the page's development notice name the same place), then each block is checked against its type's schema
 *   (a section's `anchor` left out, fields the renderer adds left out), and each block in a slot (`split.start`,
 *   `grid.items`, `hero.media`) by its own type and against what the slot accepts. A `site-header` in the site
 *   document may leave out `places` (they come from `navigation`).
 * - Links: every `href` that starts with `/` opens a page (a route, an item's page with a real id, or an alias), and
 *   its `#anchor` is a section anchor on that page. Aliases lead to a page (an `https://` target leaves the site) and
 *   never shadow a page's own route.
 * - Information: a section whose list binding finds nothing and declares no `empty` is left out of the page.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as nodeModule from 'node:module';
import Ajv2020 from 'ajv/dist/2020.js';

const core = fileURLToPath(new URL('..', import.meta.url));

/** The renderer's resolver, read from the shipped TypeScript with Node's type stripping (Node 22.13 and later). */
let resolver;
async function loadResolver() {
  if (resolver !== undefined) return resolver;
  resolver = null;
  const strip = nodeModule.stripTypeScriptTypes;
  if (typeof strip !== 'function') return resolver;
  const src = readFileSync(join(core, 'render/collections.ts'), 'utf8');
  // Node marks the API experimental; the warning says nothing a person running the check can act on.
  const emit = process.emitWarning;
  process.emitWarning = () => {};
  let js;
  try {
    js = strip(src, { mode: 'strip' });
  } finally {
    process.emitWarning = emit;
  }
  resolver = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  return resolver;
}

/** The slots and what each accepts, read from the renderer's `SLOTS` so the check and the page agree. */
function slotsFromRenderer() {
  const src = readFileSync(join(core, 'render/blocks.tsx'), 'utf8');
  const lists = Object.fromEntries([...src.matchAll(/const (\w+)\s*(?::[^=]+)?=\s*\[([^\]]*)\]/g)].map((m) => [m[1], [...m[2].matchAll(/'([a-z][a-z0-9-]*)'/g)].map((x) => x[1])]));
  const body = /export const SLOTS[^=]*=\s*\{([\s\S]*?)\n\};/.exec(src)?.[1] ?? '';
  const slots = {};
  for (const m of body.matchAll(/'([a-z-]+)\.([a-zA-Z]+)':\s*(\[[^\]]*\]|\w+)/g)) {
    const list = m[3].startsWith('[') ? [...m[3].matchAll(/'([a-z][a-z0-9-]*)'/g)].map((x) => x[1]) : lists[m[3]] ?? [];
    (slots[m[1]] ??= {})[m[2]] = list;
  }
  return slots;
}

const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const pointer = (path) => '/' + path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean).join('/');
const routeParts = (r) => r.split('#')[0].split('?')[0].replace(/\/+$/, '').split('/').filter(Boolean);

export async function checkSite(dir, { schemas: given, fail, info, rel, extraChecks }) {
  const schemas = { ...given };
  for (const n of ['site', 'page', 'collection']) schemas[n] ??= JSON.parse(readFileSync(join(core, 'schemas', `${n}.schema.json`), 'utf8'));
  const files = { site: join(dir, 'site.json') };
  if (!existsSync(files.site)) return fail(dir, '/', 'has no site.json', 'add the site document, or point --site at the folder that holds it');
  const read = (file) => {
    try {
      return JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      fail(file, '/', `isn't valid JSON (${e.message})`, 'fix the syntax; content is pure JSON');
      return undefined;
    }
  };
  const listJson = (sub) => (existsSync(join(dir, sub)) ? readdirSync(join(dir, sub)).filter((f) => f.endsWith('.json')).map((f) => join(dir, sub, f)) : []);

  const strict = new Ajv2020({ allErrors: true, strict: false });
  strict.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
  for (const s of Object.values(schemas)) strict.addSchema(s);
  const report = (file, validate, base = '', skip = () => false) => {
    for (const e of validate.errors ?? []) {
      if (skip(e)) continue;
      const extra = e.params?.additionalProperty ? ` "${e.params.additionalProperty}"` : e.params?.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : '';
      fail(file, base + e.instancePath, `${e.message}${extra}`, 'change the value to match the schema, or remove it');
    }
  };
  const validateDoc = (file, id, data) => {
    const { $schema: _s, ...body } = data;
    const v = strict.getSchema(id);
    if (v && !v(body)) report(file, v);
  };

  const site = read(files.site);
  if (!site) return;
  validateDoc(files.site, 'https://design-library.local/core/site/1', site);
  const pages = listJson('pages').map((file) => ({ file, doc: read(file) })).filter((p) => p.doc);
  const collections = listJson('collections').map((file) => ({ file, doc: read(file) })).filter((c) => c.doc);
  for (const p of pages) validateDoc(p.file, 'https://design-library.local/core/page/1', p.doc);
  for (const c of collections) validateDoc(c.file, 'https://design-library.local/core/collection/1', c.doc);

  // Collections: unique ids, items against `item`, unique item ids.
  const byCollection = {};
  for (const c of collections) {
    const { id, item, items = [], idField = 'id' } = c.doc;
    if (byCollection[id]) fail(c.file, '/id', `"${id}" is also the id of ${rel(byCollection[id].file)}`, 'give each collection its own id');
    byCollection[id] = c;
    const { $id: _id, ...itemSchema } = item ?? {};
    const validateItem = item ? strict.compile(itemSchema) : undefined;
    const seen = new Set();
    items.forEach((it, i) => {
      if (validateItem && !validateItem(it)) report(c.file, validateItem, `/items/${i}`);
      const key = it?.[idField];
      if (key === undefined) fail(c.file, `/items/${i}`, `has no "${idField}"`, `give every item its ${idField}`);
      else if (seen.has(key)) fail(c.file, `/items/${i}/${idField}`, `"${key}" is used twice`, 'item ids are unique within a collection');
      seen.add(key);
    });
  }

  // Pages: unique ids and routes; home, notFound, collection pages.
  const pageIds = new Map();
  const routes = new Map();
  for (const p of pages) {
    const { id, route, collection } = p.doc;
    if (pageIds.has(id)) fail(p.file, '/id', `"${id}" is also the id of ${rel(pageIds.get(id).file)}`, 'give each page its own id');
    pageIds.set(id, p);
    if (routes.has(route)) fail(p.file, '/route', `"${route}" is also the route of ${rel(routes.get(route).file)}`, 'give each page its own route');
    routes.set(route, p);
    if (collection && !byCollection[collection]) fail(p.file, '/collection', `"${collection}" isn't a collection`, `use one of: ${Object.keys(byCollection).join(', ') || '(none; add collections/*.json)'}`);
    if (collection && !String(route).includes(':id')) fail(p.file, '/route', `a page for each item of "${collection}" needs ":id" in its route`, `write it as "${route.replace(/\/$/, '')}/:id"`);
    if (!collection && /"item"\s*:/.test(JSON.stringify(p.doc))) {
      const where = JSON.stringify(p.doc.sections ?? []).includes('"item"') ? '/sections' : '/';
      fail(p.file, where, 'uses { "item": … } but shows no collection', 'add "collection" and ":id" to the route, or write the value');
    }
  }
  for (const key of ['home', 'notFound']) if (site[key] && !pageIds.has(site[key])) fail(files.site, `/${key}`, `"${site[key]}" isn't a page id`, `use one of: ${[...pageIds.keys()].join(', ')}`);

  // Routes and anchors: what a link may open.
  const anchorsOf = (p) => new Set((p.doc.sections ?? []).flatMap((s) => [s.anchor, ...(s.type === 'section' ? [s.id] : [])]).filter(Boolean));
  const aliases = site.aliases ?? {};
  const matchRoute = (path) => {
    const parts = routeParts(path);
    for (const p of pages) {
      const rp = routeParts(p.doc.route);
      if (rp.length !== parts.length) continue;
      let ok = true;
      for (let i = 0; i < rp.length && ok; i++) {
        if (rp[i] === ':id') {
          const coll = byCollection[p.doc.collection];
          const idField = coll?.doc.idField ?? 'id';
          ok = parts[i].startsWith(':') || !coll || coll.doc.items.some((it) => String(it[idField]) === decodeURIComponent(parts[i]));
        } else ok = rp[i] === parts[i] || parts[i].startsWith(':');
      }
      if (ok) return p;
    }
    return undefined;
  };
  const aliasMatch = (path) => {
    const parts = routeParts(path);
    for (const [from, to] of Object.entries(aliases)) {
      const fp = routeParts(from);
      if (fp.length === parts.length && fp.every((x, i) => x.startsWith(':') || x === parts[i])) return to;
    }
    return undefined;
  };
  const checkHref = (file, at, href) => {
    if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return;
    const page = matchRoute(href) ?? (aliasMatch(href) && !String(aliasMatch(href)).startsWith('http') ? matchRoute(aliasMatch(href)) : undefined);
    if (!page && !aliasMatch(href)) return fail(file, at, `links to "${href}", which no page opens`, `link to one of: ${pages.map((p) => p.doc.route).join(', ')}`);
    const anchor = href.split('#')[1];
    if (page && anchor && !anchorsOf(page).has(anchor)) fail(file, at, `links to "#${anchor}", which isn't a section anchor on ${rel(page.file)}`, `add "anchor": "${anchor}" to that section, or use one of: ${[...anchorsOf(page)].join(', ') || '(none)'}`);
  };
  for (const [from, to] of Object.entries(aliases)) {
    if (routes.has(from)) fail(files.site, `/aliases/${from.replace(/~/g, '~0').replace(/\//g, '~1')}`, `"${from}" is a page's own route, so the alias would hide that page`, 'remove the alias or change the page route');
    if (typeof to === 'string' && !to.startsWith('http') && !matchRoute(to)) fail(files.site, `/aliases/${from.replace(/~/g, '~0').replace(/\//g, '~1')}`, `leads to "${to}", which no page opens`, `use one of: ${pages.map((p) => p.doc.route).join(', ')}`);
  }

  // Blocks: resolved with the renderer's resolver, then by type, slots by their own type.
  const slots = slotsFromRenderer();
  const lib = await loadResolver();
  if (!lib) info(dir, '/', "references and bindings weren't resolved (this Node has no type stripping; Node 22.13 or later does)");
  const siteData = { pages: pages.map((p) => p.doc), collections: Object.fromEntries(Object.entries(byCollection).map(([k, c]) => [k, c.doc])) };
  const coreTypes = new Set(Object.entries(schemas.blocks.$defs).filter(([, d]) => d.properties?.type?.const).map(([k]) => k));
  const blockSchema = (type) => (coreTypes.has(type) ? strict.getSchema(`https://design-library.local/core/blocks/1#/$defs/${type}`) : undefined);
  // Where a block's values came from a reference, an item value or a binding: the renderer passes those items whole
  // (with fields the block doesn't draw), so extra fields there aren't the writer's.
  const dataPaths = (value, at = '') => {
    if (lib && (lib.isRef(value) || lib.isItemValue(value) || lib.isBinding(value))) return [at];
    if (Array.isArray(value)) return value.flatMap((v, i) => dataPaths(v, `${at}/${i}`));
    if (isObject(value)) return Object.entries(value).flatMap(([k, v]) => dataPaths(v, `${at}/${k}`));
    return [];
  };
  const checkBlock = (file, at, block, inSite, raw = block) => {
    if (!isObject(block)) return;
    const { anchor: _a, ...b } = block;
    if (inSite && b.type === 'site-header' && b.places === undefined) b.places = (site.navigation ?? []).map(({ label, href }) => ({ label, href }));
    const fromData = dataPaths(raw);
    // A binding turns one value into a list, so a path inside the list is matched on the list's own path.
    const inData = (p) => fromData.some((d) => p === d || p.startsWith(`${d}/`) || p.startsWith(`${d.replace(/\/\d+$/, '')}/`));
    // Links are routes here (`/readings/the-long-shore`), checked against the pages below, not template layout ids.
    const skip = (e) => (e.keyword === 'pattern' && /\/href$/.test(e.instancePath)) || (e.keyword === 'additionalProperties' && inData(e.instancePath));
    const v = blockSchema(b.type);
    if (v && !v(b)) report(file, v, at, skip);
    for (const [field, accepts] of Object.entries(slots[b.type] ?? {})) {
      const held = b[field];
      (Array.isArray(held) ? held : []).forEach((inner, i) => {
        if (isObject(inner) && !String(inner.type).includes('.') && !accepts.includes(inner.type)) fail(file, `${at}/${field}/${i}/type`, `"${inner.type}" isn't a block ${b.type}.${field} takes`, `use one of: ${accepts.join(', ')}`);
        checkBlock(file, `${at}/${field}/${i}`, inner, false, raw?.[field]?.[i]);
      });
    }
  };
  const walkHrefs = (file, value, at = '') => {
    if (Array.isArray(value)) value.forEach((v, i) => walkHrefs(file, v, `${at}/${i}`));
    else if (isObject(value)) for (const [k, v] of Object.entries(value)) k === 'href' ? checkHref(file, `${at}/${k}`, v) : walkHrefs(file, v, `${at}/${k}`);
  };
  // One report per file, place and problem, however many item pages ask.
  const said = new Set();
  const resolve = (file, value, base, options = {}) => {
    if (!lib) return value;
    return lib.resolveData(value, siteData, {
      ...options,
      missing: (what, path) => {
        const key = `${file}|${path}|${what}`;
        if (said.has(key)) return;
        said.add(key);
        fail(file, base + pointer(path), what, 'point it at an item that exists (collection/id) or a field the item has');
      },
    });
  };
  const listIsEmptyBinding = (section) => Object.entries(section).find(([, v]) => lib?.isBinding(v));

  for (const [region, blocks] of [['header', site.header], ['footer', site.footer]]) {
    const resolved = resolve(files.site, blocks ?? [], `/${region}`);
    (resolved ?? []).forEach((b, i) => checkBlock(files.site, `/${region}/${i}`, b, true, blocks[i]));
  }
  walkHrefs(files.site, { navigation: site.navigation, header: site.header, footer: site.footer }, '');
  for (const p of pages) {
    const sections = p.doc.sections ?? [];
    const coll = p.doc.collection ? byCollection[p.doc.collection] : undefined;
    // An item's page is checked once per item, so a field one item lacks is found.
    const runs = coll ? coll.doc.items.map((item) => ({ item, collection: p.doc.collection })) : [{}];
    runs.forEach((opts, run) => {
      const resolved = resolve(p.file, sections, '/sections', opts);
      (resolved ?? []).forEach((b, i) => {
        // Without a collection an item value finds nothing; that is reported above, so the block isn't checked again.
        const itemless = !coll && JSON.stringify(sections[i]).includes('"item"');
        if (run === 0 && !itemless) checkBlock(p.file, `/sections/${i}`, b, false, sections[i]);
      });
    });
    walkHrefs(p.file, p.doc.sections, '/sections');
    sections.forEach((s, i) => {
      const bound = listIsEmptyBinding(s);
      if (!bound || s.empty) return;
      const out = lib.resolveData({ list: bound[1] }, siteData, { item: coll?.doc.items[0], collection: p.doc.collection }).list ?? [];
      if (!out.length) info(p.file, `/sections/${i}/${bound[0]}`, `finds no items today, so the section is left out; add "empty" to say why instead`);
    });
  }

  for (const doc of [{ file: files.site, data: site }, ...pages.map((p) => ({ file: p.file, data: p.doc })), ...collections.map((c) => ({ file: c.file, data: c.doc }))]) extraChecks?.(doc.file, doc.data);
  return { pages: pages.length, collections: collections.length };
}
