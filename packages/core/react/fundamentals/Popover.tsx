import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useAnchored, type AnchorSide } from '../behaviour/anchor';
import { Button, type ButtonProps } from './Button';
import { Heading } from './Heading';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export interface PopoverTrigger {
  /** The button's words, or the accessible name of an icon-only button: "Filters", "About this field". */
  label: string;
  icon?: IconName;
  iconOnly?: boolean;
  emphasis?: 'primary' | 'default' | 'quiet';
  size?: ButtonProps['size'];
}

export interface PopoverProps extends DataAttributes {
  /** The Button that opens and closes it; it shows as expanded while open. Leave out only with `anchorTo`. */
  trigger?: PopoverTrigger;
  /**
   * Opt-in (LR144): an element already on the page it sits beside instead of its own Button (a pin, a marker, a
   * selected word). No trigger is drawn; the owner opens and closes it with `open` and `onOpenChange`, and a press on
   * the element is the owner's, never "outside". Escape returns focus to the element when it can take focus.
   */
  anchorTo?: RefObject<HTMLElement | null>;
  /** Its accessible name without a title, when there's no trigger to name it (with `anchorTo`). */
  label?: string;
  /** A short heading inside: the popover's accessible name. Without one, it's named by the trigger's label. */
  title?: string;
  /** What it holds: a few words of help with a link, a short form, filters, a confirmation's question and Buttons. */
  children: ReactNode;
  /** The side it prefers; it flips when there's no room there. Default `bottom`. */
  side?: AnchorSide;
  /** Controlled: shown while true. Leave out to let the trigger open and close it. */
  open?: boolean;
  /** Asked to open or close: the trigger, Escape, a press outside, or focus leaving. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * An anchored surface beside its button that can hold controls: contextual help with a link (the toggletip), a short
 * form or a set of filters, a confirmation by its button. It opens on a press, never on hover, and doesn't block the
 * page. Not for a hint without controls (use Tooltip), for a choice from a list (use Select or MenuButton), or for
 * anything that must be answered before going on (use Dialog).
 * @tier fundamental
 * @family floating
 * @a11y The trigger is a Button with `aria-expanded` and `aria-controls`. The popover is a non-modal `role="dialog"`
 * named by its title (or the trigger's label) in the top layer, placed by the shared anchor rule (flips and shifts to
 * stay in the window). Opening moves focus to its first control, or to the surface itself when it has none, so its
 * words are read. Escape closes it and returns focus to the trigger; a press outside or Tab past its last control
 * closes it and leaves focus where it went. Opening fades in; with reduced motion it appears at once.
 * @key Enter or Space on the trigger: opens or closes it
 * @key Escape: closes it; focus returns to the trigger
 * @key Tab: moves through its controls; past the last one it closes and focus moves on
 */
export function Popover({ trigger, anchorTo, label, title, children, side = 'bottom', open: controlled, onOpenChange, ...data }: PopoverProps) {
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const surface = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(false);
  // Closed because focus or a press went elsewhere: leave focus there.
  const away = useRef(false);
  const open = controlled ?? own;
  const change = (next: boolean) => {
    if (controlled === undefined) setOwn(next);
    onOpenChange?.(next);
  };

  useLayoutEffect(() => {
    anchor.current = anchorTo ? anchorTo.current : root.current?.querySelector<HTMLElement>(':scope > button, :scope > [data-dl="button"] button, :scope > :first-child') ?? null;
  });
  useAnchored(open, anchor, surface, side, '--c-popover-offset', 'start');
  // Where focus goes back to: the trigger, or the anchor element's own control (a span around a pin's Button).
  const focusAnchor = (options?: FocusOptions) => {
    const at = anchor.current;
    const target = anchorTo && at && !at.matches('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ? at.querySelector<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? at : at;
    target?.focus(options);
  };
  const inAnchor = (node: Node | null) => !!anchorTo && !!node && !!anchor.current?.contains(node);

  useEffect(() => {
    const el = surface.current;
    if (!open || !el) return;
    const first = el.querySelector<HTMLElement>('input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])');
    (first ?? el).focus({ preventScroll: true });
    const outside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!root.current?.contains(target) && !inAnchor(target)) {
        away.current = true;
        change(false);
      }
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      // Closed by an action inside it: focus would be lost with the surface, so it goes back to the trigger.
      const at = document.activeElement;
      if (!away.current && (!at || at === document.body || el.contains(at))) focusAnchor({ preventScroll: true });
      away.current = false;
    };
  }, [open]);

  return (
    <span
      {...data}
      ref={root}
      data-dl="popover"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          change(false);
          focusAnchor();
        }
      }}
      onBlur={(e) => {
        // Focus left both the trigger and the popover (Tab past its end): close, and let focus go where it went. Focus
        // moving to the anchor element is the owner's press on it, which opens or closes it itself.
        if (open && e.relatedTarget && !root.current?.contains(e.relatedTarget as Node) && !inAnchor(e.relatedTarget as Node)) {
          away.current = true;
          change(false);
        }
      }}
    >
      {trigger && <Button label={trigger.label} icon={trigger.icon} iconOnly={trigger.iconOnly} emphasis={trigger.emphasis ?? 'default'} size={trigger.size} expanded={open} controls={`${id}-surface`} onClick={() => change(!open)} />}
      <div ref={surface} id={`${id}-surface`} role="dialog" aria-labelledby={title ? `${id}-title` : undefined} aria-label={title ? undefined : trigger?.label ?? label} data-dl-part="surface" data-presence="popup" data-material="floating" data-elevation="3" popover="manual" tabIndex={-1} hidden={!open}>
        {title && (
          <Heading level={3} size={4} id={`${id}-title`}>
            {title}
          </Heading>
        )}
        {children}
      </div>
    </span>
  );
}
