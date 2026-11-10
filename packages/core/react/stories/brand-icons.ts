/**
 * A generic brand's few icons (Q113, MP24, MP25): solid, rounded glyphs drawn for the library's stories, in
 * `currentColor`, on a 24-unit grid. They override eight of the library's names; every other name falls back. Owned
 * by the library (MIT), no third-party art.
 */
import type { BrandGlyph } from '../../icons/sets';

const solid = { fill: 'currentColor', stroke: 'none' };

export const brandIcons: Record<string, BrandGlyph> = {
  search: { v: '0 0 24 24', g: solid, c: [['path', { d: 'M10.5 3a7.5 7.5 0 0 1 6.02 11.98l3.75 3.75a1.5 1.5 0 0 1-2.12 2.12l-3.75-3.75A7.5 7.5 0 1 1 10.5 3Zm0 3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z' }]] },
  close: { v: '0 0 24 24', g: solid, c: [['path', { d: 'M6.4 4.3 12 9.9l5.6-5.6a1.5 1.5 0 0 1 2.1 2.1L14.1 12l5.6 5.6a1.5 1.5 0 0 1-2.1 2.1L12 14.1l-5.6 5.6a1.5 1.5 0 0 1-2.1-2.1L9.9 12 4.3 6.4a1.5 1.5 0 0 1 2.1-2.1Z' }]] },
  'chevron-down': { v: '0 0 24 24', g: solid, c: [['path', { d: 'M5.2 8.2a1.6 1.6 0 0 1 2.3 0L12 12.7l4.5-4.5a1.6 1.6 0 1 1 2.3 2.3l-5.6 5.6a1.6 1.6 0 0 1-2.3 0l-5.7-5.6a1.6 1.6 0 0 1 0-2.3Z' }]] },
  menu: { v: '0 0 24 24', g: solid, c: [['rect', { x: '3', y: '5', width: '18', height: '3', rx: '1.5' }], ['rect', { x: '3', y: '10.5', width: '12', height: '3', rx: '1.5' }], ['rect', { x: '3', y: '16', width: '18', height: '3', rx: '1.5' }]] },
  check: { v: '0 0 24 24', g: solid, c: [['path', { d: 'M19.6 6.4a1.6 1.6 0 0 1 0 2.3l-9 9a1.6 1.6 0 0 1-2.3 0l-4-4a1.6 1.6 0 1 1 2.3-2.3l2.85 2.85 7.85-7.85a1.6 1.6 0 0 1 2.3 0Z' }]] },
  star: { v: '0 0 24 24', c: [['path', { d: 'M12 2.8c.5 0 .9.3 1.1.7l2.2 4.6 5 .7c1 .2 1.4 1.4.7 2.1l-3.7 3.5.9 5c.2 1-.9 1.8-1.8 1.3L12 18.3l-4.4 2.4c-.9.5-2-.3-1.8-1.3l.9-5-3.7-3.5c-.7-.7-.3-1.9.7-2.1l5-.7 2.2-4.6c.2-.4.6-.7 1.1-.7Z' }]] },
  info: { v: '0 0 24 24', g: solid, c: [['path', { d: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 8.2c-.8 0-1.4.6-1.4 1.4v4.6a1.4 1.4 0 0 0 2.8 0v-4.6c0-.8-.6-1.4-1.4-1.4Zm0-4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z' }]] },
  more: { v: '0 0 24 24', g: solid, c: [['circle', { cx: '5', cy: '12', r: '2.2' }], ['circle', { cx: '12', cy: '12', r: '2.2' }], ['circle', { cx: '19', cy: '12', r: '2.2' }]] },
};

/** A second brand mark for one band only, to show a subtree override winning over the site's. */
export const bandIcons: Record<string, BrandGlyph> = {
  search: { v: '0 0 24 24', g: solid, c: [['path', { d: 'M10 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', fillRule: 'evenodd' }], ['rect', { x: '15', y: '14.5', width: '3.4', height: '8', rx: '1.7', transform: 'rotate(-45 16.7 18.5)' }]] },
};
