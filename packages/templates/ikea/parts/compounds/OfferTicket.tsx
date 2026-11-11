import { Button, type DataAttributes } from '@design-library/core/components';
import { useState } from 'react';

export interface OfferTicketProps extends DataAttributes {
  /** The offer, bold: "15% off your first order". */
  title: string;
  /** How to get it, one line: "Join the family club and use the code at checkout." */
  text?: string;
  /** Where the offer leads; the title becomes a link. */
  href?: string;
  /** The close button's name: "Close offer". */
  closeLabel: string;
  /** `false`: sits where it's placed instead of pinned to the window (the library's preview). */
  pinned?: boolean;
}

/**
 * A small offer pinned to the window's bottom start, shaped as a ticket with round notches cut from its sides, on the
 * brand map's band surface. It stays until closed, then is gone until the page reloads. An IKEA template part (owner
 * Q140).
 * Not for a status or a result (use Notifications), or an offer that belongs in the page (use PictureBanner).
 * @tier compound
 * @family ikea
 * @a11y An `aside` named by its title; the close Button has its own name. Nothing announces it: it's an offer, not news.
 */
export function OfferTicket({ title, text, href, closeLabel, pinned = true, ...data }: OfferTicketProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <aside {...data} data-dl="ikea-offer-ticket" data-pinned={pinned ? undefined : 'false'} aria-label={title}>
      <span data-dl-part="words">
        {href ? (
          <a data-dl-part="title" href={href}>
            {title}
          </a>
        ) : (
          <strong data-dl-part="title">{title}</strong>
        )}
        {text ? <span data-dl-part="text">{text}</span> : null}
      </span>
      <Button label={closeLabel} icon="close" iconOnly emphasis="quiet" size="s" onClick={() => setOpen(false)} />
    </aside>
  );
}
