/**
 * Builds a template for the renderer from its own folder's files: the manifest, every content file (by the layout it
 * names, or as the shared file), and its pictures with their addresses. Each template's index.ts calls this with
 * its files, so a template only ever reads inside its own folder. Public (`@design-library/core/render`), so a
 * separate project makes its own templates the same way (Q81).
 */
import type { PageDocument, Site, SiteDocument, Template, TemplateAsset, TemplateContent, TemplateManifest } from './types';

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

/**
 * Builds a data-driven site for `SiteView` (DP8, DP9) from its files: the site document, every page document and the
 * pictures. Asset `src` paths are looked up in `assetUrls` as `./{src}` (what `import.meta.glob` returns), else kept.
 */
export function loadSite(siteFile: unknown, pageFiles: Record<string, unknown> | unknown[], assetsFile?: unknown, assetUrls: Record<string, unknown> = {}, registry?: Site['registry']): Site {
  const pages = (Array.isArray(pageFiles) ? pageFiles : Object.values(pageFiles)) as PageDocument[];
  return { site: siteFile as SiteDocument, pages, assets: resolveAssets(assetsFile, assetUrls), registry };
}
