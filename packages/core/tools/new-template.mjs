#!/usr/bin/env node
/**
 * Start an empty template (IP35), shipped with the package:
 *   npx design-library-new-template <id> [--templates src/templates] [--title "Harbour Books"]
 *                                   [--part fundamentals/Badge] [--part compounds/TalkGrid] [--part layouts/Band]
 * Writes `{templates}/{id}/` with nothing copied from another template: the manifest (a home and two sections of
 * planned screens, the smallest shape the grouping rule allows), the content schema, the home and shared content,
 * an empty assets file, `index.ts`, and the token source `tokens/tokens.json` with its generated `tokens.css`. Each
 * `--part` adds a part in the template's namespace: its TSX, CSS (reading only its own tokens), a stories file and a
 * token; a fundamental or compound also gets a block type with its schema in `content.schema.json`, an `example` in
 * the manifest and an entry in `registry.tsx`. The result passes `npx design-library-check-content`. Then follow the
 * guide's Step 6 "Prune and shape": rename or remove the planned screens, write the home page, register the template.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const core = fileURLToPath(new URL('..', import.meta.url));
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const id = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
const usage = 'usage: npx design-library-new-template <id> [--templates src/templates] [--title "Name"] [--part fundamentals|compounds|layouts/PascalName]…';
if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error(`new-template: give an id in lower case, one word or kebab case (harbour, city-guide).\n${usage}`);
  process.exit(1);
}
const templates = resolve(root, opt('templates') ?? (existsSync(join(root, 'packages/templates')) && !existsSync(join(root, 'src')) ? 'packages/templates' : 'src/templates'));
const dir = join(templates, id);
if (existsSync(dir)) {
  console.error(`new-template: ${relative(root, dir)} already exists; choose another id or remove the folder.`);
  process.exit(1);
}
const title = opt('title') ?? id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const camel = (name) => name[0].toLowerCase() + name.slice(1);
const parts = argv
  .flatMap((a, i) => (a === '--part' ? [argv[i + 1]] : []))
  .map((p) => {
    const [kind, name] = String(p).split('/');
    if (!['fundamentals', 'compounds', 'layouts'].includes(kind) || !/^[A-Z][A-Za-z0-9]*$/.test(name ?? '')) {
      console.error(`new-template: --part ${p} isn't kind/PascalName (fundamentals/Badge, compounds/TalkGrid, layouts/Band).`);
      process.exit(1);
    }
    return { kind, name, tag: kebab(name), tier: kind.replace(/s$/, ''), block: kind !== 'layouts' };
  });

const schemas = relative(dir, join(core, 'schemas')).split('\\').join('/');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const write = (file, text) => {
  const target = join(dir, file);
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, text);
};

// The manifest: a home and two sections, three items each (the grouping rule's smallest shape). Every screen but the
// home is planned: rename, remove or build them in the prune step.
const site = (screen, extra = {}) => ({ id: screen, title: screen[0].toUpperCase() + screen.slice(1).replace(/-/g, ' '), component: 'SiteLayout', ...extra });
const blocks = parts.filter((p) => p.block);
const manifest = {
  $schema: `${schemas}/template.schema.json`,
  id,
  version: '0.1.0',
  title,
  summary: `${title}: describe in one sentence what this site is for.`,
  contentSchema: 'content.schema.json',
  contentVersion: 1,
  shared: 'content/shared.json',
  assets: 'assets.json',
  home: 'home',
  sections: [
    { id: 'about', title: 'About', summary: 'Who this is and what they offer.', flows: [
      { id: 'story', title: 'Our story', summary: 'Where it started and who runs it.', screens: ['home', 'about', 'team'] },
      { id: 'news', title: 'News', summary: 'What’s new.', screens: ['news'] },
    ] },
    { id: 'contact', title: 'Contact', summary: 'How to get in touch.', flows: [
      { id: 'reach', title: 'Reach us', summary: 'Write or visit.', screens: ['contact'] },
      { id: 'help', title: 'Help', summary: 'Answers and a way back.', screens: ['faq', 'not-found'] },
    ] },
  ],
  layouts: [
    site('home', { content: 'content/home.json', regions: [
      { id: 'header', shared: true, accepts: ['site-header'] },
      { id: 'main', accepts: ['*'] },
      { id: 'footer', shared: true, accepts: ['site-footer'] },
    ] }),
    ...['about', 'team', 'news', 'contact', 'faq', 'not-found'].map((s) => site(s, { planned: true })),
  ],
  ...(parts.length
    ? {
        parts: {
          ...Object.fromEntries(['fundamentals', 'compounds', 'layouts'].map((k) => [k, parts.filter((p) => p.kind === k).map((p) => ({ name: `${id}.${p.name}`, source: `parts/${k}/${p.name}.tsx` }))]).filter(([, v]) => v.length)),
          ...(blocks.length ? { blocks: blocks.map((p) => ({ type: `${id}.${p.tag}`, schema: `#/$defs/${camel(p.name)}`, renders: `${id}.${p.name}`, example: { type: `${id}.${p.tag}`, text: `What the ${p.name} says.` } })) } : {}),
        },
      }
    : {}),
};
write('template.json', json(manifest));

write('content.schema.json', json({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `https://design-library.local/templates/${id}/content/1`,
  title: `${title} content, version 1`,
  description: blocks.length ? 'Every content file of this template: the core envelope, core blocks and its own blocks.' : 'Every content file of this template: the core envelope and core blocks.',
  $ref: 'https://design-library.local/core/content/1',
  $defs: Object.fromEntries(blocks.map((p) => [camel(p.name), {
    description: `${p.name}, this template's own block (${id}.${p.name}).`,
    type: 'object',
    required: ['type', 'text'],
    properties: { type: { const: `${id}.${p.tag}` }, text: { type: 'string', minLength: 1 } },
    additionalProperties: false,
  }])),
}));

write('content/home.json', json({
  $schema: '../content.schema.json',
  template: id,
  layout: 'home',
  contentVersion: 1,
  settings: { current: 'home' },
  regions: {
    main: [
      { type: 'hero', standalone: true, title: `Welcome to ${title}`, lead: 'Say in one sentence what a visitor finds here.' },
      ...blocks.map((p) => ({ type: `${id}.${p.tag}`, text: `What the ${p.name} says.` })),
    ],
  },
}));
write('content/shared.json', json({
  $schema: '../content.schema.json',
  template: id,
  shared: true,
  contentVersion: 1,
  regions: {
    header: [{ type: 'site-header', name: title, places: [{ label: 'Home', href: '/home' }] }],
    footer: [{ type: 'site-footer', sectionsLabel: `More from ${title}`, sections: [{ id: 'about', heading: 'About', links: [{ label: 'Home', href: '/home' }] }], links: [], identity: title, legal: `© ${new Date().getFullYear()} ${title}` }],
  },
}));
write('assets.json', json({ $schema: `${schemas}/assets.schema.json`, assets: {} }));

const tokens = { $description: `The ${title} template's own component tokens: each aliases a core semantic role, so its parts follow the theme and every context.`, t: { [id]: {} } };
for (const p of parts) tokens.t[id][p.tag] = { gap: { $type: 'dimension', $value: '{space.stack-item}', $description: `Between the ${p.name}'s own parts.` } };
write('tokens/tokens.json', json(tokens));

for (const p of parts) {
  const tag = `${id}-${p.tag}`;
  const tsx = p.block
    ? `import type { DataAttributes } from '@design-library/core/react';

export interface ${p.name}Props extends DataAttributes {
  /** The words it shows. */
  text: string;
}

/**
 * ${p.name}: say what it is for, when to use it and when not (a core component that fits is always first).
 * A ${title} template part: it lives only in this template's scope.
 * @tier ${p.tier}
 * @family ${id}
 */
export function ${p.name}({ text, ...data }: ${p.name}Props) {
  return (
    <div {...data} data-dl="${tag}">
      <p data-dl-part="text">{text}</p>
    </div>
  );
}
`
    : `import type { ReactNode } from 'react';
import type { DataAttributes } from '@design-library/core/react';

export interface ${p.name}Props extends DataAttributes {
  /** The region's content. */
  children: ReactNode;
}

/**
 * ${p.name}: say what arrangement it gives that no core layout does, and when not to use it.
 * A ${title} template part: it lives only in this template's scope.
 * @tier layout
 * @family ${id}
 */
export function ${p.name}({ children, ...data }: ${p.name}Props) {
  return (
    <div {...data} data-dl="${tag}">
      {children}
    </div>
  );
}
`;
  write(`parts/${p.kind}/${p.name}.tsx`, tsx);
  write(`parts/${p.kind}/${p.tag}.css`, `/* ${title} template part, ${p.tier}: ${p.name}. Reads only core semantic roles and its own t.${id}.${p.tag} tokens; styles only its own markup. */
@layer templates {
  [data-dl='${tag}'] {
    display: grid;
    gap: var(--t-${id}-${p.tag}-gap);
  }
${p.block ? `
  [data-dl='${tag}'] > [data-dl-part='text'] {
    margin: 0;
    color: var(--color-text);
  }
` : ''}}
`);
  const sample = p.block ? `<${p.name} text="What the ${p.name} says." />` : `<${p.name}>The region's content.</${p.name}>`;
  write(`parts/${p.kind}/${p.name}.stories.tsx`, `import type { StoryFile } from '@design-library/core/react';
import { ${p.name} } from './${p.name}';

export default {
  component: '${id}.${p.name}',
  tier: '${p.tier}',
  summary: 'Say in one sentence what it shows.',
  stories: [
    {
      title: 'Default',
      description: 'Add one story per variant and state.',
      code: \`${sample}\`,
      render: () => ${sample},
    },
  ],
} satisfies StoryFile;
`);
}

if (parts.length) {
  const imports = parts.map((p) => `import { ${p.name} } from './parts/${p.kind}/${p.name}';`).join('\n');
  const css = ["import './tokens/tokens.css';", ...parts.map((p) => `import './parts/${p.kind}/${p.tag}.css';`)].join('\n');
  const types = blocks.map((p) => `interface ${p.name}Block {\n  type: '${id}.${p.tag}';\n  text: string;\n}`).join('\n\n');
  const blockType = blocks.length ? `{ ${blocks.map((p) => `'${id}.${p.tag}': BlockRenderer<${p.name}Block>`).join('; ')} }` : 'Record<string, never>';
  const entries = blocks.map((p) => `  '${id}.${p.tag}': (b, _ctx, i) => <${p.name} key={i} text={b.text} />,`).join('\n');
  const layoutParts = parts.filter((p) => !p.block);
  write('registry.tsx', `/**
 * The ${title} template's registry: its own block types${layoutParts.length ? ' and layouts' : ''}, each mapped to its own parts, all under the
 * \`${id}\` namespace. Core blocks and core layouts need no entry here.
 */
${layoutParts.length ? "import { SiteLayout } from '@design-library/core/react';\n" : ''}import type { ${blocks.length ? 'BlockRenderer, ' : ''}Template } from '@design-library/core/render';
${imports}
${css}
${types ? `\n${types}\n` : ''}
const BLOCKS: ${blockType} = {
${entries}
};

export const registry: Template['registry'] = {
  blocks: BLOCKS,${layoutParts.length ? `
  layouts: {
${layoutParts.map((p) => `    '${id}.${p.name}': ({ region }) => (
      <SiteLayout header={region('header')} footer={region('footer')}>
        <${p.name}>{region('main')}</${p.name}>
      </SiteLayout>
    ),`).join('\n')}
  },` : ''}
};
`);
}

write('index.ts', `/** ${title}: started with design-library-new-template. */
import type { StoryFile } from '@design-library/core/react';
import { loadTemplate } from '@design-library/core/render';
import manifest from './template.json';
import assets from './assets.json';
${parts.length ? "import { registry } from './registry';\n" : "import './tokens/tokens.css';\n"}
export default loadTemplate(
  manifest,
  import.meta.glob('./content/**/*.json', { eager: true, import: 'default' }),
  assets,
  import.meta.glob('./assets/*', { eager: true, query: '?url', import: 'default' }),
  ${parts.length ? 'registry' : 'undefined'},
  Object.values(import.meta.glob<StoryFile>('./parts/*/*.stories.tsx', { eager: true, import: 'default' })),
);
`);

execFileSync(process.execPath, [join(core, 'tools/template-tokens.mjs'), '--templates', templates], { cwd: root, stdio: 'ignore' });

const shown = relative(root, dir).split('\\').join('/');
console.log(`new-template: wrote ${shown}/ (${parts.length} part${parts.length === 1 ? '' : 's'}).
Next:
  1. Register it in ${relative(root, templates).split('\\').join('/')}/index.ts: import ${camel(id.replace(/-([a-z])/g, (_, c) => c.toUpperCase()))} from './${id}';
  2. Prune and shape (guide Step 6): rename, remove or build the planned screens in template.json; keep 3–5 items per group.
  3. Write the home page in content/home.json and the header and footer in content/shared.json.
     Pictures go in assets.json by id: { "hero": { "src": "assets/hero.webp", "alt": "…", "dark": "assets/hero-dark.webp" } }
     ("dark" and "contrast" are optional files of the same picture, same shape, for those schemes).
  4. Check: npx design-library-check-content --templates ${relative(root, templates).split('\\').join('/')}
  5. After changing tokens/tokens.json: npx design-library-template-tokens --templates ${relative(root, templates).split('\\').join('/')}`);
