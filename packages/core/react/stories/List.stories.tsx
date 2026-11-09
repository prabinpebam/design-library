import { useState } from 'react';
import { List } from '../fundamentals/List';
import type { ListGroup, ListOption } from '../fundamentals/List';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Link } from '../fundamentals/Link';
import { MenuButton } from '../fundamentals/MenuButton';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const revisions: ListOption[] = [
  { id: 'r1', label: 'Button copy review', description: '4 comments', meta: '09:41' },
  { id: 'r2', label: 'Colour roles in dark', description: '2 comments', meta: 'Yesterday', unread: true },
  { id: 'r3', label: 'Spacing on component pages', description: '7 comments', meta: 'Mon' },
  { id: 'r4', label: 'Typography ramp', description: 'Locked while the owner reviews it.', inactive: true },
];

function SelectOne() {
  const [value, setValue] = useState(['r1']);
  return <List mode="select" selection="single" label="Revision" options={revisions} value={value} onChange={setValue} />;
}

const tiers: ListGroup[] = [
  { id: 'f', heading: 'Fundamentals', options: ['Button', 'TextField', 'Select', 'Switch'].map((n) => ({ id: n, label: n })) },
  { id: 'c', heading: 'Compounds', options: ['Navigation', 'PageHeader', 'DataTable'].map((n) => ({ id: n, label: n })) },
  { id: 'l', heading: 'Layouts', options: [{ id: 'PageLayout', label: 'PageLayout' }, { id: 'Dashboard', label: 'Dashboard', disabled: true, description: 'Proposed, not built yet.' }] },
];

function SelectSeveral() {
  const [value, setValue] = useState(['Button', 'Switch']);
  return <List mode="select" selection="multiple" label="Components to export" groups={tiers} value={value} onChange={setValue} />;
}

const icons: ListGroup[] = [
  { id: 'a', heading: 'Actions', options: (['copy', 'search', 'plus', 'minus', 'close', 'external'] as const).map((n) => ({ id: n, label: n, icon: n })) },
  { id: 's', heading: 'Status', options: (['info', 'success', 'warning', 'error'] as const).map((n) => ({ id: n, label: n, icon: n })) },
  { id: 'n', heading: 'Navigation', options: (['chevron-start', 'chevron-end', 'chevron-down', 'menu'] as const).map((n) => ({ id: n, label: n, icon: n })) },
];

function Sticky() {
  const [value, setValue] = useState(['search']);
  return <List mode="select" selection="single" label="Icon" groups={icons} stickyHeadings maxSize="sm" size="s" value={value} onChange={setValue} />;
}
export default {
  component: 'List',
  tier: 'fundamental',
  summary: 'Items that belong together: notes read one after another, or short names in a wrapping row.',
  stories: [
    {
      title: 'Bulleted',
      description: 'Notes read one after another, on a running-text line.',
      code: `<List items={[{ id: 'label', content: <Text>Every field has a visible label.</Text> }, …]} />`,
      render: () => (
        <List
          items={[
            { id: 'label', content: <Text>Every field has a visible label.</Text> },
            { id: 'error', content: <Text>An error says what happened and how to fix it.</Text> },
            { id: 'input', content: <Text>Typed input is never lost.</Text> },
          ]}
        />
      ),
    },
    {
      title: 'Inline',
      description: 'Short names that wrap in a row, such as the components one uses.',
      code: `<List variant="inline" items={[{ id: 'text', content: <Link href="#/text">Text</Link> }, …]} />`,
      render: () => (
        <List
          variant="inline"
          items={['Text', 'Heading', 'Icon', 'Button'].map((n) => ({ id: n, content: <Link href={`#/${n.toLowerCase()}`}>{n}</Link> }))}
        />
      ),
    },
    {
      title: 'Numbered',
      description: 'Steps followed in order, or a ranking: the number is part of the meaning.',
      code: `<List variant="numbered" items={[{ id: 'pick', content: <Text>Pick an element on the page.</Text> }, …]} />`,
      render: () => (
        <List
          variant="numbered"
          items={[
            { id: 'pick', content: <Text>Pick an element on the page.</Text> },
            { id: 'say', content: <Text>Say what should change.</Text> },
            { id: 'copy', content: <Text>Copy the prompt for the agent.</Text> },
          ]}
        />
      ),
    },
    {
      title: 'Plain',
      description: 'Items with no marker, where a bullet would add nothing: each item already starts with a word that leads.',
      code: `<List variant="plain" items={…} />`,
      render: () => (
        <List
          variant="plain"
          items={[
            { id: 'a', content: <Text>Tokens: colour, space, shape, type and motion.</Text> },
            { id: 'b', content: <Text>Fundamentals: the smallest components.</Text> },
          ]}
        />
      ),
    },
    {
      title: 'Select one',
      description: 'A list on the page that one item is chosen from, such as a master list beside its detail. One Tab stop; arrows move, Space or Enter chooses, letters jump. Moving never changes the choice.',
      code: `<List mode="select" selection="single" label="Revision" options={revisions} value={value} onChange={setValue} />`,
      render: () => <SelectOne />,
    },
    {
      title: 'Select several, in groups',
      description: 'Each option has a box. Space toggles, Shift+arrows extend, Shift+Space chooses a range, Ctrl+A chooses all or none; a click toggles and Shift+click chooses a range. Groups are told apart by a heading and space, never a divider.',
      code: `<List mode="select" selection="multiple" label="Components to export" groups={groups} value={value} onChange={setValue} />`,
      render: () => <SelectSeveral />,
    },
    {
      title: 'Sticky headings',
      description: 'In a long grouped list that scrolls, each heading stays at the top while its options pass under it, so the group in view is always named.',
      code: `<List mode="select" selection="single" label="Icon" groups={groups} stickyHeadings maxSize="sm" value={value} onChange={setValue} />`,
      render: () => <Sticky />,
    },
    {
      title: 'Actions on the page',
      description: 'Each item runs something: its own Tab stop, Enter or Space runs it. Danger says so in words and colour; busy keeps the label; unavailable says why.',
      code: `<List mode="action" label="Project actions" actions={[{ id: 'dup', label: 'Duplicate project', icon: 'copy', onSelect: duplicate }, …, { id: 'del', label: 'Delete project', tone: 'danger', onSelect: remove }]} />`,
      render: () => <Actions />,
    },
    {
      title: 'Drill-in rows with inset dividers',
      description: 'A settings index: each row opens a deeper page in place, shown by the trailing chevron; the label names where it goes. Inset dividers start at the words.',
      code: `<List mode="action" label="Settings" dividers="inset" actions={[{ id: 'account', label: 'Account', description: 'Name, email and password', icon: 'info', drillIn: true, onSelect: open }, …]} />`,
      render: () => <DrillIn />,
    },
    {
      title: 'Groups split by a divider',
      description: 'Groups without headings, told apart by one line between groups; with headings, space alone separates them.',
      code: `<List mode="action" dividers="groups" groups={[{ id: 'edit', actions: [...] }, { id: 'danger', actions: [...] }]} />
<List mode="action" groups={[{ id: 'file', heading: 'File', actions: [...] }, …]} />`,
      render: () => <Grouped />,
    },
    {
      title: 'Plain list with dividers',
      description: 'Plain items split by a full-width line, for long items read one after another.',
      code: `<List variant="plain" dividers="between" items={notes} />`,
      render: () => (
        <List
          variant="plain"
          dividers="between"
          items={[
            { id: 'a', content: 'Tokens are generated from one config; never edit the output by hand.' },
            { id: 'b', content: 'Components read semantic roles only; status meaning comes from status colours.' },
            { id: 'c', content: 'Views have no styles of their own: they arrange components from data.' },
          ]}
        />
      ),
    },
    {
      title: 'Items that come and go',
      description:
        'An item added fades in where it lands; one removed fades out where it is, then the items after it slide up into its place. Several at once are one change: remove three and they fade together and the rest slide once. Sort, and every item travels to its new place. Past 30 moving items (count.flip-max) nothing travels: the list fades its new order in. Reduced motion: nothing slides; the fades stay.',
      code: `<List variant="plain" dividers="between" items={files} />  // add, remove or reorder items; the list moves them`,
      render: () => <ComeAndGo />,
    },
    {
      title: 'Reorder: drag a handle or use its menu',
      description: 'Drag the handle to move an item; click or press Enter on it for Move up, down, to top or to bottom (only the moves that make sense). Where it landed is announced. A move from the menu slides the rows into their new order; a drag reorders under the pointer at once.',
      code: `<List variant="numbered" reorderable items={priorities} onReorder={setOrder} />`,
      render: () => <Reorder />,
    },
    {
      title: 'Grid list: rows with their own controls',
      description: 'Rows can be chosen (Space or a click on the row) and also hold buttons and a menu. One Tab stop: arrows move between rows, Right moves into a row’s controls, Left or Escape comes back; Enter opens the row.',
      code: `<List mode="grid" label="Files" selection="multiple" value={chosen} onChange={setChosen} rows={[{ id: 'brief', label: 'Brief.pdf', meta: '2.4 MB', onAction: open, controls: <><Button label="Share Brief.pdf" icon="external" iconOnly emphasis="quiet" size="s" onClick={share} /><MenuButton label="More for Brief.pdf" icon="menu" iconOnly emphasis="quiet" size="s" items={more} onSelect={act} /></> }, …]} />`,
      render: () => <Files />,
    },
  ],
} satisfies StoryFile;

function Files() {
  const [chosen, setChosen] = useState<string[]>(['tokens']);
  const [last, setLast] = useState('Nothing done yet.');
  const files = [
    { id: 'brief', label: 'Brief.pdf', description: 'Edited today by Asha', meta: '2.4 MB' },
    { id: 'tokens', label: 'tokens.json', description: 'Generated, do not edit', meta: '86 KB' },
    { id: 'review', label: 'Review notes.md', description: 'Shared with 3 people', meta: '12 KB' },
    { id: 'old', label: 'Archive 2025.zip', description: 'Read-only', meta: '1.1 GB', disabled: true },
  ];
  return (
    <>
      <List
        mode="grid"
        label="Files"
        selection="multiple"
        value={chosen}
        onChange={setChosen}
        rows={files.map((f) => ({
          ...f,
          icon: 'copy' as const,
          onAction: () => setLast(`Opened ${f.label}.`),
          controls: (
            <>
              <Button label={`Share ${f.label}`} icon="external" iconOnly emphasis="quiet" size="s" disabled={f.disabled} onClick={() => setLast(`Shared ${f.label}.`)} />
              <MenuButton
                label={`More for ${f.label}`}
                icon="menu"
                iconOnly
                emphasis="quiet"
                size="s"
                disabled={f.disabled}
                items={[
                  { value: 'rename', label: 'Rename' },
                  { value: 'delete', label: 'Delete' },
                ]}
                onSelect={(v) => setLast(`${v === 'rename' ? 'Renaming' : 'Asked to delete'} ${f.label}.`)}
              />
            </>
          ),
        }))}
      />
      <Text variant="body-sm" tone="muted">{`${chosen.length} chosen. ${last}`}</Text>
    </>
  );
}

const uploads = ['Brief.pdf', 'tokens.json', 'Review notes.md', 'Logo.svg', 'Roadmap.key', 'Budget.xlsx', 'Interview 3.m4a', 'Sitemap.png', 'Release notes.md', 'Fonts.zip'];

function ComeAndGo() {
  const [files, setFiles] = useState(uploads.slice(0, 5));
  const [next, setNext] = useState(5);
  const add = (n: number) => {
    const more = Array.from({ length: n }, (_, i) => `${uploads[(next + i) % uploads.length]}${next + i >= uploads.length ? ` (${Math.floor((next + i) / uploads.length) + 1})` : ''}`);
    setNext(next + n);
    setFiles((f) => [...more.slice(0, 1), ...f, ...more.slice(1)]);
  };
  return (
    <>
      <Cluster>
        <Button label="Add a file" emphasis="quiet" size="s" onClick={() => add(1)} />
        <Button label="Remove the first" emphasis="quiet" size="s" disabled={!files.length} onClick={() => setFiles((f) => f.slice(1))} />
        <Button label="Remove three" emphasis="quiet" size="s" disabled={files.length < 3} onClick={() => setFiles((f) => f.filter((_, i) => i % 2 === 1 || i > 4))} />
        <Button label="Sort by name" emphasis="quiet" size="s" onClick={() => setFiles((f) => [...f].sort((a, b) => a.localeCompare(b)))} />
        <Button label="Add 40" emphasis="quiet" size="s" onClick={() => add(40)} />
        <Button label="Clear the list" emphasis="quiet" size="s" disabled={!files.length} onClick={() => setFiles([])} />
      </Cluster>
      <List variant="plain" dividers="between" items={files.map((f) => ({ id: f, content: f }))} />
      <Text variant="body-sm" tone="muted">{files.length ? `${files.length} files.` : 'No files. Add one to see it arrive.'}</Text>
    </>
  );
}

const priorityItems = [
  { id: 'tokens', label: 'Token build' },
  { id: 'slider', label: 'Slider family' },
  { id: 'lists', label: 'List modes' },
  { id: 'pickers', label: 'Date and time pickers' },
  { id: 'charts', label: 'Chart primitives' },
];

function Reorder() {
  const [order, setOrder] = useState(priorityItems.map((p) => p.id));
  const items = order.map((id) => {
    const p = priorityItems.find((x) => x.id === id)!;
    return { id, label: p.label, content: p.label };
  });
  return (
    <>
      <List variant="numbered" reorderable items={items} onReorder={setOrder} />
      <List variant="plain" dividers="between" reorderable items={items.slice(0, 3)} onReorder={(ids) => setOrder([...ids, ...order.slice(3)])} />
    </>
  );
}

function useLast() {
  const [last, setLast] = useState('Nothing run yet.');
  return [last, (what: string) => () => setLast(what)] as const;
}

function Actions() {
  const [last, did] = useLast();
  return (
    <>
      <List
        mode="action"
        label="Project actions"
        actions={[
          { id: 'dup', label: 'Duplicate project', icon: 'copy', onSelect: did('Duplicated the project.') },
          { id: 'share', label: 'Share link', icon: 'external', description: 'Anyone with the link can view', onSelect: did('Copied the share link.') },
          { id: 'export', label: 'Export tokens', icon: 'plus', busy: true, onSelect: did('Exporting.') },
          { id: 'archive', label: 'Archive', icon: 'comment', inactive: true, description: 'Only owners can archive this project', onSelect: did('Archived.') },
          { id: 'del', label: 'Delete project', icon: 'close', tone: 'danger', onSelect: did('Asked to delete the project.') },
        ]}
      />
      <Text variant="body-sm" tone="muted">{last}</Text>
    </>
  );
}

function DrillIn() {
  const [last, did] = useLast();
  return (
    <>
      <List
        mode="action"
        label="Settings"
        dividers="inset"
        actions={[
          { id: 'account', label: 'Account', description: 'Name, email and password', icon: 'info', drillIn: true, onSelect: did('Opened Account.') },
          { id: 'appearance', label: 'Appearance', description: 'Theme, contrast and density', icon: 'scheme-light', drillIn: true, onSelect: did('Opened Appearance.') },
          { id: 'notify', label: 'Notifications', meta: '3 on', icon: 'comment', drillIn: true, onSelect: did('Opened Notifications.') },
          { id: 'search', label: 'Search and indexing', icon: 'search', drillIn: true, onSelect: did('Opened Search and indexing.') },
        ]}
      />
      <Text variant="body-sm" tone="muted">{last}</Text>
    </>
  );
}

function Grouped() {
  const [last, did] = useLast();
  return (
    <>
      <List
        mode="action"
        label="Selection"
        dividers="groups"
        size="s"
        groups={[
          {
            id: 'edit',
            actions: [
              { id: 'copy', label: 'Copy', icon: 'copy', meta: 'Ctrl+C', onSelect: did('Copied.') },
              { id: 'comment', label: 'Comment', icon: 'comment', onSelect: did('Started a comment.') },
            ],
          },
          { id: 'danger', actions: [{ id: 'remove', label: 'Remove from page', icon: 'close', tone: 'danger', onSelect: did('Asked to remove it.') }] },
        ]}
      />
      <List
        mode="action"
        groups={[
          { id: 'file', heading: 'File', actions: [{ id: 'new', label: 'New page', icon: 'plus', onSelect: did('Made a new page.') }] },
          { id: 'view', heading: 'View', actions: [{ id: 'theme', label: 'Switch to dark', icon: 'scheme-dark', onSelect: did('Switched to dark.') }] },
        ]}
      />
      <Text variant="body-sm" tone="muted">{last}</Text>
    </>
  );
}
