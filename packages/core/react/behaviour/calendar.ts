/**
 * Tier 0: calendar maths for Calendar, DatePicker and DateRangePicker. Dates are local calendar days written as ISO
 * `yyyy-mm-dd` strings, so no time zone ever moves a day. Pure functions, no DOM.
 */

export type CalendarView = 'days' | 'months' | 'years' | 'decades';

export interface Day {
  y: number;
  /** 0–11 */
  m: number;
  d: number;
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

export const toIso = ({ y, m, d }: Day) => `${pad(y, 4)}-${pad(m + 1)}-${pad(d)}`;

export function fromIso(iso: string | null | undefined): Day | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) return null;
  const day = { y: +m[1], m: +m[2] - 1, d: +m[3] };
  return day.m < 12 && day.d >= 1 && day.d <= daysIn(day.y, day.m) ? day : null;
}

export const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/** The day `n` days after (or before) this one. */
export function addDays(day: Day, n: number): Day {
  const t = new Date(day.y, day.m, day.d + n);
  return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
}

/** The same day `n` months on, held to the last day of a shorter month. */
export function addMonths(day: Day, n: number): Day {
  const first = new Date(day.y, day.m + n, 1);
  const y = first.getFullYear();
  const m = first.getMonth();
  return { y, m, d: Math.min(day.d, daysIn(y, m)) };
}

export const compare = (a: Day, b: Day) => a.y - b.y || a.m - b.m || a.d - b.d;

export function today(): Day {
  const t = new Date();
  return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
}

/** 0 = Sunday … 6 = Saturday. */
export const weekday = (day: Day) => new Date(day.y, day.m, day.d).getDay();

/** The locale's first day of the week (0 = Sunday), from Intl where the browser knows it; Monday otherwise. */
export function firstDayOf(locale?: string): number {
  try {
    const l = new Intl.Locale(locale ?? (typeof navigator === 'undefined' ? 'en-GB' : navigator.language)) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const first = l.getWeekInfo?.().firstDay ?? l.weekInfo?.firstDay;
    if (first) return first % 7;
  } catch {
    // An unknown locale: fall through to Monday.
  }
  return 1;
}

/** The six weeks shown for a month, each seven days, starting on `first`. */
export function monthGrid(y: number, m: number, first: number): Day[][] {
  const start = addDays({ y, m, d: 1 }, -((weekday({ y, m, d: 1 }) - first + 7) % 7));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (__, i) => addDays(start, w * 7 + i)));
}

/** ISO 8601 week number. */
export function isoWeek(day: Day): number {
  const t = new Date(Date.UTC(day.y, day.m, day.d));
  const dow = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** The first year of the decade (or century) a year is in. */
export const decadeOf = (y: number) => y - (((y % 10) + 10) % 10);
export const centuryOf = (y: number) => y - (((y % 100) + 100) % 100);

/** Reads what a person typed: ISO, or day, month and year in the locale's order with any separator ("9/11/2026"). */
export function parseTyped(text: string, locale?: string): Day | null {
  const t = text.trim();
  const iso = fromIso(t);
  if (iso) return iso;
  const parts = t.split(/[^\d]+/).filter(Boolean).map(Number);
  if (parts.length !== 3) return null;
  const order = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric' })
    .formatToParts(new Date(2026, 10, 9))
    .filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year')
    .map((p) => p.type);
  const get = (k: string) => parts[order.indexOf(k as 'day')];
  let y = get('year');
  if (y < 100) y += 2000;
  return fromIso(toIso({ y, m: get('month') - 1, d: get('day') }));
}

/** How a day is written in the box for the locale: "18/11/2026", "11/18/2026", "18.11.2026". */
export function formatDay(day: Day | null, locale?: string, format: DateFormat = 'locale'): string {
  if (format === 'iso') return day ? toIso(day) : '';
  return day ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(day.y, day.m, day.d)) : '';
}

/** How a date box shows and asks for a day: in the locale's order (default) or as `yyyy-mm-dd` (`iso`). */
export type DateFormat = 'locale' | 'iso';

/** The pattern to type, for the placeholder and hint: "dd/mm/yyyy", "mm/dd/yyyy", "dd.mm.yyyy", or "yyyy-mm-dd" (`iso`). */
export function datePattern(locale?: string, format: DateFormat = 'locale'): string {
  if (format === 'iso') return 'yyyy-mm-dd';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
    .formatToParts(new Date(2026, 10, 18))
    .map((p) => (p.type === 'day' ? 'dd' : p.type === 'month' ? 'mm' : p.type === 'year' ? 'yyyy' : p.value))
    .join('');
}
