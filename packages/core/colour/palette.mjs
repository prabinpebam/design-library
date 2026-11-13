// @ts-check
/**
 * Colours from a picture (LR46): its pixels clustered in OKLab (k-means++, seeded, so the same picture always gives the
 * same colours), each cluster scored by how much of the picture it covers and how colourful it is, best accent first.
 * Pure: the caller hands it the RGBA pixels of a small copy of the picture (a canvas's ImageData).
 */
import { hexToOklch, rgbToHex } from './colour-math.mjs';

const lin = (/** @type {number} */ c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** sRGB 0-255 → OKLab [L, a, b]. */
function oklab(/** @type {number} */ r, /** @type {number} */ g, /** @type {number} */ b) {
  const [R, G, B] = [r / 255, g / 255, b / 255].map(lin);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

/** OKLab → #rrggbb (a cluster's centre is an average of real pixels, so inside the gamut). */
function hexOf(/** @type {number[]} */ [L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return rgbToHex(rgb.map((v) => {
    const x = Math.min(1, Math.max(0, v));
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  }));
}

/** A small, fast, seeded random number generator (mulberry32). */
function random(/** @type {number} */ seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dist2 = (/** @type {number[]} */ a, /** @type {number[]} */ b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const hueGap = (/** @type {number} */ a, /** @type {number} */ b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/**
 * The picture's main colours as `#rrggbb`, best accent first (colourful, mid-light and plentiful), greys last: at most
 * `count`, each distinct from the others. `pixels` is RGBA; pixels under half opacity are left out.
 * @param {ArrayLike<number>} pixels
 * @param {number} [count]
 * @returns {string[]}
 */
export function paletteOf(pixels, count = 5) {
  const k = 10;
  /** @type {number[][]} */
  const points = [];
  for (let i = 0; i + 3 < pixels.length; i += 4) if (pixels[i + 3] >= 128) points.push(oklab(pixels[i], pixels[i + 1], pixels[i + 2]));
  if (!points.length || count < 1) return [];
  const rnd = random(0x5eed);
  const centres = [points[Math.floor(rnd() * points.length)]];
  while (centres.length < Math.min(k, points.length)) {
    const d = points.map((p) => Math.min(...centres.map((c) => dist2(p, c))));
    const total = d.reduce((s, x) => s + x, 0);
    if (total === 0) break;
    let r = rnd() * total;
    let i = 0;
    while (i < d.length - 1 && (r -= d[i]) > 0) i++;
    centres.push(points[i]);
  }
  const owner = new Int32Array(points.length);
  for (let iter = 0; iter < 16; iter++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) {
      let best = 0;
      let bd = Infinity;
      for (let c = 0; c < centres.length; c++) {
        const dd = dist2(points[i], centres[c]);
        if (dd < bd) {
          bd = dd;
          best = c;
        }
      }
      if (owner[i] !== best) {
        owner[i] = best;
        moved = true;
      }
    }
    const sums = centres.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < points.length; i++) {
      const s = sums[owner[i]];
      s[0] += points[i][0];
      s[1] += points[i][1];
      s[2] += points[i][2];
      s[3]++;
    }
    for (let c = 0; c < centres.length; c++) if (sums[c][3]) centres[c] = [sums[c][0] / sums[c][3], sums[c][1] / sums[c][3], sums[c][2] / sums[c][3]];
    if (!moved && iter > 0) break;
  }
  const counts = centres.map(() => 0);
  for (let i = 0; i < points.length; i++) counts[owner[i]]++;
  const ranked = centres
    .map((c, i) => {
      const hex = hexOf(c);
      const [L, C] = hexToOklch(hex);
      const share = counts[i] / points.length;
      const light = 1 - Math.min(1, Math.abs(L - 0.55) / 0.45);
      return { hex, share, neutral: C < 0.04, score: share > 0 ? Math.sqrt(share) * (C + 0.01) * (0.3 + light) : 0 };
    })
    .filter((s) => s.share > 0.005)
    .sort((a, b) => Number(a.neutral) - Number(b.neutral) || b.score - a.score || b.share - a.share);
  /** @type {string[]} */
  const out = [];
  for (const s of ranked) {
    const [xl, xc, xh] = hexToOklch(s.hex);
    const close = out.some((o) => {
      const [yl, yc, yh] = hexToOklch(o);
      return Math.abs(xl - yl) < 0.08 && (Math.min(xc, yc) < 0.04 || hueGap(xh, yh) < 18);
    });
    if (!close && !out.includes(s.hex)) out.push(s.hex);
    if (out.length === count) break;
  }
  return out;
}
