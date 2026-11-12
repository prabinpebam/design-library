/**
 * A data-driven site (DP8, DP9, DP15 first part): the site document, its page documents and its pictures → the page
 * at the current route in its layout, with the site's header and footer, through the same block registry as
 * TemplateView. Each section renders on its own: a section that fails, or names a block type nobody knows, is left
 * out (in development it shows what's wrong and where, by its JSON path), so one bad section never blanks the page.
 * Routes come from the page documents on the core router; a page whose route holds `:id` and names a collection is
 * each item's own page (DP12), and `{ "ref" }` and `{ "item" }` values are resolved before any block sees them. The
 * window title, description, preview picture, canonical address and `noindex` come from the page. No styles.
 */
import { Component, Fragment, useEffect, type ReactNode } from 'react';
import { Alert, PageGrid, Text } from '../react/components';
import { useRouter } from '../react/behaviour/router';
import { SectionAnchor } from '../react/behaviour/section-anchor';
import { matchPath, Router } from '../site';
import { BLOCKS } from './blocks';
import { findItem, isBinding, resolveData } from './collections';
import { pageGridPlacements, pageGridRecordProblems, type PageGridRecordCell } from './page-grid';
import { LAYOUTS, resolveLinks } from './TemplateView';
import type { Block, BlockRenderer, PageDocument, RenderContext, Site, SiteDocument, TemplateContent } from './types';
import { resolveUnconfirmed } from './unconfirmed';

export interface SiteViewProps {
  /** The site, from `loadSite`. */
  site: Site;
  /** Router mode when SiteView makes its own router (it uses an enclosing `Router` if there is one). Default `hash`. */
  mode?: 'hash' | 'history';
  /** History mode only: the path the site is served under. */
  base?: string;
  /** Show what's wrong in place of a section that fails, by its JSON path. Defaults to the bundler's development flag (`import.meta.env.DEV`); in production a failing section is left out. */
  development?: boolean;
}

const isDevelopment = () => Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);

/**
 * Where an old or extra address goes (DP16): the site's `aliases`, matched exactly or as a pattern whose `:name`
 * parts carry over (`"/events/:id": "/readings/:id"`); an `https://` target leaves the site.
 */
export function aliasFor(doc: SiteDocument, path: string): string | undefined {
  const aliases = doc.aliases ?? {};
  if (aliases[path]) return aliases[path];
  for (const [from, to] of Object.entries(aliases)) {
    if (!from.includes(':')) continue;
    const params = matchPath(from, path);
    if (params) return to.replace(/:([a-zA-Z][a-zA-Z0-9]*)/g, (_, name: string) => encodeURIComponent(params[name] ?? ''));
  }
  return undefined;
}

/** The first picture a page's sections show, in reading order: a block's `picture`, or the first of a gallery's `items`. */
function firstPicture(blocks: unknown): string | undefined {
  if (Array.isArray(blocks)) {
    for (const b of blocks) {
      const found = firstPicture(b);
      if (found) return found;
    }
    return undefined;
  }
  if (!blocks || typeof blocks !== 'object') return undefined;
  const b = blocks as Record<string, unknown>;
  if (typeof b.picture === 'string') return b.picture;
  if (b.type === 'gallery' && Array.isArray(b.items) && typeof b.items[0] === 'string') return b.items[0];
  for (const [key, value] of Object.entries(b)) {
    if (key === 'picture' || typeof value !== 'object') continue;
    const found = firstPicture(value);
    if (found) return found;
  }
  return undefined;
}

/** A page a path opens, and on an item's page the item it shows. */
export interface PageMatch {
  page: PageDocument;
  /** The collection item an item's page shows (`undefined` on other pages). */
  item?: Record<string, unknown>;
}

/**
 * The page a path opens: home at `/`, else the page with that route; else a page whose route has `:id` and names a
 * collection, when the path's id is one of its items (DP12).
 */
export function matchPage(site: Site, path: string): PageMatch | undefined {
  const { site: doc, pages } = site;
  if (path === '/') {
    const home = pages.find((p) => p.id === doc.home) ?? pages.find((p) => p.route === '/');
    return home ? { page: home } : undefined;
  }
  const exact = pages.find((p) => p.route === path);
  if (exact) return { page: exact };
  for (const page of pages) {
    if (!page.collection || !page.route.includes(':id')) continue;
    const params = matchPath(page.route, path);
    const item = params ? findItem(site.collections[page.collection], params.id) : undefined;
    if (item) return { page, item };
  }
  return undefined;
}

/** The page a path opens (see `matchPage`). */
export function pageFor(site: Site, path: string): PageDocument | undefined {
  return matchPage(site, path)?.page;
}

/** The window title for a page, from the site's pattern. */
export function titleFor(doc: SiteDocument, page: { title: string; windowTitle?: string }): string {
  if (page.windowTitle) return page.windowTitle;
  return (doc.titlePattern ?? '{page} · {site}').replace('{page}', page.title).replace('{site}', doc.title);
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

interface BoundaryProps {
  path: string;
  development: boolean;
  children: ReactNode;
}

/** One section's error boundary: in development the section's place says what failed and where; in production it is left out. */
class SectionBoundary extends Component<BoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(previous: BoundaryProps) {
    if (previous.children !== this.props.children && this.state.error) this.setState({ error: null });
  }
  render() {
    if (!this.state.error) return this.props.children;
    return this.props.development ? (
      <Alert tone="error" title={`${this.props.path} can’t be shown`}>
        {this.state.error.message}
      </Alert>
    ) : null;
  }
}

/** Renders the page at the current route of a data-driven site. Wraps itself in a `Router` unless one encloses it. */
export function SiteView({ site, mode = 'hash', base, development }: SiteViewProps) {
  const router = useRouter();
  if (!router)
    return (
      <Router
        mode={mode}
        base={base}
        transition={(to, from) => (aliasFor(site.site, from.path) === to.path ? 'none' : (matchPage(site, to.path)?.page.transition ?? site.site.transition ?? 'none'))}
        scroll={(to, from) => {
          // MP2: two items of one collection page whose `between` is `keep` (one year to the next) keep the place.
          const a = matchPage(site, to.path);
          const b = matchPage(site, from.path);
          return a && b && a.page === b.page && a.page.collection && a.page.between === 'keep' ? 'keep' : 'top';
        }}
        again={site.site.again ?? 'none'}
      >
        <SiteView site={site} development={development} />
      </Router>
    );
  return <SitePage site={site} development={development ?? isDevelopment()} />;
}

function SitePage({ site, development }: { site: Site; development: boolean }) {
  const router = useRouter()!;
  const { site: doc, assets, registry } = site;
  const path = router.route.path;
  const moved = aliasFor(doc, path);
  // An alias opens its route in place of itself, so Back skips it (after this commit, outside React's rendering).
  useEffect(() => {
    if (!moved) return;
    const query = router.route.query.toString();
    const to = `${moved}${query ? `?${query}` : ''}${router.route.anchor ? `#${router.route.anchor}` : ''}`;
    // An address outside the site (`https://`) leaves it, replacing this entry.
    const timer = window.setTimeout(() => (/^https:\/\//.test(moved) ? window.location.replace(moved) : router.navigate(to, { replace: true })), 0);
    return () => window.clearTimeout(timer);
  }, [moved, router]);
  const routeKey = moved && moved.startsWith('/') ? moved : path;
  const match = matchPage(site, routeKey);
  const missing = !match;
  const notFoundPage = doc.notFound ? site.pages.find((p) => p.id === doc.notFound) : undefined;
  const words = doc.strings?.notFound ?? { title: 'Page not found', text: 'There’s no page at this address.', home: 'Go to the home page' };
  const raw: PageDocument = match?.page ??
    notFoundPage ?? {
      pageVersion: 1,
      id: 'not-found',
      route: path,
      title: words.title,
      hidden: true,
      sections: [{ type: 'status', title: words.title, text: words.text, links: [{ label: words.home, href: '/' }] }],
    };
  // What's wrong in the site's JSON (DP20): gathered while the page is drawn, shown in development as one notice.
  const problems: { where: string; what: string }[] = [];
  const pageFile = missing && !notFoundPage ? 'site' : `page “${raw.id}”`;
  // References and an item page's own values (DP12) are resolved before anything reads the page.
  const data = <T,>(value: T, file: string): T =>
    resolveData(value, site, { item: match?.item, collection: raw.collection, missing: (what, at) => problems.push({ where: at ? `${file} ${at}` : file, what }) });
  const page = data(raw, pageFile) as PageDocument & { title: string; description?: string; picture?: string };

  const title = titleFor(doc, page.route === '/' && !page.windowTitle && page.id === doc.home ? { title: page.title, windowTitle: doc.title } : page);
  useEffect(() => {
    document.title = title;
  }, [title]);
  useHead('meta[name="description"]', metaDescription, 'content', page.description);
  useHead('meta[name="robots"]', metaRobots, 'content', page.hidden || missing ? 'noindex' : undefined);
  useHead('meta[property="og:image"]', metaImage, 'content', page.picture ? assets[page.picture]?.src : undefined);
  useHead('link[rel="canonical"]', linkCanonical, 'href', page.canonical);

  const href = (to: string) => router.href(`/${to}`);
  const resolve = <T,>(value: T): T => resolveUnconfirmed(resolveLinks(value, href), doc.strings?.unconfirmed);
  const current = page.current ?? page.route.split('/')[1] ?? '';
  const settings = { ...doc.layout?.settings, ...page.settings, current };
  const withPlaces = (blocks: Block[] | undefined) => (blocks ?? []).map((b) => (b.type === 'site-header' && !b.places && doc.navigation ? { ...b, places: doc.navigation } : b));
  const header = resolve(data(withPlaces(doc.header), 'site header'));
  const footer = resolve(data(doc.footer ?? [], 'site footer'));
  // A section whose list comes from a binding (DP13) that found nothing, and that says nothing for an empty list
  // (`empty`), is left out rather than shown as a heading over nothing.
  const kept = page.sections.map((_, i) => i).filter((i) => {
    const before = raw.sections[i] as Record<string, unknown> | undefined;
    const after = page.sections[i] as Record<string, unknown>;
    return !before || 'empty' in after || !Object.entries(before).some(([k, v]) => isBinding(v) && Array.isArray(after[k]) && (after[k] as unknown[]).length === 0);
  });
  const sections = resolve(kept.map((i) => page.sections[i]));
  const custom = registry?.blocks ?? {};
  const file = pageFile;

  // The page's first picture (DR44) loads at once, ahead of the rest: in the first section that shows one.
  const firstAt = sections.findIndex((s) => firstPicture(s) !== undefined);
  const first = firstAt < 0 ? undefined : firstPicture(sections[firstAt]);
  const ctx: RenderContext = {
    template: doc.id ?? 'site',
    layout: page.id,
    settings,
    href,
    picture: (id) => assets[id] ?? { src: '', alt: '' },
    decoration: (name) => registry?.decorations?.[name]?.(),
    reveal: (name) => registry?.reveals?.[name],
    presentation: (name) => registry?.presentations?.[name],
    blocks: (blocks) => list(blocks, ctx, undefined),
  };
  function one(block: Block, i: number, at: RenderContext, path: string): ReactNode {
    const render = (custom[block.type] ?? (BLOCKS as Record<string, BlockRenderer<never>>)[block.type]) as BlockRenderer<Block> | undefined;
    if (!render) problems.push({ where: path, what: `“${block.type}” isn’t a block type this site knows` });
    if (!render)
      return development ? (
        <Alert key={i} tone="error" title={`${path} can’t be shown`}>
          {`“${block.type}” isn’t a block type this site knows.`}
        </Alert>
      ) : null;
    return render(block, at, i);
  }
  function list(blocks: Block[] | undefined, base: RenderContext, region: string | undefined, where = 'sections', within?: string, narrow?: ReadonlySet<number>): ReactNode[] {
    const items = blocks ?? [];
    const local: RenderContext = { ...base, siblings: items.length, neighbours: items, region };
    return items.map((b, i) => {
      const path = within ? `${within} › [${i}]` : `${where === 'sections' ? file : 'site'} ${where}[${region === 'main' ? kept[i] : i}]`;
      const anchor = typeof b.anchor === 'string' ? b.anchor : undefined;
      // A section in a cell narrower than the page sits beside others: it flows, never framed (framing is whole-width).
      const placed: RenderContext = narrow?.has(kept[i]) ? { ...local, region: 'cell' } : local;
      const own: RenderContext = { ...placed, problem: (what) => problems.push({ where: path, what }), blocks: (inner) => list(inner, at, undefined, where, path) };
      const at = region === 'main' && i === firstAt ? { ...own, picture: (id: string) => (id === first && assets[id] ? { ...assets[id], priority: true } : own.picture(id)) } : own;
      return (
        <SectionBoundary key={`${routeKey}-${where}-${i}`} path={path} development={development}>
          {anchor && <SectionAnchor id={anchor} />}
          {one(b, i, at, path)}
        </SectionBoundary>
      );
    });
  }
  // The page's grid (LR18) places sections in rows and cells; a grid with problems is reported and the page flows.
  const gridIssues = raw.grid ? pageGridRecordProblems(raw.grid, raw.sections.length) : [];
  for (const issue of gridIssues) problems.push({ where: `${file} ${issue.at}`, what: issue.what });
  const grid = raw.grid && !gridIssues.length ? raw.grid : undefined;
  const spans = grid ? pageGridPlacements(grid) : undefined;
  const narrow = spans ? new Set([...spans].filter(([, span]) => span < 12).map(([n]) => n)) : undefined;
  const drawn = list(sections, ctx, 'main', 'sections', undefined, narrow);
  const byIndex = new Map(kept.map((n, i) => [n, drawn[i]]));
  const main = grid ? (
    <Fragment>
      <PageGrid rows={grid.rows} renderSlot={(cell) => ((cell as PageGridRecordCell).section === undefined ? null : (byIndex.get((cell as PageGridRecordCell).section!) ?? null))} />
      {kept.filter((n) => !spans!.has(n)).map((n) => byIndex.get(n))}
    </Fragment>
  ) : (
    drawn
  );
  const notice =
    development && problems.length ? (
      <Alert tone="warning" title={problems.length === 1 ? 'One problem in this page’s content' : `${problems.length} problems in this page’s content`}>
        {problems.map((p, i) => (
          <Text key={i} as="p">{`${p.where}: ${p.what}. Fix it in that file; the content check lists the same.`}</Text>
        ))}
      </Alert>
    ) : null;
  const regions: Record<string, ReactNode> = {
    header: header.length ? <Fragment>{list(header, ctx, 'header', 'header')}</Fragment> : null,
    main: (
      <Fragment>
        {notice}
        {main}
      </Fragment>
    ),
    footer: footer.length ? <Fragment>{list(footer, ctx, 'footer', 'footer')}</Fragment> : null,
  };
  const component = page.layout ?? doc.layout?.component ?? 'SiteLayout';
  const binding = registry?.layouts?.[component] ?? LAYOUTS[component];
  const content: TemplateContent = { template: ctx.template, layout: page.id, contentVersion: 1, settings };
  if (!binding)
    return (
      <Alert tone="error" title={`${file} can’t be shown`}>
        {`“${component}” isn’t a core layout or one the site registers.`}
      </Alert>
    );
  return binding({ content, contentOf: () => undefined, ctx, region: (id) => regions[id] ?? null });
}
