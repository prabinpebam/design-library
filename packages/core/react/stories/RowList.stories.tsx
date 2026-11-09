import { Code } from '../fundamentals/Code';
import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import { RowList } from '../compounds/RowList';
import type { StoryFile } from './story';

export default {
  component: 'RowList',
  tier: 'compound',
  summary: 'Rows of named facts on one hairline each, in proportional columns.',
  stories: [
    {
      title: 'Token rows',
      description: 'A name, the value it holds and what it’s for; the name and value columns grow to their own limit.',
      code: `<RowList columns={['name', 'value', 1]} rows={[{ id: 'stack-pair', cells: [<Code>--space-stack-pair</Code>, <Code>--space-1</Code>, 'Between a label and its value'] }, …]} />`,
      render: () => (
        <RowList
          columns={['name', 'value', 1]}
          rows={[
            {
              id: 'stack-pair',
              cells: [
                <Code>--space-stack-pair</Code>,
                <Code>--space-1</Code>,
                <Text as="span" variant="body-sm" tone="muted">
                  Between a label and its value
                </Text>,
              ],
            },
            {
              id: 'stack-item',
              cells: [
                <Code>--space-stack-item</Code>,
                <Code>--space-2</Code>,
                <Text as="span" variant="body-sm" tone="muted">
                  Between items of one group
                </Text>,
              ],
            },
          ]}
        />
      ),
    },
    {
      title: 'Large specimens',
      description: 'Facts stacked in one cell beside a live sample at its real size; the rows get more room.',
      code: `<RowList ordered specimen="large" columns={['facts', 1]} rows={[{ id: 'heading-2', cells: [[<Code>--type-heading-2</Code>, …], <Heading level={3} size={2}>A section heading</Heading>] }]} />`,
      render: () => (
        <RowList
          ordered
          specimen="large"
          columns={['facts', 1]}
          rows={[
            {
              id: 'heading-2',
              cells: [
                [
                  <Code>--type-heading-2</Code>,
                  <Text as="span" variant="body-sm" tone="muted">
                    Section headings
                  </Text>,
                ],
                <Heading level={3} size={2}>
                  A section heading
                </Heading>,
              ],
            },
            {
              id: 'body',
              cells: [
                [
                  <Code>--type-body</Code>,
                  <Text as="span" variant="body-sm" tone="muted">
                    Running text
                  </Text>,
                ],
                <Text>Every value comes from a token.</Text>,
              ],
            },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
