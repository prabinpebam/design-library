/**
 * A Box's layout styles, Webflow's way (LR156, DesignUp): values per breakpoint that cascade, Webflow's
 * Style panel sections Layout, Spacing, Size and Position, values with units or a design-token preset. Plain data and
 * plain functions (no React): the check, the cascade (a value and where it comes from) and the CSS a page's Boxes
 * draw with. Part of `@design-library/core/page-box` (page-box-model.mjs re-exports it).
 *
 * Breakpoints (Webflow's): Desktop is the base and applies everywhere; Tablet (991 px and down), Mobile landscape (767
 * and down) and Mobile portrait (478 and down) cascade down; the larger ones (1280, 1440, 1920 and up) cascade up.
 *
 * Presets resolve to core's space tokens (`--space-*`, tokens.css).
 *
 * A length is `'<number><unit>'` (px, rem, em, %, vw, vh, svh, dvh, ch; fr in grid tracks), `'0'`, `'auto'` where
 * Webflow offers Auto, or a preset `'$<step>'`: the spacing scale (`$1` to `$32`, `$0-5`) and its semantic steps
 * (`$pair`, `$row`, `$item`, `$group`, `$section`, `$page` for space between; `$gutter`, `$margin`), as Webflow's
 * 0-220 presets are its spacing steps. The page's own steps (`$small`, `$frame`, `$split`, `$stacked`, LR162) are
 * PageGrid's row steps, so a page laid out as Boxes keeps its grid's rhythm.
 *
 * @typedef {'main' | 'large' | 'xl' | 'xxl' | 'tablet' | 'landscape' | 'portrait'} BoxBreakpoint
 * @typedef {Record<string, string | number>} BoxStyle
 * @typedef {Partial<Record<BoxBreakpoint, BoxStyle>>} BoxStyles
 */

/** Webflow's breakpoints in cascade order: the base, the larger ones up, then the smaller ones down. */
export const BOX_BREAKPOINTS = [
  { id: 'main', label: 'Desktop', query: null, width: 1280 },
  { id: 'large', label: '1280 and up', query: '(min-width: 1280px)', min: 1280, width: 1280, optional: true },
  { id: 'xl', label: '1440 and up', query: '(min-width: 1440px)', min: 1440, width: 1440, optional: true },
  { id: 'xxl', label: '1920 and up', query: '(min-width: 1920px)', min: 1920, width: 1920, optional: true },
  { id: 'tablet', label: 'Tablet', query: '(max-width: 991px)', max: 991, width: 768 },
  { id: 'landscape', label: 'Mobile landscape', query: '(max-width: 767px)', max: 767, width: 568 },
  { id: 'portrait', label: 'Mobile portrait', query: '(max-width: 478px)', max: 478, width: 375 },
];
const BREAKPOINT_IDS = BOX_BREAKPOINTS.map(bp => bp.id);

/** The breakpoints a value at `bp` comes from, nearest last: the base, then each step towards `bp`. */
export function boxCascade(bp) {
  const at = BOX_BREAKPOINTS.find(one => one.id === bp);
  if (!at) return [];
  if (at.id === 'main') return ['main'];
  const side = at.max !== undefined ? BOX_BREAKPOINTS.filter(one => one.max !== undefined && one.max >= at.max) : BOX_BREAKPOINTS.filter(one => one.min !== undefined && one.min <= at.min);
  return ['main', ...side.map(one => one.id)];
}

/**
 * A property's value at a breakpoint and where it comes from (Webflow's "value comes from"): `from` is the breakpoint
 * that sets it (`bp` itself: set here; another: inherited), undefined when nothing sets it.
 * @returns {{ value: string | number | undefined, from: BoxBreakpoint | undefined }}
 */
export function boxValue(styles, bp, prop) {
  let found = { value: undefined, from: undefined };
  for (const one of boxCascade(bp)) if (styles?.[one]?.[prop] !== undefined) found = { value: styles[one][prop], from: one };
  return found;
}

const TOKEN_STEPS = {
  pair: 'stack-pair', row: 'stack-row', item: 'stack-item', group: 'stack-group', section: 'stack-section', page: 'stack-page',
  gutter: 'gutter', margin: 'margin-page', '0-5': '0-5', 1: '1', 2: '2', 3: '3', 4: '4', 6: '6', 8: '8', 12: '12', 16: '16', 24: '24', 32: '32',
};
/** The preset steps a length field offers, in order (Webflow's presets popover). */
export const BOX_PRESETS = ['$item', '$group', '$section', '$page', '$gutter', '$1', '$2', '$3', '$4', '$6', '$8', '$12', '$16', '$24', '$32'];
export const BOX_UNITS = ['px', 'rem', 'em', '%', 'vw', 'vh', 'svh', 'dvh', 'ch'];

const NUMBER = '-?(?:\\d+|\\d*\\.\\d+)';
const LENGTH = new RegExp(`^(?:${NUMBER}(?:${BOX_UNITS.join('|')})|0)$`);
const TRACK_UNIT = new RegExp(`^(?:${NUMBER}(?:${[...BOX_UNITS, 'fr'].join('|')})|0|auto|min-content|max-content)$`);
/**
 * The page's own steps (LR162), as a page grid spaces its rows, so a page laid out as Boxes keeps its grid's rhythm: a
 * framed group's step, the small step, a split's gutter and a stack's gap. Their settings are PageGrid's.
 */
const PAGE_STEPS = { frame: '--c-page-grid-frame-gap', small: '--c-page-grid-gap-item', split: '--c-page-grid-split-gutter', stacked: '--c-page-grid-stack-gap' };
/** The page steps a length field offers after the presets (LR162). */
export const BOX_PAGE_PRESETS = ['$small', '$frame', '$split', '$stacked'];
const preset = value => typeof value === 'string' && value.startsWith('$') && (Object.hasOwn(TOKEN_STEPS, value.slice(1)) || Object.hasOwn(PAGE_STEPS, value.slice(1)));

const isLength = (value, { auto = false, none = false, negative = true } = {}) => typeof value === 'string'
  && (preset(value) || (auto && value === 'auto') || (none && value === 'none') || (LENGTH.test(value) && (negative || !value.startsWith('-'))));
const oneOf = list => value => list.includes(value);
const lengthOf = options => value => isLength(value, options);
const integer = (min, max) => value => Number.isInteger(value) && value >= min && value <= max;
/** A grid track: a length, fr, auto, min/max-content, or minmax(a, b) of two of those. */
const track = value => {
  if (typeof value !== 'string') return false;
  const minmax = /^minmax\(([^,()]+),\s*([^,()]+)\)$/.exec(value);
  return minmax ? [minmax[1], minmax[2]].every(part => TRACK_UNIT.test(part.trim()) || preset(part.trim())) : TRACK_UNIT.test(value) || preset(value);
};
const tracks = value => Array.isArray(value) && value.length >= 1 && value.length <= 24 && value.every(track);
const ALIGN = ['flex-start', 'center', 'flex-end', 'stretch', 'baseline', 'start', 'end'];
const JUSTIFY = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly', 'start', 'end', 'stretch'];

/**
 * Every property a Box style takes, by Style panel section, with its check and its CSS property. Order is the panel's.
 * Child placement (grid area, flex child, order, align self) sits with Layout, as Webflow shows it on the child.
 */
export const BOX_PROPERTIES = {
  // Layout
  display: { section: 'layout', css: 'display', ok: oneOf(['block', 'flex', 'grid', 'none', 'inline-block', 'inline-flex', 'inline-grid', 'inline']) },
  flexDirection: { section: 'layout', css: 'flex-direction', ok: oneOf(['row', 'row-reverse', 'column', 'column-reverse']) },
  flexWrap: { section: 'layout', css: 'flex-wrap', ok: oneOf(['nowrap', 'wrap', 'wrap-reverse']) },
  alignItems: { section: 'layout', css: 'align-items', ok: oneOf(ALIGN) },
  justifyContent: { section: 'layout', css: 'justify-content', ok: oneOf(JUSTIFY) },
  alignContent: { section: 'layout', css: 'align-content', ok: oneOf([...JUSTIFY, 'stretch']) },
  justifyItems: { section: 'layout', css: 'justify-items', ok: oneOf(['start', 'center', 'end', 'stretch']) },
  gap: { section: 'layout', css: 'gap', ok: lengthOf({ negative: false }) },
  rowGap: { section: 'layout', css: 'row-gap', ok: lengthOf({ negative: false }) },
  columnGap: { section: 'layout', css: 'column-gap', ok: lengthOf({ negative: false }) },
  gridColumns: { section: 'layout', css: 'grid-template-columns', ok: tracks, value: list => list.map(trackCss).join(' ') },
  gridRows: { section: 'layout', css: 'grid-template-rows', ok: tracks, value: list => list.map(trackCss).join(' ') },
  gridAutoFlow: { section: 'layout', css: 'grid-auto-flow', ok: oneOf(['row', 'column', 'row dense', 'column dense']) },
  gridColumnStart: { section: 'layout', css: 'grid-column-start', ok: integer(1, 25) },
  gridColumnSpan: { section: 'layout', css: 'grid-column-end', ok: integer(1, 24), value: n => `span ${n}` },
  gridRowStart: { section: 'layout', css: 'grid-row-start', ok: integer(1, 50) },
  gridRowSpan: { section: 'layout', css: 'grid-row-end', ok: integer(1, 50), value: n => `span ${n}` },
  alignSelf: { section: 'layout', css: 'align-self', ok: oneOf(['auto', ...ALIGN]) },
  justifySelf: { section: 'layout', css: 'justify-self', ok: oneOf(['auto', 'start', 'center', 'end', 'stretch']) },
  order: { section: 'layout', css: 'order', ok: integer(-99, 999) },
  flexGrow: { section: 'layout', css: 'flex-grow', ok: integer(0, 99) },
  flexShrink: { section: 'layout', css: 'flex-shrink', ok: integer(0, 99) },
  flexBasis: { section: 'layout', css: 'flex-basis', ok: lengthOf({ auto: true, negative: false }) },
  // Spacing
  marginTop: { section: 'spacing', css: 'margin-top', ok: lengthOf({ auto: true }) },
  marginRight: { section: 'spacing', css: 'margin-right', ok: lengthOf({ auto: true }) },
  marginBottom: { section: 'spacing', css: 'margin-bottom', ok: lengthOf({ auto: true }) },
  marginLeft: { section: 'spacing', css: 'margin-left', ok: lengthOf({ auto: true }) },
  paddingTop: { section: 'spacing', css: 'padding-top', ok: lengthOf({ negative: false }) },
  paddingRight: { section: 'spacing', css: 'padding-right', ok: lengthOf({ negative: false }) },
  paddingBottom: { section: 'spacing', css: 'padding-bottom', ok: lengthOf({ negative: false }) },
  paddingLeft: { section: 'spacing', css: 'padding-left', ok: lengthOf({ negative: false }) },
  // Size
  width: { section: 'size', css: 'width', ok: lengthOf({ auto: true, negative: false }) },
  height: { section: 'size', css: 'height', ok: lengthOf({ auto: true, negative: false }) },
  minWidth: { section: 'size', css: 'min-width', ok: lengthOf({ auto: true, negative: false }) },
  minHeight: { section: 'size', css: 'min-height', ok: lengthOf({ auto: true, negative: false }) },
  maxWidth: { section: 'size', css: 'max-width', ok: lengthOf({ none: true, negative: false }) },
  maxHeight: { section: 'size', css: 'max-height', ok: lengthOf({ none: true, negative: false }) },
  overflow: { section: 'size', css: 'overflow', ok: oneOf(['visible', 'hidden', 'scroll', 'auto']) },
  aspectRatio: { section: 'size', css: 'aspect-ratio', ok: value => typeof value === 'string' && /^(?:auto|\d{1,4}(?:\s*\/\s*\d{1,4})?)$/.test(value) },
  boxSizing: { section: 'size', css: 'box-sizing', ok: oneOf(['border-box', 'content-box']) },
  // Position
  position: { section: 'position', css: 'position', ok: oneOf(['static', 'relative', 'absolute', 'fixed', 'sticky']) },
  top: { section: 'position', css: 'top', ok: lengthOf({ auto: true }) },
  right: { section: 'position', css: 'right', ok: lengthOf({ auto: true }) },
  bottom: { section: 'position', css: 'bottom', ok: lengthOf({ auto: true }) },
  left: { section: 'position', css: 'left', ok: lengthOf({ auto: true }) },
  zIndex: { section: 'position', css: 'z-index', ok: integer(-999, 9999) },
  float: { section: 'position', css: 'float', ok: oneOf(['none', 'left', 'right']) },
  clear: { section: 'position', css: 'clear', ok: oneOf(['none', 'left', 'right', 'both']) },
};

/** A length or track as CSS: a preset is its token. */
function lengthCss(value) {
  if (!preset(value)) return String(value);
  const step = value.slice(1);
  return Object.hasOwn(PAGE_STEPS, step) ? `var(${PAGE_STEPS[step]})` : `var(--space-${TOKEN_STEPS[step]})`;
}
function trackCss(value) {
  const minmax = /^minmax\(([^,()]+),\s*([^,()]+)\)$/.exec(value);
  return minmax ? `minmax(${lengthCss(minmax[1].trim())}, ${lengthCss(minmax[2].trim())})` : lengthCss(value);
}

/** What's wrong with a Box's styles (an unknown breakpoint or property, a value its property doesn't take). */
export function boxStyleProblems(styles, at = '/styles') {
  if (styles === undefined) return [];
  if (!styles || typeof styles !== 'object' || Array.isArray(styles)) return [{ at, what: 'styles are values by breakpoint' }];
  const issues = [];
  for (const [bp, values] of Object.entries(styles)) {
    if (!BREAKPOINT_IDS.includes(bp)) { issues.push({ at: `${at}/${bp}`, what: `a breakpoint is one of ${BREAKPOINT_IDS.join(', ')}` }); continue; }
    if (!values || typeof values !== 'object' || Array.isArray(values)) { issues.push({ at: `${at}/${bp}`, what: 'a breakpoint holds property values' }); continue; }
    for (const [prop, value] of Object.entries(values)) {
      const spec = BOX_PROPERTIES[prop];
      if (!spec) issues.push({ at: `${at}/${bp}/${prop}`, what: `${prop} isn't a layout property` });
      else if (!spec.ok(value)) issues.push({ at: `${at}/${bp}/${prop}`, what: `${prop} doesn't take ${JSON.stringify(value)}` });
    }
  }
  return issues;
}

/** One breakpoint's declarations for a Box. */
function declarations(values) {
  return Object.entries(values).filter(([prop]) => BOX_PROPERTIES[prop]).map(([prop, value]) => {
    const spec = BOX_PROPERTIES[prop];
    return `${spec.css}:${spec.value ? spec.value(value) : typeof value === 'number' ? String(value) : lengthCss(value)}`;
  }).join(';');
}

/**
 * The CSS a list of Boxes draws with: each styled Box's values, breakpoint by breakpoint in cascade order, on
 * `[data-box="<id>"]` inside `scope` (a selector for the page's root). Only checked values are written; a Box whose
 * styles have problems draws none of them.
 * @param {{ id: string, styles?: BoxStyles, children?: unknown[] }[]} boxes
 */
export function boxCss(boxes, scope = '') {
  const rules = new Map(BOX_BREAKPOINTS.map(bp => [bp.id, []]));
  const visit = box => {
    if (box?.styles && /^[A-Za-z][\w-]*$/.test(box.id ?? '') && !boxStyleProblems(box.styles).length) {
      for (const [bp, values] of Object.entries(box.styles)) {
        const body = declarations(values);
        if (body) rules.get(bp).push(`${scope ? `${scope} ` : ''}[data-box="${box.id}"]{${body}}`);
      }
    }
    (box?.children ?? []).forEach(visit);
  };
  boxes.forEach(visit);
  const sheet = BOX_BREAKPOINTS.map(bp => {
    const list = rules.get(bp.id);
    if (!list.length) return '';
    return bp.query ? `@media ${bp.query}{${list.join('')}}` : list.join('');
  }).filter(Boolean);
  // An entry (a block or fundamental) is fluid, sized by its container (container queries), so it has no width of its own
  // to shrink to: it shares a flex row and fills a column, block or grid area. A Box's own values come after and win.
  return sheet.length ? [`${scope ? `${scope} ` : ''}[data-box-entry]{flex:1 1 0%;min-width:0;width:100%}`, ...sheet].join('\n') : '';
}
