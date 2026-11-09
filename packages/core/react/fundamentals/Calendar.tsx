import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { addDays, addMonths, centuryOf, compare, daysIn, decadeOf, firstDayOf, fromIso, isoWeek, monthGrid, toIso, today as todayOf, weekday, type CalendarView, type Day } from '../behaviour/calendar';
import { Button } from './Button';
import { Morph } from './Morph';
import type { DataAttributes } from '../types';

export interface CalendarProps extends DataAttributes {
  /** Names the calendar for assistive technology: "Start date", "Delivery date". */
  label: string;
  /** `single` (default): one day. `range`: a first and a last day, with the days between shown as one band. */
  mode?: 'single' | 'range';
  /** With `single`: the chosen day, `yyyy-mm-dd`, or null. */
  value?: string | null;
  /** With `single`: a day was chosen. */
  onChange?: (iso: string) => void;
  /** With `range`: the first and last day, `yyyy-mm-dd`; the last is null while only the first is chosen. */
  range?: [string | null, string | null];
  /** With `range`: the first day, then the last, as they are chosen. A day before the first starts again from it. */
  onRangeChange?: (range: [string, string | null]) => void;
  /** The earliest and latest days that can be chosen, `yyyy-mm-dd`. */
  min?: string;
  max?: string;
  /** Days that can't be chosen (fully booked, weekends): they show struck through, stay reachable by keys and can't be chosen. */
  isUnavailable?: (iso: string) => boolean;
  /** Shows the ISO week number before each week. */
  weekNumbers?: boolean;
  /** Two months side by side, for choosing a range across a month's end. */
  months?: 1 | 2;
  /** The language for names and the first day of the week; the browser's by default. */
  locale?: string;
  /** 0 Sunday … 6 Saturday; from the locale by default. */
  firstDay?: number;
  /** The month shown first, `yyyy-mm` or any day in it; the chosen day's month, or today's, by default. */
  initialMonth?: string;
}

const same = (a: Day | null, b: Day | null) => !!a && !!b && compare(a, b) === 0;
const stepView: Record<CalendarView, CalendarView> = { days: 'months', months: 'years', years: 'decades', decades: 'decades' };

/**
 * A month of days to choose one day or a range, that zooms out the way the Windows calendar does: press the title to
 * see the year's months, again for the decade's years, again for the century's decades; choosing one zooms back in.
 * Previous and next page by the view's period; Today comes back. Built for DatePicker and DateRangePicker, and usable
 * on its own on a page.
 * Not for a date someone knows by heart and types faster (a birth date: a TextField or three NumberFields), or for times.
 * @tier fundamental
 * @family pickers
 * @a11y A `table role="grid"` per view (WAI-ARIA APG date picker): one cell in the tab order (roving), each named by
 * its full date, `aria-selected` on the choice, `aria-current="date"` on today, `aria-disabled` outside min and max or
 * when unavailable. The title is a button that zooms out and announces the new period politely. Week numbers are row
 * headers. The zoom is a Morph: the levels scale and cross-fade (only fade with reduced motion); a page turned by keys swaps at once.
 * @key Arrows: a day (or a month, year, decade); Up and Down a week (or a row)
 * @key Home / End: the start / end of the week (or row)
 * @key Page Up / Page Down: the previous / next month (or year, decade, century); with Shift, a year
 * @key Enter or Space: chooses the day, or zooms into the month, year or decade
 */
export function Calendar({ label, mode = 'single', value, onChange, range, onRangeChange, min, max, isUnavailable, weekNumbers = false, months = 1, locale, firstDay, initialMonth, ...data }: CalendarProps) {
  const id = useId();
  const first = firstDay ?? firstDayOf(locale);
  const now = todayOf();
  const chosen = fromIso(value);
  const [start, end] = [fromIso(range?.[0]), fromIso(range?.[1])];
  const opening = fromIso(initialMonth && initialMonth.length === 7 ? `${initialMonth}-01` : initialMonth) ?? (mode === 'range' ? start : chosen) ?? now;
  const [view, setView] = useState<CalendarView>('days');
  const [cursor, setCursor] = useState<Day>(opening);
  const [anchor, setAnchor] = useState<Day>({ ...opening, d: 1 });
  const [zoom, setZoom] = useState<'in' | 'out' | 'page' | null>(null);
  const [hover, setHover] = useState<Day | null>(null);
  const grids = useRef<HTMLDivElement>(null);
  const keyed = useRef(false);
  const lo = fromIso(min);
  const hi = fromIso(max);

  // After a key moves the cursor, focus follows it.
  useEffect(() => {
    if (!keyed.current) return;
    keyed.current = false;
    grids.current?.querySelector<HTMLElement>('[data-cursor]')?.focus();
  });

  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, o);
  const out = (d: Day) => (lo && compare(d, lo) < 0) || (hi && compare(d, hi) > 0);
  const blocked = (d: Day) => !!out(d) || !!isUnavailable?.(toIso(d));

  /** Moves the cursor, paging the shown months when it leaves them. */
  const move = (to: Day) => {
    setCursor(to);
    const last = addMonths(anchor, months - 1);
    if (compare({ ...to, d: 1 }, anchor) < 0) setAnchor({ ...to, d: 1 });
    else if (compare({ ...to, d: 1 }, { ...last, d: 1 }) > 0) setAnchor(addMonths({ ...to, d: 1 }, -(months - 1)));
  };

  const pick = (d: Day) => {
    if (blocked(d)) return;
    // A day picked in a neighbouring month's spill-over turns the page.
    setZoom('page');
    move(d);
    const iso = toIso(d);
    if (mode === 'single') onChange?.(iso);
    else if (!start || end || compare(d, start) < 0) onRangeChange?.([iso, null]);
    else onRangeChange?.([toIso(start), iso]);
  };

  const zoomOut = () => {
    if (view === 'decades') return;
    setZoom('out');
    setView(stepView[view]);
  };
  const zoomIn = (to: Day) => {
    setZoom('in');
    setView(view === 'months' ? 'days' : view === 'years' ? 'months' : 'years');
    move(to);
    setAnchor({ ...to, d: 1 });
  };

  /** One period back or on: a month, a year, a decade or a century. */
  const page = (dir: 1 | -1) => {
    setZoom('page');
    const n = view === 'days' ? dir : view === 'months' ? 12 * dir : view === 'years' ? 120 * dir : 1200 * dir;
    setAnchor(addMonths(anchor, n));
    setCursor(addMonths(cursor, n));
  };

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const across = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
    const row = view === 'days' ? 7 : 4;
    let to: Day | null = null;
    if (view === 'days') {
      if (across) to = addDays(cursor, across);
      else if (e.key === 'ArrowDown') to = addDays(cursor, 7);
      else if (e.key === 'ArrowUp') to = addDays(cursor, -7);
      else if (e.key === 'Home') to = addDays(cursor, -((weekday(cursor) - first + 7) % 7));
      else if (e.key === 'End') to = addDays(cursor, 6 - ((weekday(cursor) - first + 7) % 7));
      else if (e.key === 'PageUp') to = addMonths(cursor, e.shiftKey ? -12 : -1);
      else if (e.key === 'PageDown') to = addMonths(cursor, e.shiftKey ? 12 : 1);
    } else {
      const unit = view === 'months' ? 1 : view === 'years' ? 12 : 120;
      const big = view === 'months' ? 12 : view === 'years' ? 120 : 1200;
      const index = view === 'months' ? cursor.m : view === 'years' ? cursor.y % 4 : Math.floor(cursor.y / 10) % 4;
      if (across) to = addMonths(cursor, across * unit);
      else if (e.key === 'ArrowDown') to = addMonths(cursor, row * unit);
      else if (e.key === 'ArrowUp') to = addMonths(cursor, -row * unit);
      else if (e.key === 'Home') to = addMonths(cursor, -(index % row) * unit);
      else if (e.key === 'End') to = addMonths(cursor, (row - 1 - (index % row)) * unit);
      else if (e.key === 'PageUp') to = addMonths(cursor, -big);
      else if (e.key === 'PageDown') to = addMonths(cursor, big);
    }
    if (to) {
      e.preventDefault();
      keyed.current = true;
      setZoom(null);
      if (view === 'days') move(to);
      else {
        setCursor(to);
        const span = view === 'months' ? to.y !== anchor.y : view === 'years' ? decadeOf(to.y) !== decadeOf(anchor.y) : centuryOf(to.y) !== centuryOf(anchor.y);
        if (span) setAnchor({ ...to, d: 1 });
      }
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      keyed.current = true;
      if (view === 'days') pick(cursor);
      else zoomIn(cursor);
    }
  };

  const title =
    view === 'days'
      ? Array.from({ length: months }, (_, i) => fmt({ month: 'long', year: 'numeric' }).format(new Date(addMonths(anchor, i).y, addMonths(anchor, i).m, 1))).join(' – ')
      : view === 'months'
        ? String(anchor.y)
        : view === 'years'
          ? `${decadeOf(anchor.y)}–${decadeOf(anchor.y) + 9}`
          : `${centuryOf(anchor.y)}–${centuryOf(anchor.y) + 99}`;
  const period = view === 'days' ? 'month' : view === 'months' ? 'year' : view === 'years' ? 'decade' : 'century';
  // 4 January 2026 is a Sunday: day n of the week is that date plus n.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 0, 4 + ((first + i) % 7)));

  const dayCell = (d: Day, inMonth: boolean, twoUp: boolean) => {
    if (!inMonth && twoUp) return <td key={toIso(d)} role="gridcell" data-dl-part="blank" />;
    const iso = toIso(d);
    const isStart = mode === 'range' && same(d, start);
    const lastDay = mode === 'range' ? end ?? (start && hover && compare(hover, start) > 0 ? hover : null) : null;
    const isEnd = mode === 'range' && same(d, lastDay);
    const between = mode === 'range' && !!start && !!lastDay && compare(d, start) > 0 && compare(d, lastDay) < 0;
    const selected = mode === 'single' ? same(d, chosen) : isStart || (isEnd && !!end);
    const off = blocked(d);
    return (
      <td
        key={iso}
        role="gridcell"
        tabIndex={same(d, cursor) ? 0 : -1}
        data-cursor={same(d, cursor) ? '' : undefined}
        data-outside={inMonth ? undefined : ''}
        data-today={same(d, now) ? '' : undefined}
        data-range={isStart && isEnd ? 'one' : isStart && lastDay ? 'start' : isEnd ? 'end' : between ? 'between' : undefined}
        data-preview={mode === 'range' && !end && (between || isEnd) ? '' : undefined}
        data-unavailable={off && !out(d) ? '' : undefined}
        aria-selected={selected}
        aria-current={same(d, now) ? 'date' : undefined}
        aria-disabled={off || undefined}
        aria-label={fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d.y, d.m, d.d))}
        onClick={() => pick(d)}
        onFocus={() => setCursor(d)}
        onPointerEnter={() => mode === 'range' && setHover(d)}
      >
        <span data-dl-part="day">{d.d}</span>
      </td>
    );
  };

  const daysGrid = (i: number) => {
    const mo = addMonths(anchor, i);
    return (
      <table key={`${mo.y}-${mo.m}`} role="grid" data-dl-part="grid" aria-label={fmt({ month: 'long', year: 'numeric' }).format(new Date(mo.y, mo.m, 1))} onKeyDown={onKey} onPointerLeave={() => setHover(null)}>
        <thead>
          <tr>
            {weekNumbers && (
              <th scope="col" data-dl-part="week" aria-label="Week">
                #
              </th>
            )}
            {weekdays.map((w) => (
              <th key={w.getDay()} scope="col" abbr={fmt({ weekday: 'long' }).format(w)}>
                {fmt({ weekday: 'narrow' }).format(w)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(mo.y, mo.m, first).map((week) => (
            <tr key={toIso(week[0])}>
              {weekNumbers && (
                <th scope="row" data-dl-part="week" aria-label={`Week ${isoWeek(week[3])}`}>
                  {isoWeek(week[3])}
                </th>
              )}
              {week.map((d) => dayCell(d, d.m === mo.m, months === 2))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  /** Months, years or decades: a 4 × 3 grid of larger cells; years and decades show one before and after, faded. */
  const zoomGrid = () => {
    const cells: { day: Day; name: string; long: string; outside: boolean; current: boolean; picked: boolean; off: boolean }[] = [];
    const pickedDay = mode === 'single' ? chosen : start;
    for (let i = 0; i < 12; i++) {
      if (view === 'months') {
        const d = { y: anchor.y, m: i, d: 1 };
        cells.push({ day: { ...d, d: Math.min(cursor.d, 28) }, name: fmt({ month: 'short' }).format(new Date(d.y, i, 1)), long: fmt({ month: 'long', year: 'numeric' }).format(new Date(d.y, i, 1)), outside: false, current: now.y === d.y && now.m === i, picked: !!pickedDay && pickedDay.y === d.y && pickedDay.m === i, off: (!!hi && compare(d, hi) > 0) || (!!lo && compare({ ...d, d: daysIn(d.y, i) }, lo) < 0) });
      } else {
        const step = view === 'years' ? 1 : 10;
        const base = view === 'years' ? decadeOf(anchor.y) : centuryOf(anchor.y);
        const y = base + (i - 1) * step;
        const name = view === 'years' ? String(y) : `${y}–${y + 9}`;
        cells.push({ day: { y, m: cursor.m, d: Math.min(cursor.d, 28) }, name, long: view === 'years' ? String(y) : `${y} to ${y + 9}`, outside: i === 0 || i === 11, current: view === 'years' ? now.y === y : decadeOf(now.y) === y, picked: !!pickedDay && (view === 'years' ? pickedDay.y === y : decadeOf(pickedDay.y) === y), off: (!!hi && y > hi.y) || (!!lo && y + step - 1 < lo.y) });
      }
    }
    const isCursor = (c: (typeof cells)[number]) => (view === 'months' ? c.day.m === cursor.m : view === 'years' ? c.day.y === cursor.y : c.day.y === decadeOf(cursor.y));
    return (
      <table role="grid" data-dl-part="grid" data-view={view} aria-label={title} onKeyDown={onKey}>
        <tbody>
          {[0, 1, 2].map((r) => (
            <tr key={r}>
              {cells.slice(r * 4, r * 4 + 4).map((c) => (
                <td
                  key={c.name}
                  role="gridcell"
                  tabIndex={isCursor(c) ? 0 : -1}
                  data-cursor={isCursor(c) ? '' : undefined}
                  data-outside={c.outside ? '' : undefined}
                  data-today={c.current ? '' : undefined}
                  aria-selected={c.picked}
                  aria-current={c.current ? 'date' : undefined}
                  aria-disabled={c.off || undefined}
                  aria-label={c.long}
                  onClick={() => !c.off && zoomIn(c.day)}
                  onFocus={() => setCursor(c.day)}
                >
                  <span data-dl-part="day">{c.name}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div {...data} data-dl="calendar" data-view={view} data-months={months} data-mode={mode} role="group" aria-label={label}>
      <div data-dl-part="head">
        <Button emphasis="quiet" size="s" label={title} disabled={view === 'decades'} onClick={zoomOut} data-dl-part="title" />
        <span id={`${id}-said`} data-dl-part="announce" aria-live="polite">
          {title}
        </span>
        <span data-dl-part="paging">
          <Button emphasis="quiet" size="s" icon="chevron-start" iconOnly label={`Previous ${period}`} onClick={() => page(-1)} />
          <Button emphasis="quiet" size="s" icon="chevron-end" iconOnly label={`Next ${period}`} onClick={() => page(1)} />
        </span>
      </div>
      <Morph state={`${view}-${title}`} size="hold" motion={zoom === 'out' ? 'zoom-out' : zoom === 'in' ? 'zoom-in' : zoom === 'page' ? 'fade' : 'none'}>
        <div
          ref={(el) => {
            // The leaving level keeps its markup for its fade; focus and keys follow the arriving one only.
            if (el && !el.closest('[inert]')) grids.current = el;
          }}
          data-dl-part="views"
        >
          {view === 'days' ? Array.from({ length: months }, (_, i) => daysGrid(i)) : zoomGrid()}
        </div>
      </Morph>
      <div data-dl-part="foot">
        <Button
          emphasis="quiet"
          size="s"
          label="Today"
          onClick={() => {
            setZoom(view === 'days' ? 'page' : 'in');
            setView('days');
            setCursor(now);
            setAnchor(addMonths({ ...now, d: 1 }, 0));
            keyed.current = true;
          }}
        />
      </div>
    </div>
  );
}
