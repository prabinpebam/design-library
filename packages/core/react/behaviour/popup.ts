/**
 * Popup placement (tier 0 behaviour, F10): one rule for every popup list (MenuButton's menu, Select's listbox).
 * The popup opens in the top layer as a manual popover, so no scrolling or clipping ancestor cuts it off; it sits under
 * its anchor at least as wide as it, flips above when there's more room there, stays inside the window, follows the
 * anchor as the page scrolls or resizes, is never taller than the room on its side (it scrolls instead), and a press outside `within` dismisses it.
 * Its width fits its content, snapped up to the next width step (Q130, docs/widths.md), unless pinned with `data-width`.
 */
import { useEffect, type RefObject } from 'react';

/** Where a popup goes for an anchor rectangle, in pixels from the viewport's start and top edges. Pure. */
export function placePopup(anchor: { top: number; bottom: number; left: number; right: number }, popup: { width: number; height: number }, viewport: { width: number; height: number }, rtl = false) {
  const below = viewport.height - anchor.bottom;
  const above = anchor.top;
  const flip = popup.height > below && above > below;
  const rawStart = rtl ? viewport.width - anchor.right : anchor.left;
  const endAligned = rtl ? viewport.width - anchor.left - popup.width : anchor.right - popup.width;
  const preferred = rawStart + popup.width > viewport.width ? endAligned : rawStart;
  return { placement: flip ? ('above' as const) : ('below' as const), edge: flip ? anchor.top : anchor.bottom, room: flip ? above : below, start: Math.max(0, Math.min(preferred, viewport.width - popup.width)) };
}

/** The width steps a popup list may take (Q130, `size.width-*`), narrowest first. Lists never snap wider than `md`. */
export const listWidthSteps = ['xs', 'sm', 'md'] as const;
/** A width step a popup list can be pinned to (Q130): the list steps, and `lg` for lists with descriptions or previews. */
export type ListWidth = 'xs' | 'sm' | 'md' | 'lg';

/** Q130: the narrowest step at least as wide as the content; past the widest step, the widest (the content wraps). Pure. */
export function snapWidth(natural: number, steps: number[]): number {
  return steps.find((s) => s >= natural) ?? steps[steps.length - 1] ?? natural;
}

/** The list steps in pixels, read from the tokens so a theme that changes them is followed. */
function stepPixels(el: HTMLElement): number[] {
  const root = getComputedStyle(document.documentElement);
  const rem = parseFloat(root.fontSize) || 16;
  return listWidthSteps.map((s) => {
    const v = root.getPropertyValue(`--size-width-${s}`).trim();
    return v.endsWith('rem') ? parseFloat(v) * rem : parseFloat(v) || el.offsetWidth;
  });
}

/**
 * Q130: sizes a popup list to its content, snapped up to the next width step, measured once as it opens so the width
 * never shifts while it's open (typing to narrow, scrolling). A popup with `data-width` is pinned and left alone.
 */
function fitPopup(el: HTMLElement) {
  if (el.dataset.width) return;
  el.style.removeProperty('--popup-fit');
  el.style.setProperty('min-inline-size', '0px');
  el.style.setProperty('inline-size', 'max-content');
  const natural = el.offsetWidth;
  el.style.removeProperty('inline-size');
  el.style.removeProperty('min-inline-size');
  el.style.setProperty('--popup-fit', `${snapWidth(natural, stepPixels(el))}px`);
}

export function usePopup(open: boolean, anchor: RefObject<HTMLElement | null>, popup: RefObject<HTMLElement | null>, within: RefObject<HTMLElement | null>, onDismiss: () => void, side: 'block' | 'inline' = 'block') {
  useEffect(() => {
    const el = popup.current;
    if (!open || !el || !anchor.current) return;
    el.showPopover?.();
    fitPopup(el);
    const place = () => {
      if (!anchor.current) return;
      const r = anchor.current.getBoundingClientRect();
      const doc = document.documentElement;
      if (side === 'inline') {
        // A submenu: beside its item, at the end side, or the start side when the end has no room; top-aligned with it, kept inside the window.
        const rtl = getComputedStyle(anchor.current).direction === 'rtl';
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const endRoom = rtl ? r.left : doc.clientWidth - r.right;
        const atEnd = endRoom >= w || endRoom >= (rtl ? doc.clientWidth - r.right : r.left);
        const left = atEnd !== rtl ? r.right : r.left - w;
        const edge = Math.max(0, Math.min(r.top, doc.clientHeight - h));
        el.dataset.placement = 'beside';
        el.style.setProperty('--popup-min-inline', '0px');
        el.style.setProperty('--popup-edge', `${edge}px`);
        el.style.setProperty('--popup-start', `${Math.max(0, Math.min(rtl ? doc.clientWidth - left - w : left, doc.clientWidth - w))}px`);
        el.style.setProperty('--popup-room', `${doc.clientHeight - edge}px`);
        return;
      }
      el.style.setProperty('--popup-min-inline', `${r.width}px`);
      // The list's whole height, not the height it's capped to, so a capped list still flips to the roomier side.
      const list = el.querySelector<HTMLElement>("[data-dl-part='content']");
      const natural = Math.max(el.offsetHeight, list?.offsetHeight ?? 0);
      const p = placePopup(r, { width: el.offsetWidth, height: natural }, { width: doc.clientWidth, height: doc.clientHeight }, getComputedStyle(anchor.current).direction === 'rtl');
      el.dataset.placement = p.placement;
      el.style.setProperty('--popup-edge', `${p.edge}px`);
      el.style.setProperty('--popup-start', `${p.start}px`);
      el.style.setProperty('--popup-room', `${p.room}px`);
    };
    place();
    const outside = (e: PointerEvent) => {
      if (!within.current?.contains(e.target as Node)) onDismiss();
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('scroll', place, { capture: true, passive: true });
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('scroll', place, { capture: true });
      window.removeEventListener('resize', place);
      if (el.matches(':popover-open')) el.hidePopover?.();
    };
  }, [open]);
}
