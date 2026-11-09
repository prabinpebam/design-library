import { Fragment, type CSSProperties, type ReactNode } from 'react';
import type { DataAttributes } from '../types';

/**
 * A column's width: `name` and `value` grow to their own limit, `facts` to the limit beside a large specimen,
 * `specimen` is exactly one specimen tile wide, and a number is a proportional share of what's left.
 */
export type RowListColumn = 'name' | 'value' | 'facts' | 'specimen' | number;

/** One cell: content, or several facts stacked in the cell, in order. */
export type RowListCell = ReactNode | ReactNode[];

/** One row of the list. */
export interface RowListRow {
  /** Stable key for the row. */
  id: string;
  /** One cell per column, in order. */
  cells: RowListCell[];
  /** `data-*` attributes for the row, for tooling such as revision anchors. */
  data?: DataAttributes;
}

export interface RowListProps extends DataAttributes {
  /** Each column's width; the row's cells fill them in order. */
  columns: RowListColumn[];
  /** The rows, top to bottom. */
  rows: RowListRow[];
  /** Number the rows (`ol`) when their order means something, such as a scale from small to large. */
  ordered?: boolean;
  /** `large` gives rows with a large live specimen (text at its real size) more room between rows and columns. */
  specimen?: 'small' | 'large';
  /** How the cells line up in a row: on the first line of text, centred on the specimen, or filling the row's height from the top. */
  align?: 'baseline' | 'center' | 'stretch';
}

const track = (c: RowListColumn) =>
  typeof c === 'number' ? `minmax(0, ${c}fr)` : c === 'specimen' ? 'var(--c-row-list-specimen)' : `minmax(0, var(--c-row-list-${c}))`;

/**
 * Rows of named facts, one hairline above each and no enclosure, in proportional columns that stack below
  * the small breakpoint: a reference list read from top to bottom (token rows, scales, specimens beside their values).
 * Not for comparing values across columns with a header row (use DataTable) or across contexts (use ContextMatrix).
 * @tier compound
 * @family data
 * @a11y A native `ul`, or `ol` when the order means something; each row is one list item, so the count and position
 * are announced. Name what a row shows in its own cells: a decorative specimen is `aria-hidden`.
 */
export function RowList({ columns, rows, ordered = false, specimen = 'small', align = 'baseline', ...data }: RowListProps) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List {...data} data-dl="row-list" data-specimen={specimen} data-align={align} style={{ '--row-list-columns': columns.map(track).join(' ') } as CSSProperties}>
      {rows.map((row) => (
        <li key={row.id} {...row.data}>
          {row.cells.map((cell, i) =>
            Array.isArray(cell) ? (
              <div key={i} data-dl-part="facts">
                {cell.map((fact, j) => (
                  <Fragment key={j}>{fact}</Fragment>
                ))}
              </div>
            ) : (
              <Fragment key={i}>{cell}</Fragment>
            ),
          )}
        </li>
      ))}
    </List>
  );
}
