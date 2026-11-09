import { Badge } from '../fundamentals/Badge';
import type { DataAttributes } from '../types';

export interface AgendaSession {
  id: string;
  title: string;
  /** Opens the session's own page. */
  href?: string;
  /** What kind of session, in a word or two: "Keynote", "Workshop", "Panel". Shown as a label. */
  kind?: string;
  /** Who runs it, in order. */
  people?: string[];
  /** Where it happens: "Hall A", "Room 2", "Online". */
  place?: string;
  /** One sentence about it. */
  description?: string;
  /** A shared moment rather than a session (a break, lunch, registration): set quieter, with no surface. */
  pause?: boolean;
}

export interface AgendaSlot {
  id: string;
  /** When it starts, as the reader reads it: "09:30". */
  start: string;
  /** When it ends, as the reader reads it. */
  end?: string;
  /** The start as a machine-readable time ("2027-03-12T09:30"), for `<time datetime>`. */
  dateTime?: string;
  /** The sessions that run at this time; more than one run side by side. */
  sessions: AgendaSession[];
}

export interface AgendaProps extends DataAttributes {
  /** Names the agenda for assistive technology: "Thursday 12 March". */
  label: string;
  /** The time slots, in order. */
  slots: AgendaSlot[];
  /** The level of each session's title, under the heading that introduces the agenda. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/**
 * A programme in time order: each slot's time, then the sessions that run then, side by side when they're parallel,
 * each with its kind, title, people and place. For a conference or a course day, an itinerary or a broadcast
 * schedule. Days or tracks go in Tabs around it. Not for picking a date (Calendar) or for rows of records to sort
 * (DataTable).
 * @tier compound
 * @family data
 * @a11y An ordered list of slots, each with its times in `<time>` elements and a list of sessions; each session title is
 * a heading at `headingLevel`, so a screen reader can move session by session, and a link when it has a page. Parallel
 * sessions read in order; the kind is a text label, never colour alone. Breaks are ordinary text with no heading.
 */
export function Agenda({ label, slots, headingLevel = 3, ...data }: AgendaProps) {
  const H = `h${headingLevel}` as 'h3';
  return (
    <ol {...data} data-dl="agenda" aria-label={label}>
      {slots.map((slot) => (
        <li key={slot.id} data-dl-part="slot">
          <p data-dl-part="time">
            <time dateTime={slot.dateTime}>{slot.start}</time>
            {slot.end && (
              <>
                {'–'}
                <time>{slot.end}</time>
              </>
            )}
          </p>
          <ul data-dl-part="sessions">
            {slot.sessions.map((s) => (
              <li key={s.id} data-dl-part="session" data-pause={s.pause ? '' : undefined}>
                {s.pause ? (
                  <p data-dl-part="title">{s.title}</p>
                ) : (
                  <H data-dl-part="title">{s.href ? <a href={s.href}>{s.title}</a> : s.title}</H>
                )}
                {s.description && <p data-dl-part="description">{s.description}</p>}
                {s.people && s.people.length > 0 && <p data-dl-part="people">{s.people.join(', ')}</p>}
                {(s.kind || s.place) && (
                  <p data-dl-part="meta">
                    {s.kind && <Badge tone="neutral">{s.kind}</Badge>}
                    {s.place && <span data-dl-part="place">{s.place}</span>}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
