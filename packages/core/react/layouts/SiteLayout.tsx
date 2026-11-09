import { useEffect, useId, useState, type ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface SiteLayoutProps extends DataAttributes {
  /** The SiteHeader. It stays at the top while the page scrolls. */
  header: ReactNode;
  /** The page's parts in order: a Hero, then Sections. The layout gives them one column and the space between them. */
  children: ReactNode;
  /** The Footer, the full width of the window under the column. */
  footer?: ReactNode;
  /** `wide` (default): a landing page's 72 rem column; `reading`: an article's measure, for long text. */
  width?: 'wide' | 'reading';
  /** The skip link's words: "Skip to content" (default). */
  skipLabel?: string;
}

/**
 * A website's page: the site header at the top (it stays while the page scrolls, on the chrome material: frosted when
 * the setting is on, with its hairline only while content is under it), the page's parts in one centred
 * column spaced as sections, and the footer across the full width. The window scrolls; the margins hold at every width.
 * Not for an app with its own panes (ChatLayout, ListDetail) or for documentation with a side navigation (LibraryLayout).
 * @tier 3
 * @a11y A skip link first, to the `main` landmark; the header slot sits in a `banner` (`header`) landmark and the
 * Footer brings its own `contentinfo`. The column's parts keep their own headings; give the page one level-1 heading
 * (usually the Hero's).
 */
export function SiteLayout({ header, children, footer, width = 'wide', skipLabel = 'Skip to content', ...data }: SiteLayoutProps) {
  const mainId = useId();
  // The header's hairline shows only while content is under it (materials AD2): one boolean, set on change only.
  const [under, setUnder] = useState(false);
  useEffect(() => {
    const read = () => setUnder(window.scrollY > 0);
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, []);
  return (
    <div {...data} data-dl="site-layout" data-width={width}>
      <a href={`#${mainId}`} data-dl-skip="">
        {skipLabel}
      </a>
      <header data-dl-part="header" data-material="chrome" data-elevation="2" data-under={under ? '' : undefined}>
        <div data-dl-part="column">{header}</div>
      </header>
      <main id={mainId} tabIndex={-1} data-dl-part="main">
        <div data-dl-part="column">{children}</div>
      </main>
      {footer}
    </div>
  );
}
