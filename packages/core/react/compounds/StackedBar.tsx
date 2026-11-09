import type { CSSProperties } from 'react';
import type { DataAttributes } from '../types';

/** One part of the whole. */
export interface StackedBarSegment {
  /** Stable key for the part. */
  id: string;
  /** What the part is, read out with its share, e.g. "Passed". */
  label: string;
  /** Its share of the whole, 0 to 100. Shares should add up to 100. */
  share: number;
  /** The status the part stands for; its colour is that status's fill. */
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export interface StackedBarProps extends DataAttributes {
  /** What the whole is, e.g. "Checks". Read before the parts. */
  label: string;
  segments: StackedBarSegment[];
}

/**
 * Parts of a whole by status, in one bar: inner segments are square so small parts stay legible; only the outer ends
 * of the whole bar are rounded. Status colours only: categorical series arrive with the first chart, from the spectrum.
 * Not for progress over time (use Progress) or for comparing values that aren't parts of one whole.
 * @tier compound
 * @family data
 * @a11y `role="img"`, named by the label and every part with its share in order, so the colours are never the only
 * carrier of meaning. Show the same numbers as text nearby when people need to read them.
 */
export function StackedBar({ label, segments, ...data }: StackedBarProps) {
  const name = `${label}: ${segments.map((s) => `${s.share}% ${s.label.toLowerCase()}`).join(', ')}`;
  return (
    <span {...data} data-dl="stacked-bar" role="img" aria-label={name}>
      {segments.map((s) => (
        <span key={s.id} data-status={s.status} style={{ '--share': `${s.share}%` } as CSSProperties} />
      ))}
    </span>
  );
}
