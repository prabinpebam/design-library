import type { ReactNode } from 'react';
import { ScrollArea } from '../fundamentals/ScrollArea';
import type { DataAttributes } from '../types';

/** One column of a data table. */
export interface DataTableColumn {
  /** Key of this column's value in each row's `cells`. */
  key: string;
  /** Column heading: a short noun, sentence case. */
  header: string;
  /** The parts of each cell stack, one under another, with a small gap (a name and its "Required" note). */
  stacked?: boolean;
}

/** One row of a data table. */
export interface DataTableRow {
  /** Stable key for the row. */
  id: string;
  /** The row's value in each column, by column key. The first column's value heads the row. */
  cells: Record<string, ReactNode>;
  /** `data-*` attributes for the row, for tooling such as revision anchors. */
  data?: DataAttributes;
}

export interface DataTableProps extends DataAttributes {
  /** Names the table and its scroll region, e.g. "Button props". */
  label: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
}

/**
 * Structured facts to compare in rows and columns, such as a component's props or its keys. The first column heads
 * each row. Wider than the page, it scrolls sideways in its own region; the page never does. One enclosure, one hairline
 * between rows, a header row set apart by tone.
 * Not for a list of named values read one by one (a token reference), for term and details pairs (use
 * DescriptionList) or for layout.
 * @tier compound
 * @family data
 * @a11y A native `table` with column headers (`th scope="col"`) and row headers (`th scope="row"`), inside a region named
 * by `label`. The region is focusable only so keyboard users can scroll it. Code in a
 * cell may break at any character, so a long type never forces the page sideways.
 * @key Tab: moves to the table's scroll region
 * @key Arrow Left / Arrow Right: scroll the table sideways while its region has focus
 */
export function DataTable({ label, columns, rows, ...data }: DataTableProps) {
  const [head, ...rest] = columns;
  return (
    <div {...data} data-dl="data-table">
      <ScrollArea axis="inline" label={label}>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} {...r.data}>
              <th scope="row" data-stacked={head.stacked ? '' : undefined}>
                {r.cells[head.key]}
              </th>
              {rest.map((c) => (
                <td key={c.key} data-stacked={c.stacked ? '' : undefined}>
                  {r.cells[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </ScrollArea>
    </div>
  );
}
