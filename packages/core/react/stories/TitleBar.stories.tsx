import { Button } from '../fundamentals/Button';
import { TitleBar } from '../compounds/TitleBar';
import type { StoryFile } from './story';

export default {
  component: 'TitleBar',
  tier: 'compound',
  summary: 'The top of an app: its name, version and status, then app-wide controls.',
  stories: [
    {
      title: 'Name and status',
      description: 'The name links home; the line after it says which version this is and how far it has got.',
      code: `<TitleBar title="Design Library" href="#/overview" meta="0.1.0 · candidate, nothing approved yet" />`,
      render: () => <TitleBar title="Design Library" href="#/overview" meta="0.1.0 · candidate, nothing approved yet" />,
    },
    {
      title: 'With actions',
      description: 'App-wide controls sit at the end, each with its own name. On a narrow screen they wrap below the name rather than cover it.',
      code: `<TitleBar title="Design Library" href="#/overview" meta="0.1.0" actions={<Button label="Revisions" icon="comment" iconOnly emphasis="quiet" size="s" />} />`,
      render: () => <TitleBar title="Design Library" href="#/overview" meta="0.1.0" actions={<Button label="Revisions" icon="comment" iconOnly emphasis="quiet" size="s" />} />,
    },
  ],
} satisfies StoryFile;
