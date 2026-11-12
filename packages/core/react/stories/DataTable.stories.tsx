import { useState } from 'react';
import { Code } from '../fundamentals/Code';
import { Text } from '../fundamentals/Text';
import { DataTable } from '../compounds/DataTable';
import type { StoryFile } from './story';

export default {
  component: 'DataTable',
  tier: 'compound',
  summary: 'Structured facts to compare in rows and columns.',
  stories: [
    {
      title: 'Props',
      description: 'The first column heads each row; a stacked column puts a note under the name.',
      code: `<DataTable label="Switch props" columns={[{ key: 'name', header: 'Prop', stacked: true }, …]} rows={…} />`,
      render: () => (
        <DataTable
          label="Switch props"
          columns={[
            { key: 'name', header: 'Prop', stacked: true },
            { key: 'type', header: 'Type' },
            { key: 'what', header: 'What it does' },
          ]}
          rows={[
            {
              id: 'label',
              cells: {
                name: (
                  <>
                    <code>label</code>
                    <Text as="span" variant="caption" tone="muted">
                      Required
                    </Text>
                  </>
                ),
                type: <code>string</code>,
                what: 'Names the setting, not its state.',
              },
            },
            { id: 'checked', cells: { name: <code>checked</code>, type: <code>boolean</code>, what: 'Whether the setting is on.' } },
          ]}
        />
      ),
    },
    {
      title: 'Keys',
      description: 'Each key a component handles and what it does.',
      code: `<DataTable label="Keyboard" columns={[{ key: 'keys', header: 'Key' }, { key: 'what', header: 'What it does' }]} rows={…} />`,
      render: () => (
        <DataTable
          label="Keyboard"
          columns={[
            { key: 'keys', header: 'Key' },
            { key: 'what', header: 'What it does' },
          ]}
          rows={[
            { id: 'space', cells: { keys: <Code kind="key">Space</Code>, what: 'Turns the setting on or off.' } },
            { id: 'tab', cells: { keys: <Code kind="key">Tab</Code>, what: 'Moves to the next control.' } },
          ]}
        />
      ),
    },
    {
      title: 'Reorder rows',
      description: 'With reorderable, each row has a Move handle before its heading cell, the same as a reorderable List: drag it, or press Enter on it for Move up, down, to top or to bottom (only the moves that make sense). Where the row landed is announced and focus stays on its handle. onReorder gets the ids in their new order.',
      code: `<DataTable label="Navigation" reorderable columns={[{ key: 'title', header: 'Title' }, { key: 'link', header: 'Link' }]} rows={links.map((l) => ({ id: l.id, label: l.title, cells: { title: l.title, link: <code>{l.href}</code> } }))} onReorder={setOrder} />`,
      render: () => <Navigation />,
    },
  ],
} satisfies StoryFile;

const links = [
  { id: 'talks', title: 'Talks', href: '/talks' },
  { id: 'speakers', title: 'Speakers', href: '/speakers' },
  { id: 'editions', title: 'Editions', href: '/editions' },
  { id: 'about', title: 'About', href: '/about' },
];

function Navigation() {
  const [order, setOrder] = useState(links.map((l) => l.id));
  const rows = order.map((id) => links.find((l) => l.id === id)!);
  return (
    <DataTable
      label="Navigation"
      reorderable
      columns={[
        { key: 'title', header: 'Title' },
        { key: 'link', header: 'Link' },
      ]}
      rows={rows.map((l) => ({ id: l.id, label: l.title, cells: { title: l.title, link: <code>{l.href}</code> } }))}
      onReorder={setOrder}
    />
  );
}

