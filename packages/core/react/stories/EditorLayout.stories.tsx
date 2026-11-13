import { useState } from 'react';
import { Canvas } from '../compounds/Canvas';
import { Tabs } from '../compounds/Tabs';
import { Toolbar } from '../compounds/Toolbar';
import { TreeView } from '../compounds/TreeView';
import { Button } from '../fundamentals/Button';
import { Heading } from '../fundamentals/Heading';
import { NumberField } from '../fundamentals/NumberField';
import { SegmentedControl } from '../fundamentals/SegmentedControl';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { EditorLayout } from '../layouts/EditorLayout';
import { signInScreen } from './Canvas.stories';
import type { StoryFile } from './story';

function Editor({ startOpen: start = true, endOpen: end = true, bare = false, wide = false, docked = false, panelTone }: { startOpen?: boolean; endOpen?: boolean; bare?: boolean; wide?: boolean; docked?: boolean; panelTone?: 'raised' | 'sunken' }) {
  const [startOpen, setStartOpen] = useState(start);
  const [endOpen, setEndOpen] = useState(end);
  const [tool, setTool] = useState('pointer');
  const [selected, setSelected] = useState<string | undefined>('button');
  const [expanded, setExpanded] = useState(['signin']);
  return (
    <EditorLayout
      height="lg"
      panelTone={panelTone}
      {...(wide ? { startSize: '16rem', endSize: '41rem', endMax: '60rem', workMin: '24rem', resizable: true } : {})}
      {...(docked ? { toggles: 'none' as const, resizable: true } : {})}
      startOpen={startOpen}
      onStartToggle={() => setStartOpen((x) => !x)}
      endOpen={endOpen}
      onEndToggle={() => setEndOpen((x) => !x)}
      toolsLabel="Tools"
      tools={
          <SegmentedControl
            label="Tool"
            iconOnly
            size="s"
            value={tool}
            onChange={setTool}
            options={[
              { value: 'pointer', label: 'Move', icon: 'pointer' },
              { value: 'frame', label: 'Frame', icon: 'frame' },
              { value: 'rectangle', label: 'Rectangle', icon: 'rectangle' },
              { value: 'text', label: 'Text', icon: 'text' },
            ]}
          />
      }
      bar={
        bare ? undefined : (
          <Toolbar start={<Text as="span">Sign-in flow</Text>} align="end">
            <Button label="Share" emphasis="primary" size="s" />
          </Toolbar>
        )
      }
      startHead={bare ? <Text as="span" variant="body-sm">Sign-in flow</Text> : undefined}
      endHead={bare ? <Toolbar align="end"><Button label="Share" emphasis="primary" size="xs" /></Toolbar> : undefined}
      start={
        <Stack gap="item">
          <Heading level={2} size="label">
            Layers
          </Heading>
          <TreeView
            label="Layers"
            items={signInScreen.map((f) => ({ id: f.id, label: f.label, icon: 'frame', children: f.children?.map((c) => ({ id: c.id, label: c.label, icon: c.kind === 'frame' ? 'frame' : c.kind })) }))}
            expanded={expanded}
            onExpandedChange={setExpanded}
            selected={selected}
            onSelect={setSelected}
          />
        </Stack>
      }
      end={
        <Stack gap="item">
          <Heading level={2} size="label">
            Size
          </Heading>
          <NumberField label="Width" glyph="W" hideLabel value={256} unit="px" onCommit={() => {}} size="s" />
          <NumberField label="Height" glyph="H" hideLabel value={44} unit="px" onCommit={() => {}} size="s" />
        </Stack>
      }
    >
      <Canvas label="Sign-in flow" shapes={signInScreen} width={704} height={400} selected={selected} onSelect={setSelected} />
    </EditorLayout>
  );
}

export default {
  component: 'EditorLayout',
  tier: 'layout',
  summary: 'An editor: a bar across the top, a panel at each side that can be hidden, and the working area between them.',
  stories: [
    {
      title: 'A design editor',
      description: 'Layers at the start, properties at the end, the canvas between, and the tools floating at the canvas’s bottom centre, as in Figma UI3. Each panel scrolls with the library’s overlay bar, never sideways. The toggles at each end of the bar show and hide the panels; selecting in the layers or on the canvas is the same selection.',
      code: `<EditorLayout
  tools={<SegmentedControl label="Tool" iconOnly size="s" … />}
  bar={<Toolbar start={<Text as="span">Sign-in flow</Text>} align="end">…Share</Toolbar>}
  start={<TreeView label="Layers" … />} startOpen={startOpen} onStartToggle={…}
  end={…properties} endOpen={endOpen} onEndToggle={…}
>
  <Canvas label="Sign-in flow" … />
</EditorLayout>`,
      render: () => <Editor />,
    },
    {
      title: 'Without a bar (a design tool)',
      description: 'As Figma UI3: no header. Each panel has its own head (the file’s name at the start, Share at the end) that never scrolls away; an open panel’s toggle sits in its head and a closed panel’s floats at the working area’s top corner. Hide either panel and its toggle moves to the corner, with focus following it.',
      code: `<EditorLayout startHead={<Text as="span">Sign-in flow</Text>} endHead={<Toolbar align="end">…Share</Toolbar>} tools={…} start={…} end={…} … />`,
      render: () => <Editor bare />,
    },
    {
      title: 'Panels hidden',
      description: 'With both panels hidden, the working area takes the whole width. In a narrow window, a panel opened floats over it and Escape closes it.',
      code: `<EditorLayout startOpen={false} endOpen={false} … />`,
      render: () => <Editor startOpen={false} endOpen={false} />,
    },
    {
      title: 'A wide inspector with a canvas floor',
      description: 'Each panel can open at its own width: here the layers at 16 rem and a two-column inspector at 41 rem, which can be dragged up to 60 rem. The working area keeps at least 24 rem: in a narrower window the inspector gives way first, down to the least panel width, before the canvas shrinks below its floor.',
      code: `<EditorLayout startSize="16rem" endSize="41rem" endMax="60rem" workMin="24rem" resizable … />`,
      render: () => <Editor wide />,
    },
    {
      title: 'Panels always docked',
      description: 'toggles="none": no panel toggles, for a studio whose outline and inspector are always there (both open); the resize handles stay. The bar holds only its own content.',
      code: `<EditorLayout toggles="none" startOpen endOpen resizable onStartToggle={() => {}} onEndToggle={() => {}} … />`,
      render: () => <Editor docked />,
    },
    {
      title: 'Panels set apart by tone',
      description: 'panelTone gives both panels their own surface, raised or sunken, so they part from the working area by tone alone, with no border or shadow.',
      code: `<EditorLayout panelTone="sunken" … />`,
      render: () => <Editor bare panelTone="sunken" />,
    },
    {
      title: 'An inspector filling its panel',
      description: 'endFill lets the end panel’s content take the panel’s full height; with Tabs fill below it, the chosen tab’s panel grows to the bottom.',
      code: `<EditorLayout endFill end={<Tabs fill size="s" label="Inspector" items={…} />} … >…</EditorLayout>`,
      render: () => (
        <EditorLayout
          height="lg"
          endFill
          start={null}
          startOpen={false}
          onStartToggle={() => {}}
          endOpen
          onEndToggle={() => {}}
          end={
            <Tabs
              fill
              size="s"
              label="Inspector"
              items={[
                { id: 'design', label: 'Design', panel: <Text>Width, height and fill</Text> },
                { id: 'content', label: 'Content', panel: <Text>Words and pictures</Text> },
              ]}
            />
          }
        >
          <Text>The page</Text>
        </EditorLayout>
      ),
    },
  ],
} satisfies StoryFile;
