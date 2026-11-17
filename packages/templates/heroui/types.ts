/** The heroui template's record (Q172): HeroUI v3's components shown as one scrollable catalogue, grouped by kind and HeroUI v3's categories. */

/** One demo the showcase knows how to draw; each is built from core components only. */
export type HerouiDemo =
  | 'button'
  | 'button-sizes'
  | 'button-group'
  | 'toggle-button-group'
  | 'text-field'
  | 'field-states'
  | 'number-field'
  | 'textarea'
  | 'checkbox'
  | 'radio-group'
  | 'select'
  | 'combo-box'
  | 'switch'
  | 'slider'
  | 'date-picker'
  | 'date-time-fields'
  | 'calendar'
  | 'dropdown'
  | 'tag-group'
  | 'avatar'
  | 'chip-and-badge'
  | 'kbd-and-typography'
  | 'color-picker'
  | 'alert'
  | 'progress'
  | 'skeleton'
  | 'tabs'
  | 'accordion'
  | 'breadcrumbs-and-pagination'
  | 'modal'
  | 'drawer'
  | 'popover-and-tooltip'
  | 'toast'
  | 'table'
  | 'card'
  | 'empty-state';

/** One component's preview: what it is and the demo that shows its variants and states. */
export interface HerouiExample {
  demo: HerouiDemo;
  title: string;
  description: string;
}

/** A category of components (Buttons, Forms, Pickers…): its in-page anchor, title, one line and its previews. */
export interface HerouiCategory {
  id: string;
  title: string;
  intro: string;
  examples: HerouiExample[];
}

/** A kind of component (fundamentals or compounds) and its categories. */
export interface HerouiGroup {
  id: string;
  title: string;
  intro: string;
  categories: HerouiCategory[];
}

export interface HerouiRecord {
  name: string;
  home: string;
  source: { label: string; href: string };
  page: { title: string; lead: string; navLabel: string };
  groups: HerouiGroup[];
  /** The words inside the demos, by key. */
  words: Record<string, string>;
}
