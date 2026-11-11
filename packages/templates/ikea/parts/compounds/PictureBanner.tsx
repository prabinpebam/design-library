import { Icon, Image, type DataAttributes } from '@design-library/core/components';

export interface PictureBannerProps extends DataAttributes {
  /** The words: "Find the little things that make a room". The whole banner is the link. */
  title: string;
  href: string;
  /** One line under the title: "On bedroom favourites". */
  text?: string;
  /** A small print line at the foot of a colour block or panel: "*Terms and conditions apply". */
  note?: string;
  /** The picture; leave it out for a colour block. */
  picture?: { src: string; alt: string };
  /**
   * Where the words sit: `over` (default) white on a shade at the picture's foot; `below` under the picture; `side` in a
   * colour panel beside the picture (a band across the page); `panel` in a colour panel under the picture.
   */
  caption?: 'over' | 'below' | 'side' | 'panel';
  /**
   * The colour of a block or caption panel, from the brand map (Q140): `band` the lead colour (blue), `feature` the
   * second colour (yellow), `promo` the promotion colour (`color.promo.new`, an orange block over new arrivals, Q141).
   */
  surface?: 'band' | 'feature' | 'promo';
  /** `display`: the block's title at display size, for a sale's headline ("Up to 40% off"). */
  titleSize?: 'normal' | 'display';
  /** The picture's shape; `ultrawide` on a colour block makes a band across the page, its words and arrow in one row. */
  ratio?: 'ultrawide' | 'wide' | 'photo' | 'classic' | 'square' | 'tall' | 'portrait' | 'natural' | 'fill';
  /** A short tag at the picture's top corner: "New", "Lower price", "Member price". */
  tag?: string;
  /** The tag's colour: `new` or `offer` (`color.promo.*`, Q139), `brand` (the band colour, a member price) or `feature` (the second colour, an in-store price). A square box of small bold words (Q141). */
  tagTone?: 'new' | 'offer' | 'brand' | 'feature';
  /** Above the fold: load the picture first. */
  priority?: boolean;
}

/**
 * A picture with a caption and an arrow that leads somewhere (a room, an idea, a sale), or, without a picture, a block
 * of a brand colour with large words and a circled arrow; or a picture with its words on a colour panel beside or under
 * it. The block and panel colours are the brand map's surfaces (band, feature). The whole banner is one link. An IKEA
 * template part (owner Q138, Q140).
 * Not for a product with a price (use ProductTile), or for the page's opening with actions (use Hero).
 * @tier compound
 * @family ikea
 * @a11y One link named by its words (and its tag, read first). The picture is decorative there, since the words say
 * where it leads; the arrow is decorative. Words over a picture sit on a shade, so they read on any picture; words on a
 * panel take the surface's own on-colour.
 */
export function PictureBanner({ title, href, text, note, picture, caption = 'over', surface = 'band', titleSize = 'normal', ratio = 'photo', tag, tagTone = 'new', priority, ...data }: PictureBannerProps) {
  const tone = picture ? 'picture' : 'block';
  const paneled = !picture || caption === 'side' || caption === 'panel';
  return (
    <a
      {...data}
      data-dl="ikea-picture-banner"
      data-tone={tone}
      data-caption={picture ? caption : undefined}
      data-surface={paneled ? surface : undefined}
      data-title-size={titleSize === 'display' ? 'display' : undefined}
      data-ratio={ratio}
      href={href}
    >
      {picture ? (
        <span data-dl-part="media">
          <Image src={picture.src} alt="" ratio={ratio} priority={priority} />
        </span>
      ) : null}
      {tag ? (
        <span data-dl-part="tag" data-tone={tagTone}>
          {tag}
        </span>
      ) : null}
      <span data-dl-part="caption">
        <span data-dl-part="words">
          <span data-dl-part="title">{title}</span>
          {text ? <span data-dl-part="text">{text}</span> : null}
        </span>
        <span data-dl-part="arrow">
          <Icon name="arrow-end" size="md" />
        </span>
        {note ? <span data-dl-part="note">{note}</span> : null}
      </span>
    </a>
  );
}
