import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type SyntheticEvent } from 'react';
import { Skeleton } from '../fundamentals/Skeleton';
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
   * The window's width: `phone` (375 px), `landscape` (568 px, a phone held sideways; LR174), `tablet` (768 px), a number of px (LR177), `fill` (the column's width) or `desktop`: the screen laid
   * out at least as wide as a desktop window (the theme's `c.screen-preview.desktop`, 1280 px) and drawn scaled down to
   * fit the column, so a narrower frame still shows the desktop layout (a page builder's wide canvas). Wider than that,
   * `desktop` is `fill`.
   */
  width?: 'phone' | 'landscape' | 'tablet' | 'desktop' | 'fill' | number;
  /**
   * LR177 (opt-in): handles on the window's side edges resize it (a page builder's canvas, tested at any width). The window
   * stays centred, so a handle grows or shrinks it on both sides. A handle is a separator: drag it, or focus it and use
   * the arrow keys (Shift for four steps), Home and End. Reports through `onWidthChange`; pass the width back as a number.
   */
  resizable?: boolean;
  /** The width a handle sets, in px, while it's dragged (`done` false) and when it's let go or a key sets it (`done` true). */
  onWidthChange?: (px: number, done: boolean) => void;
  /** The handles' accessible name (default "Resize the screen"); their value is the width in px. */
  resizeLabel?: string;
  /** The least width a handle sets, in px (default 320). */
  resizeMin?: number;
  /** One short line under the frame: what to notice at this width. */
  caption?: string;
  /** The window's height: `default` (the theme's `c.screen-preview.height`, 40 rem) or `fill`, the height its parent gives it (an editor's working area), less the caption. */
  height?: 'default' | 'fill';
  /**
   * LR110 (opt-in): until the screen has loaded, a shimmer fills the window and the figure is busy, so a slow screen
   * never shows a blank white window (an editor's canvas). The frame stays hidden until then.
   */
  showLoading?: boolean;
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
export function ScreenPreview({ src, title, width = 'fill', caption, height = 'default', showLoading = false, resizable = false, onWidthChange, resizeLabel = 'Resize the screen', resizeMin = 320, ...data }: ScreenPreviewProps) {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; width: number; height: number }>();
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const [dragging, setDragging] = useState<'start' | 'end'>();
  const waiting = showLoading && loadedSrc !== src;
  const desktop = width === 'desktop';
  const custom = typeof width === 'number';
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
  const loaded = (e: SyntheticEvent<HTMLIFrameElement>) => {
    markFramed(e);
    // The next frame, so the screen has drawn once before the shimmer gives way.
    requestAnimationFrame(() => setLoadedSrc(src));
  };
  const frame = <iframe src={src} title={title} loading="lazy" data-dl-part="frame" data-waiting={waiting ? '' : undefined} onLoad={loaded} />;
  const scaled = fit ? ({ '--dl-screen-scale': fit.scale, '--dl-screen-width': `${fit.width}px`, '--dl-screen-height': `${fit.height}px` } as CSSProperties) : undefined;
  // LR177: the window's drawn width now (the frame's, or the scaled viewport's), the most the column allows, and a step.
  const resizing = resizable && !!onWidthChange && width !== 'fill';
  const measureNow = () => {
    const figure = root.current;
    const shown = figure?.querySelector<HTMLElement>(':scope > [data-dl-part="viewport"], :scope > [data-dl-part="frame"]');
    return { now: Math.round(shown?.getBoundingClientRect().width ?? 0), max: Math.round(figure?.clientWidth ?? 0) };
  };
  const clamp = (px: number, max: number) => Math.round(Math.max(Math.min(resizeMin, max), Math.min(px, max)));
  const onResizeDown = (side: 'start' | 'end') => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !onWidthChange) return;
    event.preventDefault();
    const { now, max } = measureNow();
    const rtl = root.current ? getComputedStyle(root.current).direction === 'rtl' : false;
    const sign = (side === 'end') !== rtl ? 1 : -1;
    const from = event.clientX;
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    setDragging(side);
    let last = now;
    // The window stays centred: the edge follows the pointer, so the width changes by twice the distance.
    const move = (e: PointerEvent) => { last = clamp(now + 2 * sign * (e.clientX - from), max); onWidthChange(last, false); };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      setDragging(undefined);
      if (last !== now) onWidthChange(last, true);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };
  const onResizeKey = (side: 'start' | 'end') => (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!onWidthChange) return;
    const { now, max } = measureNow();
    const step = event.shiftKey ? 32 : 8;
    // Arrows move the edge: away from the centre widens.
    const outward = side === 'end' ? 'ArrowRight' : 'ArrowLeft';
    const inward = side === 'end' ? 'ArrowLeft' : 'ArrowRight';
    const next = event.key === outward ? now + 2 * step : event.key === inward ? now - 2 * step
      : event.key === 'Home' ? resizeMin : event.key === 'End' ? max : undefined;
    if (next === undefined) return;
    event.preventDefault();
    onWidthChange(clamp(next, max), true);
  };
  const handles = resizing ? (['start', 'end'] as const).map(side => (
    <div key={side} data-dl-part="resize" data-side={side} data-dragging={dragging === side ? '' : undefined}
      role="separator" aria-orientation="vertical" aria-label={resizeLabel}
      aria-valuenow={custom ? (width as number) : undefined} aria-valuemin={resizeMin} tabIndex={0}
      onPointerDown={onResizeDown(side)} onKeyDown={onResizeKey(side)} />
  )) : null;
  const windowWidth = custom ? ({ '--dl-screen-window': `${width}px` } as CSSProperties) : undefined;
  return (
    <figure {...data} ref={root} data-dl="screen-preview" data-width={custom ? 'custom' : width} data-height={height === 'fill' ? 'fill' : undefined}
      data-resizable={resizing ? '' : undefined} aria-busy={waiting || undefined} style={windowWidth}>
      {desktop ? (
        <div ref={viewport} data-dl-part="viewport" data-scaled={fit && fit.scale < 1 ? '' : undefined} style={scaled}>
          {frame}
          {waiting && <span data-dl-part="loading"><Skeleton shape="block" /></span>}
        </div>
      ) : (
        <>
          {frame}
          {waiting && <span data-dl-part="loading"><Skeleton shape="block" /></span>}
        </>
      )}
      {caption && <figcaption data-dl-part="caption">{caption}</figcaption>}
      {handles}
    </figure>
  );
}
