import { durationOf } from './flip';

/**
 * Motion suspension (Q65 P2, Z18, G4): a global switch (theme, contrast, space, shape, language direction) changes the
 * whole page at once. Without this, every element with a colour or size transition would fade on its own clock while
 * the rest snapped, so the page would shimmer through half-switched states. Tier 0 behaviour, no styles of its own:
 * `[data-motion="suspend"]` in motion.css turns transitions off below the root while the switch is applied.
 *
 * Call it around the change: the root is marked, the change applied, styles resolved once (so no transition can start
 * from the old values), then the mark is removed after the next frame. Loops (a spinner, a shimmer) keep running.
 */
export function suspendMotion(change: () => void, root: HTMLElement = document.documentElement) {
  root.dataset.motion = 'suspend';
  change();
  // Resolve styles now, with transitions off, so the switch lands in one frame.
  void root.offsetWidth;
  const release = () => {
    if (root.dataset.motion === 'suspend') delete root.dataset.motion;
  };
  // Two frames, so the frame after the switch paints with transitions still off; a tab that isn't painting runs no
  // frames, so a timer releases it too.
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(release);
  });
  window.setTimeout(() => {
    cancelAnimationFrame(frame);
    release();
  }, durationOf(root, '--duration-change'));
}

/** One named element for a view transition: what it is now (before the change) or after it. */
export type SharedName = [Element | null | undefined, string];

let running: { skipTransition: () => void } | null = null;

const CORNERS = [
  ['borderTopLeftRadius', 'left', 'top'],
  ['borderTopRightRadius', 'right', 'top'],
  ['borderBottomRightRadius', 'right', 'bottom'],
  ['borderBottomLeftRadius', 'left', 'bottom'],
] as const;

/** A computed corner radius in px (its first value; a percentage against the box's width). */
function radiusPx(value: string, width: number) {
  const first = value.split(' ')[0];
  return first.endsWith('%') ? (parseFloat(first) * width) / 100 : parseFloat(first) || 0;
}

/**
 * The corners an element is seen with (Q75): its own radius, or the inner radius of a clipping ancestor whose corner it
 * sits in (an image in a card's media is square; the card's clip rounds it). A view transition draws the element on its
 * own, outside those clips, so without this the corners are square while it travels and round again only when the live
 * page returns: the snap the owner saw.
 */
function cornersOf(el: HTMLElement): string {
  const box = el.getBoundingClientRect();
  const own = getComputedStyle(el);
  const radii = CORNERS.map(([prop]) => radiusPx(own[prop], box.width));
  for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
    const cs = getComputedStyle(a);
    if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
    const r = a.getBoundingClientRect();
    const border = { left: parseFloat(cs.borderLeftWidth), right: parseFloat(cs.borderRightWidth), top: parseFloat(cs.borderTopWidth), bottom: parseFloat(cs.borderBottomWidth) };
    const inner = { left: r.left + border.left, right: r.right - border.right, top: r.top + border.top, bottom: r.bottom - border.bottom };
    CORNERS.forEach(([prop, x, y], i) => {
      if (Math.abs(inner[x] - box[x]) > 1.5 || Math.abs(inner[y] - box[y]) > 1.5) return;
      radii[i] = Math.max(radii[i], radiusPx(cs[prop], r.width) - Math.min(border[x], border[y]));
    });
  }
  return radii.map((v) => `${Math.max(0, v)}px`).join(' ');
}

/**
 * A shared-element change (Q65 P7, strategy S6, C10): the elements named on both sides travel from their old place
 * and size to their new ones while the rest cross-fades. `update` must change the DOM synchronously (in React, wrap
 * the state change in `flushSync`). `from` names the elements as they are now; `to` names them once `update` has run.
 * Names exist only for the transition's life, so two changes never collide.
 *
 * - Where the View Transitions API is missing, `update` simply runs (MA3: no travel, nothing breaks).
 * - Reduced motion: no names are set, so the views only cross-fade (`duration.shared` is 0 there; the pair fades on
 *   `duration.change`, motion.css).
 * - A second change while one plays skips the first to its end and starts from there (never two at once).
 * - Corners (Q75): a named element keeps the corners it is seen with all the way: its group clips to them and eases
 *   from the old radius to the new, so nothing rounds or squares off when the live page returns.
 * - Timings come from the tokens through motion.css (`::view-transition-*`), and the overlay lets pointer events
 *   through to the page underneath (MA6, not yet checked in every engine).
 */
export function viewTransition(update: () => void, options: { from?: () => SharedName[]; to?: () => SharedName[] } = {}): Promise<void> {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void } };
  if (typeof doc.startViewTransition !== 'function' || document.hidden) {
    update();
    return Promise.resolve();
  }
  running?.skipTransition();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce';
  const named: HTMLElement[] = [];
  // Each name's corners before and after the change (Q75), so its group can round them all the way.
  const corners = new Map<string, { from?: string; to?: string }>();
  const name = (pairs: SharedName[] = [], side: 'from' | 'to') => {
    if (reduce) return;
    for (const [el, n] of pairs) {
      if (!(el instanceof HTMLElement)) continue;
      el.style.viewTransitionName = n;
      named.push(el);
      corners.set(n, { ...corners.get(n), [side]: cornersOf(el) });
    }
  };
  const rounded = (n: string) => {
    const c = corners.get(n);
    return !!c && /[1-9]/.test(`${c.from ?? ''}${c.to ?? ''}`);
  };
  const clear = () => {
    while (named.length) {
      const el = named.pop()!;
      el.style.viewTransitionName = '';
      el.style.removeProperty('view-transition-class');
    }
  };
  name(options.from?.(), 'from');
  for (const el of named) if (rounded(el.style.viewTransitionName)) el.style.setProperty('view-transition-class', 'dl-rounded');
  const transition = doc.startViewTransition(() => {
    clear();
    update();
    name(options.to?.(), 'to');
    for (const el of named) if (rounded(el.style.viewTransitionName)) el.style.setProperty('view-transition-class', 'dl-rounded');
  });
  running = transition;
  // A transition the browser can't run (a hidden tab, a second one) still applies the update; nothing to report.
  transition.ready
    .then(() => {
      // The group's corners ease from the old radius to the new one on the group's own clock (its duration and easing
      // come from motion.css, read off the browser's own animation of that group), and it clips what it holds.
      const animations = document.documentElement.getAnimations({ subtree: true });
      for (const [n, c] of corners) {
        if (!rounded(n)) continue;
        const pseudoElement = `::view-transition-group(${n})`;
        const group = animations.find((a) => (a.effect as KeyframeEffect | null)?.pseudoElement === pseudoElement)?.effect as KeyframeEffect | undefined;
        if (!group) continue;
        const timing = group.getTiming();
        // A CSS animation carries its timing function on its keyframes, not on the effect.
        const easing = group.getKeyframes()[0]?.easing ?? timing.easing;
        const from = c.from ?? c.to!;
        const to = c.to ?? c.from!;
        const corner = document.documentElement.animate({ borderRadius: [from, to] }, { pseudoElement, duration: timing.duration, easing, delay: timing.delay, fill: 'both' });
        transition.finished.finally(() => corner.cancel());
      }
    })
    .catch(() => undefined);
  return transition.finished.finally(() => {
    clear();
    if (running === transition) running = null;
  });
}
