import { useState } from 'react';
import { DataTable } from '../compounds/DataTable';
import type { ButtonSize } from '../fundamentals/Button';
import { Grid } from '../fundamentals/Grid';
import { NumberField, type NumberFieldProps } from '../fundamentals/NumberField';
import { Stack } from '../fundamentals/Stack';
import { Switch } from '../fundamentals/Switch';
import { Text } from '../fundamentals/Text';
import { TextField } from '../fundamentals/TextField';
import type { StoryFile } from './story';

/** A field that stores what it's given. */
function Num({ initial, ...rest }: Omit<NumberFieldProps, 'value' | 'onCommit'> & { initial: number | 'mixed' }) {
  const [value, setValue] = useState(initial);
  return <NumberField {...rest} value={value} onCommit={setValue} />;
}

/** Width and height kept in proportion while the lock is on. */
function Linked() {
  const [w, setW] = useState(320);
  const [h, setH] = useState(180);
  const [lock, setLock] = useState(true);
  return (
    <Stack gap="item">
      <Grid max={2}>
        <NumberField size="s" glyph="W" label="Width" hideLabel unit="px" min={0} value={w} onCommit={(n) => { if (lock) setH(Math.round((n * h) / w)); setW(n); }} />
        <NumberField size="s" glyph="H" label="Height" hideLabel unit="px" min={0} value={h} onCommit={(n) => { if (lock) setW(Math.round((n * w) / h)); setH(n); }} />
      </Grid>
      <Switch size="s" label="Keep proportions" checked={lock} onChange={setLock} />
    </Stack>
  );
}

/** A fill row: the ColourPicker on a hex field, and the opacity beside it. */
function Fill() {
  const [hex, setHex] = useState('#5b5bd6');
  return (
    <Grid max={2}>
      <TextField size="s" label="Fill colour" hideLabel value={hex.toUpperCase()} swatch={{ value: hex, onChange: setHex }} onCommit={(v) => /^#?[0-9a-f]{6}$/i.test(v) && setHex(v.startsWith('#') ? v : `#${v}`)} />
      <Num size="s" label="Fill opacity" hideLabel glyph="%" unit="%" min={0} max={100} initial={80} />
    </Grid>
  );
}

/** What a typed entry becomes, for trying the parser. */
function TypeIt() {
  const [value, setValue] = useState(24);
  const [last, setLast] = useState('');
  return (
    <Stack gap="pair">
      <NumberField label="Gap" unit="px" min={0} max={400} value={value} onCommit={(n) => { setLast(`${value} → ${n}`); setValue(n); }} />
      <Text variant="caption" tone="muted">
        {last ? `Last change: ${last}. ` : ''}Try 32px, 12*2, (40-8)/2, +4, *2 or 50%.
      </Text>
    </Stack>
  );
}

/** A number whose unit the person switches by typing it ("2px" in a % field). */
function Switchable({ initial, initialUnit, ...rest }: Omit<NumberFieldProps, 'value' | 'onCommit' | 'unit' | 'onUnitChange'> & { initial: number; initialUnit: string }) {
  const [value, setValue] = useState(initial);
  const [unit, setUnit] = useState(initialUnit);
  return <NumberField {...rest} value={value} unit={unit} onUnitChange={setUnit} onCommit={setValue} />;
}

/** Line height: Auto (worked out from the font size), a number in px, or a % of the font size. */
function LineHeight({ fontSize }: { fontSize: number }) {
  const [value, setValue] = useState<number | 'auto'>('auto');
  const [unit, setUnit] = useState('px');
  return (
    <NumberField
      size="s"
      glyph="↕"
      label="Line height"
      unit={unit}
      units={['px', '%']}
      onUnitChange={setUnit}
      min={0}
      value={value}
      auto={{ computed: Math.round(fontSize * 1.2), onAuto: () => setValue('auto') }}
      onCommit={setValue}
    />
  );
}

/** The type section of an inspector: size with common sizes, line height with Auto, letter and paragraph spacing. */
function TypeSection() {
  const [size, setSize] = useState(16);
  return (
    <Grid max={2}>
      <NumberField size="s" glyph="Aa" label="Font size" unit="px" min={1} max={1000} presets={[10, 11, 12, 13, 14, 16, 20, 24, 32, 40, 48, 64, 96]} value={size} onCommit={setSize} />
      <LineHeight fontSize={size} />
      <Switchable size="s" glyph="|A|" label="Letter spacing" units={['%', 'px']} initialUnit="%" step={0.1} initial={-1} />
      <Num size="s" glyph="¶" label="Paragraph spacing" unit="px" min={0} initial={0} />
    </Grid>
  );
}

/** Auto layout gap: a number, or Auto (space between, worked out from the frame). */
function Gap() {
  const [value, setValue] = useState<number | 'auto'>(12);
  return <NumberField size="s" glyph="⇹" label="Gap between items" unit="px" min={0} value={value} auto={{ computed: 12, onAuto: () => setValue('auto') }} onCommit={setValue} />;
}

/** One value for every side or corner, or one each: the Switch says which (a binary setting). */
function PerSide({ label, glyph, sides, switchLabel, initial }: { label: string; glyph: string; sides: [string, string][]; switchLabel: string; initial: number }) {
  const [each, setEach] = useState(false);
  const [all, setAll] = useState(initial);
  const [values, setValues] = useState<number[]>(sides.map(() => initial));
  return (
    <>
      <Grid max={2}>
        {each ? (
          sides.map(([name, g], i) => (
            <NumberField key={name} size="s" glyph={g} label={`${label}, ${name}`} hideLabel unit="px" min={0} value={values[i]} onCommit={(n) => setValues(values.map((v, k) => (k === i ? n : v)))} />
          ))
        ) : (
          <NumberField size="s" glyph={glyph} label={label} hideLabel unit="px" min={0} value={values.every((v) => v === values[0]) ? all : 'mixed'} onCommit={(n) => { setAll(n); setValues(sides.map(() => n)); }} />
        )}
      </Grid>
      <Switch size="s" label={switchLabel} checked={each} onChange={setEach} />
    </>
  );
}

/** Minimum and maximum size: "None" until set; typing None or emptying the box clears it. */
function Limit({ label, glyph, initial }: { label: string; glyph: string; initial: number | 'auto' }) {
  const [value, setValue] = useState<number | 'auto'>(initial);
  return <NumberField size="s" glyph={glyph} label={label} hideLabel unit="px" min={0} value={value} auto={{ computed: 0, label: 'None', onAuto: () => setValue('auto') }} onCommit={setValue} />;
}

/** A value bound to a design variable; Detach turns it back into a number to edit. */
function Bound({ label, glyph, name, initial }: { label: string; glyph: string; name: string; initial: number }) {
  const [value, setValue] = useState(initial);
  const [bound, setBound] = useState(true);
  return <NumberField size="s" glyph={glyph} label={label} hideLabel unit="px" min={0} value={value} onCommit={setValue} variable={bound ? { name, onDetach: () => setBound(false) } : undefined} />;
}

const figma: [string, string, string][] = [
  ['Position X and Y', 'Inspector rows', 'Shown'],
  ['Width and height, proportions kept', 'Linked width and height', 'Shown'],
  ['Rotation in degrees', 'Inspector rows', 'Shown'],
  ['Corner radius, one value', 'Inspector rows', 'Shown'],
  ['Corner radius per corner, linked or not', 'Per corner and per side', 'Shown'],
  ['Minimum and maximum width and height', 'Minimum and maximum size', 'Shown'],
  ['Auto layout gap, with Auto', 'Auto, units and common values', 'Shown'],
  ['Auto layout padding per side, linked or not', 'Per corner and per side', 'Shown'],
  ['Layout grid count, gutter and margin', 'Layout grid', 'Shown'],
  ['Opacity in % and a Mixed selection', 'Colour and opacity; Mixed, limits and errors', 'Shown'],
  ['Stroke weight, and per side', 'Per corner and per side', 'Shown'],
  ['Effects: blur, spread, X and Y offset', 'Effects', 'Shown'],
  ['Font size with common sizes', 'Auto, units and common values', 'Shown'],
  ['Line height: a number, a % or Auto', 'Auto, units and common values', 'Shown'],
  ['Letter spacing in % or px', 'Auto, units and common values', 'Shown'],
  ['Paragraph spacing', 'Auto, units and common values', 'Shown'],
  ['A value bound to a variable', 'Bound to a variable', 'Shown'],
  ['Prototype: animation duration and delay in ms', 'Prototype timing', 'Shown'],
  ['Export scale, 0.5x to 4x', 'Export scale', 'Shown'],
  ['Drag the glyph, icon or label; pointer hidden; Shift ×10, Alt ×0.1, Escape', 'Inspector rows; Drag the label', 'Shown'],
  ['Arrow ×1, Shift+Arrow ×10, Alt+Arrow ×0.1, Page Up and Down', 'Steppers; Typing', 'Shown'],
  ['Arithmetic and changes: 12*2, +4, /2', 'Typing: units and arithmetic', 'Shown'],
  ['− and + buttons that repeat while held', 'Steppers', 'Shown'],
  ['The wheel changes it only while focused', 'Any field', 'Shown'],
];

const sizes: ButtonSize[] = ['xs', 's', 'normal', 'm', 'l', 'xl', 'xxl'];

export default {
  component: 'NumberField',
  tier: 'fundamental',
  summary: 'A number to type, step, drag or calculate, from a form field to a dense inspector row.',
  stories: [
    {
      title: 'Inspector rows',
      description: 'Dense, label hidden, a glyph before each number (as in the Figma inspector). Drag a glyph sideways to change its value: the pointer hides while you drag; Shift ×10, Alt ×0.1, Escape puts it back.',
      code: `<NumberField size="s" glyph="W" label="Width" hideLabel unit="px" value={w} onCommit={setW} />
<NumberField size="s" glyph="∠" label="Rotation" hideLabel unit="°" step={1} value={r} onCommit={setR} />`,
      render: () => (
        <Grid max={2}>
          <Num size="s" glyph="X" label="Position X" hideLabel unit="px" initial={120} />
          <Num size="s" glyph="Y" label="Position Y" hideLabel unit="px" initial={48} />
          <Num size="s" glyph="W" label="Width" hideLabel unit="px" min={0} initial={320} />
          <Num size="s" glyph="H" label="Height" hideLabel unit="px" min={0} initial={180} />
          <Num size="s" glyph="∠" label="Rotation" hideLabel unit="°" min={-360} max={360} initial={0} />
          <Num size="s" glyph="◜" label="Corner radius" hideLabel unit="px" min={0} initial={8} />
        </Grid>
      ),
    },
    {
      title: 'Drag the label',
      description: 'With a visible label, drag the label sideways to change the value, as with a glyph; the pointer hides while you drag. A click on the label still puts the cursor in the box.',
      code: `<NumberField label="Spacing" unit="px" min={0} value={spacing} onCommit={setSpacing} />`,
      render: () => (
        <Grid max={2}>
          <Num label="Spacing" unit="px" min={0} initial={16} />
          <Num label="Blur" unit="px" min={0} max={250} initial={4} />
        </Grid>
      ),
    },
    {
      title: 'Auto, units and common values',
      description: 'The type section of an inspector. Font size offers common sizes in a list; line height can be Auto (type "auto" or empty the box), a number or a %; letter spacing switches between % and px when you type the other unit.',
      code: `<NumberField label="Font size" unit="px" presets={[12, 14, 16, 20, 24]} value={size} onCommit={setSize} />
<NumberField label="Line height" unit={unit} units={['px', '%']} onUnitChange={setUnit}
  value={lh} auto={{ computed: 19, onAuto: () => setLh('auto') }} onCommit={setLh} />`,
      render: () => (
        <>
          <TypeSection />
          <Grid max={2}>
            <Gap />
          </Grid>
        </>
      ),
    },
    {
      title: 'Export scale',
      description: 'A multiplier with the common scales in a list, as in the Export section; any other scale can be typed.',
      code: `<NumberField size="s" label="Export scale" unit="x" min={0.01} max={4} step={0.5} presets={[0.5, 0.75, 1, 1.5, 2, 3, 4]} value={scale} onCommit={setScale} />`,
      render: () => (
        <Grid max={2}>
          <Num size="s" label="Export scale" hideLabel glyph="×" unit="x" min={0.01} max={4} step={0.5} precision={2} presets={[0.5, 0.75, 1, 1.5, 2, 3, 4]} initial={2} />
        </Grid>
      ),
    },
    {
      title: 'Per corner and per side',
      description: 'One value for all, or one for each: the switch says which. Different values show as Mixed in the single field; typing one sets them all.',
      code: `<NumberField glyph="◜" label="Corner radius" hideLabel value={all} … />
<Switch size="s" label="Independent corners" checked={each} onChange={setEach} />`,
      render: () => (
        <>
          <PerSide label="Corner radius" glyph="◜" switchLabel="Independent corners" initial={8} sides={[['top left', '◜'], ['top right', '◝'], ['bottom right', '◞'], ['bottom left', '◟']]} />
          <PerSide label="Padding" glyph="▢" switchLabel="Padding per side" initial={16} sides={[['top', '↑'], ['right', '→'], ['bottom', '↓'], ['left', '←']]} />
          <PerSide label="Stroke weight" glyph="≡" switchLabel="Stroke per side" initial={1} sides={[['top', '⊤'], ['right', '⊣'], ['bottom', '⊥'], ['left', '⊢']]} />
        </>
      ),
    },
    {
      title: 'Minimum and maximum size',
      description: 'Each limit reads None until it is set; type None or empty the box to clear it.',
      code: `<NumberField label="Minimum width" unit="px" value={min} auto={{ computed: 0, label: 'None', onAuto: () => setMin('auto') }} onCommit={setMin} />`,
      render: () => (
        <Grid max={2}>
          <Limit label="Minimum width" glyph="W↓" initial={120} />
          <Limit label="Maximum width" glyph="W↑" initial="auto" />
          <Limit label="Minimum height" glyph="H↓" initial="auto" />
          <Limit label="Maximum height" glyph="H↑" initial={640} />
        </Grid>
      ),
    },
    {
      title: 'Layout grid',
      description: 'Columns as a count with − and +, gutter and margin in px.',
      code: `<NumberField size="s" label="Columns" steppers min={1} max={24} value={count} onCommit={setCount} />`,
      render: () => (
        <Grid max={2}>
          <Num size="s" glyph="#" label="Columns" steppers min={1} max={24} initial={12} />
          <Num size="s" glyph="⇹" label="Gutter" unit="px" min={0} initial={20} />
          <Num size="s" glyph="⇤" label="Margin" unit="px" min={0} initial={32} />
          <Num size="s" glyph="⇥" label="Offset" unit="px" initial={0} />
        </Grid>
      ),
    },
    {
      title: 'Effects',
      description: 'A drop shadow’s X and Y offset (negative allowed), blur and spread, and a layer blur.',
      code: `<NumberField size="s" glyph="X" label="Shadow X" hideLabel unit="px" value={x} onCommit={setX} />`,
      render: () => (
        <Grid max={2}>
          <Num size="s" glyph="X" label="Shadow X" hideLabel unit="px" initial={0} />
          <Num size="s" glyph="Y" label="Shadow Y" hideLabel unit="px" initial={4} />
          <Num size="s" glyph="◌" label="Shadow blur" hideLabel unit="px" min={0} initial={12} />
          <Num size="s" glyph="⊕" label="Shadow spread" hideLabel unit="px" initial={0} />
          <Num size="s" glyph="◍" label="Layer blur" hideLabel unit="px" min={0} max={250} initial={4} />
        </Grid>
      ),
    },
    {
      title: 'Bound to a variable',
      description: 'The value comes from a design variable: the box shows its name and the number can’t be typed or dragged. Detach turns it back into a number.',
      code: `<NumberField label="Gap" unit="px" value={gap} onCommit={setGap} variable={{ name: 'spacing/md', onDetach }} />`,
      render: () => (
        <Grid max={2}>
          <Bound label="Gap between items" glyph="⇹" name="spacing/md" initial={16} />
          <Bound label="Corner radius" glyph="◜" name="radius/card" initial={12} />
        </Grid>
      ),
    },
    {
      title: 'Prototype timing',
      description: 'An animation’s duration and a delay in milliseconds, with common durations in a list.',
      code: `<NumberField size="s" label="Duration" unit="ms" step={10} min={0} presets={[100, 200, 300, 500, 800]} value={ms} onCommit={setMs} />`,
      render: () => (
        <Grid max={2}>
          <Num size="s" label="Duration" unit="ms" step={10} min={0} max={10000} precision={0} presets={[100, 200, 300, 500, 800]} initial={300} />
          <Num size="s" label="Delay" unit="ms" step={10} min={0} max={10000} precision={0} initial={0} />
        </Grid>
      ),
    },
    {
      title: 'Linked width and height',
      description: 'With Keep proportions on, changing one changes the other in the same ratio.',
      code: `<NumberField glyph="W" … onCommit={(n) => { if (lock) setH(Math.round(n * h / w)); setW(n); }} />
<Switch size="s" label="Keep proportions" checked={lock} onChange={setLock} />`,
      render: () => <Linked />,
    },
    {
      title: 'Colour and opacity',
      description: 'The swatch opens the ColourPicker (the one ColourField uses); the hex is typed; the opacity is a number in %.',
      code: `<TextField size="s" label="Fill colour" hideLabel swatch={{ value: hex, onChange: setHex }} value={hex} onCommit={setHexIfValid} />
<NumberField size="s" glyph="%" label="Fill opacity" hideLabel unit="%" min={0} max={100} value={opacity} onCommit={setOpacity} />`,
      render: () => <Fill />,
    },
    {
      title: 'Steppers',
      description: 'Press − or +, or hold one to repeat. At a limit its button rests. Arrow keys do the same and save after a short pause.',
      code: `<NumberField label="Copies" steppers min={1} max={99} value={copies} onCommit={setCopies} />`,
      render: () => (
        <Grid max={2}>
          <Num label="Copies" steppers min={1} max={99} initial={1} />
          <Num label="Line height" steppers step={0.05} precision={2} min={0.8} max={3} initial={1.5} />
        </Grid>
      ),
    },
    {
      title: 'Sizes',
      description: 'The Button scale, so a number field sits level with the buttons and text fields beside it.',
      code: `<NumberField size="xs" label="Columns" steppers value={n} onCommit={setN} />  // xs to xxl`,
      render: () => (
        <Grid max={2}>
          {sizes.map((size) => (
            <Num key={size} size={size} label={`Columns · ${size}`} glyph="#" steppers min={1} max={24} initial={12} />
          ))}
        </Grid>
      ),
    },
    {
      title: 'Typing: units and arithmetic',
      description: 'Type a number with or without its unit, a sum, or a change to the current value; Enter or Tab applies it. Anything else puts the value back.',
      code: `<NumberField label="Gap" unit="px" min={0} max={400} value={gap} onCommit={setGap} />`,
      render: () => <TypeIt />,
    },
    {
      title: 'Mixed, limits and errors',
      description: 'Mixed: several selected layers hold different values; typing sets them all. Values beyond the limits are held at them. An error says what to fix.',
      code: `<NumberField label="Opacity" unit="%" value="mixed" … />
<NumberField label="Columns" min={1} max={24} error="Use 24 columns or fewer for this grid." … />`,
      render: () => (
        <Grid max={2}>
          <Num label="Opacity" glyph="%" unit="%" min={0} max={100} initial="mixed" />
          <Num label="Columns" min={1} max={24} initial={12} error="Use 24 columns or fewer for this grid." />
          <Num label="Weight" unit="kg" step={0.1} min={0} initial={12.5} disabled />
        </Grid>
      ),
    },
    {
      title: 'Figma inspector checklist',
      description: 'Every number input in the Figma property inspector (Design, Prototype and Export) and the example here that shows it.',
      code: `<DataTable label="Figma inspector checklist" columns={…} rows={…} />`,
      render: () => (
        <DataTable
          label="Figma inspector checklist"
          columns={[
            { key: 'use', header: 'In the Figma inspector' },
            { key: 'where', header: 'Example here' },
            { key: 'status', header: 'Status' },
          ]}
          rows={figma.map(([use, where, status], i) => ({ id: String(i), cells: { use, where, status } }))}
        />
      ),
    },
  ],
} satisfies StoryFile;
