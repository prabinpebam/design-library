import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { usePopup } from '../behaviour/popup';
import { compare, type DateFormat, datePattern, formatDay, fromIso, parseTyped, toIso, type Day } from '../behaviour/calendar';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Field } from './Field';
import type { DataAttributes } from '../types';

export interface DateRangePickerProps extends DataAttributes {
  /** Names the range: "Stay", "Report period". */
  label: string;
  /** The first and last day, `yyyy-mm-dd`, or null. */
  value: [string | null, string | null];
  onChange: (range: [string | null, string | null]) => void;
  hint?: string;
  error?: string;
  optional?: boolean;
  min?: string;
  max?: string;
  isUnavailable?: (iso: string) => boolean;
  weekNumbers?: boolean;
  locale?: string;
  /** How the box shows and asks for the day: the locale's order (default) or `iso`, `yyyy-mm-dd` as stored. */
  format?: DateFormat;
  disabled?: boolean;
}

/**
 * A first and a last day, typed in two boxes or chosen on a two-month Calendar in a popover: the first press sets the
 * first day, the second the last, with the days between previewed as you point. A last day before the first is refused
 * with a message, never silently swapped.
 * Not for one date (DatePicker) or for a fixed period such as "this month" (a Select of periods).
 * @tier fundamental
 * @family pickers
 * @a11y Two native text inputs: the first named by the Field label and "first day", the second "last day"; the pattern
 * is in the hint. The calendar button opens a dialog with the range Calendar; it closes when the last day is chosen, or
 * on Escape, and focus returns to the first box.
 * @key Alt+Arrow down in either box: opens the calendar
 */
export function DateRangePicker({ label, value, onChange, hint, error, optional = false, min, max, isUnavailable, weekNumbers, locale, format = 'locale', disabled = false, ...data }: DateRangePickerProps) {
  const [texts, setTexts] = useState<[string, string]>([formatDay(fromIso(value[0]), locale, format), formatDay(fromIso(value[1]), locale, format)]);
  const [said, setSaid] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const pattern = datePattern(locale, format);
  const lo = fromIso(min);
  const hi = fromIso(max);

  useEffect(() => {
    setTexts([formatDay(fromIso(value[0]), locale, format), formatDay(fromIso(value[1]), locale, format)]);
    setSaid(undefined);
  }, [value[0], value[1], locale, format]);

  const close = (focus: boolean) => {
    setOpen(false);
    if (focus) first.current?.focus();
  };
  usePopup(open, box, popup, root, () => close(false));
  useEffect(() => {
    if (open) popup.current?.querySelector<HTMLElement>('td[data-cursor]')?.focus();
  }, [open]);

  /** Reads both boxes; says what to fix instead of guessing. */
  const commit = () => {
    const read = texts.map((t) => (t.trim() === '' ? null : parseTyped(t, locale))) as [Day | null, Day | null];
    if (texts.some((t, i) => t.trim() !== '' && !read[i])) return setSaid(`Type each date as ${pattern}.`);
    if (read.some((d) => d && ((lo && compare(d, lo) < 0) || (hi && compare(d, hi) > 0)))) return setSaid(`Choose dates from ${formatDay(lo, locale, format) || 'any day'} to ${formatDay(hi, locale, format) || 'any day'}.`);
    if (read[0] && read[1] && compare(read[1], read[0]) < 0) return setSaid('The last day is before the first. Change one of them.');
    setSaid(undefined);
    const next = read.map((d) => (d ? toIso(d) : null)) as [string | null, string | null];
    setTexts([formatDay(read[0], locale, format), formatDay(read[1], locale, format)]);
    if (next[0] !== value[0] || next[1] !== value[1]) onChange(next);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      setOpen(true);
    }
  };
  const blur = (e: { relatedTarget: EventTarget | null }) => {
    if (!root.current?.contains(e.relatedTarget as Node | null)) commit();
  };

  return (
    <span {...data} ref={root} data-dl="date-range-picker" data-invalid={error || said ? '' : undefined}>
      <Field label={label} hint={[hint, `Type each as ${pattern}.`].filter(Boolean).join(' ')} error={error ?? said} necessity={optional ? 'optional' : undefined} disabled={disabled}>
        {(control) => (
          <span ref={box} data-dl-part="box" data-dl-ring="">
            <input {...control} ref={first} aria-label={`${label}, first day`} value={texts[0]} placeholder={pattern} inputMode="numeric" autoComplete="off" onChange={(e) => setTexts([e.target.value, texts[1]])} onBlur={blur} onKeyDown={onKey} />
            <span data-dl-part="dash" aria-hidden="true">
              –
            </span>
            <input aria-label={`${label}, last day`} aria-describedby={control['aria-describedby']} aria-invalid={control['aria-invalid']} disabled={control.disabled} value={texts[1]} placeholder={pattern} inputMode="numeric" autoComplete="off" onChange={(e) => setTexts([texts[0], e.target.value])} onBlur={blur} onKeyDown={onKey} />
            <Button size="xs" emphasis="quiet" icon="chevron-down" iconOnly label="Choose dates" disabled={disabled} onClick={() => (open ? close(false) : setOpen(true))} />
          </span>
        )}
      </Field>
      <div
        ref={popup}
        data-dl-part="popup" data-presence="popup" data-material="floating" data-elevation="3"
        popover="manual"
        hidden={!open}
        role="dialog"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return;
          e.preventDefault();
          close(true);
        }}
      >
        {open && (
          <Calendar
            label={label}
            mode="range"
            months={2}
            range={value}
            min={min}
            max={max}
            isUnavailable={isUnavailable}
            weekNumbers={weekNumbers}
            locale={locale}
            onRangeChange={(r) => {
              onChange(r);
              setSaid(undefined);
              if (r[1]) close(true);
            }}
          />
        )}
      </div>
    </span>
  );
}
