import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import type { DataAttributes } from '../types';

export interface AppLayoutProps extends DataAttributes {
  /** The sidebar: the product's places (Navigation), a switcher, the account. */
  sidebar: ReactNode;
  /** Names the sidebar region: "Navigation" (default). */
  sidebarLabel?: string;
  /** Whether the sidebar shows. In a narrow window it floats over the content while open. */
  sidebarOpen: boolean;
  /** The sidebar toggle in the header was pressed. */
  onSidebarToggle: () => void;
  /** The header after the toggle: where you are (Breadcrumbs) or the view's controls. */
  header?: ReactNode;
  /** The header's end: search, the main action, the account. */
  headerEnd?: ReactNode;
  /** The view's head: its title (and a line under it). It leads everything in the view, one unit at the page level above the view's content. */
  head?: ReactNode;
  /** The view: it scrolls on its own, with the page margin around it. */
  children: ReactNode;
  /** Names the view's region: the view's title. */
  label: string;
  /** A details column beside the view (an item's fields); under it in a narrow window. */
  aside?: ReactNode;
  /** Names the details column: "Details" (default). */
  asideLabel?: string;
  /** `full` lets the view take the whole width (a board that scrolls sideways); `column` holds it to a readable width. */
  width?: 'full' | 'column';
  /** `fill` takes the height its parent gives it; `screen` the whole window (an app on its own); `lg` holds a set height (a demonstration). */
  height?: 'fill' | 'screen' | 'lg';
}

/**
 * A working app: a collapsible sidebar of places, a header, and the view, which scrolls on its own; optionally a details
 * column beside it. For tools people work in all day: a tracker, an admin, a dashboard, a mail client. Not for a
 * conversation (ChatLayout), an editor with a canvas (EditorLayout) or a website (SiteLayout).
 * @tier 3
 * @a11y The sidebar is a labelled `aside` the header's toggle controls (`aria-expanded`); the view is the `main`
 * region, named by `label`; the details column is a labelled `aside` after it in the source. The view's scroller is
 * focusable, so the keyboard can scroll it. In a narrow window the floating sidebar closes with Escape and returns focus
 * to the toggle.
 * @key Escape: closes the floating sidebar
 */
export function AppLayout({ sidebar, sidebarLabel = 'Navigation', sidebarOpen, onSidebarToggle, header, headerEnd, head, children, label, aside, asideLabel = 'Details', width = 'column', height = 'fill', ...data }: AppLayoutProps) {
  const sidebarId = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLSpanElement>(null);

  // Below 48 rem of its own width (the stylesheet's container query) the open sidebar floats; Escape closes it then.
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = (event: KeyboardEvent) => {
      const el = root.current;
      if (event.key !== 'Escape' || !el || el.clientWidth >= parseFloat(getComputedStyle(document.documentElement).fontSize) * 48) return;
      onSidebarToggle();
      toggle.current?.querySelector('button')?.focus();
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [sidebarOpen, onSidebarToggle]);

  return (
    <div ref={root} {...data} data-dl="app-layout" data-sidebar={sidebarOpen ? 'open' : 'closed'} data-height={height} data-width={width}>
      <aside id={sidebarId} data-dl-part="sidebar" aria-label={sidebarLabel} hidden={!sidebarOpen}>
        {sidebar}
      </aside>
      <div data-dl-part="main">
        <header data-dl-part="header">
          <span ref={toggle} data-dl-part="toggle">
            <Button label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} icon="menu" iconOnly size="s" emphasis="quiet" expanded={sidebarOpen} controls={sidebarId} onClick={onSidebarToggle} />
          </span>
          <span data-dl-part="header-start">{header}</span>
          <span data-dl-part="header-end">{headerEnd}</span>
        </header>
        <div data-dl-part="scroll" tabIndex={0}>
          <div data-dl-part="body">
            <main data-dl-part="view" aria-label={label}>
              {head ? (
                <>
                  <div data-dl-part="head">{head}</div>
                  <div data-dl-part="content">{children}</div>
                </>
              ) : (
                children
              )}
            </main>
            {aside && (
              <aside data-dl-part="aside" aria-label={asideLabel}>
                {aside}
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
