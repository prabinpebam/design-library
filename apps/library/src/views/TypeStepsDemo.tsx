/**
 * The top type steps as theme settings (MP15): `site.html?demo=type-steps` draws a brand opening, a jumbo figure and
 * a large Statistic on the library's defaults; `&steps=one-weight` sets the display and jumbo steps for a display face
 * with one weight, through the same `applySettings` and `applyFonts` a site calls. View data only; no styles. Shown on
 * the Typography page.
 */
import { Grid, Heading, Hero, Section, SiteHeader, SiteLayout, Stack, Statistic, Text } from '@design-library/core/components';

export function TypeStepsDemo() {
  return (
    <SiteLayout header={<SiteHeader name="Northwind Trails" href="#" links={[]} />}>
      <Hero eyebrow="Spring guide" title="Walk the long coast before the summer crowds" lead="Twelve routes from the harbour to the cliffs, each with its tides, its cafés and a place to sleep." />
      <Section heading="The season in numbers">
        <Grid max={3}>
          <Statistic size="l" label="Routes" value={12} />
          <Statistic size="l" label="Kilometres" value={418} />
          <Statistic size="l" label="Villages" value={31} />
        </Grid>
      </Section>
      <Stack gap="item">
        <Heading level={2} size="jumbo">
          418 km
        </Heading>
        <Text>The whole coast, end to end, in one jumbo figure.</Text>
      </Stack>
    </SiteLayout>
  );
}
