/**
 * Tier 0 behaviour: slider geometry and stepping, pure. Positions are 0–1 along the track; values live on
 * [min, max] through a linear or logarithmic scale. Used by Slider and the slider compounds.
 */

export type SliderScale = 'linear' | 'log';

export interface SliderMark {
  value: number;
  /** Written under the tick, e.g. "37 °C". A mark without a label is a tick only. */
  label?: string;
}

export interface SliderGeometry {
  min: number;
  max: number;
  step: number;
  scale?: SliderScale;
  /** Only these values can be chosen (non-uniform steps). */
  stops?: number[];
}

export const decimalsOf = (n: number) => (String(n).split('.')[1] ?? '').length;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Where a value sits along the track, 0 at min and 1 at max. Stops sit evenly spaced, whatever their values. A log scale needs min > 0. */
export function toPosition(value: number, { min, max, scale = 'linear', stops }: SliderGeometry): number {
  if (stops && stops.length > 1) {
    const s = [...stops].sort((a, b) => a - b);
    if (value <= s[0]) return 0;
    for (let i = 0; i < s.length - 1; i++) if (value <= s[i + 1]) return (i + (value - s[i]) / (s[i + 1] - s[i])) / (s.length - 1);
    return 1;
  }
  if (max === min) return 0;
  if (scale === 'log' && min > 0) return clamp(Math.log(value / min) / Math.log(max / min), 0, 1);
  return clamp((value - min) / (max - min), 0, 1);
}

/** The value at a position along the track, before snapping. */
export function fromPosition(p: number, { min, max, scale = 'linear', stops }: SliderGeometry): number {
  const q = clamp(p, 0, 1);
  if (stops && stops.length > 1) {
    const s = [...stops].sort((a, b) => a - b);
    const f = q * (s.length - 1);
    const i = Math.min(s.length - 2, Math.floor(f));
    return s[i] + (f - i) * (s[i + 1] - s[i]);
  }
  if (scale === 'log' && min > 0) return min * Math.pow(max / min, q);
  return min + q * (max - min);
}

/** The nearest allowed value: the nearest stop along the track when stops are given, otherwise the nearest step from min. */
export function snap(value: number, g: SliderGeometry): number {
  const v = clamp(value, g.min, g.max);
  if (g.stops?.length) {
    const s = [...g.stops].sort((a, b) => a - b);
    return s[Math.round(toPosition(v, g) * (s.length - 1))];
  }
  if (g.scale === 'log') {
    // On a log scale the step is relative to the size of the value: one step of its own order of magnitude, at least `step`.
    const unit = Math.max(g.step, Math.pow(10, Math.floor(Math.log10(Math.max(v, g.min))) - 1));
    return clamp(Number((Math.round(v / unit) * unit).toFixed(decimalsOf(g.step) + 2)), g.min, g.max);
  }
  const n = Math.round((v - g.min) / g.step);
  return clamp(Number((g.min + n * g.step).toFixed(decimalsOf(g.step) + decimalsOf(g.min))), g.min, g.max);
}

/**
 * One key press away: `by` steps up (+) or down (−). Stops move to the next stop; a log scale moves by a hundredth of
 * the track per step so every order of magnitude takes as many presses.
 */
export function stepFrom(value: number, by: number, g: SliderGeometry): number {
  if (g.stops?.length) {
    const sorted = [...g.stops].sort((a, b) => a - b);
    const i = sorted.findIndex((s) => s >= value - 1e-9);
    const at = i < 0 ? sorted.length - 1 : sorted[i] === value ? i : by > 0 ? i - 1 : i;
    return sorted[clamp(at + by, 0, sorted.length - 1)];
  }
  if (g.scale === 'log') return snap(fromPosition(toPosition(value, g) + by / 100, g), g);
  return snap(value + by * g.step, g);
}

/** The thumb a press at `value` moves: the nearest; between two equal thumbs, the one on the side pressed. */
export function nearestThumb(values: number[], value: number): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) {
    const d = Math.abs(values[i] - value);
    const b = Math.abs(values[best] - value);
    if (d < b || (d === b && value > values[i])) best = i;
  }
  return best;
}

/** Every step as a tick, when that is few enough to read (at most 50); otherwise none. */
export function stepMarks({ min, max, step }: SliderGeometry): SliderMark[] {
  const count = Math.round((max - min) / step);
  if (count > 50) return [];
  return Array.from({ length: count + 1 }, (_, i) => ({ value: Number((min + i * step).toFixed(decimalsOf(step))) }));
}
