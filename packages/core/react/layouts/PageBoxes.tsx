import { createElement, type ReactNode } from 'react';
import { useRouter } from '../behaviour/router';
import { boxCss } from '../../render/page-box-model.mjs';
import type { Box } from '../../render/page-box-model.mjs';

export type { Box, PageBox, BoxTag } from '../../render/page-box-model.mjs';
export type { BoxBreakpoint, BoxStyle, BoxStyles } from '../../render/page-box-styles.mjs';

export interface PageBoxesProps {
  /** The Boxes and entries, in order. */
  boxes: readonly Box[];
  /** Draws an entry (a Box with `section`): the page's block or fundamental at that index. */
  renderEntry: (section: number) => ReactNode;
}

/**
 * Webflow's Boxes (LR156, DesignUp): each Box drawn as its `tag` (div by default) with `data-box` (its styles' handle)
 * and its `anchor` as its `id`, holding its Boxes and entries in order; an entry is drawn by the page (`renderEntry`)
 * in a `div` with `data-box-entry`. No element of its own around the list, so it sits in a PageGrid cell or any
 * container as its children. The look is the Boxes' own layout values, from `PageBoxStyles`, once per page, and a Box's
 * page look (`look` band, tint or lead, + `trail`; LR162) drawn as `data-look` with the page grid's settings
 * (`--c-page-grid-frame-*`, `--c-page-grid-lead-*`), so a page needs no PageGrid. A Box with `href` (LR169, Webflow's
 * Link Block) is one `a` holding its Boxes and entries.
 * Model and check: `@design-library/core/page-box`.
 * Not for a block's inner layout (blocks are sealed presets) or an app's regions (use AppLayout or EditorLayout).
 * @tier layout
 * @family layout
 * @a11y Plain elements: a `div` has no role; a Box given a landmark tag (section, nav, aside, header, footer, main) is
 * that landmark, so name it from its content. A link Box is a native `a[href]` named by its content (keep words in it),
 * with the focus ring; never put another link or a control inside it. Reading order is the source order at every width; `order` and grid
 * placement in styles move boxes visually only, so keep reading order and visual order the same.
 */
export function PageBoxes({ boxes, renderEntry }: PageBoxesProps) {
  const router = useRouter();
  return boxes.map((box) => {
    if (box.section !== undefined) return <div key={box.id} data-box={box.id} data-box-entry="" id={box.anchor || undefined}>{renderEntry(box.section)}</div>;
    // A link Box (LR169): one `a`, router-aware as core's links; it takes no landmark tag.
    const link = box.href ? { href: router ? router.href(box.href) : box.href, 'data-box-link': '' } : {};
    return createElement(box.href ? 'a' : box.tag ?? 'div', { key: box.id, 'data-box': box.id, id: box.anchor || undefined, ...link,
      'data-look': box.look || undefined, 'data-trail': box.look === 'lead' && box.trail ? '' : undefined },
      box.children?.length ? <PageBoxes boxes={box.children} renderEntry={renderEntry} /> : null);
  });
}

export interface PageBoxStylesProps {
  /** The page Box (or any Boxes): every styled Box in it, at any depth. */
  page: Box | undefined;
  /** A selector for the page's root, to scope the rules. */
  scope?: string;
}

/** The page's Box styles, breakpoint by breakpoint (Webflow's cascade), as one style sheet; nothing when no Box is styled. */
export function PageBoxStyles({ page, scope }: PageBoxStylesProps) {
  const css = page ? boxCss([page], scope) : '';
  return css ? <style data-box-styles="">{css}</style> : null;
}
