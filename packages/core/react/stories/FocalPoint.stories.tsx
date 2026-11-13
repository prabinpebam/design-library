import { useState } from 'react';
import { FocalPoint, type FocalPointValue } from '../fundamentals/FocalPoint';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const hills = scenes[0];
const format = (v: FocalPointValue) => `${Math.round(v.x * 100)}% across, ${Math.round(v.y * 100)}% down`;
const messages = { saving: 'Saving…', saved: 'Saved', retry: 'Retry', imageFailed: 'The picture didn’t load.' };
const hint = 'Drag the mark or press the arrow keys to choose what stays in view when the picture is cropped.';

function Demo({ preview, fails = false }: { preview?: 'compact' | 'fill'; fails?: boolean }) {
  const [value, setValue] = useState<FocalPointValue>({ x: 0.5, y: 0.4 });
  return (
    <FocalPoint
      src={hills.src}
      alt={hills.alt}
      label="Picture centre"
      hint={hint}
      preview={preview}
      value={value}
      onChange={setValue}
      onChangeEnd={() => new Promise<void>((resolve, reject) => setTimeout(() => (fails ? reject(new Error('offline')) : resolve()), 600))}
      format={format}
      messages={messages}
    />
  );
}

export default {
  component: 'FocalPoint',
  tier: 'fundamental',
  summary: 'Chooses the point of a picture that stays in view wherever it is cropped: a mark on the whole picture, moved by pointer or keys, saved once per gesture.',
  stories: [
    {
      title: 'Choose the picture’s centre',
      description: 'LR103: drag the mark or use the arrow keys (Shift for bigger steps). The value is fractions of the picture’s width and height; it saves once when the gesture ends and says so.',
      code: `<FocalPoint src={src} alt="…" label="Picture centre" hint="…" value={value} onChange={setValue} onChangeEnd={save} format={(v) => \`\${Math.round(v.x * 100)}% across, \${Math.round(v.y * 100)}% down\`} messages={messages} />`,
      render: () => <Demo />,
    },
    {
      title: 'The whole width',
      description: 'preview="fill": in a wide editor panel the picture takes the width at its own shape, instead of the compact, height-bounded preview.',
      code: `<FocalPoint preview="fill" … />`,
      render: () => <Demo preview="fill" />,
    },
    {
      title: 'A save that fails',
      description: 'When saving is refused, the chosen point stays where it is and Retry is offered; nothing is lost.',
      code: `<FocalPoint onChangeEnd={() => Promise.reject(new Error('offline'))} … />`,
      render: () => <Demo fails />,
    },
  ],
} satisfies StoryFile;