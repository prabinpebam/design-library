import { Rail } from '../fundamentals/Rail';
import { Card } from '../compounds/Card';
import { Button } from '../fundamentals/Button';
import type { StoryFile } from './story';

const deals = ['Desk lamp', 'Armchair', 'Bookcase', 'Side table', 'Rug', 'Floor lamp', 'Shelf'];
const topics = ['Living room', 'Bedroom', 'Kitchen', 'Office', 'Outdoor', 'Storage', 'Lighting', 'Textiles'];

export default {
  component: 'Rail',
  tier: 'fundamental',
  summary: 'Things side by side in one row that scrolls sideways, each the same width.',
  stories: [
    {
      title: 'Cards in a rail',
      description: 'Medium items, the gap between cards; narrow the window and the row scrolls, bleeding to the edge.',
      code: `<Rail label="Today’s best deals">{deals.map((d) => <Card title={d} description="Lower price this week" variant="outlined" />)}</Rail>`,
      render: () => (
        <Rail label="Today’s best deals">
          {deals.map((d) => (
            <Card key={d} title={d} description="Lower price this week" variant="outlined" headingLevel={3} />
          ))}
        </Rail>
      ),
    },
    {
      title: 'Small items, many to a view',
      description: 'item s, for small product cards.',
      code: `<Rail label="Related products" item="s">…</Rail>`,
      render: () => (
        <Rail label="Related products" item="s">
          {deals.map((d) => (
            <Card key={d} title={d} variant="outlined" headingLevel={3} />
          ))}
        </Rail>
      ),
    },
    {
      title: 'Links as wide as their words',
      description: 'item auto and the gap between items, for a row of topics.',
      code: `<Rail label="Shop by room" item="auto" gap="item">{topics.map((t) => <Button label={t} />)}</Rail>`,
      render: () => (
        <Rail label="Shop by room" item="auto" gap="item">
          {topics.map((t) => (
            <Button key={t} label={t} />
          ))}
        </Rail>
      ),
    },
  ],
} satisfies StoryFile;
