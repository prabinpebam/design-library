import { useState } from 'react';
import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import { Switch, type SwitchProps, type SwitchSize } from '../fundamentals/Switch';
import type { StoryFile } from './story';
import { WithSettings } from './WithSettings';

const pillEnds = { '--c-switch-radius': 'var(--radius-pill)' };

/** A setting backed by a save that takes `ms` and either stores the value or fails. */
function Setting({ label, initial = false, ms = 400, fails = false, ...rest }: { label: string; initial?: boolean; ms?: number; fails?: boolean } & Pick<SwitchProps, 'size' | 'description' | 'labelPosition' | 'disabled' | 'hideLabel'>) {
  const [stored, setStored] = useState(initial);
  const save = (next: boolean) =>
    new Promise<void>((resolve, reject) =>
      setTimeout(() => {
        if (fails) return reject(new Error('refused'));
        setStored(next);
        resolve();
      }, ms),
    );
  return <Switch {...rest} label={label} checked={stored} onChange={save} />;
}

const sizes: [SwitchSize, string][] = [
  ['xs', 'xs · 32 × 16 track, 24 px row'],
  ['s', 's · 32 × 20 track, 36 px row'],
  ['normal', 'normal · 40 × 24, 44 px (default)'],
  ['l', 'l · 56 × 32, 48 px'],
];

export default {
  component: 'Switch',
  tier: 'fundamental',
  summary: 'A binary setting that takes effect at once, at three sizes.',
  stories: [
    {
      title: 'Sizes',
      description: 'Four sizes, as Fluent, Spectrum and Carbon offer: xs for a dense panel’s row (a design tool’s inspector, the written dense-surface exception), s for dense settings lists, normal by default, l for touch-first settings. The knob keeps the same inset at each; the whole row is the target (24, 36, 44 and 48 px). In an inspector an xs switch can hide its label (hideLabel) where the row already names it, as a panel row’s “Snap to pixel grid” beside its heading; the label still names it. Showing or hiding an item is not a Switch: use VisibilityToggle (the eye).',
      code: `<Switch size="s" label="Email updates" checked={on} onChange={save} />  // xs, s, normal (default), l`,
      render: () => (
        <Stack gap="group">
          {sizes.map(([size, name]) => (
            <Grid key={size} max={3}>
              <Setting size={size} label={`Off · ${name}`} />
              <Setting size={size} label="On" initial />
              <Setting size={size} label="Unavailable, on" initial disabled />
            </Grid>
          ))}
        </Stack>
      ),
    },
    {
      title: 'With a description, label first',
      description: 'A line under the label says what turning it on does; the track lines up with the label’s first line. With the label first, the row fills its container and the track sits at the end, as in a settings list.',
      code: `<Switch labelPosition="start" label="Weekly summary" description="One email on Mondays with every open revision." … />`,
      render: () => (
        <>
          <Setting labelPosition="start" label="Weekly summary" description="One email on Mondays with every open revision." initial />
          <Setting labelPosition="start" label="Show line numbers" description="In every code block in the library." />
          <Setting label="Reduce motion" description="Pages change without fading; spinners still turn." />
        </>
      ),
    },    {
      title: 'Off and on',
      description: 'The label names the setting, never its state. The whole row is the target.',
      code: `<Switch label="Email updates" checked={false} onChange={save} />
<Switch label="More contrast" checked onChange={save} />`,
      render: () => (
        <>
          <Setting label="Email updates" />
          <Setting label="More contrast" initial />
        </>
      ),
    },
    {
      title: 'Motion',
      description: 'Toggle each. The knob slides over 200 ms while the track’s fill and edge fade over the same; nothing jumps. On the right, reduced motion: the knob snaps to its side and the colours still fade.',
      code: `<Switch label="Weekly summary" checked={on} onChange={save} />
<Stack data-motion="reduce"><Switch label="Weekly summary, reduced motion" … /></Stack>`,
      render: () => (
        <Grid max={2}>
          <Setting label="Weekly summary" ms={0} />
          <Stack data-motion="reduce">
            <Setting label="Weekly summary, reduced motion" ms={0} />
          </Stack>
        </Grid>
      ),
    },
    {
      title: 'Saving',
      description: 'Toggle each one. The knob moves to the new side and its own edge turns as the spinner until the save lands; focus stays. The instant save still holds the beat.',
      code: `<Switch label="Weekly summary" checked={false} onChange={slowSave} />
<Switch label="Show line numbers" checked={false} onChange={instantSave} />`,
      render: () => (
        <>
          <Setting label="Weekly summary" ms={1500} />
          <Setting label="Show line numbers" ms={0} />
        </>
      ),
    },
    {
      title: 'Failed save',
      description: 'Toggle it. The stored value comes back with what happened and Retry, linked to the switch.',
      code: `<Switch label="Sync over mobile data" checked={false} onChange={saveThatFails} />`,
      render: () => <Setting label="Sync over mobile data" fails ms={700} />,
    },
    {
      title: 'Unavailable',
      description: 'Disabled only when the setting can’t change here; say why nearby. Off stays a quiet outline; on keeps its accent fill and knob, faded, so it still reads as on.',
      code: `<Switch label="Location history" checked={false} disabled onChange={save} />
<Switch label="Backups" checked disabled onChange={save} />`,
      render: () => (
        <>
          <Switch label="Location history" checked={false} disabled onChange={() => undefined} />
          <Switch label="Backups" checked disabled onChange={() => undefined} />
        </>
      ),
    },
    {
      title: 'Pill ends from the theme',
      description: 'The track and thumb are round at every shape by default. A theme whose pill ends follow its corners sets --c-switch-radius to var(--radius-pill) (a theme setting): here, inside a sharp shape, the switch turns square with the rest of the controls.',
      code: `applySettings({ '--c-switch-radius': 'var(--radius-pill)' });

<div data-shape="sharp"><Switch label="Wi-Fi" checked onChange={save} /></div>`,
      render: () => (
        <div data-shape="sharp">
          <WithSettings settings={pillEnds}>
            <Stack gap="item">
              <Switch label="Wi-Fi" checked onChange={() => undefined} />
              <Switch label="Bluetooth" checked={false} onChange={() => undefined} />
            </Stack>
          </WithSettings>
        </div>
      ),
    },
  ],
} satisfies StoryFile;
