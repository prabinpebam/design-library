/** @typedef {[number, number, number]} Triple */
/** sRGB hex (#rrggbb) → [r, g, b] in 0-1. */
export function hexToRgb(hex: string): Triple;
/** [r, g, b] in 0-1 → #rrggbb, clamped. */
export function rgbToHex(rgb: number[]): string;
/** sRGB [r, g, b] → OKLCH [L, C, h°]. */
export function rgbToOklch(rgb: number[]): Triple;
/** OKLCH [L, C, h°] → sRGB [r, g, b], unclamped (values outside 0-1 are out of gamut). */
export function oklchToRgb([L, C, h]: number[]): number[];
/** Gamut mapping by chroma: lightness and hue kept, chroma reduced until the colour fits sRGB. */
export function fit([L, C, h]: number[]): Triple;
/** WCAG 2 relative luminance and contrast ratio of two #rrggbb colours. */
export function luminance(hex: string): number;
export function contrast(a: string, b: string): number;
export function inGamut(rgb: number[]): boolean;
export function oklchToHex(lch: number[]): string;
export function hexToOklch(hex: string): Triple;
export type Triple = [number, number, number];
