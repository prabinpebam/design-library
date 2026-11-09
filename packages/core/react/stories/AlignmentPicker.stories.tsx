import { useState } from 'react';
import { AlignmentPicker, type Alignment } from '../fundamentals/AlignmentPicker';
import type { StoryFile } from './story';

function Live({ initial, disabled }: { initial: Alignment; disabled?: boolean }) {
  const [value, setValue] = useState(initial);
  return <AlignmentPicker label="Alignment" value={value} onChange={setValue} disabled={disabled} />;
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
      title: 'Unavailable',
      description: 'When the box doesn’t arrange its children (no auto layout), the points can’t be chosen.',
      code: `<AlignmentPicker label="Alignment" value={value} onChange={setAlignment} disabled />`,
      render: () => <Live initial={{ x: 'end', y: 'end' }} disabled />,
    },
  ],
} satisfies StoryFile;
