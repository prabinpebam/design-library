/** One ribbon command: a stacked lead command, an icon command (optionally with a menu chevron), or a value field. */
export interface WordCommand {
  label: string;
  /** Explicit multi-line stacked caption lines when a ribbon wraps at a specific break. */
  lines?: string[];
  /** Icon name from core or the template's custom icon pack. */
  icon?: string;
  /** labelled: a small icon with its name beside it; pen: a tall drawing tool; style-gallery: inline style-set thumbnail strip; separator: thin line between sets. */
  kind?: 'stacked' | 'icon' | 'labelled' | 'field' | 'separator' | 'pen' | 'style-gallery';
  /** A field's current value ("Aptos (Body)", "11"). */
  value?: string;
  /** A field's width class: `wide` for a font name, `narrow` for a size. */
  width?: 'wide' | 'narrow';
  /** A split command with a menu of options. */
  menu?: boolean;
  /** A toggle that's on (left alignment). */
  pressed?: boolean;
  /** Unavailable in the current selection state (Cut, Copy, Sensitivity on an empty selection). */
  disabled?: boolean;
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
  /** Lead commands placed after an inline gallery (Colors, Fonts in Design). */
  trailLead?: WordCommand[];
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
