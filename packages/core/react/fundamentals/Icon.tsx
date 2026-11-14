import { createElement, type ReactNode } from 'react';
import { icons, type IconName } from '../../icons/icons';
import { glyphFor, useIconSetVersion, type IconChoice, type IconNode } from '../../icons/sets';
import { useIconOverride } from './IconOverrides';
import type { DataAttributes } from '../types';

export interface IconProps extends DataAttributes {
  /** Semantic name from the active icon set. */
  name: IconName;
  /** Accessible name for a meaningful icon. Omit when the icon sits beside words that say the same thing. */
  label?: string;
  /** Size by context: `sm` inside small text, `md` beside body text and in controls, `lg` standalone. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Draws from this library and style instead of the active one: only for showing libraries side by side (the Icon page's set cards). */
  from?: IconChoice;
}

const draw = (nodes: IconNode[]): ReactNode[] => nodes.map(([tag, attrs, kids], i) => createElement(tag, { key: i, ...attrs }, kids ? draw(kids) : undefined));

// Q165: a glyph's ink box (its drawn bounds with the stroke, as fractions of the frame), measured once per glyph, for the
// controls that place an icon at their edge by its ink rather than its frame.
const inks = new WeakMap<object, { w: number; h: number; x: number; y: number }>();
const EDGE = "[data-dl='select'], [data-dl='text-field'], [data-dl='number-field'], [data-dl='menu-button']";
const measureInk = (key: object | undefined) => (el: SVGSVGElement | null) => {
  if (!el || !key || !el.closest(EDGE)) return;
  let ink = inks.get(key);
  if (!ink) {
    try {
      const vb = el.viewBox.baseVal;
      const b = el.getBBox();
      if (!vb?.width || !b.width) return;
      const paint = getComputedStyle(el.querySelector('path, circle, rect, line, polyline, polygon, ellipse') ?? el);
      const stroke = paint.stroke !== 'none' ? parseFloat(paint.strokeWidth) || 0 : 0;
      ink = {
        w: Math.min(1, (b.width + stroke) / vb.width),
        h: Math.min(1, (b.height + stroke) / vb.height),
        x: (b.x + b.width / 2 - (vb.x + vb.width / 2)) / vb.width,
        y: (b.y + b.height / 2 - (vb.y + vb.height / 2)) / vb.height,
      };
      inks.set(key, ink);
    } catch {
      return;
    }
  }
  el.style.setProperty('--ink-w', ink.w.toFixed(4));
  el.style.setProperty('--ink-h', ink.h.toFixed(4));
  el.style.setProperty('--ink-x', ink.x.toFixed(4));
  el.style.setProperty('--ink-y', ink.y.toFixed(4));
};

/**
 * Shows one semantic icon from the active set, drawn in the current text colour. The library's own outline set is the
 * default; a theme can draw the same names from a curated MIT or Apache-2.0 library (`setIconSet`, owner Q36), and a
 * name that library lacks falls back to its first style, then to the library's own.
 * Not for decoration, and never the only label of a control without an accessible name.
 * @tier fundamental
 * @family text
 * @a11y Decorative by default (`aria-hidden`); with `label` it becomes `role="img"` with that name.
 * Icons that point along the reading direction mirror in right-to-left contexts, whichever set draws them.
 */
export function Icon({ name, label, size = 'md', from, ...data }: IconProps) {
  useIconSetVersion();
  const icon: { d: string; flipInRtl?: boolean; fill?: string; accent?: string; accentFill?: string } | undefined = (icons as Record<string, { d: string; flipInRtl?: boolean; fill?: string; accent?: string; accentFill?: string } | undefined>)[name];
  // Q113: a brand's glyph for this name (nearest IconOverrides, then site-wide) wins over the set; `from` shows a set as it is.
  const brand = useIconOverride(name);
  const set = !from && brand ? { glyph: brand, fallback: false } : glyphFor(name, from);
  const common = {
    ...data,
    'data-dl': 'icon',
    'data-size': size,
    'data-flip': icon?.flipInRtl ? '' : undefined,
    focusable: 'false' as const,
    ...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }),
  };
  if (set) {
    return (
      <svg {...common} ref={measureInk(set.glyph)} data-set="" viewBox={set.glyph.v}>
        <g {...set.glyph.g}>{draw(set.glyph.c)}</g>
      </svg>
    );
  }
  if (!icon) {
    return <svg {...common} viewBox="0 0 24 24" />;
  }
  return (
    <svg {...common} ref={measureInk(icon)} viewBox="0 0 24 24">
      <path d={icon.d} />
      {icon.fill && <path data-dl-part="fill" d={icon.fill} />}
      {icon.accentFill && <path data-dl-part="accent-fill" d={icon.accentFill} />}
      {icon.accent && <path data-dl-part="accent" d={icon.accent} />}
    </svg>
  );
}