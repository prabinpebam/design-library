import { useState } from 'react';
import { Checkbox, type CheckboxProps, type CheckboxSize } from '../fundamentals/Checkbox';
import { CheckboxGroup } from '../fundamentals/CheckboxGroup';
import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import type { StoryFile } from './story';

function Box({ initial = false, ...rest }: Omit<CheckboxProps, 'checked' | 'onChange'> & { initial?: boolean | 'mixed' }) {
  const [checked, setChecked] = useState<boolean | 'mixed'>(initial);
  return <Checkbox {...rest} checked={checked} onChange={setChecked} />;
}

/** A parent box over its children: checked when all are, mixed when some are; checking it sets them all. */
function SelectAll({ size }: { size?: CheckboxSize }) {
  const items = ['Tokens', 'Fundamentals', 'Compounds'];
  const [on, setOn] = useState([true, false, true]);
  const all = on.every(Boolean) ? true : on.some(Boolean) ? 'mixed' : false;
  return (
    <CheckboxGroup label="Export" hint="Choose what goes in the package.">
      <Checkbox size={size} label="Everything" checked={all} onChange={(next) => setOn(items.map(() => next))} />
      {items.map((item, n) => (
        <Checkbox key={item} size={size} label={item} checked={on[n]} onChange={(next) => setOn(on.map((v, i) => (i === n ? next : v)))} />
      ))}
    </CheckboxGroup>
  );
}

function Agreement() {
  const [on, setOn] = useState(false);
  return <Checkbox label="I agree to the licence terms" checked={on} onChange={setOn} error={on ? undefined : 'Agree to the licence terms to download.'} />;
}

const sizes: [CheckboxSize, string][] = [
  ['s', 's · 16 px box, 36 px row'],
  ['normal', 'normal · 20 px box, 44 px row (default)'],
  ['l', 'l · 24 px box, 48 px row'],
];

export default {
  component: 'Checkbox',
  tier: 'fundamental',
  summary: 'Selects an item, or agrees to something, as part of a choice another action applies.',
  stories: [
    {
      title: 'Sizes',
      description: 'Three sizes, as the major systems offer (Fluent, Spectrum and Carbon stop at two or three): s for dense lists and table rows, normal by default, l for touch-first forms. Each size shown unchecked, checked and mixed; the whole row is the target.',
      code: `<Checkbox size="s" label="Include archived" checked={on} onChange={setOn} />  // s, normal (default), l`,
      render: () => (
        <Stack gap="group">
          {sizes.map(([size, name]) => (
            <Grid key={size} max={3}>
              <Box size={size} label={`Unchecked · ${name}`} />
              <Box size={size} label="Checked" initial />
              <Box size={size} label="Mixed" initial="mixed" />
            </Grid>
          ))}
        </Stack>
      ),
    },
    {
      title: 'States',
      description: 'Unchecked, checked and mixed; hover and press tint an unchecked box, the focus ring sits on the box; unavailable (checked and unchecked keep their state, muted); invalid with what to do, cleared as soon as it’s fixed.',
      code: `<Checkbox label="I agree to the licence terms" checked={on} onChange={setOn}
  error={on ? undefined : 'Agree to the licence terms to download.'} />`,
      render: () => (
        <Grid max={2}>
          <Box label="Include archived revisions" />
          <Box label="Include resolved comments" initial />
          <Box label="Unavailable, unchecked" disabled />
          <Box label="Unavailable, checked" disabled initial />
          <Agreement />
        </Grid>
      ),
    },
    {
      title: 'With a description',
      description: 'A line under the label says what checking it means; the box lines up with the label’s first line however long the words run.',
      code: `<Checkbox label="Send a weekly digest" description="One email on Mondays with every open revision." … />`,
      render: () => (
        <Stack gap="item">
          <Box label="Send a weekly digest" description="One email on Mondays with every open revision." initial />
          <Box label="Include drafts" description="Drafts are only visible to you and the people you share them with. They join the digest once you publish." />
        </Stack>
      ),
    },
    {
      title: 'Group with a select-all parent',
      description: 'A CheckboxGroup names the set with a legend. The parent is checked when every child is, mixed when some are; checking it checks them all.',
      code: `<CheckboxGroup label="Export" hint="Choose what goes in the package.">
  <Checkbox label="Everything" checked={all ? true : some ? 'mixed' : false} onChange={setAll} />
  <Checkbox label="Tokens" checked={tokens} onChange={setTokens} /> …
</CheckboxGroup>`,
      render: () => <SelectAll />,
    },
    {
      title: 'Box only',
      description: 'Where its place already says what it selects, such as a block’s own corner, only the box shows. The label stays its accessible name.',
      code: `<Checkbox label="Select block: Primary" labelHidden checked={on} onChange={setOn} />`,
      render: () => (
        <>
          <Box label="Select block: Primary" labelHidden />
          <Box label="Select block: Secondary" labelHidden initial />
          <Box label="Select block: Tertiary" labelHidden initial="mixed" />
        </>
      ),
      arrangement: 'row',
    },
  ],
} satisfies StoryFile;