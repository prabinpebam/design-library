import { Icon } from '../fundamentals/Icon';
import { Skeleton } from '../fundamentals/Skeleton';
import type { DataAttributes } from '../types';

export interface StatisticProps extends DataAttributes {
  /** What the number counts, in a few words: "Active users", "Revenue". */
  label: string;
  /** The figure. A number is written in the reader's locale with `format`; a string is shown exactly as written ("2×", "4.6"). */
  value: number | string;
  /** Tooling attributes on the label's own element, such as a revision anchor. */
  labelData?: DataAttributes;
  /** Tooling attributes on the displayed value's own element (not its loading skeleton). */
  valueData?: DataAttributes;
  /** How a number is written: `Intl.NumberFormat` options such as `{ notation: 'compact' }` or `{ style: 'currency', currency: 'EUR' }`. */
  format?: Intl.NumberFormatOptions;
  /** A unit after the figure, set smaller: "ms", "km", "%". */
  unit?: string;
  /** The change since the last period, as written: "18%", "1,204". Shown with its direction in words and an icon, never colour alone. */
  change?: string;
  /** Which way the change went. */
  direction?: 'up' | 'down' | 'flat';
  /** Which direction is good news: `up` (default; sales), `down` (errors, load time) or `none` (neither: no colour). */
  good?: 'up' | 'down' | 'none';
  /** The period the change is measured over: "since last month". */
  period?: string;
  /** Recent values, oldest first, drawn as a small line under the figure. It only illustrates: the change says it in words. */
  trend?: number[];
  /** One sentence under the figure that explains it. */
  description?: string;
  /** `m` (default) for a row of figures; `l` for the one figure a view leads with. */
  size?: 'm' | 'l';
  /** Shows the statistic's shape in shimmer while its figure loads. */
  loading?: boolean;
}

const words = { up: 'Up', down: 'Down', flat: 'No change' } as const;
const icons = { up: 'trend-up', down: 'trend-down', flat: 'trend-flat' } as const;

/** Points for the trend line on a 100 × 32 box, with the line kept off the top and bottom edges. */
function trendPoints(values: number[]) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const step = values.length > 1 ? 100 / (values.length - 1) : 0;
  return values.map((v, i) => `${(i * step).toFixed(2)},${(30 - ((v - min) / span) * 28).toFixed(2)}`).join(' ');
}

/**
 * A number that matters, with what it counts, its unit, its change since the last period and an optional trend line:
 * the figures at the top of a dashboard or a report. Put several in a Grid, or one in a Card for a tile. Not for a
 * table of numbers (use DataTable) or a share of a whole (use StackedBar).
 * @tier compound
 * @family data
 * @a11y The label comes first in reading order, then the figure, so it reads "Active users, 12,480". The change says
 * its direction in words ("Up", "Down", "No change") through the icon's name, so colour is never the only cue; colour
 * shows whether that's good news only when `good` says which way is. The trend line is hidden from screen readers:
 * it illustrates the change, which is already said. A number is written in the reader's locale. A loading statistic
 * is `aria-busy` and keeps its label.
 */
export function Statistic({
  label,
  value,
  labelData,
  valueData,
  format,
  unit,
  change,
  direction = 'up',
  good = 'up',
  period,
  trend,
  description,
  size = 'm',
  loading = false,
  ...data
}: StatisticProps) {
  const figure = typeof value === 'number' ? new Intl.NumberFormat(undefined, format).format(value) : value;
  const tone = good === 'none' || direction === 'flat' ? 'neutral' : direction === good ? 'good' : 'bad';

  return (
    <div {...data} data-dl="statistic" data-size={size} aria-busy={loading || undefined}>
      <p {...labelData} data-dl-part="label">{label}</p>
      {loading ? (
        <div data-dl-part="value" aria-hidden="true">
          <Skeleton lines={1} size="lg" />
        </div>
      ) : (
        <>
          <p {...valueData} data-dl-part="value">
            <span data-dl-part="figure">{figure}</span>
            {unit && <span data-dl-part="unit">{unit}</span>}
          </p>
          {trend && trend.length > 1 && (
            <svg data-dl-part="trend" data-tone={tone} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <polyline points={trendPoints(trend)} vectorEffect="non-scaling-stroke" />
            </svg>
          )}
          {change && (
            <p data-dl-part="change">
              <span data-dl-part="delta" data-tone={tone}>
                {direction === 'flat' ? (
                  <>
                    <Icon name={icons.flat} size="sm" />
                    {words.flat}
                  </>
                ) : (
                  <>
                    <Icon name={icons[direction]} label={words[direction]} size="sm" />
                    {change}
                  </>
                )}
              </span>
              {period && <span data-dl-part="period">{period}</span>}
            </p>
          )}
          {description && <p data-dl-part="description">{description}</p>}
        </>
      )}
    </div>
  );
}
