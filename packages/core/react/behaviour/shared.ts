import { durationOf } from './flip';

/**
 * A picture that travels between two places (Q65 P7 by FLIP, C10, K-4): a thumbnail and the same picture drawn large
 * (a Lightbox). Pure geometry plus one runner, no styles. The large picture is moved and scaled so it starts drawn
 * exactly as the thumbnail shows it (cropped to the thumbnail's box and corners, as `object-fit: cover` crops it), then
 * grows to its own place uncropped (`object-fit: contain`). Only `transform` and `clip-path` change, so nothing around
 * it moves (R1) and the picture is never stretched.
 */
export interface PictureBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The keyframes that take `big` (an `img` laid out at box `b`, drawing a `natural` picture with contain) from the
 * thumbnail box `t` (with corner `radius`) to its own place. Null when either box or the picture has no size. Pure.
 */
export function pictureTravel(t: PictureBox, b: PictureBox, natural: { width: number; height: number }, radius = 0): [Keyframe, Keyframe] | null {
  const { width: nw, height: nh } = natural;
  if (!nw || !nh || !t.width || !t.height || !b.width || !b.height) return null;
  const drawn = Math.min(b.width / nw, b.height / nh);
  const thumb = Math.max(t.width / nw, t.height / nh);
  const k = thumb / drawn;
  const dx = t.left + t.width / 2 - (b.left + b.width / 2);
  const dy = t.top + t.height / 2 - (b.top + b.height / 2);
  const startX = (b.width - t.width / k) / 2;
  const startY = (b.height - t.height / k) / 2;
  const endX = (b.width - nw * drawn) / 2;
  const endY = (b.height - nh * drawn) / 2;
  return [
    { transform: `translate(${dx}px, ${dy}px) scale(${k})`, clipPath: `inset(${startY}px ${startX}px round ${radius / k}px)`, opacity: 1 },
    { transform: 'translate(0px, 0px) scale(1)', clipPath: `inset(${endY}px ${endX}px round 0px)`, opacity: 1 },
  ];
}

const box = (el: Element): PictureBox => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/**
 * Plays the travel between `thumb` (the thumbnail's visible box, e.g. its Image wrapper) and `img` (the large picture),
 * `open` from the thumbnail or back to it, over `duration.shared` on `easing.standard`. The thumbnail is hidden while
 * the picture is in flight so it is never seen twice. Returns the running animations (cancel them to stop), or null
 * when nothing can travel: reduced motion (`duration.shared` is 0), a picture not decoded yet, a thumbnail not laid
 * out or out of view.
 */
export function travelPicture(thumb: Element, img: HTMLImageElement, direction: 'open' | 'close'): Animation[] | null {
  const duration = durationOf(img, '--duration-shared');
  // A tab that isn't painting never finishes an animation: nothing travels there.
  if (!duration || document.hidden || typeof img.animate !== 'function') return null;
  const t = box(thumb);
  if (t.top + t.height < 0 || t.top > window.innerHeight || t.left + t.width < 0 || t.left > window.innerWidth) return null;
  const radius = parseFloat(getComputedStyle(thumb).borderTopLeftRadius) || 0;
  const frames = img.complete ? pictureTravel(t, box(img), { width: img.naturalWidth, height: img.naturalHeight }, radius) : null;
  if (!frames) return null;
  const easing = getComputedStyle(img).getPropertyValue('--easing-standard').trim() || 'ease-out';
  const options: KeyframeAnimationOptions = { duration, easing, fill: 'both', id: 'dl-shared' };
  return [
    img.animate(direction === 'open' ? frames : [frames[1], frames[0]], options),
    thumb.animate([{ opacity: 0 }, { opacity: 0 }], { duration, fill: 'both', id: 'dl-shared' }),
  ];
}
