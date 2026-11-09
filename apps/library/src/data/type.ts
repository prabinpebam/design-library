/**
 * The typography the library is previewed in (F16, owner Q35): which face each role uses and how its axes are set.
 * The theme's own (the default preset, as the tokens already hold it) until a person picks a preset, a face or an
 * axis on the Typography page; kept in this browser only and never written to source, like the space and shape
 * previews (F12). Applied as role custom properties on the document, so every page follows.
 */
import { useSyncExternalStore } from 'react';
import { faceOf, fontPresets, fontRoles, loadFace, resolveRoles, type FontFace, type FontRoleId } from '@design-library/core/fonts';
import { watchStored } from '@design-library/core/presets';

export type RoleFaces = Record<FontRoleId, string | null>;
export type RoleAxes = Partial<Record<FontRoleId, Record<string, number>>>;

export interface TypeChoice {
  roles: RoleFaces;
  axes: RoleAxes;
}

const KEY = 'design-library.type';
export const themePreset = fontPresets.find((p) => p.default) ?? fontPresets[0];
const themeChoice: TypeChoice = { roles: { ...themePreset.roles }, axes: { ...(themePreset.axes ?? {}) } };

const FALLBACK: Record<FontFace['classification'], string> = {
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, 'Cascadia Code', Consolas, monospace",
};

function read(): TypeChoice {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as TypeChoice) : null;
    if (v && v.roles && faceOf(v.roles.display)) return { roles: v.roles, axes: v.axes ?? {} };
  } catch {
    // Unreadable: the theme's own.
  }
  return themeChoice;
}

let state = read();
const listeners = new Set<() => void>();

const same = (a: TypeChoice, b: TypeChoice) => JSON.stringify(a) === JSON.stringify(b);

/** The role a role's face comes from: itself when it has one, else the role it collapses onto. */
export function sourceRole(roles: RoleFaces, role: FontRoleId): FontRoleId {
  if (role === 'code' || roles[role]) return role;
  const above = fontRoles.find((r) => r.id === role)?.collapsesTo;
  return above ? sourceRole(roles, above) : role;
}

const settings = (axes: Record<string, number> | undefined) =>
  axes && Object.keys(axes).length ? Object.entries(axes).map(([tag, v]) => `'${tag}' ${v}`).join(', ') : 'normal';

function apply(choice: TypeChoice) {
  const faces = resolveRoles(choice.roles);
  const root = document.documentElement.style;
  const theme = same(choice, themeChoice);
  for (const role of fontRoles) {
    const face = faces[role.id];
    if (face) void loadFace(face.id);
    if (theme) {
      root.removeProperty(role.variable);
      root.removeProperty(`--axes-${role.id}`);
      continue;
    }
    root.setProperty(role.variable, face ? `'${face.family}', ${FALLBACK[face.classification]}` : FALLBACK.mono);
    root.setProperty(`--axes-${role.id}`, settings(choice.axes[sourceRole(choice.roles, role.id)]));
  }
}

apply(state);

function set(next: TypeChoice) {
  state = next;
  try {
    if (same(next, themeChoice)) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: the choice still applies for this visit.
  }
  apply(next);
  for (const l of listeners) l();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// Another tab, window or preview frame changed the typography: follow it (Q70).
watchStored(KEY, () => {
  state = read();
  apply(state);
  for (const l of listeners) l();
});
export const getType = () => state;
export const setType = set;
export const subscribeType = subscribe;

/** The preset whose faces and axes the choice matches exactly, if any. */
export const presetOf = (choice: TypeChoice) => fontPresets.find((p) => same({ roles: p.roles, axes: p.axes ?? {} }, choice));

export function useType() {
  const choice = useSyncExternalStore(subscribe, () => state);
  return {
    choice,
    faces: resolveRoles(choice.roles),
    isTheme: same(choice, themeChoice),
    preset: presetOf(choice),
    usePreset: (id: string) => {
      const p = fontPresets.find((x) => x.id === id);
      if (p) set({ roles: { ...p.roles }, axes: { ...(p.axes ?? {}) } });
    },
    setFace: (role: FontRoleId, face: string | null) => {
      const axes = { ...choice.axes };
      delete axes[role];
      set({ roles: { ...choice.roles, [role]: face }, axes });
    },
    setAxis: (role: FontRoleId, tag: string, value: number | null) => {
      const own = { ...(choice.axes[role] ?? {}) };
      if (value === null) delete own[tag];
      else own[tag] = value;
      const axes = { ...choice.axes, [role]: own };
      if (!Object.keys(own).length) delete axes[role];
      set({ roles: choice.roles, axes });
    },
    reset: () => set(themeChoice),
  };
}
