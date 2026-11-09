/**
 * Popup placement (tier 0 behaviour, F10): one rule for every popup list (MenuButton's menu, Select's listbox).
 * The popup opens in the top layer as a manual popover, so no scrolling or clipping ancestor cuts it off; it sits under
 * its anchor at least as wide as it, flips above when there's more room there, stays inside the window, follows the
 * anchor as the page scrolls or resizes, is never taller than the room on its side (it scrolls instead), and a press outside `within` dismisses it.
 */
import { useEffect, type RefObject } from 'react';

/** Where a popup goes for an anchor rectangle, in pixels from the viewport's start and top edges. Pure. */
export function placePopup(anchor: { top: number; bottom: number; left: number; right: number }, popup: { width: number; height: number }, viewport: { width: number; height: number }, rtl = false) {
  const below = viewport.height - anchor.bottom;
  const above = anchor.top;
  const flip = popup.height > below && above > below;
  const start = rtl ? viewport.width - anchor.right : anchor.left;
  return { placement: flip ? ('above' as const) : ('below' as const), edge: flip ? anchor.top : anchor.bottom, room: flip ? above : below, start: Math.max(0, Math.min(start, viewport.width - popup.width)) };
}

export function usePopup(open: boolean, anchor: RefObject<HTMLElement | null>, popup: RefObject<HTMLElement | null>, within: RefObject<HTMLElement | null>, onDismiss: () => void) {
  useEffect(() => {
    const el = popup.current;
    if (!open || !el || !anchor.current) return;
    el.showPopover?.();
    const place = () => {
      if (!anchor.current) return;
      const r = anchor.current.getBoundingClientRect();
      const doc = document.documentElement;
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
