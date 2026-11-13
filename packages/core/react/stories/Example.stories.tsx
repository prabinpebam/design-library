import { Button } from '../fundamentals/Button';
import { TextField } from '../fundamentals/TextField';
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
    {
      title: 'A full-width preview, under a page section',
      description: 'arrangement="fill" stretches each part to the canvas’s width, for a part that is laid out across a page (a menu bar, a field). headingLevel puts the title where it belongs in the page’s outline (2 here, directly under the page’s h1); the look is the same at every level.',
      code: `<Example title="Preview" description="How the menu reads on the site." headingLevel={2} arrangement="fill">…</Example>`,
      render: () => (
        <Example title="Preview" description="How the field reads across the page." headingLevel={2} arrangement="fill">
          <TextField label="Search the docs" placeholder="Components, tokens, guides" value="" />
        </Example>
      ),
    },
  ],
} satisfies StoryFile;
