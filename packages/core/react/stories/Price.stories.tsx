import { Price } from '../fundamentals/Price';
import type { StoryFile } from './story';

export default {
  component: 'Price',
  tier: 'fundamental',
  summary: 'A price: the sign small and raised, the number large and bold; a lower price names its earlier price.',
  stories: [
    {
      title: 'In a card',
      description: 'The everyday price under a product’s name.',
      code: `<Price value={129} currency="EUR" />`,
      render: () => <Price value={129} currency="EUR" />,
    },
    {
      title: 'Lower price',
      description: 'The earlier price in words under it, never only a strike.',
      code: `<Price value={499} was={549} wasLabel="Previous price €549" currency="EUR" />`,
      render: () => <Price value={499} was={549} wasLabel="Previous price €549" currency="EUR" />,
    },
    {
      title: 'Lowest price',
      description: 'The lowest prices sit in a box of the highlight colour; a theme can give it a solid offset.',
      code: `<Price value={15} currency="EUR" highlight />`,
      render: () => <Price value={15} currency="EUR" highlight />,
    },
    {
      title: 'On its own page, with cents',
      description: 'Large, beside the product’s picture; two decimals where the shop prices in cents.',
      code: `<Price value={19.99} decimals={2} currency="USD" size="l" />`,
      render: () => <Price value={19.99} decimals={2} currency="USD" size="l" />,
    },
  ],
} satisfies StoryFile;
