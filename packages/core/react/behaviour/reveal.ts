/**
 * The reveal hook (MP11, ID27): a site draws its own change between a picture and its pair (a wipe, a stipple); the
 * library owns when (the picture, or the link, button or card around it, hovered or focused), how long
 * (`--c-image-reveal-duration` on the standard easing) and reduced motion (no drawing: the crossfade instead).
 */
import { useEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from './motion';

export interface PictureRevealFrame {
  /** The canvas over the picture, cleared before each call and scaled so one unit is one CSS pixel. */
  context: CanvasRenderingContext2D;
  /** The picture's size in CSS pixels. */
  width: number;
  height: number;
  /** 0 at rest (the picture) to 1 (its pair), eased on the standard curve; it runs back down when the pointer or focus leaves. */
  progress: number;
  /** Whether the picture is heading to its pair (hovered or focused) or back. */
  active: boolean;
  /** Milliseconds since the reveal began, for drawing that moves on its own (a stipple's drift). */
  time: number;
  /** Draws the picture (`'picture'`) or its pair (`'alternate'`) fitted as the frame shows it (cover or contain, focal point). */
  paint: (which: 'picture' | 'alternate') => void;
}

/** Draws one frame of a reveal: called by the library on every animation frame while the reveal runs. */
export type PictureReveal = (frame: PictureRevealFrame) => void;

const ms = (v: string, fallback: number) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? (v.trim().endsWith('s') && !v.trim().endsWith('ms') ? n * 1000 : n) : fallback;
};

/** A cubic-bezier easing as a function of time (0–1), solved by bisection: the CSS curve, read from a token. */
function curve(value: string): (t: number) => number {
  const m = /cubic-bezier\(([^)]+)\)/.exec(value);
  const [x1, y1, x2, y2] = m ? m[1].split(',').map(Number) : [0.2, 0, 0, 1];
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  return (t) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < t) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

/** Where an image sits in a box, as object-fit and object-position would place it. */
function fitted(img: HTMLImageElement, w: number, h: number, fit: 'cover' | 'contain', focal: { x: number; y: number }) {
  const iw = img.naturalWidth || w;
  const ih = img.naturalHeight || h;
  const s = fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  return { x: (w - dw) * focal.x, y: (h - dh) * focal.y, w: dw, h: dh };
}

/**
 * Runs a reveal on the canvas over a frame. Returns whether it draws (`drawing`; false: none given, reduced motion, or
 * the pair not yet loaded), so the frame keeps the crossfade otherwise, and whether it will once the pair is in (`owns`).
 */
export function useReveal(
  frame: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLCanvasElement | null>,
  options: { reveal?: PictureReveal; picture: () => HTMLImageElement | null; alternate: () => HTMLImageElement | null; ready: boolean; fit: 'cover' | 'contain'; focal?: { x: number; y: number } },
): { drawing: boolean; owns: boolean } {
  const { reveal, ready } = options;
  const latest = useRef(options);
  latest.current = options;
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (!reveal) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(prefersReducedMotion());
    update();
    media.addEventListener('change', update);
    // The library's own setting (data-motion on the root) can change too.
    const watch = new MutationObserver(update);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    return () => {
      media.removeEventListener('change', update);
      watch.disconnect();
    };
  }, [reveal]);

  const drawing = !!reveal && ready && !reduce;

  useEffect(() => {
    const frameEl = frame.current;
    const canvasEl = canvas.current;
    if (!drawing || !frameEl || !canvasEl) return;
    const area = frameEl.closest<HTMLElement>('a[href], button, [data-dl="card"], [data-tone-area]') ?? frameEl;
    const style = getComputedStyle(frameEl);
    const duration = ms(style.getPropertyValue('--c-image-reveal-duration'), 400);
    const ease = curve(style.getPropertyValue('--easing-standard'));
    let hovered = false;
    let focused = false;
    let linear = 0;
    let started = 0;
    let last = 0;
    let raf = 0;

    const draw = (now: number) => {
      const { reveal: fn, picture, alternate, fit, focal } = latest.current;
      const from = picture();
      const to = alternate();
      const context = canvasEl.getContext('2d');
      if (!fn || !from || !to || !context) return;
      const w = frameEl.clientWidth;
      const h = frameEl.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      if (canvasEl.width !== Math.round(w * dpr) || canvasEl.height !== Math.round(h * dpr)) {
        canvasEl.width = Math.round(w * dpr);
        canvasEl.height = Math.round(h * dpr);
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, w, h);
      const spot = focal ?? { x: 0.5, y: 0.5 };
      const paint = (which: 'picture' | 'alternate') => {
        const img = which === 'picture' ? from : to;
        const box = fitted(img, w, h, fit, spot);
        context.drawImage(img, box.x, box.y, box.w, box.h);
      };
      fn({ context, width: w, height: h, progress: ease(linear), active: hovered || focused, time: now - started, paint });
    };

    const step = (now: number) => {
      const target = hovered || focused ? 1 : 0;
      const dt = last ? now - last : 0;
      last = now;
      linear = target > linear ? Math.min(1, linear + dt / duration) : Math.max(0, linear - dt / duration);
      canvasEl.toggleAttribute('data-on', linear > 0);
      draw(now);
      if (linear !== target) raf = requestAnimationFrame(step);
      else {
        raf = 0;
        last = 0;
      }
    };
    const kick = () => {
      if (!started || linear === 0) started = performance.now();
      if (!raf) raf = requestAnimationFrame(step);
    };
    const enter = () => ((hovered = true), kick());
    const leave = () => ((hovered = false), kick());
    const focusIn = () => ((focused = true), kick());
    const focusOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && area.contains(e.relatedTarget)) return;
      focused = false;
      kick();
    };
    hovered = area.matches(':hover');
    focused = area.matches(':focus-within');
    if (hovered || focused) kick();
    area.addEventListener('pointerenter', enter);
    area.addEventListener('pointerleave', leave);
    area.addEventListener('focusin', focusIn);
    area.addEventListener('focusout', focusOut);
    return () => {
      cancelAnimationFrame(raf);
      canvasEl.removeAttribute('data-on');
      area.removeEventListener('pointerenter', enter);
      area.removeEventListener('pointerleave', leave);
      area.removeEventListener('focusin', focusIn);
      area.removeEventListener('focusout', focusOut);
    };
  }, [drawing, frame, canvas]);

  // `owns`: a reveal will draw the change (given, motion allowed), so a picture's tone holds at rest meanwhile (G4).
  return { drawing, owns: !!reveal && !reduce };
}
