import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../compounds/ChatMessage';
import { Composer, type ComposerAttachment, type ComposerTool } from '../compounds/Composer';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const tools: ComposerTool[] = [
  { value: 'image', label: 'Create image', description: 'Draw a picture from your words', icon: 'image' },
  { value: 'research', label: 'Deep research', description: 'Read many sources and write a report', icon: 'search' },
  { value: 'web', label: 'Web search', description: 'Look things up on the web', icon: 'globe' },
];

const disclaimer = 'Answers can be wrong. Check important facts.';

/** Type, press Enter: the message joins the conversation, a reply "arrives" for four seconds (Stop ends it early). */
function Live() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const [replying, setReplying] = useState(false);
  const [tool, setTool] = useState<string | undefined>();
  const [files, setFiles] = useState<ComposerAttachment[]>([]);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const attach = (chosen: File[]) => {
    const added = chosen.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      kind: f.type.startsWith('image/') ? ('image' as const) : ('file' as const),
      name: f.name,
      src: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      type: f.type.startsWith('image/') ? undefined : f.name.split('.').pop()?.toUpperCase(),
      state: 'uploading' as const,
    }));
    setFiles((now) => [...now, ...added]);
    window.setTimeout(() => setFiles((now) => now.map((a) => (added.some((n) => n.id === a.id) ? { ...a, state: 'ready' } : a))), 1500);
  };

  return (
    <>
      {sent.map((m, i) => (
        <ChatMessage key={i} from="person" author="You">
          {m}
        </ChatMessage>
      ))}
      <Composer
        value={text}
        onChange={setText}
        onSend={() => {
          setSent((s) => [...s, text.trim() || `${files.length} attachment${files.length === 1 ? '' : 's'}`]);
          setText('');
          setFiles([]);
          setReplying(true);
          timer.current = window.setTimeout(() => setReplying(false), 4000);
        }}
        replying={replying}
        replyingLabel={tool === 'image' ? 'Creating an image' : 'Writing a reply'}
        onStop={() => {
          window.clearTimeout(timer.current);
          setReplying(false);
        }}
        attachments={files}
        onAttach={attach}
        onRemoveAttachment={(id) => setFiles((now) => now.filter((a) => a.id !== id))}
        tools={tools}
        tool={tool}
        onToolChange={setTool}
        onDictate={() => setText((t) => (t ? `${t} ` : '') + 'Plan a three-day walk in the Lake District')}
        disclaimer={disclaimer}
      />
    </>
  );
}

const added: ComposerAttachment[] = [
  { id: '1', kind: 'image', name: 'morning-hills.png', src: scenes[0].src },
  { id: '2', kind: 'image', name: 'night-ridge.png', src: scenes[2].src, state: 'uploading' },
  { id: '3', kind: 'file', name: 'walking-route-notes.pdf', type: 'PDF' },
  { id: '4', kind: 'file', name: 'budget.xlsx', state: 'failed' },
];

const noop = () => undefined;

export default {
  component: 'Composer',
  tier: 'compound',
  summary: 'Where a person writes to an assistant: attachments, text, tools, dictation and Send in one box that grows with the text.',
  stories: [
    {
      title: 'Write and send',
      description: 'Starts at one line and grows with the text, then scrolls. Enter sends, Shift+Enter adds a line; Send stays unavailable, with its reason, until there’s something to send. Plus opens Add photos and files and the tools; a chosen tool shows as a chip you can remove. While the reply arrives the ring turns the AI gradient, the words under the box say so, and Send becomes Stop. Try the microphone, a picture from your computer, and Create image.',
      code: `<Composer value={text} onChange={setText} onSend={send}
  replying={replying} onStop={stop}
  attachments={files} onAttach={upload} onRemoveAttachment={remove}
  tools={tools} tool={tool} onToolChange={setTool}
  onDictate={dictate} disclaimer="Answers can be wrong. Check important facts." />`,
      render: () => <Live />,
    },
    {
      title: 'Attachments',
      description: 'Pictures as thumbnails and files as tiles above the text, inside the box: one uploading (Send waits for it), one that couldn’t upload with Retry. Each has Remove.',
      code: `<Composer value="" onChange={setText} onSend={send} attachments={[
  { id: '1', kind: 'image', name: 'morning-hills.png', src },
  { id: '2', kind: 'image', name: 'night-ridge.png', src, state: 'uploading' },
  { id: '3', kind: 'file', name: 'walking-route-notes.pdf', type: 'PDF' },
  { id: '4', kind: 'file', name: 'budget.xlsx', state: 'failed' },
]} onAttach={upload} onRemoveAttachment={remove} onRetryAttachment={retry} />`,
      render: () => <Composer value="Which of these routes is shorter?" onChange={noop} onSend={noop} attachments={added} onAttach={noop} onRemoveAttachment={noop} onRetryAttachment={noop} tools={tools} onToolChange={noop} onDictate={noop} />,
    },
    {
      title: 'Replying, with a tool chosen',
      description: 'Create image chosen and a reply arriving: the AI ring turns (still under reduced motion), “Creating an image” under the box, and Stop in Send’s place. The text stays editable for the next message.',
      code: `<Composer value="" onChange={setText} onSend={send} tools={tools} tool="image" onToolChange={setTool}
  replying replyingLabel="Creating an image" onStop={stop} />`,
      render: () => <Composer value="" onChange={noop} onSend={noop} tools={tools} tool="image" onToolChange={noop} replying replyingLabel="Creating an image" onStop={noop} onDictate={noop} disclaimer={disclaimer} />,
    },
  ],
} satisfies StoryFile;
