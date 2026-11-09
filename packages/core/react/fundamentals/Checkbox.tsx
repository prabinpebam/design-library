import { useEffect, useId, useRef } from 'react';
import { Icon } from './Icon';
import type { DataAttributes } from '../types';

export type CheckboxSize = 's' | 'normal' | 'l';

export interface CheckboxProps extends DataAttributes {
  /** What checking it selects or agrees to. Also the accessible name when `labelHidden`. */
  label: string;
  /** `'mixed'` for a parent whose children are partly checked: it shows a dash and reads as "mixed". */
  checked: boolean | 'mixed';
  /** The new state; nothing is saved by checking alone. A mixed box becomes checked. */
  onChange: (next: boolean) => void;
  /** One short line under the label: what checking it means or includes. */
  description?: string;
  /** What's wrong and how to fix it, e.g. a required agreement left unchecked. Marks it invalid. */
  error?: string;
  /** s (16 px box, 36 px row) for dense lists and tables; normal (20 px, 44 px) by default; l (24 px, 48 px) for touch-first forms. */
  size?: CheckboxSize;
  /** Shows only the box, where its position already says what it selects (a row's or a block's own box). */
  labelHidden?: boolean;
  /** It can't change here. Prefer saying why nearby. */
  disabled?: boolean;
}

/**
 * Selects an item, or agrees to something, as part of a choice applied by another action, at three sizes, with a
 * description line, a mixed state for a parent of partly checked children and an invalid state with its fix.
 * Not for a setting that applies at once (use Switch), or for one of several exclusive options (use a radio group).
 * Several related boxes go in a CheckboxGroup, which names them with a legend.
 * @tier fundamental
 * @family selection
 * @a11y A native checkbox inside its `label`, so the whole row is the target (44 px at normal, 48 at l; s is a dense
 * 36 px exception). With `labelHidden` the label stays as the accessible name. Mixed sets the native `indeterminate`, so
 * it reads as "mixed"; the dash and the filled box carry it, not colour alone. The description and error are linked with
 * `aria-describedby`; an error sets `aria-invalid`. Forced colours keep the box, the tick and the dash.
 * @key Space: checks or unchecks; a mixed box becomes checked
 */
export function Checkbox({ label, checked, onChange, description, error, size = 'normal', labelHidden = false, disabled = false, ...data }: CheckboxProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const mixed = checked === 'mixed';
  useEffect(() => {
    if (input.current) input.current.indeterminate = mixed;
  }, [mixed]);
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <label {...data} data-dl="checkbox" data-size={size} data-invalid={error ? '' : undefined} data-label-hidden={labelHidden ? '' : undefined}>
      <input
        ref={input}
        type="checkbox"
        checked={checked === true}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span data-dl-part="mark" aria-hidden="true">
        <span data-dl-part="box">
          <Icon name={mixed ? 'minus' : 'check'} size={size === 'l' ? 'md' : 'sm'} />
        </span>
      </span>
      <span data-dl-part="words">
        <span data-dl-part="label">{label}</span>
        {description && (
          <span data-dl-part="description" id={`${id}-description`}>
            {description}
          </span>
        )}
        {error && (
          <span data-dl-part="error" id={`${id}-error`}>
            {error}
          </span>
        )}
      </span>
    </label>
  );
}