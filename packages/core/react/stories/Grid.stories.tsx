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
    {
      title: 'Uneven columns: a wide and a narrow one',
      description:
        'ratio="2:1": the main text takes two thirds, the side note one third. Narrow the window below about 48 rem and they stack, main text first.',
      code: `<Grid ratio="2:1"><Stack gap="pair">…main text…</Stack><Stack gap="pair">…side note…</Stack></Grid>`,
      render: () => (
        <Grid ratio="2:1">
          <Stack gap="pair">
            <Heading level={3} size={3}>
              What the programme covers
            </Heading>
            <Text>
              Two days of talks and workshops on research, writing and building for the web, with time between sessions to
              meet the people who gave them.
            </Text>
          </Stack>
          <Stack gap="pair">
            <Heading level={3} size={4}>
              Good to know
            </Heading>
            <Text variant="body-sm" tone="muted">
              Doors open at nine. Every talk is filmed and published a week later.
            </Text>
          </Stack>
        </Grid>
      ),
    },
    {
      title: 'Uneven columns: three to two',
      description: 'ratio="3:2" for a softer split, here words beside a short list of facts; "1:2" and "2:3" put the larger share at the end.',
      code: `<Grid ratio="3:2"><Stack gap="pair">…words…</Stack><Stack gap="pair">…facts…</Stack></Grid>`,
      render: () => (
        <Grid ratio="3:2">
          <Stack gap="pair">
            <Heading level={3} size={3}>
              A quieter way to plan
            </Heading>
            <Text>
              Lay out the week in one place, move what slips and see what is left, without a second list to keep in step.
            </Text>
          </Stack>
          <Stack gap="pair">
            <Text variant="body-sm" tone="muted">
              Works offline
            </Text>
            <Text variant="body-sm" tone="muted">
              Shares a plan by link
            </Text>
            <Text variant="body-sm" tone="muted">
              Exports to a calendar
            </Text>
          </Stack>
        </Grid>
      ),
    },
    {
      title: 'A heading beside its content',
      description:
        'ratio="aside": the heading keeps a column of its own (--c-grid-aside, 16 rem by default, a theme setting) and the content takes the rest. Several pairs make rows; narrow the window and each heading sits above its content.',
      code: `<Grid ratio="aside"><Heading level={3} size={4}>Venue</Heading><Text>…</Text><Heading level={3} size={4}>Travel</Heading><Text>…</Text></Grid>`,
      render: () => (
        <Grid ratio="aside">
          <Heading level={3} size={4}>
            Venue
          </Heading>
          <Text>The main hall seats four hundred, with step-free entry from the street and quiet rooms on the first floor.</Text>
          <Heading level={3} size={4}>
            Travel
          </Heading>
          <Text>Ten minutes on foot from the central station; the nearest bus stop is across the square.</Text>
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;
