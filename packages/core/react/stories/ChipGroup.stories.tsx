import { useState } from 'react';
import { ChipGroup } from '../fundamentals/ChipGroup';
import type { ChipEntry } from '../fundamentals/ChipGroup';
import type { StoryFile } from './story';

const people: ChipEntry[] = [
  { id: 'asha', label: 'Asha Rao', avatar: { name: 'Asha Rao' } },
  { id: 'tomas', label: 'Tomás Ibarra', avatar: { name: 'Tomás Ibarra' } },
  { id: 'mei', label: 'mei@exampel.com', invalid: true },
  { id: 'jon', label: 'Jon Okafor', avatar: { name: 'Jon Okafor' } },
];

function Recipients() {
  const [chips, setChips] = useState(people);
  return (
    <ChipGroup
      label="Reviewers"
      description="They get a link to this revision."
      chips={chips}
      onRemove={(id) => setChips(chips.filter((c) => c.id !== id))}
      error={chips.some((c) => c.invalid) ? 'mei@exampel.com isn’t a known address. Check the spelling or remove it.' : undefined}
      empty="No reviewers yet."
    />
  );
}

const statuses: ChipEntry[] = ['Open', 'In review', 'Addressed', 'Archived'].map((s) => ({ id: s, label: s }));

function Several() {
  const [value, setValue] = useState(['Open', 'In review']);
  return <ChipGroup label="Status" selection="multiple" chips={statuses} value={value} onChange={setValue} />;
}

const sizes: ChipEntry[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ id: s, label: s }));

function One() {
  const [value, setValue] = useState(['M']);
  return <ChipGroup label="Size" selection="single" chips={sizes} value={value} onChange={setValue} />;
}

const tags: ChipEntry[] = ['tokens', 'colour', 'contrast', 'dark', 'spacing', 'shape', 'motion', 'icons', 'type'].map((t) => ({ id: t, label: t }));

export default {
  component: 'ChipGroup',
  tier: 'fundamental',
  summary: 'A set of chips under one label: values someone picked, or filters they turn on.',
  stories: [
    {
      title: 'Values someone picked',
      description: 'Input chips under a visible label, with one message for the group. One Tab stop: arrows move between chips; Delete or Backspace removes the one in focus, focus moves to the next and the removal is announced. Remove them all to see the empty state.',
      code: `<ChipGroup label="Reviewers" chips={chips} onRemove={remove} error="…" empty="No reviewers yet." />`,
      render: () => <Recipients />,
    },
    {
      title: 'Filters, several on',
      description: 'Filter chips as checkboxes: any number on.',
      code: `<ChipGroup label="Status" selection="multiple" chips={statuses} value={value} onChange={setValue} />`,
      render: () => <Several />,
    },
    {
      title: 'Filters, one on',
      description: 'Filter chips as radios: one on, for more options than a SegmentedControl shows (it stays the choice for two to five).',
      code: `<ChipGroup label="Size" selection="single" chips={sizes} value={value} onChange={setValue} />`,
      render: () => <One />,
    },
    {
      title: 'More than fit',
      description: 'After maxVisible chips, a “+n” chip shows the rest. Without it, chips wrap onto new lines.',
      code: `<ChipGroup label="Tags" chips={tags} maxVisible={4} />`,
      render: () => <ChipGroup label="Tags" chips={tags} maxVisible={4} size="s" />,
    },
  ],
} satisfies StoryFile;
