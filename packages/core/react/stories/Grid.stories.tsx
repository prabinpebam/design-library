import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const options = [
  ['Compact', 'Dense working screens.'],
  ['Normal', 'Most products.'],
  ['Loose', 'Calmer, occasional use.'],
  ['Extra loose', 'Editorial and showcase pages.'],
];

export default {
  component: 'Grid',
  tier: 'fundamental',
  summary: 'Equal columns for things compared side by side.',
  stories: [
    {
      title: 'Four options side by side',
      description: 'At most two columns, so four read 2 × 2; narrow the window and they stack, never scrolling sideways.',
      code: `<Grid max={2}>{options.map(([name, use]) => <Stack gap="pair"><Heading level={3} size={4}>{name}</Heading><Text variant="body-sm" tone="muted">{use}</Text></Stack>)}</Grid>`,
      render: () => (
        <Grid max={2}>
          {options.map(([name, use]) => (
            <Stack key={name} gap="pair">
              <Heading level={3} size={4}>
                {name}
              </Heading>
              <Text variant="body-sm" tone="muted">
                {use}
              </Text>
            </Stack>
          ))}
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;
