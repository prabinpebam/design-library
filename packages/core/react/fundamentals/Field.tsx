import { useEffect, useId, useRef, type ReactNode } from 'react';
import { usePresence } from '../behaviour/presence';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { Text } from './Text';
import type { DataAttributes } from '../types';

/** What a Field hands its control: spread it on the input (or the control's own input prop). */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface FieldProps extends DataAttributes {
  /** A short noun phrase naming what goes in, sentence case, no colon: "Email address". */
  label: string;
  /** The control, given the wiring: `{(control) => <input {...control} />}`. For `group`, the controls inside name themselves. */
  children: (control: FieldControlProps) => ReactNode;
  /** One short sentence that helps answer: the format, where to find it, what happens to it. Never repeats the label. */
  hint?: string;
  /** What is wrong and how to fix it. Marks the control invalid and replaces any warning or success line. */
  error?: string;
  /** A caution that doesn't stop the person ("This name is already used in another project"). */
  warning?: string;
  /** A confirmation after a check ("Username available"). Only when the check can fail; never for every valid field. */
  success?: string;
  /** Fields are required by default, so mark only the exceptions: `optional` adds "(optional)"; `required` adds "(required)" for the rare form that is mostly optional, and sets `aria-required`. */
  necessity?: 'optional' | 'required';
  /** A soft limit (default): says how many are left, keeps every character typed past it, and shows the excess as an error.
   * `limit: 'hard'` is for a control that stops typing at `max` itself (a `maxLength`): it reads "12 of 60" and turns to
   * a warning at the limit. */
  count?: { value: string; max: number; unit?: 'characters' | 'words'; limit?: 'soft' | 'hard' };
  /** `vertical` (default): label above. `horizontal`: label beside the control, for dense settings and property panels. */
  orientation?: 'vertical' | 'horizontal';
  /** The label is the page's heading, for a page that asks one question (`h1`). */
  heading?: boolean;
  /** Several controls answer one question (radios, checkboxes, a date in three boxes): a `fieldset` named by a `legend`. */
  group?: boolean;
  /** One action at the end of the label row, such as "Forgot password?" as a Link. */
  action?: ReactNode;
  /** The label and messages dim and the control is unavailable. Prefer `readOnly`, or say why in the hint. */
  disabled?: boolean;
  /** Passed to the control: shown, focusable, not changeable. */
  readOnly?: boolean;
  /** Hides the label where the row already says what the field is (an inspector); it still names the control. */
  hideLabel?: boolean;
  /** A line the control owns, after the messages: a failed save with Retry, kept in the field's rhythm. Give it an id and
   * add that id to the control's `aria-describedby`. */
  after?: ReactNode;
}

const tally = (text: string, unit: 'characters' | 'words') => (unit === 'words' ? (text.trim() ? text.trim().split(/\s+/).length : 0) : [...text].length);

/**
 * The anatomy every input shares: a label above (or beside) the control, an optional or required marker, a hint, one
 * message line (error, warning or success) and a soft character or word count, all wired to the control by id.
 * Not a control itself: it wraps one (or, as a group, several).
 * @tier fundamental
 * @family inputs
 * @a11y The label is a `label` for the control's id (a `legend` for a group), with the id `{control id}-label` for a
 * control that names itself with `aria-labelledby`. Hint, count and message join
 * `aria-describedby` in reading order; an error, or a count past its limit, sets `aria-invalid`. The count is announced
 * politely only near and past the limit. Icons are decorative: the words say it. As a heading, the label sits in an `h1`.
 */
export function Field({ label, children, hint, error, warning, success, necessity, count, orientation = 'vertical', heading = false, group = false, action, disabled = false, readOnly, hideLabel = false, after, ...data }: FieldProps) {
  const id = useId();
  const unit = count?.unit ?? 'characters';
  const hard = count?.limit === 'hard';
  const used = count ? tally(count.value, unit) : 0;
  const left = count ? count.max - used : 0;
  const over = !!count && !hard && left < 0;
  const near = !!count && used >= count.max * 0.8;
  const message = error ? 'error' : warning ? 'warning' : success ? 'success' : undefined;
  const words = error ?? warning ?? success;
  // Q65 C3: the message line opens in place, and stays mounted with its last words while it closes.
  type Shown = { kind: 'error' | 'warning' | 'success'; words?: string };
  const last = useRef<Shown | null>(null);
  if (message) last.current = { kind: message, words };
  const messageMounted = usePresence(!!message);
  const shown: Shown | null = message ? { kind: message, words } : messageMounted ? last.current : null;
  // A message present at first render is simply there (Z19); one that arrives later reveals.
  const settled = useRef(false);
  useEffect(() => {
    settled.current = true;
  }, []);
  const describedBy = [hint && `${id}-hint`, count && `${id}-count`, message && `${id}-message`].filter(Boolean).join(' ') || undefined;
  const invalid = !!error || over;
  const control: FieldControlProps = {
    id,
    'aria-describedby': group ? undefined : describedBy,
    'aria-invalid': invalid && !group ? true : undefined,
    'aria-required': necessity === 'required' && !group ? true : undefined,
    disabled: disabled || undefined,
    readOnly,
  };
  const marker = necessity && <span data-dl-part="necessity">{` (${necessity})`}</span>;
  const labelEl = group ? (
    <legend data-dl-part="label">
      {heading ? <h1>{label}{marker}</h1> : <>{label}{marker}</>}
    </legend>
  ) : heading ? (
    <h1 data-dl-part="label">
      <label htmlFor={id} id={`${id}-label`}>{label}{marker}</label>
    </h1>
  ) : (
    <label htmlFor={id} id={`${id}-label`} data-dl-part="label" data-hidden={hideLabel ? '' : undefined}>
      {label}
      {marker}
    </label>
  );
  const unitWord = (n: number) => (unit === 'words' ? (n === 1 ? 'word' : 'words') : n === 1 ? 'character' : 'characters');
  const body = (
    <>
      {action ? (
        <span data-dl-part="label-row">
          {labelEl}
          {action}
        </span>
      ) : (
        labelEl
      )}
      <span data-dl-part="control">{children(control)}</span>
      {(hint || count || shown) && (
        <span data-dl-part="messages">
          {hint && (
            <span id={`${id}-hint`} data-dl-part="hint">
              <Text as="span" variant="body-sm" tone="muted">
                {hint}
              </Text>
            </span>
          )}
          {shown && (
            <Reveal open={!!message} appear={settled.current}>
              <span id={`${id}-message`} data-dl-part="message" data-message={shown.kind}>
                <Icon name={shown.kind} size="sm" />
                <Text as="span" variant="body-sm" tone={shown.kind === 'error' ? 'danger' : shown.kind}>
                  {shown.words}
                </Text>
              </span>
            </Reveal>
          )}
          {count && (
            <span id={`${id}-count`} data-dl-part="count" aria-live={near ? 'polite' : 'off'}>
              <Text as="span" variant="body-sm" tone={over ? 'danger' : hard && left <= 0 ? 'warning' : 'muted'}>
                {hard ? `${used} of ${count.max}` : over ? `${-left} ${unitWord(-left)} too many` : `${left} ${unitWord(left)} left`}
              </Text>
            </span>
          )}
        </span>
      )}
      {after}
    </>
  );
  const attrs = {
    ...data,
    'data-dl': 'field',
    'data-orientation': orientation === 'horizontal' ? 'horizontal' : undefined,
    'data-invalid': invalid ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    'data-heading': heading ? '' : undefined,
  };
  return group ? (
    <fieldset {...attrs} disabled={disabled} aria-describedby={describedBy}>
      {body}
    </fieldset>
  ) : (
    <div {...attrs}>{body}</div>
  );
}
