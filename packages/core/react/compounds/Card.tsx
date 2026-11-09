import type { ReactNode } from 'react';
import { Heading } from '../fundamentals/Heading';
import { Skeleton } from '../fundamentals/Skeleton';
import { usePresence } from '../behaviour/presence';
import type { DataAttributes } from '../types';

export interface CardProps extends DataAttributes {
  /** What the card is about: its heading, and the link's name when the card has `href`. */
  title: string;
  /** Makes the whole card one link to this address (one stop for the keyboard, one big target), named by the title. */
  href?: string;
  /** A picture (an `img` or an Image) shown in the card's frame. Its alternative text is its own; a picture that only decorates has `alt=""`. */
  media?: ReactNode;
  /** The frame's shape: `wide` 16:9, `photo` 3:2 (default), `square` 1:1. The picture fills it. */
  ratio?: 'wide' | 'photo' | 'square';
  /** One or two words above the title: the section or kind it belongs to. */
  eyebrow?: string;
  /** One or two sentences on what it's about. */
  description?: string;
  /** A line under the description: when, how long, by whom. */
  meta?: ReactNode;
  /** More content under the description, such as chips or a progress bar. */
  children?: ReactNode;
  /** Buttons for the card's own actions, at its end. They stay separate stops from the card's link. */
  actions?: ReactNode;
  /** `stacked`: the picture above the words (default). `beside`: the picture beside the words, stacked when the card is narrow (a lead item). `row`: the words first and a small square picture at the end (a line of a list). */
  layout?: 'stacked' | 'beside' | 'row';
  /** `outlined`: a bounded surface with a hairline (default; a grid of cards on a page). `plain`: no enclosure, only the content (an index where space already groups each card). */
  variant?: 'outlined' | 'plain';
  /** The heading's level in the page's outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Shows the card's shape in shimmer while its content loads; nothing in it can be used. */
  loading?: boolean;
}

/**
 * A bounded group of content about one thing: a picture, a title, one or two lines on what it's about, a line of
 * facts and the card's own actions. The whole card can be one link. For a row of facts in a table use DataTable; for
 * a number with its change use Statistic.
 * @tier compound
 * @family data
 * @a11y An `article` named by its heading. With `href` the title is the link and a layer of it covers the card, so a
 * press anywhere opens it, while the keyboard and screen readers meet one link with the title as its name (not the
 * whole card read out). Actions sit above that layer and are their own stops. The focus ring is drawn around the whole
 * card. The picture keeps its own alternative text. A loading card is `aria-busy` and hides its shimmer from screen
 * readers.
 * @key Tab: the card's link, then each action
 * @key Enter: opens the card's link
 */
export function Card({
  title,
  href,
  media,
  ratio = 'photo',
  eyebrow,
  description,
  meta,
  children,
  actions,
  layout = 'stacked',
  variant = 'outlined',
  headingLevel = 3,
  loading = false,
  ...data
}: CardProps) {
  // Q65 C13: one card across loading and loaded. When the content arrives, the skeleton stays over it for a moment and
  // fades out (S7: the new content is already under it, so nothing dims or shifts).
  const placeholder = usePresence(loading);
  const skeleton = (
    <>
      {layout !== 'row' && (
        <div data-dl-part="media" data-ratio={ratio} aria-hidden="true">
          <Skeleton shape="block" />
        </div>
      )}
      <div data-dl-part="body" aria-hidden="true">
        <Skeleton lines={1} size="lg" />
        <Skeleton lines={2} />
      </div>
      {layout === 'row' && (
        <div data-dl-part="media" data-ratio="square" aria-hidden="true">
          <Skeleton shape="block" />
        </div>
      )}
    </>
  );
  if (loading) {
    return (
      <article {...data} data-dl="card" data-layout={layout} data-variant={variant} data-loading="" aria-busy="true" aria-label={title}>
        {skeleton}
      </article>
    );
  }

  return (
    <article {...data} data-dl="card" data-layout={layout} data-variant={variant} data-linked={href ? '' : undefined}>
      {media && (
        <div data-dl-part="media" data-ratio={layout === 'row' ? 'square' : ratio}>
          {media}
        </div>
      )}
      <div data-dl-part="body">
        <div data-dl-part="heading">
          {eyebrow && <p data-dl-part="eyebrow">{eyebrow}</p>}
          <Heading level={headingLevel} size={4}>
            {href ? (
              <a href={href} data-dl-part="link">
                {title}
              </a>
            ) : (
              title
            )}
          </Heading>
        </div>
        {description && <p data-dl-part="description">{description}</p>}
        {children && <div data-dl-part="content">{children}</div>}
        {(meta || actions) && (
          <div data-dl-part="footer">
            {meta && <p data-dl-part="meta">{meta}</p>}
            {actions && <div data-dl-part="actions">{actions}</div>}
          </div>
        )}
      </div>
      {placeholder && (
        <div data-dl-part="placeholder" aria-hidden="true" inert>
          {skeleton}
        </div>
      )}
    </article>
  );
}
