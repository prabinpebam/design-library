import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { addStop, byPosition, distribute, flip, removeStop, toCss, type GradientStop } from '../behaviour/gradient';
import { Button } from '../fundamentals/Button';
import { ColourPicker } from '../fundamentals/ColourPicker';
import { NumberField } from '../fundamentals/NumberField';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export type { GradientStop } from '../behaviour/gradient';

export interface GradientEditorProps extends DataAttributes {
  /** What the gradient is for, e.g. "Header background". Shown above the bar; names the group. */
  label: string;
  /** At least two stops; positions 0–100. */
  stops: GradientStop[];
  /** Called with the new stops on every move, colour change, addition or removal. */
  onChange: (stops: GradientStop[]) => void;
  /** Called once when a drag or key press ends, or a stop is added, removed or recoloured: save here. */
  onChangeEnd?: (stops: GradientStop[]) => void;
  /** One line under the editor that helps. */
  description?: string;
  disabled?: boolean;
}

let made = 0;
const newId = () => `stop-${Date.now().toString(36)}-${(made++).toString(36)}`;

/**
 * Edits a gradient's colour stops on a bar painted with the gradient itself: drag a stop to move it, click the bar to
 * add one with the colour already there, drag a stop off the bar or press Delete to remove it (two always remain).
 * The selected stop's colour opens the ColourPicker (Enter on a stop too); its position takes an exact number. Flip and
 * Distribute evenly rearrange every stop. Not for one colour (use ColourField) or for shares of a whole
 * (use AllocationSlider).
 * @tier compound
 * @family pickers
 * @a11y A `group` named by the label. Each stop is a `slider` (position 0–100 %) whose `aria-valuetext` says its
 * position and colour ("30 %, #3366ff"); Tab order follows the list, not the position. Add stop is a button, so
 * adding never needs a pointer. Changes are announced politely ("Stop added at 50 %").
 * @key Arrow keys: move the stop 1 %; Shift + arrows or Page Up / Page Down: 10 %; Home / End: to 0 % or 100 %
 * @key Delete or Backspace: remove the stop (not when only two remain); Enter: open its colour picker
 */
export function GradientEditor({ label, stops, onChange, onChangeEnd, description, disabled = false, ...data }: GradientEditorProps) {
  const id = useId();
  const bar = useRef<HTMLSpanElement>(null);
  const swatch = useRef<HTMLSpanElement>(null);
  const refs = useRef(new Map<string, HTMLSpanElement>());
  const [activeId, setActiveId] = useState(stops[0]?.id);
  const [drag, setDrag] = useState<{ id: string; off: boolean } | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [said, setSaid] = useState('');
  const latest = useRef(stops);
  latest.current = stops;
  const active = stops.find((s) => s.id === activeId) ?? stops[0];
  const index = stops.indexOf(active);
  const canRemove = stops.length > 2 && !disabled;

  useEffect(() => {
    if (focusId) refs.current.get(focusId)?.focus({ preventScroll: true });
    setFocusId(null);
  }, [focusId]);

  const apply = (next: GradientStop[], end = false) => {
    latest.current = next;
    onChange(next);
    if (end) onChangeEnd?.(next);
  };
  const setPosition = (sid: string, position: number) => {
    const p = Number(Math.min(100, Math.max(0, position)).toFixed(1));
    if (latest.current.find((s) => s.id === sid)?.position === p) return;
    apply(latest.current.map((s) => (s.id === sid ? { ...s, position: p } : s)));
  };
  const remove = (sid: string) => {
    if (latest.current.length <= 2) return;
    const at = latest.current.findIndex((s) => s.id === sid);
    const next = removeStop(latest.current, sid);
    apply(next, true);
    const to = next[Math.min(at, next.length - 1)];
    setActiveId(to.id);
    setFocusId(to.id);
    setSaid(`Stop removed. ${next.length} stops.`);
  };
  const add = (position: number, focus = true) => {
    const r = addStop(latest.current, position, newId());
    apply(r.stops, true);
    setActiveId(r.stop.id);
    if (focus) setFocusId(r.stop.id);
    setSaid(`Stop added at ${r.stop.position} %.`);
  };
  const addInLargestGap = () => {
    const s = byPosition(latest.current);
    let at = 50;
    let widest = -1;
    for (let i = 0; i < s.length - 1; i++) {
      const gap = s[i + 1].position - s[i].position;
      if (gap > widest) [widest, at] = [gap, (s[i].position + s[i + 1].position) / 2];
    }
    add(at, false);
  };
  const pctAt = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    const rtl = getComputedStyle(bar.current!).direction === 'rtl';
    const p = ((clientX - r.left) / r.width) * 100;
    return rtl ? 100 - p : p;
  };
  const offBar = (clientY: number) => {
    const r = bar.current!.getBoundingClientRect();
    return clientY < r.top - r.height || clientY > r.bottom + r.height;
  };

  const onBarDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (disabled || e.button !== 0 || (e.target as HTMLElement).closest("[data-dl-part='stop']")) return;
    e.preventDefault();
    add(pctAt(e.clientX));
  };
  const onStopDown = (sid: string) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    setActiveId(sid);
    setDrag({ id: sid, off: false });
  };
  const onStopMove = (sid: string) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (drag?.id !== sid) return;
    const off = canRemove && offBar(e.clientY);
    if (off !== drag.off) setDrag({ id: sid, off });
    if (!off) setPosition(sid, pctAt(e.clientX));
  };
  const onStopUp = () => {
    if (!drag) return;
    const { id: sid, off } = drag;
    setDrag(null);
    if (off) remove(sid);
    else onChangeEnd?.(latest.current);
  };
  const onKeyDown = (sid: string) => (e: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    const s = latest.current.find((x) => x.id === sid)!;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const by = e.shiftKey ? 10 : 1;
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let to: number | null = null;
    if (e.key === fwd || e.key === 'ArrowUp') to = s.position + by;
    else if (e.key === back || e.key === 'ArrowDown') to = s.position - by;
    else if (e.key === 'PageUp') to = s.position + 10;
    else if (e.key === 'PageDown') to = s.position - 10;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = 100;
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (canRemove) remove(sid);
      else setSaid('A gradient needs two stops.');
      return;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter on a stop opens its colour, as pressing the swatch does.
      swatch.current?.querySelector<HTMLButtonElement>("[data-dl-part='trigger']")?.click();
      return;
    }
    if (to === null) return;
    e.preventDefault();
    setPosition(sid, to);
  };
  const onKeyUp = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!disabled && /^(Arrow|Page|Home|End)/.test(e.key)) onChangeEnd?.(latest.current);
  };

  return (
    <div {...data} data-dl="gradient-editor" data-disabled={disabled ? 'on' : undefined} role="group" aria-labelledby={`${id}-label`} aria-describedby={description ? `${id}-description` : undefined}>
      <span data-dl-part="label" id={`${id}-label`}>
        {label}
      </span>
      <span data-dl-part="bar" ref={bar} onPointerDown={onBarDown}>
        <span data-dl-part="paint" style={{ '--gradient': toCss(stops) } as CSSProperties} />
        {stops.map((s, i) => (
          <span
            key={s.id}
            ref={(el) => {
              if (el) refs.current.set(s.id, el);
              else refs.current.delete(s.id);
            }}
            data-dl-part="stop"
            data-active={s.id === active.id ? 'on' : undefined}
            data-removing={drag?.id === s.id && drag.off ? 'on' : undefined}
            style={{ '--at': String(s.position / 100), '--stop': s.colour } as CSSProperties}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Stop ${i + 1}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={s.position}
            aria-valuetext={`${s.position} %, ${s.colour}`}
            aria-disabled={disabled || undefined}
            onFocus={() => setActiveId(s.id)}
            onPointerDown={onStopDown(s.id)}
            onPointerMove={onStopMove(s.id)}
            onPointerUp={onStopUp}
            onPointerCancel={onStopUp}
            onKeyDown={onKeyDown(s.id)}
            onKeyUp={onKeyUp}
          />
        ))}
      </span>
      <div data-dl-part="selected">
        <span data-dl-part="which">
          <Button label="Previous stop" icon="chevron-start" iconOnly emphasis="quiet" size="s" disabled={disabled} onClick={() => setActiveId(stops[(index - 1 + stops.length) % stops.length].id)} />
          <Text as="span" variant="body-sm">{`Stop ${index + 1} of ${stops.length}`}</Text>
          <Button label="Next stop" icon="chevron-end" iconOnly emphasis="quiet" size="s" disabled={disabled} onClick={() => setActiveId(stops[(index + 1) % stops.length].id)} />
        </span>
        <span ref={swatch} data-dl-part="swatch" style={{ '--stop': active.colour } as CSSProperties}>
          <ColourPicker
            label={`Colour of stop ${index + 1}`}
            value={active.colour}
            trigger={{ disabled }}
            onChange={(hex) => apply(latest.current.map((s) => (s.id === active.id ? { ...s, colour: hex } : s)))}
            onClose={() => onChangeEnd?.(latest.current)}
          />
        </span>
        <Text as="span" variant="body-sm" tone="muted">
          {active.colour}
        </Text>
        <span data-dl-part="position">
          <NumberField
            label={`Position of stop ${index + 1}`}
            hideLabel
            size="s"
            value={active.position}
            min={0}
            max={100}
            step={1}
            unit="%"
            disabled={disabled}
            onCommit={(v) => {
              setPosition(active.id, v);
              onChangeEnd?.(latest.current);
            }}
          />
        </span>
      </div>
      <div data-dl-part="tools">
        <Button label="Add stop" icon="plus" size="s" disabled={disabled} onClick={addInLargestGap} />
        <Button label="Remove stop" icon="minus" size="s" emphasis="quiet" disabled={disabled} unavailable={stops.length <= 2 ? 'A gradient needs at least two stops.' : undefined} onClick={() => remove(active.id)} />
        <Button label="Flip" size="s" emphasis="quiet" disabled={disabled} onClick={() => apply(flip(latest.current), true)} />
        <Button label="Distribute evenly" size="s" emphasis="quiet" disabled={disabled} onClick={() => apply(distribute(latest.current), true)} />
      </div>
      {description && (
        <span data-dl-part="description" id={`${id}-description`}>
          <Text as="span" variant="body-sm" tone="muted">
            {description}
          </Text>
        </span>
      )}
      <span data-dl-part="announce" role="status">
        {said}
      </span>
    </div>
  );
}
