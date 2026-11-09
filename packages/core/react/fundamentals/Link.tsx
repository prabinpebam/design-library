import type { ReactNode } from 'react';
import { Icon } from './Icon';
import type { DataAttributes } from '../types';

export interface LinkProps extends DataAttributes {
  /** Where it goes: a URL or an in-app route. */
  href: string;
  /** Link text that says where it goes; never "click here". */
  children: ReactNode;
  /** Marks the link to the page the person is on. */
  current?: boolean;
  /** Goes to another site: shows the external icon with a spoken twin. Opens in the same tab. */
  external?: boolean;
  /** Opens in a new browser tab (`target="_blank"`, `rel="noopener"`): shows the new-tab icon with a spoken twin. For something the person keeps beside this page, like a standalone preview. */
  newTab?: boolean;
}

/**
 * Navigates to a URL or route.
 * Not for performing an action on this page (use Button).
 * @tier fundamental
 * @family text
 * @a11y Native `a[href]`; underlined so it is never colour alone; `aria-current="page"` when current.
 * @key Enter: follows the link
 */
export function Link({ href, children, current = false, external = false, newTab = false, ...data }: LinkProps) {
  return (
    <a {...data} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener' : undefined} data-dl="link" aria-current={current ? 'page' : undefined}>
      {children}
      {(external || newTab) && <Icon name="external" size="sm" label={newTab ? '(opens in a new tab)' : '(another site)'} />}
    </a>
  );
}
