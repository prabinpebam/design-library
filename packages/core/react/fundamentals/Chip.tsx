import type { KeyboardEvent, Ref } from 'react';
import { Icon } from './Icon';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export interface ChipProps extends DataAttributes {
  /** The value's name, in sentence case: a person, a label, a filter. Long names truncate; the full name stays in the accessible name. */
  label: string;
  /** `input`: a value someone picked (removable with `onRemove`, read-only without). `filter`: a filter turned on or off. Default `input`. */
  kind?: 'input' | 'filter';
  /** Filter: it's on. Shows the check and a tint, never colour alone. */
  selected?: boolean;
  /** Filter: turned on or off. */
  onChange?: (selected: boolean) => void;
  /** Filter: `multiple` (a checkbox, default) or `single` (a radio among its group). Set by ChipGroup. */
  selection?: 'multiple' | 'single';
  /** Input: removes the value; shows the Remove button, named "Remove" plus the label. */
  onRemove?: () => void;
  /** Input: opens more about the value (a person's card). The words become a button. */
  onPress?: () => void;
  /** A leading icon from the active set. */
  icon?: IconName;
  /** A person: their initials (or picture) before the name. Decorative: the label names them. */
  avatar?: { name: string; src?: string };
  /** Input: the value isn't accepted (an unknown address): danger tone and an error icon; say why in the group's message. */
  invalid?: boolean;
  /** Can't be changed now. Prefer hiding the chip or saying why. */
  disabled?: boolean;
  /** `s` 24 px, `normal` 32 px, `l` 40 px. Default `normal`. */
  size?: 's' | 'normal' | 'l';
  /** Input chips: `outline` (default) on open surfaces; `filled`, a tonal fill with no outline, inside a bordered field (a tag input), so the field's border is the only enclosure. */
  appearance?: 'outline' | 'filled';
  /** Set by ChipGroup to keep one Tab stop: the chip's focusable part gets this. */
  tabIndex?: number;
  /** Set by ChipGroup: the chip's focusable part. */
  focusRef?: Ref<HTMLButtonElement>;
  /** Set by ChipGroup: keys on the chip's focusable part. */
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * A value someone picked and can change or remove (an input chip), or a filter they turn on or off (a filter chip).
 * Not for information the system set (Badge), an action (Button, even a compact one), navigation (Link), or a binary
 * setting (Switch). Sets of chips go in a ChipGroup, which owns the label, the keys and the overflow.
 * @tier fundamental
 * @family selection
 * @a11y An input chip is its words (a button when it has `onPress`) and a Remove button named "Remove" plus the label;
 * Delete or Backspace on the chip removes it too. A filter chip is one button with `role` checkbox (or radio in a single
 * group) and `aria-checked`, its check drawn as well as its tint. At least 24 px tall; focus rings are never clipped.
 * @key Space / Enter: turn a filter on or off; run the primary action
 * @key Delete / Backspace: remove an input chip
 */
export function Chip({
  label,
  kind = 'input',
  selected = false,
  onChange,
  selection = 'multiple',
  onRemove,
  onPress,
  icon,
  avatar,
  invalid,
  disabled,
  size = 'normal',
  appearance = 'outline',
  tabIndex,
  focusRef,
  onKeyDown,
  ...data
}: ChipProps) {
  const lead = invalid ? <Icon name="error" size="sm" /> : kind === 'filter' && selected ? <Icon name="check" size="sm" /> : icon && <Icon name={icon} size="sm" />;
  const face = avatar && (
    <span data-dl-part="avatar" aria-hidden="true">
      {avatar.src ? <img src={avatar.src} alt="" /> : avatar.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
    </span>
  );
  const attrs = {
    ...data,
    'data-dl': 'chip',
    'data-kind': kind,
    'data-size': size === 'normal' ? undefined : size,
    'data-appearance': appearance === 'filled' && kind === 'input' ? 'filled' : undefined,
    'data-selected': selected ? '' : undefined,
    'data-invalid': invalid ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
  };
  if (kind === 'filter') {
    return (
      <button
        {...attrs}
        type="button"
        ref={focusRef}
        role={selection === 'single' ? 'radio' : 'checkbox'}
        aria-checked={selected}
        aria-disabled={disabled || undefined}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        onClick={() => !disabled && onChange?.(selection === 'single' ? true : !selected)}
      >
        {lead}
        {face}
        <span data-dl-part="words">{label}</span>
      </button>
    );
  }
  const removeKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && onRemove && !disabled) {
      event.preventDefault();
      onRemove();
      return;
    }
    onKeyDown?.(event);
  };
  return (
    <span {...attrs}>
      {lead}
      {face}
      {onPress ? (
        <button type="button" data-dl-part="words" ref={focusRef} tabIndex={tabIndex} aria-disabled={disabled || undefined} onKeyDown={removeKeys} onClick={() => !disabled && onPress()}>
          {label}
        </button>
      ) : (
        <span data-dl-part="words">{label}</span>
      )}
      {onRemove && !disabled && (
        <button
          type="button"
          data-dl-part="remove"
          aria-label={`Remove ${label}`}
          title={`Remove ${label}`}
          ref={onPress ? undefined : focusRef}
          tabIndex={onPress ? -1 : tabIndex}
          onKeyDown={removeKeys}
          onClick={onRemove}
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </span>
  );
}
