/** Links from library pages to the Slate docs, from the one config in tools/site-links.json (DoD Q80, docs/hosting.md). */
import links from '../../../../tools/site-links.json';
import manifest from '../../../../docs/docs-manifest.json';

const docsBase = import.meta.env.DEV ? links.local.docs : links.hosted.docs;
const pairs: Record<string, string> = links.pairs;

/** The address of a Slate doc, `page.md` or `page.md#anchor`: 8765 on the dev server, `/docs/` when hosted. */
export const docsHref = (path: string) => `${docsBase}#${path}`;

/** Any address written for the local servers (8765 docs, 8766 library), as it resolves on the current build. */
export function toSite(href: string) {
  if (href.startsWith(links.local.docs)) return docsBase + href.slice(links.local.docs.length);
  if (!import.meta.env.DEV && href.startsWith(links.local.library)) return links.hosted.library + href.slice(links.local.library.length);
  return href;
}

const titleOf = (path: string) => manifest.entries.find((e) => e.path === path.split('#')[0])?.title ?? path;

/** A library page's link to its paired doc, for the page header's `source`; undefined when the page has no pair. */
export function docsSource(pageId: string, label?: string) {
  const path = pairs[pageId];
  return path ? { label: label ?? `The full framework: ${titleOf(path)}`, href: docsHref(path) } : undefined;
}
