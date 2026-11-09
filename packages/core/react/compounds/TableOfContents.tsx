import { useEffect, useState, type MouseEvent } from 'react';
import { useRouter } from '../behaviour/router';
import type { DataAttributes } from '../types';

/** One place on the page: the id of its target (a Section's `anchor`) and the words for it. */
export interface TableOfContentsItem {
  /** The id of the element it goes to. Left out, the entry is shown but goes nowhere, such as a letter with no names. */
  anchor?: string;
  /** The words for it: a section's heading, or one letter. */
  label: string;
}

export interface TableOfContentsProps extends DataAttributes {
  /** The places on the page, in page order. */
  items: TableOfContentsItem[];
  /** Names the list, shown above it and as its navigation name: "On this page". Every word comes from you. */
  label?: string;
  /** `list` (default): one entry per line, for a column beside or above long content. `row`: entries side by side, wrapping, for a short line of sections or a letter jump. */
  layout?: 'list' | 'row';
  /** Marks the entry whose part of the page is being read, as the page scrolls (default on). */
  trackCurrent?: boolean;
}

/** The last target whose top has reached the reading line: just below any sticky header, where an entry's link scrolls it to. */
function currentOf(anchors: string[]): string | null {
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingBlockStart) || 0;
  const line = pad + 16;
  let found: string | null = null;
  for (const id of anchors) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= line) found = id;
  }
  return found ?? anchors[0] ?? null;
}

/**
 * Letters for a letter jump: every letter of the alphabet, each going to its group's anchor when one exists and inert
 * when none does, so the row keeps its shape. `letterItems(['A', 'C'])` with the default English alphabet; pass your
 * own for another language. The anchor for letter L is `prefix + L`.
 */
export function letterItems(present: Iterable<string>, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', prefix = 'letter-'): TableOfContentsItem[] {
  const have = new Set([...present].map((l) => l.toUpperCase()));
  return [...alphabet].map((l) => (have.has(l) ? { label: l, anchor: `${prefix}${l}` } : { label: l }));
}

/**
 * Links to the parts of the page: "on this page" beside or above long content, or a letter jump over an A to Z list.
 * The part being read is marked as the page scrolls. Inside the core router an entry keeps the route and moves focus
 * to its heading; without one it is a plain in-page link.
 * Not for links between pages (use Navigation or SiteHeader) or for a numbered index of pages (use IndexList).
 * @tier compound
 * @family navigation
 * @a11y A `nav` named by its label, with a list of links. The entry being read has `aria-current="location"`, shown by
 * an underline and the text colour, never colour alone. An entry with no target (a letter with no names) is plain text, not a
 * link, so it isn't a tab stop.
 * @key Tab: moves through the entries
 * @key Enter: goes to the entry's part of the page
 */
export function TableOfContents({ items, label = 'On this page', layout = 'list', trackCurrent = true, ...data }: TableOfContentsProps) {
  const router = useRouter();
  const anchors = items.flatMap((i) => (i.anchor ? [i.anchor] : []));
  const key = anchors.join(' ');
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!trackCurrent || !anchors.length) return;
    // A few box reads per scroll event; React skips the render when the entry is unchanged.
    const update = () => setCurrent(currentOf(anchors));
    update();
    // Capture, so a scroll region of any kind (the window or a layout's own) is followed.
    document.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update);
    return () => {
      document.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
    };
    // The anchors' identity is their joined key.
  }, [trackCurrent, key]);

  const go = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
    if (!router || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.navigate(`#${anchor}`);
  };

  return (
    <nav {...data} data-dl="table-of-contents" data-layout={layout} aria-label={label}>
      <p data-dl-part="label" aria-hidden="true">
        {label}
      </p>
      <ul data-dl-part="items">
        {items.map((item, i) => (
          <li key={item.anchor ?? `${item.label}-${i}`} data-dl-part="item">
            {item.anchor ? (
              <a data-dl-part="link" href={router ? router.href(`#${item.anchor}`) : `#${item.anchor}`} aria-current={item.anchor === current ? 'location' : undefined} onClick={(e) => go(e, item.anchor!)}>
                {item.label}
              </a>
            ) : (
              <span data-dl-part="inert">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
