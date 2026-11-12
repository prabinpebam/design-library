// The page grid model's edits (LR23; DesignUp, owner 2026-11-13 02:27/02:30): a cell spans at least 3 of 12, an
// empty cell splits only in two, two empty neighbours merge 1:1, borders move on the 12 columns, rows add between rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PAGE_GRID_MIN_SPAN,
  addRow,
  canMerge,
  canSplit,
  mergeCells,
  pageGridBorders,
  pageGridPlacements,
  pageGridRecordProblems,
  resizeBorder,
  rowSpans,
  splitCell,
} from '../packages/core/render/page-grid-model.mjs';

const page = () => ({ rows: [{ id: 'r1', cells: [{ id: 'a' }] }] });
const spans = (grid, row = 0) => rowSpans(grid.rows[row]);

test('the minimum span is 3 of 12', () => {
  assert.equal(PAGE_GRID_MIN_SPAN, 3);
  const narrow = { rows: [{ id: 'r', cells: [{ id: 'a', span: 2 }, { id: 'b', span: 10 }] }] };
  assert.match(pageGridRecordProblems(narrow, 0)[0].what, /narrowest is 3/);
  const ok = { rows: [{ id: 'r', cells: [{ id: 'a', span: 3 }, { id: 'b', span: 9 }] }] };
  assert.deepEqual(pageGridRecordProblems(ok, 0), []);
  assert.match(pageGridRecordProblems({ rows: [{ id: 'r', cells: [{ id: 'a', span: 5 }, { id: 'b', span: 5 }] }] }, 0)[0].what, /adding up to 12/);
});

test('a deprecated split still reads as spans', () => {
  const grid = { rows: [{ id: 'r', split: 'two-thirds-start', cells: [{ id: 'a', section: 0 }, { id: 'b', section: 1 }] }] };
  assert.deepEqual(pageGridRecordProblems(grid, 2), []);
  assert.deepEqual([...pageGridPlacements(grid)], [[0, 8], [1, 4]]);
  assert.match(pageGridRecordProblems({ rows: [{ id: 'r', split: 'halves', cells: [{ id: 'a' }] }] }, 0)[0].what, /halves has 2 cells, not 1/);
});

test('split into columns needs a span of 6; a split halves it', () => {
  let { grid, problems } = splitCell(page(), 'a', 'columns');
  assert.deepEqual(problems, []);
  assert.deepEqual(spans(grid), [6, 6]);
  assert.equal(canSplit(grid, 'a', 'columns').ok, true);
  ({ grid } = splitCell(grid, 'a', 'columns'));
  assert.deepEqual(spans(grid), [3, 3, 6]);
  assert.equal(canSplit(grid, 'a', 'columns').ok, false);
  const five = { rows: [{ id: 'r', cells: [{ id: 'a', span: 5 }, { id: 'b', span: 7 }] }] };
  assert.equal(canSplit(five, 'a', 'columns').ok, false);
  assert.equal(canSplit(five, 'b', 'columns').ok, true);
  const refused = splitCell(five, 'a', 'columns');
  assert.equal(refused.grid, five);
  assert.equal(refused.problems.length, 1);
});

test('only an empty cell splits; rows split to the depth limit', () => {
  const placed = { rows: [{ id: 'r', cells: [{ id: 'a', section: 0 }] }] };
  assert.equal(canSplit(placed, 'a', 'columns').ok, false);
  let { grid } = splitCell(page(), 'a', 'rows');
  assert.equal(grid.rows[0].cells[0].rows.length, 2);
  const inner = grid.rows[0].cells[0].rows[1].cells[0].id;
  ({ grid } = splitCell(grid, inner, 'rows'));
  const deepest = grid.rows[0].cells[0].rows[1].cells[0].rows[0].cells[0].id;
  assert.equal(canSplit(grid, deepest, 'rows').ok, false);
  assert.deepEqual(pageGridRecordProblems(grid, 0), []);
});

test('two empty neighbours merge 1:1, side by side or stacked', () => {
  let { grid } = splitCell(page(), 'a', 'columns');
  const b = grid.rows[0].cells[1].id;
  assert.equal(canMerge(grid, 'a', b).ok, true);
  ({ grid } = mergeCells(grid, b, 'a'));
  assert.deepEqual(grid, page());
  ({ grid } = splitCell(page(), 'a', 'rows'));
  const [top, bottom] = grid.rows[0].cells[0].rows.map((r) => r.cells[0].id);
  ({ grid } = mergeCells(grid, top, bottom));
  assert.deepEqual(grid, page());
  const filled = { rows: [{ id: 'r', cells: [{ id: 'a', span: 6, section: 0 }, { id: 'b', span: 6 }] }] };
  assert.equal(canMerge(filled, 'a', 'b').ok, false);
  const apart = { rows: [{ id: 'r', cells: [{ id: 'a', span: 4 }, { id: 'b', span: 4 }, { id: 'c', span: 4 }] }] };
  assert.equal(canMerge(apart, 'a', 'c').ok, false);
});

test('a border moves on the 12 columns, keeping the minimum on both sides', () => {
  const grid = { rows: [{ id: 'r', split: 'halves', cells: [{ id: 'a' }, { id: 'b' }] }] };
  assert.deepEqual(pageGridBorders(grid, 'r'), [{ border: 0, column: 6, min: -3, max: 3 }]);
  const moved = resizeBorder(grid, 'r', 0, 2);
  assert.deepEqual(spans(moved.grid), [8, 4]);
  assert.equal(moved.grid.rows[0].split, undefined);
  assert.equal(resizeBorder(grid, 'r', 0, 4).grid, grid);
  assert.deepEqual(spans(resizeBorder(grid, 'r', 0, -3).grid), [3, 9]);
});

test('a row adds between rows, inside a cell holding rows, or at the end', () => {
  const two = { rows: [{ id: 'r1', cells: [{ id: 'a' }] }, { id: 'r2', cells: [{ id: 'b' }] }] };
  let { grid, problems } = addRow(two, { after: 'r1' });
  assert.deepEqual(problems, []);
  assert.deepEqual(grid.rows.map((r) => r.id), ['r1', 'row', 'r2']);
  ({ grid } = addRow(grid, { before: 'r1' }, { newId: (base) => `${base}-x` }));
  assert.equal(grid.rows[0].id, 'row-x');
  assert.equal(addRow(two, { in: 'a' }).problems.length, 1);
  ({ grid } = addRow(two));
  assert.equal(grid.rows.at(-1).cells.length, 1);
});
