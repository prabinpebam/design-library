import { useState } from 'react';
import { Heading } from '../fundamentals/Heading';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { PageGrid, type PageGridCell, type PageGridRow } from '../layouts/PageGrid';
import type { StoryFile } from './story';

const words: Record<string, { heading: string; text: string }> = {
  intro: { heading: 'A city festival of design', text: 'One row, one cell: the whole width.' },
  talks: { heading: 'Talks', text: 'Two thirds of the row.' },
  dates: { heading: 'Dates', text: 'One third: the split two-thirds-start.' },
  a: { heading: 'Workshops', text: 'A third.' },
  b: { heading: 'Walks', text: 'A third.' },
  c: { heading: 'Evenings', text: 'A third.' },
  venue: { heading: 'Venue', text: 'A half, whole.' },
  top: { heading: 'Getting there', text: 'A half split into rows: this row is whole.' },
  bus: { heading: 'Bus', text: 'Then halves of the half.' },
  ferry: { heading: 'Ferry', text: 'Each a quarter of the page.' },
};

function Slot({ cell }: { cell: PageGridCell }) {
  const w = words[cell.id];
  return w ? (
    <Stack gap="item">
      <Heading level={3} size={4}>
        {w.heading}
      </Heading>
      <Text tone="muted">{w.text}</Text>
    </Stack>
  ) : null;
}

const rows: PageGridRow[] = [
  { id: 'r1', cells: [{ id: 'intro' }] },
  { id: 'r2', split: 'two-thirds-start', cells: [{ id: 'talks' }, { id: 'dates' }] },
  { id: 'r3', split: 'thirds', gap: 'group', cells: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
  {
    id: 'r4',
    split: 'halves',
    gap: 'page',
    cells: [
      { id: 'venue' },
      { id: 'travel', rows: [{ id: 'r4a', cells: [{ id: 'top' }] }, { id: 'r4b', split: 'halves', gap: 'group', cells: [{ id: 'bus' }, { id: 'ferry' }] }] },
    ],
  },
];

function Selectable() {
  const [selected, setSelected] = useState('dates');
  return <PageGrid rows={rows} renderSlot={(cell) => <Slot cell={cell} />} selected={selected} onSelect={(t) => setSelected(t.id)} />;
}

export default {
  component: 'PageGrid',
  tier: 'layout',
  summary: 'A page’s composition grid: rows split into cells on twelve columns; a cell holds more rows or one block.',
  stories: [
    {
      title: 'Rows, splits and a nested split',
      description:
        'Each row picks a split (whole, halves, thirds, quarters, two-thirds-start, two-thirds-end) that divides its span into whole columns, and a gap above it (item, group, section, page). The last row’s end half splits into rows again; its halves are quarters of the page and line up with the page’s columns. Narrow the window: each row stacks in source order once its narrowest cell would be under the column minimum.',
      code: `<PageGrid
  rows={[
    { id: 'r1', cells: [{ id: 'intro' }] },
    { id: 'r2', split: 'two-thirds-start', cells: [{ id: 'talks' }, { id: 'dates' }] },
    { id: 'r3', split: 'thirds', gap: 'group', cells: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    { id: 'r4', split: 'halves', gap: 'page', cells: [
      { id: 'venue' },
      { id: 'travel', rows: [
        { id: 'r4a', cells: [{ id: 'top' }] },
        { id: 'r4b', split: 'halves', gap: 'group', cells: [{ id: 'bus' }, { id: 'ferry' }] },
      ] },
    ] },
  ]}
  renderSlot={(cell) => <Block id={cell.id} />}
/>`,
      render: () => <PageGrid rows={rows} renderSlot={(cell) => <Slot cell={cell} />} />,
    },
    {
      title: 'Selecting a row or a cell',
      description:
        'For an editor: onSelect makes rows and cells selectable by pointer (the innermost cell under the click, or the row between its cells), and selected outlines the chosen one without moving anything. Click a cell. The keyboard path is the editor’s outline of the same ids.',
      code: `const [selected, setSelected] = useState('dates');
<PageGrid rows={rows} renderSlot={…} selected={selected} onSelect={(t) => setSelected(t.id)} />`,
      render: () => <Selectable />,
    },
  ],
} satisfies StoryFile;
