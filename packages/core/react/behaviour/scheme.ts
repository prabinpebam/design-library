import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { suspendMotion } from './motion';

/** A person's colour scheme choice: one of the two schemes, or follow the system setting. */
export type SchemeChoice = 'light' | 'dark' | 'system';

export interface SchemeOptions {
  /** Where the choice is remembered (localStorage). Default `design-library.scheme`. */
  storageKey?: string;
  /** The element that carries `data-scheme`. Default the document root; a subtree for a preview. */
  root?: HTMLElement | null;
}

const DEFAULT_KEY = 'design-library.scheme';
const DARK = '(prefers-color-scheme: dark)';
const listeners = new Map<string, Set<() => void>>();
const memory = new Map<string, SchemeChoice>();
/** The choice each element showed before anyone chose here: the site's own attribute, or what `applyScheme` applied first. */
const firstSeen = new WeakMap<HTMLElement, SchemeChoice>();

const isChoice = (v: unknown): v is SchemeChoice => v === 'light' || v === 'dark' || v === 'system';

/** The remembered choice, or `null` when there is none (or storage is blocked and nothing was chosen this visit). */
export function readScheme(storageKey: string = DEFAULT_KEY): SchemeChoice | null {
  if (memory.has(storageKey)) return memory.get(storageKey)!;
  try {
    const stored = localStorage.getItem(storageKey);
    return isChoice(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** The scheme a choice draws now: `system` follows the operating system's setting. */
export function resolveScheme(choice: SchemeChoice): 'light' | 'dark' {
  if (choice !== 'system') return choice;
  return typeof matchMedia === 'function' && matchMedia(DARK).matches ? 'dark' : 'light';
}

/**
 * Sets `data-scheme` on the root to what the choice draws now, with motion suspended so the page switches in one frame.
 * Call it once before the first render (`applyScheme(readScheme() ?? 'system')`) so a remembered dark scheme never
 * flashes light.
 */
export function applyScheme(choice: SchemeChoice, root: HTMLElement = document.documentElement) {
  if (!firstSeen.has(root)) firstSeen.set(root, choice);
  const next = resolveScheme(choice);
  if (root.dataset.scheme === next) return;
  suspendMotion(() => (root.dataset.scheme = next), root);
}

function initial(storageKey: string, root: HTMLElement | null | undefined): SchemeChoice {
  const remembered = readScheme(storageKey);
  if (remembered) return remembered;
  const el = root === undefined ? (typeof document === 'undefined' ? null : document.documentElement) : root;
  if (!el) return 'system';
  // A scheme the site set before anyone chose shows as that scheme; with none, the page follows the system. Read once
  // per element, so the scheme this hook writes there later isn't mistaken for the site's.
  if (!firstSeen.has(el)) {
    const set = el.dataset.scheme;
    firstSeen.set(el, set === 'light' || set === 'dark' ? set : 'system');
  }
  return firstSeen.get(el)!;
}

function subscribe(storageKey: string, notify: () => void) {
  let set = listeners.get(storageKey);
  if (!set) listeners.set(storageKey, (set = new Set()));
  set.add(notify);
  const media = typeof matchMedia === 'function' ? matchMedia(DARK) : null;
  media?.addEventListener('change', notify);
  const storage = (e: StorageEvent) => {
    if (e.key !== storageKey) return;
    memory.delete(storageKey);
    notify();
  };
  window.addEventListener('storage', storage);
  return () => {
    set!.delete(notify);
    media?.removeEventListener('change', notify);
    window.removeEventListener('storage', storage);
  };
}

/**
 * The colour scheme choice for a page or a subtree: what is chosen, what it draws now and a setter that applies the
 * choice at once and remembers it. Every control using the same `storageKey` stays in agreement, `system` follows the
 * operating system as it changes, and another tab's choice arrives through the storage event. Behaviour only; no styles.
 */
export function useScheme({ storageKey = DEFAULT_KEY, root }: SchemeOptions = {}) {
  const read = useCallback(() => {
    const choice = memory.get(storageKey) ?? initial(storageKey, root);
    return `${choice}:${resolveScheme(choice)}`;
  }, [storageKey, root]);
  const snapshot = useSyncExternalStore(
    useCallback((notify) => subscribe(storageKey, notify), [storageKey]),
    read,
    () => 'system:light',
  );
  const [choice, resolved] = snapshot.split(':') as [SchemeChoice, 'light' | 'dark'];

  useEffect(() => {
    const target = root === undefined ? document.documentElement : root;
    if (target) applyScheme(choice, target);
  }, [choice, resolved, root]);

  const setScheme = useCallback(
    (next: SchemeChoice) => {
      memory.set(storageKey, next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // Storage blocked (private mode): the choice lasts this visit.
      }
      listeners.get(storageKey)?.forEach((notify) => notify());
    },
    [storageKey],
  );

  return { scheme: choice, resolved, setScheme };
}
