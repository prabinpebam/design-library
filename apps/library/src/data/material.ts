/**
 * The material finish the library and every template are shown in (Q73 MB2): frosted (the theme's default, AD1) or
 * solid, one global setting kept in this browser and followed live by every tab, window and preview frame. Applied as
 * `data-material` on the root, the public seam `css/materials.css` reads; system settings (reduced transparency, more
 * contrast, forced colours) still force solid.
 */
import { useSyncExternalStore } from 'react';
import { suspendMotion } from '@design-library/core/react';
import { watchStored } from '@design-library/core/presets';

export type MaterialFinish = 'frosted' | 'solid';
const KEY = 'design-library.material';
export const themeMaterial: MaterialFinish = 'frosted';

function read(): MaterialFinish {
  try {
    return localStorage.getItem(KEY) === 'solid' ? 'solid' : themeMaterial;
  } catch {
    return themeMaterial;
  }
}

let state = read();
const listeners = new Set<() => void>();
const apply = () => suspendMotion(() => (document.documentElement.dataset.material = state));
apply();

export function setMaterial(next: MaterialFinish) {
  if (next === state) return;
  state = next;
  try {
    if (next === themeMaterial) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    // Storage unavailable: the choice still applies for this visit.
  }
  apply();
  for (const l of listeners) l();
}

watchStored(KEY, () => {
  state = read();
  apply();
  for (const l of listeners) l();
});

export const getMaterial = () => state;
export const subscribeMaterial = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useMaterial = () => useSyncExternalStore(subscribeMaterial, getMaterial);
