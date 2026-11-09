import { Button, Heading, Text, type StoryFile } from '@design-library/core/react';
import { Countdown } from '../fundamentals/Countdown';
import { SponsorWall } from '../compounds/SponsorWall';
import { SponsorsLayout } from './SponsorsLayout';

export default {
  component: 'conference.SponsorsLayout',
  tier: 'layout',
  summary: 'An intro column beside the sponsors by level; stacked in a narrow window.',
  stories: [
    {
      title: 'Intro and levels',
      description: 'The intro holds why, the time left and the way to join; the levels hold a SponsorWall. Narrow the window: the intro moves above.',
      code: `<SponsorsLayout intro={<>…</>} levels={<SponsorWall levels={…} />} />`,
      render: () => (
        <SponsorsLayout
          intro={
            <>
              <Heading level={2} size={3}>
                Thank you
              </Heading>
              <Text as="p">Interface Days is free for students because of the companies here.</Text>
              <Countdown label="Doors open in" until="2027-03-11T09:00:00+00:00" passed="The conference has started" now="2027-02-28T15:00:00+00:00" />
              <Button label="Become a sponsor" emphasis="primary" />
            </>
          }
          levels={<SponsorWall headingLevel={3} levels={[{ id: 'partners', title: 'Partners', size: 'm', sponsors: [{ name: 'Kitewing' }, { name: 'Larchfield Type' }, { name: 'Tarn Studio' }] }]} />}
        />
      ),
    },
  ],
} satisfies StoryFile;
