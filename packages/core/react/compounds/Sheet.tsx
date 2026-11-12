import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { Heading } from '../fundamentals/Heading';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { Skeleton } from '../fundamentals/Skeleton';
import { Stack } from '../fundamentals/Stack';
import type { DataAttributes } from '../types';

export interface SheetProps extends DataAttributes {
  /** Shown while true. The parent owns it: set it false in `onClose`. */
  open: boolean;
  /** Escape, the close button or (modal) a press on the scrim asked to close. */
  onClose: () => void;
  /** What the sheet holds, e.g. "Filters" or the item's name: its accessible name. */
  title: string;
  /** One short sentence under the title. Its accessible description. */
  description?: string;
  /** The body: details, a form, a list. Scrolls inside the sheet; the header and the actions stay put. */
  children?: ReactNode;
  /** The answers at the foot, as Buttons: the safest first, the main action last. */
  actions?: ReactNode;
  /** Up to two quiet icon-only Buttons beside Close, for things about the whole sheet (open in a new page, more). */
  headerActions?: ReactNode;
  /** The edge it comes from. `end` (default) and `start` follow the reading direction; `bottom` is for small windows. */
  side?: 'start' | 'end' | 'bottom';
  /** Width of a side sheet: `s` 20 rem, `m` 26 rem (default), `l` 40 rem. Every size fills a narrow window. Ignored for `bottom`. */
  size?: 's' | 'm' | 'l';
  /**
   * Modal (default): over a scrim, the page waits, focus stays inside. `false`: a standard sheet that sits over the
   * edge of the page while the page stays usable (a complementary region, not a dialog).
   */
  modal?: boolean;
  /** The body's content is on its way: lines of skeleton in its place; the title, close and actions stay usable. */
  loading?: boolean;
  /** Standard sheets (`modal={false}`): `outside` also closes it on a press outside the sheet and its opener, for a light panel that gets out of the way (a floating navigation). Default: Escape and Close only. A modal sheet already closes on a press on its scrim. */
  dismiss?: 'default' | 'outside';
  /** Draws the Close button (default). `false` only when another control closes it, such as its opener or a press outside (`dismiss="outside"`); Escape still closes it. */
  closeButton?: boolean;
}

const focusable = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';

/**
 * A panel from the start, end or bottom edge, for a side task or the details of one item while its list stays in
 * view: a title, the body and the answers. Not for a question that needs an answer first (use a Dialog), for a short
 * choice by its button (use a Popover) or for a pane the layout keeps on screen (use Pane).
 * @tier compound
 * @family overlays
 * @a11y Modal: the native `dialog` opened with `showModal()` (the page behind is inert, Tab cycles inside) and the
 * Dialog's focus rules: focus starts on the first control in the body (the title when there's none) and returns to
 * whatever opened it. Standard (`modal={false}`): a complementary region named by its title; focus moves to its title
 * on open and back to the opener on close, and the page stays usable. Both are named by the title, described by the
 * description; the close button is named "Close". The body is a scroll region with its padding inside, so its
 * scrollbar sits at the sheet's edge and focus rings are never clipped. While loading, the body is busy and the rest
 * stays usable. Slides in from its edge; with reduced motion it appears at once.
 * @key Escape: closes (focus inside the sheet)
 * @key Tab, Shift+Tab: move through the sheet's controls only (modal)
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  headerActions,
  side = 'end',
  size = 'm',
  modal = true,
  loading = false,
  dismiss = 'default',
  closeButton = true,
  ...data
}: SheetProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const regionRef = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!modal) return;
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      const first = d.querySelector<HTMLElement>('[data-dl-part="body"]')?.querySelector<HTMLElement>(focusable);
      (first ?? d.querySelector<HTMLElement>('[data-dl-part="heading"]'))?.focus();
    } else if (!open && d.open) {
      d.close();
      opener.current?.focus();
    }
  }, [open, modal]);

  useEffect(() => {
    if (modal) return;
    const r = regionRef.current;
    if (!r) return;
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      r.querySelector<HTMLElement>('[data-dl-part="heading"]')?.focus();
    } else if (opener.current) {
      if (r.contains(document.activeElement)) opener.current.focus();
      opener.current = null;
    }
  }, [open, modal]);

  // dismiss="outside" on a standard sheet: a press outside it and its opener closes it.
  useEffect(() => {
    if (modal || !open || dismiss !== 'outside') return;
    const press = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || regionRef.current?.contains(target) || opener.current?.contains(target)) return;
      close.current();
    };
    document.addEventListener('pointerdown', press);
    return () => document.removeEventListener('pointerdown', press);
  }, [open, modal, dismiss]);

  const surface = (
    <div data-dl-part="surface">
      <header data-dl-part="header">
        <div data-dl-part="heading" tabIndex={-1}>
          <Heading level={2} size={3} id={`${id}-title`}>
            {title}
          </Heading>
          {description && (
            <p id={`${id}-description`} data-dl-part="description">
              {description}
            </p>
          )}
        </div>
        {(headerActions || closeButton) && (
          <div data-dl-part="tools">
            {headerActions}
            {closeButton && <Button label="Close" icon="close" iconOnly emphasis="quiet" size="s" onClick={() => close.current()} />}
          </div>
        )}
      </header>
      {(children || loading) && (
        <ScrollArea data-dl-part="body" contain>
          <div data-dl-part="body-content" aria-busy={loading || undefined}>
            {loading ? (
              <Stack gap="group">
                <Skeleton lines={3} />
                <Skeleton shape="block" />
                <Skeleton lines={2} />
              </Stack>
            ) : (
              children
            )}
          </div>
        </ScrollArea>
      )}
      {actions && <footer data-dl-part="actions">{actions}</footer>}
    </div>
  );

  const shared = {
    ...data,
    'data-dl': 'sheet',
    'data-side': side,
    'data-size': side === 'bottom' ? undefined : size,
    'aria-labelledby': `${id}-title`,
    'aria-describedby': description ? `${id}-description` : undefined,
  };

  if (!modal) {
    return (
      <aside
        {...shared}
        ref={regionRef}
        data-modal="false" data-material="floating" data-elevation="3"
        hidden={!open}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            close.current();
          }
        }}
      >
        {surface}
      </aside>
    );
  }

  return (
    <dialog
      {...shared}
      ref={dialogRef}
      data-modal="true" data-material="modal" data-elevation="4"
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        // A press on the dialog element itself, not its content, is a press on the scrim.
        if (e.target === e.currentTarget) close.current();
      }}
    >
      {surface}
    </dialog>
  );
}
