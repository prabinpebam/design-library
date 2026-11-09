import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { Section } from '../compounds/Section';
import { List } from '../fundamentals/List';
import { TableOfContents, letterItems } from '../compounds/TableOfContents';
import { Router } from '../../site';
import type { StoryFile } from './story';

const parts = [
  { anchor: 'toc-schedule', label: 'Schedule', text: 'Doors open at nine. Talks run from half past nine until five, with lunch at one and a break at half past three.' },
  { anchor: 'toc-speakers', label: 'Speakers', text: 'Twelve speakers from studios, schools and product teams, each with twenty minutes on stage and five for questions.' },
  { anchor: 'toc-venue', label: 'Venue', text: 'The old print hall by the river, five minutes from the station. Step-free from the north door; quiet room on the first floor.' },
];

const names = ['Abel Okafor', 'Ana Ruiz', 'Bea Lindqvist', 'Chen Wei', 'Dara Kelly', 'Divya Rao', 'Hana Sato', 'Kofi Mensah', 'Lena Vogel', 'Mira Shah', 'Noor Haddad', 'Tomás Silva'];
const byLetter = [...new Set(names.map((n) => n[0]))].map((l) => ({ letter: l, names: names.filter((n) => n[0] === l) }));

function Parts({ prefix = '' }: { prefix?: string }) {
  return (
    <Stack gap="section">
      {parts.map((p) => (
        <Section key={p.anchor} anchor={`${prefix}${p.anchor}`} heading={p.label} level={3} size={4} >
          <Text>{p.text}</Text>
        </Section>
      ))}
    </Stack>
  );
}

export default {
  component: 'TableOfContents',
  tier: 'compound',
  summary: 'Links to the parts of a page, marking the part being read.',
  stories: [
    {
      title: 'On this page, beside the content',
      description: 'A list in the narrow column beside long content. Choose an entry: the page moves to that part and focus goes to its heading; the entry for the part being read is underlined as you scroll.',
      code: `<Router>
  <Grid ratio="aside">
    <TableOfContents items={[{ anchor: 'schedule', label: 'Schedule' }, { anchor: 'speakers', label: 'Speakers' }, { anchor: 'venue', label: 'Venue' }]} />
    <Stack gap="section">
      <Section anchor="schedule" heading="Schedule">…</Section>
      …
    </Stack>
  </Grid>
</Router>`,
      render: () => (
        <Router handleLinks={false}>
          <Grid ratio="aside">
            <TableOfContents items={parts.map((p) => ({ anchor: p.anchor, label: p.label }))} />
            <Parts />
          </Grid>
        </Router>
      ),
    },
    {
      title: 'A row above the content',
      description: 'For a page with a few parts and no room for a column: the entries sit side by side after the label and wrap in a narrow window.',
      code: `<TableOfContents layout="row" items={[…]} />`,
      render: () => (
        <Router handleLinks={false}>
          <Stack gap="section">
            <TableOfContents layout="row" items={parts.map((p) => ({ anchor: `row-${p.anchor}`, label: p.label }))} />
            <Parts prefix="row-" />
          </Stack>
        </Router>
      ),
    },
    {
      title: 'A letter jump',
      description: 'Over a list in alphabetical order: every letter keeps its place, and a letter with no names is plain text, not a link. Each group is a Section whose anchor is letter- and its letter.',
      code: `<TableOfContents label="Jump to a letter" layout="row" items={letterItems(groups.map((g) => g.letter))} />
{groups.map((g) => (
  <Section key={g.letter} anchor={\`letter-\${g.letter}\`} heading={g.letter}>…</Section>
))}`,
      render: () => (
        <Router handleLinks={false}>
          <Stack gap="section">
            <TableOfContents label="Jump to a letter" layout="row" items={letterItems(byLetter.map((g) => g.letter))} />
            {byLetter.map((g) => (
              <Section key={g.letter} anchor={`letter-${g.letter}`} heading={g.letter} level={3} size={4}>
                <List items={g.names.map((n) => ({ id: n, content: <Text>{n}</Text> }))} />
              </Section>
            ))}
          </Stack>
        </Router>
      ),
    },
  ],
} satisfies StoryFile;
