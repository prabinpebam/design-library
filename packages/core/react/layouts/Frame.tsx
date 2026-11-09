import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface FrameProps extends DataAttributes {
  /** `feature`: a band with its own fluid space above and below (a quote, a statement, a call to action). `stage`: a share of the window's height with the content centred in it (a page's opening, a status message). */
  kind: 'feature' | 'stage';
  /**
   * `peek` (default): framed, with part of the next (and, scrolled, the previous) content left in view to invite
   * exploring; a stage leaves at least `c.frame.peek` of the next band showing. `distraction-free`: the content fills
   * the window below the header, centred, with nothing else in view: for a piece that is the page's whole point (a
   * status or error screen, a confirmation) (owner Q90).
   */
  mode?: 'peek' | 'distraction-free';
  /** A quiet tone behind the band, edge to edge of the window: only when space alone can't separate it from busy neighbours. */
  ground?: boolean;
  children: ReactNode;
}

/**
 * Presents one piece of content so it stands on its own (owner Q88, docs/spacing.md#framing-presenting-one-piece-of-content):
 * its own room sized to the window and isolated from what's around it. To spacing it's one unit (Q94): its parent places
 * it at the parent's gap, measured from its outer edge, and inside it the spacing method starts again (its content is a
 * tree of its own). Never a box: space first, an optional edge-to-edge tone second, no border or shadow.
 * It steps down with the window (Q89): a peek stage becomes a feature on a narrow window and its content's height on a
 * short one; a feature drops to flow when its space would pass a third of the window's height.
 * Not for lists, grids, forms or anything a person works through (they flow), and at most one stage per page. Frame
 * only what gains from being read alone (Q91): a task or reference page (tickets, a schedule, a list, a detail page)
 * never frames its heading away from the content people came for.
 * @tier 3
 * @a11y No role of its own; the content inside carries its semantics (a figure, a header, a section).
 */
export function Frame({ kind, mode = 'peek', ground = false, children, ...data }: FrameProps) {
  // A stage is sized to what's left of the window below where it starts (the header, the layout's first space and
  // anything above it, such as breadcrumbs), so its peek holds; measured, written straight to the style.
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || kind !== 'stage') return;
    const measure = () => el.style.setProperty('--dl-frame-top', `${el.getBoundingClientRect().top + window.scrollY}px`);
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(el.parentElement ?? el);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [kind]);
  return (
    <div {...data} ref={ref} data-dl="frame" data-frame={kind} data-frame-mode={mode} data-ground={ground ? '' : undefined}>
      <div data-dl-part="content">{children}</div>
    </div>
  );
}
