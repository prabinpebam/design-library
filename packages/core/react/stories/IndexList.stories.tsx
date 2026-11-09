import { IndexList } from '../compounds/IndexList';
import type { StoryFile } from './story';

export default {
  component: 'IndexList',
  tier: 'compound',
  summary: 'A way into each page of a set, with one line on what it holds.',
  stories: [
    {
      title: 'Pages of a set',
      description: 'As many columns as fit; each entry a link and its one line.',
      code: `<IndexList items={[{ id: 'colour', title: 'Colour', href: '#/colour', summary: '…' }, …]} />`,
      render: () => (
        <IndexList
          items={[
            { id: 'colour', title: 'Colour', href: '#/colour', summary: 'Brand, base, functional, spectrum and custom colours.' },
            { id: 'type', title: 'Typography', href: '#/type', summary: 'Two font stacks and one set of text styles.' },
            { id: 'space', title: 'Space and size', href: '#/space', summary: 'One base unit, roles named by relationship.' },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
