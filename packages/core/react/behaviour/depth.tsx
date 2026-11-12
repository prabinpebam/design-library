import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from './motion';

/** One picture as a depth motion moves it (G3, render `MediaDepthPicture`). */
export interface DepthPicture {
  box: HTMLElement;
  pictures: HTMLElement[];
  shapes: HTMLElement[];
  clips: boolean;
}

/** A template's depth motion (G3, render `MediaMotion`): attached to a group with its pictures; returns its cleanup. */
export type DepthMotion = (group: HTMLElement, pictures: () => DepthPicture[]) => (() => void) | void;

/** Each picture in the group: framed, its layers move the picture and the art; unframed, its files pan inside its frame. */
function picturesIn(group: HTMLElement): DepthPicture[] {
  return [...group.querySelectorAll<HTMLElement>("[data-dl='image']")].map((image) => {
    const layers = image.parentElement?.getAttribute('data-dl') === 'image-layers' ? image.parentElement : null;
    if (layers) {
      const shapes = [...layers.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c !== image);
      return { box: layers, pictures: [image], shapes, clips: false };
    }
    const files = [...image.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c.getAttribute('data-dl-part') !== 'fallback');
    return { box: image, pictures: files, shapes: [], clips: true };
  });
}

/**
 * The media block's group for its depth motion (G3): a box holding the pictures and their framing art, each picture's box positioned. The
 * template's motion is attached after mount and detached while reduced motion is asked for (the system setting or the
 * root's `data-motion`), then attached again.
 */
export function DepthGroup({ motion, children }: { motion: DepthMotion; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    const pictures = () => picturesIn(group);
    let attached = false;
    let detach: (() => void) | void;
    const update = () => {
      const reduce = prefersReducedMotion();
      if (reduce && attached) {
        detach?.();
        detach = undefined;
        attached = false;
      } else if (!reduce && !attached) {
        detach = motion(group, pictures);
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
