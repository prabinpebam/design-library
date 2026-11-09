import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Field } from './Field';
import type { DataAttributes } from '../types';

export interface TimeFieldProps extends DataAttributes {
  /** What the time is for, sentence case: "Start time", "Reminder". */
  label: string;
  /** The time as `HH:MM` (or `HH:MM:SS` with `seconds`) on the 24-hour clock, or null when empty. */
  value: string | null;
  /** Called with the new time once every part is filled, or null when it is cleared. */
  onChange: (next: string | null) => void;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Adds a seconds part. */
  seconds?: boolean;
  /** Minutes each arrow press moves, e.g. 15 for a booking. Typing still takes any minute. Defaults to 1. */
  step?: number;
  /** 12 or 24 hours; defaults to the locale's clock. */
  hourCycle?: 12 | 24;
  /** BCP 47 locale for the clock and the AM/PM words; defaults to the page's. */
  locale?: string;
  disabled?: boolean;
}

type Part = 'hour' | 'minute' | 'second' | 'period';
type Parts = { hour: number | null; minute: number | null; second: number | null; pm: boolean };

const names: Record<Part, string> = { hour: 'Hours', minute: 'Minutes', second: 'Seconds', period: 'AM or PM' };
const pad = (n: number | null) => (n === null ? '––' : String(n).padStart(2, '0'));

function clock(locale?: string) {
  const options = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
  const twelve = options.hourCycle === 'h12' || options.hourCycle === 'h11';
  const words = (h: number) => new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true }).formatToParts(new Date(2000, 0, 1, h)).find((p) => p.type === 'dayPeriod')?.value ?? (h < 12 ? 'AM' : 'PM');
  return { twelve, am: words(9), pm: words(15) };
}

function read(value: string | null): Parts {
  const m = value ? /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value) : null;
  if (!m) return { hour: null, minute: null, second: null, pm: false };
  const h = Number(m[1]);
  return { hour: h, minute: Number(m[2]), second: m[3] ? Number(m[3]) : 0, pm: h >= 12 };
}

/**
 * A typed time in parts: hours, minutes (and seconds), plus AM or PM on a 12-hour clock, in the locale's order. Each
 * part takes digits and moves on by itself, steps with the arrow keys and clears with Backspace.
 * Not for a duration ("1 h 30 min": a NumberField with a unit) or for picking from available slots (a list of times).
 * @tier fundamental
 * @family pickers
 * @a11y A `group` named by the label; each part is a `spinbutton` with its own name ("Hours"), its value in words and
 * its range. Each part is a tab stop; left and right also move between parts. A part that isn't
 * filled says "Empty". The parts sit left to right in every language, as clocks do.
 * @key ArrowUp / ArrowDown: one more or less (minutes by `step`); wraps
 * @key 0–9: types into the part, then moves on
 * @key A / P: AM or PM
 * @key Backspace: clears the part
 * @key ArrowLeft / ArrowRight: the previous or next part
 */
export function TimeField({ label, value, onChange, hint, error, optional = false, seconds = false, step = 1, hourCycle, locale, disabled = false, ...data }: TimeFieldProps) {
  const { twelve: localeTwelve, am, pm } = clock(locale);
  const twelve = hourCycle ? hourCycle === 12 : localeTwelve;
  const [parts, setParts] = useState<Parts>(() => read(value));
  const typed = useRef('');
  const group = useRef<HTMLDivElement>(null);

  useEffect(() => setParts(read(value)), [value]);

  const order: Part[] = ['hour', 'minute', ...(seconds ? (['second'] as Part[]) : []), ...(twelve ? (['period'] as Part[]) : [])];

  const update = (next: Parts) => {
    setParts(next);
    const done = next.hour !== null && next.minute !== null && (!seconds || next.second !== null);
    const empty = next.hour === null && next.minute === null && (!seconds || next.second === null);
    if (done) {
      const out = `${pad(next.hour)}:${pad(next.minute)}${seconds ? `:${pad(next.second)}` : ''}`;
      if (out !== value) onChange(out);
    } else if (empty && value !== null) onChange(null);
  };

  const shown = (part: Part) => {
    if (part === 'period') return parts.pm ? pm : am;
    if (part === 'hour' && parts.hour !== null && twelve) return pad(parts.hour % 12 === 0 ? 12 : parts.hour % 12);
    return pad(parts[part]);
  };

  const move = (from: Part, by: 1 | -1) => {
    const i = order.indexOf(from) + by;
    if (i < 0 || i >= order.length) return;
    group.current?.querySelector<HTMLElement>(`[data-part="${order[i]}"]`)?.focus();
  };

  const setHour = (shownHour: number, base = parts) => {
    const h = twelve ? (shownHour % 12) + (base.pm ? 12 : 0) : shownHour;
    return { ...base, hour: h };
  };

  const onKey = (part: Part) => (e: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      e.preventDefault();
      typed.current = '';
      move(part, k === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (part === 'period') {
      const want = k === 'ArrowUp' || k === 'ArrowDown' ? !parts.pm : /^a$/i.test(k) ? false : /^p$/i.test(k) ? true : null;
      if (want === null) return;
      e.preventDefault();
      const hour = parts.hour === null ? null : (parts.hour % 12) + (want ? 12 : 0);
      update({ ...parts, pm: want, hour });
      return;
    }
    const max = part === 'hour' ? 23 : 59;
    if (k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault();
      typed.current = '';
      const by = (part === 'minute' ? step : 1) * (k === 'ArrowUp' ? 1 : -1);
      const now = parts[part];
      const start = now === null ? (part === 'hour' ? new Date().getHours() : 0) : now;
      const next = (((start + by) % (max + 1)) + max + 1) % (max + 1);
      update({ ...parts, [part]: next, pm: part === 'hour' ? next >= 12 : parts.pm });
      return;
    }
    if (k === 'Backspace' || k === 'Delete') {
      e.preventDefault();
      typed.current = '';
      update({ ...parts, [part]: null });
      return;
    }
    if (/^\d$/.test(k)) {
      e.preventDefault();
      const text = typed.current + k;
      const n = Number(text);
      const shownMax = part === 'hour' && twelve ? 12 : max;
      if (part === 'hour') {
        const ok = twelve ? n >= 1 && n <= 12 : n <= 23;
        update(ok ? setHour(n) : setHour(Number(k)));
      } else update({ ...parts, [part]: n <= max ? n : Number(k) });
      typed.current = n <= shownMax && text.length < 2 ? text : '';
      // A second digit, or a first that can't start a two-digit value, finishes the part.
      if (text.length >= 2 || Number(k) * 10 > shownMax) {
        typed.current = '';
        move(part, 1);
      }
    }
  };

  return (
    <span {...data} data-dl="time-field" data-invalid={error ? '' : undefined}>
      <Field label={label} hint={hint} error={error} necessity={optional ? 'optional' : undefined} disabled={disabled}>
        {(control) => (
          <div
            ref={group}
            data-dl-part="box"
            data-dl-ring=""
            role="group"
            id={control.id}
            aria-labelledby={`${control.id}-label`}
            aria-describedby={control['aria-describedby']}
            aria-disabled={disabled || undefined}
            dir="ltr"
          >
            {order.map((part, i) => (
              <span key={part} data-dl-part="segment-wrap">
                {i > 0 && part !== 'period' && (
                  <span data-dl-part="separator" aria-hidden="true">
                    :
                  </span>
                )}
                <span
                  data-dl-part="segment"
                  data-part={part}
                  data-empty={part !== 'period' && parts[part] === null ? '' : undefined}
                  role="spinbutton"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={names[part]}
                  aria-invalid={control['aria-invalid']}
                  aria-valuemin={part === 'period' ? undefined : part === 'hour' ? (twelve ? 1 : 0) : 0}
                  aria-valuemax={part === 'period' ? undefined : part === 'hour' ? (twelve ? 12 : 23) : 59}
                  aria-valuenow={part === 'period' ? undefined : parts[part] === null ? undefined : Number(shown(part))}
                  aria-valuetext={part !== 'period' && parts[part] === null ? 'Empty' : shown(part)}
                  onKeyDown={onKey(part)}
                  onFocus={() => (typed.current = '')}
                >
                  {shown(part)}
                </span>
              </span>
            ))}
          </div>
        )}
      </Field>
    </span>
  );
}
