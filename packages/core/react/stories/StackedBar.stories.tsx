import { StackedBar } from '../compounds/StackedBar';
import type { StoryFile } from './story';

export default {
  component: 'StackedBar',
  tier: 'compound',
  summary: 'Parts of a whole by status, in one bar with square inner segments.',
  stories: [
    {
      title: 'Check results',
      description: 'Each part named with its share; only the outer ends of the whole bar are rounded.',
      code: `<StackedBar label="Checks" segments={[{ id: 'passed', label: 'Passed', share: 50, status: 'success' }, …]} />`,
      render: () => (
        <StackedBar
          label="Checks"
          segments={[
            { id: 'passed', label: 'Passed', share: 50, status: 'success' },
            { id: 'warned', label: 'Warned', share: 30, status: 'warning' },
            { id: 'failed', label: 'Failed', share: 20, status: 'danger' },
          ]}
        />
      ),
    },
    {
      title: 'A small part stays legible',
      description: 'A 3% part keeps its full height and square edges beside its neighbours.',
      code: `<StackedBar label="Checks" segments={[…, { id: 'failed', label: 'Failed', share: 3, status: 'danger' }]} />`,
      render: () => (
        <StackedBar
          label="Checks"
          segments={[
            { id: 'passed', label: 'Passed', share: 90, status: 'success' },
            { id: 'warned', label: 'Warned', share: 7, status: 'warning' },
            { id: 'failed', label: 'Failed', share: 3, status: 'danger' },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
