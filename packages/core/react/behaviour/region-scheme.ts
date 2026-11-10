import { useLayoutEffect, useState, type RefObject } from 'react';

/** The scheme an element is drawn in: its nearest `data-scheme` and `data-contrast`, else the system's. */
export interface RegionScheme {
  scheme: 'light' | 'dark';
  contrast: 'standard' | 'more';
}

const DARK = '(prefers-color-scheme: dark)';
const MORE = '(prefers-contrast: more)';

/** Reads the scheme an element is drawn in now (MP17): the nearest `[data-scheme]` and `[data-contrast]`, else the system's preference. */
export function regionSchemeOf(el: Element | null): RegionScheme {
  const media = (q: string) => typeof matchMedia === 'function' && matchMedia(q).matches;
  const s = el?.closest('[data-scheme]')?.getAttribute('data-scheme');
  const c = el?.closest('[data-contrast]')?.getAttribute('data-contrast');
  return {
    scheme: s === 'dark' || s === 'light' ? s : media(DARK) ? 'dark' : 'light',
    contrast: c === 'more' || c === 'standard' ? c : media(MORE) ? 'more' : 'standard',
  };
}

// One observer and one pair of media listeners for every subscriber on the page, however many pictures read them.
const subscribers = new Set<() => void>();
let teardown: (() => void) | null = null;

function subscribe(notify: () => void) {
  subscribers.add(notify);
  if (!teardown && typeof document !== 'undefined') {
    const all = () => subscribers.forEach((n) => n());
    const observer = new MutationObserver(all);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme', 'data-contrast'], subtree: true });
    const queries = typeof matchMedia === 'function' ? [matchMedia(DARK), matchMedia(MORE)] : [];
    queries.forEach((q) => q.addEventListener('change', all));
    teardown = () => {
      observer.disconnect();
      queries.forEach((q) => q.removeEventListener('change', all));
    };
  }
  return () => {
    subscribers.delete(notify);
    if (!subscribers.size) {
      teardown?.();
      teardown = null;
    }
  };
}

/**
 * The scheme and contrast the element in `ref` is drawn in, kept current (MP17, ID38): the nearest `data-scheme` and
 * `data-contrast` (the page's, from SchemeControl, or a band's own), else `prefers-color-scheme` and
 * `prefers-contrast`. Read in a layout effect, so a component can pick what to draw before the first paint. One shared
 * MutationObserver and media listener serve every caller.
 */
export function useRegionScheme(ref: RefObject<Element | null>, enabled = true): RegionScheme {
  const [now, setNow] = useState<RegionScheme>(() => regionSchemeOf(typeof document === 'undefined' ? null : document.documentElement));
  useLayoutEffect(() => {
    if (!enabled) return;
    const read = () =>
      setNow((was) => {
        const next = regionSchemeOf(ref.current);
        return was.scheme === next.scheme && was.contrast === next.contrast ? was : next;
      });
    read();
    return subscribe(read);
  }, [ref, enabled]);
  return now;
}
