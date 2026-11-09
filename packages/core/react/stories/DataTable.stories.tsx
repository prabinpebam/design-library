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
  ],
} satisfies StoryFile;
