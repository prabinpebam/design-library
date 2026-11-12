import { ScrollArea } from '../fundamentals/ScrollArea';
import { Stack } from '../fundamentals/Stack';
import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import { TextField } from '../fundamentals/TextField';
import { StickyBar } from '../layouts/StickyBar';
import type { StoryFile } from './story';

const talks = ['Designing for trust', 'The quiet interface', 'Research at speed', 'Type that works', 'Maps of a service', 'Small teams, big systems', 'Tools for thought', 'After the launch'];

function Part({ heading }: { heading: string }) {
  return (
    <Stack gap="group">
      <StickyBar>
        <TextField value="" label={`Find in ${heading.toLowerCase()}`} hideLabel placeholder={`Find in ${heading.toLowerCase()}`} icon="search" onCommit={() => undefined} />
      </StickyBar>
      <Heading level={3}>{heading}</Heading>
      {talks.map((talk) => (
        <Text key={talk}>{talk}</Text>
      ))}
    </Stack>
  );
}

export default {
  component: 'StickyBar',
  tier: 'layout',
  summary: 'A bar of controls that sticks within its section, under the site header, and leaves with the section.',
  stories: [
    {
      title: 'Sticks within its section',
      description: 'Scroll the region: each section’s bar sticks at the top while its section is in view, takes the floating material and a raised shadow while stuck, and leaves with its section. Its height never changes. Under SiteLayout it sticks below the header (--dl-chrome-block); add bleed to reach into the page margin.',
      code: `<Section heading="Talks">
  <StickyBar bleed>
    <TextField value="" label="Find a talk" hideLabel icon="search" … />
  </StickyBar>
  …
</Section>`,
      render: () => (
        <ScrollArea mode="always" maxSize="sm" inset="sm" label="Two sections, each with a sticky bar">
          <Stack gap="section">
            <Part heading="Talks" />
            <Part heading="Workshops" />
          </Stack>
        </ScrollArea>
      ),
    },
  ],
} satisfies StoryFile;
