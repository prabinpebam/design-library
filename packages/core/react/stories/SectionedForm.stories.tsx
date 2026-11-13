import { useState } from 'react';
import { SectionedForm, type SectionedFormSection } from '../compounds/SectionedForm';
import { EditorLayout } from '../layouts/EditorLayout';
import { Switch } from '../fundamentals/Switch';
import { TextField } from '../fundamentals/TextField';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const sections: SectionedFormSection[] = [
  { id: 'title', title: 'Title', group: 'Page', detail: 'The page’s name and address', content: <TextField label="Title" value="About DesignUp" onCommit={() => {}} /> },
  { id: 'intro', title: 'Introduction', group: 'Page', detail: 'The line under the title', content: <TextField label="Introduction" value="A gathering of designers in India." onCommit={() => {}} /> },
  { id: 'faq', title: 'Questions', group: 'Blocks', detail: 'Four questions', content: <Text>Four questions and their answers.</Text> },
  { id: 'share', title: 'Sharing', group: 'Blocks', detail: 'Preview card', content: <Switch label="Show a share card" checked onChange={() => {}} /> },
];

function Inspector({ details = false, mark, stickyList = false }: { details?: boolean; mark?: 'check' | 'fill'; stickyList?: boolean }) {
  const [selected, setSelected] = useState('title');
  return <SectionedForm label="Page settings" sections={sections} selected={selected} onSelect={setSelected} details={details} mark={mark} stickyList={stickyList} />;
}

function InEditor({ fill = false }: { fill?: boolean }) {
  const [selected, setSelected] = useState('intro');
  return (
    <EditorLayout height="lg" endSize="41rem" endMax="60rem" workMin="24rem" endFill={fill} start={null} startOpen={false} onStartToggle={() => {}} endOpen onEndToggle={() => {}} end={<SectionedForm label="Page settings" sections={sections} selected={selected} onSelect={setSelected} density="compact" fill={fill} />}>
      <Text>The page</Text>
    </EditorLayout>
  );
}

export default {
  component: 'SectionedForm',
  tier: 'compound',
  summary: 'A form in sections: from a set width of its own, the list of sections beside the chosen one; narrower, every section in turn.',
  stories: [
    {
      title: 'Two columns from 40 rem',
      description: 'At 40 rem of its own width or more, the list of sections, titles only under their group headings, sits beside the chosen section. Narrow the window and every section shows in turn instead, with no list. The width is the form’s own, never the window’s.',
      code: `<SectionedForm label="Page settings" sections={[{ id: 'title', title: 'Title', group: 'Page', content: <TextField … /> }, …]} selected={selected} onSelect={setSelected} />`,
      render: () => <Inspector />,
    },
    {
      title: 'With a line under each title',
      description: '`details` shows each section’s `detail` as a second line in the list; by default the list shows titles only.',
      code: `<SectionedForm details label="Page settings" sections={…} … />`,
      render: () => <Inspector details />,
    },
    {
      title: 'Current section by its fill',
      description: '`mark="fill"` shows the chosen section in the list by its fill alone, with no check: the list says where you are, and the section beside it says which. The row is still the selected option for assistive technology.',
      code: `<SectionedForm mark="fill" label="Page settings" sections={…} … />`,
      render: () => <Inspector mark="fill" />,
    },
    {
      title: 'In an editor’s inspector',
      description: 'A 41 rem inspector holds the form in two columns, compact. When the window narrows, the inspector gives way to the page’s 24 rem floor and the form falls back to one column.',
      code: `<EditorLayout endSize="41rem" endMax="60rem" workMin="24rem" end={<SectionedForm density="compact" … />} …>…</EditorLayout>`,
      render: () => <InEditor />,
    },
    {
      title: 'A list that stays in view',
      description: 'With stickyList, in two columns the list of sections stays in view under the window’s sticky header while a long section scrolls, as in a record’s edit view.',
      code: `<SectionedForm stickyList label="Page settings" sections={…} … />`,
      render: () => <Inspector stickyList />,
    },
    {
      title: 'Filling the inspector',
      description: 'With fill, and endFill on the EditorLayout, the form takes the panel’s full height: the list runs to the bottom beside the chosen section, whose fields start at the top.',
      code: `<EditorLayout endFill end={<SectionedForm fill density="compact" … />} …>…</EditorLayout>`,
      render: () => <InEditor fill />,
    },
  ],
} satisfies StoryFile;
