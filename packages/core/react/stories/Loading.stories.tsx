import { useEffect, useRef, useState } from 'react';
import { useLoadIndicator } from '../behaviour/load';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Grid } from '../fundamentals/Grid';
import { Heading } from '../fundamentals/Heading';
import { Icon } from '../fundamentals/Icon';
import { Progress } from '../fundamentals/Progress';
import { SegmentedControl } from '../fundamentals/SegmentedControl';
import { Skeleton } from '../fundamentals/Skeleton';
import { Stack } from '../fundamentals/Stack';
import { Switch } from '../fundamentals/Switch';
import { Text } from '../fundamentals/Text';
import { TextField } from '../fundamentals/TextField';
import { Section } from '../compounds/Section';
import { Toolbar } from '../compounds/Toolbar';
import type { StoryFile } from './story';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type Outcome = 'instant' | 'second' | 'slow' | 'empty' | 'fails';
const outcomes = [
  { value: 'instant', label: 'Instant' },
  { value: 'second', label: '1 s' },
  { value: 'slow', label: '12 s' },
  { value: 'empty', label: 'Empty' },
  { value: 'fails', label: 'Fails' },
];
const outcomeMs: Record<Outcome, number> = { instant: 80, second: 1000, slow: 12000, empty: 900, fails: 1400 };

/** A pretend load: running while the data is on its way, then content, empty or failed. A newer run wins. */
function useDemoLoad() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'none' | 'content' | 'empty' | 'failed'>('none');
  const seq = useRef(0);
  const run = async (outcome: Outcome, keep = false, ms = outcomeMs[outcome]) => {
    const id = ++seq.current;
    if (!keep) setResult('none');
    setLoading(true);
    await wait(ms);
    if (id !== seq.current) return;
    setLoading(false);
    setResult(outcome === 'fails' ? 'failed' : outcome === 'empty' ? 'empty' : 'content');
  };
  const cancel = () => {
    seq.current++;
    setLoading(false);
    setResult('none');
  };
  return { loading, result, run, cancel };
}

const notes = [
  { title: 'Harbour walk', meta: '3 pictures · Tuesday' },
  { title: 'Market at dawn', meta: '12 pictures · Wednesday' },
  { title: 'Ferry to the island', meta: '5 pictures · Thursday' },
];

function NoteCard({ title, meta }: { title: string; meta: string }) {
  return (
    <Cluster gap="item" wrap={false}>
      <Icon name="comment" size="lg" />
      <Stack gap="pair">
        <Text as="span">{title}</Text>
        <Text as="span" variant="body-sm" tone="muted">
          {meta}
        </Text>
      </Stack>
    </Cluster>
  );
}

function NoteCardSkeleton() {
  return (
    <Cluster gap="item" wrap={false}>
      <Skeleton shape="circle" size="sm" />
      <Skeleton lines={2} />
    </Cluster>
  );
}

/** View: the header stays live; the content area waits, then swaps in complete, empty or failed. */
function ViewLoading() {
  const [outcome, setOutcome] = useState<Outcome>('second');
  const { loading, result, run, cancel } = useDemoLoad();
  const { shown, slow } = useLoadIndicator(loading);
  useEffect(() => {
    void run('second');
  }, []);
  const waiting = loading || shown;
  const status = waiting ? (shown ? 'Opening Field notes…' : '') : result === 'content' ? 'Field notes is open: 3 notes.' : result === 'empty' ? 'Field notes is open: no notes yet.' : result === 'failed' ? 'Field notes didn’t open.' : '';
  return (
    <Stack gap="group">
      <Toolbar start={<SegmentedControl size="xs" label="How the load ends" options={outcomes} value={outcome} onChange={(v) => setOutcome(v as Outcome)} />} align="center">
        <Button size="s" label="Open the view" onClick={() => void run(outcome)} />
      </Toolbar>
      <Section heading="Field notes" level={4} size={4} intro="The header and the actions above stay usable; only the content area waits.">
        <div aria-busy={waiting || undefined}>
          {shown ? (
            <Stack gap="group">
              <Grid max={3}>
                <NoteCardSkeleton />
                <NoteCardSkeleton />
                <NoteCardSkeleton />
              </Grid>
              {slow && (
                <Toolbar start={<Text variant="body-sm" tone="muted">Still opening Field notes. The server is slow today; you can keep waiting or stop.</Text>} align="center">
                  <Button size="s" label="Stop opening" onClick={cancel} />
                </Toolbar>
              )}
            </Stack>
          ) : loading ? null : result === 'content' ? (
            <Grid max={3}>
              {notes.map((n) => (
                <NoteCard key={n.title} {...n} />
              ))}
            </Grid>
          ) : result === 'empty' ? (
            <Stack gap="item">
              <Grid max={3}>
                <Skeleton shape="text" lines={2} still />
                <Skeleton shape="text" lines={2} still />
              </Grid>
              <Toolbar start={<Text>No notes yet. Notes you add on this trip show here.</Text>} align="center">
                <Button size="s" icon="plus" label="Add a note" onClick={() => undefined} />
              </Toolbar>
            </Stack>
          ) : result === 'failed' ? (
            <Toolbar start={<Text tone="danger">Field notes didn’t open: the server didn’t answer in time. Nothing was changed.</Text>} align="center">
              <Button size="s" label="Try again" onClick={() => void run(outcome === 'fails' ? 'second' : outcome)} />
            </Toolbar>
          ) : (
            <Text tone="muted">Stopped. Open the view to try again.</Text>
          )}
        </div>
        <div role="status">
          <Text variant="caption" tone="muted">
            {status}
          </Text>
        </div>
      </Section>
    </Stack>
  );
}

/** Section: each section swaps in when its own data is ready; a refresh keeps the old content and says it's updating. */
function SectionLoading() {
  const pictures = useDemoLoad();
  const route = useDemoLoad();
  const pictureIndicator = useLoadIndicator(pictures.loading);
  const routeIndicator = useLoadIndicator(route.loading);
  const [stops, setStops] = useState(4);
  useEffect(() => {
    void pictures.run('second');
    void route.run('second', false, 2400);
  }, []);
  const refresh = () => {
    void route.run('second', true, 1600).then(() => setStops((s) => s + 1));
  };
  const refreshing = route.result === 'content' && route.loading;
  return (
    <Grid max={2}>
      <Section heading="Pictures" level={4} size={4} nested>
        <div aria-busy={pictures.loading || pictureIndicator.shown || undefined}>
          {pictureIndicator.shown ? (
            <Stack gap="item">
              <Skeleton shape="block" />
              <Skeleton lines={1} />
            </Stack>
          ) : pictures.result === 'content' ? (
            <Stack gap="item">
              <Text>20 pictures from the harbour and the market.</Text>
              <Text variant="body-sm" tone="muted">
                Arrived on its own, before the route.
              </Text>
            </Stack>
          ) : null}
        </div>
      </Section>
      <Section heading="Route" level={4} size={4} nested>
        <Stack gap="item">
          <div aria-busy={route.loading || routeIndicator.shown || undefined}>
            {routeIndicator.shown && !refreshing && route.result !== 'content' ? (
              <Skeleton lines={3} />
            ) : route.result === 'content' ? (
              <Stack gap="pair">
                <Text>{stops} stops, 11 km on foot.</Text>
                <Text variant="body-sm" tone="muted">
                  Harbour · Market · Old town{stops > 4 ? ` · ${stops - 3} more` : ' · Ferry'}
                </Text>
              </Stack>
            ) : null}
          </div>
          <Toolbar
            align="center"
            start={
              refreshing && routeIndicator.shown ? (
                <Cluster gap="pair" wrap={false}>
                  <Progress />
                  <Text as="span" variant="body-sm" tone="muted">
                    Updating the route…
                  </Text>
                </Cluster>
              ) : (
                <Text as="span" variant="body-sm" tone="muted">
                  {route.result === 'content' ? 'Up to date.' : ''}
                </Text>
              )
            }
          >
            <Button size="s" label="Refresh the route" onClick={refresh} />
          </Toolbar>
        </Stack>
      </Section>
    </Grid>
  );
}

const steps = ['Saving open changes', 'Closing Spring trip', 'Reading Field notes: 118 notes', 'Building the search index'];

/** App: the ground under everything changes, so everything waits, with a written reason, steps, a percentage and Cancel. */
function AppLoading() {
  const [step, setStep] = useState<number | null>(null);
  const [workspace, setWorkspace] = useState('Spring trip');
  const seq = useRef(0);
  const switchTo = async () => {
    const id = ++seq.current;
    for (let i = 0; i < steps.length; i++) {
      if (id !== seq.current) return;
      setStep(i);
      await wait(900);
    }
    if (id !== seq.current) return;
    setStep(null);
    setWorkspace((w) => (w === 'Spring trip' ? 'Field notes' : 'Spring trip'));
  };
  const next = workspace === 'Spring trip' ? 'Field notes' : 'Spring trip';
  const cancel = () => {
    seq.current++;
    setStep(null);
  };
  if (step !== null) {
    const share = Math.round((step / steps.length) * 100);
    return (
      <Stack gap="group">
        <div role="status">
          <Heading level={4} size={3}>
            Switching to {next}
          </Heading>
        </div>
        <Stack gap="pair">
          <Progress form="bar" value={share} label={`Switching to ${next}`} />
          <Text variant="body-sm" tone="muted">
            {steps[step]} · step {step + 1} of {steps.length} · {share}%
          </Text>
        </Stack>
        <Cluster gap="item">
          <Button size="s" label="Cancel" onClick={cancel} />
        </Cluster>
      </Stack>
    );
  }
  return (
    <Toolbar align="center" start={<Text>{workspace} is open.</Text>}>
      <Button label={`Switch to ${next}`} onClick={() => void switchTo()} />
    </Toolbar>
  );
}

/** Component: a control shows its own work, in its own box; nothing else is locked. */
function ComponentLoading() {
  const [on, setOn] = useState(false);
  const save = () => wait(1500);
  return (
    <Stack gap="group">
      <Cluster gap="item">
        <Button emphasis="primary" icon="check" label="Save the trip" pendingLabel="Saving…" doneLabel="Saved" onCommit={save} />
        <Button icon="copy" label="Copy the route" pendingLabel="Copying…" doneLabel="Copied" progress="ring" onCommit={save} />
        <Button icon="plus" iconOnly label="Add a stop" pendingLabel="Adding a stop" doneLabel="Stop added" progress="ring" onCommit={save} />
      </Cluster>
      <Switch label="Share the route with the group" checked={on} onChange={(next) => save().then(() => setOn(next))} />
    </Stack>
  );
}

/** A long operation at component scope: the button is busy, the bar and step line sit under it, Cancel beside it. */
function OperationLoading() {
  const total = 118;
  const [done, setDone] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const seq = useRef(0);
  const start = async () => {
    const id = ++seq.current;
    setFinished(false);
    for (let n = 0; n <= total; n += 7) {
      if (id !== seq.current) return;
      setDone(n);
      await wait(160);
    }
    if (id !== seq.current) return;
    setDone(null);
    setFinished(true);
  };
  const running = done !== null;
  const share = running ? Math.round((done / total) * 100) : 0;
  const step = !running ? '' : done < 40 ? 'Reading pictures' : done < 100 ? 'Packing pictures' : 'Writing the archive';
  return (
    <Stack gap="item">
      <Cluster gap="item">
        <Button icon="external" label="Export 118 pictures" pendingLabel="Exporting…" busy={running} onClick={() => void start()} />
        {running && <Button label="Cancel" onClick={() => { seq.current++; setDone(null); }} />}
      </Cluster>
      {running && (
        <Stack gap="pair">
          <Progress form="bar" value={share} label="Exporting pictures" />
          <Text variant="body-sm" tone="muted">
            {step} · {done} of {total} · {share}%
          </Text>
        </Stack>
      )}
      <div role="status">
        <Text variant="caption" tone="muted">
          {finished ? 'Exported 118 pictures to Downloads.' : ''}
        </Text>
      </div>
    </Stack>
  );
}

/** Inline: a short check beside the thing it checks, after the 300 ms delay, then its answer in words. */
function InlineLoading() {
  const [checking, setChecking] = useState(false);
  const [answered, setAnswered] = useState(false);
  const { shown } = useLoadIndicator(checking);
  const [code, setCode] = useState('SPR-24');
  const check = async () => {
    setAnswered(false);
    setChecking(true);
    await wait(1100);
    setChecking(false);
    setAnswered(true);
  };
  return (
    <Stack gap="item">
      <TextField label="Short code" value={code} hint="Leave the field to save it; the field shows its own saving." onCommit={(next) => wait(1200).then(() => setCode(next))} />
      <Toolbar
        align="center"
        start={
          <div role="status">
            {shown || checking ? (
              shown && (
                <Cluster gap="pair" wrap={false}>
                  <Progress />
                  <Text as="span" variant="body-sm" tone="muted">
                    Checking whether {code} is free…
                  </Text>
                </Cluster>
              )
            ) : answered ? (
              <Cluster gap="pair" wrap={false}>
                <Icon name="success" size="sm" />
                <Text as="span" variant="body-sm" tone="success">
                  {code} is free.
                </Text>
              </Cluster>
            ) : null}
          </div>
        }
      >
        <Button size="s" label="Check the code" onClick={() => void check()} />
      </Toolbar>
    </Stack>
  );
}

export default {
  component: 'Loading',
  tier: 'fundamental',
  summary: 'One loading framework at five scopes: app, view, section, component and inline.',
  stories: [
    {
      title: 'App: the ground changes',
      description: 'Press Switch. Everything waits only because an edit made now would land in the wrong workspace: the written reason app-level blocking needs. Steps, a real percentage and Cancel.',
      code: `<Progress form="bar" value={share} label="Switching to Field notes" />
<Text variant="body-sm" tone="muted">{step} · step 2 of 4 · 50%</Text>
<Button size="s" label="Cancel" onClick={cancel} />`,
      render: () => <AppLoading />,
    },
    {
      title: 'View: opening a view',
      description: 'Choose how the load ends, then open the view. Instant draws the content directly; past 300 ms a skeleton in the real layout shimmers three times, then holds still; it stays at least 500 ms. Empty and failed fill the same area.',
      code: `const { shown, slow } = useLoadIndicator(loading);
<div aria-busy={loading || shown}>
  {shown ? <Grid max={3}><NoteCardSkeleton />…</Grid> : <Grid max={3}>{cards}</Grid>}
</div>`,
      render: () => <ViewLoading />,
    },
    {
      title: 'Section: one at a time, and refresh',
      description: 'Each section swaps in, complete, when its own data is ready. Refresh the route: the old route stays, and only past 300 ms does it say it’s updating.',
      code: `{refreshing && shown && (
  <Cluster gap="pair"><Progress /><Text variant="body-sm" tone="muted">Updating the route…</Text></Cluster>
)}`,
      render: () => <SectionLoading />,
    },
    {
      title: 'Component: the control shows its own',
      description: 'Press each one. A spinner in place of the icon, or an arc around the border when the content must stay; the switch’s knob edge turns. Nothing around them locks.',
      code: `<Button label="Save the trip" pendingLabel="Saving…" doneLabel="Saved" onCommit={save} />
<Button label="Copy the route" progress="ring" pendingLabel="Copying…" doneLabel="Copied" onCommit={save} />
<Switch label="Share the route with the group" checked={on} onChange={save} />`,
      render: () => <ComponentLoading />,
    },
    {
      title: 'Component: a long operation',
      description: 'Press Export. The button stays busy, a bar with the real count sits under it, the step line is subtle and Cancel is beside it. The end is said once.',
      code: `<Button label="Export 118 pictures" pendingLabel="Exporting…" busy={running} onClick={start} />
<Progress form="bar" value={share} label="Exporting pictures" />
<Text variant="body-sm" tone="muted">Packing pictures · 42 of 118 · 36%</Text>`,
      render: () => <OperationLoading />,
    },
    {
      title: 'Inline: a field and a short check',
      description: 'Change the code and leave the field: the field shows its own saving. Check the code: past 300 ms a small arc and the words name the check, then the answer replaces them.',
      code: `<TextField label="Short code" value={code} onCommit={save} />
{shown && <Cluster gap="pair"><Progress /><Text variant="body-sm" tone="muted">Checking whether SPR-24 is free…</Text></Cluster>}`,
      render: () => <InlineLoading />,
    },
  ],
} satisfies StoryFile;
