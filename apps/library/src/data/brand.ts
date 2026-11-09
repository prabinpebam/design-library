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
    return parsed && generate({ ...config, brand: parsed }).errors.length === 0 ? parsed : null;
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
  undo: { message: string; previous: Brand } | null;
  /** Generator errors: the draft isn't applied while there are any. */
  errors: string[];
  /** Contrast of every pair the brand affects, in light and dark at standard and more contrast. */
  checked: number;
  failures: Failure[];
  /** Each defined slot's ramp, step → hex. */
  ramps: Partial<Record<Slot, Record<string, string>>>;
  /** color.brand.<slot> → the ramp step it reads; on-colour → base step. */
  roles: Record<string, string>;
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
function evaluate(brand: Brand, undo: BrandState['undo']): BrandState & { vars: Record<string, string> } {
  const { tree, pairs, errors } = generate({ ...config, brand }) as { tree: Tree | null; pairs: { fg: string; bg: string; min: number }[]; errors: string[] };
  const base = { brand, draft: !same(brand, themeBrand), undo, errors, checked: 0, failures: [], ramps: {}, roles: {}, vars: {} };
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
  return { ...base, checked, failures, ramps, roles, vars };
}

let applied: string[] = [];
function apply(vars: Record<string, string>, draft: boolean) {
  const root = document.documentElement.style;
  for (const name of applied) root.removeProperty(name);
  applied = [];
  if (!draft) return;
  for (const [name, value] of Object.entries(vars)) root.setProperty(name, value);
  applied = Object.keys(vars);
}

let state: BrandState;
const listeners = new Set<() => void>();
function commit(brand: Brand, undo: BrandState['undo']) {
  const next = evaluate(brand, undo);
  if (next.errors.length === 0) {
    apply(next.vars, next.draft);
    try {
      if (next.draft) localStorage.setItem(KEY, JSON.stringify(brand));
      else localStorage.removeItem(KEY);
    } catch {
      // Storage unavailable: the draft still applies for this visit.
    }
  }
  const { vars: _vars, ...rest } = next;
  void _vars;
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

/** Replaces the brand. `message` makes the change undoable and says what happened. */
export function setBrand(brand: Brand, message?: string) {
  commit(brand, message ? { message, previous: state.brand } : null);
}
export const undoBrand = () => state.undo && commit(state.undo.previous, null);
export const discardDraft = () => setBrand(themeBrand, 'Draft discarded; showing the theme’s colours.');

/** Sets one slot's colour from the picker: a hand-picked colour drops the slot's pinned steps and takes its hue's name. */
export function pickColour(slot: Slot, hex: string) {
  setBrand({ ...state.brand, colours: { ...state.brand.colours, [slot]: { name: nameFor(hex), seed: hex } } });
}

/** Clears a slot; when it was the accent, the accent moves to the lowest defined slot, and the message says so. */
export function clearColour(slot: Slot) {
  const colours = { ...state.brand.colours };
  delete colours[slot];
  const left = slots.filter((s) => colours[s]);
  const moved = state.brand.accent === Number(slot);
  const accent = moved ? Number(left[0]) : state.brand.accent;
  setBrand({ colours, accent }, `Colour ${slot} cleared.${moved ? ` The accent moved to colour ${left[0]}.` : ''}`);
}

export const setAccent = (slot: Slot) => setBrand({ ...state.brand, accent: Number(slot) });
export function applyPreset(id: string) {
  const preset = presets.find((p) => p.id === id);
  if (preset) setBrand(preset.brand, `${preset.name} applied.`);
}

/** The display name of a slot in a brand. */
export const nameOf = (brand: Brand, slot: Slot) => slotName(slot, brand.colours[slot]);

/** The brand block to paste into colour.config.json. */
export const configText = (brand: Brand) => `"brand": ${JSON.stringify({ colours: brand.colours, accent: brand.accent }, null, 2).replace(/\n/g, '\n  ')}`;

export const useBrand = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
