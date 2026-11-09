import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { boundaryActive, boundaryAt, boundaryRange, moveBoundary, setShare, sumsTo, type AllocationLimits } from '../behaviour/allocation';
import { Icon } from '../fundamentals/Icon';
import { NumberField } from '../fundamentals/NumberField';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

/** One part of the whole. */
export interface AllocationSegment {
  /** Stable key for the part. */
  id: string;
  /** What the part is, e.g. "Design". Read with its share. */
  label: string;
  /** Its share of the total. */
  share: number;
  /** The share is fixed: neither boundary beside it moves, and typing never takes from it. */
  locked?: boolean;
  /** Its category colour, 1-8 (`color.category.*`). Default: its position, so pass it when parts can be reordered or filtered and each must keep its colour. */
  category?: number;
}

/** The category colour (1-8) a part draws in: its own, or its position, wrapping after 8. */
const categoryOf = (s: AllocationSegment, i: number) => String(s.category && s.category >= 1 && s.category <= 8 ? Math.round(s.category) : (i % 8) + 1);

export interface AllocationSliderProps extends DataAttributes {
  /** What is being shared out, e.g. "Budget". Shown above the bar; names the group. */
  label: string;
  /** The parts in order; their shares should add up to `total`. */
  segments: AllocationSegment[];
  /** Called with the new segments while a boundary moves or a share is typed. */
  onChange: (segments: AllocationSegment[]) => void;
  /** Called once on release, key-up or a typed share, with the final segments: save here. */
  onChangeEnd?: (segments: AllocationSegment[]) => void;
  /** The whole the shares add up to. */
  total?: number;
  /** The smallest change a boundary or typed share makes. */
  step?: number;
  /** The least any part may hold; 0 lets a part be emptied. */
  minShare?: number;
  /** Page Up / Page Down and Shift + arrows move a boundary by this many steps. */
  largeStep?: number;
  /** Says a share the way a person reads it; "40 %" by default. */
  format?: (share: number) => string;
  /** A NumberField per part in the legend, to type an exact share. */
  input?: boolean;
  /** The bar's thickness: s 24, normal 32 or l 40 px. Boundaries keep a 24 px hit area at every size. */
  size?: 's' | 'normal' | 'l';
  /** One line under the bar that helps share it out. */
  description?: string;
  /** What is wrong and how to fix it. Shares that don't add up to the total say so on their own. */
  error?: string;
  disabled?: boolean;
  /** Shares are shown and boundaries focusable but nothing changes. */
  readOnly?: boolean;
}

/**
 * Shares a whole (a budget, a week, a weighting) between parts that always add up to the total: the filled bar is
 * what is adjusted. Dragging the boundary between two parts trades share between those two only; typing a share takes
 * from the next unlocked part and says which. Inner segments are square, only the bar's outer ends are rounded.
 * Not for independent values on one scale (use Slider with several thumbs) or for showing shares without changing
 * them (use StackedBar).
 * @tier compound
 * @family inputs
 * @a11y A `group` named by the label. Each boundary is a `slider` whose value is its running total, with dependent
 * min and max, and `aria-valuetext` naming both neighbours ("Design 40 %, Engineering 35 %"). The legend writes
 * every share as text, so the category colours are never the only carrier.
 * @key Arrow keys: move a boundary one step; Page Up / Page Down or Shift + arrows: ten steps; Home / End: as far as
 * the neighbours allow. Right and left swap in right-to-left text.
 */
export function AllocationSlider({ label, segments, onChange, onChangeEnd, total = 100, step = 1, minShare = 0, largeStep = 10, format = (s) => `${s} %`, input = false, size = 'normal', description, error, disabled = false, readOnly = false, ...data }: AllocationSliderProps) {
  const id = useId();
  const bar = useRef<HTMLSpanElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [said, setSaid] = useState('');
  const latest = useRef(segments);
  latest.current = segments;
  const shares = segments.map((s) => s.share);
  const limits: AllocationLimits = { total, step, minShare, locked: segments.map((s) => !!s.locked) };
  const locked = disabled || readOnly;
  const valid = sumsTo(shares, total);
  // Bad data that sums past the total is drawn to fit, so the bar never overflows.
  const whole = Math.max(total, shares.reduce((a, b) => a + b, 0));

  const apply = (next: number[], end = false) => {
    const out = latest.current.map((s, i) => ({ ...s, share: next[i] }));
    latest.current = out;
    onChange(out);
    if (end) onChangeEnd?.(out);
  };
  const move = (k: number, at: number) => {
    const next = moveBoundary(latest.current.map((s) => s.share), k, at, limits);
    if (next.some((v, i) => v !== latest.current[i].share)) apply(next);
  };
  const atPointer = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    const rtl = getComputedStyle(bar.current!).direction === 'rtl';
    const p = (clientX - r.left) / r.width;
    return (rtl ? 1 - p : p) * total;
  };

  const onPointerDown = (k: number) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (locked || e.button !== 0 || !boundaryActive(k, limits)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    setDragging(k);
  };
  const onPointerMove = (k: number) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (dragging === k) move(k, atPointer(e.clientX));
  };
  const onPointerUp = () => {
    if (dragging === null) return;
    setDragging(null);
    onChangeEnd?.(latest.current);
  };
  const onKeyDown = (k: number) => (e: KeyboardEvent<HTMLSpanElement>) => {
    if (locked || !boundaryActive(k, limits)) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const now = boundaryAt(latest.current.map((s) => s.share), k);
    const [lo, hi] = boundaryRange(latest.current.map((s) => s.share), k, limits);
    const by = (e.shiftKey ? largeStep : 1) * step;
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let at: number | null = null;
    if (e.key === fwd || e.key === 'ArrowUp') at = now + by;
    else if (e.key === back || e.key === 'ArrowDown') at = now - by;
    else if (e.key === 'PageUp') at = now + largeStep * step;
    else if (e.key === 'PageDown') at = now - largeStep * step;
    else if (e.key === 'Home') at = lo;
    else if (e.key === 'End') at = hi;
    if (at === null) return;
    e.preventDefault();
    move(k, at);
  };
  const onKeyUp = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!locked && /^(Arrow|Page|Home|End)/.test(e.key)) onChangeEnd?.(latest.current);
  };
  const type = (i: number, want: number) => {
    const r = setShare(latest.current.map((s) => s.share), i, want, limits);
    if (!r) {
      setSaid(`Nothing can give or take share: every other part is fixed.`);
      return;
    }
    const d = r.shares[i] - latest.current[i].share;
    apply(r.shares, true);
    if (d !== 0) setSaid(`${d > 0 ? 'Took' : 'Gave'} ${format(Math.abs(d))} ${d > 0 ? 'from' : 'to'} ${segments[r.from].label}.`);
  };

  const describedBy = [description && `${id}-description`, (error || !valid) && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div {...data} data-dl="allocation-slider" data-size={size} data-disabled={disabled ? 'on' : undefined} data-readonly={readOnly ? 'on' : undefined} role="group" aria-labelledby={`${id}-label`}>
      <span data-dl-part="label" id={`${id}-label`}>
        {label}
      </span>
      <span data-dl-part="bar" ref={bar}>
        {segments.map((s, i) => (
          <span key={s.id} data-dl-part="segment" data-category={categoryOf(s, i)} data-edge={segments.length === 1 ? 'both' : i === 0 ? 'start' : i === segments.length - 1 ? 'end' : undefined} data-locked={s.locked ? 'on' : undefined} style={{ '--share': String(s.share / whole) } as CSSProperties} />
        ))}
        {segments.slice(0, -1).map((s, k) => {
          const [lo, hi] = boundaryRange(shares, k, limits);
          const active = boundaryActive(k, limits);
          return (
            <span
              key={s.id}
              data-dl-part="boundary"
              data-dragging={dragging === k ? 'on' : undefined}
              data-inactive={active ? undefined : 'on'}
              style={{ '--at': String(boundaryAt(shares, k) / whole) } as CSSProperties}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Between ${s.label} and ${segments[k + 1].label}`}
              aria-valuemin={lo}
              aria-valuemax={hi}
              aria-valuenow={boundaryAt(shares, k)}
              aria-valuetext={`${s.label} ${format(s.share)}, ${segments[k + 1].label} ${format(segments[k + 1].share)}${active ? '' : ', fixed'}`}
              aria-disabled={disabled || !active || undefined}
              aria-readonly={readOnly || undefined}
              aria-describedby={describedBy}
              onPointerDown={onPointerDown(k)}
              onPointerMove={onPointerMove(k)}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown(k)}
              onKeyUp={onKeyUp}
            />
          );
        })}
      </span>
      <ul data-dl-part="legend">
        {segments.map((s, i) => (
          <li key={s.id} data-category={categoryOf(s, i)}>
            <span data-dl-part="swatch" aria-hidden="true" />
            <span data-dl-part="name">{s.label}</span>
            {input && !s.locked && !locked ? (
              <span data-dl-part="share-input">
                <NumberField label={`${s.label} share`} hideLabel size="xs" value={s.share} min={minShare} max={total} step={step} unit="%" onCommit={(v) => type(i, v)} />
              </span>
            ) : (
              <span data-dl-part="share">{format(s.share)}</span>
            )}
            {s.locked && <span data-dl-part="fixed">Fixed</span>}
          </li>
        ))}
      </ul>
      {description && (
        <span data-dl-part="description" id={`${id}-description`}>
          <Text as="span" variant="body-sm" tone="muted">
            {description}
          </Text>
        </span>
      )}
      {(error || !valid) && (
        <span data-dl-part="error" id={`${id}-error`}>
          <Icon name="error" size="sm" />
          <Text as="span" variant="body-sm" tone="danger">
            {error ?? `The shares add up to ${format(Number(shares.reduce((a, b) => a + b, 0).toFixed(6)))}, not ${format(total)}. The saved shares need correcting before they can be shared out.`}
          </Text>
        </span>
      )}
      <span data-dl-part="announce" role="status">
        {said}
      </span>
    </div>
  );
}
