import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { daysIn, fromIso, toIso } from '../behaviour/calendar';
import { Field } from './Field';
import type { DataAttributes } from '../types';

export interface DateFieldProps extends DataAttributes {
  /** What the date is, sentence case: "Date of birth", "Passport issue date". */
  label: string;
  /** The date as `YYYY-MM-DD`, or null when empty. */
  value: string | null;
  /** Called with the new date once day, month and year make a real date, or null when all are cleared. */
  onChange: (next: string | null) => void;
  /** Defaults to an example in the locale's order, e.g. "For example, 27 3 1990". */
  hint?: string;
  error?: string;
  optional?: boolean;
  /**
   * `separate`: three labelled boxes in a fieldset, for dates people know by heart (birth, issue dates); the month
   * also takes its name ("mar", "March"). `segmented`: one field of day, month and year parts that step with the arrow
   * keys, the typed path of DatePicker.
   */
  layout?: 'separate' | 'segmented';
  /** BCP 47 locale for the parts' order and the month names; defaults to the page's. */
  locale?: string;
  disabled?: boolean;
}

type Part = 'day' | 'month' | 'year';
type Parts = Record<Part, string>;

const names: Record<Part, string> = { day: 'Day', month: 'Month', year: 'Year' };

function order(locale?: string): Part[] {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric' })
    .formatToParts(new Date(2000, 0, 2))
    .map((p) => p.type)
    .filter((t): t is Part => t === 'day' || t === 'month' || t === 'year');
}

function monthOf(text: string, locale?: string): number | null {
  const t = text.trim().toLowerCase();
  if (/^\d{1,2}$/.test(t)) return Number(t) >= 1 && Number(t) <= 12 ? Number(t) : null;
  if (t.length < 3) return null;
  for (let m = 0; m < 12; m += 1) {
    for (const style of ['long', 'short'] as const) {
      const name = new Intl.DateTimeFormat(locale, { month: style }).format(new Date(2000, m, 1)).toLowerCase().replace('.', '');
      if (name.startsWith(t) || t.startsWith(name)) return m + 1;
    }
  }
  return null;
}

const toParts = (value: string | null): Parts => {
  const d = fromIso(value);
  return d ? { day: String(d.d), month: String(d.m + 1), year: String(d.y) } : { day: '', month: '', year: '' };
};

/** What's wrong with the parts, in words, or the date. */
function check(parts: Parts, locale?: string): { iso: string | null; problem?: string } {
  const filled = (['day', 'month', 'year'] as Part[]).filter((p) => parts[p].trim());
  if (!filled.length) return { iso: null };
  const missing = (['day', 'month', 'year'] as Part[]).filter((p) => !parts[p].trim());
  if (missing.length) return { iso: null, problem: `The date must include a ${missing.map((p) => names[p].toLowerCase()).join(' and a ')}.` };
  const d = Number(parts.day);
  const m = monthOf(parts.month, locale);
  const y = Number(parts.year);
  if (!/^\d{4}$/.test(parts.year.trim())) return { iso: null, problem: 'The year must have 4 numbers.' };
  if (!m) return { iso: null, problem: 'Enter the month as a number from 1 to 12, or its name.' };
  if (!Number.isInteger(d) || d < 1 || d > daysIn(y, m - 1)) return { iso: null, problem: `The day must be a number from 1 to ${daysIn(y, m - 1)}.` };
  return { iso: toIso({ y, m: m - 1, d }) };
}

/**
 * A date typed in its parts, day, month and year, in the locale's order: three labelled boxes, or one field of parts
 * that step with the arrow keys. Not for choosing a date near today from a calendar (DatePicker, which uses the
 * segmented form for typing).
 * @tier fundamental
 * @family pickers
 * @a11y Separate: a `fieldset` named by the label as its `legend`, three inputs named "Day", "Month", "Year" with
 * numeric keyboards (the month also takes words), autocomplete for a birth date when the label asks for one. Segmented:
 * a `group` named by the label with one `spinbutton` per part, its range and "Empty" when not filled. A problem says
 * which part is missing or wrong, and is checked when focus leaves the date, never while typing.
 * @key ArrowUp / ArrowDown: segmented: one more or less; wraps
 * @key 0–9: segmented: types into the part, then moves on
 * @key Backspace: segmented: clears the part
 * @key ArrowLeft / ArrowRight: segmented: the previous or next part
 */
export function DateField({ label, value, onChange, hint, error, optional = false, layout = 'separate', locale, disabled = false, ...data }: DateFieldProps) {
  const [parts, setParts] = useState<Parts>(() => toParts(value));
  const [problem, setProblem] = useState<string | undefined>();
  const root = useRef<HTMLSpanElement>(null);
  const typed = useRef('');
  const seq = order(locale);
  const example = seq.map((p) => ({ day: '27', month: '3', year: '1990' })[p]).join(' ');
  const birth = /birth/i.test(label);

  useEffect(() => {
    setParts(toParts(value));
    setProblem(undefined);
  }, [value]);

  const commit = (next: Parts) => {
    const { iso, problem: p } = check(next, locale);
    setProblem(p);
    if (!p && iso !== value) onChange(iso);
  };

  const leave = (e: { relatedTarget: EventTarget | null }) => {
    if (!root.current?.contains(e.relatedTarget as Node | null)) commit(parts);
  };

  const shownError = error ?? problem;
  const fieldHint = hint ?? `For example, ${example}`;

  if (layout === 'separate') {
    return (
      <span {...data} ref={root} data-dl="date-field" data-layout="separate" data-invalid={shownError ? '' : undefined} onBlur={leave}>
        <Field group label={label} hint={fieldHint} error={shownError} necessity={optional ? 'optional' : undefined} disabled={disabled}>
          {() => (
            <span data-dl-part="parts">
              {seq.map((p) => (
                <label key={p} data-dl-part="part" data-part={p}>
                  <span data-dl-part="part-label">{names[p]}</span>
                  <input
                    value={parts[p]}
                    inputMode={p === 'month' ? 'text' : 'numeric'}
                    autoComplete={birth ? ({ day: 'bday-day', month: 'bday-month', year: 'bday-year' } as const)[p] : 'off'}
                    maxLength={p === 'year' ? 4 : p === 'month' ? 9 : 2}
                    disabled={disabled}
                    aria-invalid={shownError ? true : undefined}
                    onChange={(e) => setParts((all) => ({ ...all, [p]: e.target.value }))}
                  />
                </label>
              ))}
            </span>
          )}
        </Field>
      </span>
    );
  }

  const max: Record<Part, number> = { day: 31, month: 12, year: 9999 };
  const width: Record<Part, number> = { day: 2, month: 2, year: 4 };
  const show = (p: Part) => (parts[p] ? parts[p].padStart(width[p], '0') : p === 'year' ? 'yyyy' : p === 'month' ? 'mm' : 'dd');
  const move = (from: Part, by: 1 | -1) => {
    const i = seq.indexOf(from) + by;
    if (i >= 0 && i < seq.length) root.current?.querySelector<HTMLElement>(`[data-part="${seq[i]}"]`)?.focus();
  };
  const set = (p: Part, v: string) => {
    const next = { ...parts, [p]: v };
    setParts(next);
    const { iso, problem: pr } = check(next, locale);
    if (!pr && iso && iso !== value) onChange(iso);
  };
  const onKey = (p: Part) => (e: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      e.preventDefault();
      typed.current = '';
      move(p, k === 'ArrowRight' ? 1 : -1);
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault();
      typed.current = '';
      const now = parts[p] ? Number(parts[p]) : p === 'year' ? new Date().getFullYear() : p === 'month' ? new Date().getMonth() + 1 : new Date().getDate();
      const lo = p === 'year' ? 1 : 1;
      const span = max[p] - lo + 1;
      const next = parts[p] ? ((((now - lo + (k === 'ArrowUp' ? 1 : -1)) % span) + span) % span) + lo : now;
      set(p, String(next));
    } else if (k === 'Backspace' || k === 'Delete') {
      e.preventDefault();
      typed.current = '';
      set(p, '');
    } else if (/^\d$/.test(k)) {
      e.preventDefault();
      let text = typed.current + k;
      if (Number(text) > max[p]) text = k;
      typed.current = text;
      set(p, text);
      if (text.length >= width[p] || Number(text) * 10 > max[p]) {
        typed.current = '';
        move(p, 1);
      }
    }
  };

  return (
    <span {...data} ref={root} data-dl="date-field" data-layout="segmented" data-invalid={shownError ? '' : undefined} onBlur={leave}>
      <Field label={label} hint={fieldHint} error={shownError} necessity={optional ? 'optional' : undefined} disabled={disabled}>
        {(control) => (
          <div data-dl-part="box" data-dl-ring="" role="group" id={control.id} aria-labelledby={`${control.id}-label`} aria-describedby={control['aria-describedby']} aria-disabled={disabled || undefined}>
            {seq.map((p, i) => (
              <span key={p} data-dl-part="segment-wrap">
                {i > 0 && (
                  <span data-dl-part="separator" aria-hidden="true">
                    /
                  </span>
                )}
                <span
                  data-dl-part="segment"
                  data-part={p}
                  data-empty={parts[p] ? undefined : ''}
                  role="spinbutton"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={names[p]}
                  aria-invalid={shownError ? true : undefined}
                  aria-valuemin={1}
                  aria-valuemax={max[p]}
                  aria-valuenow={parts[p] ? Number(parts[p]) : undefined}
                  aria-valuetext={parts[p] ? (p === 'month' ? new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, Number(parts[p]) - 1, 1)) : parts[p]) : 'Empty'}
                  onKeyDown={onKey(p)}
                  onFocus={() => (typed.current = '')}
                >
                  {show(p)}
                </span>
              </span>
            ))}
          </div>
        )}
      </Field>
    </span>
  );
}
