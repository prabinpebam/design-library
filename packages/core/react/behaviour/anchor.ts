/**
 * Tier 0: anchored placement for floating surfaces that sit beside their trigger (Tooltip, Popover), as one rule.
 * The surface goes on the asked side of its anchor, flips to the opposite side when it doesn't fit there and the other
 * side has more room, is centred on the anchor along that side, and shifts to stay inside the window. Logical sides:
 * `start` and `end` follow the writing direction. The pure `placeAnchored` decides; `useAnchored` applies it to a
 * manual popover in the top layer and follows the anchor as the page scrolls or resizes.
 */
import { useEffect, type RefObject } from 'react';

export type AnchorSide = 'top' | 'bottom' | 'start' | 'end' | 'over';

interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const opposite: Record<Exclude<AnchorSide, 'over'>, Exclude<AnchorSide, 'over'>> = { top: 'bottom', bottom: 'top', start: 'end', end: 'start' };

/** Where a surface of `size` goes for an anchor rectangle, in viewport pixels. `margin` is kept clear of the window's edges. Pure. */
export function placeAnchored(anchor: Rect, size: { width: number; height: number }, viewport: { width: number; height: number }, side: AnchorSide, offset: number, rtl = false, margin = 8, align: 'center' | 'start' = 'center', crossOffset = 0) {
  const clamp = (v: number, max: number) => Math.max(margin, Math.min(v, max - margin));
  if (side === 'over') {
    const x = clamp(rtl ? anchor.right - size.width : anchor.left, viewport.width - size.width);
    const y = clamp(anchor.top, viewport.height - size.height);
    return { side: 'over' as AnchorSide, x, y, arrow: 0 };
  }
  const physical = (s: Exclude<AnchorSide, 'over'>) => (s === 'start' ? (rtl ? 'right' : 'left') : s === 'end' ? (rtl ? 'left' : 'right') : s);
  const room = (s: Exclude<AnchorSide, 'over'>) => {
    const p = physical(s);
    return p === 'top' ? anchor.top : p === 'bottom' ? viewport.height - anchor.bottom : p === 'left' ? anchor.left : viewport.width - anchor.right;
  };
  const need = (s: Exclude<AnchorSide, 'over'>) => (s === 'top' || s === 'bottom' ? size.height : size.width) + offset + margin;
  const chosen = room(side) < need(side) && room(opposite[side]) > room(side) ? opposite[side] : side;
  const p = physical(chosen);
  if (p === 'top' || p === 'bottom') {
    // Above or below: centred on the anchor, or level with its start edge (a wide surface under a narrow button).
    const base = align === 'start' ? (rtl ? anchor.right - size.width : anchor.left) : (anchor.left + anchor.right) / 2 - size.width / 2;
    const x = clamp(base + crossOffset, viewport.width - size.width);
    const y = p === 'top' ? anchor.top - offset - size.height : anchor.bottom + offset;
    return { side: chosen, x, y, arrow: (anchor.left + anchor.right) / 2 - x };
  }
  const y = clamp((anchor.top + anchor.bottom) / 2 - size.height / 2 + crossOffset, viewport.height - size.height);
  const x = p === 'left' ? anchor.left - offset - size.width : anchor.right + offset;
  return { side: chosen, x, y, arrow: (anchor.top + anchor.bottom) / 2 - y };
}

/** A CSS length custom property on `el` in pixels (px or rem). */
export function cssPixels(el: Element, name: string) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  return raw.endsWith('rem') ? n * parseFloat(getComputedStyle(document.documentElement).fontSize) : n;
}

/** A CSS duration custom property on `el` in milliseconds (ms or s). */
export function cssMs(el: Element, name: string) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n;
}

/**
 * Shows `surface` (a `popover="manual"` element) in the top layer beside `anchor` while `open`, and keeps it there.
 * Writes `data-side` and the `--anchored-start`, `--anchored-y` and `--anchored-arrow` properties for the CSS to place it.
 * `offsetVar` names the CSS length between the anchor and the surface.
 */
export function useAnchored(open: boolean, anchor: RefObject<HTMLElement | null>, surface: RefObject<HTMLElement | null>, side: AnchorSide, offsetVar: string, align: 'center' | 'start' = 'center', crossOffsetVar?: string) {
  useEffect(() => {
    const el = surface.current;
    if (!open || !el || !anchor.current) return;
    el.showPopover?.();
    const place = () => {
      if (!anchor.current) return;
      const doc = document.documentElement;
      const rtl = getComputedStyle(anchor.current).direction === 'rtl';
      const cross = crossOffsetVar ? cssPixels(el, crossOffsetVar) : 0;
      const p = placeAnchored(anchor.current.getBoundingClientRect(), { width: el.offsetWidth, height: el.offsetHeight }, { width: doc.clientWidth, height: doc.clientHeight }, side, cssPixels(el, offsetVar), rtl, 8, align, cross);
      el.dataset.side = p.side;
      const sx = p.side === 'over' ? window.scrollX : 0;
      const sy = p.side === 'over' ? window.scrollY : 0;
      // Logical, as the popup lists: from the inline start edge of the window.
      el.style.setProperty('--anchored-start', `${(rtl ? doc.clientWidth - p.x - el.offsetWidth : p.x) + sx}px`);
      el.style.setProperty('--anchored-y', `${p.y + sy}px`);
      el.style.setProperty('--anchored-arrow', `${p.arrow}px`);
    };
    place();
    window.addEventListener('scroll', place, { capture: true, passive: true });
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, { capture: true });
      window.removeEventListener('resize', place);
      if (el.matches(':popover-open')) el.hidePopover?.();
    };
  }, [open, side]);
}
