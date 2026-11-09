// @ts-check
/** OKLCH ↔ sRGB conversion, gamut mapping and WCAG contrast for the colour generator (F7). Dependency-free. */

const lin = (/** @type {number} */ c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (/** @type {number} */ c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** @typedef {[number, number, number]} Triple */

/** sRGB hex (#rrggbb) → [r, g, b] in 0-1. */
export function hexToRgb(/** @type {string} */ hex) {
  const h = hex.replace('#', '');
  return /** @type {Triple} */ ([0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255));
}

/** [r, g, b] in 0-1 → #rrggbb, clamped. */
export function rgbToHex(/** @type {number[]} */ rgb) {
  return `#${rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0')).join('')}`;
}

/** sRGB [r, g, b] → OKLCH [L, C, h°]. */
export function rgbToOklch(/** @type {number[]} */ rgb) {
  const [r, g, b] = rgb.map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const h = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return /** @type {Triple} */ ([L, C, h]);
}

/** OKLCH [L, C, h°] → sRGB [r, g, b], unclamped (values outside 0-1 are out of gamut). */
export function oklchToRgb(/** @type {number[]} */ [L, C, h]) {
  const A = C * Math.cos((h * Math.PI) / 180);
  const B = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(gam);
}

export const inGamut = (/** @type {number[]} */ rgb) => rgb.every((c) => c >= -1e-4 && c <= 1 + 1e-4);

/** Gamut mapping by chroma: lightness and hue kept, chroma reduced until the colour fits sRGB. */
export function fit(/** @type {number[]} */ [L, C, h]) {
  if (inGamut(oklchToRgb([L, C, h]))) return /** @type {Triple} */ ([L, C, h]);
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToRgb([L, mid, h]))) lo = mid;
    else hi = mid;
  }
  return /** @type {Triple} */ ([L, lo, h]);
}

export const oklchToHex = (/** @type {number[]} */ lch) => rgbToHex(oklchToRgb(fit(lch)));
export const hexToOklch = (/** @type {string} */ hex) => rgbToOklch(hexToRgb(hex));

/** WCAG 2 relative luminance and contrast ratio of two #rrggbb colours. */
export function luminance(/** @type {string} */ hex) {
  const [r, g, b] = hexToRgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(/** @type {string} */ a, /** @type {string} */ b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
