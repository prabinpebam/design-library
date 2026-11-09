import { useState } from 'react';
import { TreeView, type TreeItem } from '../compounds/TreeView';
import { Stack } from '../fundamentals/Stack';
import type { StoryFile } from './story';

const layers: TreeItem[] = [
  {
    id: 'signin',
    label: 'Sign in',
    icon: 'frame',
    children: [
      { id: 'logo', label: 'Logo', icon: 'ellipse' },
      { id: 'title', label: 'Welcome back', icon: 'text' },
      {
        id: 'form',
        label: 'Form',
        icon: 'frame',
        children: [
          { id: 'email', label: 'Email field', icon: 'rectangle' },
          { id: 'password', label: 'Password field', icon: 'rectangle' },
        ],
      },
      { id: 'button', label: 'Sign in button', icon: 'rectangle' },
    ],
  },
  { id: 'home', label: 'Home', icon: 'frame', meta: 'Hidden', children: [{ id: 'hero', label: 'Hero', icon: 'rectangle' }] },
];

const files: TreeItem[] = [
  { id: 'design', label: 'Design', children: [{ id: 'tokens', label: 'tokens.json', icon: 'file', meta: '12 KB' }, { id: 'readme', label: 'README.md', icon: 'file', meta: '2 KB' }] },
  { id: 'pictures', label: 'Pictures', children: [{ id: 'cover', label: 'cover.png', icon: 'image', meta: '480 KB' }] },
];

function Layers({ items, open, start }: { items: TreeItem[]; open: string[]; start: string }) {
  const [expanded, setExpanded] = useState(open);
  const [selected, setSelected] = useState(start);
  return <TreeView label="Layers" items={items} expanded={expanded} onExpandedChange={setExpanded} selected={selected} onSelect={setSelected} />;
}

export default {
  component: 'TreeView',
  tier: 'compound',
  summary: 'A hierarchy to browse and choose from: layers in a design file, folders and files, a long document’s sections.',
  stories: [
    {
      title: 'Layers in a design file',
      description: 'Frames open to show what’s inside them; each row’s icon says its kind. Use the arrow keys: Right opens a row, Left closes it or goes to its parent, Enter selects.',
      code: `<TreeView
  label="Layers"
  items={[{ id: 'signin', label: 'Sign in', icon: 'frame', children: [ … ] }, …]}
  expanded={expanded}
  onExpandedChange={setExpanded}
  selected={selected}
  onSelect={setSelected}
/>`,
      render: () => <Layers items={layers} open={['signin', 'form']} start="button" />,
    },
    {
      title: 'Folders and files',
      description: 'A note at the end of a row (a size, “Hidden”) is read with its name. Rows without children have no arrow, and their labels still line up.',
      code: `<TreeView label="Files" items={[{ id: 'design', label: 'Design', children: [{ id: 'tokens', label: 'tokens.json', icon: 'file', meta: '12 KB' }, …] }, …]} … />`,
      render: () => <Layers items={files} open={['design']} start="tokens" />,
    },
    {
      title: 'Compact, in a design tool',
      description: 'Inside a compact density context (`data-density="compact"` on any container, as the Design tool’s editor sets), rows are 32 px, as Figma UI3’s layers. Nothing else changes: the same keys, selection and indent.',
      code: `<EditorLayout data-density="compact" start={<TreeView label="Layers" … />} … />`,
      render: () => (
        <Stack gap="item" data-density="compact">
          <Layers items={layers} open={['signin', 'form']} start="button" />
        </Stack>
      ),
    },
  ],
} satisfies StoryFile;
