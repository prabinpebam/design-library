import type { DataAttributes } from '../types';

export interface ScreenPreviewProps extends DataAttributes {
  /** The screen to show: an address in this app that renders it on its own, e.g. "#/app/corporate". */
  src: string;
  /** Names the frame for assistive technology: "Corporate site in a phone-sized window". */
  title: string;
  /** The window's width: `phone` (375 px), `tablet` (768 px) or `fill` (the column's width). */
  width?: 'phone' | 'tablet' | 'fill';
  /** One short line under the frame: what to notice at this width. */
  caption?: string;
}

/**
 * A whole screen shown in a window of a chosen width, live, so its narrow behaviour is the real thing (media and
 * container queries answer to the frame, not to the page around it). For documenting a layout or a preset.
 * Not for embedding third-party content or for a component's own example (Example).
 * @tier compound
 * @family documentation
 * @a11y A `figure` holding a titled `iframe` (the screen's own landmarks and headings are inside it) and the caption
 * as its `figcaption`. The frame is focusable through its content; it loads only when scrolled near.
 */
export function ScreenPreview({ src, title, width = 'fill', caption, ...data }: ScreenPreviewProps) {
  return (
    <figure {...data} data-dl="screen-preview" data-width={width}>
      <iframe src={src} title={title} loading="lazy" data-dl-part="frame" />
      {caption && <figcaption data-dl-part="caption">{caption}</figcaption>}
    </figure>
  );
}
