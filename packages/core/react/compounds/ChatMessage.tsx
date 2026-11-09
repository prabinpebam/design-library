import { useId, type ReactNode } from 'react';
import { Icon } from '../fundamentals/Icon';
import { Image } from '../fundamentals/Image';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

/** One thing sent with a message: a picture (shown as a thumbnail) or a file (a tile with its name and type). */
export interface ChatAttachment {
  kind: 'image' | 'file';
  /** The file's name, as the person saved it: "review-notes.pdf". */
  name: string;
  /** Images: the picture's address. */
  src?: string;
  /** Images: what the picture shows, for people who can't see it. Defaults to the name. */
  alt?: string;
  /** Files: the type in words, "PDF", "Spreadsheet", shown under the name. */
  type?: string;
}

export interface ChatMessageProps extends DataAttributes {
  /** Who wrote it: the `person` using the app (a bubble at the end of the line) or the `assistant` (full width, no bubble). */
  from: 'person' | 'assistant';
  /** The author's name, said before the message ("You said", "Assistant said") and never shown: the layout says who is who. */
  author: string;
  /**
   * The message itself, placed in order with one gap between blocks: Text and Heading for words, List, Code and
   * CodeBlock, Image, Card, Carousel, Chip for a citation. A plain string becomes one paragraph.
   */
  children: ReactNode;
  /** Pictures and files sent with it, shown above a person's bubble or under an assistant's words. */
  attachments?: ChatAttachment[];
  /** The message's actions (MessageActions): under the message; on a person's message they show on hover and focus only. */
  actions?: ReactNode;
  /** The hidden heading's level in the page's outline: one below the conversation's own heading. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** An assistant's thinking and tool activity (ChatThinking), shown above the reply. */
  thinking?: ReactNode;
  /** The reply is still arriving: a soft caret follows the last words and the message is marked busy, so screen readers read it once it's complete. */
  streaming?: boolean;
}

/**
 * One message in a conversation with an assistant: a person's message as a bubble at the end of the line, an
 * assistant's reply as full-width rich content, with pictures and files sent with it and its actions. The content is
 * composed by the caller (or mapped from data by a view), so a reply can hold any component.
 * Not for messages between people (a comment thread) or for the whole conversation (ChatLayout places messages).
 * @tier compound
 * @family chat
 * @a11y An `article` named by a visually hidden "{author} said" heading, so screen-reader users can move message by
 * message with heading or landmark keys. Attachments are a list: a picture keeps its alt text, a file says its name
 * and type. A person's actions show on hover and whenever focus is inside the message, so the keyboard reaches them.
 */
export function ChatMessage({ from, author, children, attachments, actions, headingLevel = 3, thinking, streaming = false, ...data }: ChatMessageProps) {
  const id = useId();
  const Said = `h${headingLevel}` as const;
  const files = attachments?.length ? (
    <ul data-dl-part="attachments" aria-label="Attachments">
      {attachments.map((a, i) =>
        a.kind === 'image' && a.src ? (
          <li key={i} data-dl-part="thumb">
            <Image src={a.src} alt={a.alt ?? a.name} ratio="square" fit="cover" rounded />
          </li>
        ) : (
          <li key={i} data-dl-part="file">
            <span data-dl-part="file-icon">
              <Icon name="file" />
            </span>
            <span data-dl-part="file-words">
              <Text as="span" variant="body-sm">
                {a.name}
              </Text>
              {a.type && (
                <Text as="span" variant="body-sm" tone="muted">
                  {a.type}
                </Text>
              )}
            </span>
          </li>
        ),
      )}
    </ul>
  ) : null;

  return (
    <article {...data} data-dl="chat-message" data-from={from} data-streaming={streaming ? '' : undefined} aria-busy={streaming || undefined} aria-labelledby={id}>
      <Said id={id} data-dl-part="author">
        {author} said
      </Said>
      {from === 'assistant' && thinking}
      {from === 'person' && files}
      <div data-dl-part="content">{typeof children === 'string' ? <Text as="p">{children}</Text> : children}</div>
      {from === 'assistant' && files}
      {actions && <div data-dl-part="actions">{actions}</div>}
    </article>
  );
}
