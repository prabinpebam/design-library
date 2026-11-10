import type { ReactNode } from 'react';
import type { DataAttributes } from '@design-library/core/components';

export interface SponsorsLayoutProps extends DataAttributes {
  /** Region `intro`: why sponsor, the time until the event, the way to become one. Beside the levels in a wide window, above them in a narrow one. */
  intro: ReactNode;
  /** Region `levels`: the sponsors by level (SponsorWall). */
  levels: ReactNode;
}

/**
 * A sponsors section: an intro column (why, the time left, how to join) beside the sponsors by level in a wide window,
 * and above them in a narrow one. A section layout: it goes in a page layout's main region (SiteLayout's),
 * never wraps one. A Conference template part (Q64).
 * Not for a list of people (use a grid of Persona) or a sponsor's own page.
 * @tier layout
 * @family conference
 * @a11y Regions in reading order: the intro first, then the levels; nothing is reordered visually, so focus and reading
 * order match.
 */
export function SponsorsLayout({ intro, levels, ...data }: SponsorsLayoutProps) {
  return (
    <div {...data} data-dl="conference-sponsors-layout">
      <div data-dl-part="intro">{intro}</div>
      <div data-dl-part="levels">{levels}</div>
    </div>
  );
}
