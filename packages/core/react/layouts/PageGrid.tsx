import type { MouseEvent, ReactNode } from 'react';
import type { DataAttributes } from '../types';

/** The page grid's one column count: every split divides these columns, at every depth. */
export const PAGE_GRID_COLUMNS = 12;

/**
 * How a row divides its span: `whole` (one cell), `halves`, `thirds`, `quarters`, `two-thirds-start` (2/3 + 1/3) or
 * `two-thirds-end` (1/3 + 2/3). A split is allowed only where every cell gets a whole number of the grid's columns.
 */
export type PageGridSplit = 'whole' | 'halves' | 'thirds' | 'quarters' | 'two-thirds-start' | 'two-thirds-end';

/** The space above a row, from the spacing scale's stack steps: item, group, section (default) or page. */
export type PageGridGap = 'item' | 'group' | 'section' | 'page';

export interface PageGridCell {
  /** Stable id: the key, and `data-cell` on the cell for an editor to find it. */
  id: string;
  /** Rows inside the cell, each dividing the cell's span again. Without rows the cell is a slot: `renderSlot` fills it. */
  rows?: PageGridRow[];
}

export interface PageGridRow {
  /** Stable id: the key, and `data-row` on the row. */
  id: string;
  /** How the row divides its span (default `whole`). */
  split?: PageGridSplit;
  /** The space above the row; the first row of a group has none (default `section`). */
  gap?: PageGridGap;
  /** One cell per part of the split, in reading order. */
  cells: PageGridCell[];
}

const SHARES: Record<PageGridSplit, readonly number[]> = {
  whole: [1],
  halves: [1 / 2, 1 / 2],
  thirds: [1 / 3, 1 / 3, 1 / 3],
  quarters: [1 / 4, 1 / 4, 1 / 4, 1 / 4],
  'two-thirds-start': [2 / 3, 1 / 3],
  'two-thirds-end': [1 / 3, 2 / 3],
};

/** The splits, in the order an editor offers them. */
export const PAGE_GRID_SPLITS = Object.keys(SHARES) as PageGridSplit[];

/** The columns each cell of `split` takes from a span, or `null` when the split doesn't divide it into whole columns. */
export function pageGridSpans(split: PageGridSplit, span: number = PAGE_GRID_COLUMNS): number[] | null {
  const spans = SHARES[split].map((share) => share * span);
  return spans.every((s) => Math.abs(s - Math.round(s)) < 1e-9 && Math.round(s) >= 1) ? spans.map(Math.round) : null;
}

/** The splits a span allows (a 12-column page: all six; a half of it, 6: all but quarters; a quarter, 3: whole, thirds and the two-thirds). */
export function pageGridSplits(span: number = PAGE_GRID_COLUMNS): PageGridSplit[] {
  return PAGE_GRID_SPLITS.filter((split) => pageGridSpans(split, span) !== null);
}

/** What's wrong with a tree: a split its span doesn't allow, or a cell count that doesn't match its split. Empty when valid. */
export function pageGridProblems(rows: PageGridRow[], span: number = PAGE_GRID_COLUMNS, path = 'rows'): string[] {
  return rows.flatMap((row, r) => {
    const at = `${path}[${r}] (${row.id})`;
    const split = row.split ?? 'whole';
    const spans = pageGridSpans(split, span);
    const own: string[] = [];
    if (!spans) own.push(`${at}: ${split} doesn't divide ${span} columns; it allows ${pageGridSplits(span).join(', ')}`);
    else if (spans.length !== row.cells.length) own.push(`${at}: ${split} has ${spans.length} cells, not ${row.cells.length}`);
    return [
      ...own,
      ...row.cells.flatMap((cell, c) => (cell.rows ? pageGridProblems(cell.rows, spans?.[c] ?? span, `${at}.cells[${c}].rows`) : [])),
    ];
  });
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
}

/** A selectable place in the grid. */
export interface PageGridTarget {
  kind: 'row' | 'cell';
  id: string;
}

function Rows({ rows, span, renderSlot, selected }: { rows: PageGridRow[]; span: number; renderSlot: PageGridProps['renderSlot']; selected?: string }) {
  return rows.map((row) => {
    const split = row.split ?? 'whole';
    // A split its span doesn't allow, or the wrong number of cells, stacks its cells whole rather than guessing.
    const spans = pageGridSpans(split, span);
    const fits = spans && spans.length === row.cells.length;
    const smallest = fits ? Math.max(...SHARES[split].map((share) => Math.round(1 / share))) : 1;
    return (
      <div key={row.id} data-dl-part="page-row" data-row={row.id} data-gap={row.gap ?? 'section'} data-selected={selected === row.id ? '' : undefined}>
        <div data-dl-part="page-columns" data-columns={fits ? span : 1} data-narrowest={smallest > 1 ? smallest : undefined}>
          {row.cells.map((cell, c) => (
            <div key={cell.id} data-dl-part="page-cell" data-cell={cell.id} data-span={fits ? spans[c] : 1} data-selected={selected === cell.id ? '' : undefined}>
              {cell.rows ? <Rows rows={cell.rows} span={fits ? spans[c] : span} renderSlot={renderSlot} selected={selected} /> : renderSlot(cell)}
            </div>
          ))}
        </div>
      </div>
    );
  });
}

/**
 * A page's composition grid (DesignUp, owner 2026-11-12 23:54): the page is rows; a row splits into cells from a
 * fixed list of splits; a cell holds more rows or is a slot for one block or fundamental. Every split divides the same
 * twelve columns, so a nested split only subdivides its parent's span and every cell lines up with the page's columns.
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
export function PageGrid({ rows, renderSlot, selected, onSelect, ...data }: PageGridProps) {
  const pick = (event: MouseEvent<HTMLDivElement>) => {
    const place = (event.target as Element).closest<HTMLElement>('[data-cell], [data-row]');
    if (!place || !event.currentTarget.contains(place)) return;
    onSelect?.(place.dataset.cell !== undefined ? { kind: 'cell', id: place.dataset.cell } : { kind: 'row', id: place.dataset.row ?? '' });
  };
  return (
    <div {...data} data-dl="page-grid" data-selectable={onSelect ? '' : undefined} onClick={onSelect ? pick : undefined}>
      <Rows rows={rows} span={PAGE_GRID_COLUMNS} renderSlot={renderSlot} selected={selected} />
    </div>
  );
}
