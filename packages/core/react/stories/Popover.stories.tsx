import { useState } from 'react';
import { Button } from '../fundamentals/Button';
import { Checkbox } from '../fundamentals/Checkbox';
import { Cluster } from '../fundamentals/Cluster';
import { Link } from '../fundamentals/Link';
import { Popover } from '../fundamentals/Popover';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

function Filters() {
  const [chosen, setChosen] = useState<string[]>(['open']);
  const all = [
    ['open', 'Open'],
    ['review', 'In review'],
    ['done', 'Done'],
  ];
  const toggle = (v: string) => (on: boolean) => setChosen((c) => (on ? [...c, v] : c.filter((x) => x !== v)));
  return (
    <Popover trigger={{ label: `Filters${chosen.length ? ` (${chosen.length})` : ''}` }} title="Show revisions">
      <Stack gap="item">
        {all.map(([v, l]) => (
          <Checkbox key={v} label={l!} checked={chosen.includes(v!)} onChange={toggle(v!)} />
        ))}
      </Stack>
      <Cluster>
        <Button label="Clear" emphasis="quiet" onClick={() => setChosen([])} />
      </Cluster>
    </Popover>
  );
}

function Confirm() {
  const [open, setOpen] = useState(false);
  const [archived, setArchived] = useState(false);
  return (
    <Stack gap="item">
      <Popover open={open} onOpenChange={setOpen} trigger={{ label: archived ? 'Archived' : 'Archive revision' }} title="Archive this revision?" side="top">
        <Text variant="body-sm" tone="muted">
          Its comments move to the archive. You can restore it from there.
        </Text>
        <Cluster>
          <Button label="Cancel" onClick={() => setOpen(false)} />
          <Button
            label="Archive"
            emphasis="primary"
            onClick={() => {
              setArchived(true);
              setOpen(false);
            }}
          />
        </Cluster>
      </Popover>
    </Stack>
  );
}

export default {
  component: 'Popover',
  tier: 'fundamental',
  summary: 'A surface beside its button that can hold controls, opened on a press.',
  stories: [
    {
      title: 'Help beside a field (the toggletip)',
      description: 'An icon-only button beside a label opens a few words of help with a link. A press opens it, never hover, so it works on touch and holds a link a tooltip couldn’t. Focus moves to the link; Escape closes and returns to the button.',
      code: `<Popover trigger={{ label: 'About review mode', icon: 'info', iconOnly: true, emphasis: 'quiet' }}>
  <Text variant="body-sm">…</Text> <Link href="#/revisions">How revisions work</Link>
</Popover>`,
      render: () => (
        <Cluster gap="pair">
          <Text>Review mode</Text>
          <Popover trigger={{ label: 'About review mode', icon: 'info', iconOnly: true, emphasis: 'quiet', size: 's' }}>
            <Text variant="body-sm">Comments stay open until someone archives them with a summary of what changed.</Text>
            <Link href="#/overview">How revisions work</Link>
          </Popover>
        </Cluster>
      ),
    },
    {
      title: 'Controls inside',
      description: 'Filters, a short form: the popover has a title, its controls apply as they change, and it stays open until Escape, a press outside, the button again, or Tab past its last control. The button shows expanded while it’s open.',
      code: `<Popover trigger={{ label: 'Filters' }} title="Show revisions">
  <Checkbox … /> …  <Button label="Clear" emphasis="quiet" />
</Popover>`,
      render: () => <Filters />,
    },
    {
      title: 'Confirmation by its button',
      description: 'A light question for an action that can be undone, next to the button that asked. Controlled with open and onOpenChange so the answer closes it. For an action that can’t be undone, use an alert dialog; for most deletes, an undo in a notification.',
      code: `<Popover open={open} onOpenChange={setOpen} trigger={{ label: 'Archive revision' }} title="Archive this revision?" side="top">
  <Text …>…</Text> <Button label="Cancel" … /> <Button label="Archive" emphasis="primary" … />
</Popover>`,
      render: () => <Confirm />,
    },
  ],
} satisfies StoryFile;
