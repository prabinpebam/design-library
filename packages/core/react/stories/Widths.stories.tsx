import { useState } from 'react';
import { Dialog } from '../compounds/Dialog';
import { Sheet } from '../compounds/Sheet';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Link } from '../fundamentals/Link';
import { MenuButton } from '../fundamentals/MenuButton';
import { Popover } from '../fundamentals/Popover';
import { Select } from '../fundamentals/Select';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { TextField } from '../fundamentals/TextField';
import type { StoryFile } from './story';

const none = () => {};

const sort = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'size', label: 'Size' },
];

const share = [
  { value: 'link', label: 'Copy a link to this view' },
  { value: 'invite', label: 'Invite people by email' },
  { value: 'pdf', label: 'Export as PDF' },
];

const move = [
  { value: 'launch', label: 'Spring launch: campaign assets' },
  { value: 'review', label: 'Quarterly review: finance and planning' },
  { value: 'hiring', label: 'Hiring: interview schedules' },
];

const cleanUp = [
  { value: 'drafts', label: 'Delete empty drafts' },
  { value: 'archive', label: 'Archive every project nobody has opened in the last twelve months' },
];

const layouts = [
  { value: 'grid', label: 'Grid', description: 'Cards in rows, with a picture on each.' },
  { value: 'list', label: 'List', description: 'One line each, sorted by the column you choose.' },
  { value: 'board', label: 'Board', description: 'Columns by status; drag a card to move it on.' },
];

const units = [
  { value: 'px', label: 'px' },
  { value: 'rem', label: 'rem' },
  { value: 'pct', label: '%' },
];

function Choose({ label, options, value: start }: { label: string; options: { value: string; label: string }[]; value: string }) {
  const [value, setValue] = useState(start);
  return <Select label={label} options={options} value={value} onChange={setValue} />;
}

function Dialogs() {
  const [open, setOpen] = useState<'s' | 'm' | 'l' | null>(null);
  const close = () => setOpen(null);
  return (
    <>
      <Button label="Delete project (s)" onClick={() => setOpen('s')} />
      <Button label="Rename project (m)" onClick={() => setOpen('m')} />
      <Button label="Compare plans (l)" onClick={() => setOpen('l')} />
      <Dialog
        open={open === 's'}
        onClose={close}
        size="s"
        title="Delete Spring launch?"
        description="It moves to the bin for 30 days."
        actions={
          <>
            <Button label="Cancel" onClick={close} />
            <Button label="Delete" emphasis="primary" onClick={close} />
          </>
        }
      />
      <Dialog
        open={open === 'm'}
        onClose={close}
        title="Rename the project"
        description="Everyone with access sees the new name."
        actions={
          <>
            <Button label="Cancel" onClick={close} />
            <Button label="Rename" emphasis="primary" onClick={close} />
          </>
        }
      >
        <TextField label="Project name" value="Spring launch" onCommit={none} />
      </Dialog>
      <Dialog
        open={open === 'l'}
        onClose={close}
        size="l"
        title="Compare plans"
        description="Every plan includes unlimited viewers."
        actions={<Button label="Done" emphasis="primary" onClick={close} />}
      >
        <Stack gap="item">
          <Text>Starter: 3 projects, 5 editors, 10 GB of storage, email support.</Text>
          <Text>Team: unlimited projects, 25 editors, 100 GB of storage, version history for a year.</Text>
          <Text>Business: everything in Team, single sign-on, audit logs and a named contact.</Text>
        </Stack>
      </Dialog>
    </>
  );
}

function Sheets() {
  const [open, setOpen] = useState<'s' | 'm' | 'l' | null>(null);
  const close = () => setOpen(null);
  const titles = { s: 'Members', m: 'Project details', l: 'Edit the brief' };
  return (
    <>
      <Button label="Members (s)" onClick={() => setOpen('s')} />
      <Button label="Project details (m)" onClick={() => setOpen('m')} />
      <Button label="Edit the brief (l)" onClick={() => setOpen('l')} />
      {open && (
        <Sheet open onClose={close} size={open} title={titles[open]} actions={<Button label="Close" onClick={close} />}>
          <Text>{open === 's' ? 'Maya Chen, Arjun Rao and Sam Okafor can edit.' : open === 'm' ? 'Created 3 March by Maya Chen. Last changed yesterday.' : 'The spring campaign introduces the new range to existing customers first, then opens to everyone a week later.'}</Text>
        </Sheet>
      )}
    </>
  );
}

export default {
  component: 'Widths',
  tier: 'fundamental',
  summary: 'The width scale at work: lists that fit their content, and surfaces at their step.',
  stories: [
    {
      title: 'Lists fit their items',
      description: 'Each menu takes the narrowest step that holds its longest item: Sort is xs (12 rem), Share sm (16 rem), Move to md (20 rem). No width to set.',
      code: `<MenuButton label="Sort" items={sort} onSelect={sortBy} />
<MenuButton label="Share" items={share} onSelect={share} />
<MenuButton label="Move to" items={projects} onSelect={moveTo} />`,
      render: () => (
        <>
          <MenuButton label="Sort" items={sort} onSelect={none} />
          <MenuButton label="Share" items={share} onSelect={none} />
          <MenuButton label="Move to" items={move} onSelect={none} />
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'Long items wrap at the cap',
      description: 'A list never grows past md (20 rem) on its own; an item longer than that wraps inside it.',
      code: `<MenuButton label="Clean up" items={cleanUp} onSelect={run} />`,
      render: () => <MenuButton label="Clean up" items={cleanUp} onSelect={none} />,
      arrangement: 'row',
    },
    {
      title: 'A select list is never narrower than its box',
      description: 'The list takes at least the box’s width, so it reads as the box opened, even when its options are short. Past the box’s width it fits and snaps like a menu.',
      code: `<Select label="Unit" options={units} value={unit} onChange={setUnit} />`,
      render: () => <Choose label="Unit" options={units} value="rem" />,
    },
    {
      title: 'Items with descriptions pin lg',
      description: 'A description line needs room to read in one or two lines: pin lg (24 rem).',
      code: `<MenuButton label="Layout" items={layouts} onSelect={setLayout} listWidth="lg" />`,
      render: () => <MenuButton label="Layout" items={layouts} onSelect={none} listWidth="lg" />,
      arrangement: 'row',
    },
    {
      title: 'Menus side by side match',
      description: 'Menus opened from one toolbar pin the same step, so moving between them doesn’t change the width.',
      code: `<MenuButton label="Sort" items={sort} onSelect={sortBy} listWidth="sm" />
<MenuButton label="Share" items={share} onSelect={share} listWidth="sm" />`,
      render: () => (
        <Cluster gap="pair">
          <MenuButton label="Sort" items={sort} onSelect={none} emphasis="quiet" listWidth="sm" />
          <MenuButton label="Share" items={share} onSelect={none} emphasis="quiet" listWidth="sm" />
        </Cluster>
      ),
      arrangement: 'row',
    },
    {
      title: 'Popovers by what they hold',
      description: 'sm for a line and a button, md (default) for help with a link, lg for filters or paired fields.',
      code: `<Popover width="sm" trigger={{ label: 'Delete' }}>…</Popover>
<Popover trigger={{ label: 'About sharing' }} title="Sharing">…</Popover>
<Popover width="lg" trigger={{ label: 'Filters' }} title="Filters">…</Popover>`,
      render: () => (
        <>
          <Popover width="sm" trigger={{ label: 'Delete' }}>
            <Text>It moves to the bin for 30 days.</Text>
            <Button label="Delete" emphasis="primary" onClick={none} />
          </Popover>
          <Popover trigger={{ label: 'About sharing' }} title="Sharing">
            <Text>People you invite can edit; anyone with the link can view.</Text>
            <Link href="#/widths">How sharing works</Link>
          </Popover>
          <Popover width="lg" trigger={{ label: 'Filters' }} title="Filters">
            <Cluster gap="item" wrap>
              <TextField label="Changed after" value="1 March" onCommit={none} />
              <TextField label="Changed before" value="31 March" onCommit={none} />
            </Cluster>
          </Popover>
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'Dialogs by purpose',
      description: 's (24 rem) for a question and two buttons, m (32 rem) for a form, l (48 rem) for a table or a comparison. The same purpose gets the same size everywhere.',
      code: `<Dialog size="s" title="Delete Spring launch?" … />
<Dialog title="Rename the project" …>…</Dialog>
<Dialog size="l" title="Compare plans" …>…</Dialog>`,
      render: () => <Dialogs />,
      arrangement: 'row',
    },
    {
      title: 'Sheets by purpose',
      description: 's (20 rem) for a narrow list, m (24 rem) for details or a form, l (40 rem) for an editor.',
      code: `<Sheet size="s" title="Members" …>…</Sheet>
<Sheet title="Project details" …>…</Sheet>
<Sheet size="l" title="Edit the brief" …>…</Sheet>`,
      render: () => <Sheets />,
      arrangement: 'row',
    },
  ],
} satisfies StoryFile;
