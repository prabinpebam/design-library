import { createContext, useContext } from 'react';
import { themeSpaceShape, type ShapeOption, type SpaceOption } from './tokens';

export type Scheme = 'light' | 'dark';
export type Contrast = 'standard' | 'more';

/**
 * The four contexts. Token pages compare values across all four side by side (the context matrix); a component's
 * example shows one at a time, chosen on its own preview (O40). Same-document subtrees in S2; isolated iframe
 * documents from S4 (O28).
 */
export interface SpecimenContext {
  id: string;
  label: string;
  scheme: Scheme;
  /** Fixed per context, so a person's own contrast setting never leaks into a specimen. */
  contrast: Contrast;
}

export const contexts: SpecimenContext[] = [
  { id: 'light', label: 'Light', scheme: 'light', contrast: 'standard' },
  { id: 'dark', label: 'Dark', scheme: 'dark', contrast: 'standard' },
  { id: 'light-more', label: 'Light, more contrast', scheme: 'light', contrast: 'more' },
  { id: 'dark-more', label: 'Dark, more contrast', scheme: 'dark', contrast: 'more' },
];

export const contextOf = (scheme: Scheme, contrast: Contrast) => contexts.find((c) => c.scheme === scheme && c.contrast === contrast)!;

/** The library's own appearance (the header's Dark and More contrast), which every preview starts from. */
export const AppearanceContext = createContext<{ scheme: Scheme; contrast: Contrast }>({ scheme: 'light', contrast: 'standard' });
export const useAppearance = () => useContext(AppearanceContext);

/**
 * The space and shape the whole library is previewed in (F12): the theme's own choice until a person picks another on
 * the Space and size or Shape page. Set on the body, so every page, the title bar and the navigation follow it.
 */
export interface LibrarySpaceShape {
  space: SpaceOption;
  shape: ShapeOption;
  setSpace: (next: SpaceOption) => void;
  setShape: (next: ShapeOption) => void;
}
export const SpaceShapeContext = createContext<LibrarySpaceShape>({ space: themeSpaceShape.space, shape: themeSpaceShape.shape, setSpace: () => {}, setShape: () => {} });
export const useSpaceShape = () => useContext(SpaceShapeContext);