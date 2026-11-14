/** Types for page-box-model.mjs: a page's layout as Boxes, Webflow's way (LR156). */
import type { PageGridEdge, PageGridFrame, PageGridIssue, PageGridRecord, PageGridRowGap, PageGridStack } from './page-grid-model.mjs';
import type { BoxStyles } from './page-box-styles.mjs';

export * from './page-box-styles.mjs';

export type BoxTag = 'div' | 'section' | 'header' | 'footer' | 'main' | 'article' | 'aside' | 'nav' | 'address' | 'figure';

export interface Box {
  /** Stable, unique on the page: the key and `data-box`. */
  id: string;
  /** The in-page address (lower-case letters, digits, hyphens), drawn as the element's `id`. */
  anchor?: string;
  /** An editor's label for it (up to 80 characters). */
  name?: string;
  /** The element it draws as (div by default). */
  tag?: BoxTag;
  /** A link Box (LR169, Webflow's Link Block): the whole Box is one link to this address, drawn as an `a`. */
  href?: string;
  /** Layout values per breakpoint. */
  styles?: BoxStyles;
  /** A page-grid Box: a row of cells by span, or a stack of rows. */
  grid?: 'row' | 'stack';
  /** A page look (LR162): on a page-grid Box its row's frame; on any plain Box drawn by PageBoxes (data-look). */
  look?: PageGridFrame;
  /** A lead look's trail first (LR141, LR162). */
  trail?: boolean;
  gap?: PageGridRowGap;
  stacking?: PageGridStack;
  columns?: 'shares';
  /** A cell's page columns, in a page-grid row. */
  span?: number;
  /** An entry: the index of the page entry it shows. */
  section?: number;
  /** The Boxes and entries it holds, in order. */
  children?: Box[];
}

/** The page Box: it stacks the page's Boxes and keeps the grid's edges. */
export interface PageBox extends Box {
  start?: PageGridEdge;
  end?: PageGridEdge;
}

export declare const BOX_TAGS: readonly BoxTag[];

/** A page grid as Boxes. */
export declare function gridToBoxes(grid: PageGridRecord): PageBox;
/** The Boxes as the page-grid record PageGrid draws; a cell holding Boxes carries them as `boxes`. */
export declare function boxesToGrid(page: PageBox): PageGridRecord;
/** Whether the page Box only holds its entries in order, one each, unstyled. */
export declare function boxesInOrder(page: unknown): boolean;
/** What's wrong with a page's Boxes, given how many entries the page has. Empty when valid. */
export declare function pageBoxProblems(page: unknown, sections: number): PageGridIssue[];
/** The entries a grid's cells hold inside Boxes. */
export declare function boxedSections(grid: PageGridRecord | undefined): number[];
