import { useState } from 'react';
import { Button } from '../fundamentals/Button';
import { NumberField } from '../fundamentals/NumberField';
import { Select } from '../fundamentals/Select';
import { Stack } from '../fundamentals/Stack';
import { Switch } from '../fundamentals/Switch';
import { TextField } from '../fundamentals/TextField';
import { PropertySection } from '../compounds/PropertySection';
import { PropertyRow } from '../compounds/PropertyRow';
import type { StoryFile } from './story';

const constraints = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'left-right', label: 'Left and right' },
  { value: 'center', label: 'Centre' },
  { value: 'scale', label: 'Scale' },
];

/** An inspector's frame group at a Figma-like density: xs fields with inline glyphs, two to a row. */
function Frame() {
  const [v, setV] = useState({ x: 32, y: 376, w: 256, h: 44, r: 0, radius: 8 });
  const [fill, setFill] = useState<string | null>('#2F6FEB');
  const [h, setH] = useState('left');
  const set = (k: keyof typeof v) => (n: number) => setV((o) => ({ ...o, [k]: n }));
  return (
    <Stack gap="group">
      <PropertySection heading="Position" density="compact">
        <PropertyRow>
          <NumberField label="X position" glyph="X" hideLabel size="xs" value={v.x} onCommit={set('x')} />
          <NumberField label="Y position" glyph="Y" hideLabel size="xs" value={v.y} onCommit={set('y')} />
        </PropertyRow>
        <PropertyRow>
          <NumberField label="Rotation" icon="rotate" hideLabel size="xs" unit="°" value={v.r} onCommit={set('r')} />
          <NumberField label="Corner radius" icon="corners" hideLabel size="xs" min={0} value={v.radius} onCommit={set('radius')} />
        </PropertyRow>
      </PropertySection>
      <PropertySection heading="Dimensions" density="compact">
        <PropertyRow>
          <NumberField label="Width" glyph="W" hideLabel size="xs" min={0} value={v.w} onCommit={set('w')} />
          <NumberField label="Height" glyph="H" hideLabel size="xs" min={0} value={v.h} onCommit={set('h')} />
        </PropertyRow>
      </PropertySection>
      <PropertySection heading="Fill" density="compact" actions={fill === null && <Button label="Add fill" icon="plus" iconOnly tooltip emphasis="quiet" size="xs" onClick={() => setFill('#2F6FEB')} />}>
        {fill !== null && (
          <PropertyRow columns={1} action={<Button label="Remove fill" icon="minus" iconOnly tooltip emphasis="quiet" size="xs" onClick={() => setFill(null)} />}>
            <TextField label="Fill colour" hideLabel size="xs" value={fill} onCommit={setFill} swatch={{ value: fill, onChange: setFill }} />
          </PropertyRow>
        )}
      </PropertySection>
      <PropertySection heading="Constraints" density="compact">
        <PropertyRow columns={1}>
          <Select label="Horizontal" size="xs" options={constraints} value={h} onChange={setH} />
        </PropertyRow>
      </PropertySection>
    </Stack>
  );
}

/** A fill row (lead) and an export row (three columns), each with its controls in the action column (Q68 DT20, DT26). */
function Rows() {
  const [colour, setColour] = useState('#2F6FEB');
  const [opacity, setOpacity] = useState(100);
  const [shown, setShown] = useState(true);
  const [scale, setScale] = useState('1x');
  const [suffix, setSuffix] = useState('');
  const [format, setFormat] = useState('png');
  return (
    <Stack gap="group">
      <PropertySection heading="Fill" density="compact">
        <PropertyRow
          lead
          action={
            <>
              <Switch label="Show fill 1" hideLabel size="xs" checked={shown} onChange={setShown} />
              <Button label="Remove fill 1" icon="minus" iconOnly tooltip emphasis="quiet" size="xs" onClick={() => {}} />
            </>
          }
        >
          <TextField label="Fill 1, colour" hideLabel size="xs" value={colour} onCommit={setColour} swatch={{ value: colour, onChange: setColour }} />
          <NumberField label="Fill 1, opacity" glyph="%" hideLabel size="xs" min={0} max={100} value={opacity} onCommit={setOpacity} />
        </PropertyRow>
      </PropertySection>
      <PropertySection heading="Export" density="compact">
        <PropertyRow columns={3} action={<Button label="Remove export 1" icon="minus" iconOnly tooltip emphasis="quiet" size="xs" onClick={() => {}} />}>
          <Select label="Export 1, scale" hideLabel size="xs" options={['0.5x', '1x', '2x', '3x'].map((v) => ({ value: v, label: v }))} value={scale} onChange={setScale} />
          <TextField label="Export 1, suffix" hideLabel placeholder="Suffix" size="xs" value={suffix} onCommit={setSuffix} />
          <Select label="Export 1, format" hideLabel size="xs" options={['png', 'jpg', 'svg', 'pdf'].map((v) => ({ value: v, label: v.toUpperCase() }))} value={format} onChange={setFormat} />
        </PropertyRow>
      </PropertySection>
    </Stack>
  );
}

export default {
  component: 'PropertyRow',
  tier: 'compound',
  summary: 'One row of a design tool’s inspector: compact fields two to a row, with an action column held on every row so the fields line up.',
  stories: [
    {
      title: 'An inspector at design-tool density',
      description: 'X | Y, rotation | radius and W | H on one row each with xs fields and inline glyphs; one field across the row for a Select, whose visible label takes the compact label size (12 px, regular, muted, one line) inside a compact section, smaller than the section’s title (Q72). Remove fill sits in the action column every row holds, so all fields line up; remove it and Add fill appears on the heading. Try it in a 240 px panel: nothing wraps or scrolls sideways.',
      code: `<PropertySection heading="Position" density="compact">
  <PropertyRow>
    <NumberField label="X position" glyph="X" hideLabel size="xs" … />
    <NumberField label="Y position" glyph="Y" hideLabel size="xs" … />
  </PropertyRow>
</PropertySection>`,
      render: () => <Frame />,
    },
    {
      title: 'A colour and its opacity, three short fields, and controls at the row’s end',
      description: 'lead gives the first of two fields two thirds of the row (swatch and hex beside opacity, as Figma draws a fill); columns={3} fits three short fields (an export’s scale, suffix and format); the action column holds up to two xs controls (a fill’s Show switch and Remove), widening only its own row.',
      code: `<PropertyRow lead action={<><Switch label="Show fill 1" hideLabel size="xs" … /><Button label="Remove fill 1" icon="minus" iconOnly size="xs" … /></>}>
  <TextField label="Fill 1, colour" hideLabel size="xs" swatch={…} … />
  <NumberField label="Fill 1, opacity" glyph="%" hideLabel size="xs" … />
</PropertyRow>
<PropertyRow columns={3} action={<Button label="Remove export 1" … />}>…</PropertyRow>`,
      render: () => <Rows />,
    },
  ],
} satisfies StoryFile;
