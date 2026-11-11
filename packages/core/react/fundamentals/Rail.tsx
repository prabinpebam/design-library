import { Children, type ReactNode } from 'react';
import { ScrollArea } from './ScrollArea';
import type { DataAttributes } from '../types';

export interface RailProps extends DataAttributes {
  /** The list's name for assistive technology: "Today's best deals". Leave it out when a named `nav` or region around the rail already says it. */
  label?: string;
  /** Each item's width: `s` (176 px) small cards many to a view, `m` (default, 256 px) cards, `l` (320 px) wide cards, `auto` as wide as its content (chips, links). The same steps as Grid `min`. */
  item?: 's' | 'm' | 'l' | 'auto';
  /** The space between items: `group` (default) between cards, `item` between chips or links. */
  gap?: 'item' | 'group';
  /** The row's scrollbar: `overlay` (default) the library's thin bar over the row's foot, shown on hover and while scrolling; `line` a progress line under the row, shown whenever it overflows (Q141, a shop's rail of offers). */
  bar?: 'overlay' | 'line';
  /** The items, each one card, chip or link; the rail puts each in a list item. */
  children: ReactNode;
}

/**
 * Things side by side in one row that scrolls sideways, each the same width: deals on a home page, related products,
 * category chips, a row of stories (Q139 R3). The row bleeds to the surface's edge and scrolls
 * in a ScrollArea (Q96), with each item's focus ring unclipped.
 * Not for a full listing someone compares or searches (use Grid, so everything shows without scrolling), or one
 * picture at a time (use Carousel).
 * @tier fundamental
 * @family layout
 * @a11y A list, named by `label` when given, so assistive technology says how many items there are. Tab moves through
 * the items' own controls and the ScrollArea keeps the focused one in view; nothing is reachable only by scrolling.
 */
export function Rail({ label, item = 'm', gap = 'group', bar = 'overlay', children, ...data }: RailProps) {
  return (
    <div {...data} data-dl="rail" data-item={item === 'm' ? undefined : item} data-gap={gap === 'item' ? 'item' : undefined}>
      <ScrollArea axis="inline" inset="sm" bar={bar}>
        <ul data-dl-part="items" aria-label={label}>
          {Children.toArray(children).map((child, i) => (
            <li key={i} data-dl-part="item">
              {child}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
