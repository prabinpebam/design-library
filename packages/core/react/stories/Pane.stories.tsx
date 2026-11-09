import { Pane } from '../compounds/Pane';
import { Button } from '../fundamentals/Button';
import { Switch } from '../fundamentals/Switch';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'Pane',
  tier: 'compound',
  summary: 'A working side pane: a heading, a close action, its sections and a status line at its foot.',
  stories: [
    {
      title: 'Side pane',
      description: 'Sections a group apart; the status line says where things are saved.',
      code: `<Pane title="Revision" closeLabel="Close revision pane" onClose={close} status={<Text as="span" variant="body-sm" tone="muted">Saves automatically</Text>}>…</Pane>`,
      render: () => (
        <Pane
          title="Revision"
          closeLabel="Close revision pane"
          onClose={() => undefined}
          status={
            <Text as="span" variant="body-sm" tone="muted">
              Saves automatically
            </Text>
          }
        >
          <Switch label="Select elements" checked={false} onChange={() => undefined} />
          <Button label="Add comment" emphasis="primary" onClick={() => undefined} />
        </Pane>
      ),
    },
  ],
} satisfies StoryFile;
