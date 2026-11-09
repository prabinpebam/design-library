#!/usr/bin/env node
/**
 * `npm run check:content` (Q64): every template's manifest, assets and content files are pure JSON valid against
 * their schemas, and everything they reference exists. Fails with `file · /json/pointer · what's wrong · how to fix`.
 *
 * Checks: manifest against core template.schema.json (id = folder; listed in packages/templates/index.ts); assets
 * against assets.schema.json (each file exists); each built layout's content file and the shared file against the
 * template's content.schema.json; template, layout and contentVersion match the manifest; settings against the
 * layout component's settings schema; regions are the manifest's (shared ones only in the shared file); each block's
 * type is a core block or one the manifest registers, accepted by its region, and valid against its schema; picture
 * ids and `/layout` links resolve; no string looks like markup, CSS or script; the core block registry
 * (packages/core/render/blocks.tsx) and the core block schema list the same types, as each template's registry and
 * its manifest do.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const core = join(root, 'packages/core');
const templatesDir = join(root, 'packages/templates');
const rel = (f) => relative(root, f).split('\\').join('/');
const errors = [];
const fail = (file, pointer, what, fix) => errors.push(`${rel(file)} · ${pointer || '/'} · ${what} · ${fix}`);
const read = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    fail(file, '/', `isn't valid JSON (${e.message})`, 'fix the syntax; content is pure JSON');
    return undefined;
  }
};

const ajv = new Ajv2020({ allErrors: true, strict: false });
const schemas = Object.fromEntries(['content', 'blocks', 'template', 'assets'].map((n) => [n, JSON.parse(readFileSync(join(core, 'schemas', `${n}.schema.json`), 'utf8'))]));
for (const s of Object.values(schemas)) ajv.addSchema(s);
const coreBlocks = Object.entries(schemas.blocks.$defs).filter(([, d]) => d.properties?.type?.const).map(([k]) => k);

const report = (file, validate, base = '') => {
  for (const e of validate.errors ?? []) {
    const extra = e.params?.additionalProperty ? ` "${e.params.additionalProperty}"` : e.params?.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : '';
    fail(file, base + e.instancePath, `${e.message}${extra}`, 'change the value to match the schema, or remove it');
  }
};
const check = (file, schema, data, base) => {
  const validate = typeof schema === 'string' ? ajv.getSchema(schema) : ajv.compile(schema);
  if (!validate(data)) report(file, validate, base);
};

// No markup, styles or script in content: words are plain text. A `code` item's `code` is exempt (it shows code).
const looksLikeCode = /<\/?[a-z][a-z0-9-]*(\s[^>]*)?>|\b(style|class|className)\s*=|javascript:|\{\{|\$\{|;\s*\}|^\s*[.#][a-z-]+\s*\{/i;
const lint = (file, value, pointer = '', key = '') => {
  if (typeof value === 'string') {
    if (key !== 'code' && key !== '$schema' && looksLikeCode.test(value)) fail(file, pointer, 'looks like markup, CSS or script', 'write plain words; structure goes in blocks and look in the template');
  } else if (Array.isArray(value)) value.forEach((v, i) => lint(file, v, `${pointer}/${i}`, key));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) lint(file, v, `${pointer}/${k}`, k);
};

// References: pictures by id, `/layout` links to built layouts of the same template.
const refs = (file, value, ctx, pointer = '', key = '') => {
  if (typeof value === 'string') {
    if ((key === 'picture' || key === 'galleryItem') && !ctx.assets.has(value)) fail(file, pointer, `names picture "${value}", which isn't in assets.json`, `add it to ${ctx.id}/assets.json or use one of: ${[...ctx.assets].join(', ')}`);
    if (key === 'href' && value.startsWith('/')) {
      const target = value.slice(1).split('#')[0];
      if (!ctx.built.has(target)) fail(file, pointer, `links to "${value}", which isn't a built layout of ${ctx.id}`, `use one of: ${[...ctx.built].map((l) => '/' + l).join(', ')}`);
    }
  } else if (Array.isArray(value)) value.forEach((v, i) => refs(file, v, ctx, `${pointer}/${i}`, key === 'items' && ctx.inGallery ? 'galleryItem' : key));
  else if (value && typeof value === 'object') {
    const inGallery = value.type === 'gallery';
    for (const [k, v] of Object.entries(value)) refs(file, v, { ...ctx, inGallery }, `${pointer}/${k}`, k);
  }
};

// The registry and the schema list the same block types.
const registryTypes = (file) => {
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf('BLOCKS');
  if (start < 0) return [];
  const open = src.indexOf('= {', start);
  const body = src.slice(open, src.indexOf('\n};', open));
  return [...body.matchAll(/^ {2}'?([a-z][a-z0-9.-]*)'?: /gm)].map((m) => m[1]);
};
const parity = (file, registered, schemaTypes, where) => {
  for (const t of schemaTypes) if (!registered.includes(t)) fail(file, '', `block type "${t}" has a schema but no registry entry`, `add it to ${where}'s BLOCKS`);
  for (const t of registered) if (!schemaTypes.includes(t)) fail(file, '', `block type "${t}" is registered but has no schema`, `add its $defs entry and list it`);
};
parity(join(core, 'render/blocks.tsx'), registryTypes(join(core, 'render/blocks.tsx')), coreBlocks, 'packages/core/render/blocks.tsx');

const indexSrc = existsSync(join(templatesDir, 'index.ts')) ? readFileSync(join(templatesDir, 'index.ts'), 'utf8') : '';
const folders = readdirSync(templatesDir, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(templatesDir, d.name, 'template.json'))).map((d) => d.name);
let files = 0;

for (const id of folders) {
  const dir = join(templatesDir, id);
  const manifestFile = join(dir, 'template.json');
  const manifest = read(manifestFile);
  if (!manifest) continue;
  check(manifestFile, 'https://design-library.local/core/template/1', manifest);
  if (manifest.id !== id) fail(manifestFile, '/id', `is "${manifest.id}" in folder "${id}"`, 'make the id equal the folder name');
  if (!new RegExp(`['"]\\./${id}(/index)?['"]`).test(indexSrc)) fail(join(templatesDir, 'index.ts'), '', `doesn't list template "${id}"`, `import it from './${id}' and add it to the list`);

  const assetsFile = join(dir, 'assets.json');
  const assetData = existsSync(assetsFile) ? read(assetsFile) : { assets: {} };
  if (assetData) check(assetsFile, 'https://design-library.local/core/assets/1', assetData);
  for (const [name, a] of Object.entries(assetData?.assets ?? {})) if (a?.src && !existsSync(join(dir, a.src))) fail(assetsFile, `/assets/${name}/src`, `file ${a.src} doesn't exist`, `add the file under ${id}/assets/ or fix the path`);

  const schemaFile = join(dir, 'content.schema.json');
  const schema = read(schemaFile);
  if (!schema) continue;
  if (schema.$id !== `https://design-library.local/templates/${id}/content/${manifest.contentVersion}`) fail(schemaFile, '/$id', `doesn't end in /${id}/content/${manifest.contentVersion}`, "make the schema's $id carry the manifest's contentVersion");
  try {
    ajv.addSchema(schema);
  } catch (e) {
    fail(schemaFile, '/', `isn't a valid schema (${e.message})`, 'fix the schema');
    continue;
  }

  const customBlocks = new Map((manifest.parts?.blocks ?? []).map((b) => [b.type, b]));
  for (const [type, b] of customBlocks) {
    if (!type.startsWith(`${id}.`)) fail(manifestFile, '/parts/blocks', `block type "${type}" isn't in the template's namespace`, `name it "${id}.…"`);
    if (!ajv.getSchema(`${schema.$id}${b.schema}`)) fail(manifestFile, '/parts/blocks', `block "${type}" points at ${b.schema}, which isn't in content.schema.json`, 'add the $defs entry');
  }
  for (const kind of ['fundamentals', 'compounds', 'layouts'])
    for (const p of manifest.parts?.[kind] ?? []) {
      if (!p.name.startsWith(`${id}.`)) fail(manifestFile, `/parts/${kind}`, `"${p.name}" isn't in the template's namespace`, `name it "${id}.…"`);
      if (!existsSync(join(dir, p.source))) fail(manifestFile, `/parts/${kind}`, `${p.source} doesn't exist`, 'add the part or fix the path');
      const story = join(dir, p.source.replace(/\.tsx$/, '.stories.tsx'));
      if (!existsSync(story)) fail(manifestFile, `/parts/${kind}`, `"${p.name}" has no stories (${rel(story)})`, 'add a stories file with one story per variant and state');
    }
  const registryFile = join(dir, 'registry.tsx');
  if (customBlocks.size || existsSync(registryFile)) parity(registryFile, existsSync(registryFile) ? registryTypes(registryFile) : [], [...customBlocks.keys()], `${id}/registry.tsx`);

  const layouts = manifest.layouts.filter((l) => !l.planned);
  // The grouped hierarchy (Q66): every screen in exactly one flow, every state on a screen, every file in its flow's folder.
  {
    const byId = new Map(manifest.layouts.map((l) => [l.id, l]));
    const home = new Map();
    const seen = new Set();
    (manifest.sections ?? []).forEach((s, si) => {
      if (seen.has(`s:${s.id}`)) fail(manifestFile, `/sections/${si}/id`, `section "${s.id}" is listed twice`, 'give each section its own id');
      seen.add(`s:${s.id}`);
      const flows = new Set();
      s.flows.forEach((f, fi) => {
        if (flows.has(f.id)) fail(manifestFile, `/sections/${si}/flows/${fi}/id`, `flow "${f.id}" is listed twice in "${s.id}"`, 'give each flow in a section its own id');
        flows.add(f.id);
        f.screens.forEach((lid, i) => {
          const at = `/sections/${si}/flows/${fi}/screens/${i}`;
          const l = byId.get(lid);
          if (!l) fail(manifestFile, at, `names "${lid}", which isn't a layout`, 'add it to layouts (planned until built)');
          else if (l.stateOf) fail(manifestFile, at, `names "${lid}", a state of "${l.stateOf}"`, 'list the screen; its states hang off it by stateOf');
          if (home.has(lid)) fail(manifestFile, at, `"${lid}" is already in flow "${home.get(lid).join('/')}"`, 'put each screen in one flow; link to it from others');
          home.set(lid, [s.id, f.id]);
        });
      });
    });
    manifest.layouts.forEach((l, i) => {
      const screen = l.stateOf ?? l.id;
      if (l.stateOf && (!byId.has(l.stateOf) || byId.get(l.stateOf).stateOf)) fail(manifestFile, `/layouts/${i}/stateOf`, `"${l.stateOf}" isn't a screen`, 'name the screen this is a state of');
      if (!home.has(screen)) return fail(manifestFile, `/layouts/${i}`, `"${l.id}" isn't in any flow`, 'list it in a flow of /sections');
      const [s, f] = home.get(screen);
      const flow = manifest.sections.find((x) => x.id === s).flows.find((x) => x.id === f);
      // Q67: home at the top; a flow of 3+ screens (home aside) is a group with its own folder; shorter flows sit in the section's.
      const dirOf = screen === manifest.home ? 'content' : flow.screens.filter((x) => x !== manifest.home).length >= 3 ? `content/${s}/${f}` : `content/${s}`;
      if (l.content && l.content !== `${dirOf}/${l.id}.json`) fail(manifestFile, `/layouts/${i}/content`, `is ${l.content}`, `move it to ${dirOf}/${l.id}.json`);
    });
    // Groups hold 3–5 items (Q67): the top level (home, sections, own parts), each section, each group flow.
    if (manifest.home && (!byId.has(manifest.home) || byId.get(manifest.home).stateOf)) fail(manifestFile, '/home', `"${manifest.home}" isn't a screen`, 'name the home screen');
    const outOf = (n, at, what) => (n < 3 || n > 5) && fail(manifestFile, at, `${what} holds ${n} items`, n < 3 ? 'merge it into a neighbour: fewer than 3 is needless nesting' : 'split it into groups: more than 5 is too flat');
    outOf((manifest.sections ?? []).length + (manifest.home ? 1 : 0) + ((manifest.parts?.fundamentals?.length || manifest.parts?.compounds?.length || manifest.parts?.layouts?.length) ? 1 : 0), '/sections', 'the top level');
    (manifest.sections ?? []).forEach((s, si) => {
      let items = 0;
      s.flows.forEach((f, fi) => {
        const n = f.screens.filter((x) => x !== manifest.home).length;
        if (n >= 3) (items += 1), outOf(n, `/sections/${si}/flows/${fi}`, `flow "${f.id}"`);
        else items += n;
      });
      outOf(items, `/sections/${si}`, `section "${s.id}"`);
    });
  }
  const ctx = { id, assets: new Set(Object.keys(assetData?.assets ?? {})), built: new Set(layouts.map((l) => l.id)) };
  const sharedRegions = new Set(layouts.flatMap((l) => (l.regions ?? []).filter((r) => r.shared).map((r) => r.id)));
  const blockSchema = (type) => (customBlocks.has(type) ? `${schema.$id}${customBlocks.get(type).schema}` : coreBlocks.includes(type) ? `https://design-library.local/core/blocks/1#/$defs/${type}` : undefined);

  const checkFile = (file, regionsAllowed, layout) => {
    files += 1;
    const data = read(file);
    if (!data) return;
    check(file, schema.$id, data);
    if (data.template !== id) fail(file, '/template', `is "${data.template}"`, `set it to "${id}"`);
    if (data.contentVersion !== manifest.contentVersion) fail(file, '/contentVersion', `is ${data.contentVersion}; the manifest expects ${manifest.contentVersion}`, data.contentVersion < manifest.contentVersion ? `run npm run content:migrate -- --template ${id}` : 'raise the manifest and schema version together');
    if (layout) {
      if (data.layout !== layout.id) fail(file, '/layout', `is "${data.layout}"; the manifest points this file at "${layout.id}"`, 'make them agree');
      const settingsSchema = ajv.getSchema(`https://design-library.local/core/blocks/1#/$defs/settings.${layout.component}`) ?? ajv.getSchema(`${schema.$id}#/$defs/settings.${layout.component}`);
      if (settingsSchema && !settingsSchema(data.settings ?? {})) report(file, settingsSchema, '/settings');
      if (data.settings?.current && !ctx.built.has(data.settings.current)) fail(file, '/settings/current', `"${data.settings.current}" isn't a built layout`, `use one of: ${[...ctx.built].join(', ')}`);
    }
    for (const [region, blocks] of Object.entries(data.regions ?? {})) {
      const declared = regionsAllowed.get(region);
      if (!declared) {
        fail(file, `/regions/${region}`, `isn't a region this file may fill`, `use one of: ${[...regionsAllowed.keys()].join(', ')}`);
        continue;
      }
      (blocks ?? []).forEach((block, i) => {
        const at = `/regions/${region}/${i}`;
        const ref = blockSchema(block?.type);
        if (!ref) return fail(file, `${at}/type`, `"${block?.type}" isn't a core block or one ${id} registers`, `use a core block (${coreBlocks.join(', ')}) or register "${id}.…" in the manifest's parts.blocks`);
        const accepts = declared.accepts ?? ['*'];
        if (!accepts.includes('*') && !accepts.includes(block.type)) fail(file, `${at}/type`, `"${block.type}" isn't accepted in region "${region}"`, `use one of: ${accepts.join(', ')}`);
        check(file, ref, block, at);
      });
    }
    if (data.record) {
      const name = layout ? layout.id : 'shared';
      const ref = `${schema.$id}#/$defs/record.${name}`;
      if (!ajv.getSchema(ref)) fail(file, '/record', `has no schema (${ref})`, `add $defs "record.${name}" to ${id}/content.schema.json (npm run content:schemas)`);
      else check(file, ref, data.record, '/record');
    }
    lint(file, data);
    refs(file, data, ctx);
  };

  for (const l of layouts) {
    const file = join(dir, l.content);
    if (!existsSync(file)) {
      fail(manifestFile, `/layouts/${l.id}`, `content file ${l.content} doesn't exist`, 'write it, or mark the layout planned');
      continue;
    }
    checkFile(file, new Map((l.regions ?? []).filter((r) => !r.shared).map((r) => [r.id, r])), l);
    // A screen state (Q65 TP2–TP3): a file with only settings inherits its screen's content; a block there must draw the state.
    const own = read(file);
    const state = own?.settings?.state;
    if (state && !l.stateOf) fail(file, '/settings/state', `"${state}" on "${l.id}", which isn't a state layout`, 'set stateOf in the manifest, or remove the state');
    if (state && l.stateOf && !own.regions && !own.record) {
      const screen = layouts.find((x) => x.id === l.stateOf);
      const blocks = screen && existsSync(join(dir, screen.content)) ? Object.values(read(join(dir, screen.content))?.regions ?? {}).flat() : [];
      const draws = { failed: (b) => b.type === 'form' && b.error, done: (b) => b.type === 'form' && b.outcome, empty: (b) => b.empty && ['posts', 'cards', 'agenda'].includes(b.type) };
      const screenContent = screen && existsSync(join(dir, screen.content)) ? read(join(dir, screen.content)) : undefined;
      if (screenContent?.record && !screenContent.regions) {
        // An app screen drawn by the template's own binding (Q65 TP4): its source must name the state it draws.
        const sources = readdirSync(dir).filter((f) => f.endsWith('.tsx')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
        if (!sources.includes(`'${state}'`)) fail(file, '/settings/state', `"${l.stateOf}" is drawn by the template's binding, which never names "${state}"`, `draw the "${state}" state in the template's .tsx binding`);
      } else if (!blocks.some((b) => draws[state]?.(b))) fail(file, '/settings/state', `"${l.stateOf}" has no block that draws "${state}"`, state === 'empty' ? 'give its list block an `empty`' : `give its form ${state === 'done' ? 'an `outcome`' : 'an `error`'}`);
    }
  }
  if (manifest.shared) {
    const file = join(dir, manifest.shared);
    if (!existsSync(file)) fail(manifestFile, '/shared', `${manifest.shared} doesn't exist`, 'write it or remove `shared`');
    else {
      const regions = new Map();
      for (const l of layouts) for (const r of l.regions ?? []) if (r.shared) regions.set(r.id, r);
      checkFile(file, regions);
    }
  } else if (sharedRegions.size) fail(manifestFile, '/shared', 'layouts have shared regions but there is no shared file', 'add "shared": "content/shared.json"');
}

if (errors.length) {
  console.error(`check:content: ${errors.length} problem${errors.length === 1 ? '' : 's'}\n` + errors.map((e) => `  ${e}`).join('\n'));
  process.exit(1);
}
console.log(`check:content: ${folders.length} templates, ${files} content files, ${coreBlocks.length} core block types: all valid.`);
