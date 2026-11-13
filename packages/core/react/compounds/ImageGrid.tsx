import { useEffect, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type ReactNode } from 'react';
import { Badge, type BadgeTone } from '../fundamentals/Badge';
import { Checkbox } from '../fundamentals/Checkbox';
import { Image, type PictureSource, type PictureTreatment, type SchemeSources } from '../fundamentals/Image';
import { Icon } from '../fundamentals/Icon';
import { Progress } from '../fundamentals/Progress';
import { Skeleton } from '../fundamentals/Skeleton';
import type { PictureReveal } from '../behaviour/reveal';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';
import { formatDuration, spokenDuration } from './MediaPlayer';
import { useRouter } from '../behaviour/router';

/** A word or two over a picture: a state the set's owner should see at a glance ("Cover", "Needs a description"). */
export interface ImageGridBadge {
  label: string;
  /** As Badge's `tone`; the words always say it too. Default `neutral`. */
  tone?: BadgeTone;
  /**
   * LR120 (opt-in): the badge is this icon alone, a small round mark (as the play mark), with `label` as its spoken
   * name, read in the tile's name. For what an item is at a glance (a video, its source). Default none: the words.
   */
  icon?: IconName;
}

export interface ImageGridItem extends SchemeSources {
  /** Stable key. Also what `selected` and `onSelectionChange` name the item by. */
  id: string;
  /** Opens the whole tile as a native link, instead of the `onSelect` lightbox button. Selection controls stay separate. */
  href?: string;
  /** The picture's address (for a video, its poster: a still from it). */
  src: string;
  /** As Image: a second address tried once if the picture fails to load. Default none. */
  fallbackSrc?: string;
  /** As Image: cover crops to fill the frame (default); contain keeps the whole picture. */
  fit?: 'cover' | 'contain';
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
  /** A video's length in seconds, shown at the poster's foot (with or without `kind: 'video'`'s play mark) and spoken in its name. */
  duration?: number;
  /**
   * The picture is still arriving (an upload): a Progress bar across the foot of its tile, named "Uploading: " and its
   * description. A number is the share done, 0-100, as Progress's `value`, from a real total; `indeterminate` while the
   * total isn't known (the server is working). Left out, no bar.
   */
  progress?: number | 'indeterminate';
  /**
   * LR71 (opt-in): a short line inside the tile, at its foot (over the upload bar when there is one): a file's name while
   * it arrives, or why it was refused. Read with the picture's name. `statusTone="danger"` marks a refusal.
   */
  status?: string;
  statusTone?: 'neutral' | 'danger';
  /**
   * LR71 (opt-in): a file that isn't a picture yet (uploading, or refused): the tile is a blank surface at the grid's
   * ratio with this icon in its middle (in the danger colour with `statusTone="danger"`), in place of `src`.
   */
  blank?: IconName;
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
  /**
   * The pictures can be put in order by dragging them within the grid (an album being arranged): the dragged items (the
   * chosen ones together, as `onItemsDragStart`) go just before the item under the pointer, or the one after it when the
   * pointer is past its middle, else at the end. While dragging, the grid draws a line in the gap on the start edge of
   * the item they'd go before (past the last item for the end). Only drags that began in this grid are taken; a drop on
   * one of the dragged items does nothing. Give a keyboard way too (Move earlier, Move later). Off by default.
   */
  reorderable?: boolean;
  /** The dragged ids (in grid order) dropped just before `before`, or at the end when it's `null`. */
  onReorder?: (ids: string[], before: string | null) => void;
  /**
   * Files dragged in from outside (the desktop) land where they're dropped (an album being filled): the grid marks the
   * same line and takes the same place as a reorder (before the item under the pointer, the next one past its middle,
   * else the end), and offers a copy. Called with the files and the id they go before, or `null` for the end. Off by
   * default.
   */
  onDropFiles?: (files: File[], before: string | null) => void;
  /**
   * With `onDropFiles`, files dropped anywhere else on the page (outside a dialog, and not taken by something else first)
   * land at the end, the end marked while they're over the page. For the one grid a screen fills. Off by default.
   */
  dropFilesAnywhere?: boolean;
  /**
   * LR66 (opt-in): the pictures are loading. This many frames of shimmer (core Skeleton, block) stand in the grid's own
   * layout and ratio in place of `items`, so nothing moves when the pictures arrive. The list is `aria-busy`; the region
   * around it still says once what is loading.
   */
  loading?: number;
}

type PageDragEvent = globalThis.DragEvent;
const carriesFiles = (event: { dataTransfer: DataTransfer | null }) => !!event.dataTransfer?.types.includes('Files');

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
 * reads down each column, so use it only where order doesn't matter. An item's href makes its tile a native link,
 * followed with Enter; selection controls remain separate siblings.
 * @key Tab: the next picture or check box
 * @key Enter, Space: open the picture; Space on a check box chooses it or takes it out
 */
export function ImageGrid({ items, layout = 'standard', ratio = 'photo', onSelect, label, framed, selectable, selected = [], onSelectionChange, onItemsDragStart, onItemsDragEnd, reorderable, onReorder, onDropFiles, dropFilesAnywhere, loading, ...data }: ImageGridProps) {
  const router = useRouter();
  const [dragging, setDragging] = useState<string[]>([]);
  // LR55: where the dragged items would land: before this item's id, or `null` for the end; undefined while not over the grid.
  const [drop, setDrop] = useState<string | null | undefined>(undefined);
  const draggable = !!onItemsDragStart || !!reorderable;
  const takesDrops = !!reorderable || !!onDropFiles;
  // LR74: the latest handler, for the page-wide listener set up once.
  const filesIn = useRef(onDropFiles);
  filesIn.current = onDropFiles;
  const anywhere = !!onDropFiles && !!dropFilesAnywhere;
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!anywhere) return;
    let over = 0;
    const taken = (event: PageDragEvent) =>
      carriesFiles(event) && !event.defaultPrevented && event.target instanceof Element && !event.target.closest('dialog');
    const enter = (event: PageDragEvent) => {
      if (carriesFiles(event)) over++;
    };
    const leave = (event: PageDragEvent) => {
      if (carriesFiles(event) && --over <= 0) {
        over = 0;
        setDrop(undefined);
      }
    };
    const overPage = (event: PageDragEvent) => {
      if (!taken(event)) {
        // Taken by something else (another grid, a field): the end isn't where they'd go.
        if (carriesFiles(event) && !(event.target instanceof Node && list.current?.contains(event.target))) setDrop(undefined);
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      setDrop(null);
    };
    const dropOnPage = (event: PageDragEvent) => {
      if (!carriesFiles(event)) return;
      over = 0;
      setDrop(undefined);
      if (!taken(event)) return;
      event.preventDefault();
      const files = [...(event.dataTransfer?.files ?? [])];
      if (files.length) filesIn.current?.(files, null);
    };
    document.addEventListener('dragenter', enter);
    document.addEventListener('dragleave', leave);
    document.addEventListener('dragover', overPage);
    document.addEventListener('drop', dropOnPage);
    return () => {
      document.removeEventListener('dragenter', enter);
      document.removeEventListener('dragleave', leave);
      document.removeEventListener('dragover', overPage);
      document.removeEventListener('drop', dropOnPage);
    };
  }, [anywhere]);
  const dragStart = (id: string, event: DragEvent<HTMLLIElement>) => {
    const ids = selectable && selected.includes(id) ? items.filter((item) => selected.includes(item.id)).map((item) => item.id) : [id];
    event.dataTransfer.effectAllowed = 'move';
    if (!onItemsDragStart) event.dataTransfer.setData('application/x-dl-image-grid', ids.join('\n'));
    setDragging(ids);
    onItemsDragStart?.(ids, event);
  };
  const dragEnd = (event: DragEvent<HTMLLIElement>) => {
    setDragging([]);
    setDrop(undefined);
    onItemsDragEnd?.(event);
  };
  const overItem = (i: number, event: DragEvent<HTMLLIElement>) => {
    const files = !dragging.length && !!onDropFiles && carriesFiles(event);
    if (!files && (!reorderable || !dragging.length)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = files ? 'copy' : 'move';
    const r = event.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const past = rtl ? event.clientX < r.left + r.width / 2 : event.clientX > r.left + r.width / 2;
    const next = past ? (items[i + 1]?.id ?? null) : items[i]!.id;
    if (next !== drop) setDrop(next);
  };
  const dropOnGrid = (event: DragEvent<HTMLUListElement>) => {
    if (!dragging.length && onDropFiles && carriesFiles(event)) {
      event.preventDefault();
      const before = drop ?? null;
      setDrop(undefined);
      const files = [...event.dataTransfer.files];
      if (files.length) onDropFiles(files, before);
      return;
    }
    if (!reorderable || !dragging.length || drop === undefined) return;
    event.preventDefault();
    const ids = dragging;
    const before = drop;
    setDrop(undefined);
    if (before !== null && ids.includes(before)) return;
    onReorder?.(ids, before);
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
    if (selectable && (range || toggle || (!onSelect && !items[i].href))) {
      event.preventDefault();
      choose(i, { range, toggle: toggle && !range });
      return;
    }
    if (!items[i].href) onSelect?.(i);
  };
  if (loading !== undefined) {
    // LR66: the grid as it will be, its frames in shimmer, so nothing moves when the pictures arrive.
    const shape = layout === 'standard' ? ratio : layout === 'quilted' ? 'square' : 'photo';
    return (
      <ul {...data} data-dl="image-grid" data-layout={layout} data-framed={framed ? '' : undefined} aria-label={label} aria-busy="true">
        {Array.from({ length: Math.max(1, loading) }, (_, i) => (
          <li key={i} data-dl-part="item">
            <Skeleton shape="block" ratio={shape} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul
      {...data}
      ref={list}
      data-dl="image-grid"
      data-layout={layout}
      data-framed={framed ? '' : undefined}
      data-selectable={selectable ? '' : undefined}
      data-selecting={selectable && selected.length ? '' : undefined}
      data-reorderable={reorderable ? '' : undefined}
      aria-label={label}
      {...(takesDrops
        ? {
            onDragOver: (event: DragEvent<HTMLUListElement>) => {
              // Files over the gap between items: keep the line where it is (the end until an item is crossed).
              if (!dragging.length && onDropFiles && carriesFiles(event)) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                if (drop === undefined && event.target === event.currentTarget) setDrop(null);
                return;
              }
              // Over the gap between items: keep the line where it is, and keep the drop allowed.
              if (dragging.length && drop !== undefined) event.preventDefault();
            },
            onDragLeave: (event: DragEvent<HTMLUListElement>) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDrop(undefined);
            },
            onDrop: dropOnGrid,
          }
        : {})}
    >
      {items.map((item, i) => {
        const shape = item.width && item.height ? ({ '--w': item.width, '--h': item.height } as CSSProperties) : undefined;
        const words = captioned && (item.caption || item.credit) ? { caption: item.caption, credit: item.credit } : undefined;
        const video = item.kind === 'video';
        const badges = item.badges?.length ? item.badges : undefined;
        const arriving = item.progress !== undefined;
        const foot = arriving || !!item.status;
        const timed = item.duration !== undefined;
        const marked = selectable || video || timed || !!badges || foot || !!item.blank;
        const opens = !!onSelect || !!item.href;
        const interactive = opens || !!selectable;
        const name = [item.alt, ...(item.status ? [item.status] : []), ...(badges ?? []).map((b) => b.label), ...(video ? [item.duration ? `video, ${spokenDuration(item.duration)}` : 'video'] : item.duration ? [spokenDuration(item.duration)] : [])].join(', ');
        const isSelected = !!selectable && selected.includes(item.id);
        const picture = item.blank ? (
          <span data-dl-part="blank" data-ratio={layout === 'standard' ? ratio : 'square'} role={opens ? undefined : 'img'} aria-label={opens ? undefined : item.alt}>
            <Icon name={item.blank} size="lg" />
          </span>
        ) : (
          <Image
            src={item.src}
            fallbackSrc={item.fallbackSrc}
            fit={item.fit}
            dark={item.dark}
            contrast={item.contrast}
            alt={opens ? '' : item.alt}
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
            {...(opens || marked ? {} : words)}
          />
        );
        const open = item.href ? (
          <a href={router ? router.href(item.href) : item.href} data-dl-part="open" aria-label={`Open: ${marked ? name : item.alt}`} onClick={(event) => press(i, event)}>
            {picture}
          </a>
        ) : onSelect && (
          <button type="button" data-dl-part="open" aria-label={`Open: ${marked ? name : item.alt}`} onClick={(event) => press(i, event)}>
            {picture}
          </button>
        );
        // Marks over the picture (a check box, badges, a video's play mark and length) share its one cell: the tile.
        const tile = marked && (
          <div data-dl-part="tile" onClick={selectable && !opens ? (event) => press(i, event) : undefined}>
            {open || picture}
            {video && (
              <span data-dl-part="play" aria-hidden={interactive || undefined}>
                <Badge kind="icon" icon="play" tone="neutral" emphasis="strong" size="l" label={item.duration ? `video, ${spokenDuration(item.duration)}` : 'video'} />
              </span>
            )}
            {timed && item.duration !== undefined && (
              <span data-dl-part="length" aria-hidden="true">
                <Badge emphasis="strong" tone="neutral" size="s">
                  {formatDuration(item.duration)}
                </Badge>
              </span>
            )}
            {foot && (
              <span data-dl-part="progress">
                {item.status && (
                  <span data-dl-part="status" aria-hidden={interactive || undefined}>
                    {item.status}
                  </span>
                )}
                {arriving && <Progress form="bar" label={`Uploading: ${item.alt}`} value={item.progress === 'indeterminate' ? undefined : item.progress} />}
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
                    {badges?.map((b) => b.icon ? (
                      <Badge key={b.label} kind="icon" icon={b.icon} tone={b.tone ?? 'neutral'} emphasis="strong" size="l" label={b.label} />
                    ) : (
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
            data-tone={item.statusTone === 'danger' ? 'danger' : undefined}
            data-dragging={dragging.includes(item.id) ? '' : undefined}
            data-drop={drop === item.id ? 'before' : drop === null && i === items.length - 1 ? 'end' : undefined}
            style={shape}
            {...(draggable
              ? {
                  draggable: true,
                  onDragStart: (event: DragEvent<HTMLLIElement>) => dragStart(item.id, event),
                  onDragEnd: dragEnd,
                  ...(takesDrops ? { onDragOver: (event: DragEvent<HTMLLIElement>) => overItem(i, event) } : {}),
                }
              : {})}
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
