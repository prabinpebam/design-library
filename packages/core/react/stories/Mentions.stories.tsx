import { useState } from 'react';
import { Mentions, type MentionPerson, type MentionsProps } from '../compounds/Mentions';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const team: MentionPerson[] = [
  { id: 'mo', name: 'Mira Okafor', secondary: 'Research lead' },
  { id: 'tl', name: 'Tomás Lindqvist', secondary: 'Engineer' },
  { id: 'ab', name: 'Aiko Brandt', secondary: 'Accessibility' },
  { id: 'kw', name: 'Kenji Watanabe', secondary: 'Design' },
  { id: 'ar', name: 'Ana Ruiz', secondary: 'Product' },
  { id: 'sm', name: 'Samir Mansour', secondary: 'Engineer' },
  { id: 'lh', name: 'Lena Hoffmann', secondary: 'Support' },
];

const topics: MentionPerson[] = [
  { id: 'launch', name: 'launch', secondary: '12 posts' },
  { id: 'research', name: 'research', secondary: '8 posts' },
  { id: 'tokens', name: 'tokens', secondary: '5 posts' },
];

function Demo({ initial = '', showMentioned = false, ...rest }: Omit<MentionsProps, 'value' | 'onChange'> & { initial?: string; showMentioned?: boolean }) {
  const [text, setText] = useState(initial);
  const [mentioned, setMentioned] = useState<MentionPerson[]>([]);
  return (
    <>
      <Mentions {...rest} value={text} onChange={setText} onMentionsChange={setMentioned} />
      {showMentioned && (
        <Text variant="body-sm" tone="muted">
          {mentioned.length ? `Will notify: ${mentioned.map((p) => p.name).join(', ')}` : 'No one mentioned yet'}
        </Text>
      )}
    </>
  );
}

export default {
  component: 'Mentions',
  tier: 'compound',
  summary: 'A text area where typing “@” suggests people to mention; choosing one writes their name into the text.',
  stories: [
    {
      title: 'Mention someone',
      description: 'Type “@” and a few letters: the list narrows as you type. Up and Down move, Enter or Tab mentions, Escape closes the list and lets you keep typing. Below, the people the comment will notify.',
      code: `<Mentions label="Comment" people={team} value={text} onChange={setText} onMentionsChange={setMentioned} />`,
      render: () => <Demo label="Comment" people={team} placeholder="Ask @Mira Okafor for the notes" rows={3} showMentioned />,
    },
    {
      title: 'With mentions already in it',
      description: 'A mention is the trigger and the name, as plain text: it reads the same anywhere the text is shown.',
      code: `<Mentions label="Reply" people={team} value="Thanks @Aiko Brandt, this is ready for @Kenji Watanabe. " … />`,
      render: () => <Demo label="Reply" people={team} rows={3} grow initial="Thanks @Aiko Brandt, this is ready for @Kenji Watanabe. " showMentioned />,
    },
    {
      title: 'Another trigger',
      description: 'The same pattern for topics: `trigger="#"` suggests from its own list.',
      code: `<Mentions label="Post" trigger="#" people={topics} … />`,
      render: () => <Demo label="Post" trigger="#" people={topics} rows={2} placeholder="Share an update, tag it with #launch" />,
    },
  ],
} satisfies StoryFile;
