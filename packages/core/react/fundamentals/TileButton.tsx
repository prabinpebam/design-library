import type { MouseEvent, ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface TileButtonProps extends DataAttributes {
  /** The tile's name, as a person would say it ("Harbour at dusk, columns 1 to 6, rows 1 to 4"). Its accessible name. */
  label: string;
  /** What the tile shows: a picture (`Image ratio="fill"`), a swatch, a thumbnail. Decorative to assistive technology. */
  children: ReactNode;
  /** Chosen (`aria-pressed`): an inset accent ring. Leave out for a tile that only acts. */
  pressed?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

/**
 * A bare pressable tile (LR40): a button with no chrome of its own that fills its holder and holds what it shows (a
 * picture, a swatch), for things chosen by their look on a grid: a cover's tiles, colour samples, thumbnails. Its
 * corners are its holder's; the focus ring and the chosen ring sit inside its edge, so a grid with no gap never clips
 * them. For an action with words use Button; for choosing pictures from a set use ImageGrid `selectable`.
 * @tier fundamental
 * @family buttons
 * @a11y A `button` named by `label` (its content is hidden from assistive technology), with `aria-pressed` when it is
 * chosen. The focus ring is the library's, drawn inside the edge.
 * @key Enter or Space: presses it
 */
export function TileButton({ label, children, pressed, onClick, onKeyDown, disabled = false, ...data }: TileButtonProps) {
  return (
    <button type="button" {...data} data-dl="tile-button" aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick} onKeyDown={onKeyDown}>
      <span data-dl-part="content" aria-hidden="true">{children}</span>
    </button>
  );
}
