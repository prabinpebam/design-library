/**
 * Builds a template for the renderer from its own folder's files: the manifest, every content file (by the layout it
 * names, or as the shared file), and its pictures with their addresses. Each template's index.ts calls this with
 * its files, so a template only ever reads inside its own folder. Public (`@design-library/core/render`), so a
 * separate project makes its own templates the same way (Q81).
 */
import type { CollectionDocument, PageDocument, Site, SiteDocument, Template, TemplateAsset, TemplateContent, TemplateManifest } from './types';
import { deriveValues } from './collections';

export function loadTemplate(
  manifest: unknown,
  contentFiles: Record<string, unknown>,
  assetsFile: unknown,
  assetUrls: Record<string, unknown>,
  registry?: Template['registry'],
  stories?: Template['stories'],
): Template {
  const content: Record<string, TemplateContent> = {};
  let shared: TemplateContent | undefined;
  for (const file of Object.values(contentFiles) as TemplateContent[]) {
    if (file.shared) shared = file;
    else if (file.layout) content[file.layout] = file;
  }
  const declared = (assetsFile as { assets?: Record<string, TemplateAsset> })?.assets ?? {};
  const assets = Object.fromEntries(
    Object.entries(declared).map(([id, a]) => [
      id,
      withFiles(a, (file) => String(assetUrls[`./${file}`] ?? '')),
    ]),
  );
  return { manifest: manifest as TemplateManifest, content, shared, assets, registry, stories };
}

/**
 * A picture entry with every file it names resolved to its address: src, and the scheme files dark and`n * `contrast` (MP18). A decorative picture has an empty alt.
 */
function withFiles(a: TemplateAsset, url: (file: string) => string): TemplateAsset {
  const contrast = a.contrast && Object.fromEntries(Object.entries(a.contrast).filter(([, f]) => f).map(([k, f]) => [k, url(f as string)]));
  return { ...a, src: url(a.src), ...(a.dark ? { dark: url(a.dark) } : {}), ...(contrast ? { contrast } : {}), alt: a.decorative ? '' : (a.alt ?? '') };
}

/** Pictures from an assets file with their addresses (the same rules as a template's: a decorative picture has an empty alt). */
function resolveAssets(assetsFile: unknown, assetUrls: Record<string, unknown>): Record<string, TemplateAsset> {
  const declared = (assetsFile as { assets?: Record<string, TemplateAsset> })?.assets ?? {};
  return Object.fromEntries(Object.entries(declared).map(([id, a]) => [id, withFiles(a, (file) => String(assetUrls[`./${file}`] ?? file))]));
}

/** A data-driven site's files, for `loadSite`. */
export interface SiteFiles {
  /** The site document (site.json). */
  site: unknown;
  /** Page documents: a list, or what `import.meta.glob` returns. */
  pages: Record<string, unknown> | unknown[];
  /** Collection documents (DP12), keyed by their own `id`. */
  collections?: Record<string, unknown> | unknown[];
  /** The assets file (assets.json). */
  assets?: unknown;
  /** Picture addresses by `./{src}` (what `import.meta.glob` returns); a `src` not found is kept as written. */
  assetUrls?: Record<string, unknown>;
  registry?: Site['registry'];
}

/** Builds a data-driven site for `SiteView` (DP8, DP9, DP12) from its files: the site, its pages, its collections and its pictures. */
export function loadSite(files: SiteFiles): Site {
  const list = (v: Record<string, unknown> | unknown[] | undefined) => (Array.isArray(v) ? v : Object.values(v ?? {}));
  const collections = Object.fromEntries((list(files.collections) as CollectionDocument[]).map((c) => [c.id, c]));
  const site = files.site as SiteDocument;
  const pages = list(files.pages) as PageDocument[];
  // Derived values (DP14) are worked out once here; what they can't find, the content check reports.
  const derived = site.derive ? deriveValues(site.derive, { pages, collections }) : undefined;
  return { site, pages, collections, derived, assets: resolveAssets(files.assets, files.assetUrls ?? {}), registry: files.registry };
}

/** The route `partsSite` gives a block type: `conference.sponsor-wall` → `/conference/sponsor-wall`. */
export const partRoute = (type: string) => `/${type.replace('.', '/')}`;

/**
 * A template's own block types as a small site (DP18): one page per block type that declares an `example` in the
 * manifest, each placing that example from a page document through the template's registry, with its pictures. What
 * a story, a preview or an authoring tool opens to show a part in place; nothing beyond the manifest is needed.
 */
export function partsSite(template: Template): Site {
  const { manifest } = template;
  const parts = (manifest.parts?.blocks ?? []).filter((b) => b.example);
  const pages: PageDocument[] = parts.map((b) => ({ pageVersion: 1, id: b.type, route: partRoute(b.type), title: b.type, current: b.type.split('.')[1], sections: [b.example!] }));
  const site: SiteDocument = {
    siteVersion: 1,
    id: `${manifest.id}-parts`,
    title: `${manifest.title}: own blocks`,
    home: parts[0]?.type ?? '',
    navigation: parts.map((b) => ({ label: b.type, href: partRoute(b.type) })),
    header: [{ type: 'site-header', name: `${manifest.title}: own blocks` }],
    aliases: parts[0] ? { '/': partRoute(parts[0].type) } : undefined,
  };
  return { site, pages, collections: {}, assets: template.assets, registry: template.registry };
}
