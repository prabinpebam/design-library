import { useEffect, useRef, useState, type DragEvent } from 'react';
import { announce } from '../behaviour/announce';
import { Button } from '../fundamentals/Button';
import { Field } from '../fundamentals/Field';
import { Icon } from '../fundamentals/Icon';
import { Progress } from '../fundamentals/Progress';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface UploadItem {
  id: string;
  name: string;
  /** In bytes. */
  size: number;
  /** `uploading` with its own `progress`, then `done`, or `failed` with the reason in `error`. */
  status: 'uploading' | 'done' | 'failed';
  /** The share sent, 0–100, from the bytes sent; leave it out until it is known. */
  progress?: number;
  /** Why it failed and what to do: "The file is larger than 10 MB. Choose a smaller one." */
  error?: string;
}

export interface FileUploadProps extends DataAttributes {
  /** What to upload, sentence case: "Receipts", "Profile picture". */
  label: string;
  /** The types and limits, in words: "PDF or JPG, up to 10 MB each". */
  hint?: string;
  /** A problem with the whole question ("Upload at least one receipt"); a file's own problem goes on the file. */
  error?: string;
  necessity?: 'optional' | 'required';
  /** File types the chooser offers, as for `input type="file"`: ".pdf,.jpg" or "image/*". Check them again on the server. */
  accept?: string;
  /** Several files at once. Defaults to one. */
  multiple?: boolean;
  /** An area that also takes dragged files. Defaults to true; the button is always there. */
  dropzone?: boolean;
  /** The files chosen so far, with their state. */
  files: UploadItem[];
  /** Called with the files chosen or dropped (only the first when not `multiple`); start their uploads and add them to `files`. */
  onAdd: (files: File[]) => void;
  /** Removes a file (and cancels its upload). */
  onRemove: (id: string) => void;
  /** Tries a failed file again. */
  onRetry?: (id: string) => void;
}

const size = (bytes: number) => {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
  let n = bytes;
  let i = 0;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i += 1;
  }
  return new Intl.NumberFormat(undefined, { style: 'unit', unit: units[i], unitDisplay: 'short', maximumFractionDigits: i ? 1 : 0 }).format(n);
};

/**
 * Choosing files to send: a "Choose files" button, a drop area that also takes dragged files, and the list of files
 * with each one's own progress, then done, or failed with Retry, and Remove.
 * Not for picking a picture to crop (an image editor) or attaching files to a message (the composer's own button).
 * @tier compound
 * @family pickers
 * @a11y A `fieldset` named by the label, with the hint and the question's error as its description. The button opens
 * the system chooser; dropping is an extra, never the only way. Each file is a list item with its name, size and
 * state in words; its progress bar is named "Uploading {name}". Additions, completions and failures are said once
 * through the polite announcer (failures assertively). Removing a file moves focus to the next file's Remove, else the
 * previous one's, else Choose files.
 */
export function FileUpload({ label, hint, error, necessity, accept, multiple = false, dropzone = true, files, onAdd, onRemove, onRetry, ...data }: FileUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const depth = useRef(0);
  const [over, setOver] = useState(false);
  const removed = useRef<number | null>(null);
  const seen = useRef(new Map<string, UploadItem['status']>());
  const chooseLabel = multiple ? 'Choose files' : 'Choose file';

  const add = (list: FileList | null) => {
    if (!list?.length) return;
    const chosen = multiple ? [...list] : [list[0]];
    onAdd(chosen);
  };

  // Each file's arrival, completion and failure is said once; files there when it first shows aren't.
  const first = useRef(true);
  useEffect(() => {
    const before = seen.current;
    seen.current = new Map(files.map((f) => [f.id, f.status]));
    if (first.current) {
      first.current = false;
      return;
    }
    const added = files.filter((f) => !before.has(f.id));
    if (added.length > 1) announce(`${added.length} files added`, 'polite');
    else if (added.length === 1) announce(`${added[0].name} added`, 'polite');
    for (const f of files) {
      const was = before.get(f.id);
      if (was && was !== f.status) {
        if (f.status === 'done') announce(`${f.name} uploaded`, 'polite');
        if (f.status === 'failed') announce(`Couldn’t upload ${f.name}`, 'assertive');
      }
    }
  }, [files]);

  // After a removal, focus goes to the file now in its place, else the one before, else Choose files.
  useEffect(() => {
    const at = removed.current;
    if (at === null || !root.current) return;
    removed.current = null;
    const buttons = root.current.querySelectorAll<HTMLElement>('[data-dl-part="remove"]');
    const next = buttons[Math.min(at, buttons.length - 1)] ?? root.current.querySelector<HTMLElement>('[data-dl-part="choose"]');
    next?.focus();
  }, [files.length]);

  const drag = {
    onDragEnter: (e: DragEvent) => {
      if (!e.dataTransfer.types.includes('Files')) return;
      e.preventDefault();
      depth.current += 1;
      setOver(true);
    },
    onDragOver: (e: DragEvent) => {
      if (!e.dataTransfer.types.includes('Files')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave: () => {
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setOver(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      depth.current = 0;
      setOver(false);
      add(e.dataTransfer.files);
    },
  };

  return (
    <Field {...data} group label={label} hint={hint} error={error} necessity={necessity}>
      {() => (
        <div ref={root} data-dl="file-upload">
          <input
            ref={input}
            type="file"
            hidden
            accept={accept}
            multiple={multiple}
            onChange={(e) => {
              add(e.currentTarget.files);
              e.currentTarget.value = '';
            }}
          />
          {dropzone ? (
            <div data-dl-part="zone" data-over={over ? '' : undefined} {...drag}>
              <Icon name="upload" />
              <Text as="span">{multiple ? 'Drop files here, or' : 'Drop a file here, or'}</Text>
              <Button label={chooseLabel} onClick={() => input.current?.click()} data-dl-part="choose" />
            </div>
          ) : (
            <span data-dl-part="button">
              <Button label={chooseLabel} onClick={() => input.current?.click()} data-dl-part="choose" />
            </span>
          )}
          {files.length > 0 && (
            <ul data-dl-part="list" aria-label={multiple ? 'Chosen files' : 'Chosen file'}>
              {files.map((f, i) => (
                <li key={f.id} data-dl-part="item" data-status={f.status}>
                  <span data-dl-part="type">
                    <Icon name="file" />
                  </span>
                  <span data-dl-part="main">
                    <Text as="span">{f.name}</Text>
                    {f.status === 'uploading' && <Progress form="bar" value={f.progress} label={`Uploading ${f.name}`} />}
                    <span data-dl-part="state">
                      {f.status === 'done' && <Icon name="success" size="sm" />}
                      {f.status === 'failed' && <Icon name="error" size="sm" />}
                      <Text as="span" variant="body-sm" tone={f.status === 'failed' ? 'danger' : f.status === 'done' ? 'success' : 'muted'}>
                        {f.status === 'failed'
                          ? (f.error ?? 'Couldn’t upload. Try again.')
                          : f.status === 'done'
                            ? `${size(f.size)} · Uploaded`
                            : `${size(f.size)} · ${typeof f.progress === 'number' ? `${Math.round(f.progress)}% sent` : 'Waiting to send…'}`}
                      </Text>
                    </span>
                  </span>
                  <span data-dl-part="actions">
                    {f.status === 'failed' && onRetry && <Button label="Retry" size="s" onClick={() => onRetry(f.id)} />}
                    <Button
                      label={`Remove ${f.name}`}
                      icon="close"
                      iconOnly
                      emphasis="quiet"
                      size="s"
                      data-dl-part="remove"
                      onClick={() => {
                        removed.current = i;
                        onRemove(f.id);
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Field>
  );
}
