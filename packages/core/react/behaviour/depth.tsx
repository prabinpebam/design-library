import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from './motion';

/** A template's depth motion (G3, render `MediaMotion`): attached to a group with its parts; returns its cleanup. */
export type DepthMotion = (group: HTMLElement, parts: { pictures: () => HTMLElement[]; shapes: () => HTMLElement[] }) => (() => void) | void;

/**
 * The media block's group for its depth motion (G3): a positioned box holding the pictures and their framing art. The
 * template's motion is attached after mount and detached while reduced motion is asked for (the system setting or the
 * root's `data-motion`), then attached again.
 */
export function DepthGroup({ motion, children }: { motion: DepthMotion; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    const parts = {
      pictures: () => [...group.querySelectorAll<HTMLElement>("[data-dl='image']")],
      shapes: () => [...group.querySelectorAll<HTMLElement>("[data-dl='image-layers'] > :is([data-dl-part='under'], [data-dl-part='decoration'])")],
    };
    let attached = false;
    let detach: (() => void) | void;
    const update = () => {
      const reduce = prefersReducedMotion();
      if (reduce && attached) {
        detach?.();
        detach = undefined;
        attached = false;
      } else if (!reduce && !attached) {
        detach = motion(group, parts);
        attached = true;
      }
    };
    update();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', update);
    const watch = new MutationObserver(update);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    return () => {
      media.removeEventListener('change', update);
      watch.disconnect();
      if (attached) detach?.();
    };
  }, [motion]);
  return (
    <div ref={ref} data-dl="media-depth">
      {children}
    </div>
  );
}
