import { Button } from '../fundamentals/Button';
import { Example } from '../compounds/Example';
import type { StoryFile } from './story';

export default {
  component: 'Example',
  tier: 'compound',
  summary: 'A working specimen: a title, one line, the live preview and its source.',
  stories: [
    {
      title: 'A preview with its source',
      description: 'The source is slot content: pass a CodeBlock, and “Show the code” appears.',
      code: `<Example title="Emphasis" description="One primary action per view." arrangement="row" source={<CodeBlock … />}>…</Example>`,
      arrangement: 'row',
      render: () => (
        <Example title="Emphasis" description="One primary action per view; the rest are default or quiet." arrangement="row">
          <Button emphasis="primary" label="Publish page" />
          <Button label="Preview" />
        </Example>
      ),
    },
  ],
} satisfies StoryFile;
