import { useEffect, useRef, useState } from 'react';
import { Button } from '../fundamentals/Button';
import { Icon } from '../fundamentals/Icon';
import { Link } from '../fundamentals/Link';
import type { DataAttributes } from '../types';

/** One step of the path: a page above the current one, or the current page itself (last). */
export interface BreadcrumbItem {
  /** The page's name as it appears in its own title. */
  label: string;
  /** Where it is. Ignored on the last item: the current page is never a link. */
  href?: string;
}

export interface BreadcrumbsProps extends DataAttributes {
  /** The path from the top, ending with the current page. */
  items: BreadcrumbItem[];
  /**
   * Longest path shown in full. Past it, the first page and the last `maxItems - 2` stay and the ones between collapse
   * into one "Show n more pages in the path" button that reveals them in place. Leave out to always show the whole path.
   */
  maxItems?: number;
  /** Keep one line and ellipsize the current page when space is short. Its full name remains accessible and is available on hover. Default false: steps and names wrap. */
  truncate?: boolean;
  /** The navigation landmark's name; "Breadcrumb" unless a page has two. */
  label?: string;
}

/**
 * The path from the top of a hierarchy to the current page, for apps deep enough that people need to know where they
 * are and go back up (files, settings, documentation). Not for steps in a process (use a stepper) or for a flat app's
 * sections (use Navigation or Tabs).
 * @tier compound
 * @family navigation
 * @a11y The WAI-ARIA APG breadcrumb: a `nav` landmark named "Breadcrumb" around an ordered list, so its length and each
 * step's position are read. Each page above is a Link; the current page is plain text with `aria-current="page"`, never
 * a link to itself. Separators are decorative icons that mirror in right-to-left. A collapsed path is one quiet
 * icon-only button named with the number of hidden pages; pressing it shows them in place and moves focus to the first
 * one. Steps wrap as whole units onto lines at least a minimum target apart; one long name wraps inside itself.
 * @key Tab: moves through the links, then past the current page
 * @key Enter on the collapsed path: shows the hidden pages and focuses the first
 */
export function Breadcrumbs({ items, maxItems, truncate = false, label = 'Breadcrumb', ...data }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const firstRevealed = useRef<HTMLLIElement>(null);
  const [moveFocus, setMoveFocus] = useState(false);
  const collapse = !expanded && maxItems !== undefined && maxItems >= 3 && items.length > maxItems;
  const tail = collapse ? maxItems - 2 : 0;
  const hidden = collapse ? items.length - 1 - tail : 0;

  useEffect(() => {
    if (!moveFocus) return;
    firstRevealed.current?.querySelector('a')?.focus();
    setMoveFocus(false);
  }, [moveFocus]);

  const step = (item: BreadcrumbItem, i: number) => {
    const current = i === items.length - 1;
    return (
      <li key={i} data-dl-part="step" ref={i === 1 && expanded && maxItems !== undefined ? firstRevealed : undefined}>
        {i > 0 && <Icon name="chevron-end" size="sm" data-dl-part="separator" />}
        {current || !item.href ? (
          <span data-dl-part="current" aria-current={current ? 'page' : undefined} title={truncate ? item.label : undefined}>
            {item.label}
          </span>
        ) : (
          <Link href={item.href}>{item.label}</Link>
        )}
      </li>
    );
  };

  return (
    <nav {...data} data-dl="breadcrumbs" data-truncate={truncate ? '' : undefined} aria-label={label}>
      <ol>
        {collapse ? (
          <>
            {step(items[0], 0)}
            <li data-dl-part="step">
              <Icon name="chevron-end" size="sm" data-dl-part="separator" />
              <Button
                label={`Show ${hidden} more ${hidden === 1 ? 'page' : 'pages'} in the path`}
                icon="more"
                iconOnly
                emphasis="quiet"
                size="xs"
                onClick={() => {
                  setExpanded(true);
                  setMoveFocus(true);
                }}
              />
            </li>
            {items.slice(items.length - tail).map((item, k) => step(item, items.length - tail + k))}
          </>
        ) : (
          items.map(step)
        )}
      </ol>
    </nav>
  );
}
