import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { useRouter } from '../behaviour/router';
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
  /** The app's name (and mark) at the header's start, after the toggle, linking to its home view (a dashboard), as SiteHeader's name does (LR90). The name is the link's name; the mark is decorative. Left out: no brand. */
  brand?: AppLayoutBrand;
  /** The header after the toggle: where you are (Breadcrumbs) or the view's controls. */
  header?: ReactNode;
  /** The header's end: search, the main action, the account. A render function receives whether compactHeader is below floatBelow, so supplementary words can yield without removing controls. */
  headerEnd?: ReactNode | ((compact: boolean) => ReactNode);
  /** Keep the header end at its natural, single-line width and let the start shrink (pair long trails with Breadcrumbs truncate). Default false. The render function's compact state follows floatBelow of the layout's own width, independently of sidebar placement. */
  compactHeader?: boolean;
  /** Below this width of the layout (a CSS length in px, rem or em, such as "56rem"), the header wraps instead of squeezing (LR152): the toggle and its start on one row, the end on a row of its own under it, each wrapping its parts, so nothing paints over anything and every control stays reachable; a floating sidebar opens under the taller header. Left out: the header keeps one row (default). */
  headerWrapBelow?: string;
  /** Round the sidebar and details surfaces with the layout's panel radius. Default false. */
  roundedPanels?: boolean;
  /** The view's head: its title (and a line under it). It leads everything in the view, one unit at the page level above the view's content. */
  head?: ReactNode;
  /** The view's actions at the end of its head's row (New page, Add a talk), level with the title's last line and wrapping under it in a narrow view (LR52). Without it the head is the title alone. */
  headActions?: ReactNode;
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
  /** `m` (default) a 56 px header and a 16 rem sidebar; `s` a dense app frame (LR41, LR42), a desktop editor's 40 px bar, a 13 rem sidebar and the view's title a section's step over its content. Pair it with Navigation `size="s"`. */
  size?: 'm' | 's';
  /** How wide the view's fields, lists and form rows may grow: measure (default) a reading line (size.measure); wide up to size.wide (LR80), an editing app whose rows fill its panels. */
  measure?: 'measure' | 'wide';
  /** The view's head (its title and headActions) stops at the same measure as the lists and fields under it (LR158), so its actions end with the content beneath them, not at the window's end, as an editor's screen head does. Default false: the head spans the view. */
  headMeasure?: boolean;
}

/** AppLayout's brand (LR90): the app's name, where it leads and an optional mark drawn before the name. */
export interface AppLayoutBrand { name: string; href: string; mark?: ReactNode }

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
export function AppLayout({ sidebar, sidebarLabel = 'Navigation', sidebarOpen, onSidebarToggle, brand, header, headerEnd, compactHeader = false, headerWrapBelow, roundedPanels = false, head, headActions, children, label, aside, asideLabel = 'Details', width = 'column', height = 'fill', startMode, floatBelow = '48rem', onStartModeChange, headerSpan = 'main', labels, size = 'm', measure = 'measure', headMeasure = false, ...data }: AppLayoutProps) {
  const sidebarId = useId();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLSpanElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [wrapped, setWrapped] = useState(false);
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const toPx = (length: string, el: Element) => {
    const n = parseFloat(length);
    return length.endsWith('rem') ? n * rem() : length.endsWith('em') ? n * parseFloat(getComputedStyle(el).fontSize) : n;
  };

  // auto: the layout measures its own width against floatBelow (a prop, so not a stylesheet container query).
  useEffect(() => {
    const el = root.current;
    if ((startMode !== 'auto' && !compactHeader) || !el) return;
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < toPx(floatBelow, el)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [startMode, floatBelow, compactHeader]);

  // LR152 headerWrapBelow: the same measure decides the wrap; while wrapped, the floating sidebar's top follows the header's height.
  useEffect(() => {
    const el = root.current;
    const head = headerRef.current;
    if (!headerWrapBelow || !el || !head) { setWrapped(false); return; }
    const observer = new ResizeObserver(() => {
      const wrap = el.getBoundingClientRect().width < toPx(headerWrapBelow, el);
      setWrapped(wrap);
      if (wrap) el.style.setProperty('--c-app-layout-header-offset', `${head.getBoundingClientRect().height}px`);
      else el.style.removeProperty('--c-app-layout-header-offset');
    });
    observer.observe(el);
    observer.observe(head);
    return () => { observer.disconnect(); el.style.removeProperty('--c-app-layout-header-offset'); };
  }, [headerWrapBelow]);

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
      {headActions !== undefined ? (
        <div data-dl-part="head" data-actions="">
          <div data-dl-part="head-words">{head}</div>
          <div data-dl-part="head-actions">{headActions}</div>
        </div>
      ) : (
        <div data-dl-part="head">{head}</div>
      )}
      <div data-dl-part="content">{children}</div>
    </>
  ) : (
    children
  );

  return (
    <div ref={root} {...data} data-dl="app-layout" data-sidebar={sidebarOpen ? 'open' : 'closed'} data-height={height} data-width={width} data-start={placement} data-header={headerSpan === 'across' ? 'across' : undefined} data-compact-header={compactHeader ? '' : undefined} data-header-wrap={wrapped ? '' : undefined} data-rounded-panels={roundedPanels ? '' : undefined} data-size={size === 's' ? 's' : undefined} data-measure={measure === 'wide' ? 'wide' : undefined} data-head-measure={headMeasure ? '' : undefined}>
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
        <header ref={headerRef} data-dl-part="header">
          <span ref={toggle} data-dl-part="toggle">
            <Button label={sidebarOpen ? labels?.close ?? 'Close sidebar' : labels?.open ?? 'Open sidebar'} icon="menu" iconOnly size="s" emphasis="quiet" expanded={sidebarOpen} controls={sidebarId} onClick={onSidebarToggle} />
          </span>
          <span data-dl-part="header-start" data-brand={brand ? '' : undefined}>
            {brand && (
              <a data-dl-part="brand" href={router ? router.href(brand.href) : brand.href}>
                {brand.mark && <span data-dl-part="brand-mark" aria-hidden="true">{brand.mark}</span>}
                <span data-dl-part="brand-name">{brand.name}</span>
              </a>
            )}
            {compactHeader ? <span data-dl-part="header-content">{header}</span> : header}
          </span>
          <span data-dl-part="header-end">{typeof headerEnd === 'function' ? headerEnd(compactHeader && narrow) : headerEnd}</span>
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
