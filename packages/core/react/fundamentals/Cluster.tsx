import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface ClusterProps extends DataAttributes {
  children: ReactNode;
  /** The space between children in the row, by how strongly they belong together: `pair` (an icon and its number) up to `group`; `none` for compact icon buttons that touch, their own hover fill showing each one's bounds (a design tool's alignment row). Wrapped lines keep a pair's space between them. */
  gap?: 'none' | 'pair' | 'item' | 'group';
  /** How the row's free room is shared: `start` (default) keeps children together at the start; `end` keeps them together at the end (a row of actions closing a form); `between` spreads them across the row, the first and last at its edges (a design tool's alignment row filling its panel). */
  justify?: 'start' | 'end' | 'between';
  /** How children line up across the row: centred (marks beside text), on the first line of text, at the top (items of different heights, such as fields), at the bottom (`end`: a button level with an unhinted field beside it, under that field's label), or `control`: every child that isn't a field level with the fields' controls, under their labels and above their hints (a field and its button in a form row). */
  align?: 'center' | 'baseline' | 'start' | 'end' | 'control';
  /** Wrap onto more lines when the row runs out of room (default), or keep one line and let text inside shrink and wrap instead. */
  wrap?: boolean;
}

/**
 * Children in a row that wraps onto more lines when it runs out of room (or keeps to one line), with one gap from a space role: the layout
 * owns the space, so a view never needs a styled wrapper or a margin.
 * Not for children in a column (use Stack) or for a row of actions on something (use the component that owns them).
 * @tier fundamental
 * @family arrangement
 * @a11y A plain `div` with no role: it arranges, it doesn't group for assistive technology. Reading order is the
 * source order, whatever the wrapping.
 */
export function Cluster({ children, gap = 'item', align = 'center', wrap = true, justify = 'start', ...data }: ClusterProps) {
  return (
    <div {...data} data-dl="cluster" data-gap={gap} data-align={align} data-justify={justify === 'start' ? undefined : justify} data-nowrap={wrap ? undefined : ''}>
      {children}
    </div>
  );
}
