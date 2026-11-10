import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { checkGlyphs, getIconOverrides, toSetGlyph, useIconSetVersion, type BrandGlyph, type SetGlyph } from '../../icons/sets';

const OverridesContext = createContext<Record<string, SetGlyph>>({});

export interface IconOverridesProps {
  /** Brand glyphs by semantic name (any Icon name, and `star` for Rating). Names left out draw as they would outside. */
  icons: Record<string, BrandGlyph>;
  children: ReactNode;
}

/**
 * A few brand icons for one part of the page (MP24, Q113): inside it, each name given draws the brand's glyph in every
 * component that draws that name; nested ones merge, the inner winning; every other name falls back to the site's
 * overrides, then the active set, then the library's own. Behaviour only: no element of its own.
 * @tier fundamental
 * @family text
 * @a11y Changes only the drawing: each Icon keeps its own name or stays decorative.
 */
export function IconOverrides({ icons, children }: IconOverridesProps) {
  const outer = useContext(OverridesContext);
  const merged = useMemo(() => {
    checkGlyphs('IconOverrides', icons);
    return { ...outer, ...Object.fromEntries(Object.entries(icons).map(([n, g]) => [n, toSetGlyph(g, n)])) };
  }, [outer, icons]);
  return <OverridesContext.Provider value={merged}>{children}</OverridesContext.Provider>;
}

/** The brand glyph a name draws with here (nearest subtree, then site-wide), or `null` for the set's or the library's own. */
export function useIconOverride(name: string): SetGlyph | null {
  useIconSetVersion();
  const near = useContext(OverridesContext);
  return near[name] ?? getIconOverrides()[name] ?? null;
}
