/**
 * The Conference template's registry (Q64): its own block types and its own layout, each mapped to its own parts
 * (parts/), all under the `conference` namespace. Core blocks and core layouts need no entry here.
 */
import { SiteLayout } from '@design-library/core/react';
import type { BlockRenderer, Template } from '@design-library/core/render';
import { Countdown } from './parts/fundamentals/Countdown';
import { SponsorWall, type Sponsor, type SponsorLevel } from './parts/compounds/SponsorWall';
import { SponsorsLayout } from './parts/layouts/SponsorsLayout';
import './tokens/tokens.css';
import './parts/fundamentals/countdown.css';
import './parts/compounds/sponsor-wall.css';
import './parts/layouts/sponsors-layout.css';

interface CountdownBlock {
  type: 'conference.countdown';
  label: string;
  until: string;
  passed: string;
}

interface SponsorWallBlock {
  type: 'conference.sponsor-wall';
  /** As the wall's levels, but each sponsor names its mark by asset id (`picture`) rather than by address. */
  levels: (Omit<SponsorLevel, 'sponsors'> & { sponsors: (Omit<Sponsor, 'mark'> & { picture?: string })[] })[];
}

const BLOCKS: { 'conference.countdown': BlockRenderer<CountdownBlock>; 'conference.sponsor-wall': BlockRenderer<SponsorWallBlock> } = {
  'conference.countdown': (b, _ctx, i) => <Countdown key={i} label={b.label} until={b.until} passed={b.passed} />,
  'conference.sponsor-wall': (b, ctx, i) => (
    <SponsorWall
      key={i}
      levels={b.levels.map((l) => ({ ...l, sponsors: l.sponsors.map(({ picture, ...s }) => ({ ...s, mark: picture ? ctx.picture(picture).src : undefined })) }))}
      headingLevel={ctx.layout === 'sponsors' ? 2 : 3}
    />
  ),
};

export const registry: Template['registry'] = {
  blocks: BLOCKS,
  layouts: {
    'conference.SponsorsLayout': ({ content, region }) => (
      <SiteLayout width={content.settings?.width as 'wide' | 'reading' | undefined} header={region('header')} footer={region('footer')}>
        <SponsorsLayout intro={region('intro')} levels={region('levels')} />
      </SiteLayout>
    ),
  },
};

/**
 * MP4: the template's parts on their own. `@design-library/templates/conference/registry` brings the registry, these
 * parts and the template's token CSS, and none of its content or pictures; another site registers the blocks or
 * places the parts in its own views.
 */
export { Countdown, SponsorWall, SponsorsLayout };
export type { Sponsor, SponsorLevel };
export type { CountdownProps } from './parts/fundamentals/Countdown';
export type { SponsorWallProps } from './parts/compounds/SponsorWall';
export type { SponsorsLayoutProps } from './parts/layouts/SponsorsLayout';
