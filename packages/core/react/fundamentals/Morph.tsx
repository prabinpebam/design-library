import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { durationOf } from '../behaviour/flip';
import type { DataAttributes } from '../types';

export interface MorphProps extends DataAttributes {
  /**
   * Names the state being shown, e.g. `form`, `done`, `failed`, `loading`. A new value morphs to the new content in
   * the same box; the same value keeps it. Morph into a state that is ready (M12): while it's being fetched, keep the
   * current state and show its own pending sign.
   */
  state: string;
  /**
   * How the box's size follows the content: `layout` (default) animates its height from the old content's to the
   * new one's, moving what follows (the one layout animation an interaction may have, R3); `hold` keeps the box at its
   * new size at once, for a box whose size doesn't change or whose neighbours mustn't move.
   */
  size?: 'layout' | 'hold';
  /**
   * How the layers cross: `fade` (default); `zoom-out` / `zoom-in` for a change of level (a calendar's month to its
   * year and back, C21): the layers also scale by `motion.zoom-scale` the way the level moves; `none` swaps at once,
   * for a change the person drives step by step with keys (Z8). Reduced motion: the zooms only fade.
   */
  motion?: 'fade' | 'zoom-out' | 'zoom-in' | 'none';
  /** The content of the current state. */
  children: ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex^="-"])';

/**
 * One box whose content changes state in place (Q65 P3, strategy S2, "fake the content"): the box stays, the old
 * content fades out quickly on top while the new one fades in under it, and the height eases between them. Nothing
 * blinks out and back: a dialog's form becomes its result, a card's skeleton becomes its content, a thinking row
 * becomes the answer. A quick change of mind reverses from where it is (the leaving content comes back).
 * Not for a value that changes within one control (its own transition), something opening in place (Reveal), or
 * something arriving from nowhere (presence).
 * @tier fundamental
 * @family layout
 * @a11y The leaving content is `inert` and `aria-hidden` from its first frame (M13). If focus was inside it, focus moves
 * first to the new content's `[data-morph-focus]` element, else its first focusable element, else the new content
 * itself. The new state is announced by its owner through the status region, never by the fade. First render never
 * animates (Z19). Reduced motion, or a change while the document is hidden: the height snaps; the content still
 * cross-fades.
 */
export function Morph({ state, size = 'layout', motion = 'fade', children, ...data }: MorphProps) {
  const root = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState<{ state: string; children: ReactNode } | null>(null);
  const current = useRef({ state, children });
  const height = useRef(0);
  const [settled, setSettled] = useState(false);

  // The state changed: the previous content becomes the one leaving layer (the latest change wins, M8).
  if (current.current.state !== state) {
    const previous = current.current;
    setLeaving(leaving?.state === state || motion === 'none' ? null : { state: previous.state, children: previous.children });
  }
  current.current = { state, children };

  useEffect(() => setSettled(true), []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const before = height.current;
    const after = el.getBoundingClientRect().height;
    height.current = after;
    if (!leaving) return;
    const layer = el.querySelector<HTMLElement>(':scope > [data-dl-part="layer"]:not([data-leaving])');
    const old = el.querySelector<HTMLElement>(':scope > [data-dl-part="layer"][data-leaving]');
    if (layer && old?.contains(document.activeElement)) {
      const target = layer.querySelector<HTMLElement>('[data-morph-focus]') ?? layer.querySelector<HTMLElement>(FOCUSABLE) ?? layer;
      // The layer, or a marked element that can't take focus on its own (a heading's region), takes it from code only.
      if (!target.matches(FOCUSABLE) && !target.hasAttribute('tabindex')) target.tabIndex = -1;
      target.focus();
    }
    const move = durationOf(el, '--duration-move');
    // Where the box was drawn: mid-way through a running morph, its current height; otherwise the old content's.
    const running = el.getAnimations().some((a) => a.id === 'dl-morph');
    const from = running ? after : (old?.getBoundingClientRect().height ?? before);
    const to = (layer?.getBoundingClientRect().height ?? after);
    // A hidden document's timeline doesn't advance: the ease would hold the old height until the page is shown, then
    // replay a change nobody saw. The box takes its new height at once.
    const hidden = document.visibilityState === 'hidden';
    if (hidden) for (const a of el.getAnimations()) if (a.id === 'dl-morph') a.cancel();
    if (size === 'layout' && move && from && !hidden && Math.abs(from - to) > 0.5) {
      const easing = getComputedStyle(el).getPropertyValue('--easing-standard').trim() || 'ease-out';
      for (const a of el.getAnimations()) if (a.id === 'dl-morph') a.cancel();
      el.animate([{ blockSize: `${from}px`, overflow: 'clip' }, { blockSize: `${to}px`, overflow: 'clip' }], { duration: move, easing, id: 'dl-morph' });
    }
    const t = window.setTimeout(() => setLeaving(null), Math.max(durationOf(el, '--duration-quick'), move));
    return () => window.clearTimeout(t);
  }, [state, leaving, size]);

  // The box's height as last drawn (mid-animation too), so the next change starts from where it is.
  useLayoutEffect(() => {
    if (root.current) height.current = root.current.getBoundingClientRect().height;
  });

  return (
    <div {...data} ref={root} data-dl="morph" data-size={size} data-motion={motion === 'fade' ? undefined : motion} data-settled={settled ? '' : undefined}>
      {leaving && (
        <div key={leaving.state} data-dl-part="layer" data-leaving="" inert aria-hidden="true">
          {leaving.children}
        </div>
      )}
      <div key={state} data-dl-part="layer">
        {children}
      </div>
    </div>
  );
}
