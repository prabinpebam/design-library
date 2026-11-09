import { useState } from 'react';
import { Breadcrumbs } from '../compounds/Breadcrumbs';
import { Navigation } from '../compounds/Navigation';
import { Button } from '../fundamentals/Button';
import { DescriptionList } from '../compounds/DescriptionList';
import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import { AppLayout } from '../layouts/AppLayout';
import type { StoryFile } from './story';

function Demo({ details = false }: { details?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <AppLayout
      height="lg"
      label="Backlog"
      sidebarOpen={open}
      onSidebarToggle={() => setOpen((x) => !x)}
      sidebar={<Navigation groups={[{ id: 'kw', title: 'Kitewing app', items: [{ id: 'board', label: 'Board', href: '#board' }, { id: 'backlog', label: 'Backlog', href: '#backlog' }, { id: 'reports', label: 'Reports', href: '#reports' }] }]} current="backlog" />}
      header={<Breadcrumbs items={[{ label: 'Kitewing app', href: '#board' }, { label: 'Backlog' }]} />}
      headerEnd={<Button label="Create issue" emphasis="primary" size="s" />}
      aside={details ? <DescriptionList items={[{ term: 'Status', details: 'In progress' }, { term: 'Assignee', details: 'Ama Mensah' }, { term: 'Sprint', details: 'Sprint 14' }]} /> : undefined}
    >
      <Heading level={2} size={2}>
        Backlog
      </Heading>
      <Text as="p">Eleven issues are planned for this sprint and 24 wait in the backlog.</Text>
    </AppLayout>
  );
}

export default {
  component: 'AppLayout',
  tier: 'layout',
  summary: 'A working app: a collapsible sidebar of places, a header, and the view, which scrolls on its own; optionally a details column.',
  stories: [
    {
      title: 'Sidebar, header and the view',
      description: 'The sidebar is set apart by its tone. The header holds where you are and the main action; the view scrolls on its own under it. Close the sidebar with the button at the start of the header.',
      code: `<AppLayout
  label="Backlog"
  sidebar={<Navigation … />} sidebarOpen={open} onSidebarToggle={…}
  header={<Breadcrumbs … />}
  headerEnd={<Button label="Create issue" emphasis="primary" size="s" />}
>
  …the view
</AppLayout>`,
      render: () => <Demo />,
    },
    {
      title: 'With a details column',
      description: '`aside` puts an item’s fields beside the view; in a narrow window they move under it.',
      code: `<AppLayout … aside={<DescriptionList items={…} />}>…</AppLayout>`,
      render: () => <Demo details />,
    },
  ],
} satisfies StoryFile;
