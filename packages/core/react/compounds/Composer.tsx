import { useRef, useState } from 'react';
import { Button } from '../fundamentals/Button';
import { Chip } from '../fundamentals/Chip';
import { Icon } from '../fundamentals/Icon';
import { Image } from '../fundamentals/Image';
import { MenuButton } from '../fundamentals/MenuButton';
import { Progress } from '../fundamentals/Progress';
import { Text } from '../fundamentals/Text';
import { TextArea } from '../fundamentals/TextArea';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

/** Something added to the message before it's sent: a picture (a thumbnail) or a file (a tile with its name and type). */
export interface ComposerAttachment {
  /** Stable, for Remove and Retry. */
  id: string;
  kind: 'image' | 'file';
  /** The file's name, as the person saved it: "floor-plan.pdf". */
  name: string;
  /** Images: the picture's address (an object URL while it uploads). */
  src?: string;
  /** Files: the type in words, "PDF", "Spreadsheet". */
  type?: string;
  /** `uploading` (Send waits for it), `failed` (with Retry) or `ready` (default). */
  state?: 'uploading' | 'failed' | 'ready';
}

/** A tool the next message can use (Create image, Deep research, Web search). */
export interface ComposerTool {
  value: string;
  /** A verb or a noun phrase, sentence case: "Create image". */
  label: string;
  /** One short line in the menu: what the tool does. */
  description?: string;
  /** Shown on the chosen tool's chip. */
  icon?: IconName;
}

export interface ComposerProps extends DataAttributes {
  /** Names the box for assistive technology; not shown (the page makes plain what the box is for). Default "Message". */
  label?: string;
  /** The text being written. */
  value: string;
  onChange: (next: string) => void;
  /** Sends the text, the attachments and the chosen tool. Called by Enter and Send, only when there's something to send and nothing is still uploading. Clear `value` and `attachments` yourself once it's taken. */
  onSend: () => void;
  /** An example of what to ask, never instructions. Default "Ask anything". */
  placeholder?: string;
  /** A reply is arriving: the box's ring turns the AI gradient (Q56), the words say what's happening, and Send becomes Stop. The text stays editable for the next message. */
  replying?: boolean;
  /** Present tense while replying: "Writing a reply" (default), "Creating an image". */
  replyingLabel?: string;
  /** Stops the reply; shown in Send's place while `replying`. */
  onStop?: () => void;
  /** Pictures and files added so far, in the order they were added. */
  attachments?: ComposerAttachment[];
  /** Files chosen through "Add photos and files", dropped on the composer or pasted into the text. Without it, the menu doesn't offer files. */
  onAttach?: (files: File[]) => void;
  /** What files the picker offers, as the `accept` attribute: "image/*,.pdf". Default any. */
  accept?: string;
  onRemoveAttachment?: (id: string) => void;
  onRetryAttachment?: (id: string) => void;
  /** Tools offered in the add menu, after files. */
  tools?: ComposerTool[];
  /** The chosen tool's value, shown as a chip in the box. */
  tool?: string;
  /** A tool chosen, or `undefined` when its chip is removed. */
  onToolChange?: (tool: string | undefined) => void;
  /** Dictation: shows the microphone. */
  onDictate?: () => void;
  /** One quiet line under the box, centred: "Answers can be wrong. Check important facts." */
  disclaimer?: string;
}

/**
 * Where a person writes to an assistant: one box holding what they've added (pictures and files), the text, and a
 * toolbar with an add menu (files and tools), the chosen tool, dictation and Send, which turns into Stop while a reply
 * arrives. The box grows with the text from one line, then scrolls.
 * Not for a comment or a form's long answer (TextArea), or for chat between people.
 * @tier compound
 * @family chat
 * @a11y A TextArea named by `label` (hidden), with the attachments as a labelled list above the text and the toolbar
 * after it in Tab order. Icon-only buttons are named ("Add files and tools", "Dictate", "Send message", "Stop
 * replying"); Send is focusable but unavailable, with its reason, while there's nothing to send or an upload is running.
 * Replying is announced once by the TextArea and shown in words under the box, never only by the gradient.
 * @key Enter: sends the message
 * @key Shift+Enter: adds a new line
 */
export function Composer({
  label = 'Message',
  value,
  onChange,
  onSend,
  placeholder = 'Ask anything',
  replying = false,
  replyingLabel = 'Writing a reply',
  onStop,
  attachments = [],
  onAttach,
  accept,
  onRemoveAttachment,
  onRetryAttachment,
  tools = [],
  tool,
  onToolChange,
  onDictate,
  disclaimer,
  ...data
}: ComposerProps) {
  const picker = useRef<HTMLInputElement>(null);
  const [dropping, setDropping] = useState(false);
  const carriesFiles = (types: readonly string[]) => types.includes('Files');
  const uploading = attachments.some((a) => a.state === 'uploading');
  const empty = !value.trim() && attachments.length === 0;
  const blocked = empty ? 'Write a message first' : uploading ? 'Wait for the upload' : undefined;
  const send = () => {
    if (!replying && !blocked) onSend();
  };
  const chosen = tools.find((t) => t.value === tool);
  const items = [...(onAttach ? [{ value: '#files', label: 'Add photos and files' }] : []), ...tools.map(({ value: v, label: l, description }) => ({ value: v, label: l, description }))];

  const tray = attachments.length ? (
    <ul data-dl-part="attachments" aria-label="Attachments">
      {attachments.map((a) => {
        const words = a.state === 'uploading' ? 'Uploading…' : a.state === 'failed' ? 'Couldn’t upload' : a.type;
        return a.kind === 'image' && a.src ? (
          <li key={a.id} data-dl-part="thumb" data-state={a.state ?? 'ready'}>
            <Image src={a.src} alt={a.name} ratio="square" fit="cover" rounded />
            {a.state === 'uploading' && (
              <span data-dl-part="thumb-state">
                <span data-dl-part="mark">
                  <Progress label={`Uploading ${a.name}`} />
                </span>
              </span>
            )}
            {a.state === 'failed' && onRetryAttachment && (
              <span data-dl-part="thumb-state">
                <span data-dl-part="mark">
                  <Button label={`Retry ${a.name}`} icon="retry" iconOnly size="xs" emphasis="quiet" onClick={() => onRetryAttachment(a.id)} />
                </span>
              </span>
            )}
            {onRemoveAttachment && (
              <span data-dl-part="remove">
                <Button label={`Remove ${a.name}`} icon="close" iconOnly size="xs" emphasis="quiet" onClick={() => onRemoveAttachment(a.id)} />
              </span>
            )}
          </li>
        ) : (
          <li key={a.id} data-dl-part="file" data-state={a.state ?? 'ready'}>
            <span data-dl-part="file-icon">{a.state === 'uploading' ? <Progress /> : <Icon name={a.state === 'failed' ? 'error' : 'file'} />}</span>
            <span data-dl-part="file-words">
              <Text as="span" variant="body-sm">
                {a.name}
              </Text>
              {words && (
                <Text as="span" variant="body-sm" tone={a.state === 'failed' ? 'danger' : 'muted'}>
                  {words}
                </Text>
              )}
            </span>
            {a.state === 'failed' && onRetryAttachment && <Button label={`Retry ${a.name}`} icon="retry" iconOnly size="xs" emphasis="quiet" onClick={() => onRetryAttachment(a.id)} />}
            {onRemoveAttachment && <Button label={`Remove ${a.name}`} icon="close" iconOnly size="xs" emphasis="quiet" onClick={() => onRemoveAttachment(a.id)} />}
          </li>
        );
      })}
    </ul>
  ) : undefined;

  const toolbar = (
    <>
      <span data-dl-part="start">
        {items.length > 0 && (
          <MenuButton
            label="Add files and tools"
            icon="plus"
            iconOnly
            size="s"
            emphasis="quiet"
            items={items}
            onSelect={(v) => (v === '#files' ? picker.current?.click() : onToolChange?.(v))}
          />
        )}
        {chosen && <Chip label={chosen.label} icon={chosen.icon} appearance="filled" onRemove={onToolChange ? () => onToolChange(undefined) : undefined} />}
      </span>
      <span data-dl-part="end">
        {onDictate && <Button label="Dictate" icon="mic" iconOnly size="s" emphasis="quiet" onClick={onDictate} />}
        {replying ? (
          <Button label="Stop replying" icon="stop" iconOnly size="s" emphasis="primary" onClick={onStop} />
        ) : (
          <Button label="Send message" icon="arrow-up" iconOnly size="s" emphasis="primary" unavailable={blocked} onClick={send} />
        )}
      </span>
    </>
  );

  return (
    <div
      {...data}
      data-dl="composer"
      data-dropping={dropping ? '' : undefined}
      onDragOver={
        onAttach
          ? (event) => {
              if (!carriesFiles(event.dataTransfer.types)) return;
              event.preventDefault();
              setDropping(true);
            }
          : undefined
      }
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropping(false);
      }}
      onDrop={
        onAttach
          ? (event) => {
              setDropping(false);
              const files = Array.from(event.dataTransfer.files);
              if (!files.length) return;
              event.preventDefault();
              onAttach(files);
            }
          : undefined
      }
      onPaste={
        onAttach
          ? (event) => {
              const files = Array.from(event.clipboardData.files);
              if (!files.length) return;
              event.preventDefault();
              onAttach(files);
            }
          : undefined
      }
    >
      <TextArea
        label={label}
        hideLabel
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        grow
        rows={1}
        processing={replying ? replyingLabel : undefined}
        onEnter={send}
        tray={tray}
        toolbar={toolbar}
      />
      {onAttach && (
        <input
          ref={picker}
          type="file"
          multiple
          hidden
          accept={accept}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            if (files.length) onAttach(files);
          }}
        />
      )}
      {disclaimer && (
        <div data-dl-part="disclaimer">
          <Text as="p" variant="body-sm" tone="muted">
            {disclaimer}
          </Text>
        </div>
      )}
    </div>
  );
}
