import { Agenda, type AgendaSlot } from '../compounds/Agenda';
import { Tabs } from '../compounds/Tabs';
import type { StoryFile } from './story';

const morning: AgendaSlot[] = [
  { id: 'doors', start: '08:30', end: '09:30', sessions: [{ id: 'reg', title: 'Registration and coffee', place: 'Foyer', pause: true }] },
  { id: 'open', start: '09:30', end: '10:15', sessions: [{ id: 'k1', title: 'Interfaces that explain themselves', kind: 'Keynote', people: ['Ama Mensah'], place: 'Main hall', href: '#agenda' }] },
  {
    id: 'talks',
    start: '10:30',
    end: '11:15',
    sessions: [
      { id: 't1', title: 'One token, every list of rows', kind: 'Talk', people: ['Mina Haddad'], place: 'Main hall', href: '#agenda' },
      { id: 't2', title: 'Testing focus without a mouse', kind: 'Talk', people: ['Luis Ortega'], place: 'Room 2', href: '#agenda' },
      { id: 'w1', title: 'Build a colour scale by hand', kind: 'Workshop', people: ['Sana Iqbal', 'Tom Becker'], place: 'Studio', description: 'Bring a laptop. 20 places.' },
    ],
  },
  { id: 'lunch', start: '12:30', end: '13:30', sessions: [{ id: 'l', title: 'Lunch', place: 'Terrace', pause: true }] },
];

export default {
  component: 'Agenda',
  tier: 'compound',
  summary: 'A programme in time order: each slot’s time, then the sessions that run then, side by side when they’re parallel.',
  stories: [
    {
      title: 'A morning with parallel sessions',
      description: 'Each session is one quiet surface with its title (a heading, linked to its page), people, kind and place; parallel sessions sit side by side and stack when there isn’t room. Breaks have no surface.',
      code: `<Agenda
  label="Thursday morning"
  slots={[
    { id: 'doors', start: '08:30', end: '09:30', sessions: [{ id: 'reg', title: 'Registration and coffee', place: 'Foyer', pause: true }] },
    { id: 'open', start: '09:30', end: '10:15', sessions: [{ id: 'k1', title: 'Interfaces that explain themselves', kind: 'Keynote', people: ['Ama Mensah'], place: 'Main hall', href: '…' }] },
    { id: 'talks', start: '10:30', end: '11:15', sessions: [ /* three sessions at once */ ] },
    …
  ]}
/>`,
      render: () => <Agenda label="Thursday morning" slots={morning} />,
    },
    {
      title: 'Days in tabs',
      description: 'For a programme over several days, each day is a tab and its agenda is the panel. The agenda brings no heading of its own: the view’s heading introduces it.',
      code: `<Tabs label="Days" items={[
  { id: 'thu', label: 'Thursday 12', panel: <Agenda label="Thursday 12 March" slots={…} /> },
  { id: 'fri', label: 'Friday 13', panel: <Agenda label="Friday 13 March" slots={…} /> },
]} />`,
      render: () => (
        <Tabs
          label="Days"
          items={[
            { id: 'thu', label: 'Thursday 12', panel: <Agenda label="Thursday 12 March" slots={morning.slice(0, 3)} /> },
            { id: 'fri', label: 'Friday 13', panel: <Agenda label="Friday 13 March" slots={morning.slice(1, 2)} /> },
          ]}
        />
      ),
    },
    {
      title: 'Times only, no places',
      description: 'Everything but the times and titles is optional: a simple itinerary or a course day.',
      code: `<Agenda label="Course day" slots={[{ id: 'a', start: '10:00', sessions: [{ id: 'a', title: 'Welcome and introductions' }] }, …]} />`,
      render: () => (
        <Agenda
          label="Course day"
          slots={[
            { id: 'a', start: '10:00', sessions: [{ id: 'a', title: 'Welcome and introductions' }] },
            { id: 'b', start: '10:30', sessions: [{ id: 'b', title: 'Reading a token file' }] },
            { id: 'c', start: '12:00', sessions: [{ id: 'c', title: 'Lunch', pause: true }] },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
