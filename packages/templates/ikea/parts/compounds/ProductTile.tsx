import { Badge, Image, type DataAttributes } from '@design-library/core/components';
import type { ReactNode } from 'react';

export interface ProductTileProps extends DataAttributes {
  /** The product's name, set bold in capitals as the shop does; it's the link to the product. */
  name: string;
  /** What it is: "3-seat sofa, light grey". */
  kind: string;
  href: string;
  picture: { src: string; alt: string };
  /** A short word above the name: "New", "Lower price". */
  tag?: string;
  /** The tag's promotion: `new` or `offer`, a core Badge in the words' colour (`color.promo.*`, Q139). */
  tagTone?: 'new' | 'offer';
  /** The price: a core `Price`. */
  price: ReactNode;
  /** The rating: a read-only core Rating. */
  rating?: ReactNode;
  /** The favourite toggle over the picture's corner: an icon-only Button with `pressed`. */
  favourite?: ReactNode;
  /** The add-to-bag button beside the name: an icon-only primary Button. */
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}

/**
 * One product in a listing or a rail: its picture on a quiet surface (a favourite toggle in the corner), then a tag, the
 * name in bold capitals, what it is, the price and the rating, with a round add-to-bag button beside the name. Rows of
 * tiles are separated by one hairline above each tile, not by boxes. An IKEA template part (owner Q138).
 * Not for a room or an idea (use PictureBanner), or for a line in the bag (use Card, layout beside).
 * @tier compound
 * @family ikea
 * @a11y An `article`; the name is a heading whose link is the tile's one link (the picture repeats it, out of the tab
 * order and hidden from assistive technology). The tag is words, not only a colour.
 */
export function ProductTile({ name, kind, href, picture, tag, tagTone = 'new', price, rating, favourite, action, headingLevel = 3, ...data }: ProductTileProps) {
  const H = `h${headingLevel}` as const;
  return (
    <article {...data} data-dl="ikea-product-tile">
      <div data-dl-part="media">
        <a href={href} tabIndex={-1} aria-hidden="true">
          <Image src={picture.src} alt="" ratio="square" />
        </a>
        {favourite ? <div data-dl-part="favourite">{favourite}</div> : null}
      </div>
      <div data-dl-part="head">
        <div data-dl-part="words">
          {tag ? (
            <span data-dl-part="tag">
              <Badge tone={tagTone} emphasis="subtle">
                {tag}
              </Badge>
            </span>
          ) : null}
          <H data-dl-part="name">
            <a href={href}>{name}</a>
          </H>
          <span data-dl-part="kind">{kind}</span>
        </div>
        {action ? <div data-dl-part="action">{action}</div> : null}
      </div>
      {price}
      {rating}
    </article>
  );
}
