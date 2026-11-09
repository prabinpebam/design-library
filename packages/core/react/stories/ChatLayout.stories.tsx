import { useRef, useState, type ReactNode } from 'react';
import { ChatMessage } from '../compounds/ChatMessage';
import { Composer } from '../compounds/Composer';
import { ConversationList } from '../compounds/ConversationList';
import { ImageGeneration } from '../compounds/ImageGeneration';
import { MessageActions } from '../compounds/MessageActions';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Heading } from '../fundamentals/Heading';
import { ListItem } from '../fundamentals/ListItem';
import { MenuButton } from '../fundamentals/MenuButton';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { ChatLayout } from '../layouts/ChatLayout';
import { chatGroups } from './ConversationList.stories';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const models = [
  { value: 'fast', label: 'Fast', description: 'Quick answers for everyday questions' },
  { value: 'thinking', label: 'Thinking', description: 'Takes longer and reasons step by step' },
];

const sidebar = (current: string, onOpen: (id: string) => void) => (
  <Stack gap="group">
    <Stack gap="pair">
      <ListItem role="button" icon="edit" label="New chat" size="s" />
      <ListItem role="button" icon="search" label="Search chats" size="s" />
    </Stack>
    <ConversationList groups={chatGroups} current={current} onOpen={onOpen} onRename={() => undefined} onAction={() => undefined} />
  </Stack>
);

/** A whole conversation: the sidebar, the header, messages with actions and a generated picture, and a working composer. */
function Conversation({ start = [] as ReactNode[] }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('walk');
  const [model, setModel] = useState('fast');
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const [replying, setReplying] = useState(false);
  const timer = useRef<number>(undefined);
  return (
    <ChatLayout
      height="lg"
      label="Weekend walk in the Lake District"
      sidebarOpen={open}
      onSidebarToggle={() => setOpen((o) => !o)}
      sidebar={sidebar(current, setCurrent)}
      header={<MenuButton label={`Model: ${models.find((m) => m.value === model)?.label}`} emphasis="quiet" size="s" items={models} onSelect={setModel} />}
      headerEnd={<Button label="Share" icon="upload" emphasis="quiet" size="s" />}
      composer={
        <Composer
          value={text}
          onChange={setText}
          replying={replying}
          onStop={() => setReplying(false)}
          onSend={() => {
            setSent((s) => [...s, text.trim()]);
            setText('');
            setReplying(true);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setReplying(false), 3000);
          }}
          onDictate={() => undefined}
          disclaimer="Answers can be wrong. Check important facts."
        />
      }
    >
      {start}
      {sent.map((m, i) => (
        <ChatMessage key={i} from="person" author="You">
          {m}
        </ChatMessage>
      ))}
    </ChatLayout>
  );
}

const thread = [
  <ChatMessage key="1" from="person" author="You" actions={<MessageActions copyText="Plan a two-day walk in the Lake District for a beginner." onEdit={() => undefined} />}>
    Plan a two-day walk in the Lake District for a beginner.
  </ChatMessage>,
  <ChatMessage key="2" from="assistant" author="Assistant" actions={<MessageActions copyText="Day one…" onFeedback={() => undefined} onRetry={() => undefined} onReadAloud={() => undefined} />}>
    <Text as="p">Here’s a gentle plan with a night in Grasmere between the two days.</Text>
    <Text as="p">Day one: Ambleside to Grasmere by Rydal Water, about 6 km on good paths, with tea at the far end. Day two: Easedale Tarn and back, about 8 km with one steady climb.</Text>
  </ChatMessage>,
  <ChatMessage key="3" from="person" author="You">
    Draw me the view from Easedale Tarn in the morning.
  </ChatMessage>,
  <ChatMessage key="4" from="assistant" author="Assistant">
    <Text as="p">Here’s the tarn just after sunrise.</Text>
    <ImageGeneration state="done" ratio="photo" src={scenes[0].src} alt={scenes[0].alt} />
  </ChatMessage>,
  <ChatMessage key="5" from="person" author="You">
    And one at dusk, please.
  </ChatMessage>,
  <ChatMessage key="6" from="assistant" author="Assistant">
    <ImageGeneration state="generating" ratio="photo" label="Adding the evening light" />
  </ChatMessage>,
];

function NewChat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const suggestions = ['Plan a weekend walk', 'Explain a bill', 'Draw a picture'];
  const composer = <Composer value={text} onChange={setText} onSend={() => (setSent((s) => [...s, text.trim()]), setText(''))} onDictate={() => undefined} />;
  return (
    <ChatLayout
      height="lg"
      label={sent.length ? sent[0] : 'New chat'}
      sidebarOpen={open}
      onSidebarToggle={() => setOpen((o) => !o)}
      sidebar={sidebar('', () => undefined)}
      header={<MenuButton label="Model: Fast" emphasis="quiet" size="s" items={models} onSelect={() => undefined} />}
      headerEnd={sent.length ? <Button label="New chat" icon="plus" emphasis="quiet" size="s" onClick={() => setSent([])} /> : undefined}
      empty={sent.length ? undefined : <Heading level={2} size={2}>What can I help with?</Heading>}
      composer={
        <Stack gap="item">
          {composer}
          {!sent.length && (
            <Cluster gap="item">
              {suggestions.map((s) => (
                <Button key={s} label={s} size="s" onClick={() => setText(s)} />
              ))}
            </Cluster>
          )}
        </Stack>
      }
    >
      {sent.map((m, i) => (
        <ChatMessage key={i} from="person" author="You">
          {m}
        </ChatMessage>
      ))}
    </ChatLayout>
  );
}

export default {
  component: 'ChatLayout',
  tier: 'layout',
  summary: 'A conversation with an assistant: a collapsible sidebar of chats, a header, the messages in a reading column and the composer under them.',
  stories: [
    {
      title: 'A conversation',
      description: 'Open the sidebar with the menu button: it (a sunken tone, no border) holds New chat, Search chats and the grouped chats; the header has the sidebar toggle, the model menu and Share. The messages scroll on their own in a 42 rem column; scroll up and Jump to newest appears; send a message and the view follows it. In a narrow window the sidebar floats over the conversation and Escape closes it.',
      code: `<ChatLayout label={title} sidebarOpen={open} onSidebarToggle={toggle}
  sidebar={<ConversationList groups={groups} current={id} />}
  header={<MenuButton label="Model: Fast" items={models} />} headerEnd={<Button label="Share" />}
  composer={<Composer … />}>
  {messages}
</ChatLayout>`,
      render: () => <Conversation start={thread} />,
    },
    {
      title: 'A new chat',
      description: 'No messages yet: the greeting and the composer together in the middle, with suggestions under it; the sidebar starts closed. Send a message: the same composer (your focus stays in it) travels to the bottom while the greeting fades on its way down and the conversation fades in; New chat brings the greeting back and the composer up. Reduced motion: nothing travels; the fades stay.',
      code: `<ChatLayout label="New chat" empty={<Heading level={2}>What can I help with?</Heading>} composer={<Composer … />} … />`,
      render: () => <NewChat />,
    },
  ],
} satisfies StoryFile;
