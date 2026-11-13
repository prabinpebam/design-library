import { useRef, useState, type ReactNode } from 'react';
import { MenuButton } from '../fundamentals/MenuButton';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { Skeleton } from '../fundamentals/Skeleton';
import { dropIndex, moveItem, movesFor } from '../behaviour/reorder';
import { useFlipList } from '../behaviour/flip';
import type { DataAttributes } from '../types';

/** One column of a data table. */
export interface DataTableColumn {
  /** Key of this column's value in each row's `cells`. */
  key: string;
  /** Column heading: a short noun, sentence case. */
  header: string;
  /** The parts of each cell stack, one under another, with a small gap (a name and its "Required" note). */
  stacked?: boolean;
  /**
   * How much of the row's width the column takes. `grow`: whatever the other columns leave (a title). `fit`: as narrow
   * as its content, kept on one line (a date, a status, a row's actions). Unset, the table shares the width by content.
   */
  width?: 'grow' | 'fit';
}

/** One row of a data table. */
export interface DataTableRow {
  /** Stable key for the row. */
  id: string;
  /** The row's value in each column, by column key. The first column's value heads the row. */
  cells: Record<string, ReactNode>;
  /** Names the row in words, for its Move handle and the announcement of a move (with `reorderable`); default its id. */
  label?: string;
  /** `data-*` attributes for the row, for tooling such as revision anchors. */
  data?: DataAttributes;
}

export interface DataTableProps extends DataAttributes {
  /** Names the table and its scroll region, e.g. "Button props". */
  label: string;
  /** The columns, the first heading each row. None (a screen still finding out what it shows): nothing is drawn. */
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /**
   * Each row gets a Move handle before its heading cell, as a reorderable List's items do: drag it, or open its menu
   * (Move up, down, to top, to bottom). Rows need a `label`.
   */
  reorderable?: boolean;
  /** The row ids in their new order, after a drag step or a Move. */
  onReorder?: (ids: string[]) => void;
  /**
   * `enclosed` (default): one outline round the table and a header row set apart by fill, for facts set inside running
   * content. `plain`: no outline, corner or header fill; a hairline under every row and a muted small header, for a
   * screen that is the table (an app's list of pages or records).
   */
  variant?: 'enclosed' | 'plain';
  /** `strong`: each row's heading (the first column) at `c.data-table.row-head-strong-weight`, for a list whose rows are named by it. Default `normal`. */
  rowHeader?: 'normal' | 'strong';
  /**
   * LR65 (opt-in): the table is loading. Its columns and header are drawn as they will be, with this many rows of
   * shimmer lines (core Skeleton) in place of `rows`, so nothing moves when the rows arrive. The table is `aria-busy`;
   * the region around it still says once what is loading.
   */
  loading?: number;
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
 * cell may break at any character, so a long type never forces the page sideways. A row's Move handle is a menu button
 * named "Move" and the row's label; a move is announced ("Moved … to position 2 of 5.") and focus stays on the moved
 * row's handle.
 * @key Tab: moves to the table's scroll region, then to each row's Move handle (with `reorderable`)
 * @key Arrow Left / Arrow Right: scroll the table sideways while its region has focus
 * @key Enter, Space: open a row's Move menu (Move up, Move down, Move to top, Move to bottom)
 */
export function DataTable({ label, columns, rows: given, reorderable: canReorder = false, onReorder, variant = 'enclosed', rowHeader = 'normal', loading, ...data }: DataTableProps) {
  const [head, ...rest] = columns;
  const busy = loading !== undefined;
  const reorderable = canReorder && !busy;
  const rows: DataTableRow[] = busy
    ? Array.from({ length: Math.max(1, loading) }, (_, i) => ({ id: `loading-${i}`, cells: Object.fromEntries(columns.map((c) => [c.key, <Skeleton key={c.key} />])) }))
    : given;
  const ids = rows.map((r) => r.id);
  const trs = useRef<(HTMLTableRowElement | null)[]>([]);
  const drag = useRef<{ y: number; moved: boolean; id: string } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [said, setSaid] = useState('');
  // Q65 C11, as List: a Move from the menu slides the rows into their new order; a drag reorders under the pointer at once.
  const body = useFlipList<HTMLTableSectionElement>(ids.join('|'), { paused: dragId !== null || !reorderable });
  const name = (id: string) => rows.find((r) => r.id === id)?.label ?? id;
  const move = (from: number, to: number) => {
    if (from === to) return;
    onReorder?.(moveItem(ids, from, to));
    setSaid(`Moved ${name(ids[from])} to position ${to + 1} of ${ids.length}.`);
  };
  const onDown = (i: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.button !== 0) return;
    drag.current = { y: e.clientY, moved: false, id: ids[i] };
    e.currentTarget.setPointerCapture(e.pointerId);
    // A move re-orders the rows under the pointer, which can drop the capture: the drag ends wherever the pointer is let go.
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onUp, { once: true });
  };
  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientY - d.y) < 4) return;
    if (!d.moved) setDragId(d.id);
    d.moved = true;
    const from = ids.indexOf(d.id);
    const at = dropIndex(trs.current.slice(0, ids.length).map((r) => r!.getBoundingClientRect()), e.clientY);
    const to = at > from ? at - 1 : at;
    if (to !== from) move(from, to);
  };
  const onUp = () => {
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    setDragId(null);
    setTimeout(() => (drag.current = null));
  };
  const handle = (r: DataTableRow, i: number) => (
    <span
      data-dl-part="handle"
      onPointerDown={onDown(i)}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClickCapture={(e) => {
        if (drag.current?.moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <MenuButton
        label={`Move ${r.label ?? r.id}`}
        icon="menu"
        iconOnly
        emphasis="quiet"
        size="s"
        items={movesFor(i, rows.length)}
        onSelect={(v) => move(i, movesFor(i, rows.length).find((m) => m.value === v)!.to)}
      />
    </span>
  );
  if (!head) return null;
  return (
    <div {...data} data-dl="data-table" aria-busy={busy || undefined} data-variant={variant === 'plain' ? 'plain' : undefined} data-reorder={reorderable ? '' : undefined} data-row-header={rowHeader === 'strong' ? 'strong' : undefined}>
      <ScrollArea axis="inline" label={label}>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" data-width={c.width}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={reorderable ? body : undefined}>
          {rows.map((r, i) => (
            <tr
              key={r.id}
              {...r.data}
              data-flip-key={reorderable ? r.id : undefined}
              data-dragging={reorderable && dragId === r.id ? '' : undefined}
              ref={reorderable ? (el) => void (trs.current[i] = el) : undefined}
            >
              <th scope="row" data-stacked={head.stacked ? '' : undefined} data-width={head.width}>
                {reorderable ? (
                  <span data-dl-part="row">
                    {handle(r, i)}
                    <span data-dl-part="content">{r.cells[head.key]}</span>
                  </span>
                ) : (
                  r.cells[head.key]
                )}
              </th>
              {rest.map((c) => (
                <td key={c.key} data-stacked={c.stacked ? '' : undefined} data-width={c.width}>
                  {r.cells[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </ScrollArea>
      {reorderable && (
        <span data-dl-part="reorder-announce" role="status">
          {said}
        </span>
      )}
    </div>
  );
}