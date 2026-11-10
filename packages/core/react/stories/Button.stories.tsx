import { useState } from 'react';
import { Button, type ButtonSize } from '../fundamentals/Button';
import { ButtonGroup } from '../fundamentals/ButtonGroup';
import { Cluster } from '../fundamentals/Cluster';
import { MenuButton } from '../fundamentals/MenuButton';
import { SegmentedControl } from '../fundamentals/SegmentedControl';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const save = (ms: number) => () => new Promise<void>((resolve) => setTimeout(resolve, ms));
const sizes: [ButtonSize, string][] = [
  ['xs', 'xs · 24 px'],
  ['s', 's · 36 px'],
  ['normal', 'normal · 44 px (default)'],
  ['m', 'm · 48 px'],
  ['l', 'l · 56 px'],
  ['xl', 'xl · 64 px'],
  ['xxl', 'xxl · 80 px'],
];

/** A simulated upload with a real total: 24 files, the percentage from the files done. */
function TryFill() {
  const [done, setDone] = useState<number | null>(null);
  const start = () => {
    let files = 0;
    setDone(0);
    const tick = window.setInterval(() => {
      files += 1;
      if (files > 24) {
        window.clearInterval(tick);
        setDone(null);
        return;
      }
      setDone(Math.round((files / 24) * 100));
    }, 160);
  };
  const props = { progress: 'fill' as const, busy: done !== null, value: done ?? 0, emphasis: 'primary' as const, label: 'Upload 24 files', pendingLabel: 'Uploading 24 files…', onClick: start };
  return (
    <>
      <Button size="l" {...props} />
      <div dir="rtl">
        <Button size="l" {...props} />
      </div>
    </>
  );
}

/** One row per size, smallest first, each named in a caption above it. */
function BySize({ row }: { row: (size: ButtonSize) => React.ReactNode }) {
  return (
    <Stack gap="group">
      {sizes.map(([size, name]) => (
        <Stack key={size} gap="pair">
          <Text variant="caption" tone="muted">
            {name}
          </Text>
          <Cluster gap="item" align="center">
            {row(size)}
          </Cluster>
        </Stack>
      ))}
    </Stack>
  );
}

const exportItems = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
];

function Segmented({ size }: { size?: ButtonSize }) {
  const [view, setView] = useState('list');
  return (
    <SegmentedControl
      size={size}
      label="Show as"
      options={[
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' },
        { value: 'board', label: 'Board' },
      ]}
      value={view}
      onChange={setView}
    />
  );
}

const saveItems = [
  { value: 'copy', label: 'Save as a copy' },
  { value: 'template', label: 'Save as a template' },
];

/** A split button: the main action and a menu of its other forms, attached in one ButtonGroup; no separate component. */
function Split({ size, emphasis = 'primary', busy = false }: { size?: ButtonSize; emphasis?: 'primary' | 'default'; busy?: boolean }) {
  return (
    <ButtonGroup label="Save" arrangement="attached">
      <Button size={size} emphasis={emphasis} label="Save" busy={busy} pendingLabel="Saving…" />
      <MenuButton size={size} emphasis={emphasis} iconOnly label="More ways to save" items={saveItems} onSelect={() => undefined} busy={busy} />
    </ButtonGroup>
  );
}

/** A split button whose action really runs: both halves lock while it saves. */
function SplitLive() {
  const [busy, setBusy] = useState(false);
  return (
    <ButtonGroup label="Save" arrangement="attached">
      <Button emphasis="primary" label="Save" busy={busy} pendingLabel="Saving…" onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1500); }} />
      <MenuButton emphasis="primary" iconOnly label="More ways to save" items={saveItems} busy={busy} onSelect={() => { setBusy(true); setTimeout(() => setBusy(false), 1500); }} />
    </ButtonGroup>
  );
}

function MenuBusy() {
  const [busy, setBusy] = useState(false);
  return <MenuButton label="Presets" pendingLabel="Applying…" busy={busy} items={saveItems} onSelect={() => { setBusy(true); setTimeout(() => setBusy(false), 1500); }} />;
}

const refuse = () => new Promise<void>((_, reject) => setTimeout(() => reject(new Error('offline')), 700));

function FailingSave() {
  const [failed, setFailed] = useState(false);
  return (
    <>
      <Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={() => { setFailed(false); return refuse(); }} onError={() => setFailed(true)} />
      {failed && <Text tone="danger">Couldn’t save your changes: the connection dropped. Your edits are kept; save again when you’re back online.</Text>}
    </>
  );
}

function Disclosure() {
  const [open, setOpen] = useState(false);
  return <Button label="Notes" icon="comment" iconOnly emphasis="quiet" size="s" expanded={open} controls="notes-pane" onClick={() => setOpen(!open)} />;
}

function Toggles() {
  const [snap, setSnap] = useState(true);
  return (
    <>
      {/* toggle-button: a dense canvas toolbar's snapping, where a Switch would break the row of icon buttons (Q121) */}
      <Button label="Snap to grid" icon="grid" iconOnly emphasis="quiet" size="s" pressed={snap} onClick={() => setSnap(!snap)} />
    </>
  );
}

export default {
  component: 'Button',
  tier: 'fundamental',
  summary: 'Triggers an action. One component for text, icon and text, and icon-only buttons.',
  stories: [
    {
      title: 'Small icon, accessible target',
      description: 'minimumTarget keeps the small icon and reserves at least 44 CSS px in both axes, even when the root font is reduced. Dialog uses this for Close. Dense buttons without it keep their existing sizes.',
      code: `<Button size="s" minimumTarget icon="close" iconOnly emphasis="quiet" label="Close" />`,
      render: () => <Button size="s" minimumTarget icon="close" iconOnly emphasis="quiet" label="Close" />,
    },
    {
      title: 'Sizes and types',
      description: 'Seven sizes, smallest first: text, icon and text, icon-only, dropdown, split and segmented at each. Size is per button; the theme’s space option changes the space around buttons, never their height.',
      code: `<Button size="xs" label="Add" />  // xs, s, normal (default), m, l, xl, xxl
<Button size="xs" icon="plus" label="Add token" />
<Button size="xs" icon="plus" iconOnly label="Add token" />
<MenuButton size="xs" label="Export" items={formats} onSelect={exportAs} />`,
      render: () => (
        <BySize
          row={(size) => (
            <>
              <Button size={size} emphasis="primary" label="Publish" />
              <Button size={size} icon="plus" label="Add token" />
              <Button size={size} icon="search" iconOnly label="Search tokens" />
              <MenuButton size={size} label="Export" items={exportItems} onSelect={() => undefined} />
              <Split size={size} />
              <Segmented size={size} />
            </>
          )}
        />
      ),
    },
    {
      title: 'In progress: spinner inside',
      description: 'Variation 1. The spinner takes the icon’s place and the label turns present tense, in the same width. The button stays focused and ignores presses until the work ends.',
      code: `<Button busy pendingLabel="Exporting…" icon="copy" label="Export" />
<Button busy icon="search" iconOnly label="Search tokens" />`,
      render: () => (
        <BySize
          row={(size) => (
            <>
              <Button size={size} emphasis="primary" busy pendingLabel="Publishing…" label="Publish" />
              <Button size={size} busy pendingLabel="Adding…" icon="plus" label="Add token" />
              <Button size={size} busy icon="search" iconOnly label="Search tokens" />
              <Button size={size} emphasis="quiet" busy pendingLabel="Syncing…" label="Sync" />
              <MenuButton size={size} busy pendingLabel="Exporting…" label="Export" items={exportItems} onSelect={() => undefined} />
              <Split size={size} busy />
            </>
          )}
        />
      ),
    },
    {
      title: 'In progress: spinner on the border',
      description: 'Variation 2. An arc travels around the button’s own border, the same arc as the Switch knob’s; the content stays, so the person still reads what is happening. Accent on the page, the on-fill colour on a filled button.',
      code: `<Button progress="ring" busy pendingLabel="Publishing…" emphasis="primary" label="Publish" />
<Button progress="ring" busy icon="search" iconOnly label="Search tokens" />`,
      render: () => (
        <BySize
          row={(size) => (
            <>
              <Button size={size} progress="ring" emphasis="primary" busy pendingLabel="Publishing…" label="Publish" />
              <Button size={size} progress="ring" busy pendingLabel="Adding…" icon="plus" label="Add token" />
              <Button size={size} progress="ring" busy icon="search" iconOnly label="Search tokens" />
              <Button size={size} progress="ring" emphasis="quiet" busy pendingLabel="Syncing…" label="Sync" />
            </>
          )}
        />
      ),
    },
    {
      title: 'In progress: fill',
      description: 'Variation 3, for a known percentage only. The button itself fills up from its start edge as the work goes on; the label reads over both parts. Only on a filled button (primary or danger) wide enough to show the amount: m to xxl here.',
      code: `<Button progress="fill" busy value={40} emphasis="primary" label="Upload 24 files" pendingLabel="Uploading 24 files…" />`,
      render: () => (
        <Stack gap="group">
          {sizes.slice(3).map(([size, name], i) => (
            <Stack key={size} gap="pair">
              <Text variant="caption" tone="muted">
                {name}
              </Text>
              <Cluster gap="pair">
                <Button size={size} progress="fill" busy value={[20, 45, 70, 95][i]} emphasis="primary" label="Upload 24 files" pendingLabel="Uploading 24 files…" />
                <Button size={size} progress="fill" busy value={[60, 35, 85, 10][i]} emphasis="danger" label="Delete 120 tokens" pendingLabel="Deleting 120 tokens…" />
              </Cluster>
            </Stack>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Try the fill',
      description: 'Press it: the button fills as the files upload, then returns to rest. Right to left, the fill starts from the right.',
      arrangement: 'row',
      code: `const [done, setDone] = useState<number | null>(null);
<Button progress="fill" busy={done !== null} value={done ?? 0} emphasis="primary" label="Upload 24 files" pendingLabel="Uploading 24 files…" onClick={start} />`,
      render: () => <TryFill />,
    },
    {
      title: 'Fill: when it shows the spinner instead',
      description: 'A fill needs a known percentage, a visible background and room. Without one of them the button shows the spinner inside, and warns in development: outlined, icon-only, too narrow, no percentage.',
      arrangement: 'row',
      code: `<Button progress="fill" busy value={40} label="Upload 24 files" pendingLabel="Uploading 24 files…" />
<Button progress="fill" busy value={40} icon="search" iconOnly emphasis="primary" label="Search tokens" />
<Button progress="fill" busy value={40} emphasis="primary" label="Send" pendingLabel="Sending…" />
<Button progress="fill" busy emphasis="primary" label="Upload 24 files" pendingLabel="Uploading 24 files…" />`,
      render: () => (
        <>
          <Button progress="fill" busy value={40} label="Upload 24 files" pendingLabel="Uploading 24 files…" />
          <Button progress="fill" busy value={40} icon="search" iconOnly emphasis="primary" label="Search tokens" />
          <Button progress="fill" busy value={40} emphasis="primary" label="Send" pendingLabel="Sending…" />
          <Button progress="fill" busy emphasis="primary" label="Upload 24 files" pendingLabel="Uploading 24 files…" />
        </>
      ),
    },
    {
      title: 'Try both',
      description: 'Press each: pending, then a tick and the past tense, then rest. Left the spinner inside, right the ring.',
      arrangement: 'row',
      code: `<Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save} />
<Button progress="ring" emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save} />`,
      render: () => (
        <>
          <Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save(1800)} />
          <Button progress="ring" emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save(1800)} />
          <Button icon="check" iconOnly label="Approve" pendingLabel="Approving…" doneLabel="Approved" onCommit={save(1800)} />
          <Button progress="ring" icon="check" iconOnly label="Approve" pendingLabel="Approving…" doneLabel="Approved" onCommit={save(1800)} />
        </>
      ),
    },    {
      title: 'Emphasis',
      description: 'Primary for the one main action in a view; default otherwise; quiet inside toolbars and other enclosed groups; danger for an action that destroys or can’t be undone.',
      arrangement: 'row',
      code: `<Button emphasis="primary" label="Publish page" />
<Button label="Preview" />
<Button emphasis="quiet" label="Cancel" />
<Button emphasis="danger" label="Delete page" />`,
      render: () => (
        <>
          <Button emphasis="primary" label="Publish page" />
          <Button label="Preview" />
          <Button emphasis="quiet" label="Cancel" />
          <Button emphasis="danger" label="Delete page" />
        </>
      ),
    },
    {
      title: 'Icons',
      description: 'An icon only where it’s recognised faster than the word. Icon-only buttons still have a name.',
      arrangement: 'row',
      code: `<Button icon="plus" label="Add token" />
<Button icon="search" iconOnly label="Search tokens" />
<Button icon="close" iconOnly emphasis="quiet" label="Close the panel" />`,
      render: () => (
        <>
          <Button icon="plus" label="Add token" />
          <Button icon="search" iconOnly label="Search tokens" />
          <Button icon="close" iconOnly emphasis="quiet" label="Close the panel" />
        </>
      ),
    },
    {
      title: 'Motion',
      description: 'Press each. The labels cross-fade in the button’s held width (the leaving one clears in 100 ms, the arriving one fades in over 200 ms), and the fill and border ease to each state; a press shows in the first frame and eases back on release. Below, reduced motion: the same fades, no press scaling.',
      code: `<Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save} />
<Stack data-motion="reduce"><Button … /></Stack>`,
      render: () => (
        <Stack gap="group">
          <Cluster gap="item" align="center">
            <Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save(900)} />
            <Button label="Approve" icon="check" pendingLabel="Approving…" doneLabel="Approved" onCommit={save(0)} />
          </Cluster>
          <Stack data-motion="reduce" gap="pair">
            <Text variant="caption" tone="muted">
              Reduced motion
            </Text>
            <Cluster gap="item" align="center">
              <Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save(900)} />
              <Button label="Approve" icon="check" pendingLabel="Approving…" doneLabel="Approved" onCommit={save(0)} />
            </Cluster>
          </Stack>
        </Stack>
      ),
    },
    {
      title: 'Saving',
      description: 'Press each one. Pending replaces the icon with a spinner in the same width, then a tick and the past tense. The instant save still shows both beats.',
      arrangement: 'row',
      code: `<Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save} />
<Button icon="check" label="Approve" pendingLabel="Approving…" doneLabel="Approved" onCommit={instantSave} />
<Button icon="check" iconOnly label="Approve" pendingLabel="Approving…" doneLabel="Approved" onCommit={save} />`,
      render: () => (
        <>
          <Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved" onCommit={save(1200)} />
          <Button icon="check" label="Approve" pendingLabel="Approving…" doneLabel="Approved" onCommit={save(0)} />
          <Button icon="check" iconOnly label="Approve" pendingLabel="Approving…" doneLabel="Approved" onCommit={save(1200)} />
        </>
      ),
    },
    {
      title: 'Failed save',
      description: 'The button returns to rest; the failure shows at the scope it acts on, here the section, and keeps the person’s input.',
      code: `<Button emphasis="primary" label="Save changes" pendingLabel="Saving…" doneLabel="Saved"
  onCommit={save} onError={() => showSectionMessage()} />`,
      render: () => <FailingSave />,
    },
    {
      title: 'Unavailable',
      description: 'With a reason (preferred): the button stays focusable and readable, does nothing, and says why as its tooltip and description. Disabled only when there’s nothing to say; it can’t be focused, so no reason can be heard.',
      arrangement: 'row',
      code: `<Button emphasis="primary" label="Publish page" unavailable="Add a title first" />
<Button emphasis="primary" label="Publish page" disabled />`,
      render: () => (
        <>
          <Button emphasis="primary" label="Publish page" unavailable="Add a title first" />
          <Button icon="copy" iconOnly label="Copy link" unavailable="Save the page to get its link" />
          <Button emphasis="primary" label="Publish page" disabled />
          <Button label="Preview" disabled />
        </>
      ),
    },
    {
      title: 'Split button',
      description: 'The main action and a menu of its other forms: a Button and an icon-only MenuButton attached in one ButtonGroup, so no separate component. Two targets, each named; a hairline of space parts two filled halves. Press Save or choose from the menu: both halves lock while it runs.',
      code: `<ButtonGroup label="Save" arrangement="attached">
  <Button emphasis="primary" label="Save" busy={saving} pendingLabel="Saving…" onClick={save} />
  <MenuButton emphasis="primary" iconOnly label="More ways to save" items={saveItems} busy={saving} onSelect={saveAs} />
</ButtonGroup>`,
      arrangement: 'row',
      render: () => (
        <>
          <SplitLive />
          <Split emphasis="default" />
        </>
      ),
    },
    {
      title: 'Dropdown in progress',
      description: 'Choose a preset. The spinner takes the icon’s place, the label turns present tense in the same width, and the menu won’t open until the work ends; focus stays on the trigger.',
      code: `<MenuButton label="Presets" pendingLabel="Applying…" busy={applying} items={presets} onSelect={apply} />`,
      render: () => <MenuBusy />,
    },
    {
      title: 'Segmented button',      description: 'One exclusive choice that applies at once is the SegmentedControl, the library’s segmented button; there’s no second segmented component. It takes the same seven sizes (s by default); the size matrix above shows each.',
      code: `<SegmentedControl label="Show as" options={views} value={view} onChange={setView} />`,
      render: () => <Segmented />,
    },
    {
      title: 'Disclosure on a dense surface',
      description: 'Opens and closes a pane, as in the title bar. The s size, on dense surfaces only; the selected tint shows it’s open. Hover or focus it for its name.',
      code: `<Button label="Notes" icon="comment" iconOnly emphasis="quiet" size="s" expanded={open} controls="notes-pane" onClick={toggle} />`,
      render: () => <Disclosure />,
    },
    {
      title: 'Toggle button (pressed)',
      description: 'On or off, announced as pressed, with the pressed fill. Switch is the default for a binary setting; a toggle button needs a written reason in a toggle-button comment just above it (a dense toolbar). Showing, hiding or locking one thing in a list is not this: use VisibilityToggle, the named eye and padlock pattern, which needs no reason.',
      arrangement: 'row',
      code: `{/* toggle-button: a dense canvas toolbar, where a Switch would break the row of icon buttons */}\n<Button label="Snap to grid" icon="grid" iconOnly emphasis="quiet" size="s" pressed={snap} onClick={toggle} />`,
      render: () => <Toggles />,
    },
    {
      title: 'Goes somewhere',
      description:
        'href makes the button a link (a[href]) with the button’s look and focus ring, for the one destination that is the main call to action, such as a hero’s or a header’s. Enter follows it; the browser’s link menu and new-tab keys work. Everywhere else a destination is a Link. onClick runs as it’s followed (a router may call preventDefault). Unavailable keeps it focusable and stops it going.',
      arrangement: 'row',
      code: `<Button href="#/get-started" emphasis="primary" label="Get started" />
<Button href="#/colour" label="See the colours" icon="chevron-end" />
<Button href="#/link" label="Buy tickets" unavailable="Tickets go on sale in March" />`,
      render: () => (
        <>
          <Button href="#/get-started" emphasis="primary" label="Get started" />
          <Button href="#/colour" label="See the colours" icon="chevron-end" />
          <Button href="#/link" label="Buy tickets" unavailable="Tickets go on sale in March" />
        </>
      ),
    },
  ],
} satisfies StoryFile;
