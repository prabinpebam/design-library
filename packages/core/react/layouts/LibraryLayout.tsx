import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { ScrollArea } from '../fundamentals/ScrollArea';

export interface LibraryLayoutProps {
  /** Product identity, version and global status. */
  header: ReactNode;
  /** Navigation for the whole app; scrolls on its own from breakpoint.md. */
  nav: ReactNode;
  /** Accessible name of the navigation region. */
  navLabel: string;
  /** The current page. */
  main: ReactNode;
  /** An optional working pane beside main (a revision or inspector pane). Beside main from breakpoint.md, a bounded sheet over the bottom of the screen below it; never a modal. */
  aside?: ReactNode;
  /** Accessible name of the pane; required with `aside`. */
  asideLabel?: string;
  /** Visible-on-focus link that jumps past header and navigation. */
  skipLabel?: string;
  /**
   * Identity of the page in `main` (a route). When it changes, main's content fades out completely
   * (`duration.page-out`), main returns to the top at once while nothing shows, the new page replaces it and fades in
   * (`duration.page-in`); focus moves to the new page's `h1`. Without it, `main` swaps in place.
   */
  pageKey?: string;
  /** Called once the page named by `pageKey` is in place, at the top and fading in (and on first render). */
  onPageShown?: (pageKey: string) => void;
  /**
   * Where the navigation's width is remembered in this browser (a `localStorage` key). Without it the person can still
   * resize the navigation, but the width resets on reload.
   */
  navWidthKey?: string;
  /** Accessible name of the handle that resizes the navigation. */
  navResizeLabel?: string;
}

const ms = (value: string) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? (value.trim().endsWith('ms') ? n : n * 1000) : 0;
};

/**
 * The page change, strictly sequential: the old page fades out completely, then main returns to the top and the new
 * page replaces it while nothing shows, then the new page fades in once it has painted. Never two pages at once; a new
 * target mid-change goes straight to the latest page.
 */
type Phase = 'idle' | 'out' | 'swap';

function usePageChange(pageKey: string | undefined, main: ReactNode, onPageShown?: (pageKey: string) => void) {
  const content = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<{ key: string | undefined; swap: number }>({ key: pageKey, swap: 0 });
  const [phase, setPhase] = useState<Phase>('idle');
  const held = useRef(main);
  const live = pageKey === shown.key && phase !== 'out';
  if (live) held.current = main;

  useEffect(() => {
    if (pageKey === shown.key) return;
    const region = content.current;
    let done = false;
    const swap = () => {
      if (done) return;
      done = true;
      setShown((s) => ({ key: pageKey, swap: s.swap + 1 }));
      setPhase('swap');
    };
    if (!region) return swap();
    const out = ms(getComputedStyle(region).getPropertyValue('--duration-page-out'));
    // Reduced motion: no fade at all, the new page simply replaces the old one.
    if (out === 0 || (phase === 'out' && getComputedStyle(region).opacity === '0')) return swap();
    if (phase !== 'out') return setPhase('out');
    const onEnd = (event: TransitionEvent) => {
      if (event.target === region && event.propertyName === 'opacity') swap();
    };
    region.addEventListener('transitionend', onEnd);
    // A tab that isn't painting never ends its transition.
    const timer = window.setTimeout(swap, out + 50);
    return () => {
      region.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
    };
  }, [pageKey, shown.key, phase]);

  useLayoutEffect(() => {
    if (shown.swap === 0) {
      if (shown.key !== undefined) onPageShown?.(shown.key);
      return;
    }
    const region = content.current;
    // Instant, while main shows nothing: never an animated scroll.
    region?.closest<HTMLElement>("[data-dl-part='viewport']")?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const title = region?.querySelector<HTMLElement>('h1');
    if (title) {
      if (!title.hasAttribute('tabindex')) title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
    if (shown.key !== undefined) onPageShown?.(shown.key);
    const fadeIn = () => setPhase((p) => (p === 'swap' ? 'idle' : p));
    if (!region || ms(getComputedStyle(region).getPropertyValue('--duration-page-in')) === 0) return fadeIn();
    // Fade in only after the new page's first paint, so its own layout time never eats the fade; a tab that isn't
    // painting runs no frames, so a timer makes sure the page never stays unseen.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(fadeIn);
    });
    const timer = window.setTimeout(fadeIn, ms(getComputedStyle(region).getPropertyValue('--duration-page-in')));
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
    // Keyed on the swap alone; onPageShown is read when it happens.
  }, [shown]);

  return { content, page: live ? main : held.current, phase };
}

/** One keyboard step of the navigation handle, in px; Shift takes four. */
const STEP = 16;

/** A token length (`14rem`, `224px`) in px, read where it applies. */
const px = (el: Element, name: string) => {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return 0;
  return v.endsWith('rem') ? n * parseFloat(getComputedStyle(document.documentElement).fontSize) : n;
};

/**
 * The navigation's width as the person set it, in px (undefined: the token's starting width), remembered under `key`.
 * The CSS clamps it between `size.nav-width-min` and `size.nav-width-max`, so a stored width from a wider window is safe.
 */
function useNavWidth(key: string | undefined) {
  const [width, setWidth] = useState<number | undefined>(() => {
    if (!key) return undefined;
    try {
      const n = Number(localStorage.getItem(key));
      return n > 0 ? n : undefined;
    } catch {
      return undefined;
    }
  });
  const remember = (next: number | undefined) => {
    if (!key) return;
    try {
      if (next === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, String(Math.round(next)));
    } catch {
      // Storage can be unavailable (private mode, a full quota): the width still applies for this visit.
    }
  };
  return { width, setWidth, remember };
}

/**
 * The handle on the navigation's end edge: drag it, or focus it and use the arrow keys, to resize the navigation;
 * double-click to return to the starting width. A window splitter (APG) whose value is the width in px.
 */
function NavResizer({ layout, nav, label, width, setWidth, remember }: { layout: RefObject<HTMLDivElement | null>; nav: string; label: string } & ReturnType<typeof useNavWidth>) {
  const [bounds, setBounds] = useState({ min: 0, max: 0, start: 0 });
  const drag = useRef<{ x: number; width: number; dir: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  useLayoutEffect(() => {
    const el = layout.current;
    if (!el) return;
    setBounds({ min: px(el, '--size-nav-width-min'), max: px(el, '--size-nav-width-max'), start: px(el, '--size-nav-width') });
  }, [layout]);
  const clamp = (n: number) => Math.min(bounds.max || n, Math.max(bounds.min, n));
  const now = clamp(width ?? bounds.start);
  const dirOf = (el: Element) => (getComputedStyle(el).direction === 'rtl' ? -1 : 1);
  const set = (n: number | undefined, keep = true) => {
    const next = n === undefined ? undefined : clamp(n);
    setWidth(next);
    if (keep) remember(next);
  };
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-controls={nav}
      aria-valuenow={Math.round(now)}
      aria-valuemin={Math.round(bounds.min)}
      aria-valuemax={Math.round(bounds.max)}
      aria-valuetext={`${Math.round(now)} pixels wide`}
      tabIndex={0}
      data-dl-resize="nav"
      data-dragging={dragging ? '' : undefined}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, width: now, dir: dirOf(e.currentTarget) };
        setDragging(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (d) set(d.width + (e.clientX - d.x) * d.dir, false);
      }}
      onPointerUp={() => {
        drag.current = null;
        setDragging(false);
        remember(width === undefined ? undefined : clamp(width));
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
      onDoubleClick={() => set(undefined)}
      onKeyDown={(e) => {
        const step = (e.shiftKey ? 4 : 1) * STEP * dirOf(e.currentTarget);
        const to = e.key === 'ArrowRight' ? now + step : e.key === 'ArrowLeft' ? now - step : e.key === 'Home' ? bounds.min : e.key === 'End' ? bounds.max : e.key === 'Enter' ? undefined : null;
        if (to === null) return;
        e.preventDefault();
        set(to);
      }}
    />
  );
}
/**
 * A screen with a header, a navigation region, a main region and an optional side pane, for catalogue-style apps.
 * Not for single-task screens or dialogs; use a focused layout there.
 * @tier 3
 * @a11y Renders a skip link, then `header`, `nav` (named by `navLabel`), `main` and, when given, a complementary
 * `aside` named by `asideLabel`. Regions scroll edge to edge; padding sits on their content, so focus rings are never
 * clipped. The pane never traps focus: below breakpoint.md it covers at most the lower part of the screen and main
 * keeps room to scroll past it. With `pageKey`, a page change fades main's content out, puts main back at the top,
 * then fades the new page in (100 + 100 ms, instant under reduced motion); header, navigation and pane never fade.
 * The fading page takes no pointer input. Focus moves to the new page's `h1`. From breakpoint.md a handle on the
 * navigation's end edge resizes it (a window splitter: `role="separator"` with its width as the value, 24 px wide,
 * invisible until hovered, focused or dragged); the width stays between `size.nav-width-min` and `size.nav-width-max`
 * and is remembered under `navWidthKey`.
 * @key Tab from the top of the page reaches the skip link first; Enter moves focus to main.
 * @key Arrow left / Arrow right: on the navigation handle, narrows or widens the navigation by 16 px (Shift: 64 px)
 * @key Home / End: on the navigation handle, the narrowest or widest navigation
 * @key Enter: on the navigation handle, back to the starting width (as does a double-click)
 */
export function LibraryLayout({ header, nav, navLabel, main, aside, asideLabel, skipLabel = 'Skip to content', pageKey, onPageShown, navWidthKey, navResizeLabel = 'Resize navigation' }: LibraryLayoutProps) {
  const { content, page, phase } = usePageChange(pageKey, main, onPageShown);
  const layout = useRef<HTMLDivElement>(null);
  const navId = useId();
  const navWidth = useNavWidth(navWidthKey);
  return (
    <div
      ref={layout}
      data-dl="library-layout"
      data-has-aside={aside ? '' : undefined}
      style={navWidth.width === undefined ? undefined : ({ '--library-layout-nav-width': `${navWidth.width}px` } as CSSProperties)}
    >
      <a
        href="#main"
        data-dl-skip=""
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {skipLabel}
      </a>
      <header data-dl-region="header">{header}</header>
      <nav data-dl-region="nav" id={navId} aria-label={navLabel}>
        <ScrollArea mode="auto">
          <div data-dl-region-content="nav">{nav}</div>
        </ScrollArea>
      </nav>
      <NavResizer layout={layout} nav={navId} label={navResizeLabel} {...navWidth} />
      <main data-dl-region="main">
        <ScrollArea mode="always" id="main" tabIndex={-1}>
          <div data-dl-region-content="main" data-dl-page={phase === 'idle' ? undefined : phase} ref={content}>
            {page}
          </div>
        </ScrollArea>
      </main>
      {aside && (
        <aside data-dl-region="aside" aria-label={asideLabel}>
          <ScrollArea mode="auto">
            <div data-dl-region-content="aside">{aside}</div>
          </ScrollArea>
        </aside>
      )}
    </div>
  );
}
