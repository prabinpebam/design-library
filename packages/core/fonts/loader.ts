/**
 * The one provider loader (AGENTS.md typography rule; owner Q35). Every face in the registry is self-hosted from its
 * `@fontsource-variable` package and loaded only when a role uses it; nothing is requested from another origin.
 * Core never needs it: the font role tokens fall back to system stacks until a face arrives (`font-display: swap`).
 */
import registry from './registry.json';

export type FontRoleId = 'display' | 'text' | 'ui' | 'code';

export interface FontAxis {
  tag: string;
  label: string;
  min: number;
  max: number;
  default: number;
  step: number;
}

export interface FontFace {
  id: string;
  name: string;
  family: string;
  classification: 'sans' | 'serif' | 'mono';
  suits: FontRoleId[];
  sample: string;
  description: string;
  designer: string;
  licence: string;
  package: string;
  axes: FontAxis[];
  italic: boolean;
}

export interface FontRole {
  id: FontRoleId;
  label: string;
  variable: string;
  function: string;
  collapsesTo: FontRoleId | null;
}

export interface FontPreset {
  id: string;
  name: string;
  for: string;
  roles: Record<FontRoleId, string | null>;
  axes?: Partial<Record<FontRoleId, Record<string, number>>>;
  default?: boolean;
  /** A heading in the preset list: absent for the library's own, 'Site looks' for a known site's look (Q137). */
  group?: string;
}

export const fontRoles = registry.roles as FontRole[];
export const fontFaces = registry.faces as FontFace[];
export const fontPresets = registry.presets as FontPreset[];
export const faceOf = (id: string | null | undefined) => fontFaces.find((f) => f.id === id);

/** An axis that only takes 0 or 1 (WONK, MONO): a Switch, not a slider. */
export const isBinaryAxis = (a: FontAxis) => a.min === 0 && a.max === 1 && a.step === 1;

// Static specifiers, so the bundler can split each face into its own files; the file carries every axis listed.
const sources: Record<string, () => Promise<unknown>[]> = {
  'bricolage-grotesque': () => [import('@fontsource-variable/bricolage-grotesque/standard.css')],
  fraunces: () => [import('@fontsource-variable/fraunces/full.css'), import('@fontsource-variable/fraunces/full-italic.css')],
  'space-grotesk': () => [import('@fontsource-variable/space-grotesk/wght.css')],
  inter: () => [import('@fontsource-variable/inter/opsz.css'), import('@fontsource-variable/inter/opsz-italic.css')],
  'source-serif-4': () => [import('@fontsource-variable/source-serif-4/opsz.css'), import('@fontsource-variable/source-serif-4/opsz-italic.css')],
  literata: () => [import('@fontsource-variable/literata/opsz.css'), import('@fontsource-variable/literata/opsz-italic.css')],
  figtree: () => [import('@fontsource-variable/figtree/wght.css'), import('@fontsource-variable/figtree/wght-italic.css')],
  'ibm-plex-sans': () => [import('@fontsource-variable/ibm-plex-sans/standard.css'), import('@fontsource-variable/ibm-plex-sans/standard-italic.css')],
  'nunito-sans': () => [import('@fontsource-variable/nunito-sans/full.css'), import('@fontsource-variable/nunito-sans/full-italic.css')],
  'roboto-flex': () => [import('@fontsource-variable/roboto-flex/full.css')],
  'jetbrains-mono': () => [import('@fontsource-variable/jetbrains-mono/wght.css'), import('@fontsource-variable/jetbrains-mono/wght-italic.css')],
  recursive: () => [import('@fontsource-variable/recursive/full.css')],
  'noto-sans': () => [import('@fontsource-variable/noto-sans/standard.css'), import('@fontsource-variable/noto-sans/standard-italic.css')],
  'open-sans': () => [import('@fontsource-variable/open-sans/standard.css'), import('@fontsource-variable/open-sans/standard-italic.css')],
  'dm-sans': () => [import('@fontsource-variable/dm-sans/opsz.css'), import('@fontsource-variable/dm-sans/opsz-italic.css')],
  'newsreader': () => [import('@fontsource-variable/newsreader/opsz.css'), import('@fontsource-variable/newsreader/opsz-italic.css')],
  'gelasio': () => [import('@fontsource-variable/gelasio/wght.css'), import('@fontsource-variable/gelasio/wght-italic.css')],
  'libre-franklin': () => [import('@fontsource-variable/libre-franklin/wght.css'), import('@fontsource-variable/libre-franklin/wght-italic.css')],
  'libertinus-serif': () => [import('@fontsource/libertinus-serif/400.css'), import('@fontsource/libertinus-serif/400-italic.css'), import('@fontsource/libertinus-serif/600.css'), import('@fontsource/libertinus-serif/700.css')],
  'arimo': () => [import('@fontsource-variable/arimo/wght.css'), import('@fontsource-variable/arimo/wght-italic.css')],
  'mona-sans': () => [import('@fontsource-variable/mona-sans/standard.css'), import('@fontsource-variable/mona-sans/standard-italic.css')],
  'roboto': () => [import('@fontsource-variable/roboto/standard.css'), import('@fontsource-variable/roboto/standard-italic.css')],
  'reddit-sans': () => [import('@fontsource-variable/reddit-sans/wght.css'), import('@fontsource-variable/reddit-sans/wght-italic.css')],
  'roboto-slab': () => [import('@fontsource-variable/roboto-slab/wght.css')],
  'merriweather': () => [import('@fontsource-variable/merriweather/standard.css'), import('@fontsource-variable/merriweather/standard-italic.css')],
  'bodoni-moda': () => [import('@fontsource-variable/bodoni-moda/opsz.css'), import('@fontsource-variable/bodoni-moda/opsz-italic.css')],
  'lora': () => [import('@fontsource-variable/lora/wght.css'), import('@fontsource-variable/lora/wght-italic.css')],
  'nunito': () => [import('@fontsource-variable/nunito/wght.css'), import('@fontsource-variable/nunito/wght-italic.css')],
  'fira-code': () => [import('@fontsource-variable/fira-code/wght.css')],
  // Lato has no variable build: its static weights (and italics) load together.
  lato: () => [
    import('@fontsource/lato/400.css'),
    import('@fontsource/lato/400-italic.css'),
    import('@fontsource/lato/700.css'),
    import('@fontsource/lato/700-italic.css'),
    import('@fontsource/lato/900.css'),
    import('@fontsource/lato/900-italic.css'),
  ],
};

const loading = new Map<string, Promise<void>>();

/** Loads a face's files once; resolves when its CSS is in the document (the font files then swap in as used). */
export function loadFace(id: string): Promise<void> {
  const known = loading.get(id);
  if (known) return known;
  const load = sources[id];
  const done = load ? Promise.all(load()).then(() => undefined) : Promise.resolve();
  loading.set(id, done);
  return done;
}

/**
 * The family each role resolves to under a choice of faces: an unset role collapses onto the one above it (ui → text →
 * display); code with no face stays on the system monospace.
 */
export function resolveRoles(roles: Record<FontRoleId, string | null>, extra: FontFace[] = []): Record<FontRoleId, FontFace | null> {
  const of = (id: string | null | undefined) => extra.find((f) => f.id === id) ?? faceOf(id);
  const display = of(roles.display) ?? null;
  const text = of(roles.text) ?? display;
  const ui = of(roles.ui) ?? text;
  const code = of(roles.code) ?? null;
  return { display, text, ui, code };
}
