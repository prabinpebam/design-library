import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { ListItem } from './ListItem';
import type { ListItemProps } from './ListItem';
import { MenuButton } from './MenuButton';
import { ScrollArea } from './ScrollArea';
import { dropIndex, moveItem, movesFor } from '../behaviour/reorder';
import { useFlipList } from '../behaviour/flip';
import { useExiting } from '../behaviour/presence';
import { listboxKey, range, typeAhead } from '../behaviour/listbox';
import type { ListboxItem, ListboxState } from '../behaviour/listbox';
import type { DataAttributes } from '../types';

export interface StaticListProps extends DataAttributes {
  mode?: 'static';
  items: ListEntry[];
  /** `bulleted` notes read one after another; `numbered` steps or a ranking, where order is the meaning; `plain` items with no marker; `inline` short names that wrap in a row. */
  variant?: 'bulleted' | 'numbered' | 'plain' | 'inline';
  /** Lines between `plain` items: `between` full width; `all` a line above every item, the first too (entries that each open with a rule). */
  dividers?: 'none' | 'between' | 'all';
  /** Each item gets a Move handle: drag it, or open its menu (Move up, down, to top, to bottom). Items need a `label`. */
  reorderable?: boolean;
  /** The ids in their new order, after a drag step or a Move. */
  onReorder?: (ids: string[]) => void;
}

export interface ActionListProps extends DataAttributes {
  /** Actions on the page (a "More" list, a settings index, a folder's contents): each item runs or opens something. */
  mode: 'action';
  /** Names the list for assistive technology when no heading above says what it is. */
  label?: string;
  /** The actions, or `groups` of them; one of the two. */
  actions?: ListAction[];
  groups?: ListActionGroup[];
  /** The items' size: `s` for dense panels, `l` for avatars and pictures. */
  size?: ListItemProps['size'];
  /** Lines between items: `between` full width, `inset` from the words (past the leading visual), `groups` only between groups. One line per boundary. */
  dividers?: 'none' | 'between' | 'inset' | 'groups';
  /**
   * `rows` (default) one action per line. `tiles` a grid of tiles, as many across as fit at `--c-list-tile-min`, each
   * the whole tile a button with its icon above its name and description: a catalogue of things to add. Groups keep
   * their headings; tiles need no dividers.
   */
  layout?: 'rows' | 'tiles';
}

/** One action of an action list: an id, what ListItem draws, and what it does. */
export interface ListAction extends Pick<ListItemProps, 'label' | 'description' | 'descriptionPosition' | 'icon' | 'inset' | 'avatar' | 'thumbnail' | 'meta' | 'tone' | 'unread' | 'busy' | 'disabled' | 'inactive' | 'drillIn' | 'trailing'> {
  id: string;
  /** Runs the action or opens the deeper level. */
  onSelect: () => void;
}

/** A titled group of actions; the heading may be left out when dividers separate the groups. */
export interface ListActionGroup {
  id: string;
  heading?: string;
  actions: ListAction[];
}

export interface SelectListProps extends DataAttributes {
  /** A list a person chooses from on the page (a master list beside its detail, a filter): a listbox. */
  mode: 'select';
  /** Names the list for assistive technology, e.g. "Reviewers". */
  label: string;
  /** `single`: one item is chosen. `multiple`: any number, each with a box. */
  selection: 'single' | 'multiple';
  /** The options, or `groups` of them; one of the two. */
  options?: ListOption[];
  groups?: ListGroup[];
  /** The chosen ids. */
  value: string[];
  onChange: (value: string[]) => void;
  /** The items' size: `s` for dense panels, `l` for avatars and pictures. */
  size?: ListItemProps['size'];
  /** Group headings stay at the top while their options scroll under them. Needs `maxSize`. */
  stickyHeadings?: boolean;
  /** The most the list grows before it scrolls. */
  maxSize?: 'sm' | 'md' | 'lg';
  /** With `single`: how the chosen item shows. `check` (default) a trailing check over the fill; `fill` the fill alone, for a list of where you are (a form's sections) whose chosen item's content shows beside it. */
  mark?: 'check' | 'fill';
}

/** One item of a static list. */
export interface ListEntry {
  /** Stable key for the item. */
  id: string;
  content: ReactNode;
  /** The item's name in words, for its Move button and announcements in a reorderable list ("Move Design review"). */
  label?: string;
  /** `data-*` attributes for the item, for tooling such as revision anchors. */
  data?: DataAttributes;
}

/** One option of a selectable list: an id plus what ListItem draws. */
export interface ListOption extends Pick<ListItemProps, 'label' | 'description' | 'descriptionPosition' | 'icon' | 'avatar' | 'thumbnail' | 'meta' | 'unread' | 'disabled' | 'inactive'> {
  id: string;
}

/** A titled group of options. */
export interface ListGroup {
  id: string;
  heading: string;
  options: ListOption[];
}

export interface GridListProps extends DataAttributes {
  /** Rows that can be chosen and also hold their own controls (a file list with Share and More): a grid. */
  mode: 'grid';
  /** Names the list for assistive technology, e.g. "Files". */
  label: string;
  rows: GridListRow[];
  /** `none`: rows only run their action; `single` or `multiple`: Space or a click chooses rows, kept apart from the rows' controls. */
  selection?: 'none' | 'single' | 'multiple';
  /** The chosen ids. */
  value?: string[];
  onChange?: (value: string[]) => void;
  /** The rows' size: `s` for dense panels, `l` for avatars and pictures. */
  size?: ListItemProps['size'];
}

/** One row of a grid list: what ListItem draws, its controls, and its action. */
export interface GridListRow extends Pick<ListItemProps, 'label' | 'description' | 'icon' | 'avatar' | 'thumbnail' | 'meta' | 'disabled'> {
  id: string;
  /** Opens or runs the row (Enter, or a click when nothing is being chosen). */
  onAction?: () => void;
  /** The row's own controls: icon-only Buttons or a MenuButton. Reached with the right arrow, never by Tab. */
  controls?: ReactNode;
}

export type ListProps = StaticListProps | SelectListProps | ActionListProps | GridListProps;

/**
 * Items that belong together. Static: notes, numbered steps, plain items or short names in a row. Select: a list a
 * person chooses one or several items from on the page, drawn with ListItem like every popup list. Action: items that run
 * or open something on the page (drill-in rows show a chevron), with optional groups and dividers.
 * Not for navigation (use Navigation), term and details pairs (use DescriptionList), a choice in a closed field (use
 * Select) or actions that belong in a popup (a menu: MenuButton).
 * @tier fundamental
 * @family text
 * @a11y Static: a native `ul` or `ol`, so its length is announced; inline keeps list semantics. Select: one Tab stop, a
 * `listbox` (`aria-multiselectable` for several) pointing at the keyboard's option with `aria-activedescendant`; groups
 * are `group`s named by their heading. Grid: a `grid` of `row`s with one Tab stop; arrows move between rows and into a
 * row's controls, Space chooses, Enter runs the row; selection and the controls never get in each other's way. Action: a `ul` of `button` items, each its own Tab stop; groups are lists named by
 * their heading; dividers are drawn, never announced. Keys follow the APG listbox; the multiple model needs no held modifier. Choosing
 * is explicit (Space, Enter or a click), so moving through the list never changes anything.
 * @key ArrowDown / ArrowUp: the next or previous option (unavailable ones skipped)
 * @key Home / End: the first or last option
 * @key Space / Enter: choose the option (multiple: toggle it)
 * @key Shift+ArrowDown / Shift+ArrowUp: move and choose (multiple)
 * @key Shift+Space: choose every option from the last one chosen to this one (multiple)
 * @key Ctrl+A: choose all, or none when all are chosen (multiple)
 * @key Letters: jump to the next option starting with what was typed
 */
export function List(props: ListProps) {
  return props.mode === 'select' ? <SelectList {...props} /> : props.mode === 'action' ? <ActionList {...props} /> : props.mode === 'grid' ? <GridList {...props} /> : <StaticList {...props} />;
}

function StaticList(props: StaticListProps) {
  return props.reorderable ? <ReorderList {...props} /> : <PlainList {...props} />;
}

function PlainList({ items, variant = 'bulleted', dividers = 'none', reorderable: _r, onReorder: _o, mode: _mode, ...data }: StaticListProps) {
  const Tag = variant === 'numbered' ? 'ol' : 'ul';
  // Q65 C11: an item added fades in, one removed fades out where it is, and the others travel into place (MU8).
  const shown = useExiting(items, (i) => i.id);
  const root = useFlipList<HTMLUListElement & HTMLOListElement>(shown.map(({ item, leaving }) => (leaving ? `${item.id}:leaving` : item.id)).join('|'), { size: true });
  return (
    <Tag {...data} ref={root} data-dl="list" data-variant={variant} data-dividers={dividers === 'none' ? undefined : dividers}>
      {shown.map(({ item, leaving }) => (
        <li key={item.id} {...item.data} data-flip-key={item.id} data-presence="item" data-leaving={leaving ? '' : undefined} inert={leaving} aria-hidden={leaving || undefined}>
          {item.content}
        </li>
      ))}
    </Tag>
  );
}

function ReorderList({ items, variant = 'plain', dividers = 'none', onReorder, reorderable: _r, mode: _mode, ...data }: StaticListProps) {
  const Tag = variant === 'numbered' ? 'ol' : 'ul';
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const drag = useRef<{ from: number; y: number; moved: boolean; id: string } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [said, setSaid] = useState('');
  const ids = items.map((i) => i.id);
  // Q65 C11: a Move from the menu slides the rows into their new order; a drag reorders under the pointer at once (Z5).
  const root = useFlipList<HTMLUListElement & HTMLOListElement>(ids.join('|'), { paused: dragId !== null });
  const name = (id: string) => items.find((i) => i.id === id)?.label ?? id;
  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = moveItem(ids, from, to);
    onReorder?.(next);
    setSaid(`Moved ${name(ids[from])} to position ${to + 1} of ${ids.length}.`);
  };
  const onDown = (i: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.button !== 0) return;
    drag.current = { from: i, y: e.clientY, moved: false, id: ids[i] };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientY - d.y) < 4) return;
    if (!d.moved) setDragId(d.id);
    d.moved = true;
    const from = ids.indexOf(d.id);
    const at = dropIndex(rows.current.slice(0, ids.length).map((r) => r!.getBoundingClientRect()), e.clientY);
    const to = at > from ? at - 1 : at;
    if (to !== from) move(from, to);
  };
  const onUp = () => {
    setDragId(null);
    setTimeout(() => (drag.current = null));
  };
  return (
    <>
      <Tag {...data} ref={root} data-dl="list" data-variant={variant} data-reorder="" data-dividers={dividers === 'none' ? undefined : dividers}>
        {items.map((item, i) => (
          <li key={item.id} {...item.data} data-flip-key={item.id} ref={(el) => void (rows.current[i] = el)} data-dragging={dragId === item.id ? '' : undefined}>
            <span data-dl-part="row">
              <span
                data-dl-part="handle"
                onPointerDown={onDown(i)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onClickCapture={(e) => {
                  if (drag.current?.moved) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <MenuButton
                  label={`Move ${item.label ?? item.id}`}
                  icon="menu"
                  iconOnly
                  emphasis="quiet"
                  size="s"
                  items={movesFor(i, items.length)}
                  onSelect={(v) => move(i, movesFor(i, items.length).find((m) => m.value === v)!.to)}
                />
              </span>
              <span data-dl-part="content">{item.content}</span>
            </span>
          </li>
        ))}
      </Tag>
      <span data-dl-part="reorder-announce" role="status">
        {said}
      </span>
    </>
  );
}

const focusables = ':is(button, a[href], input, select, textarea)';

function GridList({ label, rows, selection = 'none', value = [], onChange, size, mode: _mode, ...data }: GridListProps) {
  const [at, setAt] = useState(0);
  const grid = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  // A row's controls are reached with the arrows, never by Tab: the grid keeps one Tab stop.
  useEffect(() => {
    grid.current?.querySelectorAll(`[data-dl-part='item-trailing'] ${focusables}`).forEach((el) => el.setAttribute('tabindex', '-1'));
  });
  const focusRow = (i: number) => {
    const n = Math.max(0, Math.min(rows.length - 1, i));
    setAt(n);
    refs.current[n]?.focus();
  };
  const choose = (row: GridListRow) => {
    if (row.disabled || selection === 'none') return;
    if (selection === 'single') return onChange?.([row.id]);
    onChange?.(value.includes(row.id) ? value.filter((v) => v !== row.id) : [...value, row.id]);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const rowEl = target.closest<HTMLDivElement>('[role=row]');
    const i = rowEl ? refs.current.indexOf(rowEl) : -1;
    if (i < 0) return;
    const controls = [...rowEl!.querySelectorAll<HTMLElement>(`[data-dl-part='item-trailing'] ${focusables}`)];
    const onRow = target === rowEl;
    const c = controls.indexOf(target);
    if (!onRow && c < 0) return;
    const rtl = getComputedStyle(rowEl!).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const row = rows[i]!;
    let done = true;
    if (onRow && e.key === 'ArrowDown') focusRow(i + 1);
    else if (onRow && e.key === 'ArrowUp') focusRow(i - 1);
    else if (onRow && e.key === 'Home') focusRow(0);
    else if (onRow && e.key === 'End') focusRow(rows.length - 1);
    else if (e.key === fwd && (onRow ? controls[0] : controls[c + 1])) (onRow ? controls[0] : controls[c + 1])!.focus();
    else if (e.key === back && !onRow) (c === 0 ? rowEl : controls[c - 1])!.focus();
    else if (!onRow && e.key === 'Escape') rowEl!.focus();
    else if (onRow && e.key === ' ') choose(row);
    else if (onRow && e.key === 'Enter') (row.onAction && !row.disabled ? row.onAction() : choose(row));
    else done = false;
    if (done) e.preventDefault();
  };
  return (
    <div
      {...data}
      ref={grid}
      data-dl="list"
      data-mode="grid"
      role="grid"
      aria-label={label}
      aria-multiselectable={selection === 'multiple' || undefined}
      onKeyDown={onKeyDown}
      onFocus={(e) => {
        const i = refs.current.indexOf((e.target as HTMLElement).closest<HTMLDivElement>('[role=row]'));
        if (i >= 0 && i !== at) setAt(i);
      }}
    >
      {rows.map((row, i) => {
        const { id, onAction, controls, ...shown } = row;
        return (
          <ListItem
            key={id}
            {...shown}
            role="row"
            size={size}
            multiple={selection === 'multiple'}
            selected={selection === 'none' ? undefined : value.includes(id)}
            tabbable={i === at}
            trailing={controls}
            itemRef={(el) => void (refs.current[i] = el)}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("[data-dl-part='item-trailing']")) return;
              setAt(i);
              if (selection === 'none') onAction?.();
              else choose(row);
            }}
          />
        );
      })}
    </div>
  );
}

function ActionList({ label, actions, groups, size, dividers = 'none', layout = 'rows', mode: _mode, ...data }: ActionListProps) {
  const base = useId();
  const tiles = layout === 'tiles';
  const item = ({ id, onSelect, ...shown }: ListAction) => (
    <li key={id}>
      <ListItem {...shown} role="button" size={size} layout={tiles ? 'tile' : undefined} onClick={onSelect} />
    </li>
  );
  const marks = { 'data-dl': 'list', 'data-mode': 'action', 'data-layout': tiles ? 'tiles' : undefined, 'data-dividers': dividers === 'none' || tiles ? undefined : dividers };
  if (!groups)
    return (
      <ul {...data} {...marks} aria-label={label}>
        {(actions ?? []).map(item)}
      </ul>
    );
  return (
    <div {...data} {...marks} role={label ? 'group' : undefined} aria-label={label}>
      {groups.map((g) => (
        <div key={g.id} data-dl-part="group">
          {g.heading && (
            <div id={`${base}-${g.id}`} data-dl-part="group-heading">
              {g.heading}
            </div>
          )}
          <ul aria-labelledby={g.heading ? `${base}-${g.id}` : undefined}>{g.actions.map(item)}</ul>
        </div>
      ))}
    </div>
  );
}

function SelectList({ label, selection, options, groups, value, onChange, size, stickyHeadings, maxSize, mark, mode: _mode, ...data }: SelectListProps) {
  const base = useId();
  const sections = groups ?? [{ id: '', heading: '', options: options ?? [] }];
  const flat: ListOption[] = sections.flatMap((g) => g.options);
  const items: ListboxItem[] = flat.map(({ id, label: name, disabled, inactive }) => ({ id, label: name, disabled, inactive }));
  const multiple = selection === 'multiple';
  const [cursor, setCursor] = useState({ active: -1, anchor: -1 });
  const typed = useRef({ query: '', at: 0 });
  const state: ListboxState = { ...cursor, selected: value };
  const optionId = (i: number) => `${base}-${i}`;

  const apply = (next: ListboxState) => {
    setCursor({ active: next.active, anchor: next.anchor });
    if (next.selected !== value) onChange(next.selected);
    if (next.active >= 0) document.getElementById(optionId(next.active))?.scrollIntoView({ block: 'nearest' });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = listboxKey(items, state, { key: event.key, shift: event.shiftKey, ctrl: event.ctrlKey || event.metaKey }, multiple);
    if (next) {
      event.preventDefault();
      apply(next);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = event.timeStamp;
      const query = now - typed.current.at < 500 ? typed.current.query + event.key : event.key;
      typed.current = { query, at: now };
      apply({ ...state, active: typeAhead(items, query.length > 1 ? cursor.active - 1 : cursor.active, query) });
    }
  };

  const choose = (i: number, shift: boolean) => {
    const item = items[i]!;
    if (item.disabled) return;
    if (item.inactive) return apply({ ...state, active: i });
    if (!multiple) return apply({ active: i, anchor: i, selected: [item.id] });
    if (shift && cursor.anchor >= 0) return apply({ active: i, anchor: cursor.anchor, selected: range(items, cursor.anchor, i, value) });
    apply({ active: i, anchor: i, selected: value.includes(item.id) ? value.filter((v) => v !== item.id) : [...value, item.id] });
  };

  let index = -1;
  const option = (o: ListOption) => {
    const i = ++index;
    const { id, ...shown } = o;
    return (
      <ListItem
        key={id}
        {...shown}
        id={optionId(i)}
        role="option"
        size={size}
        multiple={multiple}
        mark={mark}
        selected={value.includes(id)}
        active={cursor.active === i}
        onClick={(event) => choose(i, event.shiftKey)}
      />
    );
  };

  const list = (
    <div
      {...data}
      data-dl="list"
      data-mode="select"
      data-sticky={stickyHeadings ? '' : undefined}
      role="listbox"
      aria-label={label}
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={cursor.active >= 0 ? optionId(cursor.active) : undefined}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseDown={(event) => {
        event.preventDefault();
        event.currentTarget.focus();
      }}
      onFocus={() => {
        if (cursor.active < 0) setCursor({ active: Math.max(0, flat.findIndex((o) => value.includes(o.id))), anchor: cursor.anchor });
      }}
      onBlur={() => setCursor({ active: -1, anchor: cursor.anchor })}
    >
      {groups
        ? sections.map((g) => (
            <div key={g.id} role="group" aria-labelledby={`${base}-${g.id}`} data-dl-part="group">
              <div id={`${base}-${g.id}`} data-dl-part="group-heading" role="presentation">
                {g.heading}
              </div>
              {g.options.map(option)}
            </div>
          ))
        : sections[0]!.options.map(option)}
    </div>
  );

  return maxSize ? (
    <ScrollArea maxSize={maxSize} inset="none">
      {list}
    </ScrollArea>
  ) : (
    list
  );
}
