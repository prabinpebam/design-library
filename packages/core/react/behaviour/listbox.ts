/**
 * Tier 0: the WAI-ARIA APG listbox keyboard model as pure functions, for List's select mode.
 * Single: arrows, Home and End move; Space or Enter chooses. Multiple (the recommended model, no held modifier):
 * Space toggles; Shift+arrow moves and toggles the item moved to; Shift+Space chooses the range from the anchor;
 * Ctrl+A chooses all, or none when all are chosen. Unavailable items are skipped; inactive ones are reached.
 */

export interface ListboxItem {
  id: string;
  label: string;
  /** Skipped by the keyboard and never chosen. */
  disabled?: boolean;
  /** Reached by the keyboard, never chosen. */
  inactive?: boolean;
}

export interface ListboxState {
  /** Index of the item the keyboard is on; -1 before any. */
  active: number;
  /** Index the next range starts from (multiple). */
  anchor: number;
  selected: string[];
}

export interface ListboxKey {
  key: string;
  shift?: boolean;
  ctrl?: boolean;
}

const choosable = (item: ListboxItem | undefined) => !!item && !item.disabled && !item.inactive;

function step(items: ListboxItem[], from: number, by: 1 | -1) {
  for (let i = from + by; i >= 0 && i < items.length; i += by) if (!items[i]!.disabled) return i;
  return from;
}

function edge(items: ListboxItem[], end: boolean) {
  return end ? step(items, items.length, -1) : step(items, -1, 1);
}

function toggle(selected: string[], id: string) {
  return selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
}

/** The state after a key, or `null` when the key isn't the listbox's (let it through). */
export function listboxKey(items: ListboxItem[], state: ListboxState, input: ListboxKey, multiple: boolean): ListboxState | null {
  const { key, shift = false, ctrl = false } = input;
  const active = state.active < 0 ? edge(items, false) : state.active;
  const move = (to: number): ListboxState => {
    if (multiple && shift && to !== active && choosable(items[to]) && !state.selected.includes(items[to]!.id)) {
      return { active: to, anchor: to, selected: [...state.selected, items[to]!.id] };
    }
    return { ...state, active: to };
  };
  switch (key) {
    case 'ArrowDown':
      return move(state.active < 0 ? active : step(items, active, 1));
    case 'ArrowUp':
      return move(state.active < 0 ? active : step(items, active, -1));
    case 'Home':
      return { ...state, active: edge(items, false) };
    case 'End':
      return { ...state, active: edge(items, true) };
    case ' ':
    case 'Enter': {
      const item = items[active];
      if (!choosable(item)) return { ...state, active };
      if (!multiple) return { active, anchor: active, selected: [item!.id] };
      if (key === ' ' && shift) return { active, anchor: state.anchor, selected: range(items, state.anchor < 0 ? active : state.anchor, active, state.selected) };
      return { active, anchor: active, selected: toggle(state.selected, item!.id) };
    }
    case 'a':
    case 'A': {
      if (!multiple || !ctrl) return null;
      const all = items.filter(choosable).map((i) => i.id);
      return { ...state, active, selected: all.every((id) => state.selected.includes(id)) ? [] : all };
    }
    default:
      return null;
  }
}

/** Chooses every choosable item between two indexes, keeping what was already chosen. */
export function range(items: ListboxItem[], from: number, to: number, selected: string[]) {
  const [lo, hi] = from < to ? [from, to] : [to, from];
  const ids = items.slice(lo, hi + 1).filter(choosable).map((i) => i.id);
  return [...selected, ...ids.filter((id) => !selected.includes(id))];
}

/** Type-ahead: the next item after `from` whose label starts with `query` (case-insensitive), wrapping; else `from`. */
export function typeAhead(items: ListboxItem[], from: number, query: string) {
  const q = query.toLocaleLowerCase();
  for (let n = 1; n <= items.length; n++) {
    const i = (from + n + items.length) % items.length;
    const item = items[i]!;
    if (!item.disabled && item.label.toLocaleLowerCase().startsWith(q)) return i;
  }
  return from;
}
