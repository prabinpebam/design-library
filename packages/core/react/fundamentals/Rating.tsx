import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { DataAttributes } from '../types';

export interface RatingProps extends DataAttributes {
  /** What is being rated, e.g. "Your rating" or "Average rating". Shown unless `hideLabel`; always the accessible name. */
  label: string;
  /** Hides the visible label where a heading or row already says what is rated. */
  hideLabel?: boolean;
  /** The rating, from 0 to `max`; null when nothing is chosen yet. Read-only ratings may be any fraction (4.3). */
  value: number | null;
  /** Called with the new rating, or null when the chosen value is pressed again to clear it. */
  onChange?: (value: number | null) => void;
  /** How many stars. */
  max?: number;
  /** The smallest step a person can choose: whole stars or halves. */
  precision?: 1 | 0.5;
  /** Words for each whole value, e.g. ["Poor", "Fair", "Good", "Very good", "Excellent"]; shown beside the stars and announced. */
  words?: string[];
  /** Writes the value beside the stars ("4.3 of 5", or the value's words). */
  showValue?: boolean;
  /** Pressing the chosen value again clears the rating. */
  clearable?: boolean;
  /** s 16 px stars for cards and tables, normal 24 px for forms, l 32 px for a page's main question. */
  size?: 's' | 'normal' | 'l';
  /** Shows the rating without input: an average or someone else's rating. */
  readOnly?: boolean;
  disabled?: boolean;
}

/** The library's own star on a 24-unit grid: a rating's mark, drawn by the component like Switch draws its knob, so an icon set never changes what it means. */
const STAR = 'M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z';

const say = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, ''));

/**
 * Chooses or shows a score out of a few stars (reviews, feedback). Hovering previews a value; pressing the chosen value
 * again clears it; words per value say what each score means. Read-only shows any fraction, such as an average.
 * Not for a precise number (use NumberField or Slider) or a yes/no question (use SegmentedControl or Switch).
 * @tier fundamental
 * @family inputs
 * @a11y Input: a `radiogroup` named by the label with one `radio` per step ("3 stars, Good"), one Tab stop on the chosen
 * step (or the first). Read-only: `role="img"` named "Average rating: 4.3 of 5". Stars are filled, never coloured
 * alone: the value is also written when `showValue`. Stars sit 4 px apart; each is a 24 px target at size normal and l
 * (a written exception: below 44 px, never below the 24 px minimum); size s is display-only scale for read-only use.
 * @key Arrow keys: the next or previous step (chooses it, as radios do); Home / End: the lowest or highest
 * @key Space or Enter: chooses the focused step, or clears it when it is already chosen and `clearable`
 */
export function Rating({ label, hideLabel = false, value, onChange, max = 5, precision = 1, words, showValue = false, clearable = true, size = 'normal', readOnly = false, disabled = false, ...data }: RatingProps) {
  const id = useId();
  const [preview, setPreview] = useState<number | null>(null);
  const steps = Array.from({ length: Math.round(max / precision) }, (_, i) => Number(((i + 1) * precision).toFixed(1)));
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const shown = preview ?? value ?? 0;
  const wordFor = (v: number) => (words && Number.isInteger(v) ? words[v - 1] : undefined);
  const written = value === null ? 'Not rated' : wordFor(value) ?? `${say(value)} of ${max}`;
  const input = !readOnly && !!onChange;

  const pick = (v: number) => {
    if (disabled || !onChange) return;
    onChange(clearable && v === value ? null : v);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled || !onChange) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const at = value === null ? -1 : steps.indexOf(value);
    let to: number | null = null;
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') || e.key === 'ArrowUp') to = Math.min(steps.length - 1, at + 1);
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') || e.key === 'ArrowDown') to = Math.max(0, at - 1);
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = steps.length - 1;
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      pick(Number((e.currentTarget as HTMLElement).dataset.step));
      return;
    }
    if (to === null) return;
    e.preventDefault();
    onChange(steps[to]);
    refs.current[to]?.focus();
  };
  const tabStop = value === null ? 0 : Math.max(0, steps.indexOf(value));

  const stars = (
    <span data-dl-part="stars" onPointerLeave={() => setPreview(null)}>
      {Array.from({ length: max }, (_, s) => {
        const fill = Math.max(0, Math.min(1, shown - s));
        return (
          <span key={s} data-dl-part="star" style={{ '--fill': String(fill) } as CSSProperties}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-dl-part="star-empty">
              <path d={STAR} />
            </svg>
            <span data-dl-part="star-full" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d={STAR} />
              </svg>
            </span>
            {input &&
              steps
                .filter((v) => v > s && v <= s + 1)
                .map((v) => {
                  const i = steps.indexOf(v);
                  const half = precision === 0.5 && !Number.isInteger(v);
                  return (
                    <span
                      key={v}
                      ref={(el) => void (refs.current[i] = el)}
                      data-dl-part="step"
                      data-half={precision === 0.5 ? (half ? 'start' : 'end') : undefined}
                      data-step={v}
                      role="radio"
                      aria-checked={value === v}
                      aria-label={`${say(v)} ${v === 1 ? 'star' : 'stars'}${wordFor(v) ? `, ${wordFor(v)}` : ''}`}
                      aria-disabled={disabled || undefined}
                      tabIndex={disabled ? -1 : i === tabStop ? 0 : -1}
                      onPointerEnter={() => !disabled && setPreview(v)}
                      onClick={() => pick(v)}
                      onKeyDown={onKeyDown}
                    />
                  );
                })}
          </span>
        );
      })}
    </span>
  );

  return (
    <div {...data} data-dl="rating" data-size={size} data-readonly={input ? undefined : 'on'} data-disabled={disabled ? 'on' : undefined} data-preview={preview !== null ? 'on' : undefined}>
      {!hideLabel && (
        <span data-dl-part="label" id={`${id}-label`}>
          {label}
        </span>
      )}
      <span data-dl-part="row">
        {input ? (
          <span role="radiogroup" aria-labelledby={hideLabel ? undefined : `${id}-label`} aria-label={hideLabel ? label : undefined} aria-disabled={disabled || undefined}>
            {stars}
          </span>
        ) : (
          <span role="img" aria-label={`${label}: ${value === null ? 'not rated' : `${say(value)} of ${max}`}`}>
            {stars}
          </span>
        )}
        {(showValue || (words && input)) && (
          <span data-dl-part="value" aria-hidden="true">
            {preview !== null ? wordFor(preview) ?? `${say(preview)} of ${max}` : written}
          </span>
        )}
      </span>
    </div>
  );
}
