import { Card } from '../compounds/Card';
import { Statistic } from '../compounds/Statistic';
import { Grid } from '../fundamentals/Grid';
import type { StoryFile } from './story';

export default {
  component: 'Statistic',
  tier: 'compound',
  summary: 'A number that matters, with what it counts, its unit, its change since the last period and an optional trend line.',
  stories: [
    {
      title: 'A row of figures',
      description: 'The top of a dashboard. Each change says its direction with an arrow and, to a screen reader, in words; green and red only add whether it’s good news.',
      code: `<Grid max={4}>
  <Statistic label="Active users" value={12480} change="8%" direction="up" period="since last month" trend={[…]} />
  <Statistic label="Page load" value={1.8} unit="s" change="0.3 s" direction="down" good="down" period="since last month" />
  …
</Grid>`,
      render: () => (
        <Grid max={4}>
          <Statistic label="Active users" value={12480} change="8%" direction="up" period="since last month" trend={[9, 10, 9.5, 11, 10.8, 11.6, 12.5]} />
          <Statistic label="Page load" value={1.8} unit="s" change="0.3 s" direction="down" good="down" period="since last month" trend={[2.4, 2.3, 2.2, 2.1, 2.1, 1.9, 1.8]} />
          <Statistic label="Failed payments" value={42} change="12" direction="up" good="down" period="since last week" trend={[20, 24, 22, 30, 28, 35, 42]} />
          <Statistic label="Open tickets" value={318} change="0" direction="flat" period="since yesterday" />
        </Grid>
      ),
    },
    {
      title: 'Written in the reader’s locale',
      description: 'A number is formatted for the reader: compact for big counts, currency with its symbol, a percentage. A string is kept exactly as written.',
      code: `<Statistic label="Downloads" value={2400000} format={{ notation: 'compact' }} />
<Statistic label="Revenue" value={48250} format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }} />
<Statistic label="Completion" value={0.96} format={{ style: 'percent' }} />
<Statistic label="Orders against last spring" value="2×" />`,
      render: () => (
        <Grid max={4}>
          <Statistic label="Downloads" value={2400000} format={{ notation: 'compact' }} />
          <Statistic label="Revenue" value={48250} format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }} />
          <Statistic label="Completion" value={0.96} format={{ style: 'percent' }} />
          <Statistic label="Orders against last spring" value="2×" />
        </Grid>
      ),
    },
    {
      title: 'The figure a view leads with',
      description: 'Large, with one sentence that explains it.',
      code: `<Statistic size="l" label="Tasks finished without help" value={0.96} format={{ style: 'percent' }} description="Across all five sessions of the study." />`,
      render: () => <Statistic size="l" label="Tasks finished without help" value={0.96} format={{ style: 'percent' }} description="Across all five sessions of the study." />,
    },
    {
      title: 'A change that is neither good nor bad',
      description: 'When neither direction is good news, the change keeps its arrow and loses its colour.',
      code: `<Statistic label="Team size" value={24} change="3" direction="up" good="none" period="this quarter" />`,
      render: () => <Statistic label="Team size" value={24} change="3" direction="up" good="none" period="this quarter" trend={[19, 20, 21, 21, 23, 24]} />,
    },
    {
      title: 'Tiles in a card',
      description: 'Statistic has no enclosure of its own: a Card holds a group of them, so there’s one boundary for the group, not one per figure.',
      code: `<Card title="The store this month">
  <Grid max={3}>
    <Statistic label="Orders" value={1204} change="5%" direction="up" />
    …
  </Grid>
</Card>`,
      render: () => (
        <Card title="The store this month" meta="Updated 5 minutes ago">
          <Grid max={3}>
            <Statistic label="Orders" value={1204} change="5%" direction="up" period="since last month" />
            <Statistic label="Average order" value={38.4} format={{ style: 'currency', currency: 'EUR' }} change="€1.20" direction="down" period="since last month" />
            <Statistic label="Returns" value={2.1} unit="%" change="0.4 pts" direction="down" good="down" period="since last month" />
          </Grid>
        </Card>
      ),
    },
    {
      title: 'Loading',
      description: 'The label stays and the figure shimmers until it arrives.',
      code: `<Statistic loading label="Active users" value={0} />`,
      render: () => (
        <Grid max={3}>
          <Statistic loading label="Active users" value={0} />
          <Statistic loading label="Page load" value={0} />
          <Statistic loading label="Open tickets" value={0} />
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;
