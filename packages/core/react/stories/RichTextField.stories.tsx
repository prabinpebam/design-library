import { useState } from 'react';
import { RichTextField } from '../compounds/RichTextField';
import type { StoryFile } from './story';

const tools = {
  bold: 'Bold (Ctrl+B)', italic: 'Italic (Ctrl+I)', strikethrough: 'Strikethrough (Ctrl+Shift+X)', code: 'Code (Ctrl+E)', link: 'Link (Ctrl+K)',
  bulleted: 'Bulleted list (Ctrl+Shift+8)', numbered: 'Numbered list (Ctrl+Shift+7)', outdent: 'Outdent (Ctrl+[)', indent: 'Indent (Ctrl+])',
};
const words = { saving: 'Saving…', saved: 'Saved', failed: 'Couldn’t save. Your words are kept.', retry: 'Retry', tooLong: 'Too long: shorten it to save.', invalidLink: 'That link can’t be used: use an address starting with https:// or mailto:.' };
const askLink = (href: string) => Promise.resolve(window.prompt('Link address', href || 'https://'));
const about = 'A talk about **designing for the long tail**: the needs most products _forget_.\n\n- Who it helps\n- What it costs\n\nSee [the notes](https://example.com/notes).';

function Demo({ fails = false, maxLength }: { fails?: boolean; maxLength?: number }) {
  const [value, setValue] = useState(about);
  return (
    <RichTextField
      label="About the talk"
      toolsLabel="Formatting"
      hint="Leaving the field saves it."
      value={value}
      onChange={setValue}
      onCommit={() => new Promise<void>((resolve, reject) => setTimeout(() => (fails ? reject(new Error('offline')) : resolve()), 600))}
      askLink={askLink}
      tools={tools}
      words={words}
      maxLength={maxLength}
    />
  );
}

export default {
  component: 'RichTextField',
  tier: 'compound',
  summary: 'Words edited as they read, with a formatting toolbar, stored as Markdown: paragraphs, lists, bold, italic, strike, code and safe links. Not a source-code editor.',
  stories: [
    {
      title: 'Formatted words, saved on leaving',
      description: 'LR109: the toolbar and shortcuts format the words in place; the value is Markdown, never HTML. Leaving the whole field saves it once and says so.',
      code: `<RichTextField label="About the talk" toolsLabel="Formatting" value={markdown} onChange={setMarkdown} onCommit={save} askLink={openLinkDialog} tools={toolNames} words={words} />`,
      render: () => <Demo />,
    },
    {
      title: 'A save that fails',
      description: 'A refused save keeps every word in the field and offers Retry.',
      code: `<RichTextField onCommit={() => Promise.reject(new Error('offline'))} … />`,
      render: () => <Demo fails />,
    },
    {
      title: 'A length limit',
      description: 'maxLength is soft: words past it are kept and the field says it is too long, rather than cutting them off.',
      code: `<RichTextField maxLength={120} … />`,
      render: () => <Demo maxLength={120} />,
    },
  ],
} satisfies StoryFile;