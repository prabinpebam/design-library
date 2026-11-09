/**
 * Token presets (Q70): named, saved sets of token choices, one per token category (colour, type, icons, space, shape)
 * and global presets that combine one preset from each category. Presets are data; a category applies its value only
 * through the public token seams it already owns (custom properties on the document, the data-space and data-shape
 * attributes, the font loader, the Icon set), never by forking a component.
 *
 * The consumer registers each category with its built-in presets and how to read, set and watch its current value.
 * Built-in presets are read-only; a person's own presets are kept in this browser. Every value is persisted, and
 * {@link watchStored} re-applies a value another tab or window changed, in one frame, so one choice holds everywhere.
 */
import builtInFile from './presets.json';
import { suspendMotion } from '../react/behaviour/motion';

export interface CategoryPreset<V = unknown> {
  id: string;
  name: string;
  category: string;
  /** Who or what it suits, in a few words. */
  for?: string;
  value: V;
  /** Shipped with the library or the token source: read-only. */
  builtIn?: boolean;
  /** The category's own theme value: what the token source declares. */
  theme?: boolean;
}

export interface GlobalPreset {
  id: string;
  name: string;
  for?: string;
  builtIn?: boolean;
  /** Category id → that category's preset id; "theme" (or a missing category) means the category's theme preset. */
  presets: Record<string, string>;
}

export interface PresetCategory<V = unknown> {
  id: string;
  label: string;
  /** Built-in presets, the theme's first. */
  builtIns: CategoryPreset<V>[];
  get: () => V;
  set: (value: V) => void;
  subscribe: (listener: () => void) => () => void;
}

const USER_KEY = 'design-library.presets';
interface UserPresets {
  categories: CategoryPreset[];
  global: GlobalPreset[];
}

export const builtInGlobalPresets: GlobalPreset[] = (builtInFile as { global: GlobalPreset[] }).global.map((p) => ({ ...p, builtIn: true }));

const categories = new Map<string, PresetCategory>();
const listeners = new Set<() => void>();
let version = 0;
const bump = () => {
  version++;
  for (const l of listeners) l();
};

function readUser(): UserPresets {
  try {
    const v = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as UserPresets | null;
    if (v && Array.isArray(v.categories) && Array.isArray(v.global)) return v;
  } catch {
    // Unreadable: none saved.
  }
  return { categories: [], global: [] };
}
let user = readUser();
function writeUser(next: UserPresets) {
  user = next;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: kept for this visit.
  }
  bump();
}

/**
 * Re-applies a stored value when another tab or window (or a preview frame) changes it, with transitions suspended so
 * the page switches in one frame (Q65 M10). Writing the same value again raises no event, so tabs never ping-pong.
 */
export function watchStored(keys: string | string[], reread: () => void) {
  const watched = Array.isArray(keys) ? keys : [keys];
  const on = (event: StorageEvent) => {
    if (event.storageArea !== localStorage || (event.key !== null && !watched.includes(event.key))) return;
    suspendMotion(reread);
  };
  window.addEventListener('storage', on);
  return () => window.removeEventListener('storage', on);
}
watchStored(USER_KEY, () => {
  user = readUser();
  bump();
});

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function registerPresetCategory<V>(category: PresetCategory<V>) {
  categories.set(category.id, category as PresetCategory);
  category.subscribe(bump);
  bump();
}

export const presetCategories = () => [...categories.values()];
export const presetCategory = (id: string) => categories.get(id);

/** A category's presets: built-in first, then the person's own. */
export const categoryPresets = (id: string): CategoryPreset[] => [...(categories.get(id)?.builtIns ?? []), ...user.categories.filter((p) => p.category === id)];

const themeOf = (id: string) => categories.get(id)?.builtIns.find((p) => p.theme) ?? categories.get(id)?.builtIns[0];
const resolve = (category: string, presetId: string | undefined) =>
  !presetId || presetId === 'theme' ? themeOf(category) : categoryPresets(category).find((p) => p.id === presetId);

/** The preset the category's current value matches, if any (built-in first). Otherwise the value is a custom one. */
export function currentPreset(id: string): CategoryPreset | undefined {
  const c = categories.get(id);
  if (!c) return undefined;
  const value = c.get();
  return categoryPresets(id).find((p) => same(p.value, value));
}

export const globalPresets = (): GlobalPreset[] => [...builtInGlobalPresets, ...user.global];

/** The global preset every category currently matches, if any. */
export function currentGlobal(): GlobalPreset | undefined {
  return globalPresets().find((g) => presetCategories().every((c) => same(resolve(c.id, g.presets[c.id])?.value, c.get())));
}

export function applyCategoryPreset(category: string, presetId: string) {
  const c = categories.get(category);
  const p = resolve(category, presetId);
  if (c && p) suspendMotion(() => c.set(structuredClone(p.value)));
}

export function applyGlobalPreset(id: string) {
  const g = globalPresets().find((p) => p.id === id);
  if (!g) return;
  suspendMotion(() => {
    for (const c of presetCategories()) {
      const p = resolve(c.id, g.presets[c.id]);
      if (p) c.set(structuredClone(p.value));
    }
  });
}

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Saves the category's current value as a new preset of the person's own. */
export function saveCategoryPreset(category: string, name: string): CategoryPreset | undefined {
  const c = categories.get(category);
  if (!c) return undefined;
  const preset: CategoryPreset = { id: newId(`my-${category}`), name, category, value: structuredClone(c.get()) };
  writeUser({ ...user, categories: [...user.categories, preset] });
  return preset;
}

/**
 * Saves the current choice of every category as a global preset of the person's own. A category whose value matches
 * no preset gets one of its own first, with the same name, so the global preset always names presets.
 */
export function saveGlobalPreset(name: string): GlobalPreset {
  const made: CategoryPreset[] = [];
  const presets: Record<string, string> = {};
  for (const c of presetCategories()) {
    let p = currentPreset(c.id);
    if (!p) {
      p = { id: newId(`my-${c.id}`), name, category: c.id, value: structuredClone(c.get()) };
      made.push(p);
    }
    presets[c.id] = p.id;
  }
  const preset: GlobalPreset = { id: newId('my-global'), name, presets };
  writeUser({ categories: [...user.categories, ...made], global: [...user.global, preset] });
  return preset;
}

/** Renames one of the person's own presets; built-in presets are read-only. */
export function renamePreset(id: string, name: string) {
  writeUser({
    categories: user.categories.map((p) => (p.id === id ? { ...p, name } : p)),
    global: user.global.map((p) => (p.id === id ? { ...p, name } : p)),
  });
}

/**
 * Deletes one of the person's own presets and returns a function that puts it back exactly (same id, same place), for
 * an Undo. A global preset that named a deleted category preset falls back to the theme's.
 */
export function deletePreset(id: string): () => void {
  const before = user;
  writeUser({ categories: user.categories.filter((p) => p.id !== id), global: user.global.filter((p) => p.id !== id) });
  return () => {
    const restored = before.categories.find((p) => p.id === id);
    const restoredGlobal = before.global.find((p) => p.id === id);
    writeUser({
      categories: restored && !user.categories.some((p) => p.id === id) ? [...user.categories, restored] : user.categories,
      global: restoredGlobal && !user.global.some((p) => p.id === id) ? [...user.global, restoredGlobal] : user.global,
    });
  };
}

export const isUserPreset = (id: string) => user.categories.some((p) => p.id === id) || user.global.some((p) => p.id === id);

/** For useSyncExternalStore: changes whenever any category's value or the saved presets change. */
export function subscribePresets(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const presetsVersion = () => version;
