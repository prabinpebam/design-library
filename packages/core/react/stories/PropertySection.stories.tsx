import { useState } from 'react';
import { Button } from '../fundamentals/Button';
import { NumberField } from '../fundamentals/NumberField';
import { Stack } from '../fundamentals/Stack';
import { Cluster } from '../fundamentals/Cluster';
import { PropertySection } from '../compounds/PropertySection';
import type { StoryFile } from './story';

function Effects() {
  const [blurs, setBlurs] = useState<number[]>([]);
  return (
    <PropertySection heading="Effects" actions={<Button label="Add effect" icon="plus" iconOnly emphasis="quiet" size="s" onClick={() => setBlurs((b) => [...b, 4])} />}>
      {blurs.length > 0 && (
        <Stack gap="item">
          {blurs.map((v, i) => (
            <Cluster key={i} gap="item" wrap={false}>
              <NumberField label={`Effect ${i + 1}, blur`} glyph="B" hideLabel size="s" unit="px" min={0} value={v} onCommit={(n) => setBlurs((b) => b.map((x, j) => (j === i ? n : x)))} />
              <Button label={`Remove effect ${i + 1}`} icon="minus" iconOnly emphasis="quiet" size="s" onClick={() => setBlurs((b) => b.filter((_, j) => j !== i))} />
            </Cluster>
          ))}
        </Stack>
      )}
    </PropertySection>
  );
}

function Position() {
  const [x, setX] = useState(32);
  const [y, setY] = useState(376);
  return (
    <PropertySection heading="Position">
      <Cluster gap="item" wrap={false}>
        <NumberField label="X position" glyph="X" hideLabel size="s" unit="px" value={x} onCommit={setX} />
        <NumberField label="Y position" glyph="Y" hideLabel size="s" unit="px" value={y} onCommit={setY} />
      </Cluster>
    </PropertySection>
  );
}

export default {
  component: 'PropertySection',
  tier: 'compound',
  summary: 'One group of an inspector or settings panel: its heading and actions on one row, then its rows.',
  stories: [
    {
      title: 'With rows',
      description: 'A heading, then the group’s fields. Groups sit apart by the panel’s gap, with no box or rule.',
      code: `<PropertySection heading="Position">…fields…</PropertySection>`,
      render: () => <Position />,
    },
    {
      title: 'Empty, with an add action',
      description: 'A group that holds nothing yet shows only its heading and its add action. Add two effects, then remove one.',
      code: `<PropertySection heading="Effects" actions={<Button label="Add effect" icon="plus" iconOnly … />}>{rows}</PropertySection>`,
      render: () => <Effects />,
    },
  ],
} satisfies StoryFile;
