import type { CSSProperties } from 'react';
import { Image, type PictureSource, type PictureTreatment, type SchemeSources } from '../fundamentals/Image';
import type { PictureReveal } from '../behaviour/reveal';
import type { DataAttributes } from '../types';

export interface ImageGridItem extends SchemeSources {
  /** Stable key. */
  id: string;
  /** The picture's address. */
  src: string;
  /** What the picture shows. Also the name of its button when the grid opens pictures. */
  alt: string;
  /** The picture's own width and height in pixels: `justified` and `masonry` keep its shape from them. */
  width?: number;
  height?: number;
  /** In `quilted`, a picture that takes two columns (`wide`), two rows (`tall`) or both (`large`). */
  span?: 'wide' | 'tall' | 'large';
  /** As `Image`: its tone, or one at rest and one while hovered or focused (grey until pointed at). */
  treatment?: PictureTreatment;
  /** As `Image`: the paired picture shown while it's hovered or focused. */
  alternate?: string | PictureSource;
  /** As `Image`: draws the change to `alternate` yourself (a template's reveal preset). */
  reveal?: PictureReveal;
  /** As `Image`: the point kept in view where a frame crops. */
  focal?: { x: number; y: number };
}

export interface ImageGridProps extends DataAttributes {
  /** The pictures, in reading order. */
  items: ImageGridItem[];
  /**
   * `standard`: equal frames in rows (default). `quilted`: square cells, some pictures across two (a feature). `masonry`:
   * columns of whole pictures, each its own height. `justified`: rows of whole pictures at one height, filling the width.
   */
  layout?: 'standard' | 'quilted' | 'masonry' | 'justified';
  /** In `standard`, the frames' shape. */
  ratio?: 'wide' | 'photo' | 'square' | 'portrait';
  /** Makes each picture a button that opens it, with its index (for a Lightbox). */
  onSelect?: (index: number) => void;
  /** What the set is: names the list for screen readers ("Photos from the trip"). */
  label: string;
}

/**
 * A set of pictures arranged as one: equal frames, a quilt with features, masonry columns or justified rows. Each layout
 * keeps every column at least `c.image-grid.min` wide and falls to fewer as the place narrows, so nothing scrolls
 * sideways. With `onSelect`, a picture opens (into a Lightbox). For pictures one at a time use Carousel.
 * @tier compound
 * @family content
 * @a11y A list named by `label`; each picture keeps its own alternative text. With `onSelect` each is a button named
 * "Open: " and the picture's description, in reading order; the focus ring sits inside the picture's corners. Masonry
 * reads down each column, so use it only where order doesn't matter.
 * @key Tab: the next picture (with `onSelect`)
 * @key Enter, Space: open the picture
 */
export function ImageGrid({ items, layout = 'standard', ratio = 'photo', onSelect, label, ...data }: ImageGridProps) {
  return (
    <ul {...data} data-dl="image-grid" data-layout={layout} aria-label={label}>
      {items.map((item, i) => {
        const shape = item.width && item.height ? ({ '--w': item.width, '--h': item.height } as CSSProperties) : undefined;
        const picture = (
          <Image
            src={item.src}
            dark={item.dark}
            contrast={item.contrast}
            alt={onSelect ? '' : item.alt}
            width={item.width}
            height={item.height}
            ratio={layout === 'standard' ? ratio : layout === 'quilted' ? 'square' : 'natural'}
            treatment={item.treatment}
            alternate={item.alternate}
            reveal={item.reveal}
            focal={item.focal}
          />
        );
        return (
          <li key={item.id} data-dl-part="item" data-span={layout === 'quilted' ? item.span : undefined} style={shape}>
            {onSelect ? (
              <button type="button" data-dl-part="open" aria-label={`Open: ${item.alt}`} onClick={() => onSelect(i)}>
                {picture}
              </button>
            ) : (
              picture
            )}
          </li>
        );
      })}
    </ul>
  );
}
