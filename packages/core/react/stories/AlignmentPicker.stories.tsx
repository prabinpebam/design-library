import { useState } from 'react';
import { AlignmentPicker, type Alignment } from '../fundamentals/AlignmentPicker';
import { Cluster } from '../fundamentals/Cluster';
import type { StoryFile } from './story';

function Live({ initial, disabled, flow }: { initial: Alignment; disabled?: boolean; flow?: 'row' | 'column' }) {
  const [value, setValue] = useState(initial);
  return <AlignmentPicker label="Alignment" value={value} onChange={setValue} disabled={disabled} flow={flow} />;
}

export default {
  component: 'AlignmentPicker',
  tier: 'fundamental',
  summary: 'Where a box’s contents sit, chosen on a 3 by 3 grid of points, as in a design tool’s auto layout.',
  stories: [
    {
      title: 'Top left',
      description: 'The chosen point carries the accent mark; the other eight are quiet dots. Arrow keys move and choose in two dimensions.',
      code: `<AlignmentPicker label="Alignment" value={{ x: 'start', y: 'start' }} onChange={setAlignment} />`,
      render: () => <Live initial={{ x: 'start', y: 'start' }} />,
    },
    {
      title: 'Centre',
      description: 'Children centred both ways. Press any point to move them there.',
      code: `<AlignmentPicker label="Alignment" value={{ x: 'center', y: 'center' }} onChange={setAlignment} />`,
      render: () => <Live initial={{ x: 'center', y: 'center' }} />,
    },
    {
      title: 'With a flow',
      description: 'Given the direction the contents run, the chosen point draws three bars laid out that way and aligned to it, so the mark previews the arrangement; hovering another point previews it there. A row on the left, a column on the right.',
      code: `<AlignmentPicker label="Alignment" value={value} onChange={setAlignment} flow="row" />`,
      render: () => (
        <Cluster gap="group">
          <Live initial={{ x: 'start', y: 'start' }} flow="row" />
          <Live initial={{ x: 'center', y: 'end' }} flow="column" />
        </Cluster>
      ),
    },
    {
      title: 'Unavailable',
      description: 'When the box doesn’t arrange its children (no auto layout), the points can’t be chosen.',
      code: `<AlignmentPicker label="Alignment" value={value} onChange={setAlignment} disabled />`,
      render: () => <Live initial={{ x: 'end', y: 'end' }} disabled />,
    },
  ],
} satisfies StoryFile;
