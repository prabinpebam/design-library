import { useState } from 'react';
import { AllocationSlider, type AllocationSegment, type AllocationSliderProps } from '../compounds/AllocationSlider';
import type { StoryFile } from './story';

function Live({ initial, ...rest }: Omit<AllocationSliderProps, 'segments' | 'onChange'> & { initial: AllocationSegment[] }) {
  const [segments, setSegments] = useState(initial);
  return <AllocationSlider {...rest} segments={segments} onChange={setSegments} />;
}

const budget: AllocationSegment[] = [
  { id: 'design', label: 'Design', share: 25 },
  { id: 'engineering', label: 'Engineering', share: 45 },
  { id: 'research', label: 'Research', share: 10 },
  { id: 'marketing', label: 'Marketing', share: 20 },
];

export default {
  component: 'AllocationSlider',
  tier: 'compound',
  summary: 'Shares a whole between parts that always add up to the total, by dragging the boundaries between them.',
  stories: [
    {
      title: 'Share a budget',
      description: 'Drag a boundary: only the two parts beside it change, and the total stays 100 %. Arrow keys move a focused boundary one step; Shift moves ten.',
      code: `<AllocationSlider label="Quarterly budget" segments={budget} onChange={setBudget} />`,
      render: () => <Live label="Quarterly budget" initial={budget} />,
    },
    {
      title: 'Eight parts, each its own colour',
      description: 'Each part draws in a category colour, 1 to 8 in order. Give a part its own category when parts can be reordered or hidden, so it keeps its colour everywhere it appears.',
      code: `<AllocationSlider label="Team time" segments={[{ id: 'design', label: 'Design', share: 15, category: 1 }, …]} />`,
      render: () => (
        <Live
          label="Team time"
          initial={['Design', 'Research', 'Marketing', 'Engineering', 'Sales', 'Support', 'Finance', 'Legal'].map((label, i) => ({ id: label.toLowerCase(), label, share: [15, 10, 10, 25, 15, 10, 10, 5][i], category: i + 1 }))}
        />
      ),
    },
    {
      title: 'Type an exact share',
      description: 'A box per part: a typed share takes from (or gives to) the next part that can change, and says which.',
      code: `<AllocationSlider label="Time this week" segments={time} input onChange={setTime} />`,
      render: () => (
        <Live
          label="Time this week"
          input
          initial={[
            { id: 'build', label: 'Building', share: 50 },
            { id: 'review', label: 'Reviews', share: 20 },
            { id: 'meet', label: 'Meetings', share: 15 },
            { id: 'learn', label: 'Learning', share: 15 },
          ]}
        />
      ),
    },
    {
      title: 'A fixed part and a floor',
      description: 'A locked part keeps its share: the boundaries beside it don’t move. minShare keeps every part from being emptied.',
      code: `<AllocationSlider label="Portfolio" minShare={5} segments={[{ id: 'cash', label: 'Cash', share: 10, locked: true }, …]} onChange={setPortfolio} />`,
      render: () => (
        <Live
          label="Portfolio"
          minShare={5}
          initial={[
            { id: 'cash', label: 'Cash', share: 10, locked: true },
            { id: 'bonds', label: 'Bonds', share: 30 },
            { id: 'shares', label: 'Shares', share: 45 },
            { id: 'property', label: 'Property', share: 15 },
          ]}
        />
      ),
    },
    {
      title: 'Sizes',
      description: 's 24 px for dense panels, normal 32 px, l 40 px; boundaries keep a 24 px hit area at every size.',
      code: `<AllocationSlider size="s" … />
<AllocationSlider … />
<AllocationSlider size="l" … />`,
      render: () => (
        <>
          <Live size="s" label="Small" initial={budget.slice(0, 3).map((s, i) => ({ ...s, share: [30, 50, 20][i] }))} />
          <Live label="Normal" initial={budget.slice(0, 3).map((s, i) => ({ ...s, share: [30, 50, 20][i] }))} />
          <Live size="l" label="Large" initial={budget.slice(0, 3).map((s, i) => ({ ...s, share: [30, 50, 20][i] }))} />
        </>
      ),
    },
    {
      title: 'Read-only, unavailable and bad data',
      description: 'Read-only shows the split and lets each boundary be focused and read; unavailable greys it; shares that don’t add up say so.',
      code: `<AllocationSlider label="Team split" readOnly … />
<AllocationSlider label="Team split" disabled … />
<AllocationSlider label="Imported split" segments={[…60, 30, 20]} … />`,
      render: () => (
        <>
          <Live label="Team split (read-only)" readOnly description="Set by your organisation." initial={budget} />
          <Live label="Team split (unavailable)" disabled initial={budget} />
          <Live
            label="Imported split"
            initial={[
              { id: 'a', label: 'North', share: 60 },
              { id: 'b', label: 'South', share: 30 },
              { id: 'c', label: 'West', share: 20 },
            ]}
          />
        </>
      ),
    },
  ],
} satisfies StoryFile;
