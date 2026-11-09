import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'Stack',
  tier: 'fundamental',
  summary: 'Children in a column with one gap from a space role.',
  stories: [
    {
      title: 'Items',
      description: 'Related items one after another; the stack owns the space, no margins.',
      code: `<Stack gap="item"><Text>…</Text><Text>…</Text></Stack>`,
      render: () => (
        <Stack gap="item">
          <Text>Tokens hold every value.</Text>
          <Text>Fundamentals are built from tokens alone.</Text>
          <Text>Compounds combine fundamentals.</Text>
        </Stack>
      ),
    },
  ],
} satisfies StoryFile;
