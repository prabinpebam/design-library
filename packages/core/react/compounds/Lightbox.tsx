import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { durationOf } from '../behaviour/flip';
import { travelPicture } from '../behaviour/shared';
import { Button } from '../fundamentals/Button';
import { Image } from '../fundamentals/Image';
import type { DataAttributes } from '../types';

export interface LightboxItem {
  /** Stable key. */
  id: string;
  /** The picture's address (the largest one worth showing). */
  src: string;
  /** What the picture shows. */
  alt: string;
  /** A line under the picture. */
  caption?: string;
  /** The picture's own width and height in pixels, so its frame is right before it loads. */
  width?: number;
  height?: number;
}

export interface LightboxProps extends DataAttributes {
  /** The pictures, in order. */
  items: LightboxItem[];
  /** The picture shown; `null` when closed. The parent owns it. */
  index: number | null;
  /** Previous, Next, the arrow keys or a swipe asked for another picture. */
  onIndexChange: (index: number) => void;
  /** Escape or Close asked to close. Set `index` to `null`. */
  onClose: () => void;
  /** What the set is, as the lightbox's name: "Photos from the trip". */
  label: string;
}

/**
 * The pictures of a set, one at a time and as large as the window allows, over the page: opened from an ImageGrid or a
 * Card, with Previous and Next, a counter and the caption. Built on the same native modal dialog as Dialog.
 * @tier compound
 * @family content
 * @a11y A native `dialog` opened with `showModal()`, named by `label`: the page behind is inert and focus stays inside.
 * Focus starts on Close and returns to the picture that opened it. The picture keeps its alternative text; the counter
 * and caption are a polite live region, so moving to another picture announces "3 of 7" and its caption. Previous and
 * Next are named buttons, absent at the ends rather than disabled, so Tab never meets a dead stop. Motion (Q65 C10,
 * K-4): opened from a thumbnail (the focused opener's Image), the picture travels from the thumbnail's place, cropped
 * as it was, to its own while the window fades in around it, and travels back on closing if it is still the picture
 * that was opened; otherwise it fades. Focus returns to the opener when it lands. Reduced motion: no travel, fades only.
 * @key Escape: closes
 * @key Left arrow, Right arrow: the previous or next picture (mirrored right to left)
 * @key Home, End: the first or last picture
 */
export function Lightbox({ items, index, onIndexChange, onClose, label, ...data }: LightboxProps) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const start = useRef<number | null>(null);
  const opened = useRef<number | null>(null);
  const flight = useRef<Animation[]>([]);
  const last = useRef(0);
  // The content stays while the dialog closes, so its picture can travel back to its thumbnail.
  const [shown, setShown] = useState(false);
  const open = index !== null && items.length > 0;
  if (index !== null) last.current = index;
  const at = Math.min(Math.max(index ?? last.current, 0), Math.max(items.length - 1, 0));
  const item = items[at];

  // Layout effects, so the travel is measured and started before the first frame of the new state is painted.
  useLayoutEffect(() => {
    const d = ref.current;
    if (!d) return;
    const picture = () => d.querySelector<HTMLImageElement>('[data-dl-part="picture"] img');
    // The thumbnail that opened it: the opener's own Image (an ImageGrid tile, a Card's picture).
    const thumbnail = () => (opener.current?.isConnected ? (opener.current.querySelector('[data-dl="image"]') ?? (opener.current.matches('[data-dl="image"]') ? opener.current : null)) : null);
    const land = () => {
      flight.current.forEach((a) => a.cancel());
      flight.current = [];
      delete d.dataset.travel;
    };
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      opened.current = at;
      d.showModal();
      d.querySelector<HTMLElement>('[data-dl-part="close"] button')?.focus();
      const from = thumbnail();
      const img = picture();
      const trip = from && img ? travelPicture(from, img, 'open') : null;
      if (trip) {
        // C10: the picture travels from its thumbnail while the window's surface and controls fade in around it.
        d.dataset.travel = '';
        const change = durationOf(d, '--duration-change');
        const easing = getComputedStyle(d).getPropertyValue('--easing-enter').trim();
        const around = [...d.querySelectorAll('[data-dl-part="bar"], [data-dl-part="side"], [data-dl-part="caption"]')].map((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: change, easing, fill: 'backwards' }));
        const surface = d.animate([{ backgroundColor: 'transparent' }, { backgroundColor: getComputedStyle(d).backgroundColor }], { duration: change, easing });
        flight.current = [...trip, ...around, surface];
        trip[0].finished.then(land, () => undefined);
      }
    } else if (open && d.open) {
      // Opened again while it was travelling back: it stays open where it is.
      land();
    } else if (!open && d.open) {
      land();
      const finish = () => {
        // Closed while transitions are still off, then the fades are dropped: no flash of the surface coming back.
        d.close();
        land();
        setShown(false);
        opener.current?.focus();
      };
      const to = at === opened.current ? thumbnail() : null;
      const img = picture();
      const trip = to && img ? travelPicture(to, img, 'close') : null;
      if (!trip) return finish();
      // Back to where it came from (only the picture that was opened; another one simply fades).
      d.dataset.travel = '';
      const quick = durationOf(d, '--duration-quick');
      const easing = getComputedStyle(d).getPropertyValue('--easing-exit').trim();
      const around = [...d.querySelectorAll('[data-dl-part="bar"], [data-dl-part="side"], [data-dl-part="caption"]')].map((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: quick, easing, fill: 'forwards' }));
      const surface = d.animate([{ backgroundColor: getComputedStyle(d).backgroundColor }, { backgroundColor: 'transparent' }], { duration: durationOf(d, '--duration-shared'), easing, fill: 'forwards' });
      flight.current = [...trip, ...around, surface];
      trip[0].finished.then(finish, () => undefined);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (open) setShown(true);
  }, [open]);

  // A side button vanishes at either end: keep focus inside on the one that's left, or Close.
  useEffect(() => {
    const d = ref.current;
    if (!d?.open || d.contains(document.activeElement)) return;
    (d.querySelector<HTMLElement>('[data-dl-part="side"] button') ?? d.querySelector<HTMLElement>('[data-dl-part="close"] button'))?.focus();
  }, [at]);

  const go = (to: number) => {
    if (to >= 0 && to < items.length && to !== at) onIndexChange(to);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      go(at + step);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      go(e.key === 'Home' ? 0 : items.length - 1);
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current === null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    if (Math.abs(dx) < 48) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    go(at + ((dx < 0) !== rtl ? 1 : -1));
  };

  return (
    <dialog
      {...data}
      ref={ref}
      data-dl="lightbox" data-material="modal" data-elevation="4"
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={onKeyDown}
    >
      {(open || shown) && item && (
        <div data-dl-part="surface">
          <header data-dl-part="bar">
            <p id={`${id}-count`} data-dl-part="count">
              {at + 1} of {items.length}
            </p>
            <span data-dl-part="close">
              <Button label="Close" icon="close" iconOnly emphasis="quiet" onClick={onClose} />
            </span>
          </header>
          <div
            data-dl-part="stage"
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') start.current = e.clientX;
            }}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (start.current = null)}
          >
            <span data-dl-part="side" data-end="start">
              {at > 0 && <Button label="Previous picture" icon="chevron-start" iconOnly size="l" onClick={() => go(at - 1)} />}
            </span>
            <div data-dl-part="picture" key={item.id}>
              <Image src={item.src} alt={item.alt} width={item.width} height={item.height} ratio="natural" fit="contain" rounded={false} loading="eager" />
            </div>
            <span data-dl-part="side" data-end="end">
              {at < items.length - 1 && <Button label="Next picture" icon="chevron-end" iconOnly size="l" onClick={() => go(at + 1)} />}
            </span>
          </div>
          <p data-dl-part="caption" aria-live="polite">
            <span data-dl-part="hidden-count">{`${at + 1} of ${items.length}. `}</span>
            {item.caption ?? ''}
          </p>
        </div>
      )}
    </dialog>
  );
}
