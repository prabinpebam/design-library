import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface StackProps extends DataAttributes {
  children: ReactNode;
  /** The space between children, by how strongly they belong together: `pair` (a label and its value) up to `section` (parts of a page); `none` when the children own the space between them (LR127). */
  gap?: 'pair' | 'item' | 'group' | 'section' | 'none';
  /** Holds the column to a reading line (size.measure) in a wider view: a short form or list of panels that shouldn't stretch across the screen (LR99). Off by default: the column fills its parent. */
  measure?: boolean;
}

/**
 * Children in a column with one gap from a space role: the layout owns the space, so a view never needs a styled
 * wrapper or a margin.
 * Not for a titled part of a page (use Section) or for items that should wrap in a row.
 * @tier fundamental
 * @family arrangement
 * @a11y A plain `div` with no role: it arranges, it doesn't group for assistive technology.
 */
export function Stack({ children, gap = 'item', measure = false, ...data }: StackProps) {
  return (
    <div {...data} data-dl="stack" data-gap={gap} data-measure={measure ? '' : undefined}>
      {children}
    </div>
  );
}
