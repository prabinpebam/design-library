import { useId, type ReactNode } from 'react';
import { Field } from './Field';
import type { DataAttributes } from '../types';

export interface RadioOption {
  /** What choosing it records. */
  value: string;
  /** The option in a few words, sentence case. */
  label: string;
  /** One short line under the label: what choosing it means or includes. */
  description?: string;
  /** A tile's trailing fact, such as a price or a delivery date. */
  meta?: string;
  /** It can't be chosen now; say why in its description. */
  disabled?: boolean;
  /** One related question shown under this option while it's chosen ("Phone number" under "Phone"). Questions only. */
  reveals?: ReactNode;
}

export interface RadioGroupProps extends DataAttributes {
  /** The question, as a question or noun phrase with no colon: "How should we contact you?" */
  label: string;
  /** The options, 2 to 6; more belong in a Select, too many to scroll in a Combobox. */
  options: RadioOption[];
  /** The chosen value; `null` until the person chooses (no option is chosen for them unless there is a safe default). */
  value: string | null;
  /** The new value. Nothing is saved by choosing alone. */
  onChange: (next: string) => void;
  /** One short sentence about the question. */
  hint?: string;
  /** What is wrong and how to fix it: "Choose how we should contact you". */
  error?: string;
  /** Marks the question "(optional)"; questions are required by default. */
  necessity?: 'optional' | 'required';
  /** `vertical` (default) one per row; `inline` side by side, for two or three short options (Yes, No). */
  orientation?: 'vertical' | 'inline';
  /** `default`: a circle and words. `tile`: each option a card with its outline, for a few rich choices (a plan, a delivery speed). */
  appearance?: 'default' | 'tile';
  /** s (16 px circle, 36 px row) for dense filters; normal (20, 44); l (24, 48) for touch-first forms. */
  size?: 's' | 'normal' | 'l';
  /** The question is the page's heading (one question per page). */
  heading?: boolean;
  /** No option can change. Prefer saying why in the hint. */
  disabled?: boolean;
}

/**
 * Exactly one of a few visible options, chosen as part of a form saved by another action: vertical or inline, with
 * option descriptions, unavailable options, a related question revealed under the chosen option, and a tile appearance.
 * Not for a setting that applies at once (a Switch, or a SegmentedControl for 2-5 views), several choices
 * (CheckboxGroup), or more than six options (Select).
 * @tier fundamental
 * @family selection
 * @a11y A `fieldset` named by its `legend` (via Field) holding native radios that share one name, so the group is one
 * Tab stop and the arrow keys move and choose, as the APG radio group pattern says. Each option is its own `label`
 * target; descriptions are linked with `aria-describedby`; a group error sets `aria-invalid` on each radio. The chosen dot
 * and its filled ring carry the state, not colour alone; forced colours keep both.
 * @key Tab: into the group (the chosen option, or the first); Arrow keys: move to and choose the next or previous option
 * @key Space: choose the focused option
 */
export function RadioGroup({ label, options, value, onChange, hint, error, necessity, orientation = 'vertical', appearance = 'default', size = 'normal', heading, disabled = false, ...data }: RadioGroupProps) {
  const name = useId();
  return (
    <Field label={label} hint={hint} error={error} necessity={necessity} heading={heading} disabled={disabled} group {...data}>
      {() => (
        <span data-dl="radio-group" data-orientation={orientation === 'inline' ? 'inline' : undefined} data-appearance={appearance === 'tile' ? 'tile' : undefined} data-size={size === 'normal' ? undefined : size} data-invalid={error ? '' : undefined}>
          {options.map((o) => {
            const id = `${name}-${o.value}`;
            const chosen = value === o.value;
            return (
              <span key={o.value} data-dl-part="option" data-chosen={chosen ? '' : undefined}>
                <label data-dl-part="choice">
                  <input
                    type="radio"
                    name={name}
                    value={o.value}
                    checked={chosen}
                    disabled={disabled || o.disabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={o.description ? `${id}-description` : undefined}
                    onChange={() => onChange(o.value)}
                  />
                  <span data-dl-part="mark" aria-hidden="true">
                    <span data-dl-part="ring" />
                  </span>
                  <span data-dl-part="words">
                    <span data-dl-part="label">{o.label}</span>
                    {o.description && (
                      <span data-dl-part="description" id={`${id}-description`}>
                        {o.description}
                      </span>
                    )}
                  </span>
                  {o.meta && <span data-dl-part="meta">{o.meta}</span>}
                </label>
                {chosen && o.reveals && <span data-dl-part="reveal">{o.reveals}</span>}
              </span>
            );
          })}
        </span>
      )}
    </Field>
  );
}
