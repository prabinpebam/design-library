/**
 * Presence (Q65 P5, strategy S4): keeps something React would unmount mounted through its exit, so it can leave as it
 * arrived. Tier 0 behaviour, no styles. The exit lasts the longer of the move and quick roles read from the page, so a
 * collapse or a fade finishes before the element goes; with reduced motion only the fade remains.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { durationOf } from './flip';

/** How long an exit takes on this page: the longer of `--duration-move` and `--duration-quick`. */
export function exitDuration(el: Element = document.documentElement): number {
  return Math.max(durationOf(el, '--duration-move'), durationOf(el, '--duration-quick'));
}

/**
 * Whether to keep rendering: true while `present`, and for the exit's length after it turns false. A return to present
 * during the exit cancels it (the element reverses from where it is, never remounts).
 */
export function usePresence(present: boolean, exitMs?: number): boolean {
  const [leaving, setLeaving] = useState(false);
  const [was, setWas] = useState(present);
  if (was !== present) {
    setWas(present);
    setLeaving(!present);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(false), exitMs ?? exitDuration());
    return () => window.clearTimeout(t);
  }, [leaving, exitMs]);
  return present || leaving;
}

/**
 * A list whose removed items stay in place, marked leaving, for the exit's length (S4 for list members React would
 * unmount at once: notification pills, rows). An item that comes back while leaving simply stays. Several removed
 * together leave together, as one change (MU8).
 */
export function useExiting<T>(items: T[], keyOf: (item: T) => string, exitMs?: number): { item: T; leaving: boolean }[] {
  const previous = useRef(items);
  const [gone, setGone] = useState<{ item: T; index: number }[]>([]);
  useLayoutEffect(() => {
    const now = new Set(items.map(keyOf));
    const removed = previous.current.map((item, index) => ({ item, index })).filter((x) => !now.has(keyOf(x.item)));
    previous.current = items;
    setGone((g) => {
      const kept = g.filter((x) => !now.has(keyOf(x.item)));
      return removed.length || kept.length !== g.length ? [...kept, ...removed] : g;
    });
    if (!removed.length) return;
    const keys = new Set(removed.map((r) => keyOf(r.item)));
    window.setTimeout(() => setGone((g) => g.filter((x) => !keys.has(keyOf(x.item)))), exitMs ?? exitDuration());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  const out = items.map((item) => ({ item, leaving: false }));
  for (const g of [...gone].sort((a, b) => a.index - b.index)) out.splice(Math.min(g.index, out.length), 0, { item: g.item, leaving: true });
  return out;
}
