import { useState } from 'react';
import { Button, type ButtonSize } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import { TextArea, type TextAreaProps } from '../fundamentals/TextArea';
import type { StoryFile } from './story';

function Area({ initial = '', ...rest }: Omit<TextAreaProps, 'value' | 'onChange'> & { initial?: string }) {
  const [text, setText] = useState(initial);
  return <TextArea {...rest} value={text} onChange={setText} />;
}

/** A summary that must say what changed: empty is refused with a fix. */
function Checked() {
  const [text, setText] = useState('');
  return <TextArea label="Release note" rows={3} value={text} onChange={setText} error={text.trim() ? undefined : 'Say what changed in this release, in a sentence or two.'} />;
}

const sizes: [ButtonSize, string][] = [
  ['xs', 'xs · body-sm'],
  ['s', 's · body-sm'],
  ['normal', 'normal · label (default)'],
  ['l', 'l · heading 4'],
  ['xxl', 'xxl · heading 3'],
];

const long = 'The colour page now shows each role once, with only the values that change between contexts in the columns. Spacing on component pages follows the layout’s gap, so examples line up with their headings. The button family gained a split button and a busy dropdown.';

/** Q56: a prompt box that turns the AI gradient while the model works; Send starts it, Stop ends it. */
function Prompt({ still = false }: { still?: boolean }) {
  const [text, setText] = useState('Summarise the review notes in three bullet points.');
  const [working, setWorking] = useState(!still ? false : true);
  return (
    <Stack gap="pair">
      <TextArea
        label={still ? 'Prompt, reduced motion' : 'Prompt'}
        hint="Ask about the review notes."
        size="m"
        grow
        rows={2}
        value={text}
        onChange={setText}
        processing={working ? 'Writing a reply' : undefined}
        data-motion={still ? 'reduce' : undefined}
      />
      <Cluster>
        {working ? <Button label="Stop" icon="close" onClick={() => setWorking(false)} /> : <Button label="Send" emphasis="primary" onClick={() => setWorking(true)} />}
      </Cluster>
    </Stack>
  );
}
export default {
  component: 'TextArea',
  tier: 'fundamental',
  summary: 'Several lines of text, sent by a separate action.',
  stories: [
    {
      title: 'Label and hint',
      description: 'The label says what goes in; the hint says what happens to it. An action beside it, such as Add comment, sends the text.',
      code: `<TextArea label="Comment" value={text} onChange={setText}
  hint="Say what should change and why. It's saved with the selected blocks." />`,
      render: () => <Area label="Comment" hint="Say what should change and why. It’s saved with the selected blocks." />,
    },
    {
      title: 'Sizes',
      description: 'The text size on the Button scale (the same steps as TextField; m and xl match normal and l); the height comes from the number of lines. xs and s are for dense panes; l and up for a composer that is the page’s main input.',
      code: `<TextArea size="l" rows={2} label="Message" value={text} onChange={setText} />  // xs, s, normal (default), m, l, xl, xxl`,
      render: () => (
        <Stack gap="group">
          {sizes.map(([size, name]) => (
            <Area key={size} size={size} rows={2} label={`Message · ${name}`} initial="Meet at the harbour at nine." />
          ))}
        </Stack>
      ),
    },
    {
      title: 'Fixed lines or growing',
      description: 'Left: four lines, then it scrolls, and the person can drag it taller. Right: it starts at two lines and grows as you type, to about twelve, then scrolls.',
      code: `<TextArea label="Completion summary" rows={4} maxLength={400} value={summary} onChange={setSummary} />
<TextArea label="Reply" rows={2} grow value={reply} onChange={setReply} />`,
      render: () => (
        <Grid max={2}>
          <Area label="Completion summary" rows={4} maxLength={400} initial={long} />
          <Area label="Reply" rows={2} grow placeholder="Write a reply…" />
        </Grid>
      ),
    },
    {
      title: 'States',
      description: 'Invalid says what to fix and keeps the text; read-only can be selected, copied and scrolled but not changed; disabled is for text that needn’t be read. Optional fields are the ones marked.',
      code: `<TextArea label="Release note" error="Say what changed in this release, in a sentence or two." … />
<TextArea label="Original request" readOnly value={request} … />
<TextArea label="Notes for the team" optional … />`,
      render: () => (
        <Grid max={2}>
          <Checked />
          <Area label="Original request" readOnly rows={3} initial={long} />
          <Area label="Notes for the team" optional rows={3} placeholder="Anything they should know first" />
          <Area label="Archived note" disabled rows={3} initial="Moved to the 2025 archive." hint="Archived notes can’t be edited." />
        </Grid>
      ),
    },
    {
      title: 'AI prompt, processing',
      description: 'While a model works on what was sent, the box’s ring turns a gradient from the AI colours (`color.ai.1-4`, a set declared for this state only, never status), whether or not the box has focus. The words under the box say what is happening, after a turning arc, and are announced once; the gradient is never the only cue. Under reduced motion the gradient stays still. The text stays editable so the next prompt can be written. Press Send, then Stop.',
      code: `<TextArea label="Prompt" size="m" grow rows={2} value={text} onChange={setText}
  processing={working ? 'Writing a reply' : undefined} />`,
      render: () => (
        <Grid max={2}>
          <Prompt />
          <Prompt still />
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;