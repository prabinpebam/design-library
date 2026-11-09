import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { useCommit } from '../behaviour/commit';
import { listboxKey, typeAhead } from '../behaviour/listbox';
import { usePopup } from '../behaviour/popup';
import { useOverlayScroll } from '../behaviour/scroll';
import { Button, type ButtonSize } from './Button';
import { Field } from './Field';
import { Icon } from './Icon';
import { ListItem } from './ListItem';
import { Progress } from './Progress';
import { Text } from './Text';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export interface SelectOption {
  value: string;
  /** What the person reads in the list. */
  label: string;
  /** One short line under the label, when options need telling apart, or why an unavailable one can't be chosen. */
  description?: string;
  /** Leading icon from the active set. */
  icon?: IconName;
  /** Shown but can't be chosen now; the keyboard skips it. Say why in `description`. */
  disabled?: boolean;
  /** A heading the option sits under. Options of one group must be next to each other. */
  group?: string;
}

interface SelectOne {
  /** One choice (default). */
  multiple?: false;
  /** The chosen option's value; `''` when nothing is chosen yet, which shows the placeholder. */
  value: string;
  /** The newly chosen value; the choice applies at once. Return a promise for a save: the box shows saving, then a
   * tick; reject it and the stored choice comes back with Retry. */
  onChange: (next: string) => unknown;
}

interface SelectSeveral {
  /** Any number of choices: each option gets a box, the list stays open while choosing, and the choices apply once,
   * when the list closes. For a handful of options always worth seeing, use checkboxes instead. */
  multiple: true;
  /** The chosen options' values; `[]` shows the placeholder. */
  value: string[];
  /** The chosen values, in the options' order, once the list closes with a different choice. Return a promise for a
   * save, as with one choice. */
  onChange: (next: string[]) => unknown;
}

export type SelectProps = SelectBase & (SelectOne | SelectSeveral);

interface SelectBase extends DataAttributes {
  /** A noun phrase naming the choice, with no colon: "Current revision". */
  label: string;
  /** `commit` (default): the choice applies and saves at once, with saving, saved and failed states. `form` (IP14): one field of a form saved together with one Save button: `onChange` just reports the choice; no state or "Saved" shows on the field. */
  mode?: 'commit' | 'form';
  /** Announced once a choice is saved: "Saved" (IP14). */
  savedText?: string;
  options: SelectOption[];
  /** The Button size scale: the box is xs 24, s 36, normal 44 (default), m 48, l 56, xl 64 or xxl 80 px high. The label,
   * hint and list keep their size. */
  size?: ButtonSize;
  /** Hides the visible label where the row's heading or the icon already says what it is (a design tool's inspector). It still names the field. */
  hideLabel?: boolean;
  /** A leading icon that says what kind of choice it is. Decorative: the label names the field. */
  icon?: IconName;
  /** Shown while nothing is chosen: an instruction in the label's words, "Choose a country". */
  placeholder?: string;
  /** One short sentence about the choice. */
  hint?: string;
  /** What's wrong with the choice and how to fix it. Marks the field invalid. */
  error?: string;
  /** Marks the label "(optional)". Choices are required by default, so only optional ones are marked. */
  optional?: boolean;
  /** Shows the choice without letting it change; still focusable and read. */
  readOnly?: boolean;
  /** The choice can't change here. Prefer `readOnly`, or say why in the hint. */
  disabled?: boolean;
  /** The options are still arriving: a spinner in the box and "Loading options…" in the list. */
  loading?: boolean;
  /** Why the list is empty and what to do, shown in the list when there are no options. */
  emptyText?: string;
  /** What happened and what was kept, when a save fails. Defaults to naming the field and the kept choice. */
  failedText?: string;
  /** Submits the value with a form under this name (a hidden input). */
  name?: string;
  /** Type to narrow the list (the combobox): the box becomes a text input, and the list shows the options whose label
   * contains what's typed. For lists long enough that scrolling is slow, about 15 options and up. Only listed options
   * can be chosen. */
  search?: boolean;
  /** `horizontal` puts the label beside the box, a third of the row (dense settings and property panels), as Field's. */
  orientation?: 'vertical' | 'horizontal';
  /** What the list says when nothing matches what's typed. Defaults to "Nothing matches “…”". */
  noMatchText?: (query: string) => string;
  /** Called with what's typed, for options that come from a server: fetch, set `loading` while waiting, then pass the
   * results as `options` (they're still narrowed by what's typed). */
  onSearch?: (query: string) => void;
}

const iconSize: Record<ButtonSize, 'sm' | 'md' | 'lg' | 'xl'> = { xs: 'sm', s: 'sm', normal: 'md', m: 'md', l: 'lg', xl: 'lg', xxl: 'xl' };

/**
 * One choice from a list that's too long, or changes too often, to show as options side by side, at seven sizes, with
 * an optional leading icon, a placeholder, grouped and unavailable options, a loading and an empty list, and the commit
 * states when the choice is saved.
 * Not for two states (use Switch) or for a handful of fixed options always worth seeing (use SegmentedControl). With
 * `search` it is the combobox: typing narrows a long list (F15.44; no separate Combobox, as a one-time code is a
 * TextField type). Picking people or free tags as a value is TagInput's job.
 * Owner F10 (2026-11-07): the list is the library's own, built from the one ListItem that menus use, not the platform's.
 * @tier fundamental
 * @family selection
 * @a11y The WAI-ARIA APG select-only combobox: a `button[role=combobox]` named by the visible label, with
 * `aria-expanded`, `aria-controls` and `aria-activedescendant` pointing into a `listbox` of ListItem options, so focus
 * stays on the combobox and its focus ring stays visible. The selected option carries `aria-selected` and a check mark;
 * an unavailable one `aria-disabled`; a group is `role=group` named by its heading. The list opens in the top layer under
 * the field (above near the window's end). Read-only sets `aria-readonly` and doesn't open; while a choice saves the box
 * is `aria-busy` and `aria-disabled`, focus stays on it, and "Saved" is announced politely. `name` adds a hidden input
 * for forms; `error` sets `aria-invalid` and is read with the hint. Targets: 44 px and up from `normal`; `xs` and `s`
 * are dense exceptions.
 * @key Arrow Down, Arrow Up, Enter or Space: opens the list at the chosen option
 * @key Arrow Down, Arrow Up: move through the options, skipping unavailable ones
 * @key Home, End: move to the first or last option
 * @key A letter: moves to the next option starting with it, open or closed
 * @key Enter or Space: chooses the option and closes the list
 * @key Tab: chooses the option, closes the list and moves on
 * @key Escape: closes the list without changing the choice
 * @key Space or Enter (multiple): chooses the option, or unchooses it; the list stays open
 * @key Shift+Arrow Down, Shift+Arrow Up (multiple): move and choose
 * @key Shift+Space (multiple): chooses every option from the last one chosen to this one
 * @key Ctrl+A (multiple): chooses all, or none when all are chosen
 * @key Escape, Tab or Alt+Arrow Up (multiple): closes the list and applies the choices
 * @key Typing (search): opens the list and narrows it; Space types. Home and End move the caret; Enter chooses (multiple:
 * toggles); the arrows, Tab and Escape work as above. `search` is the APG editable combobox with list autocomplete:
 * an `input[role=combobox]` with `aria-autocomplete="list"`, and the number of matches announced politely.
 */
export function Select(props: SelectProps) {
  const { label, value, options, onChange, mode = 'commit', savedText = 'Saved', multiple = false, size = 'normal', icon, placeholder = multiple ? 'Choose any' : 'Choose one', hint, error, optional = false, readOnly = false, disabled = false, loading = false, emptyText = 'Nothing to choose from yet.', failedText, name, search = false, noMatchText = (q: string) => `Nothing matches “${q}”`, onSearch, orientation, hideLabel = false, ...data } = props;
  const id = useId();
  const { phase, run, reset } = useCommit('--duration-confirm-min');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const q = query.trim().toLocaleLowerCase();
  const visible = (n: number) => !search || !q || options[n]!.label.toLocaleLowerCase().includes(q);
  const stored: string[] = Array.isArray(value) ? value : value ? [value] : [];
  const [attempt, setAttempt] = useState<string[] | null>(null);
  // Multiple: the choices made while the list is open; they apply once, when it closes.
  const [draft, setDraftState] = useState<string[] | null>(null);
  const draftRef = useRef<string[] | null>(null);
  const setDraft = (next: string[] | null) => {
    draftRef.current = next;
    setDraftState(next);
  };
  const [anchor, setAnchor] = useState(-1);
  const pending = phase === 'on';
  const failed = phase === 'failed';
  const shown = draft ?? (pending && attempt !== null ? attempt : stored);
  const chosen = options.findIndex((o) => o.value === shown[0]);
  const enabled = (n: number) => !!options[n] && !options[n].disabled && visible(n);
  const first = options.findIndex((_, n) => enabled(n));
  const last = options.length - 1 - [...options].reverse().findIndex((_, r) => enabled(options.length - 1 - r));
  const [active, setActive] = useState(chosen);
  const root = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLElement>(null);
  const buttonBox = box as RefObject<HTMLButtonElement | null>;
  const input = useRef<HTMLInputElement>(null);
  const focusBox = () => (search ? input.current : box.current)?.focus();
  const list = useRef<HTMLDivElement>(null);
  const storedRef = useRef(stored);
  storedRef.current = stored;
  usePopup(open, box, list, root, () => close());
  const scroll = useOverlayScroll(undefined, open);
  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const locked = readOnly || disabled || pending;
  const step = (from: number, dir: 1 | -1) => {
    for (let n = from + dir; n >= 0 && n < options.length; n += dir) if (enabled(n)) return n;
    return from;
  };
  const show = (at = chosen >= 0 && enabled(chosen) ? chosen : first) => {
    if (locked) return;
    setActive(at);
    setAnchor(at);
    if (multiple) setDraft(stored);
    setOpen(true);
  };
  const save = (next: string[]) => {
    // In a form the choice is only reported; the form saves it with the rest.
    if (mode === 'form') return void (multiple ? (onChange as (n: string[]) => unknown)(next) : (onChange as (n: string) => unknown)(next[0] ?? ''));
    setAttempt(next);
    void run(() => (multiple ? (onChange as (n: string[]) => unknown)(next) : (onChange as (n: string) => unknown)(next[0] ?? '')));
  };
  const toggle = () => (open ? close() : show());
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((v) => b.includes(v));
  function close() {
    setOpen(false);
    setQuery('');
    const next = draftRef.current;
    setDraft(null);
    if (next && !same(next, storedRef.current)) save(options.filter((o) => next.includes(o.value)).map((o) => o.value));
  }
  // Typing narrows the list: the first match is highlighted, so Enter chooses it.
  useEffect(() => {
    if (search && open) onSearch?.(q);
  }, [q, open]);
  useEffect(() => {
    if (search && open) setActive(first);
  }, [q, options]);
  // After a choice, typing again starts a new search rather than adding to the chosen name.
  useEffect(() => {
    if (search && !open && document.activeElement === input.current) input.current?.select();
  }, [open]);
  const choose = (i: number) => {
    if (multiple) {
      if (!enabled(i)) return;
      const cur = draftRef.current ?? stored;
      const v = options[i].value;
      setActive(i);
      setAnchor(i);
      return setDraft(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
    }
    setOpen(false);
    setQuery('');
    if (enabled(i) && options[i].value !== value) save([options[i].value]);
  };
  const typeahead = (key: string, from: number) => {
    const k = key.toLowerCase();
    return options.map((_, n) => (from + 1 + n) % options.length).find((n) => enabled(n) && options[n].label.toLowerCase().startsWith(k));
  };
  // With search, these keys edit the text rather than move or choose.
  const typing = (e: KeyboardEvent<HTMLElement>) => search && (e.key === ' ' || e.key === 'Home' || e.key === 'End' || (e.key.length === 1 && !e.altKey));

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (locked) return;
    if (!open) {
      if (search) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') show();
        else return;
      } else if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) show();
      else if (e.key === 'Home') show(first);
      else if (e.key === 'End') show(last);
      else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        const n = typeahead(e.key, chosen);
        if (n !== undefined) show(n);
      } else return;
      return e.preventDefault();
    }
    if (typing(e)) return;
    if (multiple) {
      if (e.key === 'Escape' || (e.key === 'ArrowUp' && e.altKey)) close();
      else if (e.key === 'Tab') return close();
      else {
        const items = options.map((o, n) => ({ id: o.value, label: o.label, disabled: o.disabled || !visible(n) }));
        const next = listboxKey(items, { active, anchor, selected: draftRef.current ?? stored }, { key: e.key, shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey }, true);
        if (next) {
          setActive(next.active);
          setAnchor(next.anchor);
          setDraft(next.selected);
        } else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey) setActive(typeAhead(items, active, e.key));
        else return;
      }
      return e.preventDefault();
    }
    if (e.key === 'ArrowDown') setActive(step(active, 1));
    else if (e.key === 'ArrowUp') setActive(step(active, -1));
    else if (e.key === 'Home') setActive(first);
    else if (e.key === 'End') setActive(last);
    else if (e.key === 'Enter' || e.key === ' ') {
      if (search && !enabled(active)) return e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') return search && !enabled(active) ? close() : choose(active);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const n = typeahead(e.key, active);
      if (n !== undefined) setActive(n);
    } else return;
    e.preventDefault();
  };

  const invalid = failed || !!error;
  const labelsOf = (values: string[]) => options.filter((o) => values.includes(o.value)).map((o) => o.label);
  // Up to two names, then a count, so the box says how many even when the names don't fit.
  const summary = (values: string[], none: string) => {
    const names = labelsOf(values);
    if (names.length === 0) return none;
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
  };
  const keptLabel = summary(stored, placeholder);
  const attemptLabel = attempt ? summary(attempt, placeholder) : '';
  const empty = !loading && options.length === 0;
  const matches = options.filter((_, n) => visible(n)).length;
  const boxText = multiple ? summary(shown, placeholder) : chosen >= 0 ? options[chosen].label : placeholder;

  // A failed change: what happened, what was kept, and the way out. Announced as it appears.
  const failure = (
    <span data-dl-part="failure" id={`${id}-failure`} role="status">
      {phase === 'done' && <span data-dl-part="announce">{savedText}</span>}
      {failed && (
        <>
          <Text as="span" variant="body-sm" tone="danger">
            {failedText ?? `Couldn’t change “${label}” to “${attemptLabel}”. It’s still “${keptLabel}”.`}
          </Text>
          <span data-dl-part="actions">
            <Button
              label="Retry"
              onClick={() => {
                focusBox(); // Retry is removed while pending; focus returns to the field first
                if (attempt !== null) save(attempt);
              }}
            />
            <Button
              label="Dismiss"
              emphasis="quiet"
              onClick={() => {
                focusBox();
                reset();
              }}
            />
          </span>
        </>
      )}
    </span>
  );

  return (
    <span {...data} data-dl="select" data-size={size} data-busy={phase === 'rest' ? undefined : phase} data-invalid={invalid ? '' : undefined} data-readonly={readOnly ? '' : undefined} ref={root}>
      <Field label={label} hint={hint} error={failed ? undefined : error} necessity={optional ? 'optional' : undefined} orientation={orientation} hideLabel={hideLabel} after={failure}>
        {(control) => (
          <>
      {(() => {
        const aria = {
          id: control.id,
          role: 'combobox' as const,
          'aria-labelledby': `${control.id}-label`,
          'aria-haspopup': 'listbox' as const,
          'aria-expanded': open,
          'aria-controls': `${id}-list`,
          'aria-activedescendant': open && matches > 0 && enabled(active) ? `${id}-${active}` : undefined,
          'aria-describedby': [control['aria-describedby'], failed && `${id}-failure`].filter(Boolean).join(' ') || undefined,
          'aria-invalid': invalid || undefined,
          'aria-busy': pending || loading || undefined,
          'aria-disabled': pending || undefined,
          disabled,
          onKeyDown: onKey,
        };
        const leading = icon && (
          <span data-dl-part="leading" aria-hidden="true">
            <Icon name={icon} size={iconSize[size]} />
          </span>
        );
        const ends = (
          <>
            <span data-dl-part="trailing" aria-hidden="true">
              {pending || loading ? <Progress /> : phase === 'done' ? <Icon name="success" /> : failed ? <Icon name="error" /> : null}
            </span>
            {!readOnly && (
              <span data-dl-part="chevron" aria-hidden="true">
                <Icon name="chevron-down" size={iconSize[size]} />
              </span>
            )}
          </>
        );
        if (search)
          return (
            <span
              ref={box}
              data-dl-part="box"
              data-dl-ring=""
              onClick={(e) => {
                // The text opens the list; the rest of the box (the chevron) opens or closes it.
                if (e.target === input.current) {
                  if (!open) show();
                } else open ? close() : show();
                input.current?.focus();
              }}
            >
              {leading}
              <input
                ref={input}
                {...aria}
                type="text"
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
                readOnly={readOnly || pending}
                value={open ? query : multiple ? (shown.length ? boxText : '') : chosen >= 0 ? options[chosen].label : ''}
                placeholder={open && shown.length ? boxText : open ? 'Type to search' : placeholder}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!open) show();
                }}
              />
              {ends}
            </span>
          );
        return (
          <button
            ref={buttonBox}
            {...aria}
            type="button"
            data-dl-part="box"
              data-dl-ring=""
            aria-readonly={readOnly || undefined}
            onClick={toggle}
          >
            {leading}
            <span data-dl-part="value" data-placeholder={shown.length === 0 || (!multiple && chosen < 0) ? '' : undefined}>
              {boxText}
            </span>
            {ends}
          </button>
        );
      })()}
      <div ref={list} data-dl-part="popup" data-presence="popup" data-material="floating" data-elevation="3" popover="manual" hidden={!open} inert={!open}>
        <div ref={scroll.root} data-dl="scroll-area" data-mode="auto" data-axis="block" data-max="fill" data-surface="none" data-contain="">
          <div ref={scroll.setViewport} data-dl-part="viewport">
            {loading || empty || matches === 0 ? (
              <div id={`${id}-list`} data-dl-part="content">
                <span data-dl-part="list-message" role="status">
                  {loading ? (
                    <>
                      <Progress label="Loading options" />
                      <Text as="span" variant="body-sm" tone="muted" aria-hidden="true">
                        Loading options…
                      </Text>
                    </>
                  ) : (
                    <Text as="span" variant="body-sm" tone="muted">
                      {empty ? emptyText : noMatchText(query.trim())}
                    </Text>
                  )}
                </span>
              </div>
            ) : (
              <div id={`${id}-list`} data-dl-part="content" role="listbox" aria-labelledby={`${control.id}-label`} aria-multiselectable={multiple || undefined}>
                {groupRuns(options).map((run) => {
                  const items = run.items.filter(({ index: i }) => visible(i)).map(({ option: o, index: i }) => (
                    <ListItem
                      key={o.value}
                      id={`${id}-${i}`}
                      role="option"
                      label={o.label}
                      description={o.description}
                      icon={o.icon}
                      disabled={o.disabled}
                      selected={multiple ? shown.includes(o.value) : i === chosen}
                      multiple={multiple || undefined}
                      active={i === active}
                      onClick={() => {
                        choose(i);
                        focusBox();
                      }}
                    />
                  ));
                  if (items.length === 0) return null;
                  if (!run.group) return <Fragment key={`all-${run.start}`}>{items}</Fragment>;
                  return (
                    <div key={`group-${run.start}`} role="group" data-dl-part="group" aria-labelledby={`${id}-group-${run.start}`}>
                      <span data-dl-part="group-heading" id={`${id}-group-${run.start}`} role="presentation">
                        {run.group}
                      </span>
                      {items}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {scroll.tracks('block')}
        </div>
      </div>
      {search && (
        <span data-dl-part="announce" role="status">
          {open && q && matches > 0 ? `${matches} ${matches === 1 ? 'match' : 'matches'}` : ''}
        </span>
      )}
      {name && stored.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
          </>
        )}
      </Field>
    </span>
  );
}

/** Consecutive options under the same heading (or none), keeping each option's index into the flat list. */
function groupRuns(options: SelectOption[]) {
  const runs: { group?: string; start: number; items: { option: SelectOption; index: number }[] }[] = [];
  options.forEach((option, index) => {
    const lastRun = runs[runs.length - 1];
    if (lastRun && lastRun.group === option.group) lastRun.items.push({ option, index });
    else runs.push({ group: option.group, start: index, items: [{ option, index }] });
  });
  return runs;
}