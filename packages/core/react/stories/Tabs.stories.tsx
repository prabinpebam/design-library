import { PropertySection } from '../compounds/PropertySection';
import { Tabs } from '../compounds/Tabs';
import { Button } from '../fundamentals/Button';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const panel = (words: string) => <Text>{words}</Text>;

const project = [
  { id: 'overview', label: 'Overview', panel: panel('What the project is for, who owns it and where it stands this week.') },
  { id: 'files', label: 'Files', panel: panel('Every file in the project, newest first.') },
  { id: 'activity', label: 'Activity', panel: panel('Who changed what, and when.') },
  { id: 'settings', label: 'Settings', panel: panel('Who can see the project and how it’s shared.') },
];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => ({
  id: m.toLowerCase(),
  label: m,
  panel: panel(`The ${m} report: sales, returns and the notes from the monthly review.`),
}));

export default {
  component: 'Tabs',
  tier: 'compound',
  summary: 'Switches between panels of related content in place, or between the pages of one section as links.',
  stories: [
    {
      title: 'Panels',
      description: 'Related content in one place, one panel at a time. Click across the tabs: the indicator slides from the old tab to the new one. Arrow keys move between tabs and show each panel at once, the indicator with them; Tab moves into the panel.',
      code: `<Tabs label="Project" items={[{ id: 'overview', label: 'Overview', panel: … }, { id: 'files', label: 'Files', panel: … }, …]} />`,
      render: () => <Tabs label="Project" items={project} />,
    },
    {
      title: 'Icons and counts',
      description: 'An icon helps people find a tab they visit often; a count says how many things wait inside and is read with the name.',
      code: `<Tabs label="Inbox" items={[{ id: 'mentions', label: 'Mentions', icon: 'comment', count: 3, panel: … }, …]} />`,
      render: () => (
        <Tabs
          label="Inbox"
          items={[
            { id: 'mentions', label: 'Mentions', icon: 'comment', count: 3, panel: panel('Three comments mention you.') },
            { id: 'people', label: 'People', icon: 'people', count: 12, panel: panel('Twelve people follow this project.') },
            { id: 'search', label: 'Saved searches', icon: 'search', panel: panel('No saved searches yet. Search, then save it to find it here.') },
          ]}
        />
      ),
    },
    {
      title: 'Manual activation',
      description: 'For panels that load or cost something: arrows only move focus, and Enter or Space shows the panel.',
      code: `<Tabs label="Reports" activation="manual" items={reports} />`,
      render: () => <Tabs label="Reports" activation="manual" items={project} />,
    },
    {
      title: 'A tab that isn’t available',
      description: 'It stays in its place so the set doesn’t change shape; arrow keys pass over it. Say why nearby.',
      code: `<Tabs label="Project" items={[…, { id: 'billing', label: 'Billing', disabled: true }]} />`,
      render: () => <Tabs label="Project settings" items={[...project.slice(0, 3), { id: 'billing', label: 'Billing', disabled: true }]} />,
    },
    {
      title: 'With an action',
      description: 'Something that acts on the whole set sits after the tabs, outside the tab list.',
      code: `<Tabs label="Dashboards" items={dashboards} extra={<Button label="Add dashboard" icon="plus" emphasis="quiet" size="s" />} />`,
      render: () => <Tabs label="Dashboards" items={project.slice(0, 3)} extra={<Button label="Add dashboard" icon="plus" emphasis="quiet" size="s" />} />,
    },
    {
      title: 'More tabs than fit',
      description: 'The list scrolls sideways to its own edges, and the chosen tab is kept in view. Narrow the window to see it.',
      code: `<Tabs label="Monthly reports" items={months} defaultSelected="september" />`,
      render: () => <Tabs label="Monthly reports" items={months} defaultSelected="september" />,
    },
    {
      title: 'Vertical',
      description: 'Beside the panel, for many sections in a wide view. The selected tab is filled, never marked by a stripe on one side.',
      code: `<Tabs label="Account" orientation="vertical" items={account} />`,
      render: () => (
        <Tabs
          label="Account"
          orientation="vertical"
          items={[
            { id: 'profile', label: 'Profile', icon: 'person', panel: panel('Your name, photo and how others see you.') },
            { id: 'team', label: 'Team', icon: 'people', panel: panel('Who you work with and what they can do.') },
            { id: 'organisation', label: 'Organisation', icon: 'organisation', panel: panel('Billing, domains and policies for everyone.') },
          ]}
        />
      ),
    },
    {
      title: 'As page navigation',
      description: 'The same look for the pages of one section: each tab is a link and the current page is marked. Use it when each tab has its own address.',
      code: `<Tabs variant="links" label="Repository" selected="code" items={[{ id: 'code', label: 'Code', href: '/code' }, { id: 'issues', label: 'Issues', href: '/issues', count: 8 }, …]} />`,
      render: () => (
        <Tabs
          variant="links"
          label="Repository"
          items={[
            { id: 'code', label: 'Code', href: '#/tabs' },
            { id: 'issues', label: 'Issues', href: '#/tabs', count: 8 },
            { id: 'changes', label: 'Changes', href: '#/tabs', count: 2 },
            { id: 'settings', label: 'Settings', href: '#/tabs' },
          ]}
        />
      ),
    },
    {
      title: 'Panels of grouped sections',
      description: 'An inspector whose panels hold PropertySections: with gap="section" the panel sits a section gap below the tabs, so the space around the groups is never smaller than the space between them.',
      code: `<Tabs gap="section" size="s" label="Inspector" items={[{ id: 'design', label: 'Design', panel: <><PropertySection heading="Layout">…</PropertySection>…</> }, …]} />`,
      render: () => (
        <Tabs
          gap="section"
          size="s"
          label="Inspector"
          items={[
            {
              id: 'design',
              label: 'Design',
              panel: (
                <Stack gap="group">
                  <PropertySection heading="Layout">
                    <Text>Width and height</Text>
                  </PropertySection>
                  <PropertySection heading="Fill">
                    <Text>Colour and opacity</Text>
                  </PropertySection>
                </Stack>
              ),
            },
            { id: 'content', label: 'Content', panel: <Text>Words and pictures</Text> },
          ]}
        />
      ),
    },
    {
      title: 'Right to left',
      description: 'The tabs start from the right and the arrow keys follow the reading direction.',
      code: `<div dir="rtl"><Tabs label="Project" items={project} /></div>`,
      render: () => (
        <div dir="rtl">
          <Tabs label="Project, right to left" items={project} />
        </div>
      ),
    },
  ],
} satisfies StoryFile;
