/**
 * A template's parts in another site (MP4): `site.html?demo=reuse`. A small product-launch page built from core parts,
 * with the conference template's Countdown placed by hand. It imports `@design-library/templates/conference/registry`,
 * which brings the registry, the parts and the template's token CSS and none of its content or pictures. View data
 * only; no styles. Shown on the conference template's Own parts page.
 */
import { PageHeader, SiteLayout, SiteHeader, Stack, Text } from '@design-library/core/react';
import { Countdown } from '@design-library/templates/conference/registry';

export function ReuseDemo() {
  return (
    <SiteLayout header={<SiteHeader name="Field Notes" href="#" links={[]} />}>
      <Stack gap="section">
        <PageHeader title="Field Notes 2.0 arrives soon" lead="A notebook app for surveys outdoors: offline maps, voice notes and photos that keep their place on the map." />
        <Countdown label="Release in" until="2027-06-01T09:00:00Z" passed="Field Notes 2.0 is out" />
        <Text>This page is not a conference site. It uses one part from the conference template, imported on its own, and draws the rest from the core.</Text>
      </Stack>
    </SiteLayout>
  );
}
