import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { addTags, splitTags } from '../behaviour/tags';
import { Button } from '../fundamentals/Button';
import { Chip } from '../fundamentals/Chip';
import { Field } from '../fundamentals/Field';
import type { DataAttributes } from '../types';

export interface TagInputProps extends DataAttributes {
  /** What the tags are, a short noun phrase: "Labels", "Recipients". */
  label: string;
  /** The tags, in the order added. */
  value: string[];
  /** Every change: a tag added, removed or cleared. */
  onChange: (next: string[]) => void;
  /** How to add: "Press Enter or type a comma after each label." Said once, under the box. */
  hint?: string;
  /** An example, never an instruction. Hidden once a tag is added. */
  placeholder?: string;
  /** What ends a tag as it's typed, besides Enter. Default a comma. Pasted lists also split on line breaks and tabs. */
  separators?: string[];
  /** The most tags; past it the box says so and refuses more. */
  max?: number;
  /** Keep a tag that is already there (compared without case). Default false: a repeat is refused and said. */
  allowDuplicates?: boolean;
  /** Checks a tag: return what is wrong with it to keep it but mark it invalid (an unknown address), or nothing. */
  validate?: (tag: string) => string | undefined;
  /** A Clear all button at the end of the box while there are tags. */
  clearable?: boolean;
  /** The box height on the field scale: `s` 36, `normal` 44, `l` 56 px; chips follow (s 24, normal 32, l 40). */
  size?: 's' | 'normal' | 'l';
  /** Marks "(optional)" or "(required)"; fields are required by default. */
  necessity?: 'optional' | 'required';
  /** What is wrong with the set as a whole and how to fix it. */
  error?: string;
  /** Shows the tags without remove buttons; still focusable. */
  readOnly?: boolean;
  /** Nothing can change and it needn't be read. Prefer `readOnly`, or say why in the hint. */
  disabled?: boolean;
}

const chipSize = { s: 's', normal: 'normal', l: 'l' } as const;

/**
 * Turns typed text into removable tags: Enter or a comma ends a tag, a pasted list splits into tags, repeats and a
 * maximum are refused and said, and a check can mark a tag invalid while keeping it.
 * Not for choosing from a known list (use a Combobox when it lands) or for one value (TextField).
 * @tier compound
 * @family inputs
 * @a11y A Field: the label names the one text input, which stays the only Tab stop; hint and messages are linked. The
 * tags are a list before it, each a Chip with a Remove button named "Remove" plus the tag. Adding, removing and refusing
 * are announced politely. An invalid tag says why in the message line, not in colour alone.
 * @key Enter / comma: add the typed text; Backspace or Left in an empty box: move to the last tag; Left / Right: move
 * between tags and back to the box; Delete / Backspace on a tag: remove it and keep focus nearby
 */
export function TagInput({ label, value, onChange, hint, placeholder, separators = [','], max, allowDuplicates = false, validate, clearable = false, size = 'normal', necessity, error, readOnly = false, disabled = false, ...data }: TagInputProps) {
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<string>();
  const [announce, setAnnounce] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const full = max !== undefined && value.length >= max;
  const problems = validate ? value.map((t) => validate(t)).filter((p): p is string => !!p) : [];
  const editable = !readOnly && !disabled;

  const commit = (candidates: string[]) => {
    if (!candidates.length) return;
    const r = addTags(value, candidates, { max, allowDuplicates });
    if (r.added.length) onChange(r.tags);
    const said = [
      r.added.length && `Added ${r.added.join(', ')}.`,
      r.duplicates.length && `${r.duplicates.map((d) => `“${d}”`).join(', ')} ${r.duplicates.length === 1 ? 'is' : 'are'} already added.`,
      r.overLimit.length && `You can add up to ${max}; ${r.overLimit.length} not added.`,
    ].filter(Boolean);
    setNotice(r.duplicates.length || r.overLimit.length ? said.slice(r.added.length ? 1 : 0).join(' ') : undefined);
    setAnnounce(`${said.join(' ')} ${r.tags.length} ${r.tags.length === 1 ? 'tag' : 'tags'}.`);
    setText(r.duplicates.length && !r.added.length && candidates.length === 1 ? candidates[0] : '');
  };

  const remove = (i: number) => {
    const gone = value[i];
    onChange(value.filter((_, j) => j !== i));
    setNotice(undefined);
    setAnnounce(`Removed ${gone}. ${value.length - 1} ${value.length - 1 === 1 ? 'tag' : 'tags'}.`);
    const left = value.length - 1;
    requestAnimationFrame(() => (left > 0 ? chips.current[Math.min(i, left - 1)] : input.current)?.focus());
  };

  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const caretAtStart = event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0;
    if (event.key === 'Enter' || separators.includes(event.key)) {
      if (!text.trim()) {
        if (event.key !== 'Enter') event.preventDefault();
        return;
      }
      event.preventDefault();
      commit(splitTags(text, separators));
    } else if ((event.key === 'Backspace' || event.key === 'ArrowLeft') && caretAtStart && value.length && !readOnly) {
      event.preventDefault();
      chips.current[value.length - 1]?.focus();
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text');
    const parts = splitTags(text + pasted, separators);
    if (parts.length > 1) {
      event.preventDefault();
      commit(parts);
    }
  };

  const onChipKey = (i: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' && i > 0) {
      event.preventDefault();
      chips.current[i - 1]?.focus();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      (i < value.length - 1 ? chips.current[i + 1] : input.current)?.focus();
    }
  };

  return (
    <Field label={label} hint={hint} error={error ?? problems[0]} warning={notice} necessity={necessity} disabled={disabled} readOnly={readOnly} {...data}>
      {(control) => (
        <div
          data-dl="tag-input"
          data-dl-ring=""
          data-size={size === 'normal' ? undefined : size}
          data-invalid={control['aria-invalid'] ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          data-readonly={readOnly ? '' : undefined}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
              input.current?.focus();
            }
          }}
        >
          {value.length > 0 && (
            <ul data-dl-part="tags" aria-label={label}>
              {value.map((tag, i) => (
                <li key={`${tag}-${i}`}>
                  <Chip
                    label={tag}
                    size={chipSize[size]}
                    appearance="filled"
                    invalid={!!validate?.(tag)}
                    disabled={disabled}
                    onRemove={editable ? () => remove(i) : undefined}
                    tabIndex={-1}
                    focusRef={(el) => {
                      chips.current[i] = el;
                    }}
                    onKeyDown={onChipKey(i)}
                  />
                </li>
              ))}
            </ul>
          )}
          <input
            {...control}
            ref={input}
            value={text}
            placeholder={value.length ? undefined : placeholder}
            aria-invalid={control['aria-invalid'] ?? (problems.length ? true : undefined)}
            enterKeyHint="enter"
            autoComplete="off"
            onChange={(e) => {
              setText(e.target.value);
              setNotice(undefined);
            }}
            onKeyDown={onInputKey}
            onPaste={onPaste}
            onBlur={() => text.trim() && editable && commit(splitTags(text, separators))}
            data-full={full ? '' : undefined}
          />
          {clearable && editable && value.length > 0 && (
            <Button
              iconOnly
              icon="close"
              emphasis="quiet"
              size="xs"
              label="Clear all"
              onClick={() => {
                onChange([]);
                setNotice(undefined);
                setAnnounce('Cleared all tags.');
                input.current?.focus();
              }}
            />
          )}
          <span data-dl-part="announce" role="status">
            {announce}
          </span>
        </div>
      )}
    </Field>
  );
}
