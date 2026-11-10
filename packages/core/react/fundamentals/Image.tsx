import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from './Icon';
import { useRegionScheme, type RegionScheme } from '../behaviour/region-scheme';
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
  /** The frame's shape: `ultrawide` 21:9 (a band or banner), `wide` 16:9, `photo` 3:2, `classic` 4:3, `square` 1:1, `portrait` 4:5, or `natural` (the picture's own; give `width` and `height`). */
  ratio?: 'ultrawide' | 'wide' | 'photo' | 'classic' | 'square' | 'portrait' | 'natural';
  /** The point to keep in the frame when `cover` crops (IP12): `x` and `y` from 0 to 1, across from the start edge and down from the top, e.g. `{ x: 0.3, y: 0.2 }` for a face up and to one side. The centre (0.5, 0.5) when left out. The same field as a picture entry's `focal` in `assets.json`. */
  focal?: { x: number; y: number };
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
  /** The picture the page is waiting for (its largest, first in view): loads at once, ahead of other pictures (`fetchpriority="high"`). One per page at most. */
  priority?: boolean;
  /**
   * A treatment (IP31), named as a picture entry's `treatment` in `assets.json` (DP3): `'greyscale'`, `'duotone'` (grey
   * multiplied over `--c-image-duotone`, the accent by default) or `'none'`; or `{ rest, active }`, where `active` shows
   * while the picture, or the link, button or card around it, is hovered or focused (`{ rest: 'greyscale', active:
   * 'none' }`: grey until pointed at). More contrast and forced colours always show the picture as it is.
   */
  treatment?: PictureTreatment;
  /**
   * The picture drawn in a dark scheme (MP17): another file of the same picture, at the same ratio, under the same
   * `alt`. `src` stays the light (or only) file. It follows the nearest `data-scheme` (the page's, or a band's own),
   * else the system's; swaps before the first paint and, later, only once the new file has loaded, so nothing
   * flashes or moves. Only the file in use is fetched until the scheme changes. Raster or SVG alike.
   */
  dark?: string | PictureSource;
  /** Files for more contrast (MP17), in light and in dark. Falls back: dark and more → `contrast.dark` → `dark` → `src`; light and more → `contrast.light` → `src`. */
  contrast?: { light?: string | PictureSource; dark?: string | PictureSource };
  /**
   * Shapes drawn over the picture (MP8): a brand's marks, dots or a frame. The layer is the picture's own size; an SVG
   * in it fills it, and shapes drawn outside its viewBox spill past the picture's edge (the picture keeps its corners).
   * Shapes in `currentColor` take `--c-image-decoration` (the accent). Hidden from screen readers, never takes the
   * pointer or focus, and never changes the layout; describe the picture in `alt` as before.
   */
  decoration?: ReactNode;
  /** The same as `decoration`, drawn behind the picture: seen only where it spills past the picture's edge. */
  under?: ReactNode;
}

/** One file of a picture: its address and, optionally, other widths of it. */
export interface PictureSource {
  src: string;
  srcSet?: string;
}

/** The files of one picture by scheme (MP17), as `Image` takes them; shared by Hero's picture and EmptyState's illustration. */
export interface SchemeSources {
  dark?: string | PictureSource;
  contrast?: { light?: string | PictureSource; dark?: string | PictureSource };
}

type LayerKey = 'light' | 'dark' | 'contrast-light' | 'contrast-dark';
type Layer = { key: LayerKey; src: string; srcSet?: string };

const asSource = (s: string | PictureSource | undefined) => (typeof s === 'string' ? { src: s } : s);

/** The picture's distinct files, light first; one layer when there is nothing per scheme. */
export function pictureLayers(light: PictureSource, { dark, contrast }: SchemeSources): Layer[] {
  const all: Layer[] = [{ key: 'light', ...light }];
  const add = (key: LayerKey, s: string | PictureSource | undefined) => {
    const source = asSource(s);
    if (source && !all.some((l) => l.src === source.src && l.srcSet === source.srcSet)) all.push({ key, ...source });
  };
  add('dark', dark);
  add('contrast-light', contrast?.light);
  add('contrast-dark', contrast?.dark);
  return all;
}

/** Which layer a scheme draws, with the fallbacks MP17 names. */
export function layerFor(layers: Layer[], { scheme, contrast }: RegionScheme, sources: SchemeSources): LayerKey {
  const find = (s: string | PictureSource | undefined) => {
    const source = asSource(s);
    return source ? layers.find((l) => l.src === source.src && l.srcSet === source.srcSet)?.key : undefined;
  };
  if (scheme === 'dark') return (contrast === 'more' ? find(sources.contrast?.dark) : undefined) ?? find(sources.dark) ?? 'light';
  return (contrast === 'more' ? find(sources.contrast?.light) : undefined) ?? 'light';
}

/** A picture tone (IP31, DP3). */
export type PictureTone = 'none' | 'greyscale' | 'duotone';
/** A tone, or one at rest and one while active (hovered or focused). */
export type PictureTreatment = PictureTone | { rest?: PictureTone; active?: PictureTone };

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
  focal,
  width,
  height,
  caption,
  credit,
  rounded = true,
  loading = 'lazy',
  priority = false,
  treatment,
  dark,
  contrast,
  decoration,
  under,
  ...data
}: ImageProps) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const sources: SchemeSources = { dark, contrast };
  const layers = pictureLayers({ src, srcSet }, sources);
  const many = layers.length > 1;
  const region = useRegionScheme(frameRef, many);
  const wanted = many ? layerFor(layers, region, sources) : 'light';
  const [shown, setShown] = useState<LayerKey>(wanted);
  const [loads, setLoads] = useState<Partial<Record<LayerKey, 'loading' | 'loaded' | 'failed'>>>({});
  const imgs = useRef<Partial<Record<LayerKey, HTMLImageElement | null>>>({});
  const tone = typeof treatment === 'string' ? { rest: treatment } : treatment;
  const rest = tone ? tone.rest ?? 'none' : undefined;
  const active = tone?.active && tone.active !== rest ? tone.active : undefined;
  const files = layers.map((l) => `${l.src} ${l.srcSet ?? ''}`).join('|');

  useEffect(() => {
    const now: Partial<Record<LayerKey, 'loading' | 'loaded'>> = {};
    for (const [key, el] of Object.entries(imgs.current)) if (el?.complete && el.naturalWidth > 0) now[key as LayerKey] = 'loaded';
    setLoads(now);
  }, [files]);

  // A new scheme: before the first file has loaded, switch at once; after, keep the old file until the new one has.
  useLayoutEffect(() => {
    if (wanted === shown) return;
    if (loads[shown] !== 'loaded' || loads[wanted] === 'loaded' || loads[wanted] === 'failed') setShown(wanted);
  }, [wanted, shown, loads]);

  const settle = (key: LayerKey, result: 'loaded' | 'failed') => setLoads((was) => (was[key] === result ? was : { ...was, [key]: result }));
  const state = loads[shown] ?? 'loading';

  const frame = (attrs: DataAttributes) => (
    <span
      {...attrs}
      ref={frameRef}
      data-dl="image"
      style={
        width && height || focal
          ? ({ ...(width && height ? { '--image-ratio': `${width} / ${height}` } : {}), ...(focal ? { '--image-focus': `${focal.x * 100}% ${focal.y * 100}%` } : {}) } as CSSProperties)
          : undefined
      } data-ratio={ratio} data-fit={fit} data-state={state} data-rounded={rounded ? '' : undefined} data-tone={rest} data-tone-active={active}>
      {state === 'failed' && (
        <span data-dl-part="fallback" role={alt ? 'img' : undefined} aria-label={alt ? `${alt} (couldn’t load)` : undefined} aria-hidden={alt ? undefined : true}>
          <Icon name="image" size="lg" />
          {alt && <span data-dl-part="fallback-text" aria-hidden="true">{alt}</span>}
        </span>
      )}
      {layers.map((layer) => {
        const on = layer.key === shown;
        // The shown file, the file being readied under it (drawn beneath, so the swap is instant), or one not in use (not drawn, not fetched).
        const role = on ? 'on' : layer.key === wanted ? 'next' : 'off';
        if (on && state === 'failed') return null;
        return (
          <img
            key={layer.key}
            ref={(el) => {
              imgs.current[layer.key] = el;
            }}
            src={layer.src}
            srcSet={layer.srcSet}
            sizes={sizes}
            alt={on ? alt : ''}
            aria-hidden={on ? undefined : true}
            width={width}
            height={height}
            loading={role === 'on' ? (priority ? 'eager' : loading) : role === 'next' ? 'eager' : 'lazy'}
            fetchPriority={on && priority ? 'high' : undefined}
            decoding="async"
            data-layer={many ? role : undefined}
            onLoad={() => settle(layer.key, 'loaded')}
            onError={() => settle(layer.key, 'failed')}
          />
        );
      })}
    </span>
  );

  // MP8: without layers the frame is the root, as before; with them, one cell holds under, frame and decoration in that order.
  const layered = (decoration != null && decoration !== false) || (under != null && under !== false);
  const decorated = (attrs: DataAttributes) =>
    layered ? (
      <span {...attrs} data-dl="image-layers">
        {under != null && under !== false && (
          <span data-dl-part="under" aria-hidden="true">
            {under}
          </span>
        )}
        {frame({})}
        {decoration != null && decoration !== false && (
          <span data-dl-part="decoration" aria-hidden="true">
            {decoration}
          </span>
        )}
      </span>
    ) : (
      frame(attrs)
    );

  if (!caption && !credit) return decorated(data);

  return (
    <figure {...data} data-dl="figure">
      {decorated({})}
      <figcaption data-dl-part="caption">
        {caption}
        {credit && <span data-dl-part="credit">{credit}</span>}
      </figcaption>
    </figure>
  );
}
