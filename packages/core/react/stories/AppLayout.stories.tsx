import { useState } from 'react';
import { Breadcrumbs } from '../compounds/Breadcrumbs';
import { Navigation } from '../compounds/Navigation';
import { Button } from '../fundamentals/Button';
import { DescriptionList } from '../compounds/DescriptionList';
import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import { AppLayout } from '../layouts/AppLayout';
import { EditorLayout } from '../layouts/EditorLayout';
import type { StoryFile } from './story';
import { WithSettings } from './WithSettings';

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

const areas = <Navigation groups={[{ id: 'site', title: 'Site', items: [{ id: 'pages', label: 'Pages', href: '#pages' }, { id: 'talks', label: 'Talks', href: '#talks' }, { id: 'media', label: 'Media', href: '#media' }] }]} current="pages" />;

const roomUnder = { '--c-app-layout-end': 'var(--space-16)' };

function RoomUnder() {
  const [open, setOpen] = useState(true);
  return (
    <WithSettings settings={roomUnder} contents>
      <AppLayout height="lg" label="Navigation" sidebar={areas} sidebarOpen={open} onSidebarToggle={() => setOpen((x) => !x)} header={<Text as="span">Navigation</Text>}>
        <Heading level={2} size={2}>
          Navigation
        </Heading>
        <Text as="p">Five entries, in the order they show.</Text>
        <Text as="p">Scroll to the end: the last part stops well above the scroller’s edge, with room the margin alone wouldn’t give.</Text>
        <Button label="Add link" />
      </AppLayout>
    </WithSettings>
  );
}

function Modes() {  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<'docked' | 'floating'>('docked');
  return (
    <AppLayout height="lg" label="Pages" startMode={mode} onStartModeChange={setMode} sidebarOpen={open} onSidebarToggle={() => setOpen((x) => !x)} sidebar={areas} header={<Text as="span">Pages</Text>}>
      <Heading level={2} size={2}>
        Pages
      </Heading>
      <Text as="p">Unpin the sidebar and it floats over the view; a press anywhere outside it closes it.</Text>
    </AppLayout>
  );
}

function WithEditor() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'docked' | 'floating'>('floating');
  const [outline, setOutline] = useState(true);
  const [inspector, setInspector] = useState(true);
  return (
    <AppLayout height="lg" width="edge" label="Edit About" startMode={mode === 'docked' ? 'auto' : 'floating'} floatBelow="76rem" onStartModeChange={setMode} sidebarOpen={open} onSidebarToggle={() => setOpen((x) => !x)} sidebar={areas} header={<Text as="span">About</Text>}>
      <EditorLayout startOpen={outline} onStartToggle={() => setOutline((x) => !x)} start={<Text>Outline</Text>} startLabel="Outline" endOpen={inspector} onEndToggle={() => setInspector((x) => !x)} end={<Text>Inspector</Text>} endLabel="Inspector">
        <Text>The page</Text>
      </EditorLayout>
    </AppLayout>
  );
}

const ruled = { '--c-app-layout-header-divider-width': 'var(--border-hairline)' };

function Across() {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<'docked' | 'floating'>('docked');
  return (
    <WithSettings settings={ruled} contents>
      <AppLayout height="lg" label="Pages" headerSpan="across" labels={{ open: 'Site areas', close: 'Site areas', pin: 'Pin areas', unpin: 'Unpin areas' }} startMode={mode} onStartModeChange={setMode} sidebarOpen={open} onSidebarToggle={() => setOpen((x) => !x)} sidebar={areas} header={<Text as="span">Site editor</Text>}>
        <Heading level={2} size={2}>
          Pages
        </Heading>
        <Text as="p">The bar spans the app, ruled off by a theme setting; the docked areas sit under it.</Text>
      </AppLayout>
    </WithSettings>
  );
}

function Dense() {
  const [open, setOpen] = useState(true);
  return (
    <AppLayout size="s" height="lg" label="Dashboard" headerSpan="across" sidebarOpen={open} onSidebarToggle={() => setOpen((x) => !x)}
      sidebar={<Navigation size="s" groups={[{ id: 'content', title: 'Content', items: [{ id: 'dashboard', label: 'Dashboard', href: '#dashboard' }, { id: 'pages', label: 'Pages', href: '#pages' }, { id: 'media', label: 'Media', href: '#media' }, { id: 'albums', label: 'Albums', href: '#albums' }] }, { id: 'site', title: 'Site', items: [{ id: 'settings', label: 'Settings', href: '#settings' }, { id: 'theme', label: 'Theme', href: '#theme' }] }]} current="dashboard" />}
      header={<Text as="span">Studio</Text>}>
      <Heading level={2} size={2}>
        Dashboard
      </Heading>
      <Text as="p">A desktop editor’s frame: a low bar and a narrow column of small rows under small muted group titles.</Text>
    </AppLayout>
  );
}

function CompactHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ maxInlineSize: '40rem' }}>
      <AppLayout
        height="lg"
        label="Speakers"
        compactHeader
        sidebarOpen={open}
        onSidebarToggle={() => setOpen((x) => !x)}
        sidebar={<Navigation groups={[{ id: 'site', title: 'Site', items: [{ id: 'pages', label: 'Pages', href: '#pages' }, { id: 'speakers', label: 'Speakers', href: '#speakers' }] }]} current="speakers" />}
        header={<Breadcrumbs truncate items={[{ label: 'Site', href: '#pages' }, { label: 'Pages', href: '#pages' }, { label: 'Speakers and their talks, 2026 edition' }]} />}
        headerEnd={(compact) => <Button label={compact ? 'Publish' : 'Publish changes'} emphasis="primary" size="s" />}
      >
        <Text>The header stays one line: the path gives way first.</Text>
      </AppLayout>
    </div>
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
    {
      title: 'Docked or floating, by choice',
      description: '`startMode` sets where the sidebar sits. With `onStartModeChange` a pin at the top of the sidebar docks it beside the view (pressed) or floats it over the view; floating, it closes on Escape or a press outside it and the toggle. `auto` docks from `floatBelow` of the layout’s own width and floats under it.',
      code: `<AppLayout startMode={mode} onStartModeChange={setMode} sidebarOpen={open} onSidebarToggle={…} sidebar={<Navigation … />} …>…</AppLayout>`,
      render: () => <Modes />,
    },
    {
      title: 'An editor as the view',
      description: '`width="edge"` gives the view the whole main area under the header, with no margin and no scroller of its own, so it can hold an EditorLayout, which scrolls its own panels. The areas float over it below 76 rem (`startMode="auto"`, `floatBelow="76rem"`).',
      code: `<AppLayout width="edge" startMode="auto" floatBelow="76rem" … ><EditorLayout … /></AppLayout>`,
      render: () => <WithEditor />,
    },
    {
      title: 'The header across, in the product’s words',
      description: '`headerSpan="across"` runs the header over the whole app, so a docked sidebar sits under it. `labels` names the toggle and the pin in the product’s words; with `unpin` the pin’s name changes with the state instead of being a toggle button. A theme draws a rule under the header with `--c-app-layout-header-divider-width`.',
      code: `<AppLayout headerSpan="across" labels={{ open: 'Site areas', close: 'Site areas', pin: 'Pin areas', unpin: 'Unpin areas' }} startMode={mode} onStartModeChange={setMode} …>…</AppLayout>`,
      render: () => <Across />,
    },
    {
      title: 'Dense, a desktop editor’s frame',
      description: '`size="s"` (LR41, LR42) lowers the header to 40 px, narrows the sidebar to 13 rem and brings the view’s title a section’s step over its content; pair it with Navigation `size="s"` (36 px rows, above the WCAG 2.2 AA 24 px minimum, small muted group titles). Every rule that reads the header’s height or the sidebar’s width follows, floating included.',
      code: `<AppLayout size="s" headerSpan="across" sidebar={<Navigation size="s" … />} …>…</AppLayout>`,
      render: () => <Dense />,
    },
    {
      title: 'Room under the last part',
      description: 'LR75: `--c-app-layout-end` (a theme setting, the margin by default) sets the room under the view’s last part inside its scroller, so an editing app’s last field isn’t at the window’s edge.',
      code: `applySettings({ '--c-app-layout-end': 'var(--space-16)' });`,
      render: () => <RoomUnder />,
    },
    {
      title: 'A compact header in a narrow window',
      description: 'LR122 compactHeader: the header’s end keeps its one-line width and the start gives way (pair it with Breadcrumbs truncate). A headerEnd function hears when the layout is narrower than floatBelow, so supplementary words yield while the controls stay.',
      code: `<AppLayout compactHeader header={<Breadcrumbs truncate items={path} />} headerEnd={(compact) => <Button label={compact ? 'Publish' : 'Publish changes'} emphasis="primary" size="s" />} …>`,
      render: () => <CompactHeader />,
    },
  ],
} satisfies StoryFile;