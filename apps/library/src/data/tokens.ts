import authored from '@design-library/core/tokens/tokens.json';
import colourTokens from '@design-library/core/tokens/tokens.colour.json';
import spaceShapeTokens from '@design-library/core/tokens/tokens.space-shape.json';
import spaceShapeOptions from '@design-library/core/tokens/space-shape-options.json';
import spaceShapeConfig from '@design-library/core/tokens/space-shape.config.json';
import colourConfig from '@design-library/core/tokens/colour.config.json';
import light from '@design-library/core/tokens/tokens.light.json';
import dark from '@design-library/core/tokens/tokens.dark.json';
import contrastMore from '@design-library/core/tokens/tokens.contrast-more.json';
import checks from '@design-library/core/tokens/checks.json';
import motionReduce from '@design-library/core/tokens/tokens.motion-reduce.json';

export interface TokenEntry {
  /** Dotted token path, e.g. color.text */
  path: string;
  /** CSS custom property, e.g. --color-text */
  css: string;
  description: string;
  /** Alias target when the token points at another token. */
  alias?: string;
  /** Literal value as written in the source, when not an alias. */
  literal?: string;
}

type Node = { [key: string]: unknown };

function flatten(group: Node, prefix: string[] = []): TokenEntry[] {
  const out: TokenEntry[] = [];
  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith('$') || !value || typeof value !== 'object') continue;
    const node = value as Node;
    const path = [...prefix, key];
    if ('$value' in node) {
      const v = node.$value;
      const alias = typeof v === 'string' && /^\{.+\}$/.test(v) ? v.slice(1, -1) : undefined;
      const literal = alias
        ? undefined
        : typeof v === 'object' && v && 'hex' in (v as Node)
          ? String((v as Node).hex)
          : typeof v === 'object' && v && 'value' in (v as Node)
            ? `${(v as Node).value}${(v as Node).unit}`
            : Array.isArray(v)
              ? v.join(', ')
              : String(v);
      out.push({ path: path.join('.'), css: `--${path.join('-')}`, description: String(node.$description ?? ''), alias, literal });
    } else out.push(...flatten(node, path));
  }
  return out;
}

const baseTokens = [...flatten(authored as Node), ...flatten(spaceShapeTokens as Node), ...flatten(colourTokens as Node)];

export type SpaceOption = 'compact' | 'normal' | 'loose' | 'extra-loose';
export type ShapeOption = 'sharp' | 'rounded' | 'soft' | 'super-soft';
/** One space or shape option: its name, who it's for, and the scale step or radius each role takes. */
export interface ThemeOption<Id extends string> {
  id: Id;
  label: string;
  for: string;
  values: Record<string, string>;
}
const optionsOf = <Id extends string>(group: { options: Record<string, { label: string; for: string; values: Record<string, string> }> }) =>
  Object.entries(group.options).map(([id, o]) => ({ id: id as Id, ...o }));
/** The space options (space-shape-options.json), in order from densest to loosest. */
export const spaceOptions: ThemeOption<SpaceOption>[] = optionsOf<SpaceOption>(spaceShapeOptions.space);
/** The shape options, from sharp to super soft. */
export const shapeOptions: ThemeOption<ShapeOption>[] = optionsOf<ShapeOption>(spaceShapeOptions.shape);
/** The theme's own choice (space-shape.config.json): what a product gets by default. */
export const themeSpaceShape = spaceShapeConfig as { space: SpaceOption; shape: ShapeOption };
const all = [...baseTokens, ...flatten(light as Node)];

/** Tokens under a group (e.g. "color", "space"), excluding private primitives. */
export function tokensIn(group: string): TokenEntry[] {
  return all.filter((t) => t.path === group || t.path.startsWith(`${group}.`));
}

export interface Ramp {
  /** Dotted group path, e.g. p.base, spectrum.red, set.pastel */
  id: string;
  name: string;
  description: string;
  tokens: TokenEntry[];
}

/**
 * Literal colour ramps one level under a group, the same in every context: `p` (primitives, narrowed by `only`),
 * `spectrum` (hues) or `set` (custom sets). Alias-only ramps (an accent reusing a brand colour) are left out.
 */
export function palette(group: 'p' | 'spectrum' | 'set', only?: string[]): Ramp[] {
  const ramps = new Map<string, TokenEntry[]>();
  for (const t of baseTokens.filter((x) => x.path.startsWith(`${group}.`) && x.literal?.startsWith('#') && x.literal.length === 7)) {
    const name = t.path.split('.')[1];
    if (only && !only.includes(name)) continue;
    ramps.set(name, [...(ramps.get(name) ?? []), t]);
  }
  const groups = (colourTokens as unknown as Record<string, Record<string, { $description?: string }>>)[group];
  const order = only ?? [...ramps.keys()];
  return order.filter((n) => ramps.has(n)).map((name) => ({ id: `${group}.${name}`, name, description: groups[name]?.$description ?? '', tokens: ramps.get(name)! }));
}

interface ColourConfig {
  brand: { colours: Record<string, { name?: string; seed: string }>; accent?: number };
  base: { temperature?: 'neutral' | 'warm' | 'cool'; tint?: { colour?: string; from?: number | 'accent'; strength?: number } };
  spectrum: { hues: number };
  sets?: { name: string; purpose: string; demo?: boolean }[];
}
/** The theme's colour decisions, as declared in colour.config.json. */
export const colourTheme = colourConfig as unknown as ColourConfig;

const accentRoles = ['color.accent', 'color.accent-hover', 'color.accent-pressed', 'color.accent-subtle', 'color.focus', 'color.text-link', 'color.text-on-accent', 'state.selected'];

/** Colour roles by family: brand and accent, the base colours' text, surfaces and lines, or status. */
export function colourRoles(family: 'brand' | 'base' | 'status'): TokenEntry[] {
  const roles = [...tokensIn('color'), ...tokensIn('state')];
  if (family === 'status') return roles.filter((t) => t.path.startsWith('color.status.'));
  const brand = (t: TokenEntry) => t.path.startsWith('color.brand.') || accentRoles.includes(t.path);
  return roles.filter((t) => !t.path.startsWith('color.status.') && (family === 'brand' ? brand(t) : !brand(t)));
}

/** The functional set: one entry per status, in the order the model lists them. */
export const statuses = ['info', 'success', 'warning', 'danger', 'neutral'] as const;

const themeMaps = {
  light: new Map([...baseTokens, ...flatten(light as Node)].map((t) => [t.path, t])),
  dark: new Map([...baseTokens, ...flatten(dark as Node)].map((t) => [t.path, t])),
};
const moreTokens = flatten(contrastMore as Node);
const reduceTokens = flatten(motionReduce as Node);

/** What a motion token holds with reduced motion: its override in that context, or undefined when it keeps its value. */
export const reducedLiteral = (path: string) => reduceTokens.find((t) => t.path === path)?.literal;

const tokenRoot = 'packages/core/tokens/';
const definedIn: [string, Set<string>][] = [
  [`${tokenRoot}tokens.json`, new Set(flatten(authored as Node).map((t) => t.path))],
  [`${tokenRoot}space-shape.config.json`, new Set(flatten(spaceShapeTokens as Node).map((t) => t.path))],
  [`${tokenRoot}space-shape-options.json`, new Set(flatten(spaceShapeTokens as Node).map((t) => t.path))],
  [`${tokenRoot}tokens.space-shape.json`, new Set(flatten(spaceShapeTokens as Node).map((t) => t.path))],
  [`${tokenRoot}colour.config.json`, new Set(flatten(colourTokens as Node).map((t) => t.path))],
  [`${tokenRoot}tokens.colour.json`, new Set(flatten(colourTokens as Node).map((t) => t.path))],
  [`${tokenRoot}tokens.light.json`, new Set(flatten(light as Node).map((t) => t.path))],
  [`${tokenRoot}tokens.dark.json`, new Set(flatten(dark as Node).map((t) => t.path))],
  [`${tokenRoot}tokens.contrast-more.json`, new Set(moreTokens.map((t) => t.path))],
  [`${tokenRoot}tokens.motion-reduce.json`, new Set(reduceTokens.map((t) => t.path))],
];

/** The token source files that define a token (its owning sources for a revision comment). */
export const tokenFiles = (path: string) => definedIn.filter(([, paths]) => paths.has(path)).map(([file]) => file);

/**
 * The palette entry a role finally reads in one context, e.g. color.text-muted in dark with more contrast →
 * --p-base-50. Private standard-contrast indirections are followed through, so the name is the ink actually used.
 */
export function primitiveIn(path: string, scheme: 'light' | 'dark', contrast?: 'more' | 'standard'): string {
  const map = new Map(themeMaps[scheme]);
  if (contrast === 'more') for (const t of moreTokens) map.set(t.path, t);
  let t = map.get(path);
  for (let hops = 0; t?.alias && hops < 8; hops++) t = map.get(t.alias);
  if (!t) return '';
  return t.path.startsWith('p.') ? t.css : (t.literal ?? '');
}

export interface ContrastPair {
  fg: string;
  bg: string;
  min: number;
}

/** The contrast pairs the token check holds in every context. */
export const contrastPairs: ContrastPair[] = (checks as { contrast: ContrastPair[] }).contrast;

const byPath = new Map(all.map((t) => [t.path, t]));
const byCss = new Set(all.map((t) => t.css));

/** Named decisions, primitives aside: what the overview counts. */
export const tokenCount = all.filter((t) => !t.path.startsWith('p.')).length;

/** Whether a custom property is a design token (not a component's private data property). */
export const isToken = (css: string) => byCss.has(css);

const pageByGroup: Record<string, string> = {
  color: 'colour', state: 'colour', p: 'colour', spectrum: 'colour', set: 'colour',
  font: 'type', text: 'type', leading: 'type', weight: 'type', tracking: 'type', type: 'type',
  space: 'space', size: 'space',
  radius: 'shape', border: 'shape', shadow: 'elevation',
  duration: 'motion', easing: 'motion', motion: 'motion', count: 'motion',
  layer: 'elevation', breakpoint: 'space', c: 'component-tokens',
};

/** The foundations page that shows a token, by its group. */
export const tokenPage = (css: string) => pageByGroup[css.replace(/^--/, '').split('-')[0]] ?? 'colour';

/** Follows aliases to the literal a token finally holds, e.g. type.body.size → 1rem. */
export function resolveLiteral(path: string): string {
  let t = byPath.get(path);
  for (let hops = 0; t?.alias && hops < 8; hops++) t = byPath.get(t.alias);
  return t?.literal ?? '';
}

/** A literal as people read it: rem also in pixels at the default 16 px root. */
export function readable(literal: string): string {
  const rem = literal.match(/^(-?[\d.]+)rem$/);
  if (rem) return `${literal} · ${Math.round(Number(rem[1]) * 16 * 100) / 100} px`;
  const ms = literal.match(/^(-?[\d.]+)ms$/);
  return ms ? `${ms[1]} ms` : literal;
}

/** The value column of a token row: the alias it reads, or its literal. */
export const valueOf = (t: TokenEntry) => (t.alias ? `--${t.alias.replace(/\./g, '-')}` : readable(t.literal ?? ''));
