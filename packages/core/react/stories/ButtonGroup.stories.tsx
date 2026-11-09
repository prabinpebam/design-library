import { Button } from '../fundamentals/Button';
import { ButtonGroup } from '../fundamentals/ButtonGroup';
import type { StoryFile } from './story';

export default {
  component: 'ButtonGroup',
  tier: 'fundamental',
  summary: 'Related buttons side by side as one named group.',
  stories: [
    {
      title: 'Spaced',
      description: 'A form’s actions: one primary, the others default or quiet, a pair’s gap apart. They wrap onto a new line rather than overflow.',
      code: `<ButtonGroup label="Page actions">
  <Button emphasis="primary" label="Publish" />
  <Button label="Preview" />
  <Button emphasis="quiet" label="Cancel" />
</ButtonGroup>`,
      render: () => (
        <ButtonGroup label="Page actions">
          <Button emphasis="primary" label="Publish" />
          <Button label="Preview" />
          <Button emphasis="quiet" label="Cancel" />
        </ButtonGroup>
      ),
    },
    {
      title: 'Attached',
      description: 'Joined into one shape: only the outer ends are rounded and neighbours share one line. Each button keeps its own name and target; Tab moves through them.',
      code: `<ButtonGroup label="Zoom" arrangement="attached">
  <Button icon="minus" iconOnly label="Zoom out" />
  <Button label="100%" />
  <Button icon="plus" iconOnly label="Zoom in" />
</ButtonGroup>`,
      render: () => (
        <ButtonGroup label="Zoom" arrangement="attached">
          <Button icon="minus" iconOnly label="Zoom out" />
          <Button label="100%" />
          <Button icon="plus" iconOnly label="Zoom in" />
        </ButtonGroup>
      ),
    },
    {
      title: 'Attached, every size',
      description: 'The group takes its members’ size; members keep the target of their size step.',
      code: `<ButtonGroup label="Zoom" arrangement="attached">
  <Button size="s" icon="minus" iconOnly label="Zoom out" />
  …
</ButtonGroup>`,
      render: () => (
        <>
          {(['xs', 's', 'normal', 'l', 'xxl'] as const).map((size) => (
            <ButtonGroup key={size} label={`Zoom, ${size}`} arrangement="attached">
              <Button size={size} icon="minus" iconOnly label="Zoom out" />
              <Button size={size} label="100%" />
              <Button size={size} icon="plus" iconOnly label="Zoom in" />
            </ButtonGroup>
          ))}
        </>
      ),
    },
  ],
} satisfies StoryFile;
