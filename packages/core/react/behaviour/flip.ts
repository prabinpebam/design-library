import { useLayoutEffect, useRef } from 'react';

/**
 * FLIP (Q65 P6, strategy S5): an element, or one of its pseudo-elements, that changed place in the layout appears to
 * travel from where it was. Record its box before the change (`boxOf`), let the DOM change, then `flip` plays the
 * inverse transform back to none over the move role. Tier 0 behaviour, no styles; Web Animations only (R8).
 *
 * - Retargets, never restarts (M8): `boxOf` reads the box as drawn, including a running flip's transform, and `flip`
 *   cancels the running one before starting from there.
 * - Never gates input (R9): the element is already in its new place; only its drawing travels.
 * - Reduced motion: the move role is 0 there, so `flip` does nothing and the change is instant.
 */

/** A box as drawn on screen, in viewport pixels. */
export interface FlipBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FLIP_ID = 'dl-flip';

/** A duration custom property's value in milliseconds ("200ms" or "0.2s"); 0 when unset. */
export function durationOf(el: Element, property = '--duration-move'): number {
  const v = getComputedStyle(el).getPropertyValue(property).trim();
  if (!v) return 0;
  return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
}

/**
 * Where an element (or its `::before` / `::after`) is drawn now. A pseudo-element must be absolutely positioned, so its
 * computed offsets and size are used values. Transforms are read with their origin at the top start corner, the
 * origin `flip` animates from.
 */
export function boxOf(el: Element, pseudo?: '::before' | '::after'): FlipBox {
  const r = el.getBoundingClientRect();
  if (!pseudo) return { x: r.left, y: r.top, w: r.width, h: r.height };
  const cs = getComputedStyle(el, pseudo);
  const m = cs.transform && cs.transform !== 'none' ? new DOMMatrixReadOnly(cs.transform) : null;
  const w = parseFloat(cs.width) || 0;
  const h = parseFloat(cs.height) || 0;
  return {
    x: r.left + (parseFloat(cs.left) || 0) + (m?.e ?? 0),
    y: r.top + (parseFloat(cs.top) || 0) + (m?.f ?? 0),
    w: w * (m?.a ?? 1),
    h: h * (m?.d ?? 1),
  };
}

/** Cancels a running flip on an element or one of its pseudo-elements. */
export function cancelFlip(el: Element, pseudo?: string) {
  // A pseudo-element's animations are listed only with subtree; keep this element's own.
  for (const a of el.getAnimations({ subtree: true })) {
    const effect = a.effect as KeyframeEffect | null;
    if (a.id !== FLIP_ID || effect?.target !== el) continue;
    if ((effect.pseudoElement ?? undefined) === pseudo) a.cancel();
  }
}

/**
 * Plays an element (or its pseudo-element) from `from` to where it is now, by `translate` and `scale` with the origin at
 * its top-left corner. `duration` defaults to the element's move role; `easing` to the standard curve.
 */
export function flip(
  el: Element,
  from: FlipBox,
  options: { pseudo?: '::before' | '::after'; duration?: number; easing?: string; travel?: 'box' | 'position' | 'block' } = {},
): Animation | null {
  const { pseudo, travel = 'box' } = options;
  const duration = options.duration ?? durationOf(el);
  cancelFlip(el, pseudo);
  if (!duration || typeof el.animate !== 'function') return null;
  const to = boxOf(el, pseudo);
  if (!to.w || !to.h) return null;
  // `position` travels without stretching (list items, cards); `block` only up and down (a centred stack whose
  // members change width on their own).
  const dx = travel === 'block' ? 0 : from.x - to.x;
  const dy = from.y - to.y;
  const sx = travel === 'box' ? from.w / to.w : 1;
  const sy = travel === 'box' ? from.h / to.h : 1;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return null;
  const easing = options.easing ?? (getComputedStyle(el).getPropertyValue('--easing-standard').trim() || 'ease-out');
  return el.animate(
    [
      { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
      { transformOrigin: '0 0', transform: 'none' },
    ],
    { duration, easing, pseudoElement: pseudo, id: FLIP_ID },
  );
}

/**
 * A selection indicator that slides (Q65 C6, M14): under a pointer press the chosen item's indicator travels from the
 * previous one's place; under keys, or a change made elsewhere, it moves at once (Z8). Put `root` on the group, call
 * `capture()` in the change handler (before the new value renders), and spread `input` on the group. While a change
 * settles the group carries `data-settling` ("pointer" or "key") for two frames, so its CSS can make the indicator's
 * own fill change at once (it is travelling, not fading) and, under keys, the text colour too.
 */
export function useSlidingIndicator<T extends HTMLElement>(selected: string, find: (root: T) => Element | null, pseudo: '::before' | '::after') {
  const root = useRef<T>(null);
  const from = useRef<{ el: Element; box: FlipBox } | null>(null);
  const byPointer = useRef(false);
  const first = useRef(true);
  const capture = () => {
    const r = root.current;
    const el = r && find(r);
    from.current = el ? { el, box: boxOf(el, pseudo) } : null;
  };
  useLayoutEffect(() => {
    const r = root.current;
    if (first.current || !r) {
      first.current = false;
      return;
    }
    const f = from.current;
    from.current = null;
    r.dataset.settling = byPointer.current && f ? 'pointer' : 'key';
    const el = find(r);
    if (f) cancelFlip(f.el, pseudo);
    if (f && el && el !== f.el && byPointer.current) flip(el, f.box, { pseudo });
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => delete r.dataset.settling);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  const input = {
    onPointerDown: () => {
      byPointer.current = true;
    },
    onKeyDown: () => {
      byPointer.current = false;
    },
  };
  return { root, capture, input };
}

/** How many items may travel in one change (T13 `count.flip-max`); past it the change is one fade in place (MU8). */
export function flipMax(el: Element): number {
  const v = parseFloat(getComputedStyle(el).getPropertyValue('--count-flip-max'));
  return Number.isFinite(v) && v > 0 ? v : 30;
}

/**
 * A list whose items keep their place on screen when it changes (Q65 C11, C15, C23; S5): items added, removed,
 * reordered or moved to another column travel from where they were drawn to where they now are. Mark each item
 * `data-flip-key="<id>"` anywhere inside `root` (so a card moved to another column travels across), and pass a
 * `signature` that changes whenever membership, order or an item's size may change (keys, joined).
 *
 * - The boxes are read during the render that changes the signature, while the page still shows the old layout, so a
 *   change made mid-flight starts from where each item is drawn (M8, retargets).
 * - Items travel by `translate` only, so their content never stretches; `travel: 'block'` for a centred stack.
 * - Several changes at once are one change (MU8): every item travels together. Past `count.flip-max` travelling
 *   items nothing travels: the list fades its new arrangement in over the change role instead (S7).
 * - `paused` while something else reads the boxes (a pointer drag that reorders under the pointer).
 * - New items arrive by their own presence rule (`data-presence="item"`, motion.css); `root` carries
 *   `data-flip-settled` after first render so nothing animates on arrival (Z19).
 * - `size`: the list's own height eases down when it gets shorter (a removal), so what follows doesn't jump.
 * - Reduced motion: the move role is 0, so nothing travels; the fade past the cap stays (fades are kept, G1).
 */
export function useFlipList<T extends HTMLElement>(signature: string, options: { paused?: boolean; travel?: 'position' | 'block'; size?: boolean } = {}) {
  const root = useRef<T>(null);
  const committed = useRef(signature);
  const before = useRef<Map<string, { box: FlipBox; el: HTMLElement }> | null>(null);
  const height = useRef(0);
  if (signature !== committed.current && root.current && !options.paused) {
    const boxes = new Map<string, { box: FlipBox; el: HTMLElement }>();
    for (const el of root.current.querySelectorAll<HTMLElement>('[data-flip-key]')) boxes.set(el.dataset.flipKey!, { box: boxOf(el), el });
    before.current = boxes;
    height.current = root.current.getBoundingClientRect().height;
  }
  useLayoutEffect(() => {
    const r = root.current;
    if (r) r.dataset.flipSettled = '';
  }, []);
  useLayoutEffect(() => {
    if (signature === committed.current) return;
    committed.current = signature;
    const r = root.current;
    const from = before.current;
    before.current = null;
    if (!r || !from || options.paused) return;
    if (options.size) {
      // The list closes up with its items (S5): a shorter list eases to its new height on the move role, so what follows
      // it moves with the items instead of jumping when the last ones leave. Growing is instant: the arriving item fades
      // in where it is, and a box held short would let it overlap what follows.
      for (const a of r.getAnimations()) if (a.id === 'dl-flip-size') a.cancel();
      const now = r.getBoundingClientRect().height;
      const move = durationOf(r, '--duration-move');
      if (move && height.current - now > 0.5 && typeof r.animate === 'function') {
        r.animate([{ blockSize: `${height.current}px` }, { blockSize: `${now}px` }], { duration: move, easing: getComputedStyle(r).getPropertyValue('--easing-standard').trim() || 'ease-out', id: 'dl-flip-size' });
      }
    }
    const moving: [HTMLElement, FlipBox][] = [];
    for (const el of r.querySelectorAll<HTMLElement>('[data-flip-key]')) {
      const was = from.get(el.dataset.flipKey!);
      if (!was) continue;
      const { box } = was;
      cancelFlip(el);
      const now = el.getBoundingClientRect();
      // An item drawn before travels; it doesn't arrive (a card moved to another column is a new element there).
      for (const a of el.getAnimations()) if (was.el !== el && a instanceof CSSTransition && a.transitionProperty === 'opacity') a.finish();
      if (Math.abs(now.top - box.y) > 0.5 || (options.travel !== 'block' && Math.abs(now.left - box.x) > 0.5)) moving.push([el, box]);
    }
    if (moving.length > flipMax(r)) {
      const change = durationOf(r, '--duration-change');
      if (change && typeof r.animate === 'function') r.animate([{ opacity: 0 }, { opacity: 1 }], { duration: change, easing: getComputedStyle(r).getPropertyValue('--easing-standard').trim() || 'ease-out' });
      return;
    }
    for (const [el, box] of moving) flip(el, box, { travel: options.travel ?? 'position' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  return root;
}
