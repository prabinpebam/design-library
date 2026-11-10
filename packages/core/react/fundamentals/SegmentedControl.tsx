import { useId } from 'react';
import { useSlidingIndicator } from '../behaviour/flip';
import { Icon } from './Icon';
import type { ButtonSize } from './Button';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export interface SegmentedControlOption {
  /** What `onChange` receives when this option is chosen. */
  value: string;
  /** Names the option in sentence case. Shown, or its accessible name and tooltip when `iconOnly`. */
  label: string;
  /** Icon from the active set; required when `iconOnly`. */
  icon?: IconName;
}

export interface SegmentedControlProps extends DataAttributes {
  /** Names the choice, never an option: "Colour scheme". The group's accessible name. */
  label: string;
  /** Two to five exclusive options, in a meaningful order. */
  options: SegmentedControlOption[];
  /** The chosen option's value. */
  value: string;
  /** The new choice. It applies at once and isn't saved, so there's no pending state. */
  onChange: (next: string) => void;
  /** Shows only each option's icon, for a compact choice the icons make recognisable; each label becomes its tooltip and accessible name. */
  iconOnly?: boolean;
  /** The Button size scale (xs 24, s 36, normal 44, m 48, l 56, xl 64, xxl 80 px segments). `s` (default) on dense surfaces such as an app title bar; `xs` inside content, such as a toolbar over a preview; `normal` and up in forms and settings, beside Buttons of the same size. */
  size?: ButtonSize;
  /** The choice can't change here. Prefer saying why nearby. */
  disabled?: boolean;
  /** How the chosen segment shows: `accent` (default) an accent fill with on-accent text; `raised` a raised surface with accent text, for a mode switch that sits beside an accent-filled choice (a design tool's Design and Dev mode beside its tools). */
  emphasis?: 'accent' | 'raised';
  /** The group's own track (fill and outline). Turn it off where a surrounding bar already encloses the segments (a floating tool bar): one enclosure per boundary. */
  track?: boolean;
}

/**
 * Chooses one of two to five exclusive options, side by side, that apply at once without saving: how a view or a
 * preview shows its content. One component for text and icon-only segments.
 * Not for one on/off setting (use Switch), for more than five options (use Select), or for a choice that saves (it
 * has no saving states yet). Added on the owner's direction (2026-11-07, F5): the library's title bar chooses its
 * colour scheme and contrast with two of these, where a settings form would use a Switch for each binary setting.
 * @tier fundamental
 * @family buttons
 * @a11y Native radio inputs in a `radiogroup` named by `label`, so the group is one tab stop and the arrow keys move the
 * choice. Dense by a written exception (O40, O41): each segment is a square target on the Button size scale: 36 px at `s` and 24 px at `xs` (the
 * WCAG 2.2 AA 2.5.8 minimum) are dense; `normal` and up meet 44 px, with no hit area beyond it. An icon-only segment is named by its label, which also shows as its tooltip. The group is
 * a subtle fill with no outline at standard contrast and gains one at control strength (3:1) with more contrast. The
 * chosen segment is an accent fill inset evenly on all sides; members carry no outline of their own. Forced colours
 * fill the chosen segment with Highlight.
 * Motion (Q65 C6, M14): chosen by a pointer, the fill slides from the previous segment over the move role while the
 * text colours fade; chosen with arrow keys, it moves at once. With reduced motion it never slides.
 * @key Tab: moves into the group at the chosen option, then out of it
 * @key Arrow keys: choose the next or previous option, wrapping at the ends
 */
const iconSize: Record<ButtonSize, 'sm' | 'md' | 'lg' | 'xl'> = { xs: 'sm', s: 'md', normal: 'md', m: 'md', l: 'lg', xl: 'lg', xxl: 'xl' };

export function SegmentedControl({ label, options, value, onChange, iconOnly = false, size = 's', disabled = false, emphasis = 'accent', track = true, ...data }: SegmentedControlProps) {
  const name = useId();
  const slide = useSlidingIndicator<HTMLDivElement>(value, (root) => root.querySelector('[data-dl-part="segment"][data-chosen]'), '::before');
  return (
    <div {...data} ref={slide.root} {...slide.input} data-dl="segmented-control" data-emphasis={emphasis === 'accent' ? undefined : emphasis} data-track={track ? undefined : 'none'} data-icon-only={iconOnly ? '' : undefined} data-size={size} role="radiogroup" aria-label={label} aria-disabled={disabled || undefined}>
      {options.map((option) => (
        <label key={option.value} data-dl-part="segment" data-chosen={option.value === value ? '' : undefined} title={iconOnly ? option.label : undefined}>
          <input type="radio" name={name} value={option.value} checked={option.value === value} disabled={disabled} onChange={() => {
              slide.capture();
              onChange(option.value);
            }} />
          {option.icon && <Icon name={option.icon} size={iconSize[size]} />}
          <span data-dl-part="name">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
