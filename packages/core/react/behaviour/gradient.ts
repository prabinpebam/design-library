/**
 * Tier 0 behaviour: gradient stops, pure. A stop has a position from 0 to 100 (%) and an sRGB colour as #rrggbb.
 * Colours between stops are interpolated linearly in sRGB (other spaces later).
 */

export interface GradientStop {
  /** Stable key; the stop's Tab order follows the list, never its position. */
  id: string;
  /** 0–100 along the bar. */
  position: number;
  /** #rrggbb */
  colour: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) => `#${rgb.map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, '0')).join('')}`;

/** Stops in drawing order. */
export const byPosition = (stops: GradientStop[]) => [...stops].sort((a, b) => a.position - b.position);

/** The colour the gradient shows at `position`. */
export function colourAt(stops: GradientStop[], position: number): string {
  const s = byPosition(stops);
  if (position <= s[0].position) return s[0].colour;
  const last = s[s.length - 1];
  if (position >= last.position) return last.colour;
  const i = s.findIndex((x) => x.position >= position);
  const a = s[i - 1];
  const b = s[i];
  const t = b.position === a.position ? 0 : (position - a.position) / (b.position - a.position);
  const ca = parse(a.colour);
  const cb = parse(b.colour);
  return toHex(ca.map((c, k) => c + (cb[k] - c) * t));
}

/** The CSS for the bar, left to right (the bar mirrors itself in right-to-left text). */
export const toCss = (stops: GradientStop[]) => `linear-gradient(to right, ${byPosition(stops).map((s) => `${s.colour} ${Number(s.position.toFixed(2))}%`).join(', ')})`;

/** Adds a stop at `position` with the colour already shown there; returns the new list and the new stop. */
export function addStop(stops: GradientStop[], position: number, id: string): { stops: GradientStop[]; stop: GradientStop } {
  const stop = { id, position: Number(clamp(position, 0, 100).toFixed(1)), colour: colourAt(stops, position) };
  return { stops: [...stops, stop], stop };
}

/** Removes a stop unless only two remain (a gradient needs two). */
export const removeStop = (stops: GradientStop[], id: string) => (stops.length <= 2 ? stops : stops.filter((s) => s.id !== id));

/** Mirrors every stop's position. */
export const flip = (stops: GradientStop[]) => stops.map((s) => ({ ...s, position: Number((100 - s.position).toFixed(1)) }));

/** Spaces the stops evenly from 0 to 100, keeping their order along the bar. */
export function distribute(stops: GradientStop[]): GradientStop[] {
  const order = byPosition(stops).map((s) => s.id);
  return stops.map((s) => ({ ...s, position: Number(((order.indexOf(s.id) / (stops.length - 1)) * 100).toFixed(1)) }));
}
