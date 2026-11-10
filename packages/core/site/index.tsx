import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { announce } from '../react/behaviour/announce';
import { cssMs } from '../react/behaviour/anchor';
import { viewTransition } from '../react/behaviour/motion';
import { glide } from '../react/behaviour/glide';
import { RouterContext, useRouter, type Route, type RouterApi } from '../react/behaviour/router';

export type { Route, RouterApi } from '../react/behaviour/router';
export { useRouter } from '../react/behaviour/router';

export interface RouterProps {
  /** `hash` (default): routes live after `#/`, so the site works on any static host. `history`: real paths, which need a host that serves the page for every path. */
  mode?: 'hash' | 'history';
  /** History mode only: the path the site is served under, such as `/design`. */
  base?: string;
  /**
   * Where focus goes after a page change: a selector inside the new page (default `main h1`, else `main`). `false` leaves
   * focus alone. A function picks per change (MP1): `(to, from) => selector | false`.
   */
  focus?: string | false | ((to: Route, from: Route) => string | false);
  /**
   * Where a new page lands (MP1): `'top'` (default, as before) scrolls to the top, or to its anchor; `'keep'` keeps the
   * place, so moving between sibling pages (one year to the next) leaves the page where it was, and focus stays where
   * it is unless `focus` is a function; the new page's heading is still announced. A function picks per change, such
   * as `'keep'` between two pages of one archive and `'top'` for any other link. An anchor always wins.
   */
  scroll?: PageScroll | ((to: Route, from: Route) => PageScroll);
  /**
   * A link to the page already shown (MP1): `'none'` (default, as before) does nothing but call `onChange`; `'top'`
   * glides back to the top on the motion tokens (at once under reduced motion), as a header link to the current page
   * does on many sites. Links with an anchor are anchor links and always go to it.
   */
  again?: 'none' | 'top';
  /** What is announced after a page change: the default says the focused heading's words; return `''` to say nothing. */
  announcement?: (route: Route, heading: string) => string;
  /** Links in the page (`<a href>` anywhere, such as rich text from content) are handled by the router too. Default `true`. */
  handleLinks?: boolean;
  /** Told of every route change, after it is shown. */
  onChange?: (route: Route) => void;
  /**
   * How a new page replaces the old one (IP30): `'none'` (default, swaps at once, as before) or `'fade'` (one
   * cross-fade on the motion tokens through `viewTransition`). A function picks per change. Reduced motion always
   * swaps at once. Only a change of path counts as a new page; an anchor or query change on the same page never fades.
   */
  transition?: PageTransition | ((to: Route, from: Route) => PageTransition);
  /**
   * Gets a new page ready before it is shown (load its picture or data). The old page stays, usable, until the promise
   * settles or `wait` passes, whichever is first; a failure still shows the page. Called only for a change of path.
   */
  prepare?: (to: Route, from: Route) => Promise<unknown> | void;
  /** The longest `prepare` may hold the old page, in ms; defaults to the `--duration-indicator-delay` token (300 ms), so the swap never needs a loading indicator. */
  wait?: number;
  /** Called when the pointer rests on, or focus reaches, a link to another page, so its picture can start loading early. */
  warm?: (to: Route) => void;
  children: ReactNode;
}

/** The page transitions a router can run by name. */
export type PageTransition = 'none' | 'fade';

/** Where a new page lands: at the top (or its anchor), or where the old page was. */
export type PageScroll = 'top' | 'keep';

/** Loads and decodes a picture: resolves when it can be drawn at once, or when it fails. For `Router` `prepare` and `warm`. */
export function loadPicture(src: string): Promise<void> {
  const img = new Image();
  img.src = src;
  return img.decode().catch(() => undefined);
}

type Entry = { route: Route; how: 'first' | 'push' | 'pop'; scroll?: number };

const clean = (path: string) => {
  const p = `/${path.replace(/^\/+/, '')}`.replace(/(.)\/+$/, '$1');
  return p || '/';
};

function split(to: string) {
  const hashAt = to.indexOf('#');
  const before = hashAt < 0 ? to : to.slice(0, hashAt);
  const anchor = hashAt < 0 ? null : decodeURIComponent(to.slice(hashAt + 1)) || null;
  const queryAt = before.indexOf('?');
  return { path: queryAt < 0 ? before : before.slice(0, queryAt), search: queryAt < 0 ? '' : before.slice(queryAt), anchor };
}

/**
 * Reads the route from the address. Hash mode: `#/talks?q=a#speakers` is path `/talks`, query `q=a` and anchor
 * `speakers`; a plain `#main` (a skip link) is an anchor on the route already shown.
 */
function readRoute(mode: 'hash' | 'history', base: string, last: Route | null): Route {
  if (mode === 'hash') {
    const hash = window.location.hash;
    if (hash.startsWith('#/')) {
      const { path, search, anchor } = split(hash.slice(1));
      return { path: clean(path), query: new URLSearchParams(search), anchor };
    }
    const anchor = hash.length > 1 ? decodeURIComponent(hash.slice(1)) : null;
    return { path: last?.path ?? '/', query: last?.query ?? new URLSearchParams(), anchor };
  }
  const path = base && window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : window.location.pathname;
  return { path: clean(path), query: new URLSearchParams(window.location.search), anchor: window.location.hash.length > 1 ? decodeURIComponent(window.location.hash.slice(1)) : null };
}

const sameRoute = (a: Route, b: Route) => a.path === b.path && a.query.toString() === b.query.toString() && a.anchor === b.anchor;

/** Gives a target focus without the browser's own jump (it isn't focusable by default, so it takes `tabindex="-1"`). */
function focusQuietly(el: HTMLElement) {
  if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/**
 * The core router (IP27, DR32): hash or history routes for a site's views, without owning them. Wrap the site in it,
 * read `useRoute()` to choose a view, and every `Link` (and any link in the page) to a route or an anchor goes through
 * it. A page change scrolls to the top (or to its anchor), moves focus to the new page's heading and announces it; an
 * anchor link scrolls to its target and focuses it without replacing the route; Back and Forward return to where the
 * person was. With `prepare` the old page stays until the new one is ready (IP30), and `transition="fade"` swaps them
 * in one cross-fade. `scroll="keep"` (or a function) keeps the place between sibling pages, and `again="top"` glides a
 * link to the shown page back to the top (MP1). Behaviour only: no styles, no views, no route table (the site decides
 * what each path shows).
 */
export function Router({ mode = 'hash', base = '', focus = 'main h1', scroll = 'top', again = 'none', announcement, handleLinks = true, onChange, transition = 'none', prepare, wait, warm, children }: RouterProps) {
  const root = clean(base) === '/' ? '' : clean(base);
  const [entry, setEntry] = useState<Entry>(() => ({ route: readRoute(mode, root, null), how: 'first' }));
  const [pending, setPending] = useState<Route | null>(null);
  const shown = useRef<Route | null>(null);
  const current = useRef(entry.route);
  current.current = entry.route;
  // The latest change wins: a slower prepare for an earlier click never shows its page.
  const latest = useRef(0);
  const swapWith = useRef({ transition, prepare, wait });
  swapWith.current = { transition, prepare, wait };
  const landWith = useRef({ scroll, focus, again });
  landWith.current = { scroll, focus, again };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const show = useCallback(async (next: Entry) => {
    const from = current.current;
    const id = ++latest.current;
    const { transition: pick, prepare: ready, wait: most } = swapWith.current;
    if (next.route.path === from.path) {
      setPending(null);
      setEntry(next);
      return;
    }
    if (ready) {
      setPending(next.route);
      const limit = most ?? (cssMs(document.documentElement, '--duration-indicator-delay') || 300);
      await Promise.race([Promise.resolve().then(() => ready(next.route, from)).catch(() => undefined), new Promise((done) => window.setTimeout(done, limit))]);
      if (id !== latest.current) return;
    }
    const name = typeof pick === 'function' ? pick(next.route, from) : pick;
    const apply = () =>
      flushSync(() => {
        setPending(null);
        setEntry(next);
      });
    if (name === 'fade') void viewTransition(apply);
    else if (ready) apply();
    else {
      setPending(null);
      setEntry(next);
    }
  }, []);

  const owns = useCallback((to: string) => (to.startsWith('/') && !to.startsWith('//')) || to.startsWith('#'), []);

  const urlFor = useCallback(
    (to: string) => {
      const target = mode === 'hash' && to.startsWith('#/') ? to.slice(1) : to;
      const anchorOnly = target.startsWith('#');
      const { path, search, anchor } = split(target);
      const route = anchorOnly ? current.current.path : clean(path);
      const query = anchorOnly ? current.current.query.toString() : search.replace(/^\?/, '');
      const tail = `${query ? `?${query}` : ''}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`;
      return mode === 'hash' ? `#${route}${tail}` : `${root}${route}${tail}`;
    },
    [mode, root],
  );

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      if (!owns(to)) {
        window.location.assign(to);
        return;
      }
      const url = urlFor(to);
      // A link to the page already shown (no anchor): with `again="top"` it glides back to the top and stays one entry.
      if (landWith.current.again === 'top' && url === urlFor(`${current.current.path}${current.current.query.toString() ? `?${current.current.query}` : ''}`)) {
        void glide(0);
        onChangeRef.current?.(current.current);
        return;
      }
      // Remember where this page was scrolled to, so Back returns there.
      history.replaceState({ ...(history.state ?? {}), dlScroll: window.scrollY }, '');
      if (options?.replace) history.replaceState({ dlScroll: 0 }, '', url);
      else history.pushState({ dlScroll: 0 }, '', url);
      void show({ route: readRoute(mode, root, current.current), how: 'push' });
    },
    [mode, root, owns, urlFor, show],
  );

  // Back, Forward and an address typed by hand.
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const onPop = (event: PopStateEvent | HashChangeEvent) => {
      const route = readRoute(mode, root, current.current);
      if (sameRoute(route, current.current)) return;
      const scroll = typeof history.state?.dlScroll === 'number' ? (history.state.dlScroll as number) : undefined;
      void show({ route, how: event.type === 'popstate' ? 'pop' : 'push', scroll });
    };
    window.addEventListener('popstate', onPop);
    if (mode === 'hash') window.addEventListener('hashchange', onPop);
    return () => {
      history.scrollRestoration = previous;
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, [mode, root, show]);

  // A link to another page under the pointer or focus: the site may start loading what that page needs.
  const warmRef = useRef(warm);
  warmRef.current = warm;
  const warms = !!warm;
  useEffect(() => {
    if (!warms) return;
    const seen = new Set<string>();
    const onIntent = (event: Event) => {
      const a = (event.target as Element | null)?.closest?.('a[href]');
      let to = a?.getAttribute('href') ?? '';
      if (mode === 'history' && root && to.startsWith(`${root}/`)) to = to.slice(root.length);
      if (mode === 'hash' && to.startsWith('#/')) to = to.slice(1);
      if (!to.startsWith('/') || to.startsWith('//') || seen.has(to)) return;
      const { path, search, anchor } = split(to);
      if (clean(path) === current.current.path) return;
      seen.add(to);
      warmRef.current?.({ path: clean(path), query: new URLSearchParams(search), anchor });
    };
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);
    return () => {
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, [warms, mode, root]);

  // Links anywhere in the page: a route or an anchor goes through the router; anything else is the browser's.
  useEffect(() => {
    if (!handleLinks) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const a = (event.target as Element | null)?.closest?.('a[href]');
      if (!a || a.hasAttribute('download') || (a.getAttribute('target') ?? '_self') !== '_self') return;
      let to = a.getAttribute('href') ?? '';
      if (mode === 'history' && root && to.startsWith(`${root}/`)) to = to.slice(root.length);
      if (!owns(to) || to === '#') return;
      event.preventDefault();
      navigate(to);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [handleLinks, mode, root, owns, navigate]);

  // After the new page is drawn (the views' own effects have run): scroll, focus and announce.
  useEffect(() => {
    const { route, how, scroll } = entry;
    const before = shown.current;
    shown.current = route;
    // A target that draws no box of its own (`display: contents`, a wrapper that steps aside) lands on its first child.
    const named = route.anchor ? document.getElementById(route.anchor) : null;
    const target = named && getComputedStyle(named).display === 'contents' ? ((named.firstElementChild as HTMLElement | null) ?? named) : named;
    if (!before) {
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }
    const newPage = before.path !== route.path;
    if (!newPage && before.anchor === route.anchor) {
      onChange?.(route);
      return;
    }
    // A new page lands at once; an anchor on the same page glides (IP17), stopping if the person scrolls.
    const land = landWith.current;
    const where = newPage ? (typeof land.scroll === 'function' ? land.scroll(route, before) : land.scroll) : 'top';
    const keep = where === 'keep' && !target;
    const aim = typeof land.focus === 'function' ? land.focus(route, before) : keep ? false : land.focus;
    const behavior = newPage ? 'instant' : 'auto';
    if (keep) {
      // The place stays; nothing scrolls.
    } else if (how === 'pop' && scroll !== undefined && !target) glide(scroll, { behavior: 'instant' });
    else glide(target ?? 0, { behavior });
    if (target) focusQuietly(target);
    else if (newPage) {
      const heading = aim === false ? null : (document.querySelector<HTMLElement>(aim) ?? document.querySelector<HTMLElement>('main'));
      if (heading) focusQuietly(heading);
      // Kept in place, focus stays on the link that was used, but the new page is still named.
      const named = heading ?? (keep && focus !== false ? document.querySelector<HTMLElement>(typeof focus === 'string' ? focus : 'main h1') : null);
      if (named) {
        const words = (named.textContent ?? '').trim();
        const said = announcement ? announcement(route, words) : words;
        if (said) announce(said);
      }
    }
    onChange?.(route);
  }, [entry, announcement, onChange]);

  const api = useMemo<RouterApi>(() => ({ route: entry.route, pending, href: (to) => (owns(to) ? urlFor(to) : to), navigate, owns }), [entry.route, pending, owns, urlFor, navigate]);
  return <RouterContext.Provider value={api}>{children}</RouterContext.Provider>;
}

/** The route shown now. Outside a `Router` it reads the address once, in hash mode. */
export function useRoute(): Route {
  const [fallback] = useState(() => readRoute('hash', '', null));
  return useRouter()?.route ?? fallback;
}

/** Goes to a route or an anchor through the nearest `Router`; outside one, it sets the address. */
export function useNavigate(): RouterApi['navigate'] {
  const router = useRouter();
  return useCallback((to: string, options?: { replace?: boolean }) => (router ? router.navigate(to, options) : window.location.assign(to)), [router]);
}

/**
 * Matches a path against a pattern with named parts: `matchPath('/talks/:id', '/talks/42')` is `{ id: '42' }`; `*` at
 * the end matches the rest as `rest`. `null` when it doesn't match.
 */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const want = clean(pattern).split('/').filter(Boolean);
  const have = clean(path).split('/').filter(Boolean);
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i] === '*') {
      params.rest = have.slice(i).map(decodeURIComponent).join('/');
      return params;
    }
    if (i >= have.length) return null;
    if (want[i].startsWith(':')) params[want[i].slice(1)] = decodeURIComponent(have[i]);
    else if (want[i] !== have[i]) return null;
  }
  return want.length === have.length ? params : null;
}
