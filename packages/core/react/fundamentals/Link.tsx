import type { FocusEvent, PointerEvent, ReactNode } from 'react';
import { Icon } from './Icon';
import { useRouter } from '../behaviour/router';
import type { DataAttributes } from '../types';

export interface LinkProps extends DataAttributes {
  /** Where it goes: a URL or an in-app route. Inside the core router (`@design-library/core/site`), a route (`/talks`) or an anchor (`#speakers`) is written for its mode and handled by it. */
  href: string;
  /** Link text that says where it goes; never "click here". */
  children: ReactNode;
  /** Marks the link to the page the person is on. */
  current?: boolean;
  /** Goes to another site: shows the external icon with a spoken twin. Opens in the same tab. */
  external?: boolean;
  /** Opens in a new browser tab (`target="_blank"`, `rel="noopener"`): shows the new-tab icon with a spoken twin. For something the person keeps beside this page, like a standalone preview. */
  newTab?: boolean;
  /** `accent` (default): the link colour. `neutral`: muted words over a quiet line, the text colour on hover; for the titles in a table's rows or meta links, Still underlined, even with the theme's rest line off, and at least `c.link.neutral-target` high and wide. */
  tone?: 'accent' | 'neutral';
  /** The pointer arrives over it (IP9), e.g. to preview the place it goes. */
  onPointerEnter?: (event: PointerEvent<HTMLAnchorElement>) => void;
  /** The pointer leaves it (IP9). */
  onPointerLeave?: (event: PointerEvent<HTMLAnchorElement>) => void;
  /** It takes focus (IP9): pair with `onPointerEnter` so a keyboard reaches the same preview. */
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void;
  /** It loses focus (IP9). */
  onBlur?: (event: FocusEvent<HTMLAnchorElement>) => void;
}

/**
 * Navigates to a URL or route.
 * Not for performing an action on this page (use Button).
 * @tier fundamental
 * @family text
 * @a11y Native `a[href]`; underlined so it is never colour alone (`link.decoration`; a theme that turns the rest line off
 * keeps it on hover and keyboard focus, and owes 3:1 between link and text colour); `aria-current="page"` when current.
 * @key Enter: follows the link
 */
export function Link({ href, children, current = false, external = false, newTab = false, tone = 'accent', ...data }: LinkProps) {
  const router = useRouter();
  return (
    <a {...data} href={router && !newTab ? router.href(href) : href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener' : undefined} data-dl="link" data-tone={tone === 'neutral' ? 'neutral' : undefined} aria-current={current ? 'page' : undefined}>
      {children}
      {(external || newTab) && <Icon name="external" size="sm" label={newTab ? '(opens in a new tab)' : '(another site)'} />}
    </a>
  );
}
