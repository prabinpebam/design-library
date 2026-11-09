import { useId, type CSSProperties } from 'react';
import type { DataAttributes } from '../types';

export interface ProgressProps extends DataAttributes {
  /** Accessible name when the indicator stands alone, e.g. "Importing pictures". Omit inside a control that already says it's busy. */
  label?: string;
  /** `inline`: the compact turning arc, inside a busy Button, Switch or field, or beside a short line of text. `bar`: a thin line under the work it measures, for operations and app-level work. */
  form?: 'inline' | 'bar';
  /** Bar only: the share done, 0–100, from a real total (bytes, items, steps). Leave out when the total isn't known; never invent one. */
  value?: number;
  /** Bar only: shows the label above the bar at its start, and the value at its end (the percentage when it's known). */
  showLabel?: boolean;
  /** Bar only: the count in words, e.g. "18 of 40 files"; shown before the percentage and said instead of it. */
  valueText?: string;
  /** Shows nothing for the first 300 ms (`duration.indicator-delay`), so work that ends sooner never flashes an indicator. Once shown, keep it at least 500 ms. */
  delay?: boolean;
}

/**
 * The one operation indicator, in two forms: a compact turning arc, and a bar that fills to a known share or carries a
 * travelling segment when the total isn't known. No separate Spinner. Not for content loading: views and sections of
 * known shape load as a Skeleton.
 * @tier fundamental
 * @family feedback
 * @a11y Hidden inside a control that sets `aria-busy`; with `label` it is a `progressbar` with that name, and with a
 * `value` its `aria-valuenow`. The words beside it (the step, the count) carry the state as well as the motion.
 * With `showLabel` the visible label names it (`aria-labelledby`) and `valueText` is said as its `aria-valuetext`.
 * Reduced motion stops the arc and holds the bar's segment still; `delay` keeps its timing.
 */
export function Progress({ label, form = 'inline', value, showLabel = false, valueText, delay = false, ...data }: ProgressProps) {
  const labelId = useId();
  const known = form === 'bar' && typeof value === 'number';
  const share = known ? Math.min(100, Math.max(0, value as number)) : 100;
  const shown = form === 'bar' && showLabel && !!label;
  const named = label
    ? {
        role: 'progressbar',
        ...(shown ? { 'aria-labelledby': labelId } : { 'aria-label': label }),
        ...(known ? { 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(share) } : {}),
        ...(valueText ? { 'aria-valuetext': known ? `${valueText}, ${Math.round(share)}%` : valueText } : {}),
      }
    : { 'aria-hidden': true };
  const delayed = delay ? '' : undefined;
  if (form === 'bar') {
    const line = (
      <svg viewBox="0 0 100 2" preserveAspectRatio="none" focusable="false" aria-hidden="true">
        <line data-dl-part="track" x1="0" y1="1" x2="100" y2="1" />
        <line data-dl-part="fill" x1="0" y1="1" x2={known ? 100 : share} y2="1" pathLength={known ? undefined : 100} style={known ? ({ '--progress-share': share / 100 } as CSSProperties) : undefined} />
      </svg>
    );
    if (shown) {
      const amount = [valueText, known ? `${Math.round(share)}%` : undefined].filter(Boolean).join(' · ');
      return (
        <span {...data} {...named} data-dl="progress" data-form="bar" data-labelled="" data-known={known ? '' : undefined} data-delayed={delayed}>
          <span data-dl-part="head" aria-hidden="true">
            <span data-dl-part="label" id={labelId}>
              {label}
            </span>
            {amount && <span data-dl-part="amount">{amount}</span>}
          </span>
          <span data-dl-part="rail">{line}</span>
        </span>
      );
    }
    return (
      <span {...data} {...named} data-dl="progress" data-form="bar" data-known={known ? '' : undefined} data-delayed={delayed}>
        {line}
      </span>
    );
  }
  return (
    <svg {...data} {...named} data-dl="progress" data-form="inline" viewBox="0 0 24 24" focusable="false" data-delayed={delayed}>
      <circle cx="12" cy="12" r="9" pathLength="100" strokeDasharray="70 30" />
    </svg>
  );
}
