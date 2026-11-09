import { useState } from 'react';
import { GradientEditor, type GradientEditorProps, type GradientStop } from '../compounds/GradientEditor';
import type { StoryFile } from './story';

function Live({ initial, ...rest }: Omit<GradientEditorProps, 'stops' | 'onChange'> & { initial: GradientStop[] }) {
  const [stops, setStops] = useState(initial);
  return <GradientEditor {...rest} stops={stops} onChange={setStops} />;
}

export default {
  component: 'GradientEditor',
  tier: 'compound',
  summary: 'Edits a gradient’s colour stops on a bar painted with the gradient: move, add, remove and recolour them.',
  stories: [
    {
      title: 'Edit a gradient',
      description: 'Drag a stop to move it; click the bar to add one in the colour already there; drag a stop off the bar to remove it. The selected stop’s swatch opens the colour picker.',
      code: `<GradientEditor label="Header background" stops={stops} onChange={setStops} />`,
      render: () => (
        <Live
          label="Header background"
          initial={[
            { id: 'a', position: 0, colour: '#4f5bd5' },
            { id: 'b', position: 55, colour: '#c04fd5' },
            { id: 'c', position: 100, colour: '#ffb86b' },
          ]}
        />
      ),
    },
    {
      title: 'Two stops, the least a gradient has',
      description: 'Remove stop is unavailable and says why; Delete on a stop says so too. Add stop puts a new stop in the widest gap.',
      code: `<GradientEditor label="Fade" stops={[{ id: 'a', position: 0, colour: '#111114' }, { id: 'b', position: 100, colour: '#ffffff' }]} onChange={setStops} />`,
      render: () => (
        <Live
          label="Fade"
          initial={[
            { id: 'a', position: 0, colour: '#111114' },
            { id: 'b', position: 100, colour: '#ffffff' },
          ]}
        />
      ),
    },
    {
      title: 'Flip and distribute',
      description: 'Flip mirrors every stop; Distribute evenly spaces them from end to end in their current order.',
      code: `<GradientEditor label="Heat map" stops={heat} description="Low values on the left." onChange={setHeat} />`,
      render: () => (
        <Live
          label="Heat map"
          description="Low values on the left."
          initial={[
            { id: 'a', position: 0, colour: '#2b3a8c' },
            { id: 'b', position: 12, colour: '#2e7d32' },
            { id: 'c', position: 30, colour: '#ffc857' },
            { id: 'd', position: 92, colour: '#c62828' },
          ]}
        />
      ),
    },
    {
      title: 'Unavailable',
      description: 'The gradient shows but nothing moves; say why nearby.',
      code: `<GradientEditor label="Brand gradient" disabled stops={stops} onChange={setStops} />`,
      render: () => (
        <Live
          label="Brand gradient"
          disabled
          description="Locked by your organisation’s theme."
          initial={[
            { id: 'a', position: 0, colour: '#4f5bd5' },
            { id: 'b', position: 100, colour: '#8590ff' },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
