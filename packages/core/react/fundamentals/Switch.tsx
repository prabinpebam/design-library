import { useEffect, useId, useRef, useState } from 'react';
import { useCommit } from '../behaviour/commit';
import { Button } from './Button';
import { Icon } from './Icon';
import { Progress } from './Progress';
import { Text } from './Text';
import type { DataAttributes } from '../types';

export type SwitchSize = 'xs' | 's' | 'normal' | 'l';

export interface SwitchProps extends DataAttributes {
  /** Names the setting, never its state: "More contrast", not "Turn on more contrast". */
  label: string;
  /** The stored value. */
  checked: boolean;
  /** Stores the new value. Return a promise for a save; reject it when the save fails. */
  onChange: (next: boolean) => unknown;
  /** One short line under the label: what turning it on does. */
  description?: string;
  /** xs (32 × 16 px track, 24 px row) for a dense panel's row, such as a layer's visibility in a design tool's inspector (the written dense-surface exception); s (32 × 20 px track, 36 px row) for dense settings lists; normal (40 × 24, 44) by default; l (56 × 32, 48) for touch-first settings. */
  size?: SwitchSize;
  /** `end` (default): the label after the track. `start`: the label first and the track at the row's end, filling its container, as in a settings list. */
  labelPosition?: 'start' | 'end';
  /** Hides the visible label where the row already says what the switch is (a setting beside its row's heading). It still names the switch. */
  hideLabel?: boolean;
  /** The setting can't change here. Prefer explaining why nearby. */
  disabled?: boolean;
  /** What happened and what was kept, when a save fails. Defaults to naming the setting and its stored value. */
  failedText?: string;
}

/**
 * A binary setting that takes effect at once, at three sizes, with an optional description and the label before or after
 * the track.
 * Not for choices applied by a Save button (use Checkbox) or for actions (use Button).
 * @tier fundamental
 * @family selection
 * @a11y `button[role=switch]` with `aria-checked`; the label inside names it, and the whole row is the target.
 * Pending (owner F9): the knob moves to the side being saved and its own edge becomes the spinner, the one Progress arc
 * turning around it (still under reduced motion), on a neutral track; the same focused element stays, locked with
 * `aria-disabled` and `aria-busy`, and `aria-checked` keeps the stored value until confirmed. The arc is the accent, 3:1 on
 * the surfaces in every context. A failure restores the stored value and
 * offers Retry in a polite status line linked to the switch.
 * @key Space: toggles
 * @key Enter: toggles
 */
export function Switch({ label, checked, onChange, description, size = 'normal', labelPosition = 'end', disabled = false, failedText, hideLabel = false, ...data }: SwitchProps) {
  const descriptionId = useId();
  const { phase, run } = useCommit('--duration-confirm-min');
  const [value, setValue] = useState(checked);
  const control = useRef<HTMLButtonElement>(null);
  const failureId = useId();
  const pending = phase === 'on';
  const failed = phase === 'failed';

  useEffect(() => setValue(checked), [checked]);

  const toggle = () => {
    if (pending) return;
    const next = !value;
    void run(() => onChange(next), () => setValue(next));
  };

  const retry = () => {
    control.current?.focus(); // Retry is removed while pending; focus returns to the switch first
    toggle();
  };

  return (
    <span {...data} data-dl="switch" data-size={size} data-label={labelPosition === 'start' ? 'start' : undefined} data-busy={phase === 'rest' ? undefined : phase} data-to={pending ? (value ? 'off' : 'on') : undefined}>
      <button
        ref={control}
        type="button"
        role="switch"
        data-dl-part="control"
        aria-checked={value}
        aria-disabled={pending || undefined}
        aria-busy={pending || undefined}
        aria-describedby={[description && descriptionId, failed && failureId].filter(Boolean).join(' ') || undefined}
        disabled={disabled}
        onClick={toggle}
      >
        <span data-dl-part="mark" aria-hidden="true">
          <span data-dl-part="track">
            <span data-dl-part="thumb">{pending && <Progress />}</span>
          </span>
        </span>
        <span data-dl-part="words">
          <span data-dl-part="name" data-hidden={hideLabel ? '' : undefined}>{label}</span>
          {description && (
            <span data-dl-part="description" id={descriptionId}>
              {description}
            </span>
          )}
        </span>
      </button>
      <span data-dl-part="failure" id={failureId} role="status">
        {failed && (
          <>
            <Icon name="error" size="sm" />
            <Text as="span" variant="body-sm">
              {failedText ?? `Couldn’t save “${label}”. It’s still ${value ? 'on' : 'off'}.`}
            </Text>
            <Button label="Retry" onClick={retry} />
          </>
        )}
      </span>
    </span>
  );
}
