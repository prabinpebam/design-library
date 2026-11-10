import { Children, cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode, type SVGProps } from 'react';
import { prefersReducedMotion } from '../behaviour/motion';
import { useRegionScheme } from '../behaviour/region-scheme';
import { cleanSvg } from '../behaviour/svg-clean';
import { Button } from './Button';
import type { DataAttributes } from '../types';

/** The art's size groups by the illustration's own width (ID42): below 24rem, 24 to 48rem, 48rem and wider. */
export type IllustrationSize = 'compact' | 'regular' | 'wide';

/** A file per size, for art that can't share one file; a size left out falls back to the nearest one given. */
export type IllustrationFiles = Partial<Record<IllustrationSize, string>>;

/** When an illustration's motion parts play (ID43). */
export type IllustrationPlay = 'once' | 'hover' | 'loop';

interface IllustrationBase extends DataAttributes {
  /** The art written in code: one `<svg>` with a `viewBox`, its shapes coloured by the role classes. */
  children?: ReactNode;
  /** A same-origin `.svg` file (or one per size), fetched and cleaned before it's drawn inline. */
  src?: string | IllustrationFiles;
  /** A file for the dark scheme, only for art that can't follow the role classes (MP17's rule: same shape). */
  dark?: string;
  /**
   * The frame's shape. `natural` (default) takes the art's own `viewBox`; give a ratio for a file, so its space is held
   * before it arrives.
   */
  ratio?: 'natural' | 'ultrawide' | 'wide' | 'photo' | 'classic' | 'square' | 'portrait';
  /** How the art meets the frame: `contain` (default) shows all of it; `cover` fills the frame and trims the overflow. */
  fit?: 'contain' | 'cover';
  /**
   * When parts marked `data-motion` move: `once` (default) the first time it comes into view; `hover` while it, or the
   * link, button or card around it, is pointed at or focused; `loop` while in view, always with a Pause control. Under
   * reduced motion nothing moves and every part holds its resting frame.
   */
  play?: IllustrationPlay;
}

export type IllustrationProps = IllustrationBase &
  (
    | { /** What the illustration shows, for one that carries meaning (`role="img"`). */ label: string; decorative?: never }
    | { label?: never; /** Hidden from screen readers: the words beside it say everything. */ decorative: true }
  );

const SIZE_AT = (rem: number): IllustrationSize => (rem < 24 ? 'compact' : rem < 48 ? 'regular' : 'wide');
const ORDER: IllustrationSize[] = ['compact', 'regular', 'wide'];
const fileFor = (files: IllustrationFiles, size: IllustrationSize) => {
  const at = ORDER.indexOf(size);
  // The size asked for, then smaller ones, then larger ones.
  for (const s of [...ORDER.slice(0, at + 1).reverse(), ...ORDER.slice(at + 1)]) if (files[s]) return files[s];
  return undefined;
};
const viewBoxRatio = (vb: string | null | undefined) => {
  const [, , w, h] = (vb ?? '').split(/[\s,]+/).map(Number);
  return w > 0 && h > 0 ? `${w} / ${h}` : undefined;
};
const cache = new Map<string, Promise<string>>();
const fetchText = (url: string) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status))))));
  return cache.get(url)!;
};

/**
 * Drawn art, inline: an SVG whose colours come from five role classes (`ink`, `muted`, `fill`, `surface`, `accent`) on
 * tokens, so one file follows light, dark and more contrast; whose groups marked `data-size` show by the
 * illustration's own width; and whose parts marked `data-motion` (`float`, `pulse`, `draw`, `fade`, `spin`) move on the
 * motion tokens. For photos and art that can't follow tokens, use `Image`.
 * @tier fundamental
 * @family media
 * @a11y With `label` it is `role="img"` with that name; with `decorative` it is hidden from screen readers. The art
 * itself is never focusable. Motion stops under reduced motion (the resting frame); a loop always has a visible Pause
 * control (WCAG 2.2.2) and stops off screen.
 */
export function Illustration({ children, src, dark, ratio = 'natural', fit = 'contain', play = 'once', label, decorative, ...data }: IllustrationProps) {
  const frame = useRef<HTMLSpanElement>(null);
  const art = useRef<HTMLSpanElement>(null);
  const prefix = `dl-ill-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const region = useRegionScheme(frame, !!dark);
  const [size, setSize] = useState<IllustrationSize>('regular');
  const [markup, setMarkup] = useState<{ html: string; ratio?: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [motionParts, setMotionParts] = useState(false);
  const [state, setState] = useState<'rest' | 'ready' | 'run'>('rest');
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());

  // The illustration's own width picks its size: the groups inside one file (data-width) and a file per size.
  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const watch = new ResizeObserver(([entry]) => setSize(SIZE_AT(entry.contentRect.width / rem)));
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const file = typeof src === 'string' ? (dark && region.scheme === 'dark' ? dark : src) : src ? fileFor(src, size) : undefined;
  useEffect(() => {
    if (!file) return;
    let live = true;
    setFailed(false);
    fetchText(file)
      .then((text) => {
        const svg = cleanSvg(text, prefix);
        if (!live) return;
        if (!svg) return setFailed(true);
        svg.setAttribute('preserveAspectRatio', fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('aria-hidden', 'true');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        setMarkup({ html: svg.outerHTML, ratio: viewBoxRatio(svg.getAttribute('viewBox')) });
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [file, fit, prefix]);

  // Art written in code: the same treatment on its one svg.
  const only = Children.toArray(children).find(isValidElement) as ReactElement<SVGProps<SVGSVGElement>> | undefined;
  const inline =
    !file && only
      ? cloneElement(only, { preserveAspectRatio: fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet', focusable: 'false', 'aria-hidden': true })
      : null;
  const natural = file ? markup?.ratio : viewBoxRatio(only?.props.viewBox);

  // Parts that draw themselves measure their own length as 1, so the line is drawn the same way at any size.
  useLayoutEffect(() => {
    const el = art.current;
    if (!el) return;
    const parts = el.querySelectorAll('[data-motion]');
    setMotionParts(parts.length > 0);
    el.querySelectorAll('[data-motion="draw"]').forEach((p) => {
      const shapes = p.matches('path, circle, ellipse, rect, line, polyline, polygon') ? [p] : Array.from(p.querySelectorAll('path, circle, ellipse, rect, line, polyline, polygon'));
      shapes.forEach((s) => s.setAttribute('pathLength', '1'));
    });
  }, [markup, inline]);

  // Reduced motion (the system's or the library's own setting) holds every part at its resting frame.
  useEffect(() => {
    if (!motionParts) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(prefersReducedMotion());
    update();
    media.addEventListener('change', update);
    const watch = new MutationObserver(update);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    return () => {
      media.removeEventListener('change', update);
      watch.disconnect();
    };
  }, [motionParts]);

  // When it plays: once on first view, while in view for a loop, or while pointed at or focused. Before its first view
  // a `once` illustration holds its parts at their start, so nothing is drawn and then hidden.
  useLayoutEffect(() => {
    const el = frame.current;
    if (!el || !motionParts || reduce) return setState('rest');
    if (play === 'hover') {
      const area = el.closest<HTMLElement>('a[href], button, [data-dl="card"], [data-tone-area]') ?? el;
      let hovered = area.matches(':hover');
      let focused = area.matches(':focus-within');
      const sync = () => setState(hovered || focused ? 'run' : 'rest');
      const on = (e: Event) => {
        if (e.type === 'pointerenter') hovered = true;
        if (e.type === 'pointerleave') hovered = false;
        if (e.type === 'focusin') focused = true;
        if (e.type === 'focusout') focused = (e as FocusEvent).relatedTarget instanceof Node && area.contains((e as FocusEvent).relatedTarget as Node);
        sync();
      };
      sync();
      const types = ['pointerenter', 'pointerleave', 'focusin', 'focusout'];
      types.forEach((t) => area.addEventListener(t, on));
      return () => types.forEach((t) => area.removeEventListener(t, on));
    }
    if (play === 'once') setState('ready');
    const seen = new IntersectionObserver(([entry]) => {
      if (play === 'once' && entry.isIntersecting) {
        setState('run');
        seen.disconnect();
      } else if (play === 'loop') setState(entry.isIntersecting ? 'run' : 'rest');
    });
    seen.observe(el);
    return () => seen.disconnect();
  }, [play, motionParts, reduce]);

  const shape = ratio === 'natural' ? natural : undefined;
  const loop = play === 'loop' && motionParts && !reduce;
  // The name sits on the art, so the Pause control beside it stays a control of its own.
  const named = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': decorative ? true : undefined };
  return (
    <span
      {...data}
      ref={frame}
      data-dl="illustration"
      data-ratio={ratio}
      data-fit={fit}
      data-width={size}
      data-play={motionParts ? play : undefined}
      data-state={motionParts ? (loop && paused ? 'paused' : state) : undefined}
      data-failed={failed ? '' : undefined}
      style={shape ? { ['--illustration-ratio' as string]: shape } : undefined}
    >
      {file ? (
        <span ref={art} data-dl-part="art" {...named} dangerouslySetInnerHTML={markup ? { __html: markup.html } : undefined} />
      ) : (
        <span ref={art} data-dl-part="art" {...named}>
          {inline}
        </span>
      )}
      {loop && (
        <span data-dl-part="control">
          <Button
            label={paused ? 'Play animation' : 'Pause animation'}
            icon={paused ? 'play' : 'pause'}
            iconOnly
            size="s"
            emphasis="quiet"
            onClick={() => setPaused((p) => !p)}
          />
        </span>
      )}
    </span>
  );
}
