import { Icon, type DataAttributes, type IconName } from '@design-library/core/components';
import type { ReactNode } from 'react';

export interface StoreLink {
  label: string;
  /** Leave it out for a link that's words only (a phone number). */
  icon?: IconName;
  href: string;
  /** The page shown now: the link says so (`aria-current="page"`) and choosing it again rightly changes nothing. */
  current?: boolean;
  /** Runs before the link is followed: a department that also sets a filter (Offers). */
  onClick?: () => void;
}

export interface StoreHeaderProps extends DataAttributes {
  /** The shop's name, set as a bold wordmark in the brand colour; it links home. */
  name: string;
  href: string;
  /** On the home page: the wordmark is the current page. */
  current?: boolean;
  /** The utility bar's name for assistive technology: "Store services". */
  barLabel: string;
  /** The utility bar's links at its start: the language. */
  start?: StoreLink[];
  /** The utility bar's middle: the customer service number. */
  centre?: StoreLink[];
  /** The utility bar's links at its end: the postcode, the store. */
  end?: StoreLink[];
  /** The search: a core TextField of type search; the header makes it a quiet pill. */
  search: ReactNode;
  /** The icon actions at the row's end: the account, favourites, the bag (with its count Badge), the menu. */
  actions: ReactNode;
  /** The departments beside the wordmark: Products, Rooms, Offers. Named by `navLabel`. */
  links?: StoreLink[];
  navLabel?: string;
}

/**
 * A shop's header: a dark utility bar across the window (the language, the delivery postcode, the chosen store), then
 * one row with the shop's wordmark (in a box of the brand map's band surface),  the departments as quiet words beside it,
  * the pill search pushed towards the row's end and the icon actions (Q141, as ikea.com). Put it in SiteLayout's header slot. An
 * IKEA template part (owner Q138).
 * Not for a site whose header is a few page links (use SiteHeader).
 * @tier compound
 * @family ikea
 * @a11y The bar is a `nav` named by `barLabel`; its icons are decorative beside their words. The wordmark is the home
 * link. Every action keeps its own name (an icon-only Button has its label and tooltip).
 */
export function StoreHeader({ name, href, current, barLabel, start = [], centre = [], end = [], search, actions, links = [], navLabel, ...data }: StoreHeaderProps) {
  const link = (l: StoreLink) => (
    <a key={l.label} data-dl-part="bar-link" href={l.href} aria-current={l.current ? 'page' : undefined} onClick={l.onClick}>
      {l.icon ? <Icon name={l.icon} size="sm" /> : null}
      <span>{l.label}</span>
    </a>
  );
  return (
    <div {...data} data-dl="ikea-store-header">
      <nav data-dl-part="bar" aria-label={barLabel}>
        <span data-dl-part="bar-start">{start.map(link)}</span>
        {centre.length ? <span data-dl-part="bar-centre">{centre.map(link)}</span> : null}
        <span data-dl-part="bar-end">{end.map(link)}</span>
      </nav>
      <div data-dl-part="row">
        <a data-dl-part="wordmark" href={href} aria-current={current ? 'page' : undefined}>
          {name}
        </a>
        {links.length ? (
          <nav data-dl-part="links" aria-label={navLabel}>
            {links.map((l) => (
              <a key={l.label} data-dl-part="link" href={l.href} aria-current={l.current ? 'page' : undefined} onClick={l.onClick}>
                {l.label}
              </a>
            ))}
          </nav>
        ) : null}
        <div data-dl-part="search">{search}</div>
        <div data-dl-part="actions">{actions}</div>
      </div>
    </div>
  );
}
