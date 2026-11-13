import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { ScrollArea } from '../fundamentals/ScrollArea';
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
  /** `full` lets the view take the whole width (a board that scrolls sideways); `column` holds it to a readable width; `edge` gives the view the whole main area under the header, with no page margin and no scroller of its own (an EditorLayout with `height="fill"`, which scrolls its own panels). `head` and `aside` don't apply with `edge`. */
  width?: 'full' | 'column' | 'edge';
  /**
   * How the sidebar sits beside the view. Left out: docked, floating over the view below 48 rem of the layout's own
   * width. `docked`: always beside the view. `floating`: always over the view, under the header, closing on a press
   * outside it and its toggle (and on Escape). `auto`: docked from `floatBelow` of the layout's own width, floating under it.
   */
  startMode?: 'docked' | 'floating' | 'auto';
  /** With `startMode="auto"`: the layout width below which the sidebar floats, a CSS length in px, rem or em (default "48rem"). */
  floatBelow?: string;
  /** Adds a pin at the top of the sidebar while it can dock (not while `auto` floats it): pressed while docked; pressing it asks for the other mode. The parent owns the mode: set `startMode` here. */
  onStartModeChange?: (mode: 'docked' | 'floating') => void;
  /** `fill` takes the height its parent gives it; `screen` the whole window (an app on its own); `lg` holds a set height (a demonstration). */
  height?: 'fill' | 'screen' | 'lg';
  /** `main` (default): the header tops the main area and the sidebar runs the full height beside it. `across`: the header spans the whole layout and the sidebar sits under it, docked or floating (an app whose bar holds its name). */
  headerSpan?: 'main' | 'across';
  /** The sidebar controls' names, in the product's words. `open` and `close` name the header's toggle (default "Open sidebar", "Close sidebar"; give both the same words to keep one name, its state carried by `aria-expanded`). `pin` names the pin (default "Pin" and the sidebar's label), announced as pressed while docked; with `unpin` the pin's name changes instead ("Pin navigation", "Unpin navigation") and it isn't a toggle button. */
  labels?: { open?: string; close?: string; pin?: string; unpin?: string };
  /** `m` (default) a 56 px header and a 16 rem sidebar; `s` a dense app frame (LR41), a desktop editor's 40 px bar and a 13 rem sidebar. Pair it with Navigation `size="s"`. */
  size?: 'm' | 's';
}

/**
 * A working app: a collapsible sidebar of places, a header, and the view, which scrolls on its own; optionally a details
 * column beside it. For tools people work in all day: a tracker, an admin, a dashboard, a mail client. Not for a
 * conversation (ChatLayout), an editor with a canvas (EditorLayout) or a website (SiteLayout).
 * @tier 3
 * @a11y The sidebar is a labelled `aside` the header's toggle controls (`aria-expanded`); the view is the `main`
 * region, named by `label`; the details column is a labelled `aside` after it in the source. The view's scroller is
 * focusable, so the keyboard can scroll it. In a narrow window the floating sidebar closes with Escape and returns focus
 * to the toggle. With `startMode`, a floating sidebar also closes on a press outside it and its toggle; the pin (with
 * `onStartModeChange`) is a toggle button named "Pin" and the sidebar's label, pressed (`aria-pressed`) while docked.
 * `width="edge"` keeps the view the `main` region, named by `label`, without the layout's scroller.
 * @key Escape: closes the floating sidebar
 */
export function AppLayout({ sidebar, sidebarLabel = 'Navigation', sidebarOpen, onSidebarToggle, header, headerEnd, head, children, label, aside, asideLabel = 'Details', width = 'column', height = 'fill', startMode, floatBelow = '48rem', onStartModeChange, headerSpan = 'main', labels, size = 'm', ...data }: AppLayoutProps) {
  const sidebarId = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLSpanElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [narrow, setNarrow] = useState(false);
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

  // auto: the layout measures its own width against floatBelow (a prop, so not a stylesheet container query).
  useEffect(() => {
    const el = root.current;
    if (startMode !== 'auto' || !el) return;
    const limit = () => {
      const n = parseFloat(floatBelow);
      return floatBelow.endsWith('rem') ? n * rem() : floatBelow.endsWith('em') ? n * parseFloat(getComputedStyle(el).fontSize) : n;
    };
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < limit()));
    observer.observe(el);
    return () => observer.disconnect();
  }, [startMode, floatBelow]);

  // The sidebar's resolved placement; undefined keeps the stylesheet's own 48 rem container query.
  const placement = startMode === 'floating' || (startMode === 'auto' && narrow) ? 'floating' : startMode ? 'docked' : undefined;
  const floatsNow = () => placement === 'floating' || (placement === undefined && (root.current?.clientWidth ?? Infinity) < rem() * 48);

  // While the sidebar floats, Escape closes it and focus returns to the toggle.
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !floatsNow()) return;
      onSidebarToggle();
      toggle.current?.querySelector('button')?.focus();
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  });

  // startMode floating (chosen or by auto): a press outside the sidebar and its toggle closes it.
  useEffect(() => {
    if (!sidebarOpen || placement !== 'floating') return;
    const press = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || sidebarRef.current?.contains(target) || toggle.current?.contains(target)) return;
      onSidebarToggle();
    };
    document.addEventListener('pointerdown', press);
    return () => document.removeEventListener('pointerdown', press);
  }, [sidebarOpen, placement, onSidebarToggle]);

  const docked = placement === 'docked';
  const canDock = startMode === 'docked' || startMode === 'floating' || (startMode === 'auto' && !narrow);
  const view = head ? (
    <>
      <div data-dl-part="head">{head}</div>
      <div data-dl-part="content">{children}</div>
    </>
  ) : (
    children
  );

  return (
    <div ref={root} {...data} data-dl="app-layout" data-sidebar={sidebarOpen ? 'open' : 'closed'} data-height={height} data-width={width} data-start={placement} data-header={headerSpan === 'across' ? 'across' : undefined} data-size={size === 's' ? 's' : undefined}>
      {/* The sidebar is app chrome (Q97): the compact density context, small text and tighter corners. */}
      <aside ref={sidebarRef} id={sidebarId} data-dl-part="sidebar" data-density="compact" aria-label={sidebarLabel} hidden={!sidebarOpen}>
        {onStartModeChange && canDock && (
          <div data-dl-part="sidebar-head">
            {/* toggle-button: the sidebar's pin in its own head, docking or floating it, where a Switch would break the head's row of icon buttons */}
            <Button label={labels?.unpin && docked ? labels.unpin : labels?.pin ?? `Pin ${sidebarLabel.toLowerCase()}`} icon={labels?.unpin && docked ? 'pin-filled' : 'pin'} pressedIcon="pin-filled" iconOnly size="xs" emphasis="quiet" pressed={labels?.unpin ? undefined : docked} onClick={() => onStartModeChange(docked ? 'floating' : 'docked')} />
          </div>
        )}
        <ScrollArea data-dl-part="sidebar-list">
          <div data-dl-part="sidebar-content">{sidebar}</div>
        </ScrollArea>
      </aside>
      <div data-dl-part="main">
        <header data-dl-part="header">
          <span ref={toggle} data-dl-part="toggle">
            <Button label={sidebarOpen ? labels?.close ?? 'Close sidebar' : labels?.open ?? 'Open sidebar'} icon="menu" iconOnly size="s" emphasis="quiet" expanded={sidebarOpen} controls={sidebarId} onClick={onSidebarToggle} />
          </span>
          <span data-dl-part="header-start">{header}</span>
          <span data-dl-part="header-end">{headerEnd}</span>
        </header>
        {width === 'edge' ? (
          <main data-dl-part="edge" aria-label={label}>
            {children}
          </main>
        ) : (
          <ScrollArea data-dl-part="scroll" axis="both" tabIndex={0}>
            <div data-dl-part="body">
              <main data-dl-part="view" aria-label={label}>
                {view}
              </main>
              {aside && (
                <aside data-dl-part="aside" data-density="compact" aria-label={asideLabel}>
                  {aside}
                </aside>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
