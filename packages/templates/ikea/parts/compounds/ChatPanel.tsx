import { Button, type DataAttributes } from '@design-library/core/components';
import { useId, useState } from 'react';

export interface ChatPanelProps extends DataAttributes {
  /** The panel's heading: "Chat with us". */
  title: string;
  /** What the chat is for, one or two sentences. */
  text: string;
  /** The panel's action: "Start chat". */
  start: string;
  onStart?: () => void;
  /** The round launcher's name: "Chat with us". */
  openLabel: string;
  /** The head's buttons: "Minimise", "Close chat". */
  minimiseLabel: string;
  closeLabel: string;
  /** `false`: sits where it's placed instead of pinned to the window (the library's preview). */
  pinned?: boolean;
  /** Open at first (a review screen); otherwise only the launcher shows. */
  defaultOpen?: boolean;
}

/**
 * A help chat pinned to the window's bottom end: a round launcher opens a small panel with a head of the brand map's
 * feature surface, a line about the chat and a strong pill to start it. Minimise returns to the launcher; close removes
 * both until the page reloads. An IKEA template part (owner Q140).
 * Not for a message the person must read (use Notifications), or a form (use Dialog or Sheet).
 * @tier compound
 * @family ikea
 * @a11y The panel is a `section` named by its heading; the launcher is a Button with its label and tooltip, and says
 * whether the panel is open.
 */
export function ChatPanel({ title, text, start, onStart, openLabel, minimiseLabel, closeLabel, defaultOpen = false, pinned = true, ...data }: ChatPanelProps) {
  const [state, setState] = useState<'launcher' | 'open' | 'closed'>(defaultOpen ? 'open' : 'launcher');
  const id = useId();
  if (state === 'closed') return null;
  return (
    <div {...data} data-dl="ikea-chat-panel" data-pinned={pinned ? undefined : 'false'} data-state={state}>
      {state === 'open' ? (
        <section data-dl-part="panel" id={id} aria-labelledby={`${id}-title`}>
          <div data-dl-part="head">
            <h2 data-dl-part="title" id={`${id}-title`}>
              {title}
            </h2>
            <Button label={minimiseLabel} icon="minus" iconOnly emphasis="quiet" size="s" onClick={() => setState('launcher')} />
            <Button label={closeLabel} icon="close" iconOnly emphasis="quiet" size="s" onClick={() => setState('closed')} />
          </div>
          <div data-dl-part="body">
            <p data-dl-part="text">{text}</p>
            <Button label={start} emphasis="strong" onClick={onStart} />
          </div>
        </section>
      ) : (
        <span data-dl-part="launcher">
          <Button label={openLabel} icon="comment" iconOnly emphasis="primary" size="l" expanded={false} controls={id} onClick={() => setState('open')} />
        </span>
      )}
    </div>
  );
}
