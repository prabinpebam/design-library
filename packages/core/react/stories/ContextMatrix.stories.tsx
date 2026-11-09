import { Code } from '../fundamentals/Code';
import { ContextMatrix } from '../compounds/ContextMatrix';
import type { StoryFile } from './story';

const columns = [
  { id: 'light', label: 'Light', scheme: 'light', contrast: 'standard' },
  { id: 'dark', label: 'Dark', scheme: 'dark', contrast: 'standard' },
  { id: 'light-more', label: 'Light, more contrast', scheme: 'light', contrast: 'more' },
  { id: 'dark-more', label: 'Dark, more contrast', scheme: 'dark', contrast: 'more' },
] as const;

export default {
  component: 'ContextMatrix',
  tier: 'compound',
  summary: 'Values compared across contexts, each row’s name said once.',
  stories: [
    {
      title: 'A role in four contexts',
      description: 'Each column renders in its own context; only what varies is in the cells.',
      code: `<ContextMatrix label="Muted text by context" rowHeader="Role" columns={columns} rows={[…]} />`,
      render: () => (
        <ContextMatrix
          label="Muted text by context"
          rowHeader="Role"
          columns={[...columns]}
          rows={[
            {
              id: 'text-muted',
              label: <Code>--color-text-muted</Code>,
              cells: { light: <Code>--p-base-600</Code>, dark: <Code>--p-base-300</Code>, 'light-more': <Code>--p-base-900</Code>, 'dark-more': <Code>--p-base-50</Code> },
            },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
