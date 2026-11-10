import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { cssMs } from '../behaviour/anchor';
import { useCommit } from '../behaviour/commit';
import { Field } from './Field';
import { Icon } from './Icon';
import { Button } from './Button';
import { MenuButton } from './MenuButton';
import type { ButtonSize } from './Button';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export interface NumberFieldProps extends DataAttributes {
  /** Names the value: "Width", "Opacity". Shown above the box unless `hideLabel`; always the accessible name. */
  label: string;
  /** The stored number, `'mixed'` when several selected items hold different values, or `'auto'` (with `auto`). */
  value: number | 'mixed' | 'auto';
  /** Stores a new number: after typing (Enter or leaving), a scrub, a stepper press, or a pause in arrow keys. Return a promise for a save; reject it when it fails. */
  onCommit: (next: number) => unknown;
  /** `commit` (default): each new number saves on its own, with saving and failed states. `form` (IP14): one field of a form saved together with one Save button: `onCommit` just reports the number; no state shows on the field. */
  mode?: 'commit' | 'form';
  min?: number;
  max?: number;
  /** One arrow press, one stepper press, one pixel of scrubbing. Shift: ×10, Alt: ×0.1. */
  step?: number;
  /** Decimal places kept; defaults to one more than the step's (for Alt ×0.1). Trailing zeros are not shown. */
  precision?: number;
  /** Shown after the number and accepted when typed: "px", "%", "°". */
  unit?: string;
  /** A short mark before the number, e.g. "W", "H", "X", "Y". Drag it to change the value. */
  glyph?: string;
  /** An icon before the number (rotation, corner radius). Drag it to change the value. */
  icon?: IconName;
  /** Adds − and + buttons; hold one to repeat. */
  steppers?: boolean;
  /** The Button size scale; inspector rows use `xs` or `s`. */
  size?: ButtonSize;
  /** Hides the visible label where the glyph or icon and the row's heading already say what it is (an inspector). It still names the field. */
  hideLabel?: boolean;
  disabled?: boolean;
  /** What is wrong and how to fix it. */
  error?: string;
  /** The value can be Auto (line height, auto layout spacing): the box shows "Auto"; typing "auto" or emptying the box
   * calls `onAuto`. `computed` is the number Auto works out to, where arrows and dragging start. `label` names the
   * no-number value where Auto isn't the word, e.g. "None" for a minimum width that isn't set. */
  auto?: { computed: number; onAuto: () => unknown; label?: string };
  /** The value comes from a variable ("spacing/md"): the box shows its name, the number can't be typed or dragged, and
   * Detach (`onDetach`) turns it back into a plain number. */
  variable?: { name: string; onDetach: () => void };
  /** Units the person can switch to by typing one ("2px" in a % field), as letter spacing and line height do. The box shows `unit`; a typed other unit calls `onUnitChange` first, then `onCommit`. */
  units?: string[];
  onUnitChange?: (unit: string) => void;
  /** Common values in a list at the box's end (font sizes, export scales); any other number can still be typed. */
  presets?: number[];
  /** A short word at the box's end naming how the value is set (a design tool's Hug, Fixed or Fill), which opens a menu of the alternatives. */
  choice?: { value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; label?: string };
}

const iconSize: Record<ButtonSize, 'sm' | 'md' | 'lg' | 'xl'> = { xs: 'sm', s: 'sm', normal: 'md', m: 'md', l: 'lg', xl: 'lg', xxl: 'xl' };
const listSize: Record<ButtonSize, ButtonSize> = { xs: 'xs', s: 'xs', normal: 'xs', m: 'xs', l: 's', xl: 's', xxl: 'normal' };
const decimals = (n: number) => (String(n).split('.')[1] ?? '').length;

/**
 * Reads what was typed: a number with or without its unit, arithmetic ("12*2", "(40-8)/2") or a change to the current
 * value ("+4", "*2", "/3"). Returns null for anything else. A small parser, never `eval`.
 */
export function parseNumberInput(text: string, current: number, unit?: string): number | null {
  let s = text.trim().toLowerCase();
  for (const u of [unit, 'px', '%', '°', 'deg'].filter(Boolean) as string[]) s = s.split(u.toLowerCase()).join('');
  s = s.replace(/,/g, '.').replace(/\s+/g, '');
  if (!s) return null;
  if (/^[+*/]/.test(s)) s = `${current}${s}`;
  let i = 0;
  const peek = () => s[i];
  const num = (): number | null => {
    if (peek() === '(') {
      i++;
      const v = sum();
      if (peek() !== ')') return null;
      i++;
      return v;
    }
    if (peek() === '-') {
      i++;
      const v = num();
      return v === null ? null : -v;
    }
    const m = /^\d*\.?\d+|^\d+\.?/.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return parseFloat(m[0]);
  };
  const product = (): number | null => {
    let v = num();
    while (v !== null && (peek() === '*' || peek() === '/')) {
      const op = s[i++];
      const r = num();
      if (r === null) return null;
      v = op === '*' ? v * r : v / r;
    }
    return v;
  };
  const sum = (): number | null => {
    let v = product();
    while (v !== null && (peek() === '+' || peek() === '-')) {
      const op = s[i++];
      const r = product();
      if (r === null) return null;
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };
  const v = sum();
  return v === null || i !== s.length || !Number.isFinite(v) ? null : v;
}

/**
 * A number to type, step, drag or calculate, from a form field to a dense inspector row. Arrows step it (Shift ×10,
 * Alt ×0.1), Page Up and Page Down by ten steps, Home and End to the limits; the − and + buttons repeat while held;
 * dragging the glyph, icon or visible label scrubs it with the pointer hidden and locked (Shift ×10, Alt ×0.1, Escape
 * puts it back). Typing takes units ("24px", or another of `units` to switch), arithmetic ("12*2") and changes ("+4").
 * Shows "Mixed" for a selection whose values differ and "Auto" where the value can be worked out; offers common values
 * (`presets`) in a list at the box's end.
 * Not for numbers nobody adjusts (a postcode, a card number: TextField with `inputMode="numeric"`) or a value whose
 * position in a range matters more than its digits (Slider).
 * @tier fundamental
 * @family inputs
 * @a11y A native `input` with `role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and
 * `aria-valuetext` (with the unit, or "Mixed"); named by `label` even when it's hidden. The steppers and the scrub
 * handle repeat what the keys do, so they're left out of the tab order. The wheel changes the value only while the field
 * has focus; otherwise it scrolls the page. Arrow keys save after a pause, never on every press.
 * @key Arrow up / Arrow down: one step (Shift: ten, Alt: a tenth)
 * @key Page Up / Page Down: ten steps
 * @key Home / End: the minimum / the maximum
 * @key Enter: saves what was typed
 * @key Escape: puts back the stored value; while scrubbing, cancels the drag
 * @key Drag the label, glyph or icon sideways: changes the value with the pointer hidden (Shift: ten, Alt: a tenth)
 */
export function NumberField({ label, value, onCommit, mode = 'commit', min, max, step = 1, precision, unit, glyph, icon, steppers = false, size = 'normal', hideLabel = false, disabled = false, error, auto, units, onUnitChange, presets, choice, variable, ...data }: NumberFieldProps) {
  // One decimal finer than the step by default, so Alt (×0.1) can reach between steps; trailing zeros aren't shown.
  const places = precision ?? decimals(step) + 1;
  const clamp = (n: number) => {
    const r = Math.round(n * 10 ** places) / 10 ** places;
    return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, r));
  };
  const show = (n: number | 'mixed' | 'auto') => (n === 'mixed' ? '' : n === 'auto' ? (auto?.label ?? 'Auto') : `${Number(n.toFixed(places))}${unit ?? ''}`);
  const numberOf = (n: number | 'mixed' | 'auto') => (n === 'mixed' ? 0 : n === 'auto' ? (auto?.computed ?? 0) : n);
  const { phase, run } = useCommit('--duration-confirm-read');
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(show(value));
  const [scrubbing, setScrubbing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLSpanElement>(null);
  const pause = useRef(0);
  const mixed = current === 'mixed';
  const base = numberOf(current);

  useEffect(() => {
    setCurrent(value);
    setDraft(show(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // A unit switched by typing shows at once.
  useEffect(() => {
    setDraft(show(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const save = (n: number) => {
    window.clearTimeout(pause.current);
    if (n === value) return;
    if (mode === 'form') return void onCommit(n);
    void run(() => onCommit(n));
  };

  /** Shows a new number now; saves it now or after the key pause. */
  const set = (n: number, when: 'now' | 'pause' | 'later') => {
    const next = clamp(n);
    setCurrent(next);
    setDraft(show(next));
    window.clearTimeout(pause.current);
    if (when === 'now') save(next);
    else if (when === 'pause') {
      const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-commit-pause')) || 500;
      pause.current = window.setTimeout(() => save(next), ms);
    }
  };

  const factor = (e: { shiftKey: boolean; altKey: boolean }) => (e.shiftKey ? 10 : e.altKey ? 0.1 : 1);

  const typed = () => {
    const text = draft.trim();
    if (text === '' && mixed) return;
    const word = auto?.label ?? 'Auto';
    if (auto && (text === '' || text.toLowerCase() === word.toLowerCase())) {
      setDraft(word);
      if (current !== 'auto') {
        setCurrent('auto');
        void run(() => auto.onAuto());
      }
      return;
    }
    const switched = units?.find((u) => u !== unit && text.toLowerCase().endsWith(u.toLowerCase()));
    const n = parseNumberInput(text, base, switched ?? unit);
    if (n === null) setDraft(show(current));
    else {
      if (switched) onUnitChange?.(switched);
      set(n, 'now');
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (variable) return;
    const by = (k: number) => {
      e.preventDefault();
      set(base + k, 'pause');
    };
    if (e.key === 'ArrowUp') by(step * factor(e));
    else if (e.key === 'ArrowDown') by(-step * factor(e));
    else if (e.key === 'PageUp') by(step * 10);
    else if (e.key === 'PageDown') by(-step * 10);
    else if (e.key === 'Home' && min !== undefined) by(min - base);
    else if (e.key === 'End' && max !== undefined) by(max - base);
    else if (e.key === 'Enter') {
      e.preventDefault();
      typed();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCurrent(value);
      setDraft(show(value));
    }
  };

  // The wheel steps the value only while the field has focus; otherwise it's the page's (never hijacked).
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (document.activeElement !== el || disabled || variable) return;
      e.preventDefault();
      setCurrent((c) => {
        const n = clamp(numberOf(c) + (e.deltaY < 0 ? step : -step) * factor(e));
        setDraft(show(n));
        return n;
      });
      window.clearTimeout(pause.current);
      pause.current = window.setTimeout(() => {
        const n = parseNumberInput(input.current?.value ?? '', 0, unit);
        if (n !== null) save(n);
      }, 500);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  /**
   * Scrub: drag the glyph, the icon or the visible label. The pointer is locked and hidden while dragging (Shift ×10,
   * Alt ×0.1); Escape puts the value back. From the label it starts only after `threshold` pixels, so a click still
   * focuses the field.
   */
  const scrub = (handle: HTMLElement, pointerId: number, threshold: number) => {
    const start = base;
    let moved = 0;
    let latest = start;
    let cancelled = false;
    let live = false;
    const begin = () => {
      live = true;
      setScrubbing(true);
      try {
        handle.setPointerCapture(pointerId);
      } catch {
        // The pointer may already be up; the lock still hides it.
      }
      void handle.requestPointerLock?.();
    };
    const move = (ev: PointerEvent) => {
      moved += ev.movementX;
      if (!live) {
        if (Math.abs(moved) < threshold) return;
        moved = 0;
        begin();
      }
      latest = clamp(start + Math.round(moved) * step * factor(ev));
      setCurrent(latest);
      setDraft(show(latest));
    };
    const key = (ev: globalThis.KeyboardEvent) => {
      if (ev.key !== 'Escape' || !live) return;
      ev.preventDefault();
      cancelled = true;
      end();
    };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      document.removeEventListener('keydown', key, true);
      if (!live) return;
      if (document.pointerLockElement === handle) document.exitPointerLock();
      setScrubbing(false);
      if (cancelled) {
        setCurrent(start);
        setDraft(show(start));
      } else if (latest !== start) save(latest);
      input.current?.focus();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    document.addEventListener('keydown', key, true);
    if (threshold === 0) begin();
  };

  const onScrubDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (disabled || variable || e.button !== 0) return;
    e.preventDefault();
    scrub(e.currentTarget, e.pointerId, 0);
  };

  // The visible label (Field's) drags the value too, as the glyph does.
  useEffect(() => {
    const label = root.current?.querySelector<HTMLElement>(":scope > [data-dl='field'] > [data-dl-part='label']");
    if (!label || hideLabel || disabled || variable) return;
    const down = (e: PointerEvent) => {
      if (e.button === 0) scrub(label, e.pointerId, 3);
    };
    label.addEventListener('pointerdown', down);
    return () => label.removeEventListener('pointerdown', down);
  });

  /** A stepper: one step at once, then repeating while held. */
  const hold = (dir: 1 | -1) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    let n = base;
    const once = () => {
      n = clamp(n + dir * step * factor(e));
      setCurrent(n);
      setDraft(show(n));
    };
    once();
    let repeat = 0;
    const delay = cssMs(e.currentTarget, '--duration-repeat-delay');
    const every = cssMs(e.currentTarget, '--duration-repeat');
    const first = window.setTimeout(() => (repeat = window.setInterval(once, every)), delay);
    const stop = () => {
      window.clearTimeout(first);
      window.clearInterval(repeat);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      save(n);
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };

  const handle = glyph ?? icon;

  return (
    <span {...data} ref={root} data-dl="number-field" data-size={size} data-busy={phase === 'rest' ? undefined : phase} data-invalid={error ? '' : undefined} data-auto={current === 'auto' ? '' : undefined} data-variable={variable ? '' : undefined} data-scrubbing={scrubbing ? '' : undefined}>
      <Field label={label} error={error} hideLabel={hideLabel}>
        {(control) => (
      <span data-dl-part="box" data-dl-ring="">
        {handle && (
          <span data-dl-part="scrub" aria-hidden="true" title={`Drag to change ${label}`} onPointerDown={onScrubDown}>
            {glyph ?? (icon && <Icon name={icon} size={iconSize[size]} />)}
          </span>
        )}
        <input
          ref={input}
          id={control.id}
          role="spinbutton"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={variable ? variable.name : draft}
          readOnly={!!variable}
          placeholder={mixed ? 'Mixed' : undefined}
          disabled={disabled}
          aria-valuenow={typeof current === 'number' ? current : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={variable ? `${show(current)}, from the variable ${variable.name}` : mixed ? 'Mixed' : show(current)}
          aria-invalid={control['aria-invalid']}
          aria-describedby={control['aria-describedby']}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={typed}
          onKeyDown={onKeyDown}
        />
        {variable && !disabled && <Button size={listSize[size]} emphasis="quiet" icon="close" iconOnly label={`Detach ${variable.name}`} onClick={() => { variable.onDetach(); input.current?.focus(); }} />}
        {presets && !variable && (
          <MenuButton
            size={listSize[size]}
            emphasis="quiet"
            iconOnly
            label={`${label}: common values`}
            items={presets.map((p) => ({ value: String(p), label: show(p) }))}
            onSelect={(v) => set(Number(v), 'now')}
            disabled={disabled}
          />
        )}
        {choice && (
          <MenuButton
            size={listSize[size]}
            emphasis="quiet"
            label={choice.options.find((o) => o.value === choice.value)?.label ?? choice.value}
            menuLabel={choice.label ?? `How ${label.toLowerCase()} is set`}
            items={choice.options}
            onSelect={choice.onChange}
            disabled={disabled}
            data-dl-part="choice"
          />
        )}
        {steppers && !variable && (
          <span data-dl-part="steppers">
            <button type="button" tabIndex={-1} aria-hidden="true" disabled={disabled || (!mixed && min !== undefined && base <= min)} onPointerDown={hold(-1)}>
              <Icon name="minus" size="sm" />
            </button>
            <button type="button" tabIndex={-1} aria-hidden="true" disabled={disabled || (!mixed && max !== undefined && base >= max)} onPointerDown={hold(1)}>
              <Icon name="plus" size="sm" />
            </button>
          </span>
        )}
      </span>
        )}
      </Field>
    </span>
  );
}
