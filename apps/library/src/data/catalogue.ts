/**
 * Reads each component's own source at build time: its doc comment (summary, @tier, @a11y, @key), its typed props
 * with their comments and defaults, what it imports, and the tokens its CSS and code read. Nothing here is written by
 * hand, so a component page can't drift from the code. A first, app-side reading of the catalogue S4 will generate.
 */
import { isToken } from './tokens';

const sources = import.meta.glob('../../../../packages/core/react/{fundamentals,compounds,layouts}/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const styles = import.meta.glob('../../../../packages/core/css/{fundamentals,compounds,layouts}/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
/** Template parts (Q64): each template's own fundamentals, compounds and layouts, named `{template}.{Name}`. */
const partSources = import.meta.glob(['../../../../packages/templates/*/parts/{fundamentals,compounds,layouts}/*.tsx', '!**/*.stories.tsx'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const partStyles = import.meta.glob('../../../../packages/templates/*/parts/{fundamentals,compounds,layouts}/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export interface PropDoc {
  name: string;
  type: string;
  optional: boolean;
  default?: string;
  description: string;
}

/** One interface's props: the component's own first, then the variants it combines. */
export interface PropGroup {
  name: string;
  props: PropDoc[];
}

export interface Entry {
  name: string;
  tier: 'fundamental' | 'compound' | 'layout';
  /** Path from the repository root. */
  file: string;
  summary: string;
  /** The family it's listed under in its tier (`@family` in its doc comment): buttons, inputs, navigation… */
  family?: string;
  a11y: string[];
  keys: { keys: string; action: string }[];
  props: PropGroup[];
  /** Passes `data-*` attributes through (sealed: no class or style props). */
  dataPassThrough: boolean;
  uses: string[];
  usedBy: string[];
  tokens: string[];
}

const kebab = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const clean = (comment: string) =>
  comment
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();

function docOf(source: string, name: string) {
  const m = new RegExp(`/\\*\\*((?:(?!\\*/)[\\s\\S])*)\\*/\\s*export function ${name}\\b`).exec(source);
  const lines = (m?.[1] ?? '').split('\n').map((l) => l.replace(/^\s*\*\s?/, ''));
  const summary: string[] = [];
  const tags: [string, string][] = [];
  for (const line of lines) {
    const tag = /^@(\w+)\s*(.*)$/.exec(line.trim());
    if (tag) tags.push([tag[1], tag[2]]);
    else if (tags.length) tags[tags.length - 1][1] += ` ${line.trim()}`;
    else if (line.trim()) summary.push(line.trim());
  }
  return {
    summary: summary.join(' '),
    family: tags.find(([t]) => t === 'family')?.[1].trim(),
    a11y: tags.filter(([t]) => t === 'a11y').map(([, v]) => v.trim()),
    keys: tags
      .filter(([t]) => t === 'key')
      .map(([, v]) => {
        const i = v.indexOf(':');
        return { keys: v.slice(0, i).trim(), action: v.slice(i + 1).trim() };
      }),
  };
}

function defaultsOf(source: string, name: string): Map<string, string> {
  const fn = source.slice(source.indexOf(`export function ${name}`));
  const destructured = /\(\{([^}]*)\}/.exec(fn.slice(0, 400))?.[1] ?? /const \{([^}]*)\} = props/.exec(fn)?.[1] ?? '';
  return new Map([...destructured.matchAll(/(\w+)\s*=\s*('[^']*'|\d+|true|false)/g)].map((m) => [m[1], m[2]]));
}

function propsOf(source: string, defaults: Map<string, string>): PropGroup[] {
  const groups: PropGroup[] = [];
  for (const m of source.matchAll(/interface (\w+)(?: extends [^{]+)?\s*\{([\s\S]*?)\n\}/g)) {
    const props: PropDoc[] = [];
    for (const p of m[2].matchAll(/(?:\/\*\*([\s\S]*?)\*\/\s*)?(\w+)(\?)?:\s*([^;]+);/g)) {
      if (p[4].trim() === 'never') continue;
      // A member of an inline object type (`swatch?: { value; onChange }`) isn't a prop of its own: the first wins.
      if (props.some((x) => x.name === p[2])) continue;
      props.push({ name: p[2], type: p[4].trim().replace(/\s+/g, ' '), optional: !!p[3], default: defaults.get(p[2]), description: clean(p[1] ?? '') });
    }
    if (props.length) groups.push({ name: m[1], props });
  }
  return groups;
}

/** Tokens read by the component's own CSS rules (those naming its `data-dl`, or a layout's whole file) and by its code. */
function tokensOf(slug: string, source: string, layout: boolean, part = false): string[] {
  const css = Object.entries(part ? partStyles : styles)
    .filter(([path]) => !layout || path.endsWith(`/layouts/${slug.replace(/-layout$/, '')}.css`) || path.endsWith(`/layouts/${slug}.css`))
    .map(([, text]) => text)
    .join('\n');
  const found = new Set<string>();
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!layout && !rule[1].includes(`data-dl='${slug}'`)) continue;
    for (const v of rule[2].matchAll(/var\((--[\w-]+)/g)) found.add(v[1]);
  }
  for (const v of source.matchAll(/'(--[\w-]+)'/g)) found.add(v[1]);
  return [...found].filter((t) => isToken(t) || t.startsWith('--t-')).sort();
}

const files = [
  ...Object.entries(sources).map(([path, source]) => ({ path, source, name: path.split('/').pop()!.replace(/\.tsx$/, ''), template: undefined as string | undefined })),
  ...Object.entries(partSources).map(([path, source]) => {
    const template = path.split('/templates/')[1].split('/')[0];
    return { path, source, name: path.split('/').pop()!.replace(/\.tsx$/, ''), template };
  }),
];
const names = new Set(files.map((f) => f.name));

export const catalogue: Entry[] = files.map(({ path, source, name, template }) => {
  const doc = docOf(source, name);
  if (template) {
    return {
      name: `${template}.${name}`,
      tier: path.includes('/layouts/') ? 'layout' : path.includes('/compounds/') ? 'compound' : 'fundamental',
      file: `packages/templates/${path.split('/templates/')[1]}`,
      ...doc,
      props: propsOf(source, defaultsOf(source, name)).sort((a, b) => Number(b.name === `${name}Props`) - Number(a.name === `${name}Props`)),
      dataPassThrough: /extends DataAttributes/.test(source),
      uses: [...source.matchAll(/import \{([^}]*)\} from '@design-library\/core\/react'/g)].flatMap((m) => m[1].split(',').map((x) => x.trim()).filter((x) => /^[A-Z]/.test(x) && names.has(x))).sort(),
      usedBy: [],
      tokens: tokensOf(`${template}-${kebab(name)}`, source, false, true),
    } satisfies Entry;
  }
  const layout = path.includes('/layouts/');
  const uses = [...source.matchAll(/from '\.\.?\/(?:fundamentals\/)?(\w+)'/g)].map((m) => m[1]).filter((u) => names.has(u) && u !== name);
  return {
    name,
    tier: layout ? 'layout' : path.includes('/compounds/') ? 'compound' : 'fundamental',
    file: `packages/core/react/${path.split('/react/')[1]}`,
    ...doc,
    props: propsOf(source, defaultsOf(source, name)).sort((a, b) => Number(b.name === `${name}Props`) - Number(a.name === `${name}Props`)),
    dataPassThrough: /extends DataAttributes/.test(source),
    uses: [...new Set(uses)].sort(),
    usedBy: [],
    tokens: tokensOf(kebab(name), source, layout),
  };
});
for (const e of catalogue) e.usedBy = catalogue.filter((o) => o.uses.includes(e.name)).map((o) => o.name);

export const entryOf = (name: string) => catalogue.find((e) => e.name === name);
