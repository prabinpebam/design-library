import type { ReactNode } from 'react';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface TitleBarProps extends DataAttributes {
  /** The product's name; links home. */
  title: string;
  /** Where the name leads: the app's home or overview. */
  href: string;
  /** One short line after the name: version and status. */
  meta?: string;
  /** App-wide controls at the end, such as appearance choices and pane toggles. Each needs its own accessible name. */
  actions?: ReactNode;
}

/**
 * The top of an app: who it is (name, version, status) at the start and app-wide controls at the end.
 * Not for page titles (use PageHeader) or for navigation between pages (use Navigation).
 * @tier compound
 * @family navigation
 * @a11y Place it in the header landmark (LibraryLayout's header region is one). The name is a link home; the actions
 * keep their own names and targets and wrap below the identity on narrow screens instead of overlapping it.
 * @key Tab: reaches the name, then each action in order
 */
export function TitleBar({ title, href, meta, actions, ...data }: TitleBarProps) {
  return (
    <div {...data} data-dl="title-bar" data-material="chrome" data-elevation="2">
      <span data-dl-part="identity">
        <a href={href} data-dl-part="name">
          {title}
        </a>
        {meta && (
          <Text as="span" variant="body-sm" tone="muted">
            {meta}
          </Text>
        )}
      </span>
      {actions && <span data-dl-part="actions">{actions}</span>}
    </div>
  );
}
