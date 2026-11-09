import { useState } from 'react';
import { ListDetail } from '../layouts/ListDetail';
import { Heading } from '../fundamentals/Heading';
import { List, type ListOption } from '../fundamentals/List';
import { Stack } from '../fundamentals/Stack';
import { Switch } from '../fundamentals/Switch';
import { Text } from '../fundamentals/Text';
import { people } from './people';
import type { StoryFile } from './story';

const subjects = ['Draft of the spring report', 'Venue for the off-site', 'Your expense claim', 'Notes from Tuesday', 'Photos from the launch', 'Contract renewal', 'Lunch on Friday?', 'Updated floor plan', 'Interview panel', 'Welcome to the team'];
const days = ['09:41', '08:15', 'Yesterday', 'Yesterday', 'Mon', 'Mon', 'Sun', '12 Mar', '11 Mar', '9 Mar'];

const messages: ListOption[] = people.map((name, i) => ({
  id: `m${i}`,
  label: name,
  description: subjects[i],
  meta: days[i],
  avatar: { name },
  unread: i < 2,
}));

const paragraph =
  'Thanks for sending this over. I read it on the train and left a few notes in the margins; most are small, but the section on the second quarter needs another pass before it goes out. Could we talk it through tomorrow morning?';

function Inbox() {
  const [chosen, setChosen] = useState(['m0']);
  const [show, setShow] = useState<'list' | 'detail'>('list');
  const message = messages.find((m) => m.id === chosen[0])!;
  return (
    <ListDetail
      listWidth="wide"
      maxSize="lg"
      listLabel="Inbox"
      list={
        <List
          mode="select"
          selection="single"
          size="l"
          label="Messages"
          options={messages}
          value={chosen}
          onChange={(v) => {
            setChosen(v);
            setShow('detail');
          }}
        />
      }
      detailLabel={message.description ?? message.label}
      show={show}
      backLabel="Back to inbox"
      onBack={() => setShow('list')}
    >
      <Stack gap="group">
        <Stack gap="pair">
          <Heading level={3} size={3}>
            {message.description}
          </Heading>
          <Text variant="body-sm" tone="muted">
            From {message.label}, {message.meta}
          </Text>
        </Stack>
        {[0, 1, 2, 3, 4].map((n) => (
          <Text key={n}>{paragraph}</Text>
        ))}
      </Stack>
    </ListDetail>
  );
}

const groups: ListOption[] = [
  { id: 'notifications', label: 'Notifications', description: 'Email and in-app' },
  { id: 'privacy', label: 'Privacy', description: 'Who sees your profile' },
  { id: 'display', label: 'Display', description: 'Theme and text size' },
];

const switches: Record<string, string[]> = {
  notifications: ['Email me a daily summary', 'Tell me when someone mentions me', 'Tell me about new features'],
  privacy: ['Show my profile to everyone', 'Show when I’m online'],
  display: ['Use more contrast', 'Reduce motion'],
};

function Settings() {
  const [chosen, setChosen] = useState<string[]>([]);
  const [show, setShow] = useState<'list' | 'detail'>('list');
  const [on, setOn] = useState<Record<string, boolean>>({ 'Tell me when someone mentions me': true });
  const group = groups.find((g) => g.id === chosen[0]);
  return (
    <ListDetail
      listLabel="Settings"
      list={
        <List
          mode="select"
          selection="single"
          label="Settings"
          options={groups}
          value={chosen}
          onChange={(v) => {
            setChosen(v);
            setShow('detail');
          }}
        />
      }
      detailLabel={group?.label ?? 'No setting group chosen'}
      show={show}
      backLabel="Back to settings"
      onBack={() => setShow('list')}
    >
      {group ? (
        <Stack gap="group">
          <Heading level={3} size={3}>
            {group.label}
          </Heading>
          <Stack gap="item">
            {switches[group.id].map((label) => (
              <Switch key={label} label={label} checked={!!on[label]} onChange={(v) => setOn({ ...on, [label]: v })} />
            ))}
          </Stack>
        </Stack>
      ) : (
        <Text tone="muted">Choose a group of settings to see them here.</Text>
      )}
    </ListDetail>
  );
}

export default {
  component: 'ListDetail',
  tier: 'layout',
  summary: 'A list beside the chosen item’s detail; where both don’t fit, one at a time with a Back.',
  stories: [
    {
      title: 'Messages, each side scrolling',
      description:
        'A wide list (a name and two lines) and a held height: the list and the message scroll on their own, edge to edge. Narrow the window: the list shows alone, choosing opens the message with Back, and the focus follows.',
      code: `<ListDetail listWidth="wide" maxSize="lg" listLabel="Inbox" list={<List mode="select" selection="single" size="l" label="Messages" options={messages} value={chosen} onChange={choose} />} detailLabel={message.subject} show={show} backLabel="Back to inbox" onBack={() => setShow('list')}>…</ListDetail>`,
      render: () => <Inbox />,
    },
    {
      title: 'Settings, growing with the page',
      description:
        'A narrow list and no held height: both sides grow and the page scrolls. Until a group is chosen, the detail says what to do.',
      code: `<ListDetail listLabel="Settings" list={<List mode="select" selection="single" label="Setting groups" options={groups} value={chosen} onChange={choose} />} detailLabel={group?.label ?? 'No setting group chosen'} show={show} backLabel="Back to settings" onBack={() => setShow('list')}>{group ? … : <Text tone="muted">Choose a group of settings to see them here.</Text>}</ListDetail>`,
      render: () => <Settings />,
    },
  ],
} satisfies StoryFile;
