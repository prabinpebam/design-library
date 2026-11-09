import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { Heading } from '../fundamentals/Heading';
import { Morph } from '../fundamentals/Morph';
import type { DataAttributes } from '../types';

export interface DialogProps extends DataAttributes {
  /** Shown while true. The parent owns it: set it false in `onClose`. */
  open: boolean;
  /** Escape, the close button or a press outside asked to close (never called for an alert dialog's Escape or outside press). */
  onClose: () => void;
  /** What the dialog is about, as a question or a short name: its accessible name. */
  title: string;
  /** One or two sentences under the title: what's being asked. Its accessible description. */
  description?: string;
  /** The body: a short form, a list, longer reading. Scrolls inside the dialog when it doesn't fit. */
  children?: ReactNode;
  /** The answers, as Buttons: the safest first, the main action last (it sits at the end). */
  actions?: ReactNode;
  /** Width: `s` 24 rem (a question), `m` 32 rem (default; a short form), `l` 48 rem (a table or longer reading). Every size fills a narrow window. */
  size?: 's' | 'm' | 'l';
  /**
   * An alert dialog: for answers that can't be undone. It must be answered with one of the actions: no close button,
   * Escape and a press outside do nothing, and focus starts on the first (safest) action.
   */
  alert?: boolean;
  /**
   * Names what the dialog is showing, e.g. `form`, `done`, `failed` (Q65 C1). A new value morphs the title, body and
   * answers in the same box: the old ones fade out, the new ones fade in and the box eases to its new height; focus
   * moves to the new title. Change it only when the new state is ready (keep the form's pending button until then).
   */
  state?: string;
}

/**
 * Blocks the page until a question is answered or a short task is done: a title, a description, a body and the
 * answers. Not for something people can ignore (use a notification), for a short confirmation by its button (use a
 * popover) or for a side task while the page stays usable (use a side sheet). Most deletes need no dialog: do them
 * with an undo in an auto-dismissing notification (owner rule).
 * @tier compound
 * @family overlays
 * @a11y The native `dialog` opened with `showModal()`: the page behind is inert, so focus stays inside and Tab cycles
 * through the dialog. Named by its title, described by its description; `role="alertdialog"` when `alert`. Focus
 * starts on the first field or control in the body (the title when there's none), on the first action in an alert
 * dialog, and returns to whatever opened it on close. The close button is named "Close". The body is a scroll region
 * with its padding inside, so its scrollbar sits at the dialog's edge and focus rings are never clipped; the title and
 * the actions stay in place. Opening fades and grows a little and closing fades faster (Q65 C17); with reduced motion it
 * only fades. With state, a form becomes its result in the same box (C1, Morph).
 * @key Escape: closes (not an alert dialog)
 * @key Tab, Shift+Tab: move through the dialog's controls only
 */
export function Dialog({ open, onClose, title, description, children, actions, size = 'm', alert = false, state, ...data }: DialogProps) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      const body = d.querySelector<HTMLElement>('[data-dl-part="body"]');
      const actionsArea = d.querySelector<HTMLElement>('[data-dl-part="actions"]');
      const focusable = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';
      const first = alert ? actionsArea?.querySelector<HTMLElement>(focusable) : body?.querySelector<HTMLElement>(focusable);
      (first ?? d.querySelector<HTMLElement>('[data-dl-part="heading"]'))?.focus();
    } else if (!open && d.open) {
      d.close();
      opener.current?.focus();
    }
  }, [open, alert]);

  const surface = (
    <div data-dl-part="surface">
      <header data-dl-part="header">
        <div data-dl-part="heading" tabIndex={-1} data-morph-focus="">
          <Heading level={2} size={3} id={`${id}-title`}>
            {title}
          </Heading>
          {description && (
            <p id={`${id}-description`} data-dl-part="description">
              {description}
            </p>
          )}
        </div>
        {!alert && <Button label="Close" icon="close" iconOnly emphasis="quiet" size="s" onClick={() => close.current()} />}
      </header>
      {children && <div data-dl-part="body">{children}</div>}
      {actions && <footer data-dl-part="actions">{actions}</footer>}
    </div>
  );

  return (
    <dialog
      {...data}
      ref={ref}
      data-dl="dialog" data-material="modal" data-elevation="4"
      data-size={size}
      role={alert ? 'alertdialog' : undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (!alert) close.current();
      }}
      onClick={(e) => {
        // A press on the dialog element itself, not its content, is a press on the backdrop.
        if (!alert && e.target === e.currentTarget) close.current();
      }}
    >
      {state === undefined ? surface : <Morph state={state}>{surface}</Morph>}
    </dialog>
  );
}
