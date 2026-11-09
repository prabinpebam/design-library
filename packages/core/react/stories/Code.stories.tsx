import { Code } from '../fundamentals/Code';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'Code',
  tier: 'fundamental',
  summary: 'A short piece of code or a key name inside text.',
  stories: [
    {
      title: 'Code in a sentence',
      description: 'A token, prop or path named inside running text.',
      code: `<Text>Set <Code>--color-accent</Code> in the theme, never in a component.</Text>`,
      render: () => (
        <Text>
          Set <Code>--color-accent</Code> in the theme, never in a component.
        </Text>
      ),
    },
    {
      title: 'Key names',
      description: 'A key on the keyboard, written in full and drawn as a key cap.',
      code: `<Text>Press <Code kind="key">Enter</Code> or <Code kind="key">Space</Code> to choose.</Text>`,
      render: () => (
        <Text>
          Press <Code kind="key">Enter</Code> or <Code kind="key">Space</Code> to choose.
        </Text>
      ),
    },
  ],
} satisfies StoryFile;
