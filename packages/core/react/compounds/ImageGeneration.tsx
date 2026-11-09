import { useEffect, useRef, type CSSProperties } from 'react';
import { announce } from '../behaviour/announce';
import { layoutStipple, paintStipple, stippleTime, type StipplePoint } from '../behaviour/stipple';
import { Button } from '../fundamentals/Button';
import { Icon } from '../fundamentals/Icon';
import { Image } from '../fundamentals/Image';
import { Progress } from '../fundamentals/Progress';
import type { DataAttributes } from '../types';

export interface ImageGenerationProps extends DataAttributes {
  /** `generating` while the model draws; `done` once the picture is ready (give `src`); `failed` with `error`. */
  state: 'generating' | 'done' | 'failed';
  /**
   * How the wait looks. `stipple` (default): the owner's watai field, dots drifting like slow smoke. `aurora`: the AI
   * colours panning under a soft sweep. `reveal`: the model's partial `preview` sharpening as `value` rises. `shimmer`:
   * a quiet light passing, for a short wait such as downloading a finished picture.
   */
  variant?: 'stipple' | 'aurora' | 'reveal' | 'shimmer';
  /** The picture's shape, reserved from the start so the finished picture takes its place without anything moving. */
  ratio?: 'square' | 'wide' | 'photo' | 'portrait';
  /** Present tense while generating: "Creating image" (default), "Adding the lighthouse". */
  label?: string;
  /** How far along, 0 to 100, only from a real total (steps the model reports). Shows a bar under the words. */
  value?: number;
  /** `reveal`: the model's latest partial picture. */
  preview?: string;
  /** The finished picture. */
  src?: string;
  /** What the finished picture shows. */
  alt?: string;
  /** What went wrong, in the person's words: "Couldn’t create this image. Try a different description." */
  error?: string;
  /** Tries again after a failure. */
  onRetry?: () => void;
}

const stillMotion = (el: Element) => (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) || !!el.closest('[data-motion="reduce"]');

/** The stipple field on a canvas: paints while visible and moving, one still frame under reduced motion. */
function Stipple({ moving }: { moving: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    let width = 0;
    let height = 0;
    let points: StipplePoint[] = [];
    let frame = 0;
    let shown = true;
    const start = performance.now();
    // The field and dot colours are tokens on the canvas's own colour and background (resolved, so light-dark works).
    const colours = () => {
      const style = getComputedStyle(el);
      return { field: style.backgroundColor, dot: style.color };
    };
    const paint = (now: number) => width && height && paintStipple(ctx, points, width, height, moving && !stillMotion(el) ? stippleTime(now - start) : stippleTime(0), colours());
    const tick = (now: number) => {
      frame = 0;
      paint(now);
      schedule();
    };
    const schedule = () => {
      if (!frame && shown && moving && !stillMotion(el) && width && height) frame = requestAnimationFrame(tick);
    };
    const resize = (w: number, h: number) => {
      if (w === width && h === height) return;
      width = w;
      height = h;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.max(1, Math.round(w * ratio));
      el.height = Math.max(1, Math.round(h * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      points = layoutStipple(w, h);
      paint(performance.now());
      schedule();
    };
    const sizes = new ResizeObserver(([entry]) => resize(entry.contentRect.width, entry.contentRect.height));
    sizes.observe(el);
    const view = new IntersectionObserver(([entry]) => {
      shown = entry.isIntersecting;
      if (shown) schedule();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    view.observe(el);
    const theme = new MutationObserver(() => paint(performance.now()));
    theme.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-scheme', 'data-theme', 'data-contrast', 'data-motion', 'style', 'class'] });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      sizes.disconnect();
      view.disconnect();
      theme.disconnect();
    };
  }, [moving]);
  return <canvas ref={canvas} data-dl-part="stipple" aria-hidden="true" />;
}

/**
 * The wait while an image is generated, in the finished picture's own frame: a moving field (the owner's watai
 * stipple, the AI colours, a sharpening preview or a quiet shimmer) under one line saying what's happening, then the
 * picture fading in where the wait was. A failure stays in the same frame with its reason and Retry.
 * Not for loading an existing picture (Image with Skeleton) or for a view's skeleton.
 * @tier compound
 * @family chat
 * @a11y A `figure` marked busy while generating; the status line is real text, announced politely when generation
 * starts, when the picture is ready ("Image created") and assertively when it fails. The moving field is hidden from
 * assistive technology. Reduced motion holds every variant still (one frame of the field), keeping the words and timing.
 */
export function ImageGeneration({ state, variant = 'stipple', ratio = 'square', label = 'Creating image', value, preview, src, alt = '', error, onRetry, ...data }: ImageGenerationProps) {
  const said = useRef('');
  useEffect(() => {
    const message = state === 'generating' ? `${label}…` : state === 'done' ? 'Image created' : error ?? 'Couldn’t create the image';
    if (message === said.current) return;
    if (state !== 'generating' || !said.current.endsWith('…')) announce(message, state === 'failed' ? 'assertive' : 'polite');
    said.current = message;
  }, [state, label, error]);

  const known = typeof value === 'number' && !Number.isNaN(value);
  const share = known ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <figure {...data} data-dl="image-generation" data-state={state} data-variant={variant} data-ratio={ratio} aria-busy={state === 'generating' || undefined}>
      <div data-dl-part="frame">
        {state === 'done' && src && (
          <span data-dl-part="picture">
            <Image src={src} alt={alt} ratio={ratio} fit="cover" rounded loading="eager" />
          </span>
        )}
        <div data-dl-part="veil" aria-hidden={state === 'done' || undefined}>
          {variant === 'stipple' && <Stipple moving={state === 'generating'} />}
          {variant === 'reveal' && preview && <img data-dl-part="partial" src={preview} alt="" style={{ '--dl-reveal': share / 100 } as CSSProperties} />}
          {state !== 'done' && (
            <div data-dl-part="status" data-material="floating" data-elevation="3">
              {state === 'failed' ? (
                <>
                  <span data-dl-part="line">
                    <Icon name="error" size="sm" />
                    {error ?? 'Couldn’t create the image'}
                  </span>
                  {onRetry && <Button label="Try again" icon="retry" size="s" onClick={onRetry} />}
                </>
              ) : (
                <>
                  <span data-dl-part="line">
                    <Progress />
                    {label}…{known && <span data-dl-part="value">{Math.round(share)}%</span>}
                  </span>
                  {known && (
                    <span data-dl-part="bar">
                      <Progress form="bar" value={share} label={label} />
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
