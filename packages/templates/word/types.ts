/** One ribbon command: a stacked lead command, an icon command (optionally with a menu chevron), or a value field. */
export interface WordCommand {
  label: string;
  /** Explicit multi-line stacked caption lines when a ribbon wraps at a specific break. */
  lines?: string[];
  /** Icon name from core or the template's custom icon pack. */
  icon?: string;
  /** labelled: a small icon with its name beside it; pen: a tall drawing barrel; tool: a large centered drawing cursor/lasso; style-gallery: inline style-set thumbnail strip; labelled-field: an icon+label beside a select box; record-stepper: mail-merge record navigation; separator: thin line between sets. */
  kind?: 'stacked' | 'icon' | 'labelled' | 'field' | 'labelled-field' | 'record-stepper' | 'separator' | 'pen' | 'tool' | 'style-gallery';
  /** A field's current value ("Aptos (Body)", "11", "APA"). */
  value?: string;
  /** A field's width class: `wide` for a font name, `narrow` for a size, `medium` for a citation style. */
  width?: 'wide' | 'narrow' | 'medium';
  /** A split command with a menu of options. */
  menu?: boolean;
  /** A toggle that's on (left alignment). */
  pressed?: boolean;
  /** Unavailable in the current selection state (Cut, Copy, Sensitivity on an empty selection). */
  disabled?: boolean;
}
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
  style: 'title' | 'heading-1' | 'heading-2' | 'body';
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

export interface WordRecord {
  documentName: string;
  saveState: string;
  user: string;
  /** Ribbon tabs; each tab but Home carries its own groups (Home's are home). */
  tabs: { id: string; label: string; groups?: WordGroup[] }[];
  home: WordGroup[];
  styleSets?: WordStyleSet[];
  copilotPane?: WordCopilotPane;
  document: WordBlock[];
  comments: WordComment[];
  status: { page: string; words: string; language: string; predictions: string; accessibility: string; zoom: string };
  copy: Record<string, string>;
}
