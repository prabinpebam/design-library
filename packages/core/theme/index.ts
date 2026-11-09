/**
 * Theming from a consuming project (Q81, handoff readiness C1/C3): brand colours and fonts set from code, with no
 * token build. Each helper writes only the public custom properties the token build itself writes (the brand and
 * accent primitives and `--color-brand-*` roles; the font-role variables and their axes), so every component follows
 * in every context. A theme change that needs more (new space or shape scales, new semantic roles) is a library
 * change, made in the library repository with `npm run tokens`.
 *
 *   import { applyBrand, applyFonts } from '@design-library/core/theme';
 *   applyBrand({ colours: { 1: { name: 'Harbour', seed: '#1f6f8b' } }, accent: 1 });
 *   applyBrand({ colours: { 1: { seed: '#1f6f8b' } }, base: { temperature: 'warm', pins: { 25: '#f7f4ef', 900: '#1b1916', 950: '#121110' } } }); // a paper canvas
 *   void applyFonts({ preset: 'editorial' });
 *
 * A bright brand: `contrast: 'guard'` (IP21, opt-in) moves links, the focus ring and the label on the accent fill to
 * the nearest passing step; `brandVars(brand).warnings` and `brandContrast(brand)` name each pair either way.
 *
 * Or, for a stylesheet with no script: `brandCss(brand)` returns the same declarations as CSS text.
 *
 * Theme settings (ID4): `applySettings` / `settingsCss` set the component tokens on the published allow-list
 * (`tokens/settings.json`, e.g. SiteLayout's frame) and refuse every other name.
 */
import { BRAND_SLOTS, HUE_STEPS, contrast, generate } from '../colour/index.mjs';
import colourConfig from '../tokens/colour.config.json';
import settingsList from '../tokens/settings.json';
import { fontPresets, fontRoles, loadFace, resolveRoles, type FontFace, type FontRoleId } from '../fonts/loader';

export type BrandSlot = (typeof BRAND_SLOTS)[number];
export interface BrandColour {
  /** What people call it; defaults to "Brand colour N". */
  name?: string;
  /** The colour the ramp is built around, `#rrggbb`. */
  seed: string;
  /** Exact hex for chosen ramp steps, e.g. `{ "500": "#1f6f8b" }`. */
  pins?: Record<string, string>;
}
/** The base colours: black, white and the greys between, for text, surfaces and outlines (IP6). */
export interface BaseColours {
  /** `neutral`, `warm` (a paper canvas) or `cool` greys; the theme's when left out. */
  temperature?: 'neutral' | 'warm' | 'cool';
  /** A faint tint toward a colour (`colour`, `#rrggbb`) or a brand slot (`from`, 1–4 or `accent`), strength 0–0.04. */
  tint?: { colour?: string; from?: number | 'accent'; strength?: number };
  /** Exact hex for chosen steps ("0" the lightest, "25" the page canvas, "950" the darkest ink), e.g. `{ "25": "#f7f4ef" }`. Pin the dark end (900, 950) too when you pin a tinted light end, so the dark scheme stays near black. */
  pins?: Record<string, string>;
}
export interface Brand {
  /** Up to four brand colours, by slot "1"–"4". */
  colours: Partial<Record<BrandSlot, BrandColour>>;
  /** The slot the accent (links, focus, primary buttons, selection) is built from; 1 when left out. */
  accent?: number;
  /** The base colours (canvas, text, greys) when the brand needs its own, e.g. a warm paper; the theme's when left out. */
  base?: BaseColours;
  /**
   * The contrast guard (IP21, opt-in). `'keep'` (default) writes the steps the theme names, whatever they measure;
   * `'guard'` measures links (4.5:1 on the page and raised surfaces), text on the accent fill (4.5:1, for the fill and
   * its hover and pressed steps) and the focus ring (3:1 on the page) in light and dark, and moves each failing one to
   * the nearest passing step: links and the ring away from the surface, the ink to the base end that reads best, then
   * the fill away from the ink. `brandVars` and `brandContrast` name each pair either way.
   */
  contrast?: 'keep' | 'guard';
}

/** One measured pair of a brand (IP21): which role, in which scheme, against what, and whether it passes. */
export interface BrandPair {
  scheme: 'light' | 'dark';
  /** `link`, `link on raised`, `on accent`, `on accent hover`, `on accent pressed` or `focus`. */
  pair: string;
  /** The ramp step or base step each side reads, e.g. `accent 600` on `base 25`. */
  fg: string;
  bg: string;
  fgHex: string;
  bgHex: string;
  ratio: number;
  needs: number;
  pass: boolean;
}

type Tree = { p: Record<string, Record<string, { $value: unknown }>>; color: { brand: Record<string, { $value: unknown }> } };
const aliasOf = (v: unknown) => (typeof v === 'string' && /^\{.+\}$/.test(v) ? v.slice(1, -1) : null);
const hexOf = (v: unknown) => (v && typeof v === 'object' && 'hex' in v ? String((v as { hex: string }).hex) : '');
const cssVar = (path: string) => `var(--${path.replace(/\./g, '-')})`;

/** The custom properties a brand sets, the generator's errors (nothing to set while there are any) and the contrast warnings (IP21). */
export function brandVars(brand: Brand): { vars: Record<string, string>; errors: string[]; warnings: string[] } {
  const config = colourConfig as unknown as Record<string, unknown>;
  const { base, contrast: guardMode, ...rest } = brand;
  const { tree, errors } = generate({ ...config, ...(base ? { base } : {}), brand: { accent: 1, ...rest } }) as { tree: Tree | null; errors: string[] };
  if (!tree || errors.length) return { vars: {}, errors: errors.length ? errors : ['The colour generator returned nothing.'], warnings: [] };
  const vars: Record<string, string> = {};
  for (const g of Object.keys(tree.p).filter((k) => /^brand-\d$/.test(k) || k === 'accent'))
    for (const [step, t] of Object.entries(tree.p[g])) {
      if (step.startsWith('$')) continue;
      const a = aliasOf(t.$value);
      vars[`--p-${g}-${step}`] = a ? cssVar(a) : hexOf(t.$value);
    }
  vars['--p-alpha-accent-14'] = hexOf(tree.p.alpha['accent-14'].$value);
  // A brand's own base (IP6) writes the base ramp and the layers made from its ink; without one, the theme's stay.
  if (base) {
    for (const [step, t] of Object.entries(tree.p.base)) if (!step.startsWith('$')) vars[`--p-base-${step}`] = hexOf(t.$value);
    for (const [k, t] of Object.entries(tree.p.alpha)) if (k.startsWith('base-')) vars[`--p-alpha-${k}`] = hexOf(t.$value);
  }
  for (const [k, t] of Object.entries(tree.color.brand)) if (!k.startsWith('$')) vars[`--color-brand-${k}`] = cssVar(aliasOf(t.$value) ?? '');
  const guarded = guardContrast(tree, String(brand.accent ?? 1), guardMode === 'guard');
  Object.assign(vars, guarded.vars);
  return { vars, errors: [], warnings: guarded.warnings };
}

/** A brand's measured pairs in light and dark (IP21): links, text on the accent fill and its states, the focus ring. */
export function brandContrast(brand: Brand): BrandPair[] {
  const config = colourConfig as unknown as Record<string, unknown>;
  const { base, contrast: guardMode, ...rest } = brand;
  const { tree, errors } = generate({ ...config, ...(base ? { base } : {}), brand: { accent: 1, ...rest } }) as { tree: Tree | null; errors: string[] };
  if (!tree || errors.length) return [];
  return guardContrast(tree, String(brand.accent ?? 1), guardMode === 'guard').pairs;
}

// The steps each scheme's accent roles read (tokens.light.json, tokens.dark.json) and the surfaces they sit on. `away` is
// the direction along HUE_STEPS (+1 darker, -1 lighter) that moves a colour away from the scheme's surfaces.
const SCHEMES = {
  light: { link: '600', focus: '500', fill: '500', ink: '0', away: 1, surfaces: ['25', '0'] },
  dark: { link: '300', focus: '300', fill: '400', ink: '950', away: -1, surfaces: ['900', '850'] },
} as const;
const fmt = (n: number) => `${Math.floor(n * 10) / 10}:1`;

function guardContrast(tree: Tree, accent: string, guard: boolean): { vars: Record<string, string>; warnings: string[]; pairs: BrandPair[] } {
  const ramp = tree.p[`brand-${accent}`];
  const acc = (s: string) => hexOf(ramp[s]?.$value);
  const baseHex = (s: string) => hexOf(tree.p.base[s]?.$value);
  const at = (s: string, by: number) => HUE_STEPS[Math.min(HUE_STEPS.length - 1, Math.max(0, HUE_STEPS.indexOf(s) + by))];
  const pairs: BrandPair[] = [];
  const warnings: string[] = [];
  const chosen: Record<string, { light: string; dark: string }> = {};
  const note = (scheme: string, what: string, from: string, ratio: number, needs: number, to?: string, toRatio?: number) =>
    warnings.push(
      `${scheme}: ${what} (${from}) is ${fmt(ratio)}, needs ${needs}:1; ` +
        (to ? `moved to ${to} (${fmt(toRatio ?? 0)})` : guard ? 'no step passes' : "set contrast: 'guard' to move it"),
    );
  // Walks from a step away from the surfaces until every surface passes; returns the first passing step, or null.
  const walk = (start: string, by: number, ok: (hex: string) => boolean) => {
    for (let s = start; ; s = at(s, by)) {
      if (ok(acc(s))) return s;
      if (at(s, by) === s) return null;
    }
  };
  for (const scheme of ['light', 'dark'] as const) {
    const k = SCHEMES[scheme];
    const surf = k.surfaces.map(baseHex);
    const worst = (hex: string) => Math.min(...surf.map((b) => contrast(hex, b)));
    // Links: 4.5:1 on the page and the raised surface.
    let link: string = k.link;
    if (worst(acc(link)) < 4.5) {
      const to = guard ? walk(link, k.away, (h) => worst(h) >= 4.5) : null;
      note(scheme, 'link', `accent ${link}`, worst(acc(link)), 4.5, to ? `accent ${to}` : undefined, to ? worst(acc(to)) : undefined);
      if (to) link = to;
    }
    // The focus ring: 3:1 on the page.
    let focus: string = k.focus;
    const onPage = (hex: string) => contrast(hex, surf[0]);
    if (onPage(acc(focus)) < 3) {
      const to = guard ? walk(focus, k.away, (h) => onPage(h) >= 3) : null;
      note(scheme, 'focus ring', `accent ${focus}`, onPage(acc(focus)), 3, to ? `accent ${to}` : undefined, to ? onPage(acc(to)) : undefined);
      if (to) focus = to;
    }
    // Text on the accent fill: the ink that reads best, then the fill away from the ink; hover and pressed step further away.
    let ink: string = k.ink;
    let fill: string = k.fill;
    const inkFor = (i: string) => (i === '0' ? 1 : -1) as 1 | -1; // a light ink wants darker fills (+1)
    if (contrast(baseHex(ink), acc(fill)) < 4.5) {
      const before = contrast(baseHex(ink), acc(fill));
      if (guard) {
        const other = ink === '0' ? '950' : '0';
        if (contrast(baseHex(other), acc(fill)) > before) ink = other;
        const to = walk(fill, inkFor(ink), (h) => contrast(baseHex(ink), h) >= 4.5);
        if (to) fill = to;
        const after = contrast(baseHex(ink), acc(fill));
        note(scheme, 'text on accent', `base ${k.ink} on accent ${k.fill}`, before, 4.5, after >= 4.5 ? `base ${ink} on accent ${fill}` : undefined, after);
      } else note(scheme, 'text on accent', `base ${ink} on accent ${fill}`, before, 4.5);
    }
    const hover = guard ? at(fill, inkFor(ink)) : scheme === 'light' ? '600' : '300';
    const pressed = guard ? at(fill, 2 * inkFor(ink)) : scheme === 'light' ? '700' : '200';
    const record = (pair: string, fg: string, fgHex: string, bg: string, bgHex: string, needs: number) => {
      const ratio = contrast(fgHex, bgHex);
      pairs.push({ scheme, pair, fg, bg, fgHex, bgHex, ratio: Math.round(ratio * 100) / 100, needs, pass: ratio >= needs });
    };
    record('link', `accent ${link}`, acc(link), `base ${k.surfaces[0]}`, surf[0], 4.5);
    record('link on raised', `accent ${link}`, acc(link), `base ${k.surfaces[1]}`, surf[1], 4.5);
    record('on accent', `base ${ink}`, baseHex(ink), `accent ${fill}`, acc(fill), 4.5);
    record('on accent hover', `base ${ink}`, baseHex(ink), `accent ${hover}`, acc(hover), 4.5);
    record('on accent pressed', `base ${ink}`, baseHex(ink), `accent ${pressed}`, acc(pressed), 4.5);
    record('focus', `accent ${focus}`, acc(focus), `base ${k.surfaces[0]}`, surf[0], 3);
    if (guard) {
      for (const [role, v] of Object.entries({ link, focus, fill, ink, hover, pressed })) (chosen[role] ??= { light: '', dark: '' })[scheme] = v;
    }
  }
  const vars: Record<string, string> = {};
  if (guard) {
    const both = (r: string, ramp: 'accent' | 'base') => `light-dark(var(--p-${ramp}-${chosen[r].light}), var(--p-${ramp}-${chosen[r].dark}))`;
    const defaults = { link: ['600', '300'], focus: ['500', '300'], fill: ['500', '400'], ink: ['0', '950'], hover: ['600', '300'], pressed: ['700', '200'] };
    const moved = (r: keyof typeof defaults) => chosen[r].light !== defaults[r][0] || chosen[r].dark !== defaults[r][1];
    if (moved('link')) vars['--color-text-link'] = both('link', 'accent');
    if (moved('focus')) vars['--color-focus'] = both('focus', 'accent');
    if (moved('fill')) vars['--color-accent'] = both('fill', 'accent');
    if (moved('ink')) vars['--color-text-on-accent'] = both('ink', 'base');
    if (moved('hover')) vars['--color-accent-hover'] = both('hover', 'accent');
    if (moved('pressed')) vars['--color-accent-pressed'] = both('pressed', 'accent');
  }
  return { vars, warnings, pairs };
}

/** A brand as CSS text, for a stylesheet loaded after `css/index.css`. Throws with the generator's errors. */
export function brandCss(brand: Brand, selector = ':root'): string {
  const { vars, errors } = brandVars(brand);
  if (errors.length) throw new Error(`brandCss: ${errors.join('; ')}`);
  return `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`;
}

const appliedBrand = new WeakMap<HTMLElement, string[]>();
/** Sets a brand on an element (the document by default); `null` returns to the theme's. Returns the errors, if any. */
export function applyBrand(brand: Brand | null, target: HTMLElement = document.documentElement): string[] {
  for (const name of appliedBrand.get(target) ?? []) target.style.removeProperty(name);
  appliedBrand.delete(target);
  if (!brand) return [];
  const { vars, errors } = brandVars(brand);
  if (errors.length) return errors;
  for (const [k, v] of Object.entries(vars)) target.style.setProperty(k, v);
  appliedBrand.set(target, Object.keys(vars));
  return [];
}

/**
 * Theme settings (ID4, IP4): the component tokens a project may set, from the published allow-list
 * (`tokens/settings.json`, per component). Every other `--c-*` token stays private.
 *
 *   applySettings({ '--c-site-layout-gap': 'var(--space-stack-section)', '--c-site-layout-padding-start': '0px' });
 */
export const themeSettings = Object.fromEntries(Object.entries(settingsList).filter(([k]) => !k.startsWith('$'))) as Record<string, Record<string, string>>;
const allowed = new Set(Object.values(themeSettings).flatMap((s) => Object.keys(s)));

/** The names in a set of settings that aren't on the allow-list, each with what to do instead. */
export function settingsErrors(settings: Record<string, string>): string[] {
  return Object.keys(settings)
    .filter((name) => !allowed.has(name))
    .map((name) => `"${name}" isn't a theme setting; use one of ${[...allowed].join(', ')}, or a prop, slot or your template's own tokens`);
}

/** Settings as CSS text, for a stylesheet loaded after `css/index.css`. Throws on a name off the allow-list. */
export function settingsCss(settings: Record<string, string>, selector = ':root'): string {
  const errors = settingsErrors(settings);
  if (errors.length) throw new Error(`settingsCss: ${errors.join('; ')}`);
  return `${selector} {\n${Object.entries(settings)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`;
}

const appliedSettings = new WeakMap<HTMLElement, string[]>();
/** Sets theme settings on an element (the document by default); `null` returns to the defaults. Returns the errors; nothing is set while there are any. */
export function applySettings(settings: Record<string, string> | null, target: HTMLElement = document.documentElement): string[] {
  for (const name of appliedSettings.get(target) ?? []) target.style.removeProperty(name);
  appliedSettings.delete(target);
  if (!settings) return [];
  const errors = settingsErrors(settings);
  if (errors.length) return errors;
  for (const [k, v] of Object.entries(settings)) target.style.setProperty(k, v);
  appliedSettings.set(target, Object.keys(settings));
  return [];
}

const FALLBACK: Record<FontFace['classification'], string> = {
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, 'Cascadia Code', Consolas, monospace",
};
export interface FontChoice {
  /** A font preset id from `fontPresets` (`@design-library/core/fonts`); the theme's default when left out. */
  preset?: string;
  /** Face id per role (`display`, `text`, `ui`, `code`) over the preset's; `null` lets a role use the one it collapses to. */
  roles?: Partial<Record<FontRoleId, string | null>>;
  /** Variable-font axes per role, e.g. `{ display: { opsz: 72 } }`. */
  axes?: Partial<Record<FontRoleId, Record<string, number>>>;
}

/** The font-role custom properties for a choice, and the faces it needs. Throws on an unknown preset or face. */
export function fontVars(choice: FontChoice = {}): { vars: Record<string, string>; faces: string[] } {
  const preset = choice.preset ? fontPresets.find((p) => p.id === choice.preset) : (fontPresets.find((p) => p.default) ?? fontPresets[0]);
  if (!preset) throw new Error(`fontVars: no font preset "${choice.preset}"; use one of ${fontPresets.map((p) => p.id).join(', ')}`);
  const roles = { ...preset.roles, ...(choice.roles ?? {}) } as Record<FontRoleId, string | null>;
  const axes = { ...(preset.axes ?? {}), ...(choice.axes ?? {}) } as Partial<Record<FontRoleId, Record<string, number>>>;
  const faces = resolveRoles(roles);
  for (const [role, id] of Object.entries(roles)) if (id && !faces[role as FontRoleId]) throw new Error(`fontVars: no font face "${id}" for ${role}`);
  const source = (role: FontRoleId): FontRoleId => {
    if (role === 'code' || roles[role]) return role;
    const above = fontRoles.find((r) => r.id === role)?.collapsesTo;
    return above ? source(above) : role;
  };
  const settings = (a: Record<string, number> | undefined) => (a && Object.keys(a).length ? Object.entries(a).map(([tag, v]) => `'${tag}' ${v}`).join(', ') : 'normal');
  const vars: Record<string, string> = {};
  for (const role of fontRoles) {
    const face = faces[role.id];
    vars[role.variable] = face ? `'${face.family}', ${FALLBACK[face.classification]}` : FALLBACK.mono;
    vars[`--axes-${role.id}`] = settings(axes[source(role.id)]);
  }
  return { vars, faces: [...new Set(Object.values(faces).flatMap((f) => (f ? [f.id] : [])))] };
}

/** Loads a choice's faces (from the installed `@fontsource-variable` packages) and sets its roles on an element. */
export function applyFonts(choice: FontChoice = {}, target: HTMLElement = document.documentElement): Promise<void> {
  const { vars, faces } = fontVars(choice);
  for (const [k, v] of Object.entries(vars)) target.style.setProperty(k, v);
  return Promise.all(faces.map((id) => loadFace(id))).then(() => undefined);
}
