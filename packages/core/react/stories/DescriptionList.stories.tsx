import { DescriptionList } from '../compounds/DescriptionList';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'DescriptionList',
  tier: 'compound',
  summary: 'Term and details pairs, stacking on narrow screens.',
  stories: [
    {
      title: 'Facts about a component',
      description: 'Each term in its own column beside its details; below the small breakpoint the term sits above them.',
      code: `<DescriptionList items={[{ term: 'Uses', details: 'Text and Icon' }, …]} />`,
      render: () => (
        <DescriptionList
          items={[
            { term: 'Uses', details: <Text>Text and Icon</Text> },
            { term: 'Used by', details: <Text>Layouts and views</Text> },
            { term: 'Tier', details: <Text>Compound</Text> },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
