import { DescriptionList } from '../compounds/DescriptionList';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'DescriptionList',
  tier: 'compound',
  summary: 'Term and details pairs, in columns sized by their own content.',
  stories: [
    {
      title: 'Facts about a component',
      description: 'The terms share one column as wide as the longest term; the details take the rest, on a page or in a narrow panel.',
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
