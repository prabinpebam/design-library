import { useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type ReactNode } from 'react';
import { Badge, type BadgeTone } from '../fundamentals/Badge';
import { Checkbox } from '../fundamentals/Checkbox';
import { Image, type PictureSource, type PictureTreatment, type SchemeSources } from '../fundamentals/Image';
import type { PictureReveal } from '../behaviour/reveal';
import type { DataAttributes } from '../types';
import { formatDuration, spokenDuration } from './MediaPlayer';

/** A word or two over a picture: a state the set's owner should see at a glance ("Cover", "Needs a description"). */
export interface ImageGridBadge {
  label: string;
  /** As Badge's `tone`; the words always say it too. Default `neutral`. */
  tone?: BadgeTone;
}

export interface ImageGridItem extends SchemeSources {
  /** Stable key. Also what `selected` and `onSelectionChange` name the item by. */
  id: string;
  /** The picture's address (for a video, its poster: a still from it). */
  src: string;
  /** What the picture shows. Also the name of its button when the grid opens pictures. */
  alt: string;
  /** The picture's own width and height in pixels: `justified` and `masonry` keep its shape from them. */
  width?: number;
  height?: number;
  /** In `quilted`, a picture that takes two columns (`wide`), two rows (`tall`) or both (`large`). */
  span?: 'wide' | 'tall' | 'large';
  /** As `Image`: its tone, or one at rest and one while hovered or focused (grey until pointed at). */
  treatment?: PictureTreatment;
  /** As `Image`: the paired picture shown while it's hovered or focused. */
  alternate?: string | PictureSource;
  /** As `Image`: draws the change to `alternate` yourself (a template's reveal preset). */
  reveal?: PictureReveal;
  /** Words under the picture, in `standard` and `masonry` (quilted and justified tiles leave them out). */
  caption?: string;
  /** Who made it, after the caption. */
  credit?: string;
  /** As `Image`: the point kept in view where a frame crops. */
  focal?: { x: number; y: number };
  /** As `Image`: shapes drawn over the picture (a template's framing art). */
  decoration?: ReactNode;
  /** As `Image`: shapes drawn behind the picture. */
  under?: ReactNode;
  /** As `Image`: room kept around the picture for its art, so the art stays in the item's own box. */
  room?: string;
  /** Badges at the picture's top end corner, read after its description. */
  badges?: ImageGridBadge[];
  /** `video`: the picture is a video's poster, marked as MediaPlayer marks one (a play mark and its length). Default `picture`. */
  kind?: 'picture' | 'video';
  /** A video's length in seconds, shown on its poster and spoken in its name. */
  duration?: number;
}

/** How a selection change was made: `range` (Shift: from the last item chosen to this one), `toggle` (the check box, Ctrl or Cmd: this one in or out). Neither: a plain press chose this one alone. */
export interface ImageGridSelectionChange {
  range: boolean;
  toggle: boolean;
}

export interface ImageGridProps extends DataAttributes {
  /** The pictures, in reading order. */
  items: ImageGridItem[];
  /**
   * `standard`: equal frames in rows (default). `quilted`: square cells, some pictures across two (a feature). `masonry`:
   * columns of whole pictures, each its own height. `justified`: rows of whole pictures at one height, filling the width.
   */
  layout?: 'standard' | 'quilted' | 'masonry' | 'justified';
  /** In `standard`, the frames' shape. */
  ratio?: 'wide' | 'photo' | 'square' | 'portrait';
  /** Makes each picture a button that opens it, with its index (for a Lightbox). */
  onSelect?: (index: number) => void;
  /** What the set is: names the list for screen readers ("Photos from the trip"). */
  label: string;
  /**
   * The pictures carry framing art (items' `under`, `decoration` and `room`): the gap is `--c-image-grid-framed-gap`
   * (default the usual gap; each picture keeps its art in its own box).
   */
  framed?: boolean;
  /**
   * Pictures can be chosen (an editor's album, a picker): each gets a check box at its top start corner, shown while the
   * picture is pointed at or focused and whenever any is chosen (always on touch screens). A press on a picture chooses
   * it alone, Ctrl or Cmd adds or takes it out, Shift chooses the run from the last one chosen; with `onSelect` a plain
   * press opens it instead, and choosing is the check box's (or the modifier keys').
   */
  selectable?: boolean;
  /** The chosen items' ids (with `selectable`): each gets the selection outline and a checked box. */
  selected?: string[];
  /** The chosen ids after a press, with how it was made. */
  onSelectionChange?: (ids: string[], how: ImageGridSelectionChange) => void;
  /**
   * Makes the pictures draggable (an editor dragging them somewhere else, such as into a cover): a drag carries the
   * chosen items, in the grid's order, when it starts on a chosen one, else the one under the pointer. Called with those
   * ids and the drag event (put the ids on `event.dataTransfer` under your own type); the dragged items dim until the
   * drag ends. The drag allows a move. Off by default.
   */
  onItemsDragStart?: (ids: string[], event: DragEvent<HTMLLIElement>) => void;
  /** The drag that `onItemsDragStart` began ended (dropped or cancelled). */
  onItemsDragEnd?: (event: DragEvent<HTMLLIElement>) => void;
}

/**
 * A set of pictures arranged as one: equal frames, a quilt with features, masonry columns or justified rows. Each layout
 * keeps every column at least `c.image-grid.min` wide and falls to fewer as the place narrows, so nothing scrolls
 * sideways. With `onSelect`, a picture opens (into a Lightbox). With `selectable`, pictures are chosen with a check box
 * each (an album being edited). With `onItemsDragStart`, pictures (the chosen ones together) drag out of the grid.
 * Items can carry badges, and a video's poster its play mark and length. For pictures one
 * at a time use Carousel.
 * @tier compound
 * @family content
 * @a11y A list named by `label`; each picture keeps its own alternative text, followed by its badges and, for a video,
 * "video" and its spoken length. With `onSelect` each is a button named "Open: " and that name, in reading order; the
 * focus ring sits inside the picture's corners. With `selectable` each has a check box named "Select: " and that name,
 * its own Tab stop after the picture's button; the check box carries the choice, the outline only shows it. Masonry
 * reads down each column, so use it only where order doesn't matter.
 * @key Tab: the next picture or check box
 * @key Enter, Space: open the picture; Space on a check box chooses it or takes it out
 */
export function ImageGrid({ items, layout = 'standard', ratio = 'photo', onSelect, label, framed, selectable, selected = [], onSelectionChange, onItemsDragStart, onItemsDragEnd, ...data }: ImageGridProps) {
  const [dragging, setDragging] = useState<string[]>([]);
  const dragStart = (id: string, event: DragEvent<HTMLLIElement>) => {
    const ids = selectable && selected.includes(id) ? items.filter((item) => selected.includes(item.id)).map((item) => item.id) : [id];
    event.dataTransfer.effectAllowed = 'move';
    setDragging(ids);
    onItemsDragStart?.(ids, event);
  };
  const dragEnd = (event: DragEvent<HTMLLIElement>) => {
    setDragging([]);
    onItemsDragEnd?.(event);
  };
  // Captions sit under their pictures where each picture has its own row of space; quilted and justified tiles fill
  // their cells by shape, so they leave captions out.
  const captioned = layout === 'standard' || layout === 'masonry';
  const anchor = useRef(-1);
  const shiftOnCheck = useRef(false);
  const choose = (i: number, how: ImageGridSelectionChange) => {
    const id = items[i]!.id;
    let next: string[];
    if (how.range && anchor.current >= 0) {
      const [lo, hi] = anchor.current < i ? [anchor.current, i] : [i, anchor.current];
      const run = items.slice(lo, hi + 1).map((item) => item.id);
      next = [...selected, ...run.filter((one) => !selected.includes(one))];
    } else {
      next = how.toggle ? (selected.includes(id) ? selected.filter((one) => one !== id) : [...selected, id]) : [id];
      anchor.current = i;
    }
    onSelectionChange?.(next, how);
  };
  // A press on the picture itself: modifier keys choose; a plain press opens (with onSelect) or chooses it alone.
  const press = (i: number, event: MouseEvent) => {
    const range = event.shiftKey;
    const toggle = event.ctrlKey || event.metaKey;
    if (selectable && (range || toggle || !onSelect)) {
      event.preventDefault();
      choose(i, { range, toggle: toggle && !range });
      return;
    }
    onSelect?.(i);
  };
  return (
    <ul
      {...data}
      data-dl="image-grid"
      data-layout={layout}
      data-framed={framed ? '' : undefined}
      data-selectable={selectable ? '' : undefined}
      data-selecting={selectable && selected.length ? '' : undefined}
      aria-label={label}
    >
      {items.map((item, i) => {
        const shape = item.width && item.height ? ({ '--w': item.width, '--h': item.height } as CSSProperties) : undefined;
        const words = captioned && (item.caption || item.credit) ? { caption: item.caption, credit: item.credit } : undefined;
        const video = item.kind === 'video';
        const badges = item.badges?.length ? item.badges : undefined;
        const marked = selectable || video || !!badges;
        const interactive = !!onSelect || !!selectable;
        const name = [item.alt, ...(badges ?? []).map((b) => b.label), ...(video ? [item.duration ? `video, ${spokenDuration(item.duration)}` : 'video'] : [])].join(', ');
        const isSelected = !!selectable && selected.includes(item.id);
        const picture = (
          <Image
            src={item.src}
            dark={item.dark}
            contrast={item.contrast}
            alt={onSelect ? '' : item.alt}
            width={item.width}
            height={item.height}
            ratio={layout === 'standard' ? ratio : layout === 'quilted' ? 'square' : 'natural'}
            treatment={item.treatment}
            alternate={item.alternate}
            reveal={item.reveal}
            focal={item.focal}
            decoration={item.decoration}
            under={item.under}
            room={item.room}
            {...(onSelect || marked ? {} : words)}
          />
        );
        const open = onSelect && (
          <button type="button" data-dl-part="open" aria-label={`Open: ${marked ? name : item.alt}`} onClick={(event) => press(i, event)}>
            {picture}
          </button>
        );
        // Marks over the picture (a check box, badges, a video's play mark and length) share its one cell: the tile.
        const tile = marked && (
          <div data-dl-part="tile" onClick={selectable && !onSelect ? (event) => press(i, event) : undefined}>
            {open || picture}
            {video && (
              <span data-dl-part="play" aria-hidden={interactive || undefined}>
                <Badge kind="icon" icon="play" tone="neutral" emphasis="strong" size="l" label={item.duration ? `video, ${spokenDuration(item.duration)}` : 'video'} />
              </span>
            )}
            {video && item.duration !== undefined && (
              <span data-dl-part="length" aria-hidden="true">
                <Badge emphasis="strong" tone="neutral" size="s">
                  {formatDuration(item.duration)}
                </Badge>
              </span>
            )}
            {(selectable || badges) && (
              <span data-dl-part="top">
                {selectable && (
                  <span
                    data-dl-part="check"
                    onClickCapture={(event) => void (shiftOnCheck.current = event.shiftKey)}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      label={`Select: ${name}`}
                      labelHidden
                      checked={isSelected}
                      onChange={() => choose(i, { range: shiftOnCheck.current, toggle: !shiftOnCheck.current })}
                    />
                  </span>
                )}
                {badges && (
                  <span data-dl-part="marks" aria-hidden={interactive || undefined}>
                    {badges?.map((b) => (
                      <Badge key={b.label} tone={b.tone ?? 'neutral'} emphasis="strong" size="s">
                        {b.label}
                      </Badge>
                    ))}
                  </span>
                )}
              </span>
            )}
          </div>
        );
        const shown = tile || open || picture;
        return (
          <li
            key={item.id}
            data-dl-part="item"
            data-span={layout === 'quilted' ? item.span : undefined}
            data-selected={isSelected ? '' : undefined}
            data-dragging={dragging.includes(item.id) ? '' : undefined}
            style={shape}
            {...(onItemsDragStart ? { draggable: true, onDragStart: (event: DragEvent<HTMLLIElement>) => dragStart(item.id, event), onDragEnd: dragEnd } : {})}
          >
            {(open || marked) && words ? (
              <figure data-dl="figure">
                {shown}
                <figcaption data-dl-part="caption">
                  {words.caption}
                  {words.credit && <span data-dl-part="credit">{words.credit}</span>}
                </figcaption>
              </figure>
            ) : (
              shown
            )}
          </li>
        );
      })}
    </ul>
  );
}
