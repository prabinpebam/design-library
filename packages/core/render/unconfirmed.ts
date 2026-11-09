/**
 * Values not yet confirmed (DP4, DR15): any core text value in content may be `{ "unconfirmed": "speaker" }`. The
 * renderer shows the template's phrase for that key, written once in the shared file's `strings.unconfirmed`
 * (`{ "speaker": "Speaker to confirm" }`), so every unconfirmed speaker reads the same and no fallback words live in
 * code. The content check counts them by file, and `--release` fails while any remain.
 */
import type { Unconfirmed } from './types';

/** Whether a content value is a value not yet confirmed. */
export function isUnconfirmed(value: unknown): value is Unconfirmed {
  return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as Unconfirmed).unconfirmed === 'string' && Object.keys(value).length === 1;
}

/**
 * Replaces every unconfirmed value in content with its phrase. A key with no phrase shows the key itself, which the
 * content check reports as an error before it ships.
 */
export function resolveUnconfirmed<T>(value: T, phrases: Record<string, string> = {}): T {
  if (isUnconfirmed(value)) return (phrases[value.unconfirmed] ?? value.unconfirmed) as T;
  if (Array.isArray(value)) return value.map((v) => resolveUnconfirmed(v, phrases)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveUnconfirmed(v, phrases)])) as T;
  return value;
}

/** The unconfirmed values in content, each with its JSON pointer and key, for a review list or a count. */
export function findUnconfirmed(value: unknown, pointer = ''): { pointer: string; key: string }[] {
  if (isUnconfirmed(value)) return [{ pointer: pointer || '/', key: value.unconfirmed }];
  if (Array.isArray(value)) return value.flatMap((v, i) => findUnconfirmed(v, `${pointer}/${i}`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => findUnconfirmed(v, `${pointer}/${k}`));
  return [];
}
