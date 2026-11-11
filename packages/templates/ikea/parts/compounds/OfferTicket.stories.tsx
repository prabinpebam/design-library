import type { StoryFile } from '@design-library/core/components';
import { OfferTicket } from './OfferTicket';

export default {
  component: 'ikea.OfferTicket',
  tier: 'compound',
  summary: 'A small offer shaped as a ticket, on the band surface.',
  stories: [
    {
      title: 'An offer',
      description: 'Round notches cut from its sides; the close Button takes the band’s on-colour. Shown in place here; on a page it’s pinned to the bottom start.',
      code: `<OfferTicket title="15% off your first order" text="…" href="…" closeLabel="Close offer" />`,
      render: () => <OfferTicket title="15% off your first order" text="Join the family club and use your code at checkout." href="#" closeLabel="Close offer" pinned={false} />,
    },
  ],
} satisfies StoryFile;
