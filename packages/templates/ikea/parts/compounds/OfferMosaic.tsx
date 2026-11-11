import type { DataAttributes } from '@design-library/core/components';
import type { ReactNode } from 'react';

export interface OfferMosaicProps extends DataAttributes {
  /** The sale's lead: a PictureBanner block of a brand surface ("Up to 40% off"), as tall as the mosaic. */
  lead: ReactNode;
  /** Two columns of two PictureBanners each, beside the lead: the offers. */
  columns: [ReactNode, ReactNode][];
}

/**
 * A sale's opening: a lead colour block as tall as the mosaic, then two columns of two offer pictures each, one column
 * landscape over portrait and the next portrait over landscape. Stacks to two columns, then one, as the window narrows.
 * An IKEA template part (owner Q140).
 * Not for a single picture with words and actions (use Hero), or a row of equal cards (use Grid).
 * @tier compound
 * @family ikea
 * @a11y A plain grid; each tile is its own link, read in source order: the lead, then each column top to bottom.
 */
export function OfferMosaic({ lead, columns, ...data }: OfferMosaicProps) {
  return (
    <div {...data} data-dl="ikea-offer-mosaic">
      <div data-dl-part="grid">
        <div data-dl-part="lead">{lead}</div>
        {columns.map((pair, i) => (
          <div key={i} data-dl-part="column">
            {pair[0]}
            {pair[1]}
          </div>
        ))}
      </div>
    </div>
  );
}
