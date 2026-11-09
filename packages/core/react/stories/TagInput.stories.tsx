import { useState } from 'react';
import { TagInput, type TagInputProps } from '../compounds/TagInput';
import type { StoryFile } from './story';

function Live({ initial, ...rest }: Omit<TagInputProps, 'value' | 'onChange'> & { initial: string[] }) {
  const [value, setValue] = useState(initial);
  return <TagInput {...rest} value={value} onChange={setValue} />;
}

const email = (tag: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag) ? undefined : `“${tag}” isn’t an email address. Check it or remove it.`);

export default {
  component: 'TagInput',
  tier: 'compound',
  summary: 'Turns typed text into removable tags: Enter or a comma ends one, a pasted list splits, repeats and a maximum are refused and said.',
  stories: [
    {
      title: 'Add tags',
      description: 'Type, then Enter or a comma. Backspace or Left in an empty box moves to the last tag; Delete removes it. Leaving the box adds what was typed.',
      code: `<TagInput label="Labels" hint="Press Enter or type a comma after each label." value={labels} onChange={setLabels} />`,
      render: () => <Live label="Labels" hint="Press Enter or type a comma after each label." placeholder="design, research" initial={['Design', 'Accessibility']} />,
    },
    {
      title: 'Paste a list',
      description: 'A pasted list splits on commas, line breaks and tabs; blanks are dropped and spaces trimmed. Try pasting “red, green, blue”.',
      code: `<TagInput label="Keywords" value={keywords} onChange={setKeywords} clearable />`,
      render: () => <Live label="Keywords" clearable placeholder="Paste or type keywords" initial={[]} />,
    },
    {
      title: 'Repeats and a maximum',
      description: 'A repeat (compared without case) is refused and said, and the typed text stays so it can be changed. Past the maximum, the box says how many it takes.',
      code: `<TagInput label="Topics" max={4} value={topics} onChange={setTopics} />`,
      render: () => <Live label="Topics" max={4} hint="Up to 4 topics." initial={['Tokens', 'Spacing', 'Colour']} />,
    },
    {
      title: 'Checked tags',
      description: 'A check can mark a tag invalid while keeping it, so nothing typed is lost: the tag shows an error icon and the message says what to do.',
      code: `<TagInput label="Invite people" validate={(t) => isEmail(t) ? undefined : \`“\${t}” isn’t an email address…\`} />`,
      render: () => <Live label="Invite people" validate={email} hint="Email addresses, separated by commas." initial={['ana@example.com', 'ben@example', 'chen@example.com']} />,
    },
    {
      title: 'Sizes',
      description: 's 36 px for dense panels (24 px chips), normal 44 px (32 px chips), l 56 px (40 px chips). The box grows a line at a time as tags wrap.',
      code: `<TagInput size="s" label="Filters" … />`,
      render: () => (
        <>
          <Live size="s" label="Filters, small" initial={['Open', 'Assigned to me']} />
          <Live label="Filters" initial={['Open', 'Assigned to me']} />
          <Live size="l" label="Filters, large" initial={['Open', 'Assigned to me']} />
        </>
      ),
    },
    {
      title: 'Read-only and unavailable',
      description: 'Read-only shows the tags with no Remove buttons; unavailable dims the field. Prefer read-only, or say why in the hint.',
      code: `<TagInput label="Labels" readOnly … />
<TagInput label="Labels" disabled hint="Only owners can change labels." … />`,
      render: () => (
        <>
          <Live label="Labels" readOnly initial={['Design', 'Accessibility', 'Tokens']} />
          <Live label="Labels" disabled hint="Only owners can change labels." initial={['Design', 'Accessibility']} />
        </>
      ),
    },
  ],
} satisfies StoryFile;
