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
  /**
   * Each part's name and share as words under the bar, beside its colour, so colour is never the only cue. On by
   * default; turn it off only when the same numbers are written right beside the bar.
   */
  legend?: boolean;
}

/**
 * Parts of a whole by status, in one bar: inner segments are square so small parts stay legible, a hairline of the
 * surface between them; only the outer ends of the whole bar are rounded. A legend under the bar names every part with
 * its share. Status colours only: categorical series arrive with the first chart, from the spectrum.
 * Not for progress over time (use Progress) or for comparing values that aren't parts of one whole.
 * @tier compound
 * @family data
 * @a11y The bar is `role="img"`, named by the label and every part with its share in order; the legend repeats it as
 * words for sighted readers and is hidden from assistive technology, so it isn't read twice.
 */
export function StackedBar({ label, segments, legend = true, ...data }: StackedBarProps) {
  const name = `${label}: ${segments.map((s) => `${s.share}% ${s.label.toLowerCase()}`).join(', ')}`;
  return (
    <span {...data} data-dl="stacked-bar">
      <span data-dl-part="bar" role="img" aria-label={name}>
        {segments.map((s) => (
          <span key={s.id} data-status={s.status} style={{ '--share': `${s.share}%` } as CSSProperties} />
        ))}
      </span>
      {legend && (
        <span data-dl-part="legend" aria-hidden="true">
          {segments.map((s) => (
            <span key={s.id} data-dl-part="entry">
              <span data-dl-part="key" data-status={s.status} />
              {s.label} {s.share} %
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
