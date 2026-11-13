import { useState } from 'react';
import { Slider } from '../fundamentals/Slider';
import type { StoryFile } from './story';
import { WithSettings } from './WithSettings';

const pillEnds = { '--c-slider-radius': 'var(--radius-pill)' };

type LiveProps = Omit<Parameters<typeof Slider<number>>[0], 'value' | 'onChange'> & { initial: number };

function Live({ initial, ...rest }: LiveProps) {
  const [value, setValue] = useState(initial);
  return <Slider {...rest} value={value} onChange={setValue} />;
}

type LiveManyProps = Omit<Parameters<typeof Slider<number[]>>[0], 'value' | 'onChange'> & { initial: number[] };

function LiveMany({ initial, ...rest }: LiveManyProps) {
  const [value, setValue] = useState(initial);
  return <Slider {...rest} value={value} onChange={setValue} />;
}

const euro = (v: number) => `€${v}`;
const hour = (v: number) => `${String(v).padStart(2, '0')}:00`;
const hertz = (v: number) => (v >= 1000 ? `${Number((v / 1000).toFixed(1))} kHz` : `${Math.round(v)} Hz`);
const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '0');

const celsius = (v: number) => `${v} °C`;
const storage = [
  { value: 5, label: '5 GB' },
  { value: 20, label: '20 GB' },
  { value: 50, label: '50 GB' },
  { value: 100, label: '100 GB' },
  { value: 200, label: '200 GB' },
];

export default {
  component: 'Slider',
  tier: 'fundamental',
  summary: 'Picks a number, a range or several numbers on one track by dragging or with the keys, applied at once.',
  stories: [
    {
      title: 'A font axis',
      description: 'The value reads beside the label; dragging or the arrow keys apply it at once.',
      code: `<Slider label="Weight" min={100} max={900} value={weight} onChange={setWeight} />`,
      render: () => <Live label="Weight" min={100} max={900} initial={460} />,
    },
    {
      title: 'Graduated: a labelled scale',
      description: 'Marks draw the scale and name its landmarks; the bubble shows the exact value while dragging, hovering or focused.',
      code: `<Slider label="Water temperature" min={0} max={100} marks={[{ value: 0, label: '0 °C' }, { value: 37, label: '37 °C' }, { value: 60, label: '60 °C' }, { value: 100, label: '100 °C' }]} valueLabel="active" format={(v) => \`\${v} °C\`} value={t} onChange={setT} />`,
      render: () => (
        <Live
          label="Water temperature"
          min={0}
          max={100}
          marks={[
            { value: 0, label: '0 °C' },
            { value: 37, label: '37 °C' },
            { value: 60, label: '60 °C' },
            { value: 100, label: '100 °C' },
          ]}
          valueLabel="active"
          format={celsius}
          initial={40}
        />
      ),
    },
    {
      title: 'Quantized: snaps to steps',
      description: 'A tick per step shows where the thumb can land; dragging snaps to the nearest one. The bubble stays on so the count is always read.',
      code: `<Slider label="Columns" min={1} max={12} step={1} marks valueLabel="always" value={columns} onChange={setColumns} />
<Slider label="Opacity" min={0} max={100} step={10} marks showBounds format={(v) => \`\${v} %\`} value={opacity} onChange={setOpacity} />`,
      render: () => (
        <>
          <Live label="Columns" min={1} max={12} marks valueLabel="always" initial={4} />
          <Live label="Opacity" min={0} max={100} step={10} marks showBounds format={(v) => `${v} %`} initial={70} />
        </>
      ),
    },
    {
      title: 'Only marked values',
      description: 'Non-uniform steps (plan tiers, shoe sizes): the thumb jumps between marks and the arrow keys move one mark at a time.',
      code: `<Slider label="Storage" min={5} max={200} marks={storage} restrictToMarks format={(v) => \`\${v} GB\`} value={gb} onChange={setGb} />`,
      render: () => <Live label="Storage" min={5} max={200} marks={storage} restrictToMarks format={(v) => `${v} GB`} initial={50} />,
    },
    {
      title: 'Range: two thumbs',
      description: 'A minimum and a maximum with the fill between. Each thumb has its own name; a number box at each end takes an exact value; drag the fill to move the whole band.',
      code: `<Slider label="Price" min={0} max={500} step={10} value={[80, 320]} thumbLabels={['Minimum price', 'Maximum price']} minGap={20} dragRange input showBounds format={(v) => \`€\${v}\`} onChange={setPrice} />`,
      render: () => <LiveMany label="Price" min={0} max={500} step={10} thumbLabels={['Minimum price', 'Maximum price']} minGap={20} dragRange input showBounds format={euro} initial={[80, 320]} />,
    },
    {
      title: 'When thumbs meet: block or push',
      description: 'By default a thumb stops at its neighbour (minGap apart). With collide="push" it moves the neighbour along instead.',
      code: `<Slider label="Opening hours" min={0} max={24} value={[9, 17]} thumbLabels={['Opens', 'Closes']} minGap={1} valueLabel="always" format={hour} onChange={setHours} />
<Slider label="Quiet hours" min={0} max={24} value={[22, 24]} … collide="push" />`,
      render: () => (
        <>
          <LiveMany label="Opening hours (block)" min={0} max={24} thumbLabels={['Opens', 'Closes']} minGap={1} valueLabel="always" showValue={false} format={hour} initial={[9, 17]} />
          <LiveMany label="Quiet hours (push)" min={0} max={24} thumbLabels={['Starts', 'Ends']} minGap={1} collide="push" valueLabel="always" showValue={false} format={hour} initial={[6, 8]} />
        </>
      ),
    },
    {
      title: 'Several independent thumbs',
      description: 'Three or more values on one track, each its own slider in Tab order (Levels: black, middle and white points).',
      code: `<Slider label="Input levels" min={0} max={255} value={[16, 128, 240]} thumbLabels={['Black point', 'Midtone', 'White point']} minGap={1} valueLabel="active" onChange={setLevels} />`,
      render: () => <LiveMany label="Input levels" min={0} max={255} thumbLabels={['Black point', 'Midtone', 'White point']} minGap={1} valueLabel="active" showBounds initial={[16, 128, 240]} />,
    },
    {
      title: 'Centred: fill from an origin',
      description: 'The fill grows from the origin towards the thumb, either way: balance, exposure, temperature offsets.',
      code: `<Slider label="Balance" min={-100} max={100} origin={0} marks={[{ value: -100, label: 'Left' }, { value: 0, label: 'Centre' }, { value: 100, label: 'Right' }]} value={b} onChange={setB} />
<Slider label="Exposure" min={-3} max={3} step={0.1} origin={0} format={signed} value={e} onChange={setE} />`,
      render: () => (
        <>
          <Live
            label="Balance"
            min={-100}
            max={100}
            origin={0}
            marks={[
              { value: -100, label: 'Left' },
              { value: 0, label: 'Centre' },
              { value: 100, label: 'Right' },
            ]}
            format={signed}
            initial={-30}
          />
          <Live label="Exposure" min={-3} max={3} step={0.1} origin={0} format={signed} initial={0.7} />
        </>
      ),
    },
    {
      title: 'Logarithmic scale',
      description: 'Each order of magnitude gets the same length of track, so 20 Hz to 20 kHz is usable; the arrow keys move a hundredth of the track.',
      code: `<Slider label="Cut-off frequency" min={20} max={20000} scale="log" marks={[{ value: 20, label: '20 Hz' }, { value: 200, label: '200 Hz' }, { value: 2000, label: '2 kHz' }, { value: 20000, label: '20 kHz' }]} format={hertz} value={f} onChange={setF} />`,
      render: () => (
        <Live
          label="Cut-off frequency"
          min={20}
          max={20000}
          scale="log"
          marks={[
            { value: 20, label: '20 Hz' },
            { value: 200, label: '200 Hz' },
            { value: 2000, label: '2 kHz' },
            { value: 20000, label: '20 kHz' },
          ]}
          format={hertz}
          valueLabel="active"
          initial={1000}
        />
      ),
    },
    {
      title: 'Paired with a number box',
      description: 'The exact-value path for keyboard and screen-reader users: type, use the arrows or scrub the box; the thumb follows.',
      code: `<Slider label="Corner radius" min={0} max={64} unit="px" input value={r} onChange={setR} />`,
      render: () => (
        <>
          <Live label="Corner radius" min={0} max={64} unit="px" input initial={12} />
          <Live size="s" label="Line height" min={80} max={200} step={5} unit="%" input initial={140} />
        </>
      ),
    },
    {
      title: 'Value shown three ways',
      description: 'Beside the label (default), in a bubble while active, or in a bubble always. Hide the side value when the bubble says it.',
      code: `<Slider label="Volume" min={0} max={100} value={v} onChange={setV} />
<Slider label="Volume" min={0} max={100} valueLabel="active" showValue={false} value={v} onChange={setV} />
<Slider label="Volume" min={0} max={100} valueLabel="always" showValue={false} value={v} onChange={setV} />`,
      render: () => (
        <>
          <Live label="Beside the label" min={0} max={100} initial={30} />
          <Live label="Bubble while active" min={0} max={100} valueLabel="active" showValue={false} initial={50} />
          <Live label="Bubble always" min={0} max={100} valueLabel="always" showValue={false} initial={70} />
        </>
      ),
    },
    {
      title: 'Bounds and end icons',
      description: 'The minimum and maximum written under the ends, or an icon at each end saying what low and high mean.',
      code: `<Slider label="Price limit" min={0} max={500} step={10} showBounds format={(v) => \`€\${v}\`} value={p} onChange={setP} />
<Slider label="Zoom" min={25} max={400} step={25} startIcon="minus" endIcon="plus" format={(v) => \`\${v} %\`} value={z} onChange={setZ} />
<Slider label="Brightness" min={0} max={100} startIcon="scheme-dark" endIcon="scheme-light" value={b} onChange={setB} />`,
      render: () => (
        <>
          <Live label="Price limit" min={0} max={500} step={10} showBounds format={(v) => `€${v}`} initial={240} />
          <Live label="Zoom" min={25} max={400} step={25} startIcon="minus" endIcon="plus" format={(v) => `${v} %`} initial={100} />
          <Live label="Brightness" min={0} max={100} startIcon="scheme-dark" endIcon="scheme-light" initial={65} />
        </>
      ),
    },
    {
      title: 'Sizes',
      description: 's for dense editors and property panels (24 px target, a written exception), normal for forms (44 px), l for touch and media (48 px).',
      code: `<Slider size="s" label="Small" … />
<Slider label="Normal" … />
<Slider size="l" label="Large" … />`,
      render: () => (
        <>
          <Live size="s" label="Small" min={0} max={10} marks valueLabel="active" initial={3} />
          <Live label="Normal" min={0} max={10} marks valueLabel="active" initial={5} />
          <Live size="l" label="Large" min={0} max={10} marks valueLabel="active" initial={7} />
        </>
      ),
    },
    {
      title: 'With a unit',
      description: 'format says the value the way a person reads it, and is what assistive technology announces.',
      code: `<Slider label="Preview size" min={12} max={96} value={size} format={(v) => \`\${v} px\`} onChange={setSize} />`,
      render: () => <Live label="Preview size" min={12} max={96} format={(v) => `${v} px`} initial={48} />,
    },
    {
      title: 'Description, error and read-only',
      description: 'A line that helps choose; a message that says what is wrong and how to fix it; a value that is shown and focusable but fixed.',
      code: `<Slider label="Retries" min={0} max={10} marks description="How often a failed upload tries again before it stops." value={r} onChange={setR} />
<Slider label="Session length" min={5} max={120} step={5} error="Sessions over 60 minutes need an admin. Choose 60 or less." format={(v) => \`\${v} min\`} value={s} onChange={setS} />
<Slider label="Plan seats" min={1} max={50} readOnly description="Set by your organisation." value={12} onChange={() => {}} />`,
      render: () => (
        <>
          <Live label="Retries" min={0} max={10} marks description="How often a failed upload tries again before it stops." initial={3} />
          <Live label="Session length" min={5} max={120} step={5} error="Sessions over 60 minutes need an admin. Choose 60 or less." format={(v) => `${v} min`} initial={90} />
          <Live label="Plan seats" min={1} max={50} readOnly description="Set by your organisation." initial={12} />
        </>
      ),
    },
    {
      title: 'Unavailable',
      description: 'The value can’t change here; say why nearby.',
      code: `<Slider label="Optical size" min={14} max={32} value={14} disabled onChange={setSize} />`,
      render: () => <Live label="Optical size" min={14} max={32} initial={14} disabled />,
    },
    {
      title: 'Pill ends from the theme',
      description: 'The track, fill, thumb and step dots are round at every shape by default. A theme whose pill ends follow its corners sets --c-slider-radius to var(--radius-pill) (a theme setting): here, inside a sharp shape, the slider turns square with the rest of the controls.',
      code: `applySettings({ '--c-slider-radius': 'var(--radius-pill)' });

<div data-shape="sharp"><Slider label="Volume" min={0} max={10} marks value={v} onChange={setV} /></div>`,
      render: () => (
        <div data-shape="sharp">
          <WithSettings settings={pillEnds}>
            <Live label="Volume" min={0} max={10} marks initial={6} />
          </WithSettings>
        </div>
      ),
    },
  ],
} satisfies StoryFile;