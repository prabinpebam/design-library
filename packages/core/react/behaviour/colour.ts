/**
 * Tier 0: colour maths for the ColourPicker. One colour is held as HSV (what the 2-D area and hue slider move) plus
 * alpha; every model (Hex, RGB, HSL, HSB, CSS) is a view of it. Pure functions, no DOM.
 */

export interface Hsva {
  /** 0–360 */
  h: number;
  /** 0–100 */
  s: number;
  /** 0–100 (value, brightness) */
  v: number;
  /** 0–1 */
  a: number;
}

export type ColourModel = 'hex' | 'rgb' | 'hsl' | 'hsb' | 'css';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number, places = 0) => Math.round(n * 10 ** places) / 10 ** places;

export function hsvToRgb({ h, s, v }: Hsva): [number, number, number] {
  const S = s / 100;
  const V = v / 100;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return V - V * S * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5), f(3), f(1)].map((x) => Math.round(x * 255)) as [number, number, number];
}

export function rgbToHsv(r: number, g: number, b: number, a = 1, hue = 0): Hsva {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const d = max - Math.min(R, G, B);
  let h = hue;
  if (d) h = max === R ? 60 * (((G - B) / d) % 6) : max === G ? 60 * ((B - R) / d + 2) : 60 * ((R - G) / d + 4);
  return { h: (h + 360) % 360, s: max ? (d / max) * 100 : 0, v: max * 100, a };
}

export function hsvToHsl({ h, s, v }: Hsva): [number, number, number] {
  const S = s / 100;
  const V = v / 100;
  const l = V * (1 - S / 2);
  const sl = l === 0 || l === 1 ? 0 : (V - l) / Math.min(l, 1 - l);
  return [h, sl * 100, l * 100];
}

export function hslToHsv(h: number, s: number, l: number, a = 1): Hsva {
  const S = s / 100;
  const L = l / 100;
  const v = L + S * Math.min(L, 1 - L);
  return { h, s: v ? 2 * (1 - L / v) * 100 : 0, v: v * 100, a };
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/** `#rrggbb`, lower case. */
export function toHex(c: Hsva): string {
  return `#${hsvToRgb(c).map(hex2).join('')}`;
}

/** Reads `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` (the hash optional). Keeps `hue` when the colour has none (grey). */
export function parseHex(text: string, hue = 0): Hsva | null {
  let t = text.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(t)) return null;
  if (t.length <= 4) t = [...t].map((ch) => ch + ch).join('');
  const n = (i: number) => parseInt(t.slice(i, i + 2), 16);
  return rgbToHsv(n(0), n(2), n(4), t.length === 8 ? n(6) / 255 : 1, hue);
}

/** A CSS colour string: `rgb(…)` with the alpha when it isn't 1, as the CSS model shows. */
export function toCss(c: Hsva): string {
  const [r, g, b] = hsvToRgb(c);
  return c.a < 1 ? `rgb(${r} ${g} ${b} / ${round(c.a * 100)}%)` : `rgb(${r} ${g} ${b})`;
}

/** Reads a hex or `rgb(…)`/`hsl(…)` string, the CSS model's input. */
export function parseCss(text: string, hue = 0): Hsva | null {
  const hex = parseHex(text, hue);
  if (hex) return hex;
  const m = /^(rgb|hsl)a?\(\s*([-\d.]+)[\s,]+([-\d.]+)%?[\s,]+([-\d.]+)%?(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/i.exec(text.trim());
  if (!m) return null;
  const [x, y, z] = [m[2], m[3], m[4]].map(Number);
  const a = m[5] === undefined ? 1 : clamp(Number(m[5]) / (m[6] ? 100 : 1), 0, 1);
  return m[1].toLowerCase() === 'rgb' ? rgbToHsv(clamp(x, 0, 255), clamp(y, 0, 255), clamp(z, 0, 255), a, hue) : hslToHsv(((x % 360) + 360) % 360, clamp(y, 0, 100), clamp(z, 0, 100), a);
}

/** The three numbers a model shows, with their names and limits. */
export function channels(c: Hsva, model: 'rgb' | 'hsl' | 'hsb'): { label: string; short: string; value: number; max: number; unit?: string }[] {
  if (model === 'rgb') {
    const [r, g, b] = hsvToRgb(c);
    return [
      { label: 'Red', short: 'R', value: r, max: 255 },
      { label: 'Green', short: 'G', value: g, max: 255 },
      { label: 'Blue', short: 'B', value: b, max: 255 },
    ];
  }
  const [h, s, third] = model === 'hsl' ? hsvToHsl(c) : [c.h, c.s, c.v];
  return [
    { label: 'Hue', short: 'H', value: round(h), max: 360, unit: '°' },
    { label: 'Saturation', short: 'S', value: round(s), max: 100, unit: '%' },
    { label: model === 'hsl' ? 'Lightness' : 'Brightness', short: model === 'hsl' ? 'L' : 'B', value: round(third), max: 100, unit: '%' },
  ];
}

/** The colour with one channel of a model set, keeping the others. */
export function withChannel(c: Hsva, model: 'rgb' | 'hsl' | 'hsb', index: number, value: number): Hsva {
  if (model === 'rgb') {
    const rgb = hsvToRgb(c);
    rgb[index] = clamp(value, 0, 255);
    return rgbToHsv(rgb[0], rgb[1], rgb[2], c.a, c.h);
  }
  if (model === 'hsb') {
    const next = { ...c };
    if (index === 0) next.h = ((value % 360) + 360) % 360;
    else if (index === 1) next.s = clamp(value, 0, 100);
    else next.v = clamp(value, 0, 100);
    return next;
  }
  const hsl = hsvToHsl(c);
  hsl[index] = index === 0 ? ((value % 360) + 360) % 360 : clamp(value, 0, 100);
  const next = hslToHsv(hsl[0], hsl[1], hsl[2], c.a);
  return { ...next, h: index === 0 || next.s ? next.h : c.h };
}
