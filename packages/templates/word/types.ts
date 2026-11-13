/** One ribbon command: a stacked lead command, an icon command (optionally with a menu chevron), or a value field. */
export interface WordCommand {
  label: string;
  /** Explicit multi-line stacked caption lines when a ribbon wraps at a specific break. */
  lines?: string[];
  /** Icon name from core or the template's custom icon pack. */
  icon?: string;
  /** labelled: a small icon with its name beside it; checkbox: a compact show/hide checkbox row; pen: a tall drawing barrel; tool: a large centered drawing cursor/lasso; style-gallery: inline style-set thumbnail strip; labelled-field: an icon+label beside a select box; record-stepper: mail-merge record navigation; separator: thin line between sets. */
  kind?: 'stacked' | 'icon' | 'labelled' | 'checkbox' | 'field' | 'labelled-field' | 'record-stepper' | 'separator' | 'pen' | 'tool' | 'style-gallery';
  /** Hides the text caption before a `labelled-field` when only its leading icon precedes the select box (All Markup). */
  hideFieldLabel?: boolean;
  /** A field's current value ("Aptos (Body)", "11", "APA", "All Markup"). */
  value?: string;
  /** A field's width class: `wide` for a font name, `narrow` for a size, `medium` for a citation style, `markup` for All Markup. */
  width?: 'wide' | 'narrow' | 'medium' | 'markup';
  /** A split command with a menu of options. */
  menu?: boolean;
  /** A toggle that's on (left alignment), or initial checked state for a `checkbox` command. */
  pressed?: boolean;
  /** Initial checked state for a `checkbox` command (Ruler on the View tab). */
  checked?: boolean;
  /** Unavailable in the current selection state (Cut, Copy, Sensitivity on an empty selection). */
  disabled?: boolean;
  /** A formatting toggle: `true` turns on and off by itself (Bold); a set name makes it one of a set where exactly one is on (`align`) or at most one is on (`list`). */
  toggle?: true | 'align' | 'list';
  /** What the command does to the document at the selection. A toggle with a `run` shows the selection's own state. */
  run?: WordAction;
  /** A field's choices (font names, sizes). */
  options?: string[];
  /** The split menu's choices; each `value` is a `WordAction` or `style:{block}`, `case:{sentence|lower|upper|title}`, `spacing:{line height}`. The main button opens the menu when it has no `run`. */
  items?: { value: string; label: string }[];
}
export type WordAction =
  | 'paste' | 'cut' | 'copy' | 'format-painter'
  | 'font' | 'font-size' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'subscript' | 'superscript' | 'clear' | 'grow' | 'shrink' | 'highlight' | 'font-colour'
  | 'bullets' | 'numbering' | 'multilevel' | 'outdent' | 'indent' | 'align-left' | 'center' | 'align-right' | 'justify' | 'marks'
  | 'find' | 'select-all';
export interface WordSpinField {
  label: string;
  icon: string;
  value: number;
  unit: string;
  step?: number;
}
export interface WordSpinColumn {
  heading: string;
  fields: WordSpinField[];
}
export interface WordGroup {
  id: string;
  label: string;
  /** Hides redundant group caption under a single-command collapsed group. */
  hideLabel?: boolean;
  launcher?: string;
  /** Lead commands stacked at the group's start (Paste). */
  lead?: WordCommand[];
  /** Rows of commands beside the lead ones. */
  rows?: WordCommand[][];
  /** Multiple side-by-side stacks of command rows (Illustrations, Text). */
  columns?: WordCommand[][][];
  /** Headed columns of numeric spinboxes (Indent and Spacing in Layout). */
  spinColumns?: WordSpinColumn[];
  /** Lead commands placed after an inline gallery (Colors, Fonts in Design). */
  trailLead?: WordCommand[];
  /** Lead commands placed at the group's end after its rows (Change Provider in References). */
  endLead?: WordCommand[];
}

export interface WordStyleSet {
  id: string;
  name: string;
  titleText: string;
  headingText: string;
  variant: 'default' | 'caps-blue' | 'caps-rule' | 'serif' | 'caps-dark' | 'bar-num' | 'numbered' | 'caps-centered' | 'warm' | 'boxed' | 'minimal' | 'bold-sans' | 'editorial' | 'classic' | 'slate' | 'compact';
}
export interface WordBlock {
  style: 'title' | 'heading-1' | 'heading-2' | 'body' | 'quote';
  text: string;
}
export interface WordComment {
  author: string;
  time: string;
  text: string;
  /** The words in the document the comment is anchored to. */
  anchor: string;
}
export interface WordCopilotPrompt {
  prefix: string;
  emphasis: string;
}

export interface WordCopilotPane {
  heading: string;
  body: string;
  prompts: WordCopilotPrompt[];
  allowEditing: string;
  placeholder: string;
  menuLabel: string;
  moreLabel: string;
}

export interface WordBackstageNavItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
}

export interface WordBackstageTemplate {
  id: string;
  title: string;
  variant: 'blank' | 'tour' | 'toc' | 'grant' | 'minutes' | 'proposal';
}

export interface WordRecommendedCard {
  id: string;
  title: string;
  author?: string;
  activity: string;
  date: string;
  icon: 'comment' | 'edit' | 'people';
  preview: 'survey' | 'tide' | 'mooring' | 'inspection';
}

export interface WordRecentFile {
  id: string;
  name: string;
  location: string;
  modified: string;
  owner: string;
  favorite?: boolean;
  shared?: boolean;
}

export interface WordBackstageSection {
  /** What the section says about this document. */
  body: string;
  /** The section's one action ("Print", "Copy link"). */
  action?: string;
  /** The confirmation shown when the action is done. */
  done?: string;
  /** The action returns to the document (New, Blank document). */
  back?: boolean;
  /** The action returns to File home (Open, Show recent). */
  home?: boolean;
}

export interface WordBackstage {
  backLabel: string;
  primaryNav: WordBackstageNavItem[];
  docNav: WordBackstageNavItem[];
  footerNav: WordBackstageNavItem[];
  /** Each navigation item's own page, by item id; Home is the default page and Close returns to the document. */
  sections?: Record<string, WordBackstageSection>;
  heroHeading: string;
  promptPlaceholder: string;
  createLabel: string;
  suggestions: string[];
  newHeading: string;
  moreTemplates: string;
  cloudNotice: string;
  cloudLink: string;
  templates: WordBackstageTemplate[];
  recommendedHeading: string;
  recommended: WordRecommendedCard[];
  tabs: { id: 'recent' | 'favorites' | 'shared'; label: string }[];
  searchPlaceholder: string;
  filterLabel: string;
  columns: { name: string; modified: string; owner: string };
  files: WordRecentFile[];
}

export interface WordRecord {
  documentName: string;
  saveState: string;
  user: string;
  /** Ribbon tabs; each tab but Home carries its own groups (Home's are home). */
  tabs: { id: string; label: string; groups?: WordGroup[] }[];
  home: WordGroup[];
  styleSets?: WordStyleSet[];
  copilotPane?: WordCopilotPane;
  backstage?: WordBackstage;
  document: WordBlock[];
  comments: WordComment[];
  status: { page: string; words: string; language: string; predictions: string; accessibility: string; zoom: string };
  copy: Record<string, string>;
}
