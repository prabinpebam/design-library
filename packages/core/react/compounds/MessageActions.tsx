import { useEffect, useRef, useState } from 'react';
import { cssMs } from '../behaviour/anchor';
import { announce } from '../behaviour/announce';
import { Button } from '../fundamentals/Button';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

/** Which version of a reply (or of a person's edited message) is shown, after Try again or Edit. */
export interface MessageVersions {
  /** The one shown, counted from 1. */
  current: number;
  total: number;
  onChange: (next: number) => void;
}

export interface MessageActionsProps extends DataAttributes {
  /** The words copied by Copy: the message as plain text (or Markdown). Copy shows only when it's given. */
  copyText?: string;
  /** Asks to edit a person's message; the message becomes a field in place. */
  onEdit?: () => void;
  /** Rates a reply. After a rating the pair gives way to a thank-you, said once. */
  onFeedback?: (rating: 'good' | 'bad') => void;
  /** Reads the reply aloud. */
  onReadAloud?: () => void;
  /** Shares the conversation up to this message. */
  onShare?: () => void;
  /** Writes a new reply in its place; the old one stays as a version. */
  onRetry?: () => void;
  /** Starts a new conversation from this message. */
  onBranch?: () => void;
  /** Previous and next, with "2 / 3", when a message has more than one version. */
  versions?: MessageVersions;
}

/**
 * The actions under one chat message, as icon buttons with tooltips: Copy (confirms "Copied"), Edit, Good and Bad
 * response, Read aloud, Share, Try again, Branch in a new chat, and the versions a message has. Only the actions given
 * show, in that order, so a person's message gets Copy and Edit and a reply gets the rest.
 * Not for actions on the whole conversation (the header's menu).
 * @tier compound
 * @family chat
 * @a11y A `group` named "Message actions"; every button has a visible-on-hover-and-focus tooltip that is also its
 * name. Copy's confirmation and the feedback thank-you are announced politely. Versions say "Version 2 of 3" and their
 * buttons are unavailable at the ends, with the reason.
 * @key Tab: moves between the actions; Enter or Space: presses one
 */
export function MessageActions({ copyText, onEdit, onFeedback, onReadAloud, onShare, onRetry, onBranch, versions, ...data }: MessageActionsProps) {
  const [rated, setRated] = useState<'good' | 'bad' | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    if (copyText === undefined) return;
    try {
      await navigator.clipboard?.writeText(copyText);
    } catch {
      // The clipboard can refuse (no permission, an insecure page); the confirmation still says what was attempted.
    }
    setCopied(true);
    announce('Copied');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), cssMs(document.documentElement, '--duration-confirm-read'));
  };

  const rate = (rating: 'good' | 'bad') => {
    setRated(rating);
    onFeedback?.(rating);
    announce('Thanks for your feedback');
  };

  return (
    <div {...data} data-dl="message-actions" role="group" aria-label="Message actions">
      {versions && versions.total > 1 && (
        <span data-dl-part="versions">
          <Button
            label="Previous version"
            icon="chevron-start"
            iconOnly
            size="xs"
            emphasis="quiet"
            unavailable={versions.current <= 1 ? 'This is the first version' : undefined}
            onClick={() => versions.onChange(versions.current - 1)}
          />
          <Text as="span" variant="body-sm" tone="muted">
            <span aria-hidden="true">
              {versions.current} / {versions.total}
            </span>
            <span data-dl-part="spoken">
              Version {versions.current} of {versions.total}
            </span>
          </Text>
          <Button
            label="Next version"
            icon="chevron-end"
            iconOnly
            size="xs"
            emphasis="quiet"
            unavailable={versions.current >= versions.total ? 'This is the latest version' : undefined}
            onClick={() => versions.onChange(versions.current + 1)}
          />
        </span>
      )}
      {copyText !== undefined && <Button label={copied ? 'Copied' : 'Copy'} icon={copied ? 'check' : 'copy'} iconOnly size="s" emphasis="quiet" onClick={copy} />}
      {onEdit && <Button label="Edit message" icon="edit" iconOnly size="s" emphasis="quiet" onClick={onEdit} />}
      {onFeedback &&
        (rated ? (
          <Text as="span" variant="body-sm" tone="muted" data-dl-part="thanks">
            Thanks for your feedback
          </Text>
        ) : (
          <>
            <Button label="Good response" icon="thumb-up" iconOnly size="s" emphasis="quiet" onClick={() => rate('good')} />
            <Button label="Bad response" icon="thumb-down" iconOnly size="s" emphasis="quiet" onClick={() => rate('bad')} />
          </>
        ))}
      {onReadAloud && <Button label="Read aloud" icon="speaker" iconOnly size="s" emphasis="quiet" onClick={onReadAloud} />}
      {onShare && <Button label="Share" icon="external" iconOnly size="s" emphasis="quiet" onClick={onShare} />}
      {onRetry && <Button label="Try again" icon="retry" iconOnly size="s" emphasis="quiet" onClick={onRetry} />}
      {onBranch && <Button label="Branch in a new chat" icon="branch" iconOnly size="s" emphasis="quiet" onClick={onBranch} />}
    </div>
  );
}
