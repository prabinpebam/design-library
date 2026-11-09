import type { ReactNode } from 'react';
import { Badge } from '../fundamentals/Badge';
import { Heading } from '../fundamentals/Heading';
import { Link } from '../fundamentals/Link';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

/** A link in the header: words that say where it goes, and where. */
export interface PageHeaderLink {
  /** The link's words. */
  label: string;
  /** Where it goes. */
  href: string;
  /** Opens in a new browser tab (Link `newTab`). */
  newTab?: boolean;
}

export interface PageHeaderProps extends DataAttributes {
  /** The page's title: the one level-1 heading on the page. */
  title: string;
  /** One or two sentences: what the page is for. */
  lead?: string;
  /** Where the page sits, as a badge linking back to its section. */
  eyebrow?: PageHeaderLink;
  /** Where the page's content comes from, as a link. */
  source?: PageHeaderLink;
  /** A source file path, shown as code under the lead. */
  file?: string;
  /** `data-*` attributes for the title, for tooling such as revision anchors. */
  titleData?: DataAttributes;
  /** `data-*` attributes for the lead. */
  leadData?: DataAttributes;
  /** Anything else the head needs after the lead and sources, such as a note with a link. */
  children?: ReactNode;
}

/**
 * The head of a page: where it sits, its title, what it's for and where it comes from.
 * Not for the app's identity (use TitleBar) or for headings inside a page (use Section).
 * @tier compound
 * @family navigation
 * @a11y Renders the page's only `h1`. The eyebrow is a link with a 44 px target around its badge, underlined on hover
 * and press. Long paths wrap anywhere instead of widening the page.
 * @key Tab: reaches the eyebrow link, then the source link
 */
export function PageHeader({ title, lead, eyebrow, source, file, titleData, leadData, children, ...data }: PageHeaderProps) {
  return (
    <header {...data} data-dl="page-header">
      {eyebrow && (
        <a href={eyebrow.href} data-dl-part="eyebrow">
          <Badge>{eyebrow.label}</Badge>
        </a>
      )}
      <Heading level={1} {...titleData}>
        {title}
      </Heading>
      {lead && (
        <p {...leadData} data-dl-part="lead">
          {lead}
        </p>
      )}
      {source && <Link href={source.href} newTab={source.newTab}>{source.label}</Link>}
      {file && (
        <Text variant="body-sm" tone="muted">
          Source: <code>{file}</code>
        </Text>
      )}
      {children}
    </header>
  );
}
