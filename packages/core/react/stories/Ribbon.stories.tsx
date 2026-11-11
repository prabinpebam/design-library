import { Ribbon } from '../compounds/Ribbon';
import { Button } from '../fundamentals/Button';
import type { StoryFile } from './story';

const clipboard = (
  <>
    <Button label="Paste" icon="paste" />
    <Button label="Cut" icon="cut" iconOnly size="xs" emphasis="quiet" />
    <Button label="Copy" icon="copy" iconOnly size="xs" emphasis="quiet" />
  </>
);
const font = (
  <>
    <Button label="Bold" icon="bold" iconOnly size="xs" emphasis="quiet" pressed={false} />
    <Button label="Italic" icon="italic" iconOnly size="xs" emphasis="quiet" pressed={false} />
    <Button label="Underline" icon="underline" iconOnly size="xs" emphasis="quiet" pressed={false} />
  </>
);
const paragraph = (
  <>
    <Button label="Bullets" icon="list-bulleted" iconOnly size="xs" emphasis="quiet" />
    <Button label="Numbering" icon="list-numbered" iconOnly size="xs" emphasis="quiet" />
    <Button label="Align left" icon="text-start" iconOnly size="xs" emphasis="quiet" pressed />
  </>
);

export default {
  component: 'Ribbon',
  tier: 'compound',
  summary: 'An app’s command ribbon: tabs over a card of labelled command groups.',
  stories: [
    {
      title: 'Home',
      description: 'Groups separated by hairlines, each named under its commands; Font and Paragraph open their settings from a launcher.',
      code: `<Ribbon label="Ribbon" tabs={[{ id: 'home', label: 'Home', groups: [{ id: 'font', label: 'Font', launcher: 'Font settings', commands: … }] }]} extra={<Button label="Share" emphasis="primary" size="s" />} />`,
      render: () => (
        <Ribbon
          label="Ribbon"
          extra={<Button label="Share" icon="share" emphasis="primary" size="s" />}
          tabs={[
            { id: 'home', label: 'Home', groups: [
              { id: 'clipboard', label: 'Clipboard', commands: clipboard },
              { id: 'font', label: 'Font', launcher: 'Font settings', commands: font },
              { id: 'paragraph', label: 'Paragraph', launcher: 'Paragraph settings', commands: paragraph },
            ] },
            { id: 'insert', label: 'Insert', groups: [{ id: 'tables', label: 'Tables', commands: <Button label="Table" icon="grid" /> }] },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
