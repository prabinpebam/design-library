import { Breadcrumbs } from '../compounds/Breadcrumbs';
import type { StoryFile } from './story';

const settings = [
  { label: 'Home', href: '#/breadcrumbs' },
  { label: 'Settings', href: '#/breadcrumbs' },
  { label: 'Notifications' },
];

const deep = [
  { label: 'Files', href: '#/breadcrumbs' },
  { label: 'Projects', href: '#/breadcrumbs' },
  { label: '2026', href: '#/breadcrumbs' },
  { label: 'Spring launch', href: '#/breadcrumbs' },
  { label: 'Design', href: '#/breadcrumbs' },
  { label: 'Review notes', href: '#/breadcrumbs' },
  { label: 'Final round.pdf' },
];

export default {
  component: 'Breadcrumbs',
  tier: 'compound',
  summary: 'The path from the top of a hierarchy to the current page: each page above is a link, the current page is not.',
  stories: [
    {
      title: 'A short path',
      description: 'Above a page’s title in a deep app. The last step is where you are, so it isn’t a link.',
      code: `<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Settings', href: '/settings' }, { label: 'Notifications' }]} />`,
      render: () => <Breadcrumbs items={settings} />,
    },
    {
      title: 'A long path, collapsed',
      description: 'With a longest length set, the top and the last steps stay and the middle collapses into one button. Press it: the hidden pages appear in place and focus moves to the first.',
      code: `<Breadcrumbs maxItems={4} items={path} />`,
      render: () => <Breadcrumbs maxItems={4} items={deep} />,
    },
    {
      title: 'A long path, in full',
      description: 'With no longest length, every step shows and the line wraps between whole steps. Narrow the window to see it.',
      code: `<Breadcrumbs items={path} />`,
      render: () => <Breadcrumbs items={deep} />,
    },
    {
      title: 'Long names',
      description: 'A name too long for the line wraps inside itself instead of widening the page.',
      code: `<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Quarterly accessibility review for the customer portal and the partner dashboards', href: '…' }, { label: 'Findings' }]} />`,
      render: () => (
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#/breadcrumbs' },
            { label: 'Quarterly accessibility review for the customer portal and the partner dashboards', href: '#/breadcrumbs' },
            { label: 'Findings' },
          ]}
        />
      ),
    },
    {
      title: 'Right to left',
      description: 'The path reads from the right and the separators point the other way.',
      code: `<div dir="rtl"><Breadcrumbs items={path} /></div>`,
      render: () => (
        <div dir="rtl">
          <Breadcrumbs items={settings} />
        </div>
      ),
    },
    {
      title: 'On one line, the current page giving way',
      description: 'LR122 truncate: in a narrow header the path stays on one line; the pages above keep their names and the current page ends in an ellipsis, its full name in a tooltip and the accessible name.',
      code: `<Breadcrumbs truncate items={[{ label: 'Site', href: '/' }, { label: 'Talks', href: '/talks' }, { label: 'Designing for the long tail of accessibility needs' }]} />`,
      render: () => (
        <div style={{ maxInlineSize: '20rem' }}>
          <Breadcrumbs truncate items={[{ label: 'Site', href: '#/breadcrumbs' }, { label: 'Talks', href: '#/breadcrumbs' }, { label: 'Designing for the long tail of accessibility needs' }]} />
        </div>
      ),
    },
  ],
} satisfies StoryFile;
