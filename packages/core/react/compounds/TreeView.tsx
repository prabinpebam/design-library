import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
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
}

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
 * @key ArrowDown / ArrowUp: the next or previous visible row
 * @key ArrowRight: opens a closed row; on an open row, moves to its first child
 * @key ArrowLeft: closes an open row; on a closed row or a leaf, moves to its parent
 * @key Home / End: the first or last visible row
 * @key Enter / Space: selects the row
 */
export function TreeView({ label, items, selected, onSelect, expanded, onExpandedChange, actions, actionsRoom = 'held', mark = 'selection', ...data }: TreeViewProps) {
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
  // Roving tab order for row actions: only the current row's controls take Tab; the others wait for their row.
  useEffect(() => {
    if (!actions) return;
    for (const [id, el] of refs.current)
      el.querySelectorAll<HTMLElement>(':scope > [data-dl-part="row"] > [data-dl-part="actions"] :is(input, button, [tabindex])').forEach((c) => (c.tabIndex = id === current ? 0 : -1));
  });
  const toggle = (id: string, to: boolean) => onExpandedChange(to ? [...expanded, id] : expanded.filter((x) => x !== id));

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>, row: Row, index: number) => {
    if (event.target !== event.currentTarget) return;
    const hasChildren = !!row.item.children?.length;
    const isOpen = open.has(row.item.id);
    const keys: Record<string, () => void> = {
      ArrowDown: () => move(rows[index + 1]?.item.id),
      ArrowUp: () => move(rows[index - 1]?.item.id),
      Home: () => move(rows[0]?.item.id),
      End: () => move(rows[rows.length - 1]?.item.id),
      ArrowRight: () => (hasChildren && !isOpen ? toggle(row.item.id, true) : hasChildren ? move(rows[index + 1]?.item.id) : undefined),
      ArrowLeft: () => (hasChildren && isOpen ? toggle(row.item.id, false) : move(row.parent)),
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
          onKeyDown={(e) => onKeyDown(e, row, index)}
          onFocus={(e) => e.target === e.currentTarget && setActive(item.id)}
        >
          <span
            data-dl-part="row"
            data-muted={item.muted ? '' : undefined}
            style={{ '--level': String(level - 1) } as CSSProperties}
            onClick={() => {
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
            <span data-dl-part="label">{item.label}</span>
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

  return (
    <ul {...data} data-dl="tree-view" data-actions={actionsRoom === 'overlay' ? 'overlay' : undefined} data-mark={mark === 'current' ? 'current' : undefined} data-flat={items.some((i) => i.children?.length) ? undefined : ''} role="tree" aria-label={label}>
      {render(items, 1)}
    </ul>
  );
}
