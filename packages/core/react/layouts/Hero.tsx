import type { ReactNode } from 'react';
import { Heading } from '../fundamentals/Heading';
import { Image } from '../fundamentals/Image';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface HeroPicture {
  src: string;
  /** What the picture shows, for people who can't see it; empty only if it adds nothing the words don't say. */
  alt: string;
  srcSet?: string;
  sizes?: string;
}

interface HeroBase extends DataAttributes {
  /** The page's or section's title, set in the display size: the one display heading in the view. */
  title: string;
  /** `1` (default) when the hero opens the page; `2` when it opens a section of a longer page. */
  level?: 1 | 2;
  /** A short line above the title naming what it belongs to, e.g. "Design systems". */
  eyebrow?: string;
  /** One or two sentences under the title: what this is and why it matters. */
  lead?: string;
  /** One or two Buttons, the main one first: what most people came to do. */
  actions?: ReactNode;
  /** A quieter line after the actions: a condition or a status, e.g. "Free for teams of up to five." */
  note?: ReactNode;
}

export type HeroProps = HeroBase &
  (
    | {
        /**
         * `split` (default with a picture): words and picture side by side, stacking when the room is narrow.
         * `stacked` (default without one): the words, then the picture below and wide, or the words alone.
         */
        layout?: 'split' | 'stacked';
        /** A picture given room. Leave it out and the title carries the view. */
        picture?: HeroPicture;
      }
    | {
        /** `divided`: no picture; the words in one column and the actions with the note in the other, so what follows comes up close. */
        layout: 'divided';
        picture?: never;
      }
  );

/**
 * A view's opening: an eyebrow, the title set large, a lead, the one or two main actions and, if it helps, a picture.
 * For a landing page or the opening of a long page's section.
 * Not for the head of an ordinary or documentation page (use PageHeader) or for a section's heading (use Section).
 * @tier 3
 * @a11y A `header` with the title as its heading at `level`; the eyebrow is plain text before it, in reading order.
 * The picture follows the words in the source, so the reading order is the same in every arrangement. The actions are
 * real Buttons or button-styled links; the note is plain text after them.
 */
export function Hero({ title, level = 1, eyebrow, lead, actions, note, picture, layout, ...data }: HeroProps) {
  const arrangement = layout ?? (picture ? 'split' : 'stacked');
  const doing = (actions || note) && (
    <div data-dl-part="doing">
      {actions && <div data-dl-part="actions">{actions}</div>}
      {note && (
        <Text variant="body-sm" tone="muted">
          {note}
        </Text>
      )}
    </div>
  );
  return (
    <header {...data} data-dl="hero" data-layout={arrangement} data-picture={picture ? '' : undefined}>
      <div data-dl-part="body">
        <div data-dl-part="words">
          <div data-dl-part="heading">
            {eyebrow && (
              <Text as="p" variant="body-sm" tone="muted">
                {eyebrow}
              </Text>
            )}
            <Heading level={level} size="display">
              {title}
            </Heading>
          </div>
          {lead && <p data-dl-part="lead">{lead}</p>}
          {arrangement !== 'divided' && doing}
        </div>
        {arrangement === 'divided' && doing}
        {picture && (
          <div data-dl-part="picture">
            <Image src={picture.src} alt={picture.alt} srcSet={picture.srcSet} sizes={picture.sizes} ratio={arrangement === 'stacked' ? 'wide' : 'photo'} loading="eager" />
          </div>
        )}
      </div>
    </header>
  );
}
