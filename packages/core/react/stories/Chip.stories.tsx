import { useState } from 'react';
import { Chip } from '../fundamentals/Chip';
import { Cluster } from '../fundamentals/Cluster';
import type { StoryFile } from './story';

function Filter() {
  const [on, setOn] = useState(true);
  return <Chip kind="filter" label="Has comments" selected={on} onChange={setOn} />;
}

export default {
  component: 'Chip',
  tier: 'fundamental',
  summary: 'A value someone picked and can remove, or a filter they turn on or off.',
  stories: [
    {
      title: 'Input chips',
      description: 'Values someone picked. With a Remove button (named “Remove” plus the label; Delete or Backspace does the same), read-only without one. A person’s chip leads with their initials.',
      code: `<Chip label="Asha Rao" avatar={{ name: 'Asha Rao' }} onRemove={remove} />
<Chip label="design-tokens" icon="copy" />`,
      render: () => (
        <Cluster>
          <Chip label="Asha Rao" avatar={{ name: 'Asha Rao' }} onRemove={() => undefined} />
          <Chip label="Accessibility" onRemove={() => undefined} />
          <Chip label="design-tokens" icon="copy" />
        </Cluster>
      ),
    },
    {
      title: 'Filter chip',
      description: 'Turned on or off; when on it shows a check and the accent tint. A checkbox to assistive technology, so the Switch stays the control for settings.',
      code: `<Chip kind="filter" label="Has comments" selected={on} onChange={setOn} />`,
      render: () => (
        <Cluster>
          <Filter />
          <Chip kind="filter" label="Mine" onChange={() => undefined} />
        </Cluster>
      ),
    },
    {
      title: 'Primary action, invalid, unavailable',
      description: 'Pressing the words opens more (a person’s card) while Remove stays separate. An invalid value takes the danger tone and an error icon; the group’s message says why. Unavailable is rare: prefer hiding it.',
      code: `<Chip label="Tomás Ibarra" onPress={openCard} onRemove={remove} />
<Chip label="asha@exampel.com" invalid onRemove={remove} />`,
      render: () => (
        <Cluster>
          <Chip label="Tomás Ibarra" avatar={{ name: 'Tomás Ibarra' }} onPress={() => undefined} onRemove={() => undefined} />
          <Chip label="asha@exampel.com" invalid onRemove={() => undefined} />
          <Chip label="Archived" disabled onRemove={() => undefined} />
        </Cluster>
      ),
    },
    {
      title: 'Sizes',
      description: 's (24 px), normal (32 px) and l (40 px, level with 40 px controls). One size per group.',
      code: `<Chip size="s" label="Beta" onRemove={remove} />`,
      render: () => (
        <Cluster>
          <Chip size="s" label="Small" onRemove={() => undefined} />
          <Chip label="Normal" onRemove={() => undefined} />
          <Chip size="l" label="Large" onRemove={() => undefined} />
          <Chip size="s" kind="filter" label="Small" selected onChange={() => undefined} />
          <Chip kind="filter" label="Normal" selected onChange={() => undefined} />
          <Chip size="l" kind="filter" label="Large" selected onChange={() => undefined} />
        </Cluster>
      ),
    },
    {
      title: 'Filled, inside a field',
      description: 'appearance="filled": a tonal fill and no outline, for input chips inside a bordered field such as a tag input, so the field’s border is the only enclosure. Size and focus ring are the same as the outline chip.',
      code: `<Chip appearance="filled" label="Design" onRemove={remove} />`,
      render: () => (
        <Cluster>
          <Chip appearance="filled" label="Design" onRemove={() => undefined} />
          <Chip appearance="filled" label="Tomás Ibarra" avatar={{ name: 'Tomás Ibarra' }} onRemove={() => undefined} />
          <Chip appearance="filled" label="asha@exampel.com" invalid onRemove={() => undefined} />
          <Chip appearance="filled" label="Archived" disabled onRemove={() => undefined} />
        </Cluster>
      ),
    },
  ],
} satisfies StoryFile;
