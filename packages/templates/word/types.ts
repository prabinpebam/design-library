/** One ribbon command: a stacked lead command, an icon command (optionally with a menu chevron), or a value field. */
export interface WordCommand {
  label: string;
  /** A core icon name. */
  icon?: string;
  kind?: 'stacked' | 'icon' | 'field';
  /** A field's current value ("Aptos (Body)", "12"). */
  value?: string;
  /** A field's width class: `wide` for a font name, `narrow` for a size. */
  width?: 'wide' | 'narrow';
  /** A split command with a menu of options. */
  menu?: boolean;
  /** A toggle that's on (left alignment). */
  pressed?: boolean;
}
export interface WordGroup {
  id: string;
  label: string;
  launcher?: string;
  /** Lead commands stacked at the group's start (Paste). */
  lead?: WordCommand[];
  /** Rows of commands beside the lead ones. */
  rows?: WordCommand[][];
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
export interface WordRecord {
  documentName: string;
  saveState: string;
  user: string;
  tabs: { id: string; label: string }[];
  home: WordGroup[];
  document: WordBlock[];
  comments: WordComment[];
  status: { page: string; words: string; language: string; predictions: string; accessibility: string; zoom: string };
  copy: Record<string, string>;
}
