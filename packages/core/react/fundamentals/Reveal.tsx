import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface RevealProps extends DataAttributes {
  /** Shown or hidden. A change reveals or collapses the content in place; mounting already open reveals it once. */
  open: boolean;
  /** Reveal once when it mounts already open (a field message that just arrived). Off by default: first paint never animates (Z19). */
  appear?: boolean;
  /** The content that opens and closes: a disclosure's panel, a tree branch, a field's message. */
  children: ReactNode;
}

/**
 * Opens and closes content in place (Q65 P4, strategy S3): the box grows from nothing to the content's height (grid
 * rows `0fr` ↔ `1fr`, one mechanism in every engine, MD7) while the content fades in; closing fades it out quickly and
 * collapses. Only what follows moves, inside the layout budget (R3). Interrupted, it reverses from where it is.
 * Not for something that appears from nowhere over the page (a popover, a toast: their own enter and exit), or for
 * content replaced in the same box (Morph).
 * @tier fundamental
 * @family layout
 * @a11y Closed content is `inert` and hidden, so it is never focused, read or found; the owner keeps the disclosure's
 * own `aria-expanded` and labelling. Focus rings inside are clipped only while it moves; once open, nothing is clipped.
 * Reduced motion: no growing (it snaps), the content still fades.
 */
export function Reveal({ open, appear = false, children, ...data }: RevealProps) {
  return (
    <div {...data} data-dl="reveal" data-open={open ? '' : undefined} data-appear={appear ? '' : undefined} inert={!open}>
      <div data-dl-part="clip">{children}</div>
    </div>
  );
}
