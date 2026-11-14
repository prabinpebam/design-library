import type { FormEvent, MouseEvent, Ref } from 'react';
import { ScrollArea, type DataAttributes } from '@design-library/core/components';
import type { WfBlock } from '../../types';

const tags: Record<WfBlock['style'], string> = { title: 'h1', 'heading-1': 'h2', 'heading-2': 'h3', body: 'p', quote: 'blockquote' };
/** The document's headings (its outline), its first Heading 1, and its page breaks, inside the surface. */
export const HEADS = ':scope > :is(h1, h2, h3)';
export const FIRST_HEADING = ':scope > h2';
export const BREAKS = ':scope > hr[data-break]';
/** What the Insert tool puts at the caret, by its value. */
export const inserts: Record<string, string> = {
  table: `<table><tbody>${'<tr>'.concat('<td><br></td>'.repeat(3), '</tr>').repeat(3)}</tbody></table><p><br></p>`,
  'page-break': '<hr data-break=""><p><br></p>',
  line: '<hr><p><br></p>',
};
/** Puts an Insert tool's block after `block`, a direct child of the surface (as Word does at a block's end, never nested in a heading); returns the empty paragraph after it, for the caret. */
export function insertBlockAfter(block: HTMLElement, what: string): HTMLElement | null {
  const t = document.createElement('template');
  t.innerHTML = inserts[what];
  const last = t.content.lastElementChild as HTMLElement | null;
  block.after(t.content);
  return last;
}
/** Fills the surface with the record's blocks, each as the tag its style names. */
export function fillDocument(ed: HTMLElement, blocks: WfBlock[]) {
  ed.replaceChildren(...blocks.map((b) => {
    const n = document.createElement(tags[b.style]);
    n.textContent = b.text;
    return n;
  }));
}

export interface PageProps extends DataAttributes {
  /** Names the canvas region. */
  label: string;
  /** Names the document's editing surface. */
  documentLabel: string;
  /** The editing element, filled and owned by the app (core `useRichText`). */
  docRef: Ref<HTMLDivElement>;
  /** Core `useRichText(...).surface`, spread on the editing element. */
  surface: { contentEditable: true; suppressContentEditableWarning: true; role: 'textbox'; 'aria-multiline': true; onInput: (e: FormEvent<HTMLElement>) => void };
  /** Read mode: the document can't be changed. */
  readOnly?: boolean;
  /** Zoom as a share of 1: 0.5, 0.75, 1, 1.25, 1.5 or 2. */
  zoom: number;
  margins?: string;
  orientation?: string;
  columns?: string;
  /** Shows a pilcrow at the end of each paragraph. */
  marks?: boolean;
  /** A press on the canvas around the page: lets go of the selection, as a design tool's canvas does. */
  onCanvasPress?: () => void;
}

/**
 * The document on a design tool's canvas: the sheet, centred on the canvas grey and zoomed, holding the rich-text
 * surface. The surface's blocks are styled by tag (title, headings, body, quote, lists, tables, page breaks).
 * @tier compound
 * @family word-figma
 * @a11y The canvas is a named scroll region; the surface is core's named multiline textbox.
 */
export function Page({ label, documentLabel, docRef, surface, readOnly, zoom, margins, orientation, columns, marks, onCanvasPress, ...data }: PageProps) {
  const press = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCanvasPress?.();
  };
  return (
    <div data-dl="word-figma-canvas">
    <ScrollArea axis="both" surface="sunken" label={label}>
      {/* the canvas around the page: pressing it deselects; the keyboard path is Escape */}
      <div data-dl="word-figma-page" onMouseDown={press} {...data}>
        <article data-dl-part="sheet" data-zoom={String(Math.round(zoom * 100))} data-margins={margins} data-orientation={orientation} data-columns={columns}>
          <div ref={docRef} data-dl-part="doc" data-marks={marks ? '' : undefined} {...surface} contentEditable={!readOnly} aria-readonly={readOnly || undefined} aria-label={documentLabel} spellCheck={false} />
        </article>
      </div>
    </ScrollArea>
    </div>
  );
}
