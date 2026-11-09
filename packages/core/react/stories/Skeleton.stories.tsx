import { useState } from 'react';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Grid } from '../fundamentals/Grid';
import { Skeleton } from '../fundamentals/Skeleton';
import { Stack } from '../fundamentals/Stack';
import type { StoryFile } from './story';

/** Remounts its shapes so the shimmer runs its passes again. */
function Replay() {
  const [run, setRun] = useState(0);
  return (
    <Stack gap="group">
      <div aria-busy="true">
      <Grid max={3} key={run}>
        {[0, 1, 2].map((i) => (
          <Cluster key={i} gap="item" wrap={false}>
            <Skeleton shape="circle" size="sm" />
            <Skeleton lines={2} />
          </Cluster>
        ))}
      </Grid>
      </div>
      <Cluster gap="item">
        <Button size="s" label="Shimmer again" onClick={() => setRun((r) => r + 1)} />
      </Cluster>
    </Stack>
  );
}

export default {
  component: 'Skeleton',
  tier: 'fundamental',
  summary: 'The shape of content on its way, in the content’s own box: a few passes of light, then still.',
  stories: [
    {
      title: 'Shapes',
      description: 'Text lines (the last of several shorter), a block that fills the box its content will fill, and circles for an icon, an avatar and a large picture.',
      code: `<Skeleton lines={3} />
<Skeleton shape="block" />
<Skeleton shape="circle" size="sm" /> <Skeleton shape="circle" /> <Skeleton shape="circle" size="lg" />`,
      render: () => (
        <div aria-busy="true">
        <Grid max={3}>
          <Skeleton lines={3} />
          <Skeleton shape="block" />
          <Cluster gap="item">
            <Skeleton shape="circle" size="sm" />
            <Skeleton shape="circle" />
            <Skeleton shape="circle" size="lg" />
          </Cluster>
        </Grid>
        </div>
      ),
    },
    {
      title: 'Three passes, then still',
      description: 'The light passes three times (count.shimmer-passes × duration.shimmer) and stops, so a slow load never shimmers forever. With reduced motion it never moves.',
      code: `<Cluster gap="item" wrap={false}>
  <Skeleton shape="circle" size="sm" />
  <Skeleton lines={2} />
</Cluster>`,
      render: () => <Replay />,
    },
    {
      title: 'Silhouette for an empty state',
      description: 'Still, faint, decorative: a hint of what will be here, beside words that say why it’s empty and what to do. Never a shimmer, so it can’t be mistaken for loading.',
      code: `<Skeleton lines={2} still />`,
      render: () => (
        <Grid max={2}>
          <Skeleton lines={2} still />
          <Skeleton lines={2} still />
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;
