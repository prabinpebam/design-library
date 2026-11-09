import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface GridProps extends DataAttributes {
  /** The things to compare, in reading order; each takes one column. */
  children: ReactNode;
  /** The most columns, even with room for more: 2 keeps four things 2 × 2 instead of 3 + 1. Default: as many as fit. Ignored with `ratio`. */
  max?: 2 | 3 | 4;
  /**
   * Two uneven columns instead of equal ones (IP20): `2:1` and `3:2` give the start column the larger share, `1:2`
   * and `2:3` the end column; `aside` keeps the start column at `--c-grid-aside` (a heading beside its content) and
   * gives the end column the rest. Children alternate start, end, start, end. Below two columns' width (two
   * `size.column-min` and a gutter) they stack in source order. Default: equal columns.
   */
  ratio?: '2:1' | '3:2' | '1:2' | '2:3' | 'aside';
  /** The space between rows (and between stacked columns): `group` (default) for things compared side by side; `section` when each cell is a section with its own heading, so stacked sections stand `c.grid.section-gap` apart (wider than inside a section, narrower than the page gap). */
  gap?: 'group' | 'section';
}

/**
 * Equal columns for things compared side by side (options, variants), as many as fit at `size.column-min` each, a
 * gutter apart; rows sit a group's space apart. Below two columns' width it becomes one column, so it never scrolls
 * sideways from 320 px. With `ratio` it draws two uneven columns instead (a wide and a narrow one, or a heading beside
 * its content) that stack when their container is narrow.
 * Not for a page's regions (use LibraryLayout), a column of unrelated content (use Stack) or a wrapping row of small
 * marks (use Cluster).
 * @tier fundamental
 * @family arrangement
 * @a11y A plain `div` with no role: it arranges, it doesn't group for assistive technology. Reading order is the
 * source order, row by row.
 */
export function Grid({ children, max, ratio, gap = 'group', ...data }: GridProps) {
  return (
    <div {...data} data-dl="grid" data-max={ratio ? undefined : max} data-ratio={ratio} data-gap={gap === 'section' ? 'section' : undefined}>
      {children}
    </div>
  );
}
