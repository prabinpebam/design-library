import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactElement, type ReactNode } from 'react';
import { dropIndex, moveItem } from '../behaviour/reorder';
import type { IconName } from '../../icons/icons';
import { Icon } from '../fundamentals/Icon';
import { Reveal } from '../fundamentals/Reveal';
import type { DataAttributes } from '../types';

export interface TreeItem {
  id: string;
  label: string;
  /** What kind of thing it is, as an icon before the label (a frame, a folder, a text layer). */
  icon?: IconName;
  /** A short note at the end of the row: a count, a size, "Hidden". */
  meta?: string;
  /** Its children; an item with children can be expanded and collapsed. */
  children?: TreeItem[];
  /** Drawn faded: the thing is there but switched off (a hidden layer). */
  muted?: boolean;
  /** Keeps the row's actions showing at rest, because they hold a state worth seeing (a hidden or locked layer). */
  pinActions?: boolean;
}

export interface TreeViewProps extends DataAttributes {
  /** Names the tree: "Layers", "Files". */
  label: string;
  items: TreeItem[];
  /** The selected item's id. */
  selected?: string;
  /** An item was chosen (a click, Enter or Space). */
  onSelect?: (id: string) => void;
  /** The ids of the expanded items. */
  expanded: string[];
  /** An item was expanded or collapsed: the new list. */
  onExpandedChange: (ids: string[]) => void;
  /** Compact controls at a row's end that act on that item (a layer's visibility and lock, as VisibilityToggles). Shown while the row is hovered or focused, and at rest with `pinActions`; their room is held so nothing moves. Only the focused row's actions are in the tab order: Tab from a row reaches its own. */
  actions?: (item: TreeItem) => ReactNode;
  /** Where the actions sit: `held` (default) keeps their room at every row's end, so labels are always that much shorter; `overlay` takes no room at rest and lays them over the label's end on the row's own surface while shown, so labels use the full width (a design tool's narrow layers panel). Nothing moves either way. */
  actionsRoom?: 'held' | 'overlay';
  /** What the chosen row means: `selection` (default) the selection's fill; `current` where you are (a list of pages), a neutral fill (`c.tree-view.current-fill`). */
  mark?: 'selection' | 'current';
  /** Rows can be moved among their siblings: dragged up or down, or with Alt+ArrowUp and Alt+ArrowDown. Each move is announced. */
  reorderable?: boolean;
  /** A row moved: its parent's id (undefined at the top level) and that parent's children's ids in their new order. */
  onReorder?: (parent: string | undefined, ids: string[]) => void;
  /**
   * Opt-in (LR168): with it a drag (with `reorderable`) can also move a row into another item or out of its parent, as
   * a design tool's layers do. Nothing moves while dragging: a line shows where the row lands (before or after a row) or
   * a mark shows the item it lands in (the middle of a row that `canHold`), and the drop calls `onMove` with the row's
   * new parent (undefined at the top level) and its index among that parent's children once moved. No keys are bound
   * for moving: the consumer owns its move keys.
   */
  onMove?: (id: string, parent: string | undefined, index: number) => void;
  /** Whether a row can hold others (a drop into it); default: rows with children. */
  canHold?: (item: TreeItem) => boolean;
  /** Opt-in (LR161): the row to show hovered, e.g. while its element is hovered on a canvas. */
  hovered?: string;
  /** Opt-in (LR161): the pointer entered a row (its id) or left the tree (undefined); the keyboard doesn't call it. */
  onHover?: (id: string | undefined) => void;
  /** `compact`: a design tool's short rows (as a compact density context gives). */
  density?: 'compact';
  /** Opt-in (LR161): the row whose name is being edited in place (a field in the label's place). */
  renaming?: string;
  /** A double-click on a row's name asks to rename it (the consumer sets `renaming`); with `onRename`. */
  onRenameStart?: (id: string) => void;
  /** The edited name: Enter or leaving the field gives the new name (trimmed; an empty one cancels), Escape undefined. */
  onRename?: (id: string, name: string | undefined) => void;
  /** Opt-in (LR161): the arrow keys, Home and End select the row they move to (`onSelect`), as a design tool's layers do. */
  selectionFollowsFocus?: boolean;
}

type Drop = { target: string; where: 'before' | 'after' | 'into' };

interface Row {
  item: TreeItem;
  level: number;
  parent?: string;
  size: number;
  position: number;
}

function visibleRows(items: TreeItem[], open: Set<string>, level = 1, parent?: string): Row[] {
  return items.flatMap((item, i) => [
    { item, level, parent, size: items.length, position: i + 1 },
    ...(item.children?.length && open.has(item.id) ? visibleRows(item.children, open, level + 1, item.id) : []),
  ]);
}

/**
 * A hierarchy to browse and choose from: layers in a design file, folders and files, sections of a long document.
 * Each row can open to show its children; one row is selected. Not for site navigation (Navigation) or a flat list of
 * options (List, Select).
 * @tier compound
 * @family navigation
 * @a11y The ARIA tree pattern: `role="tree"` with a label, rows as `treeitem`s with their level, position and set size,
 * `aria-expanded` on rows with children and `aria-selected` on the chosen one. One row is in the tab order (the
 * selected one, else the first); the arrow keys move between rows. The kind icon is decorative: the label names it.
 * Row actions are named controls inside the row (each Switch says which item it acts on); only the focused row's take Tab.
 * With eorderable, a move (a drag or Alt+Arrow) is announced in a status region ("Moved Hero to position 2 of 4."); focus stays on the moved row.
 * @key ArrowDown / ArrowUp: the next or previous visible row
 * @key ArrowRight: opens a closed row; on an open row, moves to its first child
 * @key ArrowLeft: closes an open row; on a closed row or a leaf, moves to its parent
 * @key Home / End: the first or last visible row
 * @key Enter / Space: selects the row
 * @key Alt+ArrowUp / Alt+ArrowDown (reorderable): moves the row before or after its previous or next sibling
 */
export function TreeView({ label, items, selected, onSelect, expanded, onExpandedChange, actions, actionsRoom = 'held', mark = 'selection', reorderable = false, onReorder, onMove, canHold, hovered, onHover, density, renaming, onRenameStart, onRename, selectionFollowsFocus = false, ...data }: TreeViewProps) {
  const open = new Set(expanded);
  const rows = visibleRows(items, open);
  const [active, setActive] = useState<string | undefined>(undefined);
  const current = rows.some((r) => r.item.id === active) ? active : rows.some((r) => r.item.id === selected) ? selected : rows[0]?.item.id;
  const refs = useRef(new Map<string, HTMLLIElement>());

  const move = (id: string | undefined) => {
    if (!id) return;
    setActive(id);
    refs.current.get(id)?.focus();
  };
  // selectionFollowsFocus (LR161): the arrows, Home and End also select.
  const go = (id: string | undefined) => {
    move(id);
    if (id && selectionFollowsFocus) onSelect?.(id);
  };
  // Roving tab order for row actions: only the current row's controls take Tab; the others wait for their row.
  useEffect(() => {
    if (!actions) return;
    for (const [id, el] of refs.current)
      el.querySelectorAll<HTMLElement>(':scope > [data-dl-part="row"] > [data-dl-part="actions"] :is(input, button, [tabindex])').forEach((c) => (c.tabIndex = id === current ? 0 : -1));
  });
  const toggle = (id: string, to: boolean) => onExpandedChange(to ? [...expanded, id] : expanded.filter((x) => x !== id));

  // Reordering among siblings (as List's): a drag past a sibling's centre, or Alt+Arrow; each move is announced.
  const [said, setSaid] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const drag = useRef<{ id: string; parent?: string; y: number; moved: boolean } | null>(null);
  const refocus = useRef<string | null>(null);
  const siblingsOf = (parent: string | undefined): TreeItem[] => {
    if (parent === undefined) return items;
    const find = (list: TreeItem[]): TreeItem | undefined => {
      for (const i of list) {
        if (i.id === parent) return i;
        const inner = i.children && find(i.children);
        if (inner) return inner;
      }
      return undefined;
    };
    return find(items)?.children ?? [];
  };
  const reorder = (parent: string | undefined, id: string, to: number) => {
    const siblings = siblingsOf(parent);
    const ids = siblings.map((s) => s.id);
    const from = ids.indexOf(id);
    if (from < 0 || to < 0 || to >= ids.length || to === from) return;
    onReorder?.(parent, moveItem(ids, from, to));
    setSaid(`Moved ${siblings[from].label} to position ${to + 1} of ${ids.length}.`);
  };
  // A moved row keeps focus: the browser drops it when the row's element moves.
  useEffect(() => {
    const id = refocus.current;
    refocus.current = null;
    if (id && document.activeElement !== refs.current.get(id)) refs.current.get(id)?.focus();
  }, [items]);
  // A move into or out of a parent (LR168): where the pointer is over the visible rows, never into the row itself or its own branch.
  const [drop, setDrop] = useState<Drop | null>(null);
  // The row whose rename was just finished by a key, so leaving its field doesn't finish it twice (LR161).
  const renamed = useRef<string | null>(null);
  useEffect(() => {
    if (renaming) renamed.current = null;
  }, [renaming]);
  const holds = (item: TreeItem) => (canHold ? canHold(item) : !!item.children?.length);
  const branch = (id: string) => {
    const ids = new Set<string>();
    const walk = (list: TreeItem[] = []) => list.forEach((i) => (ids.add(i.id), walk(i.children)));
    const at = (list: TreeItem[]): TreeItem | undefined => list.reduce<TreeItem | undefined>((found, i) => found ?? (i.id === id ? i : i.children && at(i.children)), undefined);
    const own = at(items);
    ids.add(id);
    walk(own?.children);
    return ids;
  };
  const dropAt = (id: string, y: number): Drop | null => {
    const off = branch(id);
    for (const r of rows) {
      const box = refs.current.get(r.item.id)?.querySelector(':scope > [data-dl-part="row"]')?.getBoundingClientRect();
      if (!box || y < box.top || y > box.bottom) continue;
      if (off.has(r.item.id)) return null;
      const part = (y - box.top) / (box.height || 1);
      if (holds(r.item) && part > 0.25 && part < 0.75) return { target: r.item.id, where: 'into' };
      return { target: r.item.id, where: part < 0.5 ? 'before' : 'after' };
    }
    return null;
  };
  const land = (id: string, to: Drop) => {
    const target = rows.find((r) => r.item.id === to.target);
    const moving = rows.find((r) => r.item.id === id);
    if (!target || !moving) return;
    const parent = to.where === 'into' ? target.item.id : target.parent;
    const siblings = siblingsOf(parent).map((s) => s.id).filter((s) => s !== id);
    const index = to.where === 'into' ? siblings.length : siblings.indexOf(target.item.id) + (to.where === 'after' ? 1 : 0);
    if (parent === moving.parent && index === moving.position - 1) return;
    refocus.current = id;
    onMove?.(id, parent, index);
    const into = parent === undefined ? undefined : rows.find((r) => r.item.id === parent)?.item.label;
    setSaid(into ? `Moved ${moving.item.label} into ${into}, position ${index + 1}.` : `Moved ${moving.item.label} to position ${index + 1}.`);
  };
  const onRowDown = (row: Row) => (event: PointerEvent<HTMLSpanElement>) => {
    if (!reorderable || event.button !== 0 || event.pointerType === 'touch') return;
    if ((event.target as HTMLElement).closest('[data-dl-part="actions"], [data-dl-part="twisty"], [data-dl-part="rename"]')) return;
    drag.current = { id: row.item.id, parent: row.parent, y: event.clientY, moved: false };
  };
  const onRowMove = (event: PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d) return;
    // The press ended elsewhere before a drag began: nothing to drag.
    if (!d.moved && !(event.buttons & 1)) {
      drag.current = null;
      return;
    }
    if (!d.moved && Math.abs(event.clientY - d.y) < 4) return;
    // LR173: the row takes the pointer only once a drag begins, so a click or a double-click (rename) reaches the label.
    if (!d.moved) {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragId(d.id);
    }
    d.moved = true;
    if (onMove) return setDrop(dropAt(d.id, event.clientY));
    const ids = siblingsOf(d.parent).map((s) => s.id);
    const boxes = ids.map((id) => refs.current.get(id)?.querySelector(':scope > [data-dl-part="row"]')?.getBoundingClientRect() ?? { top: 0, height: 0 });
    const from = ids.indexOf(d.id);
    const at = dropIndex(boxes, event.clientY);
    reorder(d.parent, d.id, at > from ? at - 1 : at);
  };
  const onRowUp = () => {
    if (!drag.current) return;
    const d = drag.current;
    if (onMove && d.moved && drop) land(d.id, drop);
    setDrop(null);
    setDragId(null);
    setTimeout(() => (drag.current = null));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>, row: Row, index: number) => {
    if (event.target !== event.currentTarget) return;
    if (reorderable && event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      refocus.current = row.item.id;
      reorder(row.parent, row.item.id, row.position - 1 + (event.key === 'ArrowUp' ? -1 : 1));
      return;
    }    const hasChildren = !!row.item.children?.length;
    const isOpen = open.has(row.item.id);
    const keys: Record<string, () => void> = {
      ArrowDown: () => go(rows[index + 1]?.item.id),
      ArrowUp: () => go(rows[index - 1]?.item.id),
      Home: () => go(rows[0]?.item.id),
      End: () => go(rows[rows.length - 1]?.item.id),
      ArrowRight: () => (hasChildren && !isOpen ? toggle(row.item.id, true) : hasChildren ? go(rows[index + 1]?.item.id) : undefined),
      ArrowLeft: () => (hasChildren && isOpen ? toggle(row.item.id, false) : go(row.parent)),
      Enter: () => onSelect?.(row.item.id),
      ' ': () => onSelect?.(row.item.id),
    };
    const run = keys[event.key];
    if (!run) return;
    event.preventDefault();
    run();
  };

  const render = (list: TreeItem[], level: number): ReactElement[] =>
    list.map((item, i) => {
      const index = rows.findIndex((r) => r.item.id === item.id);
      // Rows inside a closed branch stay mounted (inert, in a collapsed Reveal) so the branch can open in place (Q65 K-6).
      const row: Row = rows[index] ?? { item, level, size: list.length, position: i + 1 };
      const hasChildren = !!item.children?.length;
      const isOpen = open.has(item.id);
      return (
        <li
          key={item.id}
          ref={(el) => {
            if (el) refs.current.set(item.id, el);
            else refs.current.delete(item.id);
          }}
          role="treeitem"
          aria-level={level}
          aria-setsize={row.size}
          aria-posinset={row.position}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={item.id === selected}
          aria-label={item.meta ? `${item.label}, ${item.meta}` : item.label}
          tabIndex={item.id === current ? 0 : -1}
          data-dl-part="item"
          data-dragging={dragId === item.id ? '' : undefined}
          onKeyDown={(e) => onKeyDown(e, row, index)}
          onFocus={(e) => e.target === e.currentTarget && setActive(item.id)}
        >
          <span
            data-dl-part="row"
            data-muted={item.muted ? '' : undefined}
            data-hovered={hovered === item.id ? '' : undefined}
            data-drop={drop?.target === item.id ? drop.where : undefined}
            onPointerEnter={onHover ? () => onHover(item.id) : undefined}
            style={{ '--level': String(level - 1) } as CSSProperties}
            onPointerDown={onRowDown(row)}
            onPointerMove={onRowMove}
            onPointerUp={onRowUp}
            onPointerCancel={onRowUp}
            onClick={() => {
              if (drag.current?.moved) return;
              setActive(item.id);
              onSelect?.(item.id);
            }}
          >
            <span data-dl-part="twisty" aria-hidden="true" data-open={isOpen ? '' : undefined} onClick={(e) => (hasChildren ? (e.stopPropagation(), toggle(item.id, !isOpen)) : undefined)}>
              {hasChildren && <Icon name="chevron-end" size="sm" />}
            </span>
            {item.icon && (
              <span data-dl-part="icon">
                <Icon name={item.icon} size="sm" />
              </span>
            )}
            {renaming === item.id && onRename ? (
              <input
                data-dl-part="rename"
                aria-label={`Rename ${item.label}`}
                defaultValue={item.label}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    refocus.current = item.id;
                    renamed.current = item.id;
                    onRename(item.id, e.currentTarget.value.trim() || undefined);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    refocus.current = item.id;
                    renamed.current = item.id;
                    onRename(item.id, undefined);
                    refs.current.get(item.id)?.focus();
                  }
                }}
                onBlur={(e) => {
                  if (renaming === item.id && renamed.current !== item.id) onRename(item.id, e.currentTarget.value.trim() || undefined);
                }}
              />
            ) : (
              <span data-dl-part="label" onDoubleClick={onRenameStart ? (e) => (e.stopPropagation(), onRenameStart(item.id)) : undefined}>
                {item.label}
              </span>
            )}
            {item.meta && <span data-dl-part="meta">{item.meta}</span>}
            {actions && (
              <span data-dl-part="actions" data-pinned={item.pinActions ? '' : undefined} onClick={(e) => e.stopPropagation()}>
                {actions(item)}
              </span>
            )}
          </span>
          {hasChildren && (
            <Reveal open={isOpen}>
              <ul role="group" data-dl-part="group">
                {render(item.children!, level + 1)}
              </ul>
            </Reveal>
          )}
        </li>
      );
    });

  const tree = (
    <ul {...data} data-dl="tree-view" data-density={density} data-reorder={reorderable ? '' : undefined} data-actions={actionsRoom === 'overlay' ? 'overlay' : undefined} data-mark={mark === 'current' ? 'current' : undefined} data-flat={items.some((i) => i.children?.length) ? undefined : ''} role="tree" aria-label={label} onPointerLeave={onHover ? () => onHover(undefined) : undefined}>
      {render(items, 1)}
    </ul>
  );
  if (!reorderable) return tree;
  return (
    <>
      {tree}
      <span data-dl-part="reorder-announce" role="status">
        {said}
      </span>
    </>
  );
}
