import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

/** One term and its details. */
export interface DescriptionListItem {
  /** A short name: one to three words. */
  term: string;
  details: ReactNode;
  /** `data-*` attributes for the pair, for tooling such as revision anchors. */
  data?: DataAttributes;
}

export interface DescriptionListProps extends DataAttributes {
  items: DescriptionListItem[];
}

/**
 * Term and details pairs, such as what a component uses and what uses it: the term in a column of its own beside its
 * details, stacking above them below breakpoint.sm.
 * Not for comparing several facts across rows (use DataTable) or for a list of equal items (use List).
 * @tier compound
 * @family content
 * @a11y A native `dl`, each pair grouped in a `div` (valid HTML), so a screen reader announces term and details together.
 */
export function DescriptionList({ items, ...data }: DescriptionListProps) {
  return (
    <dl {...data} data-dl="description-list">
      {items.map((item) => (
        <div key={item.term} {...item.data}>
          <dt>{item.term}</dt>
          <dd>{item.details}</dd>
        </div>
      ))}
    </dl>
  );
}
