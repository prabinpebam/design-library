/**
 * Theming from a consuming project (Q81, handoff readiness C1/C3): brand colours and fonts set from code, with no
 * token build. Each helper writes only the public custom properties the token build itself writes (the brand and
 * accent primitives and `--color-brand-*` roles; the font-role variables and their axes), so every component follows
 * in every context. A theme change that needs more (new space or shape scales, new semantic roles) is a library
 * change, made in the library repository with `npm run tokens`.
 *
 *   import { applyBrand, applyFonts } from '@design-library/core/theme';
 *   applyBrand({ colours: { 1: { name: 'Harbour', seed: '#1f6f8b' } }, accent: 1 });
 *   void applyFonts({ preset: 'editorial' });
 *
 * Or, for a stylesheet with no script: `brandCss(brand)` returns the same declarations as CSS text.
 */
import { BRAND_SLOTS, generate } from '../colour/index.mjs';
import colourConfig from '../tokens/colour.config.json';
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
export interface Brand {
  /** Up to four brand colours, by slot "1"–"4". */
  colours: Partial<Record<BrandSlot, BrandColour>>;
  /** The slot the accent (links, focus, primary buttons, selection) is built from; 1 when left out. */
  accent?: number;
}

type Tree = { p: Record<string, Record<string, { $value: unknown }>>; color: { brand: Record<string, { $value: unknown }> } };
const aliasOf = (v: unknown) => (typeof v === 'string' && /^\{.+\}$/.test(v) ? v.slice(1, -1) : null);
const hexOf = (v: unknown) => (v && typeof v === 'object' && 'hex' in v ? String((v as { hex: string }).hex) : '');
const cssVar = (path: string) => `var(--${path.replace(/\./g, '-')})`;

/** The custom properties a brand sets, and the generator's errors (nothing to set while there are any). */
export function brandVars(brand: Brand): { vars: Record<string, string>; errors: string[] } {
  const config = colourConfig as unknown as Record<string, unknown>;
  const { tree, errors } = generate({ ...config, brand: { accent: 1, ...brand } }) as { tree: Tree | null; errors: string[] };
  if (!tree || errors.length) return { vars: {}, errors: errors.length ? errors : ['The colour generator returned nothing.'] };
  const vars: Record<string, string> = {};
  for (const g of Object.keys(tree.p).filter((k) => /^brand-\d$/.test(k) || k === 'accent'))
    for (const [step, t] of Object.entries(tree.p[g])) {
      if (step.startsWith('$')) continue;
      const a = aliasOf(t.$value);
      vars[`--p-${g}-${step}`] = a ? cssVar(a) : hexOf(t.$value);
    }
  vars['--p-alpha-accent-14'] = hexOf(tree.p.alpha['accent-14'].$value);
  for (const [k, t] of Object.entries(tree.color.brand)) if (!k.startsWith('$')) vars[`--color-brand-${k}`] = cssVar(aliasOf(t.$value) ?? '');
  return { vars, errors: [] };
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
