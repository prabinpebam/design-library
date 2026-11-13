import { useRef } from 'react';
import { Button } from '../fundamentals/Button';
import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

/** LR60: a script moves focus to where reading starts (a route change, a skip link); no ring, as it isn't a control. */
function FocusedByScript() {
  const target = useRef<HTMLDivElement>(null);
  return (
    <>
      <Button label="Go to Contrast pairs" onClick={() => target.current?.focus()} />
      <div ref={target} tabIndex={-1} role="region" aria-label="Contrast pairs">
        <Heading level={3} size={3}>Contrast pairs</Heading>
        <Text>Each pair is held in every context.</Text>
      </div>
    </>
  );
}

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
    {
      title: 'Focused by a script',
      description: 'A heading, main or region given tabindex -1 and focused by a script (a route change, a skip link) is where reading starts, not a control: it shows no focus ring. Everything in the Tab order keeps its ring.',
      code: `<div ref={target} tabIndex={-1} role="region" aria-label="Contrast pairs"><Heading level={3} size={3}>Contrast pairs</Heading>…</div>
<Button label="Go to Contrast pairs" onClick={() => target.current?.focus()} />`,
      render: () => <FocusedByScript />,
    },
  ],
} satisfies StoryFile;
