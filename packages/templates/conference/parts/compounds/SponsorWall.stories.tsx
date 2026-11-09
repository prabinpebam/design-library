import type { StoryFile } from '@design-library/core/react';
import { SponsorWall, type SponsorLevel } from './SponsorWall';

const levels: SponsorLevel[] = [
  { id: 'lead', title: 'Lead partner', size: 'l', sponsors: [{ name: 'Northwind Freight', href: 'https://example.com/northwind', note: 'Supports the student tickets' }] },
  {
    id: 'partners',
    title: 'Partners',
    size: 'm',
    sponsors: [
      { name: 'Kitewing', note: 'The Thursday evening party' },
      { name: 'Larchfield Type', note: 'The workshops' },
      { name: 'Tarn Studio' },
    ],
  },
  { id: 'supporters', title: 'Supporters', size: 's', sponsors: [{ name: 'Harbour Coffee' }, { name: 'Meadow Print' }, { name: 'Dune Audio' }, { name: 'Frost Labs' }] },
];

export default {
  component: 'conference.SponsorWall',
  tier: 'compound',
  summary: 'An event’s sponsors by level, largest first, as quiet tiles with their names.',
  stories: [
    {
      title: 'Three levels',
      description: 'A lead partner large, partners with what they support, then supporters small.',
      code: `<SponsorWall levels={[{ id: 'lead', title: 'Lead partner', size: 'l', sponsors: [{ name: 'Northwind Freight', href: '…', note: '…' }] }, …]} />`,
      render: () => <SponsorWall levels={levels} />,
    },
    {
      title: 'One level',
      description: 'A small event thanks its supporters in one level.',
      code: `<SponsorWall levels={[{ id: 'supporters', title: 'Thank you', size: 'm', sponsors: [{ name: 'Harbour Coffee' }, { name: 'Meadow Print' }] }]} />`,
      render: () => <SponsorWall levels={[{ id: 'thanks', title: 'Thank you', size: 'm', sponsors: [{ name: 'Harbour Coffee' }, { name: 'Meadow Print' }] }]} />,
    },
  ],
} satisfies StoryFile;
