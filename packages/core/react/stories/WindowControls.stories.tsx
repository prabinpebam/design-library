import { useState } from 'react';
import { TitleBar } from '../compounds/TitleBar';
import { WindowControls, type WindowState } from '../compounds/WindowControls';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

function Frame() {
  const [state, setState] = useState<WindowState>('normal');
  if (state === 'minimised' || state === 'closed') {
    return (
      <Cluster>
        <Text>{state === 'closed' ? 'Report.docx is closed.' : 'Report.docx is minimised.'}</Text>
        <Button label={state === 'closed' ? 'Open again' : 'Restore'} size="s" onClick={() => setState('normal')} />
      </Cluster>
    );
  }
  return <TitleBar title="Report.docx" href="#/" meta={state === 'maximised' ? 'Maximised' : undefined} actions={<WindowControls state={state} onChange={setState} />} />;
}

export default {
  component: 'WindowControls',
  tier: 'compound',
  summary: 'A desktop window’s caption buttons: Minimise, Maximise or Restore Down, and Close.',
  stories: [
    {
      title: 'In a title bar',
      description: 'The parent owns the state. Maximise becomes Restore Down while the window is maximised; a minimised or closed window gives way to one line and a way back.',
      code: `const [state, setState] = useState<WindowState>('normal');\n<TitleBar title="Report.docx" href="#/" actions={<WindowControls state={state} onChange={setState} />} />`,
      render: () => <Frame />,
    },
    {
      title: 'Maximised',
      description: 'The middle button is named and drawn for what it does now.',
      code: `<WindowControls state="maximised" onChange={setState} />`,
      render: () => <WindowControls state="maximised" onChange={() => undefined} />,
    },
  ],
} satisfies StoryFile;
