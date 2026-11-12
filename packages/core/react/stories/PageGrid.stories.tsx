import { useState } from 'react';
import { Heading } from '../fundamentals/Heading';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { PageGrid, type PageGridCell, type PageGridRow } from '../layouts/PageGrid';
import type { StoryFile } from './story';
import { WithSettings } from './WithSettings';

const words: Record<string, { heading: string; text: string }> = {
  intro: { heading: 'A city festival of design', text: 'One row, one cell: the whole width.' },
  talks: { heading: 'Talks', text: 'Two thirds of the row.' },
  dates: { heading: 'Dates', text: 'One third: spans 8 and 4.' },
  a: { heading: 'Workshops', text: 'A third.' },
  b: { heading: 'Walks', text: 'A third.' },
  c: { heading: 'Evenings', text: 'A third.' },
  venue: { heading: 'Venue', text: 'A half, whole.' },
  top: { heading: 'Getting there', text: 'A half holding rows: this row is whole.' },
  bus: { heading: 'Bus', text: 'Then 3 and 3 of the half’s 6.' },
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
  { id: 'r2', cells: [{ id: 'talks', span: 8 }, { id: 'dates', span: 4 }] },
  { id: 'r3', gap: 'group', cells: [{ id: 'a', span: 4 }, { id: 'b', span: 4 }, { id: 'c', span: 4 }] },
  {
    id: 'r4',
    gap: 'page',
    cells: [
      { id: 'venue', span: 6 },
      { id: 'travel', span: 6, rows: [{ id: 'r4a', cells: [{ id: 'top' }] }, { id: 'r4b', gap: 'group', cells: [{ id: 'bus', span: 3 }, { id: 'ferry', span: 3 }] }] },
    ],
  },
];

const spanWords: Record<string, { heading: string; text: string }> = {
  side: { heading: 'Dates', text: '3 of 12: the narrowest a cell gets.' },
  main: { heading: 'Talks', text: '9 of 12.' },
  five: { heading: 'Venue', text: '5 of 12: any whole number of columns.' },
  seven: { heading: 'Getting there', text: '7 of 12.' },
  w1: { heading: 'Workshops', text: '4 of 12.' },
  w2: { heading: 'Walks', text: '4 of 12.' },
  w3: { heading: 'Evenings', text: '4 of 12.' },
  before: { heading: 'Above an empty row', text: 'The next row has one empty cell; it keeps the height the setting gives it.' },
  after: { heading: 'Below an empty row', text: 'The space above is the empty cell, as the editor’s canvas lays it out.' },
};

function SpanSlot({ cell }: { cell: PageGridCell }) {
  const w = spanWords[cell.id];
  return w ? (
    <Stack gap="item">
      <Heading level={3} size={4}>
        {w.heading}
      </Heading>
      <Text tone="muted">{w.text}</Text>
    </Stack>
  ) : null;
}

const spanned: PageGridRow[] = [
  { id: 's1', cells: [{ id: 'side', span: 3 }, { id: 'main', span: 9 }] },
  { id: 's2', cells: [{ id: 'five', span: 5 }, { id: 'seven', span: 7 }] },
  { id: 's3', gap: 'group', cells: [{ id: 'w1', span: 4 }, { id: 'w2', span: 4 }, { id: 'w3', span: 4 }] },
  { id: 's4', gap: 'page', cells: [{ id: 'before' }] },
  { id: 's5', cells: [{ id: 'gap' }] },
  { id: 's6', cells: [{ id: 'after' }] },
];

const emptySize = { '--c-page-grid-empty-size': 'var(--space-stack-page)' };

function Selectable() {
  const [selected, setSelected] = useState('dates');
  return <PageGrid rows={rows} renderSlot={(cell) => <Slot cell={cell} />} selected={selected} onSelect={(t) => setSelected(t.id)} />;
}

export default {
  component: 'PageGrid',
  tier: 'layout',
  summary: 'A page’s composition grid: rows of cells spanning the twelve columns; a cell holds more rows or one block.',
  stories: [
    {
      title: 'Rows, spans and a nested row',
      description:
        'Each row’s cells span whole columns of the twelve, adding up to the row’s span, and the row picks a gap above it (item, group, section, page). The last row’s end half holds rows again; its cells span 3 and 3, quarters of the page, and line up with the page’s columns. Narrow the window: each row stacks in source order once its narrowest cell would be under the column minimum.',
      code: `<PageGrid
  rows={[
    { id: 'r1', cells: [{ id: 'intro' }] },
    { id: 'r2', cells: [{ id: 'talks', span: 8 }, { id: 'dates', span: 4 }] },
    { id: 'r3', gap: 'group', cells: [{ id: 'a', span: 4 }, { id: 'b', span: 4 }, { id: 'c', span: 4 }] },
    { id: 'r4', gap: 'page', cells: [
      { id: 'venue', span: 6 },
      { id: 'travel', span: 6, rows: [
        { id: 'r4a', cells: [{ id: 'top' }] },
        { id: 'r4b', gap: 'group', cells: [{ id: 'bus', span: 3 }, { id: 'ferry', span: 3 }] },
      ] },
    ] },
  ]}
  renderSlot={(cell) => <Block id={cell.id} />}
/>`,
      render: () => <PageGrid rows={rows} renderSlot={(cell) => <Slot cell={cell} />} />,
    },
    {
      title: 'Cells span columns; an empty cell keeps its size',
      description:
        'A cell spans any whole number of the twelve columns, at least 3 where a row has more than one cell (so at most four across); a row’s spans add up to its span. An empty cell (a slot renderSlot leaves empty) keeps the height of the setting --c-page-grid-empty-size (none by default): an editor’s preview sets it to its canvas’s empty-cell height, so a page previews as it’s edited. Here it’s set to the page stack step.',
      code: `<PageGrid
  rows={[
    { id: 's1', cells: [{ id: 'side', span: 3 }, { id: 'main', span: 9 }] },
    { id: 's2', cells: [{ id: 'five', span: 5 }, { id: 'seven', span: 7 }] },
    { id: 's3', gap: 'group', cells: [{ id: 'w1', span: 4 }, { id: 'w2', span: 4 }, { id: 'w3', span: 4 }] },
    { id: 's4', gap: 'page', cells: [{ id: 'before' }] },
    { id: 's5', cells: [{ id: 'gap' }] },
    { id: 's6', cells: [{ id: 'after' }] },
  ]}
  renderSlot={(cell) => <Block id={cell.id} />}
/>
/* theme setting */ --c-page-grid-empty-size: var(--space-stack-page);`,
      render: () => (
        <WithSettings settings={emptySize} contents>
          <PageGrid rows={spanned} renderSlot={(cell) => <SpanSlot cell={cell} />} />
        </WithSettings>
      ),
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
