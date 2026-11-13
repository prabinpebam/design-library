import { useState } from 'react';
import { Dialog } from '../compounds/Dialog';
import { Button } from '../fundamentals/Button';
import { Heading } from '../fundamentals/Heading';
import { List } from '../fundamentals/List';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { TextField } from '../fundamentals/TextField';
import type { StoryFile } from './story';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Rename() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Spring launch');
  return (
    <>
      <Button label="Rename project" onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Rename the project"
        description="Everyone with access sees the new name."
        actions={
          <>
            <Button label="Cancel" onClick={() => setOpen(false)} />
            <Button label="Rename" emphasis="primary" pendingLabel="Renaming…" doneLabel="Renamed" onCommit={() => wait(900).then(() => setOpen(false))} />
          </>
        }
      >
        <TextField label="Project name" value={name} onCommit={setName} />
      </Dialog>
    </>
  );
}

/** Q65 C1: the form becomes its result (or its failure) in the same box; the box never closes and reopens. */
function Invite({ fails = false }: { fails?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'form' | 'done' | 'failed'>('form');
  const [email, setEmail] = useState('maya@example.com');
  const close = () => setOpen(false);
  const send = () =>
    wait(900).then(() => {
      setState(fails ? 'failed' : 'done');
    });
  const content = {
    form: {
      title: 'Invite someone',
      description: 'They get an email with a link to this project.',
      body: <TextField label="Email address" value={email} onCommit={setEmail} />,
      actions: (
        <>
          <Button label="Cancel" onClick={close} />
          <Button label="Send invite" emphasis="primary" pendingLabel="Sending…" doneLabel="Sent" onCommit={send} />
        </>
      ),
    },
    done: {
      title: 'Invite sent',
      description: `${email} can open the project as soon as they accept.`,
      body: undefined,
      actions: <Button label="Done" emphasis="primary" onClick={close} />,
    },
    failed: {
      title: 'Couldn’t send the invite',
      description: 'The mail service didn’t answer. The address is kept; try again in a moment.',
      body: undefined,
      actions: (
        <>
          <Button label="Cancel" onClick={close} />
          <Button label="Try again" emphasis="primary" onClick={() => setState('form')} />
        </>
      ),
    },
  }[state];
  return (
    <>
      <Button
        label={fails ? 'Invite (fails)' : 'Invite someone'}
        onClick={() => {
          setState('form');
          setOpen(true);
        }}
      />
      <Dialog open={open} onClose={close} state={state} title={content.title} description={content.description} actions={content.actions}>
        {content.body}
      </Dialog>
    </>
  );
}

function Delete() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Delete project" emphasis="danger" onClick={() => setOpen(true)} />
      <Dialog
        alert
        size="s"
        open={open}
        onClose={() => setOpen(false)}
        title="Delete “Spring launch” for everyone?"
        description="Its 48 files and their history go too. This can’t be undone."
        actions={
          <>
            <Button label="Keep project" onClick={() => setOpen(false)} />
            <Button label="Delete project" emphasis="danger" pendingLabel="Deleting…" doneLabel="Deleted" onCommit={() => wait(900).then(() => setOpen(false))} />
          </>
        }
      />
    </>
  );
}

const sections = [
  ['What you can share', 'Files, comments and the project’s history, with anyone in your organisation or with people you invite by email.'],
  ['What stays private', 'Drafts you haven’t shared, your personal notes and anything in your own space.'],
  ['Who can change things', 'Editors can change files and invite people; viewers can read and comment; only owners can delete the project.'],
  ['How long things are kept', 'Deleted files stay in the bin for 30 days, then they’re gone for good. Version history is kept for a year.'],
  ['Leaving a project', 'You can leave any project you don’t own. Your comments stay, with your name.'],
  ['Changes to these rules', 'We tell every owner a month before a rule changes, by email and in the app.'],
];

function Long({ lock = false }: { lock?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label={lock ? 'Read the rules, page held still' : 'Read the sharing rules'} onClick={() => setOpen(true)} />
      <Dialog
        size="l"
        open={open}
        lockScroll={lock}
        onClose={() => setOpen(false)}
        title="Sharing rules"
        description="How sharing works for every project in this organisation."
        actions={<Button label="Done" emphasis="primary" onClick={() => setOpen(false)} />}
      >
        <Stack gap="group">
          {[...sections, ...sections].map(([head, words], i) => (
            <Stack key={i} gap="pair">
              <Heading level={3} size={4}>
                {head}
              </Heading>
              <Text>{words}</Text>
            </Stack>
          ))}
        </Stack>
      </Dialog>
    </>
  );
}

const commands = ['Rename the project', 'Invite someone', 'Open the sharing rules', 'Show what’s new', 'Delete the project', 'Switch to the dark theme', 'Export as PDF', 'Open settings'];

/** LR54: a command palette, high in the window at a fixed size, its title the accessible name only. */
function Palette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const found = commands.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));
  const close = () => setOpen(false);
  return (
    <>
      <Button label="Find a command" icon="search" onClick={() => setOpen(true)} />
      <Dialog variant="palette" open={open} onClose={close} lockScroll title="Find a command">
        <ScrollArea inset="md" contain label="Commands">
          <Stack gap="group">
            <TextField label="Find" hideLabel mode="form" icon="search" size="l" placeholder="Type a command" value={query} onChange={setQuery} />
            <List mode="action" label="Commands" actions={found.map((c) => ({ id: c, label: c, onSelect: close }))} />
            {!found.length && <Text tone="muted">Nothing matches “{query}”.</Text>}
          </Stack>
        </ScrollArea>
      </Dialog>
    </>
  );
}

function Info() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Show what’s new" onClick={() => setOpen(true)} />
      <Dialog open={open} onClose={() => setOpen(false)} size="s" title="What’s new" description="Projects can now have their own colour, and search finds comments too." />
    </>
  );
}

export default {
  component: 'Dialog',
  tier: 'compound',
  summary: 'Blocks the page until a question is answered or a short task is done.',
  stories: [
    {
      title: 'A short form',
      description: 'Focus starts in the field. Native modality keeps the page inert; browser chrome is not a page-focus escape. Escape closes and returns to the opener. The header is not a banner landmark. Close keeps its small icon and minimum 44 CSS px target even with a scaled root font.',
      code: `<Dialog open={open} onClose={close} title="Rename the project" description="Everyone with access sees the new name." actions={<><Button label="Cancel" onClick={close} /><Button label="Rename" emphasis="primary" pendingLabel="Renaming…" doneLabel="Renamed" onCommit={rename} /></>}><TextField label="Project name" value={name} onCommit={setName} /></Dialog>`,
      render: () => <Rename />,
    },
    {
      title: 'Form becomes its result',
      description: 'Send the invite: the button shows it’s working, then the same box becomes the result (or the failure, on the right) without closing; the title, words and answers cross-fade and the box eases to its new height. Focus moves to the new title. With reduced motion the height changes at once.',
      arrangement: 'row',
      code: `<Dialog open={open} onClose={close} state={state} title={content.title} description={content.description} actions={content.actions}>{content.body}</Dialog>`,
      render: () => (
        <>
          <Invite />
          <Invite fails />
        </>
      ),
    },
    {
      title: 'Alert dialog',
      description: 'Only for answers that can’t be undone. It must be answered: no close button, Escape and a press outside do nothing, and focus starts on the safe answer.',
      code: `<Dialog alert size="s" open={open} onClose={close} title="Delete “Spring launch” for everyone?" description="Its 48 files and their history go too. This can’t be undone." actions={<><Button label="Keep project" onClick={close} /><Button label="Delete project" emphasis="danger" … /></>} />`,
      render: () => <Delete />,
    },
    {
      title: 'Long content',
      description: 'The body scrolls on its own, with its scrollbar at the dialog’s edge; the title and the answers stay where they are.',
      code: `<Dialog size="l" open={open} onClose={close} title="Sharing rules" actions={<Button label="Done" emphasis="primary" onClick={close} />}>…</Dialog>`,
      render: () => <Long />,
    },
    {
      title: 'Just a message',
      description: 'With no answers to give, the close button, Escape or a press outside close it. Prefer a notification when it doesn’t need to stop the page.',
      code: `<Dialog size="s" open={open} onClose={close} title="What’s new" description="…" />`,
      render: () => <Info />,
    },
    {
      title: 'The page held still',
      description: 'With lockScroll, scrolling past the end of the dialog’s content never moves the page behind it, and the page’s scrollbar room stays, so nothing shifts when it opens or closes. For a dialog that covers the page with its own scrolling content, such as a site search.',
      code: `<Dialog size="l" open={open} onClose={close} lockScroll title="Sharing rules" …>…</Dialog>`,
      render: () => <Long lock />,
    },
    {
      title: 'A palette',
      description: 'variant="palette": high in the window, 56 by 34 rem (smaller in a small window), so it holds still while the results change; no scrim, a hairline ring. The title names it for assistive technology but isn’t shown, and there’s no close button: Escape or a press outside closes it. The content fills the body and lays out its own parts; focus starts in the field.',
      code: `<Dialog variant="palette" open={open} onClose={close} lockScroll title="Find a command"><Stack gap="group">…<TextField label="Find" hideLabel … /><List mode="action" … /></Stack></Dialog>`,
      render: () => <Palette />,
    },
  ],
} satisfies StoryFile;
