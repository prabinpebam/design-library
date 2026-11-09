import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface GridProps extends DataAttributes {
  /** The things to compare, in reading order; each takes one column. */
  children: ReactNode;
  /** The most columns, even with room for more: 2 keeps four things 2 × 2 instead of 3 + 1. Default: as many as fit. */
  max?: 2 | 3 | 4;
}

/**
 * Equal columns for things compared side by side (options, variants), as many as fit at `size.column-min` each, a
 * gutter apart; rows sit a group's space apart. Below two columns' width it becomes one column, so it never scrolls
 * sideways from 320 px.
 * Not for a page's regions (use LibraryLayout), a column of unrelated content (use Stack) or a wrapping row of small
 * marks (use Cluster).
 * @tier fundamental
 * @family arrangement
 * @a11y A plain `div` with no role: it arranges, it doesn't group for assistive technology. Reading order is the
 * source order, row by row.
 */
export function Grid({ children, max, ...data }: GridProps) {
  return (
    <div {...data} data-dl="grid" data-max={max}>
      {children}
    </div>
  );
}
