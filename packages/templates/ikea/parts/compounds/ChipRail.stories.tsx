import type { StoryFile } from '@design-library/core/components';
import { ChipRail } from './ChipRail';

const pic = (name: string) => new URL(`../../assets/${name}.webp`, import.meta.url).href;

export default {
  component: 'ikea.ChipRail',
  tier: 'compound',
  summary: 'A row of pill links to categories, each with a small picture, that scrolls sideways.',
  stories: [
    {
      title: 'Shop by category',
      description: 'The current category has a strong outline; the rest scroll sideways when they don’t fit.',
      code: `<ChipRail label="Shop by category" chips={[{ id: 'sofas', label: 'Sofas', href: '#', picture: '…', current: true }, …]} />`,
      render: () => (
        <ChipRail
          label="Shop by category"
          chips={[
            { id: 'up', label: 'All products', href: '#', icon: 'arrow-up' },
            { id: 'sofas', label: 'Sofas and armchairs', href: '#', picture: pic('product-sofa'), current: true },
            { id: 'tables', label: 'Tables and chairs', href: '#', picture: pic('product-dining-table') },
            { id: 'beds', label: 'Beds', href: '#', picture: pic('product-bed') },
            { id: 'storage', label: 'Storage', href: '#', picture: pic('product-bookcase') },
            { id: 'lighting', label: 'Lighting', href: '#', picture: pic('product-floor-lamp') },
            { id: 'office', label: 'Home office', href: '#', picture: pic('product-desk') },
            { id: 'decor', label: 'Decoration', href: '#', picture: pic('product-plant-pot') },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
