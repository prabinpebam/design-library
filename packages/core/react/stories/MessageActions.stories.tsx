import { useState } from 'react';
import { ChatMessage } from '../compounds/ChatMessage';
import { MessageActions } from '../compounds/MessageActions';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const replies = [
  'Use one ring layer on the box and paint it from the field tokens; the outline stays, the ring covers it.',
  'Draw focus inside the box: a 2 px ring over the 1 px outline, painted inward, so nothing reaches a neighbour.',
  'Put the ring on the field box as a mask-painted layer; a state can swap its paint for a gradient.',
];

function Conversation() {
  const [version, setVersion] = useState(replies.length);
  const [said, setSaid] = useState('');
  return (
    <Stack gap="group">
      <ChatMessage from="person" author="You" actions={<MessageActions copyText="How should focus look in tight layouts?" onEdit={() => setSaid('Edit pressed')} />}>
        How should focus look in tight layouts?
      </ChatMessage>
      <ChatMessage
        from="assistant"
        author="Assistant"
        actions={
          <MessageActions
            copyText={replies[version - 1]}
            versions={{ current: version, total: replies.length, onChange: setVersion }}
            onFeedback={(r) => setSaid(`Rated ${r}`)}
            onReadAloud={() => setSaid('Read aloud pressed')}
            onShare={() => setSaid('Share pressed')}
            onRetry={() => setSaid('Try again pressed')}
            onBranch={() => setSaid('Branch pressed')}
          />
        }
      >
        {replies[version - 1]}
      </ChatMessage>
      {said && (
        <Text as="p" variant="body-sm" tone="muted">
          Last action: {said}
        </Text>
      )}
    </Stack>
  );
}

export default {
  component: 'MessageActions',
  tier: 'compound',
  summary: 'The icon actions under a chat message: copy, edit, rate, read aloud, share, try again, branch, and versions.',
  stories: [
    {
      title: 'Under a person’s message and a reply',
      description: 'A person’s message gets Copy and Edit, shown on hover and focus; a reply gets its versions, Copy, Good and Bad response, Read aloud, Share, Try again and Branch, always shown. Only the actions given appear. Copy confirms “Copied” for a moment; a rating gives way to a thank-you; both are announced. Step through the three versions.',
      code: `<ChatMessage from="assistant" author="Assistant" actions={
  <MessageActions copyText={text} versions={{ current, total: 3, onChange }}
    onFeedback={…} onReadAloud={…} onShare={…} onRetry={…} onBranch={…} />
}>…</ChatMessage>`,
      render: () => <Conversation />,
    },
    {
      title: 'Copy only',
      description: 'The smallest set: one action, for a read-only transcript.',
      code: `<MessageActions copyText="The quarterly review is on Friday." />`,
      render: () => <MessageActions copyText="The quarterly review is on Friday." />,
    },
  ],
} satisfies StoryFile;
