/** The alignui template's record (Q169): AlignUI's components shown as one scrollable catalogue, grouped by kind and AlignUI's categories. */

/** One demo the showcase knows how to draw; each is built from core components only. */
export type AlignuiDemo =
  | 'button'
  | 'button-sizes'
  | 'compact-button'
  | 'link-button'
  | 'button-group'
  | 'dropdown'
  | 'input'
  | 'input-states'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'datepicker'
  | 'avatar'
  | 'badge'
  | 'status-badge'
  | 'tag'
  | 'kbd'
  | 'progress-bar'
  | 'rating'
  | 'tooltip'
  | 'segmented-control'
  | 'alert'
  | 'toast'
  | 'accordion'
  | 'breadcrumb'
  | 'tab-horizontal'
  | 'tab-vertical'
  | 'pagination'
  | 'modal'
  | 'drawer'
  | 'popover'
  | 'table'
  | 'file-upload';

/** One component's preview: what it is and the demo that shows its variants and states. */
export interface AlignuiExample {
  demo: AlignuiDemo;
  title: string;
  description: string;
}

/** A category of components (Actions, Form…): its in-page anchor, title, one line and its previews. */
export interface AlignuiCategory {
  id: string;
  title: string;
  intro: string;
  examples: AlignuiExample[];
}

/** A kind of component (fundamentals or compounds) and its categories. */
export interface AlignuiGroup {
  id: string;
  title: string;
  intro: string;
  categories: AlignuiCategory[];
}

export interface AlignuiRecord {
  name: string;
  home: string;
  source: { label: string; href: string };
  page: { title: string; lead: string; navLabel: string };
  groups: AlignuiGroup[];
  /** The words inside the demos, by key. */
  words: Record<string, string>;
}
