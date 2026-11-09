import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { Reveal } from '../fundamentals/Reveal';
import type { DataAttributes } from '../types';
import { useRouter } from '../behaviour/router';

/** One place in the site's main navigation. */
export interface SiteHeaderLink {
  /** A short noun, sentence case: "Products", "About". */
  label: string;
  href: string;
  /** The page being shown, or the section it belongs to: marked with `aria-current="page"` and a tint. */
  current?: boolean;
}

export interface SiteHeaderProps extends DataAttributes {
  /** The site's or the person's name; links home. */
  name: string;
  /** Where the name leads, usually the home page. */
  href: string;
  /** A small mark before the name (an Icon or a logo Image); decoration, so its alt text is empty. */
  mark?: ReactNode;
  /** The main places, in order. Keep it to about five; the rest belong in the footer. */
  links?: SiteHeaderLink[];
  /** Names the navigation: "Main" (default). */
  label?: string;
  /** One or two Buttons at the end, the main one last: "Contact sales", "Get tickets". They stay in a narrow window. */
  actions?: ReactNode;
}

/**
 * The top of a website: the name (and mark) linking home, the main places, and one or two actions. When its own width
 * is narrow (below 48 rem) the places move behind a Menu button and open as a list under the bar.
 * Not for an app's top bar (TitleBar) or for navigation within one section of pages (Navigation).
 * @tier compound
 * @family navigation
 * @a11y The places are a `nav` named by `label` with the current one marked `aria-current="page"`. In a narrow header,
 * the Menu button (`aria-expanded`, `aria-controls`) opens the same places as a list; Escape or choosing a place
 * closes it, and Escape returns focus to the button.
 * @key Escape: closes the menu
 */
export function SiteHeader({ name, href, mark, links = [], label = 'Main', actions, ...data }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const panelId = useId();
  const button = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      button.current?.querySelector('button')?.focus();
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);

  const list = (
    <ul data-dl-part="list">
      {links.map((l) => (
        <li key={l.href}>
          <a href={router ? router.href(l.href) : l.href} data-dl-part="link" aria-current={l.current ? 'page' : undefined} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div {...data} data-dl="site-header" data-open={open ? '' : undefined}>
      <div data-dl-part="bar">
        <a href={router ? router.href(href) : href} data-dl-part="name">
          {mark && (
            <span data-dl-part="mark" aria-hidden="true">
              {mark}
            </span>
          )}
          {name}
        </a>
        {links.length > 0 && (
          <nav aria-label={label} data-dl-part="links">
            {list}
          </nav>
        )}
        <span data-dl-part="end">
          {actions}
          {links.length > 0 && (
            <span ref={button} data-dl-part="menu">
              <Button label={open ? 'Close menu' : 'Menu'} icon={open ? 'close' : 'menu'} iconOnly emphasis="quiet" size="s" expanded={open} controls={panelId} onClick={() => setOpen((o) => !o)} />
            </span>
          )}
        </span>
      </div>
      {/* Q65 C9: the narrow-window list opens in place under the bar and collapses back. */}
      <Reveal open={open}>
        <nav id={panelId} aria-label={label} data-dl-part="panel">
          {list}
        </nav>
      </Reveal>
    </div>
  );
}
