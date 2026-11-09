import { useState } from 'react';
import { Checkbox } from '../fundamentals/Checkbox';
import { CheckboxGroup } from '../fundamentals/CheckboxGroup';
import type { StoryFile } from './story';

const channels = ['Email', 'In the app', 'Chat'];

function Channels({ required = false, optional = false }: { required?: boolean; optional?: boolean }) {
  const [on, setOn] = useState([false, true, false]);
  const none = !on.some(Boolean);
  return (
    <CheckboxGroup label="Notify me about new comments by" optional={optional} hint="Choose any." error={required && none ? 'Choose at least one way to be notified.' : undefined}>
      {channels.map((c, n) => (
        <Checkbox key={c} label={c} checked={on[n]} onChange={(next) => setOn(on.map((v, i) => (i === n ? next : v)))} />
      ))}
    </CheckboxGroup>
  );
}

export default {
  component: 'CheckboxGroup',
  tier: 'fundamental',
  summary: 'Several related checkboxes named together by a legend.',
  stories: [
    {
      title: 'A named set',
      description: 'The legend names the set, so each box is read with it; a hint under the legend says how many to pick. Rows touch, each its own target.',
      code: `<CheckboxGroup label="Notify me about new comments by" hint="Choose any.">
  <Checkbox label="Email" checked={email} onChange={setEmail} /> …
</CheckboxGroup>`,
      render: () => <Channels />,
    },
    {
      title: 'Invalid set',
      description: 'One error for the whole set, under its last box, cleared as soon as one is checked. Uncheck “In the app” to see it.',
      code: `<CheckboxGroup label="…" error={none ? 'Choose at least one way to be notified.' : undefined}>…</CheckboxGroup>`,
      render: () => <Channels required />,
    },
    {
      title: 'Optional set',
      description: 'Sets are required by default, so only optional ones are marked.',
      code: `<CheckboxGroup label="…" optional>…</CheckboxGroup>`,
      render: () => <Channels optional />,
    },
  ],
} satisfies StoryFile;