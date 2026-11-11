/**
 * The brand colour draft (owner, F7d): four numbered slots and the accent, edited live on the Colour page.
 *
 * The draft runs through the same generator as the build (`@design-library/core/colour`), and its primitives and brand
 * roles are set as custom properties on the root, so every role that reads them (accent, focus, link, selection) and
 * every preview recolours at once. It's kept in this browser only; colour.config.json is never written from here. The
 * page shows the config to paste, and an agent applies it with `npm run tokens`.
 */
import { useSyncExternalStore } from 'react';
import { BRAND_SLOTS, contrast, generate, hexToOklch, nearestHueName, slotName } from '@design-library/core/colour';
import presetsFile from '@design-library/core/tokens/colour-presets.json';
import colourConfig from '@design-library/core/tokens/colour.config.json';
import { watchStored } from '@design-library/core/presets';
import { contrastPairs, primitiveIn, resolveLiteral } from './tokens';
import { brandExamples } from './brand-examples';
import { groupParts, mapPresets, moved, partName, resolveMap, type BrandMap, type Column, type GroupId, type MapState, type PresetId } from './brand-map';

export type Slot = (typeof BRAND_SLOTS)[number];
export const slots = BRAND_SLOTS as readonly Slot[];
export interface BrandColour {
  name?: string;
  seed: string;
  pins?: Record<string, string>;
}
export interface Brand {
  colours: Partial<Record<Slot, BrandColour>>;
  accent: number;
  /** The brand map (Q132): which colour each part reads. Absent: the starting preset, following the colours. */
  map?: BrandMap;
  /**
   * Standard contrast (Q134). Absent: brand first, the seed as is with derived hover and pressed steps and relaxed
   * contrast. 'accessible': the more-contrast steps in standard too. More contrast is always accessible.
   */
  standardContrast?: 'accessible';
}
export interface Preset {
  id: string;
  name: string;
  mood: string;
  brand: Brand;
}

export const presets = (presetsFile as unknown as { presets: Preset[] }).presets;
const config = colourConfig as unknown as { brand: Brand } & Record<string, unknown>;
const KEY = 'design-library.brand-draft';
const same = (a: Brand, b: Brand) => JSON.stringify(a) === JSON.stringify(b);
/** The brand as colour.config.json declares it. */
export const themeBrand: Brand = { colours: config.brand.colours, accent: config.brand.accent ?? 1 };

function stored(): Brand | null {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Brand) : null;
    return parsed && generate({ ...config, brand: { colours: parsed.colours, accent: parsed.accent } }).errors.length === 0 ? parsed : null;
  } catch {
    return null;
  }
}

/** A name for a colour picked by hand: its nearest hue's name, or Grey when it has almost none. */
export function nameFor(hex: string) {
  const [, c, h] = hexToOklch(hex);
  const n = c < 0.04 ? 'grey' : nearestHueName(h);
  return n.charAt(0).toUpperCase() + n.slice(1);
}

interface Failure {
  fg: string;
  bg: string;
  context: string;
  ratio: number;
  min: number;
}
export interface BrandState {
  brand: Brand;
  /** True while the brand differs from colour.config.json. */
  draft: boolean;
  /** The last change that can be undone, with what to say about it. */
  /** `scope` says where Undo shows: beside the colours, or beside the map for a map edit. */
  undo: { message: string; previous: Brand; scope?: 'map' } | null;
  /** Generator errors: the draft isn't applied while there are any. */
  errors: string[];
  /** Contrast of every pair the brand affects, in light and dark at standard and more contrast. */
  checked: number;
  failures: Failure[];
  /** Each defined slot's ramp, step → hex. */
  ramps: Partial<Record<Slot, Record<string, string>>>;
  /** color.brand.<slot> → the ramp step it reads; on-colour → base step. */
  roles: Record<string, string>;
  /** The resolved brand map; null while the colours can't be generated. */
  map: MapState | null;
}

const contexts = [
  ['light', 'standard'],
  ['light', 'more'],
  ['dark', 'standard'],
  ['dark', 'more'],
] as const;

type Tree = { p: Record<string, Record<string, { $value: unknown }>>; color: { brand: Record<string, { $value: unknown }> } };
const aliasOf = (v: unknown) => (typeof v === 'string' && /^\{.+\}$/.test(v) ? v.slice(1, -1) : null);
const hexOf = (v: unknown) => (v && typeof v === 'object' && 'hex' in v ? String((v as { hex: string }).hex) : '');

/** Generates a brand over the theme and measures it, without applying it. */
function evaluate(brand: Brand, undo: BrandState['undo']): BrandState & { vars: Record<string, string>; sheet: string } {
  const { tree, pairs, errors } = generate({ ...config, brand: { colours: brand.colours, accent: brand.accent } }) as { tree: Tree | null; pairs: { fg: string; bg: string; min: number }[]; errors: string[] };
  const base = { brand, draft: !same(brand, themeBrand), undo, errors, checked: 0, failures: [], ramps: {}, roles: {}, map: null, vars: {}, sheet: '' };
  if (!tree) return base;
  const vars: Record<string, string> = {};
  const lookup = new Map<string, string>();
  const ramps: BrandState['ramps'] = {};
  const groups = Object.keys(tree.p).filter((g) => /^brand-\d$/.test(g) || g === 'accent');
  for (const g of groups)
    for (const [step, t] of Object.entries(tree.p[g])) {
      if (step.startsWith('$')) continue;
      const a = aliasOf(t.$value);
      vars[`--p-${g}-${step}`] = a ? `var(--${a.replace(/\./g, '-')})` : hexOf(t.$value);
      lookup.set(`p.${g}.${step}`, a ?? hexOf(t.$value));
      if (!a) (ramps[g.slice(6) as Slot] ??= {})[step] = hexOf(t.$value);
    }
  vars['--p-alpha-accent-14'] = hexOf(tree.p.alpha['accent-14'].$value);
  const roles: Record<string, string> = {};
  for (const [k, t] of Object.entries(tree.color.brand)) {
    if (k.startsWith('$')) continue;
    const a = aliasOf(t.$value) ?? '';
    vars[`--color-brand-${k}`] = `var(--${a.replace(/\./g, '-')})`;
    roles[`color.brand.${k}`] = a;
  }
  const hex = (path: string): string => {
    let p = path;
    for (let i = 0; i < 4 && lookup.has(p) && !lookup.get(p)!.startsWith('#'); i++) p = lookup.get(p)!;
    return lookup.get(p) ?? resolveLiteral(p);
  };
  const ink = (path: string, scheme: 'light' | 'dark', level: 'standard' | 'more') => {
    if (roles[path]) return hex(roles[path]);
    const css = primitiveIn(path, scheme, level);
    return css.startsWith('--') ? hex(css.slice(2).replace(/^p-([a-z]+(?:-\d)?)-(\d+)$/, 'p.$1.$2')) : css;
  };
  const touches = (path: string) => contexts.some(([s, l]) => /^--p-(accent|brand)/.test(primitiveIn(path, s, l)));
  const affected = [...contrastPairs.filter((p) => touches(p.fg) || touches(p.bg)), ...pairs];
  const failures: Failure[] = [];
  let checked = 0;
  for (const [scheme, level] of contexts)
    for (const pair of affected) {
      const fg = ink(pair.fg, scheme, level).slice(0, 7);
      const bg = ink(pair.bg, scheme, level).slice(0, 7);
      if (!fg.startsWith('#') || !bg.startsWith('#')) continue;
      const ratio = contrast(fg, bg);
      checked++;
      if (ratio < pair.min) failures.push({ ...pair, context: `${scheme}, ${level} contrast`, ratio });
    }
  const defined = slots.filter((s) => brand.colours[s]);
  const seeds = Object.fromEntries(defined.map((s) => [s, (roles[`color.brand.${s}`] ?? '').split('.').pop() ?? '500'])) as Partial<Record<Slot, string>>;
  const names = Object.fromEntries(defined.map((s) => [s, `${s} ${slotName(s, brand.colours[s])}`]));
  const map = resolveMap(brand.map, { ramps, seeds }, defined, names, brand.standardContrast === 'accessible');
  return { ...base, checked, failures, ramps, roles, map, vars, sheet: mapSheet(map.vars, map.varsMore) };
}

/**
 * The map's vars as a stylesheet, so more contrast (body[data-contrast], or the system setting) takes the accessible
 * steps and standard takes the brand-first ones, in any subtree that sets its own contrast.
 */
function mapSheet(standard: Record<string, string>, more: Record<string, string>) {
  const decl = (v: Record<string, string>) => Object.entries(v).map(([k, x]) => `${k}: ${x};`).join(' ');
  return [
    `:root:root { ${decl(standard)} }`,
    `@media (prefers-contrast: more) { :root:root:not([data-contrast='standard']) { ${decl(more)} } }`,
    `[data-contrast='more'] { ${decl(more)} }`,
    `[data-contrast='standard'] { ${decl(standard)} }`,
  ].join('\n');
}

let applied: string[] = [];
function apply(vars: Record<string, string>, draft: boolean, sheet: string) {
  const root = document.documentElement.style;
  for (const name of applied) root.removeProperty(name);
  applied = [];
  let el = document.getElementById('brand-map-sheet');
  if (!el) {
    el = document.createElement('style');
    el.id = 'brand-map-sheet';
    document.head.append(el);
  }
  // The map applies only to a brand being tried (Q142): the theme's own colours stay as the build generated them, so
  // trying the map never restyles the library or a template that nobody re-branded.
  el.textContent = draft ? sheet : '';
  if (!draft) return;
  for (const [name, value] of Object.entries(vars)) root.setProperty(name, value);
  applied = Object.keys(vars);
}

let state: BrandState;
const listeners = new Set<() => void>();
function commit(brand: Brand, undo: BrandState['undo']) {
  let next = evaluate(brand, undo);
  // The accent (p.accent: links, focus and the other roles the map doesn't own) is the column holding Action fill, or
  // the lead colour when actions are Neutral.
  const action = next.map?.actionColumn;
  const want = action && action !== 'neutral' ? Number(action) : next.map ? Number(next.map.carriers[0] ?? slots.find((s) => brand.colours[s])) : brand.accent;
  if (want !== brand.accent) {
    brand = { ...brand, accent: want };
    next = evaluate(brand, undo);
  }
  if (next.errors.length === 0) {
    apply(next.vars, next.draft, next.sheet);
    try {
      if (next.draft) localStorage.setItem(KEY, JSON.stringify(brand));
      else localStorage.removeItem(KEY);
    } catch {
      // Storage unavailable: the draft still applies for this visit.
    }
  }
  const { vars: _vars, sheet: _sheet, ...rest } = next;
  void _vars;
  void _sheet;
  state = rest;
  listeners.forEach((l) => l());
}
commit(stored() ?? themeBrand, null);
// Another tab, window or preview frame changed the brand: follow it (Q70).
watchStored(KEY, () => commit(stored() ?? themeBrand, null));
export const getBrand = () => state.brand;
export const subscribeBrand = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Replaces the brand. `message` makes the change undoable and says what happened; `scope` places its Undo. */
export function setBrand(brand: Brand, message?: string, scope?: 'map') {
  commit(brand, message ? { message, previous: state.brand, ...(scope ? { scope } : {}) } : null);
}
export const undoBrand = () => state.undo && commit(state.undo.previous, null);
export const discardDraft = () => setBrand(themeBrand, 'Draft discarded; showing the theme’s colours.');

/** Sets one slot's colour from the picker: a hand-picked colour drops the slot's pinned steps and takes its hue's name. */
export function pickColour(slot: Slot, hex: string) {
  const added = !state.brand.colours[slot] && state.brand.map?.parts;
  setBrand({ ...state.brand, colours: { ...state.brand.colours, [slot]: { name: nameFor(hex), seed: hex } } }, added ? `Colour ${slot} added. It's identity only until you move parts to it.` : undefined);
}

/** Clears a slot; when it was the accent, the accent moves to the lowest defined slot, and the message says so. */
export function clearColour(slot: Slot) {
  const colours = { ...state.brand.colours };
  delete colours[slot];
  const left = slots.filter((s) => colours[s]);
  const moved = state.brand.accent === Number(slot);
  const accent = moved ? Number(left[0]) : state.brand.accent;
  let map = state.brand.map;
  let note = moved ? ` The accent moved to colour ${left[0]}.` : '';
  if (map?.parts && state.map) {
    const ids = Object.entries(state.map.assignment).filter(([, c]) => c === slot).map(([id]) => id);
    const to: Column = state.map.actionColumn !== slot ? state.map.actionColumn : left[0];
    map = moved_(ids, to);
    if (ids.length) note = ` Its ${ids.length} parts moved to ${to === 'neutral' ? 'Neutral' : `colour ${to}`}.`;
  }
  setBrand({ colours, accent, ...(map ? { map } : {}), ...(state.brand.standardContrast ? { standardContrast: state.brand.standardContrast } : {}) }, `Colour ${slot} cleared.${note}`);
}

const moved_ = (ids: string[], to: Column): BrandMap => (state.map ? moved(state.map, ids, to) : {});
const colName = (c: Column) => (c === 'neutral' ? 'Neutral' : `${c} ${nameOf(state.brand, c)}`);

/** Moves parts to a column; the map becomes Custom, and the move can be undone. */
export function moveParts(ids: string[], to: Column, what: string) {
  setBrand({ ...state.brand, map: moved_(ids, to) }, `Moved ${what} to ${colName(to)}.`, 'map');
}
export const movePart = (id: string, to: Column) => moveParts([id], to, partName(id));
/** Moves a group's parts that sit in one column (a split group moves only those). */
export function moveGroup(group: GroupId, from: Column, to: Column, name: string) {
  moveParts(groupParts(group).filter((id) => state.map?.assignment[id] === from), to, name);
}
export const gatherGroup = (group: GroupId, to: Column, name: string) => moveParts(groupParts(group), to, name);
/** "Use for actions": Primary elements and Primary accents to this colour (F7d's "mark a colour as the accent"). */
export const useForActions = (slot: Slot) => moveParts([...groupParts('primary-elements'), ...groupParts('primary-accents')], slot, 'Primary elements and Primary accents');
export function setMapPreset(id: PresetId) {
  const p = mapPresets.find((x) => x.id === id);
  setBrand({ ...state.brand, map: { preset: id } }, `${p?.name ?? id} arrangement applied.`, 'map');
}
/** Standard contrast: brand first (default) or the accessible steps (Q134). */
export function setAccessibleStandard(on: boolean) {
  const { standardContrast: _c, ...rest } = state.brand;
  void _c;
  setBrand(on ? { ...rest, standardContrast: 'accessible' } : rest, on ? 'Standard contrast uses the accessible steps.' : 'Standard contrast shows the brand colours as they are.', 'map');
}
export function resetMap() {
  const { map: _m, ...rest } = state.brand;
  void _m;
  setBrand(rest, 'Map reset to the starting arrangement.', 'map');
}
export { brandExamples };
/** Applies a colour preset or a brand example (Q135); an example brings its map. */
export function applyPreset(id: string) {
  const preset = presets.find((p) => p.id === id) ?? brandExamples.find((p) => p.id === id);
  if (preset) setBrand(preset.brand, `${preset.name} applied.`);
}

/** The display name of a slot in a brand. */
export const nameOf = (brand: Brand, slot: Slot) => slotName(slot, brand.colours[slot]);

/** The brand block to paste into colour.config.json. */
export const configText = (brand: Brand) => `"brand": ${JSON.stringify({ colours: brand.colours, accent: brand.accent, ...(brand.map ? { map: brand.map } : {}), ...(brand.standardContrast ? { standardContrast: brand.standardContrast } : {}) }, null, 2).replace(/\n/g, '\n  ')}`;

export const useBrand = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
