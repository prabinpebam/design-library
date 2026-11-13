import { useId, type ReactNode } from 'react';
import { Heading } from '../fundamentals/Heading';
import type { DataAttributes } from '../types';

export interface SectionProps extends DataAttributes {
  /** Names the section; the section is labelled by it. */
  heading?: string;
  /** An in-page address for the section (IP27): its heading takes this id, so a link to `#anchor` lands on the heading. Letters, digits and hyphens. */
  anchor?: string;
  /** Semantic level from the page outline. */
  level?: 2 | 3 | 4;
  /**
   * Visual size, independent of level. `display` and `jumbo` (MP16) set the title at the type ramp's top steps, for a
   * brand page's section titles and its closing title; the level still follows the outline.
   */
  size?: 2 | 3 | 4 | 'display' | 'jumbo';
  /** One or two sentences that hold for everything in the section, on a shorter line than running text. */
  intro?: string;
  /** A number shown large in its own column beside the section, for a numbered sequence such as tiers. Hidden from assistive technology: the heading carries the meaning. */
  index?: number;
  /** A section inside another section's content: its parts sit closer, so it reads as one group of the outer section. */
  nested?: boolean;
  /**
   * A band with its own fill, from the elevation ladder (IP10): `sunken` (quiet, below the page), `raised` (a step
   * above it, no shadow) or `tint` (one clear neutral step). The fill is the section's only boundary; its parts sit
   * inside it. Left out, the section sits on the page with no fill. Never inside a card or another toned section.
   */
  tone?: 'sunken' | 'raised' | 'tint';
  /** With `tone`: the fill runs to the window's edges as a band across the page, the parts keeping the column's edges. For a section directly in a SiteLayout column. */
  bleed?: boolean;
  /**
   * With `tone` (not `bleed`): `group` is a panel among panels, such as a dashboard's: a step closer inside
   * (`c.section.group-inset`) with its head a group above its content (`c.section.group-gap`). Default `section`.
   */
  inset?: 'section' | 'group';
  /**
   * With `tone` (not `bleed`): a hairline edge beside the fill (`c.section.outline-width`, `c.section.outline-color`),
   * for a template whose panels carry both cues. Off by default: the fill alone is the boundary (IP10).
   */
  outline?: boolean;
  children?: ReactNode;
  /** `data-*` attributes for the heading, for tooling such as revision anchors. */
  headingData?: DataAttributes;
  /** `data-*` attributes for the intro. */
  introData?: DataAttributes;
}

/**
 * A titled part of a page: a heading, a short intro that holds for everything in it, then its content.
 * Not for the page's own head (use PageHeader) or for grouping that space alone already shows.
 * @tier compound
 * @family content
 * @a11y Renders `section`, named by its heading through `aria-labelledby` when it has one. The heading level follows
 * the outline, never the visual size. An index numeral is decorative.
 */
export function Section({ heading, anchor, level = 2, size, intro, index, nested = false, tone, bleed = false, inset = 'section', outline = false, children, headingData, introData, ...data }: SectionProps) {
  const generated = useId();
  const id = anchor ?? generated;
  const head = (heading || intro) && (
    <div data-dl-part="head">
      {heading && (
        <Heading level={level} size={size} id={id} {...headingData}>
          {heading}
        </Heading>
      )}
      {intro && (
        <p {...introData} data-dl-part="intro">
          {intro}
        </p>
      )}
    </div>
  );
  const parts = (
    <>
      {head}
      {children != null && children !== false && <div data-dl-part="content">{children}</div>}
    </>
  );
  return (
    <section {...data} data-dl="section" data-nested={nested ? '' : undefined} data-indexed={index != null ? '' : undefined} data-tone={tone} data-bleed={tone && bleed ? '' : undefined} data-inset={tone && !bleed && inset === 'group' ? 'group' : undefined} data-outline={tone && !bleed && outline ? '' : undefined} aria-labelledby={heading ? id : undefined}>
      {index != null ? (
        <>
          <p data-dl-part="index" aria-hidden="true">
            {index}
          </p>
          <div data-dl-part="body">{parts}</div>
        </>
      ) : (
        parts
      )}
    </section>
  );
}
