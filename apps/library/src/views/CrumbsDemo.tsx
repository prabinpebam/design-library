/**
 * Breadcrumbs before an opening (MP3, ID30): `site.html?demo=crumbs` puts core Breadcrumbs as the part before a Hero,
 * under the site header, at the layout's band gap; `&opening=flush` makes the first band meet the header (the trail
 * then touches it, which the spacing probe flags). No slot in Hero. View data only; no styles. Shown on Hero's page.
 */
import { Breadcrumbs, Hero, SiteHeader, SiteLayout } from '@design-library/core/react';
import hall from '../../../../packages/templates/conference/assets/main-hall.webp?url';

export function CrumbsDemo() {
  const flush = new URLSearchParams(window.location.search).get('opening') === 'flush';
  return (
    <SiteLayout opening={flush ? 'flush' : 'spaced'} header={<SiteHeader name="Talks on design" href="#" links={[{ href: '#programme', label: 'Programme' }, { href: '#speakers', label: 'Speakers', current: true }]} />}>
      <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Speakers', href: '#speakers' }, { label: 'Mira Okafor' }]} />
      <Hero
        eyebrow="Speaker"
        title="Mira Okafor on maps people can read"
        lead="Twenty minutes on wayfinding in stations and hospitals, and what signs taught her about interfaces."
        picture={{ src: hall, alt: 'The main hall just before the first talk: a lit stage with a blank screen, rows of people seated.' }}
      />
    </SiteLayout>
  );
}
