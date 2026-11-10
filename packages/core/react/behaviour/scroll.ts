/**
 * The overlay scrollbar's behaviour (F14), shared by ScrollArea and the popup lists (Select, MenuButton) so every scroll
 * region draws the same bar: measure the thumb from the viewport, show it while scrolling, drag it, page on a track
 * press. Tier 0 behaviour, no styles: the markup it returns is styled by `scroll-area.css` through `data-dl="scroll-area"`.
 */
import { createElement, useCallback, useEffect, useRef, useState, type ReactNode, type Ref, type PointerEvent as ReactPointerEvent } from 'react';

type Axis = 'x' | 'y';

function ms(value: string, fallback: number) {
  const v = value.trim();
  if (!v) return fallback;
  return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
}

/**
 * Wires one scroll region. Put `root` on the element with `data-dl="scroll-area"`, `setViewport` on its viewport part,
 * and render `tracks(axis)` after the viewport. Pass `active` false while the region is hidden (a closed popup) and true
 * when it shows, so it measures on opening.
 */
export function useOverlayScroll(viewportRef?: Ref<HTMLDivElement>, active = true) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const idle = useRef(0);
  const [overflow, setOverflow] = useState({ inline: false, block: false });

  const setViewport = useCallback(
    (node: HTMLDivElement | null) => {
      viewport.current = node;
      if (typeof viewportRef === 'function') viewportRef(node);
      else if (viewportRef) (viewportRef as { current: HTMLDivElement | null }).current = node;
    },
    [viewportRef],
  );

  const measure = useCallback(() => {
    const el = viewport.current;
    const box = root.current;
    if (!el || !box) return;
    const axes = (['x', 'y'] as Axis[]).map((a) => {
      const view = a === 'y' ? el.clientHeight : el.clientWidth;
      const full = a === 'y' ? el.scrollHeight : el.scrollWidth;
      const over = full - view > 1;
      return { a, view, full, over };
    });
    for (const { a, over } of axes) box.toggleAttribute(`data-overflow-${a}`, over);
    const inline = axes[0].over;
    const block = axes[1].over;
    setOverflow((current) => current.inline === inline && current.block === block ? current : { inline, block });
    for (const { a, view, full, over } of axes) {
      const bar = box.querySelector<HTMLElement>(`:scope > [data-dl-part='track'][data-axis='${a}']`);
      if (!over || !bar) continue;
      const pos = Math.abs(a === 'y' ? el.scrollTop : el.scrollLeft);
      const track = a === 'y' ? bar.clientHeight : bar.clientWidth;
      const thumbStyle = getComputedStyle(bar.firstElementChild as HTMLElement);
      const min = parseFloat(a === 'y' ? thumbStyle.minHeight : thumbStyle.minWidth) || 0;
      const size = Math.min(track, Math.max(min, (track * view) / full));
      const offset = (pos / (full - view)) * (track - size);
      box.style.setProperty(`--scroll-area-thumb-size-${a}`, `${size}px`);
      box.style.setProperty(`--scroll-area-thumb-offset-${a}`, `${offset}px`);
    }
  }, []);

  useEffect(() => {
    const el = viewport.current;
    const box = root.current;
    if (!el || !box || !active) return;
    const onScroll = () => {
      measure();
      box.setAttribute('data-scrolling', '');
      window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => box.removeAttribute('data-scrolling'), ms(getComputedStyle(box).getPropertyValue('--c-scroll-area-idle'), 1000));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    // Its initial notification measures after layout, rather than forcing layout in a discrete React commit.
    const sizes = new ResizeObserver(measure);
    sizes.observe(el);
    const watchChildren = () => {
      for (const child of el.children) sizes.observe(child);
    };
    watchChildren();
    const changes = new MutationObserver(() => {
      watchChildren();
      measure();
    });
    changes.observe(el, { childList: true, characterData: true, subtree: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      sizes.disconnect();
      changes.disconnect();
      window.clearTimeout(idle.current);
    };
  }, [measure, active]);

  /** Drag the thumb, or press the track to page towards the pointer. */
  const onTrackDown = (a: Axis) => (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = viewport.current;
    const box = root.current;
    if (!el || !box || event.button !== 0) return;
    event.preventDefault();
    const track = event.currentTarget;
    const thumb = track.firstElementChild as HTMLElement;
    const rtl = a === 'x' && getComputedStyle(el).direction === 'rtl';
    const sign = rtl ? -1 : 1;
    const coord = (e: { clientX: number; clientY: number }) => (a === 'y' ? e.clientY : e.clientX);
    if (event.target !== thumb) {
      const r = thumb.getBoundingClientRect();
      const before = a === 'y' ? coord(event) < r.top : rtl ? coord(event) > r.right : coord(event) < r.left;
      const page = (a === 'y' ? el.clientHeight : el.clientWidth) * 0.9;
      el.scrollBy({ [a === 'y' ? 'top' : 'left']: (before ? -page : page) * sign, behavior: 'instant' } as ScrollToOptions);
      return;
    }
    const startPointer = coord(event);
    const startScroll = a === 'y' ? el.scrollTop : el.scrollLeft;
    const view = a === 'y' ? el.clientHeight : el.clientWidth;
    const full = a === 'y' ? el.scrollHeight : el.scrollWidth;
    const travel = track.getBoundingClientRect()[a === 'y' ? 'height' : 'width'] - thumb.getBoundingClientRect()[a === 'y' ? 'height' : 'width'];
    const ratio = travel > 0 ? (full - view) / travel : 0;
    track.setPointerCapture(event.pointerId);
    box.setAttribute('data-dragging', '');
    const move = (e: PointerEvent) => {
      const next = startScroll + (coord(e) - startPointer) * ratio;
      if (a === 'y') el.scrollTop = next;
      else el.scrollLeft = next;
    };
    const up = () => {
      box.removeAttribute('data-dragging');
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', up);
      track.removeEventListener('pointercancel', up);
    };
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
  };

  /** The drawn bars for the region's axis, hidden from assistive technology. */
  const tracks = (axis: 'block' | 'inline' | 'both'): ReactNode[] =>
    (['y', 'x'] as Axis[])
      .filter((a) => (a === 'y' ? axis !== 'inline' : axis !== 'block'))
      .map((a) =>
        createElement('div', { key: a, 'data-dl-part': 'track', 'data-axis': a, 'aria-hidden': true, onPointerDown: onTrackDown(a) }, createElement('div', { 'data-dl-part': 'thumb' })),
      );

  return { root, setViewport, tracks, overflow };
}
