import { CodeBlock } from '../compounds/CodeBlock';
import type { StoryFile } from './story';

export default {
  component: 'CodeBlock',
  tier: 'compound',
  summary: 'Source code to read and copy, scrolling in its own region.',
  stories: [
    {
      title: 'Copy the source',
      description: 'Copy code confirms on itself; if the browser refuses, a line under the code says how to copy instead.',
      code: `<CodeBlock label="Code: Save button" code={'<Button emphasis="primary" label="Save changes" />'} />`,
      render: () => <CodeBlock label="Code: Save button" code={'<Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save} />'} />,
    },
    {
      title: 'Wrapped in a narrow panel',
      description: 'With wrap, long lines break instead of scrolling sideways, for a narrow panel such as a design tool’s Dev mode. Copy code still copies the source exactly.',
      code: `<CodeBlock label="Code: Sign in button" code={css} wrap />`,
      render: () => (
        <CodeBlock
          label="Code: Sign in button"
          wrap
          code={'width: 256px;\nheight: 44px;\nborder-radius: 8px;\nbackground: linear-gradient(180deg, #7c7cff 0%, #5b5bd6 100%);\nbox-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.2);'}
        />
      ),
    },
  ],
} satisfies StoryFile;
