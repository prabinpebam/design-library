import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
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
  /** `spaced` (default): the page's space above the first band; `flush`: the first band meets the header, for an opening picture or tinted band. */
  opening?: 'spaced' | 'flush';
}

/**
 * A website's page: the site header at the top (it stays while the page scrolls, on the chrome material: frosted when
 * the setting is on, with its hairline only while content is under it), the page's parts in one centred
 * column spaced as sections, and the footer across the full width. The window scrolls; the margins hold at every width.
 * Not for an app with its own panes (ChatLayout, ListDetail) or for documentation with a side navigation (LibraryLayout).
 * Frame settings (ID4): the column's width, margin, gap and the space above the first band are theme settings, set with
 * `applySettings` from `@design-library/core/theme` (the allow-list is `tokens/settings.json`).
 * @tier 3
 * @a11y A skip link first, to the `main` landmark; the header slot sits in a `banner` (`header`) landmark and the
 * Footer brings its own `contentinfo`. The column's parts keep their own headings; give the page one level-1 heading
 * (usually the Hero's). The header's measured height is public as `--dl-chrome-block` on the layout's root, so
 * anything that sticks under the header (StickyBar) starts below it and focused content clears it.
 */
export function SiteLayout({ header, children, footer, width = 'wide', skipLabel = 'Skip to content', opening = 'spaced', ...data }: SiteLayoutProps) {
  const mainId = useId();
  // The header's hairline shows only while content is under it (materials AD2): one boolean, set on change only.
  const [under, setUnder] = useState(false);
  useEffect(() => {
    const read = () => setUnder(window.scrollY > 0);
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, []);
  // A Frame sized to the window (Q90) subtracts the header it shares the window with; written straight to the style.
  // The window scrolls under the sticky header, so the page's scroll padding is the header's height: anything focused
  // or jumped to stops below it, never under it (WCAG 2.4.11; layout LY4).
  const root = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    const head = headerRef.current;
    if (!el || !head || typeof ResizeObserver === 'undefined') return;
    const page = document.documentElement;
    const measure = () => {
      const height = `${head.getBoundingClientRect().height}px`;
      el.style.setProperty('--dl-chrome-block', height);
      page.style.scrollPaddingBlockStart = height;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(head);
    return () => {
      observer.disconnect();
      page.style.removeProperty('scroll-padding-block-start');
    };
  }, []);
  return (
    <div {...data} ref={root} data-dl="site-layout" data-width={width} data-opening={opening === 'flush' ? 'flush' : undefined}>
      <a href={`#${mainId}`} data-dl-skip="">
        {skipLabel}
      </a>
      <header ref={headerRef} data-dl-part="header" data-material="chrome" data-elevation="2" data-under={under ? '' : undefined}>
        <div data-dl-part="column">{header}</div>
      </header>
      <main id={mainId} tabIndex={-1} data-dl-part="main">
        <div data-dl-part="column">{children}</div>
      </main>
      {footer}
    </div>
  );
}
