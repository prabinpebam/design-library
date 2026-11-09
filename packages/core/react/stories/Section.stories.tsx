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
      title: 'Toned',
      description:
        'tone gives a section its own fill from the elevation ladder: sunken, raised or tint. The fill is its only boundary, so its parts sit inside it with no border or shadow. With bleed, in a SiteLayout column, the fill runs to the window’s edges as a band across the page while the parts keep the column’s edges.',
      code: `<Section heading="Plan a visit" tone="sunken">…</Section>
<Section heading="Plan a visit" tone="tint" bleed>…</Section>`,
      render: () => (
        <>
          <Section heading="Sunken" size={4} intro="A quiet band below the page." tone="sunken">
            <Text tone="muted">Opening hours, the address and how to get there.</Text>
          </Section>
          <Section heading="Raised" size={4} intro="A step above the page, with no shadow." tone="raised">
            <Text tone="muted">Opening hours, the address and how to get there.</Text>
          </Section>
          <Section heading="Tint" size={4} intro="One clear neutral step from the page." tone="tint">
            <Text tone="muted">Opening hours, the address and how to get there.</Text>
          </Section>
        </>
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
