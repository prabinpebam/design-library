import { useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent, type ReactElement, type ReactNode, type RefObject } from 'react';
import { cssMs, useAnchored, type AnchorSide } from '../behaviour/anchor';
import type { DataAttributes } from '../types';

export interface TooltipProps extends DataAttributes {
  /** The hint: a few words, never a sentence to act on, never links or buttons (use a Popover for those). */
  content: string;
  /** The one control it explains: an icon-only Button, a truncated label, a status mark. */
  children: ReactElement;
  /**
   * `label` (default): the control already carries these words, as its name (an icon-only Button's label) or its
   * description (an unavailable Button's reason), so the hint is hidden from assistive technology and isn't read twice.
   * `description`: extra words read after the name ("Last saved 2 minutes ago"), linked with `aria-describedby`.
   */
  kind?: 'label' | 'description';
  /** The side it prefers; it flips when there's no room there. `start` and `end` follow the writing direction. */
  side?: AnchorSide;
  /** A keyboard shortcut shown after the words, muted: "Ctrl+C". Put the same on the control's `aria-keyshortcuts`. */
  shortcut?: string;
}

// Once one hint has shown, moving to the next control shows its hint at once, without the wait.
let warmUntil = 0;

/** What `useHint` gives its owner: whether the hint shows, the handlers for the anchor, and the hint itself. */
export interface Hint {
  /** Spread on the element the pointer and focus land on (the Tooltip's wrapper, or a Button itself). */
  handlers: {
    onPointerEnter: (e: PointerEvent<HTMLElement>) => void;
    onPointerLeave: (e: PointerEvent<HTMLElement>) => void;
    onPointerDown: () => void;
    onFocus: (e: FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
  };
  /** The `role="tooltip"` element: render it inside the anchor, so the pointer can move onto it without leaving. */
  tip: ReactNode;
  /** The tip's id, for `aria-describedby` when the hint is a description. */
  tipId: string;
}

/**
 * The hint's behaviour, shared by Tooltip and by the sealed controls that carry their own hint (an icon-only or
 * unavailable Button). A control inside an explicit Tooltip leaves the hint to it, so there's only ever one.
 */
export function useHint(anchor: RefObject<HTMLElement | null>, content: string, { kind = 'label', side = 'top', shortcut, enabled = true }: { kind?: 'label' | 'description'; side?: AnchorSide; shortcut?: string; enabled?: boolean } = {}): Hint {
  const id = useId();
  const tip = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  useAnchored(open, anchor, tip, side, '--c-tooltip-offset');

  // A control's own hint stands aside when an explicit Tooltip wraps it.
  const owned = () => enabled && !!anchor.current && !anchor.current.parentElement?.closest('[data-dl="tooltip"]');
  const show = (wait: boolean) => {
    clearTimeout(timer.current);
    const delay = wait && Date.now() > warmUntil && anchor.current ? cssMs(anchor.current, '--c-tooltip-delay') : 0;
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = (soon = false) => {
    clearTimeout(timer.current);
    if (open) warmUntil = Date.now() + (anchor.current ? cssMs(anchor.current, '--c-tooltip-delay') : 0);
    // A short grace so the pointer can cross the gap onto the hint.
    timer.current = setTimeout(() => setOpen(false), soon && anchor.current ? cssMs(anchor.current, '--duration-quick') : 0);
  };

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  const tipId = `${id}-tip`;
  // The hint can sit inside its control (a Button's own hint): a press on the words never presses the control.
  const stay = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return {
    tipId,
    handlers: {
      onPointerEnter: (e) => e.pointerType === 'mouse' && owned() && show(true),
      onPointerLeave: (e) => e.pointerType === 'mouse' && hide(true),
      onPointerDown: () => hide(),
      onFocus: (e) => owned() && (e.target as Element).matches(':focus-visible') && show(false),
      onBlur: () => hide(),
    },
    tip: enabled ? (
      <span ref={tip} id={tipId} role="tooltip" data-dl="hint" data-presence="hint" data-material="floating" data-elevation="3" popover="manual" aria-hidden={kind === 'label' || undefined} hidden={!open} onPointerEnter={() => show(false)} onPointerLeave={() => hide(true)} onClick={stay}>
        {content}
        {shortcut && <kbd data-dl-part="shortcut">{shortcut}</kbd>}
      </span>
    ) : null,
  };
}
/**
 * A short hint beside a control, shown while it's hovered or has keyboard focus: the name of an icon-only control, a
 * truncated label in full, or a few words of description. Never holds anything to click, and never the only place
 * information lives on touch screens. Not for help with links (use a Popover) or for errors (use the field's message).
 * Icon-only Buttons and MenuButtons, and unavailable Buttons, carry this hint themselves (`useHint`): wrap one only for a
 * shortcut or a side, and the wrapper's hint replaces the built-in one.
 * @tier fundamental
 * @family floating
 * @a11y `role="tooltip"`. A `description` hint is linked from the control with `aria-describedby`; a `label` hint is
 * hidden from assistive technology because the control's name says the same. It shows after a short wait on hover
 * (`c.tooltip.delay`), at once on keyboard focus, and at once on the next control after one has shown. It stays while
 * the pointer moves onto it (WCAG 1.4.13 hoverable), stays until the pointer or focus leaves, and Escape hides it
 * without moving focus (dismissible). A press on the control hides it. It opens in the top layer, flips to the other
 * side when there's no room, and shifts to stay in the window. Reduced motion: it appears without a fade.
 * @key Escape: hides the hint; focus stays
 */
export function Tooltip({ content, children, kind = 'label', side = 'top', shortcut, ...data }: TooltipProps) {
  const root = useRef<HTMLSpanElement>(null);
  const { handlers, tip, tipId } = useHint(root, content, { kind, side, shortcut });

  // A description is linked from the control itself, whichever sealed component draws it.
  useEffect(() => {
    if (kind !== 'description') return;
    const control = root.current?.querySelector<HTMLElement>('button, a[href], input, select, textarea, [tabindex]');
    if (!control) return;
    const before = control.getAttribute('aria-describedby');
    control.setAttribute('aria-describedby', [before, tipId].filter(Boolean).join(' '));
    return () => {
      const now = (control.getAttribute('aria-describedby') ?? '').split(' ').filter((t) => t && t !== tipId).join(' ');
      if (now) control.setAttribute('aria-describedby', now);
      else control.removeAttribute('aria-describedby');
    };
  }, [kind, tipId]);

  return (
    <span {...data} ref={root} data-dl="tooltip" {...handlers}>
      {children}
      {tip}
    </span>
  );
}