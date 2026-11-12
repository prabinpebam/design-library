/**
 * A page's layout grid as data (page.schema.json `grid`; DesignUp, owner 2026-11-12 23:54): the page's rows, each
 * split into cells, a cell holding more rows or placing one of the page's `sections` by its index. The sections stay
 * one flat list in reading order (anchors, framing and the first picture read it); the grid only places them. A
 * section the grid doesn't place draws after it as a whole row, so nothing is ever lost.
 * Pure data and plain TypeScript (no JSX): SiteView draws it with PageGrid, and the content check (check-site.mjs)
 * reads this file with Node's type stripping, so the page and the check report the same problems.
 */
import type { PageGridGap, PageGridSplit } from '../react/layouts/PageGrid';

export interface PageGridRecordCell {
  /** Unique in the page's grid. */
  id: string;
  /** The index in the page's `sections` this cell places; neither this nor `rows`: an empty slot. */
  section?: number;
  /** Rows inside the cell, dividing its span again. */
  rows?: PageGridRecordRow[];
}

export interface PageGridRecordRow {
  /** Unique in the page's grid. */
  id: string;
  split?: PageGridSplit;
  gap?: PageGridGap;
  cells: PageGridRecordCell[];
}

export interface PageGridRecord {
  rows: PageGridRecordRow[];
}

/** The page's columns and each split's shares: PageGrid's (PAGE_GRID_COLUMNS, pageGridSpans), restated for the check. */
const COLUMNS = 12;
const SHARES: Record<string, readonly number[]> = {
  whole: [1],
  halves: [1 / 2, 1 / 2],
  thirds: [1 / 3, 1 / 3, 1 / 3],
  quarters: [1 / 4, 1 / 4, 1 / 4, 1 / 4],
  'two-thirds-start': [2 / 3, 1 / 3],
  'two-thirds-end': [1 / 3, 2 / 3],
};
const GAPS = ['item', 'group', 'section', 'page'];
/** Rows inside rows inside rows at most: deeper than that a page is no longer readable as one. */
export const PAGE_GRID_DEPTH = 3;

const spansOf = (split: string, span: number): number[] | null => {
  const shares = SHARES[split];
  if (!shares) return null;
  const spans = shares.map((share) => share * span);
  return spans.every((s) => Math.abs(s - Math.round(s)) < 1e-9 && Math.round(s) >= 1) ? spans.map(Math.round) : null;
};
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** One problem: where in the page document (a JSON pointer) and what's wrong. */
export interface PageGridIssue {
  at: string;
  what: string;
}

/**
 * What's wrong with a page's grid, given how many sections the page has: unique ids, known splits that divide their
 * span into whole columns with one cell each, known gaps, sections in range and placed once, a cell placing a section
 * or holding rows (not both), three levels at most. Empty when valid.
 */
export function pageGridRecordProblems(grid: unknown, sections: number): PageGridIssue[] {
  const issues: PageGridIssue[] = [];
  if (!isObject(grid) || !Array.isArray(grid.rows)) return [{ at: '/grid', what: 'needs its rows' }];
  const ids = new Set<string>();
  const placed = new Set<number>();
  const id = (value: unknown, at: string) => {
    if (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/.test(value)) issues.push({ at: `${at}/id`, what: 'needs an id (lowercase letters, digits and dashes)' });
    else if (ids.has(value)) issues.push({ at: `${at}/id`, what: `"${value}" is used twice in the grid` });
    else ids.add(value);
  };
  const rows = (list: unknown[], span: number, depth: number, at: string) => {
    if (depth > PAGE_GRID_DEPTH) return issues.push({ at, what: `nests rows more than ${PAGE_GRID_DEPTH} deep` });
    list.forEach((row, r) => {
      const here = `${at}/${r}`;
      if (!isObject(row) || !Array.isArray(row.cells)) return issues.push({ at: here, what: 'needs an id and cells' });
      id(row.id, here);
      const split = typeof row.split === 'string' ? row.split : 'whole';
      if (row.gap !== undefined && !GAPS.includes(row.gap as string)) issues.push({ at: `${here}/gap`, what: `needs one of: ${GAPS.join(', ')}` });
      const spans = spansOf(split, span);
      const allowed = Object.keys(SHARES).filter((s) => spansOf(s, span));
      if (!spans) issues.push({ at: `${here}/split`, what: `${split} doesn't divide ${span} columns; it allows ${allowed.join(', ')}` });
      else if (spans.length !== row.cells.length) issues.push({ at: `${here}/cells`, what: `${split} has ${spans.length} cells, not ${row.cells.length}` });
      row.cells.forEach((cell, c) => {
        const where = `${here}/cells/${c}`;
        if (!isObject(cell)) return issues.push({ at: where, what: 'needs an id' });
        id(cell.id, where);
        if (cell.section !== undefined && cell.rows !== undefined) issues.push({ at: where, what: 'places a section or holds rows, not both' });
        if (cell.section !== undefined) {
          const n = cell.section;
          if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n >= sections) issues.push({ at: `${where}/section`, what: `isn't one of the page's sections (0 to ${sections - 1})` });
          else if (placed.has(n)) issues.push({ at: `${where}/section`, what: `places section ${n}, which another cell places too` });
          else placed.add(n);
        }
        if (cell.rows !== undefined) {
          if (!Array.isArray(cell.rows) || !cell.rows.length) issues.push({ at: `${where}/rows`, what: 'needs at least one row' });
          else rows(cell.rows, spans?.[c] ?? span, depth + 1, `${where}/rows`);
        }
      });
    });
  };
  rows(grid.rows, COLUMNS, 1, '/grid/rows');
  return issues;
}

/** The sections a grid places, each with the columns its cell spans (12 is the page's whole width). */
export function pageGridPlacements(grid: PageGridRecord): Map<number, number> {
  const out = new Map<number, number>();
  const walk = (list: PageGridRecordRow[], span: number) =>
    list.forEach((row) => {
      const spans = spansOf(row.split ?? 'whole', span);
      const fits = spans && spans.length === row.cells.length;
      row.cells.forEach((cell, c) => {
        const own = fits ? spans[c] : span;
        if (cell.section !== undefined) out.set(cell.section, own);
        if (cell.rows) walk(cell.rows, own);
      });
    });
  walk(grid.rows, COLUMNS);
  return out;
}
