/**
 * A page's layout as Boxes, Webflow's way (LR156, DesignUp; `@design-library/core/page-box`). Plain data and plain
 * functions, so Node, a server and the page use the same code (as page-grid-model.mjs).
 *
 * Every Box has an `id` (stable; an editor's and the style sheet's handle), and may have an `anchor` (its in-page
 * address, drawn as the element's `id`), a `name` (an editor's Navigator label) and `styles` (layout values per
 * breakpoint, page-box-styles.mjs). A Box is one of:
 * - **a Box** (Webflow's Box): drawn as its `tag` (div by default) with its styles, holding Boxes and entries in order;
 * - **an entry**: `section` names the page entry it shows (a fundamental or a preset block); it holds nothing;
 * - **a page-grid Box**, for pages laid out on the page grid: `grid: 'row'` places its Boxes side by side by `span` on
 *   the page's 12 columns, `grid: 'stack'` stacks page-grid rows, with the grid's looks (band, tint, lead and trail),
 *   gap steps, stacking and shares. PageGrid draws these through `boxesToGrid`, exactly as the grid they came from.
 *   A Box in a page-grid row is its cell: an entry, a stack of rows, Boxes, or empty.
 * The page Box (`id: 'page'`) stacks its Boxes and keeps the grid's `start` and `end`.
 */
import { pageGridRecordProblems } from './page-grid-model.mjs';
import { boxStyleProblems } from './page-box-styles.mjs';

export * from './page-box-styles.mjs';

const LOOKS = ['band', 'tint', 'lead'];
/** Webflow's Box tags. */
export const BOX_TAGS = ['div', 'section', 'header', 'footer', 'main', 'article', 'aside', 'nav', 'address', 'figure'];
const ANCHOR = /^[a-z][a-z0-9-]{0,63}$/;
const ID = /^[A-Za-z][\w-]{0,79}$/;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
/** Fields only a page-grid Box has. */
const GRID_FIELDS = ['look', 'trail', 'gap', 'stacking', 'columns'];

/** The id a framed group's one cell has in the grid: `row-x` → `cell-x`. */
const groupCell = id => (id.startsWith('row-') ? `cell-${id.slice(4)}` : `${id}-cell`);
/** A Box or entry the page holds directly draws in a page-grid row of its own; these are that row's and cell's ids. */
const WRAP_ROW = '--row';
const WRAP_CELL = '--cell';

/** A Box's own fields that aren't layout: kept as they are through every conversion. */
const own = box => ({ ...(box.anchor ? { anchor: box.anchor } : {}), ...(box.name ? { name: box.name } : {}), ...(box.tag ? { tag: box.tag } : {}), ...(box.styles ? { styles: box.styles } : {}) });

/** A row's own fields as a Box's. */
function rowFields(row) {
  return {
    ...own(row),
    ...(row.frame ? { look: row.frame } : {}),
    ...(row.trail ? { trail: true } : {}),
    ...(row.gap ? { gap: row.gap } : {}),
    ...(row.stack ? { stacking: row.stack } : {}),
    ...(row.gutter === 'split' ? { columns: 'shares' } : {}),
  };
}

/**
 * A page grid as Boxes. A row whose one cell only holds rows becomes one stacking Box with the row's look; every
 * other row a page-grid row; a cell with an entry an entry, with Boxes those Boxes.
 */
export function gridToBoxes(grid) {
  const cell = c => {
    if (c.split !== undefined) throw new Error(`cell ${c.id}: a deprecated split`);
    const base = { id: c.id, ...own(c), ...(c.span !== undefined ? { span: c.span } : {}) };
    if (c.rows) return { ...base, grid: 'stack', children: c.rows.map(row) };
    if (Array.isArray(c.boxes)) return { ...base, children: c.boxes };
    return { ...base, ...(c.section !== undefined ? { section: c.section } : {}) };
  };
  const row = r => {
    if (r.split !== undefined) throw new Error(`row ${r.id}: a deprecated split; give its cells spans first`);
    const only = r.cells.length === 1 ? r.cells[0] : undefined;
    // A Box or entry held by the page directly, drawn in a row of its own.
    if (r.id.endsWith(WRAP_ROW) && only?.id === `${r.id.slice(0, -WRAP_ROW.length)}${WRAP_CELL}` && Array.isArray(only.boxes) && only.boxes.length === 1) return only.boxes[0];
    // The grid's row > cell > rows: one Box that stacks the rows, carrying the row's look.
    if (only?.rows && only.span === undefined && !only.anchor && !only.styles && only.id === groupCell(r.id) && !r.stack && !r.gutter) {
      return { id: r.id, grid: 'stack', ...rowFields(r), children: only.rows.map(row) };
    }
    return { id: r.id, grid: 'row', ...rowFields(r), children: r.cells.map(cell) };
  };
  return { id: 'page', grid: 'stack', ...(grid.start ? { start: grid.start } : {}), ...(grid.end ? { end: grid.end } : {}), children: grid.rows.map(row) };
}

/**
 * The Boxes as a page-grid record for PageGrid to draw (the inverse of `gridToBoxes`). A cell holding Boxes carries
 * them (`boxes`) for the page to draw in its slot with PageBoxes; a Box's anchor, name, tag and styles travel on its row
 * or cell (PageGrid draws the anchor as the row's or cell's `id`).
 */
export function boxesToGrid(page) {
  const looks = box => ({
    ...own(box),
    ...(box.gap ? { gap: box.gap } : {}),
    ...(box.look ? { frame: box.look } : {}),
    ...(box.stacking ? { stack: box.stacking } : {}),
    ...(box.columns === 'shares' ? { gutter: 'split' } : {}),
    ...(box.trail ? { trail: true } : {}),
  });
  const cell = box => {
    const base = { id: box.id, ...own(box), ...(box.span !== undefined ? { span: box.span } : {}) };
    if (box.grid === 'stack') return { ...base, rows: (box.children ?? []).map(row) };
    if (box.children?.length) return { ...base, boxes: box.children };
    return { ...base, ...(box.section !== undefined ? { section: box.section } : {}) };
  };
  const row = box => box.grid === 'stack' ? { id: box.id, ...looks(box), cells: [{ id: groupCell(box.id), rows: (box.children ?? []).map(row) }] }
    : box.grid === 'row' ? { id: box.id, ...looks(box), cells: (box.children ?? []).map(cell) }
    : { id: `${box.id}${WRAP_ROW}`, cells: [{ id: `${box.id}${WRAP_CELL}`, boxes: [box] }] };
  return { rows: (page.children ?? []).map(row), ...(page.start ? { start: page.start } : {}), ...(page.end ? { end: page.end } : {}) };
}

/** Whether the page Box only holds its entries in order, one each, unstyled: a page drawn by its own flow, no grid. */
export function boxesInOrder(page) {
  return Array.isArray(page?.children) && page.children.every((box, n) => object(box) && !box.grid && !box.children && !box.styles && box.section === n);
}

/**
 * What's wrong with a page's Boxes, given how many entries the page has: the Box rules, each Box's styles, then the
 * page grid's check of the grid they draw. Empty when valid.
 */
export function pageBoxProblems(page, sections) {
  const issues = [];
  const ids = new Set();
  const anchors = new Set();
  const shown = new Set();
  if (!object(page) || page.grid !== 'stack' || !Array.isArray(page.children)) return [{ at: '/boxes', what: 'the page Box stacks its Boxes' }];
  /** `place`: page (the page's own stack), stack (a page-grid stack), row (a page-grid row: a cell) or box (inside a Box). */
  const visit = (box, at, place) => {
    if (!object(box) || typeof box.id !== 'string' || !ID.test(box.id)) return void issues.push({ at, what: 'a Box needs an id of letters, digits, - and _' });
    if (ids.has(box.id)) issues.push({ at: `${at}/id`, what: `the id ${box.id} is used twice` });
    ids.add(box.id);
    if (box.anchor !== undefined) {
      if (typeof box.anchor !== 'string' || !ANCHOR.test(box.anchor)) issues.push({ at: `${at}/anchor`, what: 'an address is lower-case letters, digits and hyphens' });
      else if (anchors.has(box.anchor)) issues.push({ at: `${at}/anchor`, what: `the address ${box.anchor} is used twice` });
      else anchors.add(box.anchor);
    }
    if (box.name !== undefined && (typeof box.name !== 'string' || box.name.length > 80)) issues.push({ at: `${at}/name`, what: 'a name is up to 80 characters' });
    if (box.tag !== undefined && !BOX_TAGS.includes(box.tag)) issues.push({ at: `${at}/tag`, what: `a tag is one of ${BOX_TAGS.join(', ')}` });
    issues.push(...boxStyleProblems(box.styles, `${at}/styles`));
    if (box.grid !== undefined && box.grid !== 'row' && box.grid !== 'stack') issues.push({ at: `${at}/grid`, what: 'a page-grid Box is a row or a stack' });
    if (box.look !== undefined && !LOOKS.includes(box.look)) issues.push({ at: `${at}/look`, what: `a look is ${LOOKS.join(', ')}` });
    if (box.grid && place === 'box') issues.push({ at, what: 'page-grid rows go on the page, not inside a Box' });
    if (place === 'row' && (box.grid === 'row' || GRID_FIELDS.some(key => box[key] !== undefined))) issues.push({ at, what: 'a cell of a page-grid row has no look of its own' });
    if (place !== 'row' && box.span !== undefined) issues.push({ at: `${at}/span`, what: 'only a cell of a page-grid row spans columns' });
    if (!box.grid && GRID_FIELDS.some(key => box[key] !== undefined)) issues.push({ at, what: 'looks, gap steps, stacking and shares belong to page-grid Boxes' });
    if (box.section !== undefined) {
      if (!Number.isInteger(box.section) || box.section < 0 || box.section >= sections) issues.push({ at: `${at}/section`, what: `an entry is one of the page's ${sections}` });
      else if (shown.has(box.section)) issues.push({ at: `${at}/section`, what: `entry ${box.section} is shown twice` });
      else shown.add(box.section);
      if (box.grid || box.children !== undefined) issues.push({ at, what: 'an entry holds nothing' });
    }
    if (box.children !== undefined && !Array.isArray(box.children)) issues.push({ at: `${at}/children`, what: 'a Box holds a list' });
    const inner = box.grid === 'row' ? 'row' : box.grid === 'stack' ? 'stack' : 'box';
    (Array.isArray(box.children) ? box.children : []).forEach((child, n) => visit(child, `${at}/children/${n}`, inner));
  };
  page.children.forEach((child, n) => visit(child, `/boxes/children/${n}`, 'page'));
  const inOrder = boxesInOrder(page);
  if (inOrder && page.children.length !== sections) issues.push({ at: '/boxes/children', what: `a page of entries has one per entry (${sections}), not ${page.children.length}` });
  if (issues.length || inOrder) return issues;
  return pageGridRecordProblems(boxesToGrid(page), sections).map(issue => ({ at: `/boxes (as grid) ${issue.at}`, what: issue.what }));
}

/** The entries a grid's cells hold inside Boxes: placed, so the page doesn't draw them again. */
export function boxedSections(grid) {
  const found = [];
  const inBoxes = boxes => boxes.forEach(box => { if (Number.isInteger(box?.section)) found.push(box.section); if (Array.isArray(box?.children)) inBoxes(box.children); });
  const rows = list => list.forEach(row => row.cells.forEach(cell => { if (Array.isArray(cell.boxes)) inBoxes(cell.boxes); if (cell.rows) rows(cell.rows); }));
  rows(grid?.rows ?? []);
  return found;
}
