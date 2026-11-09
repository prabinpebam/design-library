import type { ReactNode } from 'react';
import { Icon } from '../fundamentals/Icon';
import { Select } from '../fundamentals/Select';
import type { DataAttributes } from '../types';

/** A neighbouring page in a sequence, named by its title. */
export interface PaginationNeighbour {
  /** The page's title. */
  label: string;
  href: string;
}

export interface PaginationProps extends DataAttributes {
  /**
   * `numbered` (default): Previous, page numbers with gaps, Next. `compact`: Previous, "Page 3 of 20", Next.
   * `sequence`: the previous and next pages of a guide by title, stacked (uses `previous` and `next` only).
   */
  variant?: 'numbered' | 'compact' | 'sequence';
  /** The page shown, from 1. */
  page?: number;
  /** How many pages there are. With one page nothing renders. */
  pages?: number;
  /** Each page's address, when pages have their own (links); leave out to get buttons and use `onChange`. */
  hrefFor?: (page: number) => string;
  /** A page was chosen (also called for links, before they navigate). */
  onChange?: (page: number) => void;
  /** Pages shown either side of the current one before a gap. */
  siblings?: number;
  /** With `pageSize`, shows the range and total, e.g. "21–40 of 312 results". */
  total?: number;
  /** Items per page, for the range and the size changer. */
  pageSize?: number;
  /** The sizes people can choose; shows a "Results per page" Select. */
  pageSizes?: number[];
  /** A page size was chosen; go back to a page that holds the first item shown. */
  onPageSizeChange?: (size: number) => void;
  /** What the items are, plural, for the total and the size changer: "results" by default. */
  noun?: string;
  /** `sequence`: the page before, by title. */
  previous?: PaginationNeighbour;
  /** `sequence`: the page after, by title. */
  next?: PaginationNeighbour;
  /** The navigation landmark's name; "Pagination" unless a page has two. */
  label?: string;
}

/** The pages to show: numbers, with `gap` where pages are left out; a gap never hides just one page. */
export function pageRange(page: number, pages: number, siblings = 1): (number | 'gap')[] {
  const shown = new Set<number>([1, pages]);
  for (let p = page - siblings; p <= page + siblings; p++) if (p >= 1 && p <= pages) shown.add(p);
  const sorted = [...shown].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    const before = sorted[i - 1];
    if (before !== undefined && p - before === 2) out.push(before + 1);
    else if (before !== undefined && p - before > 2) out.push('gap');
    out.push(p);
  });
  return out;
}

/**
 * Moves between the pages of a long set of results or the pages of a guide, after the content. Not for steps in a
 * process (use a stepper) or for a few sections of one thing (use Tabs).
 * @tier compound
 * @family navigation
 * @a11y A `nav` landmark named "Pagination". Pages are links when they have addresses, buttons otherwise. Each says what
 * it does ("Previous page", "Page 5"); the current page is marked with `aria-current="page"` and is not a control. Gaps
 * are decorative. On the first or last page, Previous or Next keeps its place but is hidden from everyone, so nothing
 * shifts. Under the compact width the numbers give way to "Page 3 of 20". Targets are 44 px. Renders nothing with one page.
 * @key Tab: moves through Previous, the pages and Next
 * @key Enter: goes to that page
 */
export function Pagination({ label = 'Pagination', variant = 'numbered', page = 1, pages = 1, hrefFor, onChange, siblings = 1, total, pageSize, pageSizes, onPageSizeChange, noun = 'results', previous, next, ...data }: PaginationProps) {
  if (variant === 'sequence') {
    if (!previous && !next) return null;
    return (
      <nav {...data} data-dl="pagination" data-variant="sequence" aria-label={label}>
        {previous && (
          <a href={previous.href} data-dl-part="neighbour" rel="prev">
            <span data-dl-part="direction">
              <Icon name="chevron-start" size="sm" />
              Previous
            </span>
            <span data-dl-part="title">{previous.label}</span>
          </a>
        )}
        {next && (
          <a href={next.href} data-dl-part="neighbour" rel="next">
            <span data-dl-part="direction">
              Next
              <Icon name="chevron-end" size="sm" />
            </span>
            <span data-dl-part="title">{next.label}</span>
          </a>
        )}
      </nav>
    );
  }

  const sizeChanger = pageSizes && pageSize && onPageSizeChange;
  if (pages <= 1 && !sizeChanger) return null;

  const control = (to: number, part: string, name: string, content: ReactNode, hidden = false) => {
    const common = { 'data-dl-part': part, 'aria-label': name, 'data-hidden': hidden || undefined };
    return hrefFor ? (
      <a {...common} href={hrefFor(to)} onClick={() => onChange?.(to)}>
        {content}
      </a>
    ) : (
      <button {...common} type="button" onClick={() => onChange?.(to)}>
        {content}
      </button>
    );
  };

  const first = pageSize ? (page - 1) * pageSize + 1 : 0;
  const last = pageSize && total !== undefined ? Math.min(total, page * pageSize) : 0;
  const fmt = (n: number) => n.toLocaleString();

  return (
    <nav {...data} data-dl="pagination" data-variant={variant} aria-label={label}>
      {total !== undefined && pageSize && (
        <p data-dl-part="total">
          {total === 0 ? `No ${noun}` : `${fmt(first)}–${fmt(last)} of ${fmt(total)} ${noun}`}
        </p>
      )}
      {pages > 1 && (
        <ul data-dl-part="pages">
          <li>
            {control(
              page - 1,
              'step',
              'Previous page',
              <>
                <Icon name="chevron-start" size="sm" />
                <span data-dl-part="step-words">Previous</span>
              </>,
              page <= 1,
            )}
          </li>
          {pageRange(page, pages, siblings).map((p, i) =>
            p === 'gap' ? (
              <li key={`gap-${i}`} data-dl-part="gap" aria-hidden="true">
                …
              </li>
            ) : p === page ? (
              <li key={p} data-dl-part="number-item">
                <span data-dl-part="page" aria-current="page">
                  {p}
                </span>
              </li>
            ) : (
              <li key={p} data-dl-part="number-item">
                {control(p, 'page', `Page ${p}`, p)}
              </li>
            ),
          )}
          <li data-dl-part="position">
            Page {page} of {pages}
          </li>
          <li>
            {control(
              page + 1,
              'step',
              'Next page',
              <>
                <span data-dl-part="step-words">Next</span>
                <Icon name="chevron-end" size="sm" />
              </>,
              page >= pages,
            )}
          </li>
        </ul>
      )}
      {sizeChanger && (
        <div data-dl-part="size">
          <Select
            label={`${noun.charAt(0).toUpperCase()}${noun.slice(1)} per page`}
            size="s"
            value={String(pageSize)}
            options={pageSizes.map((s) => ({ value: String(s), label: String(s) }))}
            onChange={(v) => onPageSizeChange(Number(v))}
          />
        </div>
      )}
    </nav>
  );
}
