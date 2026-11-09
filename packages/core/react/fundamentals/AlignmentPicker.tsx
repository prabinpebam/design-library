import { useRef, type KeyboardEvent } from 'react';
import type { DataAttributes } from '../types';

/** Where along one axis: the start, the centre or the end. */
export type AlignmentPoint = 'start' | 'center' | 'end';

/** A box's alignment: across (`x`) and down (`y`). */
export interface Alignment {
  x: AlignmentPoint;
  y: AlignmentPoint;
}

export interface AlignmentPickerProps extends DataAttributes {
  /** Names the group: "Alignment". */
  label: string;
  value: Alignment;
  onChange: (next: Alignment) => void;
  /**
   * The nine points' names, row by row from the top start: "Top left" … "Bottom right". Defaults to English names for a
   * left-to-right canvas; pass the product's own words (from content) for anything else.
   */
  names?: string[];
  disabled?: boolean;
}

const points: AlignmentPoint[] = ['start', 'center', 'end'];
const englishNames = ['Top left', 'Top centre', 'Top right', 'Centre left', 'Centre', 'Centre right', 'Bottom left', 'Bottom centre', 'Bottom right'];

/**
 * Where a box's contents sit, chosen on a 3 by 3 grid of points, as in a design tool's auto layout. Each point is one
 * choice; the chosen one carries the accent mark, the others a quiet dot. The grid is one enclosure; its points stay
 * bare at rest.
 * Not for choosing among named options (use SegmentedControl or Select) or for a text's alignment (a SegmentedControl
 * of text-alignment icons).
 * @tier fundamental
 * @family selection
 * @a11y A `radiogroup` named by `label`; each point is a `radio` named by its place ("Top left"), checked when chosen.
 * One tab stop: the chosen point. Arrow keys move in two dimensions and choose as they move, as a radio group does.
 * Points are 24 px targets on a dense surface, by decision. Forced colours keep the chosen mark in Highlight.
 * @key Arrow keys: move to the neighbouring point and choose it
 * @key Home / End: the first or last point in the row
 */
export function AlignmentPicker({ label, value, onChange, names = englishNames, disabled = false, ...data }: AlignmentPickerProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = points.indexOf(value.y) * 3 + points.indexOf(value.x);
  const choose = (i: number) => {
    onChange({ x: points[i % 3], y: points[Math.floor(i / 3)] });
    refs.current[i]?.focus();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const rtl = (e.currentTarget as HTMLElement).closest('[dir]')?.getAttribute('dir') === 'rtl';
    const across = (d: number) => (rtl ? -d : d);
    const next =
      e.key === 'ArrowRight' ? row * 3 + Math.min(2, Math.max(0, col + across(1)))
      : e.key === 'ArrowLeft' ? row * 3 + Math.min(2, Math.max(0, col + across(-1)))
      : e.key === 'ArrowDown' ? Math.min(2, row + 1) * 3 + col
      : e.key === 'ArrowUp' ? Math.max(0, row - 1) * 3 + col
      : e.key === 'Home' ? row * 3
      : e.key === 'End' ? row * 3 + 2
      : -1;
    if (next < 0) return;
    e.preventDefault();
    if (next !== index) choose(next);
  };
  return (
    <div {...data} data-dl="alignment-picker" role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} onKeyDown={disabled ? undefined : onKeyDown}>
      {names.slice(0, 9).map((name, i) => (
        <button
          key={name}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === index}
          aria-label={name}
          tabIndex={i === index ? 0 : -1}
          disabled={disabled}
          data-dl-part="point"
          onClick={() => choose(i)}
        />
      ))}
    </div>
  );
}
