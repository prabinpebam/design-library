import { useRef } from 'react';
import { useRichText } from '../behaviour/rich-text';
import { Toolbar } from '../compounds/Toolbar';
import { Button } from '../fundamentals/Button';
import { Select } from '../fundamentals/Select';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

// useRichText (G6): the toolbar's commands act on the person's last selection in the note, and read its formatting back.
function NoteEditor() {
  const note = useRef<HTMLDivElement>(null);
  const { surface, run, state } = useRichText(note);
  return (
    <Stack gap="item">
      <Toolbar>
        <Button label="Bold" icon="bold" iconOnly pressed={!!state.active.bold} onClick={() => run('bold')} />
        <Button label="Italic" icon="italic" iconOnly pressed={!!state.active.italic} onClick={() => run('italic')} />
        <Button label="Underline" icon="underline" iconOnly pressed={!!state.active.underline} onClick={() => run('underline')} />
        <Button label="Bullets" icon="list-bulleted" iconOnly pressed={!!state.active.bullets} onClick={() => run('bullets')} />
        <Button label="Undo" icon="undo" iconOnly disabled={!state.canUndo} onClick={() => run('undo')} />
      </Toolbar>
      <div ref={note} aria-label="Meeting note" {...surface}>
        <p>Select a few words, then make them bold or turn the line into a bullet.</p>
      </div>
    </Stack>
  );
}

export default {
  component: 'Toolbar',
  tier: 'compound',
  summary: 'A row of related actions, or a control or status with its actions.',
  stories: [
    {
      title: 'A control and its action',
      description: 'The control takes the room that’s left; the action lines up with the control, under its label.',
      code: `<Toolbar start={<Select label="Current revision" … />}><Button label="New revision" icon="plus" iconOnly /></Toolbar>`,
      render: () => (
        <Toolbar start={<Select label="Current revision" value="a" options={[{ value: 'a', label: 'Spacing review' }, { value: 'b', label: 'Colour review' }]} onChange={() => undefined} />}>
          <Button label="New revision" icon="plus" iconOnly onClick={() => undefined} />
        </Toolbar>
      ),
    },
    {
      title: 'A status and its action',
      description: 'Centred on the line of text.',
      code: `<Toolbar align="center" start={<Text as="span" variant="body-sm" tone="muted">2 elements selected</Text>}><Button label="Clear selection" emphasis="quiet" /></Toolbar>`,
      render: () => (
        <Toolbar
          align="center"
          start={
            <Text as="span" variant="body-sm" tone="muted">
              2 elements selected
            </Text>
          }
        >
          <Button label="Clear selection" emphasis="quiet" onClick={() => undefined} />
        </Toolbar>
      ),
    },
    {
      title: 'Actions only',
      description: 'They wrap onto more lines rather than overlap.',
      code: `<Toolbar><Button label="Archive" emphasis="primary" /><Button label="Cancel" emphasis="quiet" /></Toolbar>`,
      render: () => (
        <Toolbar>
          <Button label="Archive" emphasis="primary" onClick={() => undefined} />
          <Button label="Cancel" emphasis="quiet" onClick={() => undefined} />
        </Toolbar>
      ),
    },
    {
      title: 'Driving a rich-text surface',
      description:
        'useRichText makes an element the app renders an editing surface: spread `surface` on it, call `run` from the toolbar, and read `state` for each pressed look. A command acts on the last selection in the surface, even after focus moved to the toolbar. Undo is the surface’s own history.',
      code: `const { surface, run, state } = useRichText(ref);
<Toolbar><Button label="Bold" icon="bold" iconOnly pressed={!!state.active.bold} onClick={() => run('bold')} /></Toolbar>
<div ref={ref} aria-label="Meeting note" {...surface}>…</div>`,
      render: () => <NoteEditor />,
    },
  ],
} satisfies StoryFile;
