import type { ReactNode, Ref } from 'react';
import { useOverlayScroll } from '../behaviour/scroll';
import type { DataAttributes } from '../types';

export interface ScrollAreaProps extends DataAttributes {
  children: ReactNode;
  /** `auto` shows the scrollbar while scrolling, on hover and while it's dragged, then fades it; `always` shows it whenever the content overflows. */
  mode?: 'auto' | 'always';
  /** Which directions scroll: `block` (down), `inline` (across) or `both`. */
  axis?: 'block' | 'inline' | 'both';
  /** The most the region grows before it scrolls; `fill` takes the height its parent gives it. */
  maxSize?: 'fill' | 'sm' | 'md' | 'lg';
  /** Padding on the content inside the scroll box, never on the box, so the region still scrolls edge to edge. */
  inset?: 'none' | 'sm' | 'md';
  /** `sunken` shows the region's bounds with a sunken fill, for a region that doesn't fill a surface of its own (a list inside a page); `none` when its surface already shows them. */
  surface?: 'none' | 'sunken';
  /** Names the region; give one when the content has nothing focusable, so the region itself takes focus for the keys. */
  label?: string;
  /** Id of the scrolling element, for a skip link or an anchor. */
  id?: string;
  /** Focus order of the scrolling element; `-1` for a skip link's target. Defaults to `0` when `label` is set. */
  tabIndex?: number;
  /** The scrolling element, for scrolling it from code. */
  viewportRef?: Ref<HTMLDivElement>;
  /** Stops the scroll at the region's end instead of passing it on to the page. Only inside a popup or a modal; an in-page region always passes the wheel on, so the page never stops scrolling under the pointer. */
  contain?: boolean;
}

/**
 * A scroll region whose scrollbar is drawn over the content, never beside it: the content has the same width and
 * alignment whether it overflows or not. Native scrolling stays (wheel, touch, keys, find in page, anchors); only the
 * bar is replaced, by a thin thumb at the region's end edge that can be dragged, with the track paging on a click.
 * Use it for every scroll region. Not for the document itself on small screens, which keeps the browser's own bar.
 * @tier fundamental
 * @family arrangement
 * @a11y The drawn bar is hidden from assistive technology; the region scrolls with the keys whenever it or something inside it has focus. Give `label` when nothing inside can take focus, and the region becomes a named, focusable region.
 * @a11y Forced colours and touch screens get the system's own scrollbar back.
 * @key Arrow keys, Page Up, Page Down, Home, End, Space: scroll the region (native)
 */
export function ScrollArea({ children, mode = 'auto', axis = 'block', maxSize = 'fill', inset = 'none', surface = 'none', label, id, tabIndex, viewportRef, contain = false, ...data }: ScrollAreaProps) {
  const { root, setViewport, tracks } = useOverlayScroll(viewportRef);

  return (
    <div {...data} ref={root} data-dl="scroll-area" data-mode={mode} data-axis={axis} data-max={maxSize} data-surface={surface} data-contain={contain ? '' : undefined}>
      <div
        ref={setViewport}
        data-dl-part="viewport"
        id={id}
        tabIndex={tabIndex ?? (label ? 0 : undefined)}
        role={label ? 'region' : undefined}
        aria-label={label}
      >
        <div data-dl-part="content" data-inset={inset}>
          {children}
        </div>
      </div>
      {tracks(axis)}
    </div>
  );
}
