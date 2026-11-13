import type { FormEvent, MouseEvent, Ref } from 'react';
import { ScrollArea, type DataAttributes } from '@design-library/core/components';

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
