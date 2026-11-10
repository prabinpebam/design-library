import type { StoryFile } from '@design-library/core/components';
import { Countdown } from './Countdown';

export default {
  component: 'conference.Countdown',
  tier: 'fundamental',
  summary: 'How long until a moment a person is waiting for, in their language; it says something else once the moment passes.',
  stories: [
    {
      title: 'Days and hours',
      description: 'More than a day to go: days, then hours.',
      code: `<Countdown label="Doors open in" until="2027-03-11T09:00:00+00:00" passed="The conference has started" />`,
      render: () => <Countdown label="Doors open in" until="2027-03-11T09:00:00+00:00" passed="The conference has started" now="2027-02-28T15:00:00+00:00" />,
    },
    {
      title: 'The last day',
      description: 'Under a day to go: hours, then minutes.',
      code: `<Countdown label="Ticket sale ends in" until="2027-03-01T18:00:00+00:00" passed="Ticket sale has ended" />`,
      render: () => <Countdown label="Ticket sale ends in" until="2027-03-01T18:00:00+00:00" passed="Ticket sale has ended" now="2027-03-01T13:25:00+00:00" />,
    },
    {
      title: 'After the moment',
      description: 'The moment has passed: the `passed` words, with no figure.',
      code: `<Countdown label="Doors open in" until="2027-03-11T09:00:00+00:00" passed="The conference has started" />`,
      render: () => <Countdown label="Doors open in" until="2027-03-11T09:00:00+00:00" passed="The conference has started" now="2027-03-11T10:00:00+00:00" />,
    },
  ],
} satisfies StoryFile;
