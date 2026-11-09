import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon } from './Icon';
import type { DataAttributes } from '../types';

export interface ImageProps extends DataAttributes {
  /** The picture's address. */
  src: string;
  /** What the picture shows, for people who can't see it. `""` when it only decorates (the words beside it say it all). */
  alt: string;
  /** Other widths of the same picture, for the browser to pick from (`srcset`). */
  srcSet?: string;
  /** How wide the picture is drawn at each window width (`sizes`), so the browser picks the right file. */
  sizes?: string;
  /** The frame's shape: `wide` 16:9, `photo` 3:2, `square` 1:1, `portrait` 4:5, or `natural` (the picture's own; give `width` and `height`). */
  ratio?: 'wide' | 'photo' | 'square' | 'portrait' | 'natural';
  /** `cover` fills the frame and crops the edges (default); `contain` shows the whole picture inside the frame. */
  fit?: 'cover' | 'contain';
  /** The picture's own width and height in pixels: they reserve its space before it loads, so nothing below it jumps. */
  width?: number;
  height?: number;
  /** What the picture shows or why it's here, under it. Makes it a figure. */
  caption?: string;
  /** Who made it, after the caption. */
  credit?: string;
  /** Rounded corners (default), or square for a picture that meets the edge of its container. In a Card's media slot the card owns the corners, so the picture is square there either way. */
  rounded?: boolean;
  /** `lazy` (default) loads it when it nears the window; `eager` for the first picture a page shows. */
  loading?: 'lazy' | 'eager';
}

/**
 * A picture in a frame of a fixed shape that holds its space while it loads, shows a soft fill while it waits, and
 * says what it was when it can't load. With a caption or a credit it becomes a figure.
 * @tier fundamental
 * @family media
 * @a11y A native `img` with its alternative text; `alt=""` hides a decorative picture from screen readers. With a
 * caption it is a `figure` and its `figcaption`, so the caption is read with it. A picture that can't load shows an
 * icon and its alternative text as words in the frame, so nothing is silently missing. Lazy by default; the frame's
 * ratio (or `width` and `height`) reserves its space, so the page doesn't shift as it arrives.
 */
export function Image({
  src,
  alt,
  srcSet,
  sizes,
  ratio = 'photo',
  fit = 'cover',
  width,
  height,
  caption,
  credit,
  rounded = true,
  loading = 'lazy',
  ...data
}: ImageProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = img.current;
    setState(el?.complete && el.naturalWidth > 0 ? 'loaded' : 'loading');
  }, [src]);

  const frame = (attrs: DataAttributes) => (
    <span {...attrs} data-dl="image" style={width && height ? ({ '--image-ratio': `${width} / ${height}` } as CSSProperties) : undefined} data-ratio={ratio} data-fit={fit} data-state={state} data-rounded={rounded ? '' : undefined}>
      {state === 'failed' ? (
        <span data-dl-part="fallback" role={alt ? 'img' : undefined} aria-label={alt ? `${alt} (couldn’t load)` : undefined} aria-hidden={alt ? undefined : true}>
          <Icon name="image" size="lg" />
          {alt && <span data-dl-part="fallback-text" aria-hidden="true">{alt}</span>}
        </span>
      ) : (
        <img
          ref={img}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('failed')}
        />
      )}
    </span>
  );

  if (!caption && !credit) return frame(data);

  return (
    <figure {...data} data-dl="figure">
      {frame({})}
      <figcaption data-dl-part="caption">
        {caption}
        {credit && <span data-dl-part="credit">{credit}</span>}
      </figcaption>
    </figure>
  );
}
