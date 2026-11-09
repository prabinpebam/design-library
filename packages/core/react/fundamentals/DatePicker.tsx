import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { usePopup } from '../behaviour/popup';
import { compare, datePattern, formatDay, fromIso, parseTyped, toIso } from '../behaviour/calendar';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Field } from './Field';
import type { DataAttributes } from '../types';

export interface DatePickerProps extends DataAttributes {
  /** A noun phrase naming the date: "Delivery date". */
  label: string;
  /** The chosen day, `yyyy-mm-dd`, or null. */
  value: string | null;
  /** A day was chosen or typed (`yyyy-mm-dd`), or the box was emptied (null). */
  onChange: (iso: string | null) => void;
  /** One short sentence; the pattern to type ("dd/mm/yyyy") is said after it. */
  hint?: string;
  /** What is wrong and how to fix it; replaces the picker's own typing messages. */
  error?: string;
  /** Marks the label "(optional)". */
  optional?: boolean;
  min?: string;
  max?: string;
  isUnavailable?: (iso: string) => boolean;
  weekNumbers?: boolean;
  locale?: string;
  disabled?: boolean;
}

/**
 * One date, typed in the locale's order or chosen from the Calendar in a popover under the box. Typing is checked when
 * the person leaves the box or presses Enter: a date it can't read, or one outside the limits, keeps the text and says
 * what to type. Not for a date someone knows by heart, such as a birth date (type it in three NumberFields), or a range
 * (DateRangePicker).
 * @tier fundamental
 * @family pickers
 * @a11y A native text input named by the Field label; the pattern is in the hint. The calendar button ("Choose a date")
 * has `aria-haspopup="dialog"`; the popover is a dialog named by the label, focus goes to the chosen day (or today), and
 * Escape or choosing a day closes it and returns focus to the box.
 * @key Alt+Arrow down in the box: opens the calendar
 * @key Escape in the calendar: closes it
 */
export function DatePicker({ label, value, onChange, hint, error, optional = false, min, max, isUnavailable, weekNumbers, locale, disabled = false, ...data }: DatePickerProps) {
  const day = fromIso(value);
  const [text, setText] = useState(formatDay(day, locale));
  const [said, setSaid] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pattern = datePattern(locale);
  const lo = fromIso(min);
  const hi = fromIso(max);

  useEffect(() => {
    setText(formatDay(fromIso(value), locale));
    setSaid(undefined);
  }, [value, locale]);

  const close = (focus: boolean) => {
    setOpen(false);
    if (focus) input.current?.focus();
  };
  usePopup(open, box, popup, root, () => close(false));
  useEffect(() => {
    if (open) popup.current?.querySelector<HTMLElement>('td[data-cursor]')?.focus();
  }, [open]);

  const commit = () => {
    if (text.trim() === '') {
      setSaid(undefined);
      if (value !== null) onChange(null);
      return;
    }
    const typed = parseTyped(text, locale);
    if (!typed) return setSaid(`Type the date as ${pattern}.`);
    if ((lo && compare(typed, lo) < 0) || (hi && compare(typed, hi) > 0)) return setSaid(`Choose a date from ${formatDay(lo, locale) || 'any day'} to ${formatDay(hi, locale) || 'any day'}.`);
    if (isUnavailable?.(toIso(typed))) return setSaid(`${formatDay(typed, locale)} can’t be chosen. Choose another day.`);
    setSaid(undefined);
    setText(formatDay(typed, locale));
    if (toIso(typed) !== value) onChange(toIso(typed));
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

  return (
    <span {...data} ref={root} data-dl="date-picker" data-invalid={error || said ? '' : undefined}>
      <Field label={label} hint={[hint, `Type it as ${pattern}.`].filter(Boolean).join(' ')} error={error ?? said} necessity={optional ? 'optional' : undefined} disabled={disabled}>
        {(control) => (
          <span ref={box} data-dl-part="box" data-dl-ring="">
            <input
              {...control}
              ref={input}
              value={text}
              placeholder={pattern}
              inputMode="numeric"
              autoComplete="off"
              onChange={(e) => setText(e.target.value)}
              onBlur={(e) => {
                if (!root.current?.contains(e.relatedTarget as Node | null)) commit();
              }}
              onKeyDown={onKey}
            />
            <Button size="xs" emphasis="quiet" icon="chevron-down" iconOnly label="Choose a date" aria-haspopup="dialog" aria-expanded={open} disabled={disabled} onClick={() => (open ? close(false) : setOpen(true))} />
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
            value={value}
            min={min}
            max={max}
            isUnavailable={isUnavailable}
            weekNumbers={weekNumbers}
            locale={locale}
            onChange={(iso) => {
              onChange(iso);
              setSaid(undefined);
              close(true);
            }}
          />
        )}
      </div>
    </span>
  );
}
