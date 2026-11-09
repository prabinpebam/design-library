import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface HeadingProps extends DataAttributes {
  /** The heading text: names the content below it, in sentence case. */
  children: ReactNode;
  /** Semantic level from the page outline. Never skip a level for looks. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size, independent of level. Defaults to the level's own size (5 and 6 look like 4). `display` (ramp xxxxl) and `jumbo` (the ramp's top step) are for a landing title or a single figure, at most one per view. `label` is the smallest: the dense body text size in a strong weight, for a group's title in a dense panel (a design tool's inspector), where the rows' own text is that size. */
  size?: 1 | 2 | 3 | 4 | 'label' | 'display' | 'jumbo';
  /** Fragment identifier, so the heading can be linked to. */
  id?: string;
}

/**
 * A section title with a semantic level independent of its visual size.
 * Not for emphasis inside a paragraph, or for labelling a control (use the control's label).
 * @tier fundamental
 * @family text
 * @a11y Renders `h1`-`h6` from `level`; the outline follows the page structure, never the visual size.
 */
export function Heading({ children, level, size, id, ...data }: HeadingProps) {
  const Element = `h${level}` as const;
  const visual = size ?? (Math.min(level, 4) as 1 | 2 | 3 | 4);
  return (
    <Element {...data} id={id} data-dl="heading" data-size={visual}>
      {children}
    </Element>
  );
}
