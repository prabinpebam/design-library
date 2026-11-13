/**
 * The page grid as data, and the edits an editor makes to it (LR18, LR23; DesignUp, owner 2026-11-12 23:54 and
 * 2026-11-13 02:27/02:30). Plain JavaScript with no imports, so Node, a server, a test or a content check imports it
 * as is (`@design-library/core/page-grid`); `@design-library/core/render` re-exports it and PageGrid draws it.
 *
 * A page is rows; a row's cells divide its span of the page's 12 columns, each cell a whole number of them (`span`,
 * absolute at every depth); a cell places one of the page's sections, holds rows again, or is an empty slot. A cell is
 * never narrower than the minimum span (3 of 12: at most four across). `split` is the older form (a preset list of
 * shares), still read and converted to spans.
 */

/** The page's one column count. */
export const PAGE_GRID_COLUMNS = 12;
/** The narrowest cell, in page columns (owner 2026-11-13 02:30: 3 of 12, at most four across). */
export const PAGE_GRID_MIN_SPAN = 3;
/** Rows inside rows inside rows at most: deeper than that a page is no longer readable as one. */
export const PAGE_GRID_DEPTH = 3;
/** The space above a row, from the spacing scale's stack steps. */
export const PAGE_GRID_GAPS = ['item', 'group', 'section', 'page'];

/** @deprecated The older preset splits (LR15), each a list of shares of the parent's span; converted to spans. */
export const PAGE_GRID_SPLIT_SHARES = {
  whole: [1],
  halves: [1 / 2, 1 / 2],
  thirds: [1 / 3, 1 / 3, 1 / 3],
  quarters: [1 / 4, 1 / 4, 1 / 4, 1 / 4],
  'two-thirds-start': [2 / 3, 1 / 3],
  'two-thirds-end': [1 / 3, 2 / 3],
};

const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const isEmptyCell = (cell) => cell.section === undefined && !cell.rows;

/** The columns a preset split gives each cell of a span, or null when it doesn't divide it into whole columns. */
export function splitSpans(split, span = PAGE_GRID_COLUMNS) {
  const shares = PAGE_GRID_SPLIT_SHARES[split];
  if (!shares) return null;
  const spans = shares.map((share) => share * span);
  return spans.every((s) => Math.abs(s - Math.round(s)) < 1e-9 && Math.round(s) >= 1) ? spans.map(Math.round) : null;
}

/**
 * The columns each cell of a row takes from its parent's span: the cells' own `span`s; else the row's (deprecated)
 * `split`; else, for one cell, the whole span. Null when they don't add up to the parent's span.
 */
export function rowSpans(row, span = PAGE_GRID_COLUMNS) {
  const cells = Array.isArray(row?.cells) ? row.cells : [];
  if (!cells.length) return null;
  let spans;
  if (cells.some((c) => c && c.span !== undefined)) spans = cells.map((c) => (cells.length === 1 && c.span === undefined ? span : c?.span));
  else if (row.split !== undefined) spans = splitSpans(row.split, span);
  else spans = cells.length === 1 ? [span] : null;
  if (!spans || spans.length !== cells.length) return null;
  if (!spans.every((s) => Number.isInteger(s) && s >= 1)) return null;
  return spans.reduce((a, b) => a + b, 0) === span ? spans : null;
}

/**
 * What's wrong with a page's grid, given how many sections the page has: unique ids, spans that are whole columns,
 * at least the minimum and adding up to their parent's span (or a preset split that divides it), known gaps, sections
 * in range and placed once, a cell placing a section or holding rows (not both), three levels at most. Empty when valid.
 */
export function pageGridRecordProblems(grid, sections, options = {}) {
  const minSpan = options.minSpan ?? PAGE_GRID_MIN_SPAN;
  const issues = [];
  if (!isObject(grid) || !Array.isArray(grid.rows)) return [{ at: '/grid', what: 'needs its rows' }];
  const ids = new Set();
  const placed = new Set();
  const id = (value, at) => {
    if (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/.test(value)) issues.push({ at: `${at}/id`, what: 'needs an id (lowercase letters, digits and dashes)' });
    else if (ids.has(value)) issues.push({ at: `${at}/id`, what: `"${value}" is used twice in the grid` });
    else ids.add(value);
  };
  const rows = (list, span, depth, at) => {
    if (depth > PAGE_GRID_DEPTH) return issues.push({ at, what: `nests rows more than ${PAGE_GRID_DEPTH} deep` });
    list.forEach((row, r) => {
      const here = `${at}/${r}`;
      if (!isObject(row) || !Array.isArray(row.cells) || !row.cells.length) return issues.push({ at: here, what: 'needs an id and cells' });
      id(row.id, here);
      if (row.gap !== undefined && !PAGE_GRID_GAPS.includes(row.gap)) issues.push({ at: `${here}/gap`, what: `needs one of: ${PAGE_GRID_GAPS.join(', ')}` });
      const spans = rowSpans(row, span);
      const own = row.cells.some((c) => isObject(c) && c.span !== undefined);
      if (!spans) {
        if (own) issues.push({ at: `${here}/cells`, what: `the cells' spans must be whole columns adding up to ${span}` });
        else if (row.split !== undefined) {
          const allowed = Object.keys(PAGE_GRID_SPLIT_SHARES).filter((s) => splitSpans(s, span));
          const shares = PAGE_GRID_SPLIT_SHARES[row.split];
          issues.push(shares && splitSpans(row.split, span) ? { at: `${here}/cells`, what: `${row.split} has ${shares.length} cells, not ${row.cells.length}` } : { at: `${here}/split`, what: `${row.split} doesn't divide ${span} columns; it allows ${allowed.join(', ')}` });
        } else issues.push({ at: `${here}/cells`, what: `${row.cells.length} cells need their spans (columns of ${span})` });
      } else if (row.cells.length > 1 && spans.some((s) => s < minSpan)) issues.push({ at: `${here}/cells`, what: `a cell spans ${Math.min(...spans)} columns; the narrowest is ${minSpan}` });
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
  rows(grid.rows, PAGE_GRID_COLUMNS, 1, '/grid/rows');
  for (const edge of ['start', 'end']) if (grid[edge] !== undefined && !PAGE_GRID_GAPS.includes(grid[edge])) issues.push({ at: `/grid/${edge}`, what: `needs one of: ${PAGE_GRID_GAPS.join(', ')}` });
  return issues;
}

/** The sections a grid places, each with the columns its cell spans (12 is the page's whole width). */
export function pageGridPlacements(grid) {
  const out = new Map();
  const walk = (list, span) =>
    list.forEach((row) => {
      const spans = rowSpans(row, span);
      row.cells.forEach((cell, c) => {
        const own = spans ? spans[c] : span;
        if (cell.section !== undefined) out.set(cell.section, own);
        if (cell.rows) walk(cell.rows, own);
      });
    });
  walk(grid.rows ?? [], PAGE_GRID_COLUMNS);
  return out;
}

// ---- Finding places --------------------------------------------------------------------------------------------

/** Every row with where it sits: its container's list, its index, its parent span and its depth (1 at the page). */
function rowsOf(grid) {
  const out = [];
  const walk = (list, span, depth, parentCell) =>
    list.forEach((row, index) => {
      out.push({ row, list, index, span, depth, parentCell });
      const spans = rowSpans(row, span);
      row.cells.forEach((cell, c) => cell.rows && walk(cell.rows, spans ? spans[c] : span, depth + 1, cell));
    });
  walk(grid.rows ?? [], PAGE_GRID_COLUMNS, 1, undefined);
  return out;
}

function cellAt(grid, id) {
  for (const at of rowsOf(grid)) {
    const c = at.row.cells.findIndex((cell) => cell.id === id);
    if (c >= 0) return { ...at, cell: at.row.cells[c], c, spans: rowSpans(at.row, at.span) };
  }
  return undefined;
}

const clone = (grid) => JSON.parse(JSON.stringify(grid));
const fail = (grid, what) => ({ grid, problems: [{ at: '/grid', what }] });
/** An id not yet in the grid, from a base. */
function freshId(grid, base, newId) {
  const used = new Set(rowsOf(grid).flatMap(({ row }) => [row.id, ...row.cells.map((c) => c.id)]));
  if (newId) return newId(base);
  let n = 2;
  let id = base;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}
/** Writes explicit spans on a row's cells (converting a deprecated split), so an edit can change one of them. */
function withSpans(row, spans) {
  delete row.split;
  row.cells.forEach((cell, c) => {
    cell.span = spans[c];
  });
}
/** Finishes an edit: the new grid when it's valid, else the old one and what's wrong. */
function finish(before, after, options) {
  const sections = options.sections ?? Math.max(0, ...pageGridPlacements(after).keys()) + 1;
  const problems = pageGridRecordProblems(after, sections, options);
  return problems.length ? { grid: before, problems } : { grid: after, problems: [] };
}

// ---- What an editor may do ------------------------------------------------------------------------------------

/**
 * Whether an empty cell may split in two: into two columns when its span holds two of the narrowest cells, or into
 * two rows while the grid is under its depth. A cell placing a section or holding rows never splits.
 */
export function canSplit(grid, cellId, axis, options = {}) {
  const minSpan = options.minSpan ?? PAGE_GRID_MIN_SPAN;
  const at = cellAt(grid, cellId);
  if (!at) return { ok: false, why: `there's no cell "${cellId}"` };
  if (!isEmptyCell(at.cell)) return { ok: false, why: 'only an empty cell splits' };
  const span = at.spans ? at.spans[at.c] : at.span;
  if (axis === 'columns') return span >= 2 * minSpan ? { ok: true } : { ok: false, why: `${span} columns can't hold two cells of at least ${minSpan}` };
  if (axis === 'rows') return at.depth < PAGE_GRID_DEPTH ? { ok: true } : { ok: false, why: `rows nest ${PAGE_GRID_DEPTH} deep at most` };
  return { ok: false, why: 'splits into columns or rows' };
}

/** Splits an empty cell in two: two columns in its row (its span halved), or two stacked rows inside it. */
export function splitCell(grid, cellId, axis, options = {}) {
  const can = canSplit(grid, cellId, axis, options);
  if (!can.ok) return fail(grid, can.why);
  const next = clone(grid);
  const at = cellAt(next, cellId);
  if (!at.spans) return fail(grid, 'its row needs valid spans first');
  const span = at.spans[at.c];
  if (axis === 'columns') {
    withSpans(at.row, at.spans);
    const first = Math.floor(span / 2);
    at.cell.span = first;
    at.row.cells.splice(at.c + 1, 0, { id: freshId(next, `${cellId}-b`, options.newId), span: span - first });
  } else {
    at.cell.rows = [
      { id: freshId(next, `${cellId}-r1`, options.newId), cells: [{ id: freshId(next, `${cellId}-a`, options.newId) }] },
      { id: freshId(next, `${cellId}-r2`, options.newId), cells: [{ id: freshId(next, `${cellId}-b`, options.newId) }] },
    ];
  }
  return finish(grid, next, options);
}

/**
 * Whether two empty cells may merge 1:1: neighbours in one row, or the only cells of two consecutive rows in one
 * container (a cell or the page).
 */
export function canMerge(grid, aId, bId) {
  const a = cellAt(grid, aId);
  const b = cellAt(grid, bId);
  if (!a || !b) return { ok: false, why: `there's no cell "${!a ? aId : bId}"` };
  if (!isEmptyCell(a.cell) || !isEmptyCell(b.cell)) return { ok: false, why: 'only empty cells merge' };
  if (a.row === b.row) return Math.abs(a.c - b.c) === 1 ? { ok: true } : { ok: false, why: 'only neighbouring cells merge' };
  if (a.list === b.list && Math.abs(a.index - b.index) === 1 && a.row.cells.length === 1 && b.row.cells.length === 1) return { ok: true };
  return { ok: false, why: 'only neighbouring cells merge: side by side in one row, or alone in two rows one above the other' };
}

/** Merges two empty neighbouring cells into the first of them (in reading order). */
export function mergeCells(grid, aId, bId, options = {}) {
  const can = canMerge(grid, aId, bId);
  if (!can.ok) return fail(grid, can.why);
  const next = clone(grid);
  let a = cellAt(next, aId);
  let b = cellAt(next, bId);
  if (a.row === b.row) {
    if (b.c < a.c) [a, b] = [b, a];
    withSpans(a.row, a.spans);
    a.cell.span += b.cell.span;
    a.row.cells.splice(b.c, 1);
    if (a.row.cells.length === 1) delete a.cell.span;
  } else {
    if (b.index < a.index) [a, b] = [b, a];
    a.list.splice(b.index, 1);
    // Two rows that were a cell's only rows fold back into that cell: an empty slot again.
    if (a.parentCell && a.list.length === 1) delete a.parentCell.rows;
  }
  return finish(grid, next, options);
}

/**
 * Where a row's borders sit, for an editor's drag handles and gutter hit areas: border `n` lies between cell n and
 * n + 1, at `column` page columns from the row's start; `min` and `max` bound the `delta` a drag may move it (each
 * side keeps the narrowest span, and a cell holding rows of more than one cell doesn't resize).
 */
export function pageGridBorders(grid, rowId, options = {}) {
  const minSpan = options.minSpan ?? PAGE_GRID_MIN_SPAN;
  const at = rowsOf(grid).find(({ row }) => row.id === rowId);
  const spans = at && rowSpans(at.row, at.span);
  if (!spans) return [];
  const fixed = (cell) => !!cell.rows?.some((r) => r.cells.length > 1);
  let column = 0;
  return spans.slice(0, -1).map((s, n) => {
    column += s;
    const locked = fixed(at.row.cells[n]) || fixed(at.row.cells[n + 1]);
    return { border: n, column, min: locked ? 0 : minSpan - s, max: locked ? 0 : spans[n + 1] - minSpan };
  });
}

/** Moves the border between cell `border` and the next by `delta` columns (positive: to the end). */
export function resizeBorder(grid, rowId, border, delta, options = {}) {
  const limits = pageGridBorders(grid, rowId, options)[border];
  if (!limits) return fail(grid, `row "${rowId}" has no border ${border}`);
  if (!Number.isInteger(delta) || delta < limits.min || delta > limits.max) return fail(grid, `the border moves from ${limits.min} to ${limits.max} columns`);
  if (delta === 0) return { grid, problems: [] };
  const next = clone(grid);
  const at = rowsOf(next).find(({ row }) => row.id === rowId);
  withSpans(at.row, rowSpans(at.row, at.span));
  at.row.cells[border].span += delta;
  at.row.cells[border + 1].span -= delta;
  return finish(grid, next, options);
}

/**
 * Removes a row and everything in it (LR88): its cells, their rows and the sections they place. A cell left with no
 * rows becomes an empty slot again. `sections` lists the section indexes the row placed, so the page can drop them
 * from its list (and renumber the rest); the grid still names the others by their old indexes.
 */
export function removeRow(grid, rowId, options = {}) {
  const next = clone(grid);
  const at = rowsOf(next).find(({ row }) => row.id === rowId);
  if (!at) return { ...fail(grid, `there's no row "${rowId}"`), sections: [] };
  const sections = [...pageGridPlacements({ rows: [at.row] }).keys()].sort((a, b) => a - b);
  at.list.splice(at.index, 1);
  if (at.parentCell && !at.list.length) delete at.parentCell.rows;
  const done = finish(grid, next, options);
  return { ...done, sections: done.problems.length ? [] : sections };
}

/**
 * Adds an empty row of one cell: after or before a row, at the end of a cell's rows (`in`), or at the page's end.
 * Its gap is the default (section).
 */
export function addRow(grid, where = {}, options = {}) {
  const next = clone(grid);
  const row = { id: freshId(next, 'row', options.newId), cells: [{ id: freshId(next, 'cell', options.newId) }] };
  const anchor = where.after ?? where.before;
  if (anchor !== undefined) {
    const at = rowsOf(next).find(({ row: r }) => r.id === anchor);
    if (!at) return fail(grid, `there's no row "${anchor}"`);
    at.list.splice(at.index + (where.after !== undefined ? 1 : 0), 0, row);
  } else if (where.in !== undefined) {
    const at = cellAt(next, where.in);
    if (!at) return fail(grid, `there's no cell "${where.in}"`);
    if (!at.cell.rows) return fail(grid, 'a cell takes rows by splitting it into rows');
    at.cell.rows.push(row);
  } else (next.rows ??= []).push(row);
  return finish(grid, next, options);
}
