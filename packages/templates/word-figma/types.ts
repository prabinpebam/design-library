/** The word-figma template's record (Q161): a word processor's document and functions, in a design tool's chrome. */
import type { IconName } from '@design-library/core/components';

/** One main-menu entry; an entry with `items` opens a submenu (File, Edit, View …). */
export interface WfMenuItem {
  value: string;
  label: string;
  shortcut?: string;
  startsGroup?: boolean;
  items?: { value: string; label: string; shortcut?: string; startsGroup?: boolean }[];
}

/** A tool in the bar; `menu` makes it a flyout (Insert's table, page break, date …). */
export interface WfTool {
  value: string;
  label: string;
  icon: IconName;
  menu?: { value: string; label: string; icon: IconName }[];
}

export interface WfOption {
  value: string;
  label: string;
  icon?: IconName;
}

/** A block of the document: its paragraph style and its words. */
export interface WfBlock {
  style: 'title' | 'heading-1' | 'heading-2' | 'body' | 'quote';
  text: string;
}

export interface WfComment {
  author: string;
  time: string;
  text: string;
}

/** A comment thread, pinned to the words it's about (`anchor`). */
export interface WfThread extends WfComment {
  id: string;
  anchor: string;
  replies: WfComment[];
  resolved?: boolean;
}

export interface WordFigmaRecord {
  /** The document's name and its project, at the top of the left panel. */
  file: string;
  project: string;
  people: { name: string; presence?: 'available' | 'away' }[];
  /** Who writes new comments and replies in the example. */
  me: string;
  menu: WfMenuItem[];
  tools: WfTool[];
  /** The mode switch at the bar's end: Edit, Read. */
  modes: WfOption[];
  /** Zoom steps, as shares of 1. */
  zooms: number[];
  /** Font families the Text section offers. */
  fonts: string[];
  /** Font sizes in points the size field lists. */
  sizes: number[];
  /** Paragraph styles, by the tag they set: `p`, `h1`, `h2`, `h3`, `blockquote`. */
  styles: WfOption[];
  /** Text colours and highlights: a name and a CSS colour (the document's own palette, not interface colours). */
  colours: WfOption[];
  highlights: WfOption[];
  lineHeights: number[];
  alignments: WfOption[];
  lists: WfOption[];
  cases: WfOption[];
  margins: WfOption[];
  orientations: WfOption[];
  columns: WfOption[];
  document: WfBlock[];
  threads: WfThread[];
  /** Every interface word; `{name}` marks a value filled in. */
  copy: Record<string, string>;
}
