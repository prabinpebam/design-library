import { useEffect, useState } from 'react';
import { ChatMessage } from '../compounds/ChatMessage';
import { ChatThinking } from '../compounds/ChatThinking';
import { Button } from '../fundamentals/Button';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const answer = 'The ring sits on the box as one layer painted inward over the outline, so focus never adds an offset or touches a neighbour. A state such as AI processing repaints the same layer with a gradient.';
const steps = ['Thinking', 'Searching the library', 'Reading 3 pages'];

/** Thinks through three steps, then streams the answer word by word; Run again restarts it. */
function Live() {
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const [words, setWords] = useState(0);
  const total = answer.split(' ').length;
  useEffect(() => {
    setStep(0);
    setWords(0);
    const timers = [1200, 2400, 3600].map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    let w = 0;
    const start = window.setTimeout(() => {
      const tick = window.setInterval(() => {
        w += 1;
        setWords(w);
        if (w >= total) window.clearInterval(tick);
      }, 80);
      timers.push(tick);
    }, 3600);
    return () => {
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
      window.clearTimeout(start);
    };
  }, [run, total]);
  const done = step >= steps.length;
  return (
    <Stack gap="item">
      <ChatMessage
        from="assistant"
        author="Assistant"
        streaming={done && words < total}
        thinking={
          <ChatThinking state={done ? 'done' : 'working'} label={done ? 'Thought for 4 seconds' : steps[step]}>
            <Text as="p" variant="body-sm" tone="muted">Looked for “focus ring” in the Field and TextField pages.</Text>
            <Text as="p" variant="body-sm" tone="muted">Read the Q55 decision and the ring tokens.</Text>
          </ChatThinking>
        }
      >
        {done ? answer.split(' ').slice(0, Math.max(1, words)).join(' ') : ''}
      </ChatMessage>
      <Button label="Run again" icon="retry" onClick={() => setRun((r) => r + 1)} />
    </Stack>
  );
}

export default {
  component: 'ChatThinking',
  tier: 'compound',
  summary: 'The assistant’s thinking and tool activity above a reply: a working line that settles into a summary you can open.',
  stories: [
    {
      title: 'Thinking, then a streamed reply',
      description: 'While working, one quiet line says what it is doing, with the turning arc and a light passing along the words; each new step is announced once. When the reply starts, the line settles into “Thought for 4 seconds”, which opens to the reasoning, and the words arrive with a soft caret after them; the message is busy until they’re complete. Reduced motion stills the shimmer, the arc and the caret.',
      code: `<ChatMessage from="assistant" author="Assistant" streaming={arriving}
  thinking={<ChatThinking state={done ? 'done' : 'working'} label={done ? 'Thought for 4 seconds' : 'Searching the library'}>…</ChatThinking>}>
  {text}
</ChatMessage>`,
      render: () => <Live />,
    },
    {
      title: 'Each state',
      description: 'Working without reasoning to open (a tool step), working, and done with the reasoning to open.',
      code: `<ChatThinking state="working" label="Searching the web" />
<ChatThinking state="done" label="Thought for 12 seconds">…</ChatThinking>`,
      render: () => (
        <Stack gap="item">
          <ChatThinking state="working" label="Searching the web" />
          <ChatThinking state="working" label="Thinking">
            <Text as="p" variant="body-sm" tone="muted">Comparing the two token names.</Text>
          </ChatThinking>
          <ChatThinking state="done" label="Thought for 12 seconds">
            <Text as="p" variant="body-sm" tone="muted">Compared ring-width with the focus token and kept them linked.</Text>
          </ChatThinking>
        </Stack>
      ),
    },
  ],
} satisfies StoryFile;
