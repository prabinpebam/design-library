import { useCallback, useSyncExternalStore } from 'react';

/** A published window breakpoint (`breakpoint.*`): xs 30, sm 40, md 64, lg 80 rem. */
export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg';

/**
 * The media query for a breakpoint, read from its token in the loaded CSS (`--breakpoint-md`), so code and CSS change
 * at the same width: `breakpointQuery('md')` is `(min-width: 64rem)`, from md up; `'below'` is `(max-width: …)` for
 * the windows narrower than it, the form core CSS writes. Returns `null` when the token CSS isn't loaded.
 */
export function breakpointQuery(name: BreakpointName, edge: 'from' | 'below' = 'from'): string | null {
  if (typeof document === 'undefined') return null;
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${name}`).trim();
  if (!value) return null;
  return edge === 'from' ? `(min-width: ${value})` : `(max-width: ${value})`;
}

/**
 * Whether the window is at or past a breakpoint (`from`, default) or narrower than it (`below`), kept current as the
 * window resizes. For behaviour code only, such as opening a sidebar by default on a wide window; arrangement belongs to
 * CSS and layouts, which respond to their container. False before the token CSS loads.
 */
export function useBreakpoint(name: BreakpointName, edge: 'from' | 'below' = 'from'): boolean {
  const query = breakpointQuery(name, edge);
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!query || typeof matchMedia !== 'function') return () => {};
      const list = matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => !!query && typeof matchMedia === 'function' && matchMedia(query).matches,
    () => false,
  );
}
