/** Types for page-grid-model.mjs: the page grid as data and the edits an editor makes to it (LR18, LR23). */

/** The space above a row, from the spacing scale's stack steps: item, group, section (default) or page. */
export type PageGridGap = 'item' | 'group' | 'section' | 'page';

/** A row's space above: a stack step, or `none` for exactly 0 (LR127). */
export type PageGridRowGap = PageGridGap | 'none';

/** A grid edge's space: a stack step, or `frame` (LR139): none from the grid, but a framed row at that edge keeps its own inset. */
export type PageGridEdge = PageGridGap | 'frame';

/** A row's band look (LR129). */
export type PageGridFrame = 'band' | 'tint' | 'lead';

/**
 * Where a row's cells stack (LR134). Left out, when its narrowest cell would be under size.column-min; `window`, only
 * in a narrow window (width < 43.75em) or a short one (height < 30em), as a two-column band beside its picture does.
 */
export type PageGridStack = 'window';

/**
 * How a row's cells divide it (LR135). Left out, on the page's twelve columns with the fixed gutter between; `split`,
 * their spans as shares of the row (5 and 7 are 5fr 7fr) with `--c-page-grid-split-gutter` between, so a template's
 * two-column band keeps its own proportions. The cells then no longer line up with the page's columns.
 */
export type PageGridGutter = 'split';

/** @deprecated The older preset splits (LR15); a row's cells carry `span`s instead. Still read and converted. */
export type PageGridSplit = 'whole' | 'halves' | 'thirds' | 'quarters' | 'two-thirds-start' | 'two-thirds-end';

export interface PageGridRecordCell {
  /** Unique in the page's grid. */
  id: string;
  /** The page columns the cell spans (absolute at every depth); its row's spans add up to the row's span. */
  span?: number;
  /** The cell's in-page address (LR156), drawn as its element's `id`. */
  anchor?: string;
  /** The index in the page's `sections` this cell places; neither this nor `rows`: an empty slot. */
  section?: number;
  /** Rows inside the cell, dividing its span again. */
  rows?: PageGridRecordRow[];
}

export interface PageGridRecordRow {
  /** Unique in the page's grid. */
  id: string;
  /** The row's in-page address (LR156), drawn as its element's `id`. */
  anchor?: string;
  /** @deprecated Use the cells' `span`s. */
  split?: PageGridSplit;
  gap?: PageGridRowGap;
  /** The band look (LR129): `band` adds the frame's space above and below; `tint` also its surface. None by default. */
  frame?: PageGridFrame;
  /** Where the row's cells stack (LR134): by its narrowest cell when left out; `window`, only in a narrow or short window. */
  stack?: PageGridStack;
  /** How the row's cells divide it (LR135): the page's columns when left out; `split`, their spans as shares. */
  gutter?: PageGridGutter;
  /** A lead row's trail (LR141): its first nested row is a full-width row above the two columns (the breadcrumbs). */
  trail?: boolean;
  cells: PageGridRecordCell[];
}

export interface PageGridRecord {
  rows: PageGridRecordRow[];
  /** The space above the first row (LR91); none when left out; `frame` keeps an edge framed row's inset (LR139). */
  start?: PageGridEdge;
  /** The space below the last row (LR91); none when left out; `frame` keeps an edge framed row's inset (LR139). */
  end?: PageGridEdge;
}

/** One problem: where in the page document (a JSON pointer) and what's wrong. */
export interface PageGridIssue {
  at: string;
  what: string;
}

export interface PageGridOptions {
  /** The narrowest cell in page columns (default PAGE_GRID_MIN_SPAN, 3). */
  minSpan?: number;
}

export interface PageGridEditOptions extends PageGridOptions {
  /** Makes a new row or cell id from a suggested base; by default the base with -2, -3… until unused. */
  newId?: (base: string) => string;
  /** How many sections the page has (default: one more than the highest placed). */
  sections?: number;
}

/** An edit's result: the new grid, or the unchanged grid and why the edit isn't allowed. */
export interface PageGridEdit {
  grid: PageGridRecord;
  problems: PageGridIssue[];
}

/** Whether an edit is allowed, and why not. */
export interface PageGridCan {
  ok: boolean;
  why?: string;
}

/** A border between two cells of a row: cell `border` and the next, `column` page columns from the row's start. */
export interface PageGridBorder {
  border: number;
  column: number;
  /** The smallest `delta` a drag may move it (negative: towards the start). */
  min: number;
  /** The largest `delta`. */
  max: number;
}

export type PageGridSplitAxis = 'columns' | 'rows';

export declare const PAGE_GRID_COLUMNS: 12;
export declare const PAGE_GRID_MIN_SPAN: 3;
export declare const PAGE_GRID_DEPTH: 3;
export declare const PAGE_GRID_GAPS: readonly PageGridGap[];
/** A row's gap values: `none` (exactly 0, LR127) and the stack steps. */
export declare const PAGE_GRID_ROW_GAPS: readonly PageGridRowGap[];
/** A grid edge's values (LR139): the stack steps and `frame`. */
export declare const PAGE_GRID_EDGES: readonly PageGridEdge[];
/** A row's stack values (LR134). */
export declare const PAGE_GRID_STACKS: readonly PageGridStack[];
/** A row's gutter values (LR135). */
export declare const PAGE_GRID_GUTTERS: readonly PageGridGutter[];
/** @deprecated The older preset splits' shares. */
export declare const PAGE_GRID_SPLIT_SHARES: Readonly<Record<PageGridSplit, readonly number[]>>;

/** @deprecated The columns a preset split gives each cell of a span, or null when it doesn't divide it. */
export declare function splitSpans(split: string, span?: number): number[] | null;
/** The columns each cell of a row takes from its parent's span, or null when they don't add up. */
export declare function rowSpans(row: Pick<PageGridRecordRow, 'cells' | 'split'> | undefined, span?: number): number[] | null;
/** What's wrong with a page's grid, given how many sections the page has. Empty when valid. */
export declare function pageGridRecordProblems(grid: unknown, sections: number, options?: PageGridOptions): PageGridIssue[];
/** The sections a grid places, each with the columns its cell spans. */
export declare function pageGridPlacements(grid: PageGridRecord): Map<number, number>;

/** Whether an empty cell may split in two: columns need a span of twice the minimum (6), rows the depth to spare. */
export declare function canSplit(grid: PageGridRecord, cellId: string, axis: PageGridSplitAxis, options?: PageGridOptions): PageGridCan;
/** Splits an empty cell in two: two columns (its span halved) or two stacked rows inside it. */
export declare function splitCell(grid: PageGridRecord, cellId: string, axis: PageGridSplitAxis, options?: PageGridEditOptions): PageGridEdit;
/** Whether two empty cells may merge 1:1 (side by side in a row, or alone in two consecutive rows). */
export declare function canMerge(grid: PageGridRecord, aId: string, bId: string): PageGridCan;
/** Merges two empty neighbouring cells into the first in reading order. */
export declare function mergeCells(grid: PageGridRecord, aId: string, bId: string, options?: PageGridEditOptions): PageGridEdit;
/** Where a row's borders sit and how far each may move. */
export declare function pageGridBorders(grid: PageGridRecord, rowId: string, options?: PageGridOptions): PageGridBorder[];
/** Moves a border by whole columns (positive: towards the end). */
export declare function resizeBorder(grid: PageGridRecord, rowId: string, border: number, delta: number, options?: PageGridEditOptions): PageGridEdit;
/** Removes a row with its cells and the sections they place (`sections`: their indexes, for the page to drop). */
export declare function removeRow(grid: PageGridRecord, rowId: string, options?: PageGridEditOptions): PageGridEdit & { sections: number[] };
/** Adds an empty one-cell row after or before a row, at the end of a cell's rows, or at the page's end. */
export declare function addRow(grid: PageGridRecord, where?: { after?: string; before?: string; in?: string }, options?: PageGridEditOptions): PageGridEdit;
