import type { ReactNode } from 'react';
import { ScrollArea } from '../fundamentals/ScrollArea';
import type { DataAttributes } from '../types';

/** One context column: its name and the context its cells render in. */
export interface ContextMatrixColumn {
  id: string;
  label: string;
  scheme: 'light' | 'dark';
  contrast: 'standard' | 'more';
}

/** One row: what holds in every context, said once, then only what varies per context. */
export interface ContextMatrixRow {
  id: string;
  /** The row's invariant name and description, held at the start edge. */
  label: ReactNode;
  /** The row's value in each context, by column id. */
  cells: Record<string, ReactNode>;
  /** `data-*` attributes for the row, for tooling such as revision anchors. */
  data?: DataAttributes;
  /** `data-*` attributes per cell, by column id. */
  cellData?: Record<string, DataAttributes>;
}

export interface ContextMatrixProps extends DataAttributes {
  /** Names the matrix and its scroll region, e.g. "Colour roles by context". */
  label: string;
  /** Heading of the label column, e.g. "Role". */
  rowHeader: string;
  columns: ContextMatrixColumn[];
  rows: ContextMatrixRow[];
}

/**
 * Values compared across contexts (light, dark, more contrast): each row's name once at the start edge, each context
 * column rendered in its own context so a value sits on its true surface. Narrower than its columns, it scrolls
 * sideways inside its own region with the names held; the page never does. Code in a cell stays whole.
 * Not for a value that is the same in every context (say it once instead) or for facts with no context (use DataTable).
 * @tier compound
 * @family documentation
 * @a11y A native `table` with column and row headers inside a region named by `label`; the region is focusable only
 * so keyboard users can scroll it.
 * @key Tab: moves to the matrix's scroll region
 * @key Arrow Left / Arrow Right: scroll the contexts sideways while its region has focus
 */
export function ContextMatrix({ label, rowHeader, columns, rows, ...data }: ContextMatrixProps) {
  return (
    <div {...data} data-dl="context-matrix">
      <ScrollArea axis="inline" label={label}>
      <table>
        <thead>
          <tr>
            <th scope="col" data-dl-part="label">
              {rowHeader}
            </th>
            {columns.map((c) => (
              <th key={c.id} scope="col" data-scheme={c.scheme} data-contrast={c.contrast}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} {...r.data}>
              <th scope="row" data-dl-part="label">
                {r.label}
              </th>
              {columns.map((c) => (
                <td key={c.id} {...r.cellData?.[c.id]} data-scheme={c.scheme} data-contrast={c.contrast}>
                  {r.cells[c.id]}
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
