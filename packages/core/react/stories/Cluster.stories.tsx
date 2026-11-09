import { Cluster } from '../fundamentals/Cluster';
import { Badge } from '../fundamentals/Badge';
import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'Cluster',
  tier: 'fundamental',
  summary: 'Children in a row that wraps, with one gap from a space role.',
  stories: [
    {
      title: 'A heading and its note',
      description: 'On the first line of text, a group’s space apart; the note wraps under the heading when the row runs out of room.',
      code: `<Cluster gap="group" align="baseline"><Heading level={3} size={4}>Blue</Heading><Text as="span" variant="body-sm" tone="muted">…</Text></Cluster>`,
      render: () => (
        <Cluster gap="group" align="baseline">
          <Heading level={3} size={4}>
            Blue
          </Heading>
          <Text as="span" variant="body-sm" tone="muted">
            For charts and categories, never for status.
          </Text>
        </Cluster>
      ),
    },
    {
      title: 'Marks beside text',
      description: 'Centred, a pair’s space apart.',
      code: `<Cluster gap="pair"><Badge>Compound</Badge><Text as="span" variant="body-sm">Built from fundamentals</Text></Cluster>`,
      render: () => (
        <Cluster gap="pair">
          <Badge>Compound</Badge>
          <Text as="span" variant="body-sm">
            Built from fundamentals
          </Text>
        </Cluster>
      ),
    },
  ],
} satisfies StoryFile;
