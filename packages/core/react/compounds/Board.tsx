import { Fragment, useId, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import { announce } from '../behaviour/announce';
import { useFlipList } from '../behaviour/flip';
import { dropIndex } from '../behaviour/reorder';
import { Avatar } from '../fundamentals/Avatar';
import { Badge, type BadgeTone } from '../fundamentals/Badge';
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
}

export interface BoardColumn {
  id: string;
  title: string;
  cards: BoardCard[];
  /** The most cards the column should hold (work in progress); the count says "3 of 4". */
  limit?: number;
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
}

/**
 * Work as cards in columns by stage (To do, In progress, Done): drag a card to another column or position, or move it
 * with its Move menu. The columns scroll sideways inside the board when they don't fit. For a kanban board, a pipeline
 * of deals or applications. Not for a table of records (DataTable) or a single ordered list (List with reordering).
 * @tier compound
 * @family data
 * @a11y Each column is a labelled section with a heading and its count ("3 of 4" against a limit); cards are list items.
 * Dragging is never the only way: every card has a Move menu that names the columns, and each move is announced
 * ("Moved Sign-in error to Done"). The drop target shows an accent outline only while a card is over it. Tags carry
 * their meaning in words.
 */
export function Board({ label, columns, onMove, headingLevel = 2, emptyText = 'Nothing here yet.', ...data }: BoardProps) {
  const base = useId();
  const H = `h${headingLevel}` as 'h2';
  const [dragging, setDragging] = useState<{ id: string; height: number }>();
  const [over, setOver] = useState<{ column: string; index: number }>();
  const lists = useRef(new Map<string, HTMLOListElement>());

  // Where the dragged card would land (C23): an empty slot of its height opens there and the cards after it slide
  // down to make room; none where it came from (its faded self already marks that place).
  const origin = dragging && columns.find((c) => c.cards.some((x) => x.id === dragging.id));
  const slot = dragging && over && !(origin?.id === over.column && origin.cards.findIndex((x) => x.id === dragging.id) === over.index) ? over : undefined;
  // Cards travel to their new place when a card moves (menu: across the board; drop: the column it left closes up),
  // as one change however many move (MU8).
  const root = useFlipList<HTMLDivElement>(columns.map((c) => `${c.id}:${c.cards.map((x) => x.id).join(',')}`).join('|') + (slot ? `|slot:${slot.column}:${slot.index}` : ''));

  const move = (card: BoardCard, to: BoardColumn, index: number) => {
    onMove?.(card.id, to.id, index);
    announce(`Moved ${card.title} to ${to.title}`);
  };

  // Boxes as laid out, not as drawn: cards sliding out of the slot's way mustn't move the drop point under the pointer.
  const indexAt = (column: string, y: number) => {
    const list = lists.current.get(column);
    if (!list) return 0;
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
    const card = columns.flatMap((c) => c.cards).find((c) => c.id === dragging?.id);
    if (card) move(card, column, indexAt(column.id, event.clientY));
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
            <H id={heading} data-dl-part="title">
              <span>{column.title}</span>
              <span data-dl-part="count">{count}</span>
            </H>
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
                  onDragEnd={() => {
                    setDragging(undefined);
                    setOver(undefined);
                  }}
                >
                  <div data-dl-part="top">
                    {card.reference && <span data-dl-part="reference">{card.reference}</span>}
                    <span data-dl-part="menu">
                      <MenuButton
                        label={`Move ${card.title}`}
                        icon="more"
                        iconOnly
                        size="s"
                        emphasis="quiet"
                        menuLabel="Move to"
                        items={columns.filter((c) => c.id !== column.id).map((c) => ({ value: c.id, label: `Move to ${c.title}` }))}
                        onSelect={(to) => {
                          const target = columns.find((c) => c.id === to);
                          if (target) move(card, target, target.cards.length);
                        }}
                      />
                    </span>
                  </div>
                  <p data-dl-part="name">{card.href ? <a href={card.href}>{card.title}</a> : card.title}</p>
                  {(card.tags?.length || card.assignee || card.meta) && (
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
            {column.cards.length === 0 && slotAt < 0 && <p data-dl-part="empty">{emptyText}</p>}
          </section>
        );
      })}
      </ScrollArea>
    </div>
  );
}
