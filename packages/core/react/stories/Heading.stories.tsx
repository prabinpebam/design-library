import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'Heading',
  tier: 'fundamental',
  summary: 'A section title with a semantic level independent of its visual size.',
  stories: [
    {
      title: 'Sizes',
      description: 'Four visual sizes. In a specimen the levels sit below the page outline.',
      code: `<Heading level={3} size={1}>Colour roles</Heading>
<Heading level={3} size={2}>Colour roles</Heading>
<Heading level={3} size={3}>Colour roles</Heading>
<Heading level={3} size={4}>Colour roles</Heading>`,
      render: () => (
        <>
          <Heading level={3} size={1}>Colour roles</Heading>
          <Heading level={3} size={2}>Colour roles</Heading>
          <Heading level={3} size={3}>Colour roles</Heading>
          <Heading level={3} size={4}>Colour roles</Heading>
        </>
      ),
    },
    {
      title: 'With its content',
      description: 'A heading belongs to what follows: less space below it than above.',
      code: `<Heading level={3} size={3}>Contrast pairs</Heading>
<Text>Each pair is held in every context.</Text>`,
      render: () => (
        <>
          <Heading level={3} size={3}>Contrast pairs</Heading>
          <Text>Each pair is held in every context.</Text>
        </>
      ),
    },
  ],
} satisfies StoryFile;
