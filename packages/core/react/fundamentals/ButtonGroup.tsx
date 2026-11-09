import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface ButtonGroupProps extends DataAttributes {
  /** The group's accessible name: what the buttons have in common, e.g. "Text alignment" or "Page actions". */
  label: string;
  /** The Buttons, in reading order: one primary at most. */
  children: ReactNode;
  /** `spaced` (default): a pair's gap apart. `attached`: joined into one shape; only the group's outer ends are rounded and members share one line between them. */
  arrangement?: 'spaced' | 'attached';
}

/**
 * Related buttons side by side as one named group, such as a form's actions or a view's tools. A fundamental by the
 * owner's definition, being that common; a product can still define its own group as a compound.
 * Not for one exclusive choice that applies at once (use SegmentedControl), for a toolbar of mixed controls (use
 * Toolbar) or for on/off settings (use Switch).
 * @tier fundamental
 * @family buttons
 * @a11y `role="group"` named by `label`; each Button keeps its own name, target and focus ring, and Tab moves through
 * them in order. Attached members keep the size of their own step, so targets don't shrink when joined.
 * @key Tab: moves to the next button in the group
 */
export function ButtonGroup({ label, children, arrangement = 'spaced', ...data }: ButtonGroupProps) {
  return (
    <div {...data} data-dl="button-group" data-arrangement={arrangement} role="group" aria-label={label}>
      {children}
    </div>
  );
}