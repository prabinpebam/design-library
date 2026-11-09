import { useState } from 'react';
import { ConversationList, type ConversationGroup } from '../compounds/ConversationList';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export const chatGroups: ConversationGroup[] = [
  { label: 'Today', items: [{ id: 'walk', title: 'Weekend walk in the Lake District' }, { id: 'focus', title: 'Focus rings in tight layouts' }] },
  { label: 'Yesterday', items: [{ id: 'bread', title: 'Sourdough starter that won’t rise' }, { id: 'tax', title: 'Splitting a shared electricity bill fairly' }] },
  { label: 'Previous 7 days', items: [{ id: 'garden', title: 'Plants for a shady north-facing balcony' }, { id: 'japanese', title: 'Polite ways to decline an invitation in Japanese' }, { id: 'bike', title: 'Why my bike chain keeps slipping' }] },
];

function Live() {
  const [groups, setGroups] = useState(chatGroups);
  const [current, setCurrent] = useState('walk');
  const [said, setSaid] = useState('');
  return (
    <>
      <ConversationList
        groups={groups}
        current={current}
        onOpen={setCurrent}
        onRename={(id, title) => setGroups((gs) => gs.map((g) => ({ ...g, items: g.items.map((c) => (c.id === id ? { ...c, title } : c)) })))}
        onAction={(id, action) => {
          if (action === 'delete' || action === 'archive') setGroups((gs) => gs.map((g) => ({ ...g, items: g.items.filter((c) => c.id !== id) })));
          setSaid(`${action} ${id}`);
        }}
      />
      {said && (
        <Text as="p" variant="body-sm" tone="muted">
          Last action: {said}
        </Text>
      )}
    </>
  );
}

export default {
  component: 'ConversationList',
  tier: 'compound',
  summary: 'The person’s chats with an assistant, grouped by when, the open one marked, each with a More menu.',
  stories: [
    {
      title: 'Grouped by when',
      description: 'Today, Yesterday, Previous 7 days; the open chat is tinted and marked current. Titles end in an ellipsis. Each row’s More menu shows on hover, on focus and on the open row; Rename turns the title into a field in place (Enter keeps it, Escape cancels), Archive and Delete take the row away here (an app confirms Delete first).',
      code: `<ConversationList groups={groups} current={id} onOpen={open}
  onRename={(id, title) => rename(id, title)} onAction={(id, action) => act(id, action)} />`,
      render: () => <Live />,
    },
  ],
} satisfies StoryFile;
