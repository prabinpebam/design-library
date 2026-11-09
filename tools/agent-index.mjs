#!/usr/bin/env node
/**
 * The agent index (Q76): one machine-readable file a consuming agent reads to find exact names. Generated from source
 * so it can't drift: core components and template parts (tier, family, summary, props with defaults, a11y, keys,
 * tokens read, uses), the core block types (from blocks.schema.json), the layouts content may name, the templates and
 * their layouts and parts, the semantic token roles with their CSS variables and descriptions, the presets, icons,
 * schemas, package exports and the commands that check a change.
 *
 *   node tools/agent-index.mjs           write packages/core/agent/index.json and agent/components/{Name}.json
 *   node tools/agent-index.mjs --check   fail when a file is stale (run after any change to core or a template)
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Library pages link to the hosted library (tools/site-links.json), never a local server: the index ships to other projects.
const LIBRARY = JSON.parse(readFileSync(new URL('./site-links.json', import.meta.url), 'utf8')).hosted.library;
const root = fileURLToPath(new URL('..', import.meta.url));
const core = join(root, 'packages/core');
const out = join(core, 'agent/index.json');
const componentsDir = join(core, 'agent/components');
const rel = (p) => relative(root, p).split('\\').join('/');
const read = (p) => readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));
const list = (dir, test) => (existsSync(dir) ? readdirSync(dir).filter(test).sort().map((f) => join(dir, f)) : []);

// Tokens: names, CSS variables, light and dark values, types and descriptions from every token source file.
const resolved = json(join(core, 'tokens/generated/tokens.resolved.json'));
const meta = new Map();
function walk(node, path) {
  if (!node || typeof node !== 'object') return;
  if ('$value' in node || '$description' in node) {
    const name = path.join('.');
    const prev = meta.get(name) ?? {};
    meta.set(name, { type: prev.type ?? node.$type, description: prev.description ?? node.$description });
  }
  for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k]);
}
for (const f of list(join(core, 'tokens'), (f) => /^tokens.*\.json$/.test(f))) walk(json(f), []);
const cssVar = (name) => `--${name.replace(/\./g, '-')}`;
const tokenNames = Object.keys(resolved.light).sort();
const tokenVars = new Set(tokenNames.map(cssVar));
const PRIVATE = /^(p|spectrum|set)\./;
const semantic = tokenNames
  .filter((n) => !PRIVATE.test(n) && !n.startsWith('c.'))
  .map((n) => {
    const m = meta.get(n) ?? {};
    const light = resolved.light[n];
    const dark = resolved.dark?.[n];
    return { name: n, var: cssVar(n), ...(m.type ? { type: m.type } : {}), light, ...(dark !== undefined && dark !== light ? { dark } : {}), ...(m.description ? { description: m.description } : {}) };
  });
const componentTokens = {};
// Theme settings (ID4): the component tokens a project may set, per component (tokens/settings.json).
const themeSettings = Object.fromEntries(Object.entries(json(join(core, 'tokens/settings.json'))).filter(([k]) => !k.startsWith('$')));
for (const n of tokenNames.filter((t) => t.startsWith('c.'))) (componentTokens[n.split('.')[1]] ??= []).push(cssVar(n));
const families = (prefix) => [...new Set(tokenNames.filter((n) => n.startsWith(prefix)).map((n) => n.split('.').slice(0, 2).join('.')))];

// Components: the same reading of each source the library's catalogue does (apps/library/src/data/catalogue.ts).
const kebab = (name) => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const clean = (c) => c.split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim()).filter(Boolean).join(' ').trim();
function docOf(source, name) {
  const m = new RegExp(`/\\*\\*((?:(?!\\*/)[\\s\\S])*)\\*/\\s*export function ${name}\\b`).exec(source);
  const lines = (m?.[1] ?? '').split('\n').map((l) => l.replace(/^\s*\*\s?/, ''));
  const summary = [];
  const tags = [];
  for (const line of lines) {
    const tag = /^@(\w+)\s*(.*)$/.exec(line.trim());
    if (tag) tags.push([tag[1], tag[2]]);
    else if (tags.length) tags[tags.length - 1][1] += ` ${line.trim()}`;
    else if (line.trim()) summary.push(line.trim());
  }
  const family = tags.find(([t]) => t === 'family')?.[1].trim();
  return {
    summary: summary.join(' '),
    ...(family ? { family } : {}),
    a11y: tags.filter(([t]) => t === 'a11y').map(([, v]) => v.trim()),
    keys: tags.filter(([t]) => t === 'key').map(([, v]) => ({ keys: v.slice(0, v.indexOf(':')).trim(), action: v.slice(v.indexOf(':') + 1).trim() })),
  };
}
function defaultsOf(source, name) {
  const fn = source.slice(source.indexOf(`export function ${name}`));
  const d = /\(\{([^}]*)\}/.exec(fn.slice(0, 400))?.[1] ?? /const \{([^}]*)\} = props/.exec(fn)?.[1] ?? '';
  return new Map([...d.matchAll(/(\w+)\s*=\s*('[^']*'|\d+|true|false)/g)].map((m) => [m[1], m[2]]));
}
function propsOf(source, name) {
  const defaults = defaultsOf(source, name);
  const groups = [];
  for (const m of source.matchAll(/interface (\w+)(?: extends ([^{]+))?\s*\{([\s\S]*?)\n\}/g)) {
    const props = [];
    for (const p of m[3].matchAll(/(?:\/\*\*([\s\S]*?)\*\/\s*)?(\w+)(\?)?:\s*([^;]+);/g)) {
      if (p[4].trim() === 'never') continue;
      // A member of an inline object type (`swatch?: { value; onChange }`) isn't a prop of its own: the first wins.
      if (props.some((x) => x.name === p[2])) continue;
      const d = defaults.get(p[2]);
      props.push({ name: p[2], type: p[4].trim().replace(/\s+/g, ' '), ...(p[3] ? {} : { required: true }), ...(d ? { default: d } : {}), ...(p[1] ? { description: clean(p[1]) } : {}) });
    }
    if (props.length) groups.push({ interface: m[1], ...(m[2] ? { extends: m[2].trim().replace(/\s+/g, ' ') } : {}), props });
  }
  const rank = (g) => (g.interface === `${name}Props` ? 0 : g.interface === `${name}Base` ? 1 : /DataAttributes/.test(g.extends ?? '') ? 2 : 3);
  return groups.sort((a, b) => rank(a) - rank(b));
}
function tokensRead(source, css, slug, layout) {
  const found = new Set();
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!layout && !rule[1].includes(`data-dl='${slug}'`)) continue;
    for (const v of rule[2].matchAll(/var\((--[\w-]+)/g)) found.add(v[1]);
  }
  for (const v of source.matchAll(/'(--[\w-]+)'/g)) found.add(v[1]);
  return [...found].filter((t) => tokenVars.has(t) || t.startsWith('--t-')).sort();
}
const TIERS = ['fundamentals', 'compounds', 'layouts'];
const tierOf = (dir) => ({ fundamentals: 'fundamental', compounds: 'compound', layouts: 'layout' })[dir];
const coreCss = Object.fromEntries(TIERS.map((t) => [t, list(join(core, 'css', t), (f) => f.endsWith('.css')).map(read).join('\n')]));
const storied = new Set(list(join(core, 'react/stories'), (f) => f.endsWith('.stories.tsx')).map((f) => f.split(/[\\/]/).pop().replace('.stories.tsx', '')));

const sources = [];
for (const t of TIERS) for (const f of list(join(core, 'react', t), (f) => f.endsWith('.tsx'))) sources.push({ file: f, tier: t, name: f.split(/[\\/]/).pop().replace(/\.tsx$/, '') });
const templatesDir = join(root, 'packages/templates');
const templateIds = readdirSync(templatesDir, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(templatesDir, d.name, 'template.json'))).map((d) => d.name).sort();
for (const id of templateIds)
  for (const t of TIERS)
    for (const f of list(join(templatesDir, id, 'parts', t), (f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))) sources.push({ file: f, tier: t, name: f.split(/[\\/]/).pop().replace(/\.tsx$/, ''), template: id });
const coreNames = new Set(sources.filter((s) => !s.template).map((s) => s.name));

const components = sources.map(({ file, tier, name, template }) => {
  const source = read(file);
  const layout = tier === 'layouts';
  let css;
  if (template) css = list(join(templatesDir, template, 'parts', tier), (f) => f.endsWith('.css')).map(read).join('\n');
  else if (layout) css = list(join(core, 'css/layouts'), (f) => f === `${kebab(name).replace(/-layout$/, '')}.css` || f === `${kebab(name)}.css`).map(read).join('\n');
  else css = coreCss[tier];
  const uses = template
    ? [...source.matchAll(/import \{([^}]*)\} from '@design-library\/core\/react'/g)].flatMap((m) => m[1].split(',').map((x) => x.trim())).filter((x) => coreNames.has(x))
    : [...source.matchAll(/from '\.\.?\/(?:fundamentals\/)?(\w+)'/g)].map((m) => m[1]).filter((u) => coreNames.has(u) && u !== name);
  const slug = template ? `${template}-${kebab(name)}` : kebab(name);
  const aliases = Object.fromEntries([...source.matchAll(/export type (\w+)(?:<[^>]*>)? = ([^;\n]+);/g)].map((m) => [m[1], m[2].trim().replace(/\s+/g, ' ')]));
  return {
    name: template ? `${template}.${name}` : name,
    tier: tierOf(tier),
    ...(template ? { template, import: `packages/templates/${template}/parts/${tier}/${name}` } : { import: '@design-library/core/react' }),
    file: rel(file),
    ...docOf(source, name),
    sealed: !/className\??:/.test(source),
    dataAttributes: /extends DataAttributes/.test(source),
    markup: `[data-dl='${slug}']`,
    props: propsOf(source, name),
    ...(Object.keys(aliases).length ? { types: aliases } : {}),
    uses: [...new Set(uses)].sort(),
    tokens: tokensRead(source, css, slug, layout),
    ...(!template && themeSettings[name]
      ? {
          settings: Object.entries(themeSettings[name]).map(([v, description]) => {
            const token = tokenNames.find((n) => cssVar(n) === v);
            return { var: v, ...(token ? { default: resolved.light[token] } : {}), description };
          }),
        }
      : {}),
    ...(!template && storied.has(name) ? { libraryPage: `${LIBRARY}#/${name.toLowerCase()}` } : {}),
  };
});
for (const c of components) {
  const usedBy = components.filter((o) => o.uses.includes(c.name)).map((o) => o.name);
  if (usedBy.length) c.usedBy = usedBy;
}

// Exports of the React adapter: values and types, as written in react/index.ts.
const reactIndex = read(join(core, 'react/index.ts'));
const values = new Set();
const types = new Set();
for (const m of reactIndex.matchAll(/export (type )?\{([^}]*)\}/g))
  for (const raw of m[2].split(',')) {
    const part = raw.trim();
    if (!part) continue;
    const isType = !!m[1] || part.startsWith('type ');
    const name = part.replace(/^type\s+/, '').split(/\s+as\s+/).pop().trim();
    (isType ? types : values).add(name);
  }
for (const m of reactIndex.matchAll(/export (?:function|const) (\w+)/g)) values.add(m[1]);

// Blocks: every core block type content may use, from the core block schema.
const blocksSchema = json(join(core, 'schemas/blocks.schema.json'));
const shapeOf = (s, depth = 0) => {
  if (!s) return 'any';
  if (s.$ref) return s.$ref.replace('#/$defs/', '');
  if (s.const !== undefined) return JSON.stringify(s.const);
  if (s.enum) return s.enum.map((e) => JSON.stringify(e)).join(' | ');
  if (s.type === 'array') return `${shapeOf(s.items, depth)}[]`;
  if ((s.type === 'object' || s.properties) && s.properties && depth < 3) {
    const req = new Set(s.required ?? []);
    return `{ ${Object.entries(s.properties).map(([k, v]) => `${k}${req.has(k) ? '' : '?'}: ${shapeOf(v, depth + 1)}`).join('; ')} }`;
  }
  return s.type ?? (s.oneOf || s.anyOf ? (s.oneOf ?? s.anyOf).map((x) => shapeOf(x, depth)).join(' | ') : 'object');
};
const blocks = [];
const layoutSettings = [];
const valueTypes = [];
for (const [id, def] of Object.entries(blocksSchema.$defs)) {
  const type = def.properties?.type?.const;
  const fields = Object.entries(def.properties ?? {})
    .filter(([k]) => k !== 'type')
    .map(([k, s]) => ({ name: k, shape: shapeOf(s), ...((def.required ?? []).includes(k) ? { required: true } : {}), ...(s.description ? { description: s.description } : {}) }));
  if (type) blocks.push({ type, schema: `@design-library/core/schemas/blocks.schema.json#/$defs/${id}`, description: def.description ?? '', fields });
  else if (id.startsWith('settings.')) layoutSettings.push({ layout: id.slice('settings.'.length), schema: `@design-library/core/schemas/blocks.schema.json#/$defs/${id}`, description: 'The content file\'s "settings" for a layout using this component; required fields must be set.', fields });
  else valueTypes.push({ name: id, shape: shapeOf(def), ...(def.description ? { description: def.description } : {}) });
}

// Layouts content may name: core bindings in the renderer, then each template's own.
const tv = read(join(core, 'render/TemplateView.tsx'));
const coreLayouts = [...(/export const LAYOUTS[^=]*=\s*\{([\s\S]*?)\n\};/.exec(tv)?.[1] ?? '').matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]);

// Templates: manifest summaries.
const templates = templateIds.map((id) => {
  const m = json(join(templatesDir, id, 'template.json'));
  const layouts = (m.layouts ?? []).filter((l) => !l.planned);
  return {
    id,
    title: m.title,
    version: m.version,
    summary: m.summary,
    contentVersion: m.contentVersion,
    folder: `packages/templates/${id}`,
    ...(m.theme ? { theme: m.theme } : {}),
    layouts: layouts.map((l) => ({
      id: l.id,
      title: l.title,
      component: l.component,
      content: l.content,
      ...(l.stateOf ? { stateOf: l.stateOf } : {}),
      ...(l.regions ? { regions: l.regions.map((r) => ({ id: r.id, ...(r.shared ? { shared: true } : {}), ...(r.accepts ? { accepts: r.accepts } : {}) })) } : {}),
      site: `${LIBRARY}site.html#/app/${id}/${l.id}`,
    })),
    planned: (m.layouts ?? []).filter((l) => l.planned).length,
    parts: m.parts ?? {},
  };
});

// Presets: global presets and each category's built-in presets, from the files that own them.
const colourPresets = json(join(core, 'tokens/colour-presets.json')).presets;
const fonts = json(join(core, 'fonts/registry.json'));
const iconSets = json(join(core, 'icons/sets/index.json'));
const spaceShape = json(join(core, 'tokens/space-shape-options.json'));
const presets = {
  global: json(join(core, 'presets/presets.json')).global,
  categories: {
    colour: { source: 'packages/core/tokens/colour-presets.json', presets: colourPresets.map((p) => ({ id: p.id, name: p.name, for: p.mood })) },
    type: { source: 'packages/core/fonts/registry.json', roles: fonts.roles.map((r) => r.id), faces: fonts.faces.map((f) => f.id), presets: fonts.presets.map((p) => ({ id: p.id, name: p.name, for: p.for, roles: p.roles })) },
    icons: { source: 'packages/core/icons/sets/index.json', presets: [{ id: 'theme', name: 'Library outline' }, ...iconSets.sets.map((s) => ({ id: s.id, name: s.name, licence: s.licence, styles: (s.styles ?? []).map((x) => x.id) }))] },
    space: { source: 'packages/core/tokens/space-shape-options.json', roles: spaceShape.space.roles, presets: Object.entries(spaceShape.space.options).map(([id, o]) => ({ id, name: o.label, for: o.for })) },
    shape: { source: 'packages/core/tokens/space-shape-options.json', roles: spaceShape.shape.roles, presets: Object.entries(spaceShape.shape.options).map(([id, o]) => ({ id, name: o.label, for: o.for })) },
    material: { source: 'docs/materials.md', presets: [{ id: 'frosted', name: 'Frosted' }, { id: 'solid', name: 'Solid' }] },
  },
};

const icons = [...read(join(core, 'icons/icons.ts')).matchAll(/^ {2}'?([a-z0-9-]+)'?: \{/gm)].map((m) => m[1]).sort();
const schemas = list(join(core, 'schemas'), (f) => f.endsWith('.json')).map((f) => {
  const s = json(f);
  return { file: `@design-library/core/schemas/${f.split(/[\\/]/).pop()}`, ...(s.$id ? { $id: s.$id } : {}), title: s.title ?? '', description: s.description ?? '' };
});
const pkg = json(join(core, 'package.json'));
const scripts = json(join(root, 'package.json')).scripts;
const commands = Object.fromEntries(
  ['tokens', 'tokens:check', 'content:schemas', 'check:content', 'typecheck', 'check:views', 'check:parts', 'check:materials', 'check:motion', 'check:layers', 'check:clipping', 'agent:index', 'agent:index:check']
    .filter((k) => scripts[k])
    .map((k) => [k, `npm run ${k}`]),
);
commands['build'] = 'npm run build -w apps/library';
// What a separate project runs (Q81): its own type check and build, and the content check shipped in core.
const consumerCommands = {
  'check:content': 'npx design-library-check-content --templates src/templates',
  'check:project': 'npx design-library-check',
  'template:new': 'npx design-library-new-template <id> --templates src/templates',
  'template:tokens': 'npx design-library-template-tokens --templates src/templates',
  typecheck: 'npx tsc --noEmit',
  build: 'npx vite build',
};

const body = {
  guide: '@design-library/core/AGENTS.md',
  paths: 'A path that starts with @design-library/core/ is inside the installed package: node_modules/@design-library/core/ in your project, packages/core/ in the library repository. Library pages are the hosted library.',
  package: { name: pkg.name, version: pkg.version, license: pkg.license, changelog: '@design-library/core/CHANGELOG.md', exports: Object.keys(pkg.exports) },
  commands: consumerCommands,
  libraryRepositoryCommands: commands,
  rules: [
    'Views and content hold no styles: no class names, style props, CSS or raw values outside a component or template part.',
    'Never fork, copy, wrap-and-replace or restyle a core component; use props, slots, data attributes, tokens or a template part.',
    'Components read semantic roles or their own component tokens; never primitives (p.*), spectrum.* or set.* for function.',
    'Content is pure JSON validated by its template schema; the content check (npx design-library-check-content) must pass.',
    'Change brand colours with brandCss/applyBrand from @design-library/core/colour (in your project) or colour.config.json and npm run tokens (in the library repository); never edit generated token files.',
    'Custom parts live inside one template, named {template}.{Part}, styled under @layer templates.',
  ],
  react: { values: [...values].sort(), types: [...types].sort() },
  components: components.map((c) => ({
    name: c.name,
    tier: c.tier,
    ...(c.family ? { family: c.family } : {}),
    summary: c.summary,
    import: c.import,
    detail: `@design-library/core/agent/components/${c.name}.json`,
    requiredProps: (c.props[0]?.props ?? []).filter((p) => p.required).map((p) => p.name),
    ...(c.libraryPage ? { libraryPage: c.libraryPage } : {}),
  })),
  blocks,
  blockValueTypes: valueTypes,
  layouts: { core: coreLayouts, components: components.filter((c) => c.tier === 'layout').map((c) => c.name), settings: layoutSettings },
  templates,
  tokens: {
    semantic,
    componentTokens,
    private: { primitives: 'p.*', spectrum: families('spectrum.'), sets: families('set.'), note: 'Never read by components for function; spectrum and sets only for their declared purpose.' },
    contexts: { scheme: ['light', 'dark'], contrast: ['standard', 'more'], motion: ['standard', 'reduce'], attributes: ['data-scheme', 'data-contrast', 'data-motion', 'data-space', 'data-shape', 'data-material', 'data-density'] },
    sources: {
      colour: 'packages/core/tokens/colour.config.json',
      spaceShape: 'packages/core/tokens/space-shape.config.json',
      tokens: 'packages/core/tokens/tokens.json',
      templateTokens: 'packages/templates/{template}/tokens/tokens.json',
      generated: ['packages/core/tokens/tokens.colour.json', 'packages/core/tokens/tokens.space-shape.json', 'packages/core/css/tokens.css', 'packages/core/tokens/generated/tokens.resolved.json'],
    },
  },
  presets,
  icons,
  schemas,
};
// Paths in shipped files name the installed package, which resolves in any project ("paths" in the index).
const shipped = (s) => s.replace(/"packages\/(core|templates)\//g, '"@design-library/$1/');
const COMMENT = 'Generated by npm run agent:index (tools/agent-index.mjs) from source: do not edit. Read @design-library/core/AGENTS.md first.';

// Q78.3: the principles as agent rules, from the one source the library's Principles sections read.
const principles = json(join(core, 'principles/principles.json')).frameworks;
const elevation = json(join(core, 'principles/elevation.json'));
const principlesOf = (family) => principles.filter((f) => f.appliesTo.families?.includes(family)).map((f) => f.id);
for (const c of components) {
  const ids = c.family ? principlesOf(c.family) : [];
  if (ids.length) c.principles = ids;
}
for (const entry of body.components) {
  const ids = entry.family ? principlesOf(entry.family) : [];
  if (ids.length) entry.principles = ids;
}
body.principles = {
  source: 'packages/core/principles/principles.json',
  guide: 'packages/core/guide/7-principles.md',
  elevation: 'packages/core/principles/elevation.json',
  frameworks: principles.map((f) => ({ id: f.id, title: f.title, doc: `docs/${f.doc.path}`, tokens: f.agent.tokens, families: f.appliesTo.families ?? [], rules: f.agent.rules, decide: f.agent.decide, checks: f.agent.checks })),
};
const GUIDE_HEAD = '<!-- Generated by npm run agent:index from packages/core/principles/principles.json and elevation.json: do not edit; edit the JSON. -->';
const md = [
  GUIDE_HEAD,
  '',
  '# Step 7: apply the principles',
  '',
  'Goal: every decision you make with this library follows the frameworks behind it. Each framework below has its rules (never break them), a decision procedure (ask in order; the first answer that fits decides) and the checks that catch a miss. The same frameworks are shown to people, in short, at the bottom of the library pages.',
  '',
  '> **Checks:** the `npm run …` checks named below are the library repository\'s. In your project, run their equivalents from `AGENTS.md` "Checks" (`npx design-library-check-content`, `npx tsc --noEmit`, `npx vite build`) and read your work against the rules; a theme change in your project uses `@design-library/core/theme` ([Step 3](3-tokens.md)), not the token configs.',
  '',
  '## Which framework governs what',
  '',
  '| You are choosing | Read |',
  '| --- | --- |',
  ...principles.filter((f) => f.agent.tokens.length).map((f) => `| A token in ${f.agent.tokens.map((t) => `\`${t}.*\``).join(', ')} | [${f.title}](#${f.id}) |`),
  ...[...new Set(components.map((c) => c.family).filter(Boolean))]
    .sort()
    .map((fam) => [fam, principlesOf(fam)])
    .filter(([, ids]) => ids.length)
    .map(([fam, ids]) => `| A component in the \`${fam}\` family (${components.filter((c) => c.family === fam).map((c) => c.name).join(', ')}) | ${ids.map((id) => `[${principles.find((f) => f.id === id).title}](#${id})`).join(', ')} |`),
  '| Anything | [How the library works](#library) and [The owner’s design rules](#constraints) |',
  '',
  'Each component’s own `agent/components/{Name}.json` lists its frameworks under `principles`.',
  '',
  ...principles.flatMap((f) => [
    `<a id="${f.id}"></a>`,
    '',
    `## ${f.title}`,
    '',
    `Full framework: ${f.doc.label} (docs/${f.doc.path}).`,
    '',
    '**Rules**',
    '',
    ...f.agent.rules.map((r) => `- ${r}`),
    '',
    '**Decide**',
    '',
    ...f.agent.decide.map((r, i) => `${i + 1}. ${r}`),
    '',
    ...(f.id === 'elevation'
      ? [
          '| Level | Name | Material | Layers | Use | Never |',
          '| --- | --- | --- | --- | --- | --- |',
          ...elevation.ladder.map((l) => `| ${l.level} | ${l.name} | ${l.material} | ${l.layers.map((x) => `\`${x}\``).join(', ')} | ${l.use} ${l.detail} | ${l.never} |`),
          '',
          '**Choosing a layer** (first yes decides)',
          '',
          ...elevation.zIndex.map((q, i) => `${i + 1}. ${q}`),
          '',
        ]
      : []),
    `**Check:** ${f.agent.checks.map((c) => `\`${c}\``).join(', ')}`,
    '',
  ]),
].join('\n');
const files = new Map();
for (const c of components) files.set(join(componentsDir, `${c.name}.json`), shipped(JSON.stringify({ $comment: COMMENT, ...c }, null, 2)) + '\n');
const digest = createHash('sha256').update(JSON.stringify(body)).update([...files.values()].join('')).digest('hex').slice(0, 16);
files.set(out, shipped(JSON.stringify({ $comment: COMMENT, version: 'agent-index/1', digest, ...body }, null, 2)) + '\n');
files.set(join(core, 'guide/7-principles.md'), md);
const summary = `${components.length} components, ${blocks.length} block types, ${templates.length} templates, ${semantic.length} semantic tokens, ${icons.length} icons`;

if (process.argv.includes('--check')) {
  const stale = [...files].filter(([f, text]) => !existsSync(f) || read(f) !== text).map(([f]) => rel(f));
  const extra = list(componentsDir, (f) => f.endsWith('.json')).filter((f) => !files.has(f)).map(rel);
  if (stale.length || extra.length) {
    for (const f of stale) console.error(`stale: ${f}`);
    for (const f of extra) console.error(`not generated (a removed component?): ${f}`);
    console.error('The agent index is out of date with the source. Run: npm run agent:index');
    process.exit(1);
  }
  console.log(`Agent index is current: ${summary}.`);
} else {
  mkdirSync(componentsDir, { recursive: true });
  for (const f of list(componentsDir, (f) => f.endsWith('.json'))) if (!files.has(f)) rmSync(f);
  for (const [f, text] of files) writeFileSync(f, text);
  console.log(`Wrote ${rel(out)} and ${components.length} files in ${rel(componentsDir)}: ${summary}.`);
}
