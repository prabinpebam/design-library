import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { decimalsOf, fromPosition, nearestThumb, snap, stepFrom, stepMarks, toPosition, type SliderGeometry, type SliderMark, type SliderScale } from '../behaviour/slider';
import { Icon } from './Icon';
import { NumberField } from './NumberField';
import { Text } from './Text';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export type { SliderMark } from '../behaviour/slider';

export interface SliderProps extends DataAttributes {
  /** What the value is, in a few words, e.g. "Weight". Shown above the track unless `hideLabel`; always the accessible name. */
  label: string;
  /** Hides the visible label where a heading or row already says what it is. It still names the slider. */
  hideLabel?: boolean;
  /** One number for one thumb; two numbers for a range; three or more for independent thumbs on one track. */
  value: number | number[];
  /** Called on every change while dragging or pressing keys, with a number for one thumb or the array for several. */
  onChange: (value: number | number[]) => void;
  /** Called once on release or key-up with the final value: save here, never in `onChange`. */
  onChangeEnd?: (value: number | number[]) => void;
  min: number;
  max: number;
  /** The smallest change; the arrow keys move by this and drags snap to it. */
  step?: number;
  /** Page Up / Page Down and Shift + arrows move by this many steps. */
  largeStep?: number;
  /** Ticks on the track: `true` draws one per step (when 50 or fewer); a list draws only those, each with an optional label. */
  marks?: boolean | SliderMark[];
  /** Only the marked values can be chosen (non-uniform steps such as plan tiers). Needs `marks` as a list. */
  restrictToMarks?: boolean;
  /** A bubble over the thumb with its value: never, while dragging, hovered or focused (`active`), or `always`. */
  valueLabel?: 'none' | 'active' | 'always';
  /** Writes the value beside the label; on by default, off when a paired number box already shows it. */
  showValue?: boolean;
  /** Writes the minimum and maximum under the track's ends. */
  showBounds?: boolean;
  /** Says a value the way a person reads it ("14 px", "€40", "Monday"); used everywhere the value is shown and announced. */
  format?: (value: number) => string;
  /** The value as read, for one thumb; prefer `format`. */
  valueText?: string;
  /** Track and thumb: s (dense editors; 24 px target), normal (forms; 44 px) or l (touch and media; 48 px). */
  size?: 's' | 'normal' | 'l';
  /** A small icon before the track saying what low means (quiet, dark, smaller). */
  startIcon?: IconName;
  /** A small icon after the track saying what high means. */
  endIcon?: IconName;
  /** Where the fill starts for one thumb, e.g. 0 on −100…100 (balance, exposure); `min` when left out. */
  origin?: number;
  /** How position maps to value: `linear`, or `log` for ranges over several orders of magnitude (20 Hz–20 kHz). */
  scale?: SliderScale;
  /** The closest two neighbouring thumbs may come. */
  minGap?: number;
  /** When a thumb meets its neighbour: `block` stops it (default); `push` moves the neighbour along. */
  collide?: 'block' | 'push';
  /** With two thumbs, dragging the fill between them moves the whole range and keeps its width. */
  dragRange?: boolean;
  /** A NumberField per thumb for exact entry (one or two thumbs): after the track, or one at each end for a range. */
  input?: boolean;
  /** The unit typed and shown in the paired NumberField, e.g. "px", "%". */
  unit?: string;
  /** Each thumb's own name when there are several, e.g. ["Minimum price", "Maximum price"]. */
  thumbLabels?: string[];
  /** One line under the track that helps choose a value. */
  description?: string;
  /** What is wrong with the value and how to fix it. */
  error?: string;
  /** The value can't change and needn't be read. Prefer `readOnly`, or say why in the description. */
  disabled?: boolean;
  /** The value is shown and can be focused but not changed. */
  readOnly?: boolean;
}

type Typed<V> = Omit<SliderProps, 'value' | 'onChange' | 'onChangeEnd'> & {
  value: V;
  onChange: (value: V) => void;
  onChangeEnd?: (value: V) => void;
};


/**
 * Picks a number, a range or several numbers on one track by dragging or with the keys, where trying values and
 * seeing the result at once matters more than an exact figure (a font axis, a price band, a volume). Marks draw a
 * scale (graduated); `step` or `restrictToMarks` quantise it. Not for a value that must be typed exactly (pair a
 * NumberField or use one alone) or for an on/off choice (use Switch). Shares of a whole use AllocationSlider.
 * @tier fundamental
 * @family inputs
 * @a11y Each thumb is a `slider` named by the label (one thumb) or its `thumbLabels` entry, with `aria-valuemin`,
 * `aria-valuemax` (dependent on its neighbours), `aria-valuenow` and `aria-valuetext` from `format`. Tab order is
 * by thumb, never by position. Marks and bounds are written text, so the scale is never colour or position alone.
 * @key Arrow keys: by one step (or to the next mark); Page Up / Page Down or Shift + arrows: by a large step;
 * Home / End: as far as the thumb may go. Right and left swap in right-to-left text.
 */
export function Slider<V extends number | number[]>(props: Typed<V>) {
  const { label, hideLabel = false, value, onChange, onChangeEnd, min, max, step = 1, largeStep = 10, marks, restrictToMarks = false, valueLabel = 'none', showValue: showValueProp, showBounds = false, format, valueText, size = 'normal', startIcon, endIcon, origin, scale = 'linear', minGap = 0, collide = 'block', dragRange = false, input = false, unit, thumbLabels, description, error, disabled = false, readOnly = false, ...data } = props;
  const id = useId();
  const rail = useRef<HTMLSpanElement>(null);
  const thumbs = useRef<(HTMLSpanElement | null)[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const multi = Array.isArray(value);
  const values = (multi ? value : [value]) as number[];
  const latest = useRef(values);
  latest.current = values;

  const markList: SliderMark[] = marks === true ? stepMarks({ min, max, step }) : Array.isArray(marks) ? marks : [];
  const g: SliderGeometry = { min, max, step, scale, stops: restrictToMarks && markList.length ? markList.map((m) => m.value) : undefined };
  const fmt = format ?? ((v: number) => v.toLocaleString(undefined, { maximumFractionDigits: decimalsOf(step) }) + (unit ? ` ${unit}` : ''));
  const say = (v: number) => (!multi && valueText !== undefined ? valueText : (g.stops && markList.find((m) => m.value === v)?.label) || fmt(v));
  const n = values.length;
  const showValue = showValueProp ?? !input;
  const lower = (i: number) => (collide === 'push' ? min + i * minGap : i > 0 ? latest.current[i - 1] + minGap : min);
  const upper = (i: number) => (collide === 'push' ? max - (n - 1 - i) * minGap : i < n - 1 ? latest.current[i + 1] - minGap : max);
  const grab = useRef<{ at: number; from: number[] } | null>(null);

  const emit = (next: number[], end = false) => {
    const out = (multi ? next : next[0]) as V;
    (end ? onChangeEnd : onChange)?.(out);
  };
  const setThumb = (i: number, raw: number) => {
    const v = Math.min(upper(i), Math.max(lower(i), raw));
    if (v === latest.current[i]) return;
    const next = latest.current.map((x, k) => (k === i ? v : x));
    if (collide === 'push') {
      for (let k = i + 1; k < n; k++) next[k] = Math.max(next[k], next[k - 1] + minGap);
      for (let k = i - 1; k >= 0; k--) next[k] = Math.min(next[k], next[k + 1] - minGap);
    }
    latest.current = next;
    emit(next);
  };
  const moveRange = (to: number) => {
    const { at, from } = grab.current!;
    const d = Math.min(max - from[n - 1], Math.max(min - from[0], to - at));
    const next = from.map((x) => snap(x + d, g));
    if (next.every((x, k) => x === latest.current[k])) return;
    latest.current = next;
    emit(next);
  };
  const valueAt = (clientX: number) => {
    const r = rail.current!.getBoundingClientRect();
    const rtl = getComputedStyle(rail.current!).direction === 'rtl';
    const t = thumbs.current[0]?.offsetWidth ?? 0;
    const p = (clientX - r.left - t / 2) / Math.max(1, r.width - t);
    return snap(fromPosition(rtl ? 1 - p : p, g), g);
  };

  const locked = disabled || readOnly;
  const onPointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (locked || e.button !== 0) return;
    e.preventDefault();
    const v = valueAt(e.clientX);
    rail.current!.setPointerCapture(e.pointerId);
    const onThumb = (e.target as HTMLElement).closest("[data-dl-part='thumb']");
    if (dragRange && n === 2 && !onThumb && v > latest.current[0] && v < latest.current[1]) {
      grab.current = { at: v, from: latest.current };
      setDragging(-1);
      return;
    }
    const i = onThumb ? thumbs.current.indexOf(onThumb as HTMLSpanElement) : nearestThumb(latest.current, v);
    setDragging(i);
    setThumb(i, v);
    thumbs.current[i]?.focus({ preventScroll: true });
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (dragging === -1) moveRange(valueAt(e.clientX));
    else if (dragging !== null) setThumb(dragging, valueAt(e.clientX));
  };
  const onPointerUp = () => {
    if (dragging === null) return;
    setDragging(null);
    emit(latest.current, true);
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLSpanElement>) => {
    if (locked) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const big = g.stops ? 1 : largeStep;
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const v = latest.current[i];
    let next: number | null = null;
    if (e.key === fwd || e.key === 'ArrowUp') next = stepFrom(v, e.shiftKey ? big : 1, g);
    else if (e.key === back || e.key === 'ArrowDown') next = stepFrom(v, e.shiftKey ? -big : -1, g);
    else if (e.key === 'PageUp') next = stepFrom(v, big, g);
    else if (e.key === 'PageDown') next = stepFrom(v, -big, g);
    else if (e.key === 'Home') next = lower(i);
    else if (e.key === 'End') next = upper(i);
    if (next === null) return;
    e.preventDefault();
    setThumb(i, next);
  };
  const onKeyUp = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!locked && /^(Arrow|Page|Home|End)/.test(e.key)) emit(latest.current, true);
  };

  const pos = values.map((v) => toPosition(v, g));
  const o = toPosition(origin ?? min, g);
  const [fillFrom, fillTo] = values.length > 1 ? [pos[0], pos[pos.length - 1]] : [Math.min(o, pos[0]), Math.max(o, pos[0])];
  const scaleLabels = [...markList.filter((m) => m.label).map((m) => ({ value: m.value, label: m.label! }))];
  if (showBounds) for (const v of [min, max]) if (!scaleLabels.some((m) => m.value === v)) scaleLabels.push({ value: v, label: fmt(v) });
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const shown = multi ? values.map(fmt).join(' – ') : say(values[0]);
  const at = (p: number) => ({ '--p': p.toFixed(5) }) as CSSProperties;
  const iconSize = size === 'l' ? 'lg' : size === 's' ? 'sm' : 'md';
  const box = (i: number, side: 'in-start' | 'in-end') =>
    input && n <= 2 && !disabled ? (
      <span data-dl-part={side}>
        <NumberField
          label={multi ? (thumbLabels?.[i] ?? `${label} ${i + 1}`) : label}
          hideLabel
          size={size === 's' ? 'xs' : size === 'l' ? 'm' : 'normal'}
          value={values[i]}
          min={lower(i)}
          max={upper(i)}
          step={step}
          unit={unit}
          onCommit={(next) => {
            setThumb(i, snap(next, g));
            emit(latest.current, true);
          }}
        />
      </span>
    ) : null;

  return (
    <div {...data} data-dl="slider" data-size={size} data-disabled={disabled ? 'on' : undefined} data-readonly={readOnly ? 'on' : undefined} data-invalid={error ? 'on' : undefined} data-bubble={valueLabel} role={multi ? 'group' : undefined} aria-labelledby={multi && !hideLabel ? `${id}-label` : undefined} aria-label={multi && hideLabel ? label : undefined}>
      {(!hideLabel || showValue) && (
        <span data-dl-part="header">
          {!hideLabel && (
            <span data-dl-part="label" id={`${id}-label`}>
              {label}
            </span>
          )}
          {showValue && (
            <output data-dl-part="value" aria-hidden="true">
              {shown}
            </output>
          )}
        </span>
      )}
      <span data-dl-part="body">
        {n === 2 && box(0, 'in-start')}
        {startIcon && (
          <span data-dl-part="start">
            <Icon name={startIcon} size={iconSize} />
          </span>
        )}
        <span data-dl-part="rail" ref={rail} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <span data-dl-part="track" />
          <span data-dl-part="fill" data-grab={dragRange && n === 2 && !locked ? 'on' : undefined} style={{ '--from': fillFrom.toFixed(5), '--to': fillTo.toFixed(5) } as CSSProperties} />
          {markList.map((m) => {
            const p = toPosition(m.value, g);
            return <span key={m.value} data-dl-part="mark" data-in={p >= fillFrom && p <= fillTo ? 'on' : undefined} style={at(p)} />;
          })}
          {values.map((v, i) => (
            <span
              key={i}
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              data-dl-part="thumb"
              data-dragging={dragging === i ? 'on' : undefined}
              style={at(pos[i])}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-labelledby={multi || hideLabel ? undefined : `${id}-label`}
              aria-label={multi ? (thumbLabels?.[i] ?? `${label} ${i + 1}`) : hideLabel ? label : undefined}
              aria-valuemin={lower(i)}
              aria-valuemax={upper(i)}
              aria-valuenow={v}
              aria-valuetext={say(v)}
              aria-disabled={disabled || undefined}
              aria-readonly={readOnly || undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              onKeyDown={onKeyDown(i)}
              onKeyUp={onKeyUp}
            >
              {valueLabel !== 'none' && (
                <span data-dl-part="bubble" aria-hidden="true">
                  <span>{say(v)}</span>
                </span>
              )}
            </span>
          ))}
        </span>
        {scaleLabels.length > 0 && (
          <span data-dl-part="scale" aria-hidden="true">
            {scaleLabels.map((m) => (
              <span key={m.value} style={at(toPosition(m.value, g))}>
                {m.label}
              </span>
            ))}
          </span>
        )}
        {endIcon && (
          <span data-dl-part="end">
            <Icon name={endIcon} size={iconSize} />
          </span>
        )}
        {box(n - 1, 'in-end')}
      </span>
      {description && (
        <span data-dl-part="description" id={`${id}-description`}>
          <Text as="span" variant="body-sm" tone="muted">
            {description}
          </Text>
        </span>
      )}
      {error && (
        <span data-dl-part="error" id={`${id}-error`}>
          <Icon name="error" size="sm" />
          <Text as="span" variant="body-sm" tone="danger">
            {error}
          </Text>
        </span>
      )}
    </div>
  );
}
