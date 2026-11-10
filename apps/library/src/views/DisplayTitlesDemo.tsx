/**
 * Display-size section titles (MP16): `site.html?demo=display-titles`. A brand page whose section titles sit at the
 * display step and whose closing title is jumbo, through `Section` `size` (the blocks' `size` field gives the same from
 * page data). The heading levels still follow the outline. View data only; no styles. Shown on the Section page.
 */
import { Button, Cluster, Grid, Hero, Section, SiteHeader, SiteLayout, Statistic, Text } from '@design-library/core/components';

export function DisplayTitlesDemo() {
  return (
    <SiteLayout header={<SiteHeader name="Northwind Trails" href="#" links={[]} />}>
      <Hero eyebrow="Spring guide" title="Walk the long coast before the summer crowds" lead="Twelve routes from the harbour to the cliffs, each with its tides, its cafés and a place to sleep." />
      <Section heading="The season in numbers" size="display" intro="What a spring on the coast adds up to.">
        <Grid max={3}>
          <Statistic label="Routes" value={12} />
          <Statistic label="Kilometres" value={418} />
          <Statistic label="Villages" value={31} />
        </Grid>
      </Section>
      <Section heading="Where the paths go" size="display" intro="From the harbour wall to the lighthouse and back over the moor.">
        <Text>Every route starts at a bus stop and ends at one, so you never walk the same way twice. The tide tables for each are on its page, with the hour you should be off the sand.</Text>
      </Section>
      <Section heading="Walk with us" size="jumbo">
        <Cluster gap="item">
          <Button label="Get the spring guide" emphasis="primary" />
          <Button label="See the routes" emphasis="quiet" />
        </Cluster>
      </Section>
    </SiteLayout>
  );
}
