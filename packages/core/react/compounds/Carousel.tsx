import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { Image, type PictureSource, type PictureTreatment, type SchemeSources } from '../fundamentals/Image';
import type { PictureReveal } from '../behaviour/reveal';
import type { DataAttributes } from '../types';

export interface CarouselSlide extends SchemeSources {
  /** A picture: its source and its words (alt text says what it shows; empty only when the caption already does). */
  src?: string;
  alt?: string;
  /** As `Image`: the picture's tone at rest and while pointed at (with `dark` and `contrast`, its scheme versions). */
  treatment?: PictureTreatment;
  /** As `Image`: the paired picture shown while pointed at. */
  alternate?: string | PictureSource;
  /** As `Image`: draws the change to `alternate` yourself (a template's reveal preset). */
  reveal?: PictureReveal;
  /** As `Image`: the point kept in view where the slide crops. */
  focal?: { x: number; y: number };
  /** Any content instead of a picture: a card, a chart, a quote. */
  content?: ReactNode;
  /** One line under the slide, read with it. */
  caption?: ReactNode;
  /** Who made the picture, after the caption. */
  credit?: string;
  /** A short name for the thumbnails picker and the slide's name when there is no caption ("The pond"). */
  label?: string;
}

export interface CarouselProps extends DataAttributes {
  /** What the slides are, for the region's name: "Planet scenes", "Featured articles". */
  label: string;
  /** The slides, in order: pictures with their words, or any content. */
  slides: CarouselSlide[];
  /** Slides shown at once: 1 (default) to 4. Narrow containers (under 40 rem) show one. */
  perView?: 1 | 2 | 3 | 4;
  /** One slide at a time with a part of each neighbour showing, faded and a little smaller; pressing a neighbour brings it to the middle. */
  peek?: boolean;
  /** After the last slide comes the first (and before the first, the last). Off by default: the ends are real. */
  loop?: boolean;
  /** Moves on by itself every `interval`, with a visible Pause; stops while hovered, stops for good once focus enters or Pause is pressed, and doesn't start when the reader asks for reduced motion. Implies loop. */
  autoplay?: boolean;
  /** Milliseconds per slide while rotating; default the `c.carousel.interval` token (6 s). */
  interval?: number;
  /** Previous and next buttons with the "2 of 5" counter. Default true; without them the picker, a swipe or the arrow keys move it. */
  arrows?: boolean;
  /** `dots` (default), `thumbnails` (pictures' thumbnails in a row that scrolls) or `none`. */
  pager?: 'dots' | 'thumbnails' | 'none';
  /** The shown slide (first visible one with perView > 1), for a controlled carousel. */
  index?: number;
  onIndexChange?: (index: number) => void;
}

const reducedMotion = () => typeof matchMedia === 'function' && (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce');

/** A picture slide: a plain picture, or the library's Image when it has scheme versions, a tone, a pair or a reveal. */
function picture(s: CarouselSlide) {
  const src = s.src ?? '';
  if (!(s.dark || s.contrast || s.treatment || s.alternate || s.reveal || s.focal)) return <img src={src} alt={s.alt ?? ''} loading="lazy" draggable={false} />;
  return <Image src={src} alt={s.alt ?? ''} ratio="natural" rounded={false} dark={s.dark} contrast={s.contrast} treatment={s.treatment} alternate={s.alternate} reveal={s.reveal} focal={s.focal} />;
}

/**
 * A row of slides shown one (or a few) at a time: a scroll-snap track that a swipe, a trackpad, the arrow keys, the
 * previous and next buttons or the picker moves. Optional peek, loop and autoplay with a visible Pause. Follows the
 * WAI-ARIA APG carousel pattern (tabbed picker). Not for content everyone must see: a carousel hides most of its slides.
 * @tier compound
 * @family content
 * @a11y A `region` with `aria-roledescription="carousel"` named by `label`; each slide a `group` with
 * `aria-roledescription="slide"` named "2 of 5" (and its caption). Slides out of view are `inert`. The picker is a
 * `tablist` (one Tab stop, arrows between dots). A polite live region says the new slide when the reader moves it and
 * stays quiet while it rotates by itself. The rotation control comes first and names its action ("Stop slide rotation").
 * Reduced motion: no smooth scrolling, no autoplay, no fill animation.
 * @key Left and Right on the slides: previous and next slide (mirrored in right-to-left)
 * @key Left and Right in the picker: move between dots; Home and End: first and last
 * @key Swipe or trackpad: scrolls and snaps to a slide
 */
export function Carousel({
  label,
  slides,
  perView = 1,
  peek = false,
  loop = false,
  autoplay = false,
  interval,
  arrows = true,
  pager = 'dots',
  index,
  onIndexChange,
  ...data
}: CarouselProps) {
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(0);
  const current = index ?? own;
  const [visible, setVisible] = useState<number>(peek ? 1 : perView);
  const [playing, setPlaying] = useState(autoplay);
  const [suspended, setSuspended] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const [ms, setMs] = useState(interval ?? 6000);
  const wraps = loop || autoplay;
  const count = slides.length;
  const positions = Math.max(1, count - visible + 1);
  const last = positions - 1;

  useEffect(() => {
    if (autoplay && reducedMotion()) setPlaying(false);
    if (interval == null && root.current) {
      const v = parseFloat(getComputedStyle(root.current).getPropertyValue('--c-carousel-interval'));
      if (v > 0) setMs(v);
    }
  }, []);

  const setIndex = useCallback(
    (i: number) => {
      if (index == null) setOwn(i);
      onIndexChange?.(i);
    },
    [index, onIndexChange],
  );

  const scrollTo = useCallback(
    (i: number) => {
      const t = track.current;
      const slide = t?.children[i] as HTMLElement | undefined;
      if (!t || !slide) return;
      const tr = t.getBoundingClientRect();
      const sr = slide.getBoundingClientRect();
      const rtl = getComputedStyle(t).direction === 'rtl';
      const pad = parseFloat(getComputedStyle(t).scrollPaddingInlineStart) || 0;
      const delta = peek ? sr.left + sr.width / 2 - (tr.left + tr.width / 2) : rtl ? sr.right - (tr.right - pad) : sr.left - (tr.left + pad);
      t.scrollBy({ left: delta, behavior: reducedMotion() ? 'auto' : 'smooth' });
    },
    [peek],
  );

  const go = useCallback(
    (i: number, byReader = true) => {
      const next = wraps ? (i + positions) % positions : Math.max(0, Math.min(last, i));
      setAnnounce(byReader);
      setIndex(next);
      scrollTo(next);
    },
    [wraps, positions, last, setIndex, scrollTo],
  );

  // How many slides fit (perView drops to one in narrow containers), read from the laid-out track.
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const measure = () => {
      const first = t.children[0] as HTMLElement | undefined;
      if (!first || peek) return setVisible(1);
      const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
      setVisible(Math.max(1, Math.round((t.clientWidth + gap) / (first.offsetWidth + gap))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    return () => ro.disconnect();
  }, [peek, perView, count]);

  // The reader's own scrolling (swipe, trackpad, keyboard scroll) updates the current slide once it settles.
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let timer = 0;
    const settle = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        const tr = t.getBoundingClientRect();
        const anchor = peek ? tr.left + tr.width / 2 : getComputedStyle(t).direction === 'rtl' ? tr.right : tr.left;
        let best = 0;
        let dist = Infinity;
        [...t.children].forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const edge = peek ? r.left + r.width / 2 : getComputedStyle(t).direction === 'rtl' ? r.right : r.left;
          const d = Math.abs(edge - anchor);
          if (d < dist) [dist, best] = [d, i];
        });
        const at = Math.min(best, last);
        if (at !== current) {
          setAnnounce(true);
          setIndex(at);
        }
      }, 120);
    };
    t.addEventListener('scroll', settle, { passive: true });
    return () => {
      t.removeEventListener('scroll', settle);
      clearTimeout(timer);
    };
  }, [peek, last, current, setIndex]);

  // A controlled index from outside scrolls the track to it.
  useEffect(() => {
    if (index != null) scrollTo(index);
  }, [index, scrollTo]);

  useEffect(() => {
    if (!playing || suspended || count < 2) return;
    const timer = setTimeout(() => go(current + 1, false), ms);
    return () => clearTimeout(timer);
  }, [playing, suspended, current, ms, go, count]);

  const onTrackKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    go(current + ((e.key === 'ArrowRight') !== rtl ? 1 : -1));
  };

  const onPagerKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const step = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
    let to: number | null = null;
    if (step) to = (current + step + positions) % positions;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = last;
    if (to == null) return;
    e.preventDefault();
    go(to);
    e.currentTarget.querySelectorAll<HTMLElement>('[role=tab]')[to]?.focus();
  };

  const inView = (i: number) => (peek ? Math.abs(i - current) <= 1 : i >= current && i < current + visible);
  const name = (i: number) => `${i + 1} of ${count}`;
  const counter = visible > 1 ? `${current + 1}–${Math.min(count, current + visible)} of ${count}` : `${current + 1} of ${count}`;

  return (
    <section
      {...data}
      ref={root}
      data-dl="carousel"
      data-peek={peek ? '' : undefined}
      data-per-view={peek ? undefined : String(perView)}
      data-playing={playing && !suspended ? '' : undefined}
      aria-roledescription="carousel"
      aria-label={label}
      style={{ '--carousel-interval': `${ms}ms` } as CSSProperties}
      onPointerEnter={() => setSuspended(true)}
      onPointerLeave={() => setSuspended(false)}
      onFocus={(e) => {
        // APG: once focus enters, rotation stops until the reader starts it again (except on the control itself).
        if (playing && !(e.target as HTMLElement).closest('[data-dl-part="rotation"]')) setPlaying(false);
      }}
    >
      <div
        ref={track}
        data-dl-part="track"
        data-scrollbar="none"
        id={`${id}-track`}
        tabIndex={0}
        role="group"
        aria-label={`${label}, slides`}
        onKeyDown={onTrackKey}
      >
        {slides.map((s, i) => {
          const shown = inView(i);
          const neighbour = peek && i !== current && shown;
          return (
            <div
              key={i}
              id={`${id}-slide-${i}`}
              data-dl-part="slide"
              data-current={peek ? (i === current ? '' : undefined) : undefined}
              role="group"
              aria-roledescription="slide"
              aria-label={s.label ? `${name(i)}: ${s.label}` : name(i)}
              inert={!shown ? true : undefined}
              onClick={neighbour ? () => go(i) : undefined}
            >
              <div data-dl-part="media" data-content={s.content ? '' : undefined}>{s.content ?? (s.src ? picture(s) : null)}</div>
              {(s.caption || s.credit) && (
                <p data-dl-part="caption" data-credit={s.credit ? '' : undefined}>
                  {s.caption}
                  {s.credit && <span data-dl-part="credit">{s.credit}</span>}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <span data-dl-part="announce" aria-live={playing ? 'off' : 'polite'}>
        {announce ? `Slide ${name(current)}${slides[current]?.label ? `: ${slides[current].label}` : ''}` : ''}
      </span>
      {(arrows || pager !== 'none' || autoplay) && count > 1 && (
        <div data-dl-part="controls">
          <div data-dl-part="moves">
            {autoplay && (
              <span data-dl-part="rotation">
                <Button
                  size="s"
                  emphasis="quiet"
                  iconOnly
                  icon={playing ? 'pause' : 'play'}
                  label={playing ? 'Stop slide rotation' : 'Start slide rotation'}
                  onClick={() => {
                    setSuspended(false);
                    setPlaying((p) => !p);
                  }}
                />
              </span>
            )}
            {arrows && (
              <>
                <Button size="s" emphasis="quiet" iconOnly icon="chevron-start" label="Previous slide" controls={`${id}-track`} disabled={!wraps && current === 0} onClick={() => go(current - 1)} />
                <span data-dl-part="counter" aria-hidden="true">
                  {counter}
                </span>
                <Button size="s" emphasis="quiet" iconOnly icon="chevron-end" label="Next slide" controls={`${id}-track`} disabled={!wraps && current >= last} onClick={() => go(current + 1)} />
              </>
            )}
          </div>
          {pager !== 'none' && (() => {
            const picker = (
            <div data-dl-part="pager" data-pager={pager} role="tablist" aria-label={`Choose a slide of ${label}`} onKeyDown={onPagerKey}>
              {Array.from({ length: positions }, (_, i) => {
                const s = slides[i];
                const selected = i === current;
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    data-dl-part={pager === 'thumbnails' ? 'thumb' : 'dot'}
                    aria-selected={selected}
                    aria-controls={`${id}-slide-${i}`}
                    aria-label={s.label ? `${name(i)}: ${s.label}` : `Slide ${name(i)}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => go(i)}
                  >
                    {pager === 'thumbnails' && s.src ? <img src={s.src} alt="" draggable={false} /> : <span data-dl-part="mark" key={selected ? `on-${current}` : 'off'} />}
                  </button>
                );
              })}
            </div>
            );
            // A long row of thumbnails scrolls sideways in a ScrollArea (Q96): the library's bar, never the native one.
            return pager === 'thumbnails' ? (
              <ScrollArea axis="inline" data-dl-part="pager-scroll">
                {picker}
              </ScrollArea>
            ) : (
              picker
            );
          })()}
        </div>
      )}
    </section>
  );
}
