import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useCommit } from '../behaviour/commit';
import { Button, type ButtonSize } from './Button';
import { ColourPicker } from './ColourPicker';
import { Field, type FieldControlProps } from './Field';
import { Icon } from './Icon';
import type { FlagCode } from './Flag';
import { MenuButton } from './MenuButton';
import { Progress } from './Progress';
import { Text } from './Text';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export interface TextFieldProps extends DataAttributes {
  /** A noun phrase naming what goes in, with no colon: "Project name". */
  label: string;
  /** The stored value. */
  value: string;
  /** Stores the new value when the person leaves the field or presses Enter. Return a promise for a save; reject it when the save fails. */
  onCommit: (next: string) => unknown;
  /** One short sentence: the format, why it's asked, or what happens. */
  hint?: string;
  /** An example value, never the label or an instruction. */
  placeholder?: string;
  /** The kind of text, for the keyboard and autofill. `password` hides the text and adds a Show button; `code` is a one-time code drawn as one cell per character (`length`). */
  type?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'password' | 'code';
  /** The Button size scale: the box is xs 24, s 36, normal 44 (default), m 48, l 56, xl 64 or xxl 80 px high. The label and hint keep their size. */
  size?: ButtonSize;
  /** A leading icon that says what kind of value it is (search, email). Decorative: the label names the field. */
  icon?: IconName;
  /** Short fixed text before the value, inside the box, such as "https://" or "£". Read with the label. */
  prefix?: string;
  /** Short fixed text after the value, inside the box, such as "kg" or ".com". Read with the label. */
  suffix?: string;
  /** Adds a Clear button while there's text; clearing saves the empty value like any other change. */
  clearable?: boolean;
  /** The most characters allowed; a count shows under the box and is announced as the limit nears. */
  maxLength?: number;
  /** Marks the label "(optional)". Fields are required by default, so only optional ones are marked. */
  optional?: boolean;
  /** Shows the value without letting it change, e.g. an ID; still focusable and copyable. */
  readOnly?: boolean;
  /** The value can't change here and needn't be read. Prefer `readOnly`, or say why in the hint. */
  disabled?: boolean;
  /** What is wrong with the value and how to fix it, shown under the box until the value is fixed. Marks the field invalid. */
  error?: string;
  /** What happened and what was kept, when a save fails. Defaults to naming the field. */
  failedText?: string;
  /** The on-screen keyboard to offer: `numeric` for digits, `decimal`, `email`, `url`, `tel`, `search`. Defaults from `type`. */
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'url' | 'tel' | 'search';
  /** A choice attached before the box that sets part of the value, such as a country's dialling code. The button shows the chosen item's `short` text. */
  prefixMenu?: TextFieldPrefixMenu;
  /** A button attached after the box that acts on the value, such as Search or Send. Enter presses it too. */
  action?: TextFieldAction;
  /** One key that moves focus here from anywhere on the page, shown in the box while it's empty and not focused, e.g. "/". */
  shortcut?: string;
  /** A removable chip at the start of the box that narrows what the value applies to, e.g. a search scope "In: Tokens". Backspace at the start removes it too. */
  chip?: { label: string; onRemove: () => void };
  /** With `type="code"`: how many characters the code has (4 to 8). The field saves as soon as the code is complete. */
  length?: number;
  /** With `type="code"`: characters per group, drawn with a wider gap between groups ("123 456" is `group={3}`). The value never contains a separator. */
  group?: number;
  /** With `type="code"`: draws each typed character as a dot, for a PIN someone nearby shouldn't read. Off for one-time codes, which expire. */
  masked?: boolean;
  /** A colour swatch at the start of the box that opens the ColourPicker in a popover (as ColourField does), for a hex value. */
  swatch?: { value: string; onChange: (hex: string) => void };
  /** Hides the visible label where the row already says what it is (an inspector). It still names the field. */
  hideLabel?: boolean;
}

export interface TextFieldPrefixMenu {
  /** Names the choice for assistive technology, e.g. "Country code". */
  label: string;
  /** The chosen item's `value`. */
  value: string;
  /** Each choice: `label` in the open list ("India +91"), `short` on the button ("+91"), and `flag`, the country's flag drawn before both (an SVG, the same on every system; without it the code alone shows). */
  items: { value: string; label: string; short: string; flag?: FlagCode }[];
  onChange: (value: string) => void;
}

export interface TextFieldAction {
  /** A verb: "Search", "Send". The accessible name when `iconOnly`. */
  label: string;
  icon?: IconName;
  /** Shows only the icon; `label` names it and shows as its tooltip. */
  iconOnly?: boolean;
  /** `primary` when it's the view's main action; `default` (outlined) otherwise. */
  emphasis?: 'primary' | 'default';
  /** Receives the text in the box. */
  onAction: (value: string) => void;
}

const iconSize: Record<ButtonSize, 'sm' | 'md' | 'lg' | 'xl'> = { xs: 'sm', s: 'sm', normal: 'md', m: 'md', l: 'lg', xl: 'lg', xxl: 'xl' };
const actionSize: Record<ButtonSize, ButtonSize> = { xs: 'xs', s: 'xs', normal: 'xs', m: 'xs', l: 's', xl: 's', xxl: 'normal' };

/**
 * One line of text saved on its own when the person leaves the field (blur-commit), at seven sizes, with an optional
 * leading icon, fixed prefix or suffix text, a Clear button, a character count and a hidden-text (password) form.
 * Not for values that must be valid or saved together with others (put those in a form with a Save button), or for
 * long text that autosaves while typing.
 * @tier fundamental
 * @family inputs
 * @a11y A native `input` named by its visible `label` (with "(optional)" when marked), the prefix and suffix joined to
 * the name; the hint, count, error and any failure are linked with `aria-describedby`. Pending takes the commit colour and
 * a spinner in the trailing slot; the same focused input stays, read-only with `aria-disabled` and `aria-busy`, so
 * focus never moves. Confirmed shows a tick and announces "Saved" politely. A failure keeps the person's text, marks
 * the field invalid and offers Retry and Revert. A validation `error` marks it invalid with the message below. Read-only
 * stays focusable. Clear and Show are named buttons after the input in the tab order. Targets: 44 px and up from
 * `normal`; `xs` and `s` are dense exceptions.
 * @key Enter: saves the value now
 * @key Escape: puts back the stored value
 */
export function TextField({ label, value, onCommit, hint, placeholder, type = 'text', size = 'normal', icon, prefix, suffix, clearable = false, maxLength, optional = false, readOnly = false, disabled = false, error, failedText, inputMode, prefixMenu, action, shortcut, chip, length = 6, group, masked = false, swatch, hideLabel = false, ...data }: TextFieldProps) {
  const { phase, run, reset } = useCommit('--duration-confirm-read');
  const [draft, setDraft] = useState(value);
  const [stored, setStored] = useState(value);
  const [shown, setShown] = useState(false);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const pending = phase === 'on';
  const failed = phase === 'failed';
  const invalid = failed || !!error;
  const code = type === 'code';

  useEffect(() => {
    setStored(value);
    if (document.activeElement !== input.current) setDraft(value);
  }, [value]);

  // The shortcut key focuses the field from anywhere, unless the person is typing somewhere else.
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== shortcut || event.ctrlKey || event.metaKey || event.altKey) return;
      const at = document.activeElement as HTMLElement | null;
      if (at && (at.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(at.tagName))) return;
      event.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  const commitValue = (next: string) => {
    if (pending || next === stored) return;
    void run(() => onCommit(next), () => setStored(next));
  };
  const commit = () => commitValue(draft);

  const revert = () => {
    input.current?.focus();
    setDraft(stored);
    reset();
  };

  const retry = () => {
    input.current?.focus(); // Retry is removed while pending; focus returns to the field first
    commit();
  };

  const clear = () => {
    setDraft('');
    input.current?.focus();
    commitValue('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
      action?.onAction(draft);
    } else if (event.key === 'Escape' && draft !== stored) {
      event.preventDefault();
      revert();
    } else if (event.key === 'Backspace' && chip && event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0) {
      chip.onRemove();
    }
  };

  const describe = (control: FieldControlProps) => [code && `${id}-length`, prefix && `${id}-prefix`, suffix && `${id}-suffix`, chip && `${id}-chip`, control['aria-describedby'], failed && `${id}-failure`].filter(Boolean).join(' ') || undefined;
  const editable = !readOnly && !disabled;
  const chosen = prefixMenu?.items.find((item) => item.value === prefixMenu.value);
  const keyboard = inputMode ?? (code ? 'numeric' : undefined);

  const field = (control: FieldControlProps) => (
    <input
      ref={input}
      id={control.id}
      type={type === 'password' && shown ? 'text' : code ? (masked ? 'password' : 'text') : type}
      value={draft}
      placeholder={code ? undefined : placeholder}
      disabled={disabled}
      readOnly={readOnly || pending}
      maxLength={code ? undefined : maxLength}
      inputMode={keyboard}
      autoComplete={code ? (masked ? 'off' : 'one-time-code') : undefined}
      aria-keyshortcuts={shortcut}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describe(control)}
      onChange={(event) => {
        const next = code ? event.target.value.replace(keyboard === 'numeric' ? /\D/g : /[\s-]/g, '').slice(0, length) : event.target.value;
        setDraft(next);
        // A complete code saves at once: there's nothing more to type.
        if (code && next.length === length) commitValue(next);
      }}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        setFocused(false);
        // Moving to this field's own buttons isn't leaving it: those act on the value themselves.
        if (event.currentTarget.closest('[data-dl="text-field"]')?.contains(event.relatedTarget as Node | null)) return;
        if (editable && (!code || draft.length === length || draft === '')) commit();
      }}
      onKeyDown={onKeyDown}
    />
  );

  const trailing = (
    <span data-dl-part="trailing" aria-hidden="true">
      {/* A validation error's mark is on the message line (Field); the box marks only a failed save, whose line has none. */}
      {pending ? <Progress /> : phase === 'done' ? <Icon name="success" /> : failed ? <Icon name="error" /> : null}
    </span>
  );

  const box = (control: FieldControlProps) => code ? (
    <span data-dl-part="code">
      {/* One real input; the cells only draw it. Groups are spans, so the space between them is their parent's gap. */}
      {Array.from({ length: Math.ceil(length / (group || length)) }, (_, g) => (
        <span key={g} data-dl-part="group" aria-hidden="true">
          {Array.from({ length: Math.min(group || length, length - g * (group || length)) }, (_, j) => {
            const i = g * (group || length) + j;
            return (
              <span key={i} data-dl-part="cell" data-dl-ring="" data-active={focused && i === Math.min(draft.length, length - 1) ? '' : undefined}>
                {draft[i] === undefined ? '' : masked ? '•' : draft[i]}
              </span>
            );
          })}
        </span>
      ))}
      {field(control)}
      <span id={`${id}-length`} data-dl-part="announce">
        {length} {keyboard === 'numeric' ? 'digits' : 'characters'}
      </span>
      {trailing}
    </span>
  ) : (
    <span data-dl-part="box" data-dl-ring="">
      {swatch && <ColourPicker data-dl-part="swatch" label={label} value={swatch.value} onChange={(hex) => swatch.onChange(hex)} trigger={{ disabled: !editable }} />}
      {icon && (
        <span data-dl-part="leading" aria-hidden="true">
          <Icon name={icon} size={iconSize[size]} />
        </span>
      )}
      {chip && (
        <span data-dl-part="chip" id={`${id}-chip`}>
          <span>{chip.label}</span>
          {editable && <Button size="xs" emphasis="quiet" icon="close" iconOnly label={`Remove ${chip.label}`} onClick={() => { chip.onRemove(); input.current?.focus(); }} />}
        </span>
      )}
      {prefix && (
        <span data-dl-part="affix" id={`${id}-prefix`}>
          {prefix}
        </span>
      )}
      {field(control)}
      {suffix && (
        <span data-dl-part="affix" id={`${id}-suffix`}>
          {suffix}
        </span>
      )}
      {shortcut && !focused && draft === '' && (
        <kbd data-dl-part="shortcut" aria-hidden="true">
          {shortcut}
        </kbd>
      )}
      {editable && clearable && draft !== '' && !pending && <Button size={actionSize[size]} emphasis="quiet" icon="close" iconOnly label={`Clear ${label}`} onClick={clear} />}
      {editable && type === 'password' && <Button size={actionSize[size]} emphasis="quiet" label={shown ? 'Hide' : 'Show'} onClick={() => setShown(!shown)} />}
      {trailing}
    </span>
  );

  // A failed save: what happened, what was kept, and the way out. Announced as it appears.
  const failure = (
    <span data-dl-part="failure" id={`${id}-failure`} role="status">
      {phase === 'done' && <span data-dl-part="announce">Saved</span>}
      {failed && (
        <>
          <Text as="span" variant="body-sm" tone="danger">
            {failedText ?? `Couldn’t save “${label}”. Your text is still here.`}
          </Text>
          <span data-dl-part="actions">
            <Button label="Retry" onClick={retry} />
            <Button label="Revert" emphasis="quiet" onClick={revert} />
          </span>
        </>
      )}
    </span>
  );

  return (
    <span {...data} data-dl="text-field" data-size={size} data-type={code ? 'code' : undefined} data-busy={phase === 'rest' ? undefined : phase} data-invalid={invalid ? '' : undefined} data-readonly={readOnly ? '' : undefined}>
      <Field
        label={label}
        hint={hint}
        error={failed ? undefined : error}
        necessity={optional ? 'optional' : undefined}
        count={maxLength !== undefined ? { value: draft, max: maxLength, limit: 'hard' } : undefined}
        hideLabel={hideLabel}
        after={failure}
      >
        {(control) =>
          prefixMenu || action ? (
            <span data-dl-part="row">
              {prefixMenu && (
                <MenuButton
                  size={size}
                  label={chosen?.short ?? prefixMenu.label}
                  menuLabel={prefixMenu.label}
                  flag={chosen?.flag}
                  items={prefixMenu.items.map(({ value: v, label: l, flag: f }) => ({ value: v, label: l, flag: f }))}
                  onSelect={prefixMenu.onChange}
                  disabled={!editable}
                />
              )}
              {box(control)}
              {action && <Button size={size} emphasis={action.emphasis ?? 'default'} icon={action.icon} iconOnly={action.iconOnly} label={action.label} disabled={disabled} onClick={() => action.onAction(draft)} />}
            </span>
          ) : (
            box(control)
          )
        }
      </Field>
    </span>
  );
}
