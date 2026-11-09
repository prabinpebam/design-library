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
  /** Where the places sit on a wide bar (IP32): `start` (default, after the name), `center` (centred between the name and the end) or `end` (beside the actions). */
  nav?: 'start' | 'center' | 'end';
  /** The name's size (IP32): `normal` (default), `large` (a wordmark brand) or `mark` (only the mark shows; the name still names the home link). `mark` needs `mark`. */
  wordmark?: 'normal' | 'large' | 'mark';
  /** How the current place is marked (IP32): `fill` (default, a tint), `colour` (accent words) or `rule` (a full hairline around it; never a one-sided stripe). */
  current?: 'fill' | 'colour' | 'rule';
  /**
   * The narrow form (IP32, below 48 rem): `wrap` (default) keeps `actions` on the bar and wraps them under the name
   * when they don't fit; `row` keeps the bar to one row, moving `actions` into the menu under the places, with only
   * `tools` and Menu beside the name.
   */
  narrow?: 'wrap' | 'row';
  /** Small icon controls that stay on the bar at every width, before Menu (a scheme or search button). */
  tools?: ReactNode;
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
export function SiteHeader({ name, href, mark, links = [], label = 'Main', actions, nav, wordmark, current, narrow, tools, ...data }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const panelId = useId();
  const button = useRef<HTMLSpanElement>(null);
  const markOnly = wordmark === 'mark' && !!mark;
  const row = narrow === 'row' && links.length > 0;

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
    <div {...data} data-dl="site-header" data-open={open ? '' : undefined} data-nav={nav && nav !== 'start' ? nav : undefined} data-wordmark={wordmark === 'large' ? 'large' : markOnly ? 'mark' : undefined} data-current={current && current !== 'fill' ? current : undefined} data-narrow={row ? 'row' : undefined}>
      <div data-dl-part="bar">
        <a href={router ? router.href(href) : href} data-dl-part="name" aria-label={markOnly ? name : undefined}>
          {mark && (
            <span data-dl-part="mark" aria-hidden="true">
              {mark}
            </span>
          )}
          {!markOnly && name}
        </a>
        {links.length > 0 && (
          <nav aria-label={label} data-dl-part="links">
            {list}
          </nav>
        )}
        <span data-dl-part="end">
          {actions && (row ? <span data-dl-part="actions">{actions}</span> : actions)}
          {tools}
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
          {row && actions && <span data-dl-part="panel-actions">{actions}</span>}
        </nav>
      </Reveal>
    </div>
  );
}
