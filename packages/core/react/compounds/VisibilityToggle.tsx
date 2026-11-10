import type { ButtonSize } from '../fundamentals/Button';
import { Button } from '../fundamentals/Button';
import type { DataAttributes } from '../types';

export interface VisibilityToggleProps extends DataAttributes {
  /** What it acts on, in the words a person sees: "Logo", "fill 1". Named "Show {name}" or "Lock {name}". */
  name: string;
  /** Shown (visibility) or locked (lock). */
  on: boolean;
  onChange: (next: boolean) => void;
  /** `visibility` (default): an eye that closes when hidden; `lock`: a padlock that opens when unlocked. */
  kind?: 'visibility' | 'lock';
  /** The Button size scale; `xs` in a list row or a property row. */
  size?: ButtonSize;
  /** The words before the name, for another language: "Show" or "Lock" by default. */
  verb?: string;
  /** Leave the tooltip off where the row already says what it is. */
  tooltip?: boolean;
}

/**
 * The eye (and padlock) toggle (Q125): the established, universal pattern for showing or hiding one thing in a list
 * (a layer, a fill, a stroke, an effect, a page colour) and for locking it. A pressed icon button: its icon is the
 * state (eye or eye with a slash; closed or open padlock), so it carries no fill when on. Unlike other toggle buttons
 * it needs no written reason where it's used: it is the library's named pattern for these two meanings. For any
 * other binary setting use Switch.
 * @tier compound
 * @family buttons
 * @a11y A `button` with `aria-pressed` (true when shown or locked) and a name that never changes with the state
 * ("Show Logo", "Lock Logo"), so the pressed state is what's announced; the label also shows as its tooltip.
 * @key Enter or Space: toggles it
 */
export function VisibilityToggle({ name, on, onChange, kind = 'visibility', size = 'xs', verb, tooltip = true, ...data }: VisibilityToggleProps) {
  const icon = kind === 'lock' ? (on ? 'lock' : 'unlock') : on ? 'eye' : 'eye-off';
  const label = `${verb ?? (kind === 'lock' ? 'Lock' : 'Show')} ${name}`.trim();
  return (
    <span {...data} data-dl="visibility-toggle" data-kind={kind}>
      <Button label={label} icon={icon} iconOnly tooltip={tooltip} emphasis="quiet" size={size} pressed={on} onClick={() => onChange(!on)} />
    </span>
  );
}
