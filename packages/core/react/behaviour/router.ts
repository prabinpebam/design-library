import { createContext, useContext } from 'react';

/** Where the person is: the route's path, its query and the in-page anchor, if any. */
export interface Route {
  /** The route's path, always starting with `/`: `/talks/42`. */
  path: string;
  /** The route's query: `?q=type` → `query.get('q')`. */
  query: URLSearchParams;
  /** The in-page anchor (an element id) the route points at, or `null`. */
  anchor: string | null;
}

/** What `Link` and `Button` with `href` read from the core router, when a site has one (`@design-library/core/site`). */
export interface RouterApi {
  route: Route;
  /** The page being got ready while the old one stays (`Router` `prepare`), or `null`. */
  pending?: Route | null;
  /** The `href` to write for a route (`/talks` → `#/talks` in hash mode), an anchor (`#speakers`) or an address (unchanged). */
  href: (to: string) => string;
  /** Goes to a route or an anchor; `replace` changes the current history entry instead of adding one. */
  navigate: (to: string, options?: { replace?: boolean }) => void;
  /** Whether `to` is the router's to handle: a route (`/…`, or `#/…` in hash mode) or an anchor (`#…`). */
  owns: (to: string) => boolean;
}

/** The router a site has put around its views, or `null`. Behaviour only. */
export const RouterContext = createContext<RouterApi | null>(null);

/** The core router, when present: `Link` uses it, and works as a plain link without it. */
export function useRouter(): RouterApi | null {
  return useContext(RouterContext);
}
