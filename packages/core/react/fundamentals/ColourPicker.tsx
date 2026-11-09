import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { usePopup } from '../behaviour/popup';
import { channels, hsvToRgb, parseCss, parseHex, toCss, toHex, withChannel, type ColourModel, type Hsva } from '../behaviour/colour';
import { Button } from './Button';
import { MenuButton } from './MenuButton';
import { NumberField } from './NumberField';
import { Text } from './Text';
import { TextField } from './TextField';
import type { DataAttributes } from '../types';

export interface ColourPickerProps extends DataAttributes {
  /** Names what the colour is for: "Fill colour". Every part's accessible name starts with it. */
  label: string;
  /** The colour, `#rrggbb`. */
  value: string;
  /** Opacity, 0–1. Omit it for a colour with no opacity: the opacity slider and field don't show. */
  alpha?: number;
  /** Every change, live while dragging: the colour and, with `alpha`, its opacity. */
  onChange: (hex: string, alpha: number) => void;
  /** The model the numbers show in first: HSL by default (owner, Q49). The person can switch it. */
  model?: ColourModel;
  /** Colours to choose with one click, each group titled ("On this page", "Saved"). */
  swatches?: { title: string; colours: string[] }[];
  /** Shows a swatch button instead of the panel; pressing it opens the panel in a popover under it (Escape or a press
   * outside closes it). The swatch fills the box its parent gives it, 20 px at least. `empty` draws no colour (a colour
   * not chosen yet); `disabled` stops it opening. */
  trigger?: { empty?: boolean; disabled?: boolean };
  /** With `trigger`: the popover closed, so the person has finished choosing (save here, not on every live change). */
  onClose?: () => void;
}

const models: { value: ColourModel; label: string }[] = [
  { value: 'hex', label: 'Hex' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
  { value: 'hsb', label: 'HSB' },
  { value: 'css', label: 'CSS' },
];

// The colour model's own constants (content, not theme colours): every hue in order, and the area's white-to-hue and black ramps.
const hueTrack = 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)';
const area = (h: number) => `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h} 100% 50%))`;

type Dropper = { open: () => Promise<{ sRGBHex: string }> };

/** Keys for a one-axis track: arrows by 1 (Shift 10), Page Up and Down by 10, Home and End to the ends. */
function stepFor(e: KeyboardEvent, span: number): number | 'start' | 'end' | null {
  const big = e.shiftKey ? 10 : 1;
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') return big;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') return -big;
  if (e.key === 'PageUp') return span / 10;
  if (e.key === 'PageDown') return -span / 10;
  if (e.key === 'Home') return 'start';
  if (e.key === 'End') return 'end';
  return null;
}

/** Follows a pointer over an element, reporting its position as 0–1 on each axis, until it's released. */
function track(e: ReactPointerEvent<HTMLElement>, report: (x: number, y: number) => void) {
  if (e.button !== 0) return;
  const el = e.currentTarget;
  el.setPointerCapture(e.pointerId);
  el.focus();
  const at = (ev: { clientX: number; clientY: number }) => {
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
    report(getComputedStyle(el).direction === 'rtl' ? 1 - x : x, Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)));
  };
  at(e);
  const move = (ev: PointerEvent) => at(ev);
  const up = () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
  };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}

/**
 * A colour chosen by eye or by number, as in a design tool's inspector: a saturation and brightness area, a hue slider,
 * a separate opacity slider over a checkerboard, the numbers in one of five models (HSL first), a pick-from-screen
 * button where the browser has one, and swatches. Inline as a panel, or (`trigger`) as a swatch that opens it in a popover,
 * the way fields use it.
 * Not for choosing among a few named colours (a RadioGroup of swatches) or for a theme's brand colours (the colour config).
 * @tier fundamental
 * @family inputs
 * @a11y The area, hue and opacity are each a `role="slider"` with a spoken value ("saturation 60%, brightness 40%",
 * "hue 210°", "opacity 80%") and keys; the numbers are NumberFields and TextFields named by the picker's label; each
 * swatch is a button named by its hex. Colour is never the only cue: every value is also a number. As a trigger, the
 * swatch is a button named "label: hex" with `aria-haspopup="dialog"`; the popover is a dialog named by the label;
 * Escape closes it and puts focus back on the swatch.
 * @key Area: Left and Right change saturation, Up and Down brightness (Shift: ten)
 * @key Hue and opacity: arrows by one (Shift: ten), Page Up and Page Down by a tenth, Home and End to the ends
 */
export function ColourPicker({ label, value, alpha, onChange, model: firstModel = 'hsl', swatches, trigger, onClose, ...data }: ColourPickerProps) {
  const [colour, setColour] = useState<Hsva>(() => parseHex(value) ?? { h: 0, s: 0, v: 0, a: 1 });
  const [model, setModel] = useState<ColourModel>(firstModel);
  const shown = useRef(value);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const close = (focus: boolean) => {
    setOpen(false);
    onClose?.();
    if (focus) button.current?.focus();
  };
  usePopup(open, button, popup, root, () => close(false));
  // Opening puts focus on the area, so the arrow keys work at once.
  useEffect(() => {
    if (open) popup.current?.querySelector<HTMLElement>("[data-dl-part='area']")?.focus();
  }, [open]);
  const hasAlpha = alpha !== undefined;
  const dropper = typeof window !== 'undefined' ? (window as unknown as { EyeDropper?: new () => Dropper }).EyeDropper : undefined;

  // A new value from outside replaces the colour; the picker's own changes keep their hue (a grey has none).
  useEffect(() => {
    if (value.toLowerCase() !== shown.current.toLowerCase()) {
      shown.current = value;
      setColour((c) => parseHex(value, c.h) ?? c);
    }
  }, [value]);
  useEffect(() => {
    if (alpha !== undefined) setColour((c) => (c.a === alpha ? c : { ...c, a: alpha }));
  }, [alpha]);

  const change = (next: Hsva) => {
    setColour(next);
    shown.current = toHex(next);
    onChange(shown.current, Math.round(next.a * 100) / 100);
  };

  const [r, g, b] = hsvToRgb(colour);
  const hex = toHex(colour);
  const style = {
    '--colour-picker-hue': `hsl(${colour.h} 100% 50%)`,
    '--colour-picker-colour': `rgb(${r} ${g} ${b})`,
    '--colour-picker-colour-a': `rgb(${r} ${g} ${b} / ${colour.a})`,
    '--colour-picker-hue-track': hueTrack,
    '--colour-picker-area': area(colour.h),
    '--colour-picker-x': `${colour.s}%`,
    '--colour-picker-y': `${100 - colour.v}%`,
    '--colour-picker-h': `${(colour.h / 360) * 100}%`,
    '--colour-picker-a': `${colour.a * 100}%`,
  } as CSSProperties;

  const onAreaKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = e.shiftKey ? 10 : 1;
    const ds = e.key === 'ArrowRight' ? big : e.key === 'ArrowLeft' ? -big : 0;
    const dv = e.key === 'ArrowUp' ? big : e.key === 'ArrowDown' ? -big : 0;
    if (!ds && !dv) return;
    e.preventDefault();
    change({ ...colour, s: Math.min(100, Math.max(0, colour.s + ds)), v: Math.min(100, Math.max(0, colour.v + dv)) });
  };

  const onHueKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = stepFor(e, 360);
    if (k === null) return;
    e.preventDefault();
    change({ ...colour, h: k === 'start' ? 0 : k === 'end' ? 359 : (colour.h + k + 360) % 360 });
  };

  const onAlphaKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = stepFor(e, 100);
    if (k === null) return;
    e.preventDefault();
    const pct = k === 'start' ? 0 : k === 'end' ? 100 : Math.min(100, Math.max(0, Math.round(colour.a * 100) + k));
    change({ ...colour, a: pct / 100 });
  };

  const fields =
    model === 'hex' || model === 'css' ? (
      <TextField
        size="xs"
        label={`${label}, ${model === 'hex' ? 'hex' : 'CSS'}`}
        hideLabel
        value={model === 'hex' ? hex.slice(1).toUpperCase() : toCss(colour)}
        onCommit={(t) => {
          const next = model === 'hex' ? parseHex(t, colour.h) : parseCss(t, colour.h);
          if (next) change(model === 'hex' ? { ...next, a: colour.a } : next);
        }}
        data-dl-part="text"
      />
    ) : (
      channels(colour, model).map((ch, i) => (
        <NumberField key={`${model}-${ch.short}`} size="xs" label={`${label}, ${ch.label.toLowerCase()}`} hideLabel min={0} max={ch.max} precision={0} value={ch.value} onCommit={(n) => change(withChannel(colour, model, i, n))} />
      ))
    );

  const body = (
    <>
      <div
        data-dl-part="area"
        role="slider"
        tabIndex={0}
        aria-label={`${label}, saturation and brightness`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(colour.s)}
        aria-valuetext={`saturation ${Math.round(colour.s)}%, brightness ${Math.round(colour.v)}%`}
        onKeyDown={onAreaKey}
        onPointerDown={(e) => track(e, (x, y) => change({ ...colour, s: x * 100, v: (1 - y) * 100 }))}
      >
        <span data-dl-part="thumb" />
      </div>
      <div data-dl-part="sliders">
        {dropper && (
          <Button
            size="xs"
            emphasis="quiet"
            label="Pick"
            onClick={async () => {
              try {
                const picked = await new dropper().open();
                const next = parseHex(picked.sRGBHex, colour.h);
                if (next) change({ ...next, a: colour.a });
              } catch {
                // The person pressed Escape: nothing changes.
              }
            }}
          />
        )}
        <div data-dl-part="tracks">
          <div
            data-dl-part="hue"
            role="slider"
            tabIndex={0}
            aria-label={`${label}, hue`}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(colour.h)}
            aria-valuetext={`hue ${Math.round(colour.h)}°`}
            onKeyDown={onHueKey}
            onPointerDown={(e) => track(e, (x) => change({ ...colour, h: Math.min(359, x * 360) }))}
          >
            <span data-dl-part="thumb" />
          </div>
          {hasAlpha && (
            <div
              data-dl-part="alpha"
              role="slider"
              tabIndex={0}
              aria-label={`${label}, opacity`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(colour.a * 100)}
              aria-valuetext={`opacity ${Math.round(colour.a * 100)}%`}
              onKeyDown={onAlphaKey}
              onPointerDown={(e) => track(e, (x) => change({ ...colour, a: Math.round(x * 100) / 100 }))}
            >
              <span data-dl-part="thumb" />
            </div>
          )}
        </div>
      </div>
      <div data-dl-part="numbers">
        <MenuButton size="xs" emphasis="quiet" label={models.find((m) => m.value === model)?.label ?? 'HSL'} menuLabel={`${label}, colour model`} items={models} onSelect={(v) => setModel(v as ColourModel)} />
        <div data-dl-part="fields">{fields}</div>
        {hasAlpha && model !== 'css' && (
          <NumberField size="xs" label={`${label}, opacity`} hideLabel unit="%" min={0} max={100} precision={0} value={Math.round(colour.a * 100)} onCommit={(n) => change({ ...colour, a: n / 100 })} />
        )}
      </div>
      {swatches?.map((group) => (
        <div key={group.title} data-dl-part="swatches" role="group" aria-label={group.title}>
          <Text as="span" variant="caption" tone="muted">
            {group.title}
          </Text>
          <div data-dl-part="swatch-row">
            {group.colours.map((c) => (
              <button
                key={c}
                type="button"
                data-dl-part="swatch"
                aria-label={c.toUpperCase()}
                title={c.toUpperCase()}
                data-current={c.toLowerCase() === hex ? '' : undefined}
                style={{ '--colour-picker-swatch': c } as CSSProperties}
                onClick={() => {
                  const next = parseHex(c, colour.h);
                  if (next) change({ ...next, a: colour.a });
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );

  if (!trigger) {
    return (
      <div {...data} data-dl="colour-picker" data-model={model} role="group" aria-label={label} style={style}>
        {body}
      </div>
    );
  }
  const said = trigger.empty ? 'not chosen' : `${hex.toUpperCase()}${hasAlpha && colour.a < 1 ? ` at ${Math.round(colour.a * 100)}%` : ''}`;
  return (
    <span {...data} ref={root} data-dl="colour-picker" data-trigger="" data-empty={trigger.empty ? '' : undefined} style={style}>
      <button
        ref={button}
        type="button"
        data-dl-part="trigger"
        aria-label={`${label}: ${said}`}
        title={`${label}: ${said}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={trigger.disabled}
        onClick={() => (open ? close(false) : setOpen(true))}
      />
      <div
        ref={popup}
        data-dl-part="popup" data-presence="popup" data-material="floating" data-elevation="3"
        popover="manual"
        hidden={!open}
        role="dialog"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return;
          e.preventDefault();
          e.stopPropagation();
          close(true);
        }}
      >
        <div data-dl-part="panel" data-model={model}>
          {body}
        </div>
      </div>
    </span>
  );
}
