import { useState } from 'react';
import { Badge } from '../fundamentals/Badge';
import type { BadgeTone, Presence } from '../fundamentals/Badge';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Icon } from '../fundamentals/Icon';
import { Stack } from '../fundamentals/Stack';
import type { StoryFile } from './story';

function ComesAndGoes() {
  // Q65 C24 demo: the count arrives from nothing and leaves to nothing.
  const [unread, setUnread] = useState(0);
  const name = unread ? `Comments, ${unread} new` : 'Comments';
  return (
    <Cluster gap="group" align="center">
      <Badge kind="count" count={unread} label={`${unread} new`} anchor={<Button iconOnly icon="comment" label={name} />} />
      <Button label="A comment arrives" onClick={() => setUnread((n) => n + 1)} />
      <Button label="Read them" onClick={() => setUnread(0)} />
    </Cluster>
  );
}

const tones: [BadgeTone, string][] = [
  ['accent', 'Fundamental'],
  ['neutral', 'Draft'],
  ['info', 'In review'],
  ['success', 'Published'],
  ['warning', 'Needs changes'],
  ['danger', 'Failed'],
];

const categories = ['Design', 'Research', 'Marketing', 'Engineering', 'Sales', 'Support', 'Finance', 'Legal'];

const presences: [Presence, string][] = [
  ['available', 'Available'],
  ['busy', 'Busy'],
  ['do-not-disturb', 'Do not disturb'],
  ['away', 'Away'],
  ['offline', 'Offline'],
];

export default {
  component: 'Badge',
  tier: 'fundamental',
  summary: 'Information the system set and the reader can’t change: a state, a category, a count, a “new” dot, a status or a presence.',
  stories: [
    {
      title: 'Category',
      description: 'One or two words that say what something is, such as the tier a page belongs to. The accent tint: no status meaning.',
      code: `<Badge>Compound</Badge>`,
      render: () => (
        <>
          <Badge>Fundamental</Badge>
          <Badge>Compound</Badge>
          <Badge>Layout</Badge>
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'Category colours',
      description: 'Eight colours that tell categories apart (a project, a topic, a chart series), never a status. Subtle keeps the quiet fill and puts the colour in a dot; strong fills with it. Keep one number per category everywhere it appears; the words always name it.',
      code: `<Badge category={1}>Design</Badge>
<Badge category={2} emphasis="strong">Research</Badge>
<Badge kind="status" category={3}>Marketing</Badge>`,
      render: () => (
        <Stack gap="item">
          {(['subtle', 'strong'] as const).map((emphasis) => (
            <Cluster key={emphasis}>
              {categories.map((words, i) => (
                <Badge key={words} category={i + 1} emphasis={emphasis}>
                  {words}
                </Badge>
              ))}
            </Cluster>
          ))}
          <Cluster>
            {categories.slice(0, 4).map((words, i) => (
              <Badge key={words} kind="status" category={i + 1}>
                {words}
              </Badge>
            ))}
          </Cluster>
        </Stack>
      ),
    },
    {
      title: 'Tones, subtle and strong',
      description: 'Status meaning only through the status roles, and always in the words too. Subtle is the default; strong is for the one thing on the screen that needs attention.',
      code: `<Badge tone="success">Published</Badge>
<Badge tone="danger" emphasis="strong">Failed</Badge>`,
      render: () => (
        <Stack gap="item">
          {(['subtle', 'strong'] as const).map((emphasis) => (
            <Cluster key={emphasis}>
              {tones.map(([tone, words]) => (
                <Badge key={tone} tone={tone} emphasis={emphasis}>
                  {words}
                </Badge>
              ))}
            </Cluster>
          ))}
        </Stack>
      ),
    },
    {
      title: 'States with an icon',
      description: 'A state and its icon, as review and issue states show them. The icon is decorative: the word says it.',
      code: `<Badge tone="success" icon="success">Open</Badge>`,
      render: () => (
        <>
          <Badge tone="success" icon="success">Open</Badge>
          <Badge tone="neutral" icon="error">Closed</Badge>
          <Badge tone="info" icon="info">Draft</Badge>
          <Badge tone="warning" icon="warning">Blocked</Badge>
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'Counts',
      description: 'A number, capped at 99+ by default. Zero hides the badge unless showZero. Strong danger by default; any tone fits. The label says what the number counts.',
      code: `<Badge kind="count" count={3} label="3 unread" />
<Badge kind="count" count={1280} label="1,280 results" tone="neutral" emphasis="subtle" />`,
      render: () => (
        <>
          <Badge kind="count" count={3} label="3 unread" />
          <Badge kind="count" count={42} label="42 unread" />
          <Badge kind="count" count={1280} label="1,280 unread" />
          <Badge kind="count" count={1280} max={999} label="1,280 results" tone="neutral" emphasis="subtle" />
          <Badge kind="count" count={0} showZero label="No comments" tone="neutral" emphasis="subtle" />
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'A count that comes and goes',
      description: 'A count that arrives after the page is drawn grows in and fades in; one that drops to nothing shrinks and fades out where it was. The number itself changes at once. With reduced motion, it only fades.',
      code: `<Badge kind="count" count={unread} label={\`\${unread} new\`} anchor={<Button iconOnly icon="comment" label={\`Comments, \${unread} new\`} />} />`,
      render: () => <ComesAndGoes />,
      arrangement: 'row',
    },
    {
      title: 'Pinned to an icon or button',
      description: 'A count or a “new” dot on the corner of its host. Square hosts sit it on the corner; round hosts pull it in to their curve. Put the meaning in the host’s name too (“Comments, 3 new”).',
      code: `<Badge kind="count" count={3} label="3 new" anchor={<Button iconOnly icon="comment" label="Comments, 3 new" />} />
<Badge kind="dot" label="New" overlap="round" anchor={<Icon name="info" size="lg" />} />`,
      render: () => (
        <>
          <Badge kind="count" count={3} label="3 new" anchor={<Button iconOnly icon="comment" label="Comments, 3 new" />} />
          <Badge kind="count" count={120} label="120 new" anchor={<Button iconOnly icon="menu" label="Notifications, 120 new" />} />
          <Badge kind="dot" label="New" anchor={<Button iconOnly icon="copy" label="Clipboard, new item" />} />
          <Badge kind="dot" label="New" overlap="round" anchor={<Icon name="info" size="lg" />} />
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'Status with words',
      description: 'A dot then words, with no fill: quieter than a filled badge, for rows of a table or a chart key.',
      code: `<Badge kind="status" tone="success">Running</Badge>`,
      render: () => (
        <Stack gap="pair">
          <Badge kind="status" tone="success">Running</Badge>
          <Badge kind="status" tone="warning">Degraded</Badge>
          <Badge kind="status" tone="danger">Stopped</Badge>
          <Badge kind="status" tone="neutral">Not started</Badge>
        </Stack>
      ),
    },
    {
      title: 'Presence',
      description: 'A person’s availability. Each state has its own shape (a check, a solid dot, a bar, a ring, a ring with a cross), so colour is never the only cue. It pins to an avatar when the Avatar component arrives; the label names the state.',
      code: `<Badge kind="presence" presence="busy" label="Busy" />`,
      render: () => (
        <Stack gap="pair">
          {presences.map(([presence, words]) => (
            <Cluster key={presence} gap="pair">
              <Badge kind="presence" presence={presence} label={words} />
              <span aria-hidden="true">{words}</span>
            </Cluster>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Sizes',
      description: 's (20 px) and normal (24 px). One size per context.',
      code: `<Badge size="s" tone="info">Beta</Badge>`,
      render: () => (
        <>
          <Badge size="s" tone="info">Beta</Badge>
          <Badge tone="info">Beta</Badge>
          <Badge size="s" kind="count" count={7} label="7 new" />
          <Badge kind="count" count={7} label="7 new" />
          <Badge size="s" kind="dot" label="New" />
          <Badge kind="dot" label="New" />
        </>
      ),
      arrangement: 'row',
    },
  ],
} satisfies StoryFile;