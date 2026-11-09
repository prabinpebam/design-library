import { useState } from 'react';
import { Canvas, type CanvasShape } from '../compounds/Canvas';
import type { StoryFile } from './story';

export const signInScreen: CanvasShape[] = [
  {
    id: 'signin',
    label: 'Sign in',
    kind: 'frame',
    x: 0,
    y: 0,
    width: 320,
    height: 400,
    children: [
      { id: 'logo', label: 'Logo', kind: 'ellipse', x: 136, y: 32, width: 48, height: 48, category: 1 },
      { id: 'title', label: 'Welcome back', kind: 'text', x: 32, y: 104, width: 256, height: 32, text: 'Welcome back' },
      { id: 'email', label: 'Email field', kind: 'rectangle', x: 32, y: 160, width: 256, height: 44 },
      { id: 'password', label: 'Password field', kind: 'rectangle', x: 32, y: 220, width: 256, height: 44 },
      { id: 'button', label: 'Sign in button', kind: 'rectangle', x: 32, y: 300, width: 256, height: 44, category: 3 },
    ],
  },
  {
    id: 'home',
    label: 'Home',
    kind: 'frame',
    x: 384,
    y: 0,
    width: 320,
    height: 400,
    children: [
      { id: 'hero', label: 'Hero', kind: 'rectangle', x: 0, y: 0, width: 320, height: 160, category: 5 },
      { id: 'heading', label: 'Good morning', kind: 'text', x: 24, y: 184, width: 272, height: 32, text: 'Good morning' },
    ],
  },
];

function Demo({ zoom = 1, start }: { zoom?: number; start?: string }) {
  const [selected, setSelected] = useState(start);
  return <Canvas label="Sign-in flow" shapes={signInScreen} width={704} height={400} zoom={zoom} selected={selected} onSelect={setSelected} size="md" />;
}

export default {
  component: 'Canvas',
  tier: 'compound',
  summary: 'A design document drawn from data: frames, rectangles, ellipses and text, at a zoom, with one selection.',
  stories: [
    {
      title: 'Two frames, one selected',
      description: 'Press a shape to select it: the accent outline, four handles and its size show only on the selection. Press the empty canvas to clear it. Each shape is also a button, so Tab reaches it.',
      code: `<Canvas label="Sign-in flow" width={704} height={400} shapes={[{ id: 'signin', label: 'Sign in', kind: 'frame', x: 0, y: 0, width: 320, height: 400, children: [ … ] }, …]} selected={selected} onSelect={setSelected} />`,
      render: () => <Demo start="button" />,
    },
    {
      title: 'At 50 %',
      description: '`zoom` scales the document, never the names, handles or size label.',
      code: `<Canvas … zoom={0.5} />`,
      render: () => <Demo zoom={0.5} start="signin" />,
    },
  ],
} satisfies StoryFile;
