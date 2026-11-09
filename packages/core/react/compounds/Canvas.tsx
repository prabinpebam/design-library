import { type CSSProperties } from 'react';
import type { DataAttributes } from '../types';

export interface CanvasShape {
  id: string;
  /** Its name, as in the layers: "Header", "Sign in button". Names it for assistive technology. */
  label: string;
  kind: 'frame' | 'rectangle' | 'ellipse' | 'text';
  /** Position and size in the document's own units (CSS pixels at 100 %), relative to its frame or the canvas. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** The words of a text shape. */
  text?: string;
  /** A rectangle's or ellipse's fill: one of the eight category colours (1–8). None: the raised surface. */
  category?: number;
  /** The shapes inside a frame, positioned from its top-left corner. */
  children?: CanvasShape[];
  /** How the document draws it, as a design tool's inspector sets it (F15.T2): the document's own values, not the UI's. */
  look?: CanvasLook;
}

/** A shape's look in the document: its own fill and stroke colours (hex), corner radius, opacity and rotation. */
export interface CanvasLook {
  /** A solid fill, `#rrggbb`; overrides `category`. */
  fill?: string;
  /** 0 to 1. */
  opacity?: number;
  /** Corners, in document units. */
  radius?: number;
  /** Degrees, clockwise. */
  rotation?: number;
  /** An inside stroke, `#rrggbb`, with its weight in document units. */
  stroke?: string;
  strokeWeight?: number;
  /** Hidden in the document (still listed in the layers). */
  hidden?: boolean;
}

export interface CanvasProps extends DataAttributes {
  /** Names the canvas: the file's or page's name. */
  label: string;
  shapes: CanvasShape[];
  /** The selected shape's id: drawn with the accent outline, its handles and its size. */
  selected?: string;
  /** A shape was chosen; `undefined` when the empty canvas was pressed. */
  onSelect?: (id: string | undefined) => void;
  /** 1 is 100 %. Scales the document, not the canvas's own chrome (names, handles, size). */
  zoom?: number;
  /** The document's extent in its own units, so the canvas can scroll to every shape. */
  width: number;
  height: number;
  /** `fill` takes the room its parent gives it (an editor's working area); `md` holds a set height (a demonstration). */
  size?: 'fill' | 'md';
}

const px = (n: number, zoom: number) => `${n * zoom}px`;

/**
 * A design document drawn from data: frames with their names above them, and rectangles, ellipses and text inside,
 * at a zoom, in a surface that scrolls both ways. Pressing a shape selects it; the selected one shows the accent
 * outline, corner handles and its size. For an editor's working area or a preview of a layout drawn as boxes. Not for
 * charts (StackedBar) or pictures (Image).
 * @tier compound
 * @family media
 * @a11y The canvas is a labelled, focusable scroll region. Each shape is a button named by its kind and name with
 * `aria-pressed` for the selection, so it can be reached and chosen without a pointer; a frame's name above it is a
 * button for the frame. The size under a selection is text. Shapes' colours carry no meaning of their own.
 */
export function Canvas({ label, shapes, selected, onSelect, zoom = 1, width, height, size = 'fill', ...data }: CanvasProps) {
  const draw = (list: CanvasShape[], depth: number) =>
    list.map((s) => {
      const isSelected = s.id === selected;
      const l = s.look ?? {};
      const box = {
        '--x': px(s.x, zoom),
        '--y': px(s.y, zoom),
        '--w': px(s.width, zoom),
        '--h': px(s.height, zoom),
        ...(l.fill && { '--doc-fill': l.fill }),
        ...(l.opacity !== undefined && { '--doc-opacity': String(l.opacity) }),
        ...(l.radius !== undefined && { '--doc-radius': px(l.radius, zoom) }),
        ...(l.rotation && { '--doc-rotate': `${l.rotation}deg` }),
        ...(l.stroke && l.strokeWeight && { '--doc-stroke': l.stroke, '--doc-stroke-weight': px(l.strokeWeight, zoom) }),
      } as CSSProperties;
      return (
        <div key={s.id} data-dl-part="place" data-kind={s.kind} data-hidden={l.hidden || undefined} style={box}>
          {s.kind === 'frame' && depth === 0 && (
            <button type="button" data-dl-part="name" tabIndex={-1} onClick={() => onSelect?.(s.id)}>
              {s.label}
            </button>
          )}
          <button
            type="button"
            data-dl-part="shape"
            data-kind={s.kind}
            data-category={s.category}
            aria-label={`${s.kind[0].toUpperCase()}${s.kind.slice(1)}: ${s.label}`}
            aria-pressed={isSelected}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(s.id);
            }}
          >
            {s.kind === 'text' && <span data-dl-part="text">{s.text}</span>}
          </button>
          {s.children && s.children.length > 0 && <div data-dl-part="inside">{draw(s.children, depth + 1)}</div>}
          {isSelected && (
            <span data-dl-part="selection" aria-hidden="true">
              <span data-dl-part="handle" data-at="start-start" />
              <span data-dl-part="handle" data-at="start-end" />
              <span data-dl-part="handle" data-at="end-start" />
              <span data-dl-part="handle" data-at="end-end" />
              <span data-dl-part="size">
                {s.width} × {s.height}
              </span>
            </span>
          )}
        </div>
      );
    });

  return (
    <div {...data} data-dl="canvas" data-size={size} role="region" aria-label={label} tabIndex={0} onClick={() => onSelect?.(undefined)}>
      <div data-dl-part="document" style={{ '--w': px(width, zoom), '--h': px(height, zoom) } as CSSProperties}>
        {draw(shapes, 0)}
      </div>
    </div>
  );
}
