/**
 * The page's head (LR28): the window title, description, sharing picture, canonical address and `noindex` of the page
 * shown, set while it shows and put back after. SiteView writes it for every page it draws; a host that draws a page
 * another way (a template layout page) writes the same with `usePageHead` or `<PageHead />`. No styles, nothing drawn.
 */
import { useEffect } from 'react';

/** What the head says about the page shown. Every field is optional: an absent one leaves the head as it is. */
export interface PageHeadInfo {
  /** The whole window title, as `titleFor` makes it. */
  title?: string;
  description?: string;
  /** The sharing picture (og:image): an asset id, looked up in `assets`. */
  picture?: string;
  /** Kept out of search (`noindex`). */
  hidden?: boolean;
  /** The page's canonical address. */
  canonical?: string;
}

/** Sets a `meta` or `link` element in the head for the page shown, and takes it away again. */
function useHead(selector: string, make: () => HTMLElement, attribute: string, value: string | undefined) {
  useEffect(() => {
    if (value === undefined) return;
    let el = document.head.querySelector<HTMLElement>(selector);
    const added = !el;
    if (!el) {
      el = make();
      document.head.appendChild(el);
    }
    const before = el.getAttribute(attribute);
    el.setAttribute(attribute, value);
    return () => {
      if (added) el?.remove();
      else if (before === null) el?.removeAttribute(attribute);
      else el?.setAttribute(attribute, before);
    };
  }, [selector, attribute, value, make]);
}

const meta = (key: 'name' | 'property', name: string) => () => {
  const el = document.createElement('meta');
  el.setAttribute(key, name);
  return el;
};
const metaDescription = meta('name', 'description');
const metaRobots = meta('name', 'robots');
const metaImage = meta('property', 'og:image');
const linkCanonical = () => {
  const el = document.createElement('link');
  el.setAttribute('rel', 'canonical');
  return el;
};

/** Writes the page's head while it shows (LR28): the same writer SiteView uses. */
export function usePageHead(page: PageHeadInfo, assets: Record<string, { src: string }> = {}): void {
  const { title } = page;
  useEffect(() => {
    if (title !== undefined) document.title = title;
  }, [title]);
  useHead('meta[name="description"]', metaDescription, 'content', page.description);
  useHead('meta[name="robots"]', metaRobots, 'content', page.hidden ? 'noindex' : undefined);
  useHead('meta[property="og:image"]', metaImage, 'content', page.picture ? assets[page.picture]?.src : undefined);
  useHead('link[rel="canonical"]', linkCanonical, 'href', page.canonical);
}

/** `usePageHead` as an element, for a layout that draws a page: renders nothing. */
export function PageHead({ page, assets }: { page: PageHeadInfo; assets?: Record<string, { src: string }> }) {
  usePageHead(page, assets);
  return null;
}
