/**
 * Icon sets (tier 0, F17, owner Q36): which library draws the semantic icon names. The library's own outline set
 * (icons.ts) is the theme's default and always present; a curated MIT or Apache-2.0 set can replace it by name, one
 * set and one style at a time, loaded on demand from its subset file (tools/icon-sets.mjs). A name a style lacks falls
 * back to the set's first style, then to the library's own, so no icon ever goes missing.
 */
import { useSyncExternalStore } from 'react';
import index from './sets/index.json';
import { icons as ownIcons } from './icons';

/** One SVG element as data: tag, attributes (React names), children for a group. */
export type IconNode = [string, Record<string, string>, IconNode[]?];

export interface SetGlyph {
  /** viewBox */
  v: string;
  /** The root's paint (fill, stroke, stroke width and caps), drawn on a group so it overrides the Icon's own. */
  g: Record<string, string>;
  c: IconNode[];
  /** The set's own icon name. */
  from: string;
}

export interface IconSetStyle {
  id: string;
  label: string;
  covered: number;
  gaps: string[];
}

export interface IconSetInfo {
  id: string;
  name: string;
  author: string;
  licence: string;
  licenceUrl: string;
  package: string;
  version: string;
  description: string;
  styles: IconSetStyle[];
  bytes: number;
}

export const iconSets = index.sets as IconSetInfo[];
export const iconSetNames = index.names as string[];
export const excludedIconSets = index.excluded as { name: string; licence: string; reason: string }[];

/** A brand's glyph (Q113): the curated sets' shape, with `g` (root paint) and `from` optional. */
export interface BrandGlyph {
  /** viewBox */
  v: string;
  /** The root's paint; draw in `currentColor` so the glyph takes the text colour around it. */
  g?: Record<string, string>;
  c: IconNode[];
  from?: string;
}

/** A brand's own icon set (MP24): drawn by name like a curated set, chosen with `setIconSet(id)`. */
export interface BrandIconSet {
  id: string;
  name: string;
  /** The licence the brand holds the glyphs under, recorded with the set. */
  licence: string;
  author?: string;
  /** One style's glyphs by semantic name; or use `styles`. */
  glyphs?: Record<string, BrandGlyph>;
  /** Several styles, each glyphs by name; the first is the fallback for the others. */
  styles?: Record<string, Record<string, BrandGlyph>>;
}

/** The names a brand may draw: every Icon name, and `star`, Rating's mark. */
const known = () => new Set([...Object.keys(ownIcons), 'star']);
const development = () => Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);

/** In development, warns once per problem: a name no component draws, or a glyph without a viewBox (ID48). */
const warned = new Set<string>();
export function checkGlyphs(where: string, glyphs: Record<string, BrandGlyph | undefined>) {
  if (!development()) return;
  const names = known();
  for (const [name, glyph] of Object.entries(glyphs)) {
    const problem = !names.has(name) ? `"${name}" isn't an icon name; it draws nowhere (names: ${[...names].join(', ')})` : !glyph?.v ? `"${name}" has no viewBox (v)` : null;
    if (problem && !warned.has(`${where}:${problem}`)) {
      warned.add(`${where}:${problem}`);
      console.warn(`[design-library] ${where}: ${problem}`);
    }
  }
}

const registered = new Map<string, IconSetInfo>();

/**
 * Registers a brand's own icon set (MP24, Q113): its glyphs by the library's semantic names, under the brand's licence.
 * Then `setIconSet(id)` draws every Icon from it, and a name it lacks falls back to the library's own. Not added to the
 * curated picker list.
 */
export function registerIconSet(set: BrandIconSet) {
  const styles = set.styles ?? { default: set.glyphs ?? {} };
  for (const [style, glyphs] of Object.entries(styles)) checkGlyphs(`registerIconSet(${set.id}/${style})`, glyphs);
  const info: IconSetInfo = {
    id: set.id,
    name: set.name,
    author: set.author ?? '',
    licence: set.licence,
    licenceUrl: '',
    package: '',
    version: '',
    description: '',
    styles: Object.entries(styles).map(([id, glyphs]) => ({ id, label: id, covered: Object.keys(glyphs).length, gaps: [] })),
    bytes: 0,
  };
  registered.set(set.id, info);
  loaded.set(set.id, { id: set.id, styles: Object.fromEntries(Object.entries(styles).map(([id, glyphs]) => [id, Object.fromEntries(Object.entries(glyphs).map(([n, g]) => [n, asSetGlyph(g, n)]))])) });
  notify();
}

const asSetGlyph = (g: BrandGlyph, name: string): SetGlyph => ({ v: g.v, g: g.g ?? {}, c: g.c, from: g.from ?? name });

export const iconSetOf = (id: string | null | undefined) => iconSets.find((s) => s.id === id) ?? (id ? registered.get(id) : undefined);

let siteOverrides: Record<string, SetGlyph> = {};

/**
 * A few brand icons over the active set, site-wide (MP24, Q113): each name given draws the brand's glyph in every
 * component and layout that draws that name (and `star` in Rating); every other name stays as it was. `null` clears
 * them. A subtree takes its own with `<IconOverrides>`, which wins over these.
 */
export function setIconOverrides(glyphs: Record<string, BrandGlyph> | null) {
  checkGlyphs('setIconOverrides', glyphs ?? {});
  siteOverrides = Object.fromEntries(Object.entries(glyphs ?? {}).map(([n, g]) => [n, asSetGlyph(g, n)]));
  notify();
}

/** The site-wide overrides now. */
export const getIconOverrides = () => siteOverrides;

/** A brand glyph as the Icon draws it. */
export const toSetGlyph = asSetGlyph;

type SetData = { id: string; styles: Record<string, Record<string, SetGlyph>> };

// Static specifiers, so the bundler splits each set into its own file, loaded only when chosen.
const sources: Record<string, () => Promise<{ default: unknown }>> = {
  fluent: () => import('./sets/fluent.json'),
  material: () => import('./sets/material.json'),
  tabler: () => import('./sets/tabler.json'),
  phosphor: () => import('./sets/phosphor.json'),
  heroicons: () => import('./sets/heroicons.json'),
  bootstrap: () => import('./sets/bootstrap.json'),
  iconoir: () => import('./sets/iconoir.json'),
};

export interface IconChoice {
  /** `null`: the library's own set. */
  set: string | null;
  style: string | null;
}

const loaded = new Map<string, SetData>();
let choice: IconChoice = { set: null, style: null };
let version = 0;
const listeners = new Set<() => void>();
const notify = () => {
  version++;
  listeners.forEach((l) => l());
};

/** Draw every Icon from `set` in `style` (its first style when omitted); `null` goes back to the library's own. */
export async function setIconSet(set: string | null, style?: string | null) {
  const info = iconSetOf(set);
  choice = info ? { set: info.id, style: info.styles.find((s) => s.id === style)?.id ?? info.styles[0].id } : { set: null, style: null };
  notify();
  if (info) await loadIconSet(info.id);
}

/** Loads a set's subset file without choosing it, e.g. to preview it beside others. */
export async function loadIconSet(id: string) {
  if (loaded.has(id) || !sources[id]) return;
  const mod = await sources[id]();
  loaded.set(id, mod.default as SetData);
  notify();
}

export const getIconChoice = () => choice;

/** Whether a set's subset file has arrived. */
export const isIconSetLoaded = (id: string) => loaded.has(id);

/** The glyph a semantic name draws with now, and where it came from; `null` means the library's own path. */
export function glyphFor(name: string, pick: IconChoice = choice): { glyph: SetGlyph; fallback: boolean } | null {
  if (!pick.set) return null;
  const data = loaded.get(pick.set);
  const info = iconSetOf(pick.set);
  if (!data || !info) return null;
  const own = data.styles[pick.style ?? '']?.[name];
  if (own) return { glyph: own, fallback: false };
  const base = data.styles[info.styles[0].id]?.[name];
  return base ? { glyph: base, fallback: true } : null;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
/** Notified when the set, the style or a set's data changes (the token-preset store watches it, Q70). */
export const subscribeIconChoice = subscribe;

/** Re-renders when the set, the style or a set's data changes. */
export function useIconSetVersion() {
  return useSyncExternalStore(subscribe, () => version, () => 0);
}

/** The current choice, re-rendering on change. */
export function useIconChoice(): IconChoice {
  useIconSetVersion();
  return choice;
}
