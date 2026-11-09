/**
 * The space and shape the library and every template are previewed in (F12, Q70): the theme's own until a person picks
 * another; kept in this browser and followed live by every tab, window and preview frame. Applied as the data-space
 * and data-shape attributes on body, the public seam the generated space and shape tokens read.
 */
import { useSyncExternalStore } from 'react';
import { suspendMotion } from '@design-library/core/react';
import { watchStored } from '@design-library/core/presets';
import { shapeOptions, spaceOptions, themeSpaceShape, type ShapeOption, type SpaceOption } from './tokens';

const KEYS = { space: 'design-library.space', shape: 'design-library.shape' } as const;
export interface SpaceShape {
  space: SpaceOption;
  shape: ShapeOption;
}

function readOne<Id extends string>(key: string, ids: Id[], theme: Id): Id {
  try {
    const v = localStorage.getItem(key) as Id | null;
    return v && ids.includes(v) ? v : theme;
  } catch {
    return theme;
  }
}
const read = (): SpaceShape => ({
  space: readOne(KEYS.space, spaceOptions.map((o) => o.id), themeSpaceShape.space),
  shape: readOne(KEYS.shape, shapeOptions.map((o) => o.id), themeSpaceShape.shape),
});

let state = read();
const listeners = new Set<() => void>();

// The theme's own option needs no attribute: the base tokens already are it.
function apply(v: SpaceShape) {
  suspendMotion(() => {
    const body = document.body.dataset;
    if (v.space === themeSpaceShape.space) delete body.space;
    else body.space = v.space;
    if (v.shape === themeSpaceShape.shape) delete body.shape;
    else body.shape = v.shape;
  });
}
apply(state);

function store(key: string, value: string, theme: string) {
  try {
    if (value === theme) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice still applies for this visit.
  }
}

export function setSpaceShape(next: SpaceShape) {
  if (next.space === state.space && next.shape === state.shape) return;
  store(KEYS.space, next.space, themeSpaceShape.space);
  store(KEYS.shape, next.shape, themeSpaceShape.shape);
  state = next;
  apply(state);
  for (const l of listeners) l();
}
export const setSpace = (space: SpaceOption) => setSpaceShape({ ...state, space });
export const setShape = (shape: ShapeOption) => setSpaceShape({ ...state, shape });
export const getSpaceShape = () => state;

watchStored(Object.values(KEYS), () => {
  state = read();
  apply(state);
  for (const l of listeners) l();
});

export const subscribeSpaceShape = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useSpaceShape = () => useSyncExternalStore(subscribeSpaceShape, getSpaceShape);
