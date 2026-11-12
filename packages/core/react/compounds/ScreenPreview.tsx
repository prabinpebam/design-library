import { useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from 'react';
import type { DataAttributes } from '../types';

/**
 * The framed screen is a region of the page around it, so its document scrolls with the library's bar, never the
 * browser's (Q109): mark its root and scroll-area.css draws the library's thin bar on it. Same-origin screens only.
 */
const markFramed = (e: SyntheticEvent<HTMLIFrameElement>) => {
  try {
    e.currentTarget.contentDocument?.documentElement.setAttribute('data-dl-framed', '');
  } catch {
    // A screen from another origin can't be reached; ScreenPreview isn't for third-party content.
  }
};

export interface ScreenPreviewProps extends DataAttributes {
  /** The screen to show: an address in this app that renders it on its own, e.g. "#/app/corporate". */
  src: string;
  /** Names the frame for assistive technology: "Corporate site in a phone-sized window". */
  title: string;
  /**
   * The window's width: `phone` (375 px), `tablet` (768 px), `fill` (the column's width) or `desktop`: the screen laid
   * out at least as wide as a desktop window (the theme's `c.screen-preview.desktop`, 1280 px) and drawn scaled down to
   * fit the column, so a narrower frame still shows the desktop layout (a page builder's wide canvas). Wider than that,
   * `desktop` is `fill`.
   */
  width?: 'phone' | 'tablet' | 'desktop' | 'fill';
  /** One short line under the frame: what to notice at this width. */
  caption?: string;
  /** The window's height: `default` (the theme's `c.screen-preview.height`, 40 rem) or `fill`, the height its parent gives it (an editor's working area), less the caption. */
  height?: 'default' | 'fill';
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
export function ScreenPreview({ src, title, width = 'fill', caption, height = 'default', ...data }: ScreenPreviewProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; width: number; height: number }>();
  const desktop = width === 'desktop';
  useEffect(() => {
    const el = viewport.current;
    if (!desktop || !el || typeof ResizeObserver === 'undefined') return setFit(undefined);
    const measure = () => {
      const value = getComputedStyle(el).getPropertyValue('--c-screen-preview-desktop').trim();
      const least = parseFloat(value) * (value.endsWith('rem') ? parseFloat(getComputedStyle(document.documentElement).fontSize) : 1);
      const { clientWidth: w, clientHeight: h } = el;
      // Laid out at least a desktop window wide; scaled so that width fits the viewport, and as tall as it fills.
      const scale = w && least && w < least ? w / least : 1;
      setFit(w ? { scale, width: w / scale, height: h / scale } : undefined);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [desktop]);
  const frame = <iframe src={src} title={title} loading="lazy" data-dl-part="frame" onLoad={markFramed} />;
  const scaled = fit ? ({ '--dl-screen-scale': fit.scale, '--dl-screen-width': `${fit.width}px`, '--dl-screen-height': `${fit.height}px` } as CSSProperties) : undefined;
  return (
    <figure {...data} data-dl="screen-preview" data-width={width} data-height={height === 'fill' ? 'fill' : undefined}>
      {desktop ? (
        <div ref={viewport} data-dl-part="viewport" data-scaled={fit && fit.scale < 1 ? '' : undefined} style={scaled}>
          {frame}
        </div>
      ) : (
        frame
      )}
      {caption && <figcaption data-dl-part="caption">{caption}</figcaption>}
    </figure>
  );
}
