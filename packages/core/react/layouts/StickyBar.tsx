import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface StickyBarProps extends DataAttributes {
  /** The bar's controls: a search field, filters, a sort, a count. */
  children: ReactNode;
  /**
   * Inside SiteLayout: the bar reaches into the page margin (`--c-site-layout-margin`) on both sides and pads back by
   * the same amount, so its controls stay on the column at rest and, stuck, it reads as one strip under the header.
   */
  bleed?: boolean;
}

/** The nearest ancestor that scrolls on the block axis, or `null` for the window. */
function scroller(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node !== document.scrollingElement) return node;
  }
  return null;
}

/**
 * A bar of controls that sticks within its section: the first child of a section (or any block), it sticks under the
 * site header (`--dl-chrome-block`, which SiteLayout measures) once its own place scrolls away, only while its parent is
 * on screen, and leaves with it. Stuck, it takes the floating material and a raised shadow (`data-stuck`); at rest it
 * has no fill or shadow, and its geometry never changes between the two.
 * Not for the page's own header (SiteLayout's header already sticks), for a toolbar that floats over a canvas (use
 * FloatingBar) or for a bar that should stay for the whole page (put it in the header).
 * Added for DesignUp's Talks finder (LR4, 2026-11-12): "Search and filters bar: this should be a sticky header within
 * the section when it scrolls out of view."
 * @tier layout
 * @family layout
 * @a11y No role of its own: its controls carry their names (a search field, a select). A control that takes focus while
 * under the stuck bar (Tab moves past it to its section's content) is scrolled clear of it, so focus is never hidden
 * (WCAG 2.4.11). Its parent's scroll container decides where it sticks: the window under SiteLayout, or a scrolling
 * region it sits in.
 */
export function StickyBar({ children, bleed = false, ...data }: StickyBarProps) {
  const bar = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = bar.current;
    const section = el?.parentElement;
    if (!el || !section) return;
    const area = scroller(el);
    let frame = 0;
    const top = () => (area ? area.getBoundingClientRect().top : 0) + (parseFloat(getComputedStyle(el).insetBlockStart) || 0);
    const read = () => {
      frame = 0;
      setStuck(section.getBoundingClientRect().top < top() - 0.5);
    };
    const later = () => {
      frame ||= requestAnimationFrame(read);
    };
    const clear = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || el.contains(target)) return;
      const edge = el.getBoundingClientRect().bottom;
      const at = target.getBoundingClientRect().top;
      if (at >= edge) return;
      const by = at - edge - (parseFloat(getComputedStyle(el).paddingBlockEnd) || 0);
      (area ?? window).scrollBy({ top: by, behavior: 'instant' });
    };
    read();
    const target = area ?? window;
    target.addEventListener('scroll', later, { passive: true });
    addEventListener('resize', later, { passive: true });
    section.addEventListener('focusin', clear);
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener('scroll', later);
      removeEventListener('resize', later);
      section.removeEventListener('focusin', clear);
    };
  }, []);
  return (
    <div
      {...data}
      ref={bar}
      data-dl="sticky-bar"
      data-bleed={bleed ? '' : undefined}
      data-stuck={stuck ? '' : undefined}
      data-material={stuck ? 'floating' : undefined}
      data-elevation={stuck ? '2' : undefined}
    >
      {children}
    </div>
  );
}
