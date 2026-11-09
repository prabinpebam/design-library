import { prefersReducedMotion } from './motion';

/**
 * Scrolls the site makes itself (IP17, F48, DR32): to an anchor, back to the top, to the first error in a form. A
 * glide eases on the motion tokens (`--duration-move-far` and `--easing-standard`), stops the moment the person
 * scrolls, touches, presses a key or a pointer (their input wins, never a fight over the page), and lands at once under
 * reduced motion or where the duration token is 0. Tier 0 behaviour, no styles; the router uses it for in-page links.
 *
 * It honours the target's `scroll-margin-block-start` and the region's `scroll-padding-block-start`, as the browser's
 * own `scrollIntoView` does, so a sticky header set once in CSS is respected by both.
 */
export type GlideOptions = {
  /** The scroll region. Default: the target's nearest scrolling ancestor, else the page. */
  container?: Element | null;
  /** Where the target lands in the region: `start` (default), `center`, `end`, or `nearest` (no move when it is already in view). */
  block?: 'start' | 'center' | 'end' | 'nearest';
  /** `instant` jumps whatever the setting; `auto` (default) glides unless reduced motion asks otherwise. */
  behavior?: 'auto' | 'instant';
};

/** How a glide ended: it arrived, the person's own input stopped it (or a newer glide replaced it), or it jumped. */
export type GlideResult = 'landed' | 'stopped' | 'jumped';

const STOP_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

let current: { stop: () => void } | null = null;

/** Stops the glide that is running, if any, where it is now. */
export function stopGlide() {
  current?.stop();
}

function isPage(el: Element) {
  return el === document.scrollingElement || el === document.documentElement || el === document.body;
}

/** The nearest ancestor that scrolls on the block axis, else the page. */
export function scrollRegionOf(el: Element): Element {
  for (let a = el.parentElement; a && !isPage(a); a = a.parentElement) {
    const y = getComputedStyle(a).overflowY;
    if ((y === 'auto' || y === 'scroll' || y === 'overlay') && a.scrollHeight > a.clientHeight) return a;
  }
  return document.scrollingElement ?? document.documentElement;
}

function px(value: string) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function ms(value: string, fallback: number) {
  const v = value.trim();
  if (!v) return fallback;
  return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
}

/** A CSS `cubic-bezier()` as a function of progress; anything else is the standard easing. */
function easingOf(value: string): (t: number) => number {
  const m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(value);
  const [x1, y1, x2, y2] = m ? m.slice(1).map(Number) : [0.2, 0, 0, 1];
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const slope = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(x1, x2, t);
      if (Math.abs(d) < 1e-6) break;
      t -= (at(x1, x2, t) - x) / d;
    }
    // Newton can leave the interval on steep curves: fall back to bisection.
    if (!(t >= 0 && t <= 1) || Math.abs(at(x1, x2, t) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 30; i++) {
        t = (lo + hi) / 2;
        if (at(x1, x2, t) < x) lo = t;
        else hi = t;
      }
    }
    return at(y1, y2, t);
  };
}

/** The scroll position that puts `target` where `block` asks, inside `region`, clamped to what the region can scroll. */
function positionFor(target: Element, region: Element, block: NonNullable<GlideOptions['block']>): number | null {
  const page = isPage(region);
  const top = page ? window.scrollY : region.scrollTop;
  const view = page ? window.innerHeight : region.clientHeight;
  const max = (page ? document.documentElement.scrollHeight : region.scrollHeight) - view;
  const regionTop = page ? 0 : region.getBoundingClientRect().top + region.clientTop;
  const r = target.getBoundingClientRect();
  const t = getComputedStyle(target);
  const regionStyle = getComputedStyle(page ? document.documentElement : region);
  const padStart = px(regionStyle.scrollPaddingBlockStart || regionStyle.scrollPaddingTop);
  const padEnd = px(regionStyle.scrollPaddingBlockEnd || regionStyle.scrollPaddingBottom);
  const start = r.top - regionTop + top - px(t.scrollMarginBlockStart || t.scrollMarginTop) - padStart;
  const end = r.bottom - regionTop + top + px(t.scrollMarginBlockEnd || t.scrollMarginBottom) + padEnd - view;
  let y: number;
  if (block === 'center') y = (start + end) / 2;
  else if (block === 'end') y = end;
  else if (block === 'nearest') {
    if (start >= top && end <= top) return null;
    y = start < top ? start : end;
  } else y = start;
  return Math.max(0, Math.min(max, y));
}

/**
 * Glides `to` an element (or a block position in px) in its scroll region. Resolves with how it ended. A second glide
 * stops the first; the person's wheel, touch, key or pointer stops it where it is.
 */
export function glide(to: Element | number, options: GlideOptions = {}): Promise<GlideResult> {
  stopGlide();
  const region = options.container ?? (typeof to === 'number' ? document.scrollingElement ?? document.documentElement : scrollRegionOf(to));
  const page = isPage(region);
  const set = (y: number) => (page ? window.scrollTo({ top: y, behavior: 'instant' }) : region.scrollTo({ top: y, behavior: 'instant' }));
  const from = page ? window.scrollY : region.scrollTop;
  const max = (page ? document.documentElement.scrollHeight - window.innerHeight : region.scrollHeight - region.clientHeight);
  const goal = typeof to === 'number' ? Math.max(0, Math.min(max, to)) : positionFor(to, region, options.block ?? 'start');
  if (goal === null || Math.abs(goal - from) < 1) return Promise.resolve('landed');
  const style = getComputedStyle(page ? document.documentElement : region);
  const duration = ms(style.getPropertyValue('--duration-move-far'), 300);
  if (options.behavior === 'instant' || prefersReducedMotion() || duration <= 0 || document.hidden) {
    set(goal);
    return Promise.resolve('jumped');
  }
  const ease = easingOf(style.getPropertyValue('--easing-standard'));
  return new Promise<GlideResult>((resolve) => {
    let frame = 0;
    const startAt = performance.now();
    const finish = (result: GlideResult) => {
      cancelAnimationFrame(frame);
      for (const type of STOP_EVENTS) window.removeEventListener(type, onInput, true);
      if (current === handle) current = null;
      resolve(result);
    };
    const onInput = () => finish('stopped');
    const handle = { stop: () => finish('stopped') };
    current = handle;
    for (const type of STOP_EVENTS) window.addEventListener(type, onInput, { capture: true, passive: true });
    const step = (now: number) => {
      const p = Math.min(1, (now - startAt) / duration);
      set(from + (goal - from) * ease(p));
      if (p < 1) frame = requestAnimationFrame(step);
      else finish('landed');
    };
    frame = requestAnimationFrame(step);
  });
}
