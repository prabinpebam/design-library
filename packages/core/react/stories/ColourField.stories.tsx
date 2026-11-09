import { useState } from 'react';
import { ColourField, type ColourFieldProps } from '../compounds/ColourField';
import type { StoryFile } from './story';

function Field({ initial, clearable = true, ...rest }: Omit<ColourFieldProps, 'value' | 'onChange' | 'onClear'> & { initial?: string; clearable?: boolean }) {
  const [value, setValue] = useState(initial);
  return <ColourField {...rest} value={value} onChange={setValue} onClear={clearable ? () => setValue(undefined) : undefined} />;
}

export default {
  component: 'ColourField',
  tier: 'compound',
  summary: 'A labelled swatch that opens the colour picker; the colour can be cleared so it isn’t defined.',
  stories: [
    {
      title: 'Defined, with a tag',
      description: 'A colour in use, marked with the role it plays. Choose the swatch to change it; Clear makes it not defined.',
      code: `<ColourField mark="1" label="Brand colour 1" name="Indigo" tag="Accent" value={colour} onChange={setColour} onClear={() => setColour(undefined)} />`,
      render: () => <Field mark="1" label="Brand colour 1" name="Indigo" tag="Accent" initial="#4f5bd5" />,
    },
    {
      title: 'Not defined',
      description: 'An empty, dashed swatch that says what to do. Choosing a colour defines it.',
      code: `<ColourField mark="2" label="Brand colour 2" value={undefined} onChange={setColour} />`,
      render: () => <Field mark="2" label="Brand colour 2" suggestion="#0e7490" />,
    },
    {
      title: 'Can’t be cleared',
      description: 'Without onClear there’s no Clear; say why nearby, e.g. the last brand colour.',
      code: `<ColourField mark="1" label="Brand colour 1" name="Slate" value={colour} onChange={setColour} />`,
      render: () => <Field mark="1" label="Brand colour 1" name="Slate" initial="#475569" clearable={false} />,
    },
  ],
} satisfies StoryFile;
