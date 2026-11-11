import { Fragment, useEffect, useId, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import { announce } from '../behaviour/announce';
import { useFlipList } from '../behaviour/flip';
import { dropIndex } from '../behaviour/reorder';
import { Avatar } from '../fundamentals/Avatar';
import { Badge, type BadgeTone } from '../fundamentals/Badge';
import { Button } from '../fundamentals/Button';
import { Icon } from '../fundamentals/Icon';
import { MenuButton } from '../fundamentals/MenuButton';
import { ScrollArea } from '../fundamentals/ScrollArea';
import type { DataAttributes } from '../types';

export interface BoardCard {
  id: string;
  title: string;
  /** Opens the card's own page. */
  href?: string;
  /** A short reference before the title: "KW-142". */
  reference?: string;
  /** Labels: a kind, a priority, a team. Each says its meaning in words; the tone only adds to it. */
  tags?: { label: string; tone?: BadgeTone }[];
  /** Who it's assigned to, shown as their avatar with their name for assistive technology. */
  assignee?: string;
  /** A short note at the end: an estimate, a due date. */
  meta?: string;
  /** Rows inside the card that move on their own (a group's parts): each has its own drag and Move menu. */
  items?: BoardItem[];
  /** More choices in the card's Move menu, after the columns ("Gather all 4 here"). */
  actions?: { value: string; label: string }[];
}

/** A row inside a card: dragged or moved with its menu on its own, out of the card into another column. */
export interface BoardItem {
  id: string;
  title: string;
  /** A small colour mark before the name, any CSS colour: what the row stands for, never its state. */
  swatch?: string;
  /** One line under the name, only when something needs saying: "Shifted in dark: lighter step". */
  note?: string;
  /** `warning` puts a warning icon before the note; default `info`, the note alone. */
  noteTone?: 'info' | 'warning';
}

export interface BoardColumn {
  id: string;
  title: string;
  cards: BoardCard[];
  /** The most cards the column should hold (work in progress); the count says "3 of 4". */
  limit?: number;
  /** A colour mark before the title, any CSS colour. */
  swatch?: string;
  /** A short tag after the title: "Actions". */
  tag?: string;
  /** One line under the title: "Shows the plain look". */
  note?: string;
  /** Quiet buttons under the title that act on the column ("Use for actions"). */
  actions?: { value: string; label: string }[];
  /** What this column says when empty, when it differs from the board's `emptyText`. */
  emptyText?: string;
}

export interface BoardProps extends DataAttributes {
  /** Names the board: "Sprint 14 board". */
  label: string;
  columns: BoardColumn[];
  /** A card was moved, by dragging or with its Move menu: to which column, at which position. */
  onMove?: (cardId: string, toColumn: string, toIndex: number) => void;
  /** The level of each column's title. */
  headingLevel?: 2 | 3 | 4;
  /** What an empty column says. */
  emptyText?: string;
  /**
   * Whether a card's position in its column matters (default true). False: the whole column is the drop target, no slot
   * opens and a moved card goes where the data puts it (a set sorted by its own rule, like a brand map's groups).
   */
  ordered?: boolean;
  /** A row inside a card was moved, by dragging or with its Move menu, to another column. */
  onMoveItem?: (itemId: string, toColumn: string) => void;
  /** One of a card's own Move menu choices (BoardCard.actions) was picked. */
  onCardAction?: (cardId: string, value: string) => void;
  /** One of a column's actions (BoardColumn.actions) was pressed. */
  onColumnAction?: (columnId: string, value: string) => void;
}

/**
 * Work as cards in columns by stage (To do, In progress, Done): drag a card to another column or position, or move it
 * with its Move menu. The columns scroll sideways inside the board when they don't fit. For a kanban board, a pipeline
 * of deals or applications, or assigning things to buckets (a brand map: groups of parts to colours), where a card may
 * hold rows that move on their own. Not for a table of records (DataTable) or a single ordered list (List with reordering).
 * @tier compound
 * @family data
 * @a11y Each column is a labelled section with a heading and its count ("3 of 4" against a limit); cards are list items.
 * Dragging is never the only way: every card and every row has a Move menu that names the columns, and each move is
 * announced ("Moved Sign-in error to Done"). The drop target shows an accent outline only while a card is over it. Tags
 * carry their meaning in words; a column's colour mark only adds to its title.
 */
export function Board({ label, columns, onMove, headingLevel = 2, emptyText = 'Nothing here yet.', ordered = true, onMoveItem, onCardAction, onColumnAction, ...data }: BoardProps) {
  const base = useId();
  const H = `h${headingLevel}` as 'h2';
  const [dragging, setDragging] = useState<{ id: string; height: number; item?: boolean }>();
  const [over, setOver] = useState<{ column: string; index: number }>();
  const lists = useRef(new Map<string, HTMLOListElement>());
  // After a Move menu choice, focus follows the moved card or row to its Move button in the new column (its old one is gone).
  const [follow, setFollow] = useState<{ column: string; label: string }>();
  useEffect(() => {
    if (!follow) return;
    const t = setTimeout(() => {
      const column = document.getElementById(`${base}-${follow.column}`)?.closest('section');
      [...(column?.querySelectorAll<HTMLButtonElement>('button[aria-label]') ?? [])].find((b) => b.getAttribute('aria-label') === follow.label)?.focus();
      setFollow(undefined);
    });
    return () => clearTimeout(t);
  }, [follow, base]);

  // Where the dragged card would land (C23): an empty slot of its height opens there and the cards after it slide
  // down to make room; none where it came from (its faded self already marks that place). None on an unordered board.
  const origin = dragging && columns.find((c) => c.cards.some((x) => x.id === dragging.id));
  const slot = ordered && dragging && !dragging.item && over && !(origin?.id === over.column && origin.cards.findIndex((x) => x.id === dragging.id) === over.index) ? over : undefined;
  // Cards travel to their new place when a card moves (menu: across the board; drop: the column it left closes up),
  // as one change however many move (MU8).
  const root = useFlipList<HTMLDivElement>(columns.map((c) => `${c.id}:${c.cards.map((x) => `${x.id}(${x.items?.map((i) => i.id).join(',') ?? ''})`).join(',')}`).join('|') + (slot ? `|slot:${slot.column}:${slot.index}` : ''));

  const move = (card: BoardCard, to: BoardColumn, index: number) => {
    onMove?.(card.id, to.id, index);
    announce(`Moved ${card.title} to ${to.title}`);
  };
  const moveItem = (item: BoardItem, to: BoardColumn) => {
    onMoveItem?.(item.id, to.id);
    announce(`Moved ${item.title} to ${to.title}`);
  };
  const moveChoices = (from: BoardColumn) => columns.filter((c) => c.id !== from.id).map((c) => ({ value: `column:${c.id}`, label: `Move to ${c.title}` }));

  // Boxes as laid out, not as drawn: cards sliding out of the slot's way mustn't move the drop point under the pointer.
  const indexAt = (column: string, y: number) => {
    const list = lists.current.get(column);
    if (!list || !ordered) return 0;
    const top = list.getBoundingClientRect().top - list.offsetTop;
    const boxes = [...list.querySelectorAll<HTMLElement>(':scope > [data-dl-part="card"]:not([data-dragging])')].map((el) => ({ top: top + el.offsetTop, height: el.offsetHeight }));
    return dropIndex(boxes, y);
  };

  const onDragOver = (event: DragEvent, column: BoardColumn) => {
    if (!dragging) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const index = indexAt(column.id, event.clientY);
    if (over?.column !== column.id || over.index !== index) setOver({ column: column.id, index });
  };

  const onDrop = (event: DragEvent, column: BoardColumn) => {
    event.preventDefault();
    const from = columns.find((c) => c.cards.some((x) => x.id === dragging?.id || x.items?.some((i) => i.id === dragging?.id)));
    if (dragging?.item) {
      const item = columns.flatMap((c) => c.cards.flatMap((x) => x.items ?? [])).find((i) => i.id === dragging.id);
      if (item && from?.id !== column.id) moveItem(item, column);
    } else {
      const card = columns.flatMap((c) => c.cards).find((c) => c.id === dragging?.id);
      if (card && (ordered || from?.id !== column.id)) move(card, column, indexAt(column.id, event.clientY));
    }
    setDragging(undefined);
    setOver(undefined);
  };

  const endDrag = () => {
    setDragging(undefined);
    setOver(undefined);
  };

  return (
    <div {...data} ref={root} data-dl="board" data-dragging={dragging ? '' : undefined}>
      <ScrollArea axis="inline" label={label}>
      {columns.map((column) => {
        const heading = `${base}-${column.id}`;
        const count = column.limit ? `${column.cards.length} of ${column.limit}` : String(column.cards.length);
        const slotAt = slot?.column === column.id ? slot.index : -1;
        let placed = 0;
        const gap = dragging && <li key="slot" data-dl-part="slot" data-flip-key="dl-board-slot" aria-hidden="true" style={{ '--board-slot': `${dragging.height}px` } as CSSProperties} />;
        return (
          <section
            key={column.id}
            data-dl-part="column"
            aria-labelledby={heading}
            data-over={over?.column === column.id ? '' : undefined}
            data-full={column.limit && column.cards.length >= column.limit ? '' : undefined}
            onDragOver={(e) => onDragOver(e, column)}
            onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOver(undefined)}
            onDrop={(e) => onDrop(e, column)}
          >
            <div data-dl-part="head">
              <H id={heading} data-dl-part="title">
                <span data-dl-part="label">
                  {column.swatch && <span data-dl-part="swatch" aria-hidden="true" style={{ '--board-swatch': column.swatch } as CSSProperties} />}
                  <span>{column.title}</span>
                  {column.tag && (
                    <Badge tone="neutral" size="s">
                      {column.tag}
                    </Badge>
                  )}
                </span>
                <span data-dl-part="count">{count}</span>
              </H>
              {column.note && <p data-dl-part="column-note">{column.note}</p>}
              {column.actions?.length ? (
                <div data-dl-part="column-actions">
                  {column.actions.map((a) => (
                    <Button key={a.value} label={a.label} size="s" emphasis="quiet" onClick={() => onColumnAction?.(column.id, a.value)} />
                  ))}
                </div>
              ) : null}
            </div>
            <ol
              data-dl-part="cards"
              ref={(el) => {
                if (el) lists.current.set(column.id, el);
              }}
            >
              {column.cards.map((card) => {
                const at = card.id === dragging?.id ? -1 : placed++;
                return (
                <Fragment key={card.id}>
                {at === slotAt && gap}
                <li
                  key={card.id}
                  data-dl-part="card"
                  draggable
                  data-dragging={dragging?.id === card.id ? '' : undefined}
                  data-flip-key={dragging?.id === card.id ? undefined : card.id}
                  data-presence="item"
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', card.title);
                    setDragging({ id: card.id, height: e.currentTarget.getBoundingClientRect().height });
                  }}
                  onDragEnd={endDrag}
                >
                  <div data-dl-part="top">
                    {card.reference && <span data-dl-part="reference">{card.reference}</span>}
                    {card.items && <span data-dl-part="card-title">{card.title}</span>}
                    {card.items && card.meta && <span data-dl-part="meta">{card.meta}</span>}
                    <span data-dl-part="menu">
                      <MenuButton
                        label={`Move ${card.title}`}
                        icon="more"
                        iconOnly
                        size="s"
                        emphasis="quiet"
                        menuLabel="Move to"
                        items={[...moveChoices(column), ...(card.actions ?? []).map((a) => ({ value: `action:${a.value}`, label: a.label }))]}
                        onSelect={(value) => {
                          if (value.startsWith('action:')) return onCardAction?.(card.id, value.slice(7));
                          const target = columns.find((c) => `column:${c.id}` === value);
                          if (!target) return;
                          move(card, target, target.cards.length);
                          setFollow({ column: target.id, label: `Move ${card.title}` });
                        }}
                      />
                    </span>
                  </div>
                  {!card.items && <p data-dl-part="name">{card.href ? <a href={card.href}>{card.title}</a> : card.title}</p>}
                  {card.items && (
                    <ul data-dl-part="items">
                      {card.items.map((item) => (
                        <li
                          key={item.id}
                          data-dl-part="item"
                          draggable
                          data-dragging={dragging?.id === item.id ? '' : undefined}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', item.title);
                            setDragging({ id: item.id, height: e.currentTarget.getBoundingClientRect().height, item: true });
                          }}
                          onDragEnd={endDrag}
                        >
                          <span data-dl-part="item-text">
                            <span data-dl-part="item-name">
                              {item.swatch && <span data-dl-part="swatch" aria-hidden="true" style={{ '--board-swatch': item.swatch } as CSSProperties} />}
                              {item.title}
                            </span>
                            {item.note && (
                              <span data-dl-part="item-note" data-tone={item.noteTone ?? 'info'}>
                                {item.noteTone === 'warning' && <Icon name="warning" size="sm" label="Warning" />}
                                {item.note}
                              </span>
                            )}
                          </span>
                          <MenuButton
                            label={`Move ${item.title}`}
                            icon="more"
                            iconOnly
                            size="s"
                            emphasis="quiet"
                            menuLabel="Move to"
                            items={moveChoices(column)}
                            onSelect={(value) => {
                              const target = columns.find((c) => `column:${c.id}` === value);
                              if (!target) return;
                              moveItem(item, target);
                              setFollow({ column: target.id, label: `Move ${item.title}` });
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                  {!card.items && (card.tags?.length || card.assignee || card.meta) && (
                    <div data-dl-part="foot">
                      {card.tags?.map((t) => (
                        <Badge key={t.label} tone={t.tone ?? 'neutral'}>
                          {t.label}
                        </Badge>
                      ))}
                      <span data-dl-part="end">
                        {card.meta && <span data-dl-part="meta">{card.meta}</span>}
                        {card.assignee && <Avatar name={card.assignee} size={24} />}
                      </span>
                    </div>
                  )}
                </li>
                </Fragment>
                );
              })}
              {slotAt >= placed && gap}
            </ol>
            {column.cards.length === 0 && slotAt < 0 && <p data-dl-part="empty">{column.emptyText ?? emptyText}</p>}
          </section>
        );
      })}
      </ScrollArea>
    </div>
  );
}
