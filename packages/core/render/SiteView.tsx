/**
 * A data-driven site (DP8, DP9, DP15 first part): the site document, its page documents and its pictures → the page
 * at the current route in its layout, with the site's header and footer, through the same block registry as
 * TemplateView. Each section renders on its own: a section that fails, or names a block type nobody knows, is left
 * out (in development it shows what's wrong and where, by its JSON path), so one bad section never blanks the page.
 * Routes come from the page documents on the core router; the window title, description, preview picture, canonical
 * address and `noindex` come from the page. No styles.
 */
import { Component, Fragment, useEffect, type ReactNode } from 'react';
import { Alert } from '../react';
import { useRouter } from '../react/behaviour/router';
import { SectionAnchor } from '../react/behaviour/section-anchor';
import { Router } from '../site';
import { BLOCKS } from './blocks';
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

/** The page a path opens: home at `/`, else the page with that route. */
export function pageFor(site: Site, path: string): PageDocument | undefined {
  const { site: doc, pages } = site;
  if (path === '/') return pages.find((p) => p.id === doc.home) ?? pages.find((p) => p.route === '/');
  return pages.find((p) => p.route === path);
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
  const aliases = site.site.aliases;
  if (!router)
    return (
      <Router mode={mode} base={base} transition={(to, from) => (aliases?.[from.path] === to.path ? 'none' : (site.site.transition ?? 'none'))}>
        <SiteView site={site} development={development} />
      </Router>
    );
  return <SitePage site={site} development={development ?? isDevelopment()} />;
}

function SitePage({ site, development }: { site: Site; development: boolean }) {
  const router = useRouter()!;
  const { site: doc, assets, registry } = site;
  const path = router.route.path;
  const moved = doc.aliases?.[path];
  // An alias opens its route in place of itself, so Back skips it (after this commit, outside React's rendering).
  useEffect(() => {
    if (!moved) return;
    const query = router.route.query.toString();
    const to = `${moved}${query ? `?${query}` : ''}${router.route.anchor ? `#${router.route.anchor}` : ''}`;
    const timer = window.setTimeout(() => router.navigate(to, { replace: true }), 0);
    return () => window.clearTimeout(timer);
  }, [moved, router]);
  const found = pageFor(site, moved ?? path);
  const missing = !found;
  const notFoundPage = doc.notFound ? site.pages.find((p) => p.id === doc.notFound) : undefined;
  const words = doc.strings?.notFound ?? { title: 'Page not found', text: 'There’s no page at this address.', home: 'Go to the home page' };
  const page: PageDocument = found ??
    notFoundPage ?? {
      pageVersion: 1,
      id: 'not-found',
      route: path,
      title: words.title,
      hidden: true,
      sections: [{ type: 'status', title: words.title, text: words.text, links: [{ label: words.home, href: '/' }] }],
    };

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
  const header = resolve(withPlaces(doc.header));
  const footer = resolve(doc.footer ?? []);
  const sections = resolve(page.sections);
  const custom = registry?.blocks ?? {};
  const file = missing && !notFoundPage ? 'site' : `page “${page.id}”`;

  const ctx: RenderContext = {
    template: doc.id ?? 'site',
    layout: page.id,
    settings,
    href,
    picture: (id) => assets[id] ?? { src: '', alt: '' },
    blocks: (blocks) => list(blocks, ctx, undefined),
  };
  function one(block: Block, i: number, at: RenderContext, path: string): ReactNode {
    const render = (custom[block.type] ?? (BLOCKS as Record<string, BlockRenderer<never>>)[block.type]) as BlockRenderer<Block> | undefined;
    if (!render)
      return development ? (
        <Alert key={i} tone="error" title={`${path} can’t be shown`}>
          {`“${block.type}” isn’t a block type this site knows.`}
        </Alert>
      ) : null;
    return render(block, at, i);
  }
  function list(blocks: Block[] | undefined, base: RenderContext, region: string | undefined, where = 'sections'): ReactNode {
    const items = blocks ?? [];
    const local: RenderContext = { ...base, siblings: items.length, neighbours: items, region };
    return items.map((b, i) => {
      const path = `${where === 'sections' ? file : 'site'} ${where}[${i}]`;
      const anchor = typeof b.anchor === 'string' ? b.anchor : undefined;
      return (
        <SectionBoundary key={`${page.id}-${where}-${i}`} path={path} development={development}>
          {anchor && <SectionAnchor id={anchor} />}
          {one(b, i, local, path)}
        </SectionBoundary>
      );
    });
  }
  const regions: Record<string, ReactNode> = {
    header: header.length ? <Fragment>{list(header, ctx, 'header', 'header')}</Fragment> : null,
    main: <Fragment>{list(sections, ctx, 'main')}</Fragment>,
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
