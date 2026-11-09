import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface StackProps extends DataAttributes {
  children: ReactNode;
  /** The space between children, by how strongly they belong together: `pair` (a label and its value) up to `section` (parts of a page). */
  gap?: 'pair' | 'item' | 'group' | 'section';
}

/**
 * Children in a column with one gap from a space role: the layout owns the space, so a view never needs a styled
 * wrapper or a margin.
 * Not for a titled part of a page (use Section) or for items that should wrap in a row.
 * @tier fundamental
 * @family arrangement
 * @a11y A plain `div` with no role: it arranges, it doesn't group for assistive technology.
 */
export function Stack({ children, gap = 'item', ...data }: StackProps) {
  return (
    <div {...data} data-dl="stack" data-gap={gap}>
      {children}
    </div>
  );
}
