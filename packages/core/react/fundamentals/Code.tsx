import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface CodeProps extends DataAttributes {
  /** The code or the key's name, exactly as typed. */
  children: ReactNode;
  /** `code` for a token, prop, path or snippet in running text; `key` for a key on the keyboard, drawn as a key cap. */
  kind?: 'code' | 'key';
}

/**
 * A short piece of code or a key name inside text: a token, a prop, a path, or a key such as Enter.
 * Not for more than one line or for code someone will copy (use CodeBlock).
 * @tier fundamental
 * @family text
 * @a11y `code` or `kbd`, so assistive technology can tell code and keys from prose. Write key names in full ("Enter",
 * "Space", "Arrow Up"), never as symbols only.
 */
export function Code({ children, kind = 'code', ...data }: CodeProps) {
  return kind === 'key' ? (
    <kbd {...data} data-dl="code" data-kind="key">
      {children}
    </kbd>
  ) : (
    <code {...data} data-dl="code">
      {children}
    </code>
  );
}
