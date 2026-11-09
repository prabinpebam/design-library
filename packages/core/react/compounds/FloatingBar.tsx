import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface FloatingBarProps extends DataAttributes {
  /** Names the bar's region: "Appearance". */
  label: string;
  /** A few compact controls: icon-only segmented controls, small buttons. */
  children: ReactNode;
  /** `window` (default) floats at the window's bottom end corner; `inline` sits in the flow, where it's shown (a library page). */
  placement?: 'window' | 'inline';
}

/**
 * A small bar that floats over a whole screen at the window's bottom end corner and stays there while the page
 * scrolls: for a few controls that belong to the frame around a screen rather than the screen itself, like a preview's
 * light and dark switch. Not for a screen's own actions (Toolbar), messages (Notifications) or a page's footer.
 * @tier compound
 * @family panels
 * @a11y A labelled `region` after the screen in the source, so it's reached last with Tab and never covers focus
 * order. It holds ordinary controls with their own names.
 */
export function FloatingBar({ label, children, placement = 'window', ...data }: FloatingBarProps) {
  return (
    <div {...data} data-dl="floating-bar" data-placement={placement} data-material="floating" data-elevation="3" role="region" aria-label={label}>
      {children}
    </div>
  );
}
