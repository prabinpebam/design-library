import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { Heading } from '../fundamentals/Heading';
import { Icon } from '../fundamentals/Icon';
import { dropIndex, moveItem } from '../behaviour/reorder';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

/** One destination in the navigation. */
export interface NavigationItem {
  /** Stable identity; matched against `current`. */
  id: string;
  /** The page's name, as it reads in the list. */
  label: string;
  /** Where it goes: a URL or an in-app route. */
  href: string;
  /** A small square picture before the name (an album's cover), decorative: the label names it (LR43). */
  picture?: string;
  /** An icon before the name, or in the picture's place when it has none (LR43). */
  icon?: IconName;
  /** One muted line under the name: what it holds ("15 pictures, 1 video") (LR43). */
  meta?: string;
}

/**
 * A family of related destinations inside a group (Buttons, Inputs): a name that opens and closes its pages. A family
 * may hold families of its own (a template → its sections → their flows), up to three levels deep.
 */
export interface NavigationFamily {
  /** Stable identity; listed in `expanded` while the family is open. */
  id: string;
  /** The family's name, on the button that opens and closes it. */
  title: string;
  items: (NavigationItem | NavigationFamily)[];
}

/** Destinations that belong together, under one heading: pages directly, families of pages, or both. */
export interface NavigationGroup {
  id: string;
  /** The group's name, shown as a heading above its entries; also names its list for assistive technology. */
  title: string;
  items: (NavigationItem | NavigationFamily)[];
  /** The title still names the group's list but isn't shown, where what's around it already says what the list is (LR43). */
  hideTitle?: boolean;
  /** Each page (families aren't moved) gets a trailing Move handle: drag it, or Alt+Up or Alt+Down on it (LR43). */
  reorderable?: boolean;
  /** The pages' ids in their new order, after each drag step or Alt+arrow move. */
  onReorder?: (ids: string[]) => void;
  /** The handle's name, `{label}` the page's: default "Move {label}". */
  moveLabel?: string;
}

export interface NavigationProps extends DataAttributes {
  /** The groups, in reading order. */
  groups: NavigationGroup[];
  /** The `id` of the page the person is on: marked with a full-shape fill and `aria-current`. */
  current?: string;
  /** The `id`s of the open families. Leave it out and the navigation keeps its own, starting with the current page's family open. */
  expanded?: string[];
  /** Called with the open families' `id`s when the person opens or closes one. */
  onExpandedChange?: (expanded: string[]) => void;
  /** The heading level of each group's title, so it fits the page's outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Narrow screens: one disclosure naming the current page, with the list inside it. */
  collapsed?: boolean;
  /** Whether the collapsed disclosure is open; read only when `collapsed`. */
  open?: boolean;
  /** Called when the person opens or closes the collapsed disclosure. */
  onOpenChange?: (open: boolean) => void;
  /** The disclosure's name when no item is current. */
  fallbackLabel?: string;
  /** Called with an item's `id` when the person follows it, for apps that route on the client. The link still follows its `href`. */
  onNavigate?: (id: string) => void;
  /** `m` (default) the 44 px targets under heading titles; `s` a dense app frame's navigation (LR41): 36 px rows (above the WCAG 2.2 AA 24 px minimum), a step smaller words and small muted group titles. Pair it with AppLayout `size="s"`. */
  size?: 'm' | 's';
}

const isFamily = (entry: NavigationItem | NavigationFamily): entry is NavigationFamily => 'items' in entry;

/** Every family around the page `current`, outermost first: open them all so the person can see where they are. */
export function familyPathOf(groups: NavigationGroup[], current: string | undefined): string[] {
  const walk = (entries: (NavigationItem | NavigationFamily)[], path: string[]): string[] | undefined => {
    for (const e of entries) {
      if (!isFamily(e)) {
        if (e.id === current) return path;
      } else {
        const found = walk(e.items, [...path, e.id]);
        if (found) return found;
      }
    }
    return undefined;
  };
  for (const g of groups) {
    const found = walk(g.items, []);
    if (found) return found;
  }
  return [];
}

/** The innermost family holding the page `current`, if any. */
export function familyOf(groups: NavigationGroup[], current: string | undefined) {
  return familyPathOf(groups, current).at(-1);
}

/** Every page in the entries, families opened out. */
const pagesIn = (entries: (NavigationItem | NavigationFamily)[]): NavigationItem[] => entries.flatMap((e) => (isFamily(e) ? pagesIn(e.items) : [e]));

/**
 * Moves between the pages of an app or a document set: headed groups of pages and families of pages, the current page
 * marked. Groups are told apart by a heading and the largest space; a family's pages sit under its name, indented so
 * their names line up with it, and open and close together. A family inside a family indents one more step (three at most).
 * Not for actions (use Button), for choosing how content shows (use SegmentedControl) or for the steps of a task.
 * @tier compound
 * @family navigation
 * @a11y Put it inside a navigation landmark (LibraryLayout's nav region is one). Each group's title is a heading and
 * names its list; each family is a disclosure button (`aria-expanded`, `aria-controls`) over its own list. The current
 * item carries `aria-current="page"` and keeps an outline in forced colours, so it is never shown by colour alone.
 * Items and family buttons keep a 44 px target, a gap between them so two fills never touch, the same geometry on
 * hover, press and focus, and room for an unclipped focus ring. Collapsed, it is one native disclosure whose summary
 * names the current page.
 * @key Tab: moves through the items and family buttons in reading order
 * @key Enter: follows the focused item
 * @key Enter / Space: opens or closes the focused family, or the collapsed disclosure from its summary
 */
export function Navigation({ groups, current, expanded, onExpandedChange, headingLevel = 2, collapsed = false, open = false, onOpenChange, fallbackLabel = 'Pages', onNavigate, size = 'm', ...data }: NavigationProps) {
  const base = useId();
  const [own, setOwn] = useState<string[]>(() => familyPathOf(groups, current));
  const opened = expanded ?? own;
  const toggle = (id: string) => {
    const next = opened.includes(id) ? opened.filter((f) => f !== id) : [...opened, id];
    if (expanded === undefined) setOwn(next);
    onExpandedChange?.(next);
  };
  const currentItem = groups.flatMap((g) => pagesIn(g.items)).find((i) => i.id === current);
  const rows = useRef(new Map<string, HTMLLIElement | null>());
  const drag = useRef<{ group: string; id: string; y: number; moved: boolean } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [said, setSaid] = useState('');
  const anchor = (i: NavigationItem) => (
    <a href={i.href} data-dl-part="item" aria-current={i.id === current ? 'page' : undefined} onClick={onNavigate && (() => onNavigate(i.id))}>
      {i.picture || i.icon || i.meta ? (
        <>
          {(i.picture || i.icon) && (
            <span data-dl-part="item-mark" aria-hidden="true">
              {i.picture ? <img src={i.picture} alt="" loading="lazy" decoding="async" /> : <Icon name={i.icon!} />}
            </span>
          )}
          <span data-dl-part="item-words">
            <span data-dl-part="item-name">{i.label}</span>
            {i.meta && <span data-dl-part="item-meta">{i.meta}</span>}
          </span>
        </>
      ) : (
        i.label
      )}
    </a>
  );
  const link = (i: NavigationItem) => <li key={i.id}>{anchor(i)}</li>;
  // A reorderable group: a drag reorders under the pointer at once, as a reorderable List does; Alt+arrows move one step.
  const movable = (g: NavigationGroup) => {
    const pages = g.items.filter((e): e is NavigationItem => !isFamily(e));
    const ids = pages.map((p) => p.id);
    const move = (from: number, to: number) => {
      if (from === to || to < 0 || to >= ids.length) return;
      g.onReorder?.(moveItem(ids, from, to));
      setSaid(`Moved ${pages[from].label} to position ${to + 1} of ${ids.length}.`);
    };
    const onMove = (e: PointerEvent<HTMLSpanElement>) => {
      const d = drag.current;
      if (!d || d.group !== g.id) return;
      if (!d.moved && Math.abs(e.clientY - d.y) < 4) return;
      if (!d.moved) setDragId(d.id);
      d.moved = true;
      const from = ids.indexOf(d.id);
      const at = dropIndex(ids.map((id) => rows.current.get(id)!.getBoundingClientRect()), e.clientY);
      move(from, at > from ? at - 1 : at);
    };
    const onUp = () => {
      setDragId(null);
      drag.current = null;
    };
    return pages.map((p, i) => (
      <li key={p.id} data-dl-part="row" data-dragging={dragId === p.id ? '' : undefined} ref={(el) => void rows.current.set(p.id, el)}>
        {anchor(p)}
        <span
          data-dl-part="handle"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = { group: g.id, id: p.id, y: e.clientY, moved: false };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
            if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
            e.preventDefault();
            move(i, i + (e.key === 'ArrowUp' ? -1 : 1));
          }}
        >
          <Button label={(g.moveLabel ?? 'Move {label}').replace('{label}', p.label)} icon="drag" iconOnly size="s" emphasis="quiet" />
        </span>
      </li>
    ));
  };
  const entry = (e: NavigationItem | NavigationFamily, scope: string): ReactNode => {
    if (!isFamily(e)) return link(e);
    const isOpen = opened.includes(e.id);
    const listId = `${base}-${scope}-${e.id}`;
    return (
      <li key={e.id} data-dl-part="family">
        <button type="button" data-dl-part="family-toggle" aria-expanded={isOpen} aria-controls={listId} onClick={() => toggle(e.id)}>
          <Icon name={isOpen ? 'chevron-down' : 'chevron-end'} size="sm" />
          {e.title}
        </button>
        <ul id={listId} data-dl-part="family-items" aria-label={e.title} hidden={!isOpen}>
          {e.items.map((x) => entry(x, `${scope}-${e.id}`))}
        </ul>
      </li>
    );
  };
  const list = (
    <div data-dl-part="groups">
      {groups.map((g) => (
        <div key={g.id} data-dl-part="group">
          <Heading level={headingLevel} size={4} id={`${base}-${g.id}`} data-hidden={g.hideTitle ? '' : undefined}>
            {g.title}
          </Heading>
          <ul data-dl-part="items" aria-labelledby={`${base}-${g.id}`} data-reorder={g.reorderable ? '' : undefined}>
            {g.reorderable ? movable(g) : g.items.map((e) => entry(e, g.id))}
          </ul>
        </div>
      ))}
    </div>
  );
  return (
    <div {...data} data-dl="navigation" data-size={size === 's' ? 's' : undefined}>
      {collapsed ? (
        <details data-dl-part="disclosure" open={open} onToggle={(e) => onOpenChange?.(e.currentTarget.open)}>
          <summary>
            <Icon name="chevron-down" size="sm" />
            {currentItem?.label ?? fallbackLabel}
          </summary>
          {list}
        </details>
      ) : (
        list
      )}
      {groups.some((g) => g.reorderable) && (
        <span data-dl-part="reorder-announce" role="status">
          {said}
        </span>
      )}
    </div>
  );
}