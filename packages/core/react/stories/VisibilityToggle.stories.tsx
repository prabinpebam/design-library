import { useState } from 'react';
import { Cluster } from '../fundamentals/Cluster';
import { VisibilityToggle } from '../compounds/VisibilityToggle';
import type { StoryFile } from './story';

function Layer({ name }: { name: string }) {
  const [shown, setShown] = useState(true);
  const [locked, setLocked] = useState(false);
  return (
    <Cluster gap="pair" wrap={false}>
      <VisibilityToggle name={name} on={shown} onChange={setShown} />
      <VisibilityToggle name={name} kind="lock" on={locked} onChange={setLocked} />
    </Cluster>
  );
}

export default {
  component: 'VisibilityToggle',
  tier: 'compound',
  summary: 'The eye and padlock toggles: show or hide, lock or unlock one thing in a list. The library’s named pattern for these two meanings, so it needs no written reason; every other binary setting is a Switch.',
  stories: [
    {
      title: 'Show and lock a layer',
      description: 'The icon is the state: an open eye when shown, a slashed eye when hidden; a closed padlock when locked, an open one when not. Announced as pressed, with a name that never changes ("Show Logo").',
      code: `<VisibilityToggle name="Logo" on={shown} onChange={setShown} />\n<VisibilityToggle name="Logo" kind="lock" on={locked} onChange={setLocked} />`,
      render: () => <Layer name="Logo" />,
    },
    {
      title: 'At rest, hidden and locked',
      description: 'Both kinds in both states, as a list row shows them.',
      arrangement: 'row',
      code: `<VisibilityToggle name="fill 1" on={false} onChange={…} />`,
      render: () => (
        <Cluster gap="pair">
          <VisibilityToggle name="fill 1" on onChange={() => undefined} />
          <VisibilityToggle name="fill 2" on={false} onChange={() => undefined} />
          <VisibilityToggle name="fill 1" kind="lock" on onChange={() => undefined} />
          <VisibilityToggle name="fill 2" kind="lock" on={false} onChange={() => undefined} />
        </Cluster>
      ),
    },
  ],
} satisfies StoryFile;
