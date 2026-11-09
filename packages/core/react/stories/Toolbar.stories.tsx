import { Toolbar } from '../compounds/Toolbar';
import { Button } from '../fundamentals/Button';
import { Select } from '../fundamentals/Select';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

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
  ],
} satisfies StoryFile;
