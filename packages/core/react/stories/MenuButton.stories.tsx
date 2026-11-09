import { useState } from 'react';
import { MenuButton } from '../fundamentals/MenuButton';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const presets = [
  { value: 'ocean', label: 'Ocean', description: 'Calm: deep teal, sky and coral.', preview: ['#0e7490', '#38bdf8', '#f97316'] },
  { value: 'forest', label: 'Forest', description: 'Grounded: pine, ochre and stone.', preview: ['#166534', '#a16207', '#78716c'] },
  { value: 'graphite', label: 'Graphite', description: 'Quiet: one slate blue-grey.', preview: ['#475569'] },
];

const exports = [
  { value: 'json', label: 'Copy as JSON' },
  { value: 'css', label: 'Copy as CSS' },
];

function Chooser() {
  const [chosen, setChosen] = useState('none yet');
  return (
    <>
      <MenuButton label="Presets" menuLabel="Brand colour presets" items={presets} onSelect={setChosen} />
      <Text as="span" variant="body-sm" tone="muted">
        Chosen: {chosen}
      </Text>
    </>
  );
}

export default {
  component: 'MenuButton',
  tier: 'fundamental',
  summary: 'A button that opens a short menu of actions or starting points.',
  stories: [
    {
      title: 'Palette presets',
      description: 'Items with a colour strip and a one-line description. Open with the arrow keys or Enter; a letter jumps to an item.',
      code: `<MenuButton label="Presets" menuLabel="Brand colour presets" items={presets} onSelect={applyPreset} />`,
      render: () => <Chooser />,
      arrangement: 'row',
    },
    {
      title: 'Plain actions, dense',
      description: 'Words only, at the 36 px size for dense surfaces.',
      code: `<MenuButton label="Export" icon="copy" size="s" items={exports} onSelect={exportAs} />`,
      render: () => <MenuButton label="Export" icon="copy" size="s" items={exports} onSelect={() => undefined} />,
    },
    {
      title: 'Unavailable',
      description: 'The menu can’t open here; say why nearby.',
      code: `<MenuButton label="Presets" disabled items={presets} onSelect={applyPreset} />`,
      render: () => <MenuButton label="Presets" disabled items={presets} onSelect={() => undefined} />,
    },
  ],
} satisfies StoryFile;
