import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { announce } from '../react/behaviour/announce';
import { prefersReducedMotion } from '../react/behaviour/motion';
import { RouterContext, useRouter, type Route, type RouterApi } from '../react/behaviour/router';

export type { Route, RouterApi } from '../react/behaviour/router';
export { useRouter } from '../react/behaviour/router';

export interface RouterProps {
  /** `hash` (default): routes live after `#/`, so the site works on any static host. `history`: real paths, which need a host that serves the page for every path. */
  mode?: 'hash' | 'history';
  /** History mode only: the path the site is served under, such as `/design`. */
  base?: string;
  /** Where focus goes after a page change: a selector inside the new page (default `main h1`, else `main`). `false` leaves focus alone. */
  focus?: string | false;
  /** What is announced after a page change: the default says the focused heading's words; return `''` to say nothing. */
  announcement?: (route: Route, heading: string) => string;
  /** Links in the page (`<a href>` anywhere, such as rich text from content) are handled by the router too. Default `true`. */
  handleLinks?: boolean;
  /** Told of every route change, after it is shown. */
  onChange?: (route: Route) => void;
  children: ReactNode;
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
 * person was. Behaviour only: no styles, no views, no route table (the site decides what each path shows).
 */
export function Router({ mode = 'hash', base = '', focus = 'main h1', announcement, handleLinks = true, onChange, children }: RouterProps) {
  const root = clean(base) === '/' ? '' : clean(base);
  const [entry, setEntry] = useState<Entry>(() => ({ route: readRoute(mode, root, null), how: 'first' }));
  const shown = useRef<Route | null>(null);
  const current = useRef(entry.route);
  current.current = entry.route;

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
      // Remember where this page was scrolled to, so Back returns there.
      history.replaceState({ ...(history.state ?? {}), dlScroll: window.scrollY }, '');
      if (options?.replace) history.replaceState({ dlScroll: 0 }, '', url);
      else history.pushState({ dlScroll: 0 }, '', url);
      setEntry({ route: readRoute(mode, root, current.current), how: 'push' });
    },
    [mode, root, owns, urlFor],
  );

  // Back, Forward and an address typed by hand.
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const onPop = (event: PopStateEvent | HashChangeEvent) => {
      const route = readRoute(mode, root, current.current);
      if (sameRoute(route, current.current)) return;
      const scroll = typeof history.state?.dlScroll === 'number' ? (history.state.dlScroll as number) : undefined;
      setEntry({ route, how: event.type === 'popstate' ? 'pop' : 'push', scroll });
    };
    window.addEventListener('popstate', onPop);
    if (mode === 'hash') window.addEventListener('hashchange', onPop);
    return () => {
      history.scrollRestoration = previous;
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, [mode, root]);

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
    const target = route.anchor ? document.getElementById(route.anchor) : null;
    if (!before) {
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }
    const newPage = before.path !== route.path;
    if (!newPage && before.anchor === route.anchor) {
      onChange?.(route);
      return;
    }
    const glide: ScrollBehavior = newPage || prefersReducedMotion() ? 'instant' : 'smooth';
    if (how === 'pop' && scroll !== undefined && !target) window.scrollTo({ top: scroll, behavior: 'instant' });
    else if (target) target.scrollIntoView({ block: 'start', behavior: glide });
    else window.scrollTo({ top: 0, behavior: glide });
    if (target) focusQuietly(target);
    else if (newPage && focus !== false) {
      const heading = document.querySelector<HTMLElement>(focus) ?? document.querySelector<HTMLElement>('main');
      if (heading) {
        focusQuietly(heading);
        const words = (heading.textContent ?? '').trim();
        const said = announcement ? announcement(route, words) : words;
        if (said) announce(said);
      }
    }
    onChange?.(route);
  }, [entry, focus, announcement, onChange]);

  const api = useMemo<RouterApi>(() => ({ route: entry.route, href: (to) => (owns(to) ? urlFor(to) : to), navigate, owns }), [entry.route, owns, urlFor, navigate]);
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
