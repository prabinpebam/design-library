import { useState } from 'react';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Morph } from '../fundamentals/Morph';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** A subscribe box: the form becomes its confirmation in the same box once the save has landed. */
function Subscribe({ reduce = false }: { reduce?: boolean }) {
  const [state, setState] = useState<'form' | 'done'>('form');
  return (
    <Stack gap="item" data-motion={reduce ? 'reduce' : undefined}>
      <Morph state={state}>
        {state === 'form' ? (
          <Stack gap="item">
            <Text>Get one email a week with every new component and what changed.</Text>
            <Cluster>
              <Button
                emphasis="primary"
                label="Subscribe"
                pendingLabel="Subscribing…"
                doneLabel="Subscribed"
                onCommit={async () => {
                  await wait(700);
                  setState('done');
                }}
              />
            </Cluster>
          </Stack>
        ) : (
          <Stack gap="item">
            <Text>You’re subscribed. The first email arrives on Monday.</Text>
            <Text tone="muted">You can stop it from any email’s footer.</Text>
            <Cluster>
              <Button label="Undo" emphasis="quiet" onClick={() => setState('form')} />
            </Cluster>
          </Stack>
        )}
      </Morph>
      <Text tone="muted">Below the box: this moves with its height, nothing else does.</Text>
    </Stack>
  );
}

export default {
  component: 'Morph',
  tier: 'fundamental',
  summary: 'One box whose content changes state in place: the old fades out, the new fades in, the height eases.',
  stories: [
    {
      title: 'Form becomes its result',
      description: 'Press Subscribe: the button shows it’s working, then the same box becomes the confirmation; nothing blinks out and back. Press Undo quickly after: it comes back from where it is.',
      code: `<Morph state={state}>{state === 'form' ? <Form /> : <Done />}</Morph>`,
      render: () => <Subscribe />,
    },
    {
      title: 'Reduced motion',
      description: 'The content still cross-fades; the height changes at once.',
      code: `<Morph state={state}>…</Morph>  // inside a reduced-motion context`,
      render: () => <Subscribe reduce />,
    },
  ],
} satisfies StoryFile;
