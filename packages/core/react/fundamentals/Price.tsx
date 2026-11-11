import type { DataAttributes } from '../types';

export interface PriceProps extends DataAttributes {
  /** The price now, in whole or decimal units of `currency`. */
  value: number;
  /** An ISO 4217 code: "EUR". */
  currency: string;
  /** The earlier, higher price, so this is a lower price: written in the line under it. */
  was?: number;
  /** The line under a lower price with the earlier price filled in, in the page's language: "Previous price €549". The bare earlier price when left out. */
  wasLabel?: string;
  /** `m` (default) in a card, tile or line; `l` on the thing's own page. */
  size?: 'm' | 'l';
  /** The lowest-price box: the price on the highlight colour. A theme gives it a solid offset through `c.price.highlight-offset`. */
  highlight?: boolean;
  /** Digits after the point; 0 (default) for whole prices, 2 for cents. */
  decimals?: number;
  /** A locale for the number; the reader's own when left out. */
  locale?: string;
}

/**
 * A price as a shop sets it: the currency sign small and raised, the number large and bold. A lower price has a line
 * under it naming the earlier price ("Previous price €549"); the lowest prices sit in a box of the highlight colour. The
 * look (sizes, weight, raised sign, box, offset) is the c.price tokens, which a template theme sets (Q139 R4).
 * Not for a sum in a summary or an order total (use DescriptionList with the formatted amount) or a figure (use Statistic).
 * @tier fundamental
 * @family content
 * @a11y The drawn price is hidden from assistive technology and one plain phrase is read instead ("€499, Previous price
 * €549"), so the split sign and number aren't read as two things. The earlier price is in words, never only a strike.
 */
export function Price({ value, currency, was, wasLabel, size = 'm', highlight, decimals = 0, locale, ...data }: PriceProps) {
  const format = new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const parts = format.formatToParts(value);
  const sign = parts.filter((p) => p.type === 'currency').map((p) => p.value).join('');
  const number = parts.filter((p) => p.type !== 'currency' && p.type !== 'literal').map((p) => p.value).join('');
  const signFirst = parts.findIndex((p) => p.type === 'currency') < parts.findIndex((p) => p.type === 'integer');
  const earlier = was === undefined ? undefined : wasLabel ?? format.format(was);
  return (
    <span {...data} data-dl="price" data-size={size} data-highlight={highlight ? '' : undefined}>
      <span data-dl-part="drawn" aria-hidden="true">
        <span data-dl-part="now">
          {signFirst ? <span data-dl-part="sign">{sign}</span> : null}
          <span data-dl-part="number">{number}</span>
          {signFirst ? null : <span data-dl-part="sign">{sign}</span>}
        </span>
        {earlier ? <span data-dl-part="caption">{earlier}</span> : null}
      </span>
      <span data-dl-spoken="">{earlier ? `${format.format(value)}, ${earlier}` : format.format(value)}</span>
    </span>
  );
}
