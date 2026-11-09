import type { ReactNode } from 'react';
import { Heading } from '../fundamentals/Heading';
import { Link } from '../fundamentals/Link';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface FooterLink {
  label: string;
  href: string;
  /** Goes to another site: Link's external icon and its spoken twin. */
  external?: boolean;
}

export interface FooterSection {
  id: string;
  /** What the links have in common, e.g. "Services" or "About us". */
  heading: string;
  links: FooterLink[];
}

export interface FooterProps extends DataAttributes {
  /** Where else to go, in titled sections side by side; they wrap to fewer columns as the room narrows. */
  sections?: FooterSection[];
  /** Names the sections' navigation, e.g. "More from Atlas". */
  sectionsLabel?: string;
  /** The small-print links in one wrapping row: privacy, cookies, accessibility, contact. */
  links?: FooterLink[];
  /** Names the small-print navigation. Defaults to "Support links". */
  linksLabel?: string;
  /** One line about who runs the site or what it is, e.g. "Atlas is made by the Northwind design team." */
  identity?: ReactNode;
  /** The legal line: copyright or licence, e.g. "© 2026 Northwind. Text under CC BY 4.0." */
  legal?: ReactNode;
  /** The sections' heading level, from the page's outline. Defaults to 2. */
  headingLevel?: 2 | 3;
  /**
   * How the parts are arranged (IP33): `columns` (default: sections side by side, then the small print), `line` (the
   * small print on one wrapping line: links, identity and legal side by side, for a small site) or `identity` (the
   * identity, such as a logo and a line, in its own column beside the sections, then the small print; it stacks above
   * them in a narrow footer).
   */
  arrangement?: 'columns' | 'line' | 'identity';
}

/**
 * The foot of every page of a site: where else to go, the small print and who runs it. Quiet, on the sunken surface,
 * the full width of the window with the page margin inside.
 * Not for an app's status bar or a form's actions (use a Toolbar or the form's own buttons), or for a page's last
 * section (use Section).
 * @tier compound
 * @family navigation
 * @a11y A `footer` placed outside `main` and `article`, so it is the page's contentinfo landmark. Each group of links
 * is a labelled navigation with a real list, so its links are counted; section headings keep the page's outline.
 */
export function Footer({ sections, sectionsLabel = 'Footer', links, linksLabel = 'Support links', identity, legal, headingLevel = 2, arrangement, ...data }: FooterProps) {
  const item = (l: FooterLink) => (
    <li key={l.href + l.label}>
      <Link href={l.href} external={l.external}>
        {l.label}
      </Link>
    </li>
  );
  const led = arrangement === 'identity' && !!identity;
  const hasMeta = !!(links?.length || (identity && !led) || legal);
  return (
    <footer {...data} data-dl="footer" data-arrangement={arrangement && arrangement !== 'columns' ? arrangement : undefined}>
      <div data-dl-part="content">
        {led && <div data-dl-part="identity">{identity}</div>}
        {!!sections?.length && (
          <nav aria-label={sectionsLabel} data-dl-part="sections">
            {sections.map((s) => (
              <div key={s.id} data-dl-part="section">
                <Heading level={headingLevel} size={4}>
                  {s.heading}
                </Heading>
                <ul data-dl-part="links">{s.links.map(item)}</ul>
              </div>
            ))}
          </nav>
        )}
        {hasMeta && (
          <div data-dl-part="meta">
            {!!links?.length && (
              <nav aria-label={linksLabel}>
                <ul data-dl-part="meta-links">{links.map(item)}</ul>
              </nav>
            )}
            {identity && !led && <Text variant="body-sm">{identity}</Text>}
            {legal && (
              <Text variant="body-sm" tone="muted">
                {legal}
              </Text>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
