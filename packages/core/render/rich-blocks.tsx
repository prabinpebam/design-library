/**
 * Rich text's blocks (LR179, DesignUp R1.11): the Markdown core's RichTextField writes, drawn with core parts. Beside
 * `RichText` (inline marks only): this one draws the whole text, block by block.
 *
 * - paragraphs (blank-line separated; a line break inside one stays as written) → Text
 * - `#` to `######` headings → Heading at `headingLevel`, each more `#` one level deeper (at most 6)
 * - `-`, `+`, `*` and `1.` items → List, bulleted or numbered; indented items nest
 * - `>` lines → Quote
 * - inline: `**bold**`, `*italic*` or `_italic_`, `~~strike~~`, `` `code` ``, `[words](address)` for a safe address
 *   (core's rich field's: a page, an in-page anchor, the web, mail or a phone; any other keeps its words, unlinked)
 *
 * Never raw HTML: every element is a core part or a plain inline element. A paragraph with no marks draws as plain Text,
 * so words written before any formatting look the same.
 */
import { Fragment, type ReactNode } from 'react';
import { Code, Heading, Link, List, Quote, Stack, Text } from '../react/components';
import { safeRichHref } from '../react/behaviour/rich-field';

export type RichBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; depth: number; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; ordered: boolean; items: RichListItem[] };
export interface RichListItem { text: string; list?: { ordered: boolean; items: RichListItem[] } }

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const QUOTE = /^>\s?(.*)$/;
const ITEM = /^([ \t]*)([-+*]|\d+[.)])\s+(.*)$/;
const indent = (space: string) => space.replace(/\t/g, '    ').length;

/** The text as blocks, in order. */
export function richBlocks(markdown: string): RichBlock[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: RichBlock[] = [];
  let at = 0;
  const list = (depth: number): { ordered: boolean; items: RichListItem[] } => {
    const ordered = /^\d/.test(ITEM.exec(lines[at])![2]);
    const items: RichListItem[] = [];
    while (at < lines.length) {
      const row = ITEM.exec(lines[at]);
      if (!row || indent(row[1]) < depth || (indent(row[1]) === depth && /^\d/.test(row[2]) !== ordered)) break;
      if (indent(row[1]) > depth && items.length) { items[items.length - 1].list = list(indent(row[1])); continue; }
      items.push({ text: row[3] });
      at++;
    }
    return { ordered, items };
  };
  const starts = (line: string) => HEADING.test(line) || QUOTE.test(line) || ITEM.test(line);
  while (at < lines.length) {
    const line = lines[at];
    if (!line.trim()) { at++; continue; }
    const heading = HEADING.exec(line);
    if (heading) { blocks.push({ kind: 'heading', depth: heading[1].length, text: heading[2] }); at++; continue; }
    if (QUOTE.test(line)) {
      const words: string[] = [];
      while (at < lines.length && QUOTE.test(lines[at])) words.push(QUOTE.exec(lines[at++])![1]);
      blocks.push({ kind: 'quote', text: words.join('\n').trim() });
      continue;
    }
    const item = ITEM.exec(line);
    if (item) { blocks.push({ kind: 'list', ...list(indent(item[1])) }); continue; }
    const words: string[] = [];
    while (at < lines.length && lines[at].trim() && !starts(lines[at])) words.push(lines[at++]);
    blocks.push({ kind: 'paragraph', text: words.join('\n') });
  }
  return blocks;
}

const INLINE = /\\([\\`*_[\]~()>#+\-.!])|\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)|\*\*(.+?)\*\*|~~(.+?)~~|`([^`]+)`|\*([^*\s](?:.*?[^*\s])?)\*|_([^_\s](?:.*?[^_\s])?)_/g;

/** Inline marks as core parts; words with no marks stay a plain string. */
export function richInline(text: string): ReactNode {
  const out: ReactNode[] = [];
  let at = 0, marked = false;
  INLINE.lastIndex = 0;
  for (let m = INLINE.exec(text); m; m = INLINE.exec(text)) {
    if (m.index > at) out.push(text.slice(at, m.index));
    const key = out.length;
    if (m[1] !== undefined) out.push(m[1]);
    else if (m[2] !== undefined) { marked = true; out.push(safeRichHref(m[3]) ? <Link key={key} href={m[3]}>{richInline(m[2])}</Link> : <Fragment key={key}>{richInline(m[2])}</Fragment>); }
    else if (m[4] !== undefined) { marked = true; out.push(<strong key={key}>{richInline(m[4])}</strong>); }
    else if (m[5] !== undefined) { marked = true; out.push(<del key={key}>{richInline(m[5])}</del>); }
    else if (m[6] !== undefined) { marked = true; out.push(<Code key={key}>{m[6]}</Code>); }
    else { marked = true; out.push(<em key={key}>{richInline(m[7] ?? m[8])}</em>); }
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return marked ? <>{out.map((part, n) => (typeof part === 'string' ? <Fragment key={`t${n}`}>{part}</Fragment> : part))}</> : out.join('');
}

function RichList({ list }: { list: { ordered: boolean; items: RichListItem[] } }) {
  return <List mode="static" variant={list.ordered ? 'numbered' : 'bulleted'} items={list.items.map((item, n) => ({
    id: String(n), content: item.list ? <>{richInline(item.text)}<RichList list={item.list} /></> : richInline(item.text),
  }))} />;
}

export interface RichBlocksProps {
  /** The Markdown, as RichTextField writes it (headings and quotes too). */
  value: string | undefined;
  /** The level a `#` heading takes in the page's outline (one under the section the text sits in). Default 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Rich text's blocks as core parts, one after another at the group gap (LR179). Not for a single run of words with
 * marks (use RichText) or for editing (RichTextField).
 */
export function RichBlocks({ value, headingLevel = 2 }: RichBlocksProps) {
  const blocks = richBlocks(value ?? '');
  if (!blocks.length) return null;
  return <Stack gap="group">{blocks.map((block, n) => {
    switch (block.kind) {
      case 'heading': {
        const level = Math.min(6, headingLevel + block.depth - 1) as 1 | 2 | 3 | 4 | 5 | 6;
        return <Heading key={n} level={level}>{richInline(block.text)}</Heading>;
      }
      case 'quote': return <Quote key={n}>{richInline(block.text)}</Quote>;
      case 'list': return <RichList key={n} list={block} />;
      default: return <Text key={n}>{richInline(block.text)}</Text>;
    }
  })}</Stack>;
}
