import { useRef, useState } from 'react';
import type { ButtonSize } from '../fundamentals/Button';
import { Grid } from '../fundamentals/Grid';
import { Select, type SelectOption, type SelectProps } from '../fundamentals/Select';
import { Stack } from '../fundamentals/Stack';
import type { StoryFile } from './story';

/** A select backed by a save that takes `ms` (0: applies at once) and either stores the choice or fails. */
function Picker({ initial = '', ms = 0, fails = false, ...rest }: Omit<Extract<SelectProps, { value: string }>, 'value' | 'onChange' | 'multiple'> & { initial?: string; ms?: number; fails?: boolean }) {
  const [value, setValue] = useState(initial);
  const onChange = (next: string) =>
    ms === 0
      ? setValue(next)
      : new Promise<void>((resolve, reject) =>
          setTimeout(() => {
            if (fails) return reject(new Error('refused'));
            setValue(next);
            resolve();
          }, ms),
        );
  return <Select {...rest} value={value} onChange={onChange} />;
}

/** The same for several choices. */
function Several({ initial = [], ms = 0, fails = false, ...rest }: Omit<Extract<SelectProps, { multiple: true }>, 'value' | 'onChange' | 'multiple'> & { initial?: string[]; ms?: number; fails?: boolean }) {
  const [value, setValue] = useState(initial);
  const onChange = (next: string[]) =>
    ms === 0
      ? setValue(next)
      : new Promise<void>((resolve, reject) =>
          setTimeout(() => {
            if (fails) return reject(new Error('refused'));
            setValue(next);
            resolve();
          }, ms),
        );
  return <Select {...rest} multiple value={value} onChange={onChange} />;
}

const labels = ['Accessibility', 'Bug', 'Copy', 'Design', 'Documentation', 'Performance', 'Security', 'Tokens'].map((l) => ({ value: l.toLowerCase(), label: l }));

const directory = ['Aiko Tanaka', 'Bram de Vries', 'Chidi Okeke', 'Dana Levi', 'Elif Kaya', 'Farah Haddad', 'Gabriel Silva', 'Hana Novak', 'Ines Moreau', 'Jonas Berg', 'Kavya Rao', 'Liam Walsh', 'Mira Okafor', 'Noah Fischer'];

/** Options from a "server": each search waits 600 ms, showing loading in the list. */
function PeopleSearch() {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onSearch = (q: string) => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      setOptions(directory.filter((n) => n.toLowerCase().includes(q)).map((n) => ({ value: n, label: n })));
      setLoading(false);
    }, 600);
  };
  const shown = options.some((o) => o.value === value) || !value ? options : [{ value, label: value }, ...options];
  return <Select search label="Assignee" placeholder="Choose a person" hint="Searches the company directory." value={value} options={shown} loading={loading} onSearch={onSearch} onChange={setValue} />;
}

const zones: SelectOption[] = [
  ['Auckland', 'Pacific'], ['Sydney', 'Pacific'], ['Tokyo', 'Asia'], ['Singapore', 'Asia'], ['Kolkata', 'Asia'], ['Dubai', 'Asia'],
  ['Nairobi', 'Africa'], ['Cairo', 'Africa'], ['Lagos', 'Africa'], ['Berlin', 'Europe'], ['London', 'Europe'], ['Lisbon', 'Europe'],
  ['São Paulo', 'Americas'], ['New York', 'Americas'], ['Chicago', 'Americas'], ['Denver', 'Americas'], ['Los Angeles', 'Americas'], ['Honolulu', 'Pacific'],
].sort((a, b) => a[1]!.localeCompare(b[1]!)).map(([city, group]) => ({ value: city!.toLowerCase(), label: city!, group }));

const revisions = [
  { value: 'button', label: 'Button copy review' },
  { value: 'colour', label: 'Colour roles in dark' },
  { value: 'spacing', label: 'Spacing on component pages' },
];

const modes = [
  { value: 'read', label: 'Read only', description: 'Comments are hidden.' },
  { value: 'comment', label: 'Comment', description: 'Pick any element and comment on it.' },
  { value: 'review', label: 'Review', description: 'Comment, then archive when addressed.' },
];

const countries = ['Argentina', 'Australia', 'Brazil', 'Canada', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'India', 'Japan', 'Kenya', 'Mexico', 'Norway', 'Portugal', 'Spain'].map((c) => ({ value: c.toLowerCase(), label: c }));

const regions: SelectOption[] = [
  { value: 'mumbai', label: 'Mumbai', group: 'Asia Pacific' },
  { value: 'singapore', label: 'Singapore', group: 'Asia Pacific' },
  { value: 'tokyo', label: 'Tokyo', group: 'Asia Pacific', disabled: true, description: 'Full until December. Choose Singapore for now.' },
  { value: 'frankfurt', label: 'Frankfurt', group: 'Europe' },
  { value: 'dublin', label: 'Dublin', group: 'Europe' },
  { value: 'virginia', label: 'Virginia', group: 'Americas' },
  { value: 'sao-paulo', label: 'São Paulo', group: 'Americas', disabled: true, description: 'Not open to new projects.' },
];

const sizes: [ButtonSize, string][] = [
  ['xs', 'xs · 24 px'],
  ['s', 's · 36 px'],
  ['normal', 'normal · 44 px (default)'],
  ['m', 'm · 48 px'],
  ['l', 'l · 56 px'],
  ['xl', 'xl · 64 px'],
  ['xxl', 'xxl · 80 px'],
];

function AppliedYear() {
  const [year, setYear] = useState('2024');
  const years = [{ value: 'all', label: 'All years' }, { value: '2025', label: '2025' }, { value: '2024', label: '2024' }];
  return <Select mode="form" label="Year" options={years} value={year} onChange={setYear} applied={year !== 'all'} />;
}

export default {
  component: 'Select',
  tier: 'fundamental',
  summary: 'One choice from a list too long, or too changeable, to show side by side.',
  stories: [
    {
      title: 'Sizes',
      description: 'Seven box heights on the Button and text field scale, so a select sits level with the fields and buttons beside it. The label, hint and the list keep their size; xs and s are dense surfaces only.',
      code: `<Select size="xs" label="Comments" icon="comment" value={mode} options={modes} onChange={setMode} />  // xs, s, normal (default), m, l, xl, xxl`,
      render: () => (
        <Stack gap="group">
          {sizes.map(([size, name]) => (
            <Grid key={size} max={2}>
              <Picker size={size} label={`Country · ${name}`} options={countries} initial="india" />
              <Picker size={size} label={`Comments · ${name}`} icon="comment" placeholder="Choose who sees comments" options={modes} />
            </Grid>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Long list, overlay scrollbar',
      description: 'Sixteen options in a list that holds about six. Scroll or hover the list: the same thin bar as every scroll region appears over its end edge and fades after scrolling; the list keeps its width and inset either way. Typing a letter jumps and scrolls the option into view.',
      code: `<Select label="Country" value={country} options={countries} onChange={setCountry} />`,
      render: () => <Picker label="Country" options={countries} initial="india" />,
    },
    {
      title: 'Placeholder, groups and unavailable options',
      description: 'Nothing chosen yet shows the placeholder, muted, in the label’s words. Options sit under group headings (no dividers); an unavailable option stays in the list, muted, with the reason as its description, and the arrow keys and letters skip it.',
      code: `<Select label="Region" placeholder="Choose a region" value="" options={[
  { value: 'mumbai', label: 'Mumbai', group: 'Asia Pacific' },
  { value: 'tokyo', label: 'Tokyo', group: 'Asia Pacific', disabled: true, description: 'Full until December. Choose Singapore for now.' }, …]} />`,
      render: () => <Picker label="Region" placeholder="Choose a region" hint="Where the project’s data is stored." options={regions} />,
    },
    {
      title: 'Choice from a list',
      description: 'The library’s own list opens under the field, made of the same list items as menus, with the chosen option checked. Arrow keys, Home, End and a letter move; Enter chooses; Escape closes. The choice applies at once.',
      code: `<Select label="Current revision" value={current} onChange={setCurrent}
  options={[{ value: 'button', label: 'Button copy review' }, …]} />`,
      render: () => <Picker label="Current revision" options={revisions} initial="button" />,
    },
    {
      title: 'Type to search (combobox)',
      description: 'With search, the box is a text input: typing opens the list and keeps the options whose name contains what’s typed, with the first match highlighted, so Enter chooses it. Groups with no match drop out; nothing matching says so. Only listed options can be chosen; leaving puts the choice back. Works with multiple too: Enter toggles, the list stays open. Options from a server: onSearch hears what’s typed; the list says “Loading options…” until the results arrive (Assignee waits 600 ms).',
      code: `<Select search label="Country" placeholder="Choose a country" value={country} options={countries} onChange={setCountry} />
<Select search multiple label="Regions" value={regions} options={allRegions} onChange={(next) => api.save(next)} />`,
      render: () => (
        <Grid max={2}>
          <Picker search label="Country" placeholder="Choose a country" hint="Type part of the name." options={countries} initial="india" />
          <Several search label="Regions" placeholder="Choose regions" options={regions} initial={['mumbai']} />
          <Picker search label="Time zone" icon="search" placeholder="Choose a time zone" noMatchText={(q) => `No time zone called “${q}”. Try a city.`} options={zones} />
          <PeopleSearch />
        </Grid>
      ),
    },
    {
      title: 'Several choices',
      description: 'With multiple, each option has a box, and choosing keeps the list open so several can be chosen in one go. The box names up to two choices, then how many more. The choices apply once, when the list closes (Escape, Tab, a click outside or the box), so a save runs once, not per option. Space toggles; Shift+Arrow moves and chooses; Shift+Space chooses a run; Ctrl+A chooses all or none.',
      code: `<Select multiple label="Labels" placeholder="Choose labels" value={labels} options={allLabels}
  onChange={(next) => api.save({ labels: next })} />  // next: string[]`,
      render: () => (
        <Grid max={2}>
          <Several label="Labels" placeholder="Choose labels" hint="Filters the issue list." options={labels} initial={['bug', 'design']} />
          <Several label="Regions" placeholder="Choose regions" options={regions} initial={['mumbai', 'frankfurt', 'dublin', 'virginia']} />
          <Several label="Reviewers" optional placeholder="Choose reviewers" options={revisions} />
          <Several label="Notify" icon="comment" error="Choose at least one way to be told." placeholder="Choose how" options={[{ value: 'email', label: 'Email' }, { value: 'push', label: 'Push notification' }, { value: 'text', label: 'Text message' }]} />
        </Grid>
      ),
    },
    {
      title: 'Several choices: saving and failing',
      description: 'The same commit states as one choice, once per closing: saving, then a tick and “Saved”; a refused save brings the stored choices back with what was tried, Retry and Dismiss.',
      code: `<Select multiple label="Watchers" value={watchers} options={people} onChange={(next) => api.save(next)} />`,
      render: () => (
        <Grid max={2}>
          <Several label="Watchers" ms={900} options={revisions} initial={['button']} />
          <Several label="Watchers" ms={700} fails options={revisions} initial={['button']} />
        </Grid>
      ),
    },
    {
      title: 'States',
      description: 'Rest with a hint; optional (only optional choices are marked); invalid with what to do; read-only (focusable and read, no chevron, doesn’t open); unavailable (the hint says why). Hover, press and the focus ring show on the live fields.',
      code: `<Select label="Review mode" error="Choose a mode before you start a revision." … />
<Select label="Plan" readOnly … />  <Select label="Current revision" disabled hint="…" … />`,
      render: () => (
        <Grid max={2}>
          <Picker label="Current revision" hint="New comments go to this revision." options={revisions} initial="colour" />
          <Picker label="Second reviewer" optional placeholder="Choose a reviewer" options={revisions} />
          <Picker label="Review mode" name="mode" error="Choose a mode before you start a revision." placeholder="Choose a mode" options={modes} />
          <Picker label="Plan" readOnly hint="Your organisation’s admin sets the plan." options={[{ value: 'team', label: 'Team' }]} initial="team" />
          <Picker label="Current revision" disabled hint="Saving is off in this static build." options={revisions} initial="spacing" />
          <Picker label="Review mode" options={modes} initial="comment" />
        </Grid>
      ),
    },
    {
      title: 'Saving the choice',
      description: 'When the choice is stored somewhere, the box takes the commit colour with a spinner while it saves (at least 200 ms, focus stays, it won’t open), then a tick for the beat and “Saved” said politely. Pick another option to watch it.',
      code: `<Select label="Default branch" value={branch} options={branches}
  onChange={(next) => api.save({ branch: next })} />  // return the promise`,
      render: () => <Picker label="Default branch" ms={900} options={revisions} initial="button" />,
    },
    {
      title: 'Failed save',
      description: 'The save is refused: the stored choice comes back, the field is marked, and the message says what was tried and what’s kept, with Retry and Dismiss. Pick another option to see it.',
      code: `<Select label="Default branch" onChange={(next) => api.save(next)} failedText="…" />  // reject the promise`,
      render: () => <Picker label="Default branch" ms={700} fails options={revisions} initial="button" />,
    },
    {
      title: 'Loading and empty lists',
      description: 'Options still arriving: a spinner in the box, and “Loading options…” in the list if it’s opened. No options: the list says why and what to do instead of opening blank.',
      code: `<Select label="Assignee" loading options={[]} … />
<Select label="Milestone" options={[]} emptyText="No milestones yet. Add one in Planning." … />`,
      render: () => (
        <Grid max={2}>
          <Picker label="Assignee" loading placeholder="Choose a person" options={[]} />
          <Picker label="Milestone" placeholder="Choose a milestone" emptyText="No milestones yet. Add one in Planning." options={[]} />
        </Grid>
      ),
    },
    {
      title: 'An applied filter',
      description: 'A choice that narrows a list is applied while it differs from its default: the accent fill and outline (c.applied), and its value says which. Pair it with a way to clear it.',
      code: `<Select mode="form" label="Year" options={years} value={year} onChange={setYear} applied={year !== 'all'} />`,
      render: () => <AppliedYear />,
    },
    {
      title: 'As wide as its content',
      description: 'At the end of a heading row or in a toolbar, `width="content"` makes the field as wide as its label and chosen value instead of taking the row, so it sits beside the heading rather than under it. Never wider than its row.',
      code: `<Cluster justify="between" align="center">
  <Heading level={2} size={4}>Pictures and videos</Heading>
  <Select mode="form" width="content" size="s" hideLabel label="Order" options={orders} value={order} onChange={setOrder} />
</Cluster>`,
      render: () => <Picker label="Order" hideLabel size="s" width="content" options={[{ value: 'oldest', label: 'Oldest first' }, { value: 'newest', label: 'Newest first' }, { value: 'own', label: 'Your order' }]} initial="oldest" />,
    },
    {
      title: 'The chosen option’s icon',
      description: 'With chosenIcon the chosen option’s icon leads the box, so the closed box shows what the list shows, such as a platform’s mark beside its name.',
      code: `<Select chosenIcon label="Video source" options={[{ value: 'youtube', label: 'YouTube', icon: 'youtube' }, { value: 'vimeo', label: 'Vimeo', icon: 'vimeo' }]} value={source} onChange={setSource} />`,
      render: () => (
        <Picker
          chosenIcon
          label="Video source"
          options={[
            { value: 'youtube', label: 'YouTube', icon: 'youtube' },
            { value: 'vimeo', label: 'Vimeo', icon: 'vimeo' },
          ]}
          initial="youtube"
        />
      ),
    },
  ],
} satisfies StoryFile;