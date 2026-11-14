/**
 * A page's layout grid as data (page.schema.json `grid`; DesignUp, owner 2026-11-12 23:54, 2026-11-13 02:27): the
 * page's rows, each divided into cells by their spans of the page's 12 columns, a cell holding more rows or placing
 * one of the page's `sections` by its index. The sections stay one flat list in reading order (anchors, framing and
 * the first picture read it); the grid only places them. A section the grid doesn't place draws after it as a whole
 * row, so nothing is ever lost.
 * The model is plain JavaScript (page-grid-model.mjs, `@design-library/core/page-grid`) so Node, a server and the
 * content check (check-site.mjs) import the same code SiteView and PageGrid use.
 */
export {
  PAGE_GRID_COLUMNS,
  PAGE_GRID_MIN_SPAN,
  PAGE_GRID_DEPTH,
  PAGE_GRID_GAPS,
  PAGE_GRID_EDGES,
  PAGE_GRID_SPLIT_SHARES,
  splitSpans,
  rowSpans,
  pageGridRecordProblems,
  pageGridPlacements,
  canSplit,
  splitCell,
  canMerge,
  mergeCells,
  pageGridBorders,
  resizeBorder,
  addRow,
  removeRow,
} from './page-grid-model.mjs';
export type {
  PageGridRecord,
  PageGridEdge,
  PageGridRecordRow,
  PageGridRecordCell,
  PageGridIssue,
  PageGridOptions,
  PageGridEditOptions,
  PageGridEdit,
  PageGridCan,
  PageGridBorder,
  PageGridSplitAxis,
} from './page-grid-model.mjs';