/** The coss template's record (Q168): coss ui's components shown as one scrollable catalogue, grouped by kind and category. */

/** One demo the showcase knows how to draw; each is built from core components only. */
export type CossDemo =
  | 'button-variants'
  | 'button-sizes'
  | 'button-icons'
  | 'button-group'
  | 'menu'
  | 'input'
  | 'input-states'
  | 'number-field'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio-group'
  | 'switch'
  | 'segmented-control'
  | 'slider'
  | 'badge'
  | 'chip'
  | 'progress'
  | 'skeleton'
  | 'tooltip'
  | 'avatar'
  | 'kbd'
  | 'typography'
  | 'alert'
  | 'empty'
  | 'card'
  | 'accordion'
  | 'tabs'
  | 'dialog'
  | 'sheet'
  | 'popover'
  | 'breadcrumb'
  | 'pagination'
  | 'table'
  | 'calendar'
  | 'statistic';

/** One component's preview: what it is and the demo that shows its variants and states. */
export interface CossExample {
  demo: CossDemo;
  title: string;
  description: string;
}

/** A category of components (Actions, Inputs…): its in-page anchor, title, one line and its previews. */
export interface CossCategory {
  id: string;
  title: string;
  intro: string;
  examples: CossExample[];
}

/** A kind of component (fundamentals or compounds) and its categories. */
export interface CossGroup {
  id: string;
  title: string;
  intro: string;
  categories: CossCategory[];
}

export interface CossRecord {
  name: string;
  home: string;
  source: { label: string; href: string };
  page: { title: string; lead: string; navLabel: string };
  groups: CossGroup[];
  /** The words inside the demos, by key. */
  words: Record<string, string>;
}
