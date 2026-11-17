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
type Ink = { w: number; h: number; x: number; y: number };
const inks = new WeakMap<object, Ink>();
const EDGE = "[data-dl='select'], [data-dl='text-field'], [data-dl='number-field'], [data-dl='menu-button']";
const setInk = (el: SVGSVGElement, ink: Ink) => {
  el.style.setProperty('--ink-w', ink.w.toFixed(4));
  el.style.setProperty('--ink-h', ink.h.toFixed(4));
  el.style.setProperty('--ink-x', ink.x.toFixed(4));
  el.style.setProperty('--ink-y', ink.y.toFixed(4));
  // Q171: a glyph that starts a dropdown's row (a MenuButton layer, a Select box) lends its ink height to that row, so the
  // chevron at the other end can sit as far from its edge as this glyph's ink sits from the leading one.
  const cell = el.parentElement?.matches("[data-dl-part='leading']") ? el.parentElement : el;
  const row = cell.parentElement;
  if (!cell.previousElementSibling && row?.matches("[data-dl-part='layer'], [data-dl-part='box']")) row.style.setProperty('--lead-ink-h', ink.h.toFixed(4));
};
/** Measures a drawn glyph; null while it has no box (inside a closed popup or a hidden panel). */
function inkOf(el: SVGSVGElement): Ink | null {
  try {
    const vb = el.viewBox.baseVal;
    const b = el.getBBox();
    if (!vb?.width || !b.width) return null;
    const paint = getComputedStyle(el.querySelector('path, circle, rect, line, polyline, polygon, ellipse') ?? el);
    const stroke = paint.stroke !== 'none' ? parseFloat(paint.strokeWidth) || 0 : 0;
    return {
      w: Math.min(1, (b.width + stroke) / vb.width),
      h: Math.min(1, (b.height + stroke) / vb.height),
      x: (b.x + b.width / 2 - (vb.x + vb.width / 2)) / vb.width,
      y: (b.y + b.height / 2 - (vb.y + vb.height / 2)) / vb.height,
    };
  } catch {
    return null;
  }
}
// Q170: a glyph not measured yet is measured once it has a box, after layout (a ResizeObserver), never during a render's
// commit: getBBox there forces the whole page's styles, and an icon in a closed popup has no box, so it was retried, and
// the page restyled, on every render of every control around it.
const waiting = new WeakMap<Element, object>();
let sizes: ResizeObserver | undefined;
const watch = (el: SVGSVGElement, key: object) => {
  sizes ??= new ResizeObserver((entries) => {
    for (const { target } of entries) {
      const glyph = waiting.get(target);
      if (!glyph) continue;
      const ink = inks.get(glyph) ?? inkOf(target as SVGSVGElement);
      if (!ink) continue;
      inks.set(glyph, ink);
      setInk(target as SVGSVGElement, ink);
      waiting.delete(target);
      sizes!.unobserve(target);
    }
  });
  waiting.set(el, key);
  sizes.observe(el);
};
// One ref per glyph, so React attaches it once per icon rather than again on every render.
const refs = new WeakMap<object, (el: SVGSVGElement | null) => (() => void) | void>();
const measureInk = (key: object | undefined) => {
  if (!key) return undefined;
  let ref = refs.get(key);
  if (!ref) {
    ref = (el) => {
      if (!el || typeof ResizeObserver === 'undefined' || !el.closest(EDGE)) return;
      const ink = inks.get(key);
      if (ink) return setInk(el, ink);
      watch(el, key);
      return () => {
        waiting.delete(el);
        sizes?.unobserve(el);
      };
    };
    refs.set(key, ref);
  }
  return ref;
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