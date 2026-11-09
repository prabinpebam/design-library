import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { durationToken } from '../behaviour/commit';
import { Icon } from '../fundamentals/Icon';
import { TextField } from '../fundamentals/TextField';
import type { DataAttributes } from '../types';

export interface InlineEditProps extends DataAttributes {
  /** What the text is, for its accessible name and the field's: "Project title". */
  label: string;
  /** The saved text. */
  value: string;
  /** Saves a changed value. Return a promise for a slow save; throw (or reject) to fail and keep the field open with Retry. */
  onCommit: (next: string) => unknown;
  /** Shown, muted, when the text is empty: what to add ("Add a description"). */
  placeholder?: string;
  /** `normal` (default) for a value in a row or a list, `l` for a subtitle, `xxl` for a page or item title. Text and field share the size, so nothing jumps. */
  size?: 'normal' | 'l' | 'xxl';
  /** Shown as text only: no edit button. */
  readOnly?: boolean;
  /** Up to this many characters, counted in the field while editing. */
  maxLength?: number;
}

/**
 * Text shown as text until it's pressed; then a field in the same place and size. Enter or leaving the field saves,
 * Escape cancels; a failed save keeps the field open with what was typed and Retry. For titles, names and single
 * values that change now and then, where a form would be heavier than the edit. Not for values that must be checked
 * together (use a form) or for long text (use TextArea).
 * @tier compound
 * @family inputs
 * @a11y The text is a button named "Edit project title: Q4 plan"; pressing it (or Enter or Space) swaps in a TextField
 * with the same label, focused with its text selected. Saving or cancelling puts the focus back on the button. The
 * pencil shows only on hover and focus, in space that's always kept, so nothing moves. A save is confirmed by a tick
 * beside the new text for the confirm beat.
 * @key Enter or Space on the text: edit
 * @key Enter in the field: save; Escape: cancel and keep the old text
 */
export function InlineEdit({ label, value, onCommit, placeholder, size = 'normal', readOnly = false, maxLength, ...data }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const read = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);

  useEffect(() => {
    if (editing) {
      const input = root.current?.querySelector('input');
      input?.focus();
      input?.select();
    } else if (refocus.current) {
      refocus.current = false;
      read.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), durationToken('--duration-confirm-min'));
    return () => clearTimeout(timer);
  }, [saved]);

  const close = (returnFocus: boolean) => {
    refocus.current = returnFocus && !!root.current?.contains(document.activeElement);
    setEditing(false);
  };

  const commit = async (next: string) => {
    await onCommit(next);
    setSaved(true);
    close(true);
  };

  const unchanged = () => root.current?.querySelector('input')?.value === value;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else if (event.key === 'Enter' && unchanged()) {
      event.preventDefault();
      close(true);
    }
  };

  const onBlur = (event: FocusEvent) => {
    // Leaving with the text unchanged just closes; a changed text is saved by the field, which closes on success.
    if (!root.current?.contains(event.relatedTarget as Node | null) && unchanged()) close(false);
  };

  const shown = value || placeholder || '';

  return (
    <span {...data} ref={root} data-dl="inline-edit" data-size={size} data-mode={editing ? 'edit' : 'read'}>
      {editing ? (
        <span data-dl-part="edit" onKeyDown={onKeyDown} onBlur={onBlur}>
          <TextField label={label} hideLabel value={value} onCommit={commit} placeholder={placeholder} size={size} maxLength={maxLength} />
        </span>
      ) : readOnly ? (
        <span data-dl-part="read" data-empty={value ? undefined : ''}>
          <span data-dl-part="text">{shown}</span>
        </span>
      ) : (
        <button ref={read} type="button" data-dl-part="read" data-dl-ring="" data-empty={value ? undefined : ''} aria-label={`Edit ${label.charAt(0).toLowerCase()}${label.slice(1)}: ${shown}`} onClick={() => setEditing(true)}>
          <span data-dl-part="text">{shown}</span>
          <span data-dl-part="mark" data-saved={saved ? '' : undefined} aria-hidden="true">
            <Icon name={saved ? 'success' : 'edit'} size="sm" />
          </span>
        </button>
      )}
    </span>
  );
}
