import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Chip } from './Chip';
import type { ChipProps } from './Chip';
import type { DataAttributes } from '../types';

/** One chip of a group: an id plus what Chip draws. */
export interface ChipEntry extends Pick<ChipProps, 'label' | 'icon' | 'avatar' | 'invalid' | 'disabled'> {
  id: string;
}

export interface ChipGroupProps extends DataAttributes {
  /** What the chips are ("Recipients", "Status"). Always the group's accessible name. */
  label: string;
  /** Visually hide the label when an enclosing heading already names the group. Default false. */
  hideLabel?: boolean;
  /** One line under the label, when the chips need explaining. */
  description?: string;
  chips: ChipEntry[];
  /** `none`: input chips (values someone picked). `single`: filter chips, one on (radios). `multiple`: filter chips, any on (checkboxes). Default `none`. */
  selection?: 'none' | 'single' | 'multiple';
  /** Filter groups: the ids that are on. */
  value?: string[];
  onChange?: (value: string[]) => void;
  /** Input groups: removes a chip. Without it the chips are read-only. */
  onRemove?: (id: string) => void;
  /** Input groups: a chip's primary action (open the person's card). */
  onPress?: (id: string) => void;
  /** Shows this many chips, then a "+n" chip that shows the rest. */
  maxVisible?: number;
  /** One message for the group: what's wrong and how to fix it. Pair it with `invalid` chips. */
  error?: string;
  /** Said in the chips' place when there are none. */
  empty?: string;
  size?: ChipProps['size'];
}

/**
 * A set of chips under one label: values someone picked (input chips) or filters they turn on (filter chips, one or
 * several). Owns the label, description, message, empty state, the "+n" overflow and the keys.
 * @tier fundamental
 * @family selection
 * @a11y Labelled by its label, retained for assistive technology when hideLabel is on. Input chips are a `list`; filter chips a `group` of checkboxes or a `radiogroup`.
 * One Tab stop: arrows move between chips. After a removal, focus moves to the next chip, else the previous, and the
 * removal is announced politely. The "+n" chip is a real button naming how many more.
 * @key ArrowRight / ArrowDown, ArrowLeft / ArrowUp: the next or previous chip
 * @key Home / End: the first or last chip
 * @key Delete / Backspace: remove the input chip in focus
 */
export function ChipGroup({ label, hideLabel = false, description, chips, selection = 'none', value = [], onChange, onRemove, onPress, maxVisible, error, empty = 'None yet.', size, ...data }: ChipGroupProps) {
  const id = useId();
  const [current, setCurrent] = useState(0);
  const [all, setAll] = useState(false);
  const [said, setSaid] = useState('');
  const parts = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = maxVisible && !all && chips.length > maxVisible ? chips.slice(0, maxVisible) : chips;
  const hidden = chips.length - shown.length;
  const count = shown.length + (hidden ? 1 : 0);
  const at = Math.min(current, Math.max(0, count - 1));

  const focus = (i: number) => {
    setCurrent(i);
    parts.current[i]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const to = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: count - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    focus(Math.max(0, Math.min(count - 1, to)));
  };
  const remove = (i: number, chip: ChipEntry) => {
    onRemove?.(chip.id);
    setSaid(`Removed ${chip.label}`);
    const next = i < shown.length - 1 ? i : i - 1;
    setCurrent(Math.max(0, next));
    requestAnimationFrame(() => parts.current[Math.max(0, next)]?.focus());
  };

  const role = selection === 'none' ? 'list' : selection === 'single' ? 'radiogroup' : 'group';
  return (
    <div {...data} data-dl="chip-group" data-invalid={error ? '' : undefined}>
      <span id={`${id}-label`} data-dl-part="label" data-hidden={hideLabel ? '' : undefined}>
        {label}
      </span>
      {description && (
        <span id={`${id}-description`} data-dl-part="description">
          {description}
        </span>
      )}
      {chips.length === 0 ? (
        <span data-dl-part="empty">{empty}</span>
      ) : (
        <div
          data-dl-part="chips"
          role={role}
          aria-labelledby={`${id}-label`}
          aria-describedby={[description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
        >
          {shown.map((chip, i) => {
            const chipProps = {
              ...chip,
              size,
              tabIndex: i === at ? 0 : -1,
              focusRef: (el: HTMLButtonElement | null) => {
                parts.current[i] = el;
              },
              onKeyDown,
            };
            const node =
              selection === 'none' ? (
                <Chip {...chipProps} kind="input" onRemove={onRemove && (() => remove(i, chip))} onPress={onPress && (() => onPress(chip.id))} />
              ) : (
                <Chip
                  {...chipProps}
                  kind="filter"
                  selection={selection}
                  selected={value.includes(chip.id)}
                  onChange={(on) => onChange?.(selection === 'single' ? [chip.id] : on ? [...value, chip.id] : value.filter((v) => v !== chip.id))}
                />
              );
            return selection === 'none' ? (
              <span key={chip.id} role="listitem" data-dl-part="item" onFocus={() => setCurrent(i)}>
                {node}
              </span>
            ) : (
              <span key={chip.id} data-dl-part="item" onFocus={() => setCurrent(i)}>
                {node}
              </span>
            );
          })}
          {hidden > 0 && (
            <span role={selection === 'none' ? 'listitem' : undefined} data-dl-part="item">
              <button
                type="button"
                data-dl="chip"
                data-kind="more"
                data-size={size && size !== 'normal' ? size : undefined}
                ref={(el) => {
                  parts.current[shown.length] = el;
                }}
                tabIndex={at === shown.length ? 0 : -1}
                aria-label={`Show ${hidden} more`}
                onKeyDown={onKeyDown}
                onClick={() => setAll(true)}
              >
                <span data-dl-part="words">+{hidden}</span>
              </button>
            </span>
          )}
        </div>
      )}
      {error && (
        <span id={`${id}-error`} data-dl-part="error">
          {error}
        </span>
      )}
      <span data-dl-part="announce" role="status">
        {said}
      </span>
    </div>
  );
}
