import type { DataAttributes } from '../types';

export interface SkeletonProps extends DataAttributes {
  /** `text`: lines of text; `block`: a picture, chart or card, filling the box its content will fill; `circle`: an avatar or icon. */
  shape?: 'text' | 'block' | 'circle';
  /** Text only: how many lines the content usually has. The last of several is shorter, as text is. */
  lines?: number;
  /**
   * Circle: an icon (`sm`), an avatar (`md`) or a large picture (`lg`). Text (LR73, opt-in): `lg` draws heading-size
   * lines (`c.skeleton.line-lg`), for a title on its way; `sm` and `md` are body lines.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Block only (LR73, opt-in): the box keeps a picture's ratio, as `Image` and `ImageGrid` do (`wide` 16:9, `photo` 3:2,
   * `classic` 4:3, `square`, `portrait` 4:5), so a picture on its way holds its own shape. Unset, the block fills its box.
   */
  ratio?: 'wide' | 'photo' | 'classic' | 'square' | 'portrait';
  /** A silhouette that never shimmers: an empty state's faint picture of the content to come. */
  still?: boolean;
}

/**
 * A placeholder in the shape of content that is on its way, inside the content's own wrapper, so nothing moves when the
 * content arrives. A soft light passes across it a few times (`count.shimmer-passes`), then it holds still. Not for an
 * operation (use Progress) or a control's own pending state (the control shows it). The region it sits in sets
 * `aria-busy` and says, once, what is loading.
 * @tier fundamental
 * @family feedback
 * @a11y Always `aria-hidden`: the region holding it is `aria-busy` and one status line names the wait. Reduced motion:
 * no shimmer, the shapes stay still.
 */
export function Skeleton({ shape = 'text', lines = 1, size = 'md', ratio, still = false, ...data }: SkeletonProps) {
  const common = { ...data, 'data-dl': 'skeleton', 'data-shape': shape, 'data-still': still ? '' : undefined, 'aria-hidden': true } as const;
  if (shape === 'text') {
    return (
      <span {...common} data-size={size === 'lg' ? 'lg' : undefined}>
        {Array.from({ length: Math.max(1, lines) }, (_, i) => (
          <span key={i} data-dl-part="line" data-last={lines > 1 && i === lines - 1 ? '' : undefined} />
        ))}
      </span>
    );
  }
  return <span {...common} data-size={shape === 'circle' ? size : undefined} data-ratio={shape === 'block' ? ratio : undefined} />;
}
