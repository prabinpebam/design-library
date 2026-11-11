import type { StoryFile } from '@design-library/core/components';
import { ChatPanel } from './ChatPanel';

export default {
  component: 'ikea.ChatPanel',
  tier: 'compound',
  summary: 'A help chat: a round launcher that opens a small panel with a feature-surface head.',
  stories: [
    {
      title: 'Open',
      description: 'The head takes the feature surface (yellow); the action is a strong pill. Shown in place here; on a page it’s pinned to the bottom end.',
      code: `<ChatPanel title="Chat with us" text="…" start="Start chat" openLabel="Chat with us" minimiseLabel="Minimise" closeLabel="Close chat" defaultOpen />`,
      render: () => (
        <ChatPanel
          title="Chat with us"
          text="Ask about an order, a delivery or a product. We answer every day from 8 to 20."
          start="Start chat"
          openLabel="Chat with us"
          minimiseLabel="Minimise"
          closeLabel="Close chat"
          defaultOpen
          pinned={false}
        />
      ),
    },
    {
      title: 'Launcher',
      description: 'Before it opens: a round primary Button.',
      code: `<ChatPanel … />`,
      render: () => <ChatPanel title="Chat with us" text="…" start="Start chat" openLabel="Chat with us" minimiseLabel="Minimise" closeLabel="Close chat" pinned={false} />,
    },
  ],
} satisfies StoryFile;
