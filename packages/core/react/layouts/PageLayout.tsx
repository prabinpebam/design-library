import type { ReactNode, Ref } from 'react';
import type { DataAttributes } from '../types';

export interface PageLayoutProps extends DataAttributes {
  /** The page's head, usually a PageHeader. */
  header: ReactNode;
  /** The page's sections, in reading order. */
  children?: ReactNode;
  /** The page element, for tools that work within one page (an element picker, a jump to a block). */
  ref?: Ref<HTMLElement>;
}

/**
 * One page's content as a reading column: its header, then sections spaced as their own groups, up to a widest size.
 * Not for the app's frame (use LibraryLayout) or for a dense working screen.
 * @tier 3
 * @a11y Renders an `article`; the header holds the page's only `h1`. Sections separate by space alone.
 */
export function PageLayout({ header, children, ref, ...data }: PageLayoutProps) {
  return (
    <article {...data} ref={ref} data-dl="page-layout">
      {header}
      {children}
    </article>
  );
}
