import { useState } from 'react';
import { Sheet } from '../compounds/Sheet';
import { Button } from '../fundamentals/Button';
import { Checkbox } from '../fundamentals/Checkbox';
import { CheckboxGroup } from '../fundamentals/CheckboxGroup';
import { DescriptionList } from '../compounds/DescriptionList';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { TextField } from '../fundamentals/TextField';
import { TextArea } from '../fundamentals/TextArea';
import type { StoryFile } from './story';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Choices({ label, options }: { label: string; options: string[] }) {
  const [on, setOn] = useState<string[]>([]);
  return (
    <CheckboxGroup label={label}>
      {options.map((o) => (
        <Checkbox key={o} label={o} checked={on.includes(o)} onChange={(next) => setOn(next ? [...on, o] : on.filter((x) => x !== o))} />
      ))}
    </CheckboxGroup>
  );
}

function Summary() {
  const [v, setV] = useState('The new collection, the shop refresh and the launch event in April.');
  return <TextArea label="Summary" value={v} onChange={setV} />;
}

function Edit() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Edit details" onClick={() => setOpen(true)} />
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Edit “Spring launch”"
        description="Changes show for everyone with access."
        actions={
          <>
            <Button label="Cancel" onClick={() => setOpen(false)} />
            <Button label="Save" emphasis="primary" pendingLabel="Saving…" doneLabel="Saved" onCommit={() => wait(900).then(() => setOpen(false))} />
          </>
        }
      >
        <Stack gap="group">
          <TextField label="Project name" value="Spring launch" onCommit={() => {}} />
          <TextField label="Owner" value="Asha Rao" onCommit={() => {}} />
          <Summary />
        </Stack>
      </Sheet>
    </>
  );
}

function Filters() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Filters" onClick={() => setOpen(true)} />
      <Sheet
        side="start"
        size="s"
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        actions={
          <>
            <Button label="Clear all" emphasis="quiet" onClick={() => setOpen(false)} />
            <Button label="Show 24 results" emphasis="primary" onClick={() => setOpen(false)} />
          </>
        }
      >
        <Stack gap="section">
          <Choices label="Status" options={['Open', 'In review', 'Done']} />
          <Choices label="Kind" options={['Bug', 'Design', 'Docs', 'Research', 'Support']} />
        </Stack>
      </Sheet>
    </>
  );
}

function Details() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Show details beside the page" expanded={open} onClick={() => setOpen((o) => !o)} />
      <Sheet
        modal={false}
        open={open}
        onClose={() => setOpen(false)}
        title="Invoice 2041"
        description="Sent on 3 November."
        headerActions={<Button label="Open in a new page" icon="external" iconOnly emphasis="quiet" size="s" onClick={() => {}} />}
      >
        <DescriptionList
          items={[
            { term: 'Customer', details: 'Northwind Traders' },
            { term: 'Amount', details: '€ 4,200.00' },
            { term: 'Due', details: '3 December' },
            { term: 'Status', details: 'Waiting for payment' },
          ]}
        />
      </Sheet>
    </>
  );
}

function Light() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Show areas" icon="menu" iconOnly expanded={open} onClick={() => setOpen((o) => !o)} />
      <Sheet modal={false} dismiss="outside" closeButton={false} side="start" size="s" open={open} onClose={() => setOpen(false)} title="Areas">
        <Stack gap="item">
          <Text>Pages</Text>
          <Text>Talks</Text>
          <Text>Media</Text>
        </Stack>
      </Sheet>
    </>
  );
}

function Loading() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  return (
    <>
      <Button
        label="Open the activity"
        onClick={() => {
          setLoading(true);
          setOpen(true);
          void wait(1500).then(() => setLoading(false));
        }}
      />
      <Sheet open={open} loading={loading} onClose={() => setOpen(false)} title="Activity" description="The last 30 days in this project.">
        <Stack gap="group">
          <Text>Asha renamed the project to “Spring launch”.</Text>
          <Text>Ben added 12 files to “Shop refresh”.</Text>
          <Text>Chen invited 3 people.</Text>
        </Stack>
      </Sheet>
    </>
  );
}

function Bottom() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Share" onClick={() => setOpen(true)} />
      <Sheet side="bottom" open={open} onClose={() => setOpen(false)} title="Share “Spring launch”">
        <Stack gap="group">
          <TextField label="Email addresses" value="" onCommit={() => {}} />
          <Text>People you invite can view and comment.</Text>
        </Stack>
      </Sheet>
    </>
  );
}

export default {
  component: 'Sheet',
  tier: 'compound',
  summary: 'A panel from the side or bottom edge, for a side task or one item’s details while its list stays in view.',
  stories: [
    {
      title: 'Edit form',
      description: 'From the end edge, over a scrim, so the page waits. Focus starts in the first field; Save shows its progress, then the sheet closes and focus returns to the button.',
      code: `<Sheet open={open} onClose={close} title="Edit “Spring launch”" description="Changes show for everyone with access." actions={<><Button label="Cancel" onClick={close} /><Button label="Save" emphasis="primary" pendingLabel="Saving…" doneLabel="Saved" onCommit={save} /></>}>…</Sheet>`,
      render: () => <Edit />,
    },
    {
      title: 'Filters from the start edge',
      description: 'A narrow sheet from the start edge, which is the right in right-to-left languages. The answers stay at its foot while the filters scroll.',
      code: `<Sheet side="start" size="s" open={open} onClose={close} title="Filters" actions={<><Button label="Clear all" emphasis="quiet" … /><Button label="Show 24 results" emphasis="primary" … /></>}>…</Sheet>`,
      render: () => <Filters />,
    },
    {
      title: 'Standard: beside the page',
      description: 'With `modal={false}` there’s no scrim and the page stays usable. Focus moves to the title and back to the button on close; Escape closes it while focus is inside. An extra action sits beside Close.',
      code: `<Sheet modal={false} open={open} onClose={close} title="Invoice 2041" description="Sent on 3 November." headerActions={<Button label="Open in a new page" icon="external" iconOnly emphasis="quiet" size="s" … />}>…</Sheet>`,
      render: () => <Details />,
    },
    {
      title: 'A light panel that gets out of the way',
      description: 'With dismiss="outside" a standard sheet also closes on a press anywhere outside it and its opener, and closeButton={false} leaves out Close because the opener and the press outside already close it; Escape still does. For a floating navigation over a busy view.',
      code: `<Sheet modal={false} dismiss="outside" closeButton={false} side="start" size="s" open={open} onClose={close} title="Areas">…</Sheet>`,
      render: () => <Light />,
    },
    {
      title: 'Loading',
      description: 'While its content is on its way the body shows skeleton lines and is marked busy; the title and Close stay usable.',
      code: `<Sheet open={open} loading={loading} onClose={close} title="Activity" description="The last 30 days in this project.">…</Sheet>`,
      render: () => <Loading />,
    },
    {
      title: 'Bottom sheet',
      description: 'From the bottom edge, full width, as tall as its content up to most of the window. For small windows: menus, filters and sharing.',
      code: `<Sheet side="bottom" open={open} onClose={close} title="Share “Spring launch”">…</Sheet>`,
      render: () => <Bottom />,
    },
  ],
} satisfies StoryFile;
