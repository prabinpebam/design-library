/**
 * Builds a template for the renderer from its own folder's files: the manifest, every content file (by the layout it
 * names, or as the shared file), and its pictures with their addresses. Each template's index.ts calls this with
 * its files, so a template only ever reads inside its own folder. Public (`@design-library/core/render`), so a
 * separate project makes its own templates the same way (Q81).
 */
import type { Template, TemplateAsset, TemplateContent, TemplateManifest } from './types';

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
  const assets = Object.fromEntries(Object.entries(declared).map(([id, a]) => [id, { src: String(assetUrls[`./${a.src}`] ?? ''), alt: a.alt }]));
  return { manifest: manifest as TemplateManifest, content, shared, assets, registry, stories };
}
