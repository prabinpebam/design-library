/**
 * `@design-library/core/effects` (MP12, ID28): drawing helpers for effects a site paints itself, with no React.
 *
 * The stipple field `ImageGeneration` draws (dots laid out by Poisson-disk sampling, sized by two layers of Perlin
 * noise drifting in opposite directions), exported as the same code so a site's own effect matches it:
 *
 * - `perlin2(x, y)`: Perlin noise, about -1 to 1, on a fixed permutation (the same field every time).
 * - `poissonPoints(width, height, spacing, random?)`: evenly spread points no closer than `spacing`.
 * - `layoutStipple(width, height, random?)`: the dots for a field of that size in CSS pixels (`StipplePoint[]`).
 * - `stippleTime(elapsedMs)`: noise time after that long, independent of the screen's refresh rate.
 * - `stippleRadius(point, time)`: one dot's radius at that time.
 * - `paintStipple(context, points, width, height, time, { field, dot })`: one whole frame.
 * - `stippleSettings`: the numbers behind it (read only).
 *
 * Colours come from tokens the caller resolves (`ImageGeneration` uses `--c-image-generation-field` and
 * `--c-image-generation-dot`); timing and reduced motion stay with the caller, such as `Image` `reveal` (MP11).
 */
export { perlin2, poissonPoints, layoutStipple, stippleTime, stippleRadius, paintStipple, stippleSettings } from '../react/behaviour/stipple';
export type { StipplePoint } from '../react/behaviour/stipple';
