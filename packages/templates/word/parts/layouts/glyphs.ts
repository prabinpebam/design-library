import { icons, type IconName } from '@design-library/core/components';
import type { BrandGlyph } from '@design-library/core/icons';

/*
 * Word's ribbon glyphs, drawn for this template on the core names (never Word's artwork; main's icon ruling): the icon
 * box stays 20 px, but the ink is sized to w-copilot-01 at ≈1.25×, measured by the evaluator at W7 (Bold 5.8 × 8.3,
 * Italic 5.1 × 8.3, ¶ 8.3 × 9.6 CSS px), and colour bars are solid ≈3 px blocks rather than strokes.
 * Units: a 24-unit grid in a 20 px box, so 1 unit is 0.83 px.
 */
type Node = [string, Record<string, string>, Node[]?];

/** The core glyph's own parts, so its accent and fill colours still apply. */
function parts(name: IconName): Node[] {
  const i: { d: string; fill?: string; accent?: string; accentFill?: string } = icons[name];
  return [
    ['path', { d: i.d }],
    ...(i.fill ? [['path', { d: i.fill, 'data-dl-part': 'fill' }] as Node] : []),
    ...(i.accentFill ? [['path', { d: i.accentFill, 'data-dl-part': 'accent-fill' }] as Node] : []),
    ...(i.accent ? [['path', { d: i.accent, 'data-dl-part': 'accent' }] as Node] : []),
  ];
}

/** The core glyph scaled about the box's centre (k) and moved (dx, dy units). */
function scaled(name: IconName, k: number, dx = 0, dy = 0, only?: Node[]): BrandGlyph {
  const o = 12 * (1 - k);
  return { v: '0 0 24 24', c: [['g', { transform: `translate(${o + dx} ${o + dy}) scale(${k})` }, only ?? parts(name)]] };
}

/** A solid colour bar under a tool (highlight, shading): 19.8 × 3.8 units, ≈16.5 × 3.2 px in w-copilot-01. */
const bar: Node = ['rect', { x: '2.1', y: '18.2', width: '19.8', height: '3.8', 'data-dl-part': 'accent-fill' }];

export const wordGlyphs: Record<string, BrandGlyph> = {
  bold: { v: '0 0 24 24', g: { 'stroke-width': '2' }, c: [['path', { d: 'M9.55 8h2.6a1.9 1.9 0 0 1 0 3.8H9.55zM9.55 11.8h2.8a2.1 2.1 0 0 1 0 4.2H9.55z' }]] },
  italic: { v: '0 0 24 24', g: { 'stroke-width': '1.3' }, c: [['path', { d: 'M14.42 7.65L9.58 16.35' }]] },
  pilcrow: { v: '0 0 24 24', g: { 'stroke-width': '1.3' }, c: [['path', { d: 'M12.6 6.9v10.2M15.2 6.9v10.2M16 6.9h-3.4' }], ['path', { d: 'M12.6 6.9H9.9a2.9 2.9 0 0 0 0 5.8h2.7z', 'data-dl-part': 'fill' }]] },
  underline: scaled('underline', 0.62),
  strikethrough: scaled('strikethrough', 0.66),
  'clear-format': scaled('clear-format', 0.7),
  'text-effects': scaled('text-effects', 0.8),
  // Automatic font colour: the A alone, no bar (w-copilot-01).
  'text-colour': scaled('text-colour', 1, 0, 2.25, [['path', { d: icons['text-colour'].d }]]),
  highlight: { v: '0 0 24 24', c: [['g', { transform: 'translate(3.4 1) scale(0.72)' }, [['path', { d: icons.highlight.d }]]], bar] },
  'fill-colour': { v: '0 0 24 24', c: [['g', { transform: 'translate(3.4 1.5) scale(0.72)' }, [['path', { d: icons['fill-colour'].d }]]], bar] },
};
