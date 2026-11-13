import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { ScrollArea } from '../fundamentals/ScrollArea';
import type { DataAttributes } from '../types';

export interface ListDetailProps extends DataAttributes {
  /** The list: usually a List with `mode="select"` and `selection="single"`, or a navigation of links. */
  list: ReactNode;
  /** Names the list's region, e.g. "Messages". */
  listLabel: string;
  /** The chosen item's detail, or an empty state that says to choose one. Starts with the item's heading. */
  children: ReactNode;
  /** Names the detail's region, usually the chosen item's name, e.g. "Ada Lovelace". */
  detailLabel: string;
  /** The list's column: `narrow` (18 rem, default) for a name and a short line, `wide` (22 rem) for a name and two lines under it. */
  listWidth?: 'narrow' | 'wide';
  /**
   * Which side shows when there is room for only one (below the list's column plus 18 rem for the detail). `list` until an item is
   * chosen, then `detail`; Back sets it to `list` again. Where both fit, both show and Back is gone.
   */
  show?: 'list' | 'detail';
  /** Back's words, naming where it goes, e.g. "Back to messages". */
  backLabel: string;
  /** Back was pressed: set `show` to `list`. */
  onBack: () => void;
  /** The most the layout grows before each side scrolls on its own; `fill` takes the height its parent gives it. Without it, both sides grow and the page scrolls. */
  maxSize?: 'fill' | 'md' | 'lg';
  /**
   * LR116 (opt-in): the list's own surface, set apart from the detail by tone alone (no border or shadow): `raised` or
   * `sunken` (the surface roles). Unset, the list shares the page's surface. The list's content keeps its own inset.
   */
  listTone?: 'raised' | 'sunken';
  /**
   * LR118 (opt-in): side by side and without a `maxSize`, the list stays in view while the page scrolls the detail,
   * under the window's sticky chrome (`--dl-chrome-block`), as SectionedForm's `stickyList`.
   */
  stickyList?: boolean;
}

const shown = (el: HTMLElement | null) => !!el && el.getClientRects().length > 0;

/**
 * A list beside the chosen item's detail, both from the top: an inbox, settings, files, people. It measures the room it
 * is given, not the window: where both don't fit, one shows at a time and the detail has a Back. It only lays out the
 * caller's list and detail; their content, selection and empty states stay theirs.
 * Not for a page's reading column (use PageLayout) or for a side task over the page (use Sheet).
 * @tier 3
 * @a11y The list and the detail are labelled regions, the list first in the source as on screen. When one side shows at
 * a time, choosing an item moves focus to the detail (its region, named after the item) and Back returns it to the
 * chosen item, so the keyboard never loses its place. Held heights scroll each side with its own ScrollArea.
 */
export function ListDetail({ list, listLabel, children, detailLabel, listWidth = 'narrow', show = 'list', backLabel, onBack, maxSize, listTone, stickyList = false, ...data }: ListDetailProps) {
  const listRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Only when one side shows at a time does the focus need carrying across; side by side it stays where it was.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (shown(listRef.current) && shown(detailRef.current)) return;
    if (show === 'detail') {
      detailRef.current?.focus();
    } else {
      const chosen = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"], [aria-current="page"], [aria-current="true"]');
      (chosen ?? listRef.current)?.focus();
    }
  }, [show]);

  const fit = maxSize ? 'fill' : undefined;
  const scrolls = (content: ReactNode) => (maxSize ? <ScrollArea maxSize={fit}>{content}</ScrollArea> : content);

  return (
    <div {...data} data-dl="list-detail" data-list-width={listWidth} data-show={show} data-max-size={maxSize} data-list-tone={listTone} data-sticky-list={stickyList ? '' : undefined}>
      <div data-dl-part="panes">
        <section ref={listRef} data-dl-part="list" aria-label={listLabel} tabIndex={-1}>
          {scrolls(list)}
        </section>
        <section ref={detailRef} data-dl-part="detail" aria-label={detailLabel} tabIndex={-1}>
          <div data-dl-part="back">
            <Button label={backLabel} icon="chevron-start" emphasis="quiet" onClick={onBack} />
          </div>
          {scrolls(children)}
        </section>
      </div>
    </div>
  );
}
