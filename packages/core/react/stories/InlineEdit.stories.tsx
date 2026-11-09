import { useState } from 'react';
import { InlineEdit, type InlineEditProps } from '../compounds/InlineEdit';
import type { StoryFile } from './story';

/** An inline edit backed by a save that takes `ms` and either stores the value or fails. */
function Editable({ initial = '', ms = 500, fails = false, ...rest }: Omit<InlineEditProps, 'value' | 'onCommit'> & { initial?: string; ms?: number; fails?: boolean }) {
  const [value, setValue] = useState(initial);
  const save = (next: string) =>
    new Promise<void>((resolve, reject) =>
      setTimeout(() => {
        if (fails) return reject(new Error('refused'));
        setValue(next);
        resolve();
      }, ms),
    );
  return <InlineEdit {...rest} value={value} onCommit={save} />;
}

export default {
  component: 'InlineEdit',
  tier: 'compound',
  summary: 'Text shown as text until it’s pressed; then a field in the same place and size. Enter or leaving saves, Escape cancels.',
  stories: [
    {
      title: 'A title',
      description: 'Press the title (or Tab to it and press Enter) to edit it. The field takes the text’s exact place, so nothing moves; Enter or clicking away saves, Escape keeps the old title.',
      code: `<InlineEdit size="xxl" label="Project title" value={title} onCommit={saveTitle} />`,
      render: () => <Editable size="xxl" label="Project title" initial="Spring launch plan" />,
    },
    {
      title: 'Sizes',
      description: '`xxl` for a page or item title, `l` for a subtitle, `normal` (default) for a value in a row or a list. The pencil shows only under the pointer or the focus.',
      code: `<InlineEdit size="xxl" label="Project title" … />
<InlineEdit size="l" label="Subtitle" … />
<InlineEdit label="Owner" … />`,
      render: () => (
        <>
          <Editable size="xxl" label="Project title" initial="Spring launch plan" />
          <Editable size="l" label="Subtitle" initial="Everything that ships before the first of May" />
          <Editable label="Owner" initial="Mira Okafor" />
        </>
      ),
    },
    {
      title: 'Empty',
      description: 'With no text, the placeholder says what to add, muted, and pressing it starts an empty field.',
      code: `<InlineEdit label="Description" placeholder="Add a description" value="" onCommit={save} />`,
      render: () => <Editable label="Description" placeholder="Add a description" />,
    },
    {
      title: 'A save that fails',
      description: 'The field stays open with what was typed, says the change wasn’t saved and offers Retry; Escape gives up and keeps the old text.',
      code: `<InlineEdit label="Project title" value={title} onCommit={failingSave} />`,
      render: () => <Editable size="l" label="Project title" initial="Spring launch plan" fails ms={700} />,
    },
    {
      title: 'Read only',
      description: 'For someone who can’t change it: the same text in the same place, with no button and no pencil.',
      code: `<InlineEdit readOnly label="Project title" value="Spring launch plan" onCommit={save} />`,
      render: () => <InlineEdit readOnly size="l" label="Project title" value="Spring launch plan" onCommit={() => undefined} />,
    },
  ],
} satisfies StoryFile;
