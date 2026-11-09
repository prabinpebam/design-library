import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Stack } from '../fundamentals/Stack';
import { Tooltip } from '../fundamentals/Tooltip';
import type { StoryFile } from './story';

export default {
  component: 'Tooltip',
  tier: 'fundamental',
  summary: 'A short hint beside a control, on hover or keyboard focus.',
  stories: [
    {
      title: 'Names of icon-only controls',
      description: 'The usual job, and built in: every icon-only Button shows its label as this hint without a Tooltip around it, after a short wait on hover and at once on keyboard focus. Move along the row: once one hint has shown, the next shows at once. Wrap it in a Tooltip only for a shortcut or a side; that hint replaces the built-in one, so there is only ever one. The button’s own name already says the words, so the hint isn’t read twice.',
      code: `<Button label="Comment" icon="comment" iconOnly emphasis="quiet" />   // the hint is built in
<Tooltip content="Search" shortcut="/"><Button label="Search" icon="search" iconOnly emphasis="quiet" /></Tooltip>`,
      render: () => (
        <Cluster gap="pair">
          <Button label="Comment" icon="comment" iconOnly emphasis="quiet" />
          <Button label="Edit" icon="edit" iconOnly emphasis="quiet" />
          <Tooltip content="Search" shortcut="/">
            <Button label="Search" icon="search" iconOnly emphasis="quiet" />
          </Tooltip>
          <Button label="Close" icon="close" iconOnly emphasis="quiet" />
        </Cluster>
      ),
    },
    {
      title: 'A description',
      description: 'kind="description": a few extra words read after the control’s name, for a control that already has visible words. Nothing to click inside; anything longer, or with a link, belongs in a popover. An unavailable button shows its reason as its own hint, already its description, so it isn’t read twice.',
      code: `<Tooltip kind="description" content="Last published 2 minutes ago"><Button label="Publish" /></Tooltip>`,
      render: () => (
        <Cluster>
          <Tooltip kind="description" content="Last published 2 minutes ago">
            <Button label="Publish" emphasis="primary" />
          </Tooltip>
          <Button label="Share" unavailable="Add a title first." />
        </Cluster>
      ),
    },
    {
      title: 'Sides',
      description: 'Top by default; bottom, start or end when the top would cover what the person is reading. Start and end follow the writing direction. Near a window edge the hint flips to the other side and shifts to stay inside.',
      code: `<Tooltip side="end" content="Settings"><Button … /></Tooltip>  // top (default), bottom, start, end`,
      render: () => (
        <Stack gap="group">
          <Cluster>
            <Tooltip kind="description" side="top" content="Top (default)">
              <Button label="Top" />
            </Tooltip>
            <Tooltip kind="description" side="bottom" content="Bottom">
              <Button label="Bottom" />
            </Tooltip>
            <Tooltip kind="description" side="start" content="Start">
              <Button label="Start" />
            </Tooltip>
            <Tooltip kind="description" side="end" content="End">
              <Button label="End" />
            </Tooltip>
          </Cluster>
          <Cluster>
            <Tooltip kind="description" content="A longer hint wraps at the hint’s width rather than running across the page, though a hint this long is usually a sign it wants to be visible text.">
              <Button label="Long hint" />
            </Tooltip>
          </Cluster>
        </Stack>
      ),
    },
  ],
} satisfies StoryFile;
