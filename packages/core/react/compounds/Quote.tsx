import { Children, type ReactNode } from 'react';
import { Link } from '../fundamentals/Link';
import { Persona } from '../fundamentals/Persona';
import { Skeleton } from '../fundamentals/Skeleton';
import { usePresence } from '../behaviour/presence';
import type { DataAttributes } from '../types';

export interface QuoteAuthor {
  /** Who said or wrote it. */
  name: string;
  /** One line under the name: their role and where ("Design lead, Northwind"). */
  role?: ReactNode;
  /** Their picture; initials show without one. */
  src?: string;
}

export interface QuoteSource {
  /** Where it was said or written, as its title: "The Shape of Design", "Interview, May 2026". */
  title: string;
  /** A page to read it in full: the source becomes a link, and the quote's `cite` points there. */
  href?: string;
}

export interface QuoteProps extends DataAttributes {
  /** The quoted words, without quotation marks: the quote adds the reader's language's own. A blank line starts a new paragraph. */
  children: ReactNode;
  /** The person it's from, shown with their avatar. */
  author?: QuoteAuthor;
  /** The work or occasion it's from. */
  source?: QuoteSource;
  /** `s` inside a card or beside other content, `m` (default) inside an article, `l` for the one quote a section leads with. */
  size?: 's' | 'm' | 'l';
  /** `start` (default), or `center` for a quote standing on its own, such as one slide of a carousel. */
  align?: 'start' | 'center';
  /** Shows the quote's shape in shimmer while it loads. */
  loading?: boolean;
}

const avatarSize = { s: 32, m: 40, l: 56 } as const;

function paragraphs(children: ReactNode) {
  if (typeof children !== 'string') return Children.toArray(children).map((child, i) => (typeof child === 'string' ? <p key={i}>{child}</p> : child));
  return children
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, i) => <p key={i}>{text}</p>);
}

/**
 * Words someone said or wrote, set apart from the text around them, with who they're from and where: a testimonial,
 * a recommendation, a line from an interview or a book. Put several in Cards for recommendations, or one per slide in
 * a Carousel for voices. Not for repeating a line of the same article for emphasis (a pull quote is Heading or Text
 * at a larger size) or for code (use CodeBlock).
 * @tier compound
 * @family content
 * @a11y A `figure` holding a `blockquote` and a `figcaption`, so the author and source are read as the quote's own.
 * The quotation marks are drawn from the reader's language (`quotes`), not typed into the words, so they're never read
 * twice. The author's avatar is hidden because their name is written beside it. With `source.href`, the source is a
 * link and the blockquote's `cite` points to it. A loading quote is `aria-busy`.
 */
export function Quote({ children, author, source, size = 'm', align = 'start', loading = false, ...data }: QuoteProps) {
  // Q65 C13 (K-11): one quote across loading and loaded; the skeleton fades off the arrived words (S7).
  const placeholder = usePresence(loading);
  const skeleton = (
    <>
      <div data-dl-part="text" aria-hidden="true">
        <Skeleton lines={size === 's' ? 3 : 2} />
      </div>
      <div data-dl-part="attribution" aria-hidden="true">
        <Persona name="" size={avatarSize[size]} textPosition={align === 'center' ? 'below' : 'after'} loading />
      </div>
    </>
  );
  if (loading) {
    return (
      <figure {...data} data-dl="quote" data-size={size} data-align={align} aria-busy="true">
        {skeleton}
      </figure>
    );
  }

  const sourceNode = source && (
    <cite data-dl-part="source">{source.href ? <Link href={source.href} external={/^https?:/.test(source.href)}>{source.title}</Link> : source.title}</cite>
  );

  return (
    <figure {...data} data-dl="quote" data-size={size} data-align={align}>
      <blockquote data-dl-part="text" cite={source?.href}>
        {paragraphs(children)}
      </blockquote>
      {(author || source) && (
        <figcaption data-dl-part="attribution">
          {author && <Persona name={author.name} secondary={author.role} src={author.src} size={avatarSize[size]} textPosition={align === 'center' ? 'below' : 'after'} />}
          {sourceNode}
        </figcaption>
      )}
      {placeholder && (
        <div data-dl-part="placeholder" aria-hidden="true" inert>
          {skeleton}
        </div>
      )}
    </figure>
  );
}
