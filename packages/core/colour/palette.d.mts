/**
 * The picture's main colours as `#rrggbb`, best accent first (colourful, mid-light and plentiful), greys last: at most
 * `count` (default 5), each distinct from the others. `pixels` is RGBA (a canvas's ImageData); pixels under half
 * opacity are left out. Seeded k-means in OKLab, so the same picture always gives the same colours (LR46).
 */
export function paletteOf(pixels: ArrayLike<number>, count?: number): string[];
