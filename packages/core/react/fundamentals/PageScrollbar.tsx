import type { CSSProperties } from 'react';
import { useOverlayScroll } from '../behaviour/scroll';
import type { DataAttributes } from '../types';

export interface PageScrollbarProps extends DataAttributes {
  /** `always` (default) shows the bar whenever the page overflows; `auto` shows it while scrolling, on hover and while it's dragged. */
  mode?: 'auto' | 'always';
  /** How far the bar sits from the window's end edge, a CSS length (e.g. a docked pane's width, `var(--dock-width)`). Default 0: at the window's edge. */
  insetInlineEnd?: string;
  /** Room kept above the bar, a CSS length (a fixed bar over the page's top). Default 0. */
  insetBlockStart?: string;
  /** Room kept under the bar, a CSS length (a docked tray at the window's foot). Default 0. */
  insetBlockEnd?: string;
}

/**
 * The page's own scrollbar drawn as ScrollArea's bar at a placed edge (LR156): while it's mounted the window still
 * scrolls the page (headers, anchors, find in page and scroll-linked motion keep reading it), the browser's root bar is
 * hidden, and this bar, the same thumb, drag and track paging as every ScrollArea, follows the document at
 * `insetInlineEnd` from the window's end edge. For an app that docks a pane over the page's end edge (a review or
 * inspector pane) so the page's bar sits at the pane's start edge instead of under it. Unmounting brings the root bar back.
 * @tier fundamental
 * @family arrangement
 * @a11y The drawn bar is hidden from assistive technology and out of the tab order: it repeats the page's own scrolling,
 * which keeps every key. Forced colours and touch screens keep the system's own root bar and draw none.
 */
export function PageScrollbar({ mode = 'always', insetInlineEnd, insetBlockStart, insetBlockEnd, ...data }: PageScrollbarProps) {
  const { root, tracks } = useOverlayScroll(undefined, true, 'document');
  const place = {
    '--page-scrollbar-inline-end': insetInlineEnd,
    '--page-scrollbar-block-start': insetBlockStart,
    '--page-scrollbar-block-end': insetBlockEnd,
  } as CSSProperties;
  return (
    <div {...data} ref={root} data-dl="scroll-area" data-page="" data-mode={mode} data-axis="block" aria-hidden="true" style={place}>
      {tracks('block')}
    </div>
  );
}
