import { useState } from 'react';
import { FloatingBar } from '../compounds/FloatingBar';
import { SegmentedControl } from '../fundamentals/SegmentedControl';
import type { StoryFile } from './story';

function Appearance() {
  const [scheme, setScheme] = useState('light');
  const [contrast, setContrast] = useState('standard');
  return (
    <FloatingBar label="Appearance" placement="inline">
      <SegmentedControl label="Colour scheme" iconOnly size="s" value={scheme} onChange={setScheme} options={[{ value: 'light', label: 'Light', icon: 'scheme-light' }, { value: 'dark', label: 'Dark', icon: 'scheme-dark' }]} />
      <SegmentedControl label="Contrast" iconOnly size="s" value={contrast} onChange={setContrast} options={[{ value: 'standard', label: 'Standard contrast', icon: 'contrast-standard' }, { value: 'more', label: 'More contrast', icon: 'contrast-more' }]} />
    </FloatingBar>
  );
}

export default {
  component: 'FloatingBar',
  tier: 'compound',
  summary: 'A small bar that floats at the window’s bottom end corner, for controls that belong to the frame around a screen.',
  stories: [
    {
      title: 'Appearance for a standalone preview',
      description: 'Light or dark, and standard or more contrast, as icon-only segmented controls with their names as tooltips. On a page it floats at the bottom end corner (`placement="window"`); here it sits in the flow.',
      code: `<FloatingBar label="Appearance">
  <SegmentedControl label="Colour scheme" iconOnly size="s" … />
  <SegmentedControl label="Contrast" iconOnly size="s" … />
</FloatingBar>`,
      render: () => <Appearance />,
    },
  ],
} satisfies StoryFile;
