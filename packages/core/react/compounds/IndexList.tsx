import { Icon } from '../fundamentals/Icon';
import { Link } from '../fundamentals/Link';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

/** One entry of an index list. */
export interface IndexListItem {
  /** Stable key for the entry. */
  id: string;
  /** The page's name, as the link text. */
  title: string;
  href: string;
  /** One line on what the page holds. */
  summary: string;
  /** `data-*` attributes for the entry, for tooling such as revision anchors. */
  data?: DataAttributes;
}

export interface IndexListProps extends DataAttributes {
  items: IndexListItem[];
}

/**
 * A way into each page of a set: its name as a link and one line on what it holds, in as many columns as fit.
 * Not for an app's own navigation between its pages (use Navigation) or for a list of plain names (use List).
 * @tier compound
 * @family content
 * @a11y A native `ul`; each entry's link is named by the page's title, and its one line follows as plain text.
 */
export function IndexList({ items, ...data }: IndexListProps) {
  return (
    <ul {...data} data-dl="index-list">
      {items.map((item) => (
        <li key={item.id} {...item.data}>
          <Link href={item.href}>
            {item.title}
            <Icon name="chevron-end" size="sm" />
          </Link>
          <Text variant="body-sm" tone="muted">
            {item.summary}
          </Text>
        </li>
      ))}
    </ul>
  );
}
