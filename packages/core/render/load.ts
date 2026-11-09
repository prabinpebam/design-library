/**
 * Builds a template for the renderer from its own folder's files: the manifest, every content file (by the layout it
 * names, or as the shared file), and its pictures with their addresses. Each template's index.ts calls this with
 * its files, so a template only ever reads inside its own folder. Public (`@design-library/core/render`), so a
 * separate project makes its own templates the same way (Q81).
 */
import type { CollectionDocument, PageDocument, Site, SiteDocument, Template, TemplateAsset, TemplateContent, TemplateManifest } from './types';

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
      { ...a, src: String(assetUrls[`./${a.src}`] ?? ''), alt: a.decorative ? '' : (a.alt ?? '') },
    ]),
  );
  return { manifest: manifest as TemplateManifest, content, shared, assets, registry, stories };
}

/** Pictures from an assets file with their addresses (the same rules as a template's: a decorative picture has an empty alt). */
function resolveAssets(assetsFile: unknown, assetUrls: Record<string, unknown>): Record<string, TemplateAsset> {
  const declared = (assetsFile as { assets?: Record<string, TemplateAsset> })?.assets ?? {};
  return Object.fromEntries(Object.entries(declared).map(([id, a]) => [id, { ...a, src: String(assetUrls[`./${a.src}`] ?? a.src), alt: a.decorative ? '' : (a.alt ?? '') }]));
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
  return { site: files.site as SiteDocument, pages: list(files.pages) as PageDocument[], collections, assets: resolveAssets(files.assets, files.assetUrls ?? {}), registry: files.registry };
}
