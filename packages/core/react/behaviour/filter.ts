/**
 * Tier 0 behaviour: filter as you type (IP29, ui-states "one honest status"). A list narrows after a short pause in
 * typing (`--duration-filter-delay`), not on every keystroke and not only on Enter, and its count is said once through
 * the polite announcer when it settles. Clearing the query shows everything at once. Words come from the caller: core
 * holds none.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { announce } from './announce';
import { cssMs } from './anchor';

function fold(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** True when every word of `query` is in `text`, ignoring case and accents. An empty query matches everything. */
export function matchText(text: string, query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = fold(text);
  return words.every((w) => hay.includes(w));
}

/** The pause, in ms, a filter waits after the last keystroke: the `--duration-filter-delay` token. */
export function filterDelay(): number {
  if (typeof document === 'undefined') return 0;
  return cssMs(document.documentElement, '--duration-filter-delay') || 250;
}

/** `value`, held until it has stopped changing for `delay` ms (default: the filter delay token). */
export function useDebouncedValue<T>(value: T, delay?: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    if (Object.is(value, settled)) return;
    const t = window.setTimeout(() => setSettled(value), delay ?? filterDelay());
    return () => window.clearTimeout(t);
  }, [value, settled, delay]);
  return settled;
}

export interface FilterOptions<T> {
  /** The text a query is matched against; defaults to `String(item)`. Ignored when `match` is given. */
  text?: (item: T) => string;
  /** Your own test, for fields or ranking the default word match doesn't cover. */
  match?: (item: T, query: string) => boolean;
  /** The pause after the last keystroke, in ms; defaults to the `--duration-filter-delay` token. */
  delay?: number;
  /** The count in your words, e.g. `(shown, total) => \`${shown} of ${total} walks\``: shown under the field and said once, politely, each time the result settles on a new count. */
  count?: (shown: number, total: number, query: string) => string;
}

export interface Filtered<T> {
  /** The items that match the settled query. */
  shown: T[];
  /** The query the list is showing (trimmed); lags the field by the delay while typing. */
  query: string;
  /** True while the person is typing and the list hasn't caught up. */
  pending: boolean;
  /** `count(...)` for the shown list, for the visible status line; the same words are announced. */
  status?: string;
}

/**
 * Narrows `items` by `query` after a pause in typing, and says the count once when it settles. Pair it with a
 * `TextField` in `mode="form"` with `onChange`, and show `status` under the field:
 * `const { shown, status } = useFilter(walks, query, { count: (n, all) => \`${n} of ${all} walks\` });`
 */
export function useFilter<T>(items: readonly T[], query: string, { text, match, delay, count }: FilterOptions<T> = {}): Filtered<T> {
  const typed = query.trim();
  const debounced = useDebouncedValue(typed, delay);
  // Clearing never waits: the whole list comes back with the field.
  const settled = typed === '' ? '' : debounced;
  const shown = useMemo(() => (settled ? items.filter((item) => (match ? match(item, settled) : matchText(text ? text(item) : String(item), settled))) : [...items]), [items, settled, match, text]);
  const status = count?.(shown.length, items.length, settled);

  const said = useRef<string | undefined>(status);
  useEffect(() => {
    if (status === undefined || status === said.current) return;
    said.current = status;
    announce(status);
  }, [status]);

  return { shown, query: settled, pending: typed !== settled, status };
}
