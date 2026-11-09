import { useEffect, useState } from 'react';
import type { DataAttributes } from '@design-library/core/react';

export interface CountdownProps extends DataAttributes {
  /** What the time counts to, before the figure: "Doors open in". */
  label: string;
  /** The moment, as an ISO date and time with its offset: "2027-03-11T09:00:00+00:00". */
  until: string;
  /** Said instead once the moment has passed: "The conference has started". */
  passed: string;
  /** Count from this moment instead of the clock (stories and screenshots stay the same). */
  now?: string;
}

const MINUTE = 60_000;

/** The time left in the reader's language: days and hours, or hours and minutes in the last day, or minutes. */
export function timeLeft(ms: number, locale?: string) {
  const unit = (value: number, u: 'day' | 'hour' | 'minute') => new Intl.NumberFormat(locale, { style: 'unit', unit: u, unitDisplay: 'long' }).format(value);
  const minutes = Math.ceil(ms / MINUTE);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const parts = days > 0 ? [unit(days, 'day'), ...(hours ? [unit(hours, 'hour')] : [])] : hours > 0 ? [unit(hours, 'hour'), ...(minutes % 60 ? [unit(minutes % 60, 'minute')] : [])] : [unit(minutes, 'minute')];
  return new Intl.ListFormat(locale, { style: 'long', type: 'unit' }).format(parts);
}

/**
 * How long until a moment a person is waiting for (the doors opening, a ticket sale closing): the words, then the time
 * left in days and hours, or hours and minutes on the last day, in the reader's language. Once the moment passes it
 * says `passed` instead. A Conference template part (Q64): it lives only in this template's scope.
 * Not for a timer a person starts and stops, or for a length of time that's already known (write it as text).
 * @tier fundamental
 * @family conference
 * @a11y The time left is a `<time>` whose `datetime` is the moment itself, so assistive technology can read the exact
 * date. It updates once a minute and is never announced, so it doesn't interrupt a screen reader.
 */
export function Countdown({ label, until, passed, now, ...data }: CountdownProps) {
  const [clock, setClock] = useState(() => (now ? Date.parse(now) : Date.now()));
  useEffect(() => {
    if (now) return;
    const timer = window.setInterval(() => setClock(Date.now()), MINUTE);
    return () => window.clearInterval(timer);
  }, [now]);
  const left = Date.parse(until) - clock;
  return (
    <p {...data} data-dl="conference-countdown">
      {left > 0 ? (
        <>
          <span data-dl-part="label">{label}</span>{' '}
          <time data-dl-part="value" dateTime={until}>
            {timeLeft(left)}
          </time>
        </>
      ) : (
        <span data-dl-part="value">{passed}</span>
      )}
    </p>
  );
}
