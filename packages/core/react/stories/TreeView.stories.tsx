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

const outline: TreeItem[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'intro', label: 'Introduction' },
  { id: 'faq', label: 'Questions', children: [{ id: 'q1', label: 'Who is it for?' }, { id: 'q2', label: 'When is it?' }, { id: 'q3', label: 'Where is it?' }] },
  { id: 'share', label: 'Sharing' },
];

function Outline() {
  const [items, setItems] = useState(outline);
  const [expanded, setExpanded] = useState(['faq']);
  const [selected, setSelected] = useState('intro');
  const reorder = (parent: string | undefined, ids: string[]) => {
    const order = (list: TreeItem[]) => ids.map((id) => list.find((i) => i.id === id)!);
    setItems((all) => (parent === undefined ? order(all) : all.map((i) => (i.id === parent ? { ...i, children: order(i.children ?? []) } : i))));
  };
  return <TreeView label="Outline" items={items} expanded={expanded} onExpandedChange={setExpanded} selected={selected} onSelect={setSelected} reorderable onReorder={reorder} />;
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
    {
      title: 'Reorder sections',
      description: 'With `reorderable`, drag a row up or down among its siblings, or press Alt+ArrowUp or Alt+ArrowDown on it; each move is announced (“Moved Hero to position 2 of 4.”) and focus stays on the row. A row never leaves its parent: questions move among questions.',
      code: `<TreeView label="Outline" items={items} reorderable onReorder={(parent, ids) => …} … />`,
      render: () => <Outline />,
    },
  ],
} satisfies StoryFile;
