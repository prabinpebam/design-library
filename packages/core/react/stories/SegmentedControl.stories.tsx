import { useState } from 'react';
import { SegmentedControl, type SegmentedControlProps } from '../fundamentals/SegmentedControl';
import type { ButtonSize } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const sizes: [ButtonSize, string][] = [
  ['xs', 'xs · 24 px'],
  ['s', 's · 36 px (default)'],
  ['normal', 'normal · 44 px'],
  ['m', 'm · 48 px'],
  ['l', 'l · 56 px'],
  ['xl', 'xl · 64 px'],
  ['xxl', 'xxl · 80 px'],
];

function Choice({ initial, ...rest }: Omit<SegmentedControlProps, 'value' | 'onChange'> & { initial: string }) {
  const [value, setValue] = useState(initial);
  return <SegmentedControl {...rest} value={value} onChange={setValue} />;
}

const schemes = [
  { value: 'light', label: 'Light', icon: 'scheme-light' },
  { value: 'dark', label: 'Dark', icon: 'scheme-dark' },
] as const;

const contrasts = [
  { value: 'standard', label: 'Standard contrast', icon: 'contrast-standard' },
  { value: 'more', label: 'More contrast', icon: 'contrast-more' },
] as const;

const units = [
  { value: 'rem', label: 'Rem' },
  { value: 'px', label: 'Pixels' },
];

/** Four views of one project, for the motion story: wide enough that the fill visibly travels. */
const views = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'timeline', label: 'Timeline' },
];

export default {
  component: 'SegmentedControl',
  tier: 'fundamental',
  summary: 'Chooses one of a few exclusive options, side by side, that apply at once.',
  stories: [
    {
      title: 'Icons only',
      description: 'The title bar’s choices, at the default s size (36 px). Hover or focus a segment for its name; the arrow keys move the choice.',
      code: `<SegmentedControl label="Colour scheme" iconOnly options={schemes} value={scheme} onChange={setScheme} />
<SegmentedControl label="Contrast" iconOnly options={contrasts} value={contrast} onChange={setContrast} />`,
      render: () => (
        <>
          <Choice label="Colour scheme" iconOnly options={[...schemes]} initial="light" />
          <Choice label="Contrast" iconOnly options={[...contrasts]} initial="more" />
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'xs, inside content',
      description: 'The 24 px size, for a choice inside content such as a toolbar over a preview. s (36 px) is the default, for dense surfaces such as the title bar.',
      code: `<SegmentedControl label="Colour scheme" iconOnly size="xs" options={schemes} value={scheme} onChange={setScheme} />`,
      render: () => (
        <>
          <Choice label="Colour scheme" iconOnly size="xs" options={[...schemes]} initial="dark" />
          <Choice label="Contrast" iconOnly size="xs" options={[...contrasts]} initial="standard" />
        </>
      ),
      arrangement: 'row',
    },
    {
      title: 'Sizes',
      description: 'The Button size scale, smallest first, so a choice sits level with the buttons beside it. xs and s are dense (written target exceptions); normal and up meet 44 px.',
      code: `<SegmentedControl size="normal" label="Show as" options={views} value={view} onChange={setView} />  // xs, s (default), normal, m, l, xl, xxl`,
      render: () => (
        <Stack gap="group">
          {sizes.map(([size, name]) => (
            <Stack key={size} gap="pair">
              <Text variant="caption" tone="muted">
                {name}
              </Text>
              <Cluster gap="item">
                <Choice size={size} label="Show sizes in" options={units} initial="rem" />
                <Choice size={size} label="Colour scheme" iconOnly options={[...schemes]} initial="light" />
              </Cluster>
            </Stack>
          ))}
        </Stack>
      ),
    },
    {
      title: 'With words',      description: 'Where an icon wouldn’t be recognised faster than the word, each segment shows its label.',
      code: `<SegmentedControl label="Show sizes in" options={units} value={unit} onChange={setUnit} />`,
      render: () => <Choice label="Show sizes in" options={units} initial="rem" />,
    },
    {
      title: 'Motion',
      description: 'Click across the segments: the fill slides from the old choice to the new one over 200 ms while the text colours fade. Use the arrow keys instead and it moves at once, as fast as the keys repeat. Below, reduced motion: the fill never slides.',
      code: `<SegmentedControl label="Show as" options={views} value={view} onChange={setView} />`,
      render: () => (
        <Stack gap="group">
          <Choice size="normal" label="Show as" options={views} initial="list" />
          <Stack data-motion="reduce" gap="pair">
            <Text variant="caption" tone="muted">
              Reduced motion
            </Text>
            <Choice size="normal" label="Show as, reduced motion" options={views} initial="list" />
          </Stack>
        </Stack>
      ),
    },
    {
      title: 'Unavailable',
      description: 'The choice can’t change here; say why nearby.',
      code: `<SegmentedControl label="Colour scheme" iconOnly disabled options={schemes} value="dark" onChange={setScheme} />`,
      render: () => <Choice label="Colour scheme" iconOnly disabled options={[...schemes]} initial="dark" />,
    },
  ],
} satisfies StoryFile;
