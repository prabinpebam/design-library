import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import type { DataAttributes } from '../types';
import { PAGE_GRID_COLUMNS, PAGE_GRID_SPLIT_SHARES, pageGridRecordProblems, rowSpans, splitSpans } from '../../render/page-grid-model.mjs';
import type { PageGridEdge, PageGridFrame, PageGridRowGap, PageGridSplit, PageGridStack, PageGridGutter } from '../../render/page-grid-model.mjs';

export { PAGE_GRID_COLUMNS, PAGE_GRID_MIN_SPAN } from '../../render/page-grid-model.mjs';
export type { PageGridEdge, PageGridFrame, PageGridGap, PageGridRowGap, PageGridSplit, PageGridStack, PageGridGutter } from '../../render/page-grid-model.mjs';

export interface PageGridCell {
  /** Stable id: the key, and `data-cell` on the cell for an editor to find it. */
  id: string;
  /**
   * The page columns the cell spans (absolute at every depth, at least 3 of 12 where a row has more than one cell);
   * a row's spans add up to its span. A row of one cell may leave it out (the whole span).
   */
  span?: number;
  /** Rows inside the cell, each dividing the cell's span again. Without rows the cell is a slot: `renderSlot` fills it. */
  rows?: PageGridRow[];
}

export interface PageGridRow {
  /** Stable id: the key, and `data-row` on the row. */
  id: string;
  /** @deprecated Give the cells `span`s. A preset division of the row's span, still read. */
  split?: PageGridSplit;
  /** The space above the row; the first row of a group has none (default `section`; `none` is exactly 0, LR127). */
  gap?: PageGridRowGap;
  /**
   * The row's look (LR129, LR132): `band` adds the frame's space above and below; `tint` also its surface; `lead` is a
   * page opening: its first nested row two columns (`--c-page-grid-lead-start`, then the rest) pulled up and running
   * past the end, the rows under it lifted under both; it stacks in a narrow row or a short window. None by default.
   */
  frame?: PageGridFrame;
  /**
   * Where the row's cells stack (LR134): left out, when its narrowest cell would be under size.column-min; `window`, only
   * in a narrow window (width < 43.75em) or a short one (height < 30em), whatever the cells' widths.
   */
  stack?: PageGridStack;
  /**
   * How the row's cells divide it (LR135): left out, on the page's twelve columns, the fixed gutter apart; `split`, their
   * spans as shares of the row (5 and 7 are 5fr 7fr), `--c-page-grid-split-gutter` apart, so a template's two-column band
   * keeps its own proportions. Its cells then no longer line up with the page's columns.
   */
  gutter?: PageGridGutter;
  /** The row's cells in reading order. */
  cells: PageGridCell[];
}

/** @deprecated The older preset splits (cells now carry spans). */
export const PAGE_GRID_SPLITS = Object.keys(PAGE_GRID_SPLIT_SHARES) as PageGridSplit[];

/** @deprecated The columns each cell of a preset `split` takes from a span, or `null` when it doesn't divide it. */
export function pageGridSpans(split: PageGridSplit, span: number = PAGE_GRID_COLUMNS): number[] | null {
  return splitSpans(split, span);
}

/** @deprecated The preset splits a span allows. */
export function pageGridSplits(span: number = PAGE_GRID_COLUMNS): PageGridSplit[] {
  return PAGE_GRID_SPLITS.filter((split) => splitSpans(split, span) !== null);
}

/**
 * What's wrong with a tree: spans that aren't whole columns adding up to their parent's span, a cell under the
 * narrowest span (3 of 12), or a deprecated split its span doesn't allow. Empty when valid.
 */
export function pageGridProblems(rows: PageGridRow[]): string[] {
  return pageGridRecordProblems({ rows }, 0)
    .filter((issue) => !issue.at.endsWith('/section'))
    .map((issue) => `${issue.at}: ${issue.what}`);
}

export interface PageGridProps extends DataAttributes {
  /** The page's rows, top to bottom. Each row splits into cells; a cell holds rows or is a slot. */
  rows: PageGridRow[];
  /** Fills a slot (a cell without rows) with one block or one fundamental; return nothing to leave it empty. */
  renderSlot: (cell: PageGridCell) => ReactNode;
  /** The id of the row or cell an editor has selected: it carries the selection outline (`data-selected`). */
  selected?: string;
  /**
   * Makes rows and cells selectable by pointer, for an editor: a click picks the innermost cell under it, or its row
   * where no cell is (between cells). Keyboard selection belongs to the editor's outline (a TreeView of the same ids).
   */
  onSelect?: (target: PageGridTarget) => void;
  /**
   * The space above the first row (LR91): a stack step, as a row's `gap`; none by default, where a framed first row
   * also drops its inset. `frame` (LR139): none from the grid, but a framed first row keeps its own inset.
   */
  start?: PageGridEdge;
  /** The space below the last row (LR91); none by default. `frame` (LR139): none, but a framed last row keeps its inset. */
  end?: PageGridEdge;
  /**
   * @deprecated No effect since LR131: an edge step always measures as the same step between rows, also when the grid
   * sits in a gap-free group with its neighbouring regions (LR127); none is exactly 0.
   */
  layoutEdges?: boolean;
}

/** A selectable place in the grid. */
export interface PageGridTarget {
  kind: 'row' | 'cell';
  id: string;
}

/** Whether each side of a list of rows meets a None boundary: start and end are the list's own edges (LR129). A grid
 * edge `frame` isn't None for its rows (LR139): a framed edge row keeps its inset. */
type Edges = { start: boolean; end: boolean; framed: boolean };

function Rows({ rows, span, renderSlot, selected, edges = { start: false, end: false, framed: false } }: { rows: PageGridRow[]; span: number; renderSlot: PageGridProps['renderSlot']; selected?: string; edges?: Edges }) {
  return rows.map((row, index) => {
    // A frame's padding is 0 on a side whose boundary is None: the row's own gap above, the next row's below (LR127, LR129).
    const flushStart = index === 0 ? edges.start : row.gap === 'none';
    const flushEnd = index === rows.length - 1 ? edges.end : rows[index + 1].gap === 'none';
    // Inside a framed row, rows that leave their gap unset sit the frame's own step apart (LR129).
    const gap = row.gap ?? (edges.framed ? 'frame' : 'section');
    // Spans that don't add up to the row's span (or a deprecated split its span doesn't allow) stack the cells whole
    // rather than guessing.
    const spans = rowSpans(row, span);
    // How many of the narrowest cell fit across the row: the row stacks below that many column minimums.
    const narrowest = spans && !row.stack ? Math.min(4, Math.max(1, Math.ceil(span / Math.min(...spans)))) : 1;
    // One cell is one column: its span's gutters alone would be wider than a phone's column (LR130).
    const columns = spans && row.cells.length > 1 ? span : 1;
    // A split row's cells take their spans as shares of the row (LR135).
    const shares = row.gutter && spans && columns > 1 ? ({ '--dl-page-grid-shares': spans.map((s) => `minmax(0, ${s}fr)`).join(' ') } as CSSProperties) : undefined;
    let start = 0;
    return (
      <div key={row.id} data-dl-part="page-row" data-row={row.id} data-gap={gap} data-frame={row.frame} data-stack={row.stack} data-gutter={shares ? row.gutter : undefined} data-flush-start={row.frame && flushStart ? '' : undefined} data-flush-end={row.frame && flushEnd ? '' : undefined} data-selected={selected === row.id ? '' : undefined}>
        <div data-dl-part="page-columns" data-columns={columns} data-narrowest={narrowest > 1 ? narrowest : undefined} style={shares}>
          {row.cells.map((cell, c) => {
            const own = spans ? spans[c] : span;
            const at = start;
            start += own;
            const slot = cell.rows ? undefined : renderSlot(cell);
            const empty = !cell.rows && (slot === null || slot === undefined || slot === false);
            return (
              <div
                key={cell.id}
                data-dl-part="page-cell"
                data-cell={cell.id}
                data-span={columns > 1 ? own : 1}
                data-start={columns > 1 ? at : undefined}
                data-empty={empty ? '' : undefined}
                data-selected={selected === cell.id ? '' : undefined}
              >
                {cell.rows ? <Rows rows={cell.rows} span={own} renderSlot={renderSlot} selected={selected} edges={{ start: !row.frame && flushStart, end: !row.frame && flushEnd, framed: !!row.frame || edges.framed }} /> : slot}
              </div>
            );
          })}
        </div>
      </div>
    );
  });
}

/**
 * A page's composition grid (DesignUp, owner 2026-11-12 23:54, 2026-11-13 02:27): the page is rows; a row's cells
 * divide its span of the page's twelve columns (`span`, at least 3 where a row has more than one cell, so at most four
 * across); a cell holds more rows or is a slot for one block or fundamental. Spans are absolute at every depth, so a
 * nested row only subdivides its parent's span and every cell lines up with the page's columns. An empty slot keeps
 * its size (`data-empty`, setting `--c-page-grid-empty-size`), so a preview lays out as the editor does. The edits an
 * editor makes (split in two, merge two empty cells, move a border, add a row) are `@design-library/core/page-grid`.
 * Rows sit a chosen stack step apart (`gap`); columns a fixed gutter apart. A row whose narrowest cell would be under
 * `size.column-min` stacks its cells in source order, so nothing scrolls sideways at 320 px.
 * The only way to put blocks side by side on a page: blocks never nest a page inside themselves.
 * Not for things compared side by side inside a block (use Grid), an app's regions (use AppLayout or EditorLayout) or
 * free positioning (there is none).
 * @tier layout
 * @family layout
 * @a11y Plain `div`s with no role: the grid arranges, it doesn't group. Reading order is the source order, row by row
 * and cell by cell, at every width. Pointer selection (`onSelect`) is an editor's shortcut; its keyboard path is the
 * editor's outline of the same rows and cells (a TreeView), which sets `selected`.
 */
export function PageGrid({ rows, renderSlot, selected, onSelect, start, end, layoutEdges, ...data }: PageGridProps) {
  const pick = (event: MouseEvent<HTMLDivElement>) => {
    const place = (event.target as Element).closest<HTMLElement>('[data-cell], [data-row]');
    if (!place || !event.currentTarget.contains(place)) return;
    onSelect?.(place.dataset.cell !== undefined ? { kind: 'cell', id: place.dataset.cell } : { kind: 'row', id: place.dataset.row ?? '' });
  };
  return (
    <div {...data} data-dl="page-grid" data-start={start} data-end={end} data-layout-edges={layoutEdges ? '' : undefined} data-selectable={onSelect ? '' : undefined} onClick={onSelect ? pick : undefined}>
      <Rows rows={rows} span={PAGE_GRID_COLUMNS} renderSlot={renderSlot} selected={selected} edges={{ start: !start, end: !end, framed: false }} />
    </div>
  );
}
