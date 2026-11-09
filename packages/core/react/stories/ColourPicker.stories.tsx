import { useState } from 'react';
import { ColourPicker, type ColourPickerProps } from '../fundamentals/ColourPicker';
import { Text } from '../fundamentals/Text';
import { TextField } from '../fundamentals/TextField';
import type { StoryFile } from './story';

/** A picker that keeps what it's given and says the result under it. */
function Live({ initial, initialAlpha, ...rest }: Omit<ColourPickerProps, 'value' | 'alpha' | 'onChange'> & { initial: string; initialAlpha?: number }) {
  const [hex, setHex] = useState(initial);
  const [alpha, setAlpha] = useState(initialAlpha);
  return (
    <>
      <ColourPicker
        {...rest}
        value={hex}
        alpha={alpha}
        onChange={(h, a) => {
          setHex(h);
          if (alpha !== undefined) setAlpha(a);
        }}
      />
      <Text variant="caption" tone="muted">
        {`${hex.toUpperCase()}${alpha !== undefined ? ` at ${Math.round(alpha * 100)}%` : ''}`}
      </Text>
    </>
  );
}

/** A hex field whose swatch opens the picker: the way fields use it. */
function Fill() {
  const [hex, setHex] = useState('#5b5bd6');
  return <TextField label="Fill colour" value={hex.toUpperCase()} swatch={{ value: hex, onChange: setHex }} onCommit={(v) => /^#?[0-9a-f]{6}$/i.test(v) && setHex(v.startsWith('#') ? v : `#${v}`)} />;
}

const page = ['#5b5bd6', '#e5484d', '#30a46c', '#f5d90a', '#0091ff', '#1c2024', '#ffffff', '#5b5bd680'];

export default {
  component: 'ColourPicker',
  tier: 'fundamental',
  summary: 'A colour chosen by eye or by number: area, hue, a separate opacity slider, five models with HSL first, and swatches.',
  stories: [
    {
      title: 'HSL with opacity',
      description: 'Drag in the area for saturation and brightness, along the top track for hue and the lower one for opacity. The numbers show HSL first; the menu switches to Hex, RGB, HSB or CSS. Pick takes a colour from the screen where the browser can.',
      code: `<ColourPicker label="Fill colour" value={hex} alpha={opacity} onChange={(hex, a) => { setHex(hex); setOpacity(a); }}
  swatches={[{ title: 'On this page', colours: pageColours }]} />`,
      render: () => <Live label="Fill colour" initial="#5b5bd6" initialAlpha={0.8} swatches={[{ title: 'On this page', colours: page }]} />,
    },
    {
      title: 'From a swatch',
      description: 'In a field, the picker is a swatch: press it (or Enter) and the panel opens under it; Escape or a press outside closes it and focus goes back to the swatch. ColourField and GradientEditor open it the same way.',
      code: `<TextField label="Fill colour" value={hex} swatch={{ value: hex, onChange: setHex }} onCommit={setHexIfValid} />
// inside: <ColourPicker label="Fill colour" value={hex} onChange={setHex} trigger={{}} />`,
      render: () => <Fill />,
    },
    {
      title: 'Without opacity',
      description: 'For a colour that can’t be translucent (a theme’s base colour): leave out `alpha` and the opacity slider and field go.',
      code: `<ColourPicker label="Base colour" value={hex} onChange={setHex} model="hex" />`,
      render: () => <Live label="Base colour" initial="#30a46c" model="hex" />,
    },
    {
      title: 'Each model',
      description: 'The same colour in RGB and in CSS; the menu offers HSB too. CSS takes any hex, rgb() or hsl() and writes rgb() with the opacity.',
      code: `<ColourPicker label="Stroke" model="rgb" … />  // 'hex' | 'rgb' | 'hsl' | 'hsb' | 'css'`,
      render: () => (
        <>
          <Live label="Stroke, in RGB" initial="#e5484d" initialAlpha={1} model="rgb" />
          <Live label="Stroke, in CSS" initial="#e5484d" initialAlpha={0.5} model="css" />
        </>
      ),
    },
  ],
} satisfies StoryFile;
