import { useState } from 'react';
import { Button } from '../fundamentals/Button';
import { Reveal } from '../fundamentals/Reveal';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

/** A disclosure: the button says what it shows; the content opens in place below it. */
function Disclosure({ reduce = false }: { reduce?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap="item" data-motion={reduce ? 'reduce' : undefined}>
      <Button label={open ? 'Hide delivery details' : 'Show delivery details'} emphasis="quiet" expanded={open} onClick={() => setOpen(!open)} />
      <Reveal open={open}>
        <Stack gap="pair">
          <Text>Orders placed before 2 pm leave the warehouse the same day.</Text>
          <Text>Deliveries arrive in two to four working days; you get a tracking link by email.</Text>
        </Stack>
      </Reveal>
      <Text tone="muted">Returns are free for 30 days.</Text>
    </Stack>
  );
}

export default {
  component: 'Reveal',
  tier: 'fundamental',
  summary: 'Opens and closes content in place: the box grows to the content while it fades in.',
  stories: [
    {
      title: 'Open and close',
      description: 'Press it, then press again before it finishes: it grows from where it is and reverses from where it is. What follows moves down and back; nothing else does.',
      code: `<Button label="Show delivery details" expanded={open} onClick={toggle} />
<Reveal open={open}>…</Reveal>`,
      render: () => <Disclosure />,
    },
    {
      title: 'Reduced motion',
      description: 'The content still fades, but the box doesn’t grow: what follows moves at once.',
      code: `<Reveal open={open}>…</Reveal>  // inside a reduced-motion context`,
      render: () => <Disclosure reduce />,
    },
  ],
} satisfies StoryFile;
