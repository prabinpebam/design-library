import { useState } from 'react';
import { EmptyState } from '../compounds/EmptyState';
import { Button } from '../fundamentals/Button';
import { Link } from '../fundamentals/Link';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { TextField } from '../fundamentals/TextField';
import type { StoryFile } from './story';

const projects = ['Atlas redesign', 'Budget review 2026', 'Onboarding emails', 'Quarterly report'];

function SearchProjects() {
  const [query, setQuery] = useState('budget plan');
  const found = projects.filter((p) => p.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Stack gap="item">
      <TextField label="Search projects" type="search" value={query} onCommit={setQuery} clearable />
      {found.length ? (
        <Stack gap="pair">
          {found.map((p) => (
            <Text key={p}>{p}</Text>
          ))}
        </Stack>
      ) : (
        <EmptyState reason="no-results" title={`No projects match “${query}”`} announce actions={<Button label="Clear search" onClick={() => setQuery('')} />}>
          Check the spelling, or search for part of a name.
        </EmptyState>
      )}
    </Stack>
  );
}

export default {
  component: 'EmptyState',
  tier: 'compound',
  summary: 'What a list, table, card or view shows when it has nothing: what would be here, why it’s empty and what to do, at the wrapper’s own size.',
  stories: [
    {
      title: 'First use',
      description: 'Never had anything: what will appear here and the one action that makes the first item. A faint, still outline of the rows to come; it never shimmers, so it can’t be taken for loading.',
      code: `<EmptyState reason="first-use" title="No projects yet" silhouette="list" actions={<Button label="Create a project" emphasis="primary" />}>Projects keep your files, tasks and people together.</EmptyState>`,
      render: () => (
        <EmptyState reason="first-use" title="No projects yet" silhouette="list" actions={<Button label="Create a project" emphasis="primary" />}>
          Projects keep your files, tasks and people together. Start one, or import from a spreadsheet.
        </EmptyState>
      ),
    },
    {
      title: 'No results',
      description:
        'A search or filter that ends empty names the query and offers the way back; plain, never playful, and said through the polite announcer because the person caused it. Clear the search: the rows replace it in place.',
      code: `<EmptyState reason="no-results" title={\`No projects match “\${query}”\`} announce actions={<Button label="Clear search" onClick={clear} />}>Check the spelling, or search for part of a name.</EmptyState>`,
      render: () => <SearchProjects />,
    },
    {
      title: 'Cleared, no access and all done',
      description: 'Cleared says where the items went; no access says who controls it and how to ask; zero as success celebrates once, briefly, and needs no action.',
      code: `<EmptyState reason="done" title="All caught up">No new comments since 09:40.</EmptyState>`,
      render: () => (
        <>
          <EmptyState reason="cleared" title="Inbox cleared" actions={<Link href="#/emptystate">Open the archive</Link>}>
            Nice and tidy. The 12 messages you archived are in the archive for 30 days.
          </EmptyState>
          <EmptyState reason="no-access" title="You can’t see this folder" actions={<Button label="Request access" />}>
            It belongs to the Finance team. Mai Tran manages who can open it.
          </EmptyState>
          <EmptyState reason="done" title="All caught up">
            No new comments since 09:40.
          </EmptyState>
        </>
      ),
    },
    {
      title: 'Scopes',
      description:
        'A view’s content area holds 20 rem with more space; a section or card holds 10 rem; a menu, picker or side list says one line with one quiet action and no heading. Several at once stay quiet: one primary action on the screen.',
      code: `<EmptyState scope="view" reason="first-use" title="Your dashboard is empty" silhouette="tiles" … />
<EmptyState scope="component" reason="first-use" title="No recent files" actions={<Button label="Browse…" emphasis="quiet" size="s" />} />`,
      render: () => (
        <>
          <EmptyState scope="view" reason="first-use" title="Your dashboard is empty" silhouette="tiles" actions={<Button label="Add a chart" />}>
            Charts you add from any report show up here.
          </EmptyState>
          <EmptyState reason="first-use" title="No invoices this month" silhouette="table">
            Invoices you send appear here with their status.
          </EmptyState>
          <EmptyState scope="component" reason="first-use" title="No recent files" actions={<Button label="Browse…" emphasis="quiet" size="s" />} />
        </>
      ),
    },
  ],
} satisfies StoryFile;
