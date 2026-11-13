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
      title: 'Account, sort and filter triggers',
      description: 'An account menu opened from the person’s avatar; a trigger whose own glyph says a menu opens drops the chevron, and can put the glyph after its words.',
      code: `<MenuButton label="Account" iconOnly emphasis="quiet" avatar={{ name: 'Ana Ruiz' }} items={account} onSelect={act} />
<MenuButton label="Sort by" icon="sort" chevron={false} emphasis="quiet" items={sorts} onSelect={sort} />
<MenuButton label="Filters" icon="filter-lines" iconEnd chevron={false} emphasis="quiet" items={filters} onSelect={filter} />`,
      render: () => (
        <>
          <MenuButton label="Account" iconOnly emphasis="quiet" avatar={{ name: 'Ana Ruiz' }} items={[{ value: 'profile', label: 'Your profile' }, { value: 'out', label: 'Sign out', startsGroup: true }]} onSelect={() => undefined} />
          <MenuButton label="Sort by" icon="sort" chevron={false} emphasis="quiet" items={[{ value: 'top', label: 'Top', checked: true }, { value: 'new', label: 'Newest first', checked: false }]} onSelect={() => undefined} />
          <MenuButton label="Filters" icon="filter-lines" iconEnd chevron={false} emphasis="quiet" items={[{ value: 'today', label: 'Today', heading: 'Upload date', checked: false }, { value: 'week', label: 'This week', checked: false }]} onSelect={() => undefined} />
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'Unavailable',
      description: 'The menu can’t open here; say why nearby.',
      code: `<MenuButton label="Presets" disabled items={presets} onSelect={applyPreset} />`,
      render: () => <MenuButton label="Presets" disabled items={presets} onSelect={() => undefined} />,
    },
  ],
} satisfies StoryFile;
