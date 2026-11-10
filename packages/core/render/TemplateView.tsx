/**
 * The renderer (Q64): one content file of a template → its layout component, each region's blocks through the
 * registry, the components and the tokens. Steps: resolve (shared regions merged, `/layout` links made into the
 * host's addresses, pictures by id), pick the layout binding (core, or the template's own), map each block (core
 * block set, then the template's namespaced types). Content is checked by `npm run check:content` before it ships;
 * here an unknown block type or layout shows what's wrong in place instead of drawing half a part. No styles.
 */
import { Fragment, type ReactNode } from 'react';
import { Alert, SiteLayout, Text } from '../react/components';
import { BLOCKS } from './blocks';
import type { Block, BlockRenderer, LayoutBinding, RenderContext, Template, TemplateContent } from './types';
import { resolveUnconfirmed } from './unconfirmed';

/** The address of a template's layout; the library and the standalone site share it. */
export const defaultHref = (template: string, layout: string) => `#/app/${template}/${layout}`;

/** Core layout components a content file may name. */
export const LAYOUTS: Record<string, LayoutBinding> = {
  SiteLayout: ({ content, region }) => (
    <SiteLayout width={content.settings?.width as 'wide' | 'reading' | undefined} opening={content.settings?.opening as 'spaced' | 'flush' | undefined} header={region('header')} footer={region('footer')}>
      {region('main')}
    </SiteLayout>
  ),
};

/** `/layout` links in content become the host's addresses; every other value is kept as written. */
export function resolveLinks<T>(value: T, href: (layout: string) => string, key = ''): T {
  if (typeof value === 'string') return (key === 'href' && value.startsWith('/') ? href(value.slice(1)) : value) as T;
  if (Array.isArray(value)) return value.map((v) => resolveLinks(v, href, key)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveLinks(v, href, k)])) as T;
  return value;
}

const problem = (key: number | string, words: string) => (
  <Alert key={key} tone="error">
    {words}
  </Alert>
);

/**
 * A layout's content. A state layout whose file holds only settings (no regions or record) is its screen in another
 * state (Q65 TP2–TP3): the screen's content with the state's settings, so the two render the same tree and the
 * blocks that know the state morph between them in their own boxes.
 */
export function contentFor(template: Template, layout: string, stateOf?: string): TemplateContent | undefined {
  const own = template.content[layout];
  const screen = stateOf ? template.content[stateOf] : undefined;
  if (!own || !screen || own.regions || own.record) return own;
  return { ...screen, layout, settings: { ...screen.settings, ...own.settings } };
}

export interface TemplateViewProps {
  template: Template;
  /** The layout's id in the template's manifest. */
  layout: string;
  /** Turns a layout id of this template into an address. Defaults to `#/app/{template}/{layout}`. */
  hrefFor?: (template: string, layout: string) => string;
}

/** Renders one layout of a template from its content JSON. */
export function TemplateView({ template, layout, hrefFor = defaultHref }: TemplateViewProps) {
  const { manifest } = template;
  const entry = manifest.layouts.find((l) => l.id === layout && !l.planned);
  const raw = entry ? contentFor(template, entry.id, entry.stateOf) : undefined;
  if (!entry || !raw) return <Text as="p">{`${manifest.title} has no built layout called “${layout}”.`}</Text>;
  const href = (to: string) => hrefFor(manifest.id, to);
  // Values not yet confirmed (DP4) read the shared file's phrase for their key, before any block sees them.
  const phrases = template.shared?.strings?.unconfirmed;
  const resolve = <T,>(value: T): T => resolveUnconfirmed(resolveLinks(value, href), phrases);
  const content: TemplateContent = resolve(raw);
  const shared = template.shared ? resolve(template.shared) : undefined;
  const custom = template.registry?.blocks ?? {};

  const ctx: RenderContext = {
    template: manifest.id,
    layout,
    settings: content.settings ?? {},
    state: typeof content.settings?.state === 'string' ? content.settings.state : undefined,
    href,
    picture: (id) => template.assets[id] ?? { src: '', alt: '' },
    blocks: (blocks) => renderList(blocks, ctx),
  };
  // A region's blocks know their neighbours and, at the top level, which region they fill (framing, Q88–Q90).
  function renderList(blocks: Block[] | undefined, base: RenderContext): ReactNode {
    const list = blocks ?? [];
    const local: RenderContext = { ...base, siblings: list.length, neighbours: list };
    return list.map((b, i) => renderBlock(b, i, local));
  }
  function renderBlock(block: Block, i: number, at: RenderContext): ReactNode {
    const render = (custom[block.type] ?? (BLOCKS as Record<string, BlockRenderer<never>>)[block.type]) as BlockRenderer<Block> | undefined;
    return render ? render(block, at, i) : problem(i, `This part can’t be shown: “${block.type}” isn’t a block type ${manifest.title} knows.`);
  }
  const region = (id: string) => {
    const declared = entry.regions?.find((r) => r.id === id);
    const blocks = declared?.shared ? shared?.regions?.[id] : content.regions?.[id];
    return blocks?.length ? <Fragment>{renderList(blocks, { ...ctx, region: id })}</Fragment> : null;
  };
  const component = entry.component ?? '';
  const binding = template.registry?.layouts?.[component] ?? LAYOUTS[component];
  return binding ? binding({ content, shared, contentOf: (id) => (template.content[id] ? resolve(template.content[id]) : undefined), ctx, region }) : problem('layout', `${manifest.title}’s “${entry.title}” names layout “${component}”, which isn’t a core layout or one the template registers.`);
}
