import { Section } from '../compounds/Section';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'Section',
  tier: 'compound',
  summary: 'A titled part of a page: a heading, a short intro, then its content.',
  stories: [
    {
      title: 'Heading and intro',
      description: 'The intro says what holds for everything below it, on a shorter line than running text.',
      code: `<Section heading="Radii" intro="Corner radii by what they round.">…</Section>`,
      render: () => (
        <Section heading="Radii" intro="Corner radii by what they round: controls, cards and pills.">
          <Text tone="muted">The section’s content goes here.</Text>
        </Section>
      ),
    },
    {
      title: 'Nested',
      description: 'A group inside another section’s content: one level down, its parts sit closer.',
      code: `<Section heading="Inline" level={3} size={4} nested>…</Section>`,
      render: () => (
        <Section heading="Inline" level={3} size={4} nested>
          <Text tone="muted">Space between items that sit side by side.</Text>
        </Section>
      ),
    },
    {
      title: 'Numbered',
      description: 'For a numbered sequence such as the tiers: the numeral in its own column, above the body on narrow screens.',
      code: `<Section heading="Compounds" index={2} nested>…</Section>`,
      render: () => (
        <Section heading="Compounds" index={2} nested>
          <Text tone="muted">Fundamentals combined for one recurring job.</Text>
        </Section>
      ),
    },
  ],
} satisfies StoryFile;
