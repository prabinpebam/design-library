import { useEffect, useRef, type ReactNode } from 'react';
import { announce } from '../behaviour/announce';
import { Field } from './Field';
import { Progress } from './Progress';
import type { ButtonSize } from './Button';
import type { DataAttributes } from '../types';

export interface TextAreaProps extends DataAttributes {
  /** A noun phrase naming what goes in, with no colon: "Comment". */
  label: string;
  /** The current text. */
  value: string;
  /** Every change, as the person types. The text is sent by a separate action, such as an Add button. */
  onChange: (next: string) => void;
  /** One short sentence: what the text is for or what happens to it. */
  hint?: string;
  /** An example, never the label or an instruction. */
  placeholder?: string;
  /** Visible lines before it scrolls (or, with `grow`, the lines it starts at). */
  rows?: number;
  /** Grows with the text, from `rows` lines to about twelve, then scrolls; the person never has to drag it taller. */
  grow?: boolean;
  /** The text size on the Button scale: `xs` and `s` dense (body-sm), `normal` (default) and `m` the label size, `l` and up larger, for a composer that is the page's main input. Height comes from `rows`. */
  size?: ButtonSize;
  /** The most characters it takes; a count shows under the box and is announced as the limit nears. */
  maxLength?: number;
  /** Marks the label "(optional)". Fields are required by default, so only optional ones are marked. */
  optional?: boolean;
  /** Shows the text without letting it change; still focusable, selectable and scrollable. */
  readOnly?: boolean;
  /** The text can't change here and needn't be read. Prefer `readOnly`, or say why in the hint. */
  disabled?: boolean;
  /** What is wrong with the text and how to fix it, shown under the box until it's fixed. Marks the field invalid. */
  error?: string;
  /** For a compound that suggests while typing (Mentions): makes the text area an APG combobox for its popup list. */
  combobox?: { listId: string; expanded: boolean; activeId?: string };
  /** An AI prompt box while a model works on what was sent: words for what it's doing, e.g. "Writing a reply". The box's ring turns the AI gradient (held still under reduced motion), the words show under the box with a turning arc in place of the hint, and they're announced once when the work starts. The text stays editable. */
  processing?: string;
  /** Hides the label where the surroundings already say what the box is for (a chat composer); it still names the box. */
  hideLabel?: boolean;
  /** Enter sends instead of adding a line: called on Enter without Shift (and never mid-composition, for IME input); Shift+Enter adds a line. For a composer whose text is sent as a message. */
  onEnter?: () => void;
  /** Inside the box, above the text: what goes with it (a composer's attachments). The box stays the one enclosure. */
  tray?: ReactNode;
  /** Inside the box, under the text: a row of quiet actions (a composer's tools and Send). Gives the box the composer's larger corners; pressing the row's empty space puts the caret in the text. */
  toolbar?: ReactNode;
}

/**
 * Several lines of text, sent by a separate action (a comment, a summary, a note), at a fixed number of lines or
 * growing with the text, with a character count, read-only and invalid states.
 * Not for one line that saves on its own (use TextField), or for text that must autosave while typing.
 * @tier fundamental
 * @family inputs
 * @a11y A native `textarea` named by its visible `label` (with "(optional)" when marked); the hint, count and error are
 * linked with `aria-describedby`, and an error sets `aria-invalid`. The count is announced politely only as the limit
 * nears. The box shows the focus ring, so it's never clipped. Read-only stays focusable. While processing, the words
 * under the box say what's happening and are announced politely once; the gradient ring is never the only cue.
 * @key Tab: leaves the field; Enter adds a new line
 * @key Enter: with `onEnter`, sends; Shift+Enter adds a new line
 */
export function TextArea({ label, value, onChange, hint, placeholder, rows = 4, grow = false, size = 'normal', maxLength, optional = false, readOnly = false, disabled = false, error, combobox, processing, hideLabel = false, onEnter, tray, toolbar, ...data }: TextAreaProps) {
  const said = useRef<string | undefined>(undefined);
  const text = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (processing && processing !== said.current) announce(processing);
    said.current = processing;
  }, [processing]);
  return (
    <span {...data} data-dl="text-area" data-size={size} data-grow={grow ? '' : undefined} data-invalid={error ? '' : undefined} data-readonly={readOnly ? '' : undefined} data-processing={processing ? '' : undefined} data-composer={toolbar ? '' : undefined}>
      <Field
        label={label}
        hideLabel={hideLabel}
        hint={processing ? undefined : hint}
        error={error}
        after={processing ? <span data-dl-part="status"><Progress />{processing}</span> : undefined} necessity={optional ? 'optional' : undefined} count={maxLength !== undefined ? { value, max: maxLength, limit: 'hard' } : undefined}>
        {(control) => (
          <span data-dl-part="box" data-dl-ring="" data-ring={processing ? 'ai' : undefined}>
          {tray && <span data-dl-part="tray">{tray}</span>}
          <textarea
            ref={text}
            id={control.id}
            value={value}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            aria-invalid={control['aria-invalid']}
            aria-describedby={control['aria-describedby']}
            role={combobox ? 'combobox' : undefined}
            aria-autocomplete={combobox ? 'list' : undefined}
            aria-haspopup={combobox ? 'listbox' : undefined}
            aria-expanded={combobox ? combobox.expanded : undefined}
            aria-controls={combobox?.expanded ? combobox.listId : undefined}
            aria-activedescendant={combobox?.expanded ? combobox.activeId : undefined}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={
              onEnter
                ? (event) => {
                    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    onEnter();
                  }
                : undefined
            }
          />
          {toolbar && (
            <span
              data-dl-part="bar"
              onMouseDown={(event) => {
                if (event.target !== event.currentTarget) return;
                event.preventDefault();
                text.current?.focus();
              }}
            >
              {toolbar}
            </span>
          )}
          </span>
        )}
      </Field>
    </span>
  );
}
