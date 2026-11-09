// @ts-check
/** The colour generator and colour maths, browser-safe: shared by tools/colour.mjs and the library's brand editor. */
export * from './generate.mjs';
export { contrast, hexToOklch, oklchToHex } from './colour-math.mjs';